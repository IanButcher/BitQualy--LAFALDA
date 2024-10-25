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
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const upload = require('../middleware/multerConfig')

// GET route --> Log In Page
router.get('/', (req, res) => {
    res.render('index')
})
 
// GET route --> User Creator
router.get('/user-creator', roleAuthorization(['Administrador']), (req, res) => {
    if (req.user) {
        try {
            res.render('newUsers', { user: req.user })
        } catch (error){
            console.error(error)
            res.status(500).send('Error del servidor')
        }
    } else {
        res.redirect('/')
    }
})

// POST route --> Create User
router.post('/save-new-user', upload.single('image'), roleAuthorization(['Administrador']), async(req, res) => {
    const { nombre, apellido, legajo, rol, email } = req.body
    const imagePath = req.file ? req.file.path : null
    try {
        // Check legajo
        const legajoChecker = await baseUserSchema.findOne({ legajo })
        if (legajoChecker) {
            res.send('El legajo ya esta en uso, clickee en la flechita para volver atras para recuperar los datos ingresados')
        } else {
            // Basado en el rol
            const password = crypto.randomBytes(8).toString('hex')
            let newUser;
            switch (rol) {
                case 'empleado':
                    newUser = new Empleado({ nombre, apellido, legajo, password, email, imagePath })
                    break;
                case 'evaluador':
                    newUser = new Evaluador({ nombre, apellido, legajo, password, email, imagePath })
                    break;
                case 'regulador':
                    newUser = new Regulador({ nombre, apellido, legajo, password, email, imagePath })
                    break;
                case 'administrador':
                    newUser = new Administrador({ nombre, apellido, legajo, password, email, imagePath })
                    break;
                default:
                    return res.redirect('/user-creator')
            }

            // Save usuario
            await newUser.save()
            
            // Save into admin created users
            await baseUserSchema.findByIdAndUpdate(req.user._id, {
                $push: { usuariosCreados: newUser._id }
            })

            // Notify via mail
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'bitqualypassmanager@gmail.com',
                    pass: 'yoif nkxt bqkl zsrf'
                }
            })

            const mailOptions = {
                from: 'bitqualypassmanager@gmail.com',
                to: email,
                subject: 'Cuenta creada - Tu contraseña',
                text: `Hola ${nombre},\n\nTu cuenta de BitQualy ha sido creada. Tu contraseña es: ${password}\nPor favor cámbiala después de iniciar sesión.`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error)
                    return res.redirect('/user-creator')

                }
                console.log('Correo enviado: ' + info.response)
                res.redirect('/home-admin')
            })
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

router.get('/myAccount', (req, res) => {
    res.render('myAccount', { user: req.user })
})

router.post('/myAccount/update', upload.single('image'), async(req, res) => {
    try {
        const imagePath = req.file ? `uploads/images/${req.file.filename}` : req.user.imagePath

        await User.findByIdAndUpdate(req.user._id, { imagePath: imagePath })

        res.redirect('/myAccount')
    } catch (err) {
        console.error(err)
        res.status(500).send('Error actualizando la imagen')
    }
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