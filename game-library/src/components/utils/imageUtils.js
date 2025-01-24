import { useState, useEffect } from 'react';
import supabase from "../../config/supabase";

// Retrieves base URL for game_data storage bucket
export async function getStorageBaseUrl() {
  const { data } = await supabase.storage.from("game_data").getPublicUrl("");
  // Remove the trailing slash if any
  return data.publicUrl.replace(/\/$/, "");
}

export function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

// Custom hook that validates and returns a complete Supabase image URL
export function useValidatedSupabaseImage(path) {

  const [baseUrl, setBaseUrl] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAndSetUrl = async () => {
      const url = await getStorageBaseUrl();
      const fullUrl = `${url}/${path}`;

      const img = new Image();
      img.onload = () => {
        setIsValid(true);
        setBaseUrl(url);
      };
      img.onerror = () => {
        setIsValid(false);
        setBaseUrl("");
      };
      img.src = fullUrl;
    };

    validateAndSetUrl();
  }, [path]);

  return baseUrl && isValid ? `${baseUrl}/${path}` : null;
}