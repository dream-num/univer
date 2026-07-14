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
    ABS: {
        description: 'Vracia absolútnu hodnotu čísla. Absolútna hodnota čísla je číslo bez znamienka.',
        abstract: 'Vracia absolútnu hodnotu čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Reálne číslo, ktorého absolútnu hodnotu chcete.' },
        },
    },
    ACOS: {
        description: 'Vracia arkuskosínus (inverzný kosínus) čísla. Arkuskosínus čísla je uhol, ktorého kosínus je číslo. Uhol je v radiánoch v rozsahu 0 až pi.',
        abstract: 'Vracia arkuskosínus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Kosínus požadovaného uhla; musí byť v rozsahu od -1 do 1.' },
        },
    },
    ACOSH: {
        description: 'Vracia inverzný hyperbolický kosínus čísla. Číslo musí byť väčšie alebo rovné 1. Inverzný hyperbolický kosínus čísla je hodnota, ktorej hyperbolický kosínus je číslo, takže ACOSH(COSH(číslo)) sa rovná číslu.',
        abstract: 'Vracia inverzný hyperbolický kosínus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo väčšie alebo rovné 1.' },
        },
    },
    ACOT: {
        description: 'Vracia hlavné hodnoty arkuskotangensu (inverzného kotangensu) čísla.',
        abstract: 'Vracia arkuskotangens čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: {
                name: 'číslo',
                detail: 'Číslo je kotangens požadovaného uhla. Musí to byť reálne číslo.',
            },
        },
    },
    ACOTH: {
        description: 'Vracia hyperbolický arkuskotangens čísla',
        abstract: 'Vracia hyperbolický arkuskotangens čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Absolútna hodnota čísla musí byť väčšia ako 1.' },
        },
    },
    AGGREGATE: {
        description: 'Vracia agregovanú hodnotu v zozname alebo databáze',
        abstract: 'Vracia agregovanú hodnotu v zozname alebo databáze',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'číslo_funkcie', detail: 'Číslo 1 až 19, ktoré určuje, ktorú funkciu použiť.' },
            options: { name: 'možnosti', detail: 'Číselná hodnota, ktorá určuje, ktoré hodnoty sa majú v rozsahu hodnotenia pre funkciu ignorovať.' },
            ref1: { name: 'odkaz1', detail: 'Prvý číselný argument pre funkcie, ktoré používajú viac číselných argumentov, pre ktoré chcete agregovanú hodnotu.' },
            ref2: { name: 'odkaz2', detail: 'Číselné argumenty 2 až 252, pre ktoré chcete agregovanú hodnotu.' },
        },
    },
    ARABIC: {
        description: 'Konvertuje rímske číslo na arabské číslo',
        abstract: 'Konvertuje rímske číslo na arabské číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Reťazec v úvodzovkách, prázdny reťazec (""), alebo odkaz na bunku obsahujúcu text.' },
        },
    },
    ASIN: {
        description: 'Vracia arkussínus čísla.',
        abstract: 'Vracia arkussínus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Sínus požadovaného uhla; musí byť v rozsahu od -1 do 1.' },
        },
    },
    ASINH: {
        description: 'Vracia inverzný hyperbolický sínus čísla.',
        abstract: 'Vracia inverzný hyperbolický sínus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo.' },
        },
    },
    ATAN: {
        description: 'Vracia arkustangens čísla.',
        abstract: 'Vracia arkustangens čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Tangens požadovaného uhla.' },
        },
    },
    ATAN2: {
        description: 'Vráti arkustangens alebo inverzný tangens zadaných súradníc x a y. Arkustangens je uhol, ktorý zviera os x a priamka obsahujúca počiatok (0, 0) a bod so súradnicami (x_num, y_num). Uhol je daný v radiánoch medzi -pí a pí, okrem -pí.',
        abstract: 'Vráti arkustangens alebo inverzný tangens zadaných súradníc x a y. Arkustangens je uhol, ktorý zviera os x a priamka obsahujúca počiatok (0, 0) a bod so súradnicami (x_num, y_num). Uhol je daný v radiánoch medzi -pí a pí, okrem -pí.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_číslo', detail: 'Povinné. je Súradnica x bodu.' },
            yNum: { name: 'y_číslo', detail: 'Povinné. Súradnica y bodu.' },
        },
    },
    ATANH: {
        description: 'Vráti inverzný hyperbolický tangens čísla. Číslo musí byť väčšie než -1 a menšie než 1. Inverzný hyperbolický tangens je hodnota, ktorej hyperbolický tangens je dané číslo , takže ATANH(TANH(číslo)) = číslo .',
        abstract: 'Vráti inverzný hyperbolický tangens čísla. Číslo musí byť väčšie než -1 a menšie než 1. Inverzný hyperbolický tangens je hodnota, ktorej hyperbolický tangens je dané číslo , takže ATANH(TANH(číslo)) = číslo .',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Povinné. Ľubovoľné reálne číslo v intervale od 1 do -1.' },
        },
    },
    BASE: {
        description: 'Konvertuje číslo na textové vyjadrenie s daným základom sústavy (základ).',
        abstract: 'Konvertuje číslo na textové vyjadrenie s daným základom sústavy (základ).',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Povinné. Číslo, ktoré chcete skonvertovať. Musí to byť celé číslo väčšie ako alebo rovné 0 a menšie ako 2^53.' },
            radix: { name: 'základ', detail: 'Povinné. Základ sústavy, na ktorý chcete skonvertovať číslo. Musí to byť celé číslo väčšie alebo rovné 0 a menšie alebo rovné 36.' },
            minLength: { name: 'minimálna_dĺžka', detail: 'Voliteľný argument. Minimálna dĺžka vráteného reťazca. Musí to byť celé číslo väčšia alebo rovné 0.' },
        },
    },
    CEILING: {
        description: 'Zaokrúhľuje číslo nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        abstract: 'Zaokrúhľuje číslo nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            significance: { name: 'významnosť', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
        },
    },
    CEILING_MATH: {
        description: 'Zaokrúhľuje číslo nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        abstract: 'Zaokrúhľuje číslo nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            significance: { name: 'významnosť', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
            mode: { name: 'režim', detail: 'Pri záporných číslach určuje, či sa číslo zaokrúhľuje smerom k nule alebo od nuly.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Zaokrúhľuje číslo na najbližšie celé číslo alebo na najbližší násobok významnosti. Bez ohľadu na znamienko čísla sa zaokrúhľuje nahor.',
        abstract: 'Zaokrúhľuje číslo na najbližšie celé číslo alebo na najbližší násobok významnosti. Bez ohľadu na znamienko čísla sa zaokrúhľuje nahor.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            significance: { name: 'významnosť', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
        },
    },
    COMBIN: {
        description: 'Vracia počet kombinácií pre daný počet objektov',
        abstract: 'Vracia počet kombinácií pre daný počet objektov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'počet', detail: 'Počet položiek.' },
            numberChosen: { name: 'počet_vybraných', detail: 'Počet položiek v každej kombinácii.' },
        },
    },
    COMBINA: {
        description: 'Vracia počet kombinácií s opakovaním pre daný počet položiek',
        abstract: 'Vracia počet kombinácií s opakovaním pre daný počet položiek',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'počet', detail: 'Počet položiek.' },
            numberChosen: { name: 'počet_vybraných', detail: 'Počet položiek v každej kombinácii.' },
        },
    },
    COS: {
        description: 'Vracia kosínus čísla.',
        abstract: 'Vracia kosínus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Uhol v radiánoch, pre ktorý chcete kosínus.' },
        },
    },
    COSH: {
        description: 'Vracia hyperbolický kosínus čísla',
        abstract: 'Vracia hyperbolický kosínus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo, pre ktoré chcete hyperbolický kosínus.' },
        },
    },
    COT: {
        description: 'Vracia kotangens uhla',
        abstract: 'Vracia kotangens uhla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Uhol v radiánoch, pre ktorý chcete kotangens.' },
        },
    },
    COTH: {
        description: 'Vracia hyperbolický kotangens čísla',
        abstract: 'Vracia hyperbolický kotangens čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo, pre ktoré chcete hyperbolický kotangens.' },
        },
    },
    CSC: {
        description: 'Vracia kosekans uhla',
        abstract: 'Vracia kosekans uhla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Uhol v radiánoch, pre ktorý chcete kosekans.' },
        },
    },
    CSCH: {
        description: 'Vracia hyperbolický kosekans uhla',
        abstract: 'Vracia hyperbolický kosekans uhla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Uhol v radiánoch, pre ktorý chcete hyperbolický kosekans.' },
        },
    },
    DECIMAL: {
        description: 'Konvertuje textové vyjadrenie čísla v zadanom základe na desiatkové číslo',
        abstract: 'Konvertuje textové vyjadrenie čísla v zadanom základe na desiatkové číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Dĺžka reťazca Text musí byť menšia alebo rovná 255 znakom.' },
            radix: { name: 'základ', detail: 'Základ, do ktorého chcete číslo previesť. Musí to byť celé číslo väčšie alebo rovné 2 a menšie alebo rovné 36.' },
        },
    },
    DEGREES: {
        description: 'Konvertuje radiány na stupne',
        abstract: 'Konvertuje radiány na stupne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'uhol', detail: 'Uhol v radiánoch, ktorý chcete previesť.' },
        },
    },
    EVEN: {
        description: 'Zaokrúhľuje číslo nahor na najbližšie párne celé číslo',
        abstract: 'Zaokrúhľuje číslo nahor na najbližšie párne celé číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
        },
    },
    EXP: {
        description: 'Vracia e umocnené na zadané číslo',
        abstract: 'Vracia e umocnené na zadané číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Exponent použitý na základ e.' },
        },
    },
    FACT: {
        description: 'Vracia faktoriál čísla',
        abstract: 'Vracia faktoriál čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Nezáporné číslo, pre ktoré chcete faktoriál. Ak číslo nie je celé, bude skrátené.' },
        },
    },
    FACTDOUBLE: {
        description: 'Vracia dvojitý faktoriál čísla',
        abstract: 'Vracia dvojitý faktoriál čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Nezáporné číslo, pre ktoré chcete dvojitý faktoriál. Ak číslo nie je celé, bude skrátené.' },
        },
    },
    FLOOR: {
        description: 'Zaokrúhľuje číslo nadol, smerom k nule',
        abstract: 'Zaokrúhľuje číslo nadol, smerom k nule',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            significance: { name: 'významnosť', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
        },
    },
    FLOOR_MATH: {
        description: 'Zaokrúhľuje číslo nadol na najbližšie celé číslo alebo na najbližší násobok významnosti',
        abstract: 'Zaokrúhľuje číslo nadol na najbližšie celé číslo alebo na najbližší násobok významnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            significance: { name: 'významnosť', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
            mode: { name: 'režim', detail: 'Pri záporných číslach určuje, či sa číslo zaokrúhľuje smerom k nule alebo od nuly.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Zaokrúhľuje číslo nadol na najbližšie celé číslo alebo na najbližší násobok významnosti. Bez ohľadu na znamienko čísla sa zaokrúhľuje nadol.',
        abstract: 'Zaokrúhľuje číslo nadol na najbližšie celé číslo alebo na najbližší násobok významnosti.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            significance: { name: 'významnosť', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
        },
    },
    GCD: {
        description: 'Vracia najväčší spoločný deliteľ',
        abstract: 'Vracia najväčší spoločný deliteľ',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Na výpočet prvého čísla pre najväčší spoločný deliteľ môžete namiesto parametrov oddelených čiarkou použiť aj jedno pole alebo odkaz na pole.' },
            number2: { name: 'číslo2', detail: 'Druhé číslo, pre ktoré sa má nájsť najväčší spoločný deliteľ. Týmto spôsobom možno zadať až 255 čísel.' },
        },
    },
    INT: {
        description: 'Zaokrúhľuje číslo nadol na najbližšie celé číslo',
        abstract: 'Zaokrúhľuje číslo nadol na najbližšie celé číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Reálne číslo, ktoré chcete zaokrúhliť nadol na celé číslo.' },
        },
    },
    ISO_CEILING: {
        description: 'Vracia číslo zaokrúhlené nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        abstract: 'Vracia číslo zaokrúhlené nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            significance: { name: 'významnosť', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
        },
    },
    LCM: {
        description: 'Vracia najmenší spoločný násobok',
        abstract: 'Vracia najmenší spoločný násobok',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Na výpočet prvého čísla pre najmenší spoločný násobok môžete namiesto parametrov oddelených čiarkou použiť aj jedno pole alebo odkaz na pole.' },
            number2: { name: 'číslo2', detail: 'Druhé číslo, pre ktoré sa má nájsť najmenší spoločný násobok. Týmto spôsobom možno zadať až 255 čísel.' },
        },
    },
    LN: {
        description: 'Vracia prirodzený logaritmus čísla',
        abstract: 'Vracia prirodzený logaritmus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Kladné reálne číslo, pre ktoré chcete prirodzený logaritmus.' },
        },
    },
    LOG: {
        description: 'Vracia logaritmus čísla pri zadanom základe',
        abstract: 'Vracia logaritmus čísla pri zadanom základe',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Kladné reálne číslo, pre ktoré chcete logaritmus.' },
            base: { name: 'základ', detail: 'Základ logaritmu. Ak je vynechaný, predpokladá sa 10.' },
        },
    },
    LOG10: {
        description: 'Vracia logaritmus čísla so základom 10',
        abstract: 'Vracia logaritmus čísla so základom 10',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Kladné reálne číslo, pre ktoré chcete logaritmus so základom 10.' },
        },
    },
    MDETERM: {
        description: 'Vracia determinant matice poľa',
        abstract: 'Vracia determinant matice poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Číselné pole s rovnakým počtom riadkov a stĺpcov.' },
        },
    },
    MINVERSE: {
        description: 'Vracia inverznú maticu poľa',
        abstract: 'Vracia inverznú maticu poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Číselné pole s rovnakým počtom riadkov a stĺpcov.' },
        },
    },
    MMULT: {
        description: 'Vracia maticový súčin dvoch polí',
        abstract: 'Vracia maticový súčin dvoch polí',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Polia, ktoré chcete vynásobiť.' },
            array2: { name: 'pole2', detail: 'Polia, ktoré chcete vynásobiť.' },
        },
    },
    MOD: {
        description: 'Vracia zvyšok po delení čísla deliteľom. Výsledok má rovnaké znamienko ako deliteľ.',
        abstract: 'Vracia zvyšok po delení',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, pre ktoré chcete zistiť zvyšok.' },
            divisor: { name: 'deliteľ', detail: 'Číslo, ktorým chcete deliť číslo.' },
        },
    },
    MROUND: {
        description: 'Vracia číslo zaokrúhlené na požadovaný násobok',
        abstract: 'Vracia číslo zaokrúhlené na požadovaný násobok',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
            multiple: { name: 'násobok', detail: 'Násobok, na ktorý chcete číslo zaokrúhliť.' },
        },
    },
    MULTINOMIAL: {
        description: 'Vracia multinomický koeficient pre množinu čísel',
        abstract: 'Vracia multinomický koeficient pre množinu čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvá hodnota alebo rozsah použitý vo výpočte.' },
            number2: { name: 'číslo2', detail: 'Ďalšie hodnoty alebo rozsahy použité vo výpočtoch.' },
        },
    },
    MUNIT: {
        description: 'Vracia jednotkovú maticu pre zadaný rozmer',
        abstract: 'Vracia jednotkovú maticu pre zadaný rozmer',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'rozmer', detail: 'Rozmer je celé číslo určujúce rozmer jednotkovej matice, ktorú chcete vrátiť. Vracia pole. Rozmer musí byť väčší ako nula.' },
        },
    },
    ODD: {
        description: 'Zaokrúhľuje číslo nahor na najbližšie nepárne celé číslo',
        abstract: 'Zaokrúhľuje číslo nahor na najbližšie nepárne celé číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota, ktorú chcete zaokrúhliť.' },
        },
    },
    PI: {
        description: 'Vracia hodnotu čísla pí',
        abstract: 'Vracia hodnotu čísla pí',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/pi-function',
            },
        ],
        functionParameter: {},
    },
    POWER: {
        description: 'Vracia výsledok čísla umocneného na zadaný exponent.',
        abstract: 'Vracia výsledok čísla umocneného na zadaný exponent',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Základné číslo. Môže byť ľubovoľné reálne číslo.' },
            power: { name: 'exponent', detail: 'Exponent, na ktorý sa základné číslo umocní.' },
        },
    },
    PRODUCT: {
        description: 'Násobí všetky čísla zadané ako argumenty a vracia súčin.',
        abstract: 'Násobí svoje argumenty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo alebo rozsah, ktorý chcete násobiť.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla alebo rozsahy, ktoré chcete násobiť, maximálne 255 argumentov.' },
        },
    },
    QUOTIENT: {
        description: 'Vracia celočíselnú časť podielu',
        abstract: 'Vracia celočíselnú časť podielu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'čitateľ', detail: 'Deliteľné číslo.' },
            denominator: { name: 'menovateľ', detail: 'Deliteľ.' },
        },
    },
    RADIANS: {
        description: 'Konvertuje stupne na radiány',
        abstract: 'Konvertuje stupne na radiány',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'uhol', detail: 'Uhol v stupňoch, ktorý chcete previesť.' },
        },
    },
    RAND: {
        description: 'Vracia náhodné číslo medzi 0 a 1',
        abstract: 'Vracia náhodné číslo medzi 0 a 1',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rand-function',
            },
        ],
        functionParameter: {},
    },
    RANDARRAY: {
        description: 'Vracia pole náhodných čísel medzi 0 a 1. Môžete však určiť počet riadkov a stĺpcov, minimálne a maximálne hodnoty a či sa majú vrátiť celé čísla alebo desatinné hodnoty.',
        abstract: 'Vracia pole náhodných čísel medzi 0 a 1.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'riadky', detail: 'Počet riadkov, ktoré sa majú vrátiť.' },
            columns: { name: 'stĺpce', detail: 'Počet stĺpcov, ktoré sa majú vrátiť.' },
            min: { name: 'min', detail: 'Minimálne číslo, ktoré sa má vrátiť.' },
            max: { name: 'max', detail: 'Maximálne číslo, ktoré sa má vrátiť.' },
            wholeNumber: { name: 'celé_číslo', detail: 'Určuje, či sa má vrátiť celé číslo alebo desatinná hodnota.' },
        },
    },
    RANDBETWEEN: {
        description: 'Vracia náhodné číslo medzi číslami, ktoré zadáte',
        abstract: 'Vracia náhodné číslo medzi číslami, ktoré zadáte',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'dolná_hranica', detail: 'Najmenšie celé číslo, ktoré RANDBETWEEN vráti.' },
            top: { name: 'horná_hranica', detail: 'Najväčšie celé číslo, ktoré RANDBETWEEN vráti.' },
        },
    },
    ROMAN: {
        description: 'Konvertuje arabské číslo na rímske číslo ako text',
        abstract: 'Konvertuje arabské číslo na rímske číslo ako text',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Arabské číslo, ktoré chcete previesť.' },
            form: { name: 'forma', detail: 'Číslo určujúce typ rímskeho čísla. Štýl rímskeho čísla sa pohybuje od klasického po zjednodušený a s rastúcou hodnotou form je stručnejší.' },
        },
    },
    ROUND: {
        description: 'Zaokrúhľuje číslo na zadaný počet číslic',
        abstract: 'Zaokrúhľuje číslo na zadaný počet číslic',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete zaokrúhliť.' },
            numDigits: { name: 'počet_číslic', detail: 'Počet číslic, na ktorý chcete argument číslo zaokrúhliť.' },
        },
    },
    ROUNDBANK: {
        description: 'Zaokrúhľuje číslo bankárskym zaokrúhľovaním',
        abstract: 'Zaokrúhľuje číslo bankárskym zaokrúhľovaním',
        links: [
            {
                title: 'Inštrukcia',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete zaokrúhliť bankárskym zaokrúhľovaním.' },
            numDigits: { name: 'počet_číslic', detail: 'Počet číslic, na ktorý chcete zaokrúhliť bankárskym spôsobom.' },
        },
    },
    ROUNDDOWN: {
        description: 'Zaokrúhľuje číslo nadol, smerom k nule',
        abstract: 'Zaokrúhľuje číslo nadol, smerom k nule',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete zaokrúhliť.' },
            numDigits: { name: 'počet_číslic', detail: 'Počet číslic, na ktorý chcete argument číslo zaokrúhliť.' },
        },
    },
    ROUNDUP: {
        description: 'Zaokrúhľuje číslo nahor, smerom od nuly',
        abstract: 'Zaokrúhľuje číslo nahor, smerom od nuly',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete zaokrúhliť.' },
            numDigits: { name: 'počet_číslic', detail: 'Počet číslic, na ktorý chcete argument číslo zaokrúhliť.' },
        },
    },
    SEC: {
        description: 'Vracia sekans uhla',
        abstract: 'Vracia sekans uhla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo je uhol v radiánoch, pre ktorý chcete sekans.' },
        },
    },
    SECH: {
        description: 'Vracia hyperbolický sekans uhla',
        abstract: 'Vracia hyperbolický sekans uhla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo je uhol v radiánoch, pre ktorý chcete hyperbolický sekans.' },
        },
    },
    SERIESSUM: {
        description: 'Vracia súčet mocninového radu podľa vzorca',
        abstract: 'Vracia súčet mocninového radu podľa vzorca',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Vstupná hodnota do mocninového radu.' },
            n: { name: 'n', detail: 'Počiatočný exponent, na ktorý chcete umocniť x.' },
            m: { name: 'm', detail: 'Krok, o ktorý sa zvyšuje n pre každý člen radu.' },
            coefficients: { name: 'koeficienty', detail: 'Súbor koeficientov, ktorými sa násobí každá ďalšia mocnina x.' },
        },
    },
    SEQUENCE: {
        description: 'Generuje zoznam postupných čísel v poli, napríklad 1, 2, 3, 4',
        abstract: 'Generuje zoznam postupných čísel v poli, napríklad 1, 2, 3, 4',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'riadky', detail: 'Počet riadkov, ktoré sa majú vrátiť.' },
            columns: { name: 'stĺpce', detail: 'Počet stĺpcov, ktoré sa majú vrátiť.' },
            start: { name: 'začiatok', detail: 'Prvé číslo v postupnosti.' },
            step: { name: 'krok', detail: 'Hodnota, o ktorú sa zvyšuje každý ďalší prvok poľa.' },
        },
    },
    SIGN: {
        description: 'Vracia znamienko čísla',
        abstract: 'Vracia znamienko čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo.' },
        },
    },
    SIN: {
        description: 'Vracia sínus zadaného uhla',
        abstract: 'Vracia sínus zadaného uhla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Uhol v radiánoch, pre ktorý chcete sínus.' },
        },
    },
    SINH: {
        description: 'Vracia hyperbolický sínus čísla',
        abstract: 'Vracia hyperbolický sínus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo.' },
        },
    },
    SQRT: {
        description: 'Vracia kladnú druhú odmocninu',
        abstract: 'Vracia kladnú druhú odmocninu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, pre ktoré chcete druhú odmocninu.' },
        },
    },
    SQRTPI: {
        description: 'Vracia druhú odmocninu z (číslo * pí)',
        abstract: 'Vracia druhú odmocninu z (číslo * pí)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktorým sa násobí pí.' },
        },
    },
    SUBTOTAL: {
        description: 'Vracia medzisúčet v zozname alebo databáze.',
        abstract: 'Vracia medzisúčet v zozname alebo databáze',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'číslo_funkcie', detail: 'Číslo 1-11 alebo 101-111, ktoré určuje funkciu pre medzisúčet. 1-11 zahŕňa ručne skryté riadky, zatiaľ čo 101-111 ich vylučuje; filtrované bunky sa vždy vylučujú.' },
            ref1: { name: 'odkaz1', detail: 'Prvý pomenovaný rozsah alebo odkaz, pre ktorý chcete medzisúčet.' },
            ref2: { name: 'odkaz2', detail: 'Pomenované rozsahy alebo odkazy 2 až 254, pre ktoré chcete medzisúčet.' },
        },
    },
    SUM: {
        description: 'Môžete sčítať jednotlivé hodnoty, odkazy na bunky alebo rozsahy, alebo kombináciu všetkých troch.',
        abstract: 'Sčíta svoje argumenty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'Číslo 1',
                detail: 'Prvé číslo, ktoré chcete sčítať. Číslo môže byť napríklad 4, odkaz na bunku ako B6 alebo rozsah buniek ako B2:B8.',
            },
            number2: {
                name: 'Číslo 2',
                detail: 'Druhé číslo, ktoré chcete sčítať. Týmto spôsobom môžete zadať až 255 čísel.',
            },
        },
    },
    SUMIF: {
        description: 'Sčíta hodnoty v rozsahu, ktoré spĺňajú zadané kritériá.',
        abstract: 'Sčíta bunky určené daným kritériom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: {
                name: 'rozsah',
                detail: 'Rozsah buniek, ktoré chcete vyhodnotiť podľa kritérií.',
            },
            criteria: {
                name: 'kritérium',
                detail: 'Kritérium vo forme čísla, výrazu, odkazu na bunku, textu alebo funkcie, ktoré určuje, ktoré bunky sa majú sčítať. Môžu sa použiť zástupné znaky - otáznik (?) pre ľubovoľný jeden znak, hviezdička (*) pre ľubovoľnú postupnosť znakov. Ak chcete nájsť skutočný otáznik alebo hviezdičku, zadajte pred znak tildy (~).',
            },
            sumRange: {
                name: 'rozsah_súčtu',
                detail: 'Skutočné bunky na sčítanie, ak chcete sčítať iné bunky než tie, ktoré sú uvedené v argumente range. Ak argument sum_range vynecháte, Excel sčíta bunky uvedené v argumente range (tie isté bunky, na ktoré sa uplatnia kritériá).',
            },
        },
    },
    SUMIFS: {
        description: 'Sčíta všetky argumenty, ktoré spĺňajú viaceré kritériá.',
        abstract: 'Sčíta všetky argumenty, ktoré spĺňajú viaceré kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'rozsah_súčtu', detail: 'Rozsah buniek, ktoré sa majú sčítať.' },
            criteriaRange1: { name: 'rozsah_kritéria1', detail: 'Rozsah, ktorý sa testuje podľa kritéria1. Rozsah_kritéria1 a kritérium1 tvoria vyhľadávací pár, kde sa v rozsahu hľadajú konkrétne kritériá. Keď sa položky v rozsahu nájdu, ich zodpovedajúce hodnoty v rozsahu_súčtu sa sčítajú.' },
            criteria1: { name: 'kritérium1', detail: 'Kritérium, ktoré určuje, ktoré bunky v rozsah_kritéria1 sa sčítajú. Napríklad kritérium môže byť 32, ">32", B4, "jablká" alebo "32".' },
            criteriaRange2: { name: 'rozsah_kritéria2', detail: 'Ďalšie rozsahy. Môžete zadať až 127 párov rozsahov.' },
            criteria2: { name: 'kritérium2', detail: 'Ďalšie súvisiace kritériá. Môžete zadať až 127 párov kritérií.' },
        },
    },
    SUMPRODUCT: {
        description: 'Vracia súčet súčinov zodpovedajúcich prvkov polí',
        abstract: 'Vracia súčet súčinov zodpovedajúcich prvkov polí',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole', detail: 'Prvý argument poľa, ktorého prvky chcete vynásobiť a potom sčítať.' },
            array2: { name: 'pole', detail: 'Argumenty polí 2 až 255, ktorých prvky chcete vynásobiť a potom sčítať.' },
        },
    },
    SUMSQ: {
        description: 'Vracia súčet druhých mocnín argumentov',
        abstract: 'Vracia súčet druhých mocnín argumentov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Na umocnenie a nájdenie prvého čísla môžete namiesto parametrov oddelených čiarkou použiť aj jedno pole alebo odkaz na pole.' },
            number2: { name: 'číslo2', detail: 'Druhé číslo, ktoré sa má umocniť a sčítať. Týmto spôsobom možno zadať až 255 čísel.' },
        },
    },
    SUMX2MY2: {
        description: 'Vracia súčet rozdielov druhých mocnín zodpovedajúcich hodnôt v dvoch poliach',
        abstract: 'Vracia súčet rozdielov druhých mocnín zodpovedajúcich hodnôt v dvoch poliach',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'pole_x', detail: 'Prvé pole alebo rozsah hodnôt.' },
            arrayY: { name: 'pole_y', detail: 'Druhé pole alebo rozsah hodnôt.' },
        },
    },
    SUMX2PY2: {
        description: 'Vracia súčet súčtov druhých mocnín zodpovedajúcich hodnôt v dvoch poliach',
        abstract: 'Vracia súčet súčtov druhých mocnín zodpovedajúcich hodnôt v dvoch poliach',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'pole_x', detail: 'Prvé pole alebo rozsah hodnôt.' },
            arrayY: { name: 'pole_y', detail: 'Druhé pole alebo rozsah hodnôt.' },
        },
    },
    SUMXMY2: {
        description: 'Vracia súčet druhých mocnín rozdielov zodpovedajúcich hodnôt v dvoch poliach',
        abstract: 'Vracia súčet druhých mocnín rozdielov zodpovedajúcich hodnôt v dvoch poliach',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'pole_x', detail: 'Prvé pole alebo rozsah hodnôt.' },
            arrayY: { name: 'pole_y', detail: 'Druhé pole alebo rozsah hodnôt.' },
        },
    },
    TAN: {
        description: 'Vracia tangens čísla.',
        abstract: 'Vracia tangens čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Uhol v radiánoch, pre ktorý chcete tangens.' },
        },
    },
    TANH: {
        description: 'Vracia hyperbolický tangens čísla.',
        abstract: 'Vracia hyperbolický tangens čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo.' },
        },
    },
    TRUNC: {
        description: 'Skráti číslo na celé číslo',
        abstract: 'Skráti číslo na celé číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete skrátiť.' },
            numDigits: { name: 'počet_číslic', detail: 'Číslo určujúce presnosť skrátenia. Predvolená hodnota num_digits je 0 (nula).' },
        },
    },
};

export default locale;
