from hazm import *
from pathlib import Path

def f(a, b):
    if b[-1] == 'e':
        if a[-1] != 'ِ':
            if a[-1] == 'ه' and a[-2] != 'ا':
                a += '‌ی'
            a += 'ِ'
    return a

tagger = POSTagger(model='scripts/resources-0.5/postagger.model')
def job(l):
    x = [f(a, b) for a, b in tagger.tag(word_tokenize(l))]
    return ' '.join(x)

#tagger = POSTagger(model='scripts/resources-0.5/postagger.model')
#while True:
#    l = input()
#    x = [f(a, b) for a, b in tagger.tag(word_tokenize(l))]
#    print(' '.join(x))

for i in range(1, 40):
    if i == 23 or i == 25:
        continue
    name = str(i).zfill(2)
    text = Path(f"texts/{name}.txt").read_text()
    normalizer = Normalizer(remove_diacritics=False)
    sents = sent_tokenize(normalizer.normalize(text))
    r = ""
    for s in sents:
        r += job(s) + '\n'
    Path(f"hazmed/{name}.txt").write_text(r)
