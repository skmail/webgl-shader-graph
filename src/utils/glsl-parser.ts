import { parser } from "@shaderfrog/glsl-parser";
import { AstNode } from "@shaderfrog/glsl-parser/dist/ast";
import { NodeDefinition } from "../types";

/// @todo, glsl-parser library size is insanely huge, consider replace it layer, or apply code-spliting.

const SUPPORTED_OUTPUTS = ["void", "float", "vec2", "vec3"];

function _extractFunction(node: AstNode, results: NodeDefinition[]) {
  const returnType = node.header.returnType.specifier.specifier.token;

  if (!SUPPORTED_OUTPUTS.includes(returnType)) {
    return;
  }

  results.push({
    outputs:
      returnType === "void"
        ? []
        : [
            {
              type: returnType,
              name: node.header.name.identifier,
            },
          ],
    inputs:node.parameters ? node.parameters.map((parameter: any) => ({
      type: parameter.declaration.specifier.specifier.token,
      name: parameter.declaration.identifier.identifier,
    })): [],
  });
}

export function extractFunctions(code: string) {
  const parsed = parser.parse(code);
  const results: NodeDefinition[] = [];

  for (let node of parsed.program) {
    switch (node.type) {
      case "function":
        _extractFunction(node.prototype, results);
        break;

      case "declaration_statement":
        _extractFunction(node.declaration, results);
        break;
    }
  }

  return results;
}
