<template>
    <div class="min-h-screen bg-base-100 p-6">
        <div class="container mx-auto max-w-6xl">
            <!-- 页面标题 -->
            <div class="hero bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mb-8">
                <div class="hero-content text-center">
                    <div class="max-w-md">
                        <h1 class="text-4xl font-bold">📚 历史记录</h1>
                        <p class="py-6">查看您的情感分析历史记录和统计数据</p>
                    </div>
                </div>
            </div>

            <!-- 统计概览组件 -->
            <StatsOverview 
                class="mb-6"
                :stats="statistics"
            />

            <!-- 筛选和搜索组件 -->
            <FilterSearch 
                class="mb-6"
                v-model:searchQuery="searchQuery"
                v-model:typeFilter="filterType"
                v-model:sentimentFilter="filterSentiment"
                v-model:timeFilter="filterTime"
                @reset="resetFilters"
            />

            <!-- 记录表格组件 -->
            <RecordsTable 
                class="mb-6"
                :records="paginatedRecords"
                @view="viewRecord"
                @download="downloadRecord"
                @delete="deleteRecord"
                @export="exportRecords"
                @clearAll="clearAllRecords"
            />
            
            <!-- 分页组件 -->
            <Pagination 
                v-model:currentPage="currentPage"
                :totalPages="totalPages"
                :filteredRecords="filteredRecords"
                class="mt-6"
            />
        </div>
    </div>

    <!-- 详情模态框组件 -->
    <DetailModal 
        v-if="selectedRecord"
        :record="selectedRecordForModal"
        :isOpen="!!selectedRecord"
        @close="closeDetailModal"
        @download="downloadRecordFromModal"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StatsOverview from '@/components/pages/user/history/StatsOverview.vue'
import FilterSearch from '@/components/pages/user/history/FilterSearch.vue'
import RecordsTable from '@/components/pages/user/history/RecordsTable.vue'
import DetailModal from '@/components/pages/user/history/DetailModal.vue'
import Pagination from '@/components/pages/user/history/Pagination.vue'
import type { HistoryStats } from '@/types/components'
import type { HistoryRecord as ApiHistoryRecord } from '@/types/apis/page_apis_T'
import { getAnalysisHistory, getAnalysisDetail, deleteAnalysisRecord } from '@/api/page_apis'
import type { HistoryQueryParams, HistoryResponse, AnalysisDetailResponse, DeleteAnalysisRequest } from '@/api/page_apis'

// AnalysisRecord接口定义（与DetailModal组件保持一致）
interface AnalysisRecord {
  id: string
  timestamp: string
  type: 'single' | 'batch'
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  dataCount: number
  result?: {
    fileName?: string
    fileSize?: string
    processingTime?: string
    analysisTime?: string
    positiveCount?: number
    negativeCount?: number
    neutralCount?: number
  }
}

// 路由
const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const filterType = ref<'' | 'single' | 'batch'>('')
const filterSentiment = ref<'' | 'positive' | 'negative' | 'neutral'>('')
const filterTime = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRecord = ref<AnalysisRecord | null>(null)

// 统计数据
const statistics = ref({
    totalAnalyses: 0,
    monthlyAnalyses: 0,
    monthlyGrowth: 0,
    averageAccuracy: 0,
    lastActive: ''
})

// 分析记录数据
const records = ref<AnalysisRecord[]>([])
const isLoading = ref(false)
const totalRecords = ref(0)

// 计算属性
const filteredRecords = computed(() => {
    let filtered = records.value

    // 搜索筛选
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(record =>
            record.content.toLowerCase().includes(query)
        )
    }

    // 类型筛选
    if (filterType.value) {
        filtered = filtered.filter(record => record.type === filterType.value)
    }

    // 情感筛选
    if (filterSentiment.value) {
        filtered = filtered.filter(record => record.sentiment === filterSentiment.value)
    }

    // 时间筛选
    if (filterTime.value) {
        const now = new Date()

        filtered = filtered.filter(record => {
            const recordDate = new Date(record.timestamp)

            switch (filterTime.value) {
                case 'today':
                    return recordDate.toDateString() === now.toDateString()
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    return recordDate >= weekAgo
                case 'month':
                    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
                case 'quarter':
                    const quarter = Math.floor(now.getMonth() / 3)
                    const recordQuarter = Math.floor(recordDate.getMonth() / 3)
                    return recordQuarter === quarter && recordDate.getFullYear() === now.getFullYear()
                default:
                    return true
            }
        })
    }

    // 按时间倒序排列
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

// 转换为AnalysisRecord格式的数据
const analysisRecords = computed(() => {
    return filteredRecords.value.map(record => ({
        id: record.id,
        timestamp: record.timestamp,
        type: record.type,
        content: record.content,
        sentiment: record.sentiment,
        confidence: record.confidence,
        dataCount: record.dataCount || 1,
        result: record
    }))
})

// 为DetailModal转换selectedRecord
const selectedRecordForModal = computed(() => {
    if (!selectedRecord.value) return null
    return {
        id: selectedRecord.value.id,
        timestamp: selectedRecord.value.timestamp,
        type: selectedRecord.value.type,
        content: selectedRecord.value.content,
        sentiment: selectedRecord.value.sentiment,
        confidence: selectedRecord.value.confidence,
        dataCount: selectedRecord.value.dataCount || 1,
        result: {
            fileName: undefined,
            fileSize: undefined,
            processingTime: undefined,
            analysisTime: undefined,
            positiveCount: undefined,
            negativeCount: undefined,
            neutralCount: undefined
        }
    }
})

const totalPages = computed(() => {
    return Math.ceil(analysisRecords.value.length / pageSize.value)
})

const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return analysisRecords.value.slice(start, end)
})

