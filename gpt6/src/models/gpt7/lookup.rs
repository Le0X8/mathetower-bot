use super::cache::Gpt7Cache;

#[derive(serde::Deserialize)]
struct WikipediaResponse {
    extract: Option<String>,
    titles: Option<WikipediaTitles>,
}

#[derive(serde::Deserialize)]
struct WikipediaTitles {
    canonical: String,
}

pub fn lookup(text: &str, old: Option<&str>, c: &mut Gpt7Cache) -> Option<String> {
    let mut formatted = text
        .split(' ')
        .map(|s| {
            let mut v: Vec<char> = s.chars().collect();
            v[0] = v[0].to_uppercase().next().unwrap();
            v.into_iter().collect::<String>()
        })
        .collect::<Vec<_>>()
        .join("_");
    if let Some(f) = c.get(&("wikipedia-alt".to_string(), formatted.clone())) {
        formatted = f.clone();
    }
    if formatted.is_empty() {
        return None;
    }
    if let Some(cached) = c
        .get(&("wikipedia".to_string(), formatted.clone()))
        .cloned()
    {
        if let Some(old) = old {
            c.set(
                ("wikipedia-alt".to_string(), old.to_string()),
                formatted.clone(),
            );
        }
        return Some(cached.clone());
    }

    let client = reqwest::blocking::Client::new();
    let res_de: WikipediaResponse = client
        .get(format!(
            "https://de.wikipedia.org/api/rest_v1/page/summary/{formatted}"
        ))
        .header("User-Agent", "mathetower/1.0")
        .send()
        .ok()?
        .json()
        .ok()?;
    if let Some(extract) = res_de.extract {
        if let Some(old) = old {
            c.set(
                ("wikipedia-alt".to_string(), old.to_string()),
                formatted.clone(),
            );
        }
        c.set(
            ("wikipedia".to_string(), formatted.clone()),
            extract.clone(),
        );
        return Some(extract);
    }
    let res_en: WikipediaResponse = client
        .get(format!(
            "https://en.wikipedia.org/api/rest_v1/page/summary/{formatted}"
        ))
        .header("User-Agent", "mathetower/1.0")
        .send()
        .ok()?
        .json()
        .ok()?;
    if let Some(titles) = res_en.titles {
        let res_de: WikipediaResponse = client
            .get(format!(
                "https://de.wikipedia.org/api/rest_v1/page/summary/{}",
                titles.canonical
            ))
            .header("User-Agent", "mathetower/1.0")
            .send()
            .ok()?
            .json()
            .ok()?;
        if let Some(extract) = res_de.extract {
            if let Some(old) = old {
                c.set(
                    ("wikipedia-alt".to_string(), old.to_string()),
                    formatted.clone(),
                );
            }
            c.set(
                ("wikipedia".to_string(), formatted.clone()),
                extract.clone(),
            );
            return Some(extract);
        }
        let extract = res_en.extract.unwrap();
        if let Some(old) = old {
            c.set(
                ("wikipedia-alt".to_string(), old.to_string()),
                formatted.clone(),
            );
        }
        c.set(
            ("wikipedia".to_string(), formatted.clone()),
            extract.clone(),
        );
        return Some(extract);
    }
    if let Some(old) = old {
        c.set(
            ("wikipedia-alt".to_string(), old.to_string()),
            "".to_string(),
        );
        None
    } else {
        lookup(
            &text
                .split(' ')
                .enumerate()
                .map(|(i, s)| {
                    if i == 0 {
                        s.to_uppercase()
                    } else {
                        s.to_string()
                    }
                })
                .collect::<Vec<_>>()
                .join(" "),
            Some(formatted.as_str()),
            c,
        )
    }
}
