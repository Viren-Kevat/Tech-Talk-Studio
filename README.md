﻿# Tech-Talk Studio 

## Overview

This project is a full-stack web application that includes both a backend and a frontend. The backend is built using Node.js and Express.js, while the frontend is developed using React and Vite. The application provides features such as user authentication,Blog/Post management, and profile handling. It also supports multiple languages and integrates with external services like Firebase and Cloudinary.

## Folder Structure

### Backend

- **app.js**: Entry point for the backend application.
- **db.js**: Database connection setup.
- **controller/**: Contains controllers for handling business logic for comments, students,Blog/Posts, and users.
- **middleware/**: Includes middleware for authentication and comment authorization.
- **model/**: Defines database models for Comment, OTP,Blog/Post, and User.
- **routes/**: Contains route definitions for authentication, comments, students,Blog/Posts, and users.
- **service/**: Includes services like Cloudinary integration.
- **tmp/**: Temporary files generated during runtime.

### Frontend

- **eslint.config.js**: ESLint configuration for code linting.
- **firebase.json**: Firebase configuration file.
- **index.html**: Main HTML file for the frontend.
- **vite.config.js**: Vite configuration file.
- **public/**: Contains static assets like images and icons.
- **src/**: Main source folder for the frontend application.
  - **App.jsx**: Main application component.
  - **components/**: Reusable UI components like modals and loaders.
  - **context/**: Context providers for Firebase and user authentication.
  - **hooks/**: Custom hooks for user-related operations.
  - **locales/**: JSON files for multi-language support.
  - **pages/**: Page components like Home, Login, Signup, and Profile.
  - **assets/**: Static assets like SVGs.

## Features

- User authentication (login, signup, forgot password).
  -Blog/Post management (create, edit, deleteBlog/Posts).
- Profile management (view and edit profiles).
- Multi-language support.
- Integration with Firebase for authentication and Cloudinary for media uploads.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

## Setup Instructions

### Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open the frontend application in your browser (default: `http://localhost:5173`).
2. Use the application to sign up, log in, and manageBlog/Posts and profiles.

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, JWT, Cloudinary
- **Frontend**: React, Vite, Firebase, CSS Modules

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## Contact

For any inquiries or support, please contact Viren Kevat at viren0210@gmail.com.
