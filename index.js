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
//const  roleAuthorization  = require('./middleware/roleAuth')

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
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bitqualyPrueba'
async function main() {
    await mongoose.connect(uri)
    //const mongoURI = process.env.MONGODB_URI || "mongodb://mongodb:27017/mydatabase";  
    //await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conection to mongodb Succsesful')
    // use await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test'); if your database has auth enabled
}
main().catch(err => console.log(err, 'ERROR on conction to mongodb'))
// Body parser middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Middlewares
initializePassportSession(app)
//app.use(roleAuthorization(['Administrador']))

// Import Routes
const formularioRoutes = require('./routes/formularioRoutes')
const evaluacionRoutes = require('./routes/evaluacionRoutes')
const loginRoutes = require('./routes/login')
const empleadoRoutes = require('./routes/empleadoRoutes')
const evaluadorRoutes = require('./routes/evaluadorRoutes')
const intermediarioRoutes = require('./routes/intermediarioRoutes')

app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}))

// Routes
app.get('/home', (req, res) => {
    res.render('home')
})

app.use('/', formularioRoutes)
app.use('/', evaluacionRoutes)
app.use('/', loginRoutes)
app.use('/', empleadoRoutes)
app.use('/', evaluadorRoutes)
app.use('/', intermediarioRoutes)

// Start the server
app.listen(puerto, () => {
    console.log('Servidor abierto')
    console.log(puerto)
})
