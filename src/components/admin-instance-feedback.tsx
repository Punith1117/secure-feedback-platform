"use client";

import { useEffect, useState } from "react";
import { Realtime } from "ably";

type Rating = "good" | "average" | "bad";

interface CourseFeedbackWithPercentages {
  courseId: string;
  courseTitle: string;
  facultyName: string;
  totalResponses: number;
  questions: {
    questionId: string;
    text: string;
    ratings: {
      good: number;
      average: number;
      bad: number;
    };
    percentages: {
      good: number;
      average: number;
      bad: number;
    };
  }[];
}

interface AdminInstanceFeedbackProps {
  instanceTitle: string;
  joinCode: string;
  feedback: CourseFeedbackWithPercentages[];
}

interface AblyResponse {
  courseId: string;
  questionId: string;
  rating: number; // 3 = good, 2 = average, 1 = bad
}

interface AblyMessage {
  joinCode: string;
  responses: AblyResponse[];
  timestamp: string;
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
  feedback: initialFeedback,
}: AdminInstanceFeedbackProps) {
  const [feedback, setFeedback] = useState(initialFeedback);

  useEffect(() => {
    const ably = new Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY || "");
    const channel = ably.channels.get(`feedback:${joinCode}`);

    channel.subscribe((message: unknown) => {
      const data = (message as { data: AblyMessage }).data;
      
      setFeedback((prev) =>
        prev.map((course) => {
          const responsesForCourse = data.responses.filter(
            (r) => r.courseId === course.courseId
          );

          if (responsesForCourse.length === 0) return course;

          let questions = [...course.questions];

          for (const r of responsesForCourse) {
            const questionIndex = questions.findIndex(q => q.questionId === r.questionId);
            if (questionIndex !== -1) {
              const q = { ...questions[questionIndex] };
              let ratings = { ...q.ratings };
              
              if (r.rating === 3) ratings.good++;
              else if (r.rating === 2) ratings.average++;
              else if (r.rating === 1) ratings.bad++;
              
              const total = ratings.good + ratings.average + ratings.bad;
              
              q.ratings = ratings;
              q.percentages = total === 0 ? { good: 0, average: 0, bad: 0 } : {
                good: Math.round((ratings.good / total) * 100),
                average: Math.round((ratings.average / total) * 100),
                bad: Math.round((ratings.bad / total) * 100),
              };
              
              questions[questionIndex] = q;
            }
          }

          // In this simple realtime approach, we just increment total responses by 1 
          // (assuming a single Ably message corresponds to 1 full submission)
          const totalResponses = course.totalResponses + 1;

          return {
            ...course,
            totalResponses,
            questions,
          };
        })
      );
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [joinCode]);

  // Calculate total submissions across all courses
  const totalSubmissions = feedback.reduce(
    (sum: number, f: CourseFeedbackWithPercentages) => Math.max(sum, f.totalResponses),
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
                    {courseFeedback.courseTitle} <span className="text-slate-500 font-normal">({courseFeedback.facultyName})</span>
                  </h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {courseFeedback.totalResponses}{" "}
                    {courseFeedback.totalResponses === 1
                      ? "response"
                      : "responses"}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {courseFeedback.questions.map(question => (
                    <div key={question.questionId} className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-700">
                        {question.text}
                      </h4>
                      <RatingBar
                        label="Good"
                        percentage={question.percentages.good}
                        count={question.ratings.good}
                        color="bg-emerald-500"
                      />
                      <RatingBar
                        label="Average"
                        percentage={question.percentages.average}
                        count={question.ratings.average}
                        color="bg-amber-500"
                      />
                      <RatingBar
                        label="Bad"
                        percentage={question.percentages.bad}
                        count={question.ratings.bad}
                        color="bg-rose-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
