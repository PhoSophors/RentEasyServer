require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
// Router
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messageRouter = require('./routes/messageRoutes');
const adminRouter = require('./routes/adminRoutes');
const roleAndPermissonRoutes = require('./routes/roleAndPermissonRoutes');
const createDefaultAdmin = require('./middleware/createDefaultAdminMiddleware');

const port = 3000;

const app = express();

// Create default admin user
createDefaultAdmin();

app.use(express.json());
app.use('/auths', userRouter);
app.use('/posts', postRouter);
app.use('/favorites', favoritesRoutes);
app.use('/searchs', searchRoutes);
app.use('/messages', messageRouter);

// Admin routes
app.use('/admin', adminRouter);

// role route
app.use('/roles', roleAndPermissonRoutes);

connectDB();

app.listen(port, () => {
  console.log(`RentEasy app listening at http://localhost:${port}`);
});
