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
const  roleAuthorization = require('../middleware/roleAuth')

//GET route --> All evaluadores
router.get('/evaluadores', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        const evaluadores = await Evaluador.find({ estaActivo: true })
    res.render('evalrs/evaluadores', { evaluadores, user: req.user })
    } else {
        res.redirect('/')
    }
})

// GET route --> Evaluador Especifico
router.get('/evaluadores/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        try {
            const id = req.params.id
            const evaluador = await Evaluador.findById(id)
            const evaluaciones = await Evaluaciones.find({ empleado: evaluador._id})
            const evaluacionesCreadas = await Evaluaciones.find({ assignedBy: evaluador._id, completed: false})
            const evaluacionesCreadasyResueltas = await Evaluaciones.find({ assignedBy: evaluador._id, completed: true})
            const evaluacionesAsignadas = evaluaciones.filter(evaluacion => !evaluacion.completed)
            const evaluacionesCompletadas = evaluaciones.filter(evaluacion => evaluacion.completed)
            if (!evaluador) {
                return res.status(404).send('Evaluador no encontrado')
            }
            res.render('evalrs/evaluador', { evaluador, evaluaciones, evaluacionesAsignadas, evaluacionesCompletadas, evaluacionesCreadas, evaluacionesCreadasyResueltas, user: req.user })
        } catch (error) {
            console.error(error)
            res.status(500).send('Error del servidor')
        }
    } else {
        res.redirect('/')
    }  
})

router.post('/evaluadores/eliminar/:id', roleAuthorization(['Administrador']), async (req, res) => {
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