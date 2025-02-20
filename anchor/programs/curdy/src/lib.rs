#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod curdy {
    use super::*;

  pub fn close(_ctx: Context<CloseCurdy>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.curdy.count = ctx.accounts.curdy.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.curdy.count = ctx.accounts.curdy.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeCurdy>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.curdy.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeCurdy<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Curdy::INIT_SPACE,
  payer = payer
  )]
  pub curdy: Account<'info, Curdy>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseCurdy<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub curdy: Account<'info, Curdy>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub curdy: Account<'info, Curdy>,
}

#[account]
#[derive(InitSpace)]
pub struct Curdy {
  count: u8,
}
