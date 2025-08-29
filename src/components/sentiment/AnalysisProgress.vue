<template>
  <div class="analysis-progress">
    <div class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <!-- 进度标题 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="card-title flex items-center gap-2">
            <span class="loading loading-spinner loading-sm" v-if="isAnalyzing"></span>
            <span v-else-if="isCompleted">✅</span>
            <span v-else>📊</span>
            {{ getStatusText() }}
          </h3>
          <div class="text-sm text-base-content/70">
            {{ currentStep }}/{{ totalSteps }}
          </div>
        </div>
        
        <!-- 总体进度条 -->
        <div class="mb-6">
          <div class="flex justify-between text-sm mb-2">
            <span>总体进度</span>
            <span>{{ Math.round(overallProgress) }}%</span>
          </div>
          <div class="w-full bg-base-300 rounded-full h-3">
            <div class="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                 :style="`width: ${overallProgress}%`">
            </div>
          </div>
        </div>
        
        <!-- 详细步骤 -->
        <div class="space-y-4">
          <!-- 文件解析步骤 -->
          <div class="step-item">
            <div class="flex items-center gap-3 mb-2">
              <div class="step-icon">
                <span v-if="steps.parsing.status === 'completed'">✅</span>
                <span v-else-if="steps.parsing.status === 'processing'" class="loading loading-spinner loading-xs"></span>
                <span v-else>⏳</span>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium">📄 文件解析</span>
                  <span class="text-sm text-base-content/70">{{ steps.parsing.processed }}/{{ steps.parsing.total }}</span>
                </div>
              </div>
            </div>
            <div class="ml-8">
              <div class="w-full bg-base-300 rounded-full h-2">
                <div class="bg-info h-2 rounded-full transition-all duration-300"
                     :style="`width: ${getStepProgress('parsing')}%`">
                </div>
              </div>
              <div class="text-xs text-base-content/60 mt-1">{{ steps.parsing.message }}</div>
            </div>
          </div>
          
          <!-- 数据预处理步骤 -->
          <div class="step-item">
            <div class="flex items-center gap-3 mb-2">
              <div class="step-icon">
                <span v-if="steps.preprocessing.status === 'completed'">✅</span>
                <span v-else-if="steps.preprocessing.status === 'processing'" class="loading loading-spinner loading-xs"></span>
                <span v-else>⏳</span>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium">🔧 数据预处理</span>
                  <span class="text-sm text-base-content/70">{{ steps.preprocessing.processed }}/{{ steps.preprocessing.total }}</span>
                </div>
              </div>
            </div>
            <div class="ml-8">
              <div class="w-full bg-base-300 rounded-full h-2">
                <div class="bg-warning h-2 rounded-full transition-all duration-300"
                     :style="`width: ${getStepProgress('preprocessing')}%`">
                </div>
              </div>
              <div class="text-xs text-base-content/60 mt-1">{{ steps.preprocessing.message }}</div>
            </div>
          </div>
          
          <!-- 情感分析步骤 -->
          <div class="step-item">
            <div class="flex items-center gap-3 mb-2">
              <div class="step-icon">
                <span v-if="steps.analysis.status === 'completed'">✅</span>
                <span v-else-if="steps.analysis.status === 'processing'" class="loading loading-spinner loading-xs"></span>
                <span v-else>⏳</span>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium">🧠 情感分析</span>
                  <span class="text-sm text-base-content/70">{{ steps.analysis.processed }}/{{ steps.analysis.total }}</span>
                </div>
              </div>
            </div>
            <div class="ml-8">
              <div class="w-full bg-base-300 rounded-full h-2">
                <div class="bg-success h-2 rounded-full transition-all duration-300"
                     :style="`width: ${getStepProgress('analysis')}%`">
                </div>
              </div>
              <div class="text-xs text-base-content/60 mt-1">{{ steps.analysis.message }}</div>
            </div>
          </div>
          
          <!-- 结果生成步骤 -->
          <div class="step-item">
            <div class="flex items-center gap-3 mb-2">
              <div class="step-icon">
                <span v-if="steps.generating.status === 'completed'">✅</span>
                <span v-else-if="steps.generating.status === 'processing'" class="loading loading-spinner loading-xs"></span>
                <span v-else>⏳</span>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium">📊 结果生成</span>
                  <span class="text-sm text-base-content/70">{{ steps.generating.processed }}/{{ steps.generating.total }}</span>
                </div>
              </div>
            </div>
            <div class="ml-8">
              <div class="w-full bg-base-300 rounded-full h-2">
                <div class="bg-accent h-2 rounded-full transition-all duration-300"
                     :style="`width: ${getStepProgress('generating')}%`">
                </div>
              </div>
              <div class="text-xs text-base-content/60 mt-1">{{ steps.generating.message }}</div>
            </div>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="mt-6 p-4 bg-base-100 rounded-lg">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-lg font-bold text-primary">{{ statistics.processed }}</div>
              <div class="text-xs text-base-content/70">已处理</div>
            </div>
            <div>
              <div class="text-lg font-bold text-success">{{ statistics.success }}</div>
              <div class="text-xs text-base-content/70">成功</div>
            </div>
            <div>
              <div class="text-lg font-bold text-error">{{ statistics.failed }}</div>
              <div class="text-xs text-base-content/70">失败</div>
            </div>
            <div>
              <div class="text-lg font-bold text-info">{{ formatTime(statistics.elapsed) }}</div>
              <div class="text-xs text-base-content/70">耗时</div>
            </div>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="errors.length > 0" class="mt-4">
          <div class="collapse collapse-arrow bg-error/10 border border-error/20">
            <input type="checkbox" class="peer" /> 
            <div class="collapse-title text-error font-medium">
              ⚠️ 错误信息 ({{ errors.length }})
            </div>
            <div class="collapse-content text-error/80">
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="(error, index) in errors" :key="index" class="text-sm">
                  <span class="font-medium">行 {{ error.line }}:</span> {{ error.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions justify-end mt-6">
          <button v-if="isAnalyzing" class="btn btn-sm btn-outline btn-error" @click="cancelAnalysis">
            ❌ 取消分析
          </button>
          <button v-if="isCompleted" class="btn btn-sm btn-outline btn-success" @click="downloadResults">
            📥 下载结果
          </button>
          <button v-if="isCompleted" class="btn btn-sm btn-primary" @click="viewResults">
            👁️ 查看结果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 定义接口
interface StepStatus {
  status: 'pending' | 'processing' | 'completed' | 'error'
  processed: number
  total: number
  message: string
}

interface AnalysisSteps {
  parsing: StepStatus
  preprocessing: StepStatus
  analysis: StepStatus
  generating: StepStatus
}

interface AnalysisStatistics {
  processed: number
  success: number
  failed: number
  elapsed: number // 秒
}

interface AnalysisError {
  line: number
  message: string
}

interface Props {
  steps: AnalysisSteps
  statistics: AnalysisStatistics
  errors?: AnalysisError[]
  isAnalyzing?: boolean
}

// 定义属性
const props = withDefaults(defineProps<Props>(), {
  errors: () => [],
  isAnalyzing: false
})

// 定义事件
const emit = defineEmits<{
  cancel: []
  download: []
  viewResults: []
}>()

// 计算属性
const totalSteps = computed(() => 4)

const currentStep = computed(() => {
  const stepKeys = ['parsing', 'preprocessing', 'analysis', 'generating'] as const
  let current = 0
  for (const key of stepKeys) {
    if (props.steps[key].status === 'completed') {
      current++
    } else if (props.steps[key].status === 'processing') {
      current++
      break
    } else {
      break
    }
  }
  return current
})

const overallProgress = computed(() => {
  const stepKeys = ['parsing', 'preprocessing', 'analysis', 'generating'] as const
  let totalProgress = 0
  
  for (const key of stepKeys) {
    const step = props.steps[key]
    if (step.status === 'completed') {
      totalProgress += 25
    } else if (step.status === 'processing') {
      const stepProgress = step.total > 0 ? (step.processed / step.total) * 25 : 0
      totalProgress += stepProgress
    }
  }
  
  return Math.min(totalProgress, 100)
})

const isCompleted = computed(() => {
  const stepKeys = ['parsing', 'preprocessing', 'analysis', 'generating'] as const
  return stepKeys.every(key => props.steps[key].status === 'completed')
})

// 方法
const getStepProgress = (stepKey: keyof AnalysisSteps) => {
  const step = props.steps[stepKey]
  if (step.status === 'completed') return 100
  if (step.status === 'processing' && step.total > 0) {
    return Math.min((step.processed / step.total) * 100, 100)
  }
  return 0
}

const getStatusText = () => {
  if (isCompleted.value) return '分析完成'
  if (props.isAnalyzing) return '正在分析...'
  return '准备分析'
}

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

const cancelAnalysis = () => {
  emit('cancel')
}

const downloadResults = () => {
  emit('download')
}

const viewResults = () => {
  emit('viewResults')
}
</script>

<style scoped>
.analysis-progress {
  @apply w-full;
}

.step-item {
  @apply transition-all duration-300;
}

.step-icon {
  @apply w-6 h-6 flex items-center justify-center;
}

/* 进度条动画 */
.step-item .bg-info,
.step-item .bg-warning,
.step-item .bg-success,
.step-item .bg-accent {
  transition: width 0.5s ease-out;
}

/* 加载动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.step-item[data-processing="true"] {
  animation: pulse 2s infinite;
}
</style>