const express = require("express");
const app = express();
const PORT = 4002;
const mongoose = require("mongoose");
const Utilisateur = require("./Utilisateur");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',  // Allow frontend from localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow these HTTP methods
}));


mongoose.set("strictQuery", true);

// Connexion à la base de données
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://database:27017/auth-service", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Auth-Service DB Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process if connection fails
  }
};

connectDB();

app.use(express.json());

// Méthode register pour créer et ajouter un nouvel utilisateur
app.post("/auth/register", async (req, res) => {
  try {
    let { nom, email, mot_passe } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await Utilisateur.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(mot_passe, 10);

    const newUtilisateur = new Utilisateur({
      nom,
      email,
      mot_passe: hashedPassword, // Stocker le mot de passe hashé
    });

    const savedUser = await newUtilisateur.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("❌ MongoDB Save Error:", error);  // 🔍 Log the error
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// Méthode login pour authentifier un utilisateur et retourner un token
app.post("/auth/login", async (req, res) => {
  try {
    const { email, mot_passe } = req.body;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Vérifier le mot de passe
    const match = await bcrypt.compare(mot_passe, utilisateur.mot_passe);
    if (!match) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const payload = { email, nom: utilisateur.nom };
    const token = await jwt.sign(payload, "secret", { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'authentification" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth-Service running on port ${PORT}`);
});
