// 4 types of flags
// -e: check if <obj> exist
// -p: pretty-print <obj> content
// -t: show obj type (blob, tree, commit, tag, ...)
// -s: show object size

import path from "path";
import * as fs from "fs";
import zlib from "zlib";

class CatFile {
    private flag: string;
    private file: string;
    constructor(file: string, flag: string) {
        this.flag = flag
        this.file = file
    }

    run() {
        const flag = this.flag
        const file = this.file

        const filePath = path.join(process.cwd(), ".git", "objects", file.slice(0, 2), file.slice(2))

        if (!fs.existsSync(filePath)) throw new Error(`Not a valid object name ${file}`)

        const contentBuffer = fs.readFileSync(filePath)

        const content = zlib.inflateSync(contentBuffer).toString("utf-8")

        switch (flag) {
            case "-p":
                process.stdout.write(content.substring(content.indexOf("\0") + 1))
                break;
            case "-t":
                const typeOfBlob = content.substring(0, content.indexOf(" "))
                process.stdout.write(typeOfBlob)
                break;
            case "-s":
                const sizeOfBlob = content.substring(content.indexOf(" ") + 1, content.indexOf("\0"))
                process.stdout.write(sizeOfBlob)
                break
            default:
                throw new Error(`Unknown flag ${flag}`)
        }
    }
}

export default CatFile