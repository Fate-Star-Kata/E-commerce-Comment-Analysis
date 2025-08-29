<template>
  <div class="sentiment-chart">
    <!-- 图表容器 -->
    <div class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <div class="flex items-center justify-between mb-6">
          <h3 class="card-title">📊 情感分析统计</h3>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-outline" 
                    :class="{ 'btn-active': chartType === 'pie' }"
                    @click="chartType = 'pie'">
              🥧 饼图
            </button>
            <button class="btn btn-sm btn-outline" 
                    :class="{ 'btn-active': chartType === 'bar' }"
                    @click="chartType = 'bar'">
              📊 柱状图
            </button>
            <button class="btn btn-sm btn-outline" 
                    :class="{ 'btn-active': chartType === 'trend' }"
                    @click="chartType = 'trend'"
                    v-if="trendData && trendData.length > 0">
              📈 趋势图
            </button>
          </div>
        </div>
        
        <!-- 统计概览 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="stat bg-base-100 rounded-lg shadow-sm">
            <div class="stat-title">总数量</div>
            <div class="stat-value text-primary text-2xl">{{ statistics.total }}</div>
            <div class="stat-desc">分析的评论总数</div>
          </div>
          <div class="stat bg-base-100 rounded-lg shadow-sm">
            <div class="stat-title">正面评论</div>
            <div class="stat-value text-success text-2xl">{{ statistics.positive }}</div>
            <div class="stat-desc">{{ getPercentage(statistics.positive) }}%</div>
          </div>
          <div class="stat bg-base-100 rounded-lg shadow-sm">
            <div class="stat-title">负面评论</div>
            <div class="stat-value text-error text-2xl">{{ statistics.negative }}</div>
            <div class="stat-desc">{{ getPercentage(statistics.negative) }}%</div>
          </div>
          <div class="stat bg-base-100 rounded-lg shadow-sm">
            <div class="stat-title">中性评论</div>
            <div class="stat-value text-warning text-2xl">{{ statistics.neutral }}</div>
            <div class="stat-desc">{{ getPercentage(statistics.neutral) }}%</div>
          </div>
        </div>
        
        <!-- 图表区域 -->
        <div class="chart-container" ref="chartContainer">
          <!-- 饼图 -->
          <div v-if="chartType === 'pie'" class="pie-chart">
            <div class="flex flex-col lg:flex-row items-center gap-8">
              <!-- 饼图可视化 -->
              <div class="flex-1 flex justify-center">
                <div class="relative w-64 h-64">
                  <!-- SVG 饼图 -->
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                    <!-- 正面情感弧 -->
                    <circle cx="50" cy="50" r="40" fill="none" 
                            stroke="#10b981" stroke-width="8"
                            :stroke-dasharray="`${getPercentage(statistics.positive) * 2.51} 251`"
                            stroke-dashoffset="0"/>
                    <!-- 负面情感弧 -->
                    <circle cx="50" cy="50" r="40" fill="none" 
                            stroke="#ef4444" stroke-width="8"
                            :stroke-dasharray="`${getPercentage(statistics.negative) * 2.51} 251`"
                            :stroke-dashoffset="-${getPercentage(statistics.positive) * 2.51}"/>
                    <!-- 中性情感弧 -->
                    <circle cx="50" cy="50" r="40" fill="none" 
                            stroke="#f59e0b" stroke-width="8"
                            :stroke-dasharray="`${getPercentage(statistics.neutral) * 2.51} 251`"
                            :stroke-dashoffset="-${(getPercentage(statistics.positive) + getPercentage(statistics.negative)) * 2.51}"/>
                  </svg>
                  <!-- 中心文字 -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-2xl font-bold">{{ statistics.total }}</div>
                      <div class="text-sm text-base-content/70">总评论数</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 图例 -->
              <div class="flex-1">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-success rounded"></div>
                    <div class="flex-1">
                      <div class="flex justify-between">
                        <span>正面评论</span>
                        <span class="font-semibold">{{ statistics.positive }}</span>
                      </div>
                      <div class="text-sm text-base-content/70">{{ getPercentage(statistics.positive) }}%</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-error rounded"></div>
                    <div class="flex-1">
                      <div class="flex justify-between">
                        <span>负面评论</span>
                        <span class="font-semibold">{{ statistics.negative }}</span>
                      </div>
                      <div class="text-sm text-base-content/70">{{ getPercentage(statistics.negative) }}%</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 bg-warning rounded"></div>
                    <div class="flex-1">
                      <div class="flex justify-between">
                        <span>中性评论</span>
                        <span class="font-semibold">{{ statistics.neutral }}</span>
                      </div>
                      <div class="text-sm text-base-content/70">{{ getPercentage(statistics.neutral) }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 柱状图 -->
          <div v-if="chartType === 'bar'" class="bar-chart">
            <div class="h-64 flex items-end justify-center gap-8 p-4">
              <!-- 正面柱 -->
              <div class="flex flex-col items-center">
                <div class="text-sm font-semibold mb-2">{{ statistics.positive }}</div>
                <div class="w-16 bg-success rounded-t transition-all duration-1000" 
                     :style="`height: ${getPercentage(statistics.positive) * 2}px`">
                </div>
                <div class="text-sm mt-2">正面</div>
                <div class="text-xs text-base-content/70">{{ getPercentage(statistics.positive) }}%</div>
              </div>
              
              <!-- 负面柱 -->
              <div class="flex flex-col items-center">
                <div class="text-sm font-semibold mb-2">{{ statistics.negative }}</div>
                <div class="w-16 bg-error rounded-t transition-all duration-1000" 
                     :style="`height: ${getPercentage(statistics.negative) * 2}px`">
                </div>
                <div class="text-sm mt-2">负面</div>
                <div class="text-xs text-base-content/70">{{ getPercentage(statistics.negative) }}%</div>
              </div>
              
              <!-- 中性柱 -->
              <div class="flex flex-col items-center">
                <div class="text-sm font-semibold mb-2">{{ statistics.neutral }}</div>
                <div class="w-16 bg-warning rounded-t transition-all duration-1000" 
                     :style="`height: ${getPercentage(statistics.neutral) * 2}px`">
                </div>
                <div class="text-sm mt-2">中性</div>
                <div class="text-xs text-base-content/70">{{ getPercentage(statistics.neutral) }}%</div>
              </div>
            </div>
          </div>
          
          <!-- 趋势图 -->
          <div v-if="chartType === 'trend' && trendData && trendData.length > 0" class="trend-chart">
            <div class="h-64 p-4">
              <svg class="w-full h-full" viewBox="0 0 400 200">
                <!-- 网格线 -->
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                <!-- 趋势线 -->
                <polyline 
                  :points="getTrendPoints('positive')"
                  fill="none" stroke="#10b981" stroke-width="2"/>
                <polyline 
                  :points="getTrendPoints('negative')"
                  fill="none" stroke="#ef4444" stroke-width="2"/>
                <polyline 
                  :points="getTrendPoints('neutral')"
                  fill="none" stroke="#f59e0b" stroke-width="2"/>
                  
                <!-- 数据点 -->
                <g v-for="(point, index) in trendData" :key="index">
                  <circle :cx="getX(index)" :cy="getY(point.positive)" r="3" fill="#10b981"/>
                  <circle :cx="getX(index)" :cy="getY(point.negative)" r="3" fill="#ef4444"/>
                  <circle :cx="getX(index)" :cy="getY(point.neutral)" r="3" fill="#f59e0b"/>
                </g>
              </svg>
              
              <!-- 图例 -->
              <div class="flex justify-center gap-6 mt-4">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-success rounded-full"></div>
                  <span class="text-sm">正面</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-error rounded-full"></div>
                  <span class="text-sm">负面</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-warning rounded-full"></div>
                  <span class="text-sm">中性</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 详细分析 -->
        <div v-if="showDetails" class="mt-6 pt-6 border-t border-base-300">
          <h4 class="font-medium mb-4">📋 详细分析</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-base-100 p-4 rounded-lg">
              <h5 class="font-medium mb-2">情感分布</h5>
              <div class="text-sm text-base-content/70">
                <p>正面情感占主导地位，表明整体评价较为积极。</p>
                <p>建议关注负面评论中的具体问题，进行针对性改进。</p>
              </div>
            </div>
            <div class="bg-base-100 p-4 rounded-lg">
              <h5 class="font-medium mb-2">建议措施</h5>
              <div class="text-sm text-base-content/70">
                <p>• 维持现有优势，继续提升用户满意度</p>
                <p>• 分析负面评论，识别改进机会</p>
                <p>• 关注中性评论，挖掘潜在需求</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions justify-end mt-6">
          <button class="btn btn-sm btn-outline" @click="showDetails = !showDetails">
            {{ showDetails ? '隐藏' : '显示' }}详细分析
          </button>
          <button class="btn btn-sm btn-outline" @click="exportChart">
            📥 导出图表
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface SentimentStatistics {
  total: number
  positive: number
  negative: number
  neutral: number
}

interface TrendDataPoint {
  date: string
  positive: number
  negative: number
  neutral: number
}

interface Props {
  statistics: SentimentStatistics
  trendData?: TrendDataPoint[]
  showDetails?: boolean
}

// 定义属性
const props = withDefaults(defineProps<Props>(), {
  showDetails: true
})

// 定义事件
const emit = defineEmits<{
  export: [type: string]
}>()

// 响应式数据
const chartType = ref<'pie' | 'bar' | 'trend'>('pie')
const showDetails = ref(props.showDetails)
const chartContainer = ref<HTMLElement>()

// 计算属性
const getPercentage = (value: number) => {
  if (props.statistics.total === 0) return 0
  return Math.round((value / props.statistics.total) * 100)
}

// 趋势图相关方法
const getX = (index: number) => {
  if (!props.trendData) return 0
  return (index / (props.trendData.length - 1)) * 360 + 20
}

const getY = (value: number) => {
  const maxValue = Math.max(
    ...(props.trendData?.flatMap(d => [d.positive, d.negative, d.neutral]) || [100])
  )
  return 180 - (value / maxValue) * 160
}

const getTrendPoints = (sentiment: 'positive' | 'negative' | 'neutral') => {
  if (!props.trendData) return ''
  return props.trendData
    .map((point, index) => `${getX(index)},${getY(point[sentiment])}`)
    .join(' ')
}

// 方法
const exportChart = () => {
  emit('export', chartType.value)
}
</script>

<style scoped>
.sentiment-chart {
  @apply w-full;
}

.chart-container {
  @apply min-h-64;
}

.pie-chart svg {
  @apply drop-shadow-sm;
}

.bar-chart {
  @apply bg-base-100 rounded-lg;
}

.trend-chart svg {
  @apply border border-base-300 rounded;
}

/* 动画效果 */
.pie-chart circle {
  transition: stroke-dasharray 1s ease-in-out;
}

.bar-chart > div > div {
  transition: height 1s ease-in-out;
}

.trend-chart polyline {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-in-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
</style>