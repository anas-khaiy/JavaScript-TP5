const express = require('express');
const path = require('path');

const ejsLayouts = require('express-ejs-layouts');
const session = require('express-session');
require('dotenv').config();

// Connexion à MongoDB
require('./db/mongoose');

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la session pour les messages flash
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 } // 1 minute
}));

// Middleware pour les messages flash
app.use((req, res, next) => {
    res.locals.flashMessage = (req.session && req.session.flashMessage) || null;
    if (req.session && req.session.flashMessage) {
        delete req.session.flashMessage;
    }
    next();
});

// Importation des routes
const productRoutes = require('./routes/productRoutes');

// Routes
app.get('/', (req, res) => {
    res.redirect('/products');
});

// Utilisation des routes
app.use('/products', productRoutes);

// Middleware pour gérer les routes non trouvées
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page non trouvée',
        message: 'La page que vous recherchez n\'existe pas.'
    });
});

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
    console.error('Erreur non gérée:', err);
    res.status(500).render('error', {
        title: 'Erreur serveur',
        message: process.env.NODE_ENV === 'production'
            ? 'Une erreur est survenue sur le serveur.'
            : err.message || 'Erreur interne du serveur'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu. Arrêt gracieux du serveur...');
    process.exit(0);
});
