import { EdgeProps, SmoothStepEdge } from "react-flow-renderer";

export function Edge(props: EdgeProps) {
  return (
    <SmoothStepEdge
      {...props}
      animated={true}
      style={{
        strokeWidth: 3,
        stroke: props.selected ? "#fde047" : "#64748b",
      }}
    />
  );
}
