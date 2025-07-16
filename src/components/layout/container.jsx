import React, { useState } from 'react';
import { Layout } from 'antd';
import 'antd/dist/reset.css'; // 引入 antd 样式
import ChartCardContainer from '../elements/ChartCardContainer';
import RecommendCanvas from '../elements/RecommendCanvas';
import CompareArea from '../elements/CompareArea';

const { Sider, Content } = Layout;

/**
 * Container 组件：固定宽度的侧边栏布局
 * 左侧固定宽度，支持收起/展开
 * 右侧为图表画布
 */
const Container = () => {
  // 状态管理：控制侧边栏是否收起
  const [collapsed, setCollapsed] = useState(false);

  // console.log('Container 组件已渲染，侧边栏状态:', collapsed ? '收起' : '展开');

  return (
    <Layout style={{ height: '100vh', display: 'flex' }}>
      {/* 左侧边栏：固定宽度，支持收起/展开 */}
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: '#f0f2f5',
          borderRight: '1px solid #d9d9d9',
          flexShrink: 0
        }}
      >
        {/* 左侧内容区域：图表组件库 */}
        <div style={{ height: '100%', padding: 0 }}>
          <ChartCardContainer isCollapsed={collapsed} />
        </div>
      </Sider>
      
      {/* 右侧主内容区域：图表画布 */}
      <Content 
        style={{ 
          background: '#fff',
          padding: 0,
          margin: 0,
          height: '100vh',
          overflow: 'hidden',
          flex: 1
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* CompareArea 用自适应高度 */}
          <div style={{ flex: 'none', minHeight: 0 }}>
            <CompareArea />
          </div>
          {/* RecommendCanvas 占据剩余空间 */}
          <div style={{ flex: 1, minHeight: 0, height: 0 }}>
            <RecommendCanvas />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Container;
