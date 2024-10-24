const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const { initializePassportSession, passport } = require('./middleware/passportConfig')
const roleAuthorization = require('./middleware/roleAuth')
const admin = require('./Schemas/adminSchema')

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bitqualyPrueba'
async function main() {
    await mongoose.connect(uri)
    console.log('Connection to MongoDB successful')
}
main().catch(err => console.log('ERROR on connection to MongoDB:', err))

const adminUser = new admin ({
    nombre: 'asasdd',
    apellido: 'asdasd',
    legajo: 7777,
    password: '777777',
    estaActivo: true
})
const guardar = async ()=>{
    await adminUser.save()
}
guardar()