import Product from '../models/productModel.js';
import slugify from 'slugify';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import dotenv from 'dotenv'
import productModel from '../models/productModel.js';
import categoryModel from "../models/categoryModel.js";
import orderModel from '../models/orderModel.js';
import braintree from 'braintree';

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
                if (req.file) {
                    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });

                    const cloudinaryBaseUrl = 'https://res.cloudinary.com/dewblf95z/image/upload/';
                    const transformedImageUrl = `${cloudinaryBaseUrl}w_640,h_640,c_fill/${result.public_id}.${result.format}`;

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
                if (req.file) {
                    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });

                    const cloudinaryBaseUrl = 'https://res.cloudinary.com/dewblf95z/image/upload/';
                    const transformedImageUrl = `${cloudinaryBaseUrl}w_400,h_400,c_fill/${result.public_id}.${result.format}`;

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
                } else {
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
        const { checked, radio } = req.body;
        let query = {};

        if (checked && checked.length > 0) {
            query.category = { $in: checked };
        }

        if (radio && radio.length === 2) {
            query.price = { $gte: radio[0], $lte: radio[1] };
        }

        const products = await Product.find(query).exec();

        if (!products || products.length === 0) {
            res.status(200).json({
                success: true,
                message: "No Products Found",
                products: [],
            });
            return;
        }

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: 'Error while filtering products',
            error: error.message,
        });
    }
};

export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success: true,
            total
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            message: 'Error in product count',
            error,
            success: false
        })
    }
}

export const productListController = async (req, res) => {
    try {
        const perPage = 20
        const page = req.params.page ? req.params.page : 1
        const products = await productModel
            .find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
        res.status(200).send({
            success: true,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'error in per page controller',
            error
        })
    }
}

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params
        const results = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        })
        res.json(results)
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while Searching Product',
            error
        })
    }
}

export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params
        const products = await productModel.find({
            category: cid,
            _id: { $ne: pid }
        }).limit(3).populate("category")
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while getting related products',
            error
        })
    }
}

export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug })
        const products = await productModel.find({ category }).populate('category')
        res.status(200).send({
            success: true,
            category,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while getting products by category'
        })
    }
}

export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(response);
            }
        })
    } catch (error) {
        console.log(error)
    }
};

export const braintreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body;
        if (!Array.isArray(cart)) {
            return res.status(400).json({ error: "Cart should be an array" });
        }

        let total = 0;
        cart.forEach((item) => {
            total += item.price;
        });

        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id
                    }).save()
                    res.json({ ok: true });
                } else {
                    res.status(500).send(error);
                }
            });
    } catch (error) {
        console.log(error);
    }
};
