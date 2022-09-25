import { NodeDefinition } from "../../../types";
import { Handle, Position } from "react-flow-renderer";

interface Props {
  inputs?: NodeDefinition["inputs"];
  outputs?: NodeDefinition["outputs"];
  allowInputs?: boolean;
}
export function Sockets({ inputs, outputs, allowInputs = true }: Props) {
  return (
    <div className="relative w-full  block   flex     flex-1">
      {(!!inputs || !!outputs) && (
        <div className="flex-1 bg-gray-900 bg-opacity-20 p-1 space-y-1">
          {allowInputs &&
            !!inputs &&
            inputs.map((input) => (
              <div
                className="flex text-gray-500 items-center  text-xs"
                key={input.name}
              >
                <Handle
                  type="target"
                  position={Position.Right}
                  className="border-[0.5px] border-green-500 bg-gray-900 w-2 h-2 static transform translate-y-0"
                  id={input.name} 
                  isConnectable
                ></Handle>
                <span className="ml-1 -mt-[2px]">{input.name}</span>
              </div>
            ))}
        </div>
      )}
      {(!!inputs || !!outputs) && (
        <div className="flex-1 flex flex-col p-1 items-end space-y-1">
          {!!outputs &&
            outputs.map((output) => (
              <div
                className="flex text-gray-500 items-center  text-xs"
                key={output.name}
              >
                <span className="mr-1 -mt-[2px]">{output.name}</span>
                <Handle
                isConnectable
                  type="source"
                  position={Position.Right}
                  className="border-[0.5px] border-green-500 bg-gray-900 w-2 h-2 static transform translate-y-0"
                  id={output.name}
                ></Handle>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
