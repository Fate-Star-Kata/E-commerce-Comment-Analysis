<template>
  <div v-if="result" class="space-y-6">
    <!-- 分析结果概览 -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title mb-4">分析结果</h3>
        
        <div class="stats stats-vertical lg:stats-horizontal shadow bg-base-200">
          <div class="stat">
            <div class="stat-figure">
              <div class="avatar">
                <div class="w-16 rounded-full" :class="getSentimentBgClass(result.sentiment)">
                  <div class="flex items-center justify-center h-full text-2xl">
                    {{ getSentimentIcon(result.sentiment) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="stat-title">情感倾向</div>
            <div class="stat-value" :class="getSentimentTextClass(result.sentiment)">
              {{ getSentimentLabel(result.sentiment) }}
            </div>
            <div class="stat-desc">基于AI模型分析</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="stat-title">置信度</div>
            <div class="stat-value text-primary">{{ (result.confidence * 100).toFixed(1) }}%</div>
            <div class="stat-desc">{{ getConfidenceLevel(result.confidence) }}</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
            </div>
            <div class="stat-title">分析时间</div>
            <div class="stat-value text-secondary">{{ result.analysisTime || '0.5s' }}</div>
            <div class="stat-desc">处理耗时</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细分析 -->
    <div class="collapse collapse-arrow bg-base-100 shadow">
      <input type="checkbox" class="peer" /> 
      <div class="collapse-title text-xl font-medium">
        详细分析
      </div>
      <div class="collapse-content"> 
        <div class="space-y-4">
          <!-- 情感概率分布 -->
          <div>
            <h4 class="font-semibold mb-3">情感概率分布</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="w-12 text-sm">正面</span>
                <progress 
                  class="progress progress-success flex-1" 
                  :value="result.scores.positive * 100" 
                  max="100"
                ></progress>
                <span class="w-12 text-sm text-right">{{ (result.scores.positive * 100).toFixed(1) }}%</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-12 text-sm">负面</span>
                <progress 
                  class="progress progress-error flex-1" 
                  :value="result.scores.negative * 100" 
                  max="100"
                ></progress>
                <span class="w-12 text-sm text-right">{{ (result.scores.negative * 100).toFixed(1) }}%</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-12 text-sm">中性</span>
                <progress 
                  class="progress progress-warning flex-1" 
                  :value="result.scores.neutral * 100" 
                  max="100"
                ></progress>
                <span class="w-12 text-sm text-right">{{ (result.scores.neutral * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- 关键词分析 -->
          <div v-if="result.keywords && result.keywords.length > 0">
            <h4 class="font-semibold mb-3">关键词分析</h4>
            <div class="overflow-x-auto">
              <table class="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>关键词</th>
                    <th>情感</th>
                    <th>权重</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="keyword in result.keywords" :key="keyword.word">
                    <td>{{ keyword.word }}</td>
                    <td>
                      <div class="badge badge-sm" :class="getSentimentClass(keyword.sentiment)">
                        {{ getSentimentLabel(keyword.sentiment) }}
                      </div>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <progress 
                          class="progress progress-primary w-16" 
                          :value="keyword.weight * 100" 
                          max="100"
                        ></progress>
                        <span class="text-xs">{{ (keyword.weight * 100).toFixed(0) }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <div class="card-actions justify-center gap-4">
          <button class="btn btn-outline" @click="$emit('clear')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            清除结果
          </button>
          <button class="btn btn-primary" @click="$emit('save')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存到历史
          </button>
          <button class="btn btn-secondary" @click="$emit('analyzeAnother')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            分析其他评论
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  analysisTime?: string
  scores: {
    positive: number
    negative: number
    neutral: number
  }
  keywords?: {
    word: string
    sentiment: 'positive' | 'negative' | 'neutral'
    weight: number
  }[]
}

defineProps<{
  result: AnalysisResult | null
}>()

defineEmits<{
  'clear': []
  'save': []
  'analyzeAnother': []
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

// 获取情感图标
const getSentimentIcon = (sentiment: string) => {
  const icons = {
    positive: '😊',
    negative: '😞',
    neutral: '😐'
  }
  return icons[sentiment as keyof typeof icons] || '❓'
}

// 获取情感背景样式类
const getSentimentBgClass = (sentiment: string) => {
  const classes = {
    positive: 'bg-success text-success-content',
    negative: 'bg-error text-error-content',
    neutral: 'bg-warning text-warning-content'
  }
  return classes[sentiment as keyof typeof classes] || ''
}

// 获取情感文本样式类
const getSentimentTextClass = (sentiment: string) => {
  const classes = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-warning'
  }
  return classes[sentiment as keyof typeof classes] || ''
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

// 获取置信度等级
const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 0.9) return '非常高'
  if (confidence >= 0.8) return '高'
  if (confidence >= 0.7) return '中等'
  if (confidence >= 0.6) return '较低'
  return '低'
}
</script>

<style scoped>
/* 分析结果组件样式 */
</style>