use crate::{error, graph::Graph, info, tokens::Tokens};
use serde::Deserialize;
use std::{collections::HashMap, error::Error, fs::File};
use zstd::stream::read::Decoder;

#[derive(Debug, Deserialize)]
struct LegacyWordlist {
    pub graph: HashMap<String, Vec<(Option<String>, u32)>>,
    pub tokens: HashMap<String, String>,
}

impl LegacyWordlist {}

fn parse_legacy_id(id: Option<String>) -> u32 {
    if let Some(id) = id {
        let mut pos = id.len();
        let mut val = 0;
        while pos > 0 {
            pos -= 1;
            let char = id.as_bytes()[pos];
            let digit = match char {
                b'0'..=b'9' => (char - b'0') as u32,
                b'a'..=b'z' => (char - b'a') as u32 + 10,
                _ => {
                    error(&format!("Invalid character in legacy ID: {}", char as char));
                    0
                }
            };
            val += digit * (36u32).pow((id.len() - pos - 1) as u32);
        }
        val
    } else {
        0
    }
}

pub fn migrate() -> Result<(), Box<dyn Error>> {
    info("Looking for legacy wordlist at words.msgpack.zst...");
    let mut old = File::open("words.msgpack.zst")?;
    info("Decompressing legacy wordlist...");
    let mut decompressed = Decoder::new(&mut old)?;
    info("Parsing legacy wordlist...");
    let wordlist: LegacyWordlist = rmp_serde::from_read(&mut decompressed)?;
    let (graph, tokens) = (wordlist.graph, wordlist.tokens);
    let mut tokenlist = Tokens::new_empty();
    let tokens_len = tokens.len();
    tokens.into_iter().for_each(|(word, id)| {
        tokenlist.add(parse_legacy_id(Some(id)), word);
    });
    assert_eq!(tokenlist.len(), tokens_len);
    assert_eq!(tokenlist.tokenize(""), 0);
    info(&format!("Added {} tokens.", tokenlist.len()));
    let mut new_graph = Graph::new_empty();
    let graph_len = graph.len();
    graph.into_iter().for_each(|(from, to)| {
        let from = from
            .split_once('+')
            .map(|(a, b)| {
                (
                    parse_legacy_id(Some(a.to_string())),
                    parse_legacy_id(Some(b.to_string())),
                )
            })
            .unwrap_or((0, 0));
        let to = to
            .into_iter()
            .map(|(id, count)| (parse_legacy_id(id), count))
            .collect::<Vec<(u32, u32)>>();
        to.into_iter()
            .for_each(|(id, count)| new_graph.add(from, id, count));
    });
    assert_eq!(new_graph.len(), graph_len);
    info(&format!("Added {} source nodes.", new_graph.len()));
    info("Migration complete. Saving new data...");
    tokenlist.save()?;
    new_graph.save()?;
    Ok(())
}
