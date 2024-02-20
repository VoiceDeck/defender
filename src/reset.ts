import config from "./config";
import { Defender } from "@openzeppelin/defender-sdk";

export const reset = async () => {
  const client = new Defender(config.credentials);

  // Remove all old auto tasks and sentinels
  const oldActions = await client.action.list();
  const oldMonitors = await client.monitor.list();

  return await Promise.all([
    ...oldActions.items.map((x) =>
      client.action.delete(x.actionId).then((res) => {
        console.log(res.message);
      })
    ),
    ...oldMonitors.items.map((x) =>
      client.monitor.delete(x.monitorId).then((res) => {
        console.log(res.message);
      })
    ),
  ]);
};
