import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from "@gsap/react";

// Constantes para efectos de animación
export const ANIMATION_EFFECTS = {
  FADE_IN: 'fadeIn',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  SCALE_IN: 'scaleIn',
  FLIP_X: 'flipX',
  FLIP_Y: 'flipY',
  BOUNCE: 'bounce',
  ELASTIC: 'elastic',
  ROTATE_IN: 'rotateIn',
  STAGGER: 'stagger',
  TEXT_REVEAL: 'textReveal',
  LOGO_ANIMATION: 'logoAnimation',
  FLOAT: 'float',
  PULSE: 'pulse',
  MORPH: 'morph',
  GLITCH: 'glitch',
  FOLLOW_PATH: 'followPath',
  DRAW_SVG: 'drawSVG',
  BLINKING_CURSOR: 'blinkingCursor'
};

// Implementación simplificada de SplitText
export class CustomSplitText {
  elements: HTMLElement[];
  chars: HTMLElement[] = [];
  words: HTMLElement[] = [];
  lines: HTMLElement[] = [];
  originalHTML: string[] = [];

  constructor(elements: string | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>, options: { type?: string } = {}) {
    if (typeof elements === 'string') {
      this.elements = Array.from(document.querySelectorAll(elements)) as HTMLElement[];
    } else if (elements instanceof HTMLElement) {
      this.elements = [elements];
    } else if (elements instanceof NodeList) {
      this.elements = Array.from(elements) as HTMLElement[];
    } else {
      this.elements = elements;
    }
    
    this.originalHTML = this.elements.map(el => el.innerHTML);
    
    if (options.type?.includes('chars')) this.splitChars();
    if (options.type?.includes('words')) this.splitWords();
    if (options.type?.includes('lines')) this.splitLines();
  }
  
  // Dividir en caracteres
  splitChars() {
    this.elements.forEach((element, index) => {
      const text = element.innerText;
      element.innerHTML = '';
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charSpan = document.createElement('span');
        charSpan.className = 'split-char';
        charSpan.style.display = 'inline-block';
        charSpan.textContent = char === ' ' ? '\u00A0' : char;
        element.appendChild(charSpan);
        this.chars.push(charSpan);
      }
    });
  }
  
  // Dividir en palabras
  splitWords() {
    this.elements.forEach((element, index) => {
      const text = element.innerText;
      const words = text.split(' ');
      element.innerHTML = '';
      
      for (let i = 0; i < words.length; i++) {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'split-word';
        wordSpan.style.display = 'inline-block';
        wordSpan.textContent = words[i];
        
        element.appendChild(wordSpan);
        if (i < words.length - 1) {
          element.appendChild(document.createTextNode(' '));
        }
        
        this.words.push(wordSpan);
      }
    });
  }
  
  // Dividir en líneas (simplificado, no detecta saltos reales)
  splitLines() {
    this.elements.forEach((element, index) => {
      const text = element.innerText;
      const lines = text.split('\n');
      element.innerHTML = '';
      
      for (let i = 0; i < lines.length; i++) {
        const lineSpan = document.createElement('span');
        lineSpan.className = 'split-line';
        lineSpan.style.display = 'block';
        lineSpan.textContent = lines[i];
        element.appendChild(lineSpan);
        this.lines.push(lineSpan);
      }
    });
  }
  
  // Restaurar el HTML original
  revert() {
    this.elements.forEach((element, index) => {
      element.innerHTML = this.originalHTML[index];
    });
    this.chars = [];
    this.words = [];
    this.lines = [];
  }
}

// Utilities para inicializar GSAP con nuestra implementación
export function registerGSAPPlugins() {
  // Añadimos nuestra implementación de SplitText al objeto global
  (window as any).CustomSplitText = CustomSplitText;
}

// Hook para texto con animación de entrada
export function useTextReveal(rootElement: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!rootElement.current) return;
    
    // Seleccionar elementos de texto
    const titles = rootElement.current.querySelectorAll('.gsap-title');
    const paragraphs = rootElement.current.querySelectorAll('.gsap-paragraph');
    const buttons = rootElement.current.querySelectorAll('.gsap-button');
    
    // Timeline para secuenciar las animaciones
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Animación de títulos
    tl.fromTo(
      titles, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.2, duration: 0.8 }
    );
    
    // Animación de párrafos
    tl.fromTo(
      paragraphs, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 },
      "-=0.4" // Comenzar antes de que terminen las animaciones de títulos
    );
    
    // Animación de botones
    tl.fromTo(
      buttons, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
      "-=0.3" // Comenzar antes de que terminen las animaciones de párrafos
    );
    
    return () => {
      tl.kill();
    };
  }, { scope: rootElement, ...options });
}

