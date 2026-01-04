import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { formatTimer, getTimeUntilExpiry } from '../utils/dateUtils';

interface TimerProps {
  momentTime: Date;
  onExpire?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ momentTime, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(getTimeUntilExpiry(momentTime));
  
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = getTimeUntilExpiry(momentTime);
      setSecondsLeft(timeLeft);
      
      if (timeLeft === 0 && onExpire) {
        onExpire();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [momentTime]);
  
  const isExpired = secondsLeft === 0;
  const isLessThan30Seconds = secondsLeft < 30;
  
  return (
    <View className={`px-4 py-2 rounded-full ${isExpired ? 'bg-red-600' : isLessThan30Seconds ? 'bg-orange-500' : 'bg-black'}`}>
      <Text className="text-white font-bold text-base">
        {isExpired ? 'TIME\'S UP!' : formatTimer(secondsLeft)}
      </Text>
    </View>
  );
};

