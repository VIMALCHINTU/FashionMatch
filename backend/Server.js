require("dotenv").config()

const express = require("express")
const multer = require("multer")
const cors = require("cors")
const generateTryOn = require("./tryon")
const recommendMissingItems=require("./Recommend")
const cloudinary =
  require("./cloudinary");
  const mongoose =require("mongoose")

const User =
  require("./models/user");

const authMiddleware =
  require("./middleware/authMiddleware");

  const bcrypt =require("bcrypt")
const jwt =
  require("jsonwebtoken");

const searchProducts =
    require("./searchProducts")

const downloadImage =
    require("./downloadImage")

const recommendTotalOutfit =
  require("./recommendTotalOutfit");


const app = express()

app.use(express.json())
app.use(cors())
app.use("/generated", express.static("generated"))


const storage = multer.diskStorage({
    destination: "fullbody/"
})

const upload = multer({
    storage: storage
})



app.post(
  "/register",

  async (req, res) => {
    console.log("REGISTER BODY:", req.body);

    try {

      const {
        name,
        email,
        password
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          message:
            "Name, email and password are required"
        });

      }

      const existingUser =
        await User.findOne({
          email
        });

      if (existingUser) {

        return res.status(400).json({
          message:
            "User already exists"
        });

      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name,
          email,
          password:
            hashedPassword
        });

      const token =
        jwt.sign(
          {
            userId:
              user._id
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "7d"
          }
        );

      res.status(201).json({

        message:
          "Registration successful",

        token,

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          fullBodyImage:
            user.fullBodyImage
        }

      });

    } catch (error) {

      console.log(
        "REGISTER ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Registration failed"
      });

    }

  }
);




app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fullBodyImage: user.fullBodyImage
      }
    });

  } catch (error) {

    console.log(
      "LOGIN ERROR:",
      error.message
    );

    return res.status(500).json({
      message: "Login failed"
    });
  }
});

app.post(
  "/upload-fullbody",

  authMiddleware,

  upload.single("fullbody"),

  async (req, res) => {

    try {

      console.log("========== FULL BODY UPLOAD ==========");

      console.log("REQ FILE:", req.file);

      if (!req.file) {

        return res.status(400).json({
          message: "Full body image is required"
        });

      }

      const user = await User.findById(
        req.userId
      );

      if (!user) {

        return res.status(404).json({
          message: "User not found"
        });

      }

      // Delete old image

      if (
        user.fullBodyImage?.publicId
      ) {

        await cloudinary.uploader.destroy(
          user.fullBodyImage.publicId
        );

      }

      // Upload using FILE PATH
      // because you are using multer.diskStorage

      const uploadResult =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            folder:
              "fashionmatch/fullbody",

            resource_type:
              "image"
          }
        );

      console.log(
        "CLOUDINARY URL:",
        uploadResult.secure_url
      );

      // Save in MongoDB

      user.fullBodyImage = {

        url:
          uploadResult.secure_url,

        publicId:
          uploadResult.public_id

      };

      await user.save();

      await user.save();

const savedUser = await User.findById(user._id);

console.log("DATABASE CHECK:", {
  id: savedUser._id.toString(),
  email: savedUser.email,
  image: savedUser.fullBodyImage,
  updatedAt: savedUser.updatedAt
});

      return res.status(200).json({

        message:
          "Full body image saved successfully",

        fullBodyImage:
          user.fullBodyImage

      });

    } catch (error) {

      console.log(
        "========== UPLOAD ERROR =========="
      );

      console.log(
        "UPLOAD FULLBODY ERROR:",
        error.message
      );

      return res.status(500).json({

        message:
          "Failed to upload full body image",

        error:
          error.message

      });

    }

  }
);



app.get(
  "/profile",

  authMiddleware,

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.userId
        ).select(
          "-password"
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found"
        });

      }

      res.json({
        user
      });

    } catch (error) {

      res.status(500).json({
        message:
          "Failed to get profile"
      });

    }

  }
);


// ======================================
// FULL BODY UPLOAD
// ======================================






app.post(
    "/fullbody",
    upload.single("fullbody"),
    (req, res) => {

        console.log(req.file)

        res.status(201).json({
            message: "Full body uploaded"
        })

    }
)


// ======================================
// TRY ON
// ======================================

