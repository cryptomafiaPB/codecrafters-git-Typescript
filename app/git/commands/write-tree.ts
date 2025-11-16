import path from "path"
import fs from "fs"
import crypto from "crypto"
import zlib from "zlib"

// Helper function to write a blob object to .git/objects

function writeBlobObject(filePath: string) {
    const content = fs.readFileSync(filePath)
    const header = `blob ${content.length}\0`
    const storeContent = Buffer.concat([Buffer.from(header), content])
    const hash = crypto.createHash('sha1').update(storeContent).digest('hex')

    const folder = path.join(process.cwd(), '.git', 'objects', hash.substring(0, 2))
    const blobFile = hash.substring(2)
    const compressedContent = zlib.deflateSync(storeContent)
    if (!fs.existsSync(folder)) fs.mkdirSync(folder)
    fs.writeFileSync(path.join(folder, blobFile), compressedContent, { flag: 'wx' })
    return hash
}

class WriteTree {
    constructor() {

    }

    execute() {
        // const basePath  = path.join(process.cwd(), ".git", )

        function createTree(basePath: string) {
            const result = []
            // extract items of folder
            const items = fs.readdirSync(basePath)

            // Iterate items
            for (let item of items) {
                // Ignore .git folder
                if (item.includes(".git")) continue
                const itemPath = path.join(basePath, item)
                if (fs.statSync(itemPath).isDirectory()) {
                    const hash = createTree(basePath + "/" + item)
                    if (hash) {
                        result.push({ type: "Folder", pathName: path.join(basePath, item), hash })
                    }
                } else if (fs.statSync(itemPath).isFile()) {
                    const hash = writeBlobObject(itemPath)
                    if (hash) {
                        result.push({ type: "blob", pathName: path.join(basePath, item), hash })
                    }
                } else {
                    continue
                }
            }

            if (items.length === 0 || result.length === 0) return null

            const treeData = result.reduce((acc, entry) => {
                {
                    const mode = entry.type === "Folder" ? "40000" : "100644"
                    const line = `${mode} ${entry.pathName}\0`
                    const hashBuffer = Buffer.from(entry.hash!, 'hex')
                    acc.push(Buffer.from(line))
                    acc.push(hashBuffer)
                    return acc
                }
            }, [] as Buffer[])

            const treeContent = Buffer.concat(treeData)
            const header = `tree ${treeContent.length}\0`
            const storeContent = Buffer.concat([Buffer.from(header), treeContent])
            const treeHash = crypto.createHash('sha1').update(storeContent).digest('hex')
            const folder = path.join(process.cwd(), '.git', 'objects', treeHash.substring(0, 2))
            const treeFile = treeHash.substring(2)
            const compressedContent = zlib.deflateSync(storeContent)
            if (!fs.existsSync(folder)) fs.mkdirSync(folder)
            fs.writeFileSync(path.join(folder, treeFile), compressedContent, { flag: 'wx' })
            return treeHash
        }

        //     // create tree content
        //     let treeContentBuffers: Buffer[] = []
        //     for (let entry of result) {
        //         const mode = entry.type === "Folder" ? "40000" : "100644"
        //         const line = `${mode} ${entry.pathName}\0`
        //         const hashBuffer = Buffer.from(entry.hash!, 'hex')
        //         treeContentBuffers.push(Buffer.from(line))
        //         treeContentBuffers.push(hashBuffer)
        //     }
        //     const treeContent = Buffer.concat(treeContentBuffers)
        //     const header = `tree ${treeContent.length}\0`
        //     const storeContent = Buffer.concat([Buffer.from(header), treeContent])
        //     const treeHash = crypto.createHash('sha1').update(storeContent).digest('hex')
        //     const folder = path.join(process.cwd(), '.git', 'objects', treeHash.substring(0, 2))
        //     const treeFile = treeHash.substring(2)
        //     const compressedContent = zlib.deflateSync(storeContent)
        //     if (!fs.existsSync(folder)) fs.mkdirSync(folder)
        //     fs.writeFileSync(path.join(folder, treeFile), compressedContent, { flag: 'wx' })
        //     return treeHash
        // }
        const treeHash = createTree(process.cwd())
        return process.stdout.write(treeHash + '\n')
    }
}

export default WriteTree