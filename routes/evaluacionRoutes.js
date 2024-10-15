// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const Evaluacion = require('../Schemas/evaluacionSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const mongoose = require('mongoose')
const  roleAuthorization = require('../middleware/roleAuth')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get('/evaluaciones', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario', 'Empleado']), async (req, res) => {
    if (req.user) {
        try {
            let query = {}
            if (req.user.rol === 'Empleado') {
                query = { empleado: req.user._id, 'formulario.tipo': 'autoevaluacion' }
            }
            const evaluaciones = await Evaluacion.find()
                .populate('formulario')
                .populate('empleado')
                .populate('assignedBy')
            res.render('evals/evaluaciones', { evaluaciones, user: req.user })
        } catch (error) {
            console.error('Error fetching evaluations:', error)
            res.status(500).send('Error interno del servidor')
        }
    } else {
        res.redirect('/');
    }
})


// GET route --> Mostrar evaluacion especifica
router.get('/evaluaciones/new', roleAuthorization(['Administrador', 'Evaluador']), async (req, res) => {
    if (req.user) {
        try {
            const formularios = await Formulario.find({ isActive: true }).populate('questions')
            const usuarios = await baseUserSchema.find({ estaActivo: true })
            res.render('evals/new', { formularios, usuarios, user: req.user })
        } catch (error) {
            console.error('Error fetching forms:', error)
            res.status(500).send('Error interno del servidor')
        }
    } else {
        res.redirect('/');
    } 
})

// POST route --> Assign autoevaluacion
router.post('/evaluaciones/assign-autoevaluacion', roleAuthorization(['Administrador', 'Evaluador']), async (req, res) => {
    try {
        const { empleadoId, formularioId, deadline } = req.body

        const newEvaluacion = new Evaluacion({
            formulario: formularioId,
            empleado: empleadoId,
            assignedBy: req.user._id,
            deadline: new Date(deadline),
            completed: false
        });

        await newEvaluacion.save()

        res.status(200).send('Autoevaluacion asignada correctamente')
    } catch (error) {
        res.status(500).send('Error assigning autoevaluacion: ' + error.message)
    }
});


// GET route --> Ver autoevaluacion
router.get('/evaluaciones/my-autoevaluacion/:id', roleAuthorization(['Empleado']), async (req, res) => {
    try {
        const { id } = req.params;  
        const evaluacion = await Evaluacion.findById(id).populate('formulario').populate('empleado')
        
        if (!evaluacion) {
            return res.status(404).send('Evaluación no encontrada')
        }
        if (evaluacion.completed == true) {
            return res.status(403).send('Esta evaluación ya ha sido completada y no puede ser modificada.')
        }

        // Render the 'awnser.ejs' template with both evaluacion and user
        res.render('evals/awnser', { evaluacion, formulario: evaluacion.formulario, user: req.user, empleado: evaluacion.empleado ? evaluacion.empleado.nombre : 'Empleado no asignado' })
    } catch (error) {
        console.error('Error fetching evaluation:', error)
        res.status(500).send('Error interno del servidor')
    }
});

  

  

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
router.get('/evaluaciones/answer/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    console.log('GET /evaluaciones/answer/:id reached')
    if (req.user) {
        try {
            const { id } = req.params  // formulario ID
            const { empleado } = req.query
            console.log(`Formulario ID: ${id}, Empleado: ${empleado}`)
            const formulario = await Formulario.findById(id).populate('questions')
            if (!formulario || formulario.isActive != true) {
                return res.status(404).send('Formulario no encontrado')
            }
    
            // Render a new page with the preguntas and the selected empleado
            res.render('evals/awnserNormal', { formulario, empleado, user: req.user })
        } catch (error) {
            console.error('Error fetching formulario:', error)
            res.status(500).send('Error interno del servidor')
        }
    } else {
        res.redirect('/');
    }
})


// POST route --> Enviar nueva evaluación
router.post('/evaluaciones/save-evaluacion', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario', 'Empleado']), async (req, res) => {
    try {
        const { formulario: formularioId, empleado, respuestas, tipo } = req.body

        const formulario = await Formulario.findById(formularioId).populate('questions')
        if (!formulario) {
            return res.status(404).send('Formulario no encontrado')
        }

        // Format the answers to ensure they are strings
        const respuestasFormateadas = formulario.questions.map((question, index) => {
            const respuesta = respuestas[index]
        
            if (Array.isArray(respuesta)) {
                return respuesta.join(', ')
            } else if (typeof respuesta === 'object' && respuesta !== null) {
                return Object.values(respuesta).join(', ')
            } else {
                return respuesta.toString()
            }
        })

        // Find the existing evaluation based on the form and employee
        const evaluacion = await Evaluacion.findOne({ formulario: formularioId, empleado: empleado })
        if (!evaluacion) {
            return res.status(404).send('Evaluación no encontrada')
        }

        // Logic for autoevaluaciones
        if (tipo === 'autoevaluacion') {
            evaluacion.respuestas = respuestasFormateadas
            evaluacion.completed = true
        }
        
        // Logic for normal evaluaciones
        else if (tipo === 'evaluacion') {
            const nuevaEvaluacion = new Evaluacion({
            formulario: formulario._id,
            empleado: empleado,
            respuestas: respuestasFormateadas
        })
        }

        // Save the updated evaluatio
        await evaluacion.save();

        // Redirect after saving
        res.redirect('/evaluaciones')
    } catch (error) {
        console.error('Error guardando la evaluación:', error)
        res.status(500).send('Error interno del servidor')
    }
})


// GET route --> Preview evaluacion
router.get('/evaluaciones/preview/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        try {
            const { id } = req.params;  // Evaluation ID
    
            // Find the evaluation by ID and populate the associated form and questions
            const evaluacion = await Evaluacion.findById(id).populate({
                path: 'formulario',
                populate: { path: 'questions' }  // Populate questions within the form
            });
    
            if (!evaluacion) {
                return res.status(404).send('Evaluación no encontrada')
            }
    
            // Render a view for displaying the evaluation (non-editable)
            res.render('evals/evaluacion', { evaluacion, user: req.user })
        } catch (error) {
            console.error('Error fetching evaluation:', error)
            res.status(500).send('Error interno del servidor')
        }
    } else {
        res.redirect('/')
    }
})


module.exports = router