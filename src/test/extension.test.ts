import * as vscode from "vscode";
import * as assert from "assert";

suite("Restyaboard Viewer extension", () => {
  test("Activates correctly", async () => {
    const ext = vscode.extensions.getExtension("Ho-Wan.vscode-restyaboard-viewer");
    if (!ext) {
      assert.fail("Could not get extension");
      return;
    }
    await ext.activate();
    assert.ok(ext.isActive);
  });
});
