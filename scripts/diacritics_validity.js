import { ipa, ipaIgnored } from "./ipa.js";

const clean = (x) => {
  for (const a of Object.keys(ipaIgnored)) {
    x = x.replaceAll(a, '');
  }
  return x.replaceAll('j', '').replaceAll('ʔ', '').replaceAll('u', '').replaceAll('i', '')
    .replaceAll('ɑ', '').replaceAll('a', '').replaceAll('v', '').replaceAll('e', '')
    .replaceAll('o', '').replace('bɑlɑaxar', 'blaxar').replaceAll('  ', ' ').trim();
};

const doFile = async (fnum) => {
  const csv = await Deno.readTextFile(`diacritics/${fnum}.csv`);
  for (const line of csv.split('\n')) {
    const parts = line.split('|').map((x) => x.trim());
    if (parts.length < 2) {
      continue;
    }
    const x = clean(await ipa(parts[1].replaceAll(/.ّ/g, (c) => `${c[0]}${c[0]}`).replaceAll('صَفْحه', 'صفحه')));
    const y = clean(parts[2]);
    if (x !== y) {
      console.log(x.length, y.length);
      for (let i = 0; i < x.length; i += 1) {
        if (x[i] !== y[i]) {
          console.log(i);
        }
      }
      throw new Error(`mismatched:\ncurrent:  ${x}\nexpected: ${y}\ntext: ${parts[1]}`);
    }
  }
};

for (let i = 1; i <= 39; i += 1) {
  if (i == 23 || i == 25) continue;
  console.log(i);
  await doFile(i.toString().padStart(2, '0'));
}
  