const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  authenticate: new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return console.log(err);
        if (res) {
          jwt.sign({ user }, 'privateKey', { expiresIn: 30 }, (err, token) => {
            if (err) done(err);
          });
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      });
    });
  }),
  serialize: (user, done) => {
    done(null, user.id);
  },
  deserialize: (id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  },
};
