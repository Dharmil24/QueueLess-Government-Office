require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Office = require('../models/Office');
const Department = require('../models/Department');
const Service = require('../models/Service');
const Counter = require('../models/Counter');
const Token = require('../models/Token');
const Notification = require('../models/Notification');
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const { generateSecureQr } = require('../utils/qrGenerator');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seeder] Connected to database. Clearing old data...');

    await Promise.all([
      User.deleteMany(),
      Office.deleteMany(),
      Department.deleteMany(),
      Service.deleteMany(),
      Counter.deleteMany(),
      Token.deleteMany(),
      Notification.deleteMany(),
      SystemSettings.deleteMany(),
      AuditLog.deleteMany(),
    ]);

    console.log('[Seeder] Creating System Settings...');
    await SystemSettings.create({
      tokenPrefix: 'A',
      maxDailyTokens: 250,
      notificationThresholdApproaching: 5,
      notificationThresholdUrgent: 2,
      queueTimeoutMinutes: 15,
      announcementTicker: 'QueueLess: Wait Less. Arrive Smart. Get Served. Live token updates active.',
    });

    console.log('[Seeder] Creating Government Offices...');
    const rtoRajkot = await Office.create({
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
      announcement: 'Welcome to RTO Rajkot. Please keep your physical documents ready before reaching the counter.',
    });

    const municipalCorp = await Office.create({
      name: 'Rajkot Municipal Corporation (Central Zone)',
      code: 'RMC-CEN',
      address: 'Dr. Ambedkar Bhavan, Dhebar Road',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360001',
      latitude: 22.2965,
      longitude: 70.8015,
      contactNumber: '+91 281 2227575',
      email: 'civic@rmc.gov.in',
      openingTime: '09:30',
      closingTime: '17:30',
      status: 'open',
      announcement: 'RMC Citizen Facilitation Center is fully digitized. Download digital certificates instantly.',
    });

    const mamlatdarOffice = await Office.create({
      name: 'Mamlatdar & Revenue Office (Rajkot Taluka)',
      code: 'REV-RJT',
      address: 'Collector Compound, Shroff Road',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360001',
      latitude: 22.3015,
      longitude: 70.7985,
      contactNumber: '+91 281 2471900',
      email: 'mamlatdar-rajkot@gujarat.gov.in',
      openingTime: '10:00',
      closingTime: '18:00',
      status: 'open',
      announcement: 'Revenue and affidavit verification counters 1 to 4 active.',
    });

    console.log('[Seeder] Creating Departments...');
    const deptTransport = await Department.create({
      name: 'Driving Licencing & Permits',
      code: 'DLP',
      office: rtoRajkot._id,
      description: 'Handling Learners, Permanent driving licence, renewals and international permits',
      tokenDurationMinutes: 10,
    });

    const deptVehicles = await Department.create({
      name: 'Vehicle Registration & Fitness',
      code: 'VRF',
      office: rtoRajkot._id,
      description: 'Vehicle RC transfer, hypothecation, duplicate RC and green fitness certification',
      tokenDurationMinutes: 12,
    });

    const deptCivic = await Department.create({
      name: 'Civil Registration & Records',
      code: 'CRR',
      office: municipalCorp._id,
      description: 'Birth and Death certificates registration and official extracts',
      tokenDurationMinutes: 8,
    });

    const deptTax = await Department.create({
      name: 'Property Tax & Water Works',
      code: 'PTW',
      office: municipalCorp._id,
      description: 'Property assessment, property tax clearance and drinking water connections',
      tokenDurationMinutes: 15,
    });

    const deptRevenue = await Department.create({
      name: 'Revenue & Certificates',
      code: 'REV',
      office: mamlatdarOffice._id,
      description: 'Income certificates, caste certificates, domicile and land records',
      tokenDurationMinutes: 10,
    });

    console.log('[Seeder] Creating Services...');
    // 10+ Services
    const svcDlRenewal = await Service.create({
      name: 'Driving Licence Renewal',
      code: 'RTO-DLR',
      department: deptTransport._id,
      office: rtoRajkot._id,
      description: 'Renewal of expired or expiring private and commercial motor driving licences.',
      averageServiceTime: 6,
      requiredDocuments: ['Original Driving Licence', 'Form 9', 'Medical Certificate Form 1-A (if age > 40)', 'Address Proof'],
      maxDailyTokens: 150,
      prefix: 'A',
    });

    const svcLearner = await Service.create({
      name: 'Learner Licence Test & Issue',
      code: 'RTO-LL',
      department: deptTransport._id,
      office: rtoRajkot._id,
      description: 'Computer-based LL theory test and instantaneous learner licence issue.',
      averageServiceTime: 8,
      requiredDocuments: ['Aadhaar Card with OTP Linked', 'Age Proof (10th Marksheet or Birth Cert)', 'Fee Receipt'],
      maxDailyTokens: 200,
      prefix: 'L',
    });

    const svcRcTransfer = await Service.create({
      name: 'Vehicle Ownership Transfer',
      code: 'RTO-TRN',
      department: deptVehicles._id,
      office: rtoRajkot._id,
      description: 'Transfer of motor vehicle ownership on sale or inheritance.',
      averageServiceTime: 10,
      requiredDocuments: ['Original RC Smart Card', 'Form 29 & 30', 'Valid Insurance', 'Valid PUC', 'Buyer Aadhaar'],
      maxDailyTokens: 120,
      prefix: 'V',
    });

    const svcDuplicateRc = await Service.create({
      name: 'Duplicate RC Smart Card',
      code: 'RTO-DRC',
      department: deptVehicles._id,
      office: rtoRajkot._id,
      description: 'Reissuance of lost or damaged Registration Certificate.',
      averageServiceTime: 7,
      requiredDocuments: ['Police FIR Copy', 'Form 26', 'Valid Insurance', 'ID Proof'],
      maxDailyTokens: 80,
      prefix: 'V',
    });

    const svcBirthCert = await Service.create({
      name: 'Birth Certificate Issuance',
      code: 'RMC-BC',
      department: deptCivic._id,
      office: municipalCorp._id,
      description: 'Official birth certificate copy with QR-verified digital signature.',
      averageServiceTime: 5,
      requiredDocuments: ['Hospital Discharge Summary', 'Parents Aadhaar Cards', 'Marriage Certificate'],
      maxDailyTokens: 250,
      prefix: 'B',
    });

    const svcDeathCert = await Service.create({
      name: 'Death Certificate Issuance',
      code: 'RMC-DC',
      department: deptCivic._id,
      office: municipalCorp._id,
      description: 'Official death certificate and legal heir extract record.',
      averageServiceTime: 6,
      requiredDocuments: ['Doctor Death Report', 'Crematorium Slip', 'Deceased Aadhaar Card', 'Applicant ID'],
      maxDailyTokens: 150,
      prefix: 'D',
    });

    const svcPropertyTax = await Service.create({
      name: 'Property Tax Assessment & NOC',
      code: 'RMC-PTX',
      department: deptTax._id,
      office: municipalCorp._id,
      description: 'Assessment of annual property valuation, tax ledger payment, and No Objection Certificate.',
      averageServiceTime: 9,
      requiredDocuments: ['Index II Deed Copy', 'Electricity Bill', 'Previous Year Tax Receipt'],
      maxDailyTokens: 200,
      prefix: 'P',
    });

    const svcWaterConn = await Service.create({
      name: 'New Domestic Water Connection',
      code: 'RMC-WTR',
      department: deptTax._id,
      office: municipalCorp._id,
      description: 'Application for municipal drinking water tap connection line.',
      averageServiceTime: 8,
      requiredDocuments: ['Property Ownership Proof', 'Plumber Estimate Layout', 'Tax Paid Receipt'],
      maxDailyTokens: 90,
      prefix: 'W',
    });

    const svcIncomeCert = await Service.create({
      name: 'Income Certificate (Aavak no Dakhlo)',
      code: 'REV-INC',
      department: deptRevenue._id,
      office: mamlatdarOffice._id,
      description: 'Government certified annual household income certificate.',
      averageServiceTime: 7,
      requiredDocuments: ['Ration Card', 'Salary Slip or IT Return or Talati Panchnama', 'Electricity Bill', 'Aadhaar Card'],
      maxDailyTokens: 300,
      prefix: 'I',
    });

    const svcCasteCert = await Service.create({
      name: 'Caste & Category Certificate',
      code: 'REV-CST',
      department: deptRevenue._id,
      office: mamlatdarOffice._id,
      description: 'Official verification and issuance of SEBC / SC / ST / EWS certification.',
      averageServiceTime: 10,
      requiredDocuments: ['School Leaving Certificate of Father/Self', 'Peculiar Caste Proof', 'Affidavit', 'Ration Card'],
      maxDailyTokens: 200,
      prefix: 'C',
    });

    console.log('[Seeder] Creating Admin, Staff, and Citizen Users...');
    // Admin
    const adminUser = await User.create({
      name: 'Smt. Ananya Sharma (Chief Admin)',
      email: 'admin@queueless.gov.in',
      password: 'admin123',
      mobile: '9876543210',
      role: 'admin',
    });

    // Staff members (10+ Staff)
    const staffMembers = [];
    const staffConfigs = [
      { name: 'Ramesh Patel', email: 'staff1@rto.gov.in', empId: 'EMP-RTO-01', office: rtoRajkot._id, dept: deptTransport._id },
      { name: 'Kavita Joshi', email: 'staff2@rto.gov.in', empId: 'EMP-RTO-02', office: rtoRajkot._id, dept: deptTransport._id },
      { name: 'Mahesh Solanki', email: 'staff3@rto.gov.in', empId: 'EMP-RTO-03', office: rtoRajkot._id, dept: deptTransport._id },
      { name: 'Bhavin Dave', email: 'staff4@rto.gov.in', empId: 'EMP-RTO-04', office: rtoRajkot._id, dept: deptVehicles._id },
      { name: 'Pooja Mehta', email: 'staff5@rto.gov.in', empId: 'EMP-RTO-05', office: rtoRajkot._id, dept: deptVehicles._id },
      { name: 'Deepak Vora', email: 'staff6@rmc.gov.in', empId: 'EMP-RMC-01', office: municipalCorp._id, dept: deptCivic._id },
      { name: 'Geeta Parmar', email: 'staff7@rmc.gov.in', empId: 'EMP-RMC-02', office: municipalCorp._id, dept: deptCivic._id },
      { name: 'Nilesh Trivedi', email: 'staff8@rmc.gov.in', empId: 'EMP-RMC-03', office: municipalCorp._id, dept: deptTax._id },
      { name: 'Rekha Vaghela', email: 'staff9@rev.gov.in', empId: 'EMP-REV-01', office: mamlatdarOffice._id, dept: deptRevenue._id },
      { name: 'Sunil Rathod', email: 'staff10@rev.gov.in', empId: 'EMP-REV-02', office: mamlatdarOffice._id, dept: deptRevenue._id },
    ];

    for (const sc of staffConfigs) {
      const staffUser = await User.create({
        name: sc.name,
        email: sc.email,
        password: 'password123',
        mobile: `98980${Math.floor(10000 + Math.random() * 90000)}`,
        role: 'staff',
        employeeId: sc.empId,
        assignedOffice: sc.office,
        assignedDepartment: sc.dept,
      });
      staffMembers.push(staffUser);
    }

    console.log('[Seeder] Creating Counters (10+ Counters)...');
    const counters = [];
    const counterConfigs = [
      { num: 'Counter 1', office: rtoRajkot._id, services: [svcLearner._id], staff: staffMembers[0]._id },
      { num: 'Counter 2', office: rtoRajkot._id, services: [svcLearner._id, svcDlRenewal._id], staff: staffMembers[1]._id },
      { num: 'Counter 3', office: rtoRajkot._id, services: [svcDlRenewal._id], staff: staffMembers[2]._id },
      { num: 'Counter 4', office: rtoRajkot._id, services: [svcRcTransfer._id, svcDuplicateRc._id], staff: staffMembers[3]._id },
      { num: 'Counter 5', office: rtoRajkot._id, services: [svcRcTransfer._id], staff: staffMembers[4]._id },
      { num: 'Counter 1 - Birth/Death', office: municipalCorp._id, services: [svcBirthCert._id, svcDeathCert._id], staff: staffMembers[5]._id },
      { num: 'Counter 2 - Birth/Death', office: municipalCorp._id, services: [svcBirthCert._id], staff: staffMembers[6]._id },
      { num: 'Counter 3 - Taxes', office: municipalCorp._id, services: [svcPropertyTax._id, svcWaterConn._id], staff: staffMembers[7]._id },
      { num: 'Counter 1 - Revenue', office: mamlatdarOffice._id, services: [svcIncomeCert._id], staff: staffMembers[8]._id },
      { num: 'Counter 2 - Revenue', office: mamlatdarOffice._id, services: [svcCasteCert._id], staff: staffMembers[9]._id },
    ];

    for (const cc of counterConfigs) {
      const c = await Counter.create({
        counterNumber: cc.num,
        office: cc.office,
        services: cc.services,
        assignedStaff: cc.staff,
        status: 'active',
      });
      counters.push(c);

      // Link counter to staff user
      await User.findByIdAndUpdate(cc.staff, { assignedCounter: c._id });
    }

    console.log('[Seeder] Creating Citizens (20+ Citizens)...');
    // Primary Demo Citizen: Rahul Patel
    const rahulPatel = await User.create({
      name: 'Rahul Patel',
      email: 'rahul@example.com',
      password: 'password123',
      mobile: '+91 98250 12345',
      role: 'citizen',
    });

    const citizenNames = [
      'Priya Shah', 'Amitabh Kumar', 'Sanjay Bhatt', 'Manisha Rajput', 'Chirag Desai',
      'Neha Singhal', 'Jayesh Makwana', 'Dimple Pandya', 'Pratik Vora', 'Hetal Chauhan',
      'Kamlesh Gohel', 'Anjali Yadav', 'Dharmesh Zala', 'Tanvi Mehta', 'Ravi Chudasama',
      'Kiran Rathore', 'Varun Shah', 'Pooja Goswami', 'Nikhil Barot', 'Darshana Dave'
    ];

    const otherCitizens = [];
    for (let i = 0; i < citizenNames.length; i++) {
      const cUser = await User.create({
        name: citizenNames[i],
        email: `citizen${i + 1}@example.com`,
        password: 'password123',
        mobile: `+91 9426${Math.floor(100000 + Math.random() * 900000)}`,
        role: 'citizen',
      });
      otherCitizens.push(cUser);
    }

    console.log('[Seeder] Setting up demo scenario (Counter 3 & Rahul Patel)...');
    // Rahul Patel's office: RTO Rajkot, Service: Driving Licence Renewal
    // Counter 3 is serving A-053
    // Previously completed tokens: A-050, A-051, A-052
    // Waiting tokens ahead: A-054, A-055, A-056
    // Rahul Patel: Token A-057 (Waiting / Approaching, 4 people ahead, ~18 mins wait)

    const counter3 = counters[2]; // Counter 3

    // Completed earlier today
    for (let i = 50; i <= 52; i++) {
      const { qrToken, qrDataUrl } = await generateSecureQr('QL-RTO-RJT-');
      await Token.create({
        tokenNumber: `A-0${i}`,
        citizenId: otherCitizens[i - 50]._id,
        citizenName: otherCitizens[i - 50].name,
        citizenMobile: otherCitizens[i - 50].mobile,
        officeId: rtoRajkot._id,
        departmentId: deptTransport._id,
        serviceId: svcDlRenewal._id,
        counterId: counter3._id,
        status: 'COMPLETED',
        priority: 'NORMAL',
        queuePosition: 0,
        estimatedWaitTime: 0,
        qrToken,
        qrDataUrl,
        serviceDurationMinutes: 6,
        generatedAt: new Date(Date.now() - 60 * 60 * 1000 + (i - 50) * 15 * 60 * 1000),
        calledAt: new Date(Date.now() - 40 * 60 * 1000 + (i - 50) * 15 * 60 * 1000),
        serviceStartedAt: new Date(Date.now() - 38 * 60 * 1000 + (i - 50) * 15 * 60 * 1000),
        completedAt: new Date(Date.now() - 30 * 60 * 1000 + (i - 50) * 15 * 60 * 1000),
      });
    }

    // Token A-053: Currently CALLED / SERVING at Counter 3
    const { qrToken: qr53, qrDataUrl: qrd53 } = await generateSecureQr('QL-RTO-RJT-');
    const token53 = await Token.create({
      tokenNumber: 'A-053',
      citizenId: otherCitizens[3]._id,
      citizenName: otherCitizens[3].name,
      citizenMobile: otherCitizens[3].mobile,
      officeId: rtoRajkot._id,
      departmentId: deptTransport._id,
      serviceId: svcDlRenewal._id,
      counterId: counter3._id,
      status: 'SERVING',
      priority: 'NORMAL',
      queuePosition: 0,
      estimatedWaitTime: 0,
      qrToken: qr53,
      qrDataUrl: qrd53,
      serviceDurationMinutes: 5,
      generatedAt: new Date(Date.now() - 25 * 60 * 1000),
      calledAt: new Date(Date.now() - 5 * 60 * 1000),
      serviceStartedAt: new Date(Date.now() - 3 * 60 * 1000),
    });

    counter3.currentToken = token53._id;
    await counter3.save();

    // Tokens A-054, A-055, A-056: Waiting ahead
    const aheadTokenNumbers = ['A-054', 'A-055', 'A-056'];
    for (let i = 0; i < aheadTokenNumbers.length; i++) {
      const { qrToken, qrDataUrl } = await generateSecureQr('QL-RTO-RJT-');
      await Token.create({
        tokenNumber: aheadTokenNumbers[i],
        citizenId: otherCitizens[4 + i]._id,
        citizenName: otherCitizens[4 + i].name,
        citizenMobile: otherCitizens[4 + i].mobile,
        officeId: rtoRajkot._id,
        departmentId: deptTransport._id,
        serviceId: svcDlRenewal._id,
        counterId: counter3._id,
        status: 'APPROACHING',
        priority: 'NORMAL',
        queuePosition: i + 1,
        estimatedWaitTime: (i + 1) * 6,
        recommendedArrivalTime: '11:15 AM',
        qrToken,
        qrDataUrl,
        generatedAt: new Date(Date.now() - (20 - i * 3) * 60 * 1000),
      });
    }

    // Rahul Patel's Token: A-057 (Status: APPROACHING, 4 people ahead, ~18 mins, Counter 3)
    const { qrToken: qrRahul, qrDataUrl: qrdRahul } = await generateSecureQr('QL-RTO-RJT-');
    const rahulToken = await Token.create({
      tokenNumber: 'A-057',
      citizenId: rahulPatel._id,
      citizenName: rahulPatel.name,
      citizenMobile: rahulPatel.mobile,
      officeId: rtoRajkot._id,
      departmentId: deptTransport._id,
      serviceId: svcDlRenewal._id,
      counterId: counter3._id,
      status: 'APPROACHING',
      priority: 'NORMAL',
      queuePosition: 4,
      estimatedWaitTime: 18,
      recommendedArrivalTime: '11:35 AM',
      qrToken: qrRahul,
      qrDataUrl: qrdRahul,
      generatedAt: new Date(Date.now() - 10 * 60 * 1000),
    });

    // Create notifications for Rahul
    await Notification.create({
      userId: rahulPatel._id,
      tokenId: rahulToken._id,
      title: 'Token A-057 Generated Successfully',
      message: 'Your token A-057 for Driving Licence Renewal at RTO Rajkot has been confirmed.',
      type: 'INFO',
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    });

    await Notification.create({
      userId: rahulPatel._id,
      tokenId: rahulToken._id,
      title: 'Your token is approaching',
      message: 'Your token A-057 is approaching! 4 people are ahead of you. Estimated wait: ~18 Minutes. Please proceed towards Counter 3.',
      type: 'APPROACHING',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    });

    // Additional sample tokens across other counters to make whole platform buzz with live data
    console.log('[Seeder] Generating 40+ tokens for all counters and offices...');
    const sampleServices = [svcLearner, svcRcTransfer, svcBirthCert, svcDeathCert, svcPropertyTax, svcIncomeCert, svcCasteCert];
    let tokenIndex = 58;

    for (let cIdx = 0; cIdx < counters.length; cIdx++) {
      if (cIdx === 2) continue; // Already configured Counter 3
      const cntr = counters[cIdx];
      const targetSvc = sampleServices[cIdx % sampleServices.length];
      const citizen = otherCitizens[(cIdx + 7) % otherCitizens.length];

      // Create a serving token for this counter
      const { qrToken, qrDataUrl } = await generateSecureQr(`QL-${cntr.office}-`);
      const servingToken = await Token.create({
        tokenNumber: `${targetSvc.prefix}-0${tokenIndex++}`,
        citizenId: citizen._id,
        citizenName: citizen.name,
        citizenMobile: citizen.mobile,
        officeId: cntr.office,
        departmentId: targetSvc.department,
        serviceId: targetSvc._id,
        counterId: cntr._id,
        status: 'SERVING',
        priority: 'NORMAL',
        queuePosition: 0,
        estimatedWaitTime: 0,
        qrToken,
        qrDataUrl,
        generatedAt: new Date(Date.now() - 15 * 60 * 1000),
        calledAt: new Date(Date.now() - 4 * 60 * 1000),
        serviceStartedAt: new Date(Date.now() - 2 * 60 * 1000),
      });

      cntr.currentToken = servingToken._id;
      await cntr.save();

      // Create 2 waiting tokens for this counter
      for (let w = 1; w <= 2; w++) {
        const wCitizen = otherCitizens[(tokenIndex + w) % otherCitizens.length];
        const { qrToken: wQr, qrDataUrl: wQrd } = await generateSecureQr(`QL-${cntr.office}-`);
        await Token.create({
          tokenNumber: `${targetSvc.prefix}-0${tokenIndex++}`,
          citizenId: wCitizen._id,
          citizenName: wCitizen.name,
          citizenMobile: wCitizen.mobile,
          officeId: cntr.office,
          departmentId: targetSvc.department,
          serviceId: targetSvc._id,
          counterId: cntr._id,
          status: w === 1 ? 'APPROACHING' : 'WAITING',
          priority: 'NORMAL',
          queuePosition: w,
          estimatedWaitTime: w * targetSvc.averageServiceTime,
          recommendedArrivalTime: '11:45 AM',
          qrToken: wQr,
          qrDataUrl: wQrd,
          generatedAt: new Date(Date.now() - 5 * 60 * 1000),
        });
      }
    }

    // Audit Log demo entries
    await AuditLog.create({
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      role: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      entity: 'System',
      details: { message: 'Database initialized with demo government offices, counters, and staff.' },
    });

    console.log('\n======================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(' DEMO CREDENTIALS:');
    console.log(' 1. CITIZEN:');
    console.log('    Email:    rahul@example.com');
    console.log('    Password: password123');
    console.log('    Token:    A-057 (RTO Rajkot - Driving Licence Renewal)');
    console.log(' 2. STAFF (Counter 3 - RTO Rajkot):');
    console.log('    Email:    staff3@rto.gov.in');
    console.log('    Emp ID:   EMP-RTO-03');
    console.log('    Password: password123');
    console.log(' 3. ADMIN:');
    console.log('    Email:    admin@queueless.gov.in');
    console.log('    Password: admin123');
    console.log('======================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seeder Error]', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
