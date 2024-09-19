const mongoose = require('mongoose')

const comentariosSchema = new mongoose.Schema({
    intermediario: {
        type: Object,
        required: true
    },
    texto: {
        type: String,
        required: true
    }
})

const evaluacionSchema = new mongoose.Schema({
    comentarios: [], //Posteriormente se insertaran los comentarios
    formulario: {
        type: Object,
        required: true
    },
    estado: {
        type: Boolean,
        required: true
    }
})



const Evaluacion = mongoose.model('Evaluacion', evaluacionSchema)

module.exports = Evaluacion