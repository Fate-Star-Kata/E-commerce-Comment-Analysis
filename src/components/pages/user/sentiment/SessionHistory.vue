<template>
  <div v-if="history.length > 0" class="card bg-base-100 shadow">
    <div class="card-body">
      <div class="flex justify-between items-center mb-4">
        <h3 class="card-title">本次会话历史</h3>
        <button class="btn btn-ghost btn-sm" @click="$emit('clear')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清空历史
        </button>
      </div>
      
      <div class="space-y-3 max-h-96 overflow-y-auto">
        <div 
          v-for="(item, index) in history" 
          :key="index"
          class="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors"
          @click="$emit('load', item)"
        >
          <div class="card-body p-4">
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate" :title="item.text">
                  {{ item.text }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge badge-sm" :class="getSentimentClass(item.sentiment)">
                    {{ getSentimentLabel(item.sentiment) }}
                  </div>
                  <span class="text-xs text-gray-500">
                    {{ formatTime(item.timestamp) }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <div class="text-xs text-gray-500">
                  {{ (item.confidence * 100).toFixed(1) }}%
                </div>
                <button 
                  class="btn btn-ghost btn-xs"
                  @click.stop="$emit('delete', index)"
                  title="删除此记录"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center text-sm text-gray-500 mt-4">
        点击任意记录可重新加载分析结果
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HistoryItem } from '@/types/components'

defineProps<{
  history: HistoryItem[]
}>()

defineEmits<{
  'load': [item: HistoryItem]
  'delete': [index: number]
  'clear': []
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

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
/* 会话历史组件样式 */
</style>