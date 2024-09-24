// Modulos
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const BaseUser = require('./baseUserSchema')

// Define el esquema para empleado
const empleadoSchema = new mongoose.Schema({
    evaluacionesAsignadas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' // Reemplaza con el modelo correcto si tienes uno
        }
    ],
    evaluacionesCompletadas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' // Reemplaza con el modelo correcto si tienes uno
        }
    ],
})


const Empleado = BaseUser.discriminator('Empleado', empleadoSchema)

module.exports = Empleado;
