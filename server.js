const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); 

const app = express();
const PORT = 3000;

app.use(cors());

// Read cat.json
const data = JSON.parse(fs.readFileSync('cat.json', 'utf8'));

// 1. Get all categories
app.get('/categories', (req, res) => {
  res.json({ categories: data.categories });
});

// 2. Get products by category ID
app.get('/products/:cat_id', (req, res) => {
  const cat_id = parseInt(req.params.cat_id);
  const category = data.categories.find(cat => cat.cat_id === cat_id);

  if (category) {
    res.json({ category });
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

// 3. Get product by product ID
app.get('/product/:product_id', (req, res) => {
  const product_id = parseInt(req.params.product_id);
  let foundProduct = null;

  data.categories.forEach(category => {
    const product = category.items.find(item => item.product_id === product_id);
    if (product) {
      foundProduct = product;
    }
  });

  if (foundProduct) {
    res.json({ product: foundProduct });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