app.post(
    "/tryon",

    upload.fields([
        { name: "fullbody", maxCount: 1 },
        { name: "shirt", maxCount: 1 },
        { name: "pant", maxCount: 1 },
        { name: "shoes", maxCount: 1 }
    ]),

    async (req, res) => {

        try {

            // Get uploaded files
            const fullbody = req.files.fullbody[0]

            const shirt = req.files.shirt
                ? req.files.shirt[0]
                : null

            const pant = req.files.pant
                ? req.files.pant[0]
                : null

            const shoes = req.files.shoes
                ? req.files.shoes[0]
                : null


            // Check required full body image
            if (!fullbody) {

                return res.status(400).json({
                    message: "Full body image is required"
                })

            }


            console.log("FULLBODY PATH:", fullbody.path)
            console.log("SHIRT PATH:", shirt?.path)
            console.log("PANT PATH:", pant?.path)
            console.log("SHOES PATH:", shoes?.path)


            // Initially use original person image
            let currentPerson = fullbody.path


            // =============================
            // SHIRT
            // =============================

            if (shirt) {

                const shirtResult =
                    await generateTryOn(
                        currentPerson,
                        shirt.path
                    )


                if (!shirtResult) {

                    return res.status(500).json({
                        message: "Shirt try-on failed"
                    })

                }


                currentPerson = shirtResult
            }


            // =============================
            // PANT
            // =============================

            if (pant) {

                const pantResult =
                    await generateTryOn(
                        currentPerson,
                        pant.path
                    )


                if (!pantResult) {

                    return res.status(500).json({
                        message: "Pant try-on failed"
                    })

                }


                currentPerson = pantResult
            }


            // =============================
            // SHOES
            // =============================

            if (shoes) {

                const shoesResult =
                    await generateTryOn(
                        currentPerson,
                        shoes.path
                    )


                if (!shoesResult) {

                    return res.status(500).json({
                        message: "Shoes try-on failed"
                    })

                }


                currentPerson = shoesResult
            }


            // =============================
            // FINAL RESPONSE
            // =============================

            res.status(200).json({
    message: "Try-on completed",
    result: `http://localhost:4000/${currentPerson.replace(/\\/g, "/")}`
})

        } catch (error) {

            console.log(
                "SERVER ERROR:",
                error.message
            )

            res.status(500).json({
                message: "Server error"
            })

        }

    }
)


// /recommend-missing
// /totaloutfit


