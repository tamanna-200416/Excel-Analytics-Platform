import { ChartType } from '../components/ChartTypeSelector';

/**
 * Analyzes data and suggests the best chart type
 * @param data - The data to analyze
 * @param xAxis - The x-axis column name
 * @param yAxis - The y-axis column name
 * @returns The suggested chart type
 */
export const suggestChartType = (
  data: Record<string, any>[],
  xAxis: string,
  yAxis: string
): ChartType => {
  if (!data.length || !xAxis || !yAxis) {
    return 'bar'; // Default to bar if not enough info
  }

  // Get unique values in x-axis
  const uniqueXValues = new Set(data.map(row => row[xAxis]));
  const uniqueCount = uniqueXValues.size;
  
  // Check if x values are numeric
  const isXNumeric = data.every(row => typeof row[xAxis] === 'number');
  const isYNumeric = data.every(row => typeof row[yAxis] === 'number');
  
  // Check for date-like strings
  const isXDate = !isXNumeric && data.every(row => !isNaN(Date.parse(String(row[xAxis]))));
  
  // If small number of unique categories
  if (uniqueCount <= 10 && (!isXNumeric || isXDate)) {
    // Pie charts work well with small number of categories
    if (uniqueCount <= 6) {
      return 'pie';
    }
    // Bar charts for more categories but still manageable
    return 'bar';
  }
  
  // Time series or many categories
  if (isXDate || uniqueCount > 10) {
    return 'line';
  }
  
  // If both axes are numeric, suggest scatter
  if (isXNumeric && isYNumeric) {
    return 'scatter';
  }
  
  // Default to bar
  return 'bar';
};

/**
 * Formats data for a specific chart type
 * @param data - The data to format
 * @param xAxis - The x-axis column name
 * @param yAxis - The y-axis column name
 * @param type - The chart type
 * @returns Formatted data ready for the chart
 */
export const formatChartData = (
  data: Record<string, any>[],
  xAxis: string,
  yAxis: string,
  type: ChartType
): any => {
  // This function would format data specifically for the charting library being used
  // For example, echarts has specific format requirements for different chart types
  
  switch (type) {
    case 'pie':
      return data.map(item => ({
        name: item[xAxis],
        value: item[yAxis]
      }));
    
    case 'bar':
    case 'line':
      return {
        xData: data.map(item => item[xAxis]),
        yData: data.map(item => item[yAxis])
      };
    
    case 'scatter':
      return data.map(item => [item[xAxis], item[yAxis]]);
    
    case '3dBar':
    case '3dScatter':
      // Assuming zAxis is also provided
      return data.map(item => [item[xAxis], item[yAxis], item.zAxis || 0]);
    
    default:
      return data;
  }
};

/**
 * Checks if a dataset has enough numerical columns for 3D visualization
 * @param data - The dataset to check
 * @returns A boolean indicating if 3D visualization is possible
 */
export const canUse3DVisualization = (data: Record<string, any>[]): boolean => {
  if (!data.length) return false;
  
  // Need at least 3 numerical columns for 3D visualization
  const firstRow = data[0];
  let numericColumnCount = 0;
  
  for (const key in firstRow) {
    if (typeof firstRow[key] === 'number') {
      numericColumnCount++;
    }
  }
  
  return numericColumnCount >= 3;
};

/**
 * Generates default chart options for a specific chart type
 * @param type - The chart type
 * @param title - The chart title
 * @returns Default chart options
 */
export const getDefaultChartOptions = (type: ChartType, title?: string): any => {
  const baseOptions = {
    title: {
      text: title || 'Chart',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    }
  };
  
  switch (type) {
    case 'bar':
      return {
        ...baseOptions,
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar',
          data: []
        }]
      };
    
    case 'line':
      return {
        ...baseOptions,
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'line',
          data: [],
          smooth: true
        }]
      };
    
    case 'pie':
      return {
        ...baseOptions,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [{
          name: 'Data',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    
    case 'scatter':
      return {
        ...baseOptions,
        xAxis: {
          type: 'value',
          scale: true
        },
        yAxis: {
          type: 'value',
          scale: true
        },
        series: [{
          type: 'scatter',
          data: []
        }]
      };
    
    case '3dBar':
      return {
        ...baseOptions,
        grid3D: {},
        xAxis3D: {
          type: 'category'
        },
        yAxis3D: {
          type: 'category'
        },
        zAxis3D: {
          type: 'value'
        },
        series: [{
          type: 'bar3D',
          data: []
        }]
      };
    
    case '3dScatter':
      return {
        ...baseOptions,
        grid3D: {},
        xAxis3D: {
          type: 'value'
        },
        yAxis3D: {
          type: 'value'
        },
        zAxis3D: {
          type: 'value'
        },
        series: [{
          type: 'scatter3D',
          data: []
        }]
      };
    
    default:
      return baseOptions;
  }
};

export default {
  suggestChartType,
  formatChartData,
  canUse3DVisualization,
  getDefaultChartOptions
};