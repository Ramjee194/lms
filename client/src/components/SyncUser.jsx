import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

const SyncUser = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const sync = async () => {
      try {
        const token = await getToken();
        console.log("🪪 Clerk Token:", token);  // Debug: log the token

        if (!token) {
          console.log("No token found, user may not be authenticated.");
          return;  // If no token, exit early
        }

        // Send the token to the backend
        const response = await axios.post("/api/sync-user", {}, {
          headers: {
            Authorization: `Bearer ${token}`,  // Attach the token in the Authorization header
          },
        });

        console.log("Sync successful:", response.data);  // Log the response

      } catch (error) {
        console.log("Sync failed:", error.message);  // Debug: catch any errors
      }
    };

    if (user) {
      sync();  // Trigger sync if the user is available
    }
  }, [user, getToken]);

  return null;  // No UI to render
};

export default SyncUser;
