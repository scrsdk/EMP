'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

interface Column<T> {
  key: string
  header: string | ReactNode
  accessor?: (row: T) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  variant?: 'default' | 'striped' | 'bordered' | 'compact'
  hover?: boolean
  stickyHeader?: boolean
  sortable?: boolean
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  className?: string
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  variant = 'default',
  hover = true,
  stickyHeader = false,
  sortable = false,
  onSort,
  onRowClick,
  emptyMessage = 'Нет данных',
  className,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return
    
    const direction = 
      sortConfig?.key === column.key && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc'
    
    setSortConfig({ key: column.key, direction })
    onSort(column.key, direction)
  }
  
  const getCellValue = (row: T, column: Column<T>) => {
    if (column.accessor) {
      return column.accessor(row)
    }
    return row[column.key]
  }
  
  const variantClasses = {
    default: '',
    striped: 'tbody tr:nth-child(even):bg-secondary/30',
    bordered: 'border border-gray-200 dark:border-gray-700',
    compact: '',
  }
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className={cn(
      'w-full overflow-auto rounded-lg',
      variantClasses[variant],
      className
    )}>
      <table className="w-full">
        <thead className={cn(
          'bg-secondary/50',
          stickyHeader && 'sticky top-0 z-10'
        )}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  'font-semibold text-primary',
                  variant === 'compact' ? 'px-3 py-2 text-sm' : 'px-4 py-3',
                  alignClasses[column.align || 'left'],
                  column.sortable && sortable && 'cursor-pointer select-none hover:bg-secondary/70',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.header}</span>
                  {column.sortable && sortable && (
                    <div className="flex flex-col">
                      <svg
                        className={cn(
                          'w-3 h-3 -mb-1',
                          sortConfig?.key === column.key && sortConfig.direction === 'asc'
                            ? 'text-accent'
                            : 'text-gray-400'
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M7 10l5-5 5 5H7z" />
                      </svg>
                      <svg
                        className={cn(
                          'w-3 h-3 -mt-1',
                          sortConfig?.key === column.key && sortConfig.direction === 'desc'
                            ? 'text-accent'
                            : 'text-gray-400'
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M7 10l5 5 5-5H7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-secondary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className={cn(
                  'border-b border-gray-200 dark:border-gray-700 last:border-0',
                  hover && 'hover:bg-secondary/30 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      variant === 'compact' ? 'px-3 py-2 text-sm' : 'px-4 py-3',
                      alignClasses[column.align || 'left'],
                      column.className
                    )}
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Mobile-optimized table
interface MobileTableProps<T> {
  data: T[]
  renderCard: (item: T, index: number) => ReactNode
  onItemClick?: (item: T, index: number) => void
  emptyMessage?: string
  className?: string
}

export function MobileTable<T>({
  data,
  renderCard,
  onItemClick,
  emptyMessage = 'Нет данных',
  className,
}: MobileTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-secondary">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onItemClick?.(item, index)}
          className={cn(
            'glass-card',
            onItemClick && 'cursor-pointer hover:shadow-lg transition-shadow'
          )}
        >
          {renderCard(item, index)}
        </motion.div>
      ))}
    </div>
  )
}

// Responsive table that switches to cards on mobile
interface ResponsiveTableProps<T> extends TableProps<T> {
  renderMobileCard: (item: T, index: number) => ReactNode
  breakpoint?: number
}

export function ResponsiveTable<T extends Record<string, any>>({
  renderMobileCard,
  breakpoint = 768,
  ...tableProps
}: ResponsiveTableProps<T>) {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [breakpoint])
  
  if (isMobile) {
    return (
      <MobileTable
        data={tableProps.data}
        renderCard={renderMobileCard}
        onItemClick={tableProps.onRowClick}
        emptyMessage={tableProps.emptyMessage}
        className={tableProps.className}
      />
    )
  }
  
  return <Table {...tableProps} />
}

// Game-specific tables
export const GameTable = {
  Leaderboard: ({ players }: {
    players: Array<{
      rank: number
      name: string
      level: number
      score: number
      guild?: string
      avatar?: string
    }>
  }) => {
    const columns: Column<typeof players[0]>[] = [
      {
        key: 'rank',
        header: '#',
        width: '60px',
        align: 'center',
        accessor: (row) => {
          const rankColors = {
            1: 'text-yellow-500',
            2: 'text-gray-400',
            3: 'text-orange-600',
          }
          return (
            <span className={cn(
              'font-bold',
              rankColors[row.rank as keyof typeof rankColors]
            )}>
              {row.rank}
            </span>
          )
        },
      },
      {
        key: 'player',
        header: 'Игрок',
        accessor: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
              {row.name[0]}
            </div>
            <div>
              <div className="font-medium">{row.name}</div>
              {row.guild && (
                <div className="text-xs text-secondary">{row.guild}</div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'level',
        header: 'Уровень',
        align: 'center',
        width: '100px',
      },
      {
        key: 'score',
        header: 'Очки',
        align: 'right',
        sortable: true,
        accessor: (row) => (
          <span className="font-semibold">{formatNumber(row.score)}</span>
        ),
      },
    ]
    
    return (
      <ResponsiveTable
        data={players}
        columns={columns}
        variant="striped"
        renderMobileCard={(player) => (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                player.rank === 1 && 'bg-yellow-500 text-white',
                player.rank === 2 && 'bg-gray-400 text-white',
                player.rank === 3 && 'bg-orange-600 text-white',
                player.rank > 3 && 'bg-secondary'
              )}>
                {player.rank}
              </div>
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-secondary">
                  Уровень {player.level} • {formatNumber(player.score)} очков
                </div>
              </div>
            </div>
          </div>
        )}
      />
    )
  },
  
  Resources: ({ resources }: {
    resources: Array<{
      id: string
      name: string
      icon: string
      current: number
      max: number
      production: number
    }>
  }) => {
    const columns: Column<typeof resources[0]>[] = [
      {
        key: 'resource',
        header: 'Ресурс',
        accessor: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{row.icon}</span>
            <span className="font-medium">{row.name}</span>
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'Количество',
        align: 'center',
        accessor: (row) => (
          <div>
            <div className="font-semibold">{formatNumber(row.current)}</div>
            <div className="text-xs text-secondary">/ {formatNumber(row.max)}</div>
          </div>
        ),
      },
      {
        key: 'production',
        header: 'Производство',
        align: 'right',
        accessor: (row) => (
          <span className="text-green-500">
            +{formatNumber(row.production)}/час
          </span>
        ),
      },
    ]
    
    return (
      <Table
        data={resources}
        columns={columns}
        variant="compact"
        hover={false}
      />
    )
  },
  
  BattleLog: ({ battles }: {
    battles: Array<{
      id: string
      time: string
      opponent: string
      result: 'victory' | 'defeat' | 'draw'
      rewards?: string
    }>
  }) => {
    const columns: Column<typeof battles[0]>[] = [
      {
        key: 'time',
        header: 'Время',
        width: '100px',
        accessor: (row) => (
          <span className="text-sm text-secondary">{row.time}</span>
        ),
      },
      {
        key: 'battle',
        header: 'Битва',
        accessor: (row) => (
          <div className="flex items-center gap-2">
            <span>Вы vs {row.opponent}</span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              row.result === 'victory' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
              row.result === 'defeat' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
              row.result === 'draw' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            )}>
              {row.result === 'victory' ? 'Победа' : row.result === 'defeat' ? 'Поражение' : 'Ничья'}
            </span>
          </div>
        ),
      },
      {
        key: 'rewards',
        header: 'Награды',
        align: 'right',
        accessor: (row) => row.rewards || '-',
      },
    ]
    
    return (
      <Table
        data={battles}
        columns={columns}
        variant="bordered"
      />
    )
  },
}