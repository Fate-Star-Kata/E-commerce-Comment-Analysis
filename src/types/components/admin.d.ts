// 用户管理相关类型定义
export interface User {
  id: number | null
  username: string
  email: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined?: string
  last_login?: string
  role?: string
  status?: string
  created_at?: string
  avatar?: string
  phone?: string
  address?: string
  bio?: string
}

// 用户查询参数
export interface UserQueryParams {
  query: string
  page: number
  page_size: number
}

// 用户列表响应
export interface UserListResponse {
  code: number
  data: {
    users: User[]
    total: number
  }
  message?: string
}

// API响应基础类型
export interface ApiResponse {
  message?: string
  msg?: string
  data?: any
}

// 表格列配置
export interface TableColumn {
  title: string
  dataIndex: string
  key?: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  scopedSlots?: any
}

// 管理员导航菜单项
export interface AdminMenuItem {
  id: string
  title: string
  icon?: string
  path: string
  hide?: boolean
  children?: AdminMenuItem[]
}

// 管理员头部组件类型
export interface AdminHeader {
  id: string
  title: string
  icon?: string
  path: string
  hide?: boolean
  children?: AdminHeader[]
}

// 分页配置
export interface PaginationConfig {
  total: number
  current: number
  pageSize: number
  showTotal: (total: number) => string
  onChange: (current: number, size: number) => void
}

// 数据管理相关类型
export interface DataRecord {
  id: number
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  user_id: number
  created_at: string
  source: 'file' | 'api'
}

export interface DataQueryParams {
  query?: string
  sentiment?: string
  source?: string
  start_date?: string
  end_date?: string
  page: number
  page_size: number
}

export interface DataListResponse {
  code: number
  data: {
    records: DataRecord[]
    total: number
    stats: {
      total_count: number
      positive_count: number
      negative_count: number
      neutral_count: number
    }
  }
  message?: string
}

// 历史记录
export interface HistoryRecord {
  id: number
  username: string
  analysis_type: 'batch' | 'single'
  total_count: number
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  created_at: string
  updated_at: string
  file_name?: string
  positive_count: number
  negative_count: number
  neutral_count: number
  comment_text?: string
  keywords?: string[]
  details: any[]
}

export interface HistoryQueryParams {
  username?: string
  analysis_type?: string
  sentiment?: string
  start_date?: string
  end_date?: string
  page: number
  page_size: number
}

export interface HistoryListResponse {
  code: number
  data: {
    records: HistoryRecord[]
    total: number
    stats: {
      total_records: number
      today_records: number
      success_rate: number
      storage_used: string
    }
  }
  message?: string
}

// 数据统计相关类型
export interface StatisticsData {
  total_comments: number
  active_users: number
  accuracy_rate: number
  storage_size: string
  daily_analysis: {
    date: string
    count: number
  }[]
  sentiment_distribution: {
    positive: number
    negative: number
    neutral: number
  }
  time_period_stats: {
    period: string
    total_analysis: number
    positive_count: number
    negative_count: number
    neutral_count: number
    avg_confidence: number
    active_users: number
  }[]
}

export interface StatisticsResponse {
  code: number
  data: StatisticsData
  message?: string
}