// Modules
const express = require('express');
const router = express.Router();
const Formulario = require('../Schemas/formularioSchema'); // Import the Formulario model

// POST route --> save/insert Formulario
router.post('/save-form', async (req, res) => {
    try {
        // Obtener data del request
        const { 'form-title': title, ...formData } = req.body;

        // Procesar las preguntas
        const questions = [];

        // Extraer las preguntas del form
        let questionIndex = 1;
        while (formData[`question${questionIndex}`]) {
            const question = {
                questionText: formData[`question${questionIndex}`],
                description: formData[`description${questionIndex}`],
                percentage: formData[`percentage${questionIndex}`],
                type: formData[`type${questionIndex}`],
                options: []  // En caso de ser checkbox o multiple, va a holdear las opciones
            };

            // Extraer opciones
            if (question.type === 'multiple' || question.type === 'checkbox') {
                let optionIndex = 1;
                while (formData[`option${questionIndex}_${optionIndex}`]) {
                    question.options.push(formData[`option${questionIndex}_${optionIndex}`]);
                    optionIndex++;
                }
            }

            questions.push(question);
            questionIndex++;
        }

        // Crear una instancia de Formulario
        const newFormulario = new Formulario({
            title,
            questions
        });

        // SAVE
        await newFormulario.save();

        // Redirect 
        res.redirect('/formularios'); 
    } catch (error) {
        console.error('Error saving formulario:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
