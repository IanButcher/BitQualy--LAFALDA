// Modulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')


//GET route --> All evaluadores
router.get('/empleados', async (req, res) => {
    const empleados = await Empleado.find({ estaActivo: true })
    res.render('empls/empleados', { empleados })
})

// GET route --> Evaluador Especifico
router.get('/empleados/:id', async (req, res) => {
    try {
        const id = req.params.id
        const empleado = await Empleado.findById(id)
        if (!empleado) {
            return res.status(404).send('Evaluador no encontrado')
        }
        res.render('empls/empleado', { empleado })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error del servidor')
    }
})

router.post('/empleados/eliminar/:id', async (req, res) => {
    const empleadoId = req.params.id  // Use req.params to get the ID

    if (!mongoose.isValidObjectId(empleadoId)) {
        return res.status(400).send('ID inválido')
    }

    try {
        const result = await Empleado.findByIdAndUpdate(empleadoId, { estaActivo: false });
        if (result) {
            res.redirect('/empleados')
        } else {
            res.status(404).send('Empleado no encontrado')
        }
    } catch (error) {
        console.error('Error desactivando empleado:', error)
        res.status(500).send('Error en el servidor')
    }
})

module.exports = router