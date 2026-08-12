use rand::random_range;

pub type Gpt8Result = (String, Vec<(String, f64)>);

fn select(responses: &[&str], mode: &str) -> Gpt8Result {
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
    "Wikipedia EN",
    "TU Dortmund",
    "YouTube",
    "StackOverflow",
    "Reddit",
    "Twitter",
    "Moodle",
];

fn add_sources(r: Gpt8Result) -> Gpt8Result {
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

fn answer_question(input: &str) -> Option<Gpt8Result> {
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

    None
}

const FAILURE_RESPONSES: &[&str] = &[
    include_str!("../../assets/gpt8/fail_0.txt"),
    include_str!("../../assets/gpt8/fail_1.txt"),
    include_str!("../../assets/gpt8/fail_2.txt"),
];

pub fn gpt8(input: &str) -> Gpt8Result {
    let input = input
        .split(' ')
        .enumerate()
        .filter(|(i, s)| *i != 0 && !s.is_empty())
        .map(|(_, s)| s)
        .collect::<Vec<_>>()
        .join(" ");

    if let Some(result) = answer_question(&input) {
        return result;
    }

    select(FAILURE_RESPONSES, "Fail")
}
