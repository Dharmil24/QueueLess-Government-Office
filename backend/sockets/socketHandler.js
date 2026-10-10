let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client joins office room to receive live counter and queue changes
    socket.on('join_office', (officeId) => {
      if (officeId) {
        socket.join(`office_${officeId}`);
        // Also join display room
        socket.join(`display_${officeId}`);
      }
    });

    socket.on('leave_office', (officeId) => {
      if (officeId) {
        socket.leave(`office_${officeId}`);
        socket.leave(`display_${officeId}`);
      }
    });

    // Citizen joins private room for their specific notifications/tokens
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Counter specific room for staff
    socket.on('join_counter', (counterId) => {
      if (counterId) {
        socket.join(`counter_${counterId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};

const getIO = () => ioInstance;

/**
 * Emit event to office room and display room
 */
const emitToOffice = (officeId, eventName, payload) => {
  if (!ioInstance || !officeId) return;
  ioInstance.to(`office_${officeId}`).emit(eventName, payload);
  ioInstance.to(`display_${officeId}`).emit(eventName, payload);
};

/**
 * Emit event to a specific citizen user room
 */
const emitToUser = (userId, eventName, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user_${userId}`).emit(eventName, payload);
};

/**
 * Broadcast general queue update to all
 */
const broadcastGlobal = (eventName, payload) => {
  if (!ioInstance) return;
  ioInstance.emit(eventName, payload);
};

module.exports = {
  initSocket,
  getIO,
  emitToOffice,
  emitToUser,
  broadcastGlobal,
};
