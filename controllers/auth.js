const User = require('../models/user');

exports.getUser = (req, res) => {
  res.send('no user');
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    console.log(errors);
    // req.flash('errors', errors);
    return res.redirect('/signup');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password
  });
  debugger

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    debugger
    console.log('find One executed');
    if (err) { return next(err); }
    if (existingUser) {
      console.log('Account with that email address already exists.');
      // req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
    user.save((err) => {
      if (err) { return next(err); }
      console.log('success');
    });
  });
};
