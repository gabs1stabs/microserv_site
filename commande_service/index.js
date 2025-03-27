const express = require("express");
const app = express();
const PORT = 4001;
const mongoose = require("mongoose");
const Commande = require("./Commande");
const axios = require("axios");
const isAuthenticated = require("./isAuthenticated"); 

// Connexion à la base de données
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://database:27017/commande-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Commande-Service DB Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process if the connection fails
  }
};

connectDB();

app.use(express.json());

// Calcul du prix total d'une commande en passant en paramètre un tableau des produits
function prixTotal(produits) {
  let total = 0;
  for (let t = 0; t < produits.length; ++t) {
    total += produits[t].prix;
  }
  console.log("Prix total :", total);
  return total;
}

// Cette fonction envoie une requête HTTP au service produit pour récupérer le tableau des produits qu'on désire commander
async function httpRequest(ids) {
  try {
    const URL = "http://localhost:4000/produit/acheter";
    const response = await axios.post(URL, { ids: ids }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Appel de la fonction prixTotal pour calculer le prix total de la commande en se basant sur le résultat de la requête HTTP
    return prixTotal(response.data);
  } catch (error) {
    console.error("Erreur lors de la requête HTTP:", error);
    throw new Error("Erreur lors de la récupération des produits.");
  }
}

/*app.post("/commande/ajouter", async (req, res, next) => {
  try {
    const { ids, email_utilisateur } = req.body;
    const total = await httpRequest(ids);

    const newCommande = new Commande({
      ids,
      email_utilisateur,
      prix_total: total,
    });

    const commande = await newCommande.save();
    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});*/
app.post("/commande/ajouter", isAuthenticated, async (req, res, next) => {
  // Création d'une nouvelle commande dans la collection commande 
  const { ids } = req.body;
  httpRequest(ids).then(total => {
    const newCommande = new Commande({
      produits: ids,
      email_utilisateur: req.user.email,
      prix_total: total,
    });
    newCommande.save()
      .then(commande => res.status(201).json(commande))
      .catch(error => res.status(400).json({ error }));
  });
});
 

app.listen(PORT, () => {
  console.log(`Commande-Service running on port ${PORT}`);
});

