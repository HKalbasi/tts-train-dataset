import { ipa, ipaIgnored } from "./ipa.js";

const clean = (x) => {
  for (const a of Object.keys(ipaIgnored)) {
    x = x.replaceAll(a, '');
  }
};

const doFile = async (fnum) => {
  const csv = await Deno.readTextFile(`diacritics/${fnum}.csv`);
  for (const line of csv.split('\n')) {
    const parts = line.split('|').map((x) => x.trim());
    if (parts.length < 2) {
      continue;
    } 
    const x = await ipa(parts[1].replaceAll('صَفْحه', 'صفحه'));
    const y = parts[2];
    if (clean(x) !== clean(y)) {
      throw new Error(`mismatched:\n${x}\n${y}`);
    }
  }
};

for (let i = 1; i <= 39; i += 1) {
  if (i == 23 || i == 25) continue;
  console.log(i);
  await doFile(i.toString().padStart(2, '0'));
}
  