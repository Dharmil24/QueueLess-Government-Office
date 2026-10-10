const User = require('../models/User');
const Office = require('../models/Office');
const Department = require('../models/Department');
const Service = require('../models/Service');
const Counter = require('../models/Counter');
const SystemSettings = require('../models/SystemSettings');
const { generateToken } = require('../utils/jwt');
const { logAction } = require('../utils/auditLogger');

// Baseline safeguard: ensure minimal government office & service exist so demo citizens can immediately interact
const ensureDemoDatabase = async () => {
  try {
    const officeCount = await Office.countDocuments();
    if (officeCount === 0) {
      const settingsCount = await SystemSettings.countDocuments();
      if (settingsCount === 0) {
        await SystemSettings.create({
          tokenPrefix: 'A',
          maxDailyTokens: 250,
          notificationThresholdApproaching: 5,
          notificationThresholdUrgent: 2,
          queueTimeoutMinutes: 15,
          announcementTicker: 'QueueLess: Wait Less. Arrive Smart. Get Served. Live token updates active.',
        });
      }

      const office = await Office.create({
        name: 'Regional Transport Office (RTO Rajkot)',
        code: 'RTO-RJT',
        address: 'Near Bhavnagar Road, Aji Dam Chokdi',
        city: 'Rajkot',
        state: 'Gujarat',
        pinCode: '360003',
        latitude: 22.2858,
        longitude: 70.8252,
        contactNumber: '+91 281 2387123',
        email: 'rto-rajkot@gujarat.gov.in',
        openingTime: '09:00',
        closingTime: '17:00',
        status: 'open',
        announcement: 'Welcome to RTO Rajkot. Please keep your physical documents ready.',
      });

      const dept = await Department.create({
        name: 'Driving Licencing & Permits',
        code: 'DLP',
        office: office._id,
        description: 'Handling Learners, Permanent driving licence, renewals and international permits',
      });

      const svc = await Service.create({
        name: 'Driving Licence Renewal',
        code: 'DLR',
        department: dept._id,
        office: office._id,
        prefix: 'A',
        estimatedMinutes: 8,
        requiredDocuments: ['Original DL', 'Form 9', 'Medical Fitness Certificate'],
        fee: 450,
      });

      await Counter.create({
        counterNumber: 'Counter 3',
        office: office._id,
        services: [svc._id],
        status: 'active',
      });
    }
  } catch (err) {
    console.warn('[DemoRegister] Warning while ensuring baseline DB:', err.message);
  }
};

