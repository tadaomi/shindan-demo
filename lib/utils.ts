import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 共通ユーティリティ関数

/**
 * JSONデータをファイルとしてダウンロード
 */
export function downloadJSON(data: any, filename: string): void {
  if (typeof window === 'undefined') return
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', filename)
  linkElement.click()
}

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDateJP(dateString: string, includeTime: boolean = true): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return new Date(dateString).toLocaleDateString('ja-JP', options)
}

/**
 * エラーハンドリング用のメッセージ生成
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

