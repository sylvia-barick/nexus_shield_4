#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn store_hash(env: Env, hash: Symbol) {
        env.storage().instance().set(&Symbol::new(&env, "hash"), &hash);
    }

    pub fn get_hash(env: Env) -> Symbol {
        env.storage().instance().get(&Symbol::new(&env, "hash")).unwrap()
    }
}
