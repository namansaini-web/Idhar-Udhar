import React from 'react';

interface IdharUdharLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'image' | 'vector';
}

export const IdharUdharLogo: React.FC<IdharUdharLogoProps> = ({
  className = 'w-full h-full',
  size,
  variant = 'image',
}) => {
  if (variant === 'image') {
    return (
      <img
        src="/ICON.png"
        alt="IDHAR UDHAR"
        className={`object-contain select-none ${className}`}
        style={size ? { width: size, height: size } : undefined}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      className={`select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <path id="text-arc-big-logo" d="M 140,335 A 360,360 0 0,1 860,335" fill="none" />
      </defs>

      {/* 1. Large, Prominent, Highly-Legible Text: IDHAR  UDHAR */}
      <text
        fontFamily="'Arial Black', 'Montserrat', 'Segoe UI Black', Impact, sans-serif"
        fontSize="98"
        fontWeight="900"
        fill="#0067B1"
        letterSpacing="8"
      >
        <textPath href="#text-arc-big-logo" startOffset="50%" textAnchor="middle">
          IDHAR  UDHAR
        </textPath>
      </text>

      {/* 2. Bag Handle Arch */}
      <path
        d="M 350,330 A 150,150 0 0,1 650,330"
        fill="none"
        stroke="#0067B1"
        strokeWidth="28"
        strokeLinecap="square"
      />

      {/* 3. Bag Body Silhouette */}
      <path
        d="M 190,330 L 810,330 L 810,670 L 810,830 C 790,870 798,915 810,950 L 190,950 L 190,780 L 190,620 C 210,520 205,430 190,330 Z"
        fill="#0067B1"
      />

      {/* 4. Upper White Arrow (Pointing Left) */}
      <path
        d="M 810,670 C 690,590 580,520 440,498 L 440,465 L 370,530 L 440,595 L 440,568 C 560,585 680,650 810,835 Z"
        fill="#FFFFFF"
      />

      {/* 5. Lower White Arrow (Pointing Right) */}
      <path
        d="M 190,620 C 290,685 410,725 530,720 L 530,685 L 600,750 L 530,815 L 530,788 C 420,790 300,760 190,785 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

export default IdharUdharLogo;
