import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { useSearchParams } from 'next/navigation'
import { authOptions } from "./auth/[...nextauth]";
import { getUser } from "./thirdweb-auth/[...thirdweb]";
const zkProofAddress = '0xad7de01cb7eaaff3a419a0a0a3133a964cd90373'
export default async function grantRole(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const {query: {discordServerId, roleId}} = req
//   const searchParams = useSearchParams()
//   const discordServerId = searchParams.get('discordServerId')
//   const roleId = searchParams.get('roleId')
  // Get data from thirdweb auth, fail request if not signed in
  const user = await getUser(req);

  if (!user) {
    return res.status(401).json({ error: "Wallet not authorized!" });
  }

  // Get the Next Auth session so we can use the user ID as part of the discord API request
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  // Initialise the SDK
  const sdk = new ThirdwebSDK("polygon");

  // Check if this user owns an NFT
  const contract = await sdk.getContract(zkProofAddress);

  // Get addresses' balance of token ID 0
  console.log(contract)
  console.log(user?.address)
  //@ts-ignore
  const balance = await contract.call('balanceOf', [user?.address!]);

  if (balance.toNumber() > 0) {
    // If the user is verified and has an NFT, return the content

    // @ts-ignore
    const { userId } = session;

    console.log(userId);

    console.log(
      `https://discordapp.com/api/guilds/${discordServerId}/members/${userId}/roles/${roleId}`
    );
    const response = await fetch(
      // Discord Developer Docs for this API Request: https://discord.com/developers/docs/resources/guild#add-guild-member-role
      `https://discordapp.com/api/guilds/${discordServerId}/members/${userId}/roles/${roleId}`,
      {
        headers: {
          // Use the bot token to grant the role
          Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
        method: "PUT",
      }
    );

    // If the role was granted, return the content
    if (response.ok) {
      res.status(200).json({ message: "Role granted" });
    }

    // Something went wrong granting the role, but they do have an NFT
    else {
      const resp = await response.json();
      console.error(resp);
      res
        .status(500)
        .json({ error: "Error granting role, are you in the server?" });
    }
  }
  // If the user is verified but doesn't have an NFT, return an error
  else {
    res.status(401).json({ error: "User does not have an NFT" });
  }
}