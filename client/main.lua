local function key()local key = "Y_63#UgGBz-jsLaU&w9$5mb+h@n=bHb6"return key end
local function iv()local iv = "CWu#UD)Z<:j#cmWN" return iv end

local localplr = game:GetService("Players").LocalPlayer

local HttpService = game:GetService("HttpService")

local function enc(str)
    local enc = syn.crypt.custom.encrypt(
        "aes-cbc",
        str,
        key(),
        iv())
    return enc
end

local function dec(str)
    local enc = syn.crypt.custom.decrypt(
        "aes-cbc",
        str,
        key(),
        iv())
    return enc
end

local user_obj = {
    user_id = localplr.UserId,
    username = localplr.Name,
    place_id = game.PlaceId,
    game_job_id = game.JobId,
}

local req = syn.request({
    Method = "GET",
    Url = "https://abyss.best/api/signature",
    Headers = {
        ["abyss-data"] = enc(HttpService:JSONEncode(user_obj))
    }
})

local identifierData = HttpService:JSONDecode(req.Body)
local identifier = identifierData.identifier

local dataRequest = syn.request({
    Method = "GET",
    Url = "https://abyss.best/api/parse",
    Headers = {
        identifier = identifier
    }
});

local dataRequestData = HttpService:JSONDecode(dataRequest.Body)

-- The authentication starts here

local authRequest = syn.request({
    Method = "POST",
    Url = "https://abyss.best/api/authenticate",
    Headers = {
        ["Content-Type"] = "application/json"
    },
    Body = HttpService:JSONEncode({
        uid = Object.key,
        identifier = identifier,
        version = Object.version -- look at this private access
    })
})

local authRequestData = HttpService:JSONDecode(authRequest.Body)
local decryptedData = dec(authRequestData.data)
local data = HttpService:JSONDecode(decryptedData)

local passed = true

for i,v in pairs(user_obj) do
    if data[i] ~= v then
        passed = false
    end
end

if passed == false then
    -- data tampering detected
    print("data tampering detected")
    return
end

repeat
until passed

if authRequestData["script"] then
    local decryptedScript = dec(authRequestData["script"])
    loadstring(decryptedScript)()
    
else
    print(authRequestData['message'])
    return
end