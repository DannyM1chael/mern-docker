const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  text: String,
  name: String,
  room: String || Number,
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);