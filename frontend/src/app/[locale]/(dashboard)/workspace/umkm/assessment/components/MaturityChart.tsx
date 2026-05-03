"use client";

import React from "react";

interface DataPoint {
  subject: string;
  score: number;
  fullMark: number;
}

interface MaturityChartProps {
  data: DataPoint[];
  size?: number;
}

export default function MaturityChart({ data, size = 300 }: MaturityChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const totalAxes = data.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Calculate coordinates for a point
  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 5) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Background polygons (grid)
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map((level) => {
    return data
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Data polygon
  const dataPoints = data.map((d, i) => getCoordinates(i, d.score));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/20"
          />
        ))}

        {/* Axes */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 5);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground/20"
            />
          );
        })}

        {/* Data Area */}
        <polygon
          points={dataPolygon}
          fill="rgba(var(--primary-rgb), 0.2)"
          stroke="var(--primary)"
          strokeWidth="3"
          className="text-primary fill-primary/20 stroke-primary"
          style={{ 
            fill: 'rgba(59, 130, 246, 0.2)',
            stroke: '#3b82f6'
          }}
        />

        {/* Data Points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#3b82f6"
            className="text-primary"
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, 5.8);
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (x < center - 20) textAnchor = "end";
          if (x > center + 20) textAnchor = "start";

          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="10"
              fontWeight="bold"
              textAnchor={textAnchor}
              className="fill-muted-foreground uppercase tracking-tighter"
            >
              {d.subject.split(" ")[0]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
