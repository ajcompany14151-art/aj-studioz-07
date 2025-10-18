'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import mermaid from 'mermaid'
import * as d3 from 'd3'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  Edit, 
  Eye, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react'

// Mermaid diagram types
type MermaidDiagramType = 
  | 'flowchart' 
  | 'sequence' 
  | 'class' 
  | 'state' 
  | 'er' 
  | 'journey' 
  | 'gantt' 
  | 'pie' 
  | 'gitgraph'

// D3.js chart types
type D3ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'scatter' 
  | 'histogram' 
  | 'network' 
  | 'treemap' 
  | 'heatmap'

interface DiagramData {
  type: 'mermaid' | 'd3'
  diagramType: MermaidDiagramType | D3ChartType
  content: string
  data?: any[]
  options?: any
}

interface InteractiveDiagramsProps {
  data: DiagramData
  title: string
  onUpdate?: (data: DiagramData) => void
}

// Mermaid Diagram Component
function MermaidDiagram({ content, diagramType }: { content: string; diagramType: MermaidDiagramType }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Configure Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#4f46e5',
        lineColor: '#6b7280',
        sectionBkgColor: '#1f2937',
        altSectionBkgColor: '#374151',
        gridColor: '#4b5563',
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#10b981'
      },
      flowchart: {
        curve: 'basis',
        padding: 20
      },
      sequence: {
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      }
    })

    const renderDiagram = async () => {
      try {
        setError(null)
        containerRef.current!.innerHTML = ''
        
        const { svg } = await mermaid.render('mermaid-diagram', content)
        containerRef.current!.innerHTML = svg
        
        // Add click handlers for interactive elements
        const svgElement = containerRef.current!.querySelector('svg')
        if (svgElement) {
          svgElement.style.width = '100%'
          svgElement.style.height = 'auto'
          svgElement.style.maxHeight = '500px'
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        console.error('Mermaid render error:', err)
      }
    }

    renderDiagram()
  }, [content, diagramType])

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <p className="text-red-400 text-sm">Diagram Error: {error}</p>
        <pre className="mt-2 text-xs text-gray-400 bg-black/30 p-2 rounded overflow-x-auto">
          {content}
        </pre>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full min-h-[200px] flex items-center justify-center bg-gray-900/50 rounded-lg p-4"
    />
  )
}

// D3.js Chart Component
function D3Chart({ data, chartType, options }: { data: any[]; chartType: D3ChartType; options: any }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  useEffect(() => {
    if (!svgRef.current || !data?.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 40 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Render different chart types
    switch (chartType) {
      case 'bar':
        renderBarChart(g, data, width, height, options)
        break
      case 'line':
        renderLineChart(g, data, width, height, options)
        break
      case 'pie':
        renderPieChart(g, data, width, height, options)
        break
      case 'scatter':
        renderScatterPlot(g, data, width, height, options)
        break
      case 'network':
        renderNetworkGraph(g, data, width, height, options)
        break
      default:
        renderBarChart(g, data, width, height, options)
    }
  }, [data, chartType, dimensions, options])

  // Chart rendering functions
  const renderBarChart = (g: any, data: any[], width: number, height: number, options: any) => {
    const x = d3.scaleBand()
      .domain(data.map(d => d.label || d.name || d.x))
      .range([0, width])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value || d.y) || 0])
      .nice()
      .range([height, 0])

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => x(d.label || d.name || d.x))
      .attr('width', x.bandwidth())
      .attr('y', (d: any) => y(d.value || d.y))
      .attr('height', (d: any) => height - y(d.value || d.y))
      .attr('fill', '#6366f1')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#8b5cf6')
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill', '#6366f1')
      })

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#9ca3af')

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#9ca3af')
  }

  const renderLineChart = (g: any, data: any[], width: number, height: number, options: any) => {
    const x = d3.scaleLinear()
      .domain(d3.extent(data, (d, i) => d.x || i) as [number, number])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y || d.value) as [number, number])
      .range([height, 0])

    const line = d3.line<any>()
      .x(d => x(d.x || data.indexOf(d)))
      .y(d => y(d.y || d.value))
      .curve(d3.curveMonotoneX)

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 2)
      .attr('d', line)

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: any, i: number) => x(d.x || i))
      .attr('cy', (d: any) => y(d.y || d.value))
      .attr('r', 4)
      .attr('fill', '#8b5cf6')

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#9ca3af')

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#9ca3af')
  }

  const renderPieChart = (g: any, data: any[], width: number, height: number, options: any) => {
    const radius = Math.min(width, height) / 2
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const pie = d3.pie<any>()
      .value(d => d.value || d.y)

    const arc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius)

    g.attr('transform', `translate(${width / 2}, ${height / 2})`)

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc')

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any, i: number) => color(i.toString()))
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8)
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1)
      })

    arcs.append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .text((d: any) => d.data.label || d.data.name)
  }

  const renderScatterPlot = (g: any, data: any[], width: number, height: number, options: any) => {
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x) as [number, number])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y) as [number, number])
      .range([height, 0])

    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: any) => x(d.x))
      .attr('cy', (d: any) => y(d.y))
      .attr('r', d => d.size || 5)
      .attr('fill', '#6366f1')
      .attr('opacity', 0.7)

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#9ca3af')

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#9ca3af')
  }

  const renderNetworkGraph = (g: any, data: any, width: number, height: number, options: any) => {
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#6b7280')
      .attr('stroke-opacity', 0.6)

    const node = g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', 8)
      .attr('fill', '#6366f1')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    node.append('title')
      .text((d: any) => d.id)

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
    })

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
  }

  return (
    <div className="w-full bg-gray-900/50 rounded-lg p-4">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-auto"
      />
    </div>
  )
}

