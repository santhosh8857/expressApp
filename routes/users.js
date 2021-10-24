var express = require("express");
var router = express.Router();
const { dbUrl, mongodb, MongoClient } = require("../dbConfig");
const { ObjectId } = require("mongodb");
const {
  hashing,
  hashCompare,
  createToken,
  authenticate,
} = require("../library/auth"); // for authentication

/* GET users listing. */
router.get("/", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);

  try {
    const db = await client.db("studentManagement");
    let data = await db.collection("users").find().toArray();

    res.send({
      message: "Success",
      data: data,
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "users get" });
  } finally {
    client.close();
  }
});

//register
router.post("/register", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db("studentManagement");
    let user = await db.collection("users").findOne({ email: req.body.email }); // getting the user details

    // checking user
    if (user) {
      res.json({
        message: "User already exists",
      });
    } else {
      const hash = await hashing(req.body.password); // calling hashing
      req.body.password = hash; // assigning encrypted password
      const data = await db.collection("users").insertOne(req.body);
      res.send({
        message: "Account Created",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ messsage: "Failed to create user" });
  } finally {
    client.close();
  }
});

//login
router.post("/login", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("studentManagement");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      const compare = await hashCompare(req.body.password, user.password); //comparing the user password with encrypted password
      console.log(compare);
      if (compare === true) {
        res.json({
          message: "Login Successfull",
        });
      } else {
        res.json({
          message: "Invalid email or password",
        });
      }
    } else {
      res.json({
        message: "No user available",
      });
    }
  } catch (error) {
    console.log();
  } finally {
    client.close();
  }
});

// forgetpassword
router.post("/forget-password", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  let email = req.body.email;

  try {
    const db = await client.db("studentManagement");
    let user = await db.collection("users").findOne({ email: email });
    if (user) {
      const token = await createToken(user.name, user.email); // creating token for the user with name and email

      // enhancement - send email to user
      res.send({
        token,
        message: "Reset token has been sent",
      });
    } else {
      res.send({ message: "no user available" });
    }
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in connection" });
  } finally {
    client.close();
  }
});

// resetpassword
router.post("/reset-password/:token", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  const token = req.params.token;
  let verifiedEmail = await authenticate(token); //authenticate with user's token
  try {
    if (verifiedEmail) {
      // if there is email then the token is autherized
      const hash = await hashing(req.body.password); //encrypting the new password
      const db = client.db("studentManagement");
      let user = await db
        .collection("users")
        .updateOne({ email: verifiedEmail }, { $set: { password: hash } }); //updating new password with user's email
      res.send({ message: "Password reset successfull" });
    } else {
      res.send({ message: "Link expired" });
    }
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in connection" });
  } finally {
    client.close();
  }
});

// delete
router.delete("/delete-user/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = client.db("studentManagement");
    let data = await db
      .collection("users")
      .deleteOne({ _id: ObjectId(req.params.id) });

    res.send({
      message: "Deleted!",
      details: data,
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in connection" });
  } finally {
    client.close();
  }
});

module.exports = router;
