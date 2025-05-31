export default function createApp(injectedDocument: Document) {
  const elem = injectedDocument.getElementsByClassName(
    "text-block nav_button_desktop",
  )[0];

  if (elem) {
    elem.textContent = "asdfasdfasdf";
  }
}
