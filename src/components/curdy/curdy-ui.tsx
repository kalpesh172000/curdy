import { Keypair, PublicKey } from '@solana/web3.js'
/* import { useMemo } from 'react' */
import { ExplorerLink } from '../cluster/cluster-ui'
import { ellipsify } from '../ui/ui-layout'
import { useCurdyProgram, useCurdyProgramAccount } from './curdy-data-access'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CurdyCreate() {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const { publicKey } = useWallet()
    const { createEntry } = useCurdyProgram()

    const isFormValid = title.trim() !== '' && message.trim() !== ''

    const handleSubmit = () => {
        if (publicKey && isFormValid) {
            createEntry.mutateAsync({ title, message, owner: publicKey })
        }
    }

    if (!publicKey) {
        return <p> Connect your wallet </p>
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full max-w-xs"
            />

            <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="textarea textarea-bordered w-full max-w-xs"
            />

            <button
                onClick={handleSubmit}
                disabled={createEntry.isPending || !isFormValid}
                className="btn btn-sm lg:btn-md btn-primary"
            >Create Journal Entry</button>
        </div>
    )
}

export function CurdyList() {
    const { accounts, getProgramAccount } = useCurdyProgram()

    if (getProgramAccount.isLoading) {
        return <span className="loading loading-spinner loading-lg"></span>
    }
    if (!getProgramAccount.data?.value) {
        return (
            <div className="alert alert-info flex justify-center">
                <span>
                    Program account not found. Make sure you have deployed the program and are on the correct cluster.
                </span>
            </div>
        )
    }
    return (
        <div className={'space-y-6'}>
            {accounts.isLoading ? (
                <span className="loading loading-spinner loading-lg"></span>
            ) : accounts.data?.length ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {accounts.data?.map((account) => (
                        <CurdyCard key={account.publicKey.toString()} account={account.publicKey} />
                    ))}
                </div>
            ) : (
                <div className="text-center">
                    <h2 className={'text-2xl'}>No accounts</h2>
                    No accounts found. Create one above to get started.
                </div>
            )}
        </div>
    )
}

function CurdyCard({ account }: { account: PublicKey }) {
    const { accountQuery, updateEntry, deleteEntry } = useCurdyProgramAccount({ account })
    const { publicKey } = useWallet()

    const title = accountQuery.data?.title
    const [message, setMessage] = useState('')

    const isFormValid = message.trim() !== ''

    const handleSubmit = () => {
        if (publicKey && isFormValid && title) {
            updateEntry.mutateAsync({ title, message, owner: publicKey })
        }
    }

    if (!publicKey) {
        return <p> Connect your wallet </p>
    }

    return accountQuery.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
    ) : (
        <div className="card card-bordered border-base-300 border-4 text-neutral-content">
            <div className="card-body items-center text-center">
                <div className="space-y-6">
                    <h2
                        className="card-title justify-center text-3xl cursor-pointer"
                        onClick={() => accountQuery.refetch()}
                    >
                        {accountQuery.data?.title}
                    </h2>
                    <p>{accountQuery.data?.message}</p>
                    <div className="card-actions justify-around">
                        <textarea
                            placeholder="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="textarea textarea-bordered w-full max-w-xs"
                        />
                        <button
                            className="btn btn-xs lg:btn-md btn-primary"
                            onClick={handleSubmit}
                            disabled={!isFormValid || updateEntry.isPending}
                        >
                            Update Journal Entry
                        </button>
                        <button
                            className="btn btn-xs lg:btn-md btn-primary"
                            onClick={() => {
                                const title = accountQuery.data?.title
                                if (title) {
                                    return deleteEntry.mutateAsync({ title, message, owner: publicKey })
                                }
                            }}
                            disabled={deleteEntry.isPending}
                        >
                            Delete Journal Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
