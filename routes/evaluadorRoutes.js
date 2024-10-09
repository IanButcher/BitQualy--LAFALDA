// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const mongoose = require('mongoose')
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
//const { initializePassportSession } = require('./middleware/passportConfig')
//const { roleAuthorization } = require('../middleware/roleAuth')


//GET route --> All evaluadores
router.get('/evaluadores', async (req, res) => {
    const evaluadores = await Evaluador.find({ estaActivo: true })
    res.render('evalrs/evaluadores', { evaluadores })
})

// GET route --> Evaluador Especifico
router.get('/evaluadores/:id', async (req, res) => {
    try {
        const id = req.params.id
        const evaluador = await Evaluador.findById(id)
        if (!evaluador) {
            return res.status(404).send('Evaluador no encontrado')
        }
        res.render('evalrs/evaluador', { evaluador })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error del servidor')
    }
})

router.post('/evaluadores/eliminar/:id', async (req, res) => {
    const evaluadoresId = req.params.id  // Use req.params to get the ID

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