app.post(
  "/recommend-missing",

  upload.fields([
    {
      name: "fullbody",
      maxCount: 1
    },
    {
      name: "shirt",
      maxCount: 1
    },
    {
      name: "pant",
      maxCount: 1
    },
    {
      name: "shoes",
      maxCount: 1
    }
  ]),

  async (req, res) => {

    try {

      // =====================================
      // 1. GET UPLOADED FILES
      // =====================================

      if (!req.files?.fullbody?.[0]) {
        return res.status(400).json({
          message:
            "Full body image is required"
        });
      }

      const fullbody =
        req.files.fullbody[0];

      const shirt =
        req.files.shirt?.[0] || null;

      const pant =
        req.files.pant?.[0] || null;

      const shoes =
        req.files.shoes?.[0] || null;


      console.log(
        "FULLBODY:",
        fullbody?.path
      );

      console.log(
        "SHIRT:",
        shirt?.path || "MISSING"
      );

      console.log(
        "PANT:",
        pant?.path || "MISSING"
      );

      console.log(
        "SHOES:",
        shoes?.path || "MISSING"
      );


      // =====================================
      // 2. START WITH ORIGINAL PERSON
      // =====================================

      let currentPerson =
        fullbody.path;


      // =====================================
      // 3. WEAR EVERYTHING
      // THE USER ALREADY HAS
      //
      // ORDER:
      // SHIRT
      // PANT
      // SHOES
      // =====================================

      const userClothes = [
        {
          type: "shirt",
          file: shirt
        },
        {
          type: "pant",
          file: pant
        },
        {
          type: "shoes",
          file: shoes
        }
      ];


      for (
        const clothing
        of userClothes
      ) {

        // User does not have this item
        if (!clothing.file?.path) {
          continue;
        }


        console.log(
          "\n=============================="
        );

        console.log(
          "WEARING USER'S:",
          clothing.type
        );

        console.log(
          "PERSON IMAGE:",
          currentPerson
        );

        console.log(
          "CLOTHING IMAGE:",
          clothing.file.path
        );


        // =====================================
        // SEND TO TRY-ON
        // =====================================

        const tryOnResult =
          await generateTryOn(
            currentPerson,
            clothing.file.path
          );


        console.log(
          "TRY-ON RESULT:",
          tryOnResult
        );


        if (!tryOnResult) {

          console.log(
            "TRY-ON FAILED FOR USER'S:",
            clothing.type
          );

          continue;
        }


        // =====================================
        // UPDATE CURRENT PERSON
        // =====================================

        currentPerson =
          tryOnResult;


        console.log(
          "UPDATED PERSON:",
          currentPerson
        );
      }


      // =====================================
      // NOW currentPerson contains:
      //
      // FULL BODY
      // + SHIRT USER HAS
      // + PANT USER HAS
      // + SHOES USER HAS
      //
      // Only the uploaded items are worn.
      // =====================================


      // =====================================
      // 4. FIND MISSING ITEMS
      //
      // Send UPDATED PERSON IMAGE
      // =====================================

      const recommendationResult =
        await recommendMissingItems(
          currentPerson,
          shirt ? shirt.path : null,
          pant ? pant.path : null,
          shoes ? shoes.path : null
        );


      console.log(
        "\nMISSING ITEMS:",
        recommendationResult.missingItems
      );

      console.log(
        "RECOMMENDATIONS:",
        recommendationResult.recommendations
      );


      const missingItems =
        recommendationResult.missingItems || [];

      const recommendations =
        recommendationResult.recommendations || [];


      // =====================================
      // 5. STORE PRODUCTS
      // FOR FRONTEND
      // =====================================

      const recommendedProducts = [];


      // =====================================
      // 6. PROCESS MISSING ITEMS ONLY
      // =====================================

      for (
        const recommendation
        of recommendations
      ) {

        // Extra safety
        if (
          !missingItems.includes(
            recommendation.type
          )
        ) {
          continue;
        }


        console.log(
          "\n=============================="
        );

        console.log(
          "SEARCHING FOR:",
          recommendation.type
        );

        console.log(
          "SEARCH QUERY:",
          recommendation.searchQuery
        );


        // =====================================
        // SEARCH QUICKCOMMERCE
        // =====================================

        const products =
          await searchProducts(
            recommendation.searchQuery
          );


        console.log(
          "PRODUCTS FOUND:",
          products?.length || 0
        );


        if (
          !products ||
          products.length === 0
        ) {

          console.log(
            "NO PRODUCTS FOUND FOR:",
            recommendation.type
          );

          continue;
        }


        // =====================================
        // 7. ADD ALL QUICKCOMMERCE PRODUCTS
        // TO FINAL RESPONSE
        // =====================================

        for (
          const product
          of products
        ) {

          recommendedProducts.push({
            type:
              recommendation.type,

            color:
              recommendation.color,

            style:
              recommendation.style,

            name:
              product.name || "",

            image:
              product.image || null,

            price:
              product.price || null,

            url:
              product.url || null,

            platform:
              product.platform || ""
          });
        }


        // =====================================
        // 8. PICK ONE PRODUCT
        // FOR TRY-ON
        // =====================================

        const productForTryOn =
          products.find(
            product =>
              product.image &&
              typeof product.image === "string"
          );


        if (!productForTryOn) {

          console.log(
            "NO PRODUCT IMAGE FOR:",
            recommendation.type
          );

          continue;
        }


        console.log(
          "TRYING ON:",
          productForTryOn.name
        );

        console.log(
          "PRODUCT IMAGE:",
          productForTryOn.image
        );


        // =====================================
        // 9. DOWNLOAD PRODUCT IMAGE
        // =====================================

        const downloadedImage =
          await downloadImage(
            productForTryOn.image,
            `${recommendation.type}-${Date.now()}.jpg`
          );


        if (!downloadedImage) {

          console.log(
            "DOWNLOAD FAILED:",
            recommendation.type
          );

          continue;
        }


        console.log(
          "DOWNLOADED:",
          downloadedImage
        );


        // =====================================
        // 10. WEAR RECOMMENDED ITEM
        //
        // currentPerson already contains
        // all the clothes user uploaded
        // =====================================

        const tryOnResult =
          await generateTryOn(
            currentPerson,
            downloadedImage
          );


        console.log(
          "RECOMMENDED TRY-ON RESULT:",
          tryOnResult
        );


        if (!tryOnResult) {

          console.log(
            "RECOMMENDED TRY-ON FAILED:",
            recommendation.type
          );

          continue;
        }


        // =====================================
        // UPDATE FINAL PERSON
        // =====================================

        currentPerson =
          tryOnResult;


        console.log(
          "UPDATED FINAL PERSON:",
          currentPerson
        );
      }


      // =====================================
      // 11. CREATE FINAL IMAGE URL
      // =====================================

      const normalizedPath =
        currentPerson.replace(
          /\\/g,
          "/"
        );


      const finalImageUrl =
        `http://localhost:4000/${normalizedPath}`;


      // =====================================
      // 12. SEND FINAL RESPONSE
      // =====================================

      return res.status(200).json({

        message:
          "Outfit recommendation completed",

        missingItems,

        result:
          finalImageUrl,

        products:
          recommendedProducts

      });

    } catch (error) {

      console.log(
        "\nRECOMMEND MISSING ERROR:",
        error.message
      );

      return res.status(500).json({

        message:
          "Recommendation failed",

        error:
          error.message

      });

    }

  }
);


