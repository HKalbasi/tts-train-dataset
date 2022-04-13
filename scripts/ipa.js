
export const ipaIgnored = {
  'ˈ': true,
  'ː': true,
  'ˌ': true,
};

export const ipa = async (text) => {
  text = text.replaceAll('(', ' ').replaceAll(')', ' ').replaceAll('-', ' ');
  const cmd = `espeak-ng -v fa -q --ipa`.split(' ');
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
    .replaceAll('mˌoteˈaʔsse', 'mˌoteˈʔasse')
    .replaceAll('oteˌaʔss', 'oteˌʔass')
    .replaceAll('beːˌeʃɑn', 'beheʃɑn')
    .replaceAll('mˌostaaʔsˈeli', 'mˌostaʔsali')
    .replaceAll('aˈaʔ', 'aʔ')
    .replaceAll('mˌostaaʔ', 'mˌostaʔ')
    .replaceAll('beːˌeʃun', 'beheʃun')
    .replaceAll('beːˌetun', 'behetun')
    .replaceAll('batʃˈiand', 'betʃˈinad')
    .replaceAll('mˌotevˈaqːq1ef', 'mˌotevˈaq1q1ef')
    .replaceAll(' tʃˈo ', ' ʃˈo ')
    .replaceAll('ʔˌɑ', 'ʔɑ')
    .replaceAll('dʒozˈii', 'dʒozˈʔi')
    .replaceAll('mˌooʔaddˈabi', 'mˌoʔaddˈabi')
    .replaceAll('ʃˌodʒɑɑˈat', 'ʃˌodʒɑʔˈat')
    .replaceAll('ee', 'e')
    .replaceAll('jˌeːe', 'je')
    .replaceAll('jeˌe', 'je')
    .replaceAll('tˈebq1eːˌe', 'tˈebq1e')
    .replaceAll('mozˈuːe', 'mozˈuʔe')
    .replaceAll('mˌoannˈas', 'mˌoʔannˈas')
    .replaceAll('nahvˈejejˈe', 'nahvˈejˈe').replaceAll('\n', ' ');
  return r;
};
