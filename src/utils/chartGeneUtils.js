// 图表基因相关工具函数

// mock 数据生成器，根据 genes.encode 字段自动生成简单数据
export const mockDataGenerator = (chartType, genes) => {
  switch (chartType) {
    case 'bar':
    case 'stacked_bar':
      return [
        { cat: 'A', value: 120, group: 'G1' },
        { cat: 'B', value: 200, group: 'G1' },
        { cat: 'A', value: 150, group: 'G2' },
        { cat: 'B', value: 80, group: 'G2' },
      ];
    case 'line':
    case 'area':
      return [
        { time: '2020', value: 100, group: 'G1' },
        { time: '2021', value: 120, group: 'G1' },
        { time: '2020', value: 80, group: 'G2' },
        { time: '2021', value: 160, group: 'G2' },
      ];
    case 'scatter':
      return [
        { x: 10, y: 20, value: 15, group: 'A' },
        { x: 20, y: 30, value: 25, group: 'B' },
        { x: 30, y: 10, value: 35, group: 'A' },
      ];
    case 'pie':
    case 'donut':
      return [
        { cat: 'A', value: 40 },
        { cat: 'B', value: 60 },
        { cat: 'C', value: 20 },
      ];
    case 'rose':
      return [
        { cat: 'A', value: 10 },
        { cat: 'B', value: 20 },
        { cat: 'C', value: 30 },
        { cat: 'D', value: 40 },
      ];
    case 'radar':
      return [
        { cat: '指标1', value: 80, group: 'A' },
        { cat: '指标2', value: 90, group: 'A' },
        { cat: '指标1', value: 70, group: 'B' },
        { cat: '指标2', value: 60, group: 'B' },
      ];
    case 'boxplot':
      return [
        { cat: 'A', value: 10 },
        { cat: 'A', value: 20 },
        { cat: 'A', value: 30 },
        { cat: 'B', value: 15 },
        { cat: 'B', value: 25 },
        { cat: 'B', value: 35 },
      ];
    case 'heatmap':
      return [
        { cat1: 'A', cat2: 'X', value: 10 },
        { cat1: 'A', cat2: 'Y', value: 20 },
        { cat1: 'B', cat2: 'X', value: 30 },
        { cat1: 'B', cat2: 'Y', value: 40 },
      ];
    case 'sankey':
      return [
        { node1: 'A', node2: 'B', value: 10, group: 'G1' },
        { node1: 'A', node2: 'C', value: 20, group: 'G2' },
        { node1: 'B', node2: 'D', value: 30, group: 'G1' },
      ];
    default:
      return [];
  }
};

// genes 转 ECharts option 的简单映射（可根据需要扩展）
export const genesToOption = (chartType, genes, data) => {
  switch (chartType) {
    case 'bar':
    case 'stacked_bar':
      return {
        xAxis: { type: 'category', data: [...new Set(data.map(d => d.cat))] },
        yAxis: { type: 'value' },
        series: genes.Encode.color ?
          Array.from(new Set(data.map(d => d.group))).map(group => ({
            name: group,
            type: 'bar',
            stack: chartType === 'stacked_bar' ? 'total' : undefined,
            data: [...new Set(data.map(d => d.cat))].map(cat => {
              const found = data.find(d => d.cat === cat && d.group === group);
              return found ? found.value : 0;
            })
          })) : [{
            type: 'bar',
            data: data.map(d => d.value)
          }],
        legend: genes.Encode.color ? {} : undefined
      };
    case 'line':
    case 'area':
      return {
        xAxis: { type: 'category', data: [...new Set(data.map(d => d.time))] },
        yAxis: { type: 'value' },
        series: Array.from(new Set(data.map(d => d.group))).map(group => ({
          name: group,
          type: chartType === 'area' ? 'line' : 'line',
          areaStyle: chartType === 'area' ? {} : undefined,
          data: [...new Set(data.map(d => d.time))].map(time => {
            const found = data.find(d => d.time === time && d.group === group);
            return found ? found.value : 0;
          })
        })),
        legend: {}
      };
    case 'scatter':
      return {
        xAxis: {},
        yAxis: {},
        series: [{
          symbolSize: d => d.value || 10,
          data: data.map(d => [d.x, d.y, d.value]),
          type: 'scatter'
        }]
      };
    case 'pie':
    case 'donut':
      return {
        series: [{
          type: 'pie',
          radius: chartType === 'donut' ? ['40%', '70%'] : '60%',
          data: data.map(d => ({ value: d.value, name: d.cat }))
        }]
      };
    case 'rose':
      return {
        series: [{
          type: 'pie',
          roseType: 'radius',
          data: data.map(d => ({ value: d.value, name: d.cat }))
        }]
      };
    case 'radar':
      const indicators = [...new Set(data.map(d => d.cat))].map(cat => ({ name: cat, max: 100 }));
      return {
        radar: { indicator: indicators },
        series: Array.from(new Set(data.map(d => d.group))).map(group => ({
          type: 'radar',
          name: group,
          data: [indicators.map(ind => {
            const found = data.find(d => d.cat === ind.name && d.group === group);
            return found ? found.value : 0;
          })]
        })),
        legend: {}
      };
    case 'boxplot':
      return {
        xAxis: { type: 'category', data: [...new Set(data.map(d => d.cat))] },
        yAxis: { type: 'value' },
        series: [{
          type: 'boxplot',
          data: [...new Set(data.map(d => d.cat))].map(cat => {
            const values = data.filter(d => d.cat === cat).map(d => d.value);
            values.sort((a, b) => a - b);
            const min = values[0], max = values[values.length - 1];
            const median = values[Math.floor(values.length / 2)];
            const q1 = values[Math.floor(values.length / 4)];
            const q3 = values[Math.floor(values.length * 3 / 4)];
            return [min, q1, median, q3, max];
          })
        }]
      };
    case 'heatmap':
      const xCats = [...new Set(data.map(d => d.cat1))];
      const yCats = [...new Set(data.map(d => d.cat2))];
      return {
        xAxis: { type: 'category', data: xCats },
        yAxis: { type: 'category', data: yCats },
        visualMap: {
          min: 0,
          max: Math.max(...data.map(d => d.value)),
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%'
        },
        series: [{
          type: 'heatmap',
          data: data.map(d => [xCats.indexOf(d.cat1), yCats.indexOf(d.cat2), d.value]),
        }]
      };
    case 'sankey':
      return {
        series: [{
          type: 'sankey',
          data: Array.from(new Set([
            ...data.map(d => d.node1),
            ...data.map(d => d.node2)
          ])).map(name => ({ name })),
          links: data.map(d => ({ source: d.node1, target: d.node2, value: d.value }))
        }]
      };
    default:
      return {};
  }
}; 