// Componente para hacer zoom y destacar elementos
export function useZoomFocus(element: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!element.current) return;
    
    const tl = gsap.timeline({ 
      scrollTrigger: {
        trigger: element.current,
        start: "top 70%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });
    
    tl.fromTo(
      element.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }
    );
    
    return () => {
      tl.kill();
    };
  }, { scope: element, ...options });
}

// Efecto de desplazamiento paralax para imágenes o fondos
export function useParallaxEffect(element: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!element.current) return;
    
    // Movimiento paralax básico
    gsap.to(element.current, {
      y: "30%",
      ease: "none",
      scrollTrigger: {
        trigger: element.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5
      }
    });
    
    return () => {
      // Limpieza
    };
  }, { scope: element, ...options });
}

// Efecto de entrada de tarjetas en cascada
export function useStaggerCards(containerRef: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!containerRef.current) return;
    
    const cards = containerRef.current.querySelectorAll('.gsap-card');
    
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%"
        }
      }
    );
    
    return () => {
      // Limpieza
    };
  }, { scope: containerRef, ...options });
}

// Hook para animación de recorrido de texto (typing)
export function useTypingEffect(text: string, speed: number = 40) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    setIsTyping(true);
    
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, speed);
    
    return () => clearInterval(typingInterval);
  }, [text, speed]);
  
  return { displayedText, isTyping };
}

// Componente para animación de conteo
export function useCountUp(end: number, duration: number = 2, delay: number = 0) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!elementRef.current) return;
    
    gsap.to(elementRef.current, {
      innerHTML: end,
      duration: duration,
      delay: delay,
      ease: "power1.inOut",
      snap: { innerHTML: 1 },
      scrollTrigger: {
        trigger: elementRef.current,
        start: "top 80%"
      }
    });
    
    return () => {
      // Limpieza
    };
  }, { scope: elementRef });
  
  return { count, setCount, elementRef };
}

// Componente para cargar GSAP ScrollTrigger si es necesario
export function useGSAPScrollTrigger() {
  useEffect(() => {
    // En una implementación real, cargaríamos el plugin ScrollTrigger
    // Pero como no tenemos acceso al plugin comercial, solo simulamos la carga
    console.log("ScrollTrigger would be loaded here if available");
    
    return () => {
      // Limpieza al desmontar
    };
  }, []);
}

// NUEVAS ANIMACIONES AVANZADAS TIPO GSAP.COM

