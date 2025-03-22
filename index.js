import express from 'express';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';


const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));
app.use(cookieParser());

connectDB();

app.use('/user', userRouter);




app.listen(3000, () => {
    console.log('Server is running on port 3000'); 
})