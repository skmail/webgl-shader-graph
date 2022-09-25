import create from "zustand";
import {
  Edge,
  EdgeChange,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
} from "react-flow-renderer";
import { Uniform, Node, NodeDefinition } from "./types";

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodeDataChange(id: string, data: Node["data"]): void;
  onNodesChange: OnNodesChange;

  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  onUniformUpdate(uniform: Uniform): void;
  onUniformAdd(uniform: Pick<Uniform, "type" | "value" | "id">): void;

  uniforms: Uniform[];
  onNodeAdd(node: Node): void;

  setAddNodeMenu(data: { position: [number, number]; active: boolean }): void;
  addNodeMenu: { position: [number, number]; active: boolean };

  maxId: number;

  validateNodeEdges(nodeId: string, definitions: NodeDefinition): void;

  init(data: { nodes: Node[]; edges: Edge[]; uniforms: Uniform[] }): void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
  maxId: 15,
  addNodeMenu: {
    position: [0, 0],
    active: false,
  },

  setAddNodeMenu: (menu) =>
    set({
      addNodeMenu: menu,
    }),
  nodes: [],
  edges: [],
  uniforms: [],
  onNodeDataChange: (id, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          } as Node;
        }
        return node;
      }),
    });
  },

  onUniformUpdate: (uniform: RFState["uniforms"][0]) => {
    set({
      uniforms: get().uniforms.map((u) => {
        if (u.name === uniform.name) {
          return {
            ...u,
            ...uniform,
          };
        }
        return u;
      }),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
        },
        get().edges
      ),
    });
  },
  onUniformAdd: (uniform) => {
    const uniforms = get().uniforms;
    const maxId = get().maxId + 1;
    set({
      uniforms: [
        ...uniforms,
        {
          ...uniform,
          name: `${uniform.type}_${maxId}`,
        },
      ],
      maxId: maxId,
    });
  },

  onNodeAdd: (node) => {
    const maxId = get().maxId + 1;
    set({
      nodes: applyNodeChanges(
        [
          {
            item: {
              ...node,
              id: `${maxId}`,
            },
            type: "add",
          },
        ],
        get().nodes
      ) as Node[],
      maxId,
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node[],
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    console.log(changes);
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  validateNodeEdges: (nodeId, definitions) => {
    set({
      edges: get().edges.filter((edge) => {
        if (edge.target === nodeId) {
          if (!definitions.inputs || !definitions.inputs.length) {
            return false;
          }

          return definitions.inputs.find(
            (input) => input.name === edge.targetHandle
          );
        }

        if (edge.source === nodeId) {
          if (!definitions.outputs || !definitions.outputs.length) {
            return false;
          }

          return definitions.outputs.find(
            (output) => output.name === edge.sourceHandle
          );
        }
        return true;
      }),
    });
  },
  init(data) {
    let maxId = 0;
    for (let node of data.nodes) {
      maxId = Math.max(maxId, parseInt(node.id));
    }
    for (let uniform of data.uniforms) {
      maxId = Math.max(maxId, parseInt(uniform.id));
    }
    set({
      ...data,
      maxId,
    });
  },
}));

export { useStore };
