import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Button, App } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

// 自定义图表节点组件
const ChartNode = ({ data, id }) => {
  const { message } = App.useApp();
  
  const handleDelete = () => {
    data.onDelete(id);
  };

  const handleEdit = () => {
    data.onEdit(id);
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

    // 如果直接有 chartOptions，使用它
    if (data.chartOptions) {
      return { ...baseOptions, ...data.chartOptions };
    }

    // 如果有 chartData，使用它
    if (data.chartData) {
      return { ...baseOptions, ...data.chartData };
    }

    // 默认返回空配置
    return baseOptions;
  };

  // 如果是组合图表，渲染多个图表
  if (data.isCombined && data.combinedCharts) {
    return (
      <Card
        size="small"
        title={data.title || '组合图表'}
        extra={
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={handleEdit}
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              danger
            />
          </div>
        }
        style={{
          width: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: 'white'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.combinedCharts.map((chart, index) => (
            <div key={index} style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '4px' }}>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                {chart.title || `图表 ${index + 1}`}
              </div>
              <div style={{ height: '80px' }}>
                <ReactECharts
                  option={chart.option || chart.chartOptions || chart.chartData || {}}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                  notMerge={true}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // 单个图表渲染
  return (
    <Card
      size="small"
      title={data.title || '图表'}
      extra={
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={handleEdit}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            danger
          />
        </div>
      }
      style={{
        width: '250px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
      }}
    >
      <div style={{ height: '180px' }}>
        <ReactECharts
          option={getChartOptions()}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </div>
    </Card>
  );
};

// 节点类型配置
const nodeTypes = {
  chartNode: ChartNode,
};

const Canvas = () => {
  const { message } = App.useApp();
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);

  // 生成随机位置
  const getRandomPosition = useCallback(() => {
    if (!reactFlowWrapper.current) return { x: 100, y: 100 };
    
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const maxX = reactFlowBounds.width - 250; // 节点宽度
    const maxY = reactFlowBounds.height - 200; // 节点高度
    
    return {
      x: Math.random() * Math.max(0, maxX),
      y: Math.random() * Math.max(0, maxY)
    };
  }, []);

  // 检测碰撞
  const detectCollision = useCallback((node1, node2) => {
    const margin = 100; // 增加碰撞检测的容差
    
    // 根据节点类型和状态计算实际尺寸
    const getNodeSize = (node) => {
      if (node.data.isCombined) {
        return { width: 300, height: 300 }; // 组合图表尺寸
      }
      return { width: 250, height: 200 }; // 单个图表尺寸
    };
    
    const node1Size = getNodeSize(node1);
    const node2Size = getNodeSize(node2);
    
    const collision = (
      node1.position.x < node2.position.x + node2Size.width + margin &&
      node1.position.x + node1Size.width > node2.position.x - margin &&
      node1.position.y < node2.position.y + node2Size.height + margin &&
      node1.position.y + node1Size.height > node2.position.y - margin
    );
    
    console.log('碰撞检测详情:', {
      node1: { 
        id: node1.id, 
        x: node1.position.x, 
        y: node1.position.y, 
        width: node1Size.width, 
        height: node1Size.height,
        isCombined: node1.data.isCombined 
      },
      node2: { 
        id: node2.id, 
        x: node2.position.x, 
        y: node2.position.y, 
        width: node2Size.width, 
        height: node2Size.height,
        isCombined: node2.data.isCombined 
      },
      margin,
      collision
    });
    
    return collision;
  }, []);

  // 组合图表
  const combineCharts = useCallback((sourceNode, targetNode) => {
    console.log('开始组合图表:', sourceNode.id, targetNode.id);
    
    // 检查是否已经是组合图表
    if (sourceNode.data.isCombined || targetNode.data.isCombined) {
      console.log('其中一个节点已经是组合图表，跳过组合');
      message.info('组合图表不能再组合');
      return;
    }
    
    const sourceChart = {
      title: sourceNode.data.title || '源图表',
      option: sourceNode.data.chartOptions || sourceNode.data.chartData || {},
      chartType: sourceNode.data.chartType
    };

    const targetChart = {
      title: targetNode.data.title || '目标图表',
      option: targetNode.data.chartOptions || targetNode.data.chartData || {},
      chartType: targetNode.data.chartType
    };

    // 创建组合图表节点
    const combinedNode = {
      id: `combined-${Date.now()}-${Math.random()}`,
      type: 'chartNode',
      position: targetNode.position, // 使用目标图表的位置
      data: {
        title: '组合图表',
        isCombined: true,
        combinedCharts: [sourceChart, targetChart], // 源图表在上，目标图表在下
        onDelete: handleDeleteNode,
        onEdit: handleEditNode,
      },
    };
    
    console.log('创建组合节点:', {
      id: combinedNode.id,
      position: combinedNode.position,
      isCombined: combinedNode.data.isCombined,
      chartCount: combinedNode.data.combinedCharts.length
    });

    // 删除原始的两个节点，添加组合节点
    setNodes((nds) => {
      const filteredNodes = nds.filter(node => 
        node.id !== sourceNode.id && node.id !== targetNode.id
      );
      return [...filteredNodes, combinedNode];
    });

    message.success('图表已成功组合！');
  }, [setNodes, message]);

  // 删除节点
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    message.success('图表已删除！');
  }, [setNodes, message]);

  // 编辑节点
  const handleEditNode = useCallback((nodeId) => {
    message.info('编辑功能待实现');
  }, [message]);

  // 处理拖拽放置
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const chartData = event.dataTransfer.getData('application/json');
      
      if (chartData) {
        try {
          const parsedData = JSON.parse(chartData);
          console.log('接收到的图表数据:', parsedData);
          
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
          
          const newNode = {
            id: `chart-${Date.now()}-${Math.random()}`,
            type: 'chartNode',
            position,
            draggable: true, // 确保节点可拖拽
            data: {
              ...parsedData,
              onDelete: handleDeleteNode,
              onEdit: handleEditNode,
            },
          };
          
          console.log('创建新节点:', newNode);
          setNodes((nds) => nds.concat(newNode));
          message.success('图表已添加到画布！');
        } catch (error) {
          console.error('解析拖拽数据失败:', error);
          message.error('拖拽数据格式错误');
        }
      }
    },
    [reactFlowInstance, setNodes, handleDeleteNode, handleEditNode, message]
  );

  // 处理拖拽悬停
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // 处理连接
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div
      ref={reactFlowWrapper}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{
          backgroundColor: '#f5f5f5',
        }}
        onNodeDragStart={(event, node) => {
          console.log('ReactFlow onNodeDragStart:', node.id);
          setDraggedNodeId(node.id);
        }}
        onNodeDrag={(event, node) => {
          // 在拖拽过程中实时检测碰撞
          if (draggedNodeId && draggedNodeId !== node.id) {
            const draggedNode = nodes.find(n => n.id === draggedNodeId);
            if (draggedNode) {
              // 检查与当前拖拽节点的碰撞
              if (detectCollision(draggedNode, node)) {
                console.log('拖拽过程中检测到碰撞:', draggedNode.id, node.id);
                // 可以在这里添加视觉反馈，比如高亮目标节点
              }
            }
          }
        }}
        onNodeDragStop={(event, node) => {
          console.log('ReactFlow onNodeDragStop:', node.id);
          console.log('当前所有节点:', nodes.map(n => ({ id: n.id, position: n.position })));
          
          // 检查与所有其他节点的碰撞
          if (draggedNodeId && draggedNodeId !== node.id) {
            const draggedNode = nodes.find(n => n.id === draggedNodeId);
            
            if (draggedNode) {
              console.log('检查与所有节点的碰撞，源节点:', draggedNode.id);
              
              // 遍历所有其他节点
              for (const targetNode of nodes) {
                if (targetNode.id !== draggedNodeId && targetNode.id !== node.id) {
                  console.log('检查目标节点:', targetNode.id);
                  
                  if (detectCollision(draggedNode, targetNode)) {
                    console.log('检测到碰撞，开始组合:', draggedNode.id, targetNode.id);
                    combineCharts(draggedNode, targetNode);
                    setDraggedNodeId(null);
                    return; // 找到第一个碰撞就组合
                  }
                }
              }
              
              console.log('没有检测到任何碰撞');
            }
          }
          setDraggedNodeId(null);
        }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'chartNode') return '#1a192b';
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.type === 'chartNode') return '#fff';
            return '#eee';
          }}
        />
      </ReactFlow>
      
      {nodes.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '16px',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          拖拽左侧图表到此区域
        </div>
      )}
      
      {/* 调试信息 */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
        }}
      >
        节点数量: {nodes.length}
        <br />
        拖拽状态: {draggedNodeId ? '拖拽中' : '空闲'}
      </div>
    </div>
  );
};

export default Canvas; 