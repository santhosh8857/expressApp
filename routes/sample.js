var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.send({ message: "OK" });
});

router.post("/reset-password/:token", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  const token = req.params.token;
  const mail = await authenticate(token);
  try {
    if (mail) {
      const hash = await hashing(req.body.password);
      const db = await client.db("studentManagement");
      let user = await db
        .collection("users")
        .updateOne({ email: mail }, { $set: { password: hash } });

      res.json({
        message: "Password Set Successfully",
      });
    } else {
      res.send({ message: "Link Expired" });
    }
  } catch (e) {}
});
module.exports = router;
