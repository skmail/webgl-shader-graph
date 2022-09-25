import shallow from "zustand/shallow";
import { usePopper } from "react-popper";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useStore } from "../store";
import { Node } from "../types";

const listOfTypes: {
  type: string;
  nodeType?: Node["type"];
}[] = [
  {
    type: "multiply",
  },
  {
    type: "add",
  },
  {
    type: "preview",
  },
  {
    type: "vec3",
  },
  {
    type: "fromVec3",
  },
  {
    type: "vec2",
  },
  {
    type: "uv",
  },
  {
    type: "function",
    nodeType: "function",
  },
];

export function AddNodeDropdownInternal() {
  const [popperElement, setPopperElement] = useState<HTMLDivElement>();

  const position = useStore((state) => state.addNodeMenu.position, shallow);

  const virtualElement = useMemo(
    () => ({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: position[1],
        bottom: position[1],
        left: position[0],
        right: position[0],
      }),
    }),
    [position]
  );
  // @ts-ignore
  const { styles, attributes } = usePopper(virtualElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [-10, 15],
        },
      },
    ],
  });

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  }, []);

  return (
    <Menu>
      {({ open }) => {
        return (
          <>
            <Menu.Button className={"hidden"} ref={buttonRef}>
              More
            </Menu.Button>

            <div
              ref={(ref) => ref && setPopperElement(ref)}
              style={{
                ...styles.popper,
                zIndex: 999,
              }}
              {...attributes.popper}
            >
              <Transition
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                afterLeave={() => {
                  useStore.getState().setAddNodeMenu({
                    active: false,
                    position: [0, 0],
                  });
                }}
              >
                <Menu.Items className="w-56 z-50  origin-top-right text-gray-300 bg-gray-900 border border-gray-700   rounded-md shadow-lg outline-none">
                  <div className="py-1">
                    {listOfTypes.map((type) => (
                      <Menu.Item key={type.type}>
                        <button
                          onClick={() => {
                            useStore.getState().onNodeAdd({
                              id: String(useStore.getState().maxId),
                              type: type.nodeType || "node",
                              data: {
                                name: `${type.type}_${String(
                                  useStore.getState().maxId
                                )}`,
                                type: type.type,
                              },
                              position: {
                                x: position[0],
                                y: position[1],
                              },
                            } as Node);
                          }}
                          className="text-gray-300 cursor-pointer font-medium hover:bg-gray-800   w-full px-4 py-2 text-sm leading-5 text-left"
                        >
                          {type.type}
                        </button>
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </div>
          </>
        );
      }}
    </Menu>
  );
}

export function AddNodeDropdown() {
  const isActive = useStore((state) => state.addNodeMenu.active);
  if (!isActive) {
    return null;
  }
  return <AddNodeDropdownInternal />;
}
