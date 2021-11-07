use anchor_lang::prelude::*;

declare_id!("BS4U4Dj4fr1UQQ15Ehu9sADe9jRjZ3c4doAWiH2qFq64");

#[program]
pub mod epicproject {
  use super::*;
  pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
    Ok(())
  }
}

#[derive(Accounts)]
pub struct StartStuffOff {}
