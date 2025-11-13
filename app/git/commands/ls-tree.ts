import path from "path"
import fs from "fs"
import zlib from "zlib"

class LsTree {
    private hash: string
    private flag: string | undefined
    constructor(hash: string, flag?: string) {
        this.hash = hash
        this.flag = flag
    }

    execute() {
        const flag = this.flag
        const hash = this.hash

        const folder = hash.substring(0, 2)
        const file = hash.substring(2)

        const filePath = path.join(process.cwd(), ".git", "objects", folder, file)

        if (!fs.existsSync(filePath)) return process.stdout.write("Invalid hash")

        const encryptedContent = fs.readFileSync(filePath)

        const content = zlib.inflateSync(encryptedContent)

        // content layout: "tree <size>\0" followed by entries
        // each entry: "<mode> <filename>\0" + 20-byte SHA1 (binary)
        const firstNull = content.indexOf(0)
        const type = content.toString().substring(0, content.indexOf(" "))
        if (type !== "tree") return process.stdout.write("Invalid a tree")
        if (firstNull === -1) return process.stdout.write('Invalid tree object')

        const entriesBuffer = content.slice(firstNull + 1)

        const lines: string[] = []
        let offset = 0

        while (offset < entriesBuffer.length) {
            // read mode up to space
            const spaceIndex = entriesBuffer.indexOf(0x20 /* space */, offset)
            if (spaceIndex === -1) break
            const mode = entriesBuffer.slice(offset, spaceIndex).toString()

            // read filename up to NUL
            const nulIndex = entriesBuffer.indexOf(0x00, spaceIndex + 1)
            if (nulIndex === -1) break
            const name = entriesBuffer.slice(spaceIndex + 1, nulIndex).toString()

            // read 20-byte SHA1 binary
            const shaStart = nulIndex + 1
            const shaEnd = shaStart + 20
            if (shaEnd > entriesBuffer.length) break
            const shaBin = entriesBuffer.slice(shaStart, shaEnd)
            const shaHex = shaBin.toString('hex')

            // determine type from mode (040000 / 40000 -> tree)
            const type = (mode === '40000' || mode === '040000') ? 'tree' : 'blob'

            flag ? lines.push(`${name}`) : lines.push(`${mode} ${type} ${shaHex}\t${name}`)

            offset = shaEnd
        }

        return process.stdout.write(lines.join('\n') + '\n')
    }
}

export default LsTree