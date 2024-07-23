import EventEmitter from "events"
import { removeFormattingCodes } from "../utils/utils.js"

export class StateHandler extends EventEmitter {
  constructor(clientHandler) {
    super()

    this.clientHandler = clientHandler
    this.userClient = clientHandler.userClient
    this.proxyClient = clientHandler.proxyClient

    this.state = "none"

    this.tryLocrawTimeout = null
    this.isFirstLogin = true
    this.lastServerLocraw = null
    this.locrawRetryCount = 0
    this.requestedLocraw = false
    
    this.lastPosition = {x: 0, y: 0, z: 0}

    this.playersAlive = 32
    this.explosionTime = "§a54s"

    this.bindEventListeners()
    this.bindModifiers()
  }

  bindModifiers() {
    this.clientHandler.incomingModifiers.push(this.handleIncomingPacketForChat.bind(this))
    this.clientHandler.incomingModifiers.push(this.handleIncomingPacketForActionBar.bind(this))
  }

  handleIncomingPacketForChat(data, meta) {
    let actualMessage
    if (meta.name === "chat") {
      if (data.position === 2) return
      actualMessage = data.message
    } else if (meta.name === "system_chat") {
      if ("type" in data && data.type !== 1) return
      if ("isActionBar" in data && data.isActionBar === true) return
      actualMessage = data.content
    } else return
    let parsedMessage
    try {
      parsedMessage = JSON.parse(actualMessage)
    } catch (error) {
      //invalid JSON, Hypixel sometimes sends invalid JSON with unescaped newlines
      return
    }
    //locraw response
    checks: {
      if (parsedMessage.extra) break checks
      if (parsedMessage.color !== "white") break checks
      let content = parsedMessage.text
      try {
        content = JSON.parse(content)
      } catch (error) {
        break checks
      }
      if (typeof content?.server !== "string") break checks
      if (!this.requestedLocraw) break checks
      this.requestedLocraw = false
      if (content.server === "limbo" || content.server === this.lastServerLocraw) {
        this.locrawRetryCount++
        if (this.locrawRetryCount > 3) {
          //give up, we might actually be in limbo
          return { //equivalent to breaking and cancelling packet
            type: "cancel"
          }
        }
        this.tryLocrawTimeout = setTimeout(() => {
          if (this.clientHandler.destroyed) return
          this.requestedLocraw = true
          this.clientHandler.sendServerCommand("locraw")
        }, 500)
        return { //equivalent to breaking and cancelling packet
          type: "cancel"
        }
      } else {
        this.lastServerLocraw = content.server
      }
      if (content.gametype === "TNTGAMES" && content.mode === "TNTAG") {
        if (this.state === "none") this.setState("waiting")
      }
      return {
        type: "cancel"
      }
    }
    
    //slowness applied
    checks: {
      if (this.state !== "waiting") break checks
      if (parsedMessage.extra?.length !== 5) break checks
      if (parsedMessage.extra[0].text !== "You got lucky and applied ") break checks
      if (parsedMessage.extra[0].color !== "yellow") break checks
      for (let i = 0; i < 2; i++) this.userClient.write("named_sound_effect", {
        soundName: "note.harp",
        volume: 1,
        pitch: 35,
        x: Math.round(this.lastPosition.x * 8),
        y: Math.round(this.lastPosition.y * 8) + 8, //a little above the head so it sounds centered despite these sounds only being playable at ints
        z: Math.round(this.lastPosition.z * 8)
      })
      parsedMessage.extra.forEach(m => {
        m.bold = true
      })
      data.message = JSON.stringify(parsedMessage)
      return {
        type: "replace",
        meta,
        data
      }
    }
    //speed received
    checks: {
      if (this.state !== "waiting") break checks
      if (parsedMessage.extra?.length !== 3) break checks
      if (parsedMessage.extra[0].text !== "You got lucky and received ") break checks
      if (parsedMessage.extra[0].color !== "yellow") break checks
      for (let i = 0; i < 2; i++) this.userClient.write("named_sound_effect", {
        soundName: "note.harp",
        volume: 1,
        pitch: 74,
        x: Math.round(this.lastPosition.x * 8),
        y: Math.round(this.lastPosition.y * 8) + 8, //a little above the head so it sounds centered despite these sounds only being playable at ints
        z: Math.round(this.lastPosition.z * 8)
      })
      parsedMessage.extra.forEach(m => {
        m.bold = true
      })
      data.message = JSON.stringify(parsedMessage)
      return {
        type: "replace",
        meta,
        data
      }
    }
    //repulsed tnt holders
    checks: {
      if (this.state !== "waiting") break checks
      if (parsedMessage.extra?.length !== 1) break checks
      if (parsedMessage.extra[0].text !== "You have repulsed nearby TNT holders!") break checks
      if (parsedMessage.extra[0].color !== "yellow") break checks
      this.userClient.write("named_sound_effect", {
        soundName: "mob.enderdragon.hit",
        volume: 5,
        pitch: 63,
        x: Math.round(this.lastPosition.x * 8),
        y: Math.round(this.lastPosition.y * 8) + 8, //a little above the head so it sounds centered despite these sounds only being playable at ints
        z: Math.round(this.lastPosition.z * 8)
      })
      parsedMessage.extra.forEach(m => {
        m.bold = true
      })
      data.message = JSON.stringify(parsedMessage)
      return {
        type: "replace",
        meta,
        data
      }
    }
  }

