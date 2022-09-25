import { Edge, Node as RendererNode } from "react-flow-renderer";

interface BaseNodeData {
  type: string;
  name: string;
  value?: any;
}

export interface FunctionNodeData extends BaseNodeData {
  definitions: NodeDefinition;
  code: string;
  type: "function";
}

export type NodeData = BaseNodeData | FunctionNodeData | UniformNodeData;

export interface BaseNode<T = BaseNodeData> extends RendererNode<T> {}

export interface UniformNodeData extends BaseNodeData {
  uniformId: string;
}

export interface UniformNode extends BaseNode<UniformNodeData> {
  type: "uniform";
}

export interface DefaultNode extends BaseNode {
  type: "node";
}

export interface FunctionNode extends BaseNode<FunctionNodeData> {
  type: "function";
}

export interface PreviewNode extends BaseNode {
  type: "preview";
}

export type Node = DefaultNode | PreviewNode | UniformNode | FunctionNode;

export interface NodeHandle {
  type: string;
  name: string;
}
export interface NodeDefinition {
  inputs?: NodeHandle[];
  outputs?: NodeHandle[];
  blocks?: {
    type: string;
  }[];
}
export interface Stack {
  imports: string[];
  definitions: Map<
    string,
    {
      type: "uniform" | "assign" | "varying";
      name: string;
      value?: string;
      dataType: string;
    }
  >;

  result: {
    vertex: string;
    fragment: string;
  };
  errors: Error[];
}

export interface RunState {
  nodes: Node[];
  edges: Edge[];
  uniforms: Uniform[];
}

export interface Uniform {
  name: string;
  type: string;
  value: any;
  id: string;
}

export interface Instruction {
  type: "uniform" | "assign" | "reassign" | "varying" | "import";
  name: string;
  value?: string;
  dataType: string;
}

export interface RunnerState {
  nodes: Node[];
  edges: Edge[];
  uniforms: Uniform[];
}

export interface Declaration {
  type: Instruction["type"];
  dataType: string;
  name: string;
}

export interface IRunner {
  result: {
    vertex: string;
    fragment: string;
  };

  instructions: Instruction[];

  getDeclaration(nodeId: string): Declaration;
  addInstruction(nodeId: string, instruction: Instruction): void;
  run(nodeId: string): IRunner;

  getNode(nodeId: string): RunnerState["nodes"][0];
  getEdge(edgeId: string): RunnerState["edges"][0];
  getUniform(uniformId: string): RunnerState["uniforms"][0];

  getInputNodes(nodeId: string): RunnerState["nodes"];
  getInputEdges(nodeId: string): RunnerState["edges"];

  hasErrors(): boolean;

  addError(error: Error): void;

  getNodeDataType(nodeId: string): string;

  getNodeVariableName(nodeId: string): string;
}

export type NodeRunner = NodeDefinition & {
  toStack(node: Node, runner: IRunner): void;
  getUniformValue?(node: Node, uniform: any, state: any): any;
};
