<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <!-- 操作按钮 -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="card-title">分析记录</h3>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" @click="$emit('export')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出记录
          </button>
          <button class="btn btn-error btn-sm" @click="$emit('clearAll')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            清空记录
          </button>
        </div>
      </div>

      <!-- 记录表格 -->
      <div class="overflow-x-auto" v-if="records.length > 0">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>时间</th>
              <th>类型</th>
              <th>内容预览</th>
              <th>情感倾向</th>
              <th>置信度</th>
              <th>数据量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>
                <div class="text-sm">
                  <div class="font-medium">{{ formatDate(record.timestamp) }}</div>
                  <div class="text-gray-500">{{ formatTime(record.timestamp) }}</div>
                </div>
              </td>
              <td>
                <div class="badge" :class="record.type === 'single' ? 'badge-primary' : 'badge-secondary'">
                  {{ record.type === 'single' ? '单条分析' : '批量分析' }}
                </div>
              </td>
              <td>
                <div class="max-w-xs truncate" :title="record.content">
                  {{ record.content }}
                </div>
              </td>
              <td>
                <div class="badge" :class="getSentimentClass(record.sentiment)">
                  {{ getSentimentLabel(record.sentiment) }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ (record.confidence * 100).toFixed(1) }}%
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ record.dataCount }} 条
                </div>
              </td>
              <td>
                <div class="flex gap-1">
                  <button 
                    class="btn btn-ghost btn-md" 
                    @click="$emit('view', record)"
                    title="查看详情"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    class="btn btn-ghost btn-md" 
                    @click="$emit('download', record)"
                    title="下载结果"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button 
                    class="btn btn-error btn-md hover:bg-red-700 hover:border-red-700" 
                    @click="$emit('delete', record.id)"
                    title="删除记录"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 text-lg mb-2">暂无分析记录</p>
        <p class="text-gray-400">开始您的第一次情感分析吧！</p>
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
  result?: any
}

defineProps<{
  records: AnalysisRecord[]
}>()

defineEmits<{
  'view': [record: AnalysisRecord]
  'download': [record: AnalysisRecord]
  'delete': [id: string]
  'export': []
  'clearAll': []
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

// 格式化日期
const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
/* 记录表格组件样式 */
</style>