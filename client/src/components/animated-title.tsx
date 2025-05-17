import { useEffect, useRef } from 'react';
import { ANIMATION_EFFECTS } from './gsap-animations';
import gsap from 'gsap';
import { CustomSplitText } from './gsap-animations';

interface AnimatedTitleProps {
  text: string;
  effect?: string;
  className?: string;
  delay?: number;
  direction?: 'ltr' | 'rtl' | 'center';
}

export default function AnimatedTitle({
  text,
  effect = ANIMATION_EFFECTS.TEXT_REVEAL,
  className = '',
  delay = 0,
  direction = 'ltr'
}: AnimatedTitleProps) {
  // Para usuarios que están haciendo scroll, queremos mostrar instantáneamente el texto
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    // Inicialmente oculto
    gsap.set(titleRef.current, { autoAlpha: 1 });

    // Crear split text
    const splitText = new CustomSplitText(titleRef.current, { type: 'chars' });
    
    // Aplicar estilos iniciales
    gsap.set(splitText.chars, { 
      perspective: 400,
      opacity: 0
    });
    
    // Determinar el orden de los caracteres
    let charSet = [...splitText.chars];
    if (direction === 'rtl') {
      charSet.reverse();
    } else if (direction === 'center') {
      const mid = Math.floor(charSet.length / 2);
      const left = charSet.slice(0, mid).reverse();
      const right = charSet.slice(mid);
      charSet = [];
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (i < left.length) charSet.push(left[i]);
        if (i < right.length) charSet.push(right[i]);
      }
    }
    
    // Crear timeline con duración reducida
    const tl = gsap.timeline({
      delay: delay * 0.5, // Reducir el delay a la mitad
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 95%', // Comenzar antes (95% en lugar de 80%)
        toggleActions: 'play none none reset'
      }
    });
    
    // Determinar el tipo de animación
    switch(effect) {
      case ANIMATION_EFFECTS.TEXT_REVEAL:
        tl.fromTo(charSet, 
          { 
            opacity: 0, 
            rotationX: -90, 
            translateY: 30 
          }, 
          {
            duration: 0.03, 
            opacity: 1, 
            rotationX: 0, 
            translateY: 0,
            stagger: 0.02,
            ease: 'expo.out'
          }
        );
        break;
        
      case ANIMATION_EFFECTS.GLITCH:
        // Efecto glitch
        charSet.forEach((char, index) => {
          tl.fromTo(char,
            { 
              opacity: 0,
              scale: 0,
              color: 'red',
              textShadow: '2px 2px 0 #0ff, -2px -2px 0 #f0f'
            },
            {
              opacity: 1,
              scale: 1,
              color: '',
              textShadow: 'none',
              duration: 0.2,
              ease: 'power1.inOut'
            },
            index * 0.01
          );
          
          // Añadir pulso glitch aleatorio
          if (index % 3 === 0) {
            tl.to(char, {
              opacity: 0.8,
              skewX: 20,
              color: '#0ff',
              duration: 0.05,
              yoyo: true,
              repeat: 1
            }, `>-0.1`);
          }
        });
        break;
        
      case ANIMATION_EFFECTS.BLINKING_CURSOR:
        // Implementación mejorada - efecto de máquina de escribir ultra rápido
        
        // Mostrar todos los caracteres inmediatamente sin animación
        tl.set(charSet, { opacity: 1 });
        
        // Aplicar un efecto de "aparecer" rápido
        tl.fromTo(
          titleRef.current,
          { opacity: 0.7, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power1.out" }
        );
        
        // Opcional: Agregar un pequeño destello de cursor al final para indicar que terminó de escribir
        const cursor = document.createElement('span');
        cursor.innerHTML = '|';
        cursor.style.position = 'relative';
        cursor.style.display = 'inline-block';
        cursor.style.marginLeft = '4px';
        cursor.style.opacity = '1';
        titleRef.current.appendChild(cursor);
        
        // Hacer que el cursor parpadee rápidamente y desaparezca
        tl.to(cursor, {
          opacity: 0,
          duration: 0.2,
          repeat: 2,
          yoyo: true,
          onComplete: () => {
            if (titleRef.current?.contains(cursor)) {
              titleRef.current.removeChild(cursor);
            }
          }
        });
        break;
        
      case ANIMATION_EFFECTS.BOUNCE:
        tl.fromTo(charSet, 
          { opacity: 0, y: -100 }, 
          {
            opacity: 1,
            y: 0,
            stagger: 0.03,
            duration: 0.8,
            ease: 'bounce.out'
          }
        );
        break;
        
      default:
        // Animación por defecto - simple fade in
        tl.fromTo(charSet, 
          { opacity: 0, y: 20 }, 
          {
            opacity: 1,
            y: 0,
            stagger: 0.02,
            duration: 0.5,
            ease: 'power2.out'
          }
        );
    }
    
    return () => {
      tl.kill();
      if (splitText) {
        splitText.revert();
      }
      // Limpiar cursor si existe
      if (titleRef.current && effect === ANIMATION_EFFECTS.BLINKING_CURSOR) {
        const cursor = titleRef.current.querySelector('span:last-child');
        if (cursor) titleRef.current.removeChild(cursor);
      }
    };
  }, [text, effect, delay, direction]);

  return (
    <h2 ref={titleRef} className={className}>
      {text}
    </h2>
  );
}