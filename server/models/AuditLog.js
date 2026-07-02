const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    default: ''
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
