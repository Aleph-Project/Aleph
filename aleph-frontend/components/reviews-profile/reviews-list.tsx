"use client";
import { FC } from "react";
import { Review } from "./review";

// Interfaz para los datos de cada reseña
interface ReviewData {
  authId: string;
  reviewId: string;
  reviewTitle: string;
  reviewBody: string;
  reviewRating: number;
  reviewDateCreation: string;
  reviewDateUpdate: string;
  reviewStatus: string;
  reviewType: string;
  username?: string;
  profileImage?: string;
}

// Interfaz para las props del componente ReviewsList
interface ReviewsListProps {
  reviews: ReviewData[];
}

export const ReviewsList: FC<ReviewsListProps> = ({ reviews }) => {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Review
          key={review.reviewId}
          authId={review.authId}
          reviewId={review.reviewId}
          reviewTitle={review.reviewTitle}
          reviewBody={review.reviewBody}
          reviewRating={review.reviewRating}
          reviewDateCreation={review.reviewDateCreation}
          reviewDateUpdate={review.reviewDateUpdate}
          reviewStatus={review.reviewStatus}
          reviewType={review.reviewType}
          username={review.username}
          profileImage={review.profileImage}
        />
      ))}
    </div>
  );
};
