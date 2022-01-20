import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import defaultTheme from 'tailwindcss/defaultTheme';
import colors from 'tailwindcss/colors';
import { useRouter } from 'next/router';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from 'd3-force';
import { D3DragEvent, drag } from 'd3-drag';
import { zoom, zoomIdentity, zoomTransform, ZoomTransform } from 'd3-zoom';
import { select } from 'd3-selection';
import { useStore } from 'lib/store';

export type NodeDatum = {
  id: string;
  name: string;
  radius: number;
} & SimulationNodeDatum;

export type LinkDatum = SimulationLinkDatum<NodeDatum>;

export type GraphData = { nodes: NodeDatum[]; links: LinkDatum[] };

type DragEvent = D3DragEvent<HTMLCanvasElement, NodeDatum, NodeDatum>;

type Props = {
  data: GraphData;
  className?: string;
};

export default function ForceGraph(props: Props) {
  const { data, className } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transform = useRef(zoomIdentity);
  const hoveredNode = useRef<NodeDatum | null>(null);

  const darkMode = useStore((state) => state.darkMode);

  const router = useRouter();

  const neighbors = useMemo(() => {
    const neighbors: Record<string, boolean> = {};
    for (const link of data.links) {
      const sourceId = isNodeDatum(link.source) ? link.source.id : link.source;
      const targetId = isNodeDatum(link.target) ? link.target.id : link.target;
      neighbors[`${sourceId}-${targetId}`] = true;
      neighbors[`${targetId}-${sourceId}`] = true;
    }
    return neighbors;
  }, [data.links]);

  const areNeighbors = useCallback(
    (nodeId1: string | undefined, nodeId2: string | undefined) => {
      if (!nodeId1 || !nodeId2) {
        return false;
      }
      return (
        neighbors[`${nodeId1}-${nodeId2}`] || neighbors[`${nodeId2}-${nodeId1}`]
      );
    },
    [neighbors]
  );

  const drawLink = useCallback(
    (context: CanvasRenderingContext2D, link: LinkDatum) => {
      const source = link.source;
      const target = link.target;

      if (
        !isNodeDatum(source) ||
        !isNodeDatum(target) ||
        !source.x ||
        !source.y ||
        !target.x ||
        !target.y
      ) {
        return;
      }

      const isSourceHovered = source.id === hoveredNode.current?.id;
      const isTargetHovered = target.id === hoveredNode.current?.id;
      const isLinkHighlighted = isSourceHovered || isTargetHovered;

      context.save();

      context.beginPath();
      context.moveTo(source.x, source.y);
      context.lineWidth = 0.5;
      context.lineTo(target.x, target.y);
      if (isLinkHighlighted) {
        context.strokeStyle = colors.emerald[300];
      } else if (darkMode) {
        context.strokeStyle = colors.neutral[700];
      } else {
        context.strokeStyle = colors.neutral[200];
      }
      context.stroke();

      context.restore();
    },
    [darkMode]
  );

  const drawNode = useCallback(
    (context: CanvasRenderingContext2D, node: NodeDatum, scale: number) => {
      if (!node.x || !node.y) {
        return;
      }
      const isHovered = node.id === hoveredNode.current?.id;

      context.save();

      // Draw node
      context.beginPath();
      context.moveTo(node.x + node.radius, node.y);
      context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

      // Fill node color
      if (isHovered) {
        context.strokeStyle = colors.emerald[900];
        context.stroke();
        context.fillStyle = colors.emerald[400];
      } else if (areNeighbors(hoveredNode.current?.id, node.id)) {
        context.fillStyle = colors.emerald[400];
      } else {
        context.fillStyle = colors.neutral[400];
      }
      context.fill();

      // Add node text
      if (scale > 3) {
        context.globalAlpha = 1;
      } else if (scale > 2) {
        context.globalAlpha = 0.8;
      } else {
        context.globalAlpha = 0;
      }
      context.fillStyle = darkMode ? colors.neutral[100] : colors.neutral[600];
      // @ts-expect-error sans should exist on fontFamily, this is a problem in the types package
      context.font = `4px ${defaultTheme.fontFamily?.sans.join(', ')}`;

      const lines = getLines(context, node.name, 50);
      let yPos = node.y + node.radius + 5;
      for (const line of lines) {
        const textWidth = context.measureText(line).width;
        context.fillText(line, node.x - textWidth / 2, yPos);
        yPos += 5;
      }

      context.restore();
    },
    [areNeighbors, darkMode]
  );

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      return;
    }

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    context.save();
    context.clearRect(0, 0, width, height);

    const pixelRatio = window.devicePixelRatio;
    context.translate(
      transform.current.x * pixelRatio,
      transform.current.y * pixelRatio
    );
    context.scale(
      transform.current.k * pixelRatio,
      transform.current.k * pixelRatio
    );

    // Draw links
    for (const link of data.links) {
      drawLink(context, link);
    }

    // Draw nodes
    for (const node of data.nodes) {
      drawNode(context, node, transform.current.k * pixelRatio);
    }

    context.restore();
  }, [data, drawLink, drawNode]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      return;
    }

    const pixelRatio = window.devicePixelRatio;
    const width = canvasRef.current.width / pixelRatio;
    const height = canvasRef.current.height / pixelRatio;

    const simulation: Simulation<NodeDatum, LinkDatum> =
      forceSimulation<NodeDatum>(data.nodes)
        .force(
          'link',
          forceLink<NodeDatum, LinkDatum>(data.links).id((d) => d.id)
        )
        .force(
          'collide',
          forceCollide<NodeDatum>().radius((node) => node.radius)
        )
        .force('charge', forceManyBody().strength(-80))
        .force('center', forceCenter(width / 2, height / 2))
        .force('x', forceX(width / 2))
        .force('y', forceY(height / 2));

    simulation.on('tick', () => renderCanvas());

    select<HTMLCanvasElement, NodeDatum>(context.canvas)
      .call(getDrag(simulation, context.canvas, hoveredNode))
      .call(
        zoom<HTMLCanvasElement, NodeDatum>()
          .scaleExtent([0.1, 10])
          .extent([
            [0, 0],
            [width, height],
          ])
          .on('zoom', ({ transform: t }: { transform: ZoomTransform }) => {
            transform.current = t;
            renderCanvas();
          })
      )
      .on('mousemove', (event) => {
        const { x, y } = getMousePos(context.canvas, event);
        const node = getNode(simulation, context.canvas, x, y);

        // Update mouse cursor and hovered node
        if (node) {
          context.canvas.style.cursor = 'pointer';
          hoveredNode.current = node;
          renderCanvas();
        } else if (hoveredNode.current) {
          context.canvas.style.cursor = 'default';
          hoveredNode.current = null;
          renderCanvas();
        }
      })
      .on('click', (event) => {
        const { x, y } = getMousePos(context.canvas, event);
        const clickedNode = getNode(simulation, context.canvas, x, y);

        // Redirect to note when a node is clicked
        if (clickedNode) {
          router.push(`/app/note/${clickedNode.id}`);
        }
      });
  }, [data, renderCanvas, router]);

  /**
   * Set canvas width and height when its container changes size
   */
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const containerRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      // Initialize resize observer
      if (!resizeObserverRef.current) {
        resizeObserverRef.current = new ResizeObserver((entries) => {
          if (!canvasRef.current) {
            return;
          }
          for (const entry of entries) {
            // Update canvas dimensions and re-render
            const cr = entry.contentRect;
            const scale = window.devicePixelRatio;
            canvasRef.current.width = Math.floor(cr.width * scale);
            canvasRef.current.height = Math.floor(cr.height * scale);
            renderCanvas();
          }
        });
      }

      if (containerRef.current) {
        // Unobserve and reset containerRef if it already exists
        resizeObserverRef.current?.unobserve(containerRef.current);
        containerRef.current = null;
      }

      if (node) {
        // Observe the new node and set containerRef
        resizeObserverRef.current?.observe(node);
        containerRef.current = node;

        // Set initial canvas width and height
        if (canvasRef.current) {
          const scale = window.devicePixelRatio;
          canvasRef.current.width = Math.floor(node.offsetWidth * scale);
          canvasRef.current.height = Math.floor(node.offsetHeight * scale);
        }
      }
    },
    [renderCanvas]
  );

  useEffect(() => {
    // Make sure that the resize observer is cleaned up when component is unmounted
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRefCallback}
      className={`relative select-none ${className}`}
    >
      <canvas
        data-testid="graph-canvas"
        ref={canvasRef}
        className="absolute w-full h-full dark:bg-gray-800"
      />
    </div>
  );
}

