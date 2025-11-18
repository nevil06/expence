# Expense Manager

A full-stack expense manager mobile application built with React Native, Expo, TypeScript, and Firebase.

## Features

- User authentication (register/login)
- Add, edit, and delete expenses
- Categorize expenses
- View expense reports and analytics
- Dark/Light theme support
- Offline support
- Expense synchronization across devices

## Tech Stack

### Frontend
- React Native
- Expo
- TypeScript
- React Navigation
- React Native Paper (UI components)
- React Native Firebase

### Backend
- Node.js
- Express.js
- TypeScript
- Firebase Admin SDK
- JWT for authentication

### Database
- Firebase Firestore
- Firebase Authentication

## Project Structure

```
expense-manager/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication middleware
│   │   └── utils/          # Utility functions
│   └── package.json
├── frontend/               # React Native mobile app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   └── components/     # Reusable components
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app installed on your mobile device
- Firebase project with Firestore enabled

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following:
```env
PORT=8080
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=your_firebase_auth_uri
FIREBASE_TOKEN_URI=your_firebase_token_uri
FIREBASE_AUTH_PROVIDER_CERT_URL=your_firebase_auth_provider_cert_url
FIREBASE_CLIENT_CERT_URL=your_firebase_client_cert_url
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory with the following:
```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

4. Create the required assets (icon, splash screen, etc.) as described in the assets section below

5. Start the Expo development server:
```bash
npx expo start
```

## API Endpoints

The backend API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login an existing user

### Expenses
- `GET /api/expenses` - Get user's expenses (with pagination/filtering)
- `GET /api/expenses/:id` - Get a specific expense
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Categories
- `GET /api/categories` - Get user's categories
- `GET /api/categories/:id` - Get a specific category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Settings
- `GET /api/settings` - Get user's settings
- `PUT /api/settings` - Update user's settings

## Environment Variables

Both the backend and frontend require environment variables to function properly. See the setup instructions above for details.

## Running on Mobile

### Prerequisites
- Install the Expo Go app from your device's app store (available on both Google Play and Apple App Store)
- Ensure your mobile device is on the same Wi-Fi network as your development machine
- Node.js and npm installed on your development machine

### Steps
1. Make sure your backend server is running (port 8080):
```bash
cd backend
npm run dev
```

2. In a new terminal, navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

3. Create the required assets in the `frontend/assets` directory (see Asset Configuration section below)

4. Run the Expo development server:
```bash
npx expo start
```

5. The Expo development tool will start in your browser

6. Scan the QR code shown in the browser using your mobile device's camera or the Expo Go app

7. The app will load on your mobile device

### Alternative Method
- If using the Expo CLI, you can run:
```bash
npx expo start --tunnel
```
- This creates a tunnel that allows you to connect to the development server from anywhere, not just the same network

### Asset Configuration
To properly display your app on mobile devices, you need to create the following assets in the `frontend/assets` directory:
- `icon.png` - App icon (1024x1024 recommended)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon

See the `frontend/assets/README.md` file for detailed information about asset requirements.

### Firebase Configuration (for push notifications and Firestore)
The app has Firebase dependencies for push notifications and additional Firestore operations, but the configuration is not fully implemented. For now, the app uses the REST API for all data operations. To fully implement Firebase features:

1. Create a Firebase project at https://console.firebase.google.com/
2. Add your Android and iOS apps to the project
3. Download and add the `google-services.json` file to `frontend/android/app/`
4. Add the `GoogleService-Info.plist` file to the iOS project (if building for iOS)
5. Configure the Firebase credentials in your environment variables

## Development

- Run `npm run dev` in the project root to start both frontend and backend in development mode
- Backend runs on port 8080 by default
- Frontend runs with Expo on the default port

## Testing

Run tests for the backend:
```bash
cd backend && npm test
```

Run tests for the frontend:
```bash
cd frontend && npm test
```

## Deployment

### Backend
- The backend can be deployed to any Node.js hosting platform (Heroku, Vercel, etc.)
- Make sure to configure the environment variables properly

### Frontend
- The app can be built and published using Expo:
```bash
cd frontend
npx expo publish
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue in the GitHub repository.