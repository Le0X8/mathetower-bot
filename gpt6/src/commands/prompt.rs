use rand::RngExt;

use crate::{error, graph::Graph, info, tokens::Tokens};
use std::{
    error::Error,
    fs::File,
    io::{BufRead, BufReader, Write, stdin, stdout},
};

pub fn prompt(tokens: &mut Tokens, graph: &mut Graph) -> Result<(), Box<dyn Error>> {
    let mut input = String::new();
    loop {
        print!("\0");
        stdout().flush()?;
        input.clear();
        stdin().read_line(&mut input)?;
        input = input.trim().to_string();

        // training mode
        if input == "\0" {
            train(tokens, graph).unwrap_or_else(|e| error(&e.to_string()));
            continue;
        }

        // random mode
        if input.starts_with("\x01") {
            let mut count = input
                .trim_start_matches("\x01")
                .parse::<usize>()
                .unwrap_or(rand::rng().random_range(1..255));
            count = count.clamp(1, 255);
            println!("{}", detokenize(tokens, tokens.random(count)));
            continue;
        }

        // gpt6 mode
        let filtered_input = input.replace('\x02', "");
        let strs: Vec<_> = filtered_input
            .split(' ')
            .filter(|s| !s.is_empty())
            .collect();

        let mut stream = vec![];
        if strs.is_empty() {
            stream.push(0);
        } else {
            stream.push(tokens.tokenize(strs.last().cloned().unwrap_or_default()));
        }
        if strs.len() > 1 {
            stream.insert(0, tokens.tokenize(strs[strs.len() - 2]));
        } else {
            stream.insert(0, 0);
        }

        // show weights
        if input.starts_with("\x02") {
            let mut weights = graph.weights((stream[stream.len() - 2], stream[stream.len() - 1]));
            println!("{} possible completions:", weights.len());
            weights.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
            for (token, weight) in weights.iter().take(25) {
                println!(
                    "{weight:.2}: {}",
                    if *token == 0 {
                        "<TERMINATE>".to_string()
                    } else {
                        tokens
                            .resolve(*token)
                            .cloned()
                            .unwrap_or("<TERMINATE>".to_string())
                    }
                );
            }
            continue;
        }

        complete(graph, &mut stream);
        stream.drain(0..2);
        println!("{}", detokenize(tokens, stream));
    }
}

fn complete(graph: &Graph, stream: &mut Vec<u32>) {
    let mut i = 0u8;
    while let Some(next) =
        graph.weighted_resolve((stream[stream.len() - 2], stream[stream.len() - 1]))
    {
        stream.push(next);
        if next == 0 || i == u8::MAX {
            break;
        }
        i += 1;
    }
}

fn detokenize(tokens: &Tokens, stream: Vec<u32>) -> String {
    stream
        .iter()
        .filter(|&&t| t != 0)
        .map(|&t| tokens.resolve(t).cloned().unwrap_or_default())
        .collect::<Vec<_>>()
        .join(" ")
}

fn train(tokens: &mut Tokens, graph: &mut Graph) -> Result<(), Box<dyn Error>> {
    info("Training model with dataset.txt...");
    let dataset = File::open("dataset.txt")?;
    let tokens_before = tokens.len();
    let sentences = BufReader::new(dataset)
        .lines()
        .flat_map(|line| {
            line.unwrap_or_default()
                .split(". ")
                .map(|s| s.trim().to_string())
                .collect::<Vec<_>>()
        })
        .filter(|s| !s.is_empty())
        .map(|s| {
            s.split(' ')
                .filter(|s| !s.is_empty())
                .map(|s| tokens.tokenize(s))
                .collect::<Vec<_>>()
        })
        .collect::<Vec<_>>();
    if tokens.len() > tokens_before {
        info(&format!(
            "{} new tokens detected. Saving updated tokens...",
            tokens.len() - tokens_before,
        ));
        tokens.save()?;
    }

    sentences.iter().for_each(|sentence| {
        let mut stream = vec![0, 0];
        sentence.iter().for_each(|&token| {
            stream.push(token);
            graph.connect((stream[stream.len() - 3], stream[stream.len() - 2]), token);
            stream.drain(0..1);
        });
    });
    graph.save()?;

    info("Training completed sucessfully.");
    println!();

    Ok(())
}
