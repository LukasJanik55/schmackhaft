import "../src/components/views/sh-settings";
import { Settings } from "../src/components/views/sh-settings";
import { Links } from "../src/components/core/links";
import { Link } from "../src/components/model/link";
import exampleData from "../docs/examples/external-file.json";


let settingsElementV1 = document.getElementById("SettingsV1") as Settings;
let settingsElementV2 = document.getElementById("SettingsV2") as Settings;
settingsElementV2.settings = JSON.stringify({
  remoteUrls: [
    "https://raw.githubusercontent.com/exhuma/dotfiles/master/bookmarks.json",
    "https://demo-2.json",
  ],
  enableBrowserBookmarks: true,
  version: 2,
});
settingsElementV2.addEventListener("change", (event) => {
  console.log(JSON.parse(event.detail["settings"]));
});

settingsElementV1.settings = JSON.stringify({
  remoteUrl: "https://raw.githubusercontent.com/exhuma/dotfiles/master/bookmarks.json",
  version: 1,
});

let bookmarksElement = document.getElementById("schmackhaft");
bookmarksElement.links = JSON.stringify(exampleData);

function toggleDiv(evt) {
  let enabledName = evt.target.dataset["div"]
  document.querySelectorAll(".toggleable").forEach(element => {
    let currentName = element.id;
    let displayValue = (enabledName === currentName ? "block" : "none");
    element.style.display = displayValue;
  })
}

document.querySelectorAll(".clickable").forEach(element => {
  element.addEventListener("click", toggleDiv)
});
