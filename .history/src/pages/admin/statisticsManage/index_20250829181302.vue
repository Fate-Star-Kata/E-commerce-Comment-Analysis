<template>
  <div class="statistics-manage-container">
    <Motion :delay="100">
      <div class="statistics-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="overview-card">
              <div class="card-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">总评论数</div>
                <div class="card-value">{{ statisticsData.total_comments || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card users">
              <div class="card-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">活跃用户</div>
                <div class="card-value">{{ statisticsData.active_users || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card accuracy">
              <div class="card-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">准确率</div>
                <div class="card-value">{{ statisticsData.accuracy_rate || 0 }}%</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card storage">
              <div class="card-icon">
                <el-icon><FolderOpened /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">存储大小</div>
                <div class="card-value">{{ statisticsData.storage_size || '0MB' }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </Motion>

    <Motion :delay="200">
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>每日分析趋势</span>
                  <el-button-group size="small">
                    <el-button
                      :type="chartTimeRange === '7d' ? 'primary' : ''"
                      @click="changeTimeRange('7d')"
                    >
                      近7天
                    </el-button>
                    <el-button
                      :type="chartTimeRange === '30d' ? 'primary' : ''"
                      @click="changeTimeRange('30d')"
                    >
                      近30天
                    </el-button>
                    <el-button
                      :type="chartTimeRange === '90d' ? 'primary' : ''"
                      @click="changeTimeRange('90d')"
                    >
                      近90天
                    </el-button>
                  </el-button-group>
                </div>
              </template>
              <div ref="dailyChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>情感分布</span>
                </div>
              </template>
              <div ref="sentimentChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </Motion>

    <Motion :delay="300">
      <div class="period-stats-section">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>时段统计详情</span>
              <div class="header-actions">
                <el-button type="primary" size="small" @click="handleExport">
                  <el-icon><Download /></el-icon>
                  导出报告
                </el-button>
                <el-button size="small" @click="handleRefresh">
                  <el-icon><Refresh /></el-icon>
                  刷新数据
                </el-button>
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="statisticsData.time_period_stats || []"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="period" label="时间段" width="150" />
            <el-table-column prop="total_analysis" label="总分析数" width="120" />
            <el-table-column prop="positive_count" label="正面评价" width="120">
              <template #default="{ row }">
                <span class="positive-count">{{ row.positive_count }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="negative_count" label="负面评价" width="120">
              <template #default="{ row }">
                <span class="negative-count">{{ row.negative_count }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="neutral_count" label="中性评价" width="120">
              <template #default="{ row }">
                <span class="neutral-count">{{ row.neutral_count }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="avg_confidence" label="平均置信度" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="Math.round(row.avg_confidence * 100)"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="confidence-text">{{ Math.round(row.avg_confidence * 100) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="active_users" label="活跃用户" width="120" />
            <el-table-column label="情感分布" min-width="200">
              <template #default="{ row }">
                <div class="sentiment-distribution">
                  <div class="distribution-bar">
                    <div
                      class="bar-segment positive"
                      :style="{ width: getPercentage(row.positive_count, row.total_analysis) + '%' }"
                    ></div>
                    <div
                      class="bar-segment negative"
                      :style="{ width: getPercentage(row.negative_count, row.total_analysis) + '%' }"
                    ></div>
                    <div
                      class="bar-segment neutral"
                      :style="{ width: getPercentage(row.neutral_count, row.total_analysis) + '%' }"
                    ></div>
                  </div>
                  <div class="distribution-legend">
                    <span class="legend-item positive">
                      正面 {{ getPercentage(row.positive_count, row.total_analysis) }}%
                    </span>
                    <span class="legend-item negative">
                      负面 {{ getPercentage(row.negative_count, row.total_analysis) }}%
                    </span>
                    <span class="legend-item neutral">
                      中性 {{ getPercentage(row.neutral_count, row.total_analysis) }}%
                    </span>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  User,
  TrendCharts,
  FolderOpened,
  Download,
  Refresh
} from '@element-plus/icons-vue'
import { Motion } from 'motion-v'
import * as echarts from 'echarts'
import type {
  StatisticsData,
  StatisticsResponse
} from '@/types/components/admin'
import { getAnalysisStatistics } from '@/api/page_apis'
import type { StatisticsResponse as ApiStatisticsResponse, RecentAnalysis } from '@/types/apis/page_apis_T'

// 响应式数据
const loading = ref(false)
const chartTimeRange = ref('7d')
const dailyChartRef = ref<HTMLElement>()
const sentimentChartRef = ref<HTMLElement>()
let dailyChart: echarts.ECharts | null = null
let sentimentChart: echarts.ECharts | null = null

// 统计数据
const statisticsData = reactive<StatisticsData>({
  total_comments: 0,
  active_users: 0,
  accuracy_rate: 0,
  storage_size: '0MB',
  daily_analysis: [],
  sentiment_distribution: {
    positive: 0,
    negative: 0,
    neutral: 0
  },
  time_period_stats: []
})

// 处理每日分析数据
const processDailyAnalysisData = (recentAnalyses: RecentAnalysis[], timeRange: string) => {
  if (!recentAnalyses || recentAnalyses.length === 0) {
    return []
  }

  // 根据时间范围确定天数
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90

  // 创建日期范围
  const dateMap = new Map<string, number>()
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dateMap.set(dateStr, 0)
  }

  // 统计每日分析数量
  recentAnalyses.forEach(analysis => {
    const analysisDate = new Date(analysis.created_at).toISOString().split('T')[0]
    if (dateMap.has(analysisDate)) {
      dateMap.set(analysisDate, dateMap.get(analysisDate)! + 1)
    }
  })

  // 转换为图表数据格式
  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    count
  }))
}

// 获取统计数据
const getStatisticsData = async () => {
  loading.value = true
  try {
    // @ts-ignore
    const response: ApiStatisticsResponse = await getAnalysisStatistics()

    // 处理每日分析数据
    const dailyAnalysisData = processDailyAnalysisData(response.data.recent_analyses, chartTimeRange.value)

    // 将API数据转换为页面所需格式
    const transformedData: StatisticsData = {
      total_comments: response.data.total_comments_analyzed,
      active_users: 0, // API暂未提供此字段，使用默认值
      accuracy_rate: 94.5, // API暂未提供此字段，使用默认值
      storage_size: '0MB', // API暂未提供此字段，使用默认值
      daily_analysis: dailyAnalysisData,
      sentiment_distribution: {
        positive: response.data.sentiment_distribution.positive,
        negative: response.data.sentiment_distribution.negative,
        neutral: response.data.sentiment_distribution.neutral
      },
      time_period_stats: [
        {
          period: '总计',
          total_analysis: response.data.total_analyses,
          positive_count: response.data.sentiment_distribution.positive,
          negative_count: response.data.sentiment_distribution.negative,
          neutral_count: response.data.sentiment_distribution.neutral,
          avg_confidence: 0.94, // API暂未提供此字段，使用默认值
          active_users: 0 // API暂未提供此字段，使用默认值
        },
        {
          period: '单条分析',
          total_analysis: response.data.single_analyses,
          positive_count: 0, // API暂未提供详细分布，使用默认值
          negative_count: 0,
          neutral_count: 0,
          avg_confidence: 0.94,
          active_users: 0
        },
        {
          period: '批量分析',
          total_analysis: response.data.batch_analyses,
          positive_count: 0, // API暂未提供详细分布，使用默认值
          negative_count: 0,
          neutral_count: 0,
          avg_confidence: 0.94,
          active_users: 0
        }
      ]
    }

    Object.assign(statisticsData, transformedData)

    // 更新图表
    await nextTick()
    initCharts()
  } catch (error) {
    ElMessage.error('获取统计数据失败')
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  initDailyChart()
  initSentimentChart()
}

// 初始化每日分析趋势图
const initDailyChart = () => {
  if (!dailyChartRef.value) return

  if (dailyChart) {
    dailyChart.dispose()
  }

  dailyChart = echarts.init(dailyChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: statisticsData.daily_analysis.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '分析数量',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        },
        data: statisticsData.daily_analysis.map(item => item.count)
      }
    ]
  }

  dailyChart.setOption(option)
}

// 初始化情感分布饼图
const initSentimentChart = () => {
  if (!sentimentChartRef.value) return

  if (sentimentChart) {
    sentimentChart.dispose()
  }

  sentimentChart = echarts.init(sentimentChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '情感分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: statisticsData.sentiment_distribution.positive,
            name: '正面',
            itemStyle: { color: '#67c23a' }
          },
          {
            value: statisticsData.sentiment_distribution.negative,
            name: '负面',
            itemStyle: { color: '#f56c6c' }
          },
          {
            value: statisticsData.sentiment_distribution.neutral,
            name: '中性',
            itemStyle: { color: '#909399' }
          }
        ]
      }
    ]
  }

  sentimentChart.setOption(option)
}

