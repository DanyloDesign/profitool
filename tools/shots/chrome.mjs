// Path to the local Chrome for puppeteer-core. CHROME_PATH overrides it; otherwise the usual
// install location for this OS is used.
const DEFAULTS = {
  win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  linux: "/usr/bin/google-chrome",
};

export const chromePath = process.env.CHROME_PATH ?? DEFAULTS[process.platform] ?? DEFAULTS.linux;
