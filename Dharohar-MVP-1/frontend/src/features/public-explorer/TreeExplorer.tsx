import { useRef, useState, Component } from 'react';
import type { ErrorInfo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { mockCommunities } from '../../data/mockData';
import './TreeExplorer.css';

interface NodeData {
    id: string;
    community: string;
    description: string;
    position: [number, number, number];
    angle: number;
    radius: number;
    height: number;
}

const TreeNode = ({ node, onClick }: { node: NodeData, onClick: (id: string) => void }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    // Orbit animation
    useFrame((state) => {
        if (meshRef.current) {
            // Slow orbit around the center (0, node.height, 0)
            const time = state.clock.getElapsedTime();
            const speed = 0.2; // slow rotation
            const newX = Math.cos(node.angle + time * speed) * node.radius;
            const newZ = Math.sin(node.angle + time * speed) * node.radius;
            meshRef.current.position.set(newX, node.height, newZ);

            // Hover pulse
            if (hovered) {
                const scale = 1 + Math.sin(time * 4) * 0.1;
                meshRef.current.scale.set(scale, scale, scale);
            } else {
                meshRef.current.scale.set(1, 1, 1);
            }
        }
    });

    return (
        <mesh
            ref={meshRef}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'default'; }}
            onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
        >
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
                color={hovered ? '#B08D57' : '#2E5E4E'}
                roughness={0.7}
            />

            {/* Tooltip visible only on hover */}
            {hovered && (
                <Html distanceFactor={15}>
                    <div className="tooltip">
                        {node.community}
                    </div>
                </Html>
            )}
        </mesh>
    );
};

const TreeScene = ({ onNodeClick }: { onNodeClick?: (id: string) => void }) => {
    const navigate = useNavigate();

    // Generate 8 organic nodes around the trunk
    const nodes: NodeData[] = Array.from({ length: 8 }).map((_, i) => {
        const isMockData = i < mockCommunities.length;
        const community = isMockData ? mockCommunities[i] : null;

        return {
            id: community?.id || `placeholder-${i}`,
            community: community?.name || `Community Archive ${i + 1}`,
            description: community?.description || 'Archival node.',
            position: [0, 0, 0], // Starting point, actual set in useFrame
            angle: (i / 8) * Math.PI * 2,
            radius: 2 + Math.random() * 1.5,
            height: 1 + Math.random() * 4,
        };
    });

    const handleNodeClick = (id: string) => {
        if (onNodeClick) {
            onNodeClick(id);
        } else if (!id.startsWith('placeholder')) {
            navigate(`/community/${id}`);
        }
    };

    return (
        <div className="tree-container">
            <Canvas camera={{ position: [0, 5, 14], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#F4EDE4" />

                <mesh position={[0, 2, 0]}>
                    <cylinderGeometry args={[0.4, 0.7, 7, 16]} />
                    <meshStandardMaterial color="#6E3B2E" roughness={0.9} />
                </mesh>

                <mesh position={[1, 3, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <cylinderGeometry args={[0.1, 0.2, 3, 8]} />
                    <meshStandardMaterial color="#6E3B2E" roughness={0.9} />
                </mesh>

                <mesh position={[-1, 4, 1]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                    <cylinderGeometry args={[0.1, 0.2, 2.5, 8]} />
                    <meshStandardMaterial color="#6E3B2E" roughness={0.9} />
                </mesh>

                {nodes.map(node => (
                    <TreeNode key={node.id} node={node} onClick={handleNodeClick} />
                ))}

                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    autoRotate
                    autoRotateSpeed={0.5}
                    enableZoom={false}
                />
            </Canvas>
        </div>
    );
};

class ExplorerErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("WebGL Explorer Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="framed-section fallback-explorer">
                    <h2>Public Knowledge Archives</h2>
                    <p>The interactive 3D explorer is unavailable. Please scroll down to view the accessible archives.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export const TreeExplorer = ({ onNodeClick }: { onNodeClick?: (id: string) => void }) => (
    <ExplorerErrorBoundary>
        <TreeScene onNodeClick={onNodeClick} />
    </ExplorerErrorBoundary>
);
