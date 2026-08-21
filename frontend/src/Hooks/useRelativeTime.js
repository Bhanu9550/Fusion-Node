import { useState, useEffect } from 'react';

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  
  const now = new Date();
  const past = new Date(dateString);
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  
  const elapsed = now - past;
  
  if (elapsed < 0 || elapsed < msPerMinute) {
    return "just now";
  } else if (elapsed < msPerHour) {
    const mins = Math.round(elapsed / msPerMinute);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.round(elapsed / msPerDay);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}


export function useRelativeTime(timestamp) {
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(timestamp));

  useEffect(() => {
   const timeInterval = ()=>{
     setRelativeTime(formatRelativeTime(timestamp));

    const intervalId = setInterval(() => {
      setRelativeTime(formatRelativeTime(timestamp));
    }, 60000); // 1 minute interval

    return () => clearInterval(intervalId);
   }
   timeInterval()
  }, [timestamp]);

  return relativeTime;
}
