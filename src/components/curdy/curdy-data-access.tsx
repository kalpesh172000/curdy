import { getCurdyProgram, getCurdyProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useCurdyProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCurdyProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCurdyProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['curdy', 'all', { cluster }],
    queryFn: () => program.account.curdy.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['curdy', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ curdy: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useCurdyProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCurdyProgram()

  const accountQuery = useQuery({
    queryKey: ['curdy', 'fetch', { cluster, account }],
    queryFn: () => program.account.curdy.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['curdy', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ curdy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['curdy', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ curdy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['curdy', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ curdy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['curdy', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ curdy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
