const fs = require("fs");

require("dotenv").config();

async function recommendMissingItems(
  updatedPersonPath,
  shirtPath,
  pantPath,
  shoesPath
) {
  try {
    // =====================================
    // 1. CHECK WHAT ITEMS ARE MISSING
    // =====================================

    const missingItems = [];

    if (!shirtPath) {
      missingItems.push("shirt");
    }

    if (!pantPath) {
      missingItems.push("pant");
    }

    if (!shoesPath) {
      missingItems.push("shoes");
    }

    console.log(
      "MISSING ITEMS:",
      missingItems
    );

    // =====================================
    // IF NOTHING IS MISSING
    // =====================================

    if (missingItems.length === 0) {
      return {
        missingItems: [],
        recommendations: []
      };
    }

    // =====================================
    // 2. CHECK UPDATED PERSON IMAGE
    // =====================================

    if (!updatedPersonPath) {
      throw new Error(
        "Updated person image path is missing"
      );
    }

    if (!fs.existsSync(updatedPersonPath)) {
      throw new Error(
        `Updated person image not found: ${updatedPersonPath}`
      );
    }

    // =====================================
    // 3. CREATE GEMINI PARTS
    // =====================================

    const parts = [];

    // =====================================
    // MAIN FASHION STYLIST PROMPT
    // =====================================

    parts.push({
      text: `
You are an expert modern fashion stylist.

Analyze the person and the CURRENT OUTFIT shown
in the uploaded image.

The person is already wearing the clothing items
they currently have.

Your job is to recommend ONLY the clothing items
that are missing.

MISSING ITEMS:

${missingItems.join(", ")}

================================================
IMPORTANT ANALYSIS
================================================

Before recommending anything, carefully analyze:

1. The ACTUAL visible colors of the clothes
   currently worn by the person.

2. The current outfit style.

3. Whether the outfit is:
   - casual
   - smart casual
   - formal
   - streetwear
   - minimal
   - trendy
   - classic

4. The person's overall proportions.

5. The balance of the current silhouette.

6. What type of fit would look modern and
   visually balanced.

7. Current fashion trends and modern styling.

Do not randomly choose colors or clothing styles.

The recommendation must genuinely match the
CURRENT outfit shown in the image.

================================================
FIT RULES
================================================

Do NOT automatically recommend skinny fit.

Do NOT recommend skin-tight clothing unless it is
clearly the best choice for the outfit.

Prefer modern and balanced fits when appropriate:

- relaxed fit
- regular fit
- straight fit
- loose fit
- wide leg
- tapered fit
- relaxed straight fit
- regular straight fit
- oversized fit
- slim fit only when appropriate

The goal is a BALANCED silhouette.

Examples:

If the shirt is oversized or relaxed:

Do NOT automatically recommend skinny pants.

Prefer something balanced such as:

- straight fit
- relaxed fit
- relaxed straight fit
- wide leg when suitable

If the pants are wide or baggy:

Choose a shirt that creates a balanced silhouette.

If the outfit is formal:

Choose clean, structured and appropriate fits.

If the outfit is casual or streetwear:

Prefer modern relaxed, straight or oversized
silhouettes when suitable.

================================================
COLOR RULES
================================================

Carefully identify the ACTUAL colors currently
visible in the outfit.

Recommend colors that naturally complement
the existing clothes.

Do NOT choose random colors.

Do NOT automatically recommend:

white + navy + brown

or any other standard combination unless it
actually matches the current outfit.

Use intelligent color coordination.

Rules:

- Avoid clashing colors.
- Avoid too many strong colors.
- Keep the outfit visually balanced.
- Use neutral colors when they improve the outfit.
- Consider the colors already worn.
- The final outfit should feel intentional.
- If multiple items are missing, make sure the
  recommended items also match EACH OTHER.

The complete outfit should generally have a
balanced color palette.

================================================
STYLE RULES
================================================

Keep the entire outfit stylistically consistent.

Examples:

Casual → casual or smart casual.

Formal → formal or elegant smart casual.

Streetwear → modern streetwear.

Minimal outfit → clean minimal additions.

Do not mix completely incompatible styles.

Do not recommend outdated clothing styles
when a more modern option would suit better.

The recommendation should look stylish,
modern and realistic for current fashion.

================================================
VERY IMPORTANT
================================================

Recommend ONLY these missing items:

${missingItems.join(", ")}

Do NOT recommend any item that is already
being worn or was already provided by the user.

For every recommendation provide:

- exact clothing type
- suitable color
- modern style
- suitable fit
- short reason
- detailed shopping search query

The searchQuery must include:

- gender
- color
- clothing style
- fit

Example:

"mens olive green relaxed straight fit chinos"

================================================
RETURN FORMAT
================================================

Return ONLY valid JSON.

Do not include markdown.

Do not include explanation outside JSON.

Use exactly this structure:

{
  "recommendations": [
    {
      "type": "shirt or pant or shoes",
      "color": "specific recommended color",
      "style": "specific modern clothing style",
      "fit": "relaxed fit or regular fit or straight fit or wide leg or slim fit when appropriate",
      "reason": "short reason explaining why this color style and fit match the current outfit",
      "searchQuery": "detailed shopping search query including gender color style and fit"
    }
  ]
}
`
    });

    // =====================================
    // 4. READ UPDATED PERSON IMAGE
    // =====================================

    const imageBuffer =
      fs.readFileSync(
        updatedPersonPath
      );

    const base64Image =
      imageBuffer.toString(
        "base64"
      );

    // =====================================
    // ADD IMAGE TO GEMINI
    // =====================================

    parts.push({
      text: `
This is the CURRENT UPDATED PERSON IMAGE.

Analyze the clothes visible in this image.

The person may already be wearing clothing items
uploaded by the user.

Use the actual visible outfit as the main basis
for your recommendation.
`
    });

    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image
      }
    });

    // =====================================
    // 5. SEND REQUEST TO GEMINI
    // =====================================

    const response =
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            contents: [
              {
                parts: parts
              }
            ],

            generationConfig: {
              responseMimeType:
                "application/json",

              temperature: 0.7
            }
          })
        }
      );

    // =====================================
    // 6. GET GEMINI RESPONSE
    // =====================================

    const data =
      await response.json();

    console.log(
      "GEMINI STATUS:",
      response.status
    );

    // =====================================
    // HANDLE GEMINI ERROR
    // =====================================

    if (!response.ok) {

      console.log(
        "GEMINI ERROR:"
      );

      console.dir(
        data,
        {
          depth: null
        }
      );

      return {
        missingItems,
        recommendations: []
      };
    }

    // =====================================
    // 7. EXTRACT GEMINI TEXT
    // =====================================

    const text =
      data
        ?.candidates?.[0]
        ?.content
        ?.parts?.[0]
        ?.text;

    if (!text) {

      console.log(
        "NO GEMINI RESPONSE TEXT"
      );

      console.dir(
        data,
        {
          depth: null
        }
      );

      return {
        missingItems,
        recommendations: []
      };
    }

    console.log(
      "GEMINI RESPONSE:"
    );

    console.log(
      text
    );

    // =====================================
    // 8. PARSE JSON
    // =====================================

    let recommendation;

    try {

      recommendation =
        JSON.parse(text);

    } catch (parseError) {

      console.log(
        "GEMINI JSON PARSE ERROR:",
        parseError.message
      );

      console.log(
        "RAW GEMINI RESPONSE:",
        text
      );

      return {
        missingItems,
        recommendations: []
      };
    }

    // =====================================
    // 9. GET RECOMMENDATIONS
    // =====================================

    const geminiRecommendations =
      recommendation.recommendations || [];

    // =====================================
    // 10. FILTER ONLY MISSING ITEMS
    //
    // EXTRA SAFETY
    // =====================================

    const recommendations =
      geminiRecommendations.filter(
        item => {

          if (!item?.type) {
            return false;
          }

          return missingItems.includes(
            item.type.toLowerCase()
          );
        }
      );

    // =====================================
    // 11. LOG FINAL RESULT
    // =====================================

    console.log(
      "FINAL RECOMMENDATIONS:"
    );

    console.dir(
      recommendations,
      {
        depth: null
      }
    );

    // =====================================
    // 12. RETURN RESULT
    // =====================================

    return {
      missingItems,
      recommendations
    };

  } catch (error) {

    console.log(
      "RECOMMENDATION ERROR:",
      error.message
    );

    return {
      missingItems: [],
      recommendations: [],
      error: error.message
    };
  }
}

module.exports =
  recommendMissingItems;