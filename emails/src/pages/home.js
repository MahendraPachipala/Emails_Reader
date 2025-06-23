import { useEffect } from "react";
import axios from "axios";

function getAccessTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("token");
}

export default function Home() {
  useEffect(() => {
    const fetch = async () => {
      const accessToken = getAccessTokenFromUrl();
      if (!accessToken) {
        console.error("No access token in URL");
        return;
      }

      console.log("Access Token:", accessToken);

      try {
        const messagesRes = await axios.get(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              maxResults: 100,
              q: "is:unread",
            },
          }
        );

        const messages = messagesRes.data.messages || [];
        if (messages.length === 0) {
          console.log("No unread messages found.");
          return;
        }

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
          }, 2000 * index);
        });
      } catch (err) {
        console.error("Error during fetch:", err.response?.data || err.message);
      }
    };

    fetch();
  }, []);

  return <div>Check console for logs. <a href="/login">Back to Login</a></div>;
}
