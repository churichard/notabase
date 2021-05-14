import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import defaultTheme from 'tailwindcss/defaultTheme';

type NodeDatum = {
  id: string;
  name: string;
  numOfLinks: number;
} & d3.SimulationNodeDatum;

type LinkDatum = d3.SimulationLinkDatum<NodeDatum>;

export type GraphData = { nodes: NodeDatum[]; links: LinkDatum[] };

type DragEvent = d3.D3DragEvent<HTMLCanvasElement, NodeDatum, NodeDatum>;

type Props = {
  data: GraphData;
  width: number;
  height: number;
  className?: string;
};

export default function ForceGraph(props: Props) {
  const { data, width, height, className } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transform = useRef(d3.zoomIdentity);

  const renderCanvas = useCallback(
    (context: CanvasRenderingContext2D) => {
      context.save();
      context.clearRect(0, 0, width, height);

      context.translate(transform.current.x, transform.current.y);
      context.scale(transform.current.k, transform.current.k);

      // Draw links
      data.links.forEach((link) => drawLink(context, link));

      // Draw nodes
      for (const node of data.nodes) {
        drawNode(
          context,
          node,
          getRadius(node.numOfLinks),
          transform.current.k
        );
      }

      context.restore();
    },
    [width, height, data]
  );

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) {
      return;
    }

    const simulation: d3.Simulation<NodeDatum, LinkDatum> = d3
      .forceSimulation<NodeDatum>(data.nodes)
      .force(
        'link',
        d3.forceLink<NodeDatum, LinkDatum>(data.links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2));

    simulation.on('tick', () => renderCanvas(context));

    // Add drag + zoom
    const onZoom = (t: d3.ZoomTransform) => {
      transform.current = t;
      renderCanvas(context);
    };

    d3.select<HTMLCanvasElement, NodeDatum>(context.canvas)
      .call(drag(simulation, context.canvas))
      .call(
        d3
          .zoom<HTMLCanvasElement, NodeDatum>()
          .scaleExtent([0.1, 10])
          .extent([
            [0, 0],
            [width, height],
          ])
          .on('zoom', ({ transform }) => onZoom(transform))
      )
      .on('mousemove', (event) => {
        const { x, y } = getMousePos(context.canvas, event);
        const hoveredNode = getNode(simulation, context.canvas, x, y);

        if (hoveredNode) {
          context.canvas.style.cursor = 'pointer';
        } else {
          context.canvas.style.cursor = 'default';
        }
      });
  }, [data, renderCanvas, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}

const getMousePos = (canvas: HTMLCanvasElement, event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const getNode = (
  simulation: d3.Simulation<NodeDatum, LinkDatum>,
  canvas: HTMLCanvasElement,
  canvasX: number,
  canvasY: number
) => {
  const transform = d3.zoomTransform(canvas);
  const x = transform.invertX(canvasX);
  const y = transform.invertY(canvasY);
  const subject = simulation.find(x, y);
  if (
    subject &&
    subject.x &&
    subject.y &&
    Math.hypot(x - subject.x, y - subject.y) <= getRadius(subject.numOfLinks)
  ) {
    return subject;
  } else {
    return undefined;
  }
};

const drag = (
  simulation: d3.Simulation<NodeDatum, LinkDatum>,
  canvas: HTMLCanvasElement
) => {
  let initialDragPos: { x: number; y: number };

  function dragsubject(event: DragEvent) {
    return getNode(simulation, canvas, event.x, event.y);
  }

  function dragstarted(event: DragEvent) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    const subject = event.subject;
    if (!subject.x || !subject.y) {
      return;
    }
    initialDragPos = { x: subject.x, y: subject.y };
    subject.fx = subject.x;
    subject.fy = subject.y;
  }

  function dragged(event: DragEvent) {
    const transform = d3.zoomTransform(canvas);
    event.subject.fx =
      initialDragPos.x + (event.x - initialDragPos.x) / transform.k;
    event.subject.fy =
      initialDragPos.y + (event.y - initialDragPos.y) / transform.k;
  }

  function dragended(event: DragEvent) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag<HTMLCanvasElement, NodeDatum, NodeDatum | undefined>()
    .subject(dragsubject)
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};

const drawLink = (context: CanvasRenderingContext2D, link: LinkDatum) => {
  const source = link.source as NodeDatum;
  const target = link.target as NodeDatum;
  if (!source.x || !source.y || !target.x || !target.y) {
    return;
  }
  context.beginPath();
  context.moveTo(source.x, source.y);
  context.lineWidth = 0.5;
  context.lineTo(target.x, target.y);
  context.strokeStyle = '#D6D3D1';
  context.stroke();
};

const drawNode = (
  context: CanvasRenderingContext2D,
  node: NodeDatum,
  radius: number,
  scale: number
) => {
  if (!node.x || !node.y) {
    return;
  }
  context.save();

  // Draw node
  context.beginPath();
  context.moveTo(node.x + radius, node.y);
  context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
  // Fill node color
  context.fillStyle = '#A8A29E';
  context.fill();
  // Add node text
  if (scale > 3) {
    context.globalAlpha = 1;
  } else if (scale > 2) {
    context.globalAlpha = 0.8;
  } else {
    context.globalAlpha = 0;
  }
  context.fillStyle = '#57534E';
  context.font = `4px ${defaultTheme.fontFamily.sans.join(', ')}`;

  const lines = getLines(context, node.id, 50);
  let yPos = node.y + radius + 5;
  for (const line of lines) {
    const textWidth = context.measureText(line).width;
    context.fillText(line, node.x - textWidth / 2, yPos);
    yPos += 5;
  }

  context.restore();
};

const getRadius = (numOfLinks: number) => {
  const BASE_RADIUS = 3;
  const LINK_MULTIPLIER = 0.5;
  return BASE_RADIUS + LINK_MULTIPLIER * numOfLinks;
};

const getLines = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};
