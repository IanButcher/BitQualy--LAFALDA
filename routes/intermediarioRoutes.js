// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
//const { initializePassportSession } = require('./middleware/passportConfig')
//const { roleAuthorization } = require('../middleware/roleAuth')


//GET route --> All evaluadores
router.get('/reguladores', async (req, res) => {
    const intermediarios = await Intermediario.find({ estaActivo: true })
    res.render('regs/reguladores', { intermediarios })
})

// GET route --> Evaluador Especifico
router.get('/reguladores/:id', async (req, res) => {
    try {
        const id = req.params.id
        const intermediario = await Intermediario.findById(id)
        if (!intermediario) {
            return res.status(404).send('Intermediario no encontrado')
        }
        res.render('regs/regulador', { intermediario })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error del servidor')
    }
})


module.exports = router