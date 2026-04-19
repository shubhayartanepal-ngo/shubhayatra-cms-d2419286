import type { ReactNode } from 'react'

interface CardProps {
  title?: string;
  imageUrl?: string;
  onView?: () => void;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

const Card = ({ title, imageUrl, onView, onClick, className = '', children }: CardProps) => {
  if (children) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/3 ${className}`.trim()}>
        {children}
      </div>
    )
  }

  return (
    <div
      onDoubleClick={onView}
      className={`cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/3 ${className}`.trim()}
    >
      <div className="mb-5 overflow-hidden rounded-lg">
        <img
          src={imageUrl || 'images/cards/card-01.png'}
          alt={title || 'card'}
          className="h-40 w-full overflow-hidden rounded-lg object-cover"
        />
      </div>

      <div className="flex justify-between">
        <h4 className="mb-1 text-base font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>
        <button
          className="text-red-500 text-base hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation();
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
