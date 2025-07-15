import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { mockDataGenerator, genesToOption } from '../../utils/chartGeneUtils';

const CARD_WIDTH = 250;
const CARD_HEIGHT = 200;
const THUMB_SIZE = 48;

const chartNameMap = {
  bar: '柱状图',
  stacked_bar: '堆叠柱状图',
  line: '折线图',
  area: '面积图',
  scatter: '散点图',
  pie: '饼图',
  donut: '环形图',
  rose: '玫瑰图',
  radar: '雷达图',
  boxplot: '箱线图',
  heatmap: '热力图',
  sankey: '桑基图',
};

const chartDescMap = {
  bar: '展示分类数据的数值对比，适合比较不同类别的数据',
  stacked_bar: '展示分组数据的堆叠对比',
  line: '展示数据趋势变化，适合显示时间序列数据',
  area: '展示累计趋势变化',
  scatter: '展示两个变量之间的关系',
  pie: '展示数据占比分布',
  donut: '饼图的变体，中心留空',
  rose: '展示极坐标下的分类数据',
  radar: '展示多维数据的分布',
  boxplot: '展示数据分布的统计特征',
  heatmap: '展示二维数据的强度分布',
  sankey: '展示流向关系',
};

const ChartGallery = ({ isCollapsed }) => {
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    fetch('/chart_genes.json')
      .then(res => res.json())
      .then(setCharts);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {charts.map((item, idx) => {
        const data = mockDataGenerator(item.chart, item.genes);
        const option = genesToOption(item.chart, item.genes, data);
        // 拖拽事件处理
        const handleDragStart = (e) => {
          e.dataTransfer.setData('application/json', JSON.stringify({
            chart: item.chart,
            genes: item.genes
          }));
        };
        const chartName = chartNameMap[item.chart] || item.chart;
        const chartDesc = chartDescMap[item.chart] || '';
        if (isCollapsed) {
          // 折叠时只显示缩略图，不显示legend
          // 移除option中的legend
          const thumbOption = { ...option };
          delete thumbOption.legend;
          if (thumbOption.series && Array.isArray(thumbOption.series)) {
            thumbOption.series = thumbOption.series.map(s => {
              const { name, ...rest } = s;
              return rest;
            });
          }
          return (
            <div
              key={item.chart}
              style={{
                width: THUMB_SIZE + 8,
                height: THUMB_SIZE + 8,
                border: '1px solid #eee',
                borderRadius: 8,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                padding: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                margin: '0 auto',
                cursor: 'grab',
              }}
              draggable
              onDragStart={handleDragStart}
              title={chartName}
            >
              <ReactECharts option={thumbOption} style={{ width: THUMB_SIZE, height: THUMB_SIZE }} />
            </div>
          );
        } else {
          // 展开时显示详细卡片
          return (
            <div
              key={item.chart}
              style={{
                width: CARD_WIDTH,
                minHeight: CARD_HEIGHT,
                border: '1px solid #eee',
                borderRadius: 8,
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                boxSizing: 'border-box',
                padding: '8px 0 8px 0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              draggable
              onDragStart={handleDragStart}
            >
              <div style={{
                fontWeight: 500,
                fontSize: 15,
                color: '#1890ff',
                marginBottom: 4,
                textAlign: 'center',
                width: '100%'
              }}>{chartName}</div>
              <ReactECharts option={option} style={{ width: CARD_WIDTH - 20, height: CARD_HEIGHT - 50 }} />
              <div style={{ fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center', width: '90%' }}>{chartDesc}</div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default ChartGallery; 