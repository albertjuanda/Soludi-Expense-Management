import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { ExpenseRequest } from '../../types';
import { formatRp } from '../../utils/currency';

interface CategoryChartProps {
  expenses: ExpenseRequest[];
  type?: 'donut' | 'bar';
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#94a3b8'];

const CategoryChart: React.FC<CategoryChartProps> = ({ expenses, type = 'donut' }) => {
  const categoryTotals: Record<string, number> = {};

  expenses.forEach(expense => {
    expense.items.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.subtotal;
    });
  });

  const data = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        No expense data to display
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      const pct = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{payload[0].name}</p>
          <p className="text-sm text-slate-600">{formatRp(payload[0].value)}</p>
          <p className="text-xs text-slate-400">{pct}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 min-w-0 w-full lg:w-48">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-xs text-slate-600 flex-1 truncate">{item.name}</span>
            <span className="text-xs font-semibold text-slate-700">
              {formatRp(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