// Hook para animación de texto en cascada 3D
export function useAdvancedTextReveal(elementRef: React.RefObject<HTMLElement>, options: {
  effect?: string,
  trigger?: 'load' | 'scroll',
  direction?: 'ltr' | 'rtl' | 'center',
  ease?: string
} = {}) {
  const { 
    effect = ANIMATION_EFFECTS.TEXT_REVEAL, 
    trigger = 'scroll',
    direction = 'ltr',
    ease = 'expo.out' 
  } = options;
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Crear instancia de SplitText
    const splitText = new CustomSplitText(elementRef.current, {
      type: 'chars'
    });
    
    // Aplicamos estilos iniciales
    gsap.set(splitText.chars, { 
      perspective: 400,
      transformStyle: 'preserve-3d'
    });
    
    // Oculta inicialmente
    gsap.set(elementRef.current, { 
      autoAlpha: 1
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
    
    // Crear timeline
    const tl = gsap.timeline({
      scrollTrigger: trigger === 'scroll' ? {
        trigger: elementRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reset'
      } : undefined
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
            ease: ease
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
        // Efecto máquina de escribir
        tl.set(charSet, { opacity: 0 })
          .set(elementRef.current, { position: 'relative' });
          
        // Crear cursor
        const cursor = document.createElement('span');
        cursor.innerHTML = '|';
        cursor.style.position = 'absolute';
        cursor.style.right = '-4px';
        cursor.style.top = '0';
        cursor.style.opacity = '1';
        elementRef.current.appendChild(cursor);
        
        // Animar cursor
        tl.to(cursor, {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true
        });
        
        // Animar caracteres uno por uno
        charSet.forEach((char, i) => {
          tl.to(char, {
            opacity: 1,
            duration: 0.01,
            delay: i * 0.06
          });
        });
        
        // Mover cursor mientras tipea
        charSet.forEach((char, i) => {
          if (i < charSet.length - 1) {
            const nextChar = charSet[i + 1];
            tl.to(cursor, {
              left: nextChar.offsetLeft + 'px',
              duration: 0.05
            }, `>-0.05`);
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
    }
    
    return () => {
      tl.kill();
      if (splitText) {
        splitText.revert();
      }
      // Limpiar cursor si existe
      if (elementRef.current && effect === ANIMATION_EFFECTS.BLINKING_CURSOR) {
        const cursor = elementRef.current.querySelector('span:last-child');
        if (cursor) elementRef.current.removeChild(cursor);
      }
    };
  }, [elementRef, effect, trigger, direction, ease]);
}

// Hook para efecto de flotación continua
export function useFloatingElement(elementRef: React.RefObject<HTMLElement>, options: {
  amplitude?: number,
  frequency?: number,
  rotation?: boolean
} = {}) {
  const {
    amplitude = 10,
    frequency = 3,
    rotation = true
  } = options;
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Timeline para coordinar múltiples animaciones
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    // Movimiento flotante principal
    tl.to(elementRef.current, {
      y: `-=${amplitude}`,
      duration: frequency / 2,
      ease: 'sine.inOut'
    }).to(elementRef.current, {
      y: `+=${amplitude}`,
      duration: frequency / 2,
      ease: 'sine.inOut'
    });
    
    // Rotación suave (opcional)
    if (rotation) {
      tl.to(elementRef.current, {
        rotation: -2,
        duration: frequency * 0.75,
        ease: 'none'
      }, 0).to(elementRef.current, {
        rotation: 2,
        duration: frequency * 0.75,
        ease: 'none'
      }, frequency * 0.75);
    }
    
    return () => {
      tl.kill();
    };
  }, [elementRef, amplitude, frequency, rotation]);
}

// Hook para crear un efecto de morfado entre formas SVG
export function useMorphSVG(elementRef: React.RefObject<SVGElement>, options: {
  targetPaths?: string[],
  duration?: number,
  repeatDelay?: number
} = {}) {
  const {
    targetPaths = [],
    duration = 1,
    repeatDelay = 2
  } = options;
  
  useEffect(() => {
    if (!elementRef.current || !targetPaths.length) return;
    
    let currentPath = elementRef.current.getAttribute('d') || '';
    const targets = [currentPath, ...targetPaths];
    
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: repeatDelay
    });
    
    // Animar entre cada forma
    for (let i = 1; i < targets.length; i++) {
      tl.to(elementRef.current, {
        attr: { d: targets[i] },
        duration: duration,
        ease: 'power2.inOut'
      });
    }
    
    // Volver a la forma original
    tl.to(elementRef.current, {
      attr: { d: targets[0] },
      duration: duration,
      ease: 'power2.inOut'
    });
    
    return () => {
      tl.kill();
    };
  }, [elementRef, targetPaths, duration, repeatDelay]);
}

// Animación para efecto de seguimiento de cursor
export function useMouseFollowEffect(elementRef: React.RefObject<HTMLElement>, options: {
  intensity?: number,
  ease?: number,
  rotate?: boolean
} = {}) {
  const {
    intensity = 0.1,
    ease = 0.1,
    rotate = true
  } = options;
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotation = 0;
    let animation: number;
    
    // Función para actualizar la posición
    const updatePosition = () => {
      // Interpolación suave
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;
      
      // Actualizar rotación si está habilitada
      if (rotate) {
        const targetRotation = (mouseX - window.innerWidth / 2) * 0.01;
        currentRotation += (targetRotation - currentRotation) * ease;
        gsap.set(elementRef.current, { 
          rotation: currentRotation 
        });
      }
      
      // Aplicar transformación
      gsap.set(elementRef.current, {
        x: currentX * intensity,
        y: currentY * intensity
      });
      
      animation = requestAnimationFrame(updatePosition);
    };
    
    // Event listeners para seguir el cursor
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };
    
    // Iniciar animación
    window.addEventListener('mousemove', handleMouseMove);
    animation = requestAnimationFrame(updatePosition);
    
    // Limpieza
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animation);
    };
  }, [elementRef, intensity, ease, rotate]);
}

