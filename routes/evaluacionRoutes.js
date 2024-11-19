// Modulos
const PDFDocument = require('pdfkit')
const express = require('express')
const app = express()
const router = express.Router()
const Formulario = require('../Schemas/formularioSchema')
const Evaluacion = require('../Schemas/evaluacionSchema')
const {Comentario} = require('../Schemas/comentarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const mongoose = require('mongoose')
const roleAuthorization = require('../middleware/roleAuth')
const nodemailer = require('nodemailer')
const moment = require('moment')
const path = require('path')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// GET route --> Todas las evaluaciones
router.get('/evaluaciones', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario', 'Empleado']), async(req, res) => {
    if (req.user) {
        try {
            let query = {}

            const evaluaciones = await Evaluacion.find(query)
                .populate('formulario')
                .populate('empleado')
                .populate('assignedBy')

            // Calculate completed and incomplete totals
            const totalCompletas = evaluaciones.filter(e => e.completed).length
            const totalIncompletas = evaluaciones.filter(e => !e.completed && e.formulario.tipo === 'autoevaluacion').length

            res.render('evals/evaluaciones', { evaluaciones, user: req.user, totalCompletas, totalIncompletas });
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
router.post('/evaluaciones/assign-autoevaluacion', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
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
router.post('/evaluaciones/assign-autoevaluacion-to-all', roleAuthorization(['Administrador', 'Evaluador']), async(req, res) => {
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
        await baseUserSchema.updateMany({ _id: { $in: activeUsers.map(u => u._id) } }, { $push: { evaluacionesAsignadas: { $each: evaluationIds } } });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bitqualypassmanager@gmail.com',
                pass: 'yoif nkxt bqkl zsrf'
            }
        })

        for (let user of activeUsers) {
            const mailOptions = {
                from: 'bitqualypassmanager@gmail.com',
                to: user.email,
                subject: '¡Te han asignado una evaluación!',
                text: `Hola ${user.nombre},\n\n¡Te han asignado una nueva evaluación que debes realizar!\n\nTienes hasta ${localDeadline} para completarla.\n`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(`Error sending email to ${user.email}:`, error)
                } else {
                    console.log(`Correo enviado a ${user.email}:`, info.response)
                }
            })
        }

        res.status(200).send('Autoevaluacion asignada a todos los usuarios activos')
    } catch (error) {
        console.error('Error assigning autoevaluacion to all:', error)
        res.status(200).send('Error al asignar autoevaluacion a todos')
    }
})

// GET route --> Ver autoevaluacion
router.get('/evaluaciones/my-autoevaluacion/:id', roleAuthorization(['Empleado', 'Administrador', 'Intermediario', 'Evaluador']), async(req, res) => {
    try {
        const { id } = req.params
        const evaluacion = await Evaluacion.findById(id).populate('formulario').populate('empleado').populate('assignedBy')

        if (!evaluacion) {
            return res.redirect('/evaluaciones')
        }

        // Restrict access to only the assigned empleado or authorized roles
        if (evaluacion.empleado._id.toString() !== req.user._id.toString() && req.user.rol === 'Empleado') {
            return res.status(403).send('No autorizado para responder esta evaluación.')
        }

        if (evaluacion.completed) {
            return res.redirect('/evaluaciones')
        }

        const now = new Date();
        if (evaluacion.deadline && evaluacion.deadline < now) {
            return res.redirect('/evaluaciones')
        }

        res.render('evals/awnser', {
            evaluacion,
            formulario: evaluacion.formulario,
            user: req.user,
            empleado: evaluacion.empleado ? evaluacion.empleado.nombre : 'Empleado no asignado'
        });
    } catch (error) {
        console.error('Error fetching evaluation:', error)
        res.redirect('/evaluaciones')
    }
})


// POST route --> Create & redirect
router.post('/evaluaciones/create-evaluacion', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
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
})

