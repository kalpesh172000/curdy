#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("G4ZHFNLaXF33RDfhdRNokethirDzgYJfTQYwWp34L4iM");

#[program]
pub mod curdy {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateJournalEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        let journalentry = &mut ctx.accounts.jornalentry;
        journalentry.owner = *ctx.accounts.owner.key;
        journalentry.title = title;
        journalentry.message = message;
        Ok(())
    }

    pub fn update_jornal_entry(
        ctx: Context<UpdateJournalEntry>,
        _title: String,
        message: String,
    ) -> Result<()> {
        let journalentry = &mut ctx.accounts.jornalentry;
        journalentry.message = message;
        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteJournalEntry>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntry {
    pub owner: Pubkey,
    #[max_len(64)]
    pub title: String,
    #[max_len(256)]
    pub message: String,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + JournalEntry::INIT_SPACE,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump
    )]
    pub jornalentry: Account<'info, JournalEntry>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntry::INIT_SPACE,
        realloc::zero = true,
        realloc::payer = owner

    )]
    pub jornalentry: Account<'info, JournalEntry>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner,
    )]
    pub jornalentry: Account<'info, JournalEntry>,
    pub system_program: Program<'info, System>,
}
