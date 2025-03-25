import express from 'express';
import { registerUser,loginUser, profile, logoutUser, upload, uploadPhotos, addPlace, getUserPlaces, getPlaces, getPlacesId,putPlaces } from '../controllers/userController.js';
import photoMiddleware from '../middlewares/multer.js';
import { bookings, getBookings } from '../controllers/bookingController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', profile)
userRouter.post('/logout', logoutUser);
userRouter.post('/upload-by-link', upload);
userRouter.post('/upload',photoMiddleware.array('photos', 100), uploadPhotos);
userRouter.post('/places', addPlace);
userRouter.get('/user-places', getUserPlaces);
userRouter.post('/bookings', bookings)
userRouter.get('/getBookings', getBookings)
userRouter.get('/getPlaces/:id', getPlacesId);
userRouter.get('/getPlaces', getPlaces);
userRouter.put('/putPlaces', putPlaces);

export default userRouter;