// GET route --> Display form to answer an evaluacion
router.get('/evaluaciones/answer/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    try {
        const { id } = req.params

        const evaluacion = await Evaluacion.findById(id).populate('formulario').populate('empleado').populate('assignedBy')

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

// POST route --> Enviar evaluación
router.post('/evaluaciones/save-evaluacion', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario', 'Empleado']), async (req, res) => {
    try {
        const { formulario: formularioId, empleado, respuestas, tipo, deadline } = req.body
        const formattedDeadline = deadline ? moment(deadline, 'YYYY-MM-DD', true).endOf('day').toDate() : new Date()

        const formulario = await Formulario.findById(formularioId).populate('questions')
        if (!formulario) {
            return res.status(404).send('Formulario no encontrado')
        }

        let totalScore = 0

        // Process each question
        const respuestasFormateadas = formulario.questions.map((question, index) => {
            const respuesta = respuestas[index] // Each answer for the current question
            let questionScore = 0

            if (question.tipo === 'multiple') {
                // Process multiple-choice question
                const selectedOption = question.options.find(opt => opt.text === respuesta)
                if (selectedOption) {
                    questionScore = selectedOption.score
                }
            } else if (question.tipo === 'checkbox') {
                // Process checkbox question
                const selectedOptions = Array.isArray(respuesta) ? respuesta : [respuesta] // Ensure it's an array
                selectedOptions.forEach(selectedOptionText => {
                    const option = question.options.find(opt => opt.text === selectedOptionText)
                    if (option) {
                        questionScore += option.score // Add up scores for each checked option
                    }
                })
            } else if (question.tipo === 'texto') {
                // Handle text or numeric input (if applicable)
                const numericAnswer = parseFloat(respuesta)
                if (!isNaN(numericAnswer)) {
                    questionScore = numericAnswer
                }
            }

            // Apply the question's percentage to its score
            totalScore += (questionScore * question.porcentaje) / 100

            // Format the response for storage
            return Array.isArray(respuesta) ? respuesta.join(', ') : respuesta.toString()
        })

        // Save the evaluation
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
            evaluacion.score = totalScore
            await evaluacion.save()

            await baseUserSchema.findByIdAndUpdate(empleado, {
                $addToSet: { completedEvaluations: evaluacion._id }
            })
        } else if (formulario.tipo === 'evaluacion') {
            const nuevaEvaluacion = new Evaluacion({
                formulario: formulario._id,
                empleado: empleado,
                assignedBy: req.user._id,
                respuestas: respuestasFormateadas,
                deadline: formattedDeadline,
                completed: true,
                score: totalScore
            })
            await nuevaEvaluacion.save()

            await baseUserSchema.findByIdAndUpdate(req.user._id, {
                $addToSet: { evaluacionesHechas: nuevaEvaluacion._id }
            })
        }

        res.redirect('/evaluaciones')
    } catch (error) {
        console.error('Error guardando la evaluación:', error)
        res.redirect('/evaluaciones')
    }
})


// GET route --> Preview evaluacion
router.get('/evaluaciones/preview/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        try {
            const { id } = req.params

            const evaluacion = await Evaluacion.findById(id)
                .populate({
                    path: 'formulario',
                    populate: { path: 'questions' }
                })
                .populate('empleado')
                .populate('assignedBy')

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

        const comentario = {
            intermediario: { _id: req.user._id, nombre: req.user.nombre },
            texto: texto.trim()
        }

        // Validate comentario against schema
        const validationError = new Comentario(comentario).validateSync()
        if (validationError) {
            console.error('Comentario validation error:', validationError)
            return res.redirect('')
        }

        // Add comment
        evaluacion.comentarios.push(comentario)

        await evaluacion.save()
        res.redirect(`/evaluaciones/preview/${id}`)
    } catch (error) {
        console.error('Error adding comment:', error)
        res.redirect(`/evaluaciones/preview/${id}`)
    }
})

