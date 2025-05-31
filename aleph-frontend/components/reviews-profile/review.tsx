"use client";
import { FC } from "react";
import { deleteReview } from "@/services/reviewService";

interface ReviewProps {
  authId: string;
  reviewId: string;
  reviewTitle: string;
  reviewBody: string;
  reviewRating: number;
  reviewDateCreation: string;
  reviewDateUpdate: string;
  isPublic: boolean;
  username?: string; // Nombre de usuario opcional
  profileImage?: string; // Imagen de perfil opcional
  reviewedObjectId: string;
  isSong?: boolean;
  reviewedObjectName: string;
  onDeleteReview?: (id: string) => void; // Callback opcional para manejar la eliminación 
}



export const Review: FC<ReviewProps> = ({
  authId,
  reviewId,
  reviewTitle,
  reviewBody,
  reviewRating,
  reviewDateCreation,
  reviewDateUpdate,
  isPublic,
  username,
  profileImage,
  reviewedObjectId,
  isSong,
  reviewedObjectName,
  onDeleteReview,
}) => {
    function handleDeleteClick(id: string){
    deleteReview(id)
      .then(() => {
        if (onDeleteReview) {
          onDeleteReview(id);
        }
      })
      .catch((error) => {
        console.error("Error al eliminar la reseña:", error);
      });
  }
  return (
    <div className="flex flex-col bg-mauve shadow-lg rounded-lg p-6 mb-4">
      <div className="grid grid-cols-6 grid-rows-4 gap-4">
        {/* Parte Titulo */}
        <div className="col-span-3 col-start-2 row-start-2 flex items-center">
          <h3 className="text-federalBlue font-bold text-2xl">{reviewTitle}</h3>
        </div>
        <div className="col-span-2 col-start-5 row-start-2 flex items-center">
          <div className="flex items-center bg-federalBlue rounded-lg p-2 w-full">
            <div className="flex items-center justify-center w-8 h-8 mr-2 mr-4">
              {isSong === true ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 48 48"
                  fill="currentColor"
                  id="album"
                >
                  <path fill="none" d="M0 0h48v48H0z"></path>
                  <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 29a9 9 0 1 1 .001-18.001A9 9 0 0 1 24 33zm0-11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                </svg>
              )}
            </div>

            <h3 className="text-white font-medium text-base">
              {reviewedObjectName}
            </h3>
          </div>
        </div>

        {/* Parte Botones */}
        <div className="col-start-6 row-start-1 flex justify-end gap-2">
          <div>
            {isPublic === true ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[30px] h-[30px] text-electricViolet"
                width="30"
                height="30"
                fill="currentColor"
                viewBox="0 0 16 16"
                id="eye"
              >
                <path
                  fill="text-electricViolet"
                  d="M8 3.9C1.3 3.9 0 9 0 9s2.2 4.1 7.9 4.1 8.1-4 8.1-4-1.3-5.2-8-5.2zM5.3 5.4c.5-.3 1.3-.3 1.3-.3s-.5.9-.5 1.6c0 .7.2 1.1.2 1.1L5.2 8s-.3-.5-.3-1.2c0-.8.4-1.4.4-1.4zm2.6 6.7c-4.1 0-6.2-2.3-6.8-3.2.3-.7 1.1-2.2 3.1-3.2-.1.4-.2.8-.2 1.3 0 2.2 1.8 4 4 4s4-1.8 4-4c0-.5-.1-.9-.2-1.3 2 .9 2.8 2.5 3.1 3.2-.7.9-2.8 3.2-7 3.2z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
								className="w-[30px] h-[30px] text-electricViolet dark:text-white"
                width="30"
                height="30"
                fill="currentColor"
                viewBox="0 0 16 16"
                id="eye"
              >
                <path
                  fill="text-electricViolet"
                  d="M12.9 5.2l-.8.8c1.7.9 2.5 2.3 2.8 3-.7.9-2.8 3.1-7 3.1-.7 0-1.2-.1-1.8-.2l-.8.8c.8.3 1.7.4 2.6.4 5.7 0 8.1-4 8.1-4s-.6-2.4-3.1-3.9z"
                ></path>
                <path
                  fill="text-electricViolet"
                  d="M12 7.1c0-.3 0-.6-.1-.8L7.1 11c.3 0 .6.1.9.1 2.2 0 4-1.8 4-4zM15.3 0l-4.4 4.4C10.1 4.2 9.1 4 8 4 1.3 4 0 9.1 0 9.1s1 1.8 3.3 3L0 15.3v.7h.7L16 .7V0h-.7zM4 11.3C2.4 10.6 1.5 9.5 1.1 9c.3-.7 1.1-2.2 3.1-3.2-.1.4-.2.8-.2 1.3 0 1.1.5 2.2 1.3 2.9L4 11.3zm2.2-3.4-1 .2s-.3-.5-.3-1.2c0-.8.4-1.5.4-1.5.5-.3 1.3-.3 1.3-.3s-.5.9-.5 1.7c-.1.7.1 1.1.1 1.1z"
                ></path>
              </svg>
            )}
          </div>

          <div>
            <button onClick={() => console.log("Editando")}>
              <svg
                className="w-[30px] h-[30px] text-electricViolet dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div>
            <button onClick={() => handleDeleteClick(reviewId)}>
              <svg
                className="w-[30px] h-[30px] text-electricViolet dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Parte Username */}
        <div className="col-span-3 col-start-1 row-start-1 flex items-center ">
          <span className="text-federalBlue font-medium">{username}</span>
        </div>

        {/* Parte Rating */}
        <div className="col-span-2 col-start-4 row-start-1 flex items-center">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < reviewRating ? "text-electricViolet" : "text-white"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-richBlack">
              ({reviewRating}/5)
            </span>
          </div>
        </div>

        {/* Parte Foto Perfil */}
        <div className="row-span-2 col-start-1 row-start-2 flex items-start justify-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt={`${username} profile`}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <svg
              className="w-16 h-16 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Parte Review Body */}
        <div className="col-span-5 col-start-2 row-start-3 text-richBlack">
          <p>{reviewBody}</p>
        </div>

        {/* Parte Fecha de creacion */}
        <div className="col-span-3 row-start-4 text-sm text-persianIndigo flex justify-start items-end">
          <p>Creado: {new Date(reviewDateCreation).toISOString().split('T')[0]}</p>
        </div>

        {/* Parte Fecha de actualizacion */}
        <div className="col-span-3 col-start-4 row-start-4 text-sm text-persianIndigo text-right flex items-end justify-end">
          <p>Actualizado: {new Date(reviewDateUpdate).toISOString().split('T')[0]}</p>
        </div>
      </div>
    </div>
  );
};