export default function InteractiveDiagrams({ 
  data, 
  title, 
  onUpdate 
}: InteractiveDiagramsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(data.content)
  const [selectedType, setSelectedType] = useState(data.diagramType)

  const handleSave = useCallback(() => {
    if (onUpdate) {
      onUpdate({
        ...data,
        content: editContent,
        diagramType: selectedType
      })
    }
    setIsEditing(false)
  }, [data, editContent, selectedType, onUpdate])

  const handleExport = useCallback(() => {
    const element = data.type === 'mermaid' 
      ? document.querySelector('#mermaid-diagram svg')
      : document.querySelector('svg')
      
    if (element) {
      const svgData = new XMLSerializer().serializeToString(element as Element)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const link = document.createElement('a')
        link.download = `${title.replace(/\s+/g, '_')}_diagram.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }, [data.type, title])

  const getSampleContent = (type: string): string => {
    const samples = {
      flowchart: `graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`,
      sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
      class: `classDiagram
    class Animal {
        +int age
        +String gender
        +isMammal()
        +mate()
    }
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    Animal <|-- Duck`,
      pie: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`
    }
    return samples[type as keyof typeof samples] || samples.flowchart
  }

  const getSampleData = (chartType: string) => {
    const samples = {
      bar: [
        { label: 'Jan', value: 30 },
        { label: 'Feb', value: 80 },
        { label: 'Mar', value: 45 },
        { label: 'Apr', value: 60 },
        { label: 'May', value: 20 }
      ],
      line: [
        { x: 0, y: 30 },
        { x: 1, y: 80 },
        { x: 2, y: 45 },
        { x: 3, y: 60 },
        { x: 4, y: 20 }
      ],
      pie: [
        { label: 'Category A', value: 30 },
        { label: 'Category B', value: 70 },
        { label: 'Category C', value: 45 }
      ],
      scatter: [
        { x: 10, y: 20, size: 5 },
        { x: 40, y: 90, size: 8 },
        { x: 80, y: 50, size: 6 },
        { x: 60, y: 70, size: 7 }
      ],
      network: {
        nodes: [
          { id: 'A' },
          { id: 'B' },
          { id: 'C' },
          { id: 'D' }
        ],
        links: [
          { source: 'A', target: 'B' },
          { source: 'B', target: 'C' },
          { source: 'C', target: 'D' },
          { source: 'D', target: 'A' }
        ]
      }
    }
    return samples[chartType as keyof typeof samples] || samples.bar
  }

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Mode */}
      {isEditing ? (
        <Card className="p-4 bg-gray-900/50 border-gray-700 mb-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Diagram Type</label>
                <Select value={data.type} onValueChange={(value) => {
                  // Handle type change logic here
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mermaid">Mermaid</SelectItem>
                    <SelectItem value="d3">D3.js Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  {data.type === 'mermaid' ? 'Mermaid Type' : 'Chart Type'}
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.type === 'mermaid' ? (
                      <>
                        <SelectItem value="flowchart">Flowchart</SelectItem>
                        <SelectItem value="sequence">Sequence</SelectItem>
                        <SelectItem value="class">Class Diagram</SelectItem>
                        <SelectItem value="state">State Diagram</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="scatter">Scatter Plot</SelectItem>
                        <SelectItem value="network">Network Graph</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {data.type === 'mermaid' ? 'Mermaid Code' : 'JSON Data'}
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-32 bg-gray-800 text-white p-3 rounded-md font-mono text-sm"
                placeholder={data.type === 'mermaid' 
                  ? getSampleContent(selectedType)
                  : JSON.stringify(getSampleData(selectedType), null, 2)
                }
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Diagram Display */}
      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
        {data.type === 'mermaid' ? (
          <MermaidDiagram 
            content={data.content} 
            diagramType={data.diagramType as MermaidDiagramType}
          />
        ) : (
          <D3Chart 
            data={data.data || getSampleData(data.diagramType)}
            chartType={data.diagramType as D3ChartType}
            options={data.options || {}}
          />
        )}
      </div>
    </div>
  )
}

// Example usage
export function ExampleDiagrams() {
  const mermaidData: DiagramData = {
    type: 'mermaid',
    diagramType: 'flowchart',
    content: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`
  }

  const d3Data: DiagramData = {
    type: 'd3',
    diagramType: 'bar',
    content: '',
    data: [
      { label: 'Q1', value: 120 },
      { label: 'Q2', value: 200 },
      { label: 'Q3', value: 150 },
      { label: 'Q4', value: 180 }
    ]
  }

  return (
    <div className="space-y-6">
      <InteractiveDiagrams 
        data={mermaidData} 
        title="Mermaid Flowchart"
      />
      <InteractiveDiagrams 
        data={d3Data} 
        title="D3.js Bar Chart"
      />
    </div>
  )
}