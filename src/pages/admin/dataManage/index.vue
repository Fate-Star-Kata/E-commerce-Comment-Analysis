<template>
  <div class="data-manage-container">
    <Motion :delay="100">
      <div class="data-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="overview-card">
              <div class="card-icon">
                <el-icon>
                  <Document />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">总数据量</div>
                <div class="card-value">{{ stats.total_count || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card positive">
              <div class="card-icon">
                <el-icon>
                  <CircleCheck />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">正面评价</div>
                <div class="card-value">{{ stats.positive_count || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card negative">
              <div class="card-icon">
                <el-icon>
                  <CircleClose />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">负面评价</div>
                <div class="card-value">{{ stats.negative_count || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card neutral">
              <div class="card-icon">
                <el-icon>
                  <Remove />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">中性评价</div>
                <div class="card-value">{{ stats.neutral_count || 0 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </Motion>

    <Motion :delay="200">
      <div class="search-section">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>数据筛选</span>
            </div>
          </template>
          <el-form :model="searchForm" inline>
            <el-form-item label="关键词">
              <el-input v-model="searchForm.query" placeholder="请输入关键词" clearable style="width: 200px" />
            </el-form-item>

            <el-form-item label="情感类型">
              <el-select v-model="searchForm.sentiment" placeholder="请选择情感类型" clearable style="width: 150px">
                <el-option label="正面" value="positive" />
                <el-option label="负面" value="negative" />
                <el-option label="中性" value="neutral" />
              </el-select>
            </el-form-item>
            <el-form-item label="分析类型">
              <el-select v-model="searchForm.analysis_type" placeholder="请选择分析类型" clearable style="width: 150px">
                <el-option label="单条分析" value="single" />
                <el-option label="批量分析" value="batch" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 240px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon>
                  <Refresh />
                </el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </Motion>

    <Motion :delay="300">
      <div class="table-section">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>数据列表</span>
              <div class="header-actions">
                <el-button type="primary" size="small" @click="handleExport">
                  <el-icon>
                    <Download />
                  </el-icon>
                  导出数据
                </el-button>
                <el-button type="danger" size="small" @click="handleBatchDelete">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  批量删除
                </el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" stripe
            style="width: 100%">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="content" label="评论内容" min-width="200">
              <template #default="{ row }">
                <div class="content-cell">
                  <span v-if="row.analysis_type === 'single'">{{ row.comment_text }}</span>
                  <span v-else class="batch-info clickable" @click="showBatchDetails(row)">批量分析 ({{ row.total_count }} 条数据) <el-icon><View /></el-icon></span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sentiment" label="情感分析" width="200">
              <template #default="{ row }">
                <el-tag v-if="row.analysis_type === 'single'" :type="getSentimentType(row.sentiment)" size="small">
                  {{ getSentimentText(row.sentiment) }}
                </el-tag>
                <div v-else class="batch-sentiment-progress">
                  <div class="progress-container" :title="getBatchSentimentTooltip(row)">
                    <div class="progress-bar">
                      <div 
                        class="progress-segment positive" 
                        :style="{ width: getBatchSentimentPercentage(row, 'positive') + '%' }"
                      ></div>
                      <div 
                        class="progress-segment neutral" 
                        :style="{ width: getBatchSentimentPercentage(row, 'neutral') + '%' }"
                      ></div>
                      <div 
                        class="progress-segment negative" 
                        :style="{ width: getBatchSentimentPercentage(row, 'negative') + '%' }"
                      ></div>
                    </div>
                  </div>
                  <div class="sentiment-counts">
                    正面: {{ row.positive_count || 0 }} | 
                    负面: {{ row.negative_count || 0 }} | 
                    中性: {{ row.neutral_count || 0 }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="{ row }">
                <div v-if="row.analysis_type === 'single' && row.confidence">
                  <el-progress :percentage="Math.round(row.confidence * 100)" :stroke-width="6" :show-text="false" />
                  <span class="confidence-text">{{ Math.round(row.confidence * 100) }}%</span>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="analysis_type" label="分析类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.analysis_type === 'single' ? 'success' : 'info'" size="small">
                  {{ row.analysis_type === 'single' ? '单条' : '批量' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" size="small" text @click="handleView(row)">
                    查看
                  </el-button>
                  <el-button type="danger" size="small" text @click="handleDelete(row)">
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.pageSize"
              :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handlePageChange" />
          </div>
        </el-card>
      </div>
    </Motion>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="数据详情" width="600px" destroy-on-close>
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">
            {{ currentRecord.id }}
          </el-descriptions-item>
          <el-descriptions-item label="分析类型">
            <el-tag :type="currentRecord.analysis_type === 'single' ? 'success' : 'info'">
              {{ currentRecord.analysis_type === 'single' ? '单条分析' : '批量分析' }}
            </el-tag>
          </el-descriptions-item>
          
          <!-- 单条分析的详细信息 -->
          <template v-if="currentRecord.analysis_type === 'single'">
            <el-descriptions-item label="评论内容" :span="2">
              <div class="content-display">
                {{ currentRecord.comment_text }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="情感分析">
              <el-tag :type="getSentimentType(currentRecord.sentiment || '')" size="large">
                {{ getSentimentText(currentRecord.sentiment || '') }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="置信度">
              <el-progress :percentage="Math.round((currentRecord.confidence || 0) * 100)" :stroke-width="8" />
            </el-descriptions-item>
          </template>
          
          <!-- 批量分析的统计信息 -->
          <template v-else>
            <el-descriptions-item label="总数据量">
              {{ currentRecord.total_count }}
            </el-descriptions-item>
            <el-descriptions-item label="正面评论">
              {{ currentRecord.positive_count }}
            </el-descriptions-item>
            <el-descriptions-item label="负面评论">
              {{ currentRecord.negative_count }}
            </el-descriptions-item>
            <el-descriptions-item label="中性评论">
              {{ currentRecord.neutral_count }}
            </el-descriptions-item>
            <el-descriptions-item label="文件名" v-if="currentRecord.file_name">
              {{ currentRecord.file_name }}
            </el-descriptions-item>
          </template>
          
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentRecord.created_at) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 批量详情对话框 -->
    <el-dialog v-model="batchDetailsVisible" title="批量分析详情" width="80%" destroy-on-close>
      <div v-if="currentBatchRecord" class="batch-details-content">
        <div class="batch-summary">
          <el-descriptions :column="4" border>
            <el-descriptions-item label="总数据量">
              {{ currentBatchRecord.total_count }}
            </el-descriptions-item>
            <el-descriptions-item label="正面评论">
              <el-tag type="success">{{ currentBatchRecord.positive_count }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="负面评论">
              <el-tag type="danger">{{ currentBatchRecord.negative_count }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="中性评论">
              <el-tag type="info">{{ currentBatchRecord.neutral_count }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="batch-details-table">
          <el-table v-loading="batchDetailsLoading" :data="batchDetailsList" stripe style="width: 100%" max-height="400">
             <el-table-column prop="comment_text" label="评论内容" min-width="300">
               <template #default="{ row }">
                 <div class="content-cell">
                   {{ row.comment_text }}
                 </div>
               </template>
             </el-table-column>
            <el-table-column prop="sentiment" label="情感分析" width="120">
              <template #default="{ row }">
                <el-tag :type="getSentimentType(row.sentiment || '')" size="small">
                  {{ getSentimentText(row.sentiment || '') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="120">
              <template #default="{ row }">
                <div v-if="row.confidence">
                  <el-progress :percentage="Math.round(row.confidence * 100)" :stroke-width="6" :show-text="false" />
                  <span class="confidence-text">{{ Math.round(row.confidence * 100) }}%</span>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  CircleCheck,
  CircleClose,
  Remove,
  Search,
  Refresh,
  Download,
  Delete
} from '@element-plus/icons-vue'
import { Motion } from 'motion-v'
import {
  getAnalysisHistory,
  deleteAnalysisRecord,
  getAnalysisDetail
} from '@/api/page_apis'
import type {
  HistoryQueryParams,
  HistoryRecord,
  HistoryApiResponse,
  AnalysisDetailResponse,
  SentimentType,
  AnalysisType
} from '@/types/apis/page_apis_T'

// 响应式数据
const loading = ref(false)
const dataList = ref<HistoryRecord[]>([])
const selectedRows = ref<HistoryRecord[]>([])
const viewDialogVisible = ref(false)
const currentRecord = ref<HistoryRecord | null>(null)
const batchDetailsVisible = ref(false)
const batchDetailsList = ref<any[]>([])
const currentBatchRecord = ref<HistoryRecord | null>(null)
const batchDetailsLoading = ref(false)
const dateRange = ref<[string, string] | null>(null)

// 统计数据
const stats = reactive({
  total_count: 0,
  positive_count: 0,
  negative_count: 0,
  neutral_count: 0
})

// 搜索表单
const searchForm = reactive({
  query: '',
  sentiment: '',
  analysis_type: '',
  start_date: '',
  end_date: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 获取数据列表
const getDataListData = async () => {
  loading.value = true
  try {
    const apiParams: HistoryQueryParams = {
       page: pagination.current,
       page_size: pagination.pageSize,
       query: searchForm.query || undefined,
       sentiment: (searchForm.sentiment as SentimentType) || undefined,
       analysis_type: (searchForm.analysis_type as AnalysisType) || undefined,
       start_date: searchForm.start_date || undefined,
       end_date: searchForm.end_date || undefined
     }

     // 处理日期范围
     if (dateRange.value) {
       apiParams.start_date = dateRange.value[0]
       apiParams.end_date = dateRange.value[1]
       searchForm.start_date = dateRange.value[0]
       searchForm.end_date = dateRange.value[1]
     }

    const response: HistoryApiResponse = await getAnalysisHistory(apiParams)
    
    // 直接使用API返回的数据
    dataList.value = response.data.records
    pagination.total = response.data.total
    
    // 计算统计数据
    calculateStats(response.data.records)
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 计算统计数据
const calculateStats = (records: HistoryRecord[]) => {
  // 重置统计数据
  stats.total_count = 0
  stats.positive_count = 0
  stats.negative_count = 0
  stats.neutral_count = 0
  
  records.forEach(record => {
    // 对于批量分析，使用其统计数据
    if (record.analysis_type === 'batch') {
      stats.total_count += record.total_count
      stats.positive_count += record.positive_count
      stats.negative_count += record.negative_count
      stats.neutral_count += record.neutral_count
    } else if (record.analysis_type === 'single' && record.sentiment) {
      // 对于单条分析，根据情感类型计数
      stats.total_count += 1
      if (record.sentiment === 'positive') {
        stats.positive_count += 1
      } else if (record.sentiment === 'negative') {
        stats.negative_count += 1
      } else if (record.sentiment === 'neutral') {
        stats.neutral_count += 1
      }
    }
  })
}

// 显示批量详情
const showBatchDetails = async (row: HistoryRecord) => {
  if (row.analysis_type !== 'batch') return
  
  currentBatchRecord.value = row
  batchDetailsLoading.value = true
  batchDetailsVisible.value = true
  
  try {
    const response = await getAnalysisDetail(row.id)
    if (response.code === 200 && response.data) {
      batchDetailsList.value = response.data.details || []
    } else {
      ElMessage.error('获取批量详情失败')
      batchDetailsList.value = []
    }
  } catch (error) {
    console.error('获取批量详情失败:', error)
    ElMessage.error('获取批量详情失败')
    batchDetailsList.value = []
  } finally {
    batchDetailsLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getDataListData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    query: '',
    sentiment: '',
    analysis_type: '',
    start_date: '',
    end_date: ''
  })
  dateRange.value = null
  pagination.current = 1
  getDataListData()
}

// 查看详情
const handleView = (row: HistoryRecord) => {
  currentRecord.value = row
  viewDialogVisible.value = true
}

// 删除单条记录
const handleDelete = async (row: HistoryRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条数据吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteAnalysisRecord({ record_id: row.id })
    ElMessage.success('删除成功')
    getDataListData()
  } catch (error) {
    // 用户取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    // 使用循环调用单个删除API实现批量删除
    for (const id of ids) {
      await deleteAnalysisRecord({ record_id: id })
    }
    ElMessage.success('批量删除成功')
    getDataListData()
  } catch (error) {
    // 用户取消删除
  }
}

// 导出数据
const handleExport = async () => {
  try {
    // 前端导出当前页面数据为CSV格式
    const csvContent = generateCSV(dataList.value)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data_export_${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 生成CSV内容
const generateCSV = (data: HistoryRecord[]) => {
  const headers = ['ID', '分析类型', '内容/统计', '情感分析', '置信度', '创建时间']
  const csvRows = [headers.join(',')]
  
  data.forEach(row => {
    let contentInfo = ''
    let sentimentInfo = ''
    let confidenceInfo = ''
    
    if (row.analysis_type === 'single') {
        contentInfo = `"${(row.comment_text || '').replace(/"/g, '""')}"` // 转义双引号
        sentimentInfo = getSentimentText(row.sentiment || '')
        confidenceInfo = row.confidence ? `${Math.round(row.confidence * 100)}%` : '-'
      } else {
        contentInfo = `批量分析(${row.total_count || 0}条)`
      sentimentInfo = `正面:${row.positive_count || 0} 负面:${row.negative_count || 0} 中性:${row.neutral_count || 0}`
      confidenceInfo = '-'
    }
    
    const values = [
      row.id,
      row.analysis_type === 'single' ? '单条分析' : '批量分析',
      contentInfo,
      sentimentInfo,
      confidenceInfo,
      formatDate(row.created_at)
    ]
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

// 表格选择变化
const handleSelectionChange = (selection: HistoryRecord[]) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  getDataListData()
}

// 页码变化
const handlePageChange = (page: number) => {
  pagination.current = page
  getDataListData()
}

// 获取情感标签类型
const getSentimentType = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'success'
    case 'negative':
      return 'danger'
    case 'neutral':
      return 'warning'
    default:
      return 'info'
  }
}



// 获取情感文本
const getSentimentText = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return '正面'
    case 'negative':
      return '负面'
    case 'neutral':
      return '中性'
    default:
      return '未知'
  }
}

// 计算批量情感分析百分比
const getBatchSentimentPercentage = (row: any, type: 'positive' | 'negative' | 'neutral') => {
  const total = (row.positive_count || 0) + (row.negative_count || 0) + (row.neutral_count || 0)
  if (total === 0) return 0
  
  const count = type === 'positive' ? (row.positive_count || 0) :
                type === 'negative' ? (row.negative_count || 0) :
                (row.neutral_count || 0)
  
  return Math.round((count / total) * 100)
}

// 生成批量情感分析提示文本
const getBatchSentimentTooltip = (row: any) => {
  const total = (row.positive_count || 0) + (row.negative_count || 0) + (row.neutral_count || 0)
  const positivePercent = getBatchSentimentPercentage(row, 'positive')
  const negativePercent = getBatchSentimentPercentage(row, 'negative')
  const neutralPercent = getBatchSentimentPercentage(row, 'neutral')
  
  return `总计: ${total} 条\n正面: ${row.positive_count || 0} 条 (${positivePercent}%)\n负面: ${row.negative_count || 0} 条 (${negativePercent}%)\n中性: ${row.neutral_count || 0} 条 (${neutralPercent}%)`
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  getDataListData()
})
</script>

<style scoped>
.data-manage-container {
  padding: 20px;
}

.data-overview {
  margin-bottom: 20px;
}

.overview-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.overview-card.positive {
  border-left: 4px solid #67c23a;
}

.overview-card.negative {
  border-left: 4px solid #f56c6c;
}

.overview-card.neutral {
  border-left: 4px solid #909399;
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
  color: #409eff;
}

.positive .card-icon {
  color: #67c23a;
}

.negative .card-icon {
  color: #f56c6c;
}

.neutral .card-icon {
  color: #909399;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.search-section {
  margin-bottom: 20px;
}

.table-section {
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.content-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.confidence-text {
  margin-left: 8px;
  font-size: 12px;
  color: #606266;
}

.batch-info {
  color: #909399;
  font-style: italic;
}

.batch-sentiment {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.content-display {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  word-break: break-all;
}

.clickable {
  cursor: pointer;
  color: #409eff;
  text-decoration: underline;
}

.clickable:hover {
  color: #66b1ff;
}

.batch-details-content {
  padding: 16px 0;
}

.batch-summary {
  margin-bottom: 20px;
}

.batch-details-table {
  margin-top: 16px;
}

.content-cell {
  max-width: 300px;
  word-break: break-word;
  line-height: 1.4;
  white-space: pre-wrap;
}

.confidence-text {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

/* 批量情感分析进度条样式 */
.batch-sentiment-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-container {
  width: 100%;
  cursor: pointer;
}

.progress-bar {
  display: flex;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.progress-segment {
  height: 100%;
  transition: all 0.3s ease;
}

.progress-segment.positive {
  background-color: #67c23a; /* 正面 - 绿色 */
}

.progress-segment.neutral {
  background-color: #e6a23c; /* 中性 - 黄色 */
}

.progress-segment.negative {
  background-color: #f56c6c; /* 负面 - 红色 */
}

.sentiment-counts {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.detail-content {
  padding: 20px 0;
}

.content-detail {
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
  word-break: break-all;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #333;
  font-weight: 600;
}

:deep(.el-pagination) {
  justify-content: center;
}
</style>
