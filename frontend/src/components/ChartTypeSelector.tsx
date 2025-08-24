import React from 'react';
import { BarChart, LineChart, PieChart, ScatterChart } from 'lucide-react';
import Card, { CardContent } from './ui/Card';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | '3dBar' | '3dScatter';

interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onChange: (type: ChartType) => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ selectedType, onChange }) => {
  const chartTypes = [
    { type: 'bar', label: 'Bar Chart', icon: <BarChart size={24} /> },
    { type: 'line', label: 'Line Chart', icon: <LineChart size={24} /> },
    { type: 'pie', label: 'Pie Chart', icon: <PieChart size={24} /> },
    { type: 'scatter', label: 'Scatter Plot', icon: <ScatterChart size={24} /> },
    { type: '3dBar', label: '3D Bar Chart', icon: <BarChart size={24} /> },
    { type: '3dScatter', label: '3D Scatter Plot', icon: <ScatterChart size={24} /> }
  ];

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Chart Type</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {chartTypes.map((chart) => (
          <div 
            key={chart.type}
            onClick={() => onChange(chart.type as ChartType)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedType === chart.type ? 'transform scale-105' : ''
            }`}
          >
            <Card 
              className={`h-24 flex flex-col items-center justify-center transition-all duration-200 ${
                selectedType === chart.type
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <CardContent className="p-3 text-center">
                <div className={`mx-auto ${
                  selectedType === chart.type ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {chart.icon}
                </div>
                <p className={`mt-1 text-xs font-medium ${
                  selectedType === chart.type ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {chart.label}
                </p>
                {chart.type.startsWith('3d') && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                    3D
                  </span>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartTypeSelector;