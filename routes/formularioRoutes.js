// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const mongoose = require('mongoose')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const  roleAuthorization = require('../middleware/roleAuth')

// GET route --> Display Formularios
router.get('/formularios', roleAuthorization(['Administrador']), async (req, res) => {
    if (req.user){
        try {
            const formularios = await Formulario.find({ isActive: true })
            const totalAutoevaluacion = formularios.filter(f => f.tipo === 'autoevaluacion').length
            const totalEvaluacion = formularios.filter(f => f.tipo === 'evaluacion').length
            res.render('forms/formularios', { formularios: formularios, totalEvaluacion, totalAutoevaluacion, user: req.user })
        } catch (error) {
            console.error('Error fetching formularios:', error)
            res.redirect('/home')
        }
    } else {
        res.redirect('/')
    }
})

// GET route --> query
router.get('/formularios/buscar', roleAuthorization(['Administrador']), async (req, res) => {
    const { query } = req.query

    if (req.user) {
        try {
            const formularios = await Formulario.find({
                isActive: true,
                $or: [
                    { titulo: { $regex: query, $options: 'i' } },
                    { tipo: { $regex: query, $options: 'i' } }  
                ]
            })
            const totalAutoevaluacion = formularios.filter(f => f.tipo === 'autoevaluacion').length
            const totalEvaluacion = formularios.filter(f => f.tipo === 'evaluacion').length
            // Render the formularios view with filtered results
            res.render('forms/formularios', { formularios, totalAutoevaluacion, totalEvaluacion, user: req.user, query })
        } catch (error) {
            console.error("Error searching formularios:", error)
            res.redirect('/formularios')
        }
    } else {
        res.redirect('/')
    }
})

// GET route --> Mostrar creador de formularios
router.get('/formularios/new', roleAuthorization(['Administrador']), (req, res) => {
    if (req.user){
        res.render('forms/new', { user: req.user })  
    } else {
        res.redirect('/')
    }  
})

// Get route --> Mostrar updater de formulario
router.get('/formularios/preview/:id', roleAuthorization(['Administrador']), async (req, res)=>{
    if (req.user){
        const { id } = req.params
        const formulario = await Formulario.findById(id)
        if (formulario) {
            res.render('forms/update', { formulario, user: req.user })
        } else {
            res.redirect('/formularios')
        } 
    } else {
        res.redirect('/')
    }
})

// POST route --> save/insert Formulario
router.post('/formularios/save-form', roleAuthorization(['Administrador']), async (req, res) => {
    if (req.user){
        try {
            // Extraer toda la informacion del ejs
            const { 'form-title': titulo, 'form-type': tipo, ...formData } = req.body

            // Procesar preguntas
            const questions = []

            let questionIndex = 1;
            while (formData[`question${questionIndex}`]) {
                const question = {
                    titulo: formData[`question${questionIndex}`],  // (preguntaSchema.titulo)
                    descripcion: formData[`description${questionIndex}`],  // (preguntaSchema.descripcion)
                    porcentaje: formData[`percentage${questionIndex}`],  //  (preguntaSchema.porcentaje)
                    tipo: formData[`type${questionIndex}`], // (preguntaSchema.tipo)
                    options: []
                };

                // Tipo multiple o checkbox
                if (question.tipo === 'multiple' || question.tipo === 'checkbox') {
                    let optionIndex = 1;
                    while (formData[`option${questionIndex}_${optionIndex}`]) {
                        question.options.push(formData[`option${questionIndex}_${optionIndex}`]);
                        optionIndex++;
                    }
                }

                // Sumar al array
                questions.push(question);
                questionIndex++;
            }

            // Crear instancia Formulario 
            const newFormulario = new Formulario({
                titulo,
                tipo,  
                questions  
            });

            // Save the Formulario to the database
            await newFormulario.save()

            // Save into admin created users
            await baseUserSchema.findByIdAndUpdate(req.user._id, {
                $push: { formsCreados: newFormulario._id }
            })

            // Redirect to the formularios list after saving
            res.redirect('/formularios')
        } catch (error) {
            console.error('Error saving formulario:', error)
            res.status(500).send('Internal Server Error')
        }
    } else {
        res.redirect('/')
    }
})

// PUT route --> Delete Form
router.post('/formularios/eliminar/:id', roleAuthorization(['Administrador']), async (req, res) => {
    if (req.user){
        try {
            const formularioId = req.params.id
            console.log('Formulario ID:', formularioId) 
            const result = await Formulario.findByIdAndUpdate(formularioId, { isActive: false })
            console.log('Update result:', result)

            if (result) {
                res.redirect('/formularios')
            } else {
                res.status(404).send('Formulario no encontrado')
            }
        } catch (error) {
            console.error('Error deleting formulario:', error)
            res.redirect('/formularios')
        }
    } else {
        res.redirect('/')
    }
})

// PUT route --> Update Formulario
router.put('/formularios/:id', roleAuthorization(['Administrador']), async (req, res) => {
    if (req.user){
        try {
            const { id } = req.params;
            const { 'form-title': titulo, 'form-type': tipo, 'deleted-questions': deletedQuestionIds, ...formData } = req.body

            // Find the Formulario
            const formulario = await Formulario.findById(id)

            if (!formulario) {
                return res.status(404).send('Formulario not found')
            }

            // Existing questions
            let updatedQuestions = [...formulario.questions]

            // Questions
            let questionIndex = 1;
            while (formData[`question${questionIndex}`]) {
                const questionId = formData[`question${questionIndex}_id`] 

                const question = {
                    titulo: formData[`question${questionIndex}`],
                    descripcion: formData[`description${questionIndex}`],
                    porcentaje: formData[`percentage${questionIndex}`],
                    tipo: formData[`type${questionIndex}`],
                    options: []
                }

                if (question.tipo === 'multiple' || question.tipo === 'checkbox') {
                    let optionIndex = 1
                    while (formData[`option${questionIndex}_${optionIndex}`]) {
                        question.options.push(formData[`option${questionIndex}_${optionIndex}`])
                        optionIndex++
                    }
                }

                if (questionId) {
                    const existingQuestionIndex = updatedQuestions.findIndex(q => q._id.toString() === questionId)
                    if (existingQuestionIndex !== -1) {
                        updatedQuestions[existingQuestionIndex] = { ...updatedQuestions[existingQuestionIndex], ...question }
                    }
                } else {
                    // Otherwise, it's a new question
                    updatedQuestions.push(question)
                }

                questionIndex++
            }

            if (deletedQuestionIds) {
                const idsToDelete = deletedQuestionIds.split(',')  // Convert string into array of IDs
                updatedQuestions = updatedQuestions.filter(q => !idsToDelete.includes(q._id.toString()))
            }

            // Update 
            formulario.titulo = titulo
            formulario.questions = updatedQuestions
            formulario.tipo = tipo

            // Save updated
            await formulario.save();

            res.redirect('/formularios');
        } catch (error) {
            console.error('Error updating formulario:', error);
            res.redirect('/formularios/:id')
        }
    } else {
        res.redirect('/')
    }
})


module.exports = router

