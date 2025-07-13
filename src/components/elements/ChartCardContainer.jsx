import React from 'react';
import { Divider } from 'antd';
import ChartCard from './ChartCard';

/**
 * ChartCardContainer 组件：图表卡片容器
 * 用于在左侧边栏中展示各种类型的图表卡片
 * 支持拖拽到右侧画布
 */
const ChartCardContainer = ({ charts = [], title = "图表组件库" }) => {
  // 默认图表数据
  const defaultCharts = [
    {
      id: 1,
      chartType: 'pie',
      title: "饼图组件",
      description: "展示数据占比分布，适合显示分类数据的比例关系",
      tags: ["饼图", "占比", "分布"],
      style: { borderLeft: '3px solid #1890ff' }
    },
    {
      id: 2,
      chartType: 'bar',
      title: "柱状图组件",
      description: "展示分类数据的数值对比，适合比较不同类别的数据",
      tags: ["柱状图", "对比", "分类"],
      style: { borderLeft: '3px solid #52c41a' }
    },
    {
      id: 3,
      chartType: 'line',
      title: "折线图组件",
      description: "展示数据趋势变化，适合显示时间序列数据",
      tags: ["折线图", "趋势", "时间"],
      style: { borderLeft: '3px solid #faad14' }
    },
    {
      id: 4,
      chartType: 'pie',
      title: "环形图组件",
      description: "饼图的变体，中心留空，适合显示进度或占比",
      tags: ["环形图", "进度", "占比"],
      style: { borderLeft: '3px solid #f5222d' },
      chartOptions: {
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 335, name: '直接访问' },
            { value: 310, name: '邮件营销' },
            { value: 234, name: '联盟广告' },
            { value: 135, name: '视频广告' },
            { value: 1548, name: '搜索引擎' }
          ]
        }]
      }
    }
  ];

  // 使用传入的图表数据或默认数据
  const displayCharts = charts.length > 0 ? charts : defaultCharts;

  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto',
      padding: '0 8px'
    }}>
      {/* 容器标题 */}
      <div style={{ 
        padding: '16px 8px 8px 8px',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 16
      }}>
        <h3 style={{ margin: 0, color: '#1890ff' }}>{title}</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
          共 {displayCharts.length} 个图表组件，拖拽到右侧画布使用
        </p>
      </div>

      {/* 图表卡片列表 */}
      <div>
        {displayCharts.map((chart, index) => (
          <div key={chart.id || index}>
            <ChartCard
              chartType={chart.chartType}
              title={chart.title}
              description={chart.description}
              tags={chart.tags}
              chartData={chart.chartData}
              chartOptions={chart.chartOptions}
              style={chart.style}
              {...chart.props}
            />
            {index < displayCharts.length - 1 && (
              <Divider style={{ margin: '8px 0' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartCardContainer; 