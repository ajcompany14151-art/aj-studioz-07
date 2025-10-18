'use client'

import React, { Suspense, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Text, 
  Box, 
  Sphere, 
  Cylinder, 
  Cone,
  Environment,
  Grid,
  Html,
  useHelper
} from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { 
  RotateCcw, 
  Download, 
  Settings, 
  Play, 
  Pause,
  ZoomIn,
  ZoomOut,
  Home
} from 'lucide-react'

interface Object3DData {
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'text'
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  color?: string
  text?: string
  size?: number | [number, number, number]
}

interface Scene3DData {
  objects: Object3DData[]
  camera?: {
    position: [number, number, number]
    target: [number, number, number]
  }
  lighting?: 'ambient' | 'directional' | 'point' | 'spotlight'
  environment?: string
  animation?: boolean
}

interface ThreeDVisualizationProps {
  data: Scene3DData
  title: string
  onUpdate?: (data: Scene3DData) => void
}

// Animated 3D Object Component
function AnimatedObject({ object, animationSpeed }: { object: Object3DData; animationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    
    // Rotate objects slowly for animation
    meshRef.current.rotation.x += animationSpeed * 0.01
    meshRef.current.rotation.y += animationSpeed * 0.01
  })

  const renderObject = () => {
    const props = {
      ref: meshRef,
      position: object.position,
      rotation: object.rotation || [0, 0, 0],
      scale: object.scale || 1,
    }

    switch (object.type) {
      case 'box':
        return (
          <Box {...props} args={Array.isArray(object.size) ? object.size : [1, 1, 1]}>
            <meshStandardMaterial color={object.color || '#6366f1'} />
          </Box>
        )
      case 'sphere':
        return (
          <Sphere {...props} args={[object.size as number || 0.5, 32, 32]}>
            <meshStandardMaterial color={object.color || '#8b5cf6'} />
          </Sphere>
        )
      case 'cylinder':
        return (
          <Cylinder {...props} args={[0.5, 0.5, object.size as number || 1, 32]}>
            <meshStandardMaterial color={object.color || '#10b981'} />
          </Cylinder>
        )
      case 'cone':
        return (
          <Cone {...props} args={[0.5, object.size as number || 1, 32]}>
            <meshStandardMaterial color={object.color || '#f59e0b'} />
          </Cone>
        )
      case 'text':
        return (
          <Text
            {...props}
            fontSize={0.5}
            color={object.color || '#ffffff'}
            anchorX="center"
            anchorY="middle"
          >
            {object.text || 'Sample Text'}
          </Text>
        )
      default:
        return null
    }
  }

  return renderObject()
}

// Scene Component
function Scene({ data, animationSpeed, showGrid }: { 
  data: Scene3DData; 
  animationSpeed: number; 
  showGrid: boolean;
}) {
  const { camera } = useThree()

  // Set camera position if specified
  React.useEffect(() => {
    if (data.camera) {
      camera.position.set(...data.camera.position)
      camera.lookAt(...data.camera.target)
    }
  }, [data.camera, camera])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[10, 10, 10]} />

      {/* Environment */}
      {data.environment && (
        <Environment preset={data.environment as any} />
      )}

      {/* Grid */}
      {showGrid && (
        <Grid 
          infiniteGrid 
          cellSize={1} 
          cellThickness={0.5} 
          sectionSize={10} 
          sectionThickness={1}
          fadeDistance={30}
          fadeStrength={1}
        />
      )}

      {/* Objects */}
      {data.objects.map((object, index) => (
        <AnimatedObject 
          key={index} 
          object={object} 
          animationSpeed={data.animation ? animationSpeed : 0}
        />
      ))}

      {/* Controls */}
      <OrbitControls enablePan enableZoom enableRotate />
    </>
  )
}

// Loading Component
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-white">Loading 3D Scene...</span>
      </div>
    </Html>
  )
}

export default function ThreeDVisualization({ 
  data, 
  title, 
  onUpdate 
}: ThreeDVisualizationProps) {
  const [isAnimating, setIsAnimating] = useState(data.animation || false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showControls, setShowControls] = useState(false)

  const handleReset = useCallback(() => {
    // Reset camera and animation
    setIsAnimating(data.animation || false)
    setAnimationSpeed(1)
  }, [data.animation])

  const handleExport = useCallback(() => {
    // Export as PNG (screenshot)
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `${title.replace(/\s+/g, '_')}_3d_scene.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }, [title])

  const toggleAnimation = useCallback(() => {
    setIsAnimating(!isAnimating)
    if (onUpdate) {
      onUpdate({ ...data, animation: !isAnimating })
    }
  }, [isAnimating, data, onUpdate])

  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden border border-gray-800">
      {/* Controls Header */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
        <h3 className="text-white font-semibold bg-black/50 px-3 py-1 rounded-md">
          {title}
        </h3>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowControls(!showControls)}
            className="bg-black/50 hover:bg-black/70"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary" 
            onClick={toggleAnimation}
            className="bg-black/50 hover:bg-black/70"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={handleReset}
            className="bg-black/50 hover:bg-black/70"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            className="bg-black/50 hover:bg-black/70"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: data.camera?.position || [5, 5, 5], 
          fov: 75 
        }}
        style={{ height: '100%', width: '100%' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene 
            data={data} 
            animationSpeed={isAnimating ? animationSpeed : 0} 
            showGrid={showGrid}
          />
        </Suspense>
      </Canvas>

      {/* Advanced Controls Panel */}
      {showControls && (
        <Card className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm border-gray-700">
          <Tabs defaultValue="animation" className="p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="animation">Animation</TabsTrigger>
              <TabsTrigger value="scene">Scene</TabsTrigger>
              <TabsTrigger value="objects">Objects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="animation" className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Animation Speed: {animationSpeed}x
                </label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="scene" className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm text-gray-300">Show Grid</label>
              </div>
            </TabsContent>
            
            <TabsContent value="objects">
              <div className="text-sm text-gray-300">
                Objects: {data.objects.length}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {/* Instructions */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
        Mouse: Rotate • Wheel: Zoom • Right-click: Pan
      </div>
    </div>
  )
}

// Example usage component
export function Example3DScene() {
  const sampleData: Scene3DData = {
    objects: [
      {
        type: 'box',
        position: [0, 0, 0],
        color: '#6366f1',
        size: [2, 1, 1]
      },
      {
        type: 'sphere',
        position: [3, 1, 0],
        color: '#8b5cf6',
        size: 0.8
      },
      {
        type: 'cylinder',
        position: [-3, 0, 0],
        color: '#10b981',
        size: 1.5
      },
      {
        type: 'text',
        position: [0, 3, 0],
        color: '#ffffff',
        text: '3D Visualization'
      }
    ],
    camera: {
      position: [8, 6, 8],
      target: [0, 0, 0]
    },
    animation: true,
    environment: 'city'
  }

  return (
    <ThreeDVisualization 
      data={sampleData} 
      title="Sample 3D Scene"
    />
  )
}