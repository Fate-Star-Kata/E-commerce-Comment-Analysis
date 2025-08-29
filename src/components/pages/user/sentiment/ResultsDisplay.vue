<template>
  <div class="space-y-6">
    <!-- 分析结果概览 -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title mb-4">分析结果概览</h3>
        
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="stat-title">总评论数</div>
            <div class="stat-value text-primary">{{ totalCount }}</div>
            <div class="stat-desc">已完成分析</div>
          </div>
          
          <div class="stat">
            <div class="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title">正面评论</div>
            <div class="stat-value text-success">{{ positiveCount }}</div>
            <div class="stat-desc">{{ positivePercentage }}%</div>
          </div>
          
          <div class="stat">
            <div class="stat-figure text-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title">负面评论</div>
            <div class="stat-value text-error">{{ negativeCount }}</div>
            <div class="stat-desc">{{ negativePercentage }}%</div>
          </div>
          
          <div class="stat">
            <div class="stat-figure text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title">中性评论</div>
            <div class="stat-value text-warning">{{ neutralCount }}</div>
            <div class="stat-desc">{{ neutralPercentage }}%</div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions justify-end mt-6">
          <button class="btn btn-outline" @click="$emit('download')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            下载结果
          </button>
          <button class="btn btn-primary" @click="$emit('save')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            保存到历史
          </button>
          <button class="btn btn-secondary" @click="$emit('reset')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            重新分析
          </button>
        </div>
      </div>
    </div>

    <!-- 详细结果表格 -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h3 class="card-title">详细结果</h3>
          
          <!-- 筛选器 -->
          <div class="flex gap-2">
            <select 
              class="select select-bordered select-sm" 
              :value="sentimentFilter"
              @change="updateSentimentFilter(($event.target as HTMLSelectElement).value)"
            >
              <option value="">全部情感</option>
              <option value="positive">正面</option>
              <option value="negative">负面</option>
              <option value="neutral">中性</option>
            </select>
            
            <select 
              class="select select-bordered select-sm" 
              :value="confidenceFilter"
              @change="updateConfidenceFilter(($event.target as HTMLSelectElement).value)"
            >
              <option value="">全部置信度</option>
              <option value="high">高 (≥80%)</option>
              <option value="medium">中 (60-79%)</option>
              <option value="low">低 (<60%)</option>
            </select>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="w-16">#</th>
                <th class="min-w-96">评论内容</th>
                <th class="w-24">情感倾向</th>
                <th class="w-24">置信度</th>
                <th class="w-32" v-if="hasProductId">商品ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedResults" :key="index">
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td>
                  <div class="max-w-md">
                    <p class="text-sm line-clamp-3">{{ item.content }}</p>
                  </div>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="getSentimentClass(item.sentiment)"
                  >
                    {{ getSentimentLabel(item.sentiment) }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">{{ Math.round(item.confidence * 100) }}%</span>
                    <progress 
                      class="progress progress-primary w-16 h-2" 
                      :value="item.confidence" 
                      max="1"
                    ></progress>
                  </div>
                </td>
                <td v-if="hasProductId">
                  <span class="badge badge-outline">{{ item.productId || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="flex justify-between items-center mt-6">
          <div class="text-sm text-gray-500">
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredResults.length) }} 条，
            共 {{ filteredResults.length }} 条结果
          </div>
          
          <div class="join">
            <button 
              class="join-item btn btn-sm" 
              :disabled="currentPage === 1"
              @click="updateCurrentPage(currentPage - 1)"
            >
              «
            </button>
            
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="join-item btn btn-sm" 
              :class="{ 'btn-active': page === currentPage }"
              @click="updateCurrentPage(page)"
            >
              {{ page }}
            </button>
            
            <button 
              class="join-item btn btn-sm" 
              :disabled="currentPage === totalPages"
              @click="updateCurrentPage(currentPage + 1)"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AnalysisResult {
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  productId?: string
}

const props = defineProps<{
  results: AnalysisResult[]
  sentimentFilter: string
  confidenceFilter: string
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:sentimentFilter': [value: string]
  'update:confidenceFilter': [value: string]
  'update:currentPage': [page: number]
  'download': []
  'save': []
  'reset': []
}>()

// 是否有商品ID列
const hasProductId = computed(() => {
  return props.results.some(item => item.productId)
})

// 统计数据
const totalCount = computed(() => props.results.length)
const positiveCount = computed(() => props.results.filter(r => r.sentiment === 'positive').length)
const negativeCount = computed(() => props.results.filter(r => r.sentiment === 'negative').length)
const neutralCount = computed(() => props.results.filter(r => r.sentiment === 'neutral').length)

const positivePercentage = computed(() => 
  totalCount.value > 0 ? Math.round((positiveCount.value / totalCount.value) * 100) : 0
)
const negativePercentage = computed(() => 
  totalCount.value > 0 ? Math.round((negativeCount.value / totalCount.value) * 100) : 0
)
const neutralPercentage = computed(() => 
  totalCount.value > 0 ? Math.round((neutralCount.value / totalCount.value) * 100) : 0
)

// 筛选后的结果
const filteredResults = computed(() => {
  let filtered = props.results
  
  // 情感筛选
  if (props.sentimentFilter) {
    filtered = filtered.filter(item => item.sentiment === props.sentimentFilter)
  }
  
  // 置信度筛选
  if (props.confidenceFilter) {
    filtered = filtered.filter(item => {
      const confidence = item.confidence * 100
      switch (props.confidenceFilter) {
        case 'high': return confidence >= 80
        case 'medium': return confidence >= 60 && confidence < 80
        case 'low': return confidence < 60
        default: return true
      }
    })
  }
  
  return filtered
})

// 分页后的结果
const paginatedResults = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredResults.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / props.pageSize)
})

// 可见页码
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const half = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 更新筛选器
const updateSentimentFilter = (value: string) => {
  emit('update:sentimentFilter', value)
  emit('update:currentPage', 1) // 重置到第一页
}

const updateConfidenceFilter = (value: string) => {
  emit('update:confidenceFilter', value)
  emit('update:currentPage', 1) // 重置到第一页
}

const updateCurrentPage = (page: number) => {
  emit('update:currentPage', page)
}

// 获取情感标签
const getSentimentLabel = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return '正面'
    case 'negative': return '负面'
    case 'neutral': return '中性'
    default: return '未知'
  }
}

// 获取情感样式类
const getSentimentClass = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return 'badge-success'
    case 'negative': return 'badge-error'
    case 'neutral': return 'badge-warning'
    default: return 'badge-ghost'
  }
}
</script>

<style scoped>
/* 结果展示组件样式 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>