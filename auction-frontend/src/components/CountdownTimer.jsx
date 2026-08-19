import { useState, useEffect } from 'react';


function CountdownTimer({ closeTime, status }) {

 
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
   
    if (status !== 'ACTIVE') {
      setTimeLeft('Auction Ended');
      return; // Don't start timer
    }

    let timer;

    // This function calculates how much time is left RIGHT NOW
    const calculateTimeLeft = () => {
      const now = new Date();                    
      const close = new Date(closeTime);         
      const diff = close - now;                  

      if (diff <= 0) {
       
        setTimeLeft('⏰ Auction Closed');
        if (timer) clearInterval(timer);
        return;
      }

      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Build the display string
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);  // Final seconds — show urgency
      }
    };

    calculateTimeLeft(); 

    timer = setInterval(calculateTimeLeft, 1000);


    return () => clearInterval(timer);

  }, [closeTime, status]); 

 
  const isUrgent = timeLeft.includes('s') && !timeLeft.includes('m') && !timeLeft.includes('h');

  return (
    <span className={`fw-bold ${isUrgent ? 'text-danger' : 'text-success'}`}>
      ⏱ {timeLeft}
    </span>
  );
}

export default CountdownTimer;
