export enum Model {
  Gpt6 = 'gpt6',
  Gpt7 = 'gpt7',
}

export const models = [Model.Gpt6, Model.Gpt7];

export function getModel(model: string): Model {
  if (model === Model.Gpt6) return Model.Gpt6;
  if (model === Model.Gpt7) return Model.Gpt7;
  return Model.Gpt7;
}

export const instructions = {
  train: () => 'train',
  prompt: (model: Model, input: string) => `${model} ${input}`,
  weights: (model: Model, input: string) => `${model}w ${input}`,
  random: (count?: number | null) => `random ${count ?? 'r'}`,
};
