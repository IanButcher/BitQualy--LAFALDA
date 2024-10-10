// Modulos
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const BaseUser = require('./baseUserSchema')

// Define el esquema para administrador
const adminSchema = new mongoose.Schema({
    usuariosCreados: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BaseUser'
        }
    ],
    formsCreados: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Formularios'
        }
    ],
})


const Administrador = BaseUser.discriminator('Administrador', adminSchema)

module.exports = Administrador;
