import { ipa, ipaIgnored } from "./ipa.js";

const clipboardWriteText = async (text) => {
  const command = await Deno.run({
    cmd: ["bash", "-c", `echo "${text}" | xclip -sel clip`],
  });
};

// wrongs: نه، خواستگاری

const nonVowel = {
  'ئ': 'ʔ',
  'آ': 'ʔɑ',
  'أ': 'ʔ',
  'ء': 'ʔ',
  'ا': 'n',
  'ب': 'b',
  'پ': 'p',
  'ت': 't',
  'ث': 's',
  'ج': 'dʒ',
  'چ': 'tʃ',
  'ح': 'h',
  'خ': 'x',
  'د': 'd',
  'ذ': 'z',
  'ر': 'r',
  'ز': 'z',
  'ژ': 'ʒ',
  'س': 's',
  'ش': 'ʃ',
  'ص': 's',
  'ض': 'z',
  'ط': 't',
  'ظ': 'z',
  'ع': 'ʔ',
  'غ': 'q1',
  'ف': 'f',
  'ق': 'q1',
  'ک': 'k',
  'گ': 'ɡ',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'و': 'v',
  'ه': 'h',
  'ی': 'j',
};

const tanvin = {
  'ُ': 'ً',
};

const vowelExp = {
  'آ': 'ɑ',
  'ا': 'ɑ',
  'ی': 'i',
  'و': 'u',
};

const vowelImp = {
  'o': 'ُ',
  'a': 'َ',
  'e': 'ِ',
};

const textIgnored = {
  '.': true,
  '؛': true,
  ':': true,
  '؟': true,
  '،': true,
  ' ': true,
  '»': true,
  '«': true,
  ')': true,
  '(': true,
  '-': true,
  '"': true,
  ',': true,
  '‌': true,
};

const isAyn = (c) => c === 'ع' || c === 'ئ' || c === 'ء' || c === 'أ';

