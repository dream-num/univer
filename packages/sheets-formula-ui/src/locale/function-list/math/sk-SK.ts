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
                url: 'https://support.microsoft.com/en-us/office/abs-function-3420200f-5628-4e8c-99da-c99d7c87713c',
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
                url: 'https://support.microsoft.com/en-us/office/acos-function-cb73173f-d089-4582-afa1-76e5524b5d5b',
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
                url: 'https://support.microsoft.com/en-us/office/acosh-function-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
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
                url: 'https://support.microsoft.com/en-us/office/acot-function-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
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
                url: 'https://support.microsoft.com/en-us/office/acoth-function-cc49480f-f684-4171-9fc5-73e4e852300f',
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
                url: 'https://support.microsoft.com/en-us/office/aggregate-function-43b9278e-6aa7-4f17-92b6-e19993fa26df',
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
                url: 'https://support.microsoft.com/en-us/office/arabic-function-9a8da418-c17b-4ef9-a657-9370a30a674f',
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
                url: 'https://support.microsoft.com/en-us/office/asin-function-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
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
                url: 'https://support.microsoft.com/en-us/office/asinh-function-4e00475a-067a-43cf-926a-765b0249717c',
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
                url: 'https://support.microsoft.com/en-us/office/atan-function-50746fa8-630a-406b-81d0-4a2aed395543',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Tangens požadovaného uhla.' },
        },
    },
    ATAN2: {
        description: 'Vracia arkustangens z x- a y-súradníc.',
        abstract: 'Vracia arkustangens z x- a y-súradníc',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/atan2-function-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_číslo', detail: 'X-súradnica bodu.' },
            yNum: { name: 'y_číslo', detail: 'Y-súradnica bodu.' },
        },
    },
    ATANH: {
        description: 'Vracia inverzný hyperbolický tangens čísla.',
        abstract: 'Vracia inverzný hyperbolický tangens čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/atanh-function-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Ľubovoľné reálne číslo medzi -1 a 1.' },
        },
    },
    BASE: {
        description: 'Konvertuje číslo na textové vyjadrenie so zadaným základom',
        abstract: 'Konvertuje číslo na textové vyjadrenie so zadaným základom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/base-function-2ef61411-aee9-4f29-a811-1c42456c6342',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete previesť. Musí to byť celé číslo väčšie alebo rovné 0 a menšie ako 2^53.' },
            radix: { name: 'základ', detail: 'Základ, do ktorého chcete číslo previesť. Musí to byť celé číslo väčšie alebo rovné 2 a menšie alebo rovné 36.' },
            minLength: { name: 'minimálna_dĺžka', detail: 'Minimálna dĺžka vráteného reťazca. Musí to byť celé číslo väčšie alebo rovné 0.' },
        },
    },
    CEILING: {
        description: 'Zaokrúhľuje číslo nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        abstract: 'Zaokrúhľuje číslo nahor na najbližšie celé číslo alebo na najbližší násobok významnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/ceiling-function-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
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
                url: 'https://support.microsoft.com/en-us/office/ceiling-math-function-80f95d2f-b499-4eee-9f16-f795a8e306c8',
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
                url: 'https://support.microsoft.com/en-us/office/ceiling-precise-function-f366a774-527a-4c92-ba49-af0a196e66cb',
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
                url: 'https://support.microsoft.com/en-us/office/combin-function-12a3f276-0a21-423a-8de6-06990aaf638a',
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
                url: 'https://support.microsoft.com/en-us/office/combina-function-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
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
                url: 'https://support.microsoft.com/en-us/office/cos-function-0fb808a5-95d6-4553-8148-22aebdce5f05',
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
                url: 'https://support.microsoft.com/en-us/office/cosh-function-e460d426-c471-43e8-9540-a57ff3b70555',
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
                url: 'https://support.microsoft.com/en-us/office/cot-function-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
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
                url: 'https://support.microsoft.com/en-us/office/coth-function-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
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
                url: 'https://support.microsoft.com/en-us/office/csc-function-07379361-219a-4398-8675-07ddc4f135c1',
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
                url: 'https://support.microsoft.com/en-us/office/csch-function-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
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
                url: 'https://support.microsoft.com/en-us/office/decimal-function-ee554665-6176-46ef-82de-0a283658da2e',
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
                url: 'https://support.microsoft.com/en-us/office/degrees-function-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
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
                url: 'https://support.microsoft.com/en-us/office/even-function-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
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
                url: 'https://support.microsoft.com/en-us/office/exp-function-c578f034-2c45-4c37-bc8c-329660a63abe',
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
                url: 'https://support.microsoft.com/en-us/office/fact-function-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
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
                url: 'https://support.microsoft.com/en-us/office/factdouble-function-e67697ac-d214-48eb-b7b7-cce2589ecac8',
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
                url: 'https://support.microsoft.com/en-us/office/floor-function-14bb497c-24f2-4e04-b327-b0b4de5a8886',
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
                url: 'https://support.microsoft.com/en-us/office/floor-math-function-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
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
                url: 'https://support.microsoft.com/en-us/office/floor-precise-function-f769b468-1452-4617-8dc3-02f842a0702e',
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
                url: 'https://support.microsoft.com/en-us/office/gcd-function-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
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
                url: 'https://support.microsoft.com/en-us/office/int-function-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
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
                url: 'https://support.microsoft.com/en-us/office/iso-ceiling-function-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'prvý' },
            number2: { name: 'číslo2', detail: 'druhý' },
        },
    },
    LCM: {
        description: 'Vracia najmenší spoločný násobok',
        abstract: 'Vracia najmenší spoločný násobok',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/lcm-function-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Na výpočet prvého čísla pre najmenší spoločný násobok môžete namiesto parametrov oddelených čiarkou použiť aj jedno pole alebo odkaz na pole.' },
            number2: { name: 'číslo2', detail: 'Druhé číslo, pre ktoré sa má nájsť najmenší spoločný násobok. Týmto spôsobom možno zadať až 255 čísel.' },
        },
    },
    LET: {
        description: 'Priraďuje názvy výsledkom výpočtov, čo umožňuje ukladať medzivýpočty, hodnoty alebo definovať názvy vo vzorci',
        abstract: 'Priraďuje názvy výsledkom výpočtov, čo umožňuje ukladať medzivýpočty, hodnoty alebo definovať názvy vo vzorci',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'prvý' },
            number2: { name: 'číslo2', detail: 'druhý' },
        },
    },
    LN: {
        description: 'Vracia prirodzený logaritmus čísla',
        abstract: 'Vracia prirodzený logaritmus čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/ln-function-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
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
                url: 'https://support.microsoft.com/en-us/office/log-function-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
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
                url: 'https://support.microsoft.com/en-us/office/log10-function-c75b881b-49dd-44fb-b6f4-37e3486a0211',
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
                url: 'https://support.microsoft.com/en-us/office/mdeterm-function-e7bfa857-3834-422b-b871-0ffd03717020',
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
                url: 'https://support.microsoft.com/en-us/office/minverse-function-11f55086-adde-4c9f-8eb9-59da2d72efc6',
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
                url: 'https://support.microsoft.com/en-us/office/mmult-function-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
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
                url: 'https://support.microsoft.com/en-us/office/mod-function-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
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
                url: 'https://support.microsoft.com/en-us/office/mround-function-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
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
                url: 'https://support.microsoft.com/en-us/office/multinomial-function-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
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
                url: 'https://support.microsoft.com/en-us/office/munit-function-c9fe916a-dc26-4105-997d-ba22799853a3',
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
                url: 'https://support.microsoft.com/en-us/office/odd-function-deae64eb-e08a-4c88-8b40-6d0b42575c98',
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
                url: 'https://support.microsoft.com/en-us/office/pi-function-264199d0-a3ba-46b8-975a-c4a04608989b',
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
                url: 'https://support.microsoft.com/en-us/office/power-function-d3f2908b-56f4-4c3f-895a-07fb519c362a',
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
                url: 'https://support.microsoft.com/en-us/office/product-function-8e6b5b24-90ee-4650-aeec-80982a0512ce',
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
                url: 'https://support.microsoft.com/en-us/office/quotient-function-9f7bf099-2a18-4282-8fa4-65290cc99dee',
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
                url: 'https://support.microsoft.com/en-us/office/radians-function-ac409508-3d48-45f5-ac02-1497c92de5bf',
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
                url: 'https://support.microsoft.com/en-us/office/rand-function-4cbfa695-8869-4788-8d90-021ea9f5be73',
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
                url: 'https://support.microsoft.com/en-us/office/randarray-function-21261e55-3bec-4885-86a6-8b0a47fd4d33',
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
                url: 'https://support.microsoft.com/en-us/office/randbetween-function-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
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
                url: 'https://support.microsoft.com/en-us/office/roman-function-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
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
                url: 'https://support.microsoft.com/en-us/office/round-function-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
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
                url: 'https://support.microsoft.com/en-us/office/rounddown-function-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
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
                url: 'https://support.microsoft.com/en-us/office/roundup-function-f8bc9b23-e795-47db-8703-db171d0c42a7',
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
                url: 'https://support.microsoft.com/en-us/office/sec-function-ff224717-9c87-4170-9b58-d069ced6d5f7',
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
                url: 'https://support.microsoft.com/en-us/office/sech-function-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
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
                url: 'https://support.microsoft.com/en-us/office/seriessum-function-a3ab25b5-1093-4f5b-b084-96c49087f637',
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
                url: 'https://support.microsoft.com/en-us/office/sequence-function-57467a98-57e0-4817-9f14-2eb78519ca90',
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
                url: 'https://support.microsoft.com/en-us/office/sign-function-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
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
                url: 'https://support.microsoft.com/en-us/office/sin-function-cf0e3432-8b9e-483c-bc55-a76651c95602',
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
                url: 'https://support.microsoft.com/en-us/office/sinh-function-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
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
                url: 'https://support.microsoft.com/en-us/office/sqrt-function-654975c2-05c4-4831-9a24-2c65e4040fdf',
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
                url: 'https://support.microsoft.com/en-us/office/sqrtpi-function-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
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
                url: 'https://support.microsoft.com/en-us/office/subtotal-function-7b027003-f060-4ade-9040-e478765b9939',
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
                url: 'https://support.microsoft.com/en-us/office/sum-function-043e1c7d-7726-4e80-8f32-07b23e057f89',
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
                url: 'https://support.microsoft.com/en-us/office/sumif-function-169b8c99-c05c-4483-a712-1697a653039b',
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
                url: 'https://support.microsoft.com/en-us/office/sumifs-function-c9e748f5-7ea7-455d-9406-611cebce642b',
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
                url: 'https://support.microsoft.com/en-us/office/sumproduct-function-16753e75-9f68-4874-94ac-4d2145a2fd2e',
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
                url: 'https://support.microsoft.com/en-us/office/sumsq-function-e3313c02-51cc-4963-aae6-31442d9ec307',
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
                url: 'https://support.microsoft.com/en-us/office/sumx2my2-function-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
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
                url: 'https://support.microsoft.com/en-us/office/sumx2py2-function-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
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
                url: 'https://support.microsoft.com/en-us/office/sumxmy2-function-9d144ac1-4d79-43de-b524-e2ecee23b299',
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
                url: 'https://support.microsoft.com/en-us/office/tan-function-08851a40-179f-4052-b789-d7f699447401',
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
                url: 'https://support.microsoft.com/en-us/office/tanh-function-017222f0-a0c3-4f69-9787-b3202295dc6c',
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
                url: 'https://support.microsoft.com/en-us/office/trunc-function-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete skrátiť.' },
            numDigits: { name: 'počet_číslic', detail: 'Číslo určujúce presnosť skrátenia. Predvolená hodnota num_digits je 0 (nula).' },
        },
    },
};

export default locale;
