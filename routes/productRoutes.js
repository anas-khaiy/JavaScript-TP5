const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Routes pour les produits
router.get('/', productController.getAllProducts);
router.get('/create', productController.showCreateForm);
router.post('/create', productController.createProduct);
router.get('/:id', productController.getProductById);
router.get('/edit/:id', productController.showEditForm);
router.post('/:id/update', productController.updateProduct);
router.post('/:id/delete', productController.deleteProduct);

module.exports = router;
