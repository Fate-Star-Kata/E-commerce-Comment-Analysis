// 统一导出所有页面API

// 情感分析相关API
export {
  analyzeSingleComment,
  analyzeBatchComments,
  deleteAnalysisRecord
} from './sentiment'

// 历史记录相关API
export {
  getAnalysisHistory,
  getAnalysisDetail
} from './history'

// 统计信息相关API
export {
  getAnalysisStatistics
} from './statistics'

// 导出所有类型定义
export * from '@/types/apis/page_apis_T'