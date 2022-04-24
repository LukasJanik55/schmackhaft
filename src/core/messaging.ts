import * as browser from "webextension-polyfill";

import { createStorage } from "./storage/factory";
import { Settings } from "./settings";
import { Bookmark, HMRequest } from "../types";

const COLLECTIONS = ["local", "http", "bookmarks"];
const TARGET_COLLECTION = "local";

async function removeBookmark(href: string): Promise<void> {
  let settings = Settings.default();
  let promises = COLLECTIONS.map(async (type) => {
    let storage = createStorage(settings, type);
    await storage.remove(href);
  });
  await Promise.all(promises);
}

async function storeBookmark(bookmark: Bookmark): Promise<void> {
  let settings = Settings.default();
  let storage = createStorage(settings, TARGET_COLLECTION);
  let persistentItem = await storage.get(bookmark.href);
  if (persistentItem) {
    persistentItem.title = bookmark.title;
    persistentItem.tags = bookmark.tags;
  } else {
    persistentItem = bookmark;
  }
  await storage.put(persistentItem);
}

export async function handleMessage(request: HMRequest, sender, sendResponse) {
  let settings = Settings.default();
  try {
    if (request.method === "getBookmarks") {
      let output = [];
      let promises = COLLECTIONS.map(async (type) => {
        let storage = createStorage(settings, type);
        console.info(`Requesting bookmarks from ${type}`);
        let bookmarks = await storage.getAll();
        output = [...output, ...bookmarks];
      });
      await Promise.all(promises);
      return output;
    } else if (request.method === "addBookmark") {
      await storeBookmark(request.args);
      browser.runtime.sendMessage({
        method: "bookmarksModified",
      });
    } else if (request.method === "removeBookmark") {
      await removeBookmark(request.args.href);
      browser.runtime.sendMessage({
        method: "bookmarksModified",
      });
    } else {
      console.error(`Unknown request: ${request.method}`);
    }
  } catch (error) {
    console.error(error);
  }
}
