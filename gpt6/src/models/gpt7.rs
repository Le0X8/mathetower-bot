use std::time::SystemTime;

use rand::random_range;

pub type Gpt7Result = (String, Vec<(String, f64)>);

fn select(responses: &[&str], mode: &str) -> Gpt7Result {
    let index = random_range(0..responses.len());
    let mut weights = responses
        .iter()
        .take(24)
        .enumerate()
        .map(|(i, _)| (format!("Preset #{i}"), 1.0))
        .collect::<Vec<_>>();
    weights.push((format!("<Mode:{}>", mode), 0.0));
    (responses[index].to_string(), weights)
}

const SOURCES: &[&str] = &[
    "Wikipedia",
    "TU Dortmund",
    "YouTube",
    "StackOverflow",
    "Reddit",
    "Twitter",
    "Moodle",
    "Deutsche Bahn",
    "Arch Wiki",
    "Turning Point USA",
    "Pornhub",
    "gov.il",
    "Polizei NRW",
    "GitHub",
    "Charlie Kirk",
    "Elon Musk",
    "Grok",
    "Grokipedia",
];

fn add_sources(r: Gpt7Result) -> Gpt7Result {
    let mut text = r.0;
    let source_count = random_range(0..3);
    if source_count > 0 {
        text.push_str("\n-# Sources: ");
    }
    let mut sources = vec![];
    for _ in 0..source_count {
        let source = SOURCES[random_range(0..SOURCES.len())];
        let domain = source
            .to_lowercase()
            .replace(|c: char| !c.is_ascii_alphanumeric(), "-");
        let path = text[0..text.len().min(20)].replace(|c: char| !c.is_ascii_alphanumeric(), "-");

        sources.push(format!(
            "[{}](https://{}.com.example/{})",
            source, domain, path
        ));
    }
    text.push_str(&sources.join(", "));
    (text, r.1)
}

fn answer_nick(words: &[&str], words_esc: &[String]) -> Option<Gpt7Result> {
    let pos = words_esc.iter().position(|w| w == "nick");
    if let Some(pos) = pos {
        return Some((
            format!(
                "Did you mean \"{}\"?",
                words
                    .iter()
                    .enumerate()
                    .map(|(i, w)| { if i == pos { "_**Laura**_" } else { w } })
                    .collect::<Vec<_>>()
                    .join(" ")
            ),
            vec![("<Mode:Nick>".to_string(), 1.0)],
        ));
    }
    None
}

fn answer_question(input: &str) -> Option<Gpt7Result> {
    if !input.ends_with('?') {
        return None;
    }

    let input = input.trim_end_matches('?').to_lowercase();
    if input.contains("welche") {
        return Some(add_sources(select(
            &[
                "Naja das kann man nicht so genau sagen.",
                "Alle, denn sie sind gleich wichtig.",
                "Keine.",
                "Das kommt darauf an.",
                "Ich weiß es nicht.",
                "Einige auf jeden Fall.",
            ],
            "Question.Which",
        )));
    }
    if input.contains("wann") {
        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        return Some(add_sources(select(
            &[
                "Jetzt.",
                "Gleich, hab mal bisschen Geduld junge",
                "Nothing ever happens",
                // bis 5 min
                format!("<t:{}:R>", random_range(now..(now + 300))).as_str(),
                // bis 1h
                format!("<t:{}:R>", random_range(now..(now + 3600))).as_str(),
                // bis 1w
                format!("<t:{}:R>", random_range(now..(now + 604800))).as_str(),
                format!("<t:{}:F>", random_range(now..(now + 604800))).as_str(),
                // bis 1m
                format!("<t:{}:R>", random_range(now..(now + 2592000))).as_str(),
                format!("<t:{}:F>", random_range(now..(now + 2592000))).as_str(),
                // 1900-2200
                format!("<t:{}:R>", random_range(-2208988800i64..7258118400)).as_str(),
                format!("<t:{}:F>", random_range(-2208988800i64..7258118400)).as_str(),
            ],
            "Question.When",
        )));
    }

    None
}

const FAILURE_RESPONSES: &[&str] = &[
    include_str!("../../assets/gpt7/fail_0.txt"),
    include_str!("../../assets/gpt7/fail_1.txt"),
    include_str!("../../assets/gpt7/fail_2.txt"),
];

macro_rules! step {
    ($expr:expr) => {
        if let Some(result) = $expr {
            return result;
        }
    };
}

pub fn gpt7(input: &str) -> Gpt7Result {
    let words = input
        .split(' ')
        .enumerate()
        .filter(|(i, s)| *i != 0 && !s.is_empty())
        .map(|(_, s)| s)
        .collect::<Vec<_>>();
    let words_esc = words
        .iter()
        .map(|s| s.to_lowercase().replace(|c: char| !c.is_alphanumeric(), ""))
        .collect::<Vec<_>>();
    let input = words.join(" ");

    step!(answer_nick(&words, &words_esc));
    step!(answer_question(&input));

    select(FAILURE_RESPONSES, "Fail")
}
