const AuditLog = require('../models/AuditLog');

const logAction = async ({ user, action, entity, entityId = '', details = {} }) => {
  try {
    await AuditLog.create({
      performedBy: user?._id || null,
      performedByName: user?.name || 'System',
      role: user?.role || 'system',
      action,
      entity,
      entityId: String(entityId),
      details,
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = {
  logAction,
};
