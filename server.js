const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Termux directory for storing uploads
const UPLOAD_DIR = "/data/data/com.termux/files/home/mew/uploads";
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Function to get the next image filename (1.jpg, 2.jpg, ...)
const getNextImageName = () => {
    const files = fs.readdirSync(UPLOAD_DIR).filter(file => file.match(/^\d+\.jpg$/));
    const numbers = files.map(file => parseInt(file)).filter(num => !isNaN(num));
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${nextNumber}.jpg`;
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, getNextImageName()); // Assign sequential filename
    }
});
const upload = multer({ storage: storage });

// Serve HTML file on the home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Handle product upload
app.post("/upload", upload.single("image"), (req, res) => {
    const { name, category, price, phone, location } = req.body;
    const imagePath = req.file ? req.file.filename : null; // Save only filename

    if (!name || !category || !price || !phone || !location || !imagePath) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    // Save product details to JSON file
    const productData = { name, category, price, phone, location, imagePath };
    const filePath = path.join(UPLOAD_DIR, "products.json");

    let products = [];
    if (fs.existsSync(filePath)) {
        products = JSON.parse(fs.readFileSync(filePath));
    }
    products.push(productData);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

    res.json({ message: "Product uploaded successfully!", product: productData });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
