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

import type enUS from './en-US';

const locale: typeof enUS = {
    BETADIST: {
        description: 'Vracia beta kumulatívnu distribučnú funkciu',
        abstract: 'Vracia beta kumulatívnu distribučnú funkciu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/betadist-function-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota medzi A a B, v ktorej chcete vyhodnotiť funkciu.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            A: { name: 'A', detail: 'Dolná hranica intervalu x.' },
            B: { name: 'B', detail: 'Horná hranica intervalu x.' },
        },
    },
    BETAINV: {
        description: 'Vracia inverznú kumulatívnu distribučnú funkciu pre zadané beta rozdelenie',
        abstract: 'Vracia inverznú kumulatívnu distribučnú funkciu pre zadané beta rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/betainv-function-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť priradená beta rozdeleniu.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            A: { name: 'A', detail: 'Dolná hranica intervalu x.' },
            B: { name: 'B', detail: 'Horná hranica intervalu x.' },
        },
    },
    BINOMDIST: {
        description: 'Vracia pravdepodobnosť jednotlivého člena binomického rozdelenia',
        abstract: 'Vracia pravdepodobnosť jednotlivého člena binomického rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/binomdist-function-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            numberS: { name: 'počet_uspechov', detail: 'Počet úspechov v pokusoch.' },
            trials: { name: 'pokusy', detail: 'Počet nezávislých pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_uspechu', detail: 'Pravdepodobnosť úspechu v každom pokuse.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, BINOMDIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    CHIDIST: {
        description: 'Vracia pravostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        abstract: 'Vracia pravostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/chidist-function-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    CHIINV: {
        description: 'Vracia inverznú pravostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        abstract: 'Vracia inverznú pravostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/chiinv-function-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť priradená chí-kvadrát rozdeleniu.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    CHITEST: {
        description: 'Vracia test nezávislosti',
        abstract: 'Vracia test nezávislosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/chitest-function-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            actualRange: { name: 'skutočný_rozsah', detail: 'Rozsah údajov obsahujúci pozorovania, ktoré sa testujú voči očakávaným hodnotám.' },
            expectedRange: { name: 'očakávaný_rozsah', detail: 'Rozsah údajov obsahujúci pomer súčtov riadkov a stĺpcov k celkovému súčtu.' },
        },
    },
    CONFIDENCE: {
        description: 'Vracia interval spoľahlivosti pre populačný priemer pomocou normálneho rozdelenia.',
        abstract: 'Vracia interval spoľahlivosti pre populačný priemer pomocou normálneho rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/confidence-function-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'Hladina významnosti použitá na výpočet spoľahlivosti. Úroveň spoľahlivosti je 100*(1 - alfa)%, napr. alfa 0,05 znamená 95 % spoľahlivosť.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Populačná štandardná odchýlka pre rozsah údajov, ktorá sa považuje za známu.' },
            size: { name: 'veľkosť', detail: 'Veľkosť vzorky.' },
        },
    },
    COVAR: {
        description: 'Vracia kovarianciu populácie, priemer súčinov odchýlok pre každý pár údajov v dvoch množinách.',
        abstract: 'Vracia kovarianciu populácie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/covar-function-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvý rozsah hodnôt buniek.' },
            array2: { name: 'pole2', detail: 'Druhý rozsah hodnôt buniek.' },
        },
    },
    CRITBINOM: {
        description: 'Vracia najmenšiu hodnotu, pre ktorú je kumulatívne binomické rozdelenie menšie alebo rovné kritériu',
        abstract: 'Vracia najmenšiu hodnotu, pre ktorú je kumulatívne binomické rozdelenie menšie alebo rovné kritériu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/critbinom-function-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            trials: { name: 'pokusy', detail: 'Počet Bernoulliho pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_uspechu', detail: 'Pravdepodobnosť úspechu v každom pokuse.' },
            alpha: { name: 'alfa', detail: 'Kritériová hodnota.' },
        },
    },
    EXPONDIST: {
        description: 'Vracia exponenciálne rozdelenie',
        abstract: 'Vracia exponenciálne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/expondist-function-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            lambda: { name: 'lambda', detail: 'Hodnota parametra.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, EXPONDIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    FDIST: {
        description: 'Vracia (pravostranné) F-rozdelenie pravdepodobnosti',
        abstract: 'Vracia (pravostranné) F-rozdelenie pravdepodobnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/fdist-function-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť funkciu.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Počet stupňov voľnosti v menovateli.' },
        },
    },
    FINV: {
        description: 'Vracia inverzné (pravostranné) F-rozdelenie pravdepodobnosti',
        abstract: 'Vracia inverzné (pravostranné) F-rozdelenie pravdepodobnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/finv-function-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť priradená kumulatívnemu F-rozdeleniu.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Počet stupňov voľnosti v menovateli.' },
        },
    },
    FTEST: {
        description: 'Vracia výsledok F-testu',
        abstract: 'Vracia výsledok F-testu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/ftest-function-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvé pole alebo rozsah údajov.' },
            array2: { name: 'pole2', detail: 'Druhé pole alebo rozsah údajov.' },
        },
    },
    GAMMADIST: {
        description: 'Vracia gama rozdelenie',
        abstract: 'Vracia gama rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/gammadist-function-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete rozdelenie.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, GAMMADIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    GAMMAINV: {
        description: 'Vracia inverznú kumulatívnu gama distribúciu',
        abstract: 'Vracia inverznú kumulatívnu gama distribúciu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/gammainv-function-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť priradená gama rozdeleniu.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Vracia hypergeometrické rozdelenie',
        abstract: 'Vracia hypergeometrické rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/hypgeomdist-function-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            sampleS: { name: 'úspechy_vzorka', detail: 'Počet úspechov vo vzorke.' },
            numberSample: { name: 'veľkosť_vzorky', detail: 'Veľkosť vzorky.' },
            populationS: { name: 'úspechy_populácia', detail: 'Počet úspechov v populácii.' },
            numberPop: { name: 'veľkosť_populácie', detail: 'Veľkosť populácie.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, HYPGEOMDIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    LOGINV: {
        description: 'Vracia inverznú kumulatívnu distribučnú funkciu lognormálneho rozdelenia',
        abstract: 'Vracia inverznú kumulatívnu distribučnú funkciu lognormálneho rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/loginv-function-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť zodpovedajúca lognormálnemu rozdeleniu.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka rozdelenia.' },
        },
    },
    LOGNORMDIST: {
        description: 'Vracia kumulatívne lognormálne rozdelenie',
        abstract: 'Vracia kumulatívne lognormálne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/lognormdist-function-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete rozdelenie.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, LOGNORMDIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    MODE: {
        description: 'Vracia najčastejšiu hodnotu v množine údajov',
        abstract: 'Vracia najčastejšiu hodnotu v množine údajov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/mode-function-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktoré chcete vypočítať modus.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete vypočítať modus, maximálne 255.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Vracia negatívne binomické rozdelenie',
        abstract: 'Vracia negatívne binomické rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/negbinomdist-function-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            numberF: { name: 'počet_neúspechov', detail: 'Počet neúspechov.' },
            numberS: { name: 'počet_uspechov', detail: 'Prahový počet úspechov.' },
            probabilityS: { name: 'pravdepodobnosť_uspechu', detail: 'Pravdepodobnosť úspechu.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, NEGBINOMDIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    NORMDIST: {
        description: 'Vracia normálne kumulatívne rozdelenie',
        abstract: 'Vracia normálne kumulatívne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/normdist-function-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete rozdelenie.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, NORMDIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    NORMINV: {
        description: 'Vracia inverznú kumulatívnu distribúciu normálneho rozdelenia',
        abstract: 'Vracia inverznú kumulatívnu distribúciu normálneho rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/norminv-function-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť zodpovedajúca normálnemu rozdeleniu.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka rozdelenia.' },
        },
    },
    NORMSDIST: {
        description: 'Vracia štandardné normálne kumulatívne rozdelenie',
        abstract: 'Vracia štandardné normálne kumulatívne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/normsdist-function-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Hodnota, pre ktorú chcete rozdelenie.' },
        },
    },
    NORMSINV: {
        description: 'Vracia inverznú kumulatívnu distribúciu štandardného normálneho rozdelenia',
        abstract: 'Vracia inverznú kumulatívnu distribúciu štandardného normálneho rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/normsinv-function-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť zodpovedajúca normálnemu rozdeleniu.' },
        },
    },
    PERCENTILE: {
        description: 'Vracia k-ty percentil hodnôt v množine údajov (zahŕňa 0 a 1)',
        abstract: 'Vracia k-ty percentil hodnôt v množine údajov (zahŕňa 0 a 1)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/percentile-function-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, ktorý definuje relatívne poradie.' },
            k: { name: 'k', detail: 'Percentil v rozsahu 0 až 1 (zahŕňa 0 a 1).' },
        },
    },
    PERCENTRANK: {
        description: 'Vracia percentilové poradie hodnoty v množine údajov (zahŕňa 0 a 1)',
        abstract: 'Vracia percentilové poradie hodnoty v množine údajov (zahŕňa 0 a 1)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/percentrank-function-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, ktorý definuje relatívne poradie.' },
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete poznať poradie.' },
            significance: { name: 'významnosť', detail: 'Hodnota určujúca počet platných číslic pre vrátenú percentuálnu hodnotu. Ak je vynechaná, PERCENTRANK.INC použije tri číslice (0.xxx).' },
        },
    },
    POISSON: {
        description: 'Vracia Poissonovo rozdelenie',
        abstract: 'Vracia Poissonovo rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/poisson-function-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete rozdelenie.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, POISSON vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    QUARTILE: {
        description: 'Vracia kvartil množiny údajov (zahŕňa 0 a 1)',
        abstract: 'Vracia kvartil množiny údajov (zahŕňa 0 a 1)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/quartile-function-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, pre ktoré chcete hodnoty kvartilu.' },
            quart: { name: 'kvartil', detail: 'Hodnota kvartilu, ktorú chcete vrátiť.' },
        },
    },
    RANK: {
        description: 'Vracia poradie čísla v zozname čísel',
        abstract: 'Vracia poradie čísla v zozname čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/rank-function-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktorého poradie chcete zistiť.' },
            ref: { name: 'odkaz', detail: 'Odkaz na zoznam čísel. Nečíselné hodnoty v odkaze sa ignorujú.' },
            order: { name: 'poradie', detail: 'Číslo určujúce spôsob určovania poradia. Ak je order 0 alebo vynechané, Excel určuje poradie zostupne. Ak je order nenulové, Excel určuje poradie vzostupne.' },
        },
    },
    STDEV: {
        description: 'Odhaduje štandardnú odchýlku na základe vzorky. Štandardná odchýlka je miera rozptýlenia hodnôt od priemeru.',
        abstract: 'Odhaduje štandardnú odchýlku na základe vzorky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/stdev-function-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvý číselný argument zodpovedajúci vzorke populácie.' },
            number2: { name: 'číslo2', detail: 'Číselné argumenty 2 až 255 zodpovedajúce vzorke populácie. Môžete použiť aj jedno pole alebo odkaz na pole namiesto argumentov oddelených čiarkou.' },
        },
    },
    STDEVP: {
        description: 'Vypočíta štandardnú odchýlku na základe celej populácie zadanej argumentmi.',
        abstract: 'Vypočíta štandardnú odchýlku na základe celej populácie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/stdevp-function-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvý číselný argument zodpovedajúci populácii.' },
            number2: { name: 'číslo2', detail: 'Číselné argumenty 2 až 255 zodpovedajúce populácii. Môžete použiť aj jedno pole alebo odkaz na pole namiesto argumentov oddelených čiarkou.' },
        },
    },
    TDIST: {
        description: 'Vracia pravdepodobnosť pre Studentovo t-rozdelenie',
        abstract: 'Vracia pravdepodobnosť pre Studentovo t-rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/tdist-function-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Číselná hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Celé číslo určujúce počet stupňov voľnosti.' },
            tails: { name: 'chvosty', detail: 'Určuje počet chvostov rozdelenia. Ak tails = 1, TDIST vráti jednostranné rozdelenie. Ak tails = 2, TDIST vráti obojstranné rozdelenie.' },
        },
    },
    TINV: {
        description: 'Vracia inverznú pravdepodobnosť pre Studentovo t-rozdelenie (obojstranné)',
        abstract: 'Vracia inverznú pravdepodobnosť pre Studentovo t-rozdelenie (obojstranné)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/tinv-function-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť priradená Studentovmu t-rozdeleniu.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Celé číslo určujúce počet stupňov voľnosti.' },
        },
    },
    TTEST: {
        description: 'Vracia pravdepodobnosť priradenú Studentovmu t-testu',
        abstract: 'Vracia pravdepodobnosť priradenú Studentovmu t-testu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/ttest-function-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvé pole alebo rozsah údajov.' },
            array2: { name: 'pole2', detail: 'Druhé pole alebo rozsah údajov.' },
            tails: { name: 'chvosty', detail: 'Určuje počet chvostov rozdelenia. Ak tails = 1, TTEST používa jednostranné rozdelenie. Ak tails = 2, TTEST používa obojstranné rozdelenie.' },
            type: { name: 'typ', detail: 'Typ t-testu, ktorý sa má vykonať.' },
        },
    },
    VAR: {
        description: 'Odhaduje rozptyl na základe vzorky.',
        abstract: 'Odhaduje rozptyl na základe vzorky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/var-function-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvý číselný argument zodpovedajúci vzorke populácie.' },
            number2: { name: 'číslo2', detail: 'Číselné argumenty 2 až 255 zodpovedajúce vzorke populácie.' },
        },
    },
    VARP: {
        description: 'Vypočíta rozptyl na základe celej populácie.',
        abstract: 'Vypočíta rozptyl na základe celej populácie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/varp-function-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvý číselný argument zodpovedajúci populácii.' },
            number2: { name: 'číslo2', detail: 'Číselné argumenty 2 až 255 zodpovedajúce populácii.' },
        },
    },
    WEIBULL: {
        description: 'Vracia Weibullovo rozdelenie',
        abstract: 'Vracia Weibullovo rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/weibull-function-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete rozdelenie.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota určujúca tvar funkcie. Ak cumulative je TRUE, WEIBULL vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti funkciu hustoty pravdepodobnosti.' },
        },
    },
    ZTEST: {
        description: 'Vracia jednostrannú pravdepodobnostnú hodnotu z-testu',
        abstract: 'Vracia jednostrannú pravdepodobnostnú hodnotu z-testu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/ztest-function-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, voči ktorému sa testuje x.' },
            x: { name: 'x', detail: 'Hodnota, ktorú chcete testovať.' },
            sigma: { name: 'sigma', detail: 'Populačná (známa) štandardná odchýlka. Ak je vynechaná, použije sa výberová štandardná odchýlka.' },
        },
    },
};

export default locale;
