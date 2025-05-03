import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from "@gsap/react";

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