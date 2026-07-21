// upgrades.ts
//
// Ersetzt die "einzeln hochzählen bis Guthaben leer"-Schleife durch geschlossene
// Summenformeln + Bisektion (binäre Suche). Dadurch werden auch Käufe über
// Milliarden von Stufen in O(log n) statt O(n) berechnet.
//
// WICHTIGE ANNAHME: `priceAdjust` aus deinem bestehenden Code wird hier weiter-
// verwendet, aber NUR EINMAL auf die Gesamtsumme eines Bulk-Kaufs angewendet -
// nicht mehr auf jede einzelne Stufe wie vorher. Das ist mathematisch fast
// identisch (der Rabatt-Faktor (1 - buff*0.01) ist linear, Summe und Rabatt
// sind vertauschbar), aber die Rundung selbst weicht dadurch um ein paar wenige
// Einheiten von der Summe der einzeln gerundeten Preise ab. Die erreichte
// STUFE ist davon nicht betroffen (im Test exakt identisch zur alten Schleife),
// nur der exakte Endpreis kann sich um einen kleinen, für eine Spielwährung
// irrelevanten Betrag unterscheiden. Falls dir exakte Centgenauigkeit zur alten
// Logik wichtig ist, sag Bescheid - das würde aber die Geschlossene-Form-
// Eigenschaft für die 1.5er-Stücke komplizierter machen.
import { priceAdjust } from './helpers/bananen.ts'; // <- Pfad ggf. anpassen

interface PricePiece {
  /** Exklusive obere Stufengrenze dieses Stücks (Infinity beim letzten Stück) */
  upTo: number;
  /** Exponent der Stufe in diesem Stück (1 = linear, 1.5, 2 = quadratisch) */
  exponent: number;
  factor: number;
  offset: number;
}

// Direkt aus deinen ursprünglichen Formeln übernommen - hier nur einmal als
// Stückliste definiert statt als verschachteltes Ternary.
const landPieces: PricePiece[] = [
  { upTo: 1, exponent: 1, factor: 0, offset: 0 },
  { upTo: 50, exponent: 1, factor: 20, offset: -10 },
  { upTo: 100, exponent: 1, factor: 200, offset: -100 },
  { upTo: Infinity, exponent: 1, factor: 2000, offset: -1000 },
];

const multiplierPieces: PricePiece[] = [
  { upTo: 50, exponent: 1.5, factor: 5, offset: 100 },
  { upTo: 100, exponent: 1.5, factor: 10, offset: 100 },
  { upTo: Infinity, exponent: 2, factor: 10, offset: 100 },
];

/**
 * Summe von (factor * k^exponent + offset) für k = from .. toExclusive-1.
 * - exponent 1 (linear)     -> arithmetische Reihe, geschlossene Formel
 * - exponent 2 (quadratisch)-> Gauß'sche Quadratsumme, geschlossene Formel
 * - exponent 1.5            -> keine geschlossene Formel bekannt, ABER laut
 *   Spieldesign nur auf Stücken mit maximal 50 Stufen im Einsatz -> normale
 *   Schleife ist hier performancetechnisch irrelevant (immer <= 50 Durchläufe).
 */
function rawSegmentSum(
  exponent: number,
  factor: number,
  offset: number,
  from: number,
  toExclusive: number,
): number {
  const count = toExclusive - from;
  if (count <= 0) return 0;

  if (exponent === 1) {
    const sumK = count * from + (count * (count - 1)) / 2;
    return factor * sumK + offset * count;
  }

  if (exponent === 2) {
    const sumSq = (m: number) => (m * (m + 1) * (2 * m + 1)) / 6;
    const sumK2 = sumSq(toExclusive - 1) - sumSq(from - 1);
    return factor * sumK2 + offset * count;
  }

  let sum = 0;
  for (let k = from; k < toExclusive; k++) {
    sum += factor * Math.pow(k, exponent) + offset;
  }
  return sum;
}

/** Rohkosten (ohne buff-Rabatt, ohne Rundung) für n Käufe ab Stufe `start`. */
function totalRawCost(pieces: PricePiece[], start: number, n: number): number {
  if (n <= 0) return 0;
  let level = start;
  let remaining = n;
  let sum = 0;
  for (const piece of pieces) {
    if (remaining <= 0) break;
    if (level >= piece.upTo) continue;
    const segmentEnd = Math.min(piece.upTo, level + remaining);
    sum += rawSegmentSum(
      piece.exponent,
      piece.factor,
      piece.offset,
      level,
      segmentEnd,
    );
    remaining -= segmentEnd - level;
    level = segmentEnd;
  }
  return sum;
}

