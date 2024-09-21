const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

let data;
let cartData;

// Read cat.json
try {
  const filePath = path.join(__dirname, "cat.json");
  data = JSON.parse(fs.readFileSync(filePath, "utf8"));
} catch (error) {
  console.error("Error reading cat.json:", error);
  process.exit(1);
}

// Read cart.json
try {
  const cartPath = path.join(__dirname, "cart.json");
  cartData = JSON.parse(fs.readFileSync(cartPath, "utf8"));
} catch (error) {
  console.error("Error reading cart.json:", error);
  process.exit(1);
}

// 1. Get all categories
app.get("/categories", (req, res) => {
  if (data && data.categories) {
    res.json({ categories: data.categories });
  } else {
    res.status(500).json({ message: "Categories data not available" });
  }
});

// 2. Get products by category ID
app.get("/products/:cat_id", (req, res) => {
  const cat_id = parseInt(req.params.cat_id);
  const category = data.categories.find((cat) => cat.cat_id === cat_id);
  if (category) {
    res.json({ category });
  } else {
    res.status(404).json({ message: "Category not found" });
  }
});

// 3. Get product by product ID
app.get("/product/:product_id", (req, res) => {
  const product_id = parseInt(req.params.product_id);
  let foundProduct = null;

  data.categories.forEach((category) => {
    const product = category.items.find(
      (item) => item.product_id === product_id
    );
    if (product) {
      foundProduct = product;
    }
  });

  if (foundProduct) {
    res.json({ product: foundProduct });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// 4. Add item to cart
app.post("/cart/add", (req, res) => {
  const { product_id, quantity } = req.body;

  const product = data.categories
    .flatMap((category) => category.items)
    .find((item) => item.product_id === product_id);

  if (product) {
    const cartItem = { ...product, quantity: quantity || 1 };
    cartData.items.push(cartItem);

    fs.writeFileSync(
      path.join(__dirname, "cart.json"),
      JSON.stringify(cartData, null, 2)
    );
    res.status(201).json({ message: "Item added to cart", cartItem });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// 5. Delete item from cart
app.delete("/cart/remove/:product_id", (req, res) => {
  const product_id = parseInt(req.params.product_id);
  const initialLength = cartData.items.length;

  cartData.items = cartData.items.filter(
    (item) => item.product_id !== product_id
  );

  if (cartData.items.length < initialLength) {
    fs.writeFileSync(
      path.join(__dirname, "cart.json"),
      JSON.stringify(cartData, null, 2)
    );
    res.json({ message: "Item removed from cart" });
  } else {
    res.status(404).json({ message: "Product not found in cart" });
  }
});

// Get all cart items
app.get("/cart", (req, res) => {
  if (cartData && cartData.items) {
    res.json({ items: cartData.items });
  } else {
    res.status(500).json({ message: "Cart data not available" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
