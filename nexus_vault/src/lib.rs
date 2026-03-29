#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

// Nexus Token Client interface for inter-contract calls
#[soroban_sdk::contractclient(name = "TokenClient")]
pub trait Token {
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
    fn balance(env: Env, id: Address) -> i128;
    fn mint(env: Env, to: Address, amount: i128);
}

#[contract]
pub struct NexusVault;

#[contractimpl]
impl NexusVault {
    /// Deposits tokens from the user into the vault using an INTER-CONTRACT CALL to the token contract.
    pub fn deposit(env: Env, from: Address, token_id: Address, amount: i128) {
        from.require_auth();
        
        let client = TokenClient::new(&env, &token_id);
        
        // --- INTER-CONTRACT CALL: TRANSFER ---
        client.transfer(&from, &env.current_contract_address(), &amount);
        
        let vault_bal_key = Symbol::new(&env, "vault_bal");
        let current_vault_balance = env.storage().instance().get(&vault_bal_key).unwrap_or(0);
        env.storage().instance().set(&vault_bal_key, &(current_vault_balance + amount));
    }

    /// Comprehensive interaction test: Vault → calls Token (Mint) → calls Token (Transfer)
    /// This demonstrates a multi-call inter-contract flow.
    pub fn mint_and_deposit(env: Env, from: Address, token_id: Address, amount: i128) {
        from.require_auth();
        let client = TokenClient::new(&env, &token_id);

        // --- INTER-CONTRACT CALL 1: MINT ---
        client.mint(&from, &amount);

        // --- INTER-CONTRACT CALL 2: TRANSFER ---
        client.transfer(&from, &env.current_contract_address(), &amount);

        let vault_bal_key = Symbol::new(&env, "vault_bal");
        let current_vault_balance = env.storage().instance().get(&vault_bal_key).unwrap_or(0);
        env.storage().instance().set(&vault_bal_key, &(current_vault_balance + amount));
    }

    /// Returns the total balance stored in the vault
    pub fn get_vault_balance(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "vault_bal")).unwrap_or(0)
    }
}

mod test;
