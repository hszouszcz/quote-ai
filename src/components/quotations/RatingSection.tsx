import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarIcon } from "@radix-ui/react-icons";

interface RatingSectionProps {
  initialRating?: number;
  initialComment?: string;
  onRatingSubmit?: (rating: number, comment: string) => void;
  isSubmitting?: boolean;
}

export function RatingSection({
  initialRating = 0,
  initialComment = "",
  onRatingSubmit,
  isSubmitting = false,
}: RatingSectionProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRatingSubmit?.(rating, comment);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oceń wycenę</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="p-1 hover:scale-110 transition-transform"
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(value)}
              >
                <StarIcon
                  className={`w-8 h-8 ${
                    value <= (hoveredRating || rating) ? "text-yellow-400 fill-current" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm text-muted-foreground">
              Komentarz (opcjonalnie)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Wpisz swój komentarz..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz ocenę"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
