from hazm import *

def f(a, b):
    if b[-1] == 'e':
        if a[-1] != 'ِ':
            if a[-1] == 'ه':
                a += '‌ی'
            a += 'ِ'
    return a

tagger = POSTagger(model='scripts/resources-0.5/postagger.model')
while True:
    l = input()
    x = [f(a, b) for a, b in tagger.tag(word_tokenize(l))]
    print(' '.join(x))
