// Modulos
const express = require('express')
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Regulador = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')


//GET route --> All evaluadores
router.get('/empleados', async (req, res) => {
    const empleados = await baseUserSchema.find({ rol: 'Empleado' })
    res.render('empls/empleados', { empleados })
})

// GET route --> Evaluador Especifico
router.get('/empleados/:id', async (req,res)=>{
    const id = req.params.id
    const empleado = baseUserSchema.findById(id)
    res.render('empls/empleado', { empleado })
})