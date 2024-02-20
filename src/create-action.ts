import config from "./config";
import { Defender } from "@openzeppelin/defender-sdk";

// https://github.com/OpenZeppelin/defender-sdk/blob/ae13f76090f8f4da5103c3cecdadc0da87f41ade/examples/create-action/index.js
export const createTask = async (name: string, file: string) => {
  const client = new Defender(config.credentials);

  client.action.validatePath(`./build/relay/${file}`);

  return await client.action
    .create({
      name,
      encodedZippedCode: await client.action.getEncodedZippedCodeFromFolder(
        `./build/relay/${file}`
      ),
      paused: false,
      trigger: { type: "monitor-filter" },
    })
    .then((res) => {
      console.log("Created autotask", name, "with id", res.actionId);
      return res;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
};
