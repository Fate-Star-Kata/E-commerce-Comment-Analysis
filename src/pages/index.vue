<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 主要内容区域 -->
    <div class="container mx-auto px-4 py-8">
      <!-- 标题区域 -->
      <div class="text-center space-y-6 mb-12">
        <h1 class="text-4xl md:text-5xl font-semibold text-gray-800">
          电商评论情感分析系统
        </h1>
        <p class="text-lg md:text-xl text-gray-600">
          智能分析电商评论情感倾向，助力商家洞察用户心声
        </p>
      </div>

      <!-- 统计概览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div v-for="(stat, i) in stats" :key="i" class="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div class="text-3xl font-semibold text-gray-800 mb-2">{{ stat.number }}</div>
          <div class="text-sm text-gray-600">{{ stat.label }}</div>
        </div>
      </div>

      <!-- 快速开始 -->
      <div class="bg-white border border-gray-200 rounded-lg p-8 mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">快速开始</h2>
        <p class="mb-6 text-gray-600">选择您需要的分析方式：</p>
        <div class="flex flex-wrap gap-4">
          <router-link to="/user/sentiment/batch" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            批量数据分析
          </router-link>
          <router-link to="/user/sentiment/single" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            单条评论分析
          </router-link>
          <router-link to="/user/history" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            查看历史记录
          </router-link>
        </div>
      </div>

      <!-- 最近分析趋势 -->
      <div class="bg-white border border-gray-200 rounded-lg p-8 mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">最近分析趋势</h2>
        <p class="mb-6 text-gray-600">过去7天的情感分析统计：</p>
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-semibold text-green-600">{{ trendData.positive }}</div>
              <div class="text-sm text-gray-600">正面评论</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-semibold text-red-600">{{ trendData.negative }}</div>
              <div class="text-sm text-gray-600">负面评论</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-semibold text-yellow-600">{{ trendData.neutral }}</div>
              <div class="text-sm text-gray-600">中性评论</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能特性 -->
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-semibold text-center text-gray-800 mb-8">系统特性</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(feature, i) in features" :key="i" class="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
             <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ feature.title }}</h3>
             <p class="text-gray-600 text-sm">{{ feature.desc }}</p>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const footerText = import.meta.env.VITE_APP_FOOTER || "版权所有 © 2025 HZSYSTEM";

// 统计数据
const stats = ref([
  { number: '1,234', label: '总分析次数' },
  { number: '567', label: '今日分析' },
  { number: '89%', label: '准确率' },
  { number: '2.3s', label: '平均响应时间' }
])

// 趋势数据
const trendData = ref({
  positive: '456',
  negative: '123',
  neutral: '234'
})

// 功能特性数据
const features = [
  { 
    title: 'AI智能分析', 
    desc: '基于深度学习的情感分析模型，准确识别评论情感倾向' 
  },
  { 
    title: '批量处理', 
    desc: '支持Excel、CSV等格式的批量数据导入和分析' 
  },
  { 
    title: '实时分析', 
    desc: '毫秒级响应，实时获取单条评论的情感分析结果' 
  },
  { 
    title: '可视化报告', 
    desc: '丰富的图表展示，直观呈现情感分析统计结果' 
  },
  { 
    title: '数据安全', 
    desc: '企业级数据加密存储，保障用户数据隐私安全' 
  },
  { 
    title: '精准识别', 
    desc: '多维度情感标签，细粒度识别用户情感表达' 
  }
];
</script>

<style scoped>
/* 首页样式 */
</style>
