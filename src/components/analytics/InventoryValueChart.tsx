import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { supabase } from '@/lib/supabase/client'

interface InventoryValueChartProps {
  timeframe: '7days' | '30days' | '90days' | '1year'
}

const InventoryValueChart: React.FC<InventoryValueChartProps> = ({ timeframe }) => {
  const t = useTranslations('dashboard.analytics.valueChart')
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // In a real application, we would fetch historical data from a table like inventory_history
        // For demonstration, we'll generate mock data based on the selected timeframe
        
        const today = new Date()
        const data: any[] = []
        
        // Determine number of data points and interval based on timeframe
        let days: number
        let interval: number
        
        switch (timeframe) {
          case '7days':
            days = 7
            interval = 1 // 1 day interval
            break
          case '30days':
            days = 30
            interval = 2 // 2 day interval
            break
          case '90days':
            days = 90
            interval = 6 // 6 day interval
            break
          case '1year':
            days = 365
            interval = 30 // monthly interval
            break
          default:
            days = 30
            interval = 2
        }
        
        // Generate data points
        for (let i = days; i >= 0; i -= interval) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          
          // Generate a plausible value with some randomness
          // Base value increases over time to show growth trend
          const baseValue = 50000 + (days - i) * 500
          const randomFactor = 0.9 + Math.random() * 0.2 // Random factor between 0.9 and 1.1
          const value = Math.round(baseValue * randomFactor)
          
          data.push({
            date: date.toISOString().split('T')[0],
            value
          })
        }
        
        setChartData(data)
      } catch (error) {
        console.error('Error fetching inventory value history:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [timeframe])

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
                <span className="text-gray-600">{t('inventoryValue')}: </span>
                <span className="font-medium">${entry.value.toLocaleString()}</span>
              </p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          name={t('inventoryValue')}
          stroke="#8884d8" 
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default InventoryValueChart 