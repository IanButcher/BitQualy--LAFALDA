// evaluationSchema.js
const mongoose = require('mongoose')
const Formulario = require('./formularioSchema')
const BaseUser = require('./baseUserSchema')
const { comentarioSchema } = require('./comentarioSchema')

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
    comentarios: [comentarioSchema],

    score: {
        type: Number,
        required: true,
        default: 0
    }
});

const Evaluacion = mongoose.model('Evaluacion', evaluacionSchema);
module.exports = Evaluacion;