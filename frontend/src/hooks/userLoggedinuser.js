import { useState, useEffect } from "react";
import { useUserAuth } from "../context/Userauthcontext";

const userLoggedinuser = () => {
  const { user } = useUserAuth();
  const email = user?.email;
  const [loggedinuser, setLoggedinuser] = useState(null); // Initialize with null to handle loading state
  const [error, setError] = useState(null); // Add error state
  const [isLoading, setIsLoading] = useState(false);
  const [tweetMessage, setTweetMessage] = useState("");
  const [tweetImage, setTweetImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (email) {
      const fetchLoggedinUser = async () => {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/users/loggedinuser?email=${email}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch logged in user");
          }
          const data = await response.json();
          setLoggedinuser(data);
        } catch (error) {
          console.error("Error fetching logged in user:", error);
          setError(error.message);
        }
      };

      fetchLoggedinUser();
    }
  }, [email]);

  return [loggedinuser, setLoggedinuser, error]; // Return error state as well
};

export default userLoggedinuser;
