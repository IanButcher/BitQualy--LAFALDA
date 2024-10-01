// evaluationSchema.js
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

const respuestaSchema = new mongoose.Schema({
    pregunta: {
        type: String,
        required: true
    },
    respuesta: {
        type: [String],  //Array en caso de ser multiple o checkbox
        required: true
    }
});

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
    respuestas: [respuestaSchema],
    comentarios: [comentarioSchema]
});

const Evaluacion = mongoose.model('Evaluacion', evaluacionSchema);
module.exports = Evaluacion;
