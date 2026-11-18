const fs = require("fs").promises;
const path = require("path");

const dataFilePath = path.join(__dirname, "..", "data", "url.json");

async function ensureFileData() {
    try{
        await fs.access(dataFilePath)
    }catch(err){
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true});
        await fs.writeFile(dataFilePath, "[]", "utf-8");
    }
}

async function readUrls() {
    await ensureFileData()
    try{
        const fileData = await fs.readFile(dataFilePath, "utf-8")
        const parseData = JSON.parse(fileData)
        return Array.isArray(parseData) ? parseData : []
    }catch(err){
        console.log("error while reading URL", err)
        return [];
    }
}

async function writeUrls(urls) {
    await ensureFileData()
    const safeUrls = Array.isArray(urls) ? urls : [];
    const content = JSON.stringify(safeUrls, null, 2);
    await fs.writeFile(dataFilePath, content, "utf-8");
}

module.exports = {
    readUrls,
    writeUrls
}