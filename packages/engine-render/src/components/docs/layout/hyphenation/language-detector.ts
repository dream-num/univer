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

import type { IDisposable, Nullable } from '@univerjs/core';
import { franc } from 'franc-min';
import { Lang } from './lang';

const LANG_MAP_TO_HYPHEN_LANG: Record<string, Lang> = {
    // cmn Mandarin Chinese 885M
    spa: Lang.Es, // Spanish 332M
    eng: Lang.EnUs, // English 322M
    rus: Lang.Ru, // Russian 288M
    // arb: Standard Arabic 280M
    ben: Lang.Bn, // Bengali 196M
    hin: Lang.Hi, // Hindi 182M
    por: Lang.Pt, // Portuguese 182M
    ind: Lang.Id, // Indonesian 140M
    // jpn: Japanese 125M
    fra: Lang.Fr, // French 124M
    deu: Lang.De1901, // German 121M TODO: use which langs: German?
    // jav: Javanese(Javanese) 76M
    // jav: Javanese(Latin) 76M
    // kor: Korean 75M
    tel: Lang.Te, // Telugu 73M
    // vie: Vietnamese 67M
    mar: Lang.Mr, // Marathi 65M
    ita: Lang.It, // Italian 63M
    tam: Lang.Ta, // Tamil 62M
    tur: Lang.Tr, // Turkish 59M
    // urd: Urdu 54M
    guj: Lang.Gu, // Gujarati 44M
    pol: Lang.Pl, // Polish 44M
    ukr: Lang.Uk, // Ukrainian 41M
    kan: Lang.Kn, // Kannada 38M
    // mai: Maithili 35M
    mal: Lang.Ml, // Malayalam 34M
    // pes: Iranian Persian 33M
    // mya: Burmese 31M
    // swh: Swahili(individual language)
    // sun: Sundanese 27M
    ron: Lang.Ro, // Romanian 26M
    pan: Lang.Pa, // Panjabi 26M
    // bho: Bhojpuri 25M
    // amh: Amharic 23M
    // hau: Hausa 22M
    // fuv: Nigerian Fulfulde 22M
    // bos: Bosnian(Cyrillic) 21M
    // bos: Bosnian(Latin) 21M
    hrv: Lang.Hr, // Croatian 21M
    nld: Lang.Nl, // Dutch 21M
    srp: Lang.SrCyrl, // Serbian(Cyrillic) 21M
    // srp: Serbian(Latin) 21M
    tha: Lang.Th, // Thai 21M
    // ckb: Central Kurdish 20M
    // yor: Yoruba 20M
    uzn: Lang.Kmr, // Northern Uzbek(Cyrillic) 18M
    // uzn: Northern Uzbek(Latin) 18M
    zlm: Lang.Ml, // Malay(individual language)(Arabic) 18M
    // zlm: Malay(individual language)(Latin) 18M
    // ibo: Igbo 17M
    // npi: Nepali(individual language) 16M
    // ceb: Cebuano 15M
    // skr: Saraiki 15M
    // tgl: Tagalog 15M
    hun: Lang.Hu, // Hungarian 15M
    // azj: North Azerbaijani(Cyrillic) 14M
    // azj: North Azerbaijani(Latin) 14M
    // sin: Sinhala 13M
    // koi: Komi - Permyak 13M
    ell: Lang.ElMonoton, // Modern Greek(1453-) 12M
    ces: Lang.Cs, // Czech 12M
    // mag: Magahi 11M
    // run: Rundi 11M
    bel: Lang.Be, // Belarusian 10M
    // plt: Plateau Malagasy 10M
    // qug: Chimborazo Highland Quichua 10M
    // mad: Madurese 10M
    // nya: Nyanja 10M
    // zyb: Yongbei Zhuang 10M
    // pbu: Northern Pashto 10M
    // kin: Kinyarwanda 9M
    // zul: Zulu 9M
    bul: Lang.Bg, // Bulgarian 9M
    swe: Lang.Sv, // Swedish 9M
    // lin: Lingala 8M
    // som: Somali 8M
    // hms: Southern Qiandong Miao 8M
    // hnj: Hmong Njua 8M
    // ilo: Iloko 8M
    // kaz: Kazakh
    und: Lang.UNKNOWN, // Undetermined
};

export class LanguageDetector implements IDisposable {
    // language cache for special text.
    private _detectCache = new Map<string, Lang>();

    private static _instance: Nullable<LanguageDetector> = null;

    static getInstance(): LanguageDetector {
        if (this._instance == null) {
            this._instance = new LanguageDetector();
        }

        return this._instance;
    }

    detect(text: string): Lang {
        let lang = this._detectCache.get(text);

        if (lang) {
            return lang;
        }

        const francLang = franc(text);

        lang = LANG_MAP_TO_HYPHEN_LANG[francLang] ?? Lang.UNKNOWN;

        this._detectCache.set(text, lang);

        return lang;
    }

    dispose() {
        this._detectCache.clear();
    }
}
