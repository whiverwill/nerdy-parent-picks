import type { Category } from './types'

export const CATEGORIES: Category[] = [
  { id: 'science',     label: 'Science',     color: '#4A9FE8' },
  { id: 'space',       label: 'Space',       color: '#7B52B9' },
  { id: 'nature',      label: 'Nature',      color: '#5CB85C' },
  { id: 'math',        label: 'Math',        color: '#F5C842' },
  { id: 'engineering', label: 'Engineering', color: '#F5A623' },
  { id: 'education',   label: 'Education',   color: '#E85D4A' },
  { id: 'art',         label: 'Art',         color: '#E85DA0' },
  { id: 'puzzles',     label: 'Puzzles',     color: '#26C6DA' },
  { id: 'travel',      label: 'Travel',      color: '#66BB6A' },
]

export function getCategoryColor(categoryId: string): string {
  return CATEGORIES.find(c => c.id === categoryId)?.color ?? '#9CA3AF'
}

export function getCategoryLabel(categoryId: string): string {
  return CATEGORIES.find(c => c.id === categoryId)?.label ?? categoryId
}
