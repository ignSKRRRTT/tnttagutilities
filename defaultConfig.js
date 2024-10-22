export default `# Config version, used to quickly validate the config and make sure it will have all of the necessary information in it. Do not change this unless you know what you're doing.
config-version: 2

# Port to host the server on. Usually you can leave this on 25565, which is Minecraft's default port.
server-port: 25565

# The server's host. Recommended to leave this on 127.0.0.1.
server-host: 127.0.0.1

# TNT Tag Utilities can fetch stats for other players in your game using Aiden (skrrrtt on Discord)'s API.
# Each player's win count will be displayed in tab in TNT Tag games, letting you get a quick idea of how good each player is.
# Additionally, this contributes to Aiden's database, allowing more accurate leaderboards to be displayed on his website (https://tnttag.info/leaderboard).
# Set this to true if you'd like to opt-in.
fetch-player-stats: true

# Bossbar timer during the game
# This shows you the same information as the action bar, but on the bossbar at the top of the screen.
# Due to bossbars being kinda sketchy in 1.8 and relying on a fake wither being created/updated constantly,
# you may see potion particles or stuttering of the bar if you flick your head fast.
# You can turn off potion particles and smoke animation to fully hide these particles.
bossbar-timer: false`