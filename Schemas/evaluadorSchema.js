const mongoose = require('mongoose')


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
    evaluacionesCompletadas: [],
    password: {
        type: String,
        required: true,
        min: 6,
        max: 16
    }
})

const Evaluador = mongoose.model('Evaluador', evaluadorSchema)

module.exports = Evaluador