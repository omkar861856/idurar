const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const mongoose = require('mongoose');

const shortid = require('shortid');


const register = async (req, res, { userModel }) => {
 


const UserModel = mongoose.model(userModel);
const UserPasswordModel = mongoose.model(userModel + 'Password');


const { name, email, password, country } = req.body;

// validate
const objectSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .required(),
  password: Joi.string().required(),
  name: Joi.string().min(3).max(30).required(),
  country: Joi.string().min(2).max(50).required(),
});

const { error, value } = objectSchema.validate({ name, country, email, password });

if (error) {
return res.status(409).json({
  success: false,
  result: null,
  error: error,
  message: 'Invalid/Missing credentials.',
  errorMessage: error.message,
});
}


const user = await UserModel.findOne({ email: email, removed: false });

// console.log(user);

if (user)
return res.status(404).json({
  success: false,
  result: null,
  message: 'Email has been already registered.',
});


//hash password and send in db

const rounds = process.env.SALT_ROUNDS;

const salt = shortid.generate();
  const hashedPassword = bcrypt.hashSync(salt + password);

const newUser = new UserModel({
  name,
  email,
  password: hashedPassword,
  country,
  enabled: true,
}); 

const newPassword = new UserPasswordModel({
  user: newUser._id,
  password: hashedPassword,
  salt,
  emailVerified: false,

})

//store the new user

try {
const savedUser = await newUser.save();
const savedPassword = await newPassword.save();
console.log(savedUser, savedPassword);
} catch (err) {
console.error(err);
return res.status(500).json({
  success: false,
  result: null,
  message: 'Server error.',
});
}

res.status(200).json({
  msg:"working registration"
})

}

module.exports = register;


