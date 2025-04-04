const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const productsFile = "/data/data/com.termux/files/home/catlist-mew/uploads/products.json";
const indexFile = "/data/data/com.termux/files/home/catlist-mew/index.html";
const repoDir = "/data/data/com.termux/files/home/catlist-mew";

function updateIndexFile() {
    if (!fs.existsSync(productsFile)) {
        console.log("No products.json found! Waiting for new uploads...");
        return;
    }

    let products;
    try {
        products = JSON.parse(fs.readFileSync(productsFile, "utf8"));
    } catch (err) {
        console.error("❌ Error parsing products.json:", err.message);
        return;
    }

    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CatList Products</title>
<style>
    body { font-family: Arial; background: #111; color: white; padding: 20px; }
    h1 { text-align: center; color: gold; }
    ul { list-style: none; padding: 0; }
    li { background: #222; padding: 15px; margin: 10px 0; border-radius: 10px; box-shadow: 0 0 10px rgba(255,255,255,0.1); }
    img { max-width: 100%; border-radius: 10px; }
</style>
</head>
<body>
<h1>CatList - Product Listings</h1>
<ul>`;

    products.forEach((product) => {
        htmlContent += `<li>
            <strong>${product.name}</strong><br>
            Category: ${product.category}<br>
            Price: ₹${product.price}<br>
            Contact: <a href="tel:${product.phone}" style="color:cyan">${product.phone}</a><br>
            Location: ${product.location || "Not mentioned"}<br>
            <img src="${product.image}" alt="Product Image">
        </li>`;
    });

    htmlContent += `</ul></body></html>`;
    fs.writeFileSync(indexFile, htmlContent);
    console.log("✅ index.html updated!");

    commitAndPush();
}

function commitAndPush() {
    const gitCommands = `
        cd ${repoDir} &&
        git add . &&
        git commit -m "Updated product listings" &&
        git push origin main
    `;

    exec(gitCommands, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Git Error:", error.message);
            console.error(stderr);
        } else {
            console.log(stdout);
            console.log("✅ Changes pushed to GitHub!");
        }
    });
}

setInterval(updateIndexFile, 60000); // Run every 60 seconds
