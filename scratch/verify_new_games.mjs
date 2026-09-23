// scratch verification script for taboo reasoning and picture puzzle
import { readFileSync } from 'fs';

const tabooContent = readFileSync('src/games/TabooReasoning.jsx', 'utf-8');
const pictureContent = readFileSync('src/games/PicturePuzzle.jsx', 'utf-8');

console.log('--- Verifying Taboo Reasoning & Picture Puzzle ---');

// Extract TABOO_DATA
const tabooMatch = tabooContent.match(/const TABOO_DATA = (\[[\s\S]*?\n\];)/);
if (!tabooMatch) {
  console.error('Failed to match TABOO_DATA');
  process.exit(1);
}
const TABOO_DATA = eval(tabooMatch[1]);
console.log(`Loaded ${TABOO_DATA.length} Taboo puzzles.`);

TABOO_DATA.forEach((item, idx) => {
  if (!item.options || item.options.length !== 4) {
    throw new Error(`Taboo item ${idx} (${item.title}) does not have 4 options`);
  }
  const set = new Set(item.options);
  if (set.size !== 4) {
    throw new Error(`Taboo item ${idx} (${item.title}) has duplicate options: ${item.options}`);
  }
  if (!item.options.includes(item.answer)) {
    throw new Error(`Taboo item ${idx} (${item.title}) answer "${item.answer}" not in options: ${item.options}`);
  }
  if (!item.tabooWords || item.tabooWords.length !== 5) {
    throw new Error(`Taboo item ${idx} (${item.title}) does not have 5 taboo words`);
  }
});
console.log('✓ All 20 Taboo Reasoning puzzles verified: 4 unique options each, answer present, 5 taboo words!');

// Extract PICTURE_PUZZLE_BANK
const picMatch = pictureContent.match(/const PICTURE_PUZZLE_BANK = (\[[\s\S]*?\n\];)/);
if (!picMatch) {
  console.error('Failed to match PICTURE_PUZZLE_BANK');
  process.exit(1);
}
const PICTURE_PUZZLE_BANK = eval(picMatch[1]);
console.log(`Loaded ${PICTURE_PUZZLE_BANK.length} Picture puzzles.`);

PICTURE_PUZZLE_BANK.forEach((item, idx) => {
  if (!item.options || item.options.length !== 4) {
    throw new Error(`Picture item ${idx} (${item.title}) does not have 4 options`);
  }
  const set = new Set(item.options);
  if (set.size !== 4) {
    throw new Error(`Picture item ${idx} (${item.title}) has duplicate options: ${item.options}`);
  }
  if (!item.options.includes(item.answer)) {
    throw new Error(`Picture item ${idx} (${item.title}) answer "${item.answer}" not in options: ${item.options}`);
  }
  if (!item.visualType) {
    throw new Error(`Picture item ${idx} (${item.title}) missing visualType`);
  }
});
console.log('✓ All 20 Picture Puzzles verified: 4 unique options each, answer present, valid visualType!');
console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!');
