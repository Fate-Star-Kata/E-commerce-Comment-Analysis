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
            <el-form-item label="数据来源">
              <el-select v-model="searchForm.source" placeholder="请选择数据来源" clearable style="width: 150px">
                <el-option label="文件上传" value="file" />
                <el-option label="API接口" value="api" />
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
            <el-table-column prop="content" label="评论内容" min-width="300">
              <template #default="{ row }">
                <div class="content-cell">
                  {{ row.content }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sentiment" label="情感分析" width="120">
              <template #default="{ row }">
                <el-tag :type="getSentimentTagType(row.sentiment)" size="small">
                  {{ getSentimentText(row.sentiment) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="{ row }">
                <el-progress :percentage="Math.round(row.confidence * 100)" :stroke-width="6" :show-text="false" />
                <span class="confidence-text">{{ Math.round(row.confidence * 100) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="数据来源" width="100">
              <template #default="{ row }">
                <el-tag :type="row.source === 'file' ? 'success' : 'info'" size="small">
                  {{ row.source === 'file' ? '文件' : 'API' }}
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
                <el-button type="primary" size="small" text @click="handleView(row)">
                  查看
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
    <el-dialog v-model="viewDialogVisible" title="数据详情" width="600px" destroy-on-close>
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ currentRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="评论内容">
            <div class="content-detail">{{ currentRecord.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="情感分析">
            <el-tag :type="getSentimentTagType(currentRecord.sentiment)">
              {{ getSentimentText(currentRecord.sentiment) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="置信度">
            <el-progress :percentage="Math.round(currentRecord.confidence * 100)" :stroke-width="8" />
          </el-descriptions-item>
          <el-descriptions-item label="数据来源">
            <el-tag :type="currentRecord.source === 'file' ? 'success' : 'info'">
              {{ currentRecord.source === 'file' ? '文件上传' : 'API接口' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentRecord.created_at) }}
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
  CircleCheck,
  CircleClose,
  Remove,
  Search,
  Refresh,
  Download,
  Delete
} from '@element-plus/icons-vue'
import { Motion } from 'motion-v'
import type {
  DataRecord,
  DataQueryParams,
  DataListResponse
} from '@/types/components/admin'

// 响应式数据
const loading = ref(false)
const dataList = ref<DataRecord[]>([])
const selectedRows = ref<DataRecord[]>([])
const viewDialogVisible = ref(false)
const currentRecord = ref<DataRecord | null>(null)
const dateRange = ref<[string, string] | null>(null)

// 统计数据
const stats = reactive({
  total_count: 0,
  positive_count: 0,
  negative_count: 0,
  neutral_count: 0
})

// 搜索表单
const searchForm = reactive<Omit<DataQueryParams, 'page' | 'page_size'>>({
  query: '',
  sentiment: '',
  source: '',
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
const getDataList = async () => {
  loading.value = true
  try {
    const params: DataQueryParams = {
      ...searchForm,
      page: pagination.current,
      page_size: pagination.pageSize
    }

    if (dateRange.value) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    // TODO: 替换为实际的API调用
    const response: DataListResponse = {
      code: 200,
      data: {
        records: [],
        total: 0,
        stats: {
          total_count: 0,
          positive_count: 0,
          negative_count: 0,
          neutral_count: 0
        }
      }
    }

    dataList.value = response.data.records
    pagination.total = response.data.total
    Object.assign(stats, response.data.stats)
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getDataList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    query: '',
    sentiment: '',
    source: '',
    start_date: '',
    end_date: ''
  })
  dateRange.value = null
  pagination.current = 1
  getDataList()
}

// 查看详情
const handleView = (row: DataRecord) => {
  currentRecord.value = row
  viewDialogVisible.value = true
}

// 删除单条记录
const handleDelete = async (row: DataRecord) => {
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

    // TODO: 调用删除API
    ElMessage.success('删除成功')
    getDataList()
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

    // TODO: 调用批量删除API
    ElMessage.success('批量删除成功')
    getDataList()
  } catch (error) {
    // 用户取消删除
  }
}

// 导出数据
const handleExport = () => {
  // TODO: 实现数据导出功能
  ElMessage.info('导出功能开发中')
}

// 表格选择变化
const handleSelectionChange = (selection: DataRecord[]) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  getDataList()
}

// 页码变化
const handlePageChange = (page: number) => {
  pagination.current = page
  getDataList()
}

// 获取情感标签类型
const getSentimentTagType = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'success'
    case 'negative':
      return 'danger'
    case 'neutral':
      return 'info'
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
  getDataList()
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
  color: #666;
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