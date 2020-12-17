import Plugin from "./cjs";

test("should set options property", () => {
  const opts = {
    test: "hello",
  };
  const plugin = new Plugin(opts);
  expect(plugin.options).toBe(opts);
});
