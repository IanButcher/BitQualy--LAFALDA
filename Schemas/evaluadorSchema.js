const mongoose = require('mongoose')

// MODIFICAR
const evaluadorSchema = new mongoose.Schema({
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
})

module.exports = evaluadorSchema