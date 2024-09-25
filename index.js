// Librerias
const express = require('express');
const ejs = require('ejs');
const arrayEmpleados = require('./seedEmpleados');
const mongoose = require('mongoose');

// Server config
const app = express();
const puerto = 3000;
app.set('view engine', 'ejs');

// Mongoose conection
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bitqualyPrueba/bitqualy');
  console.log('Connection to MongoDB successful');
}
main().catch(err => console.log(err, 'ERROR on connection to MongoDB'));

// Path configs 
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mongoose Models & Schemas
const Empleado = require('./Schemas/empleadoSchema');
const Evaluador = require('./Schemas/evaluadorSchema');
const Evaluacion = require('./Schemas/evaluacionSchema');
const Formulario = require('./Schemas/formularioSchema');
const Intermediario = require('./Schemas/intermediarioSchema');

// Import formularioRoutes
const formularioRoutes = require('./routes/formularioRoutes');  // Importing the Formulario routes

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/empleados', (req, res) => {
  res.render('empleados/empleados', { arrayEmpleados });
});

app.get('/home', (req, res) => {
  res.render('home');
});

// Use the Formulario routes
app.use('/', formularioRoutes);  // Register the Formulario routes

app.listen(puerto, () => {
  console.log('Servidor abierto en el puerto', puerto);
});
