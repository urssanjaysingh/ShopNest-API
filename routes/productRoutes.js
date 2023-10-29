import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'
import {
    braintreePaymentController,
    braintreeTokenController,
    createProductController,
    deleteProductController,
    getProductController,
    getSingleProductController,
    productCategoryController,
    productCountController,
    productFiltersController,
    productListController,
    relatedProductController,
    searchProductController,
    updateProductController
} from '../controllers/productController.js'

const router = express.Router()

router.post(
    '/create',
    requireSignIn,
    isAdmin,
    createProductController
);

router.get(
    '/get-all',
    getProductController
)

router.get(
    '/get/:slug',
    getSingleProductController
)

router.delete(
    '/delete/:id',
    requireSignIn,
    isAdmin,
    deleteProductController
)

router.put(
    '/update/:id',
    requireSignIn,
    isAdmin,
    updateProductController
);

router.post('/filters', productFiltersController)

router.get('/product-count', productCountController)

router.get('/product-list/:page', productListController)

router.get('/search/:keyword', searchProductController)

router.get('/related-product/:pid/:cid', relatedProductController)

router.get('/product-category/:slug', productCategoryController)

router.get('/braintree/token', braintreeTokenController)

router.post('/braintree/payment', requireSignIn, braintreePaymentController)

export default router
