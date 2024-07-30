require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
// Router
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const searchRoutes = require('./routes/searchRoutes');

const port = 3000;

const app = express();


app.use(express.json());
app.use('/auths', userRouter);
app.use('/posts', postRouter);
app.use('/favorites', favoritesRoutes);
app.use('/searchs', searchRoutes);

connectDB();

app.listen(port, () => {
  console.log(`RentEasy app listening at http://localhost:${port}`);
});
