const Product = require('../models/product');

/**
 * Crée un nouveau produit
 * @param {Object} productData - Données du produit
 * @returns {Promise<Object>} Le produit créé
 */
exports.createProduct = async (productData) => {
    return await Product.create(productData);
};

/**
 * Récupère tous les produits avec pagination et filtres optionnels
 * @param {Object} options - Options de requête (pagination, tri, filtres)
 * @returns {Promise<Object>} Produits et métadonnées de pagination
 */
exports.getAllProducts = async (options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    // Construction du filtre
    const filter = {};

    if (options.category && options.category !== '') {
        filter.category = options.category;
    }

    if (options.inStock === 'true') {
        filter.inStock = true;
    }

    if (options.minPrice || options.maxPrice) {
        filter.price = {};
        if (options.minPrice) filter.price.$gte = parseFloat(options.minPrice);
        if (options.maxPrice) filter.price.$lte = parseFloat(options.maxPrice);
    }

    if (options.search) {
        filter.$or = [
            { name: { $regex: options.search, $options: 'i' } },
            { description: { $regex: options.search, $options: 'i' } }
        ];
    }

    // Construction du tri
    const sort = {};
    if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1; // Par défaut: du plus récent au plus ancien
    }

    try {
        // Exécution de la requête avec pagination
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Comptage total pour la pagination
        const total = await Product.countDocuments(filter);

        return {
            products,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        };
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des produits: ${error.message}`);
    }
};

/**
 * Récupère un produit par son ID
 * @param {string} id - ID du produit
 * @returns {Promise<Object>} Le produit trouvé
 */
exports.getProductById = async (id) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new Error('Produit non trouvé');
        }
        return product;
    } catch (error) {
        // Gestion spécifique pour les erreurs d'ID invalide
        if (error.name === 'CastError') {
            throw new Error('ID de produit invalide');
        }
        throw error;
    }
};

/**
 * Met à jour un produit existant
 * @param {string} id - ID du produit
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Le produit mis à jour
 */
exports.updateProduct = async (id, updateData) => {
    try {
        // S'assurer que inStock est correctement géré si quantity est fourni
        if (updateData.quantity !== undefined) {
            updateData.inStock = parseInt(updateData.quantity) > 0;
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true, // Retourne le document mis à jour
                runValidators: true // Applique les validations du schéma
            }
        );

        if (!product) {
            throw new Error('Produit non trouvé');
        }

        return product;
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            throw new Error(`Erreur de validation: ${messages.join(', ')}`);
        }
        if (error.name === 'CastError') {
            throw new Error('ID de produit invalide');
        }
        throw error;
    }
};

/**
 * Supprime un produit
 * @param {string} id - ID du produit
 * @returns {Promise<Object>} Résultat de la suppression
 */
exports.deleteProduct = async (id) => {
    try {
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            throw new Error('Produit non trouvé');
        }

        return { message: 'Produit supprimé avec succès', product };
    } catch (error) {
        if (error.name === 'CastError') {
            throw new Error('ID de produit invalide');
        }
        throw error;
    }
};

/**
 * Exemple d'opération avec transaction
 * @param {Array} productsData - Données de plusieurs produits
 * @returns {Promise<Array>} Les produits créés
 */
exports.createMultipleProducts = async (productsData) => {
    // Démarrage d'une session pour la transaction
    const session = await Product.startSession();
    session.startTransaction();

    try {
        // Création de tous les produits dans la transaction
        const products = await Product.create(productsData, { session });

        // Si tout s'est bien passé, on valide la transaction
        await session.commitTransaction();
        session.endSession();

        return products;
    } catch (error) {
        // En cas d'erreur, on annule la transaction
        await session.abortTransaction();
        session.endSession();

        throw new Error(`Erreur lors de la création multiple: ${error.message}`);
    }
};
