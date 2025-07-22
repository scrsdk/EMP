'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  variant?: 'default' | 'compact' | 'dots' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  showFirst?: boolean
  showLast?: boolean
  siblings?: number
  boundaries?: number
  showPageInfo?: boolean
  showPageJumper?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'default',
  size = 'md',
  showFirst = true,
  showLast = true,
  siblings = 1,
  boundaries = 1,
  showPageInfo = false,
  showPageJumper = false,
  className,
}: PaginationProps) {
  const { hapticFeedback } = useTelegram()
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      hapticFeedback?.impactOccurred('light')
      onPageChange(page)
    }
  }
  
  const sizeClasses = {
    sm: {
      button: 'w-8 h-8 text-sm',
      icon: 'w-3 h-3',
    },
    md: {
      button: 'w-10 h-10 text-base',
      icon: 'w-4 h-4',
    },
    lg: {
      button: 'w-12 h-12 text-lg',
      icon: 'w-5 h-5',
    },
  }
  
  const config = sizeClasses[size]
  
  // Generate page numbers
  const generatePages = () => {
    const pages: (number | string)[] = []
    const leftSibling = Math.max(currentPage - siblings, 1)
    const rightSibling = Math.min(currentPage + siblings, totalPages)
    
    // Add first pages
    for (let i = 1; i <= Math.min(boundaries, totalPages); i++) {
      pages.push(i)
    }
    
    // Add ellipsis if needed
    if (leftSibling > boundaries + 2) {
      pages.push('...')
    } else if (leftSibling === boundaries + 2) {
      pages.push(boundaries + 1)
    }
    
    // Add middle pages
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i > boundaries && i <= totalPages - boundaries) {
        pages.push(i)
      }
    }
    
    // Add ellipsis if needed
    if (rightSibling < totalPages - boundaries - 1) {
      pages.push('...')
    } else if (rightSibling === totalPages - boundaries - 1) {
      pages.push(totalPages - boundaries)
    }
    
    // Add last pages
    for (let i = Math.max(totalPages - boundaries + 1, rightSibling + 1); i <= totalPages; i++) {
      pages.push(i)
    }
    
    // Remove duplicates
    return pages.filter((page, index, self) => 
      self.indexOf(page) === index
    )
  }
  
  const pages = generatePages()
  
  const renderButton = (content: ReactNode, onClick: () => void, disabled: boolean, active?: boolean) => (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      className={cn(
        'rounded-lg font-medium transition-all duration-200 flex items-center justify-center',
        config.button,
        active
          ? 'bg-accent text-white'
          : 'bg-secondary hover:bg-secondary/80',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {content}
    </motion.button>
  )
  
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={cn(
              'rounded-full transition-all duration-300',
              index + 1 === currentPage
                ? cn('bg-accent', size === 'sm' ? 'w-6 h-2' : size === 'md' ? 'w-8 h-2.5' : 'w-10 h-3')
                : cn('bg-gray-300 dark:bg-gray-700', size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'),
            )}
          />
        ))}
      </div>
    )
  }
  
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'text-secondary hover:text-primary transition-colors',
            currentPage === 1 && 'opacity-50 cursor-not-allowed'
          )}
        >
          ← Назад
        </button>
        
        <span className="text-sm font-medium">
          {currentPage} / {totalPages}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'text-secondary hover:text-primary transition-colors',
            currentPage === totalPages && 'opacity-50 cursor-not-allowed'
          )}
        >
          Вперед →
        </button>
      </div>
    )
  }
  
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        {/* First page */}
        {showFirst && (
          <>
            {renderButton(
              <svg className={config.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>,
              () => handlePageChange(1),
              currentPage === 1
            )}
          </>
        )}
        
        {/* Previous page */}
        {renderButton(
          <svg className={config.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>,
          () => handlePageChange(currentPage - 1),
          currentPage === 1
        )}
        
        {/* Page numbers */}
        {variant === 'compact' ? (
          <div className="flex items-center gap-2 px-3">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value)
                if (!isNaN(page)) {
                  handlePageChange(page)
                }
              }}
              className={cn(
                'w-16 text-center bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-accent/30',
                config.button
              )}
            />
            <span className="text-secondary">/</span>
            <span className="font-medium">{totalPages}</span>
          </div>
        ) : (
          pages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-secondary">
                  •••
                </span>
              )
            }
            
            return (
              <div key={page}>
                {renderButton(
                  page,
                  () => handlePageChange(page as number),
                  false,
                  page === currentPage
                )}
              </div>
            )
          })
        )}
        
        {/* Next page */}
        {renderButton(
          <svg className={config.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>,
          () => handlePageChange(currentPage + 1),
          currentPage === totalPages
        )}
        
        {/* Last page */}
        {showLast && (
          <>
            {renderButton(
              <svg className={config.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>,
              () => handlePageChange(totalPages),
              currentPage === totalPages
            )}
          </>
        )}
      </div>
      
      {/* Page info */}
      {showPageInfo && (
        <div className="text-center text-sm text-secondary">
          Страница {currentPage} из {totalPages}
        </div>
      )}
      
      {/* Page jumper */}
      {showPageJumper && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-secondary">Перейти к</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder={currentPage.toString()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.currentTarget.value)
                if (!isNaN(page)) {
                  handlePageChange(page)
                  e.currentTarget.value = ''
                }
              }
            }}
            className="w-16 px-2 py-1 text-sm text-center bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-accent/30"
          />
          <span className="text-sm text-secondary">странице</span>
        </div>
      )}
    </div>
  )
}

