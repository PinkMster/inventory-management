import React from 'react';

export type StatusType = 'active' | 'inactive' | 'pending' | 'processing' | 'completed' | 'cancelled' | 'error' | 'warning';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  label?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  label,
  className = '',
}) => {
  // 상태별 스타일 매핑
  const statusStyles: Record<StatusType, { bg: string; text: string; dot: string }> = {
    active: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      dot: 'bg-green-500' 
    },
    inactive: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      dot: 'bg-gray-500' 
    },
    pending: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      dot: 'bg-yellow-500' 
    },
    processing: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      dot: 'bg-blue-500' 
    },
    completed: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      dot: 'bg-green-500' 
    },
    cancelled: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      dot: 'bg-red-500' 
    },
    error: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      dot: 'bg-red-500' 
    },
    warning: { 
      bg: 'bg-orange-100', 
      text: 'text-orange-800', 
      dot: 'bg-orange-500' 
    },
  };

  // 크기별 패딩 및 폰트 크기
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };

  const { bg, text, dot } = statusStyles[status];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center rounded-full ${bg} ${text} ${sizeStyles[size]} ${className}`}>
      {showDot && (
        <span className={`mr-1.5 h-2 w-2 rounded-full ${dot}`} />
      )}
      {displayLabel}
    </span>
  );
};

export default StatusBadge; 