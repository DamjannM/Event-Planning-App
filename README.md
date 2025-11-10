## Last changes

### Frontend

Moved DetailsModal up so it can be opened on click from Card and EventListItem components.

### Backend

Fixed Date displaying format in invite email, env variable LEADER for servers so it sends only 1 upcoming event toast from interval.

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Material UI,Recharts for data overview
**Backend:** Node.js, Express.js, JWT, SQLite (later migration to PostgreSQL, Prisma ORM), Socket.IO, Nginx, Ethereal for mailing
**Database:** (SQLite for testing) migrated to PostgreSQL, Prisma ORM

## Getting Started

0. **Install Docker Desktop**

1. **Clone the Repository**:

```bash
git clone https://github.com/DamjannM/Event-Planning-App.git
cd Event-Planning-App
```

2. **Generate the Prisma Client**:

`npx prisma generate`

3. **Build your docker images**:

`docker compose build`

4. **Create PostgreSQL migrations and apply them**:

`docker compose run app npx prisma migrate dev --name init`

_Also_ - to run/apply migrations if necessary:

`docker-compose run app npx prisma migrate deploy`

5. **Boot up docker containers**:

`docker compose up`

6.  **Access the App**:

Open `http://localhost:5173/` in your browser to see the frontend. You can register, log in, create events, join existing one, see statistics of events created by you, send invites via email to already registered users, search and filter events by type and location.

The **REST Client** file (`test.rest`) is provided to help you test the API using HTTP requests directly. You can run these requests using the **REST Client** extension for VS Code or other compatible tools.

### `test.rest`

The `test.rest` file includes requests for:

- **Registering a user**: Sends a `POST` request to create a new user.
- **Logging in**: Sends a `POST` request to authenticate a user and retrieve a JWT token.
- **Fetching events**: Sends a `GET` request to fetch the authenticated user's events (JWT required).
- **Adding a event**: Sends a `POST` request to create a new event (JWT required).
- **Updating a event**: Sends a `PUT` request to update an existing event (JWT required).
- **Deleting a event**: Sends a `DELETE` request to delete an existing event (JWT required).

### How to Use the REST Client

1. Install the **REST Client** extension for VS Code.
2. Open `test.rest`.
3. Run the requests by clicking on the "Send Request" link above each block of HTTP code.
4. Make sure to copy the token from the login response and replace `{{token}}` with the actual JWT token for protected routes.
