// 组件间的props接口和类型定义

// ============= 通用类型 =============

// 情感类型
export type SentimentType = 'positive' | 'negative' | 'neutral'

// 分析类型
export type AnalysisType = 'single' | 'batch'

// 日志类型
export type LogType = 'info' | 'success' | 'warning' | 'error'

// ============= 历史记录相关类型 =============

// 历史记录统计数据
export interface HistoryStats {
  totalAnalysis: number
  monthlyAnalysis: number
  averageAccuracy: number
  recentActivity: number
}

// 历史记录项
export interface HistoryRecord {
  id: string
  type: AnalysisType
  content: string
  sentiment: SentimentType
  confidence: number
  timestamp: Date
  resultCount?: number // 批量分析时的结果数量
  productId?: string
}

// 历史记录筛选参数
export interface HistoryFilters {
  searchQuery: string
  typeFilter: string
  sentimentFilter: string
  timeFilter: string
}

// ============= 情感分析相关类型 =============

// 单条分析结果
export interface SingleAnalysisResult {
  sentiment: SentimentType
  confidence: number
  timestamp: string
  scores: {
    positive: number
    negative: number
    neutral: number
  }
  keywords: AnalysisKeyword[]
}

// 关键词分析
export interface AnalysisKeyword {
  word: string
  sentiment: SentimentType
  weight: number
}

// 会话历史记录
export interface SessionHistoryItem {
  id: string
  text: string
  sentiment: SentimentType
  confidence: number
  timestamp: string
}

// 批量分析进度
export interface AnalysisProgress {
  current: number
  total: number
}

// 批量分析统计
export interface AnalysisStats {
  positive: number
  negative: number
  neutral: number
}

// 分析日志
export interface AnalysisLog {
  time: string
  type: string
  message: string
}

// 批量分析结果项
export interface BatchAnalysisResult {
  comment: string
  sentiment: SentimentType
  confidence: number
  productId?: string
}

// 批量分析相关类型别名（向后兼容）
export type BatchColumnMapping = ColumnMapping
export type BatchPreviewItem = PreviewItem
export type BatchAnalysisStats = AnalysisStats
export type BatchAnalysisLog = AnalysisLog
export type BatchResultItem = BatchAnalysisResult

// 历史记录相关类型别名（向后兼容）
export type StatsData = HistoryStats
export type AnalysisRecord = HistoryRecord
export type AnalysisResult = SingleAnalysisResult
export type HistoryItem = SessionHistoryItem

// 列映射配置
export interface ColumnMapping {
  content: string
  productId: string
}

// 数据预览项
export interface PreviewItem {
  content: string
  productId?: string
}

// ============= 组件Props接口 =============

// 历史记录页面组件Props
export interface StatsOverviewProps {
  statistics: HistoryStats
}

export interface FilterSearchProps {
  searchQuery: string
  filterType: string
  filterSentiment: string
  filterTime: string
}

export interface RecordsTableProps {
  records: HistoryRecord[]
  filteredRecords: HistoryRecord[]
  searchQuery: string
}

export interface DetailModalProps {
  isOpen: boolean
  record: HistoryRecord | null
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

// 情感分析页面组件Props
export interface CommentInputProps {
  commentText: string
  isAnalyzing: boolean
  maxLength?: number
}

export interface AnalysisResultProps {
  result: SingleAnalysisResult | null
}

export interface SessionHistoryProps {
  history: SessionHistoryItem[]
}

export interface StepIndicatorProps {
  currentStep: number
}

export interface FileUploadProps {
  selectedFile: File | null
  columnMapping: ColumnMapping
}

export interface DataPreviewProps {
  previewData: PreviewItem[]
}

export interface AnalysisProgressProps {
  progress: AnalysisProgress
  stats: AnalysisStats
  logs: AnalysisLog[]
  isAnalyzing: boolean
  isCompleted: boolean
  hasError: boolean
}

export interface ResultsDisplayProps {
  results: BatchAnalysisResult[]
  stats: AnalysisStats
  columnMapping: ColumnMapping
  resultFilter: string
  currentPage: number
  pageSize: number
}

// ============= 组件Emits接口 =============

// 历史记录页面组件Emits
export interface FilterSearchEmits {
  'update:searchQuery': [value: string]
  'update:filterType': [value: string]
  'update:filterSentiment': [value: string]
  'update:filterTime': [value: string]
  'reset': []
}

export interface RecordsTableEmits {
  'view': [record: HistoryRecord]
  'download': [record: HistoryRecord]
  'delete': [record: HistoryRecord]
  'export': []
  'clearAll': []
}

export interface DetailModalEmits {
  'close': []
  'download': [record: HistoryRecord]
}

export interface PaginationEmits {
  'update:currentPage': [page: number]
}

// 情感分析页面组件Emits
export interface CommentInputEmits {
  'update:commentText': [text: string]
  'useExample': [example: string]
  'analyze': []
}

export interface AnalysisResultEmits {
  'clear': []
  'save': []
  'analyzeAnother': []
}

export interface SessionHistoryEmits {
  'load': [record: SessionHistoryItem]
  'delete': [item: SessionHistoryItem]
  'clear': []
}

export interface FileUploadEmits {
  'update:selectedFile': [file: File | null]
  'update:columnMapping': [mapping: ColumnMapping]
  'next': []
}

export interface DataPreviewEmits {
  'back': []
  'next': []
}

export interface AnalysisProgressEmits {
  'back': []
  'next': []
  'retry': []
  'stop': []
}

export interface ResultsDisplayEmits {
  'update:resultFilter': [value: string]
  'update:currentPage': [page: number]
  'download': []
  'save': []
  'reset': []
}

// ============= 工具函数类型 =============

// 情感标签获取函数
export type GetSentimentLabel = (sentiment: SentimentType) => string

// 情感图标获取函数
export type GetSentimentIcon = (sentiment: SentimentType) => string

// 情感样式类获取函数
export type GetSentimentClass = (sentiment: SentimentType) => string

// 置信度等级获取函数
export type GetConfidenceLevel = (confidence: number) => string

// 日期格式化函数
export type FormatDate = (date: Date) => string

// 时间格式化函数
export type FormatTime = (date: Date) => string

// 文件大小格式化函数
export type FormatFileSize = (bytes: number) => string