<template>
  <div class="comment-card">
    <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="card-body">
        <!-- 评论头部信息 -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <!-- 用户头像 -->
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-10">
                <span class="text-sm">{{ getUserInitial(comment.user) }}</span>
              </div>
            </div>
            
            <!-- 用户信息 -->
            <div>
              <div class="font-medium">{{ comment.user || '匿名用户' }}</div>
              <div class="text-sm text-base-content/70 flex items-center gap-2">
                <span>{{ formatDate(comment.date) }}</span>
                <span v-if="comment.platform" class="badge badge-sm badge-outline">
                  {{ comment.platform }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 操作菜单 -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a @click="copyComment">📋 复制评论</a></li>
              <li><a @click="reanalyze">🔄 重新分析</a></li>
              <li><a @click="exportComment">📥 导出数据</a></li>
              <li><a @click="reportComment" class="text-error">🚨 举报</a></li>
            </ul>
          </div>
        </div>
        
        <!-- 评论内容 -->
        <div class="mb-4">
          <div class="text-base leading-relaxed" :class="{ 'line-clamp-3': !isExpanded && comment.content.length > 150 }">
            {{ comment.content }}
          </div>
          <button v-if="comment.content.length > 150" 
                  class="btn btn-link btn-sm p-0 h-auto min-h-0 text-primary"
                  @click="isExpanded = !isExpanded">
            {{ isExpanded ? '收起' : '展开' }}
          </button>
        </div>
        
        <!-- 情感分析结果 -->
        <div v-if="analysis" class="mb-4">
          <!-- 主要情感标签 -->
          <div class="flex items-center gap-3 mb-3">
            <div class="badge badge-lg" :class="getSentimentBadgeClass(analysis.sentiment)">
              {{ getSentimentIcon(analysis.sentiment) }} {{ getSentimentText(analysis.sentiment) }}
            </div>
            <div class="text-sm text-base-content/70">
              置信度: <span class="font-medium">{{ Math.round(analysis.confidence * 100) }}%</span>
            </div>
          </div>
          
          <!-- 情感概率分布 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm w-12">正面</span>
              <div class="flex-1 bg-base-300 rounded-full h-2">
                <div class="bg-success h-2 rounded-full transition-all duration-500"
                     :style="`width: ${analysis.scores.positive * 100}%`">
                </div>
              </div>
              <span class="text-sm w-12 text-right">{{ Math.round(analysis.scores.positive * 100) }}%</span>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-sm w-12">负面</span>
              <div class="flex-1 bg-base-300 rounded-full h-2">
                <div class="bg-error h-2 rounded-full transition-all duration-500"
                     :style="`width: ${analysis.scores.negative * 100}%`">
                </div>
              </div>
              <span class="text-sm w-12 text-right">{{ Math.round(analysis.scores.negative * 100) }}%</span>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-sm w-12">中性</span>
              <div class="flex-1 bg-base-300 rounded-full h-2">
                <div class="bg-warning h-2 rounded-full transition-all duration-500"
                     :style="`width: ${analysis.scores.neutral * 100}%`">
                </div>
              </div>
              <span class="text-sm w-12 text-right">{{ Math.round(analysis.scores.neutral * 100) }}%</span>
            </div>
          </div>
        </div>
        
        <!-- 关键词分析 -->
        <div v-if="analysis && analysis.keywords && analysis.keywords.length > 0" class="mb-4">
          <div class="text-sm font-medium mb-2">🔑 关键词</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="keyword in analysis.keywords" :key="keyword.word"
                  class="badge badge-outline badge-sm"
                  :class="getKeywordClass(keyword.sentiment)"
                  :title="`权重: ${keyword.weight.toFixed(2)}`">
              {{ keyword.word }}
            </span>
          </div>
        </div>
        
        <!-- 评论元数据 -->
        <div class="flex items-center justify-between text-sm text-base-content/70">
          <div class="flex items-center gap-4">
            <span v-if="comment.rating" class="flex items-center gap-1">
              ⭐ {{ comment.rating }}/5
            </span>
            <span v-if="comment.likes !== undefined" class="flex items-center gap-1">
              👍 {{ comment.likes }}
            </span>
            <span v-if="comment.replies !== undefined" class="flex items-center gap-1">
              💬 {{ comment.replies }}
            </span>
          </div>
          
          <div class="flex items-center gap-2">
            <span v-if="analysis" class="text-xs">
              分析时间: {{ formatDate(analysis.analyzedAt) }}
            </span>
            <button class="btn btn-ghost btn-xs" @click="toggleFavorite">
              {{ isFavorite ? '❤️' : '🤍' }}
            </button>
          </div>
        </div>
        
        <!-- 展开的详细信息 -->
        <div v-if="showDetails" class="mt-4 pt-4 border-t border-base-300">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 技术指标 -->
            <div class="bg-base-200 p-3 rounded-lg">
              <h5 class="font-medium mb-2">📊 技术指标</h5>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>文本长度:</span>
                  <span>{{ comment.content.length }} 字符</span>
                </div>
                <div class="flex justify-between">
                  <span>处理时间:</span>
                  <span>{{ analysis?.processingTime || 0 }}ms</span>
                </div>
                <div class="flex justify-between">
                  <span>模型版本:</span>
                  <span>{{ analysis?.modelVersion || 'v1.0' }}</span>
                </div>
              </div>
            </div>
            
            <!-- 上下文信息 -->
            <div class="bg-base-200 p-3 rounded-lg">
              <h5 class="font-medium mb-2">🔍 上下文</h5>
              <div class="space-y-1 text-sm">
                <div v-if="comment.product">
                  <span class="text-base-content/70">商品:</span>
                  <span class="ml-1">{{ comment.product }}</span>
                </div>
                <div v-if="comment.category">
                  <span class="text-base-content/70">分类:</span>
                  <span class="ml-1">{{ comment.category }}</span>
                </div>
                <div v-if="comment.source">
                  <span class="text-base-content/70">来源:</span>
                  <span class="ml-1">{{ comment.source }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions justify-end mt-4">
          <button class="btn btn-sm btn-outline" @click="showDetails = !showDetails">
            {{ showDetails ? '隐藏' : '显示' }}详情
          </button>
          <button v-if="!analysis" class="btn btn-sm btn-primary" @click="analyzeComment">
            🧠 分析情感
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface Comment {
  id: string
  content: string
  user?: string
  date: string
  platform?: string
  rating?: number
  likes?: number
  replies?: number
  product?: string
  category?: string
  source?: string
}

interface Keyword {
  word: string
  weight: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  scores: {
    positive: number
    negative: number
    neutral: number
  }
  keywords?: Keyword[]
  analyzedAt: string
  processingTime?: number
  modelVersion?: string
}

interface Props {
  comment: Comment
  analysis?: SentimentAnalysis
  isFavorite?: boolean
  showDetails?: boolean
}

// 定义属性
const props = withDefaults(defineProps<Props>(), {
  isFavorite: false,
  showDetails: false
})

// 定义事件
const emit = defineEmits<{
  analyze: [commentId: string]
  copy: [content: string]
  export: [comment: Comment]
  report: [commentId: string]
  toggleFavorite: [commentId: string]
}>()

// 响应式数据
const isExpanded = ref(false)
const showDetails = ref(props.showDetails)

// 方法
const getUserInitial = (user?: string) => {
  if (!user) return '?'
  return user.charAt(0).toUpperCase()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return '😊'
    case 'negative': return '😞'
    case 'neutral': return '😐'
    default: return '❓'
  }
}

const getSentimentText = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return '正面'
    case 'negative': return '负面'
    case 'neutral': return '中性'
    default: return '未知'
  }
}

const getSentimentBadgeClass = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return 'badge-success'
    case 'negative': return 'badge-error'
    case 'neutral': return 'badge-warning'
    default: return 'badge-ghost'
  }
}

const getKeywordClass = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return 'badge-success'
    case 'negative': return 'badge-error'
    case 'neutral': return 'badge-warning'
    default: return 'badge-ghost'
  }
}

const copyComment = () => {
  emit('copy', props.comment.content)
}

const reanalyze = () => {
  emit('analyze', props.comment.id)
}

const exportComment = () => {
  emit('export', props.comment)
}

const reportComment = () => {
  emit('report', props.comment.id)
}

const toggleFavorite = () => {
  emit('toggleFavorite', props.comment.id)
}

const analyzeComment = () => {
  emit('analyze', props.comment.id)
}
</script>

<style scoped>
.comment-card {
  @apply w-full;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 进度条动画 */
.bg-success,
.bg-error,
.bg-warning {
  transition: width 0.8s ease-out;
}

/* 悬停效果 */
.comment-card:hover .card {
  transform: translateY(-2px);
}

/* 关键词动画 */
.badge {
  transition: all 0.2s ease;
}

.badge:hover {
  transform: scale(1.05);
}
</style>