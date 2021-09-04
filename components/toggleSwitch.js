export function onChange(e) {
  const checked = e.target.checked;
  window.preferences.semicolonLeading = checked;
  console.log(checked);
}
