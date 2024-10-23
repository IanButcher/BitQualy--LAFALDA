// Modules
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const Evaluacion = require('../Schemas/evaluacionSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const Notification = require('../Schemas/notificationSchema')
const mongoose = require('mongoose')
const  roleAuthorization = require('../middleware/roleAuth')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// GET route --> load unread notifications
router.get('/notifications/unread', roleAuthorization(['Empleado', 'Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id, isRead: false }).sort({ createdAt: -1 })
        res.json(notifications)
    } catch (error) {
        console.error('Error fetching notifications:', error)
        res.status(500).json({ message: 'Error fetching notifications' })
    }
})

// POST route --> mark as read
router.post('/notifications/mark-as-read', roleAuthorization(['Empleado', 'Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } })
        res.status(200).send('Notifications marked as read')
    } catch (error) {
        console.error('Error marking notifications as read:', error)
        res.status(500).send('Error marking notifications as read')
    }
})

module.exports = router