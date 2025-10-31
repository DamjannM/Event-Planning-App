## Last changes

### Frontend

Implementing sending invites via email.

### Backend

New routes for sending invites via email, refactored database with event participants with state if invite is accepted/declined/pending.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/DamjannM/Event-Planning-App.git
cd event-planning-app
```

### 2. Install dependencies

Backend

```bash
cd server
npm install
```

Frontend

```bash
cd client
npm install
```

### 3. Create environment variable

.env file in server folder
`JWT_SECRET = "secret_key"
PORT = 5000`

### 4. Run application

Backend

```bash
cd server
npm run dev
```

Frontend

```bash
cd client
npm run dev
```

Open the app in your browser:
`http://localhost:5173`
