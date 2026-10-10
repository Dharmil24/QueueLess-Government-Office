const Service = require('../models/Service');
const Counter = require('../models/Counter');
const Token = require('../models/Token');

// @desc    Get services by office and/or department
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { officeId, departmentId } = req.query;

    const query = { status: 'active' };
    if (officeId) query.office = officeId;
    if (departmentId) query.department = departmentId;

    const services = await Service.find(query)
      .populate('department', 'name code')
      .populate('office', 'name code city');

    // Enrich with queue depth
    const enriched = await Promise.all(
      services.map(async (svc) => {
        const [waitingTokens, activeCounters] = await Promise.all([
          Token.countDocuments({
            serviceId: svc._id,
            status: { $in: ['WAITING', 'APPROACHING'] },
          }),
          Counter.countDocuments({
            services: svc._id,
            status: 'active',
          }),
        ]);

        const estimatedWaitMinutes =
          activeCounters > 0
            ? Math.round((waitingTokens * svc.averageServiceTime) / activeCounters)
            : waitingTokens * svc.averageServiceTime;

        return {
          ...svc.toObject(),
          waitingTokens,
          activeCounters,
          estimatedWaitMinutes,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      services: enriched,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single service details
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('department', 'name code')
      .populate('office', 'name code address openingTime closingTime');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    const [waitingTokens, activeCounters] = await Promise.all([
      Token.countDocuments({
        serviceId: service._id,
        status: { $in: ['WAITING', 'APPROACHING'] },
      }),
      Counter.countDocuments({
        services: service._id,
        status: 'active',
      }),
    ]);

    const estimatedWaitMinutes =
      activeCounters > 0
        ? Math.round((waitingTokens * service.averageServiceTime) / activeCounters)
        : waitingTokens * service.averageServiceTime;

    res.status(200).json({
      success: true,
      service: {
        ...service.toObject(),
        waitingTokens,
        activeCounters,
        estimatedWaitMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getServices,
  getServiceById,
};
