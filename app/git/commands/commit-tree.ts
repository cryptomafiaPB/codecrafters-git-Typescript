import crypto from "crypto"
import path from "path"
import fs from "fs"
import zlib from "zlib"

class CommitTree {
    treeHash: string
    parentHash: string
    message: string

    constructor(treeHash: string, parentHash: string, message: string) {
        this.treeHash = treeHash
        this.parentHash = parentHash
        this.message = message
    }

    execute() {
        const treeHash = this.treeHash
        const parentHash = this.parentHash
        const message = this.message

        // Construct content
        const content = `tree ${treeHash} parent ${parentHash} author Pranav Bagal <pranavbagal@zohomail.in> ${Date.now()} ${new Date().getTimezoneOffset()} committer Pranav Bagal <pranavbagal@zohomail.in> ${Date.now()} ${new Date().getTimezoneOffset()} ${message}`

        // Contruct a commit
        const commitData = Buffer.concat([Buffer.from(`commit ${content.length}\0`), Buffer.from(content)])

        // Calculate hash of commitData
        const commitHash = crypto.createHash('sha1').update(commitData).digest("hex")

        // Compress commitData
        const compressedCommitData = zlib.deflateSync(commitData)

        const folder = path.join(process.cwd(), ".git", "objects", commitHash.substring(0, 2))
        if (!fs.existsSync(folder)) fs.mkdirSync(folder)
        fs.writeFileSync(path.join(folder, commitHash.substring(2)), compressedCommitData, { flag: 'wx' })


        process.stdout.write(commitHash)
    }
}

export default CommitTree