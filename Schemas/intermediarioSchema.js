const mongoose = require('mongoose')

const intermediarioSchema = new mongoose.Schema({
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
    evaluacionesIntermediadas: [],
    password: {
        type: String,
        required: true,
        min: 6,
        max: 16
    }
})

const Intermediario = mongoose.model('Intermediario', intermediarioSchema)

module.exports = Intermediario