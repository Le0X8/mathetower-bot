use crate::{error, graph::Graph, info, tokens::Tokens};
use std::{
    error::Error,
    fs::File,
    io::{BufRead, BufReader, Write, stdin, stdout},
};

pub fn prompt(tokens: &mut Tokens, graph: &mut Graph) -> Result<(), Box<dyn std::error::Error>> {
    let mut input = String::new();
    while input.len() < 256 {
        stdout().flush()?;
        input.clear();
        stdin().read_line(&mut input)?;

        if input.trim() == "\0" {
            train(tokens, graph).unwrap_or_else(|e| error(&e.to_string()));
            continue;
        }

        input = input.to_lowercase();
        let input: Vec<_> = input
            .trim()
            .split(|c: char| !matches!(c, 'a'..='z' | 'ä' | 'ö' | 'ü' | 'ß'))
            .filter(|s| !s.is_empty())
            .collect();

        let mut stream = vec![];
        if input.is_empty() {
            stream.push(0);
        } else {
            stream.push(tokens.tokenize(input.last().cloned().unwrap_or_default()));
        }
        if input.len() > 1 {
            stream.insert(0, tokens.tokenize(input[input.len() - 2]));
        } else {
            stream.insert(0, 0);
        }
        complete(graph, &mut stream);
        stream.drain(0..2);
        println!("{}", detokenize(tokens, stream));
    }
    Ok(())
}

fn complete(graph: &Graph, stream: &mut Vec<u32>) {
    while let Some(next) =
        graph.weighted_resolve((stream[stream.len() - 2], stream[stream.len() - 1]))
    {
        stream.push(next);
        if next == 0 {
            break;
        }
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
                .to_lowercase()
                .split('.')
                .map(|s| s.trim().to_string())
                .collect::<Vec<_>>()
        })
        .filter(|s| !s.is_empty())
        .map(|s| {
            s.split(|c: char| !matches!(c, 'a'..='z' | 'ä' | 'ö' | 'ü' | 'ß'))
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

    Ok(())
}
