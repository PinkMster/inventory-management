import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface StockLevelChartProps {
  inventoryData: any[]
}

const StockLevelChart: React.FC<StockLevelChartProps> = ({ inventoryData }) => {
  // Process data for the chart
  const chartData = useMemo(() => {
    // Group by category
    const categoryGroups: Record<string, { quantity: number; minStock: number }> = {}
    
    inventoryData.forEach(item => {
      const category = item.category || 'Uncategorized'
      
      if (!categoryGroups[category]) {
        categoryGroups[category] = { quantity: 0, minStock: 0 }
      }
      
      categoryGroups[category].quantity += item.quantity
      categoryGroups[category].minStock += item.min_stock
    })
    
    // Convert to format needed for chart
    return Object.keys(categoryGroups).map(category => ({
      name: category,
      '현재 재고': categoryGroups[category].quantity,
      '최소 수준': categoryGroups[category].minStock
    }))
  }, [inventoryData])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center mt-2">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm">
                <span className="text-gray-600">{entry.name}: </span>
                <span className="font-medium">{entry.value.toLocaleString()}</span>
              </p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={(value) => value.toLocaleString()}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="현재 재고"
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="최소 수준"
          fill="#ef4444" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default StockLevelChart 