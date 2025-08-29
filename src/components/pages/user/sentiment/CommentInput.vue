<template>
  <div class="card bg-base-100 shadow mb-6">
    <div class="card-body">
      <h3 class="card-title mb-4">输入评论内容</h3>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">评论文本</span>
          <span class="label-text-alt">{{ commentText.length }}/{{ maxLength }}</span>
        </label>
        <textarea 
          class="textarea textarea-bordered h-32" 
          placeholder="请输入要分析的评论内容..."
          :value="commentText"
          @input="handleTextChange"
          :maxlength="maxLength"
        ></textarea>
      </div>

      <!-- 快速示例 -->
      <div class="mt-4">
        <div class="text-sm text-gray-500 mb-2">快速示例：</div>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="example in examples" 
            :key="example.id"
            class="btn btn-outline btn-sm"
            @click="$emit('useExample', example.text)"
          >
            {{ example.label }}
          </button>
        </div>
      </div>

      <!-- 分析按钮 -->
      <div class="card-actions justify-end mt-4">
        <button 
          class="btn btn-primary" 
          :class="{ 'loading': isAnalyzing }"
          :disabled="!commentText.trim() || isAnalyzing"
          @click="$emit('analyze')"
        >
          <span v-if="!isAnalyzing">开始分析</span>
          <span v-else>分析中...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Example {
  id: number
  label: string
  text: string
}

const props = defineProps<{
  commentText: string
  isAnalyzing: boolean
  maxLength?: number
}>()

defineEmits<{
  'update:commentText': [value: string]
  'useExample': [text: string]
  'analyze': []
}>()

// 处理文本变化
const handleTextChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:commentText', target.value)
}

const emit = defineEmits<{
  'update:commentText': [value: string]
  'useExample': [text: string]
  'analyze': []
}>()

// 快速示例数据
const examples: Example[] = [
  {
    id: 1,
    label: '正面示例',
    text: '这个产品真的很棒！质量超出预期，物流也很快，客服态度很好，强烈推荐！'
  },
  {
    id: 2,
    label: '负面示例',
    text: '产品质量太差了，包装破损，客服态度恶劣，完全不推荐购买。'
  },
  {
    id: 3,
    label: '中性示例',
    text: '产品还可以，价格合理，但是没有什么特别突出的地方。'
  },
  {
    id: 4,
    label: '复杂示例',
    text: '整体来说还不错，虽然有些小瑕疵，但是考虑到价格，性价比还是可以接受的。'
  }
]

// 默认最大长度
const maxLength = props.maxLength || 500
</script>

<style scoped>
/* 评论输入组件样式 */
</style>