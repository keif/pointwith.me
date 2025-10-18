<p align="center">
 <img src="https://www.pointwith.me/android-chrome-192x192.png" alt="PointWith.me"/>
 <br />
 <a href="https://pointwith.baker.is">https://pointwith.baker.is</a>
</p>

PointWith.me is a way for remote teams to story point quickly and easily. Someone 'Drives' your session and all the players open the link on their phone/desktop and just point issues as they cycle through.

PointWith.me is free to use hosted or download and run it on your own environment.

Check us out and use it for free today - https://pointwith.baker.is

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) package manager
- A [Firebase](https://firebase.google.com/) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pointwith.me.git
   cd pointwith.me
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

### Firebase Setup

1. **Create a Firebase project**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Choose a project name (e.g., "pointwithme")

2. **Enable Firebase Authentication**
   - In your Firebase project, navigate to **Authentication** → **Sign-in method**
   - Enable the following providers:
     - **Anonymous** (for guest users)
     - **Google** (for Google sign-in)
     - **Twitter** (optional, if you want Twitter auth)
     - **GitHub** (optional, if you want GitHub auth)

3. **Create a Realtime Database**
   - Navigate to **Realtime Database** in the Firebase Console
   - Click "Create Database"
   - Start in **test mode** for development (you can configure security rules later)
   - Note the database URL (e.g., `https://your-project-default-rtdb.firebaseio.com`)

4. **Get your Firebase configuration**
   - Go to **Project Settings** (gear icon) → **General**
   - Scroll down to "Your apps" and click the web icon (`</>`)
   - Register your app with a nickname (e.g., "PointWith.me Web")
   - Copy the configuration values (you'll need `apiKey`, `authDomain`, and `databaseURL`)

### Environment Configuration

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your Firebase credentials**
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   ```

### Running the Application

**Development mode**
```bash
pnpm dev
```
This will start the development server at `http://localhost:3000` and automatically open it in your browser.

**Alternative start command**
```bash
pnpm start
```

### Building for Production

**Build the application**
```bash
pnpm build
```
This creates an optimized production build in the `build` directory.

**Preview the production build**
```bash
pnpm preview
```

### Testing

**Run tests**
```bash
pnpm test
```

**Run tests with UI**
```bash
pnpm test:ui
```

**Generate coverage report**
```bash
pnpm test:coverage
```

### Deployment

The application can be deployed to any static hosting service (Vercel, Netlify, Firebase Hosting, GitHub Pages, etc.).

**Example: Deploy to GitHub Pages**
```bash
pnpm deploy
```

**Important**: If deploying to GitHub Pages, uncomment the `base` line in `vite.config.js`:
```javascript
base: '/pointwith.me/',
```

### Troubleshooting

**Port already in use**
- The default port is 3000. If it's in use, Vite will automatically try the next available port.
- You can change the port in `vite.config.js` under `server.port`.

**Firebase authentication errors**
- Verify your Firebase configuration in `.env`
- Ensure authentication providers are enabled in Firebase Console
- Check that your domain is authorized in Firebase Console → Authentication → Settings → Authorized domains

**Database permission errors**
- Make sure Realtime Database is created and running
- Check database rules in Firebase Console → Realtime Database → Rules
- For development, you can use open rules (⚠️ not recommended for production):
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```

## Contributing
- Send a PR!
- Bonus if it's an open issue
