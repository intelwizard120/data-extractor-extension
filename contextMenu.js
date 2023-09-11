export const MENU_ID = {
  MAIN: "datatera",
  PAGE: "page-datatera",
  SELECTION: "selection-datatera",
};

export function createContextMenu() {
  chrome.contextMenus.create(
    {
      id: MENU_ID.MAIN,
      title: "Datatera.ai",
      contexts: ["page", "selection"],
    },
    addChildMenuIems
  );
}

function addChildMenuIems() {
  chrome.contextMenus.create(
    {
      id: MENU_ID.PAGE,
      title: "Send web page",
      parentId: MENU_ID.MAIN,
      contexts: ["page", "selection"],
    },
    () => updateMenuItems("page", MENU_ID.PAGE)
  );
  chrome.contextMenus.create(
    {
      id: MENU_ID.SELECTION,
      title: "Send selected text",
      parentId: MENU_ID.MAIN,
      contexts: ["page", "selection"],
    },
    () => updateMenuItems("selection", MENU_ID.SELECTION)
  );
}

let conversionList = [],
  token = "";
function updateMenuItems(prefix, parentId) {
  if (!token) conversionList = [{ _id: "login", name: "Please Login" }];
  for (const item of conversionList) {
    const CONVERSION_ID = `${prefix}-${item._id}`;
    chrome.contextMenus.create({
      id: CONVERSION_ID,
      title: item.name,
      parentId,
      contexts: ["page", "selection"],
    });
    if (!token) return;
    chrome.contextMenus.create({
      id: `${CONVERSION_ID}-list`,
      title: "List",
      parentId: CONVERSION_ID,
      contexts: ["page", "selection"],
    });

    chrome.contextMenus.create({
      id: `${CONVERSION_ID}-card`,
      title: "Card",
      parentId: CONVERSION_ID,
      contexts: ["page", "selection"],
    });
  }
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === "local") runUpdate();
});

async function runUpdate() {
  const result = await chrome.storage.local.get(["conversionList", "token"]);
  conversionList = result.conversionList;
  token = result.token;
  chrome.contextMenus.removeAll(createContextMenu);
}
