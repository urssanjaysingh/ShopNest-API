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
import path from 'path'

dotenv.config()

connectDB()

const app = express()

app.use(cors(corsOptions));
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/product', productRoutes)

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.NODE_ENV} mode on ${PORT}`.bgGreen.white);
})
