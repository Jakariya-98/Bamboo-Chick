# Bamboo Chick — app folder

The full documentation for this project lives in the repository root: **[`../readme.md`](../readme.md)**.

Quick start:

```bash
cd server && npm install && npm run seed && npm run dev   # API on http://localhost:5000
cd client && npm install && npm run dev                   # app on http://localhost:5173
```

Create `server/.env` with `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` and `CLIENT_URL`
(see the table in `../readme.md` — no environment file is committed to this repository).
