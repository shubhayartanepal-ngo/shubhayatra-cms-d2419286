import React from "react";

import { Link } from "react-router";

interface ComponentCardProps {
  title: string;
  children?: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  link?: string; // Dynamic link for the button
  buttonLabel?: string;
  onButtonClick?: () => void; // Dynamic button label
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  desc = "",
  link = "", // optional, defaults to empty string if not provided
  buttonLabel = "Add",
  onButtonClick, // optional, defaults to 'Add'
}) => {
  return (
    <div
      className={`
          rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
    >
      {/* Card Header */}

      {title !== "" && (
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {title}
            </h3>

            {/* Add Honorific Button */}
            {link && !onButtonClick ? (
              <Link
                to={link}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-brand-500 hover:bg-brand-600"
              >
                {buttonLabel}
              </Link>
            ) : onButtonClick ? (
              <button
                onClick={onButtonClick}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-brand-500 hover:bg-brand-600"
              >
                {buttonLabel}
              </button>
            ) : null}
          </div>

          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
