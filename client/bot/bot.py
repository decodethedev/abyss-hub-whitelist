import json
import base64
import discord
import requests

from discord.ext import commands
from discord.ui import Button, View

with open('config.json', 'r') as f:
    config = json.load(f)

intents = discord.Intents.all()
bot = commands.Bot(command_prefix=config['prefix'], intents=intents)
bot.remove_command("help")

owner_role = 992845871228133407
ICON_URL = "https://cdn.discordapp.com/app-icons/956174791684030524/c63b9f6061379dd1ec7b2248eb7b7761.png"

# @bot.command()
# async def whitelist(ctx, user: discord.Member = None):
#     author = ctx.author
#     role = ctx.guild.get_role(976033361531371530)
    
#     if not role:
#         embed=discord.Embed(title="Unexpected Error", description="Couldn't obtain whitelister role from this guild.", color=0x661a1a)
#         embed.set_author(name="Error", icon_url=ICON_URL)
#         embed.set_footer(text="Epico Whitelist Bot")
#         return await ctx.send(embed=embed)

#     if not role in author.roles:
#         embed=discord.Embed(title="Unauthorized Action", description="You don't have the permissions to execute this command.", color=0x661a1a)
#         embed.set_author(name="Error", icon_url=ICON_URL)
#         embed.set_footer(text="Epico Whitelist Bot")
#         return await ctx.send(embed=embed)

#     if not user:
#         embed=discord.Embed(title="Null user", description="You have to mention a user to whitelist.", color=0x661a1a)
#         embed.set_author(name="Error", icon_url=ICON_URL)
#         embed.set_footer(text="Epico Whitelist Bot")
#         return await ctx.send(embed=embed)
    
#     req = requests.post(f"{config['api-url']}/api/redeem", json={

#     })


