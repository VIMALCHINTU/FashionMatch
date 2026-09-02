require("dotenv").config();

const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

async function recommendTotalOutfit(
  fullbodyPath,
  occasion
) {
  try {

    // =====================================
    // GEMINI MODEL
    // =====================================

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });


    // =====================================
    // READ PERSON IMAGE
    // =====================================

    const imageBuffer =
      fs.readFileSync(
        fullbodyPath
      );


    // =====================================
    // FASHION STYLIST PROMPT
    // =====================================

    const prompt = `
You are an expert modern fashion stylist.

Analyze the person in the uploaded full-body image and create
a COMPLETE outfit suitable for the following occasion:

"${occasion}"

Your recommendation must be based on:

1. The person's visible overall appearance.
2. The person's body proportions and silhouette.
3. A visually balanced clothing fit.
4. Current fashion trends and modern styling.
5. The selected occasion.
6. A strong and intentional color combination.
7. A complete outfit where all three items work together.

================================================
RECOMMEND EXACTLY THESE 3 CATEGORIES
================================================

1. shirt
2. pant
3. shoes

You MUST return exactly one recommendation for each category.

================================================
FIT AND SILHOUETTE RULES
================================================

Do NOT automatically recommend skinny-fit or skin-tight clothing.

Avoid skinny jeans, skinny pants, or skin-tight shirts unless
that specific fit is clearly the best choice for the occasion
and the overall outfit.

Prefer modern fits when appropriate, such as:

- relaxed fit
- regular fit
- straight fit
- relaxed straight fit
- tapered fit
- loose fit
- wide leg
- oversized fit
- boxy fit
- slim fit only when appropriate

The outfit must have a BALANCED SILHOUETTE.

Examples:

- If recommending a relaxed or oversized shirt, avoid pairing
  it automatically with skinny pants.

- If recommending wide-leg or loose pants, balance them with
  an appropriate shirt fit.

- For formal occasions, use clean and structured fits.

- For casual or trendy occasions, prefer modern relaxed,
  straight, loose, or balanced silhouettes when suitable.

Do not create an outdated-looking outfit.

================================================
COLOR COMBINATION RULES
================================================

Create a deliberate color palette.

Do NOT randomly choose colors.

Do NOT automatically use common combinations such as:

white shirt + navy pants + brown shoes

unless that combination is genuinely the best choice.

The shirt, pants, and shoes must work together as one outfit.

Rules:

- Avoid clashing colors.
- Avoid too many unrelated colors.
- Usually keep the outfit within 2 to 3 main colors.
- Use neutral colors intelligently.
- Use accent colors only when they improve the outfit.
- Consider color balance from top to bottom.
- Shoes must complement both the shirt and pants.
- The complete outfit should look intentional and stylish.

================================================
STYLE RULES
================================================

The outfit must match the occasion:

"${occasion}"

Examples:

If the occasion is casual:
- Recommend modern casual clothing.

If the occasion is party:
- Recommend stylish and contemporary clothing.

If the occasion is formal:
- Recommend clean, elegant and structured clothing.

If the occasion is college or everyday wear:
- Recommend comfortable, modern and trendy clothing.

If the occasion is streetwear:
- Recommend modern silhouettes and contemporary styling.

If the occasion is a date:
- Create a stylish outfit that looks coordinated but not
  overdone.

Do not mix incompatible styles.

For example:

- Do not combine formal trousers with random sportswear.
- Do not combine dress shoes with very casual streetwear
  unless it intentionally creates a suitable style.

================================================
TREND REQUIREMENT
================================================

The outfit should feel CURRENT and modern.

Prefer contemporary fashion choices over outdated styles.

Consider modern trends in:

- silhouettes
- pant fits
- shirt styles
- footwear styles
- color combinations

Do not recommend clothing just because it is traditionally
safe.

Create an outfit that looks stylish while still being realistic
and wearable.

================================================
SHOPPING SEARCH QUERY RULES
================================================

For every item create a detailed search query.

The searchQuery must include:

- gender
- color
- style
- fit

Examples:

"mens olive green relaxed fit overshirt"

"mens charcoal grey relaxed straight fit trousers"

"mens white minimalist leather sneakers"

The search query should help a shopping API find products that
closely match the recommendation.

================================================
RETURN FORMAT
================================================

Return ONLY valid JSON.

Do not use markdown.

Do not include explanations outside JSON.

Use exactly this structure:

{
  "recommendations": [
    {
      "type": "shirt",
      "color": "specific color",
      "style": "specific modern shirt style",
      "fit": "specific fit",
      "reason": "short reason why this matches the person and occasion",
      "searchQuery": "detailed shopping search query"
    },
    {
      "type": "pant",
      "color": "specific color",
      "style": "specific modern pant style",
      "fit": "specific fit",
      "reason": "short reason why this matches the shirt and occasion",
      "searchQuery": "detailed shopping search query"
    },
    {
      "type": "shoes",
      "color": "specific color",
      "style": "specific modern shoe style",
      "fit": "not applicable or appropriate shoe fit",
      "reason": "short reason why these shoes complete the outfit",
      "searchQuery": "detailed shopping search query"
    }
  ]
}
`;

    // =====================================
    // SEND IMAGE + PROMPT TO GEMINI
    // =====================================

    const result =
      await model.generateContent([
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
      ]);


    // =====================================
    // GET GEMINI RESPONSE
    // =====================================

    const text =
      result.response.text();

    console.log(
      "GEMINI TOTAL OUTFIT RESPONSE:",
      text
    );


    // =====================================
    // CLEAN JSON RESPONSE
    // =====================================

    const cleanText =
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();


    // =====================================
    // PARSE JSON
    // =====================================

    const outfit =
      JSON.parse(cleanText);


    // =====================================
    // VALIDATE RESULTS
    // =====================================

    const recommendations =
      outfit.recommendations || [];


    const requiredTypes = [
      "shirt",
      "pant",
      "shoes"
    ];


    const filteredRecommendations =
      recommendations.filter(item =>
        requiredTypes.includes(
          item.type?.toLowerCase()
        )
      );


    console.log(
      "FINAL TOTAL OUTFIT:",
      filteredRecommendations
    );


    // =====================================
    // RETURN EXACTLY THE OUTFIT
    // =====================================

    return {
      recommendations:
        filteredRecommendations
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