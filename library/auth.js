const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const secret = "fdkasfjosafsdnkgnoagroamntawerotg";

const JWTD = require("jwt-decode");

const hashing = async (value) => {
  try {
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(value.toString(), salt);
    return hash;
  } catch (err) {
    console.log("bcrypt " + err);
    return err;
  }
};

const hashCompare = async (password, hashValue) => {
  try {
    return await bcrypt.compare(password.toString(), hashValue.toString());
  } catch (e) {
    return e;
  }
};

// create token using jwt package
const createToken = async (userName, email) => {
  let newToken = await JWT.sign(
    // sign method to povide the details
    // sign(string(data), secret code(created), options(expiration time))
    {
      userName,
      email,
    },
    secret,
    {
      expiresIn: "15m",
    }
  );
  return newToken;
};

const authenticate = async (token) => {
  let decode = JWTD(token); // using jwt decode package to decode the encrypted token
  // console.log(decode); to verify the decode

  // check the expiry of the token and return email or false
  if (Math.round(new Date() / 1000) <= decode.exp) return decode.email;
  else return false;
};

module.exports = { hashing, hashCompare, createToken, authenticate };
