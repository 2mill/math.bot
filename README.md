# math.bot

# Math.bot

Math.bot is a Discord bot that can handle math queries from any Discord server that is connected to it.

[Click here to add it your server today!](https://discordapp.com/api/oauth2/authorize?client_id=621533275919220766&permissions=2048&scope=bot)

Version : 0.1.1

## Features

-   Resolve Math queries through WolframAlpha
-   Handle simple queries.

## Big Time Helpers :

jacobcoughenour
[Github](https://github.com/jacobcoughenour)
[GitLab](https://gitlab.com/jacobcoughenour)

If you would like to test out this bot yourself follow these steps below :

clone 2mill/math.bot

```sh
cd math.bot
```

```sh
npm i
```

start the bot with

```sh
npm run watch
```

and it will auto restart when you make changes
You will need to input your own Wolfram & Discord bot keys to test your own bots.

For more information on how to start a Discord bot please turn to the Discord development portal.

[There is also a public docker image at](https://hub.docker.com/2mill/math.bot)

Make sure that you include tokens inside the docker enviornment when running.
`docker run -td -e DISCORD_TOKEN=$KEY_DC -e WOLFRAM_APP_ID=$KEY_WA math.bot:latest`

These images update in correspondance with Github

Refer to TOOD.md for features that still need to be implemented