// 方法
const getSentimentLabel = (sentiment: string) => {
    const labels = {
        positive: '正面',
        negative: '负面',
        neutral: '中性'
    }
    return labels[sentiment as keyof typeof labels] || sentiment
}

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN')
}

const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN')
}

const resetFilters = () => {
    searchQuery.value = ''
    filterType.value = ''
    filterSentiment.value = ''
    filterTime.value = ''
    currentPage.value = 1
    loadHistoryRecords()
}

// 监听筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadHistoryRecords()
}

// 监听页码变化
const handlePageChange = () => {
  loadHistoryRecords()
}

const viewRecord = (record: AnalysisRecord) => {
    // 从AnalysisRecord中获取原始记录
    selectedRecord.value = record
}

// 关闭详情模态框
const closeDetailModal = () => {
    selectedRecord.value = null
}

// 从DetailModal下载记录
const downloadRecordFromModal = (record: AnalysisRecord | null) => {
    if (record && record.result) {
        downloadRecord(record)
    }
}

const downloadRecord = (record: AnalysisRecord) => {
    // 从AnalysisRecord中获取原始的HistoryRecord
    const originalRecord = record
    
    // 模拟下载功能
    const data = {
        id: originalRecord.id,
        type: originalRecord.type,
        content: originalRecord.content,
        sentiment: originalRecord.sentiment,
        confidence: originalRecord.confidence,
        timestamp: originalRecord.timestamp,
        dataCount: originalRecord.dataCount
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis_result_${originalRecord.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    closeDetailModal()
}

const deleteRecord = async (id: string) => {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      const request: DeleteAnalysisRequest = {
        record_id: parseInt(id)
      }
      
      const response = await deleteAnalysisRecord(request)
      
      if (response.code === 200) {
        // 删除成功，重新加载数据
        await loadHistoryRecords()
      } else {
        ElMessage.error('删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const exportRecords = () => {
    const data = filteredRecords.value.map(record => ({
        时间: new Date(record.timestamp).toLocaleString(),
        类型: record.type === 'single' ? '单条分析' : '批量分析',
        内容: record.content,
        情感倾向: record.sentiment === 'positive' ? '正面' : record.sentiment === 'negative' ? '负面' : '中性',
        置信度: `${(record.confidence * 100).toFixed(1)}%`,
        数据量: record.dataCount || 1
    }))

    const csv = [Object.keys(data[0]).join(',')]
        .concat(data.map(row => Object.values(row).join(',')))
        .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis_records_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

const clearAllRecords = () => {
    if (confirm('确定要清空所有记录吗？此操作不可恢复！')) {
        records.value = []
        currentPage.value = 1
    }
}

// 加载历史记录数据
const loadHistoryRecords = async () => {
  isLoading.value = true
  try {
    const params: HistoryQueryParams = {
      page: currentPage.value,
      page_size: pageSize.value,
      analysis_type: filterType.value || undefined,
      sentiment: filterSentiment.value || undefined
    }
    
    const response = await getAnalysisHistory(params)
    
    if (response.code === 200 && response.data) {
      const data: HistoryResponse = response.data
      
      // 转换API响应为组件需要的格式
      records.value = data.records.map(record => ({
        id: record.id.toString(),
        timestamp: record.created_at,
        type: record.analysis_type,
        content: record.analysis_type === 'single' ? record.comment_text || '' : `批量分析了${record.total_count}条评论`,
        sentiment: record.sentiment || 'neutral',
        confidence: record.confidence || 0,
        dataCount: record.total_count
      }))
      
      totalRecords.value = data.total
      
      // 更新统计数据
      statistics.value = {
        totalAnalyses: data.total,
        monthlyAnalyses: data.total, // 这里可以根据需要计算月度数据
        monthlyGrowth: 0, // 这里可以根据需要计算增长率
        averageAccuracy: 0.85, // 这里可以根据需要计算平均准确率
        lastActive: data.records.length > 0 ? new Date(data.records[0].created_at).toLocaleDateString() : ''
      }
    }
  } catch (error) {
    ElMessage.error('加载历史记录失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadHistoryRecords()
})
</script>

<style scoped>
/* 历史记录页面样式 */
.table th {
    @apply bg-base-300;
}

.modal-box {
    @apply max-h-[90vh] overflow-y-auto;
}
</style>
