# FashionMatch 👕✨

FashionMatch is an AI-powered fashion platform that helps users build better outfits.

Users can upload their full-body image and clothing items, generate virtual try-ons, receive personalized outfit recommendations, identify missing clothing items, and get shopping links to purchase recommended products.

---

## 🚀 Features

### 🔐 Authentication

- User registration
- User login
- JWT authentication
- Protected routes
- Logout functionality
- Secure password hashing using bcrypt

### 👤 User Profile

- Upload full-body image
- Store user information in MongoDB
- Store full-body images in Cloudinary
- Automatically display the saved full-body image after login
- Update the full-body image

### 👕 Virtual Try-On

Users can upload clothing items such as:

- Shirt
- Pant
- Shoes

The application uses a virtual try-on system to generate an updated image showing the clothing on the user.

### 🤖 AI Outfit Recommendations

FashionMatch analyzes the user's current outfit and can:

- Detect missing clothing items
- Recommend suitable clothing items
- Suggest matching colors
- Suggest clothing styles
- Create search queries for recommended products
- Recommend outfit combinations based on the user's uploaded clothing and appearance

### 🛍️ Shopping Recommendations

Users can discover recommended fashion products and access shopping platforms such as:

- Amazon
- Flipkart
- Myntra

Recommendations may include:

- Product name
- Product image
- Price
- Recommended color
- Recommended style
- Shopping links

### 🌙 User Interface

- Modern authentication pages
- Responsive design
- Dark mode
- Light mode
- Password show/hide functionality
- Loading states
- Error handling

---

# 🧠 How It Works

The FashionMatch workflow works like this:

1. The user creates an account.
2. The user logs in.
3. The user uploads a full-body image.
4. The image is uploaded to Cloudinary.
5. The Cloudinary image URL is stored in MongoDB.
6. When the user logs in again, their saved full-body image is displayed.
7. The user uploads available clothing items.
8. The clothing items are applied using virtual try-on.
9. An updated image of the user wearing the available clothing is generated.
10. The system checks which clothing items are missing.
11. AI analyzes the current outfit.
12. AI recommends suitable missing clothing items.
13. The system generates product search recommendations.
14. Users can explore shopping options on supported platforms.

---

# 🛠️ Tech Stack

## Frontend

- React
- React Router DOM
- JavaScript
- CSS
- React Icons

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

## External Services

- Cloudinary
- Google Gemini AI
- Virtual Try-On API

## Shopping Platforms

- Amazon
- Flipkart
- Myntra

---

# 📁 Project Structure

```text
FashionMatch/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   │
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .gitignore
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project:

```bash
cd FashionMatch
```

---

# 💻 Frontend Setup

Move into the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

---

# 🖥️ Backend Setup

Open another terminal.

Move into the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Run the backend:

```bash
npm start
```

If you use nodemon:

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=4000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

TRYONCLOUD_API_KEY=your_tryon_api_key
```

⚠️ Never upload your `.env` file to GitHub.

---

# 🔐 Authentication Flow

FashionMatch uses JWT authentication.

### Registration

1. User enters name, email, and password.
2. Password is hashed using bcrypt.
3. User information is stored in MongoDB.
4. A JWT token is generated.
5. The token is stored in the browser.

### Login

1. User enters email and password.
2. The backend verifies the credentials.
3. A JWT token is generated.
4. The user is redirected to the protected application.

---

# 🖼️ Image Storage

Full-body images are uploaded to Cloudinary.

The image information is stored in MongoDB.

Example:

```json
{
  "fullBodyImage": {
    "url": "cloudinary_image_url",
    "publicId": "cloudinary_public_id"
  }
}
```

When the user logs in again, the saved image can be retrieved and displayed.

---

# 🤖 AI Recommendation Flow

The application analyzes the user's outfit.

If an item is missing:

```text
Missing:
- Shirt
```

The AI can generate recommendations such as:

```json
{
  "recommendations": [
    {
      "type": "shirt",
      "color": "navy blue",
      "style": "casual shirt",
      "searchQuery": "men navy blue casual shirt"
    }
  ]
}
```

The recommendation can then be used to search for suitable products.

---

# 🛍️ Shopping Flow

The application can provide shopping options for recommended clothing items.

Supported shopping platforms include:

- Amazon
- Flipkart
- Myntra

Users can use the generated product recommendations to find and purchase matching fashion items.

---

# 🌙 Dark Mode

FashionMatch supports:

- Light mode
- Dark mode

The UI automatically changes:

- Background colors
- Text colors
- Button colors
- Input fields
- Cards
- Authentication pages

---

# 🔒 Security

The project uses:

- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Environment variables for API keys
- `.gitignore` to protect sensitive files

Example `.gitignore`:

```gitignore
# Dependencies
frontend/node_modules/
backend/node_modules/

# Environment variables
frontend/.env
backend/.env
.env

# Logs
*.log

# Generated files
backend/generated/
backend/uploads/

# OS files
.DS_Store
```

---

# 🔮 Future Improvements

- Saved outfit history
- User profile management
- Multiple full-body images
- Better AI fashion recommendations
- More shopping platforms
- Wishlist functionality
- Product comparison
- Mobile application
- Better mobile optimization
- Production deployment

---

# 👨‍💻 Author

**Vimal Kumar**

---

# 📄 License

This project was created for learning, portfolio, and educational purposes.
