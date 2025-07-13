import React from 'react';
import { Divider } from 'antd';
import AdaptiveCard from './AdaptiveCard';

/**
 * CardContainer 组件：卡片容器
 * 用于在左侧边栏中展示多个自适应卡片
 * 支持滚动和分组显示
 */
const CardContainer = ({ cards = [], title = "卡片列表" }) => {
  // 默认卡片数据
  const defaultCards = [
    {
      id: 1,
      title: "数据分析卡片",
      description: "展示各种数据统计和分析结果，支持多种图表类型",
      tags: ["数据", "分析", "图表"],
      avatar: null
    },
    {
      id: 2,
      title: "用户信息卡片",
      description: "显示用户基本信息、头像、状态等详细信息",
      tags: ["用户", "信息", "状态"],
      avatar: null
    },
    {
      id: 3,
      title: "系统状态卡片",
      description: "实时监控系统运行状态、性能指标和告警信息",
      tags: ["系统", "监控", "性能"],
      avatar: null
    },
    {
      id: 4,
      title: "任务管理卡片",
      description: "管理待办任务、进度跟踪和任务分配功能",
      tags: ["任务", "管理", "进度"],
      avatar: null
    }
  ];

  // 使用传入的卡片数据或默认数据
  const displayCards = cards.length > 0 ? cards : defaultCards;

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
          共 {displayCards.length} 个卡片
        </p>
      </div>

      {/* 卡片列表 */}
      <div>
        {displayCards.map((card, index) => (
          <div key={card.id || index}>
            <AdaptiveCard
              title={card.title}
              description={card.description}
              tags={card.tags}
              avatar={card.avatar}
              cover={card.cover}
              style={card.style}
              {...card.props}
            />
            {index < displayCards.length - 1 && (
              <Divider style={{ margin: '8px 0' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardContainer; 