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

// GET route --> Log In Page
router.get('/', (req, res) => {
    res.render('index')
})

// GET route --> User Creator
router.get('/user-creator', (req, res) => {
    res.render('newUsers')
})

// POST route --> Create User
router.post('/save-new-user', async (req, res) => {
    const { nombre, apellido, legajo, rol, password } = req.body;
    try {
        // Check legajo
        const legajoChecker = await baseUserSchema.findOne({ legajo })
        if (legajoChecker){
            res.send('El legajo ya esta en uso, clickee en la flechita para volver atras y recuperar los datos ingresados')
        }
        else {
            // Basado en el rol
            let newUser;
            switch (rol) {
                case 'empleado':
                    newUser = new Empleado({ nombre, apellido, legajo, password })
                    break;
                case 'evaluador':
                    newUser = new Evaluador({ nombre, apellido, legajo, password })
                    break;
                case 'regulador':
                    newUser = new Regulador({ nombre, apellido, legajo, password })
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid role selected' })
            }
            
            // Save usuario
            await newUser.save()
            console.log(newUser)
            res.redirect('/home-admin')
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error creating user' })
    }
});

module.exports = router;


