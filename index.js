// Modulos
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const { initializePassportSession, passport } = require('./middleware/passportConfig')

// Server config
const app = express();
const puerto = 3000;
app.set('view engine', 'ejs')

// Method Override (for PUT & DELETE methods)
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Path configs 
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

// Mongoose connection
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bitqualyPrueba'
async function main() {
    await mongoose.connect(uri)
    console.log('Connection to MongoDB successful')
}
main().catch(err => console.log('ERROR on connection to MongoDB:', err))

// Initialize Passport & session (with flash)
initializePassportSession(app)

// Import Routes
const formularioRoutes = require('./routes/formularioRoutes')
const evaluacionRoutes = require('./routes/evaluacionRoutes')
const loginRoutes = require('./routes/login')
const empleadoRoutes = require('./routes/empleadoRoutes')
const evaluadorRoutes = require('./routes/evaluadorRoutes')
const intermediarioRoutes = require('./routes/intermediarioRoutes')

// Login route using Passport
app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}))

// Routes for different roles
app.get('/home', (req, res) => {
    // Check user role and redirect accordingly
    if (req.user) {
        switch (req.user.rol) {
            case 'Administrador':
                return res.redirect('/home-admin')
            case 'Intermediario':
                return res.redirect('/home-inter')
            case 'Empleado':
                return res.redirect('/home-user')
            case 'Evaluador':
                return res.redirect('/home-eval')
            default:
                return res.status(403).send('Rol no autorizado')
        }
    } else {
        return res.redirect('/')
    }
})

app.get('/home-admin', (req,res)=>{
    res.render('home/homeAdmin')
})

app.get('/home-inter', (req,res)=>{
    res.render('home/homeInter')
})

app.get('/home-user', (req,res)=>{
    res.render('home/homeUser')
})

app.get('/home-eval', (req,res)=>{
    console.log('User:', req.user)
    res.render('home/homeEval')
})


// Use routes
app.use('/', formularioRoutes)
app.use('/', evaluacionRoutes)
app.use('/', loginRoutes)
app.use('/', empleadoRoutes)
app.use('/', evaluadorRoutes)
app.use('/', intermediarioRoutes)

// Start the server
app.listen(puerto, () => {
    console.log(`Servidor abierto en el puerto`)
    console.log(puerto)
})
