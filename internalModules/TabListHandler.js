import { config } from "../config/configHandler.js"
import { getStats } from "../tnttagApi/statsHandler.js"
import { randomString } from "../utils/utils.js"
import { isBlacklisted } from "../data/blacklisted.js"

let enabled = config["fetch-player-stats"]

export class TabListHandler {
  constructor(clientHandler) {
    this.clientHandler = clientHandler
    this.userClient = clientHandler.userClient
    this.proxyClient = clientHandler.proxyClient

    this.stateHandler = this.clientHandler.stateHandler

    this.teams = new Map()
    this.players = new Map()
    this.teamOverrides = new Map()

    if (enabled) {
      this.bindModifiers()
      this.bindEventListeners()
    }
  }

  bindModifiers() {
    this.clientHandler.incomingModifiers.push(this.handleIncomingPacket.bind(this))
  }

  handleIncomingPacket(data, meta) {
    if (meta.name === "teams" || meta.name === "scoreboard_team") {
      return this.handleTeamPacket(data, meta)
    }
  }

  bindEventListeners() {
    this.proxyClient.on("player_info", data => {
      let action = data.action
      for (let playerInfo of data.data) {
        if (this.userClient.protocolVersion < 761 && action === 4) {
          this.players.delete(playerInfo.UUID) //always uppercase UUID for versions < 761
          if (this.teamOverrides.has(playerInfo.UUID)) {
            this.removeTeamOverride(playerInfo.UUID)
          }
        } else {
          let object
          if (playerInfo.uuid) {
            object = this.players.get(playerInfo.uuid)
          } else {
            object = this.players.get(playerInfo.UUID)
          }
          if (!object) object = {}
          if (playerInfo.player !== undefined) object.player = playerInfo.player
          if (playerInfo.chatSession !== undefined) object.chatSession = playerInfo.chatSession
          if (playerInfo.gamemode !== undefined) object.gamemode = playerInfo.gamemode
          if (playerInfo.uuid !== undefined) object.uuid = playerInfo.uuid
          if (playerInfo.UUID !== undefined) object.uuid = playerInfo.UUID //use lowercase anyways
          if (playerInfo.listed !== undefined) object.listed = playerInfo.listed
          if (playerInfo.latency !== undefined) object.latency = playerInfo.latency
          if (playerInfo.displayName !== undefined) object.displayName = playerInfo.displayName
          if (playerInfo.name !== undefined) object.name = playerInfo.name
          if (playerInfo.properties !== undefined) object.properties = playerInfo.properties
          if (playerInfo.ping !== undefined) object.ping = playerInfo.ping
          if (playerInfo.crypto !== undefined) object.crypto = playerInfo.crypto
          if (playerInfo.ping > 1 || playerInfo.latency > 1) object.hadPing = true
          this.players.set(object.uuid, object)
        }
      }
      if (this.stateHandler.state === "waiting") this.checkPlayerList()
    })
    this.proxyClient.on("player_remove", data => {
      for (let uuid of data.players) {
        this.players.delete(uuid)
        if (this.teamOverrides.has(uuid)) {
          this.removeTeamOverride(uuid)
        }
      }
    })
    this.stateHandler.on("state", state => {
      if (state === "waiting") {
        this.checkPlayerList()
      } else {
        for (let key of this.teamOverrides.keys()) {
          this.removeTeamOverride(key)
        }
      }
    })
  }

  handleTeamPacket(data, meta) {
    let team = data.team
    let mode = data.mode
    switch (mode) {
      case 0: {
        let object = {}
        if ("name" in data) object.name = data.name
        if ("prefix" in data) object.prefix = data.prefix
        if ("suffix" in data) object.suffix = data.suffix
        if ("friendlyFire" in data) object.friendlyFire = data.friendlyFire
        if ("nameTagVisibility" in data) object.nameTagVisibility = data.nameTagVisibility
        if ("collisionRule" in data) object.collisionRule = data.collisionRule
        if ("color" in data) object.color = data.color
        if ("formatting" in data) object.formatting = data.formatting
        if ("players" in data && data.players) {
          object.players = data.players
        } else {
          object.players = []
        }
        this.teams.set(team, object)
        break
      }
      case 1: {
        let existing = this.teams.get(team)
        this.teams.delete(team)
        if (existing) {
          for (let player of existing.players) {
            let uuid = null
            for (let [key, value] of this.teamOverrides.entries()) {
              if (value.username === player) uuid = key
            }
            if (uuid) {
              this.replaceTeamOverride(uuid)
            }
          }
        }
        break
      }
      case 2: {
        let object = this.teams.get(team)
        if ("name" in data) object.name = data.name
        if ("prefix" in data) object.prefix = data.prefix
        if ("suffix" in data) object.suffix = data.suffix
        if ("friendlyFire" in data) object.friendlyFire = data.friendlyFire
        if ("nameTagVisibility" in data) object.nameTagVisibility = data.nameTagVisibility
        if ("collisionRule" in data) object.collisionRule = data.collisionRule
        if ("color" in data) object.color = data.color
        if ("formatting" in data) object.formatting = data.formatting
        if ("players" in data && data.players) object.players = data.players //should never happen, players only sent in 0, 3, and 4
        for (let player of object.players) {
          let uuid = null
          for (let [key, value] of this.teamOverrides.entries()) {
            if (value.username === player) uuid = key
          }
          if (uuid) {
            this.replaceTeamOverride(uuid)
          }
        }
        break
      }
      case 3: {
        let object = this.teams.get(team)
        object.players.push(...data.players)
        let playersToRemove = []
        for (let player of data.players) {
          let uuid = null
          for (let [key, value] of this.teamOverrides.entries()) {
            if (value.username === player) uuid = key
          }
          if (uuid) {
            this.replaceTeamOverride(uuid)
            playersToRemove.push(player)
          }
        }
        if (playersToRemove.length) {
          for (let player of playersToRemove) {
            data.players.splice(data.players.indexOf(player), 1)
          }
          return {
            type: "replace",
            meta,
            data
          }
        }
        break
      }
      case 4: {
        let object = this.teams.get(team)
        for (let player of data.players) {
          object.players.splice(object.players.indexOf(player), 1)
          let uuid = null
          for (let [key, value] of this.teamOverrides.entries()) {
            if (value.username === player) uuid = key
          }
          if (uuid) {
            this.replaceTeamOverride(uuid)
          }
        }
        break
      }
    }
  }

