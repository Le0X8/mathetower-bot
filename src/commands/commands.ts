import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js';

export interface Option {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  required: boolean;
}

export class Command {
  name: string;
  description: string;
  isAdminCommand: boolean;
  options: Option[];
  callback: (interaction: ChatInputCommandInteraction) => Promise<void>;

  constructor(
    name: string,
    description: string,
    callback: (interaction: ChatInputCommandInteraction) => Promise<void>,
    isAdminCommand = false,
    options: Option[] = [],
  ) {
    this.name = name;
    this.description = description;
    this.callback = callback;
    this.isAdminCommand = isAdminCommand;
    this.options = options;
  }
}
