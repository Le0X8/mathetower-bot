use crate::{graph::Graph, tokens::Tokens, warn};
use std::error::Error;

mod migrate;
mod prompt;

pub fn exec(cmd: &str) -> Result<(), Box<dyn Error>> {
    match cmd {
        "migrate" => {
            migrate::migrate()?;
        }
        "info" => {
            let tokens = Tokens::load()?;
            let token_count = tokens.len();
            println!("Tokens stored: {}", token_count);
            println!(
                "Most recent token: {} ({})",
                token_count - 1,
                tokens.resolve(token_count as u32 - 1).unwrap()
            );
            let graph = Graph::load()?;
            println!("Source nodes stored: {}", graph.len());
        }
        "prompt" => {
            let mut tokens = Tokens::load()?;
            let mut graph = Graph::load()?;
            prompt::prompt(&mut tokens, &mut graph)?;
        }
        _ => warn("No command specified. Exiting."),
    }
    Ok(())
}
