import React, { useState,useEffect } from "react";
import "./App.css";
import ProductCard from "./ProductCard";
import {
  MdLightMode,
  MdOutlineLightMode
} from "react-icons/md";

import {
  FaCloudUploadAlt,
  FaTshirt,
  FaMagic,
  
  FaCheck,
  FaUser,
  FaShoppingBag,
  FaCamera,
  FaSpinner,
} from "react-icons/fa";
import { PiPantsFill } from "react-icons/pi";

import { GiRunningShoe } from "react-icons/gi";

export default function App() {
  // ==========================================
  // STATES
  // ==========================================
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);

  const [fullbodyuploaded, setfullbodyuploaded] =
    useState(false);

  const [fullbody, setFullbody] =
    useState(null);

  const [fullbodyPreview, setFullbodyPreview] =
    useState(null);

  const [selectedPath, setSelectedPath] =
    useState("");

  const [selectedClothes, setSelectedClothes] =
    useState([]);

  const [shirt, setShirt] =
    useState(null);

  const [pant, setPant] =
    useState(null);

  const [shoes, setShoes] =
    useState(null);

  const [shirtPreview, setShirtPreview] =
    useState(null);

  const [pantPreview, setPantPreview] =
    useState(null);

  const [shoesPreview, setShoesPreview] =
    useState(null);

  const [occasion, setOccasion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [resultImage, setResultImage] =
    useState(null);

  const [recommendedProducts, setRecommendedProducts] =
    useState([]);



    useEffect(() => {

  async function loadSavedBodyImage() {

    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) return;

    try {

      const user =
        JSON.parse(savedUser);

      const imageUrl =
        user.fullBodyImage?.url;

      if (!imageUrl) return;

      setFullbodyPreview(
        imageUrl
      );

      setfullbodyuploaded(true);

      const response =
        await fetch(imageUrl);

      const blob =
        await response.blob();

      const file =
        new File(
          [blob],
          "fullbody.jpg",
          {
            type:
              blob.type || "image/jpeg"
          }
        );

      setFullbody(file);

    } catch (error) {

      console.log(
        "LOAD SAVED IMAGE ERROR:",
        error
      );

    }

  }

  loadSavedBodyImage();

}, []);
useEffect(() => {

  if (darkMode) {

    document.body.classList.add(
      "dark-mode"
    );

    localStorage.setItem(
      "theme",
      "dark"
    );

  } else {

    document.body.classList.remove(
      "dark-mode"
    );

    localStorage.setItem(
      "theme",
      "light"
    );

  }

}, [darkMode]);


const toggleTheme = () => {

  const newTheme = !darkMode;

  setDarkMode(newTheme);

  localStorage.setItem(
    "theme",
    newTheme ? "dark" : "light"
  );
};
   

  // ==========================================
  // UPLOAD FULL BODY IMAGE
  // ==========================================




  async function  handleFullBodyImage(e) {

  const file = e.target.files[0];

  if (!file) return;

  // Save actual file for try-on APIs
  setFullbody(file);

  // Show immediate preview
  setFullbodyPreview(
    URL.createObjectURL(file)
  );

  // Clear old generated result
  setResultImage(null);

  setRecommendedProducts([]);

  try {

    setLoading(true);

    const token =
      localStorage.getItem("token");

    if (!token) {

      setMessage(
        "Please login first"
      );

      return;
    }

    const formdata =
      new FormData();

    formdata.append(
      "fullbody",
      file
    );

    const res =
      await fetch(
        "http://localhost:4000/upload-fullbody",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          body: formdata
        }
      );

    const info =
      await res.json();

    console.log(
      "FULL BODY RESPONSE:",
      info
    );

    if (!res.ok) {

      setfullbodyuploaded(false);

      setMessage(
        info.message ||
        "Full body upload failed"
      );

      return;
    }

    setfullbodyuploaded(true);

setFullbodyPreview(
  info.fullBodyImage.url
);

// Update saved user in localStorage

const savedUser =
  localStorage.getItem("user");

if (savedUser) {

  const user =
    JSON.parse(savedUser);

  const updatedUser = {
    ...user,
    fullBodyImage:
      info.fullBodyImage
  };

  localStorage.setItem(
    "user",
    JSON.stringify(updatedUser)
  );

}

setMessage(
  "Full body image saved successfully"
);

  } catch (error) {

    console.log(
      "FULL BODY UPLOAD ERROR:",
      error
    );

    setfullbodyuploaded(false);

    setMessage(
      "Server connection failed"
    );

  } finally {

    setLoading(false);

  }
}

  // ==========================================
  // SELECT CLOTHES
  // ==========================================

  function selectClothes(item) {
    if (
      selectedClothes.includes(item)
    ) {
      setSelectedClothes(
        selectedClothes.filter(
          (cloth) =>
            cloth !== item
        )
      );

      if (item === "shirt") {
        setShirt(null);
        setShirtPreview(null);
      }

      if (item === "pant") {
        setPant(null);
        setPantPreview(null);
      }

      if (item === "shoes") {
        setShoes(null);
        setShoesPreview(null);
      }

    } else {
      setSelectedClothes([
        ...selectedClothes,
        item,
      ]);
    }
  }