router.get('/evaluaciones/:id/pdf', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
            try {
                const { id } = req.params;

                // Retrieve the evaluation and populate related data
                const evaluacion = await Evaluacion.findById(id)
                    .populate({
                        path: 'formulario',
                        populate: { path: 'questions' }
                    })
                    .populate('empleado')
                    .populate('assignedBy');

                if (!evaluacion) {
                    return res.status(404).send('Evaluación no encontrada');
                }

                // Initialize PDF document
                const doc = new PDFDocument({ margin: 40 });

                res.setHeader('Content-Disposition', `attachment; filename=evaluation_${id}.pdf`);
                res.setHeader('Content-Type', 'application/pdf');

                doc.pipe(res);

                const textStartX = 20;
                const logoWidth = 100;
                doc.image('./public/img/Logo-Bitsion.jpeg', doc.page.width - logoWidth - 20, 20, { width: logoWidth });

                doc.fontSize(18).text('Evaluación Detallada', 20, 20, { align: 'left' }).moveDown();

                doc.fontSize(12)
                    .text(`Código Evaluación: ${id}`, 20)
                    .text(`Estado: ${evaluacion.completed ? 'Finalizada' : 'Pendiente'}`, 20)
                    .text(`Fecha impresión: ${new Date().toLocaleDateString()}`, 20)
                    .moveDown();

                doc.fontSize(14)
                    .text(`Formulario: ${evaluacion.formulario.titulo || 'N/A'}`)
                    .text(`Empleado: ${evaluacion.empleado ? `${evaluacion.empleado.nombre} ${evaluacion.empleado.apellido} legajo: ${evaluacion.empleado.legajo}` : 'N/A'}`)
    .text(`Asignado por: ${evaluacion.assignedBy ? `${evaluacion.assignedBy.nombre} ${evaluacion.assignedBy.apellido} legajo: ${evaluacion.assignedBy.legajo}` : 'N/A'}`)
    .text(`Fecha límite: ${evaluacion.deadline ? evaluacion.deadline.toDateString() : 'Sin fecha'}`)
    .moveDown();

if (evaluacion.comentarios && evaluacion.comentarios.length > 0) {
    doc.fontSize(14).text('Comentarios:', { underline: true }).moveDown();
    evaluacion.comentarios.forEach((comentario, index) => {
        const { intermediario, texto } = comentario;
        const commenterName = intermediario.nombre ? `${intermediario.nombre} ${intermediario.apellido || ''}` : 'Anónimo';
        doc.fontSize(12).text(`Comentario ${index + 1} por ${commenterName}:`);
        doc.fontSize(10).text(texto, { width: 500, align: 'justify' }).moveDown();
    });
}
doc.moveDown();

const tableTop = doc.y;
const rowPadding = 5;
const cellPaddingTop = 3;  // Top padding for rows
const columnWidths = { title: 90, description: 180, answer: 150, percentage: 40 };
const columnPositions = {
    title: 50,
    description: 150,
    answer: 350,
    percentage: 500
};

// Function to draw the table header
const drawTableHeader = (y) => {
    doc.fontSize(12)
       .text('Competencia', columnPositions.title, y)
       .text('Descripción', columnPositions.description, y)
       .text('Respuesta', columnPositions.answer, y)
       .text('Pond.', columnPositions.percentage, y);
    doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
};

// Draw the initial header
drawTableHeader(tableTop);

// Function to calculate dynamic row height based on the longest cell content
const getMaxRowHeight = (texts, widths) => {
    return texts.reduce((maxHeight, text, index) => {
        const cellHeight = doc.fontSize(10).heightOfString(text, { width: widths[index] });
        return Math.max(maxHeight, cellHeight + rowPadding * 2);
    }, rowPadding * 2);
};

// Table Rows with Page Break Check and Top Padding
evaluacion.formulario.questions.forEach((question, index) => {
    const respuesta = evaluacion.respuestas[index] || 'N/A';
    const rowHeight = getMaxRowHeight(
        [question.titulo || 'Sin título', question.descripcion || 'Sin descripción', respuesta, `${question.porcentaje || 0}%`],
        [columnWidths.title, columnWidths.description, columnWidths.answer, columnWidths.percentage]
    );

    // Check if there's enough space for the row; if not, add a page
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        // Redraw the table header at the top of the new page
        drawTableHeader(doc.y);
        doc.moveDown();
    }

    // Get current Y position for the row with top padding
    const rowY = doc.y + cellPaddingTop;

    // Draw each cell with the calculated row height
    doc.fontSize(10)
        .text(question.titulo || 'Sin título', columnPositions.title, rowY, { width: columnWidths.title, align: 'justify' })
        .text(question.descripcion || 'Sin descripción', columnPositions.description, rowY, { width: columnWidths.description, align: 'justify' })
        .text(respuesta, columnPositions.answer, rowY, { width: columnWidths.answer, align: 'justify' })
        .text(`${question.porcentaje || 0}%`, columnPositions.percentage, rowY, { width: columnWidths.percentage, align: 'center' });

    // Draw a horizontal line below the row
    doc.moveTo(50, rowY + rowHeight - cellPaddingTop).lineTo(550, rowY + rowHeight - cellPaddingTop).stroke();

    // Move down to the next row starting position
    doc.y = rowY + rowHeight - cellPaddingTop;
});

doc.moveDown();
doc.fontSize(14).text(`Puntuación Total: ${evaluacion.score}`, textStartX);
doc.end()
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error interno del servidor');
    }
})

module.exports = router