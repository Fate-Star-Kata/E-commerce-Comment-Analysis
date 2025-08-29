<template>
  <div class="history-manage-container">
    <Motion :delay="100">
      <div class="history-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="overview-card">
              <div class="card-icon">
                <el-icon>
                  <Document />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">总记录数</div>
                <div class="card-value">{{ stats.total_records || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card today">
              <div class="card-icon">
                <el-icon>
                  <Calendar />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">今日记录</div>
                <div class="card-value">{{ stats.today_records || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card success">
              <div class="card-icon">
                <el-icon>
                  <CircleCheck />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">正面情感比例</div>
                <div class="card-value">{{ stats.success_rate || 0 }}%</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card storage">
              <div class="card-icon">
                <el-icon>
                  <FolderOpened />
                </el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">评论总数</div>
                <div class="card-value">{{ stats.storage_used || '0条评论' }}</div>
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
              <span>记录筛选</span>
            </div>
          </template>
          <el-form :model="searchForm" inline>
            <el-form-item label="用户名">
              <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 150px" />
            </el-form-item>
            <el-form-item label="分析类型">
              <el-select v-model="searchForm.analysis_type" placeholder="请选择分析类型" clearable style="width: 150px">
                <el-option label="批量分析" value="batch" />
                <el-option label="单条分析" value="single" />
              </el-select>
            </el-form-item>
            <el-form-item label="情感倾向">
              <el-select v-model="searchForm.sentiment" placeholder="请选择情感倾向" clearable style="width: 150px">
                <el-option label="正面" value="positive" />
                <el-option label="负面" value="negative" />
                <el-option label="中性" value="neutral" />
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
              <span>历史记录</span>
              <div class="header-actions">
                <el-button type="danger" size="small" @click="handleBatchDelete">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  批量删除
                </el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="loading" :data="historyList" @selection-change="handleSelectionChange" stripe
            style="width: 100%">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="记录ID" width="100" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="analysis_type" label="分析类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.analysis_type === 'batch' ? 'primary' : 'success'" size="small">
                  {{ row.analysis_type === 'batch' ? '批量分析' : '单条分析' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_count" label="评论数量" width="100" />
            <el-table-column prop="sentiment" label="主要情感" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.sentiment" :type="getSentimentTagType(row.sentiment)" size="small">
                  {{ getSentimentText(row.sentiment) }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="{ row }">
                <span v-if="row.confidence !== null">{{ (row.confidence * 100).toFixed(1) }}%</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="file_name" label="文件名" min-width="200">
              <template #default="{ row }">
                <span v-if="row.file_name" class="file-name">{{ row.file_name }}</span>
                <span v-else class="no-file">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" text @click="handleView(row)">
                  查看
                </el-button>
                <el-button v-if="row.status === 'failed'" type="warning" size="small" text @click="handleRetry(row)">
                  重试
                </el-button>
                <el-button type="danger" size="small" text @click="handleDelete(row)">
                  删除
                </el-button>
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
    <el-dialog v-model="viewDialogVisible" title="记录详情" width="700px" destroy-on-close>
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ currentRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentRecord.username }}</el-descriptions-item>
          <el-descriptions-item label="分析类型">
            <el-tag :type="currentRecord.analysis_type === 'batch' ? 'primary' : 'success'">
              {{ currentRecord.analysis_type === 'batch' ? '批量分析' : '单条分析' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评论数量">{{ currentRecord.total_count }}</el-descriptions-item>
          <el-descriptions-item label="主要情感">
            <el-tag v-if="currentRecord.sentiment" :type="getSentimentTagType(currentRecord.sentiment)">
              {{ getSentimentText(currentRecord.sentiment) }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="置信度">
            <span v-if="currentRecord.confidence">{{ (currentRecord.confidence * 100).toFixed(1) }}%</span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="文件名" :span="2">
            <span v-if="currentRecord.file_name">{{ currentRecord.file_name }}</span>
            <span v-else class="no-file">无文件</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDate(currentRecord.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.updated_at" label="更新时间" :span="2">
            {{ formatDate(currentRecord.updated_at) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.comment_text" label="评论内容" :span="2">
            <div class="comment-text">{{ currentRecord.comment_text }}</div>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.keywords" label="关键词" :span="2">
            <div class="keywords">
              <el-tag v-for="keyword in currentRecord.keywords" :key="keyword" size="small"
                style="margin-right: 8px;">{{
                  keyword }}</el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Calendar,
  CircleCheck,
  FolderOpened,
  Search,
  Refresh,
  Delete
} from '@element-plus/icons-vue'
import { Motion } from 'motion-v'
import type {
  HistoryRecord,
  HistoryQueryParams,
  HistoryListResponse
} from '@/types/components/admin'
import {
  getAnalysisHistory,
  getAnalysisDetail,
  deleteAnalysisRecord
} from '@/api/page_apis'
import type {
  HistoryRecord as ApiHistoryRecord,
  HistoryQueryParams as ApiHistoryQueryParams,
  HistoryResponse as ApiHistoryResponse,
  AnalysisDetailResponse as ApiAnalysisDetailResponse,
  AnalysisType
} from '@/types/apis/page_apis_T'

// 响应式数据
const loading = ref(false)
const historyList = ref<HistoryRecord[]>([])
const selectedRows = ref<HistoryRecord[]>([])
const viewDialogVisible = ref(false)
const currentRecord = ref<HistoryRecord | null>(null)
const dateRange = ref<[string, string] | null>(null)

// 统计数据
const stats = reactive({
  total_records: 0,
  today_records: 0,
  success_rate: 0,
  storage_used: '0条评论'
})

// 搜索表单
const searchForm = reactive<Omit<HistoryQueryParams, 'page' | 'page_size'>>({
  username: undefined,
  analysis_type: '',
  sentiment: '',
  start_date: '',
  end_date: ''
})



// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 计算统计数据
const calculateStats = async () => {
  try {
    // 获取所有记录用于统计（不分页）
    const allRecordsParams: ApiHistoryQueryParams = {
      page: 1,
      page_size: 9999, // 获取所有记录
      analysis_type: searchForm.analysis_type as AnalysisType,
      // @ts-ignore
      sentiment: searchForm.sentiment,
      start_date: searchForm.start_date || undefined,
      end_date: searchForm.end_date || undefined
    }

    if (dateRange.value) {
      allRecordsParams.startTime = dateRange.value[0]
      allRecordsParams.endTime = dateRange.value[1]
    }

    // @ts-ignore
    const allRecordsResponse: ApiHistoryResponse = await getAnalysisHistory(allRecordsParams)
    const allRecords = allRecordsResponse.data.records

    // 计算总记录数
    stats.total_records = allRecords.length

    // 计算今日记录数
    const today = new Date().toISOString().split('T')[0]
    stats.today_records = allRecords.filter((record: { created_at: string }) =>
      record.created_at.startsWith(today)
    ).length

    // 计算正面情感比例（替代成功率）
    const positiveRecords = allRecords.filter((record: { sentiment: string }) => record.sentiment === 'positive')
    stats.success_rate = allRecords.length > 0
      ? Math.round((positiveRecords.length / allRecords.length) * 100)
      : 0

    // 计算总评论数量（替代存储占用）
    const totalComments = allRecords.reduce((sum: number, record: { total_count: number }) => sum + (record.total_count || 0), 0)
    stats.storage_used = `${totalComments}条评论`

  } catch (error) {
    console.error('计算统计数据失败:', error)
    // 如果计算失败，保持默认值
    stats.total_records = 0
    stats.today_records = 0
    stats.success_rate = 0
    stats.storage_used = '0条评论'
  }
}

// 获取历史记录列表
const getHistoryList = async () => {
  loading.value = true
  try {
    const apiParams: ApiHistoryQueryParams = {
      page: pagination.current,
      page_size: pagination.pageSize,
      // @ts-ignore
      analysis_type: searchForm.analysis_type || undefined,
      // @ts-ignore
      sentiment: searchForm.sentiment || undefined,
      start_date: searchForm.start_date || undefined,
      end_date: searchForm.end_date || undefined
    }

    if (dateRange.value) {
      apiParams.startTime = dateRange.value[0]
      apiParams.endTime = dateRange.value[1]
    }

    // @ts-ignore
    const response: ApiHistoryResponse = await getAnalysisHistory(apiParams)

    // 将API数据转换为页面所需格式
    const transformedRecords: HistoryRecord[] = response.data.records.map((record: ApiHistoryRecord) => ({
      id: record.id,
      username: record.username || '',
      analysis_type: record.analysis_type,
      total_count: record.total_count || 0,
      sentiment: record.sentiment,
      confidence: record.confidence,
      file_name: record.file_name || '',
      created_at: record.created_at,
      updated_at: record.updated_at,
      positive_count: record.positive_count || 0,
      negative_count: record.negative_count || 0,
      neutral_count: record.neutral_count || 0,
      comment_text: record.comment_text,
      keywords: record.keywords,
      details: record.details || []
    }))

    historyList.value = transformedRecords
    pagination.total = response.data.total

    // 计算统计数据
    await calculateStats()
  } catch (error) {
    ElMessage.error('获取历史记录失败')
    console.error('获取历史记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getHistoryList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: undefined,
    analysis_type: '',
    sentiment: '',
    start_date: '',
    end_date: ''
  })
  dateRange.value = null
  pagination.current = 1
  getHistoryList()
}

// 查看详情
const handleView = async (row: HistoryRecord) => {
  try {
    // @ts-ignore
    const response: ApiAnalysisDetailResponse = await getAnalysisDetail(row.id)

    // @ts-ignore 将API数据转换为页面所需格式
    currentRecord.value = {
      ...row,
      ...response.data
    }
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 重试处理
const handleRetry = async (row: HistoryRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要重试这条记录吗？`,
      '确认重试',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用重试API
    ElMessage.success('重试请求已提交')
    getHistoryList()
  } catch (error) {
    // 用户取消重试
  }
}

// 删除单条记录
const handleDelete = async (row: HistoryRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteAnalysisRecord({ record_id: row.id })
    ElMessage.success('删除成功')
    getHistoryList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 循环调用单个删除接口
    let successCount = 0
    let failCount = 0

    for (const row of selectedRows.value) {
      try {
        await deleteAnalysisRecord({ record_id: row.id })
        successCount++
      } catch (error) {
        console.error(`删除记录 ${row.id} 失败:`, error)
        failCount++
      }
    }

    if (failCount === 0) {
      ElMessage.success(`批量删除成功，共删除 ${successCount} 条记录`)
    } else if (successCount === 0) {
      ElMessage.error(`批量删除失败，${failCount} 条记录删除失败`)
    } else {
      ElMessage.warning(`批量删除完成，成功 ${successCount} 条，失败 ${failCount} 条`)
    }

    selectedRows.value = []
    getHistoryList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}



// 表格选择变化
const handleSelectionChange = (selection: HistoryRecord[]) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  getHistoryList()
}

// 页码变化
const handlePageChange = (page: number) => {
  pagination.current = page
  getHistoryList()
}

// 获取情感标签类型
const getSentimentTagType = (sentiment: string) => {
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



// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  getHistoryList()
})
</script>

<style scoped>
.history-manage-container {
  padding: 20px;
}

.history-overview {
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

.overview-card.today {
  border-left: 4px solid #409eff;
}

.overview-card.success {
  border-left: 4px solid #67c23a;
}

.overview-card.storage {
  border-left: 4px solid #e6a23c;
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
  color: #409eff;
}

.today .card-icon {
  color: #409eff;
}

.success .card-icon {
  color: #67c23a;
}

.storage .card-icon {
  color: #e6a23c;
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

.file-name {
  color: #409eff;
  cursor: pointer;
}

.no-file {
  color: #999;
  font-style: italic;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.detail-content {
  padding: 20px 0;
}

.comment-text {
  max-height: 120px;
  overflow-y: auto;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  line-height: 1.5;
  word-break: break-word;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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