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

    const products = JSON.parse(fs.readFileSync(productsFile, "utf8"));
    
    let htmlContent = `<html><head><title>CatList Products</title></head><body>`;
    htmlContent += `<h1>Product Listings</h1><ul>`;
    
    products.forEach((product, i) => {
        htmlContent += `<li>
            <strong>${product.name}</strong><br>
            Category: ${product.category}<br>
            Price: ${product.price}<br>
            Contact: ${product.phone}<br>
            Location: ${product.location}<br>
            <img src="uploads/${i + 1}.jpg" width="200">
        </li><hr>`;
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
            console.error("❌ Git Error:", stderr);
        } else {
            console.log("✅ Changes pushed to GitHub!");
        }
    });
}

// **Run this script every 60 seconds**
setInterval(updateIndexFile, 60000);
