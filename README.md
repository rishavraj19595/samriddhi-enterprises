# Samriddhi Enterprises Platform

This project is a full-stack web application serving the frontend and backend for Samriddhi Enterprises. It is built using Node.js, Express, MongoDB, and integrates Razorpay for processing appointments.

## Prerequisites

Before running the project, ensure you have the following installed on your system:
- **Node.js** (v14 or higher recommended)
- **MongoDB** (Ensure the MongoDB service is running locally)

## Installation

1. Open your terminal or command prompt.
2. Navigate to the `vendor` directory where the `package.json` file is located:
   ```bash
   cd "d:\frontend project\vendor"
   ```
3. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

## Environment Variables (Optional)

The application can optionally use a `.env` file located in the `vendor` directory. If they are not provided, it falls back to default values:
- `PORT`: The port the server runs on (Default: `3000`)
- `MONGODB_URI`: Your MongoDB connection string (Default: `mongodb://127.0.0.1:27017/vendorDB`)
- `JWT_SECRET`: The secret key for authentication (Default: `secret123`)

*(Note: Razorpay API keys are currently configured directly inside `javascript/server.js` using test credentials.)*

## Running the Application

Since there is no `"start"` script defined in `package.json`, you need to run the server file directly using the `node` command.

From within the `vendor` directory, run:
```bash
node javascript/server.js
```

You should see output similar to:
```text
Connected to MongoDB
Server running on port 3000
```

## Accessing the Website

Once the server is running, it will automatically serve the static HTML, CSS, and JS files located in the `vendor` directory. 

Open your web browser and navigate to:
**http://localhost:3000/**

## Features implemented
- **User Authentication:** Sign up and log in using JSON Web Tokens (JWT).
- **Profile Management:** Users can update their usernames and passwords.
- **Appointment Booking & Payments:** Schedule services and complete test payments via Razorpay integration.
- **Feedback Submission:** Users can submit and save feedback forms.
