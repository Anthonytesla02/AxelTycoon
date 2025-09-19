import { useEffect, useState } from "react";
import { Achievement } from "@shared/schema";
import { Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: 0.5 
          }}
          className="fixed top-20 right-6 bg-accent text-accent-foreground p-4 rounded-lg shadow-xl z-50 border border-accent/20"
          data-testid="achievement-notification"
        >
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 1,
                repeat: 2,
                delay: 0.3
              }}
            >
              <Trophy className="text-2xl" size={32} />
            </motion.div>
            <div>
              <motion.div 
                className="font-bold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Achievement Unlocked!
              </motion.div>
              <motion.div 
                className="text-sm" 
                data-testid="achievement-name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {achievement.name}
              </motion.div>
              <motion.div 
                className="text-xs opacity-80 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                +{achievement.reward.xp} XP
              </motion.div>
            </div>
          </motion.div>
          
          {/* Particle effect */}
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [1, 0.7, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
