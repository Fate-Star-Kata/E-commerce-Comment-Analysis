<template>
  <div class="flex justify-center mt-6" v-if="totalPages > 1">
    <div class="join">
      <button 
        class="join-item btn" 
        :class="{ 'btn-disabled': currentPage === 1 }"
        @click="$emit('update:currentPage', currentPage - 1)"
        :disabled="currentPage === 1"
      >
        «
      </button>
      
      <template v-for="page in visiblePages" :key="page">
        <button 
          v-if="page !== '...'"
          class="join-item btn" 
          :class="{ 'btn-active': page === currentPage }"
          @click="$emit('update:currentPage', page as number)"
        >
          {{ page }}
        </button>
        <span v-else class="join-item btn btn-disabled">...</span>
      </template>
      
      <button 
        class="join-item btn" 
        :class="{ 'btn-disabled': currentPage === totalPages }"
        @click="$emit('update:currentPage', currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        »
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}>()

defineEmits<{
  'update:currentPage': [page: number]
}>()

// 计算可见页码
const visiblePages = computed(() => {
  const maxVisible = props.maxVisiblePages || 7
  const pages: (number | string)[] = []
  
  if (props.totalPages <= maxVisible) {
    // 如果总页数小于等于最大可见页数，显示所有页码
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 复杂分页逻辑
    const halfVisible = Math.floor(maxVisible / 2)
    
    if (props.currentPage <= halfVisible + 1) {
      // 当前页在前半部分
      for (let i = 1; i <= maxVisible - 2; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(props.totalPages)
    } else if (props.currentPage >= props.totalPages - halfVisible) {
      // 当前页在后半部分
      pages.push(1)
      pages.push('...')
      for (let i = props.totalPages - (maxVisible - 3); i <= props.totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间部分
      pages.push(1)
      pages.push('...')
      for (let i = props.currentPage - halfVisible + 1; i <= props.currentPage + halfVisible - 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(props.totalPages)
    }
  }
  
  return pages
})
</script>

<style scoped>
/* 分页组件样式 */
</style>