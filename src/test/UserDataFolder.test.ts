import * as assert from "assert";
import * as UserDataFolder from "../common/UserDataFolder";

suite("UserDataFolder: get path to VS Code settings.json", () => {
  const userDataFolder = new UserDataFolder.UserDataFolder();
  let originalHome: string;
  let originalAppData: string;

  suiteSetup(() => {
    originalHome = process.env.HOME || "";
    originalAppData = process.env.APPDATA || "";
  });

  suiteTeardown(() => {
    SetHome(originalHome);
    SetAppData(originalAppData);
  });

  test("Mac path should be: $HOME/Library/Application Support/Code/User/settings.json", () => {
    SetPlatform("darwin");
    SetHome("/Users/user");
    assert.equal(userDataFolder.getPathCodeSettings(), "/Users/user/Library/Application Support/Code/User/");
  });

  test("Windows path should be: %APPDATA%\\Code\\User\\settings.json", () => {
    SetPlatform("win32");
    //windows uses the App Data path not the home
    SetAppData("C:\\Users\\User\\AppData\\Roaming");
    SetHome("");
    assert.equal(userDataFolder.getPathCodeSettings(), "C:\\Users\\User\\AppData\\Roaming\\Code\\User\\");
  });

  test("Linux path should be: $HOME/.config/Code/User/settings.json", () => {
    SetPlatform("linux");
    SetHome("/var/local");
    assert.equal(userDataFolder.getPathCodeSettings(), "/var/local/.config/Code/User/");
  });
});

function SetHome(home: string) {
  Object.defineProperty(process.env, "HOME", {
    value: home,
  });
}

function SetAppData(location: string) {
  Object.defineProperty(process.env, "APPDATA", {
    value: location,
  });
}

function SetPlatform(platform: string) {
  Object.defineProperty(process, "platform", {
    value: platform,
  });
}
