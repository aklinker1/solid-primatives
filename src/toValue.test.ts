import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { toValue } from "./toValue.ts";

describe("toValue", () => {
  it("should return values as-is", () => {
    expect(toValue("abc")).toBe("abc");
  });

  it("should call functions and return their value", () => {
    expect(toValue(() => "abc")).toBe("abc");
  });
});
