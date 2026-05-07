import { useEffect, useState } from "react";

export function useDelayedLoading(delay = 350) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (delay <= 0) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoading;
}
