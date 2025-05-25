import express from "express";
import { google } from "googleapis";
import cors from "cors";
import dotenv from 'dotenv';
import session from "express-session"
import url from "url";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
dotenv.config();



const app = express();
// Trust proxy (important for secure cookies on Render)
app.set("trust proxy", 1);
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly","https://www.googleapis.com/auth/gmail.modify"];

app.use(cors({
  origin: true,            // Reflects the request origin
  credentials: true        // Allow credentials (cookies, auth headers, etc.)
}));


app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Session with MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 3600000 // 1 hour
  }
}));


const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Generate a secure random state value.
// const state = crypto.randomBytes(32).toString('hex');

// Store state in the session
// req.session.state = state;


app.get("/",(req,res)=>{
 const state = crypto.randomBytes(16).toString("hex");
 req.session.state = state;
 const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  /** Pass in the scopes array defined above.
    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
  scope: SCOPES,
  // Enable incremental authorization. Recommended as a best practice.
  include_granted_scopes: true,
  state: state,
  
});
res.json({url:authorizationUrl})
});


app.get('/oauth2callback', async (req, res) => {
  let q = url.parse(req.url, true).query;
  

  if (q.error) {
    console.log('Error:' + q.error);
    return res.status(400).send('OAuth error: ' + q.error);
  }
  
  if (q.state !== req.session.state) {
   
    console.log('State mismatch. Possible CSRF attack');
    return res.status(403).send('State mismatch. Possible CSRF attack');
  }

  try {
    let { tokens } = await oauth2Client.getToken(q.code);
    oauth2Client.setCredentials(tokens);
    
    // 1. Set HTTP-only cookies (secure & hidden from JS)
  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,  // Cannot be read by JavaScript
    secure: true,    // HTTPS-only (enable in production)
    sameSite: 'lax', // Prevents CSRF
    maxAge: 3600000, // 1 hour expiry (matches token)
  });


  // 2. Decode id_token to get user info
  // const userData = JSON.parse(
  //   Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
  // );

  // // 3. Store user data in a separate cookie (non-HTTP-only)
  // res.cookie('user_data', JSON.stringify({
  //   email: userData.email,
  //   name: userData.name,
  //   picture: userData.picture,
  // }), {
  //   secure: true,
  //   sameSite: 'lax',
  //   maxAge: 86400000, // 1 day
  // });

    // ✅ Redirect to frontend (or send a success message)
    res.redirect('https://emails-reader.vercel.app/home'); // adjust as needed
  } catch (error) {
    console.error("Token error:", error);
    res.status(500).send("Failed to get tokens");
  }
});



app.get("/getuserdata",(req,res)=>{
  console.log(req.cookies.access_token);
  res.json({access_token:req.cookies.access_token});
})

app.listen(3001, () => {    
  console.log("Server is running on port 3001");
});