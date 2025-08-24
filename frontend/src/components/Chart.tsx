import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState
} from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ChartType } from './ChartTypeSelector';

interface ChartProps {
  data: Record<string, any>[];
  xAxis: string;
  yAxis: string;
  zAxis?: string;
  type: ChartType;
  title?: string;
}

const Chart = forwardRef(({
  data,
  xAxis,
  yAxis,
  zAxis,
  type,
  title
}: ChartProps, ref) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    downloadChart: () => {
      if (chartInstance.current) {
        const url = chartInstance.current.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: isDarkMode ? '#111827' : '#ffffff'
        });
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chart.png';
        link.click();
      }
    },
    downloadPDF: async () => {
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: isDarkMode ? '#111827' : '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('chart.pdf');
      }
    }
  }));

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    if (chartInstance.current) chartInstance.current.dispose();
    chartInstance.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : 'light');

    const xData = data.map(item => item[xAxis]);
    const yData = data.map(item => item[yAxis]);
    const zData = zAxis ? data.map(item => item[zAxis]) : undefined;

    const options = getChartOptions(type, xData, yData, zData, title, xAxis, yAxis, zAxis, isDarkMode);
    chartInstance.current.setOption(options);
  }, [data, xAxis, yAxis, zAxis, type, title, isDarkMode]);

  useEffect(() => {
    const resizeHandler = () => chartInstance.current?.resize();
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  const getChartOptions = (
    chartType: ChartType,
    xData: any[],
    yData: any[],
    zData?: any[],
    chartTitle?: string,
    xAxisName?: string,
    yAxisName?: string,
    zAxisName?: string,
    isDark?: boolean
  ): echarts.EChartsOption => {
    const axisLabelSettings = {
      rotate: xData.length > 10 ? 45 : 0,
      interval: 0,
      overflow: 'truncate' as 'truncate',
    };

    const baseOptions: echarts.EChartsOption = {
      title: {
        text: chartTitle || 'Chart',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: {
        top: 60, bottom: 80, left: 80, right: 60,
        containLabel: true
      },
      toolbox: {
        feature: { saveAsImage: { title: 'Save as Image' } }
      }
    };

    switch (chartType) {
      case 'bar':
        return {
          ...baseOptions,
          xAxis: { type: 'category', data: xData, name: xAxisName, axisLabel: axisLabelSettings },
          yAxis: { type: 'value', name: yAxisName },
          series: [{
            type: 'bar',
            data: yData,
            itemStyle: { color: isDark ? '#58C6F2' : '#3B7BE5' }
          }]
        };

      case 'line':
        return {
          ...baseOptions,
          xAxis: { type: 'category', data: xData, name: xAxisName, axisLabel: axisLabelSettings },
          yAxis: { type: 'value', name: yAxisName },
          series: [{
            type: 'line',
            data: yData,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { width: 3, color: isDark ? '#58C6F2' : '#3B7BE5' },
            itemStyle: { color: isDark ? '#58C6F2' : '#3B7BE5' }
          }]
        };

      case 'pie':
        return {
          ...baseOptions,
          tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
          legend: { orient: 'vertical', left: 'left', data: xData },
          series: [{
            type: 'pie',
            name: yAxisName,
            radius: '60%',
            center: ['50%', '55%'],
            data: xData.map((label, i) => ({ name: label, value: yData[i] })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0,0,0,0.5)'
              }
            },
            label: { show: true, formatter: '{b}: {d}%' }
          }]
        };

      case 'scatter':
        return {
          ...baseOptions,
          xAxis: { type: 'value', name: xAxisName, axisLabel: axisLabelSettings },
          yAxis: { type: 'value', name: yAxisName },
          series: [{
            type: 'scatter',
            data: xData.map((x, i) => [x, yData[i]]),
            symbolSize: 10,
            itemStyle: { color: isDark ? '#58C6F2' : '#3B7BE5' }
          }]
        };

      case '3dBar':
        return {
          ...baseOptions,
          grid3D: { viewControl: { projection: 'perspective', autoRotate: true } },
          xAxis3D: { type: 'category', data: xData, name: xAxisName },
          yAxis3D: {
            type: 'category',
            data: zData || Array(xData.length).fill('').map((_, i) => i.toString()),
            name: zAxisName
          },
          zAxis3D: { type: 'value', name: yAxisName },
          series: [{
            type: 'bar3D',
            data: xData.map((x, i) => [i, zData ? zData[i] : 0, yData[i]]),
            shading: 'lambert',
            itemStyle: { color: isDark ? '#58C6F2' : '#3B7BE5', opacity: 0.8 },
            emphasis: { itemStyle: { color: '#16BFA5' } }
          }] as any
        };

      case '3dScatter':
        const points = xData.map((x, i) => [
          Number(x),
          Number(yData[i]),
          zData ? Number(zData[i]) : 0
        ]).filter(p => p.every(val => !isNaN(val)));

        return {
          ...baseOptions,
          grid3D: {
            boxWidth: 180,
            boxDepth: 180,
            viewControl: { projection: 'perspective', autoRotate: true }
          },
          xAxis3D: { type: 'value', name: xAxisName },
          yAxis3D: { type: 'value', name: yAxisName },
          zAxis3D: { type: 'value', name: zAxisName || 'Z' },
          series: [{
            type: 'scatter3D',
            data: points,
            symbolSize: 10,
            itemStyle: { color: isDark ? '#58C6F2' : '#8A63D2', opacity: 0.8 },
            emphasis: { itemStyle: { color: '#16BFA5', opacity: 1 } }
          }] as any
        };

      default:
        return baseOptions;
    }
  };

  return (
    <div
      ref={chartRef}
      className="w-full h-96 bg-white dark:bg-gray-900 rounded-lg shadow-md"
      style={{ minHeight: '400px' }}
    />
  );
});

export default Chart;