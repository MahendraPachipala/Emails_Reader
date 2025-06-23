// server.js
import express from "express";
import { google } from "googleapis";
import cors from "cors";
import dotenv from 'dotenv';
import url from "url";
import crypto from "crypto";

dotenv.config();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify"];
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const stateStore = new Map(); // temporary in-memory state map

app.get("/", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  stateStore.set(state, Date.now()); // store temporarily
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
    state: state,
  });
  res.json({ url: authorizationUrl });
});

app.get("/oauth2callback", async (req, res) => {
  const { code, state } = url.parse(req.url, true).query;

  if (!stateStore.has(state)) {
    return res.status(403).send("Invalid or expired state. Possible CSRF");
  }
  stateStore.delete(state); // remove once used

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Redirect to frontend with tokens in query (unsafe) or send as JSON (preferred)
    return res.redirect(`https://emails-reader.vercel.app/home?access_token=${tokens.access_token}`);
    // Or return res.json(tokens);
  } catch (error) {
    console.error("Token error:", error);
    res.status(500).send("Failed to get tokens");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
