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

//router
//create-category
router.post(
    '/create-category',
    requireSignIn,
    isAdmin,
    createCategoryController
);

//update-category
router.put(
    '/update-category/:id',
    requireSignIn,
    isAdmin,
    updateCategoryController
);

//get all category
router.get(
    '/get-all',
    categoryController
)

//get single category
router.get(
    '/get-one/:slug',
    singleCategoryController
)

//delete category
router.delete(
    '/delete/:id',
    requireSignIn,
    isAdmin,
    deleteCategoryController
)

export default router
