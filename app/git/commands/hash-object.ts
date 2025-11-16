import path from "path"
import fs from "fs"
import crypto from "crypto"
import zlib from "zlib"

class HashObject {
    private file: string
    private flag: string | undefined

    constructor(file: string, flag?: string | undefined) {
        this.file = file
        this.flag = flag
    }

    execute() {
        const file = this.file
        const flag = this.flag

        // locate the file 
        const filePath = path.join(process.cwd(), file)

        if (!fs.existsSync(filePath)) return process.stdout.write(`could not open '${filePath}' for reading: No such file or directory`)
        // read content
        const content = fs.readFileSync(filePath)
        // assemble content `blob <size>\0<content>`
        const assembledContent = `blob ${content.length}\0${content}`
        // create hash of uncompressed content hash = compress-SHA1(assembleContent)
        const hash = crypto.hash('sha1', assembledContent)
        // if not -w flag return compress-SHA1(assembleContent)
        if (!flag) {
            return process.stdout.write(hash)
        }
        // else 
        // create hash[0,2] folder and , hash[2, hash.length] file
        const folder = path.join(process.cwd(), '.git', 'objects', hash.substring(0, 2))
        const blobFile = hash.substring(2)
        // console.log({ folder, blobFile })
        //  hash[2::] = zlib.deflate(assembleContent)
        const contentBuffer = Buffer.concat([Buffer.from(`blob ${content.length}\0`), Buffer.from(content)])
        const compressedContent = zlib.deflateSync(contentBuffer)

        // create a folder
        if (!fs.existsSync(folder)) fs.mkdirSync(folder)
        // create a file
        fs.writeFileSync(path.join(folder, blobFile), compressedContent, { flag: 'wx' })
        return process.stdout.write(hash)
    }
}

export default HashObject