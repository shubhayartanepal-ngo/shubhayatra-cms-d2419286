import React from 'react'

interface ImageCellProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fallbackText?: string
}

const ImageCell: React.FC<ImageCellProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  fallbackText = 'N/A',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-600 ${sizeClasses[size]} ${className}`}
      >
        {fallbackText}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-lg object-cover ${sizeClasses[size]} ${className}`}
    />
  )
}

export default ImageCell
