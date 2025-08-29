import serviceAxios from '@/http'
import type {
  SingleAnalysisRequest,
  SingleAnalysisApiResponse,
  BatchAnalysisApiResponse,
  DeleteAnalysisRequest,
  DeleteAnalysisApiResponse,
  BatchDeleteAnalysisRequest,
  BatchDeleteAnalysisApiResponse
} from '@/types/apis/page_apis_T'

/**
 * 单条评论情感分析
 * @param data 评论文本数据
 * @returns 分析结果
 */
export function analyzeSingleComment(data: SingleAnalysisRequest): Promise<SingleAnalysisApiResponse> {
  return serviceAxios({
    url: '/sentiment/analyze/single/',
    method: 'post',
    data,
  })
}

/**
 * 批量CSV文件情感分析
 * @param file 上传的文件
 * @param commentColumn 评论列名（可选）
 * @returns 批量分析结果
 */
export function analyzeBatchComments(file: File, commentColumn?: string): Promise<BatchAnalysisApiResponse> {
  const formData = new FormData()
  formData.append('file', file)
  if (commentColumn) {
    formData.append('comment_column', commentColumn)
  }

  return serviceAxios({
    url: '/sentiment/analyze/batch/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除分析记录
 * @param data 包含记录ID的数据
 * @returns 删除结果
 */
export function deleteAnalysisRecord(data: DeleteAnalysisRequest): Promise<DeleteAnalysisApiResponse> {
  return serviceAxios({
    url: '/sentiment/delete/',
    method: 'post',
    data,
  })
}

/**
 * 批量删除分析记录
 * @param data 包含记录ID数组的数据
 * @returns 删除结果
 */
export function batchDeleteAnalysisRecord(data: BatchDeleteAnalysisRequest): Promise<BatchDeleteAnalysisApiResponse> {
  return serviceAxios({
    url: '/sentiment/batch-delete/',
    method: 'post',
    data,
  })
}