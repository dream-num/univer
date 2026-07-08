/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from 'vitest';
import { cjk } from '../cjk-regexp';

type CharsetDataUnit = [number, number];
type TestType = 'non-cjk' | 'cjk-letter' | 'cjk-punctuation';
type TestCases = Record<string, TestType>;

const CJK_LETTER_SOURCE = String.raw`[\u1100-\u11ff\u2e80-\u2e99\u2e9b-\u2ef3\u2f00-\u2fd5\u3005\u3007\u3021-\u3029\u3038-\u303b\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fd-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u321e\u3260-\u327e\u32d0-\u32fe\u3300-\u3357\u3400-\u4dbf\u4e00-\u9fff\ua960-\ua97c\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\uff66-\uff6f\uff71-\uff9d\uffa0-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]|[\ud840-\ud868\ud86a-\ud86d\ud86f-\ud872\ud874-\ud879\ud880-\ud883\ud885-\ud88c][\udc00-\udfff]|\ud81b[\udfe3\udff2-\udff6]|\ud82b[\udff0-\udff3\udff5-\udffb\udffd-\udffe]|\ud82c[\udc00-\udd22\udd32\udd50-\udd52\udd55\udd64-\udd67]|\ud83c[\ude00]|\ud869[\udc00-\udedf\udf00-\udfff]|\ud86e[\udc00-\udc1d\udc20-\udfff]|\ud873[\udc00-\udead\udeb0-\udfff]|\ud87a[\udc00-\udfe0\udff0-\udfff]|\ud87b[\udc00-\ude5d]|\ud87e[\udc00-\ude1d]|\ud884[\udc00-\udf4a\udf50-\udfff]|\ud88d[\udc00-\udc79]`;
const CJK_PUNCTUATION_SOURCE = String.raw`[\u2ff0-\u3004\u3006\u3008-\u3020\u302a-\u3037\u303c-\u303f\u30a0\u30fb-\u30fc\u3190-\u319f\u31c0-\u31ef\u321f-\u325f\u327f-\u32cf\u32ff\u3358-\u33ff\ufe10-\ufe1f\ufe30-\ufe6f\uff00-\uff65\uff70\uff9e-\uff9f\uffbf-\uffc1\uffc8-\uffc9\uffd0-\uffd1\uffd8-\uffd9\uffdd-\uffef]`;
const CJK_ALL_SOURCE = String.raw`[\u1100-\u11ff\u2e80-\u2e99\u2e9b-\u2ef3\u2f00-\u2fd5\u2ff0-\u303f\u3041-\u3096\u309d-\u30ff\u3105-\u312f\u3131-\u318e\u3190-\u4dbf\u4e00-\u9fff\ua960-\ua97c\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufe10-\ufe1f\ufe30-\ufe6f\uff00-\uffef]|[\ud840-\ud868\ud86a-\ud86d\ud86f-\ud872\ud874-\ud879\ud880-\ud883\ud885-\ud88c][\udc00-\udfff]|\ud81b[\udfe3\udff2-\udff6]|\ud82b[\udff0-\udff3\udff5-\udffb\udffd-\udffe]|\ud82c[\udc00-\udd22\udd32\udd50-\udd52\udd55\udd64-\udd67]|\ud83c[\ude00]|\ud869[\udc00-\udedf\udf00-\udfff]|\ud86e[\udc00-\udc1d\udc20-\udfff]|\ud873[\udc00-\udead\udeb0-\udfff]|\ud87a[\udc00-\udfe0\udff0-\udfff]|\ud87b[\udc00-\ude5d]|\ud87e[\udc00-\ude1d]|\ud884[\udc00-\udf4a\udf50-\udfff]|\ud88d[\udc00-\udc79]`;

