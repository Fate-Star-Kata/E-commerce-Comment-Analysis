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
import StatsOverview from '@/components/pages/user/history/StatsOverview.vue'
import FilterSearch from '@/components/pages/user/history/FilterSearch.vue'
import RecordsTable from '@/components/pages/user/history/RecordsTable.vue'
import DetailModal from '@/components/pages/user/history/DetailModal.vue'
import Pagination from '@/components/pages/user/history/Pagination.vue'
import type { HistoryStats, HistoryRecord } from '@/types/components'

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
const filterType = ref('')
const filterSentiment = ref('')
const filterTime = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRecord = ref<HistoryRecord | null>(null)

// 统计数据
const statistics = ref({
    totalAnalyses: 0,
    monthlyAnalyses: 0,
    monthlyGrowth: 0,
    averageAccuracy: 0,
    lastActive: ''
})

// 分析记录数据
const records = ref<HistoryRecord[]>([
    {
        id: '1',
        type: 'single',
        content: '这个产品质量很好，物流也很快，非常满意！',
        sentiment: 'positive',
        confidence: 0.92,
        timestamp: new Date('2024-01-15 14:30:00'),
        resultCount: 1
    },
    {
        id: '2',
        type: 'batch',
        content: '批量分析了500条商品评论',
        sentiment: 'positive',
        confidence: 0.85,
        timestamp: new Date('2024-01-14 10:15:00'),
        resultCount: 500
    },
    {
        id: '3',
        type: 'single',
        content: '产品质量太差了，完全不值这个价格，很失望。',
        sentiment: 'negative',
        confidence: 0.88,
        timestamp: new Date('2024-01-13 16:45:00'),
        resultCount: 1
    },
    {
        id: '4',
        type: 'batch',
        content: '批量分析了200条用户反馈',
        sentiment: 'neutral',
        confidence: 0.72,
        timestamp: new Date('2024-01-12 09:20:00'),
        resultCount: 200
    },
    {
        id: '5',
        type: 'single',
        content: '产品还可以，价格合理，符合预期。',
        sentiment: 'neutral',
        confidence: 0.75,
        timestamp: new Date('2024-01-11 13:10:00'),
        resultCount: 1
    }
])

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
        timestamp: record.timestamp.toISOString(),
        type: record.type,
        content: record.content,
        sentiment: record.sentiment,
        confidence: record.confidence,
        dataCount: record.resultCount || 1,
        result: record
    }))
})

// 为DetailModal转换selectedRecord
const selectedRecordForModal = computed(() => {
    if (!selectedRecord.value) return null
    return {
        id: selectedRecord.value.id,
        timestamp: selectedRecord.value.timestamp.toISOString(),
        type: selectedRecord.value.type,
        content: selectedRecord.value.content,
        sentiment: selectedRecord.value.sentiment,
        confidence: selectedRecord.value.confidence,
        dataCount: selectedRecord.value.resultCount || 1,
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
}

const viewRecord = (record: AnalysisRecord) => {
    // 从AnalysisRecord中获取原始的HistoryRecord
    selectedRecord.value = record.result as HistoryRecord
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
    const originalRecord = record.result as HistoryRecord
    
    // 模拟下载功能
    const data = {
        id: originalRecord.id,
        type: originalRecord.type,
        content: originalRecord.content,
        sentiment: originalRecord.sentiment,
        confidence: originalRecord.confidence,
        timestamp: originalRecord.timestamp,
        resultCount: originalRecord.resultCount
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

const deleteRecord = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
        const index = records.value.findIndex(r => r.id === id)
        if (index > -1) {
            records.value.splice(index, 1)
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
        数据量: record.resultCount || 1
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

// 生命周期
onMounted(() => {
    // 可以在这里加载真实的历史记录数据
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
