import React, { useRef, useEffect } from 'react';
import { Card, Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { NodeResizer } from '@reactflow/node-resizer';
import { Handle, Position } from 'reactflow';

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

const ChartFlowNode = ({ id, data, width, height, selected }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (data.nodeRef) data.nodeRef(nodeRef.current);
    return () => { if (data.nodeRef) data.nodeRef(null); };
  }, [data, nodeRef]);

  if (data.isNoRecommend) {
    return (
      <div ref={nodeRef} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px dashed #bbb', borderRadius: 8, position: 'relative' }}>
        {/* 连接点 */}
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
        <span style={{ color: '#999', fontSize: 14 }}>未找到合适的图表组合</span>
      </div>
    );
  }

  // 组合节点
  if (data.isCombined && data.combinedCharts) {
    return (
      <div ref={nodeRef} style={{ width, height, position: 'relative', background: '#fff', minHeight: 0 }}>
        {/* 连接点 */}
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
        <NodeResizer color="#1890ff" isVisible={selected} minWidth={200} minHeight={120} />
        <Card
          size="small"
          title={data.title || '组合图表'}
          extra={
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => data.onEdit(id)} />
              <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => data.onDelete(id)} danger />
            </div>
          }
          style={{ width: '100%', height: '100%', minHeight: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: 'white', position: 'relative', zIndex: 2 }}
          styles={{ root: { height: '100%', minHeight: 0 }, body: { height: '100%', minHeight: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 } }}
        >
          {data.combinedCharts.map((chart, index) => (
            <div key={index} style={{ flex: 1, minHeight: 0, border: '1px solid #f0f0f0', borderRadius: '4px', padding: '4px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                {index === 0
                  ? `源图表（${chartNameMap[chart.chartType || chart.chart || ''] || chart.chartType || chart.chart || '未知类型'}）`
                  : `目标图表（${chartNameMap[chart.chartType || chart.chart || ''] || chart.chartType || chart.chart || '未知类型'}）`}
              </div>
              <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
                <ReactECharts
                  option={chart.option || chart.chartOptions || chart.chartData || {}}
                  style={{ height: '100%', width: '100%', minHeight: 0 }}
                  opts={{ renderer: 'canvas' }}
                  notMerge={true}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  // 单个图表节点
  return (
    <div ref={nodeRef} style={{ width, height, position: 'relative', background: '#fff', minHeight: 0 }}>
      {/* 连接点 */}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <NodeResizer color="#1890ff" isVisible={selected} minWidth={150} minHeight={120} />
      <Card
        size="small"
        title={chartNameMap[data.chart] || data.chart || data.title || '图表'}
        extra={
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => data.onEdit(id)} />
            <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => data.onDelete(id)} danger />
          </div>
        }
        style={{ width: '100%', height: '100%', minHeight: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: 'white', position: 'relative', zIndex: 2 }}
        styles={{ root: { height: '100%', minHeight: 0 }, body: { height: '100%', minHeight: 0, padding: 0, display: 'flex', flexDirection: 'column' } }}
      >
        <div style={{ height: '100%', width: '100%', minHeight: 0 }}>
          <ReactECharts
            option={data.chartOptions || data.chartData || {}}
            style={{ height: '100%', width: '100%', minHeight: 0 }}
            opts={{ renderer: 'canvas' }}
            notMerge={true}
          />
        </div>
      </Card>
    </div>
  );
};

export default ChartFlowNode; 