// Librerias
const express = require('express')
const ejs = require('ejs')
const arrayEmpleados = require('./seedEmpleados')
const arrayEvaluadores = require('./seedEvaluadores')
const path = require('path')
const mongoose = require('mongoose')

// Server config
const app = express()
const puerto = 3000
app.set('view engine', 'ejs')

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

// Import Routes
const formularioRoutes = require('./routes/formularioRoutes')

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


app.get('/home', (req, res) => {
    res.render('home')
})

// Rutas Formulario
app.use('/', formularioRoutes)

// Start the server
app.listen(puerto, () => {
    console.log(`Servidor abierto en el puerto ${puerto}`)
})
