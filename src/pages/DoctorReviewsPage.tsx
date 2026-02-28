import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, User, RefreshCw, Eye } from "lucide-react";
import { reviewAPI, DoctorReviewItem } from "@/lib/services";
import { notify } from "@/lib/toast";
import axios from "axios";

export default function DoctorReviewsPage() {
  const [reviews, setReviews] = useState<DoctorReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getDoctorReviews();
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

  // Calculate statistics
  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : "0.0",
    distribution: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: reviews.length > 0 
        ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
        : 0
    }))
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Patient Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400">View feedback from your patients.</p>
        </div>
        <Button variant="outline" onClick={fetchReviews}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Statistics Summary */}
      {reviews.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-8 w-8 fill-amber-400 text-amber-500" />
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.average}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.total} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rating Distribution</p>
                <div className="space-y-2">
                  {stats.distribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      </div>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600 dark:text-gray-400">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>You haven't received any reviews yet.</p>
            <p className="text-sm mt-2">Complete appointments with patients to receive feedback.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {review.isAnonymous ? "Anonymous Patient" : review.patient.user.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }, (_, idx) => (
                        <Star
                          key={idx}
                          className={`h-5 w-5 ${idx < review.rating ? "fill-amber-400 text-amber-500" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {review.rating}/5
                      </span>
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
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Submitted {new Date(review.createdAt).toLocaleDateString()} • Appointment ID: {review.appointmentId.slice(0, 8)}...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
