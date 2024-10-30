// Modulos
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const Evaluaciones = require('../Schemas/evaluacionSchema')
const roleAuthorization = require('../middleware/roleAuth')

app.use(roleAuthorization)


//GET route --> All empleados
router.get('/empleados', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        const empleados = await Empleado.find({ estaActivo: true })
        res.render('empls/empleados', { empleados, user: req.user })
    } else {
        res.redirect('/')
    }
})

// GET route --> query
router.get('/empleados/buscar', async (req, res) => {
    const { query } = req.query
    try {
        const empleados = await Empleado.find({
            estaActivo: true,
            $or: [
                { nombre: { $regex: query, $options: 'i' } },
                { apellido: { $regex: query, $options: 'i' } }
            ]
        })
        res.render('empls/empleados', { empleados, user: req.user, query })
    } catch (error) {
        console.error("Error al buscar empleados:", error)
        res.redirect('/empleados')
    }
})

// GET route --> Empleado Especifico
router.get('/empleados/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        try {
            const id = req.params.id
            const empleado = await Empleado.findById(id)
            const evaluaciones = await Evaluaciones.find({ empleado: empleado._id })
            const evaluacionesAsignadas = evaluaciones.filter(evaluacion => !evaluacion.completed)
            const evaluacionesCompletadas = evaluaciones.filter(evaluacion => evaluacion.completed)
            if (!empleado) {
                return res.status(404).send('Evaluador no encontrado')
            }
            res.render('empls/empleado', { empleado, evaluaciones, evaluacionesAsignadas, evaluacionesCompletadas, user: req.user })
        } catch (error) {
            console.error(error)
            res.status(500).send('Error del servidor')
        }
    } else {
        res.redirect('/');
    }
})

// POST route --> delete
router.post('/empleados/eliminar/:id', roleAuthorization(['Administrador']), async(req, res) => {
    const empleadoId = req.params.id
    if (!mongoose.isValidObjectId(empleadoId)) {
        return res.status(400).send('ID inválido')
    }

    try {
        const result = await Empleado.findByIdAndUpdate(empleadoId, { estaActivo: false, endline: Date.now() })
        if (result) {
            res.redirect('/empleados')
        } else {
            res.status(404).send('Empleado no encontrado')
        }
    } catch (error) {
        console.error('Error desactivando empleado:', error)
        res.redirect(`/empleados/${empleadoId}`)
    }
})

module.exports = router