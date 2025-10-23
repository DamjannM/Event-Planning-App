## Last changes

### Frontend

Responsive, fixed UI visual bugs, lifted Calendar state up so it can be shared with EventList component, connected Calendar with EventList, when clicking on date it shows events for that date. Days with events have dot below in calendar,on clicking event, opens DetailsModal with all information. Delete and Update Event.

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
