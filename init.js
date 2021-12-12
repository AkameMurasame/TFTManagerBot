const { Client, Intents, Guild, MessageActionRow } = require("discord.js");
const fetch = require('node-fetch');
const config = require('./auth.json');
const { Stomp } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGES] });

const prefix = "!";

//const url = "http://localhost:8080";
const url = "https://tft-manager.herokuapp.com";

let teste = [];

client.on("ready", c => {
    connect().then((stompClient) => connectTopicOrganization(stompClient)).then((stompClient) => connectTopicOrganizationResult(stompClient));
})

client.on("messageCreate", function (message) {

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "config") {
        let adiciona = false;
        if (teste.length == 0) {
            teste.push(message.guild);
        } else {
            teste.forEach(t => {
                if (t.id != message.guild.id) {
                    adiciona = true;
                }
            })

            if (adiciona) {
                teste.push(message.guild);
            }
        }

        console.log(teste.length)

        let server = message.guild.id;
        fetch(url + '/api/v1/discord/' + server)
            .then(res => res.json())
            .then(json => {
                if (json.response == null) {
                    let organizationName = message.guild.name;
                    let serverId = message.guild.id;
                    let channelId;
                    let resultado;

                    message.guild.channels.cache.forEach(c => {
                        if (c.type == 'GUILD_TEXT' && c.name.includes('tabela')) {
                            channelId = c.id;
                        } else if (c.type == 'GUILD_TEXT' && c.name.includes('resultado')) {
                            resultado = c.id;
                        }
                    })

                    const configD = {
                        serverName: organizationName,
                        discordConfigs: [
                            {
                                campoId: serverId,
                                discordField: "SERVER_ID"
                            },
                            {
                                campoId: channelId,
                                discordField: "TABLE_CHANEL"
                            },
                            {
                                campoId: resultado,
                                discordField: "RESULTADO_CHANEL"
                            }
                        ]
                    };

                    fetch(url + '/api/v1/discord/discordConfig', {
                        method: 'POST',
                        body: JSON.stringify(configD),
                        headers: { 'Content-Type': 'application/json' }
                    })
                        .then(res => res.json())
                        .then(json => console.log(json));

                    message.reply(`Bot Configurado!`);
                    configurado = true;
                } else {
                    message.reply(`Bot Configurado!`);
                }
            });
    } else if (command === "tabela") {
        let serverId = message.guild.id;
        fetch(url + '/api/v1/discord/tabela/' + serverId)
            .then(res => res.json())
            .then(json => message.reply(json.response));
    }
});

client.login("OTE4ODc0MzU5NTc2MjgxMTQ4.YbNmbw.UevqiI2xgKtCdK6BAamF03g3BvA");


function connect() {
    return new Promise((resolve, reject) => {
        let stompClient = Stomp.over(new SockJS(url + "/websocket"))
        stompClient.connect({}, (frame) => {
             setInterval(func => connect(), 60000000);
            resolve(stompClient)
        });
    })
}

function connectTopicOrganization(stompClient) {
    stompSubscribe(stompClient, `/topic/server`, (data) => {
        var json = JSON.parse(data.body);
        console.log(json)
        teste.forEach(t => {
            console.log(t)
            if (t.id == json.serverId) {
                t.channels.cache.get(json.chanelId).send(json.discordMessage);
                t.channels.cache.get(json.chanelId).send("@everyone");
            }
        })

        return stompClient
    });
    return stompClient
}

function connectTopicOrganizationResult(stompClient) {
    stompSubscribe(stompClient, `/topic/server/result`, (data) => {
        var json = JSON.parse(data.body);
        console.log(json)
        teste.forEach(t => {
            if (t.id == json.serverId) {
                t.channels.cache.get(json.resultadoId).send(json.discordMessage);
                t.channels.cache.get(json.resultadoId).send("@everyone");
            }
        })

        return stompClient
    });
    return stompClient
}

function stompSubscribe(stompClient, endpoint, callback) {
    stompClient.subscribe(endpoint, callback)
    return stompClient
}