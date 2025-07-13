import React, { useState } from 'react';
import { Layout } from 'antd';
import 'antd/dist/reset.css'; // 引入 antd 样式
import ChartCardContainer from '../elements/ChartCardContainer';
import Canvas from '../elements/Canvas';

const { Sider, Content } = Layout;

/**
 * Container 组件：固定宽度的侧边栏布局
 * 左侧固定宽度，支持收起/展开
 * 右侧为图表画布
 */
const Container = () => {
  // 状态管理：控制侧边栏是否收起
  const [collapsed, setCollapsed] = useState(false);

  console.log('Container 组件已渲染，侧边栏状态:', collapsed ? '收起' : '展开');

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
          <ChartCardContainer 
            title="图表组件库"
            charts={[
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
            ]}
          />
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
        <Canvas />
      </Content>
    </Layout>
  );
};

export default Container;
