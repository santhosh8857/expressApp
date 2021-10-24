const { ObjectId } = require("mongodb"); // it will be useful for get with ID
var express = require("express"); // express requirement
var cors = require("cors");
var router = express.Router(); // responsible for router

const { mongodb, MongoClient, dbUrl } = require("../dbConfig"); // for db connection

// Get student
router.get("/all-students", async (req, res) => {
  const client = await MongoClient.connect(dbUrl); // connection to mongoDB

  try {
    const db = client.db("studentManagement"); // connection to DB
    let data = await db.collection("students").find().toArray(); // connection to collection and operation

    res.send({
      message: "Success",
      data: data,
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in connection" });
  } finally {
    client.close();
  }
});

// Get specific student
router.get("/get-student/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);

  try {
    const db = client.db("studentManagement");
    let data = await db
      .collection("students")
      .findOne({ _id: ObjectId(req.params.id) }); // finding with the ID
    console.log(data);
    res.send({
      message: "Success",
      data: data,
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in connection" });
  } finally {
    client.close();
  }
});

// add student
router.post("/add-student", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);

  try {
    const db = client.db("studentManagement");
    let data = await db.collection("students").insertMany(req.body);

    res.send({
      message: "Inserted!",
      details: data,
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in connection" });
  } finally {
    client.close();
  }
});

// edit student
router.put("/edit-student/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);

  try {
    const db = client.db("studentManagement");

    // updateOne({filer}, ($set){updateOperation})
    let data = await db.collection("students").updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          class: req.body.class,
        },
      }
    );

    res.send({
      message: "Updated!",
      details: data,
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in connection" });
  } finally {
    client.close();
  }
});

// delete student
router.delete("/delete-student/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);

  try {
    const db = client.db("studentManagement");
    let data = await db
      .collection("students")
      .deleteOne({ _id: ObjectId(req.params.id) });

    res.send({
      message: "Deleted!",
      details: data,
    });
  } catch (e) {
    console.log(e);

    res.send({ message: "Error in connection" });
  }
});
module.exports = router;
