import React from 'react';
import { Card, Avatar, Tag, Space } from 'antd';
import { UserOutlined, HeartOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';

const { Meta } = Card;

/**
 * AdaptiveCard 组件：自适应卡片
 * 根据父容器宽度自动调整卡片大小和布局
 * 支持传入标题、描述、标签、操作按钮等
 */
const AdaptiveCard = ({ 
  title = "卡片标题", 
  description = "这是一个自适应卡片，会根据容器宽度调整布局",
  tags = ["标签1", "标签2"],
  actions = [],
  avatar = null,
  cover = null,
  style = {},
  ...props 
}) => {
  return (
    <Card
      style={{
        marginBottom: 16,
        width: '100%',
        ...style
      }}
      cover={cover}
      actions={actions.length > 0 ? actions : [
        <HeartOutlined key="like" />,
        <MessageOutlined key="message" />,
        <EyeOutlined key="view" />
      ]}
      {...props}
    >
      <Meta
        avatar={avatar || <Avatar icon={<UserOutlined />} />}
        title={title}
        description={
          <div>
            <p style={{ marginBottom: 8 }}>{description}</p>
            <Space wrap>
              {tags.map((tag, index) => (
                <Tag key={index} color="blue">
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        }
      />
    </Card>
  );
};

export default AdaptiveCard; 