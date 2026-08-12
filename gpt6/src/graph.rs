use crate::info;
use dh::{ReadVal, WriteVal};
use rand::RngExt;
use std::{collections::HashMap, error::Error, fs::File};
use zstd::stream::{read::Decoder, write::Encoder};

pub enum Model {
    Gpt6,
    Gpt69Turbo,
}

#[derive(Debug)]
pub struct Graph {
    pub gpt6: HashMap<u32, Vec<Freq>>,
    pub gpt69_turbo: HashMap<(u32, u32), Vec<Freq>>,
}

impl Graph {
    pub fn new_empty() -> Self {
        Graph {
            gpt6: HashMap::new(),
            gpt69_turbo: HashMap::new(),
        }
    }

    pub fn add(&mut self, from: (u32, u32), to: u32, count: u32) {
        self.gpt6.entry(from.1).or_default().push(Freq {
            token: to,
            freq: count,
        });
        self.gpt69_turbo.entry(from).or_default().push(Freq {
            token: to,
            freq: count,
        });
    }

    pub fn connect(&mut self, from: (u32, u32), to: u32) {
        let entry = self.gpt6.entry(from.1).or_default();
        if let Some(freq) = entry.iter_mut().find(|f| f.token == to) {
            freq.freq += 1;
        } else {
            entry.push(Freq { token: to, freq: 1 });
        }

        let entry = self.gpt69_turbo.entry(from).or_default();
        if let Some(freq) = entry.iter_mut().find(|f| f.token == to) {
            freq.freq += 1;
        } else {
            entry.push(Freq { token: to, freq: 1 });
        }
    }

    pub fn resolve(&self, from: (u32, u32), model: &Model) -> Option<&Vec<Freq>> {
        match model {
            Model::Gpt6 => self.gpt6.get(&from.1),
            Model::Gpt69Turbo => self.gpt69_turbo.get(&from),
        }
    }

    pub fn weights(&self, from: (u32, u32), model: &Model) -> Vec<(u32, f64)> {
        if let Some(freqs) = self.resolve(from, model) {
            freqs
                .iter()
                .map(|f| (f.token, (f.freq as f64 + 1.0).log2()))
                .collect()
        } else {
            vec![]
        }
    }

    pub fn weighted_resolve(&self, from: (u32, u32), model: &Model) -> Option<u32> {
        let weights = self.weights(from, model);
        if weights.is_empty() {
            return None;
        }
        let total: f64 = weights.iter().map(|(_, w)| w).sum();
        if total == 0.0 {
            return None;
        }
        let random_value = rand::rng().random_range(0.0..total);
        let mut cumul = 0.0;
        for (token, weight) in weights {
            cumul += weight;
            if random_value < cumul {
                return Some(token);
            }
        }
        None
    }

    pub fn len(&self) -> usize {
        self.gpt69_turbo.len()
    }

    pub fn save(&self) -> Result<(), Box<dyn Error>> {
        info("Saving graph to graph.dat.zst...");
        let mut file = File::create("graph.dat.zst")?;
        let mut encoder = Encoder::new(&mut file, 9)?;
        for ((from_a, from_b), to_list) in &self.gpt69_turbo {
            encoder.write_vu8(*from_a as u128)?;
            encoder.write_vu8(*from_b as u128)?;
            encoder.write_vu8(to_list.len() as u128)?;
            for freq in to_list {
                encoder.write_vu8(freq.token as u128)?;
                encoder.write_vu8(freq.freq as u128)?;
            }
        }
        encoder.finish()?;
        info("Graph saved successfully.");
        Ok(())
    }

    pub fn load() -> Result<Self, Box<dyn Error>> {
        info("Loading graph from graph.dat.zst...");
        let file = File::open("graph.dat.zst");
        if file.is_err() {
            info("Graph file not found. Starting with an empty graph.");
            return Ok(Graph::new_empty());
        }
        let mut file = file?;
        let mut decoder = Decoder::new(&mut file)?;
        let mut graph = Graph::new_empty();
        while let Ok(from_a) = decoder.read_vu8() {
            let from_b = decoder.read_vu8()?;
            let to_len = decoder.read_vu8()?;
            let mut to_list = Vec::with_capacity(to_len as usize);
            for _ in 0..to_len {
                let token = decoder.read_vu8()?;
                let freq = decoder.read_vu8()?;
                to_list.push(Freq {
                    token: token as u32,
                    freq: freq as u32,
                });
            }
            if let Some(entry) = graph.gpt6.get_mut(&(from_b as u32)) {
                entry.extend(to_list.iter().cloned());
            } else {
                graph.gpt6.insert(from_b as u32, to_list.clone());
            }
            graph
                .gpt69_turbo
                .insert((from_a as u32, from_b as u32), to_list);
        }
        info(&format!("Graph loaded with {} source nodes.", graph.len()));
        Ok(graph)
    }
}

#[derive(Debug, Copy, Clone)]
pub struct Freq {
    pub token: u32,
    pub freq: u32,
}
