<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title mb-4">分析处理</h3>
      
      <!-- 进度条 -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">分析进度</span>
          <span class="text-sm text-gray-500">{{ progress.current }} / {{ progress.total }}</span>
        </div>
        <progress 
          class="progress progress-primary w-full" 
          :value="progress.current" 
          :max="progress.total"
        ></progress>
        <div class="text-center mt-2">
          <span class="text-lg font-semibold">{{ progressPercentage }}%</span>
        </div>
      </div>

      <!-- 实时统计 -->
      <div class="stats shadow mb-6">
        <div class="stat">
          <div class="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="stat-title">正面评论</div>
          <div class="stat-value text-success">{{ stats.positive }}</div>
          <div class="stat-desc">{{ getPercentage(stats.positive) }}%</div>
        </div>
        
        <div class="stat">
          <div class="stat-figure text-error">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="stat-title">负面评论</div>
          <div class="stat-value text-error">{{ stats.negative }}</div>
          <div class="stat-desc">{{ getPercentage(stats.negative) }}%</div>
        </div>
        
        <div class="stat">
          <div class="stat-figure text-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="stat-title">中性评论</div>
          <div class="stat-value text-warning">{{ stats.neutral }}</div>
          <div class="stat-desc">{{ getPercentage(stats.neutral) }}%</div>
        </div>
      </div>

      <!-- 分析日志 -->
      <div class="mb-6">
        <h4 class="font-semibold mb-3">分析日志</h4>
        <div class="bg-base-200 rounded-lg p-4 h-48 overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="mb-2 last:mb-0">
            <div class="flex items-start gap-2">
              <span class="text-xs text-gray-500 mt-0.5 min-w-16">{{ formatTime(log.timestamp) }}</span>
              <span 
                class="text-sm"
                :class="{
                  'text-success': log.type === 'success',
                  'text-error': log.type === 'error',
                  'text-warning': log.type === 'warning',
                  'text-info': log.type === 'info'
                }"
              >
                {{ log.message }}
              </span>
            </div>
          </div>
          
          <!-- 自动滚动到底部 -->
          <div ref="logEnd"></div>
        </div>
      </div>

      <!-- 状态信息 -->
      <div class="alert" :class="alertClass">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path v-if="isCompleted" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          <path v-else-if="hasError" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ statusMessage }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="card-actions justify-between mt-6">
        <button 
          class="btn btn-outline" 
          :disabled="isAnalyzing"
          @click="$emit('back')"
        >
          上一步
        </button>
        <button 
          v-if="isCompleted" 
          class="btn btn-primary" 
          @click="$emit('next')"
        >
          查看结果
        </button>
        <button 
          v-else-if="hasError" 
          class="btn btn-error" 
          @click="$emit('retry')"
        >
          重新分析
        </button>
        <button 
          v-else 
          class="btn btn-warning" 
          @click="$emit('stop')"
        >
          停止分析
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

interface AnalysisProgress {
  current: number
  total: number
}

interface AnalysisStats {
  positive: number
  negative: number
  neutral: number
}

interface AnalysisLog {
  timestamp: Date
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

const props = defineProps<{
  progress: AnalysisProgress
  stats: AnalysisStats
  logs: AnalysisLog[]
  isAnalyzing: boolean
  isCompleted: boolean
  hasError: boolean
}>()

defineEmits<{
  'back': []
  'next': []
  'retry': []
  'stop': []
}>()

// 日志容器引用
const logEnd = ref<HTMLElement>()

// 进度百分比
const progressPercentage = computed(() => {
  if (props.progress.total === 0) return 0
  return Math.round((props.progress.current / props.progress.total) * 100)
})

// 获取百分比
const getPercentage = (count: number) => {
  const total = props.stats.positive + props.stats.negative + props.stats.neutral
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

// 状态消息
const statusMessage = computed(() => {
  if (props.hasError) {
    return '分析过程中出现错误，请检查数据格式或重试'
  }
  if (props.isCompleted) {
    return `分析完成！共处理 ${props.progress.total} 条评论`
  }
  if (props.isAnalyzing) {
    return `正在分析中... 预计剩余时间: ${estimatedTimeLeft.value}`
  }
  return '准备开始分析'
})

// 警告框样式
const alertClass = computed(() => {
  if (props.hasError) return 'alert-error'
  if (props.isCompleted) return 'alert-success'
  if (props.isAnalyzing) return 'alert-info'
  return 'alert-warning'
})

// 预计剩余时间
const estimatedTimeLeft = computed(() => {
  if (props.progress.current === 0) return '计算中...'
  
  const remaining = props.progress.total - props.progress.current
  const avgTimePerItem = 0.5 // 假设每条评论平均处理时间0.5秒
  const remainingSeconds = remaining * avgTimePerItem
  
  if (remainingSeconds < 60) {
    return `${Math.ceil(remainingSeconds)}秒`
  } else {
    const minutes = Math.ceil(remainingSeconds / 60)
    return `${minutes}分钟`
  }
})

// 格式化时间
const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 监听日志变化，自动滚动到底部
watch(
  () => props.logs.length,
  () => {
    nextTick(() => {
      logEnd.value?.scrollIntoView({ behavior: 'smooth' })
    })
  }
)
</script>

<style scoped>
/* 分析处理组件样式 */
</style>