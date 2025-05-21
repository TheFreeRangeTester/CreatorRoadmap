import { useEffect, useRef } from 'react';
import { ANIMATION_EFFECTS } from './gsap-animations';
import gsap from 'gsap';
import { CustomSplitText } from './gsap-animations';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  effect?: string;
  direction?: 'ltr' | 'rtl' | 'center';
}

export default function AnimatedTitle({
  text,
  className = '',
  effect = '',
  direction = 'ltr'
}: AnimatedTitleProps) {
  return (
    <h2 className={`text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
      {text}
    </h2>
  );
}