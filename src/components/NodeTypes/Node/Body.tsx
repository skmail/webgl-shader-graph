import { NodeProps } from "react-flow-renderer";
import { Preview } from "./Blocks/Preview";
import types from "../../../nodes";
import { FunctionBlock } from "./Blocks/FunctionBlock";
import { Sockets } from "./Sockets";
import { NodeData } from "../../../types";
import { FC } from "react";

const blockTypes: Record<string, FC<NodeProps<any>>> = {
  function: FunctionBlock,
  preview: Preview,
};

interface Props extends NodeProps<NodeData> {
  allowInputs?: boolean;
}

export function Body({ data, allowInputs = true, ...rest }: Props) {
  const type = types[data.type];

  return (
    <>
      <Sockets
        inputs={type.inputs}
        outputs={type.outputs}
        allowInputs={allowInputs}
      />
      {!!type.blocks && (
        <div className="flex-1 flex flex-col  items-end space-y-1">
          {!!type.blocks &&
            type.blocks.map((block) => {
              const Block = blockTypes[block.type];
              return <Block key={block.type} data={data} {...rest} />;
            })}
        </div>
      )}
    </>
  );
}
