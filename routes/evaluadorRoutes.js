// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const mongoose = require('mongoose')
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const roleAuthorization = require('../middleware/roleAuth')

//GET route --> All evaluadores
router.get('/evaluadores', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        const evaluadores = await Evaluador.find({ estaActivo: true })
        res.render('evalrs/evaluadores', { evaluadores, user: req.user })
    } else {
        res.redirect('/')
    }
})
router.get('/evaluadores/buscar', roleAuthorization(['Administrador', 'Intermediario']), async(req, res) => {
        const { nombre } = req.query;

        try {
            const evaluador = await Evaluador.find({
                nombre: { $regex: `^${nombre}`, $options: 'i' }, // Search for names that start with the input
                estaActivo: true
            });

            // Render the search results in the 'Evaluador ' view (assuming you use the same view)
            res.render('evalrs/evaluadores', { evaluador, user: req.user })
        } catch (error) {
            console.error('Error al buscar evaluador :', error)
            res.status(500).json({ error: 'Error en el servidor' })
        }
    })
    // GET route --> Evaluador Especifico
router.get('/evaluadores/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        try {
            const id = req.params.id
            const evaluador = await Evaluador.findById(id)
            if (!evaluador) {
                return res.status(404).send('Evaluador no encontrado')
            }
            res.render('evalrs/evaluador', { evaluador, user: req.user })
        } catch (error) {
            console.error(error)
            res.status(500).send('Error del servidor')
        }
    } else {
        res.redirect('/')
    }
})

router.post('/evaluadores/eliminar/:id', roleAuthorization(['Administrador']), async(req, res) => {
    const evaluadoresId = req.params.id // Use req.params to get the ID
    if (!mongoose.isValidObjectId(evaluadoresId)) {
        return res.status(400).send('ID inválido')
    }
    try {
        const result = await Evaluador.findByIdAndUpdate(evaluadoresId, { estaActivo: false });
        if (result) {
            res.redirect('/evaluadores')
        } else {
            res.status(404).send('Evaluador no encontrado')
        }
    } catch (error) {
        console.error('Error desactivando Evaluador:', error)
        res.status(500).send('Error en el servidor')
    }
})



module.exports = router