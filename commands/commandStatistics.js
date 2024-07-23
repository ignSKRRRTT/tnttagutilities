import { getPlayerStats } from "../tnttagApi/fullStats.js"

export const name = "statistics"
export const aliases = ["tnttagstats", "tstats"]
export const allowedSources = ["slash"]
export const description = "Shows player's statistics in TNT Tag."
export async function run(usageInstance) {
  let username
  if (usageInstance.argsString !== "") {
    username = usageInstance.argsString
  } else {
    username = usageInstance.clientHandler.userClient.username
  }
  let playerStats = await getPlayerStats(username)
  if (!playerStats) {
    return "§7Player not found."
  }
  username = playerStats.username
  let message = `§cTNTTagUtilities > §c${username}§7's statistics: `
  message += `§7Wins: §a${playerStats.wins.toLocaleString()}§7, `
  message += `§7Kills: §a${playerStats.kills.toLocaleString()}§7, `
  message += `§7Deaths: §a${playerStats.deaths.toLocaleString()}§7, `
  message += `§7K/D §7Ratio: §a${playerStats.kd}§7, `
  message += `§7Tags: §a${playerStats.tags.toLocaleString()}§7, `
  message += `§7TNT §7Coins: §a${playerStats.coins.toLocaleString()}§7, `
  message += `§7TNT §7Hours: §a${playerStats.playtime}`
  usageInstance.clientHandler.sendClientMessage(message)
}