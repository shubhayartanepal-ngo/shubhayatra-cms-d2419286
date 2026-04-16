// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Button from "../ui/button/Button";
// import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface CardProps {
  title: string;
  imageUrl?: string;
  onView?: () => void;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, imageUrl, onView, onClick }) => {
  return (
    <div
      onDoubleClick={onView}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="mb-5 overflow-hidden rounded-lg">
        <img
          src={imageUrl || "images/cards/card-01.png"}
          alt="card"
          className="overflow-hidden rounded-lg object-cover w-full h-40"
        />
      </div>

      <div className="flex justify-between">
        <h4 className="mb-1 text-base font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>
        <button
          className="text-red-500 text-base hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onDoubleClick
            onClick?.();
          }}
        >
          {/* <FontAwesomeIcon icon={faTrash} /> */}
        </button>
      </div>
    </div>
  );
};

export default Card;
