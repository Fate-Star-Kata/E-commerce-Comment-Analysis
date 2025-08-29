<template>
  <div class="steps w-full mb-8">
    <div 
      v-for="(step, index) in steps" 
      :key="step.id"
      class="step" 
      :class="{
        'step-primary': index + 1 <= currentStep,
        'step-accent': index + 1 === currentStep
      }"
    >
      <div class="flex flex-col items-center">
        <span class="text-sm font-medium">{{ step.title }}</span>
        <span class="text-xs text-gray-500 mt-1">{{ step.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  id: number
  title: string
  description: string
}

defineProps<{
  currentStep: number
}>()

// 步骤数据
const steps: Step[] = [
  {
    id: 1,
    title: '上传文件',
    description: '选择数据文件'
  },
  {
    id: 2,
    title: '数据预览',
    description: '确认数据格式'
  },
  {
    id: 3,
    title: '分析处理',
    description: '执行情感分析'
  },
  {
    id: 4,
    title: '结果展示',
    description: '查看分析结果'
  }
]
</script>

<style scoped>
/* 步骤指示器组件样式 */
.steps .step {
  @apply text-base-content/50;
}

.steps .step-primary {
  @apply text-primary;
}

.steps .step-accent {
  @apply text-accent;
}
</style>