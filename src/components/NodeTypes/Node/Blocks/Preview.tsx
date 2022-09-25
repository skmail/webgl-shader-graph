import { useRun } from "../../../../hooks/useRun";
import { Canvas } from "@react-three/fiber";
import { NodeProps } from "react-flow-renderer";
import { NodeData } from "../../../../types";

function CanvasContent(props: NodeProps) {
  const { fragmentShader, vertexShader, uniforms } = useRun(props);

  if (!fragmentShader) {
    return null;
  }

 
  return (
    <mesh key={fragmentShader}>
      <boxGeometry args={[6, 6, 2]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

export function Preview(props: NodeProps<NodeData>) {
  return (
    <div className="w-32 h-32 rounded-b-lg bg-white  flex items-center justify-center text-xl">
      <Canvas>
        <CanvasContent {...props} />
      </Canvas>
    </div>
  );
}
