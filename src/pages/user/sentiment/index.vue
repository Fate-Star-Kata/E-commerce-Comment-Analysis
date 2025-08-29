<template>
  <div class="min-h-screen bg-base-100 p-6">
    <div class="container mx-auto max-w-4xl">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">🎯 情感分析</h1>
        <p class="text-lg text-base-content/70 mb-8">
          选择您需要的分析方式，快速了解评论的情感倾向
        </p>
      </div>

      <!-- 分析方式选择 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- 单条分析 -->
        <div class="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="card-body text-center">
            <div class="text-6xl mb-4">📝</div>
            <h2 class="card-title text-2xl justify-center mb-4">单条分析</h2>
            <p class="text-base-content/70 mb-6">
              输入单条评论文本，快速获取情感分析结果，
              包括情感倾向、置信度和关键词分析
            </p>
            <div class="card-actions justify-center">
              <router-link to="/user/sentiment/single" class="btn btn-primary btn-lg">
                开始单条分析
              </router-link>
            </div>
          </div>
        </div>

        <!-- 批量分析 -->
        <div class="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="card-body text-center">
            <div class="text-6xl mb-4">📊</div>
            <h2 class="card-title text-2xl justify-center mb-4">批量分析</h2>
            <p class="text-base-content/70 mb-6">
              上传Excel或CSV文件，批量分析大量评论数据，
              获取详细的统计报告和可视化图表
            </p>
            <div class="card-actions justify-center">
              <router-link to="/user/sentiment/batch" class="btn btn-secondary btn-lg">
                开始批量分析
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能特色 -->
      <div class="card bg-base-200 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-xl mb-6 justify-center">✨ 功能特色</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl mb-2">🎯</div>
              <h4 class="font-semibold mb-2">高精度分析</h4>
              <p class="text-sm text-base-content/70">
                基于先进的自然语言处理技术，
                提供准确的情感识别结果
              </p>
            </div>
            <div class="text-center">
              <div class="text-3xl mb-2">⚡</div>
              <h4 class="font-semibold mb-2">快速处理</h4>
              <p class="text-sm text-base-content/70">
                毫秒级响应速度，
                支持大批量数据的快速处理
              </p>
            </div>
            <div class="text-center">
              <div class="text-3xl mb-2">📈</div>
              <h4 class="font-semibold mb-2">可视化报告</h4>
              <p class="text-sm text-base-content/70">
                提供直观的图表和统计数据，
                帮助您快速理解分析结果
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速入门 -->
      <div class="text-center mt-12">
        <h3 class="text-2xl font-bold mb-4">🚀 快速入门</h3>
        <div class="steps steps-vertical lg:steps-horizontal">
          <div class="step step-primary">
            <div class="step-content">
              <h4 class="font-semibold">选择分析方式</h4>
              <p class="text-sm text-base-content/70">根据需求选择单条或批量分析</p>
            </div>
          </div>
          <div class="step step-primary">
            <div class="step-content">
              <h4 class="font-semibold">输入数据</h4>
              <p class="text-sm text-base-content/70">输入文本或上传文件</p>
            </div>
          </div>
          <div class="step step-primary">
            <div class="step-content">
              <h4 class="font-semibold">获取结果</h4>
              <p class="text-sm text-base-content/70">查看详细的分析报告</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 情感分析入口页面
</script>

<style scoped>
.card {
  @apply transition-transform duration-300;
}

.card:hover {
  @apply transform scale-105;
}

.step-content {
  @apply text-left;
}

@media (max-width: 1024px) {
  .step-content {
    @apply text-center;
  }
}
</style>