import gsap from "gsap";

export default function createApp(injectedDocument: Document) {
  const elem = injectedDocument.getElementsByClassName(
    "text-block nav_button_desktop",
  )[0];

  gsap.fromTo(
    elem,
    {
      opacity: 1,
    },
    {
      opacity: 0,
      duration: 1,
    },
  );

  if (elem) {
    elem.textContent = "hello";
  }
}
