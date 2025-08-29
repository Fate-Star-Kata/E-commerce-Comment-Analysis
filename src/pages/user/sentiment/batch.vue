<template>
  <div class="min-h-screen bg-base-200 p-6">
    <div class="container mx-auto max-w-6xl">
      <!-- 页面标题 -->
      <div class="hero bg-base-100 rounded-box mb-8">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-4xl font-bold">📊 批量情感分析</h1>
            <p class="py-6">上传评论数据文件，批量分析情感倾向</p>
          </div>
        </div>
      </div>

      <!-- 步骤指示器组件 -->
      <StepIndicator :currentStep="currentStep" />

      <!-- 步骤1: 文件上传组件 -->
      <FileUpload
        v-if="currentStep === 1"
        v-model:selectedFile="selectedFile"
        v-model:columnMapping="columnMapping"
        @next="handlePreviewData"
      />

      <!-- 步骤2: 数据预览组件 -->
      <DataPreview
        v-if="currentStep === 2"
        :previewData="previewData"
        :columnMapping="columnMapping"
        @back="currentStep = 1"
        @next="startAnalysis"
      />

      <!-- 步骤3: 分析处理组件 -->
      <AnalysisProgress
        v-if="currentStep === 3"
        :progress="analysisProgress"
        :stats="analysisStats"
        :logs="analysisLogs"
        :isAnalyzing="true"
        :isCompleted="false"
        :hasError="false"
        @back="currentStep = 2"
        @next="currentStep = 4"
      />

      <!-- 步骤4: 结果展示组件 -->
      <ResultsDisplay
        v-if="currentStep === 4"
        :results="analysisResults.map(r => ({ ...r, content: r.comment }))"
        :sentimentFilter="resultFilter"
        :confidenceFilter="''"
        :currentPage="currentPage"
        :pageSize="pageSize"
        @update:sentimentFilter="resultFilter = $event"
        @update:confidenceFilter="() => {}"
        @update:currentPage="currentPage = $event"
        @download="downloadResults"
        @save="saveToHistory"
        @reset="resetAnalysis"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StepIndicator from '@/components/pages/user/sentiment/StepIndicator.vue'
import FileUpload from '@/components/pages/user/sentiment/FileUpload.vue'
import DataPreview from '@/components/pages/user/sentiment/DataPreview.vue'
import AnalysisProgress from '@/components/pages/user/sentiment/AnalysisProgress.vue'
import ResultsDisplay from '@/components/pages/user/sentiment/ResultsDisplay.vue'
import type {
  ColumnMapping,
  PreviewItem,
  AnalysisStats,
  AnalysisLog,
  BatchAnalysisResult,
  AnalysisProgress as BatchAnalysisProgress
} from '@/types/components'

// 当前步骤
const currentStep = ref(1)

// 文件相关
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

// 列映射配置
const columnMapping = ref<ColumnMapping>({
  content: '',
  productId: ''
})

// 预览数据
const previewData = ref<PreviewItem[]>([])

// 分析进度
const analysisProgress = ref<BatchAnalysisProgress>({
  current: 0,
  total: 0
})

// 分析统计
const analysisStats = ref<AnalysisStats>({
  positive: 0,
  negative: 0,
  neutral: 0
})

// 分析日志
const analysisLogs = ref<{ timestamp: Date; type: 'info' | 'success' | 'warning' | 'error'; message: string }[]>([])

// 分析结果
const analysisResults = ref<BatchAnalysisResult[]>([])

// 结果筛选
const resultFilter = ref('all')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 重试分析
const retryAnalysis = () => {
  startAnalysis()
}

// 停止分析
const stopAnalysis = () => {
  // 模拟停止分析
  currentStep.value = 2
}

// 文件处理方法
const removeFile = () => {
  selectedFile.value = null
  columnMapping.value = { content: '', productId: '' }
  previewData.value = []
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 预览数据处理
const handlePreviewData = async () => {
  if (!selectedFile.value || !columnMapping.value.content) return
  
  try {
    // 模拟文件解析
    const mockData: PreviewItem[] = [
      { content: '这个产品真的很好用，推荐给大家！', productId: 'P001' },
      { content: '质量一般，价格偏贵', productId: 'P002' },
      { content: '还可以吧，没有特别惊喜', productId: 'P003' },
      { content: '非常满意，会再次购买', productId: 'P001' },
      { content: '包装很精美，产品质量也不错', productId: 'P004' },
      { content: '发货速度很快，服务态度也很好', productId: 'P005' },
      { content: '产品有瑕疵，不太满意', productId: 'P006' },
      { content: '性价比很高，值得购买', productId: 'P007' }
    ]
    
    previewData.value = mockData
    currentStep.value = 2
  } catch (error) {
    console.error('文件解析失败:', error)
  }
}

// 开始分析
const startAnalysis = async () => {
  currentStep.value = 3
  analysisProgress.value.current = 0
  analysisProgress.value.total = previewData.value.length
  analysisStats.value = { positive: 0, negative: 0, neutral: 0 }
  analysisLogs.value = []
  analysisResults.value = []
  
  // 模拟分析过程
  for (let i = 0; i < previewData.value.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟处理时间
    
    const item = previewData.value[i]
    const sentiment = Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'negative' : 'neutral'
    const confidence = 0.7 + Math.random() * 0.3
    
    const result: BatchAnalysisResult = {
      comment: item.content,
      productId: item.productId,
      sentiment,
      confidence
    }
    
    analysisResults.value.push(result)
    analysisStats.value[sentiment as keyof typeof analysisStats.value]++
    analysisProgress.value.current = i + 1
    analysisProgress.value.total = previewData.value.length
    
    const log = {
      timestamp: new Date(),
      message: `分析完成: ${result.comment.substring(0, 20)}...`,
      type: 'info' as const
    }
    analysisLogs.value.push(log)
  }
  
  // 分析完成后自动跳转到结果页
  setTimeout(() => {
    currentStep.value = 4
  }, 1000)
}

// 结果操作方法
const downloadResults = (result?: BatchAnalysisResult) => {
  // 创建CSV内容
  const headers = ['评论内容', '情感倾向', '置信度']
  if (columnMapping.value.productId) {
    headers.push('商品ID')
  }
  
  const csvContent = [
    headers.join(','),
    ...analysisResults.value.map(result => {
      const row = [
        `"${result.comment.replace(/"/g, '""')}"`,
        result.sentiment,
        (result.confidence * 100).toFixed(1) + '%'
      ]
      if (columnMapping.value.productId) {
        row.push(result.productId || '')
      }
      return row.join(',')
    })
  ].join('\n')
  
  // 下载文件
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `sentiment_analysis_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const saveToHistory = () => {
  // 保存到历史记录
  console.log('保存到历史记录')
}

const resetAnalysis = () => {
  currentStep.value = 1
  selectedFile.value = null
  columnMapping.value = { content: '', productId: '' }
  previewData.value = []
  analysisResults.value = []
  analysisProgress.value.current = 0
  analysisProgress.value.total = 0
  analysisStats.value = { positive: 0, negative: 0, neutral: 0 }
  analysisLogs.value = []
  resultFilter.value = 'all'
  currentPage.value = 1
}
</script>

<style scoped>
/* 批量分析页面样式 */
.steps .step {
  @apply text-base-content/50;
}

.steps .step-primary {
  @apply text-primary;
}
</style>
