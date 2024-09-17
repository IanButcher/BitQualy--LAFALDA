// Librerias
const express = require('express')
const ejs = require('ejs')
const arrayEmpleados = require('./seedEmpleados')
const mongoose = require('mongoose')

// Server config
const app = express()
const puerto = 3000
app.set('view engine', 'ejs')

// Mongoose conect
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bitqualyPrueba')
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main().catch(err => console.log(err))

// Path configs (configuracion para no poner ./views/archivo.ejs)
const path = require('path')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

// Rutas
app.get('/', (req, res)=>{
    res.render('index')
})

app.get('/login', (req,res)=>{
    res.render('login')
})

app.get('/empleados', (req, res)=>{
    res.render('empleados/empleados', {arrayEmpleados})
})

app.get('/home', (req,res)=>{
    res.render('home')
})

app.listen(puerto, ()=>{
    console.log('Servidor abierto')
    console.log(puerto)
})