// Modulos
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const flash = require('connect-flash')
const User = require('../Schemas/baseUserSchema')

// Passport configuration
passport.use(new LocalStrategy({ usernameField: 'legajo' }, async (legajo, password, done) => {
  try {
    // Ensure legajo is treated as a number
    const user = await User.findOne({ legajo: parseInt(legajo) })
    if (!user) {
      return done(null, false, { message: 'Credenciales inválidas. Verifica tu legajo y contraseña.' })
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Credenciales inválidas. Verifica tu legajo y contraseña.' })
    }

    return done(null, user)
  } catch (error) {
    return done(error)
  }
}))

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

// Middleware to initialize Passport & session
function initializePassportSession(app) {
    // Set up express-session
    app.use(session({
      secret: 'yourSecretKey',     
      resave: false,               
      saveUninitialized: false,    
      cookie: { secure: false }    
    }))

    

    // Flash setup
    app.use(flash())
    app.use((req, res, next) => {
      res.locals.success_msg = req.flash('success_msg')
      res.locals.error_msg = req.flash('error_msg')
      res.locals.error = req.flash('error')
      next()
    });

    // Inicializar passport
    app.use(passport.initialize())
    app.use(passport.session())
}

// Exportar
module.exports = {
  initializePassportSession,
  passport
}
