import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { mockDataGenerator, genesToOption } from '../../utils/chartGeneUtils';

// 单个对比框组件
function CompareBox({ chart, onDrop, title }) {
  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const chartData = JSON.parse(data);
        // 兼容 ChartGallery 拖拽
        if (chartData.chart && chartData.genes) {
          const mockData = mockDataGenerator(chartData.chart, chartData.genes);
          const option = genesToOption(chartData.chart, chartData.genes, mockData);
          onDrop({ ...chartData, option });
        } else {
          onDrop(chartData);
        }
      } catch (err) {
        // ignore
      }
    }
  };
  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      style={{
        minHeight: 180,
        minWidth: 220,
        margin: '12px 0',
        border: '2px dashed #bbb',
        borderRadius: 8,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        transition: 'border-color 0.2s',
        padding: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{ fontWeight: 500, color: '#1890ff', marginBottom: 8 }}>
        {chart ? (chart.title || chart.chartType || chart.chart) : title}
      </div>
      {chart ? (
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ReactECharts option={chart.option || chart.chartOptions || chart.chartData || {}} style={{ width: '100%', height: '100%' }} />
        </div>
      ) : (
        <span style={{ color: '#bbb', fontSize: 14 }}>拖拽图表到此处</span>
      )}
    </div>
  );
}

// 对比结果组件
function CompareResult({ chart1, chart2 }) {
  if (!chart1 && !chart2) return null;
  if (!chart1 || !chart2) return <div style={{ color: '#888', marginTop: 12 }}>请拖入两个图表以进行对比</div>;
  // 用表格对比类型、名称、genes
  return (
    <div style={{ margin: 0, background: '#fafafa', borderRadius: 8, padding: 16, border: '1px solid #eee', minWidth: 260 }}>
      <div style={{ fontWeight: 500, marginBottom: 12, fontSize: 16 }}>图表信息对比</div>
      <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ color: '#888', padding: 4 }}>类型</td>
            <td style={{ color: '#333', padding: 4 }}>{chart1.chartType || chart1.chart}</td>
            <td style={{ color: '#333', padding: 4 }}>{chart2.chartType || chart2.chart}</td>
          </tr>
          <tr>
            <td style={{ color: '#888', padding: 4 }}>名称</td>
            <td style={{ color: '#333', padding: 4 }}>{chart1.title || chart1.chartType || chart1.chart}</td>
            <td style={{ color: '#333', padding: 4 }}>{chart2.title || chart2.chartType || chart2.chart}</td>
          </tr>
          <tr>
            <td style={{ color: '#888', padding: 4, verticalAlign: 'top' }}>genes</td>
            <td style={{ color: '#333', padding: 4, fontSize: 12 }}>{JSON.stringify(chart1.genes, null, 2)}</td>
            <td style={{ color: '#333', padding: 4, fontSize: 12 }}>{JSON.stringify(chart2.genes, null, 2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const CompareArea = () => {
  const [chart1, setChart1] = useState(null);
  const [chart2, setChart2] = useState(null);

  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f2f5', borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', minHeight: 220, padding: 12 }}>
      {/* 左侧两个横向 CompareBox */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        <CompareBox chart={chart1} onDrop={setChart1} title="图表1" />
        <CompareBox chart={chart2} onDrop={setChart2} title="图表2" />
      </div>
      {/* 右侧对比结果，添加阴影和高亮背景 */}
      <div style={{ flex: 1, marginLeft: 32, minWidth: 300, display: 'flex', alignItems: 'flex-start' }}>
        <div style={{
          width: '100%',
          minHeight: 180,
          background: 'linear-gradient(135deg, #f8fafc 60%, #e3f0ff 100%)',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(24,144,255,0.10), 0 1.5px 6px rgba(0,0,0,0.06)',
          border: '1.5px solid #e6f0fa',
          padding: 24,
          marginTop: 0,
          minWidth: 280,
          transition: 'box-shadow 0.2s',
          display: 'flex',
          alignItems: 'center',
        }}>
          <CompareResult chart1={chart1} chart2={chart2} />
        </div>
      </div>
    </div>
  );
};

export default CompareArea; 