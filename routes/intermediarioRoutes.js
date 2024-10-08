// Modulos
const express = require('express')
const app = express()
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
    res.render('regs/reguladores', { intermediarios })
})

// GET route --> Evaluador Especifico
router.get('/reguladores/:id', async (req,res)=>{
    const id = req.params.id
    const intermediario = baseUserSchema.findById(id)
    res.render('regs/regulador', { intermediario })
})

module.exports = router