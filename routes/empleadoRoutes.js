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

const upload = multer({ storage: storage })

//GET route --> All evaluadores
router.get('/empleados', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        const empleados = await Empleado.find({ estaActivo: true })
        res.render('empls/empleados', { empleados, user: req.user })
    } else {
        res.redirect('/');
    }
})

// GET route --> Evaluador Especifico
router.get('/empleados/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async(req, res) => {
    if (req.user) {
        try {
            const id = req.params.id
            const empleado = await Empleado.findById(id)
            const evaluaciones = await Evaluaciones.find({ empleado: empleado._id})
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

router.post('/empleados/eliminar/:id', roleAuthorization(['Administrador']), async(req, res) => {
    const empleadoId = req.params.id
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