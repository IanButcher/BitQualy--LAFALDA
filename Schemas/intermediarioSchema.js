// Modulos
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const BaseUser = require('./baseUserSchema')

// Define el esquema para empleado
const intermediarioSchema = new mongoose.Schema({
    // Autoevaluaciones que le asignaron
    evaluacionesAsignadas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' 
        }
    ],
    //Autoevaluaciones que completo
    evaluacionesCompletadas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' 
        }
    ],
    // Evaluaciones que intermedio/aprobo/desaprobo
    evaluaciones: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' 
        }
    ],
})


const Intermediario = BaseUser.discriminator('Intermediario', intermediarioSchema)

module.exports = Intermediario;
