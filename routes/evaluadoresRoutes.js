// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const Evaluacion = require('../Schemas/evaluacionSchema')
const mongoose = require('mongoose')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get('/evaluaciones', async (req, res) => {
    try {
        const evaluaciones = await Evaluacion.find()
        if (evaluaciones){
            res.send('/evals/evaluaciones.ejs', { evaluaciones })
            console.log(evaluaciones)
        } 
        else {
            console.log("Formularios vacios")
        }
    } catch (err){
        console.log(err)
    }
})

// GET route --> Mostrar evaluacion especifica
router.get('/evaluaciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const formulario = await Formulario.findById(id);
        
        if (!formulario) {
            return res.status(404).send('Formulario no encontrado');
        }

        // Renderiza la vista donde el empleado responde las preguntas
        res.render('evals/evaluacion', { formulario });
    } catch (error) {
        console.error('Error mostrando el formulario de evaluación:', error);
        res.status(500).send('Error interno del servidor');
    }
})

// POST route --> Enviar nueva ev
router.post('/evaluacion/:id', async (req, res) => {
    try {
        const { id } = req.params;  
        const { empleado, respuestas } = req.body;  

        const formulario = await Formulario.findById(id);
        if (!formulario) {
            return res.status(404).send('Formulario no encontrado');
        }

        // 
        const nuevaEvaluacion = new Evaluacion({
            formulario: formulario._id,
            empleado: empleado,  
            respuestas: respuestas.map(respuesta => ({
                pregunta: respuesta.pregunta,
                respuesta: Array.isArray(respuesta.respuesta) ? respuesta.respuesta : [respuesta.respuesta]
            }))
        });

        // Save evaluacion
        await nuevaEvaluacion.save();

        
        res.redirect('/evaluaciones');  
    } catch (error) {
        console.error('Error guardando la evaluación:', error);
        res.status(500).send('Error interno del servidor');
    }
});

