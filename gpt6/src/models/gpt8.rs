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

fn answer_question(input: &str) -> Option<Gpt8Result> {
    if !input.ends_with('?') {
        return None;
    }

    let input = input.trim_end_matches('?').to_lowercase();
    if input.contains("welche") {
        return Some(select(
            &[
                "Naja das kann man nicht so genau sagen.",
                "Alle, denn sie sind gleich wichtig.",
                "Keine.",
                "Das kommt darauf an.",
                "Ich weiß es nicht.",
                "Einige auf jeden Fall.",
            ],
            "Question.Which",
        ));
    }

    None
}

static FAILURE_RESPONSES: &[&str] = &[
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
