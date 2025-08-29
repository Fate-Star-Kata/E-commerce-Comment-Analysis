<template>
  <div class="sentiment-result">
    <!-- 主要结果卡片 -->
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h3 class="card-title text-lg">🎯 分析结果</h3>
          <div class="text-sm text-base-content/70">
            分析时间: {{ analysisTime }}ms
          </div>
        </div>
        
        <!-- 情感倾向和置信度 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- 情感倾向 -->
          <div class="text-center">
            <div class="text-4xl mb-2">{{ getSentimentIcon(result.sentiment) }}</div>
            <div class="text-lg font-semibold mb-1">{{ getSentimentLabel(result.sentiment) }}</div>
            <div class="text-sm text-base-content/70">情感倾向</div>
          </div>
          
          <!-- 置信度 -->
          <div class="text-center">
            <div class="radial-progress text-primary text-2xl font-bold mb-2" 
                 :style="`--value:${Math.round(result.confidence * 100)}`" 
                 role="progressbar">
              {{ Math.round(result.confidence * 100) }}%
            </div>
            <div class="text-lg font-semibold mb-1">置信度</div>
            <div class="text-sm text-base-content/70">{{ getConfidenceLevel(result.confidence) }}</div>
          </div>
        </div>
        
        <!-- 详细概率分布 -->
        <div class="mb-6">
          <h4 class="font-medium mb-3">📊 详细概率分布</h4>
          <div class="space-y-3">
            <div v-for="(prob, sentiment) in result.scores" :key="sentiment" class="flex items-center gap-3">
              <div class="w-16 text-sm font-medium">{{ getSentimentLabel(sentiment) }}</div>
              <div class="flex-1">
                <div class="w-full bg-base-300 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-500" 
                       :class="getSentimentColor(sentiment)"
                       :style="`width: ${prob * 100}%`">
                  </div>
                </div>
              </div>
              <div class="w-12 text-sm text-right">{{ (prob * 100).toFixed(1) }}%</div>
            </div>
          </div>
        </div>
        
        <!-- 关键词分析 -->
        <div v-if="result.keywords && result.keywords.length > 0" class="mb-4">
          <h4 class="font-medium mb-3">🔍 关键词分析</h4>
          <div class="flex flex-wrap gap-2">
            <div v-for="keyword in result.keywords" :key="keyword.word" 
                 class="badge badge-outline" 
                 :class="getKeywordColor(keyword.sentiment)"
                 :title="`权重: ${keyword.weight.toFixed(2)}`">
              {{ keyword.word }}
              <span class="ml-1 text-xs opacity-70">({{ keyword.weight.toFixed(2) }})</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions justify-end">
          <button v-if="showFeedback" class="btn btn-sm btn-outline" @click="showFeedbackModal = true">
            💬 反馈
          </button>
          <button v-if="showExport" class="btn btn-sm btn-outline" @click="exportResult">
            📥 导出
          </button>
          <button v-if="showSave" class="btn btn-sm btn-primary" @click="saveResult">
            💾 保存
          </button>
        </div>
      </div>
    </div>
    
    <!-- 反馈模态框 -->
    <dialog ref="feedbackModal" class="modal" v-if="showFeedback">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">💬 分析结果反馈</h3>
        
        <div class="mb-4">
          <label class="label">
            <span class="label-text">您认为这个分析结果准确吗？</span>
          </label>
          <div class="flex gap-2">
            <button class="btn btn-sm" 
                    :class="feedback.accurate === true ? 'btn-success' : 'btn-outline'"
                    @click="feedback.accurate = true">
              👍 准确
            </button>
            <button class="btn btn-sm" 
                    :class="feedback.accurate === false ? 'btn-error' : 'btn-outline'"
                    @click="feedback.accurate = false">
              👎 不准确
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="label">
            <span class="label-text">您的意见和建议</span>
          </label>
          <textarea class="textarea textarea-bordered w-full" 
                    placeholder="请输入您的意见和建议..." 
                    v-model="feedback.comment">
          </textarea>
        </div>
        
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeFeedbackModal">取消</button>
          <button class="btn btn-primary" @click="submitFeedback">提交反馈</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeFeedbackModal">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  scores: {
    positive: number
    negative: number
    neutral: number
  }
  keywords?: {
    word: string
    weight: number
    sentiment: 'positive' | 'negative' | 'neutral'
  }[]
}

interface Props {
  result: SentimentResult
  analysisTime?: number
  showFeedback?: boolean
  showExport?: boolean
  showSave?: boolean
}

// 定义属性
const props = withDefaults(defineProps<Props>(), {
  analysisTime: 0,
  showFeedback: true,
  showExport: true,
  showSave: true
})

// 定义事件
const emit = defineEmits<{
  feedback: [feedback: { accurate: boolean; comment: string }]
  export: []
  save: []
}>()

// 响应式数据
const showFeedbackModal = ref(false)
const feedbackModal = ref<HTMLDialogElement>()
const feedback = ref({
  accurate: null as boolean | null,
  comment: ''
})

// 计算属性和方法
const getSentimentIcon = (sentiment: string) => {
  const icons = {
    positive: '😊',
    negative: '😞',
    neutral: '😐'
  }
  return icons[sentiment as keyof typeof icons] || '❓'
}

const getSentimentLabel = (sentiment: string) => {
  const labels = {
    positive: '正面',
    negative: '负面',
    neutral: '中性'
  }
  return labels[sentiment as keyof typeof labels] || sentiment
}

const getSentimentColor = (sentiment: string) => {
  const colors = {
    positive: 'bg-success',
    negative: 'bg-error',
    neutral: 'bg-warning'
  }
  return colors[sentiment as keyof typeof colors] || 'bg-base-300'
}

const getKeywordColor = (sentiment: string) => {
  const colors = {
    positive: 'badge-success',
    negative: 'badge-error',
    neutral: 'badge-warning'
  }
  return colors[sentiment as keyof typeof colors] || 'badge-ghost'
}

const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 0.9) return '非常高'
  if (confidence >= 0.8) return '高'
  if (confidence >= 0.7) return '中等'
  if (confidence >= 0.6) return '较低'
  return '低'
}

// 方法
const exportResult = () => {
  emit('export')
}

const saveResult = () => {
  emit('save')
}

const closeFeedbackModal = () => {
  showFeedbackModal.value = false
  feedbackModal.value?.close()
}

const submitFeedback = () => {
  if (feedback.value.accurate === null) {
    alert('请选择分析结果是否准确')
    return
  }
  
  emit('feedback', {
    accurate: feedback.value.accurate,
    comment: feedback.value.comment
  })
  
  // 重置反馈表单
  feedback.value = {
    accurate: null,
    comment: ''
  }
  
  closeFeedbackModal()
}

// 监听模态框显示
const openFeedbackModal = () => {
  showFeedbackModal.value = true
  feedbackModal.value?.showModal()
}

// 暴露方法给父组件
defineExpose({
  openFeedbackModal
})
</script>

<style scoped>
.sentiment-result {
  @apply w-full;
}

.radial-progress {
  --size: 4rem;
  --thickness: 4px;
}

.badge {
  @apply transition-all duration-200;
}

.badge:hover {
  @apply scale-105;
}

.modal-box {
  @apply max-w-md;
}
</style>