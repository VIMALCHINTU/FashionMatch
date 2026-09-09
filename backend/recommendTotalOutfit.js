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
You are an expert modern fashion stylist specializing in MEN'S fashion,
including Western, Indian ethnic, Indo-Western, contemporary, and
occasion-specific outfits.

Analyze the person in the uploaded full-body image and create ONE COMPLETE
outfit specifically for the selected occasion.

SELECTED OCCASION:
"${occasion}"

================================================
MOST IMPORTANT RULE
================================================

The OCCASION is the highest-priority factor.

DO NOT generate a generic formal outfit just because it looks safe.

You MUST first understand what "${occasion}" means and then select the
appropriate clothing CATEGORY, STYLE, FIT, COLORS, and FOOTWEAR.

The final outfit must look like something a real person would actually
wear to that specific occasion.

================================================
OCCASION-SPECIFIC STYLING
================================================

Use these rules as guidance.

-------------------------
WEDDING
-------------------------

For a wedding, DO NOT automatically recommend a western formal shirt
and trousers.

Prefer Indian or Indo-Western wedding outfits such as:

- kurta pajama
- embroidered kurta
- festive kurta
- silk kurta
- jacquard kurta
- short kurta with suitable bottoms
- Nehru jacket with kurta
- Indo-Western kurta
- bandhgala
- sherwani for highly traditional/formal weddings

Choose based on the person's appearance and the likely level of formality.

The outfit should feel FESTIVE and WEDDING-APPROPRIATE.

Examples:

- embroidered kurta + straight pajama + ethnic/mojari footwear
- silk kurta + relaxed pajama + loafers
- short kurta + straight trousers + ethnic loafers
- kurta + Nehru jacket + tailored trousers + loafers
- sherwani + churidar + traditional footwear for a highly formal wedding

Do NOT return a normal office-style shirt and trousers for a wedding
unless the occasion explicitly indicates a western/formal wedding theme.

-------------------------
FESTIVAL
-------------------------

For festivals, strongly prefer Indian ethnic or Indo-Western clothing.

Possible choices:

- kurta
- short kurta
- half kurta
- printed kurta
- solid festive kurta
- cotton kurta
- linen kurta
- embroidered kurta
- Indo-Western kurta

Suitable bottoms can include:

- pajama
- straight trousers
- relaxed trousers
- dhoti-style pants
- ethnic trousers

Suitable footwear can include:

- juttis
- mojaris
- ethnic loafers
- clean traditional sandals
- minimal loafers

The outfit should feel festive, comfortable, modern and culturally
appropriate.

-------------------------
ENGAGEMENT
-------------------------

Prefer sophisticated Indian or Indo-Western outfits.

Good choices include:

- elegant kurta
- embroidered kurta
- Nehru jacket
- bandhgala
- Indo-Western outfit
- refined blazer + ethnic elements

Avoid making it look like ordinary officewear.

-------------------------
RECEPTION
-------------------------

Reception outfits can be more polished and fashion-forward.

Consider:

- bandhgala
- Indo-Western outfit
- elegant kurta with jacket
- blazer with coordinated trousers
- sophisticated ethnic wear

Choose according to the occasion and person's appearance.

-------------------------
TRADITIONAL FUNCTION
-------------------------

Strongly prefer traditional Indian clothing.

Examples:

- kurta pajama
- traditional kurta
- short kurta
- dhoti-style bottom
- Nehru jacket
- ethnic footwear

Avoid generic western officewear.

-------------------------
PARTY
-------------------------

For a party, use contemporary partywear.

Possible choices:

- stylish shirt
- textured shirt
- printed shirt
- relaxed shirt
- overshirt
- contemporary trousers
- straight-fit trousers
- relaxed trousers
- dark jeans when appropriate
- stylish loafers
- minimal sneakers when appropriate

Do not automatically make the outfit formal.

-------------------------
CASUAL
-------------------------

Prefer comfortable modern casualwear.

Possible choices:

- relaxed shirt
- oversized T-shirt
- boxy T-shirt
- polo
- overshirt
- straight jeans
- relaxed jeans
- cargos
- relaxed trousers
- clean sneakers

Avoid unnecessary formalwear.

-------------------------
COLLEGE / EVERYDAY
-------------------------

Prefer youthful, comfortable and modern clothing.

Possible choices:

- oversized T-shirt
- boxy T-shirt
- relaxed shirt
- casual overshirt
- straight jeans
- relaxed jeans
- cargos
- wide-leg trousers
- clean sneakers

The outfit should look trendy but realistic for everyday use.

-------------------------
DATE
-------------------------

Create a stylish and coordinated outfit that looks attractive without
being overdressed.

Possible choices:

- textured shirt
- relaxed/regular shirt
- polo
- smart casual overshirt
- straight trousers
- relaxed trousers
- dark jeans
- loafers or clean sneakers

Choose colors that complement each other.

-------------------------
INTERVIEW
-------------------------

Use professional formalwear.

Possible choices:

- formal shirt
- structured trousers
- formal shoes
- blazer when appropriate

Keep the outfit clean, professional and conservative.

-------------------------
OFFICE
-------------------------

Use smart-casual or business-appropriate clothing depending on the
occasion wording.

Possible choices:

- formal shirt
- polo
- smart casual shirt
- chinos
- tailored trousers
- loafers
- formal shoes

-------------------------
STREETWEAR
-------------------------

Prefer contemporary streetwear silhouettes.

Possible choices:

- oversized T-shirt
- boxy T-shirt
- oversized shirt
- hoodie
- relaxed overshirt
- cargo pants
- wide-leg pants
- relaxed jeans
- chunky/minimal sneakers

Avoid traditional formalwear unless explicitly requested.

