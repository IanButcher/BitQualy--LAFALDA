// evaluationSchema.js
const mongoose = require('mongoose')
const Formulario = require('./formularioSchema')

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
    formulario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Formulario',
        required: true
    },
    empleado: {
        type: String, // Id
        required: true
    },
    respuestas: {
        type: [String],
        required: true
    },
    comentarios: [comentarioSchema]
});

const Evaluacion = mongoose.model('Evaluacion', evaluacionSchema);
module.exports = Evaluacion;
