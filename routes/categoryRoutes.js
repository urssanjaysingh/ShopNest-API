import express from 'express'
import {
    isAdmin,
    requireSignIn
} from '../middlewares/authMiddleware.js'
import {
    categoryController,
    createCategoryController,
    deleteCategoryController,
    singleCategoryController,
    updateCategoryController
} from '../controllers/categoryController.js'

const router = express.Router()

router.post(
    '/create',
    requireSignIn,
    isAdmin,
    createCategoryController
);

router.put(
    '/update/:id',
    requireSignIn,
    isAdmin,
    updateCategoryController
);

router.get(
    '/get-all',
    categoryController
)

router.get(
    '/get-one/:slug',
    singleCategoryController
)

router.delete(
    '/delete/:id',
    requireSignIn,
    isAdmin,
    deleteCategoryController
)

export default router
