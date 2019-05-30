/* eslint-disable func-names */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, unique: true, required: true, lowercase: true,
  },
  email: {
    type: String, unique: true, required: true, lowercase: true,
  },
  password: { type: String, required: true },
}, { collection: 'user' });

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (genSaltError, salt) => {
    if (genSaltError) {
      return next(genSaltError);
    }
    bcrypt.hash(user.password, salt, (hashError, hash) => {
      if (hashError) {
        return next(hashError);
      }
      user.password = hash;
      return next();
    });
  });
});

userSchema.methods.comparePasswords = function (password, next) {
  bcrypt.compare(password, this.password, (error, isMatch) => {
    next(error, isMatch);
  });
};

mongoose.model('user', userSchema);
