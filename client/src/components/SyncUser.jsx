import React, { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const SyncUser = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!user || !isSignedIn) return;

      const token = await user.getToken();

      await fetch("http://localhost:4000/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
    };

    syncUser();
  }, [user, isSignedIn]);

  return null;
};

export default SyncUser;
