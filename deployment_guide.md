# Full-Stack Deployment Guide (Netlify + Render + MongoDB Atlas)

Follow these steps to make your website live and accessible to the world.

---

## Phase 1: Database Setup (MongoDB Atlas)
Since your local MongoDB won't work on the internet, we use **MongoDB Atlas** (Free Tier).

1. **Sign Up:** Go to [mongodb.com](https://www.mongodb.com/cloud/atlas) and create an account.
2. **Create a Cluster:** Choose the "M0" free tier and pick a region near you.
3. **Database Access:** Create a user (e.g., `admin`) and a password. **Save these!**
4. **Network Access:** Click "Add IP Address" and select **"Allow Access from Anywhere"** (0.0.0.0/0). This is required for Render.
5. **Get Connection String:** Click "Connect" -> "Drivers" -> Copy the string. It looks like:
   `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   *(Replace `<password>` with your actual password).*

---

## Phase 2: Push Your Code to GitHub
Both Netlify and Render work best when connected to a GitHub repository.

1. Go to [GitHub](https://github.com) and create a **New Repository** (e.g., `samriddhi-platform`).
2. Run these commands in your project root (`vendor` folder):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## Phase 3: Deploy Backend (Render)
Render will host your Node.js API.

1. **Sign Up:** Go to [render.com](https://render.com) and sign up with GitHub.
2. **New Web Service:** Click `New +` -> `Web Service`.
3. **Connect Repo:** Select your GitHub repository.
4. **Configure:**
   - **Name:** `samriddhi-backend`
   - **Root Directory:** `backend` (Important!)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. **Environment Variables:** Click "Advanced" -> "Add Environment Variable":
   - `MONGODB_URI` = `your_atlas_connection_string`
   - `JWT_SECRET` = `any_long_random_string`
   - `PORT` = `3000` (Render will override this, but it's safe to set).
6. **Deploy:** Click "Create Web Service". **Copy the URL** (e.g., `https://samriddhi-backend.onrender.com`).

---

## Phase 4: Connect Frontend to Backend
Now you must tell your frontend where the live backend is.

1. **Update `frontend/javascript/login_script.js`** and **`menu.js`**:
   Change the `API_BASE_URL` to your Render URL:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
       ? 'http://localhost:3000' 
       : 'https://samriddhi-backend.onrender.com'; // <--- PASTE YOUR URL HERE
   ```
2. **Push to GitHub again:**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

---

## Phase 5: Deploy Frontend (Netlify)
Netlify will host your beautiful HTML/CSS files.

1. **Sign Up:** Go to [netlify.com](https://netlify.com) and sign up with GitHub.
2. **Add New Site:** Click `Add new site` -> `Import from existing project`.
3. **Connect Repo:** Select your GitHub repository.
4. **Configure:**
   - **Base directory:** `frontend` (Important!)
   - **Build command:** (Leave empty)
   - **Publish directory:** `.` (or leave blank since base is `frontend`).
5. **Deploy:** Click "Deploy site".

---

## Common Mistakes & Troubleshooting
- **CORS Error:** If the frontend can't talk to the backend, ensure `app.use(cors())` is in `server.js`.
- **White Page/404:** Check the "Base Directory" and "Publish Directory" in Netlify.
- **MongoDB Connection Failed:** Check if you whitelisted `0.0.0.0/0` in Atlas Network Access.
- **Spinning Loader:** Render's free tier "sleeps" after 15 mins of inactivity. The first request might take 30-60 seconds to wake it up.
