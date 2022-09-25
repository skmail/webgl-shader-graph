import { Edge } from "react-flow-renderer";
import {
  Instruction,
  IRunner,
  NodeRunner,
  RunnerState,
  Uniform,
  Node,
  Declaration,
} from "../types";

export class Runner implements IRunner {
  result = {
    vertex: "",
    fragment: "",
  };

  state: RunnerState;
  runners: Record<string, NodeRunner>;

  instructions: Instruction[] = [];

  private declarations: Map<string, Declaration> = new Map();

  private nodes: Map<string, RunnerState["nodes"]["0"]>;
  private edges: Map<string, RunnerState["edges"][0]>;
  private uniforms: Map<string, RunnerState["uniforms"][0]>;

  private inputEdges: Map<string, string[]>;

  private errors: Error[] = [];

  constructor(state: RunnerState, runners: Record<string, NodeRunner>) {
    this.state = state;
    this.runners = runners;

    this.nodes = this.toMap(state.nodes);
    this.edges = this.toMap(state.edges);
    this.uniforms = this.toMap(state.uniforms);

    this.inputEdges = this.buildInputEdges();
  }

  getNode(nodeId: string) {
    return this.nodes.get(nodeId) as Node;
  }

  getEdge(edgeId: string) {
    return this.edges.get(edgeId) as Edge;
  }

  getUniform(uniformId: string): Uniform {
    return this.uniforms.get(uniformId) as Uniform;
  }

  addInstruction(nodeId: string, instruction: Instruction) {
    let type = instruction.type;

    if (
      ["varying", "uniform", "import"].includes(instruction.type) &&
      this.declarations.get(nodeId)
    ) {
      return;
    }
    const declared = this.declarations.get(nodeId);

    if (declared && declared.type === "assign") {
      type = "reassign";
    }

    this.declarations.set(nodeId, {
      dataType: instruction.dataType,
      name: instruction.name,
      type,
    });

    this.instructions.push({
      ...instruction,
      type,
    });
  }

  run(nodeId: string) {
    const node = this.getNode(nodeId);

    const inputNodes = this.getInputNodes(nodeId);

    for (let n of inputNodes) {
      this.run(n.id);
    }

    const type = node?.data.type || node.type;

    this.runners[type].toStack(node, this);

    return this;
  }

  private toMap<T extends { id: string }>(array: T[]) {
    const map = new Map<string, T>();
    for (let item of array) {
      map.set(item.id, item);
    }

    return map;
  }

  private buildInputEdges() {
    const map = new Map<string, string[]>();
    for (let edge of this.state.edges) {
      let ids = map.get(edge.target);
      if (!ids) {
        ids = [];
        map.set(edge.target, ids);
      }
      ids.push(edge.id);
    }

    return map;
  }

  getInputNodes(nodeId: string) {
    const edges = this.inputEdges.get(nodeId) || [];

    return edges.map((id) =>
      this.nodes.get(this.edges.get(id)?.source as string)
    ) as RunnerState["nodes"];
  }

  getInputEdges(nodeId: string) {
    const edges = this.inputEdges.get(nodeId) || [];
    return edges.map((id) => this.edges.get(id)) as RunnerState["edges"];
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  addError(error: Error) {
    this.errors.push(error);
  }

  getNodeDataType(nodeId: string) {
    return this.declarations.get(nodeId)?.dataType as string;
  }

  getNodeVariableName(nodeId: string) {
    return this.declarations.get(nodeId)?.name as string;
  }

  getDeclaration(nodeId: string) {
    return this.declarations.get(nodeId) as Declaration;
  }
}
