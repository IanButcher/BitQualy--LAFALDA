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
        const formularios = await Formulario.find({ isActive: true }).populate('questions')
        res.render('evals/new', { formularios })
    } catch (error) {
        console.error('Error fetching forms:', error)
        res.status(500).send('Error interno del servidor')
    }
})

//app.get('/formularios/:id/preguntas', async (req, res) => {
    //try {
      //  const formulario = await Formulario.findById(req.params.id).populate('preguntas');
        //res.json({ preguntas: formulario.preguntas });
    //} catch (error) {
      //  console.error('Error fetching preguntas:', error);
        //res.status(500).json({ error: 'Server Error' });
    //}
//})

// GET route --> Mostrar las preguntas para la evaluación
router.get('/evaluaciones/answer/:id', async (req, res) => {
    console.log('GET /evaluaciones/answer/:id reached')
    try {
        const { id } = req.params;  // formulario ID
        const { empleado } = req.query;  // empleado from the query params
        console.log(`Formulario ID: ${id}, Empleado: ${empleado}`)
        const formulario = await Formulario.findById(id).populate('questions')
        if (!formulario || formulario.isActive != true) {
            return res.status(404).send('Formulario no encontrado');
        }

        // Render a new page with the preguntas and the selected empleado
        res.render('evals/awnser', { formulario, empleado });
    } catch (error) {
        console.error('Error fetching formulario:', error);
        res.status(500).send('Error interno del servidor');
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

        // Crear instancia evaluacion
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