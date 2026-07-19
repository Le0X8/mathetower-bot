import { Command } from '$commands';
import set_exams from './admin/set-exams.ts';
import bugreport from './debug/bugreport.ts';
import zzz_debug from './debug/debug.ts';
import error from './debug/error.ts';
import accept from './fun/accept.ts';
import bananen from './fun/bananen.ts';
import era from './fun/era.ts';
import gamble from './fun/gamble.ts';
import gift from './fun/gift.ts';
import gpt6 from './fun/gpt6.ts';
import kill from './fun/kill.ts';
import labor from './fun/labor.ts';
import leaderboard from './fun/leaderboard.ts';
import minuten from './fun/minuten.ts';
import mutation from './fun/mutation.ts';
import plantage from './fun/plantage.ts';
import random from './fun/random.ts';
import lootbox from './fun/shop.ts';
import schnellbahn1 from './fun/thank-you-for-traveling-with-deutsche-bahn.ts';
import trade from './fun/trade.ts';
import waow from './fun/waow.ts';
import help from './info/help.ts';
import klausuren from './info/klausuren.ts';
import mensa from './info/mensa.ts';
import novx from './info/novx.ts';
import zzz_owner_editcash from './owner/editcash.ts';
import zzz_owner_replacewords from './owner/replacewords.ts';

export const commands: Record<string, Command> = {
  set_exams,
  bugreport,
  zzz_debug,
  error,
  accept,
  bananen,
  era,
  gamble,
  gift,
  gpt6,
  kill,
  labor,
  leaderboard,
  minuten,
  mutation,
  plantage,
  random,
  lootbox,
  schnellbahn1,
  trade,
  waow,
  help,
  klausuren,
  mensa,
  novx,
  zzz_owner_editcash,
  zzz_owner_replacewords,
};
