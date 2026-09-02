const fs = require("fs")
const path = require("path")

async function downloadImage(imageUrl, filename) {

    const response = await fetch(imageUrl)

    if (!response.ok) {
        throw new Error("Failed to download product image")
    }

    const buffer = await response.arrayBuffer()

    const folder = "recommended"

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
    }

    const filePath = path.join(
        folder,
        filename
    )

    fs.writeFileSync(
        filePath,
        Buffer.from(buffer)
    )

    return filePath
}

module.exports = downloadImage