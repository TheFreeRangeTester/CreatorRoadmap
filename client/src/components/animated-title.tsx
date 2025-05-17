import { useEffect, useRef } from 'react';
import { ANIMATION_EFFECTS } from './gsap-animations';
import gsap from 'gsap';
import { CustomSplitText } from './gsap-animations';

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

export default function AnimatedTitle({
  text,
  className = '',
}: AnimatedTitleProps) {
  return (
    <h2 className={`text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
      {text}
    </h2>
  );
}