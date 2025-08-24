import React from 'react';
import Select from './ui/Select';

interface AxisSelectorProps {
  columns: string[];
  selectedX: string;
  selectedY: string | null;
  selectedZ: string | null;
  onChangeX: (value: string) => void;
  onChangeY: (value: string) => void;
  onChangeZ?: (value: string) => void;
  is3D?: boolean;
}

const AxisSelector: React.FC<AxisSelectorProps> = ({
  columns,
  selectedX,
  selectedY,
  selectedZ,
  onChangeX,
  onChangeY,
  onChangeZ,
  is3D = false
}) => {
  const options = columns.map(column => ({
    value: column,
    label: column
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Select
        label="X Axis"
        options={options}
        value={selectedX}
        onChange={onChangeX}
      />

      <Select
        label="Y Axis"
        options={options}
        value={selectedY || ''}
        onChange={onChangeY}
      />

      {is3D && onChangeZ && (
        <Select
          label="Z Axis"
          options={options}
          value={selectedZ || ''}
          onChange={onChangeZ}
        />
      )}
    </div>
  );
};

export default AxisSelector;
