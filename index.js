const express = require("express");
const { db } = require("./firebaseConfig"); // Firebase config
const cors = require("cors");
const { Parser } = require("json2csv");
const app = express();
const port = 5000;

app.use(express.json());

// List of allowed domains
const allowedOrigins = ["http://localhost:3000", "https://online-store.web.app"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

// Routes for customer authentication
app.post("/signup", async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        await db.collection("Customers").doc(userRecord.uid).set({
            name,
            email,
            createdAt: new Date(),
        });

        res.status(201).json({ user: userRecord });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ error: "Failed to create customer" });
    }
});

app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const userRecord = await admin.auth().getUserByEmail(email);
        // Handle password verification using Firebase Client SDK or custom authentication.

        res.status(200).json({ user: userRecord });
    } catch (error) {
        console.error("Error signing in customer:", error);
        res.status(500).json({ error: "Failed to sign in customer" });
    }
});

// Product routes
app.get("/Products", async (req, res) => {
    try {
        const productSnapshot = await db.collection("Products").get();
        const productList = [];

        productSnapshot.forEach((doc) => productList.push({ id: doc.id, ...doc.data() }));

        res.status(200).json({ products: productList });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.get("/Products/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const productDoc = await db.collection("Products").doc(productId).get();

        if (!productDoc.exists) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ product: productDoc.data() });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

app.post("/Products", async (req, res) => {
    try {
        const { name, price, stock, description } = req.body;

        const newProduct = {
            name,
            price,
            stock,
            description,
            createdAt: new Date(),
        };

        const docRef = await db.collection("Products").add(newProduct);

        res.status(201).json({ id: docRef.id, product: newProduct });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
});

app.patch("/Products/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;

        await db.collection("Products").doc(productId).update(updates);

        res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

app.delete("/Products/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        await db.collection("Products").doc(productId).delete();

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// Order routes
app.post("/Orders", async (req, res) => {
    try {
        const { customerId, items, total } = req.body;

        const newOrder = {
            customerId,
            items,
            total,
            status: "Pending",
            createdAt: new Date(),
        };

        const docRef = await db.collection("Orders").add(newOrder);

        res.status(201).json({ id: docRef.id, order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

app.get("/Orders/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        const orderDoc = await db.collection("Orders").doc(orderId).get();

        if (!orderDoc.exists) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ order: orderDoc.data() });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

app.patch("/Orders/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        const updates = req.body;

        await db.collection("Orders").doc(orderId).update(updates);

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Failed to update order" });
    }
});

app.delete("/Orders/:id", async (req, res) => {
    try {
        const orderId = req.params.id;

        await db.collection("Orders").doc(orderId).delete();

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ error: "Failed to delete order" });
    }
});

app.listen(port, () => {
    console.log(`Online store API running at http://localhost:${port}`);
});