//logout

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login";
};

  // ==========================================
  // UPLOAD CLOTHES
  // ==========================================

  function handleShirt(e) {
    const file = e.target.files[0];

    if (!file) return;

    setShirt(file);

    setShirtPreview(
      URL.createObjectURL(file)
    );
  }

  function handlePant(e) {
    const file = e.target.files[0];

    if (!file) return;

    setPant(file);

    setPantPreview(
      URL.createObjectURL(file)
    );
  }

  function handleShoes(e) {
    const file = e.target.files[0];

    if (!file) return;

    setShoes(file);

    setShoesPreview(
      URL.createObjectURL(file)
    );
  }

  // ==========================================
  // JUST WEAR SELECTED CLOTHES
  // ==========================================

  async function tryon() {
    if (!fullbody) {
      setMessage(
        "Please upload full body image"
      );

      return;
    }

    if (!shirt && !pant && !shoes) {
      setMessage(
        "Upload at least one clothing item"
      );

      return;
    }

    const formdata = new FormData();

    formdata.append(
      "fullbody",
      fullbody
    );

    if (shirt) {
      formdata.append(
        "shirt",
        shirt
      );
    }

    if (pant) {
      formdata.append(
        "pant",
        pant
      );
    }

    if (shoes) {
      formdata.append(
        "shoes",
        shoes
      );
    }

    try {
      setLoading(true);

      setMessage(
        "Creating your try-on..."
      );

      setResultImage(null);
      setRecommendedProducts([]);

      const res = await fetch(
        "http://localhost:4000/tryon",
        {
          method: "POST",
          body: formdata,
        }
      );

      const data =
        await res.json();

      console.log(
        "TRYON RESPONSE:",
        data
      );

      if (!res.ok) {
        setMessage(
          data.message ||
          "Try-on generation failed"
        );

        return;
      }

      setResultImage(
        data.result || null
      );

      setMessage(
        data.message ||
        "Try-on completed successfully"
      );

    } catch (error) {
      console.log(error);

      setMessage(
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // COMPLETE MISSING OUTFIT
  // ==========================================

  async function recommendMissingItems() {
    if (!fullbody) {
      setMessage(
        "Please upload full body image"
      );

      return;
    }

    const formdata =
      new FormData();

    formdata.append(
      "fullbody",
      fullbody
    );

    if (shirt) {
      formdata.append(
        "shirt",
        shirt
      );
    }

    if (pant) {
      formdata.append(
        "pant",
        pant
      );
    }

    if (shoes) {
      formdata.append(
        "shoes",
        shoes
      );
    }

    try {
      setLoading(true);

      setMessage(
        "AI is finding matching items..."
      );

      setResultImage(null);
      setRecommendedProducts([]);

      const res = await fetch(
        "http://localhost:4000/recommend-missing",
        {
          method: "POST",
          body: formdata,
        }
      );

      const data =
        await res.json();

      console.log(
        "RECOMMEND RESPONSE:",
        data
      );

      if (!res.ok) {
        setMessage(
          data.message ||
          "Recommendation failed"
        );

        return;
      }

      setResultImage(
        data.result || null
      );

      setRecommendedProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );

      setMessage(
        data.message ||
        "Your outfit is ready"
      );

    } catch (error) {
      console.log(error);

      setMessage(
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // RECOMMEND COMPLETE OUTFIT
  // ==========================================

  async function recommendTotalOutfit() {
    if (!occasion) {
      setMessage(
        "Please select an occasion"
      );

      return;
    }

    if (!fullbody) {
      setMessage(
        "Full body image is missing"
      );

      return;
    }

    const formdata =
      new FormData();

    formdata.append(
      "fullbody",
      fullbody
    );

    formdata.append(
      "occasion",
      occasion
    );

    try {
      setLoading(true);

      setMessage(
        "AI is creating your perfect outfit..."
      );

      // Clear old output before new request
      setResultImage(null);
      setRecommendedProducts([]);

      const res = await fetch(
        "http://localhost:4000/totaloutfit",
        {
          method: "POST",
          body: formdata,
        }
      );

      const data =
        await res.json();

      console.log(
        "TOTAL OUTFIT RESPONSE:",
        data
      );

      if (!res.ok) {
        setMessage(
          data.message ||
          "Outfit generation failed"
        );

        return;
      }

      // =====================================
      // BACKEND RETURNS:
      //
      // {
      //   result: generated image URL,
      //   products: [...]
      // }
      // =====================================

      setResultImage(
        data.result || null
      );

      setRecommendedProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );

      setMessage(
        data.message ||
        "Your outfit is ready"
      );

    } catch (error) {
      console.log(
        "TOTAL OUTFIT ERROR:",
        error
      );

      setMessage(
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // RESET
  // ==========================================

  function resetApp() {
    setfullbodyuploaded(false);

    setFullbody(null);
    setFullbodyPreview(null);

    setSelectedPath("");

    setSelectedClothes([]);

    setShirt(null);
    setPant(null);
    setShoes(null);

    setShirtPreview(null);
    setPantPreview(null);
    setShoesPreview(null);

    setOccasion("");

    setResultImage(null);

    setRecommendedProducts([]);

    setMessage("");
  }



  //update full body
  const handleUpdateFullBody = async (event) => {

  const selectedFile =
    event.target.files[0];

  if (!selectedFile) return;

  try {

    // Immediately show new selected image

    const previewUrl =
      URL.createObjectURL(selectedFile);

    setFullbodyPreview(
      previewUrl
    );

    setFullbody(
      selectedFile
    );

    const token =
      localStorage.getItem("token");

    if (!token) {

      setMessage(
        "Please login again"
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "fullbody",
      selectedFile
    );

    const response =
      await fetch(
        "http://localhost:4000/upload-fullbody",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          body: formData
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message ||
        "Failed to update image"
      );

    }

    // Use Cloudinary URL

    setFullbodyPreview(
      data.fullBodyImage.url
    );

    setfullbodyuploaded(
      true
    );

    // Update localStorage user

    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {

      const user =
        JSON.parse(savedUser);

      const updatedUser = {
        ...user,

        fullBodyImage:
          data.fullBodyImage
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

    }

    setMessage(
      "Full body image updated successfully"
    );

  } catch (error) {

    console.log(
      "UPDATE FULL BODY ERROR:",
      error
    );

    setMessage(
      error.message
    );

  }

};

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="navbar">

        <div className="logo">

          <FaMagic />

          <span>
            Fashion<span>Match</span>
          </span>

        </div>

        <div className="nav-right">


          <div className="ai-status">

            <span className="status-dot"></span>

            AI Stylist Online

          </div>

          <button
            className="reset-btn"
            onClick={resetApp}
          >
            Reset
          </button>

          <input

  id="updateFullBodyInput"
  type="file"
  accept="image/*"
  style={{ display: "none" }}
  onChange={handleUpdateFullBody}
/>
{fullbodyPreview && (
  <button
  className="reset-btn"
  
    type="button"
    onClick={() => {
      document
        .getElementById("updateFullBodyInput")
        .click();
    }}
  >
    Update Full Body Image
  </button>
)}
          <button
  className="theme-toggle"
  onClick={toggleTheme}
  title={
    darkMode
      ? "Switch to light mode"
      : "Switch to dark mode"
  }
>
  {darkMode ? (
    <MdLightMode />
  ) : (
    <MdOutlineLightMode />
  )}
</button>

          <button  className="reset-btn" onClick={handleLogout}>
  Logout
</button>

        </div>

      </header>


      {/* MAIN */}

      <main className="main-container">


        {/* LEFT SIDE */}

        <section className="steps-section">


          {/* STEP 1 */}

          <div
            className={`step ${
              !fullbodyuploaded
                ? "active-step"
                : "completed-step"
            }`}
          >

            <div className="step-number">

              {fullbodyuploaded
                ? <FaCheck />
                : "01"
              }

            </div>

            <div className="step-content">

              <h3>
                Upload Full Body
              </h3>

              <p>
                Upload a clear full body photo
              </p>

              {!fullbodyuploaded && (

                <label className="upload-btn">

                  <FaCloudUploadAlt />

                  Upload Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFullBodyImage}
                  />

                </label>

              )}

            </div>

          </div>


          <div className="connector"></div>


          {/* STEP 2 */}

          {fullbodyuploaded && (

            <div
              className={`step ${
                selectedPath
                  ? "completed-step"
                  : "active-step"
              }`}
            >

              <div className="step-number">

                {selectedPath
                  ? <FaCheck />
                  : "02"
                }

              </div>

              <div className="step-content">

                <h3>
                  Choose Your Path
                </h3>

                <p>
                  What do you want to do?
                </p>

                <div className="choice-buttons">

                  <button
                    className={
                      selectedPath === "clothes"
                        ? "selected-choice"
                        : ""
                    }
                    onClick={() =>
                      setSelectedPath("clothes")
                    }
                  >

                    <FaTshirt />

                    I Have Clothes

                  </button>

                  <button
                    className={
                      selectedPath === "recommend"
                        ? "selected-choice"
                        : ""
                    }
                    onClick={() =>
                      setSelectedPath("recommend")
                    }
                  >

                    <FaMagic />

                    Recommend Outfit

                  </button>

                </div>

              </div>

            </div>

          )}


          {/* CLOTHES FLOW */}

          {selectedPath === "clothes" && (

            <>

              <div className="connector"></div>


              {/* STEP 3 */}

              <div className="step active-step">

                <div className="step-number">
                  03
                </div>

                <div className="step-content">

                  <h3>
                    Select Clothes
                  </h3>

                  <p>
                    Select the items you have
                  </p>

                  <div className="clothes-selection">

                    <button
                      className={
                        selectedClothes.includes("shirt")
                          ? "cloth-selected"
                          : ""
                      }
                      onClick={() =>
                        selectClothes("shirt")
                      }
                    >

                      <FaTshirt />

                      Shirt

                    </button>


                    <button
                      className={
                        selectedClothes.includes("pant")
                          ? "cloth-selected"
                          : ""
                      }
                      onClick={() =>
                        selectClothes("pant")
                      }
                    >

                     <PiPantsFill />

                      Pant

                    </button>


                    <button
                      className={
                        selectedClothes.includes("shoes")
                          ? "cloth-selected"
                          : ""
                      }
                      onClick={() =>
                        selectClothes("shoes")
                      }
                    >

                      <GiRunningShoe />

                      Shoes

                    </button>

                  </div>

                </div>

              </div>


              {/* STEP 4 */}

              {selectedClothes.length > 0 && (

                <>

                  <div className="connector"></div>

                  <div className="step active-step">

                    <div className="step-number">
                      04
                    </div>

                    <div className="step-content">

                      <h3>
                        Upload Your Items
                      </h3>

                      <p>
                        Upload the clothes you selected
                      </p>

                      <div className="mini-uploads">


                        {/* SHIRT */}

                        {selectedClothes.includes("shirt") && (

                          <label className="mini-upload">

                            {shirtPreview ? (

                              <img
                                src={shirtPreview}
                                alt="shirt"
                              />

                            ) : (

                              <>

                                <FaTshirt />

                                <span>
                                  Shirt
                                </span>

                              </>

                            )}

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleShirt}
                            />

                          </label>

                        )}


                        {/* PANT */}

                        {selectedClothes.includes("pant") && (

                          <label className="mini-upload">

                            {pantPreview ? (

                              <img
                                src={pantPreview}
                                alt="pant"
                              />

                            ) : (

                              <>

                                <PiPantsFill />

                                <span>
                                  Pant
                                </span>

                              </>

                            )}

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePant}
                            />

                          </label>

                        )}


                        {/* SHOES */}

                        {selectedClothes.includes("shoes") && (

                          <label className="mini-upload">

                            {shoesPreview ? (

                              <img
                                src={shoesPreview}
                                alt="shoes"
                              />

                            ) : (

                              <>

                                <GiRunningShoe />

                                <span>
                                  Shoes
                                </span>

                              </>

                            )}

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleShoes}
                            />

                          </label>

                        )}

                      </div>

                    </div>

                  </div>


                  {/* STEP 5 */}

                  <div className="connector"></div>

                  <div className="step final-step">

                    <div className="step-number">
                      05
                    </div>

                    <div className="step-content">

                      <h3>
                        Create Your Look
                      </h3>

                      <p>
                        Choose what AI should do
                      </p>

                      <div className="action-buttons">

                        <button
                          className="primary-action"
                          onClick={tryon}
                        >

                          <FaMagic />

                          Just Wear These

                        </button>


                        {selectedClothes.length < 3 && (

                          <button
                            className="secondary-action"
                            onClick={recommendMissingItems}
                          >

                            <FaShoppingBag />

                            Complete My Outfit

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                </>

              )}

            </>

          )}


          {/* RECOMMEND OUTFIT FLOW */}

          {selectedPath === "recommend" && (

            <>

              <div className="connector"></div>

              <div className="step active-step">

                <div className="step-number">
                  03
                </div>

                <div className="step-content">

                  <h3>
                    Choose Occasion
                  </h3>

                  <p>
                    Where are you going?
                  </p>

                  <select
                    value={occasion}
                    onChange={(e) =>
                      setOccasion(
                        e.target.value
                      )
                    }
                    className="occasion-select"
                  >

                    <option value="">
                      Select Occasion
                    </option>

                    <option value="casual">
                      Casual
                    </option>

                    <option value="college">
                      College
                    </option>

                    <option value="party">
                      Party
                    </option>

                    <option value="interview">
                      Interview
                    </option>

                    <option value="office">
                      Office
                    </option>

                    <option value="wedding">
                      Wedding
                    </option>

                    <option value="festival">
                      Festival
                    </option>

                  </select>

                </div>

              </div>


              {occasion && (

                <>

                  <div className="connector"></div>

                  <div className="step final-step">

                    <div className="step-number">
                      04
                    </div>

                    <div className="step-content">

                      <h3>
                        Create My Outfit
                      </h3>

                      <p>
                        AI will build a complete look
                      </p>

                      <button
                        className="primary-action"
                        onClick={
                          recommendTotalOutfit
                        }
                      >

                        <FaMagic />

                        Recommend & Try On

                      </button>

                    </div>

                  </div>

                </>

              )}

            </>

          )}

        </section>


        {/* CENTER MODEL */}

        <section className="model-section">

          <div className="model-header">

            <span>
              YOUR STYLE
            </span>

            <h1>
              Your Style.
              <br />
              <strong>
                Your Way.
              </strong>
            </h1>

          </div>


          <div className="model-card">

            {resultImage ? (

              <img
                className="main-model-image"
                src={resultImage}
                alt="Generated outfit"
              />

            ) : fullbodyPreview ? (

              <img
                className="main-model-image"
                src={fullbodyPreview}
                alt="Full body"
              />

            ) : (

              <div className="empty-model">

                <FaCamera />

                <h3>
                  Your AI Model
                </h3>

                <p>
                  Upload your full body photo
                </p>

              </div>

            )}

          </div>


          {loading && (

            <div className="ai-loading">

              <FaSpinner
                className="spinner"
              />

              <span>
                AI is styling you...
              </span>

            </div>

          )}


          {message && (

            <div className="message-box">
              {message}
            </div>

          )}


          {/* RECOMMENDED PRODUCTS */}

          {recommendedProducts.length > 0 && (

            <div className="recommended-products">

              <h2 className="recommend-title">
                Recommended Products
              </h2>

              <div className="products-grid">

                {recommendedProducts.map(
                  (product, index) => (

                    <ProductCard
                      key={`${product.type}-${product.platform}-${index}`}
                      product={product}
                    />

                  )
                )}

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}