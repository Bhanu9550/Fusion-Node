import { useState, useEffect } from 'react';

function calculateDuration(targetDateString) {
  if (!targetDateString) return "";

  const now = new Date();
  const target = new Date(targetDateString);
  const diffTime = target - now;

  // If the date has already passed
  if (diffTime <= 0) {
    return "Expired";
  }

  // Calculate total days left
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Convert to months and remaining days
  const months = Math.floor(totalDays / 30);
  const remainingDays = totalDays % 30;

  // Build the display string dynamically
  let result = "";
  if (months > 0) {
    result += `${months} ${months === 1 ? 'month' : 'months'} `;
  }
  if (remainingDays > 0) {
    result += `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
  }

  return result.trim();
}

export function useDuration(targetDate) {
  const [duration, setDuration] = useState(() => calculateDuration(targetDate));

  useEffect(() => {
    const timeInterval = ()=>{
        setDuration(calculateDuration(targetDate));

    // Update the countdown every minute
    const intervalId = setInterval(() => {
      setDuration(calculateDuration(targetDate));
    }, 60000);

    return () => clearInterval(intervalId);
    }
    timeInterval()
  }, [targetDate]);

  return duration;
}
