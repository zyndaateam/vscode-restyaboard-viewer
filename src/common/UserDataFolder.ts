export class UserDataFolder {
  public getPathHome(): string {
    let path: string;
    if (process.platform === "win32") {
      // windows
      path = process.env.APPDATA || "";
      return path;
    } else if (process.platform === "darwin" || process.platform === "linux") {
      // Mac or Linux
      path = process.env.HOME || "";
      return path;
    } else {
      console.error("Error: Platform not detected; only windows, mac and linux supported");
      return "";
    }
  }

  public getPathCodeSettings(): string {
    const homePath: string = this.getPathHome();
    let codeSettingsPath: string = homePath;

    if (process.platform === "win32") {
      if (process.execPath.match(/insiders/gi)) {
        codeSettingsPath += "\\Code - Insiders\\User\\";
      } else {
        codeSettingsPath += "\\Code\\User\\";
      }
      return codeSettingsPath;
    } else if (process.platform === "darwin" || process.platform === "linux") {
      if (process.platform === "darwin") {
        codeSettingsPath += "/Library/Application Support";
      } else if (process.platform === "linux") {
        codeSettingsPath += "/.config";
      }
      if (process.execPath.match(/insiders/gi)) {
        codeSettingsPath += "/Code - Insiders/User/";
      } else {
        codeSettingsPath += "/Code/User/";
      }
      return codeSettingsPath;
    } else {
      console.error("Error: Platform not detected; only windows, mac and linux supported.");
      return "";
    }
  }
}

// *** settings.json paths from https://code.visualstudio.com/docs/getstarted/settings ***
// Windows %APPDATA%\Code\User\settings.json
// macOS $HOME/Library/Application Support/Code/User/settings.json
// Linux $HOME/.config/Code/User/settings.json
