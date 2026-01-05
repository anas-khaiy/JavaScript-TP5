const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connexion à MongoDB établie avec succès');
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err.message);
    process.exit(1); // Quitte l'application en cas d'échec de connexion
  });

// Événements de connexion pour une meilleure gestion des erreurs
mongoose.connection.on('connected', () => {
  console.log('Mongoose connecté à MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Erreur de connexion Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose déconnecté de MongoDB');
});

// Fermeture propre de la connexion lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Connexion Mongoose fermée suite à l\'arrêt de l\'application');
  process.exit(0);
});

module.exports = mongoose;
