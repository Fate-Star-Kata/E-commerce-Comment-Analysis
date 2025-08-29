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
                <div class="card-title">成功率</div>
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
                <div class="card-title">存储占用</div>
                <div class="card-value">{{ stats.storage_used || '0MB' }}</div>
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
            <el-form-item label="用户ID">
              <el-input v-model="searchForm.user_id" placeholder="请输入用户ID" clearable style="width: 150px" />
            </el-form-item>
            <el-form-item label="分析类型">
              <el-select v-model="searchForm.analysis_type" placeholder="请选择分析类型" clearable style="width: 150px">
                <el-option label="批量分析" value="batch" />
                <el-option label="单条分析" value="single" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理状态">
              <el-select v-model="searchForm.status" placeholder="请选择处理状态" clearable style="width: 150px">
                <el-option label="成功" value="success" />
                <el-option label="失败" value="failed" />
                <el-option label="处理中" value="processing" />
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
                <el-button type="primary" size="small" @click="handleExport">
                  <el-icon>
                    <Download />
                  </el-icon>
                  导出记录
                </el-button>
                <el-button type="danger" size="small" @click="handleBatchDelete">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  批量删除
                </el-button>
                <el-button type="warning" size="small" @click="handleCleanup">
                  <el-icon>
                    <Brush />
                  </el-icon>
                  清理记录
                </el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="loading" :data="historyList" @selection-change="handleSelectionChange" stripe
            style="width: 100%">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="记录ID" width="100" />
            <el-table-column prop="user_id" label="用户ID" width="100" />
            <el-table-column prop="analysis_type" label="分析类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.analysis_type === 'batch' ? 'primary' : 'success'" size="small">
                  {{ row.analysis_type === 'batch' ? '批量分析' : '单条分析' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="comment_count" label="评论数量" width="100" />
            <el-table-column prop="processing_time" label="处理时长" width="120">
              <template #default="{ row }">
                {{ formatProcessingTime(row.processing_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="处理状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
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
          <el-descriptions-item label="用户ID">{{ currentRecord.user_id }}</el-descriptions-item>
          <el-descriptions-item label="分析类型">
            <el-tag :type="currentRecord.analysis_type === 'batch' ? 'primary' : 'success'">
              {{ currentRecord.analysis_type === 'batch' ? '批量分析' : '单条分析' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评论数量">{{ currentRecord.comment_count }}</el-descriptions-item>
          <el-descriptions-item label="处理时长">
            {{ formatProcessingTime(currentRecord.processing_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTagType(currentRecord.status)">
              {{ getStatusText(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文件名" :span="2">
            <span v-if="currentRecord.file_name">{{ currentRecord.file_name }}</span>
            <span v-else class="no-file">无文件</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDate(currentRecord.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.error_message" label="错误信息" :span="2">
            <div class="error-message">{{ currentRecord.error_message }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 清理记录对话框 -->
    <el-dialog v-model="cleanupDialogVisible" title="清理历史记录" width="500px">
      <el-form :model="cleanupForm" label-width="120px">
        <el-form-item label="清理规则">
          <el-radio-group v-model="cleanupForm.type">
            <el-radio label="days">按天数清理</el-radio>
            <el-radio label="count">按数量清理</el-radio>
            <el-radio label="status">按状态清理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="cleanupForm.type === 'days'" label="保留天数">
          <el-input-number v-model="cleanupForm.days" :min="1" :max="365" placeholder="请输入保留天数" />
        </el-form-item>
        <el-form-item v-if="cleanupForm.type === 'count'" label="保留数量">
          <el-input-number v-model="cleanupForm.count" :min="1" :max="10000" placeholder="请输入保留数量" />
        </el-form-item>
        <el-form-item v-if="cleanupForm.type === 'status'" label="清理状态">
          <el-select v-model="cleanupForm.status" placeholder="请选择要清理的状态">
            <el-option label="失败记录" value="failed" />
            <el-option label="成功记录" value="success" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cleanupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCleanup">确认清理</el-button>
      </template>
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
  Download,
  Delete,
  Brush
} from '@element-plus/icons-vue'
import { Motion } from 'motion-v'
import type {
  HistoryRecord,
  HistoryQueryParams,
  HistoryListResponse
} from '@/types/components/admin'

// 响应式数据
const loading = ref(false)
const historyList = ref<HistoryRecord[]>([])
const selectedRows = ref<HistoryRecord[]>([])
const viewDialogVisible = ref(false)
const cleanupDialogVisible = ref(false)
const currentRecord = ref<HistoryRecord | null>(null)
const dateRange = ref<[string, string] | null>(null)

// 统计数据
const stats = reactive({
  total_records: 0,
  today_records: 0,
  success_rate: 0,
  storage_used: '0MB'
})

// 搜索表单
const searchForm = reactive<Omit<HistoryQueryParams, 'page' | 'page_size'>>({
  user_id: undefined,
  analysis_type: '',
  status: '',
  start_date: '',
  end_date: ''
})

// 清理表单
const cleanupForm = reactive({
  type: 'days',
  days: 30,
  count: 1000,
  status: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 获取历史记录列表
const getHistoryList = async () => {
  loading.value = true
  try {
    const params: HistoryQueryParams = {
      ...searchForm,
      page: pagination.current,
      page_size: pagination.pageSize
    }

    if (dateRange.value) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    // TODO: 替换为实际的API调用
    const response: HistoryListResponse = {
      code: 200,
      data: {
        records: [],
        total: 0,
        stats: {
          total_records: 0,
          today_records: 0,
          success_rate: 0,
          storage_used: '0MB'
        }
      }
    }

    historyList.value = response.data.records
    pagination.total = response.data.total
    Object.assign(stats, response.data.stats)
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
    user_id: undefined,
    analysis_type: '',
    status: '',
    start_date: '',
    end_date: ''
  })
  dateRange.value = null
  pagination.current = 1
  getHistoryList()
}

// 查看详情
const handleView = (row: HistoryRecord) => {
  currentRecord.value = row
  viewDialogVisible.value = true
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

    // TODO: 调用删除API
    ElMessage.success('删除成功')
    getHistoryList()
  } catch (error) {
    // 用户取消删除
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

    // TODO: 调用批量删除API
    ElMessage.success('批量删除成功')
    getHistoryList()
  } catch (error) {
    // 用户取消删除
  }
}

// 导出记录
const handleExport = () => {
  // TODO: 实现记录导出功能
  ElMessage.info('导出功能开发中')
}

// 清理记录
const handleCleanup = () => {
  cleanupDialogVisible.value = true
}

// 确认清理
const confirmCleanup = async () => {
  try {
    let message = ''
    switch (cleanupForm.type) {
      case 'days':
        message = `确定要清理 ${cleanupForm.days} 天前的记录吗？`
        break
      case 'count':
        message = `确定要只保留最新的 ${cleanupForm.count} 条记录吗？`
        break
      case 'status':
        message = `确定要清理所有${cleanupForm.status === 'failed' ? '失败' : '成功'}的记录吗？`
        break
    }

    await ElMessageBox.confirm(message, '确认清理', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用清理API
    ElMessage.success('清理完成')
    cleanupDialogVisible.value = false
    getHistoryList()
  } catch (error) {
    // 用户取消清理
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

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'processing':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return '成功'
    case 'failed':
      return '失败'
    case 'processing':
      return '处理中'
    default:
      return '未知'
  }
}

// 格式化处理时长
const formatProcessingTime = (time: number) => {
  if (time < 60) {
    return `${time}秒`
  } else if (time < 3600) {
    return `${Math.floor(time / 60)}分${time % 60}秒`
  } else {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    return `${hours}时${minutes}分`
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

.error-message {
  color: #f56c6c;
  background: #fef0f0;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 4px solid #f56c6c;
  font-family: monospace;
  white-space: pre-wrap;
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