'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  placeholder?: string
  format?: string
  variant?: 'default' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  showTime?: boolean
  locale?: 'ru' | 'en'
  className?: string
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  placeholder = 'Выберите дату',
  format = 'DD.MM.YYYY',
  variant = 'default',
  size = 'md',
  showTime = false,
  locale = 'ru',
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(variant === 'inline')
  const [selectedDate, setSelectedDate] = useState(value || new Date())
  const [viewDate, setViewDate] = useState(value || new Date())
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days')
  const { hapticFeedback } = useTelegram()
  
  const months = locale === 'ru' 
    ? ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  const weekDays = locale === 'ru'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  }
  
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    let formatted = format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString())
    
    if (showTime) {
      formatted += ` ${hours}:${minutes}`
    }
    
    return formatted
  }
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    // Adjust for Monday as first day
    return firstDay === 0 ? 6 : firstDay - 1
  }
  
  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return disabledDates.some(d => 
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    )
  }
  
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }
  
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    
    hapticFeedback?.impactOccurred('light')
    setSelectedDate(date)
    onChange?.(date)
    
    if (variant === 'default' && !showTime) {
      setIsOpen(false)
    }
  }
  
  const handleMonthChange = (direction: -1 | 1) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + direction, 1))
  }
  
  const handleYearChange = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1))
    setViewMode('months')
  }
  
  const handleMonthSelect = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1))
    setViewMode('days')
  }
  
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    const days = []
    
    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />)
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      const isDisabled = isDateDisabled(date)
      const isSelected = selectedDate && isSameDay(date, selectedDate)
      const isToday = isSameDay(date, new Date())
      
      days.push(
        <motion.button
          key={day}
          type="button"
          onClick={() => handleDateSelect(date)}
          disabled={isDisabled}
          whileHover={!isDisabled ? { scale: 1.1 } : undefined}
          whileTap={!isDisabled ? { scale: 0.95 } : undefined}
          className={cn(
            'aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
            isSelected && 'bg-accent text-white',
            !isSelected && !isDisabled && 'hover:bg-secondary',
            isToday && !isSelected && 'ring-2 ring-accent',
            isDisabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {day}
        </motion.button>
      )
    }
    
    return days
  }
  
  const renderMonths = () => {
    return months.map((month, index) => (
      <motion.button
        key={month}
        type="button"
        onClick={() => handleMonthSelect(index)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'p-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors',
          viewDate.getMonth() === index && 'bg-accent text-white'
        )}
      >
        {month.slice(0, 3)}
      </motion.button>
    ))
  }
  
  const renderYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(
        <motion.button
          key={year}
          type="button"
          onClick={() => handleYearChange(year)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'p-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors',
            viewDate.getFullYear() === year && 'bg-accent text-white'
          )}
        >
          {year}
        </motion.button>
      )
    }
    
    return years
  }

  return (
    <div className={cn('relative', variant === 'inline' && 'inline-block', className)}>
      {variant === 'default' && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 rounded-xl bg-secondary text-left font-medium transition-all duration-300',
            sizeClasses[size],
            isOpen && 'ring-2 ring-accent/30'
          )}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'glass-card p-4 mt-2',
              variant === 'default' && 'absolute z-50 w-80'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => handleMonthChange(-1)}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                  className="font-semibold hover:text-accent transition-colors"
                >
                  {months[viewDate.getMonth()]}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                  className="font-semibold hover:text-accent transition-colors"
                >
                  {viewDate.getFullYear()}
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => handleMonthChange(1)}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Calendar content */}
            {viewMode === 'days' && (
              <>
                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-secondary">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderDays()}
                </div>
              </>
            )}
            
            {viewMode === 'months' && (
              <div className="grid grid-cols-3 gap-2">
                {renderMonths()}
              </div>
            )}
            
            {viewMode === 'years' && (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {renderYears()}
              </div>
            )}
            
            {/* Time picker */}
            {showTime && viewMode === 'days' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={selectedDate.getHours()}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 0
                      const newDate = new Date(selectedDate)
                      newDate.setHours(hours)
                      handleDateSelect(newDate)
                    }}
                    className="w-16 px-2 py-1 text-center bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <span className="font-semibold">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={selectedDate.getMinutes()}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0
                      const newDate = new Date(selectedDate)
                      newDate.setMinutes(minutes)
                      handleDateSelect(newDate)
                    }}
                    className="w-16 px-2 py-1 text-center bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              </div>
            )}
            
            {/* Footer */}
            {variant === 'default' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleDateSelect(new Date())}
                  className="text-sm text-accent hover:underline"
                >
                  Сегодня
                </button>
                {showTime && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-sm btn btn-primary btn-sm"
                  >
                    Готово
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Date range picker
interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onChange?: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Выберите период',
  size = 'md',
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStart, setTempStart] = useState(startDate)
  const [tempEnd, setTempEnd] = useState(endDate)
  const [selectingEnd, setSelectingEnd] = useState(false)
  
  const handleApply = () => {
    if (tempStart && tempEnd) {
      onChange?.(tempStart, tempEnd)
      setIsOpen(false)
    }
  }
  
  const formatRange = () => {
    if (!startDate || !endDate) return placeholder
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 rounded-xl bg-secondary text-left font-medium transition-all duration-300',
          size === 'sm' && 'h-8 text-sm',
          size === 'md' && 'h-10 text-base',
          size === 'lg' && 'h-12 text-lg',
          isOpen && 'ring-2 ring-accent/30'
        )}
      >
        {formatRange()}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 p-4 glass-card"
          >
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Начало</p>
                <DatePicker
                  value={tempStart}
                  onChange={(date) => {
                    setTempStart(date)
                    setSelectingEnd(true)
                  }}
                  maxDate={tempEnd}
                  variant="inline"
                  size="sm"
                />
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Конец</p>
                <DatePicker
                  value={tempEnd}
                  onChange={setTempEnd}
                  minDate={tempStart}
                  variant="inline"
                  size="sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!tempStart || !tempEnd}
                className="btn btn-primary btn-sm"
              >
                Применить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Game-specific date pickers
export const GameDatePicker = {
  EventScheduler: ({ onSchedule }: { onSchedule: (date: Date) => void }) => (
    <DatePicker
      onChange={onSchedule}
      minDate={new Date()}
      showTime
      placeholder="Запланировать событие"
    />
  ),
  
  BattleHistory: ({ onDateSelect }: { onDateSelect: (start: Date, end: Date) => void }) => (
    <DateRangePicker
      onChange={onDateSelect}
      maxDate={new Date()}
      placeholder="Выберите период битв"
    />
  ),
}