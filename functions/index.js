const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://landing-page-d5993.firebaseio.com"
});



const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors({ origin: true}));

const db = admin.firestore();

// Routes
app.get('/hello-world', (req,res) => {
    return res.status(200).send('Hello World!');
})

// Create
// post
app.post('/api/create', (req, res) => {
    (async () => {
        try {
            await db.collection('products').doc('/' + req.body.id + '/')
            .create({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price
            })
            return res.status(201).send();
        }catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
})

// Read specific product based on ID
// Read
app.get('/api/read/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('products').doc(req.params.id);
            let product = await document.get();
            let response = product.data();

            return res.status(200).send(response);
        }catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
})


// Read all products
// Read
app.get('/api/read', (req, res) => {
    (async () => {
        try {
           let query = db.collection('products');
           let response = [];

           await query.get().then(querySnapshot => {
               let docs = querySnapshot.docs; // result of the query

               for(let doc of docs) {
                   const selectedItem = {
                       id: doc.id,
                       name: doc.data().name,
                       description: doc.data().description,
                       price: doc.data().price
                   }
                   response.push(selectedItem);
               }

               return response;        // each then should return a value
           })

           return res.status(200).send(response)
        }catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
})

// Update
// put
app.put('/api/update/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('products').doc(req.params.id);
            await document.update({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price
            })
            return res.status(200).send();
        }catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
})

// Delete
// delete
app.delete('/api/delete/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('products').doc(req.params.id);
            await document.delete();
            return res.status(200).send();
        }catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
})

// Export the api to Firebase Cloud Functions
exports.app = functions.https.onRequest(app);

