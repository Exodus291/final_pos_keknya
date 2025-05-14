'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList
} from 'recharts';
import { formatToIDR } from '../utils/formatIdr';


const Chart = ({ data }) => {
  return (
    <div style={{ 
      width: '100%',
      height: 500,
      margin: '20px 0',
      padding: '25px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      position: 'relative'
    }}>
      <h3 style={{
        position: 'absolute',
        left: '50%',
        top: '20px',
        transform: 'translateX(-50%)',
        color: '#2d3436',
        fontSize: '1.4rem',
        fontWeight: 600,
        letterSpacing: '0.5px'
      }}>
        📊 Penjualan
      </h3>
      
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 50, right: 30, left: 30, bottom: 20 }}>
          <defs>
            <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="4 4" 
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="date"
            tick={{ 
              fill: '#4b5563',
              fontSize: 12,
              angle: -30,
              textAnchor: 'end'
            }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            label={{ 
              value: 'Tanggal',
              position: 'bottom',
              offset: 0,
              fill: '#4b5563',
              fontSize: 13
            }}
          />

          <YAxis
            tickFormatter={formatToIDR}
            tick={{ fill: '#4b5563', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            label={{
              value: 'Jumlah Penjualan',
              angle: -90,
              position: 'left',
              fill: '#4b5563',
              fontSize: 13
            }}
          />

          <Tooltip
            content={({ payload, label }) => (
              <div style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e7eb'
              }}>
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <p className="text-sm text-indigo-600">
                  {formatToIDR(payload[0]?.value)}
                </p>
              </div>
            )}
          />

          <Legend
            wrapperStyle={{
              paddingTop: '30px',
              justifyContent: 'center',
              gap: '16px'
            }}
            formatter={(value) => (
              <span style={{
                color: '#4b5563',
                fontSize: '13px',
                paddingLeft: '6px'
              }}>
                {value}
              </span>
            )}
          />

          <Bar
            dataKey="totalAmount"
            fill="url(#gradientBar)"
            name="Total Penjualan"
            radius={[6, 6, 0, 0]}
            animationEasing="ease-out"
            animationDuration={800}
          >
            <LabelList
              dataKey="totalAmount"
              position="top"
              formatter={formatToIDR}
              style={{
                fill: '#1f2937',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.2px'
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default Chart;