const EXPECTED_CJK_LETTER_DATA: CharsetDataUnit[] = [[4352, 4607], [11904, 11929], [11931, 12019], [12032, 12245], [12293, 12293], [12295, 12295], [12321, 12329], [12344, 12347], [12353, 12438], [12445, 12447], [12449, 12538], [12541, 12543], [12549, 12591], [12593, 12686], [12704, 12735], [12784, 12830], [12896, 12926], [13008, 13054], [13056, 13143], [13312, 19903], [19968, 40959], [43360, 43388], [44032, 55203], [55216, 55238], [55243, 55291], [63744, 64109], [64112, 64217], [65382, 65391], [65393, 65437], [65440, 65470], [65474, 65479], [65482, 65487], [65490, 65495], [65498, 65500], [94179, 94179], [94194, 94198], [110576, 110579], [110581, 110587], [110589, 110590], [110592, 110882], [110898, 110898], [110928, 110930], [110933, 110933], [110948, 110951], [127488, 127488], [131072, 173791], [173824, 178205], [178208, 183981], [183984, 191456], [191472, 192093], [194560, 195101], [196608, 201546], [201552, 210041]];
const EXPECTED_CJK_PUNCTUATION_DATA: CharsetDataUnit[] = [[12272, 12292], [12294, 12294], [12296, 12320], [12330, 12343], [12348, 12351], [12448, 12448], [12539, 12540], [12688, 12703], [12736, 12783], [12831, 12895], [12927, 13007], [13055, 13055], [13144, 13311], [65040, 65055], [65072, 65135], [65280, 65381], [65392, 65392], [65438, 65439], [65471, 65473], [65480, 65481], [65488, 65489], [65496, 65497], [65501, 65519]];
const EXPECTED_CJK_ALL_DATA: CharsetDataUnit[] = [[4352, 4607], [11904, 11929], [11931, 12019], [12032, 12245], [12272, 12351], [12353, 12438], [12445, 12543], [12549, 12591], [12593, 12686], [12688, 19903], [19968, 40959], [43360, 43388], [44032, 55203], [55216, 55238], [55243, 55291], [63744, 64109], [64112, 64217], [65040, 65055], [65072, 65135], [65280, 65519], [94179, 94179], [94194, 94198], [110576, 110579], [110581, 110587], [110589, 110590], [110592, 110882], [110898, 110898], [110928, 110930], [110933, 110933], [110948, 110951], [127488, 127488], [131072, 173791], [173824, 178205], [178208, 183981], [183984, 191456], [191472, 192093], [194560, 195101], [196608, 201546], [201552, 210041]];

function casify(chars: string, type: TestType): TestCases {
    return Object.fromEntries(Array.from(chars).map((character) => [character, type]));
}

// Character samples copied from cjk-regex 3.4.0 upstream tests.
const cjkTestCases: TestCases = {
    ...casify('⻁⺪⻏', 'cjk-letter'),
    ...casify('。「」〒〓〱', 'cjk-punctuation'),
    ...casify('〻〧〨〤々', 'cjk-letter'),
    ...casify('⽒⽓⽔⽕', 'cjk-letter'),
    ...casify('⿰⿱⿲⿳', 'cjk-punctuation'),
    ...casify('あどなにぬハヒヘホ', 'cjk-letter'),
    ...casify('゠・', 'cjk-punctuation'),
    ...casify('ㇼㇽㇾㇿ', 'cjk-letter'),
    ...casify('㈱㋋㋌㋿', 'cjk-punctuation'),
    ...casify('㇀㇁㇂㇃㇄㇅㇆㇇㇈㇉㇊㇢㇣', 'cjk-punctuation'),
    ...casify('ㄅㄬㄭㄮㄯㆠㆡㆾㆿ', 'cjk-letter'),
    ...casify('ㅂㅵㅶㅷㅸꥠꥹꥺꥻퟔퟸퟹퟺퟻ', 'cjk-letter'),
    ...casify('가힠힡힢힣', 'cjk-letter'),
    ...casify('㆐㆑㆒㆓', 'cjk-punctuation'),
    ...casify('㌕㍕㍖㍗', 'cjk-letter'),
    ...casify('㍧㍻㍿㏄㏾', 'cjk-punctuation'),
    ...casify('䶼䶽䶾䶿中', 'cjk-letter'),
    ...casify('豈兀﨔隷侮恵並﨎', 'cjk-letter'),
    ...casify('﹌﹍﹎﹏﹨﹩﹪﹫！Ｄ｢￥￮', 'cjk-punctuation'),
    ...casify('ｦﾕￇ', 'cjk-letter'),
    ...casify('𬉼𬷰𬷱𬺠𬺡', 'cjk-letter'),
    ...casify('𛋸𛋹𛋺𛋻', 'non-cjk'),
    ...casify('𘳒𘳓𘳔𘳕', 'non-cjk'),
    ...casify('.a', 'non-cjk'),
    ...casify('𪛜𪛝𪛞𪛟', 'cjk-letter'),
    ...casify('𫚄𫚅𫜸𫜹', 'cjk-letter'),
    ...casify('𫝀𫝁𫝂𫝃', 'cjk-letter'),
    ...casify('𮨥𮨦𮯠', 'cjk-letter'),
    ...casify('𰀀𰀁𱍀𱍊', 'cjk-letter'),
    ...casify('𱍐𱍑𲎬𲎭', 'cjk-letter'),
    ...casify('乁你鼻𪘀', 'cjk-letter'),
    ...casify('𛄀𛄁𛄡𛄢𚿵𚿶𚿷𚿸𛀂𛀀𛀁𛃾𛃿𛅕𛄲𛅤𛅥𛅦𛅧', 'cjk-letter'),
};

