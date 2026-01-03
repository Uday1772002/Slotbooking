# Calendar Slot Booking

Book time slots with phone authentication. Simple and clean.

## What it does

- Login with phone number (OTP verification)
- Create time slots
- Book available slots
- View your bookings
- Get notifications

## Tech Used

**Backend:** Node.js, Express, MongoDB, Firebase Admin  
**Frontend:** React, Firebase Auth

## Setup

### 1. Firebase

Go to [Firebase Console](https://console.firebase.google.com/):

- Create a project
- Enable Phone Authentication
- Get web app config (for frontend)
- Download service account key (for backend)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5002
MONGODB_URI=your-mongodb-connection-string
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-email
```

Start:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_API_URL=http://localhost:5002/api
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

Start:

```bash
npm start
```

Open http://localhost:3000

## How to Use

1. Login with phone (+1234567890)
2. Click "+ Create Slot" on dashboard
3. Fill in date, start time, end time
4. Click "Book Slot" on any available slot
5. Check "My Bookings" to see your bookings
6. Check "Notifications" for updates

## Folder Structure

```
backend/
  ├── config/        # Database and Firebase setup
  ├── controllers/   # Business logic
  ├── models/        # Database schemas
  ├── routes/        # API endpoints
  └── middleware/    # Auth and validation

frontend/
  ├── src/
      ├── components/  # Reusable UI parts
      ├── pages/       # Login, Dashboard, Bookings
      ├── context/     # Auth state management
      └── services/    # API calls
```

## Key Features

- **No time clash:** Can't create overlapping slots
- **No double booking:** Can't book same slot twice
- **Auto availability:** Slots become unavailable when full
- **Secure:** Firebase JWT tokens for auth

## Common Issues

**Port already in use:**

```bash
kill -9 $(lsof -ti:5002)
```

**MongoDB not connected:**

- Check if MongoDB is running
- Verify connection string

**Firebase error:**

- Make sure .env values don't have quotes
- Check Firebase credentials are correct

**Can't login:**

- Add test phone numbers in Firebase Console
- Example: +1234567890 with code 123456

## Notes

- Use Firebase test numbers for development (free)
- MongoDB Atlas free tier works fine
- Backend runs on port 5002
- Frontend runs on port 3000
