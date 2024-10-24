// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const mongoose = require('mongoose')
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const Evaluaciones = require('../Schemas/evaluacionSchema')
const roleAuthorization = require('../middleware/roleAuth')


//GET route --> All evaluadores
router.get('/reguladores', roleAuthorization(['Administrador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        const intermediarios = await Intermediario.find({ estaActivo: true })
        res.render('regs/reguladores', { intermediarios, user: req.user })
    } else {
        res.redirect('/');
    }
})

// GET route --> Evaluador Especifico
router.get('/reguladores/:id', roleAuthorization(['Administrador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        try {
            const id = req.params.id
            const intermediario = await Intermediario.findById(id)
            const evaluaciones = await Evaluaciones.find({ empleado: intermediario._id})
            const evaluacionesCreadas = await Evaluaciones.find({ assignedBy: intermediario._id, completed: false})
            const evaluacionesCreadasyResueltas = await Evaluaciones.find({ assignedBy: intermediario._id, completed: true})
            const evaluacionesAsignadas = evaluaciones.filter(evaluacion => !evaluacion.completed)
            const evaluacionesCompletadas = evaluaciones.filter(evaluacion => evaluacion.completed)
            if (!intermediario) {
                return res.status(404).send('Intermediario no encontrado')
            }
            res.render('regs/regulador', { intermediario, evaluaciones, evaluacionesCreadas, evaluacionesCreadasyResueltas, evaluacionesAsignadas, evaluacionesCompletadas, user: req.user })
        } catch (error) {
            console.error(error)
            res.status(500).send('Error del servidor')
        }
    } else {
        res.redirect('/');
    }
    
})

router.post('/reguladores/eliminar/:id', roleAuthorization(['Administrador']), async (req, res) => {
    const reguladoresId = req.params.id  // Use req.params to get the ID
    if (!mongoose.isValidObjectId(reguladoresId)) {
        return res.status(400).send('ID inválido')
    }

    try {
        const result = await Intermediario.findByIdAndUpdate(reguladoresId, { estaActivo: false });
        if (result) {
            res.redirect('/reguladores')
        } else {
            res.status(404).send('regulador no encontrado')
        }
    } catch (error) {
        console.error('Error desactivando regulador:', error)
        res.status(500).send('Error en el servidor')
    }
})


module.exports = router