const fs = require("fs")
const path = require("path")

require("dotenv").config()


async function generateTryOn(personPath, clothPath) {

    try {

        const apikey = process.env.TRYONCLOUD_API_KEY

        // Read person image
        const fullbody = fs.readFileSync(personPath)

        // Read clothing image
        const item = fs.readFileSync(clothPath)


        const formdata = new FormData()

        formdata.append(
            "person_image",
            new Blob([fullbody]),
            "person.png"
        )

        formdata.append(
            "garment_image",
            new Blob([item]),
            "garment.png"
        )


        const res = await fetch(
            "https://www.tryoncloud.com/api/v1/generate",
            {
                method: "POST",

                headers: {
                    "X-API-KEY": apikey
                },

                body: formdata
            }
        )


        console.log("API STATUS:", res.status)


        // If API gives an error
        if (!res.ok) {

            const error = await res.text()

            console.log("API ERROR:", error)

            return null
        }


        // API returns an IMAGE
        const arrayBuffer = await res.arrayBuffer()

        // Convert image data into Node.js Buffer
        const imageBuffer = Buffer.from(arrayBuffer)


        // Create unique filename
        const filename = `generated-${Date.now()}.jpg`

        // Where to save it
        const generatedPath = path.join(
            "generated",
            filename
        )


        // Save generated image
        fs.writeFileSync(
            generatedPath,
            imageBuffer
        )


        console.log(
            "Generated image:",
            generatedPath
        )


        // Return the path
        return generatedPath


    } catch (error) {

        console.log(
            "TRYON ERROR:",
            error.message
        )

        return null
    }
}


module.exports = generateTryOn