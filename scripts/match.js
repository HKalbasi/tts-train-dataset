import { exists } from "https://deno.land/std/fs/mod.ts";

const nimFasele = "‌";

const lsp = (s1, s2) => {
    let pv = [];
    for (let j = 0; j <= s2.length; j += 1) {
        pv.push(0);
    }
    for (let i = 0; i < s1.length; i += 1) {
        const dp = [0];
        for (let j = 0; j < s2.length; j += 1) {
            if (s1[i] === s2[j]) {
                dp.push(pv[j] + 1);
            } else {
                dp.push(Math.max(dp[j], pv[j + 1]));
            }
        }
        pv = dp;
    }
    return pv[s2.length];
};


const match = (s1, s2) => {
    if (s1 === s2) {
        return true;
    }
    if (s1.endsWith('ه') && s2 === s1 + nimFasele + 'ی') {
        return true;
    }
    if (s2.endsWith('ه') && s1 === s2 + nimFasele + 'ی') {
        return true;
    }
    return false;
};

const wrongDict = {};

const addToWrongs = (correct, original) => {
    if (!wrongDict[correct]) {
        wrongDict[correct] = [];
    }
    wrongDict[correct].push(original);
};

const bads = ['،', '.', '»', '«', '(', ')', '؛', ':'];

const isSpacy = (c) => c === ' ' || c === '\n' || c === '\t' || c === '\r';

