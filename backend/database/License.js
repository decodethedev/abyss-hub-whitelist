const License = require("../models/License");
const { getRandomString } = require("../security/random");

async function getLicenseBy(field, value) {
    const license = await License.findOne({ [field]: value });
    if (!license) {
        return null;
    }
    return license;
}

async function getLicenseByPlaceID(placeID) {
    const licenses = await License.find();
    if (!licenses) {
        return null;
    }

    var license = licenses.find(license => license.primary_place_id === placeID);

    if (!license) {
        license = licenses.find(license => license.secondary_place_ids.includes(placeID));

        if (!license) {
            return null
        }
    }

    var filePath = path.resolve(__dirname, '..') + "\\licenses\\" + license.license_id + ".enc"
    var content = fs.readFileSync(filePath, 'utf8');
    
    console.log('File is read successfully on '+ filePath);
    console.log(content)
    return content
}

async function updateLicense(filter, update) {   
    const license = await License.findOneAndUpdate(
        filter,
        update
    );
    if (!license) {
        return null;
    }
    return license;
}

async function updateLicenseString(filter, update) {   
    const license = await License.findOne(
        filter
    );
    if (!license) {
        return null;
    }
    var filePath = path.resolve(__dirname, '..') + "\\licenses\\" + license.license_id + ".enc"
    var content = fs.writeFileSync(filePath, update, 'utf8');
    
    return license;
}

async function getAllLicenses() {
    const licenses = await License.find();
    if (!licenses) {
        return null;
    }
    return licenses;
}

async function deleteLicenseByID(license_id) {
    const license = await License.findOneAndDelete({ license_id: license_id });
    if (!license) {
        return null;
    }
    return license;
}

async function createLicense(
    created_by,
    subscription,
    use_left = 1,
) {
    const license = new License({
        created_by: created_by,
        subscription: subscription,
        key: getRandomString(64),
        use_left:use_left,
    });

    await license.save();
    console.log("Created license " + license._id);
    return license;
}

module.exports = {getAllLicenses, deleteLicenseByID, updateLicenseString ,createLicense, getLicenseBy, updateLicense, getLicenseByPlaceID};