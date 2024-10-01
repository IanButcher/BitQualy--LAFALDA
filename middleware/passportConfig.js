// Modulos
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const User = require('../Schemas/baseUserSchema') 

// Passport configuration
passport.use(new LocalStrategy({ usernameField: 'legajo' }, async (legajo, password, done) => {
  try {
    // Asegurar legajo se trata como numero
    const user = await User.findOne({ legajo: parseInt(legajo) })
    if (!user) {
      return done(null, false, { message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return done(null, false, { message: 'Invalid credentials' })
    }

    return done(null, user)
  } catch (error) {
    return done(error)
  }
}));

// Serializar usuario para guardar session
passport.serializeUser((user, done) => {
  done(null, user.id)
});

// Deserializar usuario de la session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
});

// Middleware inicializar Passport & session
function initializePassportSession(app) {
  // Set up express-session
  app.use(session({
    secret: 'yourSecretKey',     
    resave: false,               // Don't save session if unmodified
    saveUninitialized: false,    // Don't create session until something stored
    cookie: { secure: false }    // Set secure: true in production with HTTPS
  }))

  // Inicializar Passport & session handling
  app.use(passport.initialize())
  app.use(passport.session())
}

// Exportar
module.exports = {
  initializePassportSession,
  passport
};
