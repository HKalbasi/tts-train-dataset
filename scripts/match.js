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

const doFile = async (fnum) => {
    const json = JSON.parse(await Deno.readTextFile(`vosk_output/${fnum}.json`));
    const text = await Deno.readTextFile(`texts/${fnum}.txt`);
    const list = text.replaceAll('،', '').replaceAll('.', '').split(/\s+/);
    const { result } = json;
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
                        if (match(result[i + x - 1].word, list[j + x - 1] + nimFasele + list[j + x])) {
                            for (let f = 0; f < x; f += 1) {
                                result[i + f].corrected = list[j + f];
                            }
                            result[i + x - 1].corrected += nimFasele + list[j + x];
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
                const s1 = result.slice(i, i + 5).map((x) => x.word).join(' ');
                const s2 = list.slice(j, j + 5).join(' ');
                throw new Error(`can't match ${i}: ${s1}, ${j}: ${s2}`);
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

    const sentence = (st, tw, tc, en) => {
        timedFile += ` ${(id+"").padStart(3, '0')} | ${ffloat(st)} | ${ffloat(en)} | ${tc}\n`;
        diffFile += `${st}\n${tw}\n${tc}\n${en}\n`;
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
        if (!result[i].skip) {
            s2 += result[i].corrected + ' ';
        }
    }
    sentence(`${result[pv].start}`, s, s2, `${result[result.length - 1].end}`);
    await Deno.writeTextFile(`timed/${fnum}.csv`, timedFile);
    await Deno.writeTextFile(`vosk_vs_correct/${fnum}.txt`, diffFile);
};

await doFile('02');
