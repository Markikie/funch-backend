import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';

// Define your JWT secret key (consider using environment variables in production)
const jwtSecret = 'your-secret-key';

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) return reject(err);
            resolve(userData);
        });
    });
}

const bookings = async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const { place, checkIn, checkOut, maxGuests, name, phone, price } = req.body;

        const doc = await Booking.create({
            place, checkIn, checkOut, maxGuests, name, phone, price, user: userData._id
        });

        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getBookings = async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const bookings = await Booking.find({ user: userData._id }).populate('place');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Export using ES Modules syntax
export { bookings, getBookings };
