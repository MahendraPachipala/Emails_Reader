// your other imports
import express from "express";
import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";
import url from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify"
];

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get("/", (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
    state: "static_state"
  });

  res.json({ url: authorizationUrl });
});

app.get("/oauth2callback", async (req, res) => {
  const q = url.parse(req.url, true).query;

  if (q.error) {
    return res.status(400).send("OAuth error: " + q.error);
  }

  try {
    const { tokens } = await oauth2Client.getToken(q.code);
    oauth2Client.setCredentials(tokens);

    // Instead of storing in cookie/session, redirect with token
    const accessToken = tokens.access_token;
    res.redirect(`https://emails-reader.vercel.app/home?token=${accessToken}`);
  } catch (error) {
    console.error("Token error:", error);
    res.status(500).send("Failed to get tokens");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
