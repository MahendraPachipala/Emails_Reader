import { useEffect } from "react";
import axios from "axios";

export default function Home() {
  useEffect(() => {
    // ✅ Extract access_token from query string (e.g. ?access_token=xxxx)
    const queryParams = new URLSearchParams(window.location.search);
    const access_token = queryParams.get("access_token");

    if (!access_token) {
      console.error("Missing access token in URL");
      return;
    }

    const fetchUnreadEmails = async () => {
      try {
        const messagesRes = await axios.get(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
            params: {
              maxResults: 100,
              q: "is:unread",
            },
          }
        );

        const messages = messagesRes.data.messages;

        if (!messages || messages.length === 0) {
          console.log("No unread messages found.");
          return;
        }

        messages.forEach((message, index) => {
          setTimeout(() => {
            axios.post(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
              {
                removeLabelIds: ["UNREAD"],
              },
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
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
        console.error("Error fetching emails:", err.response?.data || err.message);
      }
    };

    fetchUnreadEmails();
  }, []);

  return <div>Loading your unread Gmail messages...</div>;
}
