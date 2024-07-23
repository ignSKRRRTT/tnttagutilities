# TNT Tag Utilities
This is a script that's like a mod for TNT Tag, adding a couple helpful features, but instead of going into your mods folder it acts as a proxy. This means you'll join a local server with this running, and it will sit between your Minecraft client and Hypixel.

If you need support DM @skrrrtt on discord

*I commissioned someone to make this mod as I do not have a good understanding of minecraft protocol. I was given permission to open source it by the person who made it.*

## How to run and use the mod

- Install [Node.js](https://nodejs.org/en/download/)
- Download this repo to a folder on your computer (First click the green Code button near the top center, then click Download ZIP, and unzip the folder.)
- Open Windows Powershell or a similar command prompt
- Navigate to the folder using the `cd` command: for example `cd C:/users/Aiden/Desktop/`
- Run `npm install` to download this project's dependencies
- Run `npm start` to start this
- The proxy is now up and running, follow the above instructions to use it in Minecraft.
- To stop the program, type `exit` in the command prompt, or close the window.

**Most of these steps you will only have to do once. Further uses will just require you to cd to the app in powershell or CMD and run `npm start`**

## Features
- Displays player's wins on player list and name tags.
- Displays a "NICKED" status next to a player's name if they are nicked
- Displays explosion timer and alive players above hotbar where "Run away!" would usually be.
- `/tstats <optional user>` shows you someone's TNT Tag stats, or your own.
- `/blacklist add/remove <user>` adds user to a blacklist and gives them a yellow colored name on the player list and on their nametag so you can spot players you want to avoid.
- Boldens the speed and slowness message in chat to make it stand out more.
- Plays a jukebox sound when you get speed 3 and give slowness 1 to someone.
- Plays a sound when you throw someone back with the repulsor powerup.

## Images
<img src="https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/t1d707ze.png" />
<img src="https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/j4je8k2q.png" />
<img src="https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/a35jdbc2.png" />
<img src="https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/xa32l0n5.png" />
<img src="https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/mk2txt4a.png" />
<img src="https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/as628a90.png" />
<img src="https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/s2awhlr5.png" />

## FAQ

### Why do I need to login?
Minecraft's protocol is encrypted to help keep everyone secure. When you join a server like Hypixel, your client, Hypixel, and Mojang all agree to an encryption scheme. Nothing between you and Hypixel will be able to read what's being sent or modify it because of that encryption. In order for this proxy to work, it has to sit between you and Hypixel, and it has to decrypt and re-encrypt everything being sent. In order to re-encrypt everything going out to Hypixel, this needs to login to Hypixel. It can't do that unless you give it access.\
Your login information is not sent to anything except Mojang/Microsoft. If you don't trust this code and can't review it yourself, don't run it.

### What versions does this support?
This only supports 1.8
