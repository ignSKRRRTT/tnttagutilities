import { handleCommand } from "../commands/handler.js"

export class CustomCommands {
  constructor(clientHandler) {
    this.clientHandler = clientHandler
    this.userClient = clientHandler.userClient
    this.proxyClient = clientHandler.proxyClient

    this.bindModifiers()
  }

  bindModifiers() {
    this.clientHandler.outgoingModifiers.push(this.handleOutgoingPacket.bind(this))
  }

  handleOutgoingPacket(data, meta) {
    if (meta.name === "chat_command") {
      let isCommand = handleCommand(this.clientHandler, data.command, this.userClient.trimmedUUID, "slash", this.clientHandler.proxy)
      if (isCommand) return {
        type: "cancel"
      }
    }
    if (meta.name === "chat") {
      let trim = data.message.trim()
      if (!trim.startsWith("/")) return
      let string = trim.substring(1)
      let isCommand = handleCommand(this.clientHandler, string, this.userClient.trimmedUUID, "slash", this.clientHandler.proxy)
      if (isCommand) return {
        type: "cancel"
      }
    }
  }
}