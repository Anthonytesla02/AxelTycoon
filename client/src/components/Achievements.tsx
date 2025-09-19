import { Achievement } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal } from "lucide-react";

interface AchievementsProps {
  achievements: Achievement[];
  recentNotifications?: Array<{ type: string; message: string; value: number }>;
}

export function Achievements({ achievements, recentNotifications = [] }: AchievementsProps) {
  const calculateProgress = (achievement: Achievement): number => {
    // Mock progress calculation - in real implementation this would be based on current game state
    if (achievement.unlocked) return 100;
    return Math.random() * 80; // 0-80% for unlocked achievements
  };

  return (
    <Card className="border border-border overflow-y-auto" data-testid="card-achievements">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((achievement) => {
          const progress = calculateProgress(achievement);
          const isUnlocked = achievement.unlocked;
          
          return (
            <div 
              key={achievement.id} 
              className={`p-3 rounded-lg border ${
                isUnlocked 
                  ? 'bg-accent bg-opacity-20 border-accent' 
                  : 'bg-secondary border-border'
              }`}
              data-testid={`achievement-${achievement.id}`}
            >
              <div className="flex items-center space-x-3">
                {isUnlocked ? (
                  <Trophy className="text-accent" size={20} />
                ) : (
                  <Medal className="text-muted-foreground" size={20} />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${isUnlocked ? 'text-accent' : 'text-foreground'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.description}
                  </div>
                  {!isUnlocked && (
                    <div className="mt-2">
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Recent Notifications */}
        {recentNotifications.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Recent</div>
            <div className="space-y-2">
              {recentNotifications.map((notification, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded border-l-4 text-sm ${
                    notification.type === 'xp' 
                      ? 'bg-accent bg-opacity-10 border-accent' 
                      : 'bg-chart-2 bg-opacity-10 border-chart-2'
                  }`}
                  data-testid={`notification-${index}`}
                >
                  <span className={`font-medium ${
                    notification.type === 'xp' ? 'text-accent' : 'text-chart-2'
                  }`}>
                    +{notification.value} {notification.type === 'xp' ? 'XP' : 'Rep'}:
                  </span>{' '}
                  {notification.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
