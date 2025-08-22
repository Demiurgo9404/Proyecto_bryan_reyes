import React, { useEffect } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Line, 
  Bar, 
  Pie, 
  Doughnut 
} from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartTypes = {
  line: Line,
  bar: Bar,
  pie: Pie,
  doughnut: Doughnut,
};

const ChartContainer = ({ 
  title, 
  type = 'line', 
  data, 
  options: customOptions = {}, 
  height = 300,
  className = ''
}) => {
  // Verificar que el tipo de gráfico sea válido
  const chartType = chartTypes[type] || Line;
  
  // Configuración por defecto
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {}
  };

  // Configuración específica para gráficos de líneas/barras
  if (['line', 'bar'].includes(type)) {
    defaultOptions.scales = {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    };
  }

  // Ajustar opciones específicas para gráficos circulares
  if (['pie', 'doughnut'].includes(type)) {
    defaultOptions.cutout = type === 'doughnut' ? '70%' : 0;
    defaultOptions.aspectRatio = 1.5;
  }

  // Combinar opciones personalizadas con las predeterminadas
  const chartOptions = {
    ...defaultOptions,
    ...customOptions
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div style={{ height: `${height}px`, position: 'relative' }}>
        {React.createElement(chartType, {
          data: data,
          options: chartOptions
        })}
      </div>
    </div>
  );
};

export default ChartContainer;
