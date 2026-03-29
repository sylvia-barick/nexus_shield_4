#![cfg(test)]
use super::{NexusVault, NexusVaultClient, TokenClient};
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct MockToken;

#[contractimpl]
impl MockToken {
    pub fn mint(env: Env, to: Address, amount: i128) {
        let balance: i128 = env.storage().instance().get(&to).unwrap_or(0);
        env.storage().instance().set(&to, &(balance + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let balance_from: i128 = env.storage().instance().get(&from).unwrap_or(0);
        let balance_to: i128 = env.storage().instance().get(&to).unwrap_or(0);
        env.storage().instance().set(&from, &(balance_from - amount));
        env.storage().instance().set(&to, &(balance_to + amount));
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().instance().get(&id).unwrap_or(0)
    }
}

#[test]
fn test_inter_contract_mint_and_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    // Register Vault
    let vault_id = env.register_contract(None, NexusVault);
    let vault_client = NexusVaultClient::new(&env, &vault_id);

    // Register Mock Token
    let token_id = env.register_contract(None, MockToken);
    let token_client = TokenClient::new(&env, &token_id);

    let user = Address::generate(&env);
    let amount = 1000;

    // Call NexusVault which calls MockToken internally
    // 1. Vault calls Token.mint(user, 1000)
    // 2. Vault calls Token.transfer(user, vault, 1000)
    vault_client.mint_and_deposit(&user, &token_id, &amount);

    // Verify token balances via inter-contract effects
    assert_eq!(token_client.balance(&user), 0);
    assert_eq!(token_client.balance(&vault_id), 1000);

    // Verify vault internal state
    assert_eq!(vault_client.get_vault_balance(), 1000);
}
