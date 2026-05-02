import { useEffect, useState } from "react";
import type { NgoInfo } from "../interfaces/Topbar.interface";

export function useNgoInfo() {
  const [ngoInfo, setNgoInfo] = useState<NgoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    try {
      setNgoInfo({
        email: "info@ngo.org",
        address: "Kathmandu, Nepal",
        phoneNumber: "+977-9800000000",
        facebookLink: "https://facebook.com/ngo",
        twitterLink: "https://twitter.com/ngo",
        linkedinLink: "https://linkedin.com/company/ngo",
        instagramLink: "https://instagram.com/ngo",
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { ngoInfo, loading, error };
}