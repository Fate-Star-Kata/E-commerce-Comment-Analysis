<template>
  <div 
    v-if="isOpen" 
    class="modal modal-open"
    @click="handleBackdropClick"
  >
    <div class="modal-box max-w-4xl" @click.stop>
      <h3 class="font-bold text-lg mb-4">分析详情</h3>
      
      <div v-if="record" class="space-y-6">
        <!-- 基本信息 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">基本信息</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div class="text-sm text-gray-500">分析时间</div>
                <div class="font-medium">{{ formatDateTime(record.timestamp) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">分析类型</div>
                <div class="badge" :class="record.type === 'single' ? 'badge-primary' : 'badge-secondary'">
                  {{ record.type === 'single' ? '单条分析' : '批量分析' }}
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500">数据量</div>
                <div class="font-medium">{{ record.dataCount }} 条</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">整体倾向</div>
                <div class="badge" :class="getSentimentClass(record.sentiment)">
                  {{ getSentimentLabel(record.sentiment) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 单条分析详情 -->
        <div v-if="record.type === 'single'" class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">分析详情</h4>
            <div class="space-y-4">
              <div>
                <div class="text-sm text-gray-500 mb-2">评论内容</div>
                <div class="p-3 bg-base-100 rounded border">
                  {{ record.content }}
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div class="text-sm text-gray-500">情感倾向</div>
                  <div class="badge badge-lg" :class="getSentimentClass(record.sentiment)">
                    {{ getSentimentLabel(record.sentiment) }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">置信度</div>
                  <div class="font-medium text-lg">{{ (record.confidence * 100).toFixed(1) }}%</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">分析时长</div>
                  <div class="font-medium">{{ record.result?.analysisTime || '0.5s' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 批量分析详情 -->
        <div v-if="record.type === 'batch'" class="space-y-4">
          <!-- 文件信息 -->
          <div class="card bg-base-200">
            <div class="card-body">
              <h4 class="card-title text-base">文件信息</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div class="text-sm text-gray-500">文件名</div>
                  <div class="font-medium">{{ record.result?.fileName || '批量数据.xlsx' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">文件大小</div>
                  <div class="font-medium">{{ record.result?.fileSize || '2.5 MB' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">处理时长</div>
                  <div class="font-medium">{{ record.result?.processingTime || '15.2s' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="card bg-base-200">
            <div class="card-body">
              <h4 class="card-title text-base">分析统计</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div class="text-sm text-gray-500">总数据量</div>
                  <div class="font-medium text-lg">{{ record.dataCount }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">正面评论</div>
                  <div class="font-medium text-lg text-success">
                    {{ record.result?.positiveCount || Math.floor(record.dataCount * 0.6) }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">负面评论</div>
                  <div class="font-medium text-lg text-error">
                    {{ record.result?.negativeCount || Math.floor(record.dataCount * 0.25) }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">中性评论</div>
                  <div class="font-medium text-lg text-warning">
                    {{ record.result?.neutralCount || Math.floor(record.dataCount * 0.15) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模态框底部操作 -->
      <div class="modal-action">
        <button class="btn btn-outline" @click="$emit('close')">
          关闭
        </button>
        <button class="btn btn-primary" @click="$emit('download', record)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          下载结果
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

defineProps<{
  isOpen: boolean
  record: AnalysisRecord | null
}>()

defineEmits<{
  'close': []
  'download': [record: AnalysisRecord | null]
}>()

// 处理背景点击
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const emit = defineEmits<{
  'close': []
  'download': [record: AnalysisRecord | null]
}>()

// 获取情感标签
const getSentimentLabel = (sentiment: string) => {
  const labels = {
    positive: '正面',
    negative: '负面',
    neutral: '中性'
  }
  return labels[sentiment as keyof typeof labels] || sentiment
}

// 获取情感样式类
const getSentimentClass = (sentiment: string) => {
  const classes = {
    positive: 'badge-success',
    negative: 'badge-error',
    neutral: 'badge-warning'
  }
  return classes[sentiment as keyof typeof classes] || ''
}

// 格式化日期时间
const formatDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}
</script>

<style scoped>
/* 详情模态框组件样式 */
</style>