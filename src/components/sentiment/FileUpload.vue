<template>
  <div class="file-upload">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <!-- 上传区域标题 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="card-title">📁 文件上传</h3>
          <div class="text-sm text-base-content/70">
            支持格式: {{ supportedFormats.join(', ') }}
          </div>
        </div>
        
        <!-- 拖拽上传区域 -->
        <div class="upload-zone"
             :class="{
               'border-primary bg-primary/5': isDragOver,
               'border-error bg-error/5': hasError,
               'border-success bg-success/5': isUploaded
             }"
             @drop="handleDrop"
             @dragover="handleDragOver"
             @dragenter="handleDragEnter"
             @dragleave="handleDragLeave"
             @click="triggerFileInput">
          
          <!-- 上传状态图标 -->
          <div class="text-center">
            <div class="mb-4">
              <span v-if="isUploading" class="loading loading-spinner loading-lg text-primary"></span>
              <span v-else-if="isUploaded" class="text-6xl">✅</span>
              <span v-else-if="hasError" class="text-6xl">❌</span>
              <span v-else class="text-6xl">📁</span>
            </div>
            
            <!-- 上传提示文字 -->
            <div class="space-y-2">
              <div class="text-lg font-medium">
                <span v-if="isUploading">正在上传...</span>
                <span v-else-if="isUploaded">上传成功</span>
                <span v-else-if="hasError">上传失败</span>
                <span v-else>拖拽文件到此处或点击选择</span>
              </div>
              
              <div class="text-sm text-base-content/70">
                <span v-if="!isUploaded && !hasError">
                  最大文件大小: {{ formatFileSize(maxFileSize) }}
                </span>
                <span v-else-if="uploadedFile">
                  {{ uploadedFile.name }} ({{ formatFileSize(uploadedFile.size) }})
                </span>
              </div>
            </div>
            
            <!-- 上传进度 -->
            <div v-if="isUploading" class="w-full max-w-xs mx-auto mt-4">
              <div class="flex justify-between text-sm mb-1">
                <span>上传进度</span>
                <span>{{ Math.round(uploadProgress) }}%</span>
              </div>
              <div class="w-full bg-base-300 rounded-full h-2">
                <div class="bg-primary h-2 rounded-full transition-all duration-300"
                     :style="`width: ${uploadProgress}%`">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 隐藏的文件输入 -->
        <input ref="fileInput"
               type="file"
               class="hidden"
               :accept="acceptedTypes"
               @change="handleFileSelect" />
        
        <!-- 文件信息展示 -->
        <div v-if="uploadedFile && !hasError" class="mt-4">
          <div class="bg-base-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium">📄 文件信息</h4>
              <button class="btn btn-ghost btn-sm btn-circle" @click="removeFile">
                ❌
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-base-content/70 mb-1">文件名</div>
                <div class="font-medium">{{ uploadedFile.name }}</div>
              </div>
              <div>
                <div class="text-sm text-base-content/70 mb-1">文件大小</div>
                <div class="font-medium">{{ formatFileSize(uploadedFile.size) }}</div>
              </div>
              <div>
                <div class="text-sm text-base-content/70 mb-1">文件类型</div>
                <div class="font-medium">{{ getFileType(uploadedFile.name) }}</div>
              </div>
              <div>
                <div class="text-sm text-base-content/70 mb-1">上传时间</div>
                <div class="font-medium">{{ formatDate(new Date()) }}</div>
              </div>
            </div>
            
            <!-- 预览数据 -->
            <div v-if="previewData && previewData.length > 0" class="mt-4">
              <div class="text-sm text-base-content/70 mb-2">数据预览 (前5行)</div>
              <div class="overflow-x-auto">
                <table class="table table-sm table-zebra">
                  <thead>
                    <tr>
                      <th v-for="(header, index) in previewHeaders" :key="index">
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                      <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="max-w-xs truncate">
                        {{ cell }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="text-xs text-base-content/60 mt-2">
                总共 {{ totalRows }} 行数据
              </div>
            </div>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="errorMessage" class="mt-4">
          <div class="alert alert-error">
            <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
        
        <!-- 上传选项 -->
        <div v-if="!isUploading" class="mt-4">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">包含表头</span>
              <input type="checkbox" v-model="hasHeader" class="checkbox checkbox-primary" />
            </label>
          </div>
          
          <div v-if="uploadedFile" class="form-control mt-2">
            <label class="label">
              <span class="label-text">评论内容列</span>
            </label>
            <select v-model="commentColumn" class="select select-bordered select-sm">
              <option value="">请选择评论内容列</option>
              <option v-for="(header, index) in previewHeaders" :key="index" :value="header">
                {{ header }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions justify-end mt-6">
          <button v-if="uploadedFile && !isUploading" 
                  class="btn btn-outline btn-sm" 
                  @click="removeFile">
            🗑️ 移除文件
          </button>
          <button v-if="!uploadedFile && !isUploading" 
                  class="btn btn-primary btn-sm" 
                  @click="triggerFileInput">
            📁 选择文件
          </button>
          <button v-if="uploadedFile && !isUploading && commentColumn" 
                  class="btn btn-primary btn-sm" 
                  @click="startAnalysis">
            🚀 开始分析
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface UploadedFile {
  name: string
  size: number
  type: string
  content?: string
}

interface Props {
  maxFileSize?: number // bytes
  supportedFormats?: string[]
  acceptMultiple?: boolean
}

// 定义属性
const props = withDefaults(defineProps<Props>(), {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: () => ['CSV', 'Excel', 'TXT'],
  acceptMultiple: false
})

// 定义事件
const emit = defineEmits<{
  fileUploaded: [file: UploadedFile, options: { hasHeader: boolean, commentColumn: string }]
  startAnalysis: [file: UploadedFile, options: { hasHeader: boolean, commentColumn: string }]
  error: [message: string]
}>()

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const isUploading = ref(false)
const isUploaded = ref(false)
const hasError = ref(false)
const uploadProgress = ref(0)
const uploadedFile = ref<UploadedFile | null>(null)
const errorMessage = ref('')
const previewData = ref<string[][]>([])
const previewHeaders = ref<string[]>([])
const totalRows = ref(0)
const hasHeader = ref(true)
const commentColumn = ref('')

// 计算属性
const acceptedTypes = computed(() => {
  const typeMap: Record<string, string> = {
    'CSV': '.csv',
    'Excel': '.xlsx,.xls',
    'TXT': '.txt'
  }
  return props.supportedFormats.map(format => typeMap[format] || '').join(',')
})

// 方法
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

const handleFile = async (file: File) => {
  // 重置状态
  hasError.value = false
  errorMessage.value = ''
  
  // 验证文件
  if (!validateFile(file)) {
    return
  }
  
  // 开始上传
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value += Math.random() * 30
      if (uploadProgress.value >= 90) {
        clearInterval(progressInterval)
      }
    }, 200)
    
    // 读取文件内容
    const content = await readFileContent(file)
    
    // 解析文件数据
    await parseFileData(content, file.name)
    
    // 完成上传
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    setTimeout(() => {
      isUploading.value = false
      isUploaded.value = true
      
      uploadedFile.value = {
        name: file.name,
        size: file.size,
        type: file.type,
        content
      }
      
      emit('fileUploaded', uploadedFile.value, {
        hasHeader: hasHeader.value,
        commentColumn: commentColumn.value
      })
    }, 500)
    
  } catch (error) {
    isUploading.value = false
    hasError.value = true
    errorMessage.value = error instanceof Error ? error.message : '文件上传失败'
    emit('error', errorMessage.value)
  }
}

