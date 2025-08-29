<template>
  <div class="card bg-base-100 shadow-lg mb-8 border border-gray-100">
    <div class="card-body p-8">
      <!-- 标题区域 -->
      <div class="mb-6">
        <h3 class="card-title text-xl font-semibold text-gray-800 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          输入评论内容
        </h3>
        <p class="text-sm text-gray-500">请输入您想要分析的评论文本，我们将为您提供详细的情感分析结果</p>
      </div>
      
      <!-- 文本输入区域 -->
      <div class="form-control mb-6">
        <div class="flex items-start gap-3">
          <span class="label-text font-medium text-gray-700 mt-3">评论文本</span>
          <div class="flex-1 relative">
            <textarea 
              class="textarea textarea-bordered w-full h-36 resize-none focus:border-primary focus:outline-none transition-colors duration-200 pr-16" 
              placeholder="请输入要分析的评论内容...\n\n例如：这个产品真的很棒！质量超出预期，物流也很快..."
              :value="commentText"
              @input="handleTextChange"
              :maxlength="maxLength"
            ></textarea>
            <span class="absolute bottom-2 right-2 text-xs" :class="commentText.length > maxLength * 0.8 ? 'text-warning' : 'text-gray-400'">
              {{ commentText.length }}/{{ maxLength }}
            </span>
          </div>
        </div>
      </div>

      <!-- 快速示例区域 -->
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-sm font-medium text-gray-600">快速示例</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            v-for="example in examples" 
            :key="example.id"
            class="btn btn-outline btn-sm h-auto py-3 px-4 text-left justify-start hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
            @click="$emit('useExample', example.text)"
          >
            <div class="flex flex-col items-start">
              <span class="font-medium text-xs mb-1">{{ example.label }}</span>
              <span class="text-xs opacity-70 line-clamp-2">{{ example.text.substring(0, 30) }}...</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 分析按钮区域 -->
      <div class="flex justify-end pt-4 border-t border-gray-100">
        <button 
          class="btn btn-primary btn-lg px-8 shadow-md hover:shadow-lg transition-all duration-200" 
          :class="{ 'loading': isAnalyzing }"
          :disabled="!commentText.trim() || isAnalyzing"
          @click="$emit('analyze')"
        >
          <svg v-if="!isAnalyzing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
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

const emit = defineEmits<{
  'update:commentText': [value: string]
  'useExample': [text: string]
  'analyze': []
}>()

// 处理文本变化
const handleTextChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:commentText', target.value)
}

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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 文本域聚焦效果 */
.textarea:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 按钮悬停效果增强 */
.btn:hover {
  transform: translateY(-1px);
}

/* 卡片悬停效果 */
.card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;
}

/* 示例按钮特殊样式 */
.btn-outline:hover .opacity-70 {
  opacity: 1;
}
</style>
