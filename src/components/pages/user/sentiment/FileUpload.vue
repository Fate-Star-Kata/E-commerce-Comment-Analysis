<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title mb-4">文件上传</h3>
      
      <!-- 文件上传区域 -->
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
        :class="{ 'border-primary bg-primary/5': isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @dragenter.prevent
      >
        <div v-if="!selectedFile">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-lg font-medium text-gray-700 mb-2">拖拽文件到此处或点击选择</p>
          <p class="text-sm text-gray-500 mb-4">支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式</p>
          <input 
            ref="fileInput"
            type="file" 
            class="hidden" 
            accept=".xlsx,.xls,.csv"
            @change="handleFileSelect"
          />
          <button class="btn btn-primary" @click="fileInput?.click()">
            选择文件
          </button>
        </div>
        
        <!-- 已选文件信息 -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-lg font-medium text-success">文件已选择</span>
          </div>
          
          <div class="bg-base-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button class="btn btn-ghost btn-sm" @click="removeFile">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <button class="btn btn-outline" @click="fileInput?.click()">
            重新选择文件
          </button>
        </div>
      </div>

      <!-- 列映射配置 -->
      <div v-if="selectedFile" class="mt-6">
        <h4 class="font-semibold mb-4">列映射配置</h4>
        <div class="alert alert-info mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>请指定文件中包含评论内容和商品ID的列名</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">评论内容列 *</span>
            </label>
            <input 
              type="text" 
              placeholder="例如: content, comment, review" 
              class="input input-bordered" 
              :value="columnMapping.content"
              @input="updateColumnMapping('content', ($event.target as HTMLInputElement).value)"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">商品ID列（可选）</span>
            </label>
            <input 
              type="text" 
              placeholder="例如: product_id, id, sku" 
              class="input input-bordered" 
              :value="columnMapping.productId"
              @input="updateColumnMapping('productId', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="card-actions justify-end mt-6">
        <button 
          class="btn btn-primary" 
          :disabled="!selectedFile || !columnMapping.content.trim()"
          @click="$emit('next')"
        >
          下一步：预览数据
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ColumnMapping {
  content: string
  productId: string
}

const props = defineProps<{
  selectedFile: File | null
  columnMapping: ColumnMapping
}>()

defineEmits<{
  'update:selectedFile': [file: File | null]
  'update:columnMapping': [mapping: ColumnMapping]
  'next': []
}>()

const emit = defineEmits<{
  'update:selectedFile': [file: File | null]
  'update:columnMapping': [mapping: ColumnMapping]
  'next': []
}>()

// 文件输入引用
const fileInput = ref<HTMLInputElement>()

// 拖拽状态
const isDragOver = ref(false)

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

// 处理文件
const handleFile = (file: File) => {
  // 验证文件类型
  const allowedTypes = ['.xlsx', '.xls', '.csv']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!allowedTypes.includes(fileExtension)) {
    alert('请选择支持的文件格式：Excel (.xlsx, .xls) 或 CSV (.csv)')
    return
  }

  emit('update:selectedFile', file)
}

// 移除文件
const removeFile = () => {
  emit('update:selectedFile', null)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 更新列映射
const updateColumnMapping = (key: keyof ColumnMapping, value: string) => {
  const newMapping = { ...props.columnMapping }
  newMapping[key] = value
  emit('update:columnMapping', newMapping)
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* 文件上传组件样式 */
</style>