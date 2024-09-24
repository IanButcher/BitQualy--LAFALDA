const mongoose = require('mongoose')

const comentarioSchema = new mongoose.Schema({
    intermediario: {
        type: Object,
        required: true
    },
    texto: {
        type: String,
        required: true
    }
})

const Comentario = mongoose.model('Comentario', comentarioSchema)

const evaluacionSchema = new mongoose.Schema({
    comentarios: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comentario' 
        }]
    } , //Posteriormente se insertaran los comentarios
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