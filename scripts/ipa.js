
export const ipaIgnored = {
  'ˈ': true,
  'ː': true,
  'ˌ': true,
};

export const ipa = async (text) => {
  text = text.replaceAll('(', ' ').replaceAll(')', ' ').replaceAll('-', ' ');
  const cmd = `espeak -v fa -q --ipa`.split(' ');
  cmd.push(text);
  const p = Deno.run({
    cmd,
    stdout: 'piped',
    stderr: 'piped',
  });
  const r = new TextDecoder().decode(await p.output()).trim()
    .replaceAll('ʔk', 'kk')
    .replaceAll('ʃˌodʒɑˈɑat', 'ʃˌodʒɑˈat')
    .replaceAll('mˌoteaʔss', 'mˌoteʔass')
    .replaceAll('babˈiand', 'bebinad')
    .replaceAll('mˌoteˈaʔsser', 'mˌoteˈʔasser')
    .replaceAll('beːˌeʃɑn', 'beheʃɑn')
    .replaceAll('nahvˈejejˈeː', 'nahvˈejˈeː').replaceAll('\n', ' ');
  return r;
};
