import { createTask } from "./create-action";
import { createSentinel } from "./create-sentinel";
import { ApiError } from "./errors";
import { NetworkConfig, encodeName } from "./networks";
import { HypercertMinterAbi } from "@hypercerts-org/contracts";

export const rollOut = async (networks: NetworkConfig[]) => {
  return await Promise.all(
    networks.map(async (network) => {
      // On report created
      const autoTaskOnActionCreated = await createTask(
        encodeName(network, "minter", "on-report-created"),
        "on-report-created"
      );
      if (!autoTaskOnActionCreated) {
        throw new ApiError(
          encodeName(
            network,
            "minter",
            "Could not create autoTask for on-report-created"
          )
        );
      }
      await createSentinel({
        name: encodeName(network, "minter", "ClaimStored"),
        network: network,
        contractAddress: network.hypercertMinterContractAddress,
        abi: HypercertMinterAbi,
        eventConditions: [
          { eventSignature: "ClaimStored(uint256,string,uint256)" },
        ],
        actionId: autoTaskOnActionCreated.autotaskId,
      });
    })
  );
};