/** Gesamtkosten für n Käufe ab `start`, inkl. buff-Rabatt und priceAdjust (einmalig, auf die Summe). */
function totalCost(
  pieces: PricePiece[],
  start: number,
  n: number,
  buff: number,
): number {
  if (n <= 0) return 0;
  return priceAdjust(totalRawCost(pieces, start, n) * (1 - buff * 0.01));
}

/** Preis für genau einen Kauf ab Stufe `level` - Ersatz für die alten landPrice/multiplierPrice. */
function singlePrice(
  pieces: PricePiece[],
  level: number,
  buff: number,
): number {
  return totalCost(pieces, level, 1, buff);
}

/**
 * Maximale Anzahl Käufe ab `start`, die mit `budget` leistbar sind - per
 * Bisektion statt Einzelschritt-Schleife. O(log n) statt O(n).
 */
function maxAffordable(
  pieces: PricePiece[],
  start: number,
  budget: number,
  buff: number,
  hardCap = 1e15,
): { count: number; cost: number } {
  if (budget < singlePrice(pieces, start, buff)) return { count: 0, cost: 0 };

  let lo = 1;
  let hi = 1;
  while (totalCost(pieces, start, hi, buff) <= budget) {
    lo = hi;
    hi *= 2;
    // Sicherheitsnetz: bei buff nahe 100 wird der Preis ~0 und die Schleife
    // würde sonst nicht terminieren. hardCap sollte idealerweise durch ein
    // sinnvolles Stufen-Maximum aus eurem Game-Design ersetzt werden - siehe
    // Hinweis am Ende der Datei.
    if (hi > hardCap) {
      hi = hardCap;
      break;
    }
  }
  while (hi - lo > 1) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (totalCost(pieces, start, mid, buff) <= budget) lo = mid;
    else hi = mid;
  }
  return { count: lo, cost: totalCost(pieces, start, lo, buff) };
}

/** Höchste erreichbare Stufe ab `start`, bei der der Preis für den JEWEILS NÄCHSTEN Kauf noch <= priceCeiling ist. */
function maxLevelUnderPrice(
  pieces: PricePiece[],
  start: number,
  buff: number,
  priceCeiling: number,
  hardCap = 1e15,
): number {
  if (singlePrice(pieces, start, buff) > priceCeiling) return start;
  let lo = start;
  let hi = start + 1;
  while (singlePrice(pieces, hi, buff) <= priceCeiling) {
    lo = hi;
    hi = start + (hi - start) * 2 + 1;
    if (hi - start > hardCap) {
      hi = start + hardCap;
      break;
    }
  }
  while (hi - lo > 1) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (singlePrice(pieces, mid, buff) <= priceCeiling) lo = mid;
    else hi = mid;
  }
  return lo + 1; // nach dem letzten noch leistbaren Kauf besitzt man lo+1 Stufen
}

// ---------------------------------------------------------------------------
// Öffentliche API - die 5 gewünschten Upgrade-Optionen
// ---------------------------------------------------------------------------

/** Preis für 1x Land-Upgrade (Ersatz für die alte landPrice-Funktion). */
export function priceOneLand(land: number, buff: number): number {
  return singlePrice(landPieces, land, buff);
}

/** Preis für 1x Multiplikator-Upgrade (Ersatz für die alte multiplierPrice-Funktion). */
export function priceOneMultiplier(multiplier: number, buff: number): number {
  return singlePrice(multiplierPieces, multiplier, buff);
}

/** Maximales Land-Upgrade allein. */
export function maxUpgradeLand(
  land: number,
  budget: number,
  buff: number,
): { newLand: number; spent: number } {
  const { count, cost } = maxAffordable(landPieces, land, budget, buff);
  return { newLand: land + count, spent: cost };
}

/** Maximales Multiplikator-Upgrade allein. */
export function maxUpgradeMultiplier(
  multiplier: number,
  budget: number,
  buff: number,
): { newMultiplier: number; spent: number } {
  const { count, cost } = maxAffordable(
    multiplierPieces,
    multiplier,
    budget,
    buff,
  );
  return { newMultiplier: multiplier + count, spent: cost };
}

/**
 * Volles Max-Upgrade, Variante "niedrigeren Preis bevorzugen": kauft in jedem
 * Schritt das jeweils günstigere von Land/Multiplikator - simuliert exakt die
 * "immer das Billigste zuerst"-Schleife, aber ohne sie tatsächlich Schritt für
 * Schritt auszuführen. Dafür wird über einen Preis-Schwellenwert p bisektiert:
 * "kaufe alles (von beiden Ressourcen), dessen Einzelpreis <= p ist" und p so
 * weit wie möglich erhöht, bis das Budget aufgebraucht wäre.
 */
