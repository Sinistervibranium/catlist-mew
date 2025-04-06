import os
import json
import subprocess
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, CommandHandler, ContextTypes, filters

# Paths
UPLOAD_FOLDER = "/data/data/com.termux/files/home/lovely-mew-bot/uploads/"
JSON_FILE = "/data/data/com.termux/files/home/lovely-mew-bot/products.json"

# In-memory user sessions
user_sessions = {}

# Start command
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Welcome to Lovely-Mew Uploader!\n\nSend product details like:\n"
        "Name: Awesome Shoes\nCategory: Fashion\nPrice: 999\nPhone: 9999999999\n"
        "Location: Delhi\nOwner: Ali"
    )

# Receive product text info
async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.message.chat_id
    user_sessions[chat_id] = update.message.text
    await update.message.reply_text("Now send the product image...")

# Receive photo, compress, save JSON, push to GitHub
async def image_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.message.chat_id
    if chat_id not in user_sessions:
        await update.message.reply_text("Please send product details first.")
        return

    # Get file
    file = await context.bot.get_file(update.message.photo[-1].file_id)
    file_id = update.message.photo[-1].file_id
    original_path = f"{UPLOAD_FOLDER}{file_id}_original.jpg"
    compressed_path = f"{UPLOAD_FOLDER}{file_id}.jpg"

    await file.download_to_drive(original_path)

    # Compress with ffmpeg
    subprocess.run([
        'ffmpeg', '-y', '-i', original_path,
        '-vf', 'scale=800:1600',
        '-q:v', '5',
        '-frames:v', '1',
        compressed_path
    ])

    # Delete original
    os.remove(original_path)

    # Process product details
    data = user_sessions.pop(chat_id)
    lines = [line.split(": ", 1) for line in data.split("\n") if ": " in line]
    product = {k.lower(): v for k, v in lines}
    product["image"] = "uploads/" + os.path.basename(compressed_path)

    # Ensure JSON file exists
    if not os.path.exists(JSON_FILE):
        with open(JSON_FILE, "w", encoding="utf-8") as f:
            f.write("[]")

    # Save product to JSON
    with open(JSON_FILE, "r+", encoding="utf-8") as f:
        products = json.load(f)
        products.append(product)
        f.seek(0)
        json.dump(products, f, indent=2)

    await update.message.reply_text("Product saved & image compressed!")

    # Ensure site upload folder exists
    site_upload_folder = "/data/data/com.termux/files/home/lovely-mew/uploads"
    if not os.path.exists(site_upload_folder):
        os.makedirs(site_upload_folder)

    # Auto Git push
    subprocess.run("""
cd /data/data/com.termux/files/home/lovely-mew || exit
cp /data/data/com.termux/files/home/lovely-mew-bot/products.json ./
cp /data/data/com.termux/files/home/lovely-mew-bot/uploads/* uploads/
git add .
git commit -m 'Auto: New product'
git push || git push --set-upstream origin main
""", shell=True)

# Run bot
if __name__ == "__main__":
    app = ApplicationBuilder().token("8089749139:AAG9O61CuSjZ1vNOFeSG8rmSuQV8so7tPRM").build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))
    app.add_handler(MessageHandler(filters.PHOTO, image_handler))

    print("Bot is running...")
    app.run_polling()
