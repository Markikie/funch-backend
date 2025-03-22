import express from 'express';
import { registerUser,loginUser, profile, logoutUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', profile)
userRouter.post('/logout', logoutUser);

export default userRouter;