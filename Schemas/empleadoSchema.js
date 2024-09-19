const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')


const empleadoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    legajo: {
        type: Number,
        required: true,
        trim: true
    },
    rol: {
        type: String,
        required: true,
        trim: true
    },
    evaluacionesAsignadas: [],
    evaluacionesCompletadas: [],
    password: {
        type: String,
        required: true,
        min: 6,
        max: 16
    }
})

const Empleado = mongoose.model('Empleado', empleadoSchema)

module.exports = Empleado