import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileSpreadsheet, Download, Share2, ArrowLeft, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import DataTable from '../components/DataTable';
import ChartTypeSelector, { ChartType } from '../components/ChartTypeSelector';
import AxisSelector from '../components/AxisSelector';
import Chart from '../components/Chart';

interface Column {
  key: string;
  name: string;
}


const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string | null>(null);
  const [zAxis, setZAxis] = useState<string | null>(null);
  const [fileName, setFileName] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<any>(null);
  const handleDownloadPDF = () => {
    chartRef.current?.downloadPDF?.();
  };


  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/files/${id}/data`);
        const result = await res.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || 'Invalid data');
        }

        const parsed = result.data;
        setData(parsed);

        if (parsed.length > 0) {
          const firstItem = parsed[0];
          const cols = Object.keys(firstItem).map(key => ({
            key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
          }));
          setColumns(cols);
          setXAxis(cols[0]?.key || '');
          setYAxis(cols[1]?.key || '');
          if (cols.length > 2) setZAxis(cols[2]?.key || null);
        }

        setFileName(`Analysis_${id}.xlsx`);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  
  const handleShare = () => alert('Share functionality would be implemented here');

  const columnOptions = columns.map(col => col.key);
  const is3D = chartType === '3dBar' || chartType === '3dScatter';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-16">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                <h1 className="text-2xl font-bold">{fileName}</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {data.length} rows • {columns.length} columns
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center">
                <Share2 size={16} className="mr-1" />
                <span>Share</span>
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} className="flex items-center">
                <Download size={16} className="mr-1" />
                <span>Download as PDF</span>
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <CardHeader className="pb-0 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle>Chart Visualization</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Chart
                    ref={chartRef}
                      data={data}
                      xAxis={xAxis}
                      yAxis={yAxis || ''}
                      zAxis={zAxis || undefined}
                      type={chartType}
                      title={`${yAxis} by ${xAxis}`}
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-gray-800 dark:text-white">Chart Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <ChartTypeSelector selectedType={chartType} onChange={setChartType} />
                      <AxisSelector
                        columns={columnOptions}
                        selectedX={xAxis}
                        selectedY={yAxis}
                        selectedZ={zAxis}
                        onChangeX={setXAxis}
                        onChangeY={setYAxis}
                        onChangeZ={setZAxis}
                        is3D={is3D}
                      />
                      <div className="bg-blue-50 dark:bg-blue-900 rounded-md p-4 border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-200 flex">
                        <Info size={16} className="mr-2 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-300" />
                        <div>
                          <p className="font-medium">AI Suggestion</p>
                          <p className="mt-1">
                            Based on your data, a {is3D ? '3D Bar' : chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart would be a good choice to visualize the relationship between {xAxis} and {yAxis}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <CardHeader className="pb-0 border-b border-gray-200 dark:border-gray-700">
                <CardTitle>Data Preview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <DataTable data={data} columns={columns} rowsPerPage={10} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
