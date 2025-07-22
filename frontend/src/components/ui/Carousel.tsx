'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface CarouselProps {
  items: ReactNode[]
  activeIndex?: number
  onChange?: (index: number) => void
  autoPlay?: boolean
  autoPlayInterval?: number
  loop?: boolean
  showIndicators?: boolean
  showControls?: boolean
  variant?: 'default' | 'fade' | 'scale' | 'cards'
  direction?: 'horizontal' | 'vertical'
  gap?: number
  slidesPerView?: number
  draggable?: boolean
  className?: string
  indicatorClassName?: string
  controlClassName?: string
}

export function Carousel({
  items,
  activeIndex = 0,
  onChange,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = true,
  showIndicators = true,
  showControls = true,
  variant = 'default',
  direction = 'horizontal',
  gap = 16,
  slidesPerView = 1,
  draggable = true,
  className,
  indicatorClassName,
  controlClassName,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(activeIndex)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)
  const { hapticFeedback } = useTelegram()
  
  const itemCount = items.length
  const maxIndex = Math.max(0, itemCount - slidesPerView)
  
  useEffect(() => {
    setCurrentIndex(Math.min(activeIndex, maxIndex))
  }, [activeIndex, maxIndex])
  
  useEffect(() => {
    if (autoPlay && !isDragging) {
      intervalRef.current = setInterval(() => {
        handleNext()
      }, autoPlayInterval)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentIndex, autoPlay, autoPlayInterval, isDragging])
  
  const handlePrevious = () => {
    hapticFeedback?.impactOccurred('light')
    const newIndex = currentIndex - 1
    
    if (newIndex < 0) {
      if (loop) {
        const targetIndex = maxIndex
        setCurrentIndex(targetIndex)
        onChange?.(targetIndex)
      }
    } else {
      setCurrentIndex(newIndex)
      onChange?.(newIndex)
    }
  }
  
  const handleNext = () => {
    hapticFeedback?.impactOccurred('light')
    const newIndex = currentIndex + 1
    
    if (newIndex > maxIndex) {
      if (loop) {
        setCurrentIndex(0)
        onChange?.(0)
      }
    } else {
      setCurrentIndex(newIndex)
      onChange?.(newIndex)
    }
  }
  
  const handleIndicatorClick = (index: number) => {
    hapticFeedback?.impactOccurred('light')
    setCurrentIndex(index)
    onChange?.(index)
  }
  
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggable) return
    
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStartX(clientX)
    setDragOffset(0)
  }
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggable) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const offset = clientX - dragStartX
    setDragOffset(offset)
  }
  
  const handleDragEnd = () => {
    if (!isDragging || !draggable) return
    
    setIsDragging(false)
    const threshold = 100
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handlePrevious()
      } else {
        handleNext()
      }
    }
    
    setDragOffset(0)
  }
  
  const getSlideAnimation = () => {
    switch (variant) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        }
      
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
          transition: { duration: 0.3 }
        }
      
      case 'cards':
        return {
          initial: { opacity: 0, x: 100, rotateY: -45 },
          animate: { opacity: 1, x: 0, rotateY: 0 },
          exit: { opacity: 0, x: -100, rotateY: 45 },
          transition: { duration: 0.5, type: 'spring', stiffness: 100 }
        }
      
      default:
        return {
          initial: direction === 'horizontal' ? { x: 300 } : { y: 300 },
          animate: { x: 0, y: 0 },
          exit: direction === 'horizontal' ? { x: -300 } : { y: -300 },
          transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }
        }
    }
  }
  
  const slideAnimation = getSlideAnimation()
  
  const renderControls = () => {
    if (!showControls || itemCount <= slidesPerView) return null
    
    const isHorizontal = direction === 'horizontal'
    
    return (
      <>
        <button
          onClick={handlePrevious}
          disabled={!loop && currentIndex === 0}
          className={cn(
            'absolute z-10 p-2 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg transition-all duration-200 hover:bg-white dark:hover:bg-gray-900',
            isHorizontal ? 'left-4 top-1/2 -translate-y-1/2' : 'left-1/2 top-4 -translate-x-1/2',
            (!loop && currentIndex === 0) && 'opacity-50 cursor-not-allowed',
            controlClassName
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isHorizontal ? "M15 19l-7-7 7-7" : "M5 15l7-7 7 7"} 
            />
          </svg>
        </button>
        
        <button
          onClick={handleNext}
          disabled={!loop && currentIndex === maxIndex}
          className={cn(
            'absolute z-10 p-2 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg transition-all duration-200 hover:bg-white dark:hover:bg-gray-900',
            isHorizontal ? 'right-4 top-1/2 -translate-y-1/2' : 'left-1/2 bottom-4 -translate-x-1/2',
            (!loop && currentIndex === maxIndex) && 'opacity-50 cursor-not-allowed',
            controlClassName
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isHorizontal ? "M9 5l7 7-7 7" : "M19 9l-7 7-7-7"} 
            />
          </svg>
        </button>
      </>
    )
  }
  
  const renderIndicators = () => {
    if (!showIndicators || itemCount <= slidesPerView) return null
    
    const totalIndicators = maxIndex + 1
    
    return (
      <div className={cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10',
        indicatorClassName
      )}>
        {Array.from({ length: totalIndicators }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={cn(
              'transition-all duration-300',
              currentIndex === index
                ? 'w-8 h-2 bg-accent rounded-full'
                : 'w-2 h-2 bg-white/50 dark:bg-gray-600 rounded-full hover:bg-white/70 dark:hover:bg-gray-500'
            )}
          />
        ))}
      </div>
    )
  }
  
  if (slidesPerView > 1 || variant === 'cards') {
    // Multi-item carousel
    const itemWidth = 100 / slidesPerView
    const transform = direction === 'horizontal'
      ? `translateX(calc(-${currentIndex * itemWidth}% - ${currentIndex * gap}px))`
      : `translateY(calc(-${currentIndex * itemWidth}% - ${currentIndex * gap}px))`
    
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <div
          ref={containerRef}
          className={cn(
            'flex transition-transform duration-300',
            direction === 'vertical' && 'flex-col'
          )}
          style={{
            transform: isDragging ? `${transform} translateX(${dragOffset}px)` : transform,
            gap: `${gap}px`,
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex-shrink-0',
                direction === 'horizontal' ? `w-[${itemWidth}%]` : `h-[${itemWidth}%]`
              )}
              style={{
                width: direction === 'horizontal' ? `calc(${itemWidth}% - ${gap * (slidesPerView - 1) / slidesPerView}px)` : undefined,
                height: direction === 'vertical' ? `calc(${itemWidth}% - ${gap * (slidesPerView - 1) / slidesPerView}px)` : undefined,
              }}
            >
              {item}
            </div>
          ))}
        </div>
        
        {renderControls()}
        {renderIndicators()}
      </div>
    )
  }
  
  // Single item carousel with animations
  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          {...slideAnimation}
          style={{
            x: isDragging ? dragOffset : 0,
          }}
          className="w-full"
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
      
      {renderControls()}
      {renderIndicators()}
    </div>
  )
}

