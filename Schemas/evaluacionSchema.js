// evaluationSchema.js
const mongoose = require('mongoose')
const Formulario = require('./formularioSchema')
const BaseUser = require('./baseUserSchema')

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
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BaseUser', 
        required: true 
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseUser'
    },
    deadline: {
        type: Date,
        required: false
    },  
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    completed: {
        type: Boolean,
        required: true,
        default: true
    },
    respuestas: {
        type: [String],
        required: true
    },
    comentarios: [comentarioSchema]
});

const Evaluacion = mongoose.model('Evaluacion', evaluacionSchema);
module.exports = Evaluacion;
