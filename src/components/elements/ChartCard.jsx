import React, { useRef } from 'react';
import { Card, Tag, Space } from 'antd';
import ReactECharts from 'echarts-for-react';
import { DragOutlined } from '@ant-design/icons';

/**
 * ChartCard 组件：包含图表的可拖拽卡片
 * 支持饼图、条形图等多种图表类型
 * 可以拖拽到右侧画布上
 */
const ChartCard = ({ 
  chartType = 'pie',
  title = "图表卡片",
  description = "这是一个图表卡片",
  tags = ["图表", "数据"],
  chartData = null,
  chartOptions = null,
  style = {},
  onDragStart = null,
  ...props 
}) => {
  const cardRef = useRef(null);

  // 默认图表数据
  const getDefaultChartData = (type) => {
    switch (type) {
      case 'pie':
        return {
          series: [{
            type: 'pie',
            radius: '60%',
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' },
              { value: 135, name: '视频广告' },
              { value: 1548, name: '搜索引擎' }
            ]
          }]
        };
      case 'bar':
        return {
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar'
          }]
        };
      case 'line':
        return {
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line',
            smooth: true
          }]
        };
      default:
        return getDefaultChartData('pie');
    }
  };

  // 获取图表配置
  const getChartOptions = () => {
    const baseOptions = {
      grid: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        containLabel: true
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          fontSize: 10
        }
      }
    };

    if (chartOptions) {
      return { ...baseOptions, ...chartOptions };
    }

    const data = chartData || getDefaultChartData(chartType);
    return { ...baseOptions, ...data };
  };

  // 拖拽开始处理
  const handleDragStart = (e) => {
    const dragData = {
      type: 'chart',
      chartType,
      title,
      description,
      tags,
      chartData: chartData || getDefaultChartData(chartType),
      chartOptions: chartOptions || getChartOptions()
    };
    console.log('ChartCard setData:', JSON.stringify(dragData));
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    
    if (onDragStart) {
      onDragStart(e);
    }
  };

  // 拖拽结束处理
  const handleDragEnd = (e) => {
    console.log('拖拽结束');
  };

  return (
    <Card
      ref={cardRef}
      style={{
        marginBottom: 16,
        width: '100%',
        cursor: 'grab',
        position: 'relative',
        userSelect: 'none',
        ...style
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{title}</span>
          <DragOutlined style={{ color: '#999', fontSize: '14px' }} />
        </div>
      }
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      {...props}
    >
      {/* 图表区域 */}
      <div style={{ height: 120, marginBottom: 8 }}>
        <ReactECharts
          option={getChartOptions()}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* 描述和标签 */}
      <div>
        <p style={{ 
          marginBottom: 8, 
          fontSize: '12px', 
          color: '#666',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
        <Space wrap>
          {tags.map((tag, index) => (
            <Tag key={index} color="blue" style={{ fontSize: '10px' }}>
              {tag}
            </Tag>
          ))}
        </Space>
      </div>
    </Card>
  );
};

export default ChartCard; 