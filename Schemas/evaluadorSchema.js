// Modulos
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const BaseUser = require('./baseUserSchema')

// Define el esquema para empleado
const evaluadorSchema = new mongoose.Schema({
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
    // Evaluaciones que evaluo
    evaluaciones: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' 
        }
    ],
})


const Evaluador = BaseUser.discriminator('Evaluador', evaluadorSchema)

module.exports = Evaluador;
