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
    BESSELI: {
        description: 'Vracia modifikovanú Besselovu funkciu In(x)',
        abstract: 'Vracia modifikovanú Besselovu funkciu In(x)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť funkciu.' },
            n: { name: 'n', detail: 'Rád Besselovej funkcie. Ak n nie je celé číslo, skráti sa.' },
        },
    },
    BESSELJ: {
        description: 'Vracia Besselovu funkciu Jn(x)',
        abstract: 'Vracia Besselovu funkciu Jn(x)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť funkciu.' },
            n: { name: 'n', detail: 'Rád Besselovej funkcie. Ak n nie je celé číslo, skráti sa.' },
        },
    },
    BESSELK: {
        description: 'Vracia modifikovanú Besselovu funkciu Kn(x)',
        abstract: 'Vracia modifikovanú Besselovu funkciu Kn(x)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť funkciu.' },
            n: { name: 'n', detail: 'Rád Besselovej funkcie. Ak n nie je celé číslo, skráti sa.' },
        },
    },
    BESSELY: {
        description: 'Vracia Besselovu funkciu Yn(x)',
        abstract: 'Vracia Besselovu funkciu Yn(x)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť funkciu.' },
            n: { name: 'n', detail: 'Rád Besselovej funkcie. Ak n nie je celé číslo, skráti sa.' },
        },
    },
    BIN2DEC: {
        description: 'Konvertuje binárne číslo na desiatkové',
        abstract: 'Konvertuje binárne číslo na desiatkové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Binárne číslo, ktoré chcete previesť.' },
        },
    },
    BIN2HEX: {
        description: 'Konvertuje binárne číslo na hexadecimálne',
        abstract: 'Konvertuje binárne číslo na hexadecimálne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Binárne číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    BIN2OCT: {
        description: 'Skonvertuje binárne číslo na osmičkové.',
        abstract: 'Skonvertuje binárne číslo na osmičkové.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Povinné. Binárne číslo, ktoré chcete skonvertovať. Číslo nesmie obsahovať viac než 10 znakov (10 bitov). Najvýznamnejší bit čísla je bit znamienka. Zvyšných 9 bitov určuje veľkosť čísla. Záporné čísla sa vyjadrujú pomocou binárnej doplnkovej notácie.' },
            places: { name: 'počet_znakov', detail: 'Voliteľný argument. Počet znakov, ktoré sa majú použiť. Ak je tento argument vynechaný, funkcia BIN2OCT používa najmenší potrebný počet znakov. Tento argument je užitočný, ak chcete výslednú hodnotu doplniť zľava nulami.' },
        },
    },
    BITAND: {
        description: 'Vráti bitový operátor AND dvoch čísel.',
        abstract: 'Vráti bitový operátor AND dvoch čísel.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Povinné. Hodnota musí byť v formáte desatinného čísla a väčšia alebo rovná 0.' },
            number2: { name: 'číslo2', detail: 'Povinné. Hodnota musí byť v formáte desatinného čísla a väčšia alebo rovná 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Vracia hodnotu number posunutú doľava o shift_amount bitov',
        abstract: 'Vracia hodnotu number posunutú doľava o shift_amount bitov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo musí byť celé a väčšie alebo rovné 0.' },
            shiftAmount: { name: 'posun', detail: 'Posun musí byť celé číslo.' },
        },
    },
    BITOR: {
        description: 'Vracia bitový OR dvoch čísel',
        abstract: 'Vracia bitový OR dvoch čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Musí byť v desiatkovej forme a väčšie alebo rovné 0.' },
            number2: { name: 'číslo2', detail: 'Musí byť v desiatkovej forme a väčšie alebo rovné 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Vracia hodnotu number posunutú doprava o shift_amount bitov',
        abstract: 'Vracia hodnotu number posunutú doprava o shift_amount bitov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo musí byť celé a väčšie alebo rovné 0.' },
            shiftAmount: { name: 'posun', detail: 'Posun musí byť celé číslo.' },
        },
    },
    BITXOR: {
        description: 'Vracia bitový XOR (exkluzívne OR) dvoch čísel',
        abstract: 'Vracia bitový XOR (exkluzívne OR) dvoch čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Musí byť v desiatkovej forme a väčšie alebo rovné 0.' },
            number2: { name: 'číslo2', detail: 'Musí byť v desiatkovej forme a väčšie alebo rovné 0.' },
        },
    },
    COMPLEX: {
        description: 'Konvertuje reálne a imaginárne koeficienty na komplexné číslo',
        abstract: 'Konvertuje reálne a imaginárne koeficienty na komplexné číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'reálna_časť', detail: 'Reálny koeficient komplexného čísla.' },
            iNum: { name: 'imaginárna_časť', detail: 'Imaginárny koeficient komplexného čísla.' },
            suffix: { name: 'sufix', detail: 'Sufix imaginárnej zložky komplexného čísla. Ak je vynechaný, predpokladá sa "i".' },
        },
    },
    CONVERT: {
        description: 'Konvertuje číslo z jednej sústavy mier na inú',
        abstract: 'Konvertuje číslo z jednej sústavy mier na inú',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota v jednotkách from_unit, ktorú chcete previesť.' },
            fromUnit: { name: 'z_jednotky', detail: 'Jednotky pre číslo.' },
            toUnit: { name: 'na_jednotky', detail: 'Jednotky výsledku.' },
        },
    },
    DEC2BIN: {
        description: 'Konvertuje desiatkové číslo na binárne',
        abstract: 'Konvertuje desiatkové číslo na binárne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Desiatkové číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    DEC2HEX: {
        description: 'Konvertuje desiatkové číslo na hexadecimálne',
        abstract: 'Konvertuje desiatkové číslo na hexadecimálne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Desiatkové číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    DEC2OCT: {
        description: 'Konvertuje desiatkové číslo na oktalové',
        abstract: 'Konvertuje desiatkové číslo na oktalové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Desiatkové číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    DELTA: {
        description: 'Testuje, či sú dve hodnoty rovnaké',
        abstract: 'Testuje, či sú dve hodnoty rovnaké',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo.' },
            number2: { name: 'číslo2', detail: 'Druhé číslo. Ak je vynechané, number2 sa považuje za nulu.' },
        },
    },
    ERF: {
        description: 'Vracia funkciu chyby',
        abstract: 'Vracia funkciu chyby',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'dolná_hranica', detail: 'Dolná hranica pre integráciu ERF.' },
            upperLimit: { name: 'horná_hranica', detail: 'Horná hranica pre integráciu ERF. Ak je vynechaná, ERF integruje medzi nulu a lower_limit.' },
        },
    },
    ERF_PRECISE: {
        description: 'Vracia funkciu chyby',
        abstract: 'Vracia funkciu chyby',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Dolná hranica pre integráciu ERF.PRECISE.' },
        },
    },
    ERFC: {
        description: 'Vracia doplnkovú funkciu chyby',
        abstract: 'Vracia doplnkovú funkciu chyby',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Dolná hranica pre integráciu ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Vracia doplnkovú funkciu ERF integrovanú od x po nekonečno',
        abstract: 'Vracia doplnkovú funkciu ERF integrovanú od x po nekonečno',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Dolná hranica pre integráciu ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'Testuje, či je číslo väčšie alebo rovné prahovej hodnote',
        abstract: 'Testuje, či je číslo väčšie alebo rovné prahovej hodnote',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorá sa testuje voči prahu.' },
            step: { name: 'prah', detail: 'Prahová hodnota. Ak je step vynechaný, GESTEP použije nulu.' },
        },
    },
    HEX2BIN: {
        description: 'Konvertuje hexadecimálne číslo na binárne',
        abstract: 'Konvertuje hexadecimálne číslo na binárne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hexadecimálne číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    HEX2DEC: {
        description: 'Konvertuje hexadecimálne číslo na desiatkové',
        abstract: 'Konvertuje hexadecimálne číslo na desiatkové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hexadecimálne číslo, ktoré chcete previesť.' },
        },
    },
    HEX2OCT: {
        description: 'Konvertuje hexadecimálne číslo na oktalové',
        abstract: 'Konvertuje hexadecimálne číslo na oktalové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hexadecimálne číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    IMABS: {
        description: 'Vracia absolútnu hodnotu (modul) komplexného čísla',
        abstract: 'Vracia absolútnu hodnotu (modul) komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete absolútnu hodnotu.' },
        },
    },
    IMAGINARY: {
        description: 'Vráti imaginárny koeficient komplexného čísla zadaného vo formáte x + yi alebo x + yj.',
        abstract: 'Vráti imaginárny koeficient komplexného čísla zadaného vo formáte x + yi alebo x + yj.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Povinné. Komplexné číslo, ktorého imaginárny koeficient chcete zistiť.' },
        },
    },
    IMARGUMENT: {
        description: 'Vracia argument theta, uhol vyjadrený v radiánoch',
        abstract: 'Vracia argument theta, uhol vyjadrený v radiánoch',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete argument theta.' },
        },
    },
    IMCONJUGATE: {
        description: 'Vracia komplexne združené číslo',
        abstract: 'Vracia komplexne združené číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete združené číslo.' },
        },
    },
    IMCOS: {
        description: 'Vracia kosínus komplexného čísla',
        abstract: 'Vracia kosínus komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete kosínus.' },
        },
    },
    IMCOSH: {
        description: 'Vracia hyperbolický kosínus komplexného čísla',
        abstract: 'Vracia hyperbolický kosínus komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete hyperbolický kosínus.' },
        },
    },
    IMCOT: {
        description: 'Vracia kotangens komplexného čísla',
        abstract: 'Vracia kotangens komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete kotangens.' },
        },
    },
    IMCOTH: {
        description: 'Vracia hyperbolický kotangens komplexného čísla',
        abstract: 'Vracia hyperbolický kotangens komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/9366256?hl=sk',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete hyperbolický kotangens.' },
        },
    },
    IMCSC: {
        description: 'Vracia kosekans komplexného čísla',
        abstract: 'Vracia kosekans komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete kosekans.' },
        },
    },
    IMCSCH: {
        description: 'Vracia hyperbolický kosekans komplexného čísla',
        abstract: 'Vracia hyperbolický kosekans komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete hyperbolický kosekans.' },
        },
    },
    IMDIV: {
        description: 'Vracia podiel dvoch komplexných čísel',
        abstract: 'Vracia podiel dvoch komplexných čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'čitateľ', detail: 'Komplexný čitateľ alebo delenec.' },
            inumber2: { name: 'menovateľ', detail: 'Komplexný menovateľ alebo deliteľ.' },
        },
    },
    IMEXP: {
        description: 'Vracia exponenciálu komplexného čísla',
        abstract: 'Vracia exponenciálu komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete exponenciálu.' },
        },
    },
    IMLN: {
        description: 'Vracia prirodzený logaritmus komplexného čísla',
        abstract: 'Vracia prirodzený logaritmus komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete prirodzený logaritmus.' },
        },
    },
    IMLOG: {
        description: 'Vracia logaritmus komplexného čísla so zadaným základom',
        abstract: 'Vracia logaritmus komplexného čísla so zadaným základom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/9366486?hl=sk',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete vypočítať logaritmus so zadaným základom.' },
            base: { name: 'základ', detail: 'Základ použitý pri výpočte logaritmu.' },
        },
    },
    IMLOG10: {
        description: 'Vracia logaritmus komplexného čísla so základom 10',
        abstract: 'Vracia logaritmus komplexného čísla so základom 10',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete bežný logaritmus.' },
        },
    },
    IMLOG2: {
        description: 'Vracia logaritmus komplexného čísla so základom 2',
        abstract: 'Vracia logaritmus komplexného čísla so základom 2',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete logaritmus so základom 2.' },
        },
    },
    IMPOWER: {
        description: 'Vracia komplexné číslo umocnené na celé číslo',
        abstract: 'Vracia komplexné číslo umocnené na celé číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, ktoré chcete umocniť.' },
            number: { name: 'exponent', detail: 'Exponent, na ktorý chcete komplexné číslo umocniť.' },
        },
    },
    IMPRODUCT: {
        description: 'Vracia súčin 1 až 255 komplexných čísel',
        abstract: 'Vracia súčin 1 až 255 komplexných čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'komplexné_číslo1', detail: '1 až 255 komplexných čísel na násobenie.' },
            inumber2: { name: 'komplexné_číslo2', detail: '1 až 255 komplexných čísel na násobenie.' },
        },
    },
    IMREAL: {
        description: 'Vracia reálny koeficient komplexného čísla',
        abstract: 'Vracia reálny koeficient komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete reálny koeficient.' },
        },
    },
    IMSEC: {
        description: 'Vracia sekans komplexného čísla',
        abstract: 'Vracia sekans komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete sekans.' },
        },
    },
    IMSECH: {
        description: 'Vracia hyperbolický sekans komplexného čísla',
        abstract: 'Vracia hyperbolický sekans komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete hyperbolický sekans.' },
        },
    },
    IMSIN: {
        description: 'Vracia sínus komplexného čísla',
        abstract: 'Vracia sínus komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete sínus.' },
        },
    },
    IMSINH: {
        description: 'Vracia hyperbolický sínus komplexného čísla',
        abstract: 'Vracia hyperbolický sínus komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete hyperbolický sínus.' },
        },
    },
    IMSQRT: {
        description: 'Vracia druhú odmocninu komplexného čísla',
        abstract: 'Vracia druhú odmocninu komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete druhú odmocninu.' },
        },
    },
    IMSUB: {
        description: 'Vracia rozdiel dvoch komplexných čísel',
        abstract: 'Vracia rozdiel dvoch komplexných čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'komplexné_číslo1', detail: 'komplexné_číslo1.' },
            inumber2: { name: 'komplexné_číslo2', detail: 'komplexné_číslo2.' },
        },
    },
    IMSUM: {
        description: 'Vracia súčet komplexných čísel',
        abstract: 'Vracia súčet komplexných čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'komplexné_číslo1', detail: '1 až 255 komplexných čísel na sčítanie.' },
            inumber2: { name: 'komplexné_číslo2', detail: '1 až 255 komplexných čísel na sčítanie.' },
        },
    },
    IMTAN: {
        description: 'Vracia tangens komplexného čísla',
        abstract: 'Vracia tangens komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete tangens.' },
        },
    },
    IMTANH: {
        description: 'Vracia hyperbolický tangens komplexného čísla',
        abstract: 'Vracia hyperbolický tangens komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/9366655?hl=sk',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete hyperbolický tangens.' },
        },
    },
    OCT2BIN: {
        description: 'Konvertuje oktalové číslo na binárne',
        abstract: 'Konvertuje oktalové číslo na binárne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Oktalové číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    OCT2DEC: {
        description: 'Konvertuje oktalové číslo na desiatkové',
        abstract: 'Konvertuje oktalové číslo na desiatkové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Oktalové číslo, ktoré chcete previesť.' },
        },
    },
    OCT2HEX: {
        description: 'Konvertuje oktalové číslo na hexadecimálne',
        abstract: 'Konvertuje oktalové číslo na hexadecimálne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Oktalové číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
};

export default locale;
