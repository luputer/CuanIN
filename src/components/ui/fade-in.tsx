"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "~/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number; // Delay in ms
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({ children, className, delay = 0, direction = "up" }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Optional: add a small delay for staggered effects
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            // Once it's visible, we don't need to observe anymore if we want it to stay visible
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold: 0.15, // Trigger when 15% of the element is visible
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay]);

  let directionClasses = "";
  if (!isVisible) {
    switch (direction) {
      case "up":
        directionClasses = "translate-y-12";
        break;
      case "down":
        directionClasses = "-translate-y-12";
        break;
      case "left":
        directionClasses = "translate-x-12";
        break;
      case "right":
        directionClasses = "-translate-x-12";
        break;
      case "none":
        directionClasses = "";
        break;
    }
  }

  return (
    <div
      ref={domRef}
      className={cn(
        "transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0",
        !isVisible && directionClasses,
        className
      )}
    >
      {children}
    </div>
  );
}
