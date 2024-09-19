const mongoose = require('mongoose')

const campoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    valor: {
        type: Number,
        required: true,
        trim: true
    }
})

const formularioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    campos: [campoSchema] //Posteriormente se va a llenar con los campos
})


const Formulario = mongoose.model('Formulario', formularioSchema)

module.exports = Formulario