@bot.command()
async def redeem(ctx, license):
    embed=discord.Embed(title="Redeeming...", description="Processing your request please wait.", color=0x4561b0)
    embed.set_author(name="Processing", icon_url=ICON_URL)
    embed.set_footer(text="Epico Whitelist Bot")
    msg = await ctx.send(embed=embed)

    req = requests.post(f"{config['api-url']}/api/redeem", json={
        "license": license,
        "discord_id": str(ctx.author.id),
        "discord_user": ctx.author.name,
        "secret": config['api-secret']
    })
    data = req.json()

    if req.status_code == 400:
        embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
        embed.set_author(name="Error", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        msg = await msg.edit(embed = embed, content = "")
    else:
        embed=discord.Embed(title="Weeee!", description=data['message'], color=0x26ffbe)
        embed.set_author(name="Success", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        msg = await msg.edit(embed = embed, content = "")

@bot.command()
async def generate_license(ctx, amount:int, use_left:int, subscription:int):
    role = ctx.guild.get_role(owner_role)
    if role in ctx.author.roles:
        if amount <= 0 or use_left <= 0:
            embed=discord.Embed(title="Oops!", description="Amount or uses left must be greater than zero.", color=0x661a1a)
            embed.set_author(name="Error", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")
            return await ctx.send(embed=embed)

        embed=discord.Embed(title="Generating...", description="Processing your request please wait.", color=0x4561b0)
        embed.set_author(name="Processing", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        msg = await ctx.send(embed=embed)

        req = requests.post(f"{config['api-url']}/api/licenses", json={
            "amount": amount,
            "use_left": use_left,
            "subscription": subscription,
            "created_by": str(ctx.author.id),
            "secret": config['api-secret']
        })
        data = req.json()

        if req.status_code == 400:
            embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
            embed.set_author(name="Error", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            msg = await msg.edit(embed = embed, content = "")
        else:
            embed=discord.Embed(title="Weeee!", description=data['message'], color=0x26ffbe)
            embed.set_author(name="Success", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            msg = await msg.edit(embed = embed, content = "")

            with open("keys.txt", "w") as f:
                f.truncate(0)

            with open("keys.txt", "a") as f:
                for lic in data['licenses']:
                    f.write(lic+"\n")

            await ctx.author.send("Here is your license file.", file = discord.File("./keys.txt"))

@bot.command()
async def whois(ctx,user:discord.User = None):
    if not user:
        user = ctx.author
    embed=discord.Embed(title="Fetching...", description="Processing your request please wait.", color=0x4561b0)
    embed.set_author(name="Processing", icon_url=ICON_URL)
    embed.set_footer(text="Epico Whitelist Bot")
    msg = await ctx.send(embed=embed)

    if not user:
        embed=discord.Embed(title="Oops!", description="Please enter a valid user.", color=0x661a1a)
        embed.set_author(name="Error", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        msg = await msg.edit(embed = embed, content = "")

    req = requests.get(f"{config['api-url']}/api/users", params={
        "discord_id":str(user.id),
        "secret": config['api-secret']
    })

    data = req.json()
    print(data)

    if req.status_code == 400:
        embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
        embed.set_author(name="Error", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        msg = await msg.edit(embed = embed, content = "")
    else:
        embed=discord.Embed(title=f"{data['discordUser']} {data['discordID']}", description="Done", color=0x26ffbe)
        embed.set_author(name="Success", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        subs = {'0':'Normal','2':'Private','1':'Beta'}

        print(data)
        
        embed.add_field(name="UID", value=data['_id'])
        embed.add_field(name="Blacklisted", value=data['blacklisted'])
        embed.add_field(name="Subscription", value=subs[str(data['subscription'])])

        msg = await msg.edit(embed = embed, content = "")

@bot.command()
async def lookup_uid(ctx, uid):
    embed=discord.Embed(title="Fetching...", description="Processing your request please wait.", color=0x4561b0)
    embed.set_author(name="Processing", icon_url=ICON_URL)
    embed.set_footer(text="Epico Whitelist Bot")
    msg = await ctx.send(embed=embed)

    if not uid:
        embed=discord.Embed(title="Oops!", description="Please enter a valid uid.", color=0x661a1a)
        embed.set_author(name="Error", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        msg = await msg.edit(embed = embed, content = "")

    req = requests.get(f"{config['api-url']}/api/users", params={
        "user_id":uid,
        "secret": config['api-secret']
    })

    data = req.json()

    if req.status_code == 400:
        embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
        embed.set_author(name="Error", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        msg = await msg.edit(embed = embed, content = "")
    else:
        embed=discord.Embed(title=f"{data['discordUser']} {data['discordID']}", description="Done", color=0x26ffbe)
        embed.set_author(name="Success", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        subs = {'0':'Normal','2':'Private','1':'Beta'}
        
        embed.add_field(name="UID", value=data['_id'])
        embed.add_field(name="Blacklisted", value=data['blacklisted'])
        embed.add_field(name="Subscription", value=subs[str(data['subscription'])])

        msg = await msg.edit(embed = embed, content = "")

@bot.command()
async def create_script(ctx):
    role = ctx.guild.get_role(owner_role)
    if role in ctx.author.roles:
        embed=discord.Embed(title="Please continue in your DM's!", color=0x4561b0)
        embed.set_author(name="Information", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        await ctx.send(embed=embed)

        def name_check(msg):
            return msg.author.id == ctx.author.id and isinstance(msg.channel, discord.DMChannel)

        def subscription_check(msg):
            return msg.author.id == ctx.author.id and isinstance(msg.channel, discord.DMChannel) and msg.content.isdigit() and int(msg.content) <= 2 and int(msg.content) >= 0

        def file_check(msg):
            return msg.author.id == ctx.author.id and isinstance(msg.channel, discord.DMChannel)


        await ctx.author.send("What's the name of the script?")
        try:
            name = await bot.wait_for("message", timeout=30, check = name_check)
        except Exception as e:
            return await ctx.author.send("Timed out nigga.")
        
        await ctx.author.send("What script subscription is that? (0(Normal), 1(Beta), 2(Private)) NUMBER ONLY")
        try:
            subscription = await bot.wait_for("message", timeout=30, check = subscription_check)
        except Exception as e:
            return await ctx.author.send("Timed out nigga.")

        await ctx.author.send("Please enter primary place_id:")
        try:
            place_id = await bot.wait_for("message", timeout=30, check = name_check)
        except Exception as e:
            return await ctx.author.send("Timed out nigga.")

        await ctx.author.send("Please give me the file script:")
        try:
            script_msg = await bot.wait_for("message", timeout=30, check = file_check)
        except Exception as e:
            return await ctx.author.send("Timed out nigga.")
        
        if len(script_msg.attachments) == 0:
            return await ctx.author.send("Please give a file, and retry.")
        
        req = requests.get(script_msg.attachments[0].url)
        with open('script.lua', 'wb') as f:
            f.write(req.content)

        embed=discord.Embed(title="Posting...", description="Processing your request please wait.", color=0x4561b0)
        embed.set_author(name="Processing", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        msg = await ctx.author.send(embed=embed)

        with open("script.lua", 'r') as f:
            content = f.read().encode('utf-8')
        

        req = requests.post(f"{config['api-url']}/api/scripts", json={ 
            "uploaded_by": str(ctx.author.id), 
            "script_name": name.content, 
            "primary_place_id": int(place_id.content),
            "secondary_place_ids": [], 
            "base64data": base64.b64encode(content).decode(),
            "subscription": int(subscription.content),
            "secret": config['api-secret']
        })

        data = req.json()

        if req.status_code == 400:
            embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
            embed.set_author(name="Error", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            return await msg.edit(embed = embed, content = "")
        else:
            return await msg.edit(embed = None,content = f"```{data}```")


@bot.command()
async def update_script(ctx):
    role = ctx.guild.get_role(owner_role)
    if role in ctx.author.roles:
        embed=discord.Embed(title="Please continue in your DM's!", color=0x4561b0)
        embed.set_author(name="Information", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        await ctx.send(embed=embed)

        def subscription_check(msg):
            return msg.author.id == ctx.author.id and isinstance(msg.channel, discord.DMChannel) and msg.content.isdigit() and int(msg.content) <= 2 and int(msg.content) >= 0

        def check(msg):
            return msg.author.id == ctx.author.id and isinstance(msg.channel, discord.DMChannel)

        await ctx.author.send("What script subscription is that? (0(Normal), 1(Beta), 2(Private)) NUMBER ONLY")
        try:
            subscription = await bot.wait_for("message", timeout=30, check = subscription_check)
        except Exception as e:
            return await ctx.author.send("Timed out nigga.")

        req = requests.get(f"{config['api-url']}/api/scripts",params={
            'subscription': int(subscription.content),
            'secret': config['api-secret']
        })

        data =req.json()
        if len(data) == 0:
            return await ctx.author.send("No script found.")
        
        msg = ""
        for script in data:
            msg += f"id: {script['script_id']} and name: {script['script_name']}"+"\n"
        
        await ctx.author.send(msg)
        await ctx.author.send("Please choose a script id to continue.")
        try:
            script_id = await bot.wait_for("message", timeout=30, check = check)
        except Exception as e:
            return await ctx.author.send("Timed out nigga.")

        found_script = False
        for script in data:
            if script_id.content == script['script_id']:
                found_script = True
        if not found_script:
            return await ctx.author.send("Invalid script id.")

        await ctx.author.send("Please give me the file script:")
        try:
            script_msg = await bot.wait_for("message", timeout=30, check = check)
        except Exception as e:
            return await ctx.author.send("Timed out nigga.")
        
        if len(script_msg.attachments) == 0:
            return await ctx.author.send("Please give a file, and retry.")
        
        req = requests.get(script_msg.attachments[0].url)
        with open('script.lua', 'wb') as f:
            f.write(req.content)

        embed=discord.Embed(title="Posting...", description="Processing your request please wait.", color=0x4561b0)
        embed.set_author(name="Processing", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        msg = await ctx.author.send(embed=embed)

        with open("script.lua", 'r') as f:
            content = f.read().encode('utf-8')

        req = requests.post(f"{config['api-url']}/api/scripts-change", json={ 
            "change": base64.b64encode(content).decode(),
            "subscription": int(subscription.content),
            "secret": config['api-secret'],
            'type': 'script_str',
            'script_id': script_id.content
        })

        data = req.json()

        if req.status_code == 400:
            embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
            embed.set_author(name="Error", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            return await msg.edit(embed = embed, content = "")
        else:
            embed=discord.Embed(title="Weee!", description=data['message'], color=0x26ffbe)
            embed.set_author(name="Success", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            msg = await msg.edit(embed = embed, content = "")


@bot.command()
async def blacklist(ctx, user:discord.User=None):
    role = ctx.guild.get_role(owner_role)
    if role in ctx.author.roles:
        if not user:
            return await ctx.send("Please provide a valid user.")
        embed=discord.Embed(title="Fetching...", description="Processing your request please wait.", color=0x4561b0)
        embed.set_author(name="Processing...", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        msg = await ctx.send(embed=embed)

        req = requests.post(f"{config['api-url']}/api/blacklist", json={
            "secret": config['api-secret'],
            "toggle": True,
            "discord_id": str(ctx.author.id)
        })
        data = req.json()

        if req.status_code == 400:
            embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
            embed.set_author(name="Error", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            msg = await msg.edit(embed = embed, content = "")
        else:
            embed=discord.Embed(title="Press F to pay respect.", description="Blacklisted", color=0x26ffbe)
            embed.set_author(name="Success", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            msg = await msg.edit(embed = embed, content = "")

@bot.command()
async def unblacklist(ctx, user:discord.User=None):
    role = ctx.guild.get_role(owner_role)
    if role in ctx.author.roles:
        if not user:
            return await ctx.send("Please provide a valid user.")
        embed=discord.Embed(title="Fetching...", description="Processing your request please wait.", color=0x4561b0)
        embed.set_author(name="Processing...", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        msg = await ctx.send(embed=embed)

        req = requests.post(f"{config['api-url']}/api/blacklist", json={
            "secret": config['api-secret'],
            "toggle": False,
            "discord_id": str(ctx.author.id)
        })
        data = req.json()

        if req.status_code == 400:
            embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
            embed.set_author(name="Error", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            msg = await msg.edit(embed = embed, content = "")
        else:
            embed=discord.Embed(title="Press F to pay respect.", description="Unblacklisted.", color=0x26ffbe)
            embed.set_author(name="Success", icon_url=ICON_URL)
            embed.set_footer(text="Epico Whitelist Bot")

            msg = await msg.edit(embed = embed, content = "")

@bot.command()
async def getscript(ctx):
    embed=discord.Embed(title="Fetching...", description="Processing your request please wait.", color=0x4561b0)
    embed.set_author(name="Processing", icon_url=ICON_URL)
    embed.set_footer(text="Epico Whitelist Bot")
    msg = await ctx.send(embed=embed)

    req = requests.get(f"{config['api-url']}/api/users", params={
        "discord_id":str(ctx.author.id),
        "secret": config['api-secret']
    })

    data = req.json()
    if req.status_code == 400:
        embed=discord.Embed(title="Oops!", description=data['message'], color=0x661a1a)
        embed.set_author(name="Error", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        return await msg.edit(embed = embed, content = "")
    else:
        embed=discord.Embed(title="Weee!", description="Sent the script into your DM's!", color=0x26ffbe)
        embed.set_author(name="Success", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")

        msg = await msg.edit(embed = embed, content = "")

        embed=discord.Embed(title="Weee!", description="Here is your script!", color=0x26ffbe)
        embed.set_author(name="Success", icon_url=ICON_URL)
        embed.set_footer(text="Epico Whitelist Bot")
        embed.add_field(name="Script",value = """```lua
local Object = {
    key = '"""+data['key']+"""',
    version = 0 -- 2 is Private
}
getgenv().Object = Object
loadstring(game:HttpGet("https://abyss.best/assets/script"))()
```""")

        await ctx.author.send(embed = embed, content = "")



@bot.event
async def on_ready():
    print('Logged in as')
    print(bot.user.name)
    print(bot.user.id)
    print('------')

if __name__ == '__main__':
    bot.run(config['token'])
