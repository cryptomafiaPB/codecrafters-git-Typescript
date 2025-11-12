import * as fs from "fs";

// GitClient import 
import GitClient from "./git/main"

// Commands import
import CatFile from "./git/commands/cat-file";
import HashObject from "./git/commands/hash-object";


const gitClient = new GitClient()

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "init":
    // You can use print statements as follows for debugging, they'll be visible when running tests.
    console.error("Logs from your program will appear here!");

    // TODO: Uncomment the code below to pass the first stage
    fs.mkdirSync(".git", { recursive: true });
    fs.mkdirSync(".git/objects", { recursive: true });
    fs.mkdirSync(".git/refs", { recursive: true });
    fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
    console.log("Initialized git directory");
    break;
  case "cat-file":
    handleCatFile()
    break;
  case "hash-object":

    handleHashObject()
    break

  default:
    throw new Error(`Unknown command ${command}`);
}


function handleCatFile() {
  let flag: string = args[1]
  let file: string = args[2]

  if (!file || !flag) {
    throw new Error("only two arguments allowed in <type> <object> mode, not 1")
  }

  const command = new CatFile(file, flag)

  gitClient.run(command)

}

function handleHashObject() {
  let flag: string | undefined = args[1]
  let file: string = args[2]

  if (!file) {
    file = flag
    flag = undefined
  }

  const command = new HashObject(file, flag)
  gitClient.run(command)
}