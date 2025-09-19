import { NewsItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface NewsFeedProps {
  newsItems: NewsItem[];
}

export function NewsFeed({ newsItems }: NewsFeedProps) {
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "market":
        return "bg-chart-1 bg-opacity-20 text-chart-1";
      case "regulatory":
        return "bg-destructive bg-opacity-20 text-destructive";
      case "technology":
        return "bg-chart-2 bg-opacity-20 text-chart-2";
      case "scandal":
        return "bg-chart-4 bg-opacity-20 text-chart-4";
      default:
        return "bg-accent bg-opacity-20 text-accent";
    }
  };

  const getCategoryBorder = (category: string): string => {
    switch (category) {
      case "market":
        return "border-chart-1";
      case "regulatory":
        return "border-destructive";
      case "technology":
        return "border-chart-2";
      case "scandal":
        return "border-chart-4";
      default:
        return "border-accent";
    }
  };

  const getTimeAgo = (timestamp: number): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  return (
    <Card className="border border-border overflow-y-auto" data-testid="card-news-feed">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Market News</span>
          <div className="text-sm text-muted-foreground">Live Feed</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {newsItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-sm">No news available</div>
            <div className="text-xs mt-1">Stay tuned for market updates</div>
          </div>
        ) : (
          newsItems.map((news) => (
            <div 
              key={news.id} 
              className={`p-3 bg-secondary rounded-lg border-l-4 ${getCategoryBorder(news.category)}`}
              data-testid={`news-${news.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-medium pr-2" data-testid={`text-news-title-${news.id}`}>
                  {news.title}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {getTimeAgo(news.timestamp)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-2" data-testid={`text-news-content-${news.id}`}>
                {news.content}
              </div>
              <div className="flex space-x-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getCategoryColor(news.category)}`}
                >
                  {news.category.toUpperCase()}
                </Badge>
                {news.category === "regulatory" && (
                  <Badge variant="secondary" className="text-xs bg-destructive bg-opacity-20 text-destructive">
                    HIGH IMPACT
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
