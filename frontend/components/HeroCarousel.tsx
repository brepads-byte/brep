import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../src/services/apiClient'; // Ensure this path correctly targets your Axios/Fetch instance

interface CarouselSlide {
  _id: string;
  image: {
    url: string;
    public_id: string;
  };
  tagline: string;
}

const HeroCarousel: React.FC = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live slides from the backend database on mount
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await apiClient.get<CarouselSlide[]>('/carousel');
        // Unwraps Axios custom data encapsulation safely if present
        const data = (response as any).data || response;
        setSlides(data);
      } catch (error) {
        console.error("Failed loading active carousel records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  // 2. Automate sliding rotations (Runs only if slides exist)
  useEffect(() => {
    if (slides.length === 0) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [nextSlide, slides.length]);

  // 3. Render a clean loading skeleton while fetching database endpoints
  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xs uppercase tracking-widest animate-pulse">
        Loading Showcase Viewport...
      </div>
    );
  }

  // 4. Fallback layout if the database collection contains no images yet
  if (slides.length === 0) {
    return (
      <div className="w-full h-screen bg-neutral-900 flex items-center justify-center text-neutral-400 text-sm italic">
        No active hero presentation media published.
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Dark tint overlay for typography legibility */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
      
      {/* Dynamic Slide Map */}
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image.url}
            alt={`Architectural showcase slide ${index + 1}`}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      ))}

      {/* Slide Typography Content Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-brand-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl leading-tight">
          {slides[currentIndex].tagline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl font-light opacity-90">
          We create timeless and innovative architecture that responds to its context and purpose.
        </p>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute z-20 top-1/2 left-4 md:left-8 -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
        aria-label="Previous Slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute z-20 top-1/2 right-4 md:right-8 -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
        aria-label="Next Slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Bullet Indicators Grid */}
      <div className="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;