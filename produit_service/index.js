const express = require("express");
const app = express();
const PORT = 4000;
//process.env.PORT_ONE || 
const mongoose = require("mongoose");
const Produit = require("./Produit");
app.use(express.json());
//Connection à la base de données MongoDB « publication-service-db »
//(Mongoose créera la base de données s'il ne le trouve pas)
mongoose.set('strictQuery', true);
mongoose.connect(
  "mongodb://database:27017/produit-service",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  
);
app.post("/produit/ajouter", (req, res, next) => {
      const { nom, description, prix } = req.body;
      const newProduit = new Produit({
        nom,
        description, 
         prix
  });

    newProduit.save() 
    .then(produit => res.status(201).json(produit))
    .catch(error => res.status(400).json({ error }));
});

app.get("/produit/acheter", (req, res, next) => {
      const { ids } = req.body;
      Produit.find({ _id: { $in: ids } })
        .then(produits => res.status(201).json(produits))
        .catch(error => res.status(400).json({ error }));
    });
    
app.listen(PORT, () => {
  console.log(`Product-Service at ${PORT}`);
});
