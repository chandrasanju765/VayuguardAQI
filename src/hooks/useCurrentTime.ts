import { useEffect, useState } from "react";
import { formatDate } from "../utils";

export interface UseCurrentTimeReturn {
  currentTime: Date;
  formattedTime: string;
  greeting: string;
}

/**
 * Custom hook to get current time and appropriate greeting
 * Updates every second to keep time accurate
 */
export const useCurrentTime = (): UseCurrentTimeReturn => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as "9:32 AM"
  const formattedTime = formatDate(currentTime.toISOString(), "h:mm A");

  // Generate appropriate greeting based on hour
  const getGreeting = (hour: number): string => {
    if (hour < 12) return "Good Morning!";
    if (hour < 17) return "Good Afternoon!";
    if (hour < 20) return "Good Evening!";
    return "Good Night!";
  };

  const greeting = getGreeting(currentTime.getHours());

  return {
    currentTime,
    formattedTime,
    greeting,
  };
};
