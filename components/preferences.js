import "babel-polyfill";
import { fetch } from "fm-webviewer-fetch";
export default function () {
  // init preferences
  //If none exist, create default.

  getFMPreferences();
  return { semicolonLeading: false, useVars: false };

  // const preferences =
  //   window.localStorage.preferences === undefined
  //     ? defaultPrefs
  //     : JSON.parse(window.localStorage.preferences);

  // window.localStorage.preferences = JSON.stringify(preferences);
  // return preferences;
}

export function toggleSemicolon(e) {
  const checked = e.target.checked;
  window.preferences.semicolonLeading = checked;
  window.localStorage.preferences = JSON.stringify(window.preferences);
  //ToDo: update filemaker preference
  FileMaker.PerformScript("SetPreferences", JSON.stringify(window.preferences));
}

export function toggleVars(e) {
  const checked = e.target.checked;
  window.preferences.useVars = checked;
  window.localStorage.preferences = JSON.stringify(window.preferences);
  //ToDo: update filemaker preference
  FileMaker.PerformScript("SetPreferences", JSON.stringify(window.preferences));
}

function getFMPreferences() {
  // FileMaker.PerformScript("GetRequest");
  // console.log("getFMPreferences", fetch);
  window.preferences = { semicolonLeading: false, useVars: false };

  FileMaker.PerformScript("GetRequest");
  console.log(window.preferences);
  // window.localStorage.preferences = JSON.stringify(prefs);
  // return prefs
}

window.receiver = receiver;
async function receiver(e) {
  const param = JSON.parse(e);
  window.preferences = param;
  //update preferences
  const semicolonSwitch = document.getElementById("customSwitch1");
  semicolonSwitch.checked = param.semicolonLeading;

  const varsSwitch = document.getElementById("vars");
  varsSwitch.checked = param.useVars;
}
