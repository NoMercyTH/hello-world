const express = require('express');
const cors = require('cors');
const path = require('path');

const categoriesRouter = require('./routes/categories');
const itemsRouter = require('./routes/items');
const dashboardRouter = require('./routes/dashboard');
const dataRouter = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/data', dataRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