  handleIncomingPacketForActionBar(data, meta) {
    let actualMessage
    if (meta.name === "chat") {
      if (data.position !== 2) return
      actualMessage = data.message
    } else if (meta.name === "system_chat") {
      if (data.type !== 2 && !data.isActionBar) return
      actualMessage = data.content
    } else return
    if (this.state === "waiting") return {
      type: "cancel"
    }
  }

  bindEventListeners() {
    this.clientHandler.on("destroy", () => {
      this.setState("none")
    })
    this.proxyClient.on("login", () => {
      this.setState("none")
      if (this.tryLocrawTimeout) {
        clearTimeout(this.tryLocrawTimeout)
        this.tryLocrawTimeout = null
      }
      this.locrawRetryCount = 0
      if (this.isFirstLogin) {
        this.isFirstLogin = false
        this.tryLocrawTimeout = setTimeout(() => {
          if (this.clientHandler.destroyed) return
          this.requestedLocraw = true
          this.clientHandler.sendServerCommand("locraw")
        }, 1500)
      } else {
        this.tryLocrawTimeout = setTimeout(() => {
          if (this.clientHandler.destroyed) return
          this.requestedLocraw = true
          this.clientHandler.sendServerCommand("locraw")
        }, 150)
      }
    })
    this.proxyClient.on("scoreboard_team", data => {
      if (this.state !== "waiting") return
      checks: {
        if (data.prefix !== "§eExplosion in ") break checks
        if (!data.suffix || data.suffix.length < 4) break checks
        this.explosionTime = data.suffix
        this.displayActionBar()
      }
      checks: {
        if (!data.prefix) break checks
        if (!data.prefix.startsWith("Alive: §a")) break checks
        let thingy = data.prefix.substring(9)
        thingy = thingy.substring(0, thingy.indexOf(" "))
        thingy = parseInt(thingy)
        this.playersAlive = thingy
        this.displayActionBar()
      }
    })
    this.userClient.on("position", data => {
      this.lastPosition = data
    })
    this.userClient.on("position_look", data => {
      this.lastPosition = data
    })
  }

  setState(state) {
    if (this.state === state) return
    this.state = state
    this.emit("state", state)
    this.emit(state)
    if (state === "waiting") {
      this.playersAlive = 32
      this.explosionTime = "§a54s"
    }
  }

  displayActionBar() {
    this.clientHandler.sendClientActionBar({
      text: `§eExplosion in ${this.explosionTime} §f| §a${this.playersAlive} §ePlayers Alive`
    })
  }
}