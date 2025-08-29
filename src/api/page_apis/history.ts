import serviceAxios from '@/http'
import type {
  HistoryQueryParams,
  HistoryApiResponse,
  AnalysisDetailApiResponse
} from '@/types/apis/page_apis_T'

/**
 * 获取分析历史记录
 * @param params 查询参数
 * @returns 历史记录列表
 */
export function getAnalysisHistory(params: HistoryQueryParams = {}): Promise<HistoryApiResponse> {
  // 构建查询参数，过滤掉空值
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '')
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {} as Record<string, any>)

  return serviceAxios({
    url: '/sentiment/history/',
    method: 'get',
    params: queryParams,
  })
}

/**
 * 获取分析详情
 * @param recordId 记录ID
 * @returns 分析详情
 */
export function getAnalysisDetail(recordId: number): Promise<AnalysisDetailApiResponse> {
  return serviceAxios({
    url: `/sentiment/detail/${recordId}/`,
    method: 'get',
  })
}