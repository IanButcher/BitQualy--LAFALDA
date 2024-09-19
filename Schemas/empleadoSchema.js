const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Define el esquema para empleado
const empleadoSchema = new mongoose.Schema({
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
    evaluacionesAsignadas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' // Reemplaza con el modelo correcto si tienes uno
        }
    ],
    evaluacionesCompletadas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluacion' // Reemplaza con el modelo correcto si tienes uno
        }
    ],
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 16
    }
});

// Middleware para encriptar la contraseña antes de guardar
empleadoSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcryptjs.genSalt(10);
            this.password = await bcryptjs.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const Empleado = mongoose.model('Empleado', empleadoSchema);

module.exports = Empleado;
