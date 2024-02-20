import config from "./config.js";
import { NetworkConfig } from "./networks";
import { Defender } from "@openzeppelin/defender-sdk";

// eventConditions: [
//   {
//     eventSignature: 'OwnershipTransferred(address,address)',
//     expression: 'previousOwner=0x0f06aB75c7DD497981b75CD82F6566e3a5CAd8f2',
//   },
//   { eventSignature: 'Transfer(address,address,uint256)' },
// ],
export type EventCondition = {
  eventSignature: string;
  expression?: string;
};

//  functionConditions: [{ functionSignature: 'renounceOwnership()' }],
export type FunctionCondition = {
  functionSignature: string;
};

export const createSentinel = async ({
  name,
  network,
  actionId,
  functionConditions = [],
  eventConditions = [],
  contractAddress,
  abi,
}: {
  name: string;
  network: NetworkConfig;
  actionId: string;
  eventConditions?: EventCondition[];
  functionConditions?: FunctionCondition[];
  contractAddress: string;
  abi: any;
}) => {
  const client = new Defender(config.credentials);

  const monitor = await client.monitor
    .create({
      type: "BLOCK",
      network: network.networkKey,
      confirmLevel: 1, // if not set, we pick the blockwatcher for the chosen network with the lowest offset
      name,
      addresses: [contractAddress],
      abi,
      paused: false,
      eventConditions,
      functionConditions,
      alertTimeoutMs: 0,
      notificationChannels: [],
      actionCondition: actionId,
    })
    .then((res) => {
      console.log(
        `Created sentinel`,
        res.name,
        "- monitoring address",
        contractAddress,
        "- linked to action",
        actionId
      );
      return res;
    })
    .catch((error) => {
      console.error(error);
    });
};
