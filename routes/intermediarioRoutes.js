// Modulos
const express = require('express')
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Regulador = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
//const { initializePassportSession } = require('./middleware/passportConfig')
//const { roleAuthorization } = require('../middleware/roleAuth')


//GET route --> All evaluadores
router.get('/reguladores', async (req, res) => {
    const intermediarios = await baseUserSchema.find({ rol: 'Intermediario' })
    res.render('empls/empleados', { intermediarios })
})

// GET route --> Evaluador Especifico
router.get('/reguladores/:id', async (req,res)=>{
    const id = req.params.id
    const intermediario = baseUserSchema.findById(id)
    res.render('empls/empleado', { intermediario })
})