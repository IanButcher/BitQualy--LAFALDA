// Librerias
const express = require('express');
const ejs = require('ejs');
const arrayEmpleados = require('./seedEmpleados');
const path = require('path');

// Server config
const app = express();
const puerto = 3000;
app.set('view engine', 'ejs');

// Path configs (configuracion para no poner ./views/archivo.ejs)
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import Routes
const formularioRoutes = require('./routes/formularioRoutes');  // Import the Formulario routes

// Rutas
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/empleados', (req, res) => {
    res.render('empls/empleados', { arrayEmpleados });
});

app.get('/empleados/:id', (req, res) => {
    const id = req.params.id;
    const empleado = arrayEmpleados[id];
    res.render('empls/empleado', { empleado });
});

app.get('/home', (req, res) => {
    res.render('home');
});

// Use the Formulario routes (GET and POST for formularios)
app.use('/', formularioRoutes);

// Start the server
app.listen(puerto, () => {
    console.log(`Servidor abierto en el puerto ${puerto}`);
});