// ======================================
// TOTAL OUTFIT BASED ON OCCASION
// ======================================

app.post(
  "/totaloutfit",

  upload.single("fullbody"),

  async (req, res) => {

    try {

      const fullbody = req.file;
      const occasion = req.body.occasion;

      if (!fullbody) {

        return res.status(400).json({
          message: "Full body image is required"
        });

      }

      if (!occasion) {

        return res.status(400).json({
          message: "Occasion is required"
        });

      }


      // ==================================
      // GEMINI GENERATES 3 SEARCH QUERIES
      // ==================================

      const recommendationResult =
        await recommendTotalOutfit(
          fullbody.path,
          occasion
        );


      console.log(
        "TOTAL OUTFIT RECOMMENDATIONS:",
        recommendationResult
      );


      const recommendations =
        recommendationResult.recommendations || [];


      // ==================================
      // START WITH ORIGINAL PERSON
      // ==================================

      let currentPerson =
        fullbody.path;


      // ==================================
      // PRODUCTS FOR FRONTEND
      // ==================================

      const recommendedProducts = [];


      // ==================================
      // PROCESS SHIRT, PANT, SHOES
      // ==================================

      for (
        const recommendation
        of recommendations
      ) {

        console.log(
          "SEARCHING:",
          recommendation.type,
          recommendation.searchQuery
        );


        // ==================================
        // SEARCH AMAZON + FLIPKART + MYNTRA
        // ==================================

        const products =
          await searchProducts(
            recommendation.searchQuery
          );


        if (
          !products ||
          products.length === 0
        ) {

          console.log(
            "No products found for:",
            recommendation.type
          );

          continue;

        }


        // ==================================
        // ADD ALL PLATFORM PRODUCTS
        // TO FRONTEND RESPONSE
        // ==================================

        for (
          const product
          of products
        ) {

          recommendedProducts.push({

            type:
              recommendation.type,

            name:
              product.name,

            image:
              product.image,

            price:
              product.price,

            url:
              product.url,

            platform:
              product.platform

          });

        }


        // ==================================
        // SELECT ONE PRODUCT FOR TRY-ON
        // ==================================

        const productForTryOn =
          products.find(
            product =>
              product.image
          );


        if (!productForTryOn) {

          console.log(
            "No product image for:",
            recommendation.type
          );

          continue;

        }


        console.log(
          "TRYING ON:",
          productForTryOn.name
        );


        // ==================================
        // DOWNLOAD PRODUCT IMAGE
        // ==================================

        const downloadedImage =
          await downloadImage(
            productForTryOn.image,
            `${recommendation.type}-${Date.now()}.jpg`
          );


        if (!downloadedImage) {

          console.log(
            "Image download failed:",
            recommendation.type
          );

          continue;

        }


        // ==================================
        // APPLY TO CURRENT PERSON
        // ==================================

        const tryOnResult =
          await generateTryOn(
            currentPerson,
            downloadedImage
          );


        if (!tryOnResult) {

          console.log(
            "Try-on failed:",
            recommendation.type
          );

          continue;

        }


        // IMPORTANT:
        // Use the newly generated image
        // for the next clothing item

        currentPerson =
          tryOnResult;


        console.log(
          "UPDATED PERSON:",
          currentPerson
        );

      }


      // ==================================
      // FINAL RESPONSE
      // ==================================

      // ==================================
// FINAL RESPONSE
// ==================================

return res.status(200).json({
  message: "Your occasion outfit is ready",

  occasion,

  result: `http://localhost:4000/${currentPerson.replace(
    /\\/g,
    "/"
  )}`,

  products: recommendedProducts
});

    } catch (error) {

      console.log(
        "TOTAL OUTFIT ERROR:",
        error.message
      );

      return res.status(500).json({

        message:
          "Failed to generate total outfit",

        error:
          error.message

      });

    }

  }
);





app.listen(4000, () => {

    console.log(
        "Server is listening on port 4000"
    )

})



mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => {

    console.log(
      "MongoDB connected"
    );

  })
  .catch(error => {

    console.log(
      "MongoDB error:",
      error.message
    );

  });