const isNodeDatum = (
  datum: string | number | NodeDatum
): datum is NodeDatum => {
  return typeof datum !== 'string' && typeof datum !== 'number';
};

const getMousePos = (canvas: HTMLCanvasElement, event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const getNode = (
  simulation: Simulation<NodeDatum, LinkDatum>,
  canvas: HTMLCanvasElement,
  canvasX: number,
  canvasY: number
) => {
  const transform = zoomTransform(canvas);
  const x = transform.invertX(canvasX);
  const y = transform.invertY(canvasY);
  const subject = simulation.find(x, y);
  if (
    subject &&
    subject.x &&
    subject.y &&
    Math.hypot(x - subject.x, y - subject.y) <= subject.radius
  ) {
    return subject;
  } else {
    return undefined;
  }
};

const getDrag = (
  simulation: Simulation<NodeDatum, LinkDatum>,
  canvas: HTMLCanvasElement,
  hoveredNode: MutableRefObject<NodeDatum | null>
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

    hoveredNode.current = subject; // Show hover state
  }

  function dragged(event: DragEvent) {
    const transform = zoomTransform(canvas);
    event.subject.fx =
      initialDragPos.x + (event.x - initialDragPos.x) / transform.k;
    event.subject.fy =
      initialDragPos.y + (event.y - initialDragPos.y) / transform.k;
  }

  function dragended(event: DragEvent) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;

    hoveredNode.current = null; // Show hover state
  }

  return drag<HTMLCanvasElement, NodeDatum, NodeDatum | undefined>()
    .subject(dragsubject)
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
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
