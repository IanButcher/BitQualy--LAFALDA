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
            return res.status(404).send('Formulario no encontrado')
        }

        // Render a new page with the preguntas and the selected empleado
        res.render('evals/awnser', { formulario, empleado })
    } catch (error) {
        console.error('Error fetching formulario:', error)
        res.status(500).send('Error interno del servidor')
    }
});


// POST route --> Enviar nueva evaluación
router.post('/evaluaciones/save-evaluacion', async (req, res) => {
    try {
        const { formulario: formularioId, empleado, respuestas } = req.body

        const formulario = await Formulario.findById(formularioId).populate('questions')
        if (!formulario) {
            return res.status(404).send('Formulario no encontrado')
        }

        // Format the answers to ensure they are strings
        const respuestasFormateadas = formulario.questions.map((question, index) => {
            const respuesta = respuestas[index];

            if (Array.isArray(respuesta)) {
                // If the respuesta is an array (for checkboxes), format them as a list of values
                return `Seleccionado(s): ${respuesta.join(', ')}`;
            } else if (typeof respuesta === 'object' && respuesta !== null) {
                // If respuesta is an object (e.g., multiple-choice), format the object's values
                return `Seleccionado(s): ${Object.values(respuesta).join(', ')}`;
            } else {
                // Ensure single responses are returned as strings
                return `Respuesta: ${respuesta.toString()}`;
            }
        });

        // Create a new Evaluacion instance
        const nuevaEvaluacion = new Evaluacion({
            formulario: formulario._id,
            empleado: empleado,
            respuestas: respuestasFormateadas
        });

        // Save the evaluation
        await nuevaEvaluacion.save()

        // Redirect after saving
        res.redirect('/evaluaciones')
    } catch (error) {
        console.error('Error guardando la evaluación:', error)
        res.status(500).send('Error interno del servidor')
    }
})

// GET route --> Preview evaluacion
router.get('/evaluaciones/preview/:id', async (req, res) => {
    try {
        const { id } = req.params;  // Evaluation ID

        // Find the evaluation by ID and populate the associated form and questions
        const evaluacion = await Evaluacion.findById(id).populate({
            path: 'formulario',
            populate: { path: 'questions' }  // Populate questions within the form
        });

        if (!evaluacion) {
            return res.status(404).send('Evaluación no encontrada');
        }

        // Render a view for displaying the evaluation (non-editable)
        res.render('evals/evaluacion', { evaluacion });
    } catch (error) {
        console.error('Error fetching evaluation:', error);
        res.status(500).send('Error interno del servidor');
    }
});


module.exports = router