describe('cjk', () => {
    it('keeps cjk-regex 3.4.0 generated sources', () => {
        expect(cjk.CJK_LETTER_REG.source).toBe(CJK_LETTER_SOURCE);
        expect(cjk.CJK_PUNCTUATION_REG.source).toBe(CJK_PUNCTUATION_SOURCE);
        expect(cjk.CJK_ALL_REG.source).toBe(CJK_ALL_SOURCE);
    });

    it('builds charset-compatible cjk-regex snapshots', () => {
        expect(cjk.letters().data).toEqual(EXPECTED_CJK_LETTER_DATA);
        expect(cjk.punctuations().data).toEqual(EXPECTED_CJK_PUNCTUATION_DATA);
        expect(cjk.all().data).toEqual(EXPECTED_CJK_ALL_DATA);
        expect(cjk.CJK_LETTER_DATA).toEqual(EXPECTED_CJK_LETTER_DATA);
        expect(cjk.CJK_PUNCTUATION_DATA).toEqual(EXPECTED_CJK_PUNCTUATION_DATA);
        expect(cjk.CJK_ALL_DATA).toEqual(EXPECTED_CJK_ALL_DATA);
    });

    describe('matches cjk-regex 3.4.0 character categories', () => {
        const allReg = cjk.all().toRegExp('u');
        const lettersReg = cjk.letters().toRegExp('u');
        const punctuationsReg = cjk.punctuations().toRegExp('u');

        for (const [character, category] of Object.entries(cjkTestCases)) {
            const title = `"${character}" (0x${character.codePointAt(0)!.toString(16)}) is ${category}`;

            it(title, () => {
                switch (category) {
                    case 'non-cjk': {
                        expect(character).not.toMatch(allReg);
                        expect(character).not.toMatch(lettersReg);
                        expect(character).not.toMatch(punctuationsReg);
                        expect(cjk.hasCJK(character)).toBe(false);
                        expect(cjk.hasCJKText(character)).toBe(false);
                        expect(cjk.hasCJKPunctuation(character)).toBe(false);
                        break;
                    }
                    case 'cjk-letter': {
                        expect(character).toMatch(allReg);
                        expect(character).toMatch(lettersReg);
                        expect(character).not.toMatch(punctuationsReg);
                        expect(cjk.hasCJK(character)).toBe(true);
                        expect(cjk.hasCJKText(character)).toBe(true);
                        expect(cjk.hasCJKPunctuation(character)).toBe(false);
                        break;
                    }
                    case 'cjk-punctuation': {
                        expect(character).toMatch(allReg);
                        expect(character).not.toMatch(lettersReg);
                        expect(character).toMatch(punctuationsReg);
                        expect(cjk.hasCJK(character)).toBe(true);
                        expect(cjk.hasCJKText(character)).toBe(false);
                        expect(cjk.hasCJKPunctuation(character)).toBe(true);
                        break;
                    }
                    default: {
                        throw new Error(`Unexpected category "${category}"`);
                    }
                }
            });
        }
    });
});
