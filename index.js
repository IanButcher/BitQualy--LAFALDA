// Librerias
const express = require('express')
const ejs = require('ejs')
const arrayEmpleados = require('./seedEmpleados')
const arrayEvaluadores = require('./seedEvaluadores')
const path = require('path')
const mongoose = require('mongoose')
const arrayReguladores = require('./seedReguladores')

// Server config
const app = express()
const puerto = 3000
app.set('view engine', 'ejs')

// Method Over-ride
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

// Import Routes
const formularioRoutes = require('./routes/formularioRoutes')
const evaluacionRoutes = require('./routes/evaluacionRoutes')
// Rutas
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/evaluadores', (req, res) => {
    res.render('evalrs/evaluadores', {arrayEvaluadores})

})



app.get('/newEvalrs', (req, res) => {
    res.render('evalrs/newEvalrs')
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

app.get('/home-admin', (req, res) => {
    res.render('home/homeAdmin')
})

app.get('/home-inter', (req, res) => {
    res.render('home/homeInter')
})

app.get('/home-user', (req, res) => {
    res.render('home/homeUser')
})

app.get('/home-eval', (req, res) => {
    res.render('home/homeEval')
})

// Rutas Formulario
app.use('/', formularioRoutes)
app.use('/', evaluacionRoutes)


// Start the server

app.get('/evalTest', (req, res)=>{
    res.render('evalText(X)/evaluacionesian')
})

app.listen(puerto, () => {
    console.log('Servidor abierto')
    console.log(puerto)
})