// Image carousel component
interface ImageCarouselProps {
  images: Array<{
    src: string
    alt?: string
    caption?: string
  }>
  aspectRatio?: 'square' | '16/9' | '4/3' | '21/9'
  objectFit?: 'cover' | 'contain' | 'fill'
  showCaptions?: boolean
  className?: string
}

export function ImageCarousel({
  images,
  aspectRatio = '16/9',
  objectFit = 'cover',
  showCaptions = false,
  className,
}: ImageCarouselProps) {
  const aspectRatioClasses = {
    'square': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '21/9': 'aspect-[21/9]',
  }
  
  return (
    <Carousel
      items={images.map((image, index) => (
        <div key={index} className="relative">
          <div className={cn('relative overflow-hidden rounded-lg', aspectRatioClasses[aspectRatio])}>
            <img
              src={image.src}
              alt={image.alt || `Slide ${index + 1}`}
              className={cn(
                'w-full h-full',
                objectFit === 'cover' && 'object-cover',
                objectFit === 'contain' && 'object-contain',
                objectFit === 'fill' && 'object-fill'
              )}
            />
          </div>
          {showCaptions && image.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-sm font-medium">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
      className={className}
      variant="fade"
    />
  )
}

// Testimonial carousel
interface TestimonialCarouselProps {
  testimonials: Array<{
    id: string
    content: string
    author: string
    role?: string
    avatar?: string
    rating?: number
  }>
  className?: string
}

export function TestimonialCarousel({
  testimonials,
  className,
}: TestimonialCarouselProps) {
  return (
    <Carousel
      items={testimonials.map((testimonial) => (
        <div key={testimonial.id} className="glass-card p-6">
          <div className="space-y-4">
            {(testimonial.rating != null && testimonial.rating > 0) && (
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < (testimonial.rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
            
            <p className="text-lg italic">"{testimonial.content}"</p>
            
            <div className="flex items-center gap-3">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {testimonial.author[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                {testimonial.role && (
                  <p className="text-sm text-secondary">{testimonial.role}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      className={className}
      variant="scale"
      showIndicators
      showControls
    />
  )
}

// Game-specific carousels
export const GameCarousel = {
  Heroes: ({ heroes, onHeroSelect }: {
    heroes: Array<{
      id: string
      name: string
      image: string
      level: number
      rarity: 'common' | 'rare' | 'epic' | 'legendary'
      power: number
    }>
    onHeroSelect?: (hero: typeof heroes[0]) => void
  }) => {
    const rarityColors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-600',
    }
    
    return (
      <Carousel
        items={heroes.map((hero) => (
          <motion.div
            key={hero.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onHeroSelect?.(hero)}
            className="cursor-pointer"
          >
            <div className={cn(
              'relative rounded-xl overflow-hidden',
              'bg-gradient-to-br',
              rarityColors[hero.rarity]
            )}>
              <img
                src={hero.image}
                alt={hero.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-lg">{hero.name}</h3>
                <div className="flex items-center justify-between text-white/80 text-sm">
                  <span>Уровень {hero.level}</span>
                  <span>Сила: {hero.power}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        slidesPerView={3}
        gap={16}
        draggable
        showControls
      />
    )
  },
  
  BattleReplay: ({ frames, frameRate = 30 }: {
    frames: Array<{
      id: string
      image: string
      timestamp: number
      actions?: string[]
    }>
    frameRate?: number
  }) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentFrame, setCurrentFrame] = useState(0)
    
    useEffect(() => {
      if (isPlaying && currentFrame < frames.length - 1) {
        const timeout = setTimeout(() => {
          setCurrentFrame(currentFrame + 1)
        }, 1000 / frameRate)
        
        return () => clearTimeout(timeout)
      } else if (currentFrame >= frames.length - 1) {
        setIsPlaying(false)
      }
    }, [isPlaying, currentFrame, frames.length, frameRate])
    
    return (
      <div className="space-y-4">
        <Carousel
          items={frames.map((frame) => (
            <div key={frame.id} className="relative">
              <img
                src={frame.image}
                alt={`Frame ${frame.timestamp}`}
                className="w-full rounded-lg"
              />
              {frame.actions && frame.actions.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/70">
                  {frame.actions.map((action, i) => (
                    <p key={i} className="text-white text-sm">{action}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
          activeIndex={currentFrame}
          onChange={setCurrentFrame}
          showControls={false}
          showIndicators={false}
          autoPlay={false}
        />
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setCurrentFrame(0)
              setIsPlaying(false)
            }}
            className="btn btn-secondary btn-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-primary"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <div className="text-sm text-secondary">
            {currentFrame + 1} / {frames.length}
          </div>
        </div>
      </div>
    )
  },
  
  TutorialSteps: ({ steps, onComplete }: {
    steps: Array<{
      id: string
      title: string
      description: string
      image?: string
      action?: ReactNode
    }>
    onComplete: () => void
  }) => {
    const [currentStep, setCurrentStep] = useState(0)
    
    return (
      <div className="space-y-6">
        <Carousel
          items={steps.map((step) => (
            <div key={step.id} className="space-y-4">
              {step.image && (
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full rounded-lg"
                />
              )}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-secondary">{step.description}</p>
              </div>
              {step.action && (
                <div className="flex justify-center">
                  {step.action}
                </div>
              )}
            </div>
          ))}
          activeIndex={currentStep}
          onChange={setCurrentStep}
          showControls={false}
          variant="scale"
        />
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn btn-secondary btn-sm"
          >
            Назад
          </button>
          
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-8 bg-accent'
                    : 'bg-gray-300 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={onComplete}
              className="btn btn-gradient btn-sm"
            >
              Завершить
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="btn btn-primary btn-sm"
            >
              Далее
            </button>
          )}
        </div>
      </div>
    )
  },
}