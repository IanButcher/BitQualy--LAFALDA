// Modulos
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const User = require('../Schemas/baseUserSchema'); // Adjust path if necessary

// Passport configuration
passport.use(new LocalStrategy({ usernameField: 'legajo' }, async (legajo, password, done) => {
  try {
    // Ensure legajo is treated as a number
    const user = await User.findOne({ legajo: parseInt(legajo) });
    if (!user) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware to initialize Passport & session
function initializePassportSession(app) {
  // Set up express-session
  app.use(session({
    secret: 'yourSecretKey',     
    resave: false,               
    saveUninitialized: false,    
    cookie: { secure: false }    // Set secure: true in production with HTTPS
  }));

  // Set up connect-flash
  app.use(flash());

  // Make flash messages available in all views
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport error messages
    next();
  });

  // Initialize Passport and session handling
  app.use(passport.initialize());
  app.use(passport.session());
}

// Export function and passport instance
module.exports = {
  initializePassportSession,
  passport
};
