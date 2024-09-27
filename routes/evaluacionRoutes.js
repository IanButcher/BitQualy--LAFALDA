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
        const evaluaciones = await Evaluacion.find().populate('formulario')
        res.render('evals/evaluaciones', { evaluaciones })
    } catch (error) {
        console.error('Error fetching evaluations:', error)
        res.status(500).send('Error interno del servidor')
    }
});


// GET route --> Mostrar evaluacion especifica
router.get('/evaluaciones/new', async (req, res) => {
    try {
        const formularios = await Formulario.find()
        res.render('evals/new', { formularios })
    } catch (error) {
        console.error('Error fetching forms:', error)
        res.status(500).send('Error interno del servidor')
    }
});


// POST route --> Enviar nueva ev
router.post('/evaluacion/save-evaluacion', async (req, res) => {
    try {
        const { id } = req.params
        const { empleado, respuestas } = req.body

        const formulario = await Formulario.findById(id)
        if (!formulario) {
            return res.status(404).send('Formulario no encontrado')
        }

        // 
        const nuevaEvaluacion = new Evaluacion({
            formulario: formulario._id,
            empleado: empleado,  
            respuestas: respuestas.map(respuesta => ({
                pregunta: respuesta.pregunta,
                respuesta: Array.isArray(respuesta.respuesta) ? respuesta.respuesta : [respuesta.respuesta]
            }))
        })

        // Save evaluacion
        await nuevaEvaluacion.save()

        
        res.redirect('/evaluaciones')
    } catch (error) {
        console.error('Error guardando la evaluación:', error)
        res.status(500).send('Error interno del servidor')
    }
})

// GET route --> Evaluacion Especifica
router.get('/evaluaciones/preview/:id', async (req, res) => {
    try {
        const evaluacion = await Evaluacion.findById(req.params.id).populate('formulario')
        if (!evaluacion) {
            return res.status(404).send('Evaluación no encontrada')
        }

        res.render('evals/evaluacion', { evaluacion })
    } catch (error) {
        console.error('Error fetching evaluation:', error)
        res.status(500).send('Error interno del servidor')
    }
})


module.exports = router