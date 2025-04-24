import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'secondary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  rounded?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  icon,
  rounded = true,
}) => {
  // 배지 스타일 매핑
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-indigo-100 text-indigo-800',
    success: 'bg-green-100 text-green-800', // badge-success
    warning: 'bg-yellow-100 text-yellow-800', // badge-warning
    danger: 'bg-red-100 text-red-800', // badge-danger
    info: 'bg-cyan-100 text-cyan-800',
  };

  // 배지 크기 매핑
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
  const baseClass = 'inline-flex items-center font-medium';

  return (
    <span className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${roundedClass} ${className}`}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge; 