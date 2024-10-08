// middleware/auth.js
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bcryptjs = require('bcryptjs')

// Middleware RBAC
function roleAuthorization(roles) {
    return function (req, res, next) {
        if (!req.isAuthenticated()) { // Asegurarse que este logueado
            return res.status(401).json({ message: 'Unauthorized' })
        }
  
        if (!roles.includes(req.user.rol)) { // Revisar si el rol lo permite
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
        }
  
        next() 
    }
}
  
module.exports = roleAuthorization
  