"use client";

import type { Course, FeedbackInstance } from "@/lib/db/schema";

type Rating = "good" | "average" | "bad";

interface CourseFeedbackWithPercentages {
  courseId: string;
  courseTitle: string;
  totalResponses: number;
  lectureQualityRatings: {
    good: number;
    average: number;
    bad: number;
  };
  courseContentRatings: {
    good: number;
    average: number;
    bad: number;
  };
  lectureQualityPercentages: {
    good: number;
    average: number;
    bad: number;
  };
  courseContentPercentages: {
    good: number;
    average: number;
    bad: number;
  };
}

interface AdminInstanceFeedbackProps {
  instanceTitle: string;
  joinCode: string;
  feedback: CourseFeedbackWithPercentages[];
}

function RatingBar({
  label,
  percentage,
  count,
  color,
}: {
  label: string;
  percentage: number;
  count: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900 font-medium">
          {percentage}% ({count})
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminInstanceFeedback({
  instanceTitle,
  joinCode,
  feedback,
}: AdminInstanceFeedbackProps) {
  // Calculate total submissions across all courses
  const totalSubmissions = feedback.reduce(
    (sum, f) => Math.max(sum, f.totalResponses),
    0
  );

  return (
    <div className="space-y-6 px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Feedback Results
          </h2>
          <p className="text-sm text-slate-600">
            Comprehensive feedback for {instanceTitle}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Join code: <span className="font-mono">{joinCode}</span>
          </p>
        </div>

        {feedback.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            No courses have been added yet. Add courses to collect feedback.
          </div>
        ) : totalSubmissions === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            No feedback submissions yet. Students can submit feedback using the
            join code.
          </div>
        ) : (
          <div className="space-y-8">
            {feedback.map((courseFeedback) => (
              <div
                key={courseFeedback.courseId}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {courseFeedback.courseTitle}
                  </h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {courseFeedback.totalResponses}{" "}
                    {courseFeedback.totalResponses === 1
                      ? "response"
                      : "responses"}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Lecture Quality Ratings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-700">
                      Lecture Quality
                    </h4>
                    <RatingBar
                      label="Good"
                      percentage={courseFeedback.lectureQualityPercentages.good}
                      count={courseFeedback.lectureQualityRatings.good}
                      color="bg-emerald-500"
                    />
                    <RatingBar
                      label="Average"
                      percentage={courseFeedback.lectureQualityPercentages.average}
                      count={courseFeedback.lectureQualityRatings.average}
                      color="bg-amber-500"
                    />
                    <RatingBar
                      label="Bad"
                      percentage={courseFeedback.lectureQualityPercentages.bad}
                      count={courseFeedback.lectureQualityRatings.bad}
                      color="bg-rose-500"
                    />
                  </div>

                  {/* Course Content Ratings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-700">
                      Course Content
                    </h4>
                    <RatingBar
                      label="Good"
                      percentage={courseFeedback.courseContentPercentages.good}
                      count={courseFeedback.courseContentRatings.good}
                      color="bg-emerald-500"
                    />
                    <RatingBar
                      label="Average"
                      percentage={courseFeedback.courseContentPercentages.average}
                      count={courseFeedback.courseContentRatings.average}
                      color="bg-amber-500"
                    />
                    <RatingBar
                      label="Bad"
                      percentage={courseFeedback.courseContentPercentages.bad}
                      count={courseFeedback.courseContentRatings.bad}
                      color="bg-rose-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
