import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import types from "../nodes";
import { NodeProps } from "react-flow-renderer";
import { useFrame } from "@react-three/fiber";
import shallow from "zustand/shallow";
import { Runner } from "../runner";

export function useRun(props: NodeProps) {
  const { edges, nodes, uniformsState } = useStore(
    ({ edges, nodes, uniforms }) => ({
      edges,
      nodes,
      uniformsState: uniforms,
    }),
    shallow
  );

  const [vertexShader, setVertexShader] = useState("");
  const [fragmentShader, setFragmentShader] = useState("");

  const node = useMemo(
    () => nodes.find((node) => node.id === props.id),
    [props]
  );

  useEffect(() => {
    if (!node) {
      return;
    }

    const runner = new Runner(
      {
        nodes,
        edges,
        uniforms: useStore.getState().uniforms,
      },
      types
    );

    runner.run(node.id);

    if (runner.hasErrors()) {
      setFragmentShader("");
      setVertexShader("");
    } else {
      setFragmentShader(runner.result.fragment);
      setVertexShader(runner.result.vertex);
    }
  }, [edges, nodes]);

  const uniforms = useRef<Record<any, any>>({});

  useFrame((state, delta) => {
    if (!node) {
      return;
    }
    for (let uniform of uniformsState) {
      let value;
      const uniformType = types[uniform.type];
      if (uniformType?.getUniformValue) {
        value = uniformType.getUniformValue(node, uniform, state);
      } else {
        value = uniform.value;
      }

      if (!uniforms.current[uniform.name]) {
        uniforms.current[uniform.name] = {
          value,
        };
      } else {
        uniforms.current[uniform.name].value = value;
      }
    }
  });

  return { fragmentShader, vertexShader, uniforms };
}
