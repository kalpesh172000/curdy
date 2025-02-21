import { getCurdyProgram, getCurdyProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { title } from 'node-stdlib-browser/mock/process'

interface CreateEntryArgs {
    title: string
    message: string
    owner: PublicKey
}

export function useCurdyProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getCurdyProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getCurdyProgram(provider, programId), [provider, programId])

    const accounts = useQuery({
        queryKey: ['curdy', 'all', { cluster }],
        queryFn: () => program.account.journalEntry.all(),
    })

    const getProgramAccount = useQuery({
        queryKey: ['get-program-account', { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    })

    const createEntry = useMutation<string, Error, CreateEntryArgs>({
        mutationKey: ['journalEntry', 'create', { cluster }],
        mutationFn: async ({ title, message }) => {
            return program.methods.createJournalEntry(title, message).rpc()
        },
        onSuccess: (signiture) => {
            transactionToast(signiture)
            accounts.refetch()
        },
        onError: (error) => {
            toast.error(`Error creating the journal entry : ${error.message}`)
        },
    })

    return {
        program,
        programId,
        accounts,
        getProgramAccount,
        createEntry,
    }
}

export function useCurdyProgramAccount({ account }: { account: PublicKey }) {
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const { program, accounts } = useCurdyProgram()

    const accountQuery = useQuery({
        queryKey: ['curdy', 'fetch', { cluster, account }],
        queryFn: () => program.account.journalEntry.fetch(account),
    })

    const updateEntry = useMutation<string, Error, CreateEntryArgs>({
        mutationKey: ['journalEntry', 'update', { cluster }],
        mutationFn: async ({ title, message }) => {
            return program.methods.updateJornalEntry(title, message).rpc()
        },
        onSuccess: (signiture) => {
            transactionToast(signiture)
            accounts.refetch()
        },
        onError: (error) => {
            toast.error(`Error Updating the journy entry : ${error.message}`)
        },
    })

    const deleteEntry = useMutation<string, Error, CreateEntryArgs>({
        mutationKey: ['journalEntry', 'delete', { cluster }],
        mutationFn: ({ title }) => {
            return program.methods.deleteJournalEntry(title).rpc()
        },
        onSuccess: (signiture) => {
            transactionToast(signiture)
            accounts.refetch()
        },
        onError: (error) => {
            toast.error(`Error deleting the entry : ${error.message}`)
        },
    })

    return {
        accountQuery,
        updateEntry,
        deleteEntry,
    }
}
