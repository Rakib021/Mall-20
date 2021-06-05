const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const admin = require("firebase-admin");

app.use(cors());
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const port = 6000;
  
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;


const serviceAccount = require('./shop-24-7-firebase-adminsdk-2tgiw-58e18b2645.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.get("/", (req, res) => {
  res.send("Welcome to mall-20 server!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cpqmt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  console.log("Connection Error", err);

  const productsCollection = client.db("mall20Store").collection("products");
  

  app.get("/products", (req, res) => {
    productsCollection.find().toArray((err, items) => {
      res.send(items);
      // console.log("from database", items);
    });
  });

  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    console.log("adding new product", newProduct);
    productsCollection.insertOne(newProduct).then((result) => {
      console.log("inserted Count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });
  
  app.delete("/delete/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete this", id);
    productsCollection
      .findOneAndDelete({ _id: id })
      .then((document) => res.send(document.deleteCount > 0));
  });
  

  


  console.log("Products Database Connected Successfully");

  app.get("/products/:id", (req, res) => {
    const id = req.params.id;
    productsCollection.find({ _id: ObjectID(id) }).toArray((err, products) => {
      res.send(products[0]);
    });
  });

});

client.connect((err) => {
  console.log("Connection Error", err);

  const ordersCollection = client.db("mall20").collection("orders");

   app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    ordersCollection.insertOne(newOrder)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
    console.log(newOrder);
  })


  app.get('/orders', (req, res) =>{
    ordersCollection.find({email: req.query.email})
    .toArray( (err, documents) =>{
      res.send(documents);
    })
  })




   console.log("Orders Database Connected Successfully");
});

app.listen(process.env.PORT || port);