================================================
IMPORTANT CATEGORY RULE
================================================

You MUST return exactly these backend categories:

1. shirt
2. pant
3. shoes

IMPORTANT:

"shirt" does NOT necessarily mean a western button-down shirt.

For Indian or ethnic occasions, the "shirt" category may represent the
TOPWEAR and can be:

- kurta
- short kurta
- half kurta
- embroidered kurta
- festive kurta
- silk kurta
- Indo-Western kurta
- Nehru-jacket-based topwear
- bandhgala top

Similarly, "pant" does NOT necessarily mean jeans or western trousers.

For ethnic occasions it can represent:

- pajama
- churidar
- straight ethnic trousers
- dhoti-style pants
- relaxed trousers
- tailored trousers
- other appropriate bottoms

The category names MUST remain:

"shirt"
"pant"
"shoes"

because the backend depends on these category values.

================================================
PERSON ANALYSIS
================================================

Consider:

- visible body proportions
- silhouette
- apparent build
- overall appearance
- hairstyle/grooming when visible
- current clothing when relevant
- balance between top and bottom
- realistic fit

Do not make assumptions about attributes that cannot be determined from
the image.

================================================
FIT AND SILHOUETTE
================================================

Do NOT automatically recommend skinny clothing.

Prefer an appropriate modern fit such as:

- relaxed fit
- regular fit
- straight fit
- relaxed straight fit
- tapered fit
- loose fit
- wide-leg
- oversized
- boxy
- slim fit only when genuinely appropriate

The top and bottom must create a balanced silhouette.

Examples:

- oversized/boxy kurta → avoid unnecessarily skinny bottoms
- relaxed shirt → use straight or relaxed bottoms
- wide-leg pants → balance them with an appropriate top
- formal outfit → use clean structured fits
- ethnic outfit → use culturally appropriate proportions
- streetwear → use intentional oversized/relaxed proportions

================================================
COLOR COORDINATION
================================================

Create ONE deliberate color palette.

Usually use 2–3 main colors.

Consider:

- skin/appearance visible in the image
- occasion
- traditional color conventions where appropriate
- modern fashion
- contrast
- top-to-bottom balance

For weddings/festivals, colors may include appropriate festive shades such as:

- ivory
- cream
- beige
- maroon
- burgundy
- bottle green
- emerald
- navy
- royal blue
- mustard
- rust
- pastel pink
- dusty rose
- sage
- charcoal
- black

Do NOT randomly combine colors.

Do NOT always use:

white shirt + navy pants + brown shoes.

The color combination must look intentional.

================================================
FOOTWEAR
================================================

Footwear must match the selected occasion and outfit.

Examples:

Wedding / Festival:
- juttis
- mojaris
- ethnic loafers
- traditional sandals

Formal:
- Oxford shoes
- Derby shoes
- formal loafers

Smart casual:
- loafers
- minimal sneakers

Casual:
- clean sneakers
- casual loafers

Streetwear:
- contemporary sneakers

Do NOT recommend formal leather shoes with a casual streetwear outfit
unless intentionally appropriate.

================================================
CURRENT FASHION
================================================

The outfit should look CURRENT and modern.

Prefer contemporary:

- silhouettes
- fits
- colors
- fabrics
- styling
- footwear

However, do not sacrifice occasion appropriateness just to follow trends.

The outfit must be stylish AND realistic.

================================================
SHOPPING SEARCH QUERY
================================================

Create a detailed shopping query for each item.

The query must closely describe the recommended product.

Include:

- men's
- color
- garment type
- style
- fit
- relevant occasion keyword when useful

For example:

Wedding:

"men's ivory embroidered festive kurta regular fit wedding"

"men's cream straight fit pajama wedding ethnic"

"men's brown leather mojari wedding ethnic footwear"

Festival:

"men's sage green short kurta relaxed fit festival"

"men's cream straight fit ethnic trousers festival"

"men's tan leather mojari ethnic festival"

Casual:

"men's olive green relaxed fit overshirt casual"

"men's charcoal straight fit jeans casual"

"men's white minimalist sneakers casual"

Streetwear:

"men's oversized black graphic t-shirt streetwear"

"men's charcoal wide leg cargo pants streetwear"

"men's black contemporary sneakers streetwear"

The query must match the ACTUAL recommendation.

================================================
FINAL QUALITY CHECK
================================================

Before returning the JSON, internally verify:

1. Does this outfit actually match "${occasion}"?
2. Would a real person wear this outfit to that occasion?
3. Are the three items stylistically compatible?
4. Is the silhouette balanced?
5. Are the colors coordinated?
6. Is the outfit modern?
7. Is the footwear appropriate?
8. Does the searchQuery accurately describe the recommendation?
9. If this is a wedding/festival/traditional occasion, did I consider
   Indian ethnic or Indo-Western clothing instead of defaulting to
   western formalwear?

If the occasion is clearly Indian/traditional, prioritize culturally
appropriate Indian or Indo-Western clothing.

================================================
RETURN FORMAT
================================================

Return ONLY valid JSON.

Do not use markdown.

Do not include explanations outside JSON.

Return EXACTLY this structure:

{
  "recommendations": [
    {
      "type": "shirt",
      "color": "specific color",
      "style": "specific garment style",
      "fit": "specific fit",
      "reason": "short reason why this matches the person and occasion",
      "searchQuery": "detailed shopping search query"
    },
    {
      "type": "pant",
      "color": "specific color",
      "style": "specific bottom style",
      "fit": "specific fit",
      "reason": "short reason why this matches the shirt and occasion",
      "searchQuery": "detailed shopping search query"
    },
    {
      "type": "shoes",
      "color": "specific color",
      "style": "specific footwear style",
      "fit": "not applicable",
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