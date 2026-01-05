const productService = require('../services/productService');

/**
 * Affiche la liste des produits
 */
exports.getAllProducts = async (req, res) => {
    try {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
            category: req.query.category,
            inStock: req.query.inStock,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            search: req.query.search
        };

        const result = await productService.getAllProducts(options);

        res.render('products/index', {
            title: 'Liste des produits',
            products: result.products,
            pagination: result.pagination,
            filters: options
        });
    } catch (error) {
        console.error('Erreur getAllProducts:', error);
        res.status(500).render('error', {
            title: 'Erreur',
            message: error.message || 'Une erreur est survenue'
        });
    }
};

/**
 * Affiche les détails d'un produit
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.render('products/details', {
            title: product.name,
            product
        });
    } catch (error) {
        if (error.message === 'Produit non trouvé' || error.message === 'ID de produit invalide') {
            return res.status(404).render('error', {
                title: 'Produit non trouvé',
                message: error.message
            });
        }
        res.status(500).render('error', {
            title: 'Erreur',
            message: 'Une erreur est survenue'
        });
    }
};

/**
 * Affiche le formulaire de création
 */
exports.showCreateForm = (req, res) => {
    res.render('products/create', {
        title: 'Ajouter un produit',
        categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
        product: {}
    });
};

/**
 * Traite la création d'un produit
 */
exports.createProduct = async (req, res) => {
    try {
        let tags = [];
        if (req.body.tags && typeof req.body.tags === 'string') {
            tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        }

        const productData = {
            name: req.body.name,
            price: parseFloat(req.body.price),
            description: req.body.description,
            category: req.body.category,
            quantity: parseInt(req.body.quantity) || 0,
            inStock: req.body.inStock === 'on',
            tags: tags,
            imageUrl: req.body.imageUrl
        };

        const product = await productService.createProduct(productData);
        res.redirect(`/products/${product._id}`);
    } catch (error) {
        res.status(400).render('products/create', {
            title: 'Ajouter un produit',
            categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
            product: req.body,
            error: error.message || 'Une erreur est survenue'
        });
    }
};

/**
 * Affiche le formulaire de modification
 */
exports.showEditForm = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.render('products/edit', {
            title: `Modifier ${product.name}`,
            categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
            product
        });
    } catch (error) {
        res.status(404).render('error', { message: error.message });
    }
};

/**
 * Traite la modification d'un produit
 */
exports.updateProduct = async (req, res) => {
    try {
        let tags = [];
        if (req.body.tags && typeof req.body.tags === 'string') {
            tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        }

        const productData = {
            ...req.body,
            tags,
            inStock: req.body.inStock === 'on'
        };

        const product = await productService.updateProduct(req.params.id, productData);
        res.redirect(`/products/${product._id}`);
    } catch (error) {
        res.status(400).render('products/edit', {
            product: { ...req.body, _id: req.params.id },
            error: error.message,
            categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres']
        });
    }
};

/**
 * Traite la suppression d'un produit
 */
exports.deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        if (req.session) {
            req.session.flashMessage = { type: 'success', text: 'Produit supprimé avec succès' };
        }
        res.redirect('/products');
    } catch (error) {
        res.redirect('/products');
    }
};
