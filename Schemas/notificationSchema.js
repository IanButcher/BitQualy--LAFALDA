// Modules
const mongoose = require('mongoose')
const Formulario = require('./formularioSchema')
const BaseUser = require('./baseUserSchema')

// Schema
const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BaseUser', 
        required: true 
    },
    isRead: {
        type: Boolean,
        default: false
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
})

// Create and export model
const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification