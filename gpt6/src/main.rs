use std::{env::args, error::Error};

mod commands;
mod graph;
mod tokens;

fn main() {
    handle(commands::exec(
        args()
            .collect::<Vec<String>>()
            .get(1)
            .map(String::as_str)
            .unwrap_or(""),
    ));
}

pub fn warn(message: &str) {
    eprintln!("\x1b[0;33m[WARN]\x1b[0m {}", message);
}

pub fn info(message: &str) {
    eprintln!("\x1b[0;34m[INFO]\x1b[0m {}", message);
}

pub fn error(message: &str) {
    eprintln!("\x1b[0;31m[ERROR]\x1b[0m {}", message);
}

pub fn handle<T>(err: Result<T, Box<dyn Error>>) -> T {
    if let Err(err) = err {
        error(&err.to_string());
        std::process::exit(1);
    }
    err.unwrap()
}
