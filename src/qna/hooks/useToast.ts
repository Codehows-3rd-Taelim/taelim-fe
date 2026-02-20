import { useEffect, useState } from "react";

export default function useToast(duration = 2000) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), duration);
    return () => clearTimeout(t);
  }, [message, duration]);

  return { toast: message, showToast: setMessage };
}
