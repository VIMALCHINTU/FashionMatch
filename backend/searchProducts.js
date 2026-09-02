require("dotenv").config();

const axios = require("axios");

async function searchProducts(query) {
  try {
    console.log("\n==============================");
    console.log("SEARCHING FOR:", query);
    console.log("==============================");

    const apiKey = process.env.QUICKCOMMERCE_API_KEY;

    if (!apiKey) {
      console.log("ERROR: QUICKCOMMERCE_API_KEY is missing");
      return [];
    }

    const response = await axios.get(
      "https://api.quickcommerceapi.com/v1/groupsearch",
      {
        params: {
          q: query,
          platforms: "Amazon,Flipkart,Myntra",
          lat: 12.9,
          lon: 77.66
        },

        headers: {
          "X-API-Key": apiKey
        }
      }
    );

    console.log("PRODUCT API STATUS:", response.status);

    const apiData = response.data;

    // Your API structure:
    // apiData.data.results.Amazon
    // apiData.data.results.Flipkart
    // apiData.data.results.Myntra

    const results = apiData?.data?.results;

    if (!results || typeof results !== "object") {
      console.log("NO PRODUCT RESULTS FOUND");

      console.dir(apiData, {
        depth: null
      });

      return [];
    }

    const platforms = [
      "Amazon",
      "Flipkart",
      "Myntra"
    ];

    const selectedProducts = [];

    // Get top product from each platform
    for (const platformName of platforms) {

      const products = results[platformName];

      if (
        !Array.isArray(products) ||
        products.length === 0
      ) {
        console.log(
          `No products found on ${platformName}`
        );

        continue;
      }

      // Take first product
      const product = products[0];

      console.log(
        `\nTOP PRODUCT FROM ${platformName}:`
      );

      console.dir(product, {
        depth: null
      });

      // ============================
      // GET IMAGE
      // ============================

      let productImage = null;

      if (Array.isArray(product.images)) {

        const firstImage = product.images[0];

        if (typeof firstImage === "string") {
          productImage = firstImage;
        }

        else if (
          typeof firstImage === "object" &&
          firstImage !== null
        ) {
          productImage =
            firstImage.url ||
            firstImage.src ||
            firstImage.image ||
            null;
        }
      }

      // Alternative possible image fields
      if (!productImage) {
        productImage =
          product.image ||
          product.image_url ||
          product.imageUrl ||
          product.thumbnail ||
          null;
      }

      // ============================
      // PRICE
      // ============================

      const price =
        product.offer_price ??
        product.price ??
        product.sale_price ??
        product.mrp ??
        null;

      // ============================
      // PRODUCT URL
      // ============================

      const productUrl =
        product.deeplink ||
        product.url ||
        product.product_url ||
        product.link ||
        null;

      // ============================
      // SAVE PRODUCT
      // ============================

      const formattedProduct = {

        id: product.id || null,

        name:
          product.name ||
          product.title ||
          "Product",

        image: productImage,

        price: price,

        mrp:
          product.mrp ??
          null,

        url: productUrl,

        platform: platformName,

        rating:
          product.rating ??
          null,

        ratingCount:
          product.ratingCount ??
          product.rating_count ??
          0
      };

      selectedProducts.push(formattedProduct);

      console.log(
        "SELECTED PRODUCT:"
      );

      console.dir(formattedProduct, {
        depth: null
      });
    }

    console.log("\n==============================");
    console.log("FINAL SELECTED PRODUCTS:");
    console.log("==============================");

    console.dir(selectedProducts, {
      depth: null
    });

    return selectedProducts;

  } catch (error) {

    console.log("\nPRODUCT SEARCH ERROR:");

    console.dir(
      error.response?.data || error.message,
      {
        depth: null
      }
    );

    return [];
  }
}

module.exports = searchProducts;