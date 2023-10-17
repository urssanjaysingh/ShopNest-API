import Product from '../models/productModel.js';
import slugify from 'slugify';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import dotenv from 'dotenv'
import productModel from '../models/productModel.js';

dotenv.config()

// Use import.meta.url to get the URL of the current module file
const __filename = fileURLToPath(import.meta.url);
// Use dirname to get the directory name
const __dirname = dirname(__filename);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Multer storage for product image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    },
});

const upload = multer({ storage: storage }).single('photo');

export const createProductController = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.error('Error uploading product photo:', err);
                return res.status(500).json({ message: 'Error uploading product photo' });
            }

            const { name, description, price, category, quantity, shipping } = req.body;

            if (!name || !description || !price || !category || !quantity) {
                return res.status(400).json({ message: 'Please provide all required fields' });
            }

            try {
                // Handle product image upload to Cloudinary
                if (req.file) {
                    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });

                    // Transform the Cloudinary URL by appending transformation parameters
                    const cloudinaryBaseUrl = 'https://res.cloudinary.com/dewblf95z/image/upload/';
                    const transformedImageUrl = `${cloudinaryBaseUrl}w_640,h_640,c_fill/${result.public_id}.${result.format}`;

                    // Create a new product with the Cloudinary image URL
                    const newProduct = new Product({
                        name,
                        slug: slugify(name, {
                            replacement: '-',
                            lower: true,
                        }),
                        description,
                        price,
                        category,
                        quantity,
                        shipping,
                        photo: transformedImageUrl,
                    });

                    await newProduct.save();

                    res.status(201).send({
                        success: true,
                        message: 'Product Created Successfully',
                        product: newProduct,
                    });
                } else {
                    return res.status(400).send({ message: 'Product photo is required' });
                }
            } catch (error) {
                console.error('Error creating product:', error);
                return res.status(500).send({
                    success: false,
                    error,
                    message: 'Internal server error'
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in creating product',
        });
    }
};

//get all products
export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate('category').sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            totalCount: products.length,
            message: 'All Products',
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Getting Products',
            error: error.message
        })
    }
}

//get single product
export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug }).populate('category');
        res.status(200).send({
            success: true,
            message: 'Received Product',
            product
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while getting single product',
            error
        })
    }
}

//delete a product
export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.id)
        res.status(200).send({
            success: true,
            message: 'Product Deleted Successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while deleting the product',
            error
        })
    }
}

//update product
export const updateProductController = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.error('Error uploading product photo:', err);
                return res.status(500).json({ message: 'Error uploading product photo' });
            }

            const { name, description, price, category, quantity, shipping } = req.body;

            if (!name || !description || !price || !category || !quantity) {
                return res.status(400).json({ message: 'Please provide all required fields' });
            }

            try {
                // Handle product image upload to Cloudinary (if a new image is provided)
                if (req.file) {
                    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });

                    // Transform the Cloudinary URL by appending transformation parameters
                    const cloudinaryBaseUrl = 'https://res.cloudinary.com/dewblf95z/image/upload/';
                    const transformedImageUrl = `${cloudinaryBaseUrl}w_400,h_400,c_fill/${result.public_id}.${result.format}`;

                    // Update the product with the new Cloudinary image URL
                    const updatedProduct = await Product.findByIdAndUpdate(
                        req.params.id,
                        {
                            name,
                            slug: slugify(name, {
                                replacement: '-',
                                lower: true,
                            }),
                            description,
                            price,
                            category,
                            quantity,
                            shipping,
                            photo: transformedImageUrl,
                        },
                        { new: true } // Return the updated product
                    );

                    if (!updatedProduct) {
                        return res.status(404).json({ message: 'Product not found' });
                    }

                    res.status(200).json({
                        success: true,
                        message: 'Product Updated Successfully',
                        product: updatedProduct,
                    });
                } else {
                    // No new image provided, update the product without changing the photo
                    const updatedProduct = await Product.findByIdAndUpdate(
                        req.params.id,
                        {
                            name,
                            slug: slugify(name, {
                                replacement: '-',
                                lower: true,
                            }),
                            description,
                            price,
                            category,
                            quantity,
                            shipping,
                        },
                        { new: true }
                    );

                    if (!updatedProduct) {
                        return res.status(404).json({ message: 'Product not found' });
                    }

                    res.status(200).json({
                        success: true,
                        message: 'Product Updated Successfully',
                        product: updatedProduct,
                    });
                }
            } catch (error) {
                console.error('Error updating product:', error);
                return res.status(500).json({
                    success: false,
                    error,
                    message: 'Internal server error',
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error,
            message: 'Error in updating product',
        });
    }
}

export const productFiltersController = async (req, res) => {
    try {
        const checked = req.body.checked || []; 
        const radio = req.body.radio || [];     

        let args = {};

        if (checked.length > 0) {
            args.category = checked;
        }

        if (radio.length === 2) { // Check if radio is an array with two values
            args.price = { $gte: radio[0], $lte: radio[1] };
        }

        const products = await productModel.find(args);

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: 'Error while filtering products',
            error,
        });
    }
};
