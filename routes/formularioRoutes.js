// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const mongoose = require('mongoose')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const  roleAuthorization = require('../middleware/roleAuth')

// GET route --> Display Formularios
router.get('/formularios', roleAuthorization(['Administrador']), async (req, res) => {

    try {
        const formularios = await Formulario.find({ isActive: true })
        res.render('forms/formularios', { formularios: formularios })
        console.log(formularios)
    } catch (error) {
        console.error('Error fetching formularios:', error)
        res.status(500).send('Internal Server Error')
    }
})

// GET route --> Mostrar creador de formularios
router.get('/formularios/new', roleAuthorization(['Administrador']), (req, res) => {
    res.render('forms/new') 
})

// Get route --> Mostrar updater de formulario
router.get('/formularios/preview/:id', roleAuthorization(['Administrador']), async (req, res)=>{
    const { id } = req.params
    const formulario = await Formulario.findById(id)
    if (formulario) {
        res.render('forms/update', { formulario })
    } else {
        res.status(404).send('No se encontro el formulario');
    }
})

// POST route --> save/insert Formulario
router.post('/formularios/save-form', roleAuthorization(['Administrador']), async (req, res) => {
    try {
        // Extraer toda la informacion del ejs
        const { 'form-title': titulo, ...formData } = req.body

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
            questions  
        });

        // Save the Formulario to the database
        await newFormulario.save()

        // Redirect to the formularios list after saving
        res.redirect('/formularios')
    } catch (error) {
        console.error('Error saving formulario:', error)
        res.status(500).send('Internal Server Error')
    }
})

// PUT route --> Delete Form
router.post('/formularios/eliminar/:id', roleAuthorization(['Administrador']), async (req, res) => {
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
        res.status(500).send('Internal Server Error')
    }
})

// PUT route --> Update Formulario
router.put('/formularios/:id', roleAuthorization(['Administrador']), async (req, res) => {
    try {
        const { id } = req.params;
        const { 'form-title': titulo, 'deleted-questions': deletedQuestionIds, ...formData } = req.body;

        // Find the Formulario
        const formulario = await Formulario.findById(id);

        if (!formulario) {
            return res.status(404).send('Formulario not found');
        }

        // Start with the existing questions
        let updatedQuestions = [...formulario.questions];

        // Process the questions from the form
        let questionIndex = 1;
        while (formData[`question${questionIndex}`]) {
            const questionId = formData[`question${questionIndex}_id`]; // Existing question ID (if any)

            const question = {
                titulo: formData[`question${questionIndex}`],
                descripcion: formData[`description${questionIndex}`],
                porcentaje: formData[`percentage${questionIndex}`],
                tipo: formData[`type${questionIndex}`],
                options: []
            };

            // Handle multiple-choice or checkbox options
            if (question.tipo === 'multiple' || question.tipo === 'checkbox') {
                let optionIndex = 1;
                while (formData[`option${questionIndex}_${optionIndex}`]) {
                    question.options.push(formData[`option${questionIndex}_${optionIndex}`]);
                    optionIndex++;
                }
            }

            // If the question has an ID, update the existing question
            if (questionId) {
                const existingQuestionIndex = updatedQuestions.findIndex(q => q._id.toString() === questionId);
                if (existingQuestionIndex !== -1) {
                    updatedQuestions[existingQuestionIndex] = { ...updatedQuestions[existingQuestionIndex], ...question };
                }
            } else {
                // Otherwise, it's a new question
                updatedQuestions.push(question);
            }

            questionIndex++;
        }

        // Handle deletion of questions
        if (deletedQuestionIds) {
            const idsToDelete = deletedQuestionIds.split(',');  // Convert string into array of IDs
            updatedQuestions = updatedQuestions.filter(q => !idsToDelete.includes(q._id.toString()));
        }

        // Update the Formulario with the new title and questions
        formulario.titulo = titulo;
        formulario.questions = updatedQuestions;

        // Save the updated Formulario
        await formulario.save();

        // Redirect to the formularios list after updating
        res.redirect('/formularios');
    } catch (error) {
        console.error('Error updating formulario:', error);
        res.status(500).send('Internal Server Error');
    }
})


module.exports = router

