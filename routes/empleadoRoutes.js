// Modulos
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const router = express.Router()
const Evaluaciones = require('../Schemas/evaluacionSchema')
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const roleAuthorization = require('../middleware/roleAuth')


app.use(roleAuthorization)

//GET route --> All evaluadores
router.get('/empleados', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        const empleados = await Empleado.find({ estaActivo: true })
        res.render('empls/empleados', { empleados, user: req.user })  
    } else {
        res.redirect('/');
    }
})

// GET route --> Evaluador Especifico
router.get('/empleados/:id', roleAuthorization(['Administrador', 'Evaluador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        try {
            const id = req.params.id
            const empleado = await Empleado.findById(id)
            if (!empleado) {
                return res.status(404).send('Evaluador no encontrado')
            }
            res.render('empls/empleado', { empleado, user: req.user })
        } catch (error) {
            console.error(error)
            res.status(500).send('Error del servidor')
        }
    } else {
        res.redirect('/');
    } 
})

router.post('/empleados/eliminar/:id', roleAuthorization(['Administrador']), async (req, res) => {
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

router.get('/empleados/evaluaciones/:id', async (req, res) =>{
    const empleadoId = req.params.id //juan esta abrazando a un caiman
                                             
    try{
        const empleado = await Empleado.findById(empleadoId)
       
        if (!empleado) {
        return res.status(404).send("Empleado no encontrado")
        
        }   
        const evaluaciones = await Evaluaciones.find({ empleado: empleadoId })
                                               .populate('formulario')

        console.log('Empleado:', empleado);
        console.log('Evaluaciones:', evaluaciones);

        res.render('empls/evaluaciones',{
            empleado: empleado,
            evaluaciones: evaluaciones
        })
    }
    catch (err) {
        console.error(err)
        res.status(500).send("Error obteniendo las evaluaciones");
    }
})

module.exports = router