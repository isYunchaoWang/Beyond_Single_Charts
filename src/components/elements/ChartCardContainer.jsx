import React from 'react';
import ChartGallery from './ChartGallery';

/**
 * ChartCardContainer 组件：图表卡片容器
 * 现在直接用 ChartGallery 渲染所有图表
 */
const ChartCardContainer = ({ isCollapsed }) => {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '0 8px' }}>
      <ChartGallery isCollapsed={isCollapsed} />
    </div>
  );
};

export default ChartCardContainer; 