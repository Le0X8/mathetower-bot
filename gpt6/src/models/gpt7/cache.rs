use std::collections::HashMap;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Gpt7Cache(HashMap<String, String>);

impl Gpt7Cache {
    pub fn load() -> Self {
        let path = "gpt7_cache.json";
        if let Ok(data) = std::fs::read_to_string(path)
            && let Ok(cache) = serde_json::from_str(&data)
        {
            return cache;
        }
        Gpt7Cache(HashMap::new())
    }

    pub fn save(&self) {
        let path = "gpt7_cache.json";
        if let Ok(data) = serde_json::to_string(self) {
            let _ = std::fs::write(path, data);
        }
    }

    pub fn get(&self, key: &(String, String)) -> Option<&String> {
        let key = format!("{}:{}", key.0, key.1);
        self.0.get(&key)
    }

    pub fn set(&mut self, key: (String, String), value: String) {
        let key = format!("{}:{}", key.0, key.1);
        self.0.insert(key, value);
        self.save();
    }
}