// Hook para animaciones de texto avanzadas usando nuestra implementación de SplitText
export function useSplitTextAnimation(elementRef: React.RefObject<HTMLElement>, options: {
  type?: 'chars' | 'words' | 'lines',
  trigger?: 'load' | 'scroll',
  stagger?: number,
  duration?: number,
  delay?: number,
  ease?: string,
  from?: any,
  to?: any
} = {}) {
  const {
    type = 'chars',
    trigger = 'load',
    stagger = 0.02,
    duration = 0.8,
    delay = 0,
    ease = 'power2.out',
    from = { opacity: 0, y: 20 },
    to = { opacity: 1, y: 0 }
  } = options;
  
  const splitInstance = useRef<CustomSplitText | null>(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Crear instancia de SplitText
    splitInstance.current = new CustomSplitText(elementRef.current, { 
      type: type
    });
    
    // Seleccionar los elementos a animar
    let elements: HTMLElement[] = [];
    switch (type) {
      case 'chars':
        elements = splitInstance.current.chars;
        break;
      case 'words':
        elements = splitInstance.current.words;
        break;
      case 'lines':
        elements = splitInstance.current.lines;
        break;
    }
    
    // Configurar la timeline
    const tl = gsap.timeline({
      delay,
      paused: trigger === 'scroll',
      scrollTrigger: trigger === 'scroll' ? {
        trigger: elementRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      } : undefined
    });
    
    // Establecer animación
    tl.fromTo(
      elements,
      from,
      {
        ...to,
        stagger,
        duration,
        ease
      }
    );
    
    // Iniciar la animación si es inmediata
    if (trigger === 'load') {
      tl.play();
    }
    
    // Limpiar al desmontar
    return () => {
      tl.kill();
      if (splitInstance.current) {
        splitInstance.current.revert();
        splitInstance.current = null;
      }
    };
  }, [elementRef, type, trigger, stagger, duration, delay, ease]);
}

// Hook para crear efecto de vibración continuo como en GSAP.com
export function useShakeEffect(elementRef: React.RefObject<HTMLElement>, options: {
  intensity?: number,
  speed?: number, 
  rotation?: boolean,
  trigger?: 'load' | 'hover' | 'scroll'
} = {}) {
  const {
    intensity = 2,
    speed = 0.1,
    rotation = true,
    trigger = 'hover'
  } = options;
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Timeline para la animación de vibración
    const tl = gsap.timeline({ paused: true });
    
    // Se ejecuta secuencialmente para cada keyframe
    const createAndApplyShakeEffect = () => {
      // Número de etapas de animación
      const steps = 10;
      
      // Limpiar timeline existente
      tl.clear();
      
      // Añadir cada keyframe a la timeline secuencialmente
      for (let i = 0; i < steps; i++) {
        const offsetX = Math.random() * intensity * 2 - intensity;
        const offsetY = Math.random() * intensity * 2 - intensity;
        const offsetRotation = rotation ? (Math.random() * intensity * 2 - intensity) : 0;
        
        // Añadir cada paso como una animación individual
        tl.to(elementRef.current, {
          x: offsetX,
          y: offsetY,
          rotation: offsetRotation,
          ease: 'none',
          duration: speed
        });
      }
      
      // Añadir el keyframe final para volver al origen
      tl.to(elementRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        ease: 'power1.inOut',
        duration: speed * 3
      });
      
      return tl;
    };
    
    // Establecer la animación
    createAndApplyShakeEffect();
    
    // Manejar diferentes desencadenantes
    let scrollTriggerInstance: any;
    
    if (trigger === 'hover') {
      const startShake = () => {
        tl.restart();
        tl.play();
      };
      
      const stopShake = () => {
        tl.progress(1).pause();
      };
      
      elementRef.current.addEventListener('mouseenter', startShake);
      elementRef.current.addEventListener('mouseleave', stopShake);
      
      return () => {
        if (elementRef.current) {
          elementRef.current.removeEventListener('mouseenter', startShake);
          elementRef.current.removeEventListener('mouseleave', stopShake);
        }
        tl.kill();
      };
    } 
    else if (trigger === 'scroll') {
      scrollTriggerInstance = {
        trigger: elementRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => tl.play(),
        onLeave: () => tl.pause(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.pause()
      };
      
      // Aplicar el ScrollTrigger
      gsap.fromTo(elementRef.current, 
        { x: 0, y: 0, rotation: 0 },
        { duration: 0.1, scrollTrigger: scrollTriggerInstance }
      );
      
      return () => {
        tl.kill();
        if (scrollTriggerInstance && scrollTriggerInstance.kill) {
          scrollTriggerInstance.kill();
        }
      };
    } 
    else {
      // Para el trigger 'load'
      tl.play();
      
      return () => {
        tl.kill();
      };
    }
  }, [elementRef, intensity, speed, rotation, trigger]);
}