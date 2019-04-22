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
  age: { type: Number },
}, { collection: 'user' });

userSchema.pre('save', function (next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) {
        return next(error);
      }
      bcrypt.hash(user.password, salt, (error, hash) => {
        if (error) {
          return next(error);
        }
        user.password = hash;
        return next();
      });
    });
  }
  return next();
});

userSchema.methods.comparePasswords = function (password, next) {
  bcrypt.compare(password, this.password, (error, isMatch) => {
    next(error, isMatch);
  });
};

mongoose.model('user', userSchema);
