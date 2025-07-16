import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Button, App } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { mockDataGenerator, genesToOption } from '../../utils/chartGeneUtils';
import { Resizable } from 're-resizable';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import useRules from '../../utils/useRules';
import { findMatchingRule } from '../../utils/ruleMatcher';
import { Modal } from 'antd';
import ChartFlowNode from './ChartFlowNode';

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

// 自定义图表节点组件
const ChartNode = ({ data, id, width, height, selected }) => {
  const { message } = App.useApp();
  const nodeRef = React.useRef(null);

  // 默认宽高
  const defaultWidth = width || 250;
  const defaultHeight = height || 200;

  // 节点尺寸变化时，通知父组件更新nodes
  const onResize = (e, direction, ref, d) => {
    const newWidth = defaultWidth + d.width;
    const newHeight = defaultHeight + d.height;
    // console.log(`[Resize] 触发，节点${id} 当前width:`, newWidth, '当前height:', newHeight);
    if (typeof data.onResize === 'function') {
      data.onResize(id, newWidth, newHeight);
    } else {
      console.log(`[Resize] onResize 未触发data.onResize, id: ${id}`);
    }
  };

  React.useEffect(() => {
    if (nodeRef.current && typeof data.onUpdateSize === 'function') {
      const height = nodeRef.current.offsetHeight;
      data.onUpdateSize(id, height);
    }
  });
  
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

  // 组合图表节点
  if (data.isCombined && data.combinedCharts) {
    const n = data.combinedCharts.length;
    return (
      <div style={{ width: width, height: height, position: 'relative', background: '#fff', minHeight: 0 }}>
        {/* 透明点击层，提升选中体验 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'transparent',
            pointerEvents: 'auto',
            minHeight: 0
          }}
        />
        <NodeResizer
          color="#1890ff"
          isVisible={selected}
          minWidth={200}
          minHeight={120}
        />
      <Card
        ref={nodeRef}
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
            width: '100%',
            height: '100%',
            minHeight: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            position: 'relative',
            zIndex: 2
        }}
          styles={{
            root: { height: '100%', minHeight: 0 },
            body: { height: '100%', minHeight: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }
          }}
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
  if (data.isNoRecommend) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px dashed #bbb', borderRadius: 8 }}>
        <span style={{ color: '#999', fontSize: 14 }}>未找到合适的图表组合</span>
      </div>
    );
  }
  return (
    <div style={{ width: width, height: height, position: 'relative', background: '#fff', minHeight: 0 }}>
      {/* 透明点击层，提升选中体验 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'transparent',
          pointerEvents: 'auto',
          minHeight: 0
        }}
      />
      <NodeResizer
        color="#1890ff"
        isVisible={selected}
        minWidth={150}
        minHeight={120}
      />
    <Card
      ref={nodeRef}
      size="small"
        title={chartNameMap[data.chart] || data.chart || data.title || '图表'}
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
          width: '100%',
          height: '100%',
          minHeight: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
          position: 'relative',
          zIndex: 2
        }}
        styles={{
          root: { height: '100%', minHeight: 0 },
          body: { height: '100%', minHeight: 0, padding: 0, display: 'flex', flexDirection: 'column' }
      }}
    >
        <div style={{ height: '100%', width: '100%', minHeight: 0 }}>
        <ReactECharts
          option={getChartOptions()}
            style={{ height: '100%', width: '100%', minHeight: 0 }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </div>
    </Card>
    </div>
  );
};

// 节点类型配置
const nodeTypes = {
  chartNode: ChartFlowNode,
};

const Canvas = () => {
  const { message } = App.useApp();
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  // 新增：存储组合节点和推荐节点的 DOM ref
  const nodeDomRefs = useRef({});
  const [customLine, setCustomLine] = useState(null);
  const rules = useRules();
  const [recommend, setRecommend] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCombine, setPendingCombine] = useState(null); // 记录待合并节点
  // 新增：临时存储待添加的 edge 信息
  const pendingEdgeRef = useRef(null);
  // 移除 useReactFlow 相关内容
  const [rfTransform, setRfTransform] = useState({ x: 0, y: 0, zoom: 1 });
  const reactFlowInstanceRef = useRef(null);
  useEffect(() => {
    // 获取画布 transform
    if (reactFlowWrapper.current && reactFlowWrapper.current.getViewport) {
      const { x, y, zoom } = reactFlowWrapper.current.getViewport();
      setRfTransform({ x, y, zoom });
    }
  }, []);

  // 监听节点变化和画布变换，动态计算连线
  useEffect(() => {
    // 找到组合节点和推荐节点
    const combinedNode = nodes.find(n => n.data && n.data.isCombined);
    const recommendNode = nodes.find(n => n.parentNode === (combinedNode && combinedNode.id));
    if (!combinedNode || !recommendNode) {
      setCustomLine(null);
      return;
    }
    // 获取 DOM 元素
    const combinedDom = nodeDomRefs.current[combinedNode.id];
    const recommendDom = nodeDomRefs.current[recommendNode.id];
    const wrapperDom = reactFlowWrapper.current;
    if (!combinedDom || !recommendDom || !wrapperDom) {
      setCustomLine(null);
      return;
    }
    // 计算中心点和宽高（相对于 wrapper）
    const wrapperRect = wrapperDom.getBoundingClientRect();
    const getRect = (dom) => {
      const rect = dom.getBoundingClientRect();
      return {
        x: rect.left - wrapperRect.left,
        y: rect.top - wrapperRect.top,
        width: rect.width,
        height: rect.height,
      };
    };
    const rect1 = getRect(combinedDom);
    const rect2 = getRect(recommendDom);
    const center1 = { x: rect1.x + rect1.width / 2, y: rect1.y + rect1.height / 2 };
    const center2 = { x: rect2.x + rect2.width / 2, y: rect2.y + rect2.height / 2 };
    // 计算边缘交点
    function getEdgePoint(x1, y1, w1, h1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);
      const rx = (w1 / 2) * Math.cos(angle);
      const ry = (h1 / 2) * Math.sin(angle);
      return { x: x1 + rx, y: y1 + ry };
    }
    const p1 = getEdgePoint(center1.x, center1.y, rect1.width, rect1.height, center2.x, center2.y);
    const p2 = getEdgePoint(center2.x, center2.y, rect2.width, rect2.height, center1.x, center1.y);
    setCustomLine({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
  }, [nodes, rfTransform]);

  // useEffect 监听 nodes，等节点渲染后再 setEdges
  useEffect(() => {
    if (pendingEdgeRef.current) {
      const edge = pendingEdgeRef.current;
      // 检查 source/target 节点都已存在
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        setEdges((eds) => {
          const newEdges = [...eds, edge];
          console.log('newEdges:', JSON.stringify(newEdges, null, 2));
          return newEdges;
        });
        pendingEdgeRef.current = null;
      }
    }
  }, [nodes]);

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

  // 节点尺寸更新
  const handleUpdateNodeSize = useCallback((id, height) => {
    setNodes((nds) => nds.map(node =>
      node.id === id ? { ...node, data: { ...node.data, realHeight: height } } : node
    ));
  }, [setNodes]);

  // 检测碰撞
  const detectCollision = useCallback((node1, node2) => {
    const margin = 100; // 增加碰撞检测的容差
    
    // 根据节点类型和状态计算实际尺寸
    const getNodeSize = (node) => {
      if (typeof node.data.realHeight === 'number') {
        return { width: node.data.isCombined ? 300 : 250, height: node.data.realHeight };
      }
      if (node.data.isCombined && node.data.combinedCharts) {
        // 组合节点高度 = 标题区40 + 每个子图表(80+16) + 底部padding16
        const chartCount = node.data.combinedCharts.length;
        return { width: 300, height: 40 + chartCount * 96 + 16 };
      }
      return { width: 250, height: 200 }; // 单个图表尺寸
    };
    
    const node1Size = getNodeSize(node1);
    const node2Size = getNodeSize(node2);

    // 调试输出节点尺寸和位置
    // console.log('[碰撞调试] node1:', node1.id, node1.position, node1Size);
    // console.log('[碰撞调试] node2:', node2.id, node2.position, node2Size);
    
    const collision = (
      node1.position.x < node2.position.x + node2Size.width + margin &&
      node1.position.x + node1Size.width > node2.position.x - margin &&
      node1.position.y < node2.position.y + node2Size.height + margin &&
      node1.position.y + node1Size.height > node2.position.y - margin
    );
    
    // console.log('碰撞检测详情:', {
    //   node1: { 
    //     id: node1.id, 
    //     x: node1.position.x, 
    //     y: node1.position.y, 
    //     width: node1Size.width, 
    //     height: node1Size.height,
    //     isCombined: node1.data.isCombined 
    //   },
    //   node2: { 
    //     id: node2.id, 
    //     x: node2.position.x, 
    //     y: node2.position.y, 
    //     width: node2Size.width, 
    //     height: node2Size.height,
    //     isCombined: node2.data.isCombined 
    //   },
    //   margin,
    //   collision
    // });
    
    return collision;
  }, []);

  // 组合图表
  const combineCharts = useCallback((sourceNode, targetNode) => {
    // console.log('开始组合图表:', sourceNode.id, targetNode.id);
    
    // 检查是否已经是组合图表
    if (sourceNode.data.isCombined || targetNode.data.isCombined) {
      // console.log('其中一个节点已经是组合图表，跳过组合');
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
      width: targetNode.width || 300,
      height: targetNode.height || 260,
      data: {
        title: '组合图表',
        isCombined: true,
        combinedCharts: [sourceChart, targetChart], // 源图表在上，目标图表在下
        width: targetNode.width || 300,
        height: targetNode.height || 260,
        onDelete: handleDeleteNode,
        onEdit: handleEditNode,
      },
    };
    
    // console.log('创建组合节点:', {
    //   id: combinedNode.id,
    //   position: combinedNode.position,
    //   isCombined: combinedNode.data.isCombined,
    //   chartCount: combinedNode.data.combinedCharts.length
    // });

    // 删除原始的两个节点，添加组合节点
    setNodes((nds) => {
      const filteredNodes = nds.filter(node => 
        node.id !== sourceNode.id && node.id !== targetNode.id
      );
      return [...filteredNodes, combinedNode];
    });

    message.success('图表已成功组合！');
  }, [setNodes, message]);

  // 删除节点时，自动删除其所有子节点
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => {
      // 找到被删节点
      const nodeToDelete = nds.find(n => n.id === nodeId);
      if (nodeToDelete && nodeToDelete.data && nodeToDelete.data.isCombined) {
        // 删除 parent 及所有推荐节点
        const recommendIds = nds.filter(n => n.id !== nodeId && n.id.startsWith('recommend-')).map(n => n.id);
        return nds.filter(n => n.id !== nodeId && !recommendIds.includes(n.id));
      }
      // 普通节点只删自己
      return nds.filter((node) => node.id !== nodeId);
    });
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    message.success('图表已删除！');
  }, [setNodes, setEdges, message]);

  // 编辑节点
  const handleEditNode = useCallback((nodeId) => {
    message.info('编辑功能待实现');
  }, [message]);

  // 推荐弹窗确认后添加新节点
  const handleAddRecommendNode = () => {
    if (!recommend || !pendingCombine) return;
    const [srcNode, tgtNode] = pendingCombine;
    const newNode = {
      id: `chart-${Date.now()}-${Math.random()}`,
      type: 'chartNode',
      position: {
        x: (srcNode.position.x + tgtNode.position.x) / 2 + 40,
        y: (srcNode.position.y + tgtNode.position.y) / 2 + 40,
      },
      width: 250,
      height: 200,
      data: {
        title: recommend.chart,
        chart: recommend.chart,
        chartType: recommend.chart,
        chartOptions: recommend.option,
        genes: recommend.genes,
        explanation: recommend.explanation,
        width: 250,
        height: 200,
        onDelete: handleDeleteNode,
        onEdit: handleEditNode,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setModalOpen(false);
    setRecommend(null);
    setPendingCombine(null);
    message.success('推荐图表已添加到画布！');
  };

  // 处理拖拽放置
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const chartData = event.dataTransfer.getData('application/json');
      console.log('onDrop chartData:', chartData);
      // 调试打印拖拽数据
      // console.log('chartData:', chartData);
      if (chartData) {
        try {
          const parsedData = JSON.parse(chartData);
          console.log('onDrop parsedData:', parsedData);
          // 兼容 ChartGallery 拖拽
          if (parsedData.chart && parsedData.genes) {
            let data, option, position, newNode;
            try {
              data = mockDataGenerator(parsedData.chart, parsedData.genes);
              console.log('mockDataGenerator result:', data);
              option = genesToOption(parsedData.chart, parsedData.genes, data);
              console.log('genesToOption result:', option);
              if (!reactFlowInstanceRef.current) throw new Error('React Flow 实例未初始化');
              position = reactFlowInstanceRef.current.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
              });
              console.log('calculated position:', position);
              newNode = {
                id: `chart-${Date.now()}-${Math.random()}`,
                type: 'chartNode',
                position,
                draggable: true,
                width: 250,
                height: 200,
                data: {
                  ...parsedData,
                  chartType: parsedData.chart,
                  chartOptions: option,
                  width: 250,
                  height: 200,
                  onDelete: handleDeleteNode,
                  onEdit: handleEditNode,
                },
              };
              console.log('newNode:', newNode);
              setNodes((nds) => nds.concat(newNode));
              message.success('图表已添加到画布！');
            } catch (err) {
              console.error('onDrop 生成节点出错:', err);
              message.error('拖拽数据生成节点出错');
            }
          }
          // 兼容 ChartCard 拖拽
          else if (parsedData.type === 'chart' && parsedData.chartType) {
            try {
              if (!reactFlowInstanceRef.current) throw new Error('React Flow 实例未初始化');
              const position = reactFlowInstanceRef.current.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
              });
              const newNode = {
                id: `chart-${Date.now()}-${Math.random()}`,
                type: 'chartNode',
                position,
                draggable: true,
                width: 250,
                height: 200,
                data: {
                  ...parsedData,
                  width: 250,
                  height: 200,
                  onDelete: handleDeleteNode,
                  onEdit: handleEditNode,
                },
              };
              console.log('newNode:', newNode);
              setNodes((nds) => nds.concat(newNode));
              message.success('图表已添加到画布！');
            } catch (err) {
              console.error('onDrop 生成节点出错:', err);
              message.error('拖拽数据生成节点出错');
            }
          } else {
            message.error('拖拽数据格式不支持');
          }
        } catch (error) {
          console.error('onDrop 解析或添加节点出错:', error);
          message.error('拖拽数据格式错误');
        }
      }
    },
    [setNodes, handleDeleteNode, handleEditNode, message]
  );

  // 处理拖拽悬停
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // 处理连接
  const onConnect = useCallback(
    (params) => {
      console.log('[onConnect] 新增连线:', params);
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        console.log('[setEdges] 当前所有edges:', newEdges);
        return newEdges;
      });
    },
    [setEdges]
  );

  // 渲染节点时注入 ref
  const nodesWithUpdateSize = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onUpdateSize: handleUpdateNodeSize,
      onResize: (id, width, height) => {
        setNodes((nds) => nds.map(n => n.id === id ? { ...n, width, height, data: { ...n.data, width, height } } : n));
      },
      nodeRef: (el) => {
        if (el) nodeDomRefs.current[node.id] = el;
        else delete nodeDomRefs.current[node.id];
      },
    }
  }));

  // 自动添加一条测试 edge（连接前两个节点）
  // const testEdge = nodes.length >= 2 ? [{ id: 'test', source: nodes[0].id, target: nodes[1].id, type: 'straight' }] : [];

  return (
    <div
      ref={reactFlowWrapper}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        position: 'relative',
      }}
    >
      {/* 让SVG连线依赖nodes和rfTransform，每次画布移动/缩放都刷新SVG，放到ReactFlow内部 */}
      {/* 移除自定义SVG连线组件相关内容 */}
      <ReactFlow
        nodes={nodesWithUpdateSize}
        edges={edges}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{
          backgroundColor: '#f5f5f5',
        }}
        onNodeDragStart={(event, node) => {
          // console.log('ReactFlow onNodeDragStart:', node.id);
        }}
        onNodeDrag={(event, node) => {
          // 可选：拖拽过程中实时检测碰撞并高亮（如需视觉反馈可补充）
        }}
        onNodeDragStop={(event, node) => {
          // 只对普通节点（!isCombined && !parentNode）做组合检测
          if (node.data.isCombined || node.parentNode) return;
          for (const targetNode of nodes) {
            if (
              targetNode.id !== node.id &&
              !targetNode.data.isCombined &&
              !targetNode.parentNode &&
              detectCollision(node, targetNode)
            ) {
              // 组合逻辑（原有代码）
              const combinedNodeId = `combined-${Date.now()}-${Math.random()}`;
              const combinedNodeWidth = 300;
              const sourceChart = {
                title: node.data.title || '源图表',
                option: node.data.chartOptions || node.data.chartData || {},
                chartType: node.data.chartType || node.data.chart
              };
              const targetChart = {
                title: targetNode.data.title || '目标图表',
                option: targetNode.data.chartOptions || targetNode.data.chartData || {},
                chartType: targetNode.data.chartType || targetNode.data.chart
              };
              // 组合节点位置=targetNode.position
              const combinedNode = {
                id: combinedNodeId,
                type: 'chartNode',
                position: { ...targetNode.position },
                width: combinedNodeWidth,
                height: 260,
                style: { zIndex: 1 },
                data: {
                  title: '组合图表',
                  isCombined: true,
                  combinedCharts: [sourceChart, targetChart],
                  width: combinedNodeWidth,
                  height: 260,
                  onDelete: handleDeleteNode,
                  onEdit: handleEditNode,
                },
              };
              // 推荐节点和edge
              const recommendNodes = [];
              const newEdges = [];
              let yOffset = 0;
              for (const rule of rules) {
                const match = findMatchingRule([rule], node.data.genes || {}, targetNode.data.genes || {});
                if (match) {
                  const newGenes = match.genes;
                  const newOption = genesToOption(
                    match.chart,
                    newGenes,
                    mockDataGenerator(match.chart, newGenes)
                  );
                  const recommendNodeId = `recommend-${Date.now()}-${Math.random()}`;
                  recommendNodes.push({
                    id: recommendNodeId,
                    type: 'chartNode',
                    // 推荐节点绝对定位在组合节点右侧
                    position: {
                      x: targetNode.position.x + combinedNodeWidth + 40,
                      y: targetNode.position.y + yOffset
                    },
                    width: 250,
                    height: 200,
                    style: { zIndex: 2 },
                    data: {
                      title: match.chart,
                      chart: match.chart,
                      chartType: match.chart,
                      chartOptions: newOption,
                      genes: newGenes,
                      explanation: match.explanation,
                      width: 250,
                      height: 200,
                      onDelete: handleDeleteNode,
                      onEdit: handleEditNode,
                    },
                  });
                  newEdges.push({
                    id: `edge-${combinedNodeId}-${recommendNodeId}`,
                    source: combinedNodeId,
                    target: recommendNodeId,
                    type: 'straight',
                  });
                  yOffset += 220;
                }
              }
              if (recommendNodes.length === 0) {
                const recommendNodeId = `recommend-${Date.now()}-${Math.random()}`;
                recommendNodes.push({
                  id: recommendNodeId,
                  type: 'chartNode',
                  position: {
                    x: targetNode.position.x + combinedNodeWidth + 40,
                    y: targetNode.position.y + yOffset
                  },
                  width: 250,
                  height: 120,
                  style: { zIndex: 2 },
                  data: {
                    title: '未找到合适的图表组合',
                    chart: '',
                    chartType: '',
                    chartOptions: {},
                    genes: {},
                    explanation: '',
                    width: 250,
                    height: 120,
                    onDelete: handleDeleteNode,
                    onEdit: handleEditNode,
                    isNoRecommend: true,
                  },
                });
                newEdges.push({
                  id: `edge-${combinedNodeId}-${recommendNodeId}`,
                  source: combinedNodeId,
                  target: recommendNodeId,
                  type: 'straight',
                });
              }
              setNodes((nds) => {
                const filtered = nds.filter(n => n.id !== node.id && n.id !== targetNode.id);
                return [...filtered, combinedNode, ...recommendNodes];
              });
              setEdges((eds) => [...eds, ...newEdges]);
              return;
            }
          }
        }}
        onMove={(_, transform) => {
          if (Array.isArray(transform) && transform.length === 3) {
            setRfTransform({ x: transform[0], y: transform[1], zoom: transform[2] });
          }
        }}
        onInit={instance => {
          reactFlowInstanceRef.current = instance;
          console.log('[ReactFlow] edges 初始化:', edges);
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
      {/* 推荐弹窗 */}
      <Modal
        open={modalOpen}
        title="推荐新图表"
        onCancel={() => { setModalOpen(false); setRecommend(null); setPendingCombine(null); }}
        onOk={handleAddRecommendNode}
        okText="添加到画布"
        cancelText="取消"
      >
        {recommend && (
          <div>
            <h3>{recommend.chart}</h3>
            <div style={{ marginBottom: 8 }}>{recommend.explanation}</div>
            <ReactECharts option={recommend.option} style={{height: 200}} />
          </div>
        )}
      </Modal>
    </div>
  );
};

// 移除自定义SVG连线组件相关内容

export default Canvas; 