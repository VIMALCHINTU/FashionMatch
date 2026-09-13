const axios = require("axios");
require("dotenv").config();

async function test() {
  try {
    const response = await axios.get(
      "https://api.quickcommerceapi.com/v1/groupsearch",
      {
        params: {
          q: "shirt",
          platforms: "Amazon,Flipkart,Myntra",
          lat: 12.9,
          lon: 77.66
        },
        headers: {
          "X-API-Key": process.env.QUICKCOMMERCE_API_KEY
        }
      }
    );

    console.log("STATUS:", response.status);
    console.dir(response.data, { depth: null });

  } catch (error) {
    console.log("STATUS:", error.response?.status);
    console.dir(error.response?.data, { depth: null });
  }
}

test();