// 改变时间范围
const changeTimeRange = (range: string) => {
  chartTimeRange.value = range
  // TODO: 根据时间范围重新获取数据
  getStatisticsData()
}

// 导出报告
const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中')
}

// 刷新数据
const handleRefresh = () => {
  getStatisticsData()
}

// 计算百分比
const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// 组件挂载时获取数据
onMounted(() => {
  getStatisticsData()

  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener('resize', () => {
    if (dailyChart) {
      dailyChart.resize()
    }
    if (sentimentChart) {
      sentimentChart.resize()
    }
  })
})
</script>

<style scoped>
.statistics-manage-container {
  padding: 20px;
}

.statistics-overview {
  margin-bottom: 20px;
}

.overview-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.overview-card.users {
  border-left: 4px solid #409eff;
}

.overview-card.accuracy {
  border-left: 4px solid #67c23a;
}

.overview-card.storage {
  border-left: 4px solid #e6a23c;
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
  color: #409eff;
}

.users .card-icon {
  color: #409eff;
}

.accuracy .card-icon {
  color: #67c23a;
}

.storage .card-icon {
  color: #e6a23c;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.charts-section {
  margin-bottom: 20px;
}

.period-stats-section {
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.positive-count {
  color: #67c23a;
  font-weight: bold;
}

.negative-count {
  color: #f56c6c;
  font-weight: bold;
}

.neutral-count {
  color: #909399;
  font-weight: bold;
}

.confidence-text {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
}

.sentiment-distribution {
  width: 100%;
}

.distribution-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-segment {
  height: 100%;
}

.bar-segment.positive {
  background-color: #67c23a;
}

.bar-segment.negative {
  background-color: #f56c6c;
}

.bar-segment.neutral {
  background-color: #909399;
}

.distribution-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-item.positive {
  color: #67c23a;
}

.legend-item.negative {
  color: #f56c6c;
}

.legend-item.neutral {
  color: #909399;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #333;
  font-weight: 600;
}

:deep(.el-button-group .el-button) {
  margin: 0;
}
</style>