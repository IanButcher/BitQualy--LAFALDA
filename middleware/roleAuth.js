// middleware/auth.js
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bcryptjs = require('bcryptjs')

// Middleware RBAC
function roleAuthorization(roles) {
    return function (req, res, next) {
        if (!req.isAuthenticated()) { // Asegurarse que este logueado
            return res.redirect('/')
        }
  
        if (!roles.includes(req.user.rol)) { // Revisar si el rol lo permite
            return res.redirect('/home')
        }
  
        next() 
    }
}
  
module.exports = roleAuthorization
  