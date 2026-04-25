require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// --- RAZORPAY CONFIGURATION (Environment Variables) ---
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SgTw7TKyjOV9XF';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'HJel3tEZfwea9N4aGQ2LZlVq';
// -----------------------------------------------------

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

const app = express();
app.use(cors());
app.use(express.json());

// Root route for health checks (Required for Render)
app.get('/', (req, res) => {
    res.send('Samriddhi Enterprises Backend is Running!');
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vendorDB';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: String, default: '' }
});
const User = mongoose.model('User', UserSchema);

const AppointmentSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    service: String,
    date: String,
    timeSlot: String,
    status: { type: String, default: 'Pending' },
    paymentStatus: { type: String, default: 'Pending' },
    order_id: String,
    payment_id: String
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);

const FeedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    service: String,
    rating: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// Auth Middleware (Optional, for protecting routes)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret123');
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body; // HTML has only Username and Password
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' });
        res.json({ success: true, token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Profile Management
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/api/user/update-profile', verifyToken, async (req, res) => {
    try {
        const { username, dob, originalPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update basic info
        if (username) user.username = username;
        if (dob) user.dob = dob;

        // Update password if requested
        if (originalPassword && newPassword) {
            const isMatch = await bcrypt.compare(originalPassword, user.password);
            if (!isMatch) return res.status(400).json({ error: 'Original password does not match' });

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
        }

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', username: user.username });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) return res.status(400).json({ error: 'Username already taken' });
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get Slots
app.get('/api/available-slots', (req, res) => {
    // Generate dummy slots for demonstration
    const slots = [
        { label: '10:00 AM', value: '10:00' },
        { label: '11:00 AM', value: '11:00' },
        { label: '01:00 PM', value: '13:00' },
        { label: '03:00 PM', value: '15:00' }
    ];
    res.json({ slots });
});

// Create Order
app.post('/api/create-order', async (req, res) => {
    try {
        const { name, mobile, email, service, date, timeSlot } = req.body;

        // 1. Create Order in Razorpay SDK
        const options = {
            amount: 50 * 100, // Amount in paise (50 INR)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // 2. Save Pending Appointment in MongoDB
        const newAppointment = new Appointment({
            name, mobile, email, service, date, timeSlot, order_id: order.id
        });
        await newAppointment.save();

        // 3. Return real data to frontend
        res.json({
            key_id: RAZORPAY_KEY_ID,
            amount: order.amount,
            order_id: order.id,
            booking_id: newAppointment._id
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, test_bypass } = req.body;

        // 1. Check for Test Mode Auto-Confirm Bypass
        const isTestKey = RAZORPAY_KEY_ID && RAZORPAY_KEY_ID.startsWith('rzp_test');
        if (test_bypass && isTestKey) {
            await Appointment.findByIdAndUpdate(booking_id, { 
                status: 'Confirmed', 
                paymentStatus: 'Done',
                payment_id: 'Test_Bypass_' + Date.now()
            });
            return res.json({ success: true, message: 'Auto-confirmed (Test Mode)' });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
             return res.status(400).json({ success: false, error: 'Missing payment details' });
        }

        // Standard Signature verification
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            await Appointment.findByIdAndUpdate(booking_id, { 
                status: 'Confirmed',
                paymentStatus: 'Done',
                payment_id: razorpay_payment_id
            });
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Signature verification failed' });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Send Feedback
app.post('/send-feedback', async (req, res) => {
    try {
        const { name, email, subject, service, rating, message } = req.body;
        const newFeedback = new Feedback({ name, email, subject, service, rating, message });
        await newFeedback.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
