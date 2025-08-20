import * as google from "./google.js";
import * as microsoft from "./microsoft.js";

export function getEngine(name) {
  switch (name) {
    case "microsoft":
      return microsoft;
    case "google":
    default:
      return google;
  }
}
