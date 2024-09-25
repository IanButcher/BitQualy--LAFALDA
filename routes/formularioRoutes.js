// Modulos
const express = require('express')
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const mongoose = require('mongoose')

// GET route --> Display all Formularios
router.get('/formularios', async (req, res) => {
    try {
        const formularios = await Formulario.find()
        res.render('forms/formularios', { formularios })
        console.log(formularios)
    } catch (error) {
        console.error('Error fetching formularios:', error)
        res.status(500).send('Internal Server Error')
    }
})

// GET route --> Show form to create a new Formulario
router.get('/formularios/new', (req, res) => {
    res.render('forms/new');  
})

// POST route --> save/insert Formulario
router.post('/formularios/save-form', async (req, res) => {
    try {
        // Extract the form title
        const { 'form-title': titulo, ...formData } = req.body;

        // Process the questions from the form data
        const questions = [];

        let questionIndex = 1;
        while (formData[`question${questionIndex}`]) {
            const question = {
                titulo: formData[`question${questionIndex}`],  // Question title (preguntaSchema.titulo)
                descripcion: formData[`description${questionIndex}`],  // Question description (preguntaSchema.descripcion)
                porcentaje: formData[`percentage${questionIndex}`],  // Question percentage (preguntaSchema.porcentaje)
                tipo: formData[`type${questionIndex}`],  // Question type (preguntaSchema.tipo)
                options: []
            };

            // If the question type is 'multiple' or 'checkbox', extract the options
            if (question.tipo === 'multiple' || question.tipo === 'checkbox') {
                let optionIndex = 1;
                while (formData[`option${questionIndex}_${optionIndex}`]) {
                    question.options.push(formData[`option${questionIndex}_${optionIndex}`]);
                    optionIndex++;
                }
            }

            questions.push(question);
            questionIndex++;
        }

        // Create a new Formulario instance
        const newFormulario = new Formulario({
            titulo,  // Form title (formularioSchema.titulo)
            questions  // Array of questions
        });

        // Save the Formulario to the database
        await newFormulario.save();

        // Redirect to the formularios list after saving
        res.redirect('/formularios');
    } catch (error) {
        console.error('Error saving formulario:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