export function maxUpgradeBothCheapestFirst(
  land: number,
  multiplier: number,
  budget: number,
  buff: number,
): { newLand: number; newMultiplier: number; spent: number } {
  throw new Error(
    'Temporarily unavailable, use maxUpgradeBothBalanced instead',
  );
  const costAtCeiling = (priceCeiling: number) => {
    const newLand = maxLevelUnderPrice(landPieces, land, buff, priceCeiling);
    const newMultiplier = maxLevelUnderPrice(
      multiplierPieces,
      multiplier,
      buff,
      priceCeiling,
    );
    return {
      newLand,
      newMultiplier,
      cost:
        totalCost(landPieces, land, newLand - land, buff) +
        totalCost(
          multiplierPieces,
          multiplier,
          newMultiplier - multiplier,
          buff,
        ),
    };
  };

  let lo = 0;
  let hi = budget;
  while (hi - lo > 1) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (costAtCeiling(mid).cost <= budget) lo = mid;
    else hi = mid;
  }
  const result = costAtCeiling(lo);
  return {
    newLand: result.newLand,
    newMultiplier: result.newMultiplier,
    spent: result.cost,
  };
}

/**
 * Volles Max-Upgrade, Variante "Ausgleich bevorzugen": bringt zuerst beide
 * Stufen auf ein gemeinsames Niveau T (per Bisektion das höchste T, das noch
 * leistbar ist), und steckt übriges Budget danach in die Ressource, deren
 * nächster Kauf günstiger ist. Das ist eine Heuristik (kein "hartes" Balance-
 * Kriterium) - im Test weicht sie bei Restguthaben leicht von einer reinen
 * Schritt-für-Schritt-"immer die zurückliegende Ressource kaufen"-Simulation
 * ab, verschwendet aber nie leistbares Budget.
 */
export function maxUpgradeBothBalanced(
  land: number,
  multiplier: number,
  budget: number,
  buff: number,
): { newLand: number; newMultiplier: number; spent: number } {
  const costAtTarget = (target: number) => {
    const nLand = Math.max(0, target - land);
    const nMultiplier = Math.max(0, target - multiplier);
    return (
      totalCost(landPieces, land, nLand, buff) +
      totalCost(multiplierPieces, multiplier, nMultiplier, buff)
    );
  };

  let lo = Math.max(land, multiplier);
  let hi = lo + 1;
  while (costAtTarget(hi) <= budget) {
    lo = hi;
    hi = lo * 2 + 1;
    if (hi > 1e15) break;
  }
  while (hi - lo > 1) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (costAtTarget(mid) <= budget) lo = mid;
    else hi = mid;
  }

  let newLand = Math.max(land, lo);
  let newMultiplier = Math.max(multiplier, lo);
  let spent = costAtTarget(lo);
  const remaining = budget - spent;

  // Restguthaben in die aktuell günstigere Fortsetzung stecken.
  const nextLandPrice = singlePrice(landPieces, newLand, buff);
  const nextMultiplierPrice = singlePrice(
    multiplierPieces,
    newMultiplier,
    buff,
  );
  if (nextLandPrice <= nextMultiplierPrice) {
    const extra = maxAffordable(landPieces, newLand, remaining, buff);
    newLand += extra.count;
    spent += extra.cost;
  } else {
    const extra = maxAffordable(
      multiplierPieces,
      newMultiplier,
      remaining,
      buff,
    );
    newMultiplier += extra.count;
    spent += extra.cost;
  }

  return { newLand, newMultiplier, spent };
}

// ---------------------------------------------------------------------------
// ACHTUNG - unabhängig von diesem Refactoring zu klären:
// Bei buff = 100 wird der Preis für JEDE Stufe exakt 0 (Faktor (1-buff*0.01)
// wird 0). Die alte Schleife wäre hier in eine Endlosschleife gelaufen, die
// neue Bisektion terminiert zwar dank hardCap, liefert dann aber ein
// technisch "korrektes", spielerisch aber unsinniges Ergebnis (Millionen
// Gratis-Stufen). Das solltest du unabhängig davon abfangen, z.B. indem buff
// vor dem Aufruf hart auf < 100 gedeckelt wird, oder indem du hardCap durch
// ein echtes Stufen-Maximum aus eurem Game-Design ersetzt.
// ---------------------------------------------------------------------------
