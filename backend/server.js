const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const { startScheduler } = require('./scheduler');

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/disposals', require('./routes/disposalRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        // Start Scheduler after DB connection
        startScheduler();

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.error('Failed to connect to the database. Server not started.');
        process.exit(1);
    }
};

startServer();
