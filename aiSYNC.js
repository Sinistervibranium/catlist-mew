const fs = require("fs");
const { exec } = require("child_process");
const path = "/data/data/com.termux/files/home/mew/uploads/products.json";
const uploadSrc = "/data/data/com.termux/files/home/mew/uploads/";
const uploadDest = "/data/data/com.termux/files/home/catlist-mew/uploads/";
const outputPath = "/data/data/com.termux/files/home/catlist-mew/index.html";

// Ensure the destination uploads directory exists
if (!fs.existsSync(uploadDest)) {
    fs.mkdirSync(uploadDest, { recursive: true });
}

if (!fs.existsSync(path)) {
    console.log("❌ products.json not found!");
    process.exit(1);
}

const products = JSON.parse(fs.readFileSync(path, "utf-8"));

let html = `
<!DOCTYPE html>
<html>
<head>
    <title>CatList Products</title>
    <style>
        body { font-family: Arial; background: #f0f0f0; padding: 20px; }
        .product { background: white; padding: 10px; margin-bottom: 10px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        img { max-width: 100%; height: auto; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>Uploaded Products</h1>
`;

products.forEach((p, index) => {
    const imageName = `${index + 1}.jpg`;
    const srcImagePath = `${uploadSrc}${imageName}`;
    const destImagePath = `${uploadDest}${imageName}`;

    // Copy image to repository folder if it exists
    if (fs.existsSync(srcImagePath)) {
        fs.copyFileSync(srcImagePath, destImagePath);
    }

    html += `
    <div class="product">
        <img src="uploads/${imageName}" alt="Product ${index + 1}">
        <h2>${p.name}</h2>
        <p>Category: ${p.category}</p>
        <p>Price: ₹${p.price}</p>
        <p>Phone: ${p.phone}</p>
        <p>Location: ${p.location}</p>
    </div>`;
});

html += `</body></html>`;

fs.writeFileSync(outputPath, html, "utf-8");
console.log("✅ index.html updated.");

// Git commands to commit everything (including images)
const gitCmd = `
cd /data/data/com.termux/files/home/catlist-mew &&
git add . &&
git commit -m "Auto-update from AI sync tool with images" &&
git push origin main
`;

exec(gitCmd, (err, stdout, stderr) => {
    if (err) {
        console.log("❌ Git Error:", err.message);
        return;
    }
    console.log("✅ GitHub updated with new products and images.");
});
