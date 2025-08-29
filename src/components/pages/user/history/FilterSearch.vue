<template>
  <div class="card bg-base-100 shadow mb-6">
    <div class="card-body">
      <h3 class="card-title mb-4">筛选和搜索</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- 搜索框 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">搜索内容</span>
          </label>
          <input 
            type="text" 
            placeholder="搜索评论内容..." 
            class="input input-bordered" 
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- 类型筛选 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">分析类型</span>
          </label>
          <select 
            class="select select-bordered" 
            :value="typeFilter"
            @change="$emit('update:typeFilter', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">全部类型</option>
            <option value="single">单条分析</option>
            <option value="batch">批量分析</option>
          </select>
        </div>

        <!-- 情感筛选 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">情感倾向</span>
          </label>
          <select 
            class="select select-bordered" 
            :value="sentimentFilter"
            @change="$emit('update:sentimentFilter', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">全部情感</option>
            <option value="positive">正面</option>
            <option value="negative">负面</option>
            <option value="neutral">中性</option>
          </select>
        </div>

        <!-- 时间筛选 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">时间范围</span>
          </label>
          <select 
            class="select select-bordered" 
            :value="timeFilter"
            @change="$emit('update:timeFilter', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="quarter">最近三月</option>
          </select>
        </div>

        <!-- 重置按钮 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">&nbsp;</span>
          </label>
          <button class="btn btn-outline" @click="$emit('reset')">
            重置筛选
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string
  typeFilter: string
  sentimentFilter: string
  timeFilter: string
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:typeFilter': [value: string]
  'update:sentimentFilter': [value: string]
  'update:timeFilter': [value: string]
  'reset': []
}>()
</script>

<style scoped>
/* 筛选搜索组件样式 */
</style>