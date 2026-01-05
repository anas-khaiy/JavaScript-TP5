const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma
const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Le nom du produit est obligatoire'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères']
    },
    price: {
        type: Number,
        required: [true, 'Le prix est obligatoire'],
        min: [0, 'Le prix ne peut pas être négatif'],
        default: 0
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
    },
    category: {
        type: String,
        enum: {
            values: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
            message: '{VALUE} n\'est pas une catégorie valide'
        },
        default: 'Autres'
    },
    inStock: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        min: 0,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/300x300?text=Produit'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

// Virtuel
productSchema.virtual('formattedPrice').get(function () {
    return `${this.price.toFixed(2)} €`;
});

// Middleware pre-save
productSchema.pre('save', async function () {
    if (this.quantity === 0) {
        this.inStock = false;
    }
});

// Middleware post-save
productSchema.post('save', function (doc) {
    console.log(`Produit sauvegardé: ${doc.name}`);
});

// Modèle
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
