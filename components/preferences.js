export default function () {
  // init preferences
  //If none exist, create default.
  const defaultPrefs = { semicolonLeading: false };

  const preferences =
    window.localStorage.preferences === undefined
      ? defaultPrefs
      : JSON.parse(window.localStorage.preferences);

  window.localStorage.preferences = JSON.stringify(preferences);
  return preferences;
}

export function toggleSemicolon(e) {
  const checked = e.target.checked;
  window.preferences.semicolonLeading = checked;
  window.localStorage.preferences = JSON.stringify(window.preferences);
  console.log(checked);
}
