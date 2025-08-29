<template>
  <div class="min-h-screen bg-base-200 p-6">
    <div class="container mx-auto max-w-4xl">
      <!-- 页面标题 -->
      <div class="hero bg-base-100 rounded-box mb-8">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-4xl font-bold">💬 单条评论分析</h1>
            <p class="py-6">输入评论内容，实时获取情感分析结果</p>
          </div>
        </div>
      </div>

      <!-- 评论输入组件 -->
      <CommentInput
        v-model:commentText="commentText"
        :isAnalyzing="isAnalyzing"
        :maxLength="500"
        @useExample="useExample"
        @analyze="analyzeComment"
      />

      <!-- 分析结果组件 -->
      <AnalysisResultComponent
        v-if="analysisResult"
        :result="analysisResult"
        @clear="clearResult"
        @save="saveToHistory"
        @analyzeAnother="analyzeAnother"
      />

      <!-- 会话历史组件 -->
      <SessionHistory
        v-if="historyRecords.length > 0"
        :history="historyRecords"
        @load="loadHistoryRecord"
        @clear="clearHistory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CommentInput from '@/components/pages/user/sentiment/CommentInput.vue'
import AnalysisResultComponent from '@/components/pages/user/sentiment/AnalysisResult.vue'
import SessionHistory from '@/components/pages/user/sentiment/SessionHistory.vue'
import type { AnalysisResult, HistoryItem } from '@/types/components'
import { analyzeSingleComment } from '@/api/page_apis'
import type { SingleAnalysisRequest, SingleAnalysisResponse } from '@/api/page_apis'

// 响应式数据
const commentText = ref('')
const isAnalyzing = ref(false)
// 分析结果
const analysisResult = ref<AnalysisResult | null>(null)
const historyRecords = ref<HistoryItem[]>([])
const maxLength = ref(500)



// 方法
const onTextChange = () => {
  // 实时分析可以在这里实现
  if (commentText.value.trim() && commentText.value.length > 10) {
    // 可以添加防抖逻辑进行实时分析
  }
}

const useExample = (text: string) => {
  commentText.value = text
}

const analyzeComment = async () => {
  if (!commentText.value.trim()) return

  isAnalyzing.value = true
  
  try {
    const request: SingleAnalysisRequest = {
      comment_text: commentText.value.trim()
    }
    
    const response = await analyzeSingleComment(request)
    
    if (response.code === 200 && response.data) {
      const data: SingleAnalysisResponse = response.data
      
      // 转换API响应为组件需要的格式
      const result: AnalysisResult = {
        sentiment: data.hzsystem_sentiment,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
        scores: {
          positive: data.probabilities.positive,
          negative: data.probabilities.negative,
          neutral: 1 - data.probabilities.positive - data.probabilities.negative
        },
        keywords: data.keywords.map(keyword => ({
          word: keyword,
          sentiment: data.hzsystem_sentiment, // 使用整体情感作为关键词情感
          weight: 0.8 // 默认权重
        }))
      }
      
      analysisResult.value = result
    } else {
      console.error('分析失败:')
    }
  } catch (error) {
    console.error('分析失败:', error)
  } finally {
    isAnalyzing.value = false
  }
}

const generateMockAnalysis = (text: string) => {
  // 简单的关键词匹配来模拟情感分析
  const positiveWords = ['好', '棒', '满意', '推荐', '喜欢', '优秀', '完美', '值得']
  const negativeWords = ['差', '烂', '失望', '不好', '垃圾', '后悔', '糟糕', '不值']

  let positiveScore = 0
  let negativeScore = 0

  positiveWords.forEach(word => {
    if (text.includes(word)) positiveScore += 0.3
  })

  negativeWords.forEach(word => {
    if (text.includes(word)) negativeScore += 0.3
  })

  // 添加随机性
  positiveScore += Math.random() * 0.4
  negativeScore += Math.random() * 0.4

  const neutralScore = 1 - positiveScore - negativeScore

  // 归一化
  const total = positiveScore + negativeScore + Math.max(0, neutralScore)
  positiveScore = positiveScore / total
  negativeScore = negativeScore / total
  const finalNeutralScore = 1 - positiveScore - negativeScore

  // 确定主要情感
  let sentiment = 'neutral'
  let confidence = Math.max(positiveScore, negativeScore, finalNeutralScore)

  if (positiveScore > negativeScore && positiveScore > finalNeutralScore) {
    sentiment = 'positive'
    confidence = positiveScore
  } else if (negativeScore > positiveScore && negativeScore > finalNeutralScore) {
    sentiment = 'negative'
    confidence = negativeScore
  }

  // 生成关键词
  const keywords: Array<{ word: string; sentiment: string; weight: number }> = []
  positiveWords.forEach(word => {
    if (text.includes(word)) {
      keywords.push({ word, sentiment: 'positive', weight: Math.random() * 0.8 + 0.2 })
    }
  })
  negativeWords.forEach(word => {
    if (text.includes(word)) {
      keywords.push({ word, sentiment: 'negative', weight: Math.random() * 0.8 + 0.2 })
    }
  })

  return {
    sentiment,
    confidence,
    scores: {
      positive: positiveScore,
      negative: negativeScore,
      neutral: finalNeutralScore
    },
    keywords: keywords.slice(0, 5), // 最多显示5个关键词
    analysisTime: Math.floor(Math.random() * 500 + 200) // 200-700ms
  }
}



const clearResult = () => {
  analysisResult.value = null
}

const analyzeAnother = () => {
  commentText.value = ''
  analysisResult.value = null
}

// 保存到历史
const saveToHistory = () => {
  if (analysisResult.value && commentText.value) {
    const record: HistoryItem = {
      id: Date.now().toString(),
      text: commentText.value,
      sentiment: analysisResult.value.sentiment,
      confidence: analysisResult.value.confidence,
      timestamp: analysisResult.value.timestamp
    }
    historyRecords.value.unshift(record)
  }
}

// 加载历史记录
const loadHistoryRecord = (record: HistoryItem) => {
  commentText.value = record.text
  analysisResult.value = {
    sentiment: record.sentiment,
    confidence: record.confidence,
    timestamp: record.timestamp,
    scores: {
      positive: record.sentiment === 'positive' ? record.confidence : (1 - record.confidence) / 2,
      negative: record.sentiment === 'negative' ? record.confidence : (1 - record.confidence) / 2,
      neutral: record.sentiment === 'neutral' ? record.confidence : (1 - record.confidence) / 2
    },
    keywords: []
  }
}

const clearHistory = () => {
  historyRecords.value = []
}

// 删除历史项
const deleteHistoryItem = (index: number) => {
  historyRecords.value.splice(index, 1)
}
</script>

<style scoped>
/* 单条分析页面样式 */
.badge-neutral {
  @apply badge-warning;
}

.progress {
  height: 0.5rem;
}

.textarea:focus {
  @apply border-primary;
}
</style>
