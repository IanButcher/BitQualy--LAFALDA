// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const Evaluacion = require('../Schemas/evaluacionSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const mongoose = require('mongoose')
const  roleAuthorization = require('../middleware/roleAuth')
const nodemailer = require('nodemailer')
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
        res.redirect('/')
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

        const empleado = await baseUserSchema.findById(empleadoId)

        await baseUserSchema.findByIdAndUpdate(empleadoId, {
            $push: { evaluacionesAsignadas: newEvaluacion._id }
        })
        await baseUserSchema.findByIdAndUpdate(req.user._id, {
            $push: { evaluaciones: newEvaluacion._id }
        })

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bitqualypassmanager@gmail.com',
                pass: 'yoif nkxt bqkl zsrf'
            }
        })

        const mailOptions = {
            from: 'bitqualypassmanager@gmail.com',
            to: empleado.email,  
            subject: '¡Te han asignado una evaluación!',
            text: `Hola ${empleado.nombre},\n\n¡Te han asignado una nueva evaluación que debes realizar!\n\nTienes hasta ${newEvaluacion.deadline} para completarla.\n`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error)
                return res.status(500).send('Error sending email')
            }
            console.log('Correo enviado:', info.response)
            res.redirect('/home')
        })

        res.status(200).send('Autoevaluacion asignada correctamente')
    } catch (error) {
        res.status(500).send('Error assigning autoevaluacion: ' + error.message)
    }
})


// GET route --> Ver autoevaluacion
router.get('/evaluaciones/my-autoevaluacion/:id', roleAuthorization(['Empleado', 'Administrador', 'Intermediario', 'Evaluador']), async (req, res) => {
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
        res.redirect('/')
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
        });

        // Logic for autoevaluaciones (update existing evaluation)
        if (tipo === 'autoevaluacion') {
            const evaluacion = await Evaluacion.findOne({ formulario: formularioId, empleado: empleado })
            if (!evaluacion) {
                return res.status(404).send('Evaluación no encontrada')
            }
            evaluacion.respuestas = respuestasFormateadas
            evaluacion.completed = true
            await evaluacion.save()
            await baseUserSchema.findByIdAndUpdate(empleado, {
                $pull: { evaluacionesAsignadas: evaluacion._id },
                $push: { evaluacionesCompletadas: evaluacion._id }
            })
        }
        
        // Logic for normal evaluaciones (create a new evaluation)
        else if (tipo === 'evaluacion') {
            const nuevaEvaluacion = new Evaluacion({
                formulario: formulario._id,
                empleado: empleado,
                assignedBy: req.user._id,
                respuestas: respuestasFormateadas,
                completed: true 
            });
            await nuevaEvaluacion.save()
            await baseUserSchema.findByIdAndUpdate(req.user._id, {
                $push: { evaluacionesHechas: newEvaluacion._id }
            })
        }

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