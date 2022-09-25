import { useState } from "react";
import { NodeProps } from "react-flow-renderer";
import { NodeData } from "../../../types";
import { Body } from "./Body";

export function Node({ data, ...rest }: NodeProps<NodeData>) {
  const [isEditing, setIsEditing] = useState(false);
 
  return (
    <div className="bg-gray-800 text-xs  rounded-lg hover:ring hover:ring-gray-700  w-32 ">
      <div className="text-gray-400 p-0.5 justify-between  rounded-t-lg px-2 bg-gray-700 w-full">
        {!isEditing && (
          <span onClick={() => setIsEditing(true)}>{data.name}</span>
        )}

        {isEditing && (
          <input
            autoFocus
            className="bg-transparent focus:outline-none ring -m-1 w-full rounded ring-gray-600 px-1"
            onBlur={() => {
              setIsEditing(false);
            }} 
            value={data.name}
          />
        )}
      </div>

      <Body data={data} {...rest} />
    </div>
  );
}