// Helper to compute exact citizen age from Date of Birth
const calculateAge = (dobString) => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// @desc    Register a citizen
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, mobile, dateOfBirth, isDemo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    const citizenAge = dateOfBirth ? calculateAge(dateOfBirth) : null;
    const isSenior = citizenAge !== null ? citizenAge >= 60 : false;

    if (existingUser) {
      // If this is a demo registration or a demo email, seamlessly authenticate instead of failing
      const isDemoAccount =
        Boolean(isDemo) ||
        cleanEmail.includes('demo') ||
        cleanEmail === 'rahul@example.com' ||
        cleanEmail.endsWith('@queueless.gov.in');

      if (isDemoAccount) {
        if (existingUser.status !== 'active') {
          existingUser.status = 'active';
        }
        if (dateOfBirth) {
          existingUser.dateOfBirth = new Date(dateOfBirth);
          existingUser.isSeniorCitizen = isSenior;
        }
        await existingUser.save();
        const token = generateToken(existingUser._id, existingUser.role);
        return res.status(200).json({
          success: true,
          token,
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            mobile: existingUser.mobile,
            role: existingUser.role,
            dateOfBirth: existingUser.dateOfBirth,
            isSeniorCitizen: existingUser.isSeniorCitizen,
          },
          message: 'Demo citizen registered and authenticated successfully.',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    await ensureDemoDatabase();

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      mobile: mobile || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      isSeniorCitizen: isSenior,
      role: 'citizen',
      status: 'active',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        isSeniorCitizen: user.isSeniorCitizen,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    One-click demo citizen registration / authentication guaranteed in all situations
// @route   POST /api/auth/demo-register
// @access  Public
const demoRegister = async (req, res, next) => {
  try {
    await ensureDemoDatabase();

    const { forceFresh, name, email, mobile, password } = req.body;

    if (forceFresh) {
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const freshEmail = `citizen.demo${uniqueSuffix}@example.com`;
      const freshName = name || `Demo Citizen (${uniqueSuffix})`;
      const freshUser = await User.create({
        name: freshName,
        email: freshEmail,
        password: password || 'password123',
        mobile: mobile || `+91 9825${uniqueSuffix}`,
        role: 'citizen',
        status: 'active',
      });

      const token = generateToken(freshUser._id, freshUser.role);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: freshUser._id,
          name: freshUser.name,
          email: freshUser.email,
          mobile: freshUser.mobile,
          role: freshUser.role,
        },
        isFresh: true,
        message: 'Fresh demo citizen created and logged in successfully.',
      });
    }

    const targetEmail = (email || 'rahul@example.com').toLowerCase().trim();
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      user = await User.create({
        name: name || 'Rahul Patel',
        email: targetEmail,
        password: password || 'password123',
        mobile: mobile || '+91 98250 12345',
        role: 'citizen',
        status: 'active',
      });
    } else {
      if (user.status !== 'active') {
        user.status = 'active';
      }
      user.role = 'citizen';
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      message: 'Demo citizen authenticated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user (Citizen, Staff, Admin)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, employeeId } = req.body;

    if ((!email && !employeeId) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide credentials and password.',
      });
    }

    let query = {};
    if (employeeId) {
      query = { employeeId: employeeId.trim() };
    } else {
      query = { email: email.toLowerCase().trim() };
    }

    const user = await User.findOne(query)
      .select('+password')
      .populate('assignedOffice', 'name code address')
      .populate('assignedCounter', 'counterNumber status')
      .populate('assignedDepartment', 'name code');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended. Please contact support.',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        employeeId: user.employeeId,
        dateOfBirth: user.dateOfBirth,
        isSeniorCitizen: user.isSeniorCitizen,
        assignedOffice: user.assignedOffice,
        assignedCounter: user.assignedCounter,
        assignedDepartment: user.assignedDepartment,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('assignedOffice', 'name code address city state pinCode status openingTime closingTime')
      .populate('assignedCounter', 'counterNumber status')
      .populate('assignedDepartment', 'name code');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Guaranteed Demo Login for Citizen, Staff, or Admin
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res, next) => {
  try {
    const { role, email } = req.body;
    let targetEmail = (email || '').toLowerCase().trim();

    if (!targetEmail) {
      if (role === 'admin') targetEmail = 'admin@queueless.gov.in';
      else if (role === 'staff') targetEmail = 'staff3@rto.gov.in';
      else targetEmail = 'rahul@example.com';
    }

    let user = await User.findOne({ email: targetEmail })
      .populate('assignedOffice', 'name code address')
      .populate('assignedCounter', 'counterNumber status')
      .populate('assignedDepartment', 'name code');

    if (!user) {
      await ensureDemoDatabase();
      if (targetEmail.includes('admin') || role === 'admin') {
        user = await User.create({
          name: 'Smt. Ananya Sharma (Chief Admin)',
          email: 'admin@queueless.gov.in',
          password: 'admin123',
          mobile: '9876543210',
          role: 'admin',
          status: 'active',
        });
      } else if (targetEmail.includes('staff') || role === 'staff') {
        let office = await Office.findOne();
        let counter = await Counter.findOne();
        let dept = await Department.findOne();
        user = await User.create({
          name: 'Mahesh Solanki',
          email: 'staff3@rto.gov.in',
          password: 'password123',
          mobile: '9898012345',
          role: 'staff',
          employeeId: 'EMP-RTO-03',
          assignedOffice: office?._id,
          assignedDepartment: dept?._id,
          assignedCounter: counter?._id,
          status: 'active',
        });
      } else {
        user = await User.create({
          name: 'Rahul Patel',
          email: 'rahul@example.com',
          password: 'password123',
          mobile: '+91 98250 12345',
          role: 'citizen',
          status: 'active',
        });
      }
    }

    if (user.status !== 'active') {
      user.status = 'active';
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        employeeId: user.employeeId,
        dateOfBirth: user.dateOfBirth,
        isSeniorCitizen: user.isSeniorCitizen,
        assignedOffice: user.assignedOffice,
        assignedCounter: user.assignedCounter,
        assignedDepartment: user.assignedDepartment,
      },
      message: `Demo ${user.role} authenticated successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = {
  register,
  demoRegister,
  demoLogin,
  login,
  getMe,
  logout,
};
