const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['collaboration_request', 'request_accepted', 'request_rejected', 'team_invitation', 'new_member', 'new_message', 'task_assigned', 'task_completed', 'deadline', 'submitted', 'evaluated', 'certificate_ready', 'award'] },
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