const doFile = async (fnum) => {
    const textPath = `texts/${fnum}.txt`;
    if (!await exists(textPath)) {
        console.log(`${textPath} not found`);
        return;
    };
    const text = await Deno.readTextFile(textPath);
    const json = JSON.parse(await Deno.readTextFile(`vosk_output/${fnum}.json`));
    const list = text
        .replaceAll('،', '')
        .replaceAll('.', '')
        .replaceAll('»', '')
        .replaceAll('«', '')
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll('؛', '')
        .replaceAll(':', '')
        .replaceAll(nimFasele, ' ')
        .split(/\s+/);
    const { result: preResult } = json;
    const result = [];
    for (const x of preResult) {
        const ss = x.word.split(nimFasele);
        for (const s of ss) {
            result.push({
                start: x.start,
                end: x.end,
                word: s,
            });
        }
    }
    {
        let i = 0;
        let j = 0;
        while (true) {
            if (i === result.length || j === list.length) {
                break;
            }
            let finded = false;
            for (let l = 3; l < 8; l += 1) {
                if (finded) {
                    break;
                }
                if (!finded) {
                    for (let x = 1; x < l; x += 1) {
                        if (i + x - 1 >= result.length) continue;
                        if (j + x - 1 >= list.length) continue;
                        if (match(result[i + x - 1].word, list[j + x - 1])) {
                            for (let f = 0; f < x; f += 1) {
                                result[i + f].corrected = list[j + f];
                            }
                            i += x;
                            j += x;
                            finded = true;
                            break;
                        }
                        if (match(result[i + x - 1].word, list[j + x - 1] + list[j + x])) {
                            for (let f = 0; f < x; f += 1) {
                                result[i + f].corrected = list[j + f];
                            }
                            result[i + x - 1].corrected += ' ' + list[j + x];
                            i += x;
                            j += x + 1;
                            finded = true;
                            break;
                        }
                    }
                }
                for (let y = 1; y < l; y += 1) {
                    if (finded) {
                        break;
                    }
                    for (let x = 0; x + y < l; x += 1) {
                        if (j + x + y >= list.length) continue;
                        if (i + x + y >= result.length) continue;
                        if (match(result[i + x].word, list[j + x + y])) {
                            for (let f = 0; f < x; f += 1) {
                                result[i + f].corrected = list[j + f];
                            }
                            if (x !== 0) {
                                for (let f = 0; f < y; f += 1) {
                                    result[i + x - 1].corrected += ' ' + list[j + x + f];
                                }
                                result[i + x].corrected = list[j + x + y];
                            } else {
                                result[i + x].corrected = list[j + x];
                                for (let f = 1; f <= y; f += 1) {
                                    result[i + x].corrected += ' ' + list[j + x + f];
                                }
                                if (result[i + x].corrected.startsWith('ی ')) {
                                    result[i + x].corrected = result[i + x].corrected.slice(2);
                                    result[i + x - 1].corrected += ' ی';
                                }
                            }
                            i += x + 1;
                            j += x + y + 1;
                            finded = true;
                            break;
                        }
                        if (match(result[i + x + y].word, list[j + x])) {
                            for (let f = 0; f < x; f += 1) {
                                result[i + f].corrected = list[j + f];
                            }
                            for (let f = 0; f < y; f += 1) {
                                result[i + x + f].skip = true;
                            }
                            result[i + x + y].corrected = list[j + x];
                            i += x + y + 1;
                            j += x + 1;
                            finded = true;
                            break;
                        }
                    }
                }
            }
            if (!finded) {
                if (result.length - i < 3 && list.length - j < 4) {
                    result[i].corrected = list.slice(j).join(' ');
                    for (let f = i + 1; f < result.length; f += 1) {
                        result[f].skip = true;
                    }
                    i = result.length;
                    j = list.length;
                    continue;
                }
                const s1 = result.slice(i, i + 5).map((x) => x.word).join(' ');
                const s2 = list.slice(j, j + 5).join(' ');
                throw new Error(`can't match\noriginal ${i}: ${s1}\ncorrected ${j}: ${s2}`);
            }
        }
    }

    let pv = 0;

    let s = result[0].word + ' ';
    let s2 = result[0].corrected + ' ';

    let id = 0;

    const ffloat = (f) => {
        return Number(f).toFixed(2).padStart(7);
    };

    let timedFile = "";
    let diffFile = "";
    let tPointer = 0;

    const sentence = (st, tw, tc, en) => {
        let ttc = "";
        const insert = () => {
            ttc += text[tPointer];
            tPointer += 1;
        };
        for (const c of tc) {
            while (bads.find((x) => x === text[tPointer])) {
                insert();
            }
            if (c === ' ') {
                if (text[tPointer] === nimFasele) {
                    insert();
                    continue;            
                }
                if (isSpacy(text[tPointer])) {
                    ttc += ' ';
                    while (isSpacy(text[tPointer]) || bads.find((x) => x === text[tPointer])) tPointer += 1;
                    continue;
                }
            }
            if (c === text[tPointer] || c === ' ' && text[tPointer] === nimFasele) {
                insert();
                continue;
            }
            if (text.length === tPointer) {
                break;
            }
            throw new Error(`Mismatch character in post matching, ${c} vs ${text[tPointer]} in ${text.slice(tPointer - 5, tPointer + 5)}`);
        }
        timedFile += ` ${(id + "").padStart(3, '0')} | ${ffloat(st)} | ${ffloat(en)} | ${ttc}\n`;
        diffFile += `${id} ${st}\n${tw}\n${ttc}\n${en}\n`;
        id += 1;
    };

    for (let i = 1; i < result.length; i += 1) {
        if (result[i].start > result[i - 1].end + 0.2) {
            sentence(`${result[pv].start}`, s, s2, `${result[i - 1].end}`);
            pv = i;
            s = "";
            s2 = "";
        }
        s += result[i].word + ' ';
        if (!result[i].skip && result[i].word !== result[i].corrected) {
            let w = result[i].word;
            let j = i + 1;
            while (result.length > j && result[j].skip) {
                w += ' ' + result[j].word;
                j += 1;
            }
            addToWrongs(result[i].corrected, w);
        }
        if (!result[i].skip) {
            s2 += result[i].corrected + ' ';
        }
    }
    sentence(`${result[pv].start}`, s, s2, `${result[result.length - 1].end}`);
    await Deno.writeTextFile(`timed/${fnum}.csv`, timedFile);
    await Deno.writeTextFile(`vosk_vs_correct/${fnum}.txt`, diffFile);
};

for (let i = 1; i <= 39; i += 1) {
    console.log(i);
    await doFile(i.toString().padStart(2, '0'));
}

let wrongText = "";
for (const key of Object.keys(wrongDict)) {
    wrongText += `${key.padEnd(20, ' ')}| ${wrongDict[key].join(' - ')}\n`;
}

await Deno.writeTextFile(`wrongs.csv`, wrongText);
