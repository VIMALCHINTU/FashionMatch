require("dotenv").config();

const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);


// ===============================
// GEMINI RETRY FUNCTION
// ===============================

async function generateWithRetry(
  model,
  content,
  maxRetries = 3
) {
  for (
    let attempt = 1;
    attempt <= maxRetries + 1;
    attempt++
  ) {
    try {
      console.log(
        `GEMINI ATTEMPT ${attempt}/${maxRetries + 1}`
      );

      const result =
        await model.generateContent(content);

      return result;

    } catch (error) {

      const message =
        error.message || "";

      console.log(
        "GEMINI ERROR:",
        message
      );

      const temporaryError =
        message.includes("503") ||
        message.includes("Service Unavailable") ||
        message.includes("high demand") ||
        message.includes("429") ||
        message.includes("Too Many Requests");

      if (!temporaryError) {
        throw error;
      }

      if (attempt === maxRetries + 1) {
        throw error;
      }

      const delay =
        Math.min(
          2000 * Math.pow(2, attempt - 1),
          10000
        );

      console.log(
        `Retrying Gemini in ${delay}ms...`
      );

      await new Promise(
        resolve =>
          setTimeout(resolve, delay)
      );
    }
  }
}


// ===============================
// TOTAL OUTFIT RECOMMENDATION
// ===============================

async function recommendTotalOutfit(
  fullbodyPath,
  occasion
) {
  try {

    console.log(
      "TOTAL OUTFIT STARTED"
    );

    console.log(
      "FULLBODY:",
      fullbodyPath
    );

    console.log(
      "OCCASION:",
      occasion
    );


    // ===============================
    // GEMINI MODEL
    // ===============================

    const model =
      genAI.getGenerativeModel({
        model: "gemini-3.6-flash"
      });


    // ===============================
    // READ IMAGE
    // ===============================

    const imageBuffer =
      fs.readFileSync(fullbodyPath);


    // ===============================
    // SHORT FASHION PROMPT
    // ===============================

    const prompt = `
You are an expert modern men's fashion stylist.

Analyze the full-body image and create ONE complete outfit
for the selected occasion.

OCCASION:
${occasion}

IMPORTANT:

1. Analyze the person's visible appearance, body proportions,
current clothing, silhouette and overall style.

2. Recommend exactly THREE clothing items:

- shirt
- pant
- shoes

3. The three items must work together as ONE complete outfit.

4. Occasion is the highest priority.

WEDDING / FESTIVAL / TRADITIONAL:
Use appropriate Indian ethnic or Indo-Western clothing.
Examples:
kurta, pajama, churidar, Nehru jacket, bandhgala,
sherwani, ethnic trousers, mojari or jutti.

PARTY:
Use stylish contemporary partywear.
Examples:
fashion shirts, overshirts, trousers, dark jeans,
loafers or fashionable sneakers.

CASUAL / COLLEGE:
Use modern relaxed clothing.
Examples:
oversized or boxy shirts/T-shirts, jeans, cargos,
relaxed trousers and sneakers.

DATE:
Use stylish smart-casual clothing.
Examples:
textured shirts, polos, trousers, dark jeans,
loafers or clean sneakers.

INTERVIEW / OFFICE:
Use professional clothing.
Examples:
formal shirts, structured trousers, blazer,
loafers or formal shoes.

STREETWEAR:
Use modern streetwear.
Examples:
oversized/boxy tops, cargos, wide-leg pants,
relaxed jeans and contemporary sneakers.

FIT:

Prefer modern and realistic fits such as:
regular, relaxed, straight, relaxed-straight,
tapered, loose, wide-leg, oversized or boxy.

Do NOT automatically choose skinny fit.

COLOR:

Analyze the person and choose a coordinated 2–3 color palette.

Do not always use the same colors.

The shirt, pant and shoes must visually match.

FOOTWEAR:

Shoes must match both the outfit and occasion.

CATEGORY RULES:

The backend categories MUST be exactly:

shirt
pant
shoes

"shirt" may represent appropriate topwear such as:
shirt, T-shirt, kurta, short kurta, bandhgala,
or other suitable topwear.

"pant" may represent:
trousers, jeans, cargos, pajama, churidar,
ethnic trousers, dhoti-style pants,
or other suitable bottoms.

For every recommendation provide:

type
color
style
fit
reason
searchQuery

searchQuery must be suitable for product searching.

It should contain useful details such as:
men's + color + garment + style + fit + occasion.

IMPORTANT:

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use code fences.
Do NOT add explanations outside JSON.

Use exactly this structure:

{
  "recommendations": [
    {
      "type": "shirt",
      "color": "string",
      "style": "string",
      "fit": "string",
      "reason": "string",
      "searchQuery": "string"
    },
    {
      "type": "pant",
      "color": "string",
      "style": "string",
      "fit": "string",
      "reason": "string",
      "searchQuery": "string"
    },
    {
      "type": "shoes",
      "color": "string",
      "style": "string",
      "fit": "not applicable",
      "reason": "string",
      "searchQuery": "string"
    }
  ]
}
`;


    // ===============================
    // GEMINI REQUEST
    // ===============================

    const result =
      await generateWithRetry(
        model,
        [
          {
            inlineData: {
              data:
                imageBuffer.toString("base64"),

              mimeType:
                "image/jpeg"
            }
          },

          {
            text: prompt
          }
        ]
      );


    // ===============================
    // GET GEMINI RESPONSE
    // ===============================

    const text =
      result.response.text();

    console.log(
      "RAW GEMINI RESPONSE:",
      text
    );


    // ===============================
    // CLEAN JSON
    // ===============================

    let cleanedText =
      text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();


    // Sometimes Gemini adds text
    // before or after JSON.

    const start =
      cleanedText.indexOf("{");

    const end =
      cleanedText.lastIndexOf("}");


    if (
      start !== -1 &&
      end !== -1
    ) {
      cleanedText =
        cleanedText.substring(
          start,
          end + 1
        );
    }


    // ===============================
    // PARSE JSON
    // ===============================

    let parsed;

    try {

      parsed =
        JSON.parse(cleanedText);

    } catch (error) {

      console.log(
        "JSON PARSE ERROR:",
        error.message
      );

      console.log(
        "CLEANED GEMINI RESPONSE:",
        cleanedText
      );

      throw new Error(
        "Gemini returned invalid JSON"
      );
    }


    // ===============================
    // VALIDATE RECOMMENDATIONS
    // ===============================

    const requiredTypes = [
      "shirt",
      "pant",
      "shoes"
    ];

    const recommendations =
      Array.isArray(
        parsed.recommendations
      )
        ? parsed.recommendations
        : [];


    // Keep only required categories

    const filteredRecommendations =
      recommendations.filter(
        item =>
          item &&
          requiredTypes.includes(
            item.type
          )
      );


    // ===============================
    // REMOVE DUPLICATE TYPES
    // ===============================

    const uniqueRecommendations = [];

    const usedTypes = new Set();

    for (
      const recommendation
      of filteredRecommendations
    ) {

      if (
        usedTypes.has(
          recommendation.type
        )
      ) {
        continue;
      }

      usedTypes.add(
        recommendation.type
      );

      uniqueRecommendations.push(
        recommendation
      );
    }


    // ===============================
    // FINAL RESULT
    // ===============================

    console.log(
      "FINAL RECOMMENDATIONS:",
      uniqueRecommendations
    );


    return {
      recommendations:
        uniqueRecommendations
    };


  } catch (error) {

    console.log(
      "TOTAL OUTFIT GEMINI ERROR:",
      error.message
    );

    throw error;
  }
}


module.exports =
  recommendTotalOutfit;