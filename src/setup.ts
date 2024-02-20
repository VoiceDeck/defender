import { Defender } from "@openzeppelin/defender-sdk";
import config from "./config";
import { ApiError, ConfigError } from "./errors";
import { NETWORKS } from "./networks";
import { reset } from "./reset";
import { rollOut } from "./rollout";
import { updateAction, updateMonitor } from "./update";

const setup = async () => {
  const client = new Defender(config.credentials);

  const args = process.argv.slice(2);
  if (args.length < 1) {
    throw new ApiError("Missing argument: <environment>");
  }

  const environment = args[0];
  const supportedEnv = Object.keys(NETWORKS);

  if (!supportedEnv.includes(environment)) {
    throw new ApiError("Invalid environment: <environment>");
  }

  const networks = config.networks[environment as keyof typeof NETWORKS];

  // Remove all old auto tasks and sentinels
  const oldActions = await client.action.list();
  const oldMonitors = await client.monitor.list();

  let updates = false;

  if (oldActions.items.length > 0) {
    updates = true;
    await updateAction(networks);
  }

  if (oldMonitors.items.length > 0) {
    updates = true;
    await updateMonitor(networks);
  }

  if (!updates) {
    // Delete all sentinels and tasks first
    await reset();

    // Error out if no networks configured.
    if (networks.length < 1) {
      throw new ConfigError("No networks specified");
    }

    await rollOut(networks);
  }
};

//eslint-disable-next-line @typescript-eslint/no-floating-promises
setup();
