// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')


//GET route --> All evaluadores
router.get('/empleados', async (req, res) => {
    const empleados = await baseUserSchema.find({ rol: 'Empleado' })
    res.render('empls/empleados', { empleados })
})

// GET route --> Evaluador Especifico
router.get('/empleados/:id', async (req, res) => {
    try {
        const id = req.params.id
        const empleado = await Empleado.findById(id)
        if (!evaluador) {
            return res.status(404).send('Evaluador no encontrado')
        }
        res.render('empls/empleado', { empleado })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error del servidor')
    }
})

module.exports = router