import { existsSync, readFileSync, writeFileSync } from 'fs';

export function load() {
  if (!existsSync('./data.json')) {
    writeFileSync('./data.json', '{}');
    return {};
  }

  return JSON.parse(readFileSync('./data.json', 'utf8'));
}

export function set(data, key, value) {
  data[key] = value;
  writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

export function clear(data, key) {
  delete data[key];
  writeFileSync('./data.json', JSON.stringify(data, null, 2));
}
