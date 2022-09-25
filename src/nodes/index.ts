import {
  DefaultNode,
  FunctionNodeData,
  IRunner,
  Node,
  NodeHandle,
  NodeRunner,
  UniformNode,
} from "../types";

import * as THREE from "three";
import { extractFunctions } from "../utils/glsl-parser";

const toPrecision = (number: number) => {
  const str = String(number);
  if (str.indexOf(".") === -1) {
    return `${str}.`;
  }
  return str;
};

const binaryOperation = (node: Node, runner: IRunner, operator: string) => {
  const inputEdges = runner.getInputEdges(node.id);

  if (inputEdges.length !== 2) {
    runner.addError(new Error("not enough inputs for multiply"));
    return;
  }

  runner.addInstruction(node.id, {
    type: node.type === "uniform" ? "uniform" : "assign",
    dataType: runner.getNodeDataType(inputEdges[0].source),
    name: node.data.name,
    value: `${runner.getNodeVariableName(
      inputEdges[0].source
    )} ${operator}  ${runner.getNodeVariableName(inputEdges[1].source)}`,
  });
};

const nodes: Record<string, NodeRunner> = {
  float: {
    ...extractFunctions("float output(float input);")[0],
    toStack(node, runner) {
      runner.addInstruction(node.id, {
        type: node.type === "uniform" ? "uniform" : "assign",
        dataType: "float",
        name: node.data.name,
        value: toPrecision(node.data.value) || "1.",
      });
    },
  },
  multiply: {
    ...extractFunctions("float output(float a, float b);")[0],
    toStack(node, runner) {
      binaryOperation(node, runner, "*");
    },
  },
  add: {
    ...extractFunctions("float output(float a, float b);")[0],
    toStack(node, runner) {
      binaryOperation(node, runner, "+");
    },
  },
  vec3: {
    ...extractFunctions("vec3 output(float x, float y, float z);")[0],
    toStack(node, runner) {
      const edges = runner.getInputEdges(node.id).reduce(
        (acc: Record<string, typeof edge>, edge) => ({
          [edge.targetHandle as string]: edge,
          ...acc,
        }),
        {}
      );

      let vec3: string[] = ["1.", "1.", "1."];

      if (edges.x) {
        vec3[0] = runner.getNodeVariableName(edges.x.source) || vec3[0];
      }

      if (edges.y) {
        vec3[1] = runner.getNodeVariableName(edges.y.source) || vec3[1];
      }

      if (edges.z) {
        vec3[3] = runner.getNodeVariableName(edges.z.source) || vec3[3];
      }

      runner.addInstruction(node.id, {
        type: node.type === "uniform" ? "uniform" : "assign",
        dataType: "vec3",
        name: node.data.name,
        value: `vec3(${vec3.join(", ")})`,
      });
    },
  },
  vec2: {
    ...extractFunctions("vec2 output(float x, float y);")[0],
    toStack(node, runner) {
      const edges = runner.getInputEdges(node.id).reduce(
        (acc: Record<string, typeof edge>, edge) => ({
          [edge.targetHandle as string]: edge,
          ...acc,
        }),
        {}
      );
      let vec2: string[] = ["1.", "1."];

      if (edges.x) {
        vec2[0] = runner.getNodeVariableName(edges.x.source) || vec2[0];
      }

      if (edges.y) {
        vec2[1] = runner.getNodeVariableName(edges.y.source) || vec2[1];
      }

      runner.addInstruction(node.id, {
        type: node.type === "uniform" ? "uniform" : "assign",
        dataType: "vec2",
        name: node.data.name,
        value: `vec2(${vec2.join(", ")})`,
      });
    },
  },
  preview: {
    ...extractFunctions("void output(vec3 color, float alpha);")[0],
    blocks: [
      {
        type: "preview",
      },
    ],

    toStack(node, runner) {
      runner.result.vertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
      `;

      const edges = runner.getInputEdges(node.id);

      if (!edges.length) {
        return;
      }

      let imports: string[] = [];
      let definitions: string[] = [];

      runner.instructions.forEach((instruction) => {
        switch (instruction.type) {
          case "assign":
            definitions.push(
              `${instruction.dataType} ${instruction.name} = ${instruction.value};`
            );
            break;

          case "import":
            imports.push(`${instruction.value}`);
            break;

          default:
            imports.push(
              `${instruction.type} ${instruction.dataType} ${instruction.name};`
            );
            break;
        }
      });

      const last = runner.getDeclaration(edges[0].source);

      let color = "";

      if (last.dataType === "float") {
        color = `vec3(${last.name})`;
      } else if (last.dataType === "vec2") {
        color = `vec3(${last.name}, 1)`;
      } else if (last.dataType === "vec3") {
        color = last.name;
      }

      const alpha = runner.getNodeVariableName(edges[1]?.source) || "1.";

      runner.result.fragment = `
        ${imports.join("\n")}
        void main() {
          ${definitions.join("\n")}
          gl_FragColor = vec4(${color}, ${alpha});        
        }
      `;
    },
  },
  time: {
    outputs: [
      {
        type: "float",
        name: "elapsed",
      },
    ],

    toStack(node, runner) {
      runner.addInstruction(node.id, {
        type: "uniform",
        dataType: "float",
        name: node.data.name,
      });
    },

    getUniformValue(node, uniform, state) {
      return state.clock.getElapsedTime();
    },
  },

  color: {
    outputs: [
      {
        type: "vec3",
        name: "color ",
      },
    ],

    toStack(node: Node, runner) {
      runner.addInstruction(node.id, {
        type: "uniform",
        dataType: "vec3",
        name: node.data.name,
      });
    },
    getUniformValue(node, uniform) {
      return new THREE.Color(uniform.value);
    },
  },

  uniform: {
    toStack(node, runner) {
      const uniform = runner.getUniform((node as UniformNode).data.uniformId);

      if (!uniform) {
        return;
      }
      nodes[uniform.type].toStack(
        {
          ...(node as DefaultNode),
          data: {
            name: node.data.name,
            type: uniform.type,
            value: uniform.value,
          },
        },
        runner
      );
    },
  },
  function: {
    blocks: [
      {
        type: "function",
      },
    ],

    toStack(node, runner) {
      const edges = runner.getInputEdges(node.id).reduce(
        (acc: Record<string, typeof edge>, edge) => ({
          [edge.targetHandle as string]: edge,
          ...acc,
        }),
        {}
      );

      const data = node.data as FunctionNodeData;

      let inputs: string[] = [];

      if (data.definitions.inputs) {
        inputs = data.definitions.inputs.reduce((acc: string[], node) => {
          const name = runner.getNodeVariableName(edges[node.name]?.source);

          if (!name) {
            return acc;
          }

          acc.push(name);

          return acc;
        }, []);
      }

      const outputs = data.definitions.outputs;

      if (!outputs?.length) {
        return;
      }
      const output = outputs[0];

      const fn = output.name;

      runner.addInstruction(node.id, {
        type: "import",
        dataType: output.type,
        name: data.name,
        value: data.code,
      });

      runner.addInstruction(node.id, {
        type: "assign",
        dataType: output.type,
        name: data.name,
        value: `${fn}(${inputs.join(", ")})`,
      });
    },
  },
  uv: {
    inputs: [],
    outputs: [
      {
        type: "vec2",
        name: "vec2",
      },
    ],
    toStack(node, runner) {
      runner.addInstruction(node.id, {
        type: "varying",
        dataType: "vec2",
        name: "vUv",
      });
    },
  },
};

export default nodes;
