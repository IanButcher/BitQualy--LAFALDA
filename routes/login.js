// Modulos
const express = require('express')
const app = express()
const router = express.Router()
const Empleado = require('../Schemas/empleadoSchema')
const Evaluador = require('../Schemas/evaluadorSchema')
const Regulador = require('../Schemas/intermediarioSchema')
const baseUserSchema = require('../Schemas/baseUserSchema')
const Administrador = require('../Schemas/adminSchema')
const { initializePassportSession, passport } = require('../middleware/passportConfig')
const roleAuthorization = require('../middleware/roleAuth')

// GET route --> Log In Page
router.get('/', (req, res) => {
    res.render('index')
})

// GET route --> User Creator
router.get('/user-creator', roleAuthorization(['Administrador']), (req, res) => {
    res.render('newUsers')
})

// POST route --> Create User
router.post('/save-new-user', roleAuthorization(['Administrador']), async (req, res) => {
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
                case 'administrador':
                    newUser = new Administrador({ nombre, apellido, legajo, password })
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
})

// POST route --> Log In
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err)
            return next(err)
        }
        if (!user) {
            console.log('Login failed. User not found or invalid credentials.')
            req.flash('error_msg', 'Invalid legajo or password.')
            return res.redirect('/')
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err)
                return next(err)
            }
            console.log('Login successful:', user)
            return res.redirect('/home')
        })
    })(req, res, next)
})

//GET route --> log out & destroy session
router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.logout(function(err) {
            if (err) {
                return next(err)
            }
            req.session.destroy(() => {
                res.redirect('/')
            })
        })
    } else {
        res.redirect('/')
    }
});


module.exports = router


