import colors from 'colors'
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoute from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cors from 'cors'
import corsOptions from './config/corsOptions.js'

dotenv.config()

connectDB()

const app = express()

app.use(cors(corsOptions));
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/product', productRoutes)

app.get('/welcome', (req, res) => {
    res.send('<h1 style="color: #007bff; font-family: Arial, sans-serif; text-align: center;">Welcome to E-Commerce App</h1>');
});

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.NODE_ENV} mode on ${PORT}`.bgGreen.white);
})
