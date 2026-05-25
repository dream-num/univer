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
                url: 'https://support.microsoft.com/en-us/office/besseli-function-8d33855c-9a8d-444b-98e0-852267b1c0df',
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
                url: 'https://support.microsoft.com/en-us/office/besselj-function-839cb181-48de-408b-9d80-bd02982d94f7',
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
                url: 'https://support.microsoft.com/en-us/office/besselk-function-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
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
                url: 'https://support.microsoft.com/en-us/office/bessely-function-f3a356b3-da89-42c3-8974-2da54d6353a2',
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
                url: 'https://support.microsoft.com/en-us/office/bin2dec-function-63905b57-b3a0-453d-99f4-647bb519cd6c',
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
                url: 'https://support.microsoft.com/en-us/office/bin2hex-function-0375e507-f5e5-4077-9af8-28d84f9f41cc',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Binárne číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    BIN2OCT: {
        description: 'Konvertuje binárne číslo na oktalové',
        abstract: 'Konvertuje binárne číslo na oktalové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/bin2oct-function-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Binárne číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
    BITAND: {
        description: 'Vracia bitový AND dvoch čísel',
        abstract: 'Vracia bitový AND dvoch čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/bitand-function-8a2be3d7-91c3-4b48-9517-64548008563a',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Musí byť v desiatkovej forme a väčšie alebo rovné 0.' },
            number2: { name: 'číslo2', detail: 'Musí byť v desiatkovej forme a väčšie alebo rovné 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Vracia hodnotu number posunutú doľava o shift_amount bitov',
        abstract: 'Vracia hodnotu number posunutú doľava o shift_amount bitov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/bitlshift-function-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
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
                url: 'https://support.microsoft.com/en-us/office/bitor-function-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
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
                url: 'https://support.microsoft.com/en-us/office/bitrshift-function-274d6996-f42c-4743-abdb-4ff95351222c',
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
                url: 'https://support.microsoft.com/en-us/office/bitxor-function-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
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
                url: 'https://support.microsoft.com/en-us/office/complex-function-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
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
                url: 'https://support.microsoft.com/en-us/office/convert-function-d785bef1-808e-4aac-bdcd-666c810f9af2',
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
                url: 'https://support.microsoft.com/en-us/office/dec2bin-function-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
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
                url: 'https://support.microsoft.com/en-us/office/dec2hex-function-6344ee8b-b6b5-4c6a-a672-f64666704619',
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
                url: 'https://support.microsoft.com/en-us/office/dec2oct-function-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
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
                url: 'https://support.microsoft.com/en-us/office/delta-function-2f763672-c959-4e07-ac33-fe03220ba432',
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
                url: 'https://support.microsoft.com/en-us/office/erf-function-c53c7e7b-5482-4b6c-883e-56df3c9af349',
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
                url: 'https://support.microsoft.com/en-us/office/erf-precise-function-9a349593-705c-4278-9a98-e4122831a8e0',
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
                url: 'https://support.microsoft.com/en-us/office/erfc-function-736e0318-70ba-4e8b-8d08-461fe68b71b3',
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
                url: 'https://support.microsoft.com/en-us/office/erfc-precise-function-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
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
                url: 'https://support.microsoft.com/en-us/office/gestep-function-f37e7d2a-41da-4129-be95-640883fca9df',
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
                url: 'https://support.microsoft.com/en-us/office/hex2bin-function-a13aafaa-5737-4920-8424-643e581828c1',
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
                url: 'https://support.microsoft.com/en-us/office/hex2dec-function-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
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
                url: 'https://support.microsoft.com/en-us/office/hex2oct-function-54d52808-5d19-4bd0-8a63-1096a5d11912',
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
                url: 'https://support.microsoft.com/en-us/office/imabs-function-b31e73c6-d90c-4062-90bc-8eb351d765a1',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete absolútnu hodnotu.' },
        },
    },
    IMAGINARY: {
        description: 'Vracia imaginárny koeficient komplexného čísla',
        abstract: 'Vracia imaginárny koeficient komplexného čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/imaginary-function-dd5952fd-473d-44d9-95a1-9a17b23e428a',
            },
        ],
        functionParameter: {
            inumber: { name: 'komplexné_číslo', detail: 'Komplexné číslo, pre ktoré chcete imaginárny koeficient.' },
        },
    },
    IMARGUMENT: {
        description: 'Vracia argument theta, uhol vyjadrený v radiánoch',
        abstract: 'Vracia argument theta, uhol vyjadrený v radiánoch',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/imargument-function-eed37ec1-23b3-4f59-b9f3-d340358a034a',
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
                url: 'https://support.microsoft.com/en-us/office/imconjugate-function-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
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
                url: 'https://support.microsoft.com/en-us/office/imcos-function-dad75277-f592-4a6b-ad6c-be93a808a53c',
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
                url: 'https://support.microsoft.com/en-us/office/imcosh-function-053e4ddb-4122-458b-be9a-457c405e90ff',
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
                url: 'https://support.microsoft.com/en-us/office/imcot-function-dc6a3607-d26a-4d06-8b41-8931da36442c',
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
                url: 'https://support.google.com/docs/answer/9366256?hl=en&sjid=1719420110567985051-AP',
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
                url: 'https://support.microsoft.com/en-us/office/imcsc-function-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
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
                url: 'https://support.microsoft.com/en-us/office/imcsch-function-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
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
                url: 'https://support.microsoft.com/en-us/office/imdiv-function-a505aff7-af8a-4451-8142-77ec3d74d83f',
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
                url: 'https://support.microsoft.com/en-us/office/imexp-function-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
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
                url: 'https://support.microsoft.com/en-us/office/imln-function-32b98bcf-8b81-437c-a636-6fb3aad509d8',
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
                url: 'https://support.google.com/docs/answer/9366486?hl=en&sjid=1719420110567985051-AP',
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
                url: 'https://support.microsoft.com/en-us/office/imlog10-function-58200fca-e2a2-4271-8a98-ccd4360213a5',
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
                url: 'https://support.microsoft.com/en-us/office/imlog2-function-152e13b4-bc79-486c-a243-e6a676878c51',
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
                url: 'https://support.microsoft.com/en-us/office/impower-function-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
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
                url: 'https://support.microsoft.com/en-us/office/improduct-function-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
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
                url: 'https://support.microsoft.com/en-us/office/imreal-function-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
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
                url: 'https://support.microsoft.com/en-us/office/imsec-function-6df11132-4411-4df4-a3dc-1f17372459e0',
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
                url: 'https://support.microsoft.com/en-us/office/imsech-function-f250304f-788b-4505-954e-eb01fa50903b',
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
                url: 'https://support.microsoft.com/en-us/office/imsin-function-1ab02a39-a721-48de-82ef-f52bf37859f6',
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
                url: 'https://support.microsoft.com/en-us/office/imsinh-function-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
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
                url: 'https://support.microsoft.com/en-us/office/imsqrt-function-e1753f80-ba11-4664-a10e-e17368396b70',
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
                url: 'https://support.microsoft.com/en-us/office/imsub-function-2e404b4d-4935-4e85-9f52-cb08b9a45054',
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
                url: 'https://support.microsoft.com/en-us/office/imsum-function-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
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
                url: 'https://support.microsoft.com/en-us/office/imtan-function-8478f45d-610a-43cf-8544-9fc0b553a132',
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
                url: 'https://support.google.com/docs/answer/9366655?hl=en&sjid=1719420110567985051-AP',
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
                url: 'https://support.microsoft.com/en-us/office/oct2bin-function-55383471-3c56-4d27-9522-1a8ec646c589',
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
                url: 'https://support.microsoft.com/en-us/office/oct2dec-function-87606014-cb98-44b2-8dbb-e48f8ced1554',
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
                url: 'https://support.microsoft.com/en-us/office/oct2hex-function-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Oktalové číslo, ktoré chcete previesť.' },
            places: { name: 'počet_znakov', detail: 'Počet znakov, ktoré sa majú použiť.' },
        },
    },
};

export default locale;
