// Librerias
const express = require('express')
const ejs = require('ejs')
const arrayEmpleados = require('./seedEmpleados')
const mongoose = require('mongoose')

// Server config
const app = express()
const puerto = 3000
app.set('view engine', 'ejs')

// Mongoose conection
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bitqualyPrueba')
  console.log('Conection to mongodb Succsesful')
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main().catch(err => console.log(err, 'ERROR on conction to mongodb'))

// Path configs (configuracion para no poner ./views/archivo.ejs)
const path = require('path')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))


// Mongoose Models & Schemas
const empleadoSchema = require('./Schemas/empleadoSchema')
const evaluadorSchema = require('./Schemas/evaluadorSchema')
const evaluacionSchema = require('./Schemas/evaluacionSchema')
const formularioSchema = require('./Schemas/formularioSchema')
const intermediarioSchema = require('./Schemas/intermediarioSchema')

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