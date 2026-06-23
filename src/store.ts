import { existsSync, readFileSync, writeFileSync } from 'fs';

declare global {
  var store: Store;
  var wordlist: {
    graph: Record<string, [string | null, number][]>;
    tokens: Record<string, string>;
    words: Record<string, string>;
  };
}

class Store {
  #data: Record<string, any>;

  constructor(init: Record<string, any>) {
    this.#data = init;
  }

  get(key: string, prefix?: string) {
    return this.#data[(prefix ? prefix + '+' : '') + key];
  }

  set(key: string, prefix: string | null, value: any) {
    this.setRaw((prefix ? prefix + '+' : '') + key, value);
  }

  setRaw(key: string, value: any) {
    this.#data[key] = value;
    writeFileSync('./data.json', JSON.stringify(this.#data));
  }

  clear(key: string) {
    delete this.#data[key];
    writeFileSync('./data.json', JSON.stringify(this.#data));
  }

  entries(prefix?: string) {
    return Object.entries(this.#data).filter(([key]) =>
      prefix ? key.startsWith(prefix + '+') : true,
    );
  }

  async cache<T>(
    id: string,
    match: string,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    if (this.get('cachematch', id) === match) {
      return this.get('cache', id) as T;
    }
    const value = await fetcher();
    this.set('cache', id, value);
    this.set('cachematch', id, match);
    return value;
  }
}

if (!existsSync('./data.json')) {
  writeFileSync('./data.json', '{}');
  globalThis.store = new Store({});
}

if (!globalThis.store)
  globalThis.store = new Store(JSON.parse(readFileSync('./data.json', 'utf8')));
