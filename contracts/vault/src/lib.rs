#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

// Define an interface for the Nexus Token contract
pub mod token {
    soroban_sdk::contractimport!(file = "../token/target/wasm32-unknown-unknown/release/nexus_token.wasm");
}

#[contract]
pub struct NexusVault;

#[contractimpl]
impl NexusVault {
    pub fn deposit(env: Env, from: Address, token_id: Address, amount: i128) {
        from.require_auth();
        
        let client = token::Client::new(&env, &token_id);
        
        // This is an INTER-CONTRACT CALL to the Nexus Token contract
        client.transfer(&from, &env.current_contract_address(), &amount);
        
        let current_vault_balance = env.storage().instance().get(&Symbol::new(&env, "vault_bal")).unwrap_or(0);
        env.storage().instance().set(&Symbol::new(&env, "vault_bal"), &(current_vault_balance + amount));
    }

    pub fn get_vault_balance(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "vault_bal")).unwrap_or(0)
    }
}
