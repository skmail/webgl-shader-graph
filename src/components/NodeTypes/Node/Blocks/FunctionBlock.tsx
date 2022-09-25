import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

import {
  ChangeEvent,
  Fragment,
  useReducer,
  useState,
  PropsWithChildren,
  useEffect,
} from "react";
import { NodeProps } from "react-flow-renderer";
import { useStore } from "../../../../store";
import { FunctionNodeData, NodeData, NodeDefinition } from "../../../../types";
import { extractFunctions } from "../../../../utils/glsl-parser";
import { Sockets } from "../Sockets";
interface State {
  selectedDefinitionIndex: number;
  code: string;
  definitions: Array<NodeDefinition & { id: string }>;
  errors: Record<string, string>;
  hasErrors: boolean;
}
type Action =
  | {
      type: "UPDATE_CODE";
      code: State["code"];
    }
  | {
      type: "UPDATE_DEFINITIONS";
      definitions: State["definitions"];
    }
  | {
      type: "UPDATE_ERRORS";
      errors: State["errors"];
    }
  | {
      type: "SELECT_DEFINITION";
      index: State["selectedDefinitionIndex"];
    }
  | {
      type: "INIT";
      definitions: State["definitions"];
      code: State["code"];
      selectedDefinitionIndex: number;
    };
const initialState: State = {
  selectedDefinitionIndex: -1,
  code: "",
  definitions: [],
  errors: {},
  hasErrors: false,
};

function ValidationError({ children }: PropsWithChildren) {
  return <span className="text-red-400 text-sm">{children}</span>;
}
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "UPDATE_CODE":
      return {
        ...state,
        code: action.code,
        definitions: [],
      };
    case "UPDATE_DEFINITIONS":
      return {
        ...state,
        definitions: action.definitions,
        selectedDefinitionIndex:
          action.definitions.length === 1
            ? 0
            : action.definitions[state.selectedDefinitionIndex]
            ? state.selectedDefinitionIndex
            : -1,
      };

    case "UPDATE_ERRORS":
      return {
        ...state,
        errors: action.errors,
        hasErrors: Object.keys(action.errors).length > 0,
      };
    case "SELECT_DEFINITION":
      return {
        ...state,
        selectedDefinitionIndex: action.index,
      };
    case "INIT":
      return {
        ...state,
        definitions: action.definitions,
        code: action.code,
        selectedDefinitionIndex: action.selectedDefinitionIndex,
      };
  }
};

export function FunctionBlock({ id, data }: NodeProps<FunctionNodeData>) {
  let [isOpen, setIsOpen] = useState(false);

  const [state, dispatch] = useReducer(reducer, initialState);

  const onNodeDataChange = useStore((state) => state.onNodeDataChange);
  const validateNodeEdges = useStore((state) => state.validateNodeEdges);

  function closeModal() {
    setIsOpen(false);
  }

  function saveAndClose() {
    if (state.hasErrors) {
      return;
    }
    setIsOpen(false);

    const { id: _id, ...definitions } =
      state.definitions[state.selectedDefinitionIndex];
    onNodeDataChange(id, {
      definitions,
      code: state.code,
    } as FunctionNodeData);

    validateNodeEdges(id, state.definitions[state.selectedDefinitionIndex]);
  }

  function openModal() {
    setIsOpen(true);
  }

  function onCodeChange(e: ChangeEvent<HTMLTextAreaElement>) {
    dispatch({
      type: "UPDATE_CODE",
      code: e.target.value,
    });
    try {
      const definitions = extractFunctions(e.target.value);

      dispatch({
        type: "UPDATE_DEFINITIONS",
        definitions: definitions.map((definition) => ({
          ...definition,
          id: JSON.stringify(definition),
        })),
      });
      dispatch({
        type: "UPDATE_ERRORS",
        errors: {},
      });
    } catch (error) {
      dispatch({
        type: "UPDATE_ERRORS",
        errors: {
          code: "Invalid syntax",
        },
      });
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (data.definitions) {
        const code = data.code || "";
        let definitions: NodeDefinition[] = extractFunctions(code);

        dispatch({
          type: "INIT",
          definitions: definitions.map((definition) => ({
            ...definition,
            id: JSON.stringify(definition),
          })),
          code,
          selectedDefinitionIndex: definitions.findIndex(
            (definition) =>
              // hashing :/
              JSON.stringify(definition) === JSON.stringify(data.definitions)
          ),
        });
      }
    } else {
    }
  }, [isOpen]);
  return (
    <>
      <Sockets {...data.definitions} />
      <div className="p-1">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md w-full bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Edit Function
        </button>

        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-300"
                    >
                      Function Edit
                    </Dialog.Title>
                    <div className="mt-2">
                      <label className="text-gray-400 text-sm mb-1 block">
                        Shader code
                      </label>
                      <textarea
                        value={state.code}
                        rows={10}
                        onChange={onCodeChange}
                        className="p-2 rounded px-4 bg-gray-800 w-full text-gray-200 focus:outline-none focus:ring  hover:bg-opacity-70 focus:bg-opacity-70"
                      />
                      {!!state.errors.code && (
                        <ValidationError>{state.errors.code}</ValidationError>
                      )}
                    </div>

                    {state.definitions.length > 0 && (
                      <div className="text-sm mt-2">
                        <label className="text-gray-400 text-sm mb-1 block">
                          Select the shader entry function
                        </label>

                        <div className="space-y-2">
                          {state.definitions.map((definition, index) => (
                            <button
                              key={definition.id}
                              className={`
                              w-full text-start rounded-md bg-gray-700 bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
                              flex items-center
                              ${
                                index === state.selectedDefinitionIndex
                                  ? "ring"
                                  : ""
                              }
                              
                              `}
                              onClick={() =>
                                dispatch({
                                  type: "SELECT_DEFINITION",
                                  index,
                                })
                              }
                            >
                              {index === state.selectedDefinitionIndex && (
                                <CheckCircleIcon className="w-6 h-6 text-blue-500 mr-2" />
                              )}
                              {!!definition.outputs &&
                                definition.outputs.map((output) => (
                                  <span key={output.name}>
                                    <span className="text-gray-400">
                                      {output.type}
                                    </span>
                                    <span className="text-purple-400">
                                      {" "}
                                      {output.name}
                                    </span>
                                  </span>
                                ))}
                              <span className="text-gray-400">{"("}</span>
                              {!!definition.inputs &&
                                definition.inputs.map(
                                  (input, index, inputs) => (
                                    <span key={input.name}>
                                      <span className="text-green-400">
                                        {input.type}
                                      </span>
                                      <span className="text-gray-400">
                                        {" "}
                                        {input.name}
                                      </span>
                                      {index < inputs.length - 1 && (
                                        <span className="text-gray-400 mr-1">
                                          ,
                                        </span>
                                      )}
                                    </span>
                                  )
                                )}
                              <span className="text-gray-400">{")"}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {state.definitions.length > 0 && (
                      <div className="text-white text-sm font-light mt-4">
                        <h4 className="flex items-center text-base text-orange-300 font-medium">
                          <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                          Write a valid code
                        </h4>
                        <span className="m-1 block">
                          Shader code validity is your own responsibility, we
                          don't check for syntax errors inside the function
                          body.
                        </span>
                      </div>
                    )}
                    <div className="mt-4 space-x-2">
                      <button
                        disabled={
                          state.hasErrors ||
                          state.selectedDefinitionIndex === -1
                        }
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-10"
                        onClick={saveAndClose}
                      >
                        Save {"&"} close
                      </button>

                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100  bg-opacity-5 hover:bg-opacity-10 text-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
}
