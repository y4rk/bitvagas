var passport      = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db            = require('../../../models');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('signin', new LocalStrategy(
    {
        usernameField : 'email'
      , passwordField : 'password'
    },
    function(username, password, done){
        db.USER.find({ where : { EMAIL: username}})
        .success(function(user){

            if(!user || user.PASSWORD != password)
                return done(null, false, { message: 'Email or Password Invalid'});

            return done(null, { email: user.EMAIL });

        })
        .error(function(err){
            console.log('error: '+err);
            done(err);
        });
    }
));

