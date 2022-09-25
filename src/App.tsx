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
import { useEffect, useRef } from "react";
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
  const { nodes, edges, uniforms, onNodesChange, onEdgesChange, onConnect } =
    useStore();
    console.log(JSON.stringify(nodes))
    console.log(JSON.stringify(edges))
    console.log(JSON.stringify(uniforms))
  useEffect(() => {
    const sample = window.localStorage.getItem("sample");
    if (sample) {
      useStore.getState().init(JSON.parse(sample) as RunnerState);
    } else {
      useStore.getState().init(veronoi as RunnerState);
    }
  }, []);

  const isStartCount = useRef(0);
  useEffect(() => {
    isStartCount.current++;

    // lol
    if (isStartCount.current < 5) {
      return;
    }

    window.localStorage.setItem(
      "sample",
      JSON.stringify({ nodes, edges, uniforms })
    );
  }, [nodes, edges, uniforms]);

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
