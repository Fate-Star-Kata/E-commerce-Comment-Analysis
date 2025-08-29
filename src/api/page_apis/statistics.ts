import serviceAxios from '@/http'
import type { StatisticsApiResponse } from '@/types/apis/page_apis_T'

/**
 * 获取分析统计信息
 * @returns 统计信息数据
 */
export function getAnalysisStatistics(): Promise<StatisticsApiResponse> {
  return serviceAxios({
    url: '/sentiment/statistics/',
    method: 'get',
  })
}