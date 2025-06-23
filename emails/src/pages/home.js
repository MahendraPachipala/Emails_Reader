// /home.jsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { access_token } = router.query;
    if (!access_token) {
      console.error("Missing access token");
      return;
    }

    const fetchUnread = async () => {
      try {
        const messagesRes = await axios.get(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages",
          {
            headers: { Authorization: `Bearer ${access_token}` },
            params: { maxResults: 100, q: "is:unread" },
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
              { removeLabelIds: ["UNREAD"] },
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  "Content-Type": "application/json",
                },
              }
            ).then(() => {
              console.log(`Marked message ${message.id} as read`);
            }).catch(err => {
              console.error(`Failed to modify message ${message.id}`, err.response?.data || err.message);
            });
          }, 2000 * index);
        });

      } catch (err) {
        console.error("Error fetching unread emails:", err.response?.data || err.message);
      }
    };

    fetchUnread();
  }, [router.query]);

  return <div>Loading Gmail Data...</div>;
}
