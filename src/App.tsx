import ReactFlow, { ReactFlowProvider } from "react-flow-renderer";
import "react-flow-renderer/dist/style.css";
import "react-flow-renderer/dist/theme-default.css";
import { Node as NodeComponent } from "./components/NodeTypes/Node";
import { useStore } from "./store";
import { Uniforms } from "./components/NodeTypes/Uniforms";
import { Uniform } from "./components/NodeTypes/Uniform";
import { AddNodeDropdown } from "./components/AddNodeDropdown";
import { Edge } from "./components/Edge";
import veronoi from "./samples/veronoi.json";
import { useEffect } from "react";
import { RunnerState } from "./types";

const nodeTypes = {
  node: NodeComponent,
  function: NodeComponent,
  uniform: Uniform,
};

const edgeTypes = {
  smoothstep: Edge,
};
function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();

  useEffect(() => {
    useStore.getState().init(veronoi as RunnerState);
  }, []);
  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen bg-gray-900">
        <ReactFlow
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            useStore.getState().setAddNodeMenu({
              active: true,
              position: [e.clientX, e.clientY],
            });
          }}
        ></ReactFlow>
      </div>

      <Uniforms />
      <AddNodeDropdown />
    </ReactFlowProvider>
  );
}

export default Flow;
