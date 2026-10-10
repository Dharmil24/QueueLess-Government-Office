const Office = require('../models/Office');
const Department = require('../models/Department');
const Service = require('../models/Service');
const Counter = require('../models/Counter');
const Token = require('../models/Token');

// @desc    Get all offices with filters and dynamic queue metrics
// @route   GET /api/offices
// @access  Public
const getOffices = async (req, res, next) => {
  try {
    const { search, city, pinCode, status } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (pinCode) {
      query.pinCode = new RegExp(pinCode, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { pinCode: new RegExp(search, 'i') },
      ];
    }

    const offices = await Office.find(query).sort({ name: 1 });

    // Augment each office with active counters count, waiting tokens count, and estimated wait time
    const enrichedOffices = await Promise.all(
      offices.map(async (office) => {
        const [activeCounters, waitingTokensCount, servicesCount] = await Promise.all([
          Counter.countDocuments({ office: office._id, status: 'active' }),
          Token.countDocuments({
            officeId: office._id,
            status: { $in: ['WAITING', 'APPROACHING'] },
          }),
          Service.countDocuments({ office: office._id, status: 'active' }),
        ]);

        const avgWaitTime =
          activeCounters > 0 ? Math.round((waitingTokensCount * 8) / activeCounters) : waitingTokensCount * 8;

        return {
          ...office.toObject(),
          activeCounters,
          waitingTokensCount,
          servicesCount,
          estimatedWaitMinutes: avgWaitTime,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedOffices.length,
      offices: enrichedOffices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single office details with departments and services
// @route   GET /api/offices/:id
// @access  Public
const getOfficeById = async (req, res, next) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Government office not found.',
      });
    }

    const [departments, services, counters, waitingTokensCount] = await Promise.all([
      Department.find({ office: office._id, status: 'active' }),
      Service.find({ office: office._id, status: 'active' }),
      Counter.find({ office: office._id })
        .populate('assignedStaff', 'name employeeId')
        .populate('currentToken', 'tokenNumber citizenName status')
        .populate('services', 'name code'),
      Token.countDocuments({
        officeId: office._id,
        status: { $in: ['WAITING', 'APPROACHING'] },
      }),
    ]);

    const activeCounters = counters.filter((c) => c.status === 'active').length;
    const estimatedWaitMinutes =
      activeCounters > 0 ? Math.round((waitingTokensCount * 8) / activeCounters) : waitingTokensCount * 8;

    res.status(200).json({
      success: true,
      office: {
        ...office.toObject(),
        departments,
        services,
        counters,
        activeCounters,
        waitingTokensCount,
        estimatedWaitMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get live queue summary for an office (used by Display screen and live monitors)
// @route   GET /api/offices/:id/queue-summary
// @access  Public
const getOfficeQueueSummary = async (req, res, next) => {
  try {
    const officeId = req.params.id;

    const office = await Office.findById(officeId);
    if (!office) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    // Get active counters with current tokens
    const counters = await Counter.find({ office: officeId })
      .populate({
        path: 'currentToken',
        populate: { path: 'serviceId', select: 'name' },
      })
      .populate('services', 'name code')
      .populate('assignedStaff', 'name employeeId');

    // Currently called / serving tokens
    const activeTokens = await Token.find({
      officeId,
      status: { $in: ['CALLED', 'SERVING'] },
    })
      .populate('counterId', 'counterNumber')
      .populate('serviceId', 'name')
      .sort({ calledAt: -1 })
      .limit(6);

    // Waiting tokens (Next in line)
    const nextTokens = await Token.find({
      officeId,
      status: { $in: ['WAITING', 'APPROACHING'] },
    })
      .populate('serviceId', 'name')
      .sort({ priority: -1, queuePosition: 1, generatedAt: 1 })
      .limit(10);

    // Recently completed
    const recentlyCompleted = await Token.find({
      officeId,
      status: 'COMPLETED',
    })
      .populate('counterId', 'counterNumber')
      .sort({ completedAt: -1 })
      .limit(5);

    const totalWaiting = await Token.countDocuments({
      officeId,
      status: { $in: ['WAITING', 'APPROACHING'] },
    });

    res.status(200).json({
      success: true,
      office: {
        id: office._id,
        name: office.name,
        code: office.code,
        announcement: office.announcement,
      },
      counters,
      activeTokens,
      nextTokens,
      recentlyCompleted,
      totalWaiting,
      updatedAt: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOffices,
  getOfficeById,
  getOfficeQueueSummary,
};
