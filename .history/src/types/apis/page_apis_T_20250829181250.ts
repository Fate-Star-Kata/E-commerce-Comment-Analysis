// 情感分析相关类型定义

// 基础响应类型
export interface BaseResponse<T = any> {
  code: number
  msg: string | null
  data: T
}

// 情感类型
export type SentimentType = 'positive' | 'negative' | 'neutral'

// 分析类型
export type AnalysisType = 'single' | 'batch'

// 单条评论分析请求
export interface SingleAnalysisRequest {
  comment_text: string
}

// 单条评论分析响应
export interface SingleAnalysisResponse {
  id: number
  comment_text: string
  hzsystem_sentiment: SentimentType
  confidence: number
  keywords: string[]
  probabilities: {
    negative: number
    positive: number
  }
  created_at: string
}

// 批量分析详情项
export interface BatchAnalysisDetail {
  id: number
  comment_text: string
  sentiment: SentimentType
  confidence: number
  keywords: string
  row_index: number
}

// 批量分析统计信息
export interface BatchAnalysisStatistics {
  total_count: number
  positive_count: number
  negative_count: number
  neutral_count: number
  positive_ratio: number
  negative_ratio: number
  neutral_ratio: number
}

// 批量分析预览结果
export interface BatchAnalysisPreviewResult {
  hzsystem_sentiment: SentimentType
  confidence: number
  keywords: string[]
  probabilities: {
    negative: number
    positive: number
  }
  comment_text: string
  row_index: number
}

// 批量分析响应
export interface BatchAnalysisResponse {
  id: number
  file_name: string
  statistics: BatchAnalysisStatistics
  preview_results: BatchAnalysisPreviewResult[]
  created_at: string
}

// 删除分析记录请求
export interface DeleteAnalysisRequest {
  record_id: number
}

// 批量删除分析记录请求
export interface BatchDeleteAnalysisRequest {
  record_ids: number[]
}

// 历史记录查询参数
export interface HistoryQueryParams {
  page?: number
  page_size?: number
  analysis_type?: AnalysisType | undefined
  sentiment?: SentimentType | undefined
  start_date?: string
  end_date?: string
  startTime?: string
  endTime?: string
}

// 历史记录项
export interface HistoryRecord {
  id: number
  username: string
  analysis_type: AnalysisType
  created_at: string
  updated_at: string
  file_name: string | null
  total_count: number
  positive_count: number
  negative_count: number
  neutral_count: number
  comment_text: string | null
  sentiment: SentimentType | null
  confidence: number | null
  keywords: string | null
  details: BatchAnalysisDetail[]
}

// 历史记录分页响应
export interface HistoryResponse {
  data: any
  total: number
  page: number
  page_size: number
  records: HistoryRecord[]
}

// 分析详情响应（单个记录的详细信息）
export interface AnalysisDetailResponse extends HistoryRecord {
  data: HistoryRecord | { id: number; username: string; analysis_type: "batch" | "single"; total_count: number; sentiment: "positive" | "negative" | "neutral"; confidence: number; created_at: string; updated_at: string; file_name?: string | undefined; positive_count: number; negative_count: number; neutral_count: number; comment_text?: string | undefined; keywords?: string[] | undefined; details: any[] } | null;
}

// 情感分布统计
export interface SentimentDistribution {
  positive: number
  negative: number
  neutral: number
}

// 最近分析记录简要信息
export interface RecentAnalysis {
  id: number
  analysis_type: AnalysisType
  created_at: string
  total_count: number
  sentiment: SentimentType | null
}

// 统计信息响应
export interface StatisticsResponse {
  data: any
  total_analyses: number
  single_analyses: number
  batch_analyses: number
  total_comments_analyzed: number
  sentiment_distribution: SentimentDistribution
  recent_analyses: RecentAnalysis[]
}

// API响应类型别名
export type SingleAnalysisApiResponse = BaseResponse<SingleAnalysisResponse>
export type BatchAnalysisApiResponse = BaseResponse<BatchAnalysisResponse>
export type DeleteAnalysisApiResponse = BaseResponse<null>
export type BatchDeleteAnalysisApiResponse = BaseResponse<null>
export type HistoryApiResponse = BaseResponse<HistoryResponse>
export type AnalysisDetailApiResponse = BaseResponse<AnalysisDetailResponse>
export type StatisticsApiResponse = BaseResponse<StatisticsResponse>