const validateFile = (file: File): boolean => {
  // 检查文件大小
  if (file.size > props.maxFileSize) {
    hasError.value = true
    errorMessage.value = `文件大小超过限制 (${formatFileSize(props.maxFileSize)})`
    return false
  }
  
  // 检查文件类型
  const fileExtension = getFileExtension(file.name)
  const supportedExtensions = props.supportedFormats.map(format => {
    switch (format) {
      case 'CSV': return 'csv'
      case 'Excel': return ['xlsx', 'xls']
      case 'TXT': return 'txt'
      default: return []
    }
  }).flat()
  
  if (!supportedExtensions.includes(fileExtension)) {
    hasError.value = true
    errorMessage.value = `不支持的文件格式: ${fileExtension}`
    return false
  }
  
  return true
}

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsText(file, 'UTF-8')
  })
}

const parseFileData = async (content: string, fileName: string) => {
  const fileType = getFileType(fileName)
  
  try {
    if (fileType === 'CSV' || fileType === 'TXT') {
      parseCsvData(content)
    } else {
      throw new Error('暂不支持此文件格式的预览')
    }
  } catch (error) {
    throw new Error('文件解析失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

const parseCsvData = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim())
  totalRows.value = lines.length
  
  if (lines.length === 0) {
    throw new Error('文件为空')
  }
  
  // 解析CSV数据
  const data = lines.map(line => {
    // 简单的CSV解析，实际项目中应使用专业的CSV解析库
    return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  })
  
  if (hasHeader.value && data.length > 0) {
    previewHeaders.value = data[0]
    previewData.value = data.slice(1)
    totalRows.value = data.length - 1
  } else {
    previewHeaders.value = data[0]?.map((_, index) => `列${index + 1}`) || []
    previewData.value = data
  }
  
  // 自动选择可能的评论列
  if (previewHeaders.value.length > 0) {
    const commentKeywords = ['评论', '内容', 'comment', 'content', 'text', '文本']
    const possibleColumn = previewHeaders.value.find(header => 
      commentKeywords.some(keyword => 
        header.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    if (possibleColumn) {
      commentColumn.value = possibleColumn
    } else {
      commentColumn.value = previewHeaders.value[0]
    }
  }
}

const removeFile = () => {
  uploadedFile.value = null
  isUploaded.value = false
  hasError.value = false
  errorMessage.value = ''
  previewData.value = []
  previewHeaders.value = []
  totalRows.value = 0
  commentColumn.value = ''
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const startAnalysis = () => {
  if (uploadedFile.value && commentColumn.value) {
    emit('startAnalysis', uploadedFile.value, {
      hasHeader: hasHeader.value,
      commentColumn: commentColumn.value
    })
  }
}

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

const getFileType = (fileName: string): string => {
  const extension = getFileExtension(fileName)
  switch (extension) {
    case 'csv': return 'CSV'
    case 'xlsx':
    case 'xls': return 'Excel'
    case 'txt': return 'TXT'
    default: return '未知'
  }
}

const formatDate = (date: Date): string => {
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.file-upload {
  @apply w-full;
}

.upload-zone {
  @apply border-2 border-dashed border-base-300 rounded-lg p-8 cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5;
}

.upload-zone:hover {
  transform: translateY(-2px);
}

/* 拖拽状态样式 */
.upload-zone.border-primary {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 表格样式 */
.table th,
.table td {
  @apply text-xs;
}

.table td {
  @apply max-w-xs overflow-hidden text-ellipsis whitespace-nowrap;
}
</style>