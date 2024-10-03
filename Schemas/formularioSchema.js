// Modulos
const mongoose = require('mongoose')

//esquema para cada una de las preguntas 
const preguntaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true 
    },
    descripcion: {
        type: String, 
        required: true
    },
    porcentaje: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    tipo: {
        type: String,
        required: true,
        enum: ['texto', 'multiple', 'checkbox'] //tipos de preguntas
    },
    options: [String]  // Opcional para multiple y checkbox
});

//esquema de los formularios generales
const formularioSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    questions: [preguntaSchema],  // Array con las preguntas
    
    isActive: {
        //verificar si esta activo 
        type: Boolean,
        default: true 
    }
})

// Create and export the Formulario model
const Formulario = mongoose.model('Formulario', formularioSchema)

module.exports = Formulario;
