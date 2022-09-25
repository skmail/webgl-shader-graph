import { describe, it, expect, assert } from "vitest";
import { Runner } from "../runner";
import runners from "../nodes/index";

describe("runner", () => {
  it("no errors at first", () => {
    const runner = new Runner(
      {
        edges: [],
        nodes: [],
        uniforms: [],
      },
      runners
    );

    expect(runner.getNode("1")).toBe(undefined);
    expect(runner.getEdge("1")).toBe(undefined);
    expect(runner.getUniform("1")).toBe(undefined);
  });

  it("get a node, edge, uniform", () => {
    const runner = new Runner(
      {
        edges: [
          {
            id: "1",
            source: "1",
            target: "2",
          },
        ],
        nodes: [
          {
            id: "1",
            type: "node",
            position: { x: 0, y: 0 },
            data: { name: "hello", type: "anything" },
          },
        ],
        uniforms: [
          {
            name: "float",
            type: "float",
            value: 1,
            id: "1",
          },
        ],
      },
      runners
    );

    expect(runner.getNode("1").id).toBe("1");
    expect(runner.getEdge("1").target).toBe("2");
    expect(runner.getUniform("1").type).toBe("float");
  });

  it("get connected nodes", () => {
    const runner = new Runner(
      {
        edges: [
          {
            id: "1",
            source: "1",
            target: "2",
          },
        ],
        nodes: [
          {
            id: "1",
            type: "node",
            position: { x: 0, y: 0 },
            data: { name: "Variable 1", type: "anything" },
          },
          {
            id: "2",
            type: "node",
            position: { x: 0, y: 0 },
            data: { name: "hello", type: "anything" },
          },
        ],
        uniforms: [
          {
            name: "float",
            type: "float",
            value: 1,
            id: "1",
          },
        ],
      },
      runners
    );

    expect(runner.getInputNodes("2")?.length).toEqual(1);
    expect(runner.getInputNodes("2")[0].data.name).toBe("Variable 1");
  });
});