// Infinite scroll pagination
interface InfiniteScrollProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
  children: ReactNode
  loader?: ReactNode
  endMessage?: ReactNode
  className?: string
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
  children,
  loader,
  endMessage,
  className,
}: InfiniteScrollProps) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    if (
      scrollHeight - scrollTop - clientHeight < threshold &&
      hasMore &&
      !isLoading
    ) {
      onLoadMore()
    }
  }

  return (
    <div
      onScroll={handleScroll}
      className={cn('overflow-y-auto', className)}
    >
      {children}
      
      {isLoading && (
        loader || (
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )
      )}
      
      {!hasMore && endMessage && (
        <div className="text-center py-4 text-secondary">
          {endMessage}
        </div>
      )}
    </div>
  )
}

// Load more button
interface LoadMoreProps {
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  loadingText?: string
  loadMoreText?: string
  endText?: string
  className?: string
}

export function LoadMore({
  isLoading,
  hasMore,
  onLoadMore,
  loadingText = 'Загрузка...',
  loadMoreText = 'Загрузить еще',
  endText = 'Все загружено',
  className,
}: LoadMoreProps) {
  if (!hasMore) {
    return (
      <div className={cn('text-center py-4 text-secondary', className)}>
        {endText}
      </div>
    )
  }

  return (
    <div className={cn('flex justify-center py-4', className)}>
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className="btn btn-secondary"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            {loadingText}
          </>
        ) : (
          loadMoreText
        )}
      </button>
    </div>
  )
}

// Game-specific pagination
export const GamePagination = {
  Leaderboard: ({ currentPage, totalPages, onPageChange }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      variant="compact"
      size="sm"
      showPageInfo
    />
  ),
  
  ItemGrid: ({ currentPage, totalPages, itemsPerPage, totalItems, onPageChange }: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
    onPageChange: (page: number) => void
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)
    
    return (
      <div className="space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          variant="default"
          size="md"
          showFirst={false}
          showLast={false}
        />
        <div className="text-center text-sm text-secondary">
          Показано {startItem}–{endItem} из {totalItems}
        </div>
      </div>
    )
  },
  
  BattleHistory: ({ currentPage, totalPages, onPageChange }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      variant="dots"
      size="sm"
    />
  ),
}