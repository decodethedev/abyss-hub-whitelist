const { Webhook, MessageBuilder } = require('discord-webhook-node');

const malfunctionWebhook = process.env.MALWEBHOOK;
const sucessWebhook = process.env.SUCESSWEBHOOK;
const failedWebhook = process.env.FAILEDWEBHOOK;
const susWebhook = process.env.SUSWEBHOOK;
const activityWebhook = process.env.ACTIVITYWEBHOOK;

const malfunctionHook = new Webhook(malfunctionWebhook);
const sucessHook = new Webhook(sucessWebhook);
const failedHook = new Webhook(failedWebhook);
const susHook = new Webhook(susWebhook);
const activityHook = new Webhook(activityWebhook);

function sendMalReport(str) { 
    const embed = new MessageBuilder()
    .setTitle('Malfunction Report')
    .addField('Error', str)
    .setColor('#FF0000')
    .setTimestamp();
    malfunctionHook.send(embed);
}

function sendSucess(usr) { 
    const embed = new MessageBuilder()
    .setTitle('Sucess Execution Report')
    .addField('ID', usr._id)
    .addField('Discord Username', usr.discordUser)
    .addField('Discord ID', usr.discordID)
    .addField('Subscription', usr.subscription)
    .addField('Identifier', usr.identifier)
    .addField('Key', usr.key)
    .setColor('#00FF00')
    .setTimestamp();
    sucessHook.send(embed);
}

function sendSusLog(usr, reason) {
    let embed;
    if (usr == null) {
        embed = new MessageBuilder()
        .setTitle('Potential Crack Execution Report')
        .addField('Reason', reason)
        .setColor('#FF0000')
        .setTimestamp();
    }
    else {
        embed = new MessageBuilder()
        .setTitle('Potential Crack Execution Report')
        .addField('Cause', reason)
        .addField('ID', usr._id)
        .addField('Discord Username', usr.discordUser)
        .addField('Discord ID', usr.discordID)
        .addField('Subscription', usr.subscription)
        .addField('Identifier', usr.identifier)
        .addField('Key', usr.key)
        .setColor('#FF0000')
        .setTimestamp();
    }
    susHook.send(embed);
}

function sendFailed(usr, reason, data=null) { 
    let embed;
    if (usr == null) {
        embed = new MessageBuilder()
        .setTitle('Failed Execution Report')
        .addField('Reason', reason)
        .addField('Data', `\`\`\`json\n${JSON.stringify(data)}\`\`\``)
        .setColor('#FF0000')
        .setTimestamp();
    }
    else {
        embed = new MessageBuilder()
        .setTitle('Failed Execution Report')
        .addField('Cause', reason)
        .addField('ID', usr._id)
        .addField('Discord Username', usr.discordUser)
        .addField('Discord ID', usr.discordID)
        .addField('Subscription', usr.subscription)
        .addField('Identifier', usr.identifier)
        .addField('Key', usr.key)
        .setColor('#FF0000')
        .setTimestamp();
    }
    failedHook.send(embed);
}

function sendActivity(usr, activity) { 
    const embed = new MessageBuilder()
    .setTitle('Activity Report')
    .addField('Activity', activity)
    .addField('ID', usr._id)
    .addField('Discord Username', usr.discordUser)
    .addField('Discord ID', usr.discordID)
    .addField('Subscription', usr.subscription)
    .addField('Identifier', usr.identifier)
    .addField('Key', usr.key)
    .setColor('#00FF00')
    .setTimestamp();
    activityHook.send(embed);
}

module.exports = {
    sendMalReport,
    sendFailed,
    sendSucess,
    sendSusLog,
    sendActivity,
}