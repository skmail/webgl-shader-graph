import { PlusIcon } from "@heroicons/react/24/solid";
import shallow from "zustand/shallow";
import { useStore } from "../../store";
import { Leva, useControls } from "leva";
import { Uniform as UniformType, UniformNode } from "../../types";
import { Menu, Transition } from "@headlessui/react";
import { usePopper } from "react-popper";
import { useEffect, useRef, useState } from "react";

interface Props {
  uniform: UniformType;
}

const listOfTypes = [
  {
    type: "float",
    value: 0,
  },
  {
    type: "vec2",
    value: [0, 0],
  },
  {
    type: "vec3",
    value: [0, 0, 0],
  },
  {
    type: "color",
    value: "#000000",
  },
  {
    type: "time",
    value: 0,
  },
];

const Label = ({ uniform }: { uniform: UniformType }) => {
  const onNodeAdd = useStore((state) => state.onNodeAdd, shallow);

  return (
    <div className="flex space-x-1">
      <button
        onClick={() => {
          onNodeAdd({
            id: String(useStore.getState().nodes.length),
            type: "uniform",
            data: {
              name: uniform.name,
              value: uniform.value,
              uniformId: uniform.id,
              type: uniform.type,
            },
            position: { x: 100, y: 100 },
          } as UniformNode);
        }}
        className="hover:bg-gray-800 rounded"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
      <span>{uniform.name}</span>
    </div>
  );
};
function Uniform({ uniform }: Props) {
  const onUniformUpdate = useStore((state) => state.onUniformUpdate);

  const [{}, set] = useControls(() => ({
    [uniform.name]: {
      label: <Label uniform={uniform} />,
      value: uniform.value,
      onChange: (value) => {
        onUniformUpdate({
          ...uniform,
          value,
        });
      },
    },
  }));

  return null;
}

export function Uniforms() {
  const [forceUpdateKey, setForceUpdateKey] = useState("");

  const uniforms = useStore((state) => state.uniforms, shallow);
  const onUniformAdd = useStore((state) => state.onUniformAdd, shallow);
  const popperElRef = useRef(null);
  const [targetElement, setTargetElement] = useState<HTMLDivElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: "bottom",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  useEffect(() => {
    // for some unkown reasons, leva is not re-rendering correctly when new control assigned.
    // this the timer for force remount leva until i figure it out.
    const timer = setTimeout(() => {
      setForceUpdateKey(String(Math.random()));
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [uniforms.length]);
  return (
    <>
      <Leva
        key={`${forceUpdateKey}`}
        neverHide
        titleBar={{
          title: (
            <Menu>
              {({ open }) => (
                <>
                  <div
                    ref={(ref) => ref && setTargetElement(ref)}
                    className="rounded-md shadow-sm"
                  >
                    <Menu.Button className="flex items-center">
                      <span className="font-medium mr-2">Uniforms</span>
                      <PlusIcon className="w-4 h-4" />
                    </Menu.Button>
                  </div>

                  <div
                    ref={popperElRef}
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
                      beforeEnter={() => setPopperElement(popperElRef.current)}
                      afterLeave={() => setPopperElement(null)}
                    >
                      <Menu.Items
                        static
                        className="w-56 z-50  origin-top-right text-gray-300 bg-gray-900 border border-gray-700   rounded-md shadow-lg outline-none"
                      >
                        <div className="py-1">
                          {listOfTypes.map((type) => (
                            <Menu.Item key={type.type}>
                              <button
                                onClick={() =>
                                  onUniformAdd({
                                    ...type,
                                    id: String(
                                      useStore.getState().uniforms.length
                                    ),
                                  })
                                }
                                className="text-gray-300 cursor-pointer font-medium hover:bg-gray-800   w-full px-4 py-2 text-sm leading-5 text-left"
                              >
                                {type.type}
                                <span className="text-gray-500 ml-1 font-normal">
                                  (
                                  {Array.isArray(type.value)
                                    ? type.value.join(", ")
                                    : type.value}
                                  )
                                </span>
                              </button>
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </div>
                </>
              )}
            </Menu>
          ),
        }}
      />

      {uniforms.map((uniform) => (
        <Uniform key={uniform.name} uniform={uniform} />
      ))}
    </>
  );
}
