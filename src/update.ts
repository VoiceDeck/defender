import { Defender } from "@openzeppelin/defender-sdk";
import { abi as HypercertMinterAbi } from "./HypercertMinterABI";
import config from "./config";
import { NetworkConfig, decodeName } from "./networks";

export const updateAction = async (networks: NetworkConfig[]) => {
  const client = new Defender(config.credentials);
  const targetNetworks = networks.map((network) => network.networkKey);

  const oldActions = await client.action.list();

  return await Promise.all([
    ...oldActions.items.map((action) => {
      // Get name and network
      const { name, networkKey } = decodeName(action.name);

      // Validate if in target networks
      if (!targetNetworks.includes(networkKey as NetworkConfig["networkKey"])) {
        return;
      }

      // Update autotask
      console.log(
        `Updating ${action.actionId} from ./build/relay/${name} on ${networkKey}`
      );

      client.action
        .updateCodeFromFolder(action.actionId, {
          path: `./build/relay/${name}`,
        })
        .then((res) => {
          console.log(`Updated ${action.actionId}`);
          console.log(res);
        })
        .catch((err) => {
          console.error(`Failed to update ${action.actionId}`);
          console.error(err);
        });
    }),
  ]);
};

export const updateMonitor = async (networks: NetworkConfig[]) => {
  const client = new Defender(config.credentials);
  const targetNetworks = networks.map((network) => network.networkKey);

  const oldMonitors = await client.monitor.list();

  return await Promise.all([
    ...oldMonitors.items.map((monitor) => {
      // Get name and network
      const { name, networkKey, contract } = decodeName(monitor.name);

      // Validate if in target networks

      let address: string | undefined;
      let abi: any;

      if (!targetNetworks.includes(networkKey as NetworkConfig["networkKey"])) {
        return;
      }
      const network = networks.find(
        (network) => network.networkKey === networkKey
      );

      if (contract === "minter") {
        address = network?.hypercertMinterContractAddress;
        abi = HypercertMinterAbi;
      }

      if (!address) {
        console.error(`No address found for ${monitor.monitorId}`);
        return;
      }
      if (!abi) {
        console.error(`No abi found for ${monitor.monitorId}`);
        return;
      }

      // Update sentinel
      console.log(
        `Updating ${monitor.monitorId} from ./build/relay/${name} on ${networkKey}`
      );

      client.monitor
        .update(monitor.monitorId, {
          ...monitor,
          addresses: [address],
          abi,
        })
        .then((res) => {
          console.log(`Updated: ", ${monitor.monitorId}`);
          console.log(res);
        })
        .catch((err) => {
          console.error(`Failed to update ${monitor.monitorId}`);
          console.error(err);
        });
    }),
  ]);
};
