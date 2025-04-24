import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headingClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  isLoading?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  headingClassName = '',
  bodyClassName = '',
  footerClassName = '',
  isLoading = false,
  onClick,
  hoverable = false,
}) => {
  // 기본 카드 클래스
  const baseCardClass = 'card';
  const hoverClass = hoverable ? 'cursor-pointer transition-transform duration-300 ease-in-out transform hover:-translate-y-1' : '';
  
  return (
    <div 
      className={`${baseCardClass} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          {subtitle && <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>}
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <>
          {(title || subtitle) && (
            <div className={`mb-4 ${headingClassName}`}>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
            </div>
          )}
          <div className={bodyClassName}>{children}</div>
          {footer && (
            <div className={`mt-4 pt-3 border-t border-gray-100 ${footerClassName}`}>
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Card; 