  getActualPlayers() {
    let players = []
    for (let player of this.players.values()) {
      if (!player.gamemode) continue
      if ("displayName" in player) continue
      if (player.hadPing) continue
      if (player.uuid[14] !== "4") {
        this.nickedPlayer(player.uuid)
        continue
      }
      players.push(player.uuid)
    }
    return players
  }

  checkPlayerList() {
    let list = this.getActualPlayers()
    for (let uuid of list) {
      if (this.teamOverrides.has(uuid)) continue
      (async () => {
        let userData = await getStats(uuid)
        if (!userData) return
        if (this.stateHandler.state !== "waiting") return
        if (!this.players.has(uuid)) return
        if (this.teamOverrides.has(uuid)) return
        let player = this.players.get(uuid)
        if (!player) return
        let username
        if (player.player) {
          username = player.player.name
        } else {
          username = player.name
        }
        this.addTeamOverride(uuid, username, userData)
      })()
    }
  }

  nickedPlayer(uuid) {
    if (this.stateHandler.state !== "waiting") return
    if (this.teamOverrides.has(uuid)) return
    let player = this.players.get(uuid)
    if (!player) return
    let username
    if (player.player) {
      username = player.player.name
    } else {
      username = player.name
    }
    this.addTeamOverride(uuid, username, {nicked: true})
  }

  addTeamOverride(uuid, username, data) {
    //not entirely sure why but this happens sometimes - just don't set in that case
    if (username === undefined) return
    
    let orderingNums
    let serverTeamValue = null
    for (let [key, value] of this.teams.entries()) {
      if (value.players.includes(username)) {
        orderingNums = key.substring(0, 3)
        serverTeamValue = value
        this.userClient.write("scoreboard_team", {
          team: key,
          mode: 4,
          players: [username]
        })
      }
    }
    let newTeamKey = (orderingNums || "aaa") + username.substring(0, 3) + randomString(10)
    let extraText
    if (data.nicked) {
      extraText = "§c [NICKED]"
    } else {
      let wins = data.wins
      let winsColor
      if (wins < 15) {
        winsColor = "8"
      } else if (wins < 50) {
        winsColor = "7"
      } else if (wins < 100) {
        winsColor = "f"
      } else if (wins < 250) {
        winsColor = "2"
      } else if (wins < 500) {
        winsColor = "a"
      } else if (wins < 1000) {
        winsColor = "9"
      } else if (wins < 1500) {
        winsColor = "5"
      } else if (wins < 2500) {
        winsColor = "6"
      } else if (wins < 5000) {
        winsColor = "c"
      } else if (wins < 10000) {
        winsColor = "0"
      } else {
        winsColor = "1"
      }
      extraText = `§${winsColor} [${wins.toString()}]`
    }
    let newSuffix
    if (serverTeamValue?.suffix) {
      newSuffix = serverTeamValue.suffix + extraText
    } else {
      newSuffix = extraText
    }
    let extraPrefixText = ""
    if (isBlacklisted(uuid.replaceAll("-", ""))) {
      extraPrefixText = "§e"
    }
    let newPrefix
    if (serverTeamValue?.prefix) {
      newPrefix = serverTeamValue.prefix + extraPrefixText
    } else {
      newPrefix = extraPrefixText
    }
    this.userClient.write("scoreboard_team", {
      team: newTeamKey,
      mode: 0,
      name: newTeamKey,
      prefix: newPrefix,
      suffix: newSuffix,
      friendlyFire: 3,
      nameTagVisibility: "always",
      color: 15,
      players: [username]
    })
    this.teamOverrides.set(uuid, {
      username,
      teamKey: newTeamKey,
      data
    })
  }

  removeTeamOverride(uuid) {
    let existingOverride = this.teamOverrides.get(uuid)
    this.userClient.write("scoreboard_team", {
      team: existingOverride.teamKey,
      mode: 1
    })
    this.teamOverrides.delete(uuid)
  }

  replaceTeamOverride(uuid) { //mmm
    let existingOverride = this.teamOverrides.get(uuid)
    this.removeTeamOverride(uuid)
    this.addTeamOverride(uuid, existingOverride.username, existingOverride.data)
  }

  tryForceUpdate(uuid) {
    let longUUID = `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20, 32)}`
    if (this.teamOverrides.has(longUUID)) this.replaceTeamOverride(longUUID)
  }
}