// Modulos
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Intermediario = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const roleAuthorization = require('../middleware/roleAuth')
/*const methodOverride = require('method-override')

app.use(methodOverride('_method'))*/
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
                return res.status(404).send('Empleado no encontrado')
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

// POST route --> Actualizar cualquier atributo del empleado, incluyendo el rol
router.post('/empleados/actualizar/:id', roleAuthorization(['Administrador']), async (req, res) => {
    if (req.user) {
        try {
            const id = req.params.id
            const { rol } = req.body

            // Validate role (optional)
            const rolesPermitidos = ['empleado', 'evaluador', 'intermediario']
            if (rol && !rolesPermitidos.includes(rol)) {
                return res.status(400).send('Rol no válido')
            }

            // Find and update employee
            const empleado = await baseUserSchema.findById(id)
            if (!empleado) {
                return res.status(404).send('Empleado no encontrado')
            }

            empleado.rol = rol
            await empleado.save()

            res.redirect(`/empleados/${id}`)
        } catch (error) {
            console.error('Error al actualizar rol:', error)
            res.status(500).send('Error del servidor')
        }
    } else {
        res.redirect('/')
    }
})



router.post('/empleados/eliminar/:id', roleAuthorization(['Administrador']), async (req, res) => {    
    const empleadoId = req.params.id  
    if (!mongoose.isValidObjectId(empleadoId)) {
        return res.status(400).send('ID inválido')
    }
    
    try {
        const result = await Empleado.findByIdAndUpdate(empleadoId, { estaActivo: false });
        console.log("Desde empleadoRoutes.js 2");
        if (result) {
            res.redirect('/empleados')
            console.log("Desde empleadoRoutes.js 3");
        } else {
            res.status(404).send('Empleado no encontrado')
        }
    } catch (error) {
        console.error('Error desactivando empleado:', error)
        res.status(500).send('Error en el servidor')
    }
})

module.exports = router