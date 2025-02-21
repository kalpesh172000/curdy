// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CurdyIDL from '../target/idl/curdy.json'
import type { Curdy } from '../target/types/curdy'

// Re-export the generated IDL and type
export { Curdy, CurdyIDL }

// The programId is imported from the program IDL.
export const CURDY_PROGRAM_ID = new PublicKey(CurdyIDL.address)

// This is a helper function to get the Curdy Anchor program.
export function getCurdyProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...CurdyIDL, address: address ? address.toBase58() : CurdyIDL.address } as Curdy, provider)
}

// This is a helper function to get the program ID for the Curdy program depending on the cluster.
export function getCurdyProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Curdy program on devnet and testnet.
      return new PublicKey('G4ZHFNLaXF33RDfhdRNokethirDzgYJfTQYwWp34L4iM')
    case 'mainnet-beta':
    default:
      return CURDY_PROGRAM_ID
  }
}
