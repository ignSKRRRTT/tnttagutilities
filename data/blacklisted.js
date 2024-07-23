import { data } from "./dataHandler.js"

export function isBlacklisted(uuid) {
  return data.blacklisted.includes(uuid)
}

export function addToBlacklisted(uuid) {
  data.blacklisted.push(uuid)
}

export function removeFromBlacklisted(uuid) {
  data.blacklisted.splice(data.blacklisted.indexOf(uuid), 1)
}

export function getBlacklistedList() {
  return data.blacklisted
}