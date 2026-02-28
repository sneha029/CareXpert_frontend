import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, User, RefreshCw } from "lucide-react";
import { reviewAPI, ReviewItem } from "@/lib/services";
import { notify } from "@/lib/toast";
import axios from "axios";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getMyReviews();
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        notify.error(error.response.data?.message || "Failed to fetch reviews");
      } else {
        notify.error("Failed to fetch reviews");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400">View the feedback you have shared for completed appointments.</p>
        </div>
        <Button variant="outline" onClick={fetchReviews}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600 dark:text-gray-400">
            You have not submitted any reviews yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{review.doctor.user.name}</h3>
                      <Badge variant="outline">{review.doctor.specialty}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-amber-600">
                      {Array.from({ length: 5 }, (_, idx) => (
                        <Star
                          key={idx}
                          className={`h-4 w-4 ${idx < review.rating ? "fill-amber-400 text-amber-500" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="h-4 w-4" />
                      {new Date(review.appointment.date).toLocaleDateString()}
                    </div>
                    <p className="mt-1">{review.appointment.time}</p>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                )}

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {review.isAnonymous ? "Anonymous review" : "Public review"} • Updated {new Date(review.updatedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
