import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {Curdy} from '../target/types/curdy'

import idl from '../target/idl/voter.json'

const curdyProgramAddress = new PublicKey('GpCjJo1DqXs4qPkiCW7DaX8ggxVKTvczDLZ7Rk3uCRbu')

describe('curdy', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Curdy as Program<Curdy>

  const curdyKeypair = Keypair.generate()

  it('Initialize Curdy', async () => {
    await program.methods
      .initialize()
      .accounts({
        curdy: curdyKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([curdyKeypair])
      .rpc()

    const currentCount = await program.account.curdy.fetch(curdyKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Curdy', async () => {
    await program.methods.increment().accounts({ curdy: curdyKeypair.publicKey }).rpc()

    const currentCount = await program.account.curdy.fetch(curdyKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Curdy Again', async () => {
    await program.methods.increment().accounts({ curdy: curdyKeypair.publicKey }).rpc()

    const currentCount = await program.account.curdy.fetch(curdyKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Curdy', async () => {
    await program.methods.decrement().accounts({ curdy: curdyKeypair.publicKey }).rpc()

    const currentCount = await program.account.curdy.fetch(curdyKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set curdy value', async () => {
    await program.methods.set(42).accounts({ curdy: curdyKeypair.publicKey }).rpc()

    const currentCount = await program.account.curdy.fetch(curdyKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the curdy account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        curdy: curdyKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.curdy.fetchNullable(curdyKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
