import * as fs from "fs";

// GitClient import 
import GitClient from "./git/main"

// Commands import
import CatFile from "./git/commands/cat-file";
import HashObject from "./git/commands/hash-object";
import LsTree from "./git/commands/ls-tree";
import WriteTree from "./git/commands/write-tree";
import CommitTree from "./git/commands/commit-tree";


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
  case "ls-tree":
    handleLsTree()
    break
  case "write-tree":
    handleWriteTree()
    break
  case "commit-tree":
    handleCommitTree()
    break
  default:
    throw new Error(`Unknown command ${command}`);
}


function handleCatFile() {
  let flag: string = args[1]
  let file: string = args[2]

  if (!file || !flag) {
    return process.stdout.write("only two arguments allowed in <type> <object> mode, not 1")
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

function handleLsTree() {
  let flag: string | undefined = args[1]
  let treeHash = args[2]

  if (treeHash && flag !== "--name-only") return process.stdout.write(`unknown switch flag ${flag}, only --name-only flag is valid`)

  if (!treeHash && flag) {
    treeHash = flag
    flag = undefined
  }

  const command = new LsTree(treeHash, flag)
  gitClient.run(command)
}

function handleWriteTree() {
  const command = new WriteTree()
  gitClient.run(command)
}

function handleCommitTree() {
  const treeHash = args[1]
  const parentFlag = args[2]
  const parentHash = args[3]
  const messageFlag = args[4]
  const message = args[5]

  if (!treeHash || !messageFlag || messageFlag !== "-m" || (parentFlag && parentFlag !== "-p")) {
    return process.stdout.write("usage: commit-tree <tree> [-p <parent>] -m <message>\n")
  }

  const command = new CommitTree(treeHash, parentHash, message)
  gitClient.run(command)
}