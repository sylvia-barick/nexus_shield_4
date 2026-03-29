#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

#[contract]
pub struct NexusToken;

#[contractimpl]
impl NexusToken {
    pub fn mint(env: Env, to: Address, amount: i128) {
        if amount <= 0 { panic!("Amount must be positive"); }
        let balance: i128 = env.storage().instance().get(&to).unwrap_or(0);
        env.storage().instance().set(&to, &(balance + amount));
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().instance().get(&id).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let balance_from: i128 = env.storage().instance().get(&from).unwrap_or(0);
        if balance_from < amount { panic!("Insufficient balance"); }
        let balance_to: i128 = env.storage().instance().get(&to).unwrap_or(0);

        env.storage().instance().set(&from, &(balance_from - amount));
        env.storage().instance().set(&to, &(balance_to + amount));
    }
}
