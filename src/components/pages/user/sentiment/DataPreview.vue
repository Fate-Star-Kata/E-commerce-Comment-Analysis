<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title mb-4">数据预览</h3>
      
      <!-- 数据统计 -->
      <div class="stats shadow mb-6">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="stat-title">检测到评论数据</div>
          <div class="stat-value text-primary">{{ previewData.length }}</div>
          <div class="stat-desc">条评论记录</div>
        </div>
        
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="stat-title">平均字数</div>
          <div class="stat-value text-secondary">{{ averageLength }}</div>
          <div class="stat-desc">字符/条</div>
        </div>
        
        <div class="stat">
          <div class="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
            </svg>
          </div>
          <div class="stat-title">预计处理时间</div>
          <div class="stat-value text-accent">{{ estimatedTime }}</div>
          <div class="stat-desc">分钟</div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="overflow-x-auto">
        <div class="mb-4">
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>以下是前 {{ Math.min(10, previewData.length) }} 条数据预览，请确认数据格式正确</span>
          </div>
        </div>
        
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th class="w-16">#</th>
              <th class="min-w-96">评论内容</th>
              <th class="w-32" v-if="hasProductId">商品ID</th>
              <th class="w-24">字数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in displayData" :key="index">
              <td>{{ index + 1 }}</td>
              <td>
                <div class="max-w-md">
                  <p class="text-sm line-clamp-3">{{ item.content }}</p>
                </div>
              </td>
              <td v-if="hasProductId">
                <span class="badge badge-outline">{{ item.productId || '-' }}</span>
              </td>
              <td>
                <span class="text-sm text-gray-500">{{ item.content.length }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="previewData.length > 10" class="mt-4 text-center">
          <div class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span>还有 {{ previewData.length - 10 }} 条数据未显示</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="card-actions justify-between mt-6">
        <button class="btn btn-outline" @click="$emit('back')">
          上一步
        </button>
        <button class="btn btn-primary" @click="$emit('next')">
          开始分析
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PreviewItem {
  content: string
  productId?: string
}

const props = defineProps<{
  previewData: PreviewItem[]
}>()

defineEmits<{
  'back': []
  'next': []
}>()

// 显示的数据（前10条）
const displayData = computed(() => {
  return props.previewData.slice(0, 10)
})

// 是否有商品ID列
const hasProductId = computed(() => {
  return props.previewData.some(item => item.productId)
})

// 平均字数
const averageLength = computed(() => {
  if (props.previewData.length === 0) return 0
  const totalLength = props.previewData.reduce((sum, item) => sum + item.content.length, 0)
  return Math.round(totalLength / props.previewData.length)
})

// 预计处理时间（基于数据量估算）
const estimatedTime = computed(() => {
  const count = props.previewData.length
  if (count <= 100) return '< 1'
  if (count <= 500) return '1-2'
  if (count <= 1000) return '2-5'
  if (count <= 5000) return '5-15'
  return '15+'
})
</script>

<style scoped>
/* 数据预览组件样式 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>