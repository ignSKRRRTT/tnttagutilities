import { UsageInstance } from "./UsageInstance.js"

export function handleCommand(clientHandler, string, uuid, source, proxy) {
  let usageInstance = new UsageInstance(clientHandler, string, uuid, source, proxy)
  return usageInstance.handle()
}