// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Empleado = require('./Schemas/empleadoSchema')
const Evaluador = require('./Schemas/evaluadorSchema')
const Regulador = require('./Schemas/intermediarioSchema')
const baseUserSchema = require('./Schemas/baseUserSchema')
const Administrador = require('./Schemas/adminSchema')
const bcrypt = require('bcryptjs')
const { initializePassportSession, passport } = require('./middleware/passportConfig')
const roleAuthorization = require('./middleware/roleAuth')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const upload = require('./middleware/multerConfig') 
const mongoose = require('mongoose')

// Mongoose connection
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bitqualyPrueba'
async function main() {
    await mongoose.connect(uri)
    console.log('Connection to MongoDB successful')
}
main().catch(err => console.log('ERROR on connection to MongoDB:', err))

// ADMIN
const adminAccount = new Administrador({
    nombre: 'Administrador1',
    apellido: 'Butcher',
    legajo: '554',
    password: 'bitqualy',
    email: 'ibutcher@escuelasproa.edu.ar',
    dni: '47464325'
})
async function guardar (){
    await adminAccount.save()
}
guardar()