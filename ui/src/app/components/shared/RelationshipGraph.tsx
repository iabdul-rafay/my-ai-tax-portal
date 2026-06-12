import { useState, useEffect, useRef } from "react";
import type { GraphNode, GraphEdge } from "../../types";
import { User, MapPin, Car, Home, Zap, Plane } from "lucide-react";

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface NodeState {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const COLORS: Record<string, { fill: string; stroke: string; text: string; bg: string }> = {
  person: { fill: "#3b82f6", stroke: "#1d4ed8", text: "#ffffff", bg: "bg-blue-500" },
  address: { fill: "#ef4444", stroke: "#b91c1c", text: "#ffffff", bg: "bg-red-500" },
  vehicle: { fill: "#f97316", stroke: "#c2410c", text: "#ffffff", bg: "bg-orange-500" },
  property: { fill: "#10b981", stroke: "#047857", text: "#ffffff", bg: "bg-emerald-500" },
  utility: { fill: "#f59e0b", stroke: "#b45309", text: "#ffffff", bg: "bg-amber-500" },
  passport: { fill: "#8b5cf6", stroke: "#6d28d9", text: "#ffffff", bg: "bg-violet-500" },
};

function getNodeIcon(type: string, className: string) {
  switch (type) {
    case "person": return <User className={className} />;
    case "address": return <MapPin className={className} />;
    case "vehicle": return <Car className={className} />;
    case "property": return <Home className={className} />;
    case "utility": return <Zap className={className} />;
    case "passport": return <Plane className={className} />;
    default: return <User className={className} />;
  }
}

export function RelationshipGraph({ nodes: initialNodes, edges }: Props) {
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize node positions in a circle layout
  useEffect(() => {
    if (!initialNodes || initialNodes.length === 0) return;

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 130;

    const states: NodeState[] = initialNodes.map((n, i) => {
      // Position root nodes in the center, children radially
      const angle = (i / (initialNodes.length - 1 || 1)) * Math.PI * 2;
      const isRoot = n.type === "person" && i === 0;
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        x: isRoot ? centerX : centerX + radius * Math.cos(angle),
        y: isRoot ? centerY : centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
        size: n.type === "person" ? 28 : 20,
      };
    });

    setNodes(states);
    setSelectedNode(states[0]?.id || null);
  }, [initialNodes]);

  // Basic Force-Directed Physics Simulation Loop
  useEffect(() => {
    if (nodes.length === 0 || draggedNode !== null) return;

    let animId: number;
    const ticks = 120; // limit tick loops to stabilize
    let tickCount = 0;

    const runSimulation = () => {
      if (tickCount > ticks) return;

      setNodes((currentNodes) => {
        const width = 600;
        const height = 400;
        const centerX = width / 2;
        const centerY = height / 2;

        const k = 0.08; // gravity force factor
        const repulse = 600; // node repulsion strength
        const attract = 0.05; // edge attraction strength
        const friction = 0.85;

        // Clone nodes to calculate new positions
        const nextNodes = currentNodes.map(n => ({ ...n }));

        // 1. Repulsion between all nodes
        for (let i = 0; i < nextNodes.length; i++) {
          const n1 = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n2 = nextNodes[j];
            const dx = n2.x - n1.x || 0.01;
            const dy = n2.y - n1.y || 0.01;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = repulse / (dist * dist + 10);
            
            // Push away
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }

        // 2. Attraction along edges
        edges.forEach(edge => {
          const sourceNode = nextNodes.find(n => n.id === edge.source);
          const targetNode = nextNodes.find(n => n.id === edge.target);

          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const fx = dx * attract;
            const fy = dy * attract;

            sourceNode.vx += fx;
            sourceNode.vy += fy;
            targetNode.vx -= fx;
            targetNode.vy -= fy;
          }
        });

        // 3. Gravity pulling toward center & apply velocities
        nextNodes.forEach(n => {
          // Gravity pull to center
          n.vx += (centerX - n.x) * k * 0.1;
          n.vy += (centerY - n.y) * k * 0.1;

          // Apply velocity and drag
          n.vx *= friction;
          n.vy *= friction;
          n.x += n.vx;
          n.y += n.vy;

          // Constrain within bounds
          n.x = Math.max(n.size, Math.min(width - n.size, n.x));
          n.y = Math.max(n.size, Math.min(height - n.size, n.y));
        });

        return nextNodes;
      });

      tickCount++;
      animId = requestAnimationFrame(runSimulation);
    };

    animId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animId);
  }, [edges, draggedNode, initialNodes]);

  // Handle Dragging
  function handleMouseDown(nodeId: string) {
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!draggedNode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === draggedNode) {
          return { ...n, x, y, vx: 0, vy: 0 };
        }
        return n;
      })
    );
  }

  function handleMouseUp() {
    setDraggedNode(null);
  }

  const selectedNodeData = initialNodes.find(n => n.id === selectedNode);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col md:flex-row h-[420px]">
      {/* Graph Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-muted/10 h-[280px] md:h-full cursor-crosshair select-none"
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 600 400"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, i) => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            const isHovered = hoveredNode === edge.source || hoveredNode === edge.target;
            const isSelected = selectedNode === edge.source || selectedNode === edge.target;

            return (
              <g key={i}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isSelected ? "#3b82f6" : isHovered ? "#93c5fd" : "#e2e8f0"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 1.2}
                  strokeDasharray={edge.label === "FAMILY_MEMBER" ? "4" : undefined}
                />
                {/* Edge Label on hover */}
                {isHovered && (
                  <text
                    x={(source.x + target.x) / 2}
                    y={(source.y + target.y) / 2 - 4}
                    textAnchor="middle"
                    className="text-[9px] font-semibold fill-blue-700 bg-white"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const palette = COLORS[node.type] || COLORS.person;
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={() => handleMouseDown(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer Glow ring for selection */}
                {isSelected && (
                  <circle
                    r={node.size + 6}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                    className="animate-[spin_10s_linear_infinite]"
                  />
                )}
                
                {/* Main Node Circle */}
                <circle
                  r={node.size}
                  fill={palette.fill}
                  stroke={isSelected ? "#1d4ed8" : isHovered ? "#1e40af" : palette.stroke}
                  strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                  filter="drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))"
                />

                {/* Inner Icon */}
                <g transform="translate(-8, -8)" pointerEvents="none">
                  {getNodeIcon(node.type, "h-4 w-4 text-white")}
                </g>

                {/* Label Text below node */}
                <text
                  y={node.size + 14}
                  textAnchor="middle"
                  className={`text-[10px] select-none font-semibold ${
                    isSelected ? "fill-blue-700 font-bold" : "fill-muted-foreground"
                  }`}
                >
                  {node.label.length > 18 ? `${node.label.slice(0, 15)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail sidebar panel */}
      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-border p-4 bg-muted/10 overflow-y-auto flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Graph Node Inspector
          </h4>
          {selectedNodeData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center p-1.5 rounded-lg text-white ${
                  COLORS[selectedNodeData.type]?.bg || "bg-blue-500"
                }`}>
                  {getNodeIcon(selectedNodeData.type, "h-4 w-4")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {selectedNodeData.label}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedNodeData.type} Node
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-2 text-xs space-y-1 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Node ID:</span> {selectedNodeData.id}
                </p>
                {selectedNodeData.type === "person" && (
                  <p className="text-blue-600 font-medium bg-blue-50/50 p-1 rounded">
                    🚀 Anchor entity for Tax NET audit.
                  </p>
                )}
                {selectedNodeData.type === "address" && (
                  <p className="text-red-600 font-medium bg-red-50/50 p-1 rounded">
                    📍 Address linked across multiple database registries.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Click a node to inspect its attributes.</p>
          )}
        </div>

        <div className="text-[10px] text-muted-foreground mt-4 pt-2 border-t border-border leading-tight">
          💡 <span className="font-medium">Interaction Tip:</span> You can click and drag nodes to untangle relationships.
        </div>
      </div>
    </div>
  );
}
