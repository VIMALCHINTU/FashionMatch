require("dotenv").config()

async function testProducts() {
  try {
    const searchQuery =
      "mens beige relaxed fit casual trousers"

    const url =
      `https://api.quickcommerceapi.com/v1/groupsearch` +
      `?q=${encodeURIComponent(searchQuery)}` +
      `&lat=12.90` +
      `&lon=77.66` +
      `&platforms=Amazon,Flipkart,Myntra` +
      `&group=true`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": process.env.QUICKCOMMERCE_API_KEY
      }
    })

    const data = await response.json()

    console.log("STATUS:", response.status)

    if (!response.ok) {
      console.log(data)
      return
    }

    const finalProducts = []

    for (const group of data.data.groups) {

      const platform =
        group.platform

      const products =
        group.data || []

      // Sort products by rating: highest first
      products.sort((a, b) => {
        return (b.rating || 0) - (a.rating || 0)
      })

      // Take only top 1
      const product = products[0]

      if (!product) continue

      finalProducts.push({
        platform: platform,

        image: product.images?.[0] || null,

        price:
          product.offer_price ||
          product.price ||
          product.mrp ||
          null,

        rating: product.rating || 0,

        url: product.deeplink || null
      })
    }

    console.log("\nFINAL TOP PRODUCTS:")

    console.log(JSON.stringify(finalProducts, null, 2))

  } catch (error) {

    console.log("ERROR:", error.message)

  }
}

testProducts()