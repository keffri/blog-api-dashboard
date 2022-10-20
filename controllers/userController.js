const User = require('../models/userModel');
const passport = require('passport');

exports.getLogin = (req, res, next) => {
  res.render('login');
};

exports.postLogin = passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/log-in',
});

exports.getLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/dashboard');
  });
};
