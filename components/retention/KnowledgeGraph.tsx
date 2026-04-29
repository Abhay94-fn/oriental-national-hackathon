import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Concept } from '../../types';

export function KnowledgeGraph({ concepts }: { concepts: Concept[] }) {
  // Group concepts by topic for Treemap
  const groups: Record<string, any[]> = {};
  
  concepts.forEach(c => {
    if (!groups[c.topic]) {
      groups[c.topic] = [];
    }
    groups[c.topic].push({
      name: c.subtopic,
      size: c.strength || 1, // Treemap size based on strength
      strength: c.strength
    });
  });

  const data = Object.keys(groups).map(topic => ({
    name: topic,
    children: groups[topic]
  }));

  const CustomContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name, strength } = props;
    
    // Choose color based on depth
    let color = '#1a3256'; // border color
    if (depth === 1) {
      color = '#0f2040'; // card color
    } else if (depth === 2) {
      if (strength < 40) color = '#7f1d1d'; // red dark
      else if (strength < 80) color = '#b45309'; // amber dark
      else color = '#065f46'; // green dark
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: '#1a3256',
            strokeWidth: 2,
            strokeOpacity: 1,
            transition: 'all 0.3s ease',
          }}
        />
        {width > 50 && height > 30 && depth === 2 && (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={12} fillOpacity={0.9} className="font-dmsans">
             {name.length > 15 ? name.substring(0, 15) + '...' : name}
          </text>
        )}
        {width > 80 && height > 50 && depth === 1 && (
          <text x={x + width / 2} y={y + height / 2} fill="#ccd6f6" fontSize={16} fontWeight="bold" textAnchor="middle" className="font-sora">
            {name}
          </text>
        )}
      </g>
    );
  };

  if (!concepts || concepts.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted text-sm">No concepts available for graph.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        content={<CustomContent />}
      >
        <Tooltip 
           content={({ active, payload }) => {
              if (active && payload && payload.length) {
                 const data = payload[0].payload;
                 if (data.depth === 1) return null;
                 return (
                    <div className="bg-card-2 border border-border p-3 rounded-xl shadow-xl">
                       <p className="font-bold text-white text-sm mb-1">{data.name}</p>
                       <p className="text-xs text-primary">Mastery: {data.strength}%</p>
                    </div>
                 );
              }
              return null;
           }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
