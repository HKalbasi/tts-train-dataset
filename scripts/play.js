const [file, track] = Deno.args;
const csv = await Deno.readTextFile(`timed/${file}.csv`);
const parts = csv.split('\n')[track].split('|').map((x) => x.trim());
const start = Number(parts[1]);
const end = Number(parts[2]);
console.log(parts[3]);
const p = Deno.run({
    cmd: `ffplay -autoexit mp3/${file}.mp3 -ss ${start} -t ${end-start}`.split(' '),
    stdout: 'piped',
    stderr: 'piped',
});
await p.status();
