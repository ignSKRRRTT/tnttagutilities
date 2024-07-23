import { isBlacklisted, addToBlacklisted, removeFromBlacklisted, getBlacklistedList } from "../data/blacklisted.js"
import { getName, getInfo } from "../mojangApi/identifierHandler.js"

export const name = "blacklist"
export const aliases = ["blacklisted"]
export const allowedSources = ["console", "slash"]
export const description = "Configures or views the blacklisted user list"
export async function run(usageInstance) {
  if (usageInstance.args.length === 0) {
    usageInstance.reply(`§7Usage: ${usageInstance.prefix}blacklist list | ${usageInstance.prefix}blacklist add <user> | ${usageInstance.prefix}blacklist remove <user>.`)
    return
  }
  if (usageInstance.args[0] === "list") {
    let blacklistedList = getBlacklistedList()
    if (blacklistedList.length === 0) {
      usageInstance.reply(`§7There are no blacklisted users.`)
      return
    }
    let promises = blacklistedList.map(uuid => getName(uuid))
    let names
    try {
      names = await Promise.all(promises)
    } catch (error) {
      //as a backup, display UUIDs if name lookup failed
      usageInstance.reply(`§cUnable to fetch usernames. Blacklisted users: §c${blacklistedList.join(", ")}§7.`)
      return
    }
    usageInstance.reply(`§7Blacklisted users: §c${names.join(", ")}§7.`)
  } else if (usageInstance.args[0] === "add") {
    if (usageInstance.args.length < 2) {
      usageInstance.reply(`§7You must specify a user.`)
      return
    }
    let user = usageInstance.args[1]
    let info
    try {
      info = await getInfo(user)
    } catch (error) {
      usageInstance.reply(`§cUnable to fetch Mojang API data. Try again in a second.`)
      return
    }
    if (!info) {
      usageInstance.reply(`§cThat user does not exist.`)
      return
    }
    if (isBlacklisted(info.uuid)) {
      usageInstance.reply(`§c${info.name} is already blacklisted.`)
      return
    }
    addToBlacklisted(info.uuid)
    usageInstance.clientHandler.tabListHandler.tryForceUpdate(info.uuid)
    usageInstance.reply(`§7${info.name} is now blacklisted.`)
  } else if (usageInstance.args[0] === "remove") {
    if (usageInstance.args.length < 2) {
      usageInstance.reply(`§7You must specify a user.`)
      return
    }
    let user = usageInstance.args[1]
    let info
    try {
      info = await getInfo(user)
    } catch (error) {
      usageInstance.reply(`§cUnable to fetch Mojang API data. Try again in a second.`)
      return
    }
    if (!info) {
      usageInstance.reply(`§cThat user does not exist.`)
      return
    }
    if (!isBlacklisted(info.uuid)) {
      usageInstance.reply(`§c${info.name} is not blacklisted.`)
      return
    }
    removeFromBlacklisted(info.uuid)
    usageInstance.clientHandler.tabListHandler.tryForceUpdate(info.uuid)
    usageInstance.reply(`§7${info.name} is no longer blacklisted.`)
  }
}