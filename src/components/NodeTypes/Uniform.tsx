import { NodeProps } from "react-flow-renderer";
import { useStore } from "../../store";
import { UniformNodeData } from "../../types";
import { Body } from "./Node/Body";

export function Uniform({ data, ...rest }: NodeProps<UniformNodeData>) {
  const uniform = useStore((state) =>
    state.uniforms.find((uniform) => uniform.id === data.uniformId)
  );

  if (!uniform) {
    return null;
  }

  return (
    <div className="bg-gray-800 text-xs  rounded-lg hover:ring hover:ring-gray-700  w-32 ">
      <div className="text-gray-400 p-0.5 justify-between  rounded-t-lg px-2 bg-gray-700 w-full">
        {data.name}
      </div>
      <Body
        data={{
          ...data,
          type: uniform.type,
        }}
        {...rest}
        allowInputs={false}
      />
    </div>
  );
}
