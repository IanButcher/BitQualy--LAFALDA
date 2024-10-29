// comentSchema.js
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

module.exports = { comentarioSchema, Comentario }