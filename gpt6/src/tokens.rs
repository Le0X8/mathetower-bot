use crate::info;
use dh::{ReadVal, WriteVal};
use std::{collections::HashMap, error::Error, fs::File};
use zstd::stream::{read::Decoder, write::Encoder};

#[derive(Debug)]
pub struct Tokens {
    words: Vec<String>,
    tokens: HashMap<String, u32>,
}

impl Tokens {
    pub fn new_empty() -> Self {
        Tokens {
            words: vec![],
            tokens: HashMap::new(),
        }
    }

    pub fn add(&mut self, id: u32, word: String) -> u32 {
        let mut id = id;
        let mut word = word;
        if word.is_empty() || &word == "\0" {
            id = 0;
            word = String::new();
        }
        if self.words.len() < (id + 1) as usize {
            self.words.resize_with((id + 1) as usize, String::new)
        };
        self.words[id as usize] = word.clone();
        self.tokens.insert(word, id);
        id
    }

    pub fn resolve(&self, id: u32) -> Option<&String> {
        self.words.get(id as usize)
    }

    pub fn tokenize(&mut self, word: &str) -> u32 {
        if let Some(token) = self.tokens.get(word).copied() {
            token
        } else {
            self.add(self.words.len() as u32, word.to_string())
        }
    }

    pub fn save(&self) -> Result<(), Box<dyn Error>> {
        info("Saving tokens to tokens.dat.zst...");
        let mut file = std::fs::File::create("tokens.dat.zst")?;
        let mut encoder = Encoder::new(&mut file, 9)?;
        self.words.iter().for_each(|word| {
            encoder.write_vu8(word.len() as u128).unwrap();
            encoder.write_str(word.clone()).unwrap();
        });
        encoder.finish()?;
        info("Tokens saved successfully.");
        Ok(())
    }

    pub fn load() -> Result<Self, Box<dyn Error>> {
        info("Loading tokens from tokens.dat.zst...");
        let file = File::open("tokens.dat.zst");
        if file.is_err() {
            info("No tokens.dat.zst found, starting with empty token list.");
            return Ok(Self::new_empty());
        }
        let mut file = file?;
        let mut decoder = Decoder::new(&mut file)?;
        let mut tokens = Self::new_empty();
        let mut id = 0;
        while let Ok(len) = decoder.read_vu8() {
            let word = decoder.read_str(len as usize)?;
            tokens.add(id, word.clone());
            id += 1;
        }
        info(&format!("Loaded {} tokens.", tokens.len()));
        Ok(tokens)
    }

    pub fn len(&self) -> usize {
        self.words.len()
    }
}
