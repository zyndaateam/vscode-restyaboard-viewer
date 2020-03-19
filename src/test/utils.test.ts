import * as assert from "assert";
import { prependToLabel } from "../common/utils";

suite("RestyaboardUtils", () => {
  const label = "test_label";

  test("should return label if prefix undefined", () => {
    const resultLabel = prependToLabel(label, undefined);
    assert.equal(resultLabel, "test_label");
  });

  test("should prepend text to label", () => {
    const prefix = '12';
    const resultLabel = prependToLabel(label, prefix);
    assert.equal(resultLabel, "12-test_label");
  });
});
