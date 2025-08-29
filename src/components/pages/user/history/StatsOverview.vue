<template>
  <div class="stats shadow bg-base-100 mb-6 w-full">
    <div class="stat">
      <div class="stat-figure text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div class="stat-title">总分析次数</div>
      <div class="stat-value text-primary">{{ stats.totalAnalyses }}</div>
      <div class="stat-desc">累计分析评论</div>
    </div>

    <div class="stat">
      <div class="stat-figure text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
        </svg>
      </div>
      <div class="stat-title">本月分析</div>
      <div class="stat-value text-secondary">{{ stats.monthlyAnalyses }}</div>
      <div class="stat-desc">↗︎ {{ stats.monthlyGrowth }}% (本月)</div>
    </div>

    <div class="stat">
      <div class="stat-figure text-accent">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
        </svg>
      </div>
      <div class="stat-title">平均准确率</div>
      <div class="stat-value text-accent">{{ stats.averageAccuracy }}%</div>
      <div class="stat-desc">基于用户反馈</div>
    </div>

    <div class="stat">
      <div class="stat-figure text-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div class="stat-title">最近活跃</div>
      <div class="stat-value text-info">{{ stats.lastActive }}</div>
      <div class="stat-desc">上次分析时间</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatsData {
  totalAnalyses: number
  monthlyAnalyses: number
  monthlyGrowth: number
  averageAccuracy: number
  lastActive: string
}

defineProps<{
  stats: StatsData
}>()
</script>

<style scoped>
/* 统计概览组件样式 */
.stats {
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-4;
}
</style>
