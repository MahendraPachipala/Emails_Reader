import { useEffect } from "react";
import axios from "axios";

export default function Home() {

  useEffect(() => {
    const fetch = async () => {
      try {
        // Step 1: Get user data and access token
        const res = await axios.get("http://localhost:3001/getuserdata", {
          withCredentials: true,
        });

        const accessToken = res.data.access_token;
        console.log("Access Token:", accessToken);

        // Step 2: Fetch 100 unread Gmail messages
        const messagesRes = await axios.get(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              maxResults: 100,
              q: "is:unread", // Only fetch unread emails
            },
          }
        );

        const messages = messagesRes.data.messages;

        if (!messages || messages.length === 0) {
          console.log("No unread messages found.");
          return;
        }

        // Step 3: Loop through each message and mark it as read with delay
        messages.forEach((message, index) => {
          setTimeout(() => {
            axios
              .post(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
                {
                  removeLabelIds: ["UNREAD"],
                },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              )
              .then(() => {
                console.log(`Marked message ${message.id} as read`);
              })
              .catch((err) => {
                console.error(
                  `Failed to modify message ${message.id}`,
                  err.response?.data || err.message
                );
              });
          }, 2000 * index); // Delay increases with each message
        });
      } catch (err) {
        console.error("Error during fetching:", err.response?.data || err.message);
      }
    };

    fetch();
  }, []);

  return <a href="/login">login</a>;
}
