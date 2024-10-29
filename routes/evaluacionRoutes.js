// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const Evaluacion = require('../Schemas/evaluacionSchema')
const Comentario = require('../Schemas/comentarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const mongoose = require('mongoose')
const roleAuthorization = require('../middleware/roleAuth')
const nodemailer = require('nodemailer')
const moment = require('moment')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// GET route --> Todas las evaluaciones
router.get('/evaluaciones', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario', 'Empleado']), async (req, res) => {
    if (req.user){
        try {
            let query = {}
            
            if (req.user.rol === 'Empleado') {
                query = { 
                    empleado: req.user._id, 
                    'formulario.tipo': 'autoevaluacion', 
                    $or: [{ completed: true }, { deadline: { $gte: new Date() } }]
                }
            } else if (req.user.rol === 'Evaluador') {
                query = {
                    $or: [
                        { empleado: req.user._id, completed: false }, 
                        { assignedBy: req.user._id },
                        { completed: true, 'formulario.tipo': 'evaluacion', empleado: req.user._id }
                    ]
                }
            } else if (req.user.rol === 'Intermediario' || req.user.rol === 'Administrador') {
                query = {}
            }
            
            const evaluaciones = await Evaluacion.find(query)
                .populate('formulario')
                .populate('empleado')
                .populate('assignedBy')

            const totalCompletas = evaluaciones.filter(e => e.completed).length
            const totalIncompletas = evaluaciones.filter(e => !e.completed).length
            
            res.render('evals/evaluaciones', { evaluaciones, user: req.user, totalCompletas, totalIncompletas })
        } catch (error) {
            console.error('Error fetching evaluations:', error)
            res.redirect('/home')
        }
    } else {
        res.redirect('/')
    }
})


// GET route --> Mostrar evaluacion especifica
router.get('/evaluaciones/new', roleAuthorization(['Administrador', 'Evaluador']), async(req, res) => {
    if (req.user) {
        try {
            const formularios = await Formulario.find({ isActive: true }).populate('questions')
            const usuarios = await baseUserSchema.find({ estaActivo: true })
            res.render('evals/new', { formularios, usuarios, user: req.user })
        } catch (error) {
            console.error('Error fetching forms:', error)
            res.redirect('/evaluaciones/new')
        }
    } else {
        res.redirect('/');
    }
})

// POST route --> Assign autoevaluacion
router.post('/evaluaciones/assign-autoevaluacion', roleAuthorization(['Administrador', 'Evaluador']), async(req, res) => {
    try {
        const { empleadoId, formularioId, deadline } = req.body

        const localDeadline = moment(deadline, 'YYYY-MM-DD').endOf('day').toDate()

        const newEvaluacion = new Evaluacion({
            formulario: formularioId,
            empleado: empleadoId,
            assignedBy: req.user._id,
            deadline: localDeadline,
            completed: false
        })

        await newEvaluacion.save()

        const empleado = await baseUserSchema.findById(empleadoId)

        await baseUserSchema.findByIdAndUpdate(empleadoId, {
            $push: { evaluacionesAsignadas: newEvaluacion._id }
        })
        await baseUserSchema.findByIdAndUpdate(req.user._id, {
            $push: { evaluaciones: newEvaluacion._id }
        })

        // https://stackoverflow.com/questions/49870196/how-to-define-custom-domain-email-in-nodemailer

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
            res.redirect('/evaluaciones')
        })

        res.status(200).send('Autoevaluacion asignada correctamente')
    } catch (error) {
        res.status(500).send('Error assigning autoevaluacion: ' + error.message)
    }
})

// POST route --> Asignar a todos
router.post('/evaluaciones/assign-autoevaluacion-to-all', roleAuthorization(['Administrador', 'Evaluador']), async (req, res) => {
    try {
        const { formularioId, deadline } = req.body
        const localDeadline = moment(deadline, 'YYYY-MM-DD').endOf('day').toDate()

        const activeUsers = await baseUserSchema.find({ estaActivo: true })

        // Create autoevaluacion p/ user
        const evaluations = activeUsers.map(user => ({
            formulario: formularioId,
            empleado: user._id,
            assignedBy: req.user._id,
            deadline: localDeadline,
            completed: false
        }))

        await Evaluacion.insertMany(evaluations)

        // Actualizar a todos
        const evaluationIds = evaluations.map(e => e._id)
        await baseUserSchema.updateMany(
            { _id: { $in: activeUsers.map(u => u._id) } },
            { $push: { evaluacionesAsignadas: { $each: evaluationIds } } }
        );

        res.status(200).send('Autoevaluacion asignada a todos los usuarios activos')
    } catch (error) {
        console.error('Error assigning autoevaluacion to all:', error)
        res.status(500).send('Error al asignar autoevaluacion a todos')
    }
})



// GET route --> Ver autoevaluacion
router.get('/evaluaciones/my-autoevaluacion/:id', roleAuthorization(['Empleado', 'Administrador', 'Intermediario', 'Evaluador']), async(req, res) => {
    try {
        const { id } = req.params;
        const evaluacion = await Evaluacion.findById(id).populate('formulario').populate('empleado')

        if (!evaluacion) {
            return res.redirect('/evaluaciones')
        }
        if (evaluacion.completed == true) {
            return res.redirect('/evaluaciones')
        }

        const now = new Date()
        if (evaluacion.deadline && evaluacion.deadline < now) {
            return res.redirect('/evaluaciones')
        }

        res.render('evals/awnser', { evaluacion, formulario: evaluacion.formulario, user: req.user, empleado: evaluacion.empleado ? evaluacion.empleado.nombre : 'Empleado no asignado' })
    } catch (error) {
        console.error('Error fetching evaluation:', error)
        res.status(500).send('Error interno del servidor')
    }
})

// POST route --> Create & redirect
router.post('/evaluaciones/create-evaluacion', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    try {
        const { formularioId, empleadoId, deadline } = req.body
        const localDeadline = deadline ? moment(deadline, 'YYYY-MM-DD').endOf('day').toDate() : null

        // Create 
        const newEvaluacion = new Evaluacion({
            formulario: formularioId,
            empleado: empleadoId,
            assignedBy: req.user._id,
            deadline: localDeadline,
            completed: false,
            respuestas: [] 
        })

        await newEvaluacion.save()

        // Redirect 
        res.redirect(`/evaluaciones/answer/${newEvaluacion._id}`)
    } catch (error) {
        console.error('Error creating evaluacion:', error)
        res.status(500).send('Error creating evaluacion')
    }
});


// GET route --> Display form to answer an evaluacion
router.get('/evaluaciones/answer/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    try {
        const { id } = req.params
        
        const evaluacion = await Evaluacion.findById(id).populate('formulario').populate('empleado')
        
        if (!evaluacion || evaluacion.completed) {
            return res.redirect('/evaluaciones')
        }

        res.render('evals/awnserNormal', {
            evaluacion,
            formulario: evaluacion.formulario,
            empleado: evaluacion.empleado,
            user: req.user
        });
    } catch (error) {
        console.error('Error displaying evaluation form:', error)
        res.status(500).send('Error interno del servidor')
    }
})



// POST route --> Enviar nueva evaluación
router.post('/evaluaciones/save-evaluacion', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario', 'Empleado']), async (req, res) => {
    try {
        const { formulario: formularioId, empleado, respuestas, tipo, deadline } = req.body;
        const formattedDeadline = deadline ? moment(deadline, 'YYYY-MM-DD', true).endOf('day').toDate() : new Date(); // Default to current date if undefined
        console.log('Received deadline:', formattedDeadline);

        console.log('Received deadline:', deadline)
        const formulario = await Formulario.findById(formularioId).populate('questions')
        if (!formulario) {
            return res.status(404).send('Formulario no encontrado')
        }

        // Respuestas
        const respuestasFormateadas = formulario.questions.map((question, index) => {
            const respuesta = respuestas[index]

            if (Array.isArray(respuesta)) {
                return respuesta.join(', ')
            } else if (typeof respuesta === 'object' && respuesta !== null) {
                return Object.values(respuesta).join(', ')
            } else {
                return respuesta ? respuesta.toString() : ''
            }
        })

        // Autoevaluacion
        if (formulario.tipo === 'autoevaluacion') {
            const evaluacion = await Evaluacion.findOne({ 
                formulario: formularioId, 
                empleado: empleado, 
                deadline: { $gte: new Date() },
                completed: false 
            })

            if (!evaluacion) {
                console.log('Evaluacion no encontrada')
                return res.redirect('/evaluaciones')
            }

            evaluacion.respuestas = respuestasFormateadas
            evaluacion.completed = true
            await evaluacion.save()

            // Añadir a completadas 
            await baseUserSchema.findByIdAndUpdate(empleado, {
                $addToSet: { completedEvaluations: evaluacion._id }
            })

        // Evaluacion
        } else if (formulario.tipo === 'evaluacion') {
            const nuevaEvaluacion = new Evaluacion({
                formulario: formulario._id,
                empleado: empleado,
                respuestas: respuestasFormateadas,
                deadline: formattedDeadline,
                completed: true
            })
            await nuevaEvaluacion.save()
            console.log(nuevaEvaluacion)

            await baseUserSchema.findByIdAndUpdate(req.user._id, {
                $addToSet: { evaluacionesHechas: nuevaEvaluacion._id }
            })
        }
        
        res.redirect('/evaluaciones')
    } catch (error) {
        console.error('Error guardando la evaluación:', error)
        res.status(500).send('Error interno del servidor')
    }
})



// GET route --> Preview evaluacion
router.get('/evaluaciones/preview/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        try {
            const { id } = req.params; 

            const evaluacion = await Evaluacion.findById(id).populate({
                path: 'formulario',
                populate: { path: 'questions' } 
            })

            if (!evaluacion) {
                return res.redirect('/evaluaciones')
            }

            
            res.render('evals/evaluacion', { evaluacion, user: req.user })
        } catch (error) {
            console.error('Error fetching evaluation:', error)
            res.status(500).send('Error interno del servidor')
        }
    } else {
        res.redirect('/')
    }
})

// POST route --> Comentarios
router.post('/evaluaciones/:id/comentarios', roleAuthorization(['Intermediario', 'Administrador']), async (req, res) => {
    try {
        const { id } = req.params
        const { texto } = req.body

        const evaluacion = await Evaluacion.findById(id)
        if (!evaluacion) {
            return res.status(404).send('Evaluación no encontrada')
        }

        // Create and add the comment
        const comentario = {
            intermediario: { _id: req.user._id, nombre: req.user.nombre },
            texto
        }

        evaluacion.comentarios.push(comentario)
        await evaluacion.save()

        res.redirect(`/evaluaciones/preview/${id}`)
    } catch (error) {
        console.error('Error adding comment:', error)
        res.status(500).send('Error interno del servidor')
    }
})

module.exports = router