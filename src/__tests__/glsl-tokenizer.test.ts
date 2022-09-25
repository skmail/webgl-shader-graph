import { describe, it, expect } from "vitest";
import { extractFunctions } from "../utils/glsl-parser";

describe("glsl tokenizer", () => {
  it("it tokenize multiple functions", () => {
    const results = extractFunctions(`
    vec3 color(vec2 uv, float time)   // define a function  
    {
    // function code goes here  
    }    
    void calculate(vec3 abc)   // define a function 
    {}    
    `);

    expect(results).toEqual([
      {
        inputs: [
          {
            type: "vec2",
            name: "uv",
          },
          {
            type: "float",
            name: "time",
          },
        ],
        outputs: [
          {
            type: "vec3",
            name: "color",
          },
        ],
      },
      {
        inputs: [
          {
            type: "vec3",
            name: "abc",
          },
        ],
        outputs: [],
      },
    ]);
  });

  it("it tokenize function", () => {
    const results = extractFunctions(`vec3 circle(vec3 abc, float x){}`);
    expect(results).toEqual([
      {
        inputs: [
          {
            type: "vec3",
            name: "abc",
          },
          {
            type: "float",
            name: "x",
          },
        ],
        outputs: [
          {
            type: "vec3",
            name: "circle",
          },
        ],
      },
    ]);
  });

  it("it tokenize function 2", () => {
    const results = extractFunctions(`
    float circle(vec2 abc, vec3 x);  // declare a function
    void circle(float radius);  // declare a function

    void circle()   // define a function
    {
    // function code goes here
    }

    void circle(float radius)   // define a function
    {
    // function code goes here
    }
    `);
    expect(results).toEqual([
      {
        inputs: [
          {
            type: "vec2",
            name: "abc",
          },
          {
            type: "vec3",
            name: "x",
          },
        ],
        outputs: [
          {
            type: "float",
            name: "circle",
          },
        ],
      },

      {
        inputs: [
          {
            type: "float",
            name: "radius",
          },
        ],
        outputs: [],
      },
      
      {
        inputs: [],
        outputs: [],
      },

      {
        inputs: [
          {
            type: "float",
            name: "radius",
          },
        ],
        outputs: [],
      },
    ]);
  });
});
