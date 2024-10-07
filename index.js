// Modulos
const express = require('express')
const ejs = require('ejs')
const arrayEmpleados = require('./seedEmpleados')
const arrayEvaluadores = require('./seedEvaluadores')
const path = require('path')
const mongoose = require('mongoose')
const arrayReguladores = require('./seedReguladores')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { initializePassportSession } = require('./middleware/passportConfig')
const { auth } = require('./middleware/roleAuth')

// Server config
const app = express()
const puerto = 3000
app.set('view engine', 'ejs')

// Method Over-ride (put & delete methods)
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


// Path configs 
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

// Mongoose conection
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/bitqualyPrueba')
    console.log('Conection to mongodb Succsesful')
    // use await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test'); if your database has auth enabled
}
main().catch(err => console.log(err, 'ERROR on conction to mongodb'))
// Body parser middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Middlewares
initializePassportSession(app)

// Import Routes
const formularioRoutes = require('./routes/formularioRoutes')
const evaluacionRoutes = require('./routes/evaluacionRoutes')


app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}))

app.get('/home', roleAuthorization(['Empleado', 'Evaluador', 'Intermediario', 'Administrador']), (req, res) => {
    res.render('home')
})

app.get('/evaluadores', (req, res) => {
    res.render('evalrs/evaluadores', {arrayEvaluadores})

})



app.get('/empleados', (req, res)=>{
    res.render('empls/empleados', {arrayEmpleados})
})

app.get('/empleados/:id', (req,res)=>{
    const id = req.params.id
    const empleado = arrayEmpleados[id]
    res.render('empls/empleado', {empleado})

})
app.get('/reguladores', (req, res)=>{
    res.render('regs/reguladores', {arrayReguladores})
})

app.get('/reguladores/:id', (req, res)=>{
    const id = req.params.id
    const regulador = arrayReguladores[id]
    res.render('regs/ReguladoresEsp', {regulador})
})
app.get('/evaluador', (req, res)=>{
    res.render('evalrs/evaluador', {arrayEvaluadores})
})

app.get('/evaluador/:id', (req,res)=>{
    const id = req.params.id
    const empleado = arrayEvaluador[id]
    res.render('evalrs/evaluador', {evaluador})
})

app.get('/home', (req, res) => {
    res.render('home')
})

// Rutas Formulario
app.use('/', formularioRoutes)
app.use('/', evaluacionRoutes)


// Start the server

app.get('/evaluaciones1', (req, res)=>{
    res.render('evaluaciones/evaluaciones')
})

app.listen(puerto, () => {
    console.log('Servidor abierto')
    console.log(puerto)
})
