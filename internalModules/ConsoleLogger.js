export class ConsoleLogger {
  constructor(clientHandler) {
    this.clientHandler = clientHandler
    this.userClient = clientHandler.userClient
    this.proxyClient = clientHandler.proxyClient

    this.bindEventListeners()

    console.log(this.userClient.username + " connected to the proxy")
  }

  bindEventListeners() {
    //empty for now
  }
}