
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RiskGaugeProps {
  score: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  const data = [
    { name: 'Risk', value: score },
    { name: 'Safety', value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s < 20) return '#10b981'; // green-500
    if (s < 50) return '#f59e0b'; // amber-500
    if (s < 80) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const color = getColor(score);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} stroke="none" />
            <Cell fill="#334155" stroke="none" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="text-4xl font-bold tracking-tighter" style={{ color }}>
          {score}
        </span>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Risk Score
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
