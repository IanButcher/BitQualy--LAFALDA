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
const methodOverride = require('method-override')

app.use(methodOverride('_method'))
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

// PUT route --> Actualizar cualquier atributo del empleado, incluyendo el rol
router.put('/empleados/actualizar/:id', roleAuthorization(['Administrador', 'Empleado', 'Evaluador', 'Intermediario']), async (req, res) => {
    if (req.user) {
        try {
            const id = req.params.id;
            const { rol } = req.body;  // Recibes el nuevo rol del cuerpo de la solicitud

            console.log('Rol enviado: desde empleado', req.body.rol);
            // Verificar si el nuevo rol es válido (opcional, pero recomendable)
            const rolesPermitidos = ['Evaluador', 'Intermediario', 'Empleado'];
            if (rol && !rolesPermitidos.includes(rol)) {
                return res.status(400).send('Rol no válido');
            }

            // Buscar y actualizar el empleado por su ID
            const empleado = await Empleado.findById(id);
            if (!empleado) {
                return res.status(404).send('Empleado no encontrado');
            }

            // Actualizar el rol del empleado, si fue provisto
            if (rol) {
                empleado.rol = rol;
            }

            // Guardar los cambios en la base de datos
            await empleado.save();
            res.redirect(`/empleados/${id}`);  // Redirigir a la vista del empleado

        } catch (error) {
            console.error(error);
            res.status(500).send('Error del servidor');
        }
    } else {
        res.redirect('/');
    }
});


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

module.exports = router