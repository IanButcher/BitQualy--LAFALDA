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

// POST route --> save/insert Formulario
router.post('/formularios/save-form', roleAuthorization(['Administrador']), async (req, res) => {
    if (req.user){
        try {
            const { 'form-title': titulo, 'form-type': tipo, ...formData } = req.body

            const questions = []
            let questionIndex = 1
            while (formData[`question${questionIndex}`]) {
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
                        question.options.push({
                            text: formData[`option${questionIndex}_${optionIndex}`],
                            score: parseFloat(formData[`option${questionIndex}_${optionIndex}_score`]) || 0
                        })
                        optionIndex++
                    }
                }

                questions.push(question)
                questionIndex++
            }

            const newFormulario = new Formulario({
                titulo,
                tipo,  
                questions  
            })

            await newFormulario.save();
            await baseUserSchema.findByIdAndUpdate(req.user._id, {
                $push: { formsCreados: newFormulario._id }
            })

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
    try {
        const { 'form-title': titulo, 'form-type': tipo, 'deleted-questions': deletedQuestionIds, ...formData } = req.body

        // Retrieve the existing Formulario
        const formulario = await Formulario.findById(req.params.id)
        if (!formulario) {
            return res.status(404).send('Formulario not found')
        }

        // Initialize updated questions array
        let updatedQuestions = []

        // Iterate through each question in the form data
        let questionIndex = 1
        while (formData[`question${questionIndex}`]) {
            const questionId = formData[`question${questionIndex}_id`]
            const question = {
                titulo: formData[`question${questionIndex}`],
                descripcion: formData[`description${questionIndex}`],
                porcentaje: formData[`percentage${questionIndex}`],
                tipo: formData[`type${questionIndex}`],
                options: []
            }

            // Process options for each question if it is multiple or checkbox
            if (question.tipo === 'multiple' || question.tipo === 'checkbox') {
                let optionIndex = 1
                while (formData[`option${questionIndex}_${optionIndex}`]) {
                    question.options.push({
                        text: formData[`option${questionIndex}_${optionIndex}`],
                        score: parseFloat(formData[`option${questionIndex}_${optionIndex}_score`]) || 0
                    })
                    optionIndex++
                }
            }

            // If questionId exists, update the existing question; otherwise, add as a new question
            if (questionId) {
                const existingQuestionIndex = formulario.questions.findIndex(q => q._id.toString() === questionId)
                if (existingQuestionIndex !== -1) {
                    formulario.questions[existingQuestionIndex] = { ...formulario.questions[existingQuestionIndex], ...question }
                }
            } else {
                // Add new question if no questionId
                formulario.questions.push(question)
            }

            questionIndex++
        }

        // Handle deleted questions
        if (deletedQuestionIds) {
            const idsToDelete = deletedQuestionIds.split(',')
            formulario.questions = formulario.questions.filter(q => !idsToDelete.includes(q._id.toString()))
        }

        // Update Formulario details
        formulario.titulo = titulo
        formulario.tipo = tipo

        // Save the updated Formulario
        await formulario.save()

        res.redirect('/formularios')
    } catch (error) {
        console.error('Error updating formulario:', error)
        res.redirect(`/formularios/preview/${req.params.id}`)
    }
})



module.exports = router

