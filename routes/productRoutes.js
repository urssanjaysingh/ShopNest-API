import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'
import {
    createProductController,
    deleteProductController,
    getProductController,
    getSingleProductController,
    updateProductController
} from '../controllers/productController.js'

const router = express.Router()

//create-product
router.post(
    '/create',
    requireSignIn,
    isAdmin,
    createProductController
);

//get all products
router.get(
    '/get-all',
    getProductController
)

//get single product
router.get(
    '/get/:slug',
    getSingleProductController
)

//delete product
router.delete(
    '/delete/:id',
    requireSignIn,
    isAdmin,
    deleteProductController
)

//update-product
router.put(
    '/update/:id',
    requireSignIn,
    isAdmin,
    updateProductController
);

export default router