const diacWithIpa = async (text, ipa) => {
  text = text.replaceAll('اً', 'ن').replaceAll('ّ', '');
  ipa = ipa.replaceAll('\n', ' ') + ' ';
  text += ' ';
  let tp = 0;
  let ip = 0;
  let result = "";
  const goText = () => {
    result += text[tp];
    tp += 1;
  };
  let state = 'start';
  while (true) {
    if (tp === text.length) {
      if (ip !== ipa.length) {
        if (ipaIgnored[ipa[ip]] || ipa[ip] === ' ') {
          ip += 1;
          continue;
        }
        throw new Error(`ipa remained:\n${ipa.slice(ip)}\n${text}\n${ipa}`);
      }
      return result;
    }
    if (ip === ipa.length) {
      const tc = text[tp];
      if (textIgnored[tc]) {
        goText();
        continue;
      }
      throw new Error(`text remained: ${tc}\n${ipa}\n${text}`);
    }
    const tc = text[tp];
    const ic = ipa[ip];
    if (isAyn(tc) && ic === ' ') {
      goText();
      continue;
    }
    if (tc === 'ْ') {
      goText();
      state = 'vowel';
      continue;
    }
    if (textIgnored[tc] && ic === ' ') {
      if (state === 'nonVowel') {
        result += 'ْ';
      }
      state = 'start';
      while (textIgnored[text[tp]]) {
        goText();
      }
      while (ipa[ip] === ' ') {
        ip += 1;
      }
      continue;
    }
    if (text.slice(tp).startsWith('یی') && ic === 'i') {
      goText();
      goText();
      ip += 1;
      continue;
    }
    if (text.slice(tp).startsWith('ی') && ic === 'ɑ') {
      goText();
      ip += 1;
      continue;
    }
    if (text.slice(tp).startsWith('دد') && ipa.slice(ip).startsWith('ddad')) {
      goText();
      result += 'ّ';
      goText();
      ip += 4;
      continue;
    }
    if (text.slice(tp).startsWith('چهار') && ipa.slice(ip).startsWith('tʃˈɑhɑr')) {
      goText();
      goText();
      goText();
      goText();
      ip += 7;
      continue;
    }
    if (text.slice(tp).startsWith('و') && ipa.slice(ip).startsWith('ovv')) {
      goText();
      result += 'ّ';
      ip += 3;
      continue;
    }
    if (text.slice(tp).startsWith('و') && ipa.slice(ip).startsWith('ov')) {
      goText();
      ip += 2;
      continue;
    }
    if (text.slice(tp).startsWith('ه‌ه') && ipa.slice(ip).startsWith('eh')) {
      goText();
      goText();
      goText();
      ip += 2;
      continue;
    }
    if (text.slice(tp).startsWith('ه‌ه') && ipa.slice(ip).startsWith('eːh')) {
      goText();
      goText();
      goText();
      ip += 3;
      continue;
    }
    if (text.slice(tp).startsWith('ی‌ی') && ipa.slice(ip).startsWith('ij')) {
      goText();
      goText();
      goText();
      ip += 2;
      continue;
    }
    if (text.slice(tp).startsWith('ی') && ipa.slice(ip).startsWith('ijj')) {
      goText();
      ip += 3;
      continue;
    }
    if (text.slice(tp).startsWith('ی') && ipa.slice(ip).startsWith('ij')) {
      goText();
      ip += 2;
      continue;
    }
    if (text.slice(tp).startsWith('ی') && ipa.slice(ip).startsWith('iːj')) {
      goText();
      ip += 3;
      continue;
    }
    if (text.slice(tp).startsWith('نه ') && ipa.slice(ip).startsWith('nˈa')) {
      goText();
      goText();
      ip += 3;
      continue;
    }
    if (ipa.slice(ip).startsWith(nonVowel[tc])) {
      if (state === 'nonVowel') {
        result += 'ْ';
      }
      state = 'nonVowel';
      goText();
      ip += nonVowel[tc].length;
      if (ipa.slice(ip).startsWith(nonVowel[tc]) && (ipa[ip + 1] !== 'ʒ' || ipa[ip - 1] === 'ʒ')) {
        let tp2 = tp;
        while (textIgnored[text[tp2]]) {
          tp2 += 1;
        }
        if (!(ipa.slice(ip).startsWith(nonVowel[text[tp2]]) || text[tp2 + 1] === tc && textIgnored[text[tp2]]) || text[tp2] === 'ص') {
          state = 'tashdid';
          result += 'ّ';
          ip += nonVowel[tc].length;
        }
      }
      continue;
    }
    if (vowelExp[tc] === ic || vowelImp[ic] === tc) {
      state = 'vowel';
      goText();
      ip += 1;
      continue;
    }
    if (vowelExp[text[tp + 1]] === ic && tc === 'و') {
      goText();
      continue;
    }
    if (isAyn(tc) && vowelExp[text[tp + 1]] === ic) {
      state = 'vowel';
      goText();
      goText();
      ip += 1;
      continue;
    }
    if (ic === 'i' || ic === 'u') {
      if (tc === 'ا') {
        goText();
        continue;
      }
    }
    if (tc === 'ا' && ic === 'l') {
      goText();
      continue;
    }
    if (tc === 'ا' && ic === 'ʔ') {
      ip += 1;
      continue;
    }
    if (ic === 'o' && tc === 'و') {
      goText();
      ip += 1;
      continue;
    }
    if (vowelImp[ic]) {
      if ((ipa[ip + 2] !== 'ʔ' || !ipaIgnored[ipa[ip + 1]]) &&
        (vowelImp[ipa[ip + 1]] === undefined && (vowelImp[ipa[ip + 2]] === undefined || !ipaIgnored[ipa[ip + 1]])) &&
        (tc === 'ا' && (ipa[ip + 1] != 'n' || text[tp + 1] === 'ن') || isAyn(tc) && ipa[ip + 1] != nonVowel['ع'])) {
        goText();
        state = 'nonVowel';
      }
      if (state === 'nonVowel' || state === 'tashdid') {
        ip += 1;
        result += vowelImp[ic];
        state = 'vowel';
        continue;
      }
    }
    if (ipaIgnored[ic]) {
      ip += 1;
      continue;
    }
    if (textIgnored[tc]) {
      state = 'start';
      goText();
      continue;
    }
    if (result.endsWith(vowelImp['o']) && tc === 'و') {
      tp += 1;
      continue;
    }
    if (result.endsWith(vowelImp['e']) && tc === 'ه') {
      tp += 1;
      continue;
    }
    if (ic === ' ') {
      ip += 1;
      continue;
    }
    await clipboardWriteText(`'${tc}': '${ic}',`);
    console.log(tc, nonVowel[tc], ic);
    throw new Error(`mismatched ${tc} with ${ic} in \n${text}\n${ipa}\n${result}`);
  }
};

const doFile = async (fnum) => {
  const csv = await Deno.readTextFile(`timed/${fnum}.csv`);
  let result = "";
  const write = (x) => {
    result += x + '\n';
  };
  for (const line of csv.split('\n')) {
    const parts = line.split('|').map((x) => x.trim());
    if (parts.length < 2) continue;
    const id = parts[0];
    const text = parts[3];
    const ip = await ipa(text);
    const diac = await diacWithIpa(text, ip);
    write(` ${id} | ${diac} | ${ip}`);
  }
  await Deno.writeTextFile(`diacritics/${fnum}.csv`, result);
};

if (Deno.args.length === 1) {
  await doFile(Deno.args[0]);
} else {
  for (let i = 1; i <= 39; i += 1) {
    if (i == 23 || i == 25) continue;
    console.log(i);
    await doFile(i.toString().padStart(2, '0'));
  }
}
