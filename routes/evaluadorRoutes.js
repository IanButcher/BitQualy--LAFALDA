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
router.get('/evaluadores', async (req, res) => {
    const evaluadores = await baseUserSchema.find({ rol: 'Evaluador' })
    res.render('evalrs/evaluadores', { evaluadores })
})

// GET route --> Evaluador Especifico
router.get('/evaluadores/:id', async (req,res)=>{
    const id = req.params.id
    const evaluador = baseUserSchema.findById(id)
    res.render('evalrs/evaluador', { evaluador })
})