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
    ASC: {
        description: 'Mení plnošírkové (dvojbajtové) anglické písmená alebo katakanu v textovom reťazci na polovičnú šírku (jednobajtové) znaky',
        abstract: 'Mení plnošírkové (dvojbajtové) anglické písmená alebo katakanu v textovom reťazci na polovičnú šírku (jednobajtové) znaky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/asc-function-0b6abf1c-c663-4004-a964-ebc00b723266',
            },
        ],
        functionParameter: {
            text: {
                name: 'text',
                detail: 'Text alebo odkaz na bunku obsahujúcu text, ktorý chcete zmeniť. Ak text neobsahuje žiadne plnošírkové písmená, text sa nezmení.',
            },
        },
    },
    ARRAYTOTEXT: {
        description: 'Vracia pole textových hodnôt z ľubovoľného zadaného rozsahu',
        abstract: 'Vracia pole textových hodnôt z ľubovoľného zadaného rozsahu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/arraytotext-function-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, ktoré sa má vrátiť ako text.' },
            format: {
                name: 'formát',
                detail: 'Formát vrátených údajov. Môže byť jedna z dvoch hodnôt: \n0 Predvolené. Stručný formát, ktorý sa ľahko číta. \n1 Prísny formát, ktorý obsahuje escape znaky a oddeľovače riadkov. Generuje reťazec, ktorý možno analyzovať po vložení do riadka vzorcov. Vrátené reťazce uzatvára do úvodzoviek okrem logických hodnôt, čísel a chýb.',
            },
        },
    },
    BAHTTEXT: {
        description: 'Konvertuje číslo na text pomocou menového formátu baht',
        abstract: 'Konvertuje číslo na text pomocou menového formátu baht',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/bahttext-function-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
            },
        ],
        functionParameter: {
            number: {
                name: 'číslo',
                detail: 'Číslo, ktoré chcete previesť na text, alebo odkaz na bunku obsahujúcu číslo, alebo vzorec, ktorý vyhodnotí číslo.',
            },
        },
    },
    CHAR: {
        description: 'Vracia znak zadaný číselným kódom',
        abstract: 'Vracia znak zadaný číselným kódom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/char-function-bbd249c8-b36e-4a91-8017-1c133f9b837a',
            },
        ],
        functionParameter: {
            number: {
                name: 'číslo',
                detail: 'Číslo medzi 1 a 255 určujúce, ktorý znak chcete. Znak je z množiny znakov používanej vaším počítačom.',
            },
        },
    },
    CLEAN: {
        description: 'Odstráni z textu všetky netlačiteľné znaky',
        abstract: 'Odstráni z textu všetky netlačiteľné znaky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/clean-function-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ľubovoľné informácie z hárka, z ktorých chcete odstrániť netlačiteľné znaky.' },
        },
    },
    CODE: {
        description: 'Vracia číselný kód prvého znaku v textovom reťazci',
        abstract: 'Vracia číselný kód prvého znaku v textovom reťazci',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/code-function-c32b692b-2ed0-4a04-bdd9-75640144b928',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, pre ktorý chcete kód prvého znaku.' },
        },
    },
    CONCAT: {
        description: 'Spája text z viacerých rozsahov a/alebo reťazcov, ale neposkytuje argumenty oddeľovača ani ignorovania prázdnych.',
        abstract: 'Spája text z viacerých rozsahov a/alebo reťazcov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/concat-function-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Textová položka na spojenie. Reťazec alebo pole reťazcov, napríklad rozsah buniek.' },
            text2: {
                name: 'text2',
                detail: 'Ďalšie textové položky na spojenie. Môže byť maximálne 253 textových argumentov pre textové položky. Každá môže byť reťazec alebo pole reťazcov, napríklad rozsah buniek.',
            },
        },
    },
    CONCATENATE: {
        description: 'Spojí niekoľko textových položiek do jednej textovej položky',
        abstract: 'Spojí niekoľko textových položiek do jednej textovej položky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/concatenate-function-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Prvá položka na spojenie. Položka môže byť textová hodnota, číslo alebo odkaz na bunku.' },
            text2: { name: 'text2', detail: 'Ďalšie textové položky na spojenie. Môžete mať až 255 položiek, spolu najviac 8 192 znakov.' },
        },
    },
    DBCS: {
        description: 'Mení polovičnú šírku (jednobajtové) anglické písmená alebo katakanu v textovom reťazci na plnú šírku (dvojbajtové) znaky',
        abstract: 'Mení polovičnú šírku (jednobajtové) anglické písmená alebo katakanu v textovom reťazci na plnú šírku (dvojbajtové) znaky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/dbcs-function-a4025e73-63d2-4958-9423-21a24794c9e5',
            },
        ],
        functionParameter: {
            text: {
                name: 'text',
                detail: 'Text alebo odkaz na bunku obsahujúcu text, ktorý chcete zmeniť. Ak text neobsahuje žiadne polovičné anglické písmená alebo katakanu, text sa nezmení.',
            },
        },
    },
    DOLLAR: {
        description: 'Konvertuje číslo na text pomocou menového formátu',
        abstract: 'Konvertuje číslo na text pomocou menového formátu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/dollar-function-a6cd05d9-9740-4ad3-a469-8109d18ff611',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, odkaz na bunku obsahujúcu číslo alebo vzorec, ktorý vyhodnotí číslo.' },
            decimals: {
                name: 'desatinné_miesta',
                detail: 'Počet číslic napravo od desatinnej čiarky. Ak je záporný, číslo sa zaokrúhli doľava od desatinnej čiarky. Ak decimals vynecháte, predpokladá sa 2.',
            },
        },
    },
    EXACT: {
        description: 'Overí, či sú dve textové hodnoty identické',
        abstract: 'Overí, či sú dve textové hodnoty identické',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/exact-function-d3087698-fc15-4a15-9631-12575cf29926',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Prvý textový reťazec.' },
            text2: { name: 'text2', detail: 'Druhý textový reťazec.' },
        },
    },
    FIND: {
        description: 'Vyhľadá jeden text v inom (rozlišuje veľkosť písmen)',
        abstract: 'Vyhľadá jeden text v inom (rozlišuje veľkosť písmen)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/find-findb-functions-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: 'hľadaný_text', detail: 'Text, ktorý chcete nájsť.' },
            withinText: { name: 'v_text', detail: 'Text obsahujúci hľadaný text.' },
            startNum: {
                name: 'počiatočná_pozícia',
                detail: 'Určuje znak, od ktorého sa má začať hľadanie. Ak start_num vynecháte, predpokladá sa 1.',
            },
        },
    },
    FINDB: {
        description: 'Vyhľadá jeden text v inom (rozlišuje veľkosť písmen)',
        abstract: 'Vyhľadá jeden text v inom (rozlišuje veľkosť písmen)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/find-findb-functions-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: 'hľadaný_text', detail: 'Text, ktorý chcete nájsť.' },
            withinText: { name: 'v_text', detail: 'Text obsahujúci hľadaný text.' },
            startNum: {
                name: 'počiatočná_pozícia',
                detail: 'Určuje znak, od ktorého sa má začať hľadanie. Ak start_num vynecháte, predpokladá sa 1.',
            },
        },
    },
    FIXED: {
        description: 'Formátuje číslo ako text s pevným počtom desatinných miest',
        abstract: 'Formátuje číslo ako text s pevným počtom desatinných miest',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/fixed-function-ffd5723c-324c-45e9-8b96-e41be2a8274a',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktoré chcete zaokrúhliť a previesť na text.' },
            decimals: {
                name: 'desatinné_miesta',
                detail: 'Počet číslic napravo od desatinnej čiarky. Ak je záporný, číslo sa zaokrúhli doľava od desatinnej čiarky. Ak decimals vynecháte, predpokladá sa 2.',
            },
            noCommas: { name: 'bez_čiark', detail: 'Logická hodnota, ktorá ak je TRUE, zabráni funkcii FIXED zahrnúť čiarky do vráteného textu.' },
        },
    },
    LEFT: {
        description: 'Vracia najľavejšie znaky z textovej hodnoty',
        abstract: 'Vracia najľavejšie znaky z textovej hodnoty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/left-leftb-functions-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Textový reťazec obsahujúci znaky, ktoré chcete extrahovať.' },
            numChars: { name: 'počet_znakov', detail: 'Určuje počet znakov, ktoré má funkcia LEFT extrahovať.' },
        },
    },
    LEFTB: {
        description: 'Vracia najľavejšie znaky z textovej hodnoty',
        abstract: 'Vracia najľavejšie znaky z textovej hodnoty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/left-leftb-functions-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Textový reťazec obsahujúci znaky, ktoré chcete extrahovať.' },
            numBytes: { name: 'počet_bajtov', detail: 'Určuje počet znakov, ktoré má LEFTB extrahovať, podľa bajtov.' },
        },
    },
    LEN: {
        description: 'Vracia počet znakov v textovom reťazci',
        abstract: 'Vracia počet znakov v textovom reťazci',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/len-lenb-functions-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorého dĺžku chcete zistiť. Medzery sa počítajú ako znaky.' },
        },
    },
    LENB: {
        description: 'Vracia počet bajtov použitých na reprezentáciu znakov v textovom reťazci.',
        abstract: 'Vracia počet bajtov použitých na reprezentáciu znakov v textovom reťazci',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/len-lenb-functions-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorého dĺžku chcete zistiť. Medzery sa počítajú ako znaky.' },
        },
    },
    LOWER: {
        description: 'Konvertuje text na malé písmená.',
        abstract: 'Konvertuje text na malé písmená',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/lower-function-3f21df02-a80c-44b2-afaf-81358f9fdeb4',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorý chcete previesť na malé písmená.' },
        },
    },
    MID: {
        description: 'Vracia zadaný počet znakov z textového reťazca od určenej pozície.',
        abstract: 'Vracia zadaný počet znakov z textového reťazca od určenej pozície',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/mid-midb-functions-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Textový reťazec obsahujúci znaky, ktoré chcete extrahovať.' },
            startNum: { name: 'počiatočná_pozícia', detail: 'Pozícia prvého znaku, ktorý chcete v texte extrahovať.' },
            numChars: { name: 'počet_znakov', detail: 'Určuje počet znakov, ktoré má funkcia MID extrahovať.' },
        },
    },
    MIDB: {
        description: 'Vracia zadaný počet znakov z textového reťazca od určenej pozície',
        abstract: 'Vracia zadaný počet znakov z textového reťazca od určenej pozície',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/mid-midb-functions-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Textový reťazec obsahujúci znaky, ktoré chcete extrahovať.' },
            startNum: { name: 'počiatočná_pozícia', detail: 'Pozícia prvého znaku, ktorý chcete v texte extrahovať.' },
            numBytes: { name: 'počet_bajtov', detail: 'Určuje počet znakov, ktoré má funkcia MIDB extrahovať, podľa bajtov.' },
        },
    },
    NUMBERSTRING: {
        description: 'Konvertuje čísla na čínske reťazce',
        abstract: 'Konvertuje čísla na čínske reťazce',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Hodnota prevedená na čínsky reťazec.' },
            type: {
                name: 'typ',
                detail: 'Typ vráteného výsledku. \n1. Čínske malé znaky \n2. Čínske veľké znaky \n3. Čínske znaky na čítanie a písanie',
            },
        },
    },
    NUMBERVALUE: {
        description: 'Konvertuje text na číslo nezávisle od národného nastavenia',
        abstract: 'Konvertuje text na číslo nezávisle od národného nastavenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/numbervalue-function-1b05c8cf-2bfa-4437-af70-596c7ea7d879',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorý sa má previesť na číslo.' },
            decimalSeparator: { name: 'desatinný_oddeľovač', detail: 'Znak použitý na oddelenie celej a zlomkovej časti výsledku.' },
            groupSeparator: { name: 'oddeľovač_skupín', detail: 'Znak použitý na oddelenie skupín číslic.' },
        },
    },
    PHONETIC: {
        description: 'Extrahuje fonetické (furigana) znaky z textového reťazca',
        abstract: 'Extrahuje fonetické (furigana) znaky z textového reťazca',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/phonetic-function-9a329dac-0c0f-42f8-9a55-639086988554',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    PROPER: {
        description: 'Zmení prvé písmeno v každom slove na veľké',
        abstract: 'Zmení prvé písmeno v každom slove na veľké',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/proper-function-52a5a283-e8b2-49be-8506-b2887b889f94',
            },
        ],
        functionParameter: {
            text: {
                name: 'text',
                detail: 'Text v úvodzovkách, vzorec vracajúci text alebo odkaz na bunku s textom, ktorý chcete čiastočne kapitalizovať.',
            },
        },
    },
    REGEXEXTRACT: {
        description: 'Extrahuje prvý zodpovedajúci podreťazec podľa regulárneho výrazu.',
        abstract: 'Extrahuje prvý zodpovedajúci podreťazec podľa regulárneho výrazu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3098244?sjid=5628197291201472796-AP&hl=en',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Vstupný text.' },
            regularExpression: { name: 'regulárny_výraz', detail: 'Vráti sa prvá časť textu, ktorá zodpovedá tomuto výrazu.' },
        },
    },
    REGEXMATCH: {
        description: 'Určuje, či časť textu zodpovedá regulárnemu výrazu.',
        abstract: 'Určuje, či časť textu zodpovedá regulárnemu výrazu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3098292?sjid=5628197291201472796-AP&hl=en',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorý sa má otestovať proti regulárnemu výrazu.' },
            regularExpression: { name: 'regulárny_výraz', detail: 'Regulárny výraz, podľa ktorého sa text testuje.' },
        },
    },
    REGEXREPLACE: {
        description: 'Nahradí časť textového reťazca iným reťazcom pomocou regulárnych výrazov.',
        abstract: 'Nahradí časť textového reťazca iným reťazcom pomocou regulárnych výrazov.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3098245?sjid=5628197291201472796-AP&hl=en',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorého časť sa nahradí.' },
            regularExpression: { name: 'regulárny_výraz', detail: 'Regulárny výraz. Všetky zhodné výskyty v texte sa nahradia.' },
            replacement: { name: 'náhrada', detail: 'Text, ktorý sa vloží do pôvodného textu.' },
        },
    },
    REPLACE: {
        description: 'Nahrádza znaky v texte',
        abstract: 'Nahrádza znaky v texte',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/replace-replaceb-functions-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: 'starý_text', detail: 'Text, v ktorom chcete nahradiť niektoré znaky.' },
            startNum: { name: 'počiatočná_pozícia', detail: 'Pozícia znaku v old_text, ktorý chcete nahradiť new_text.' },
            numChars: { name: 'počet_znakov', detail: 'Počet znakov v old_text, ktoré má REPLACE nahradiť new_text.' },
            newText: { name: 'nový_text', detail: 'Text, ktorý nahradí znaky v old_text.' },
        },
    },
    REPLACEB: {
        description: 'Nahrádza znaky v texte',
        abstract: 'Nahrádza znaky v texte',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/replace-replaceb-functions-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: 'starý_text', detail: 'Text, v ktorom chcete nahradiť niektoré znaky.' },
            startNum: { name: 'počiatočná_pozícia', detail: 'Pozícia znaku v old_text, ktorý chcete nahradiť new_text.' },
            numBytes: { name: 'počet_bajtov', detail: 'Počet bajtov v old_text, ktoré má REPLACEB nahradiť new_text.' },
            newText: { name: 'nový_text', detail: 'Text, ktorý nahradí znaky v old_text.' },
        },
    },
    REPT: {
        description: 'Opakuje text zadaný početkrát',
        abstract: 'Opakuje text zadaný početkrát',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/rept-function-04c4d778-e712-43b4-9c15-d656582bb061',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorý chcete opakovať.' },
            numberTimes: { name: 'počet_opakovaní', detail: 'Kladné číslo určujúce, koľkokrát sa text zopakuje.' },
        },
    },
    RIGHT: {
        description: 'Vracia najpravejšie znaky z textovej hodnoty',
        abstract: 'Vracia najpravejšie znaky z textovej hodnoty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/right-rightb-functions-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Textový reťazec obsahujúci znaky, ktoré chcete extrahovať.' },
            numChars: { name: 'počet_znakov', detail: 'Určuje počet znakov, ktoré má RIGHT extrahovať.' },
        },
    },
    RIGHTB: {
        description: 'Vracia najpravejšie znaky z textovej hodnoty',
        abstract: 'Vracia najpravejšie znaky z textovej hodnoty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/right-rightb-functions-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Textový reťazec obsahujúci znaky, ktoré chcete extrahovať.' },
            numBytes: { name: 'počet_bajtov', detail: 'Určuje počet znakov, ktoré má RIGHTB extrahovať, podľa bajtov.' },
        },
    },
    SEARCH: {
        description: 'Vyhľadá jeden text v inom (nerozlišuje veľkosť písmen)',
        abstract: 'Vyhľadá jeden text v inom (nerozlišuje veľkosť písmen)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/search-searchb-functions-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            findText: { name: 'hľadaný_text', detail: 'Text, ktorý chcete nájsť.' },
            withinText: { name: 'v_text', detail: 'Text obsahujúci hľadaný text.' },
            startNum: {
                name: 'počiatočná_pozícia',
                detail: 'Určuje znak, od ktorého sa má začať hľadanie. Ak start_num vynecháte, predpokladá sa 1.',
            },
        },
    },
    SEARCHB: {
        description: 'Vyhľadá jeden text v inom (nerozlišuje veľkosť písmen)',
        abstract: 'Vyhľadá jeden text v inom (nerozlišuje veľkosť písmen)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/search-searchb-functions-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            findText: { name: 'hľadaný_text', detail: 'Text, ktorý chcete nájsť.' },
            withinText: { name: 'v_text', detail: 'Text obsahujúci hľadaný text.' },
            startNum: {
                name: 'počiatočná_pozícia',
                detail: 'Určuje znak, od ktorého sa má začať hľadanie. Ak start_num vynecháte, predpokladá sa 1.',
            },
        },
    },
    SUBSTITUTE: {
        description: 'Nahrádza starý text novým v textovom reťazci',
        abstract: 'Nahrádza starý text novým v textovom reťazci',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/substitute-function-6434944e-a904-4336-a9b0-1e58df3bc332',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text alebo odkaz na bunku obsahujúcu text, v ktorom chcete nahradiť znaky.' },
            oldText: { name: 'starý_text', detail: 'Text, ktorý chcete nahradiť.' },
            newText: { name: 'nový_text', detail: 'Text, ktorým chcete nahradiť old_text.' },
            instanceNum: {
                name: 'poradie_výskytu',
                detail: 'Určuje, ktorý výskyt old_text sa má nahradiť new_text. Ak zadáte instance_num, nahradí sa len tento výskyt; inak sa nahradia všetky výskyty old_text v texte.',
            },
        },
    },
    T: {
        description: 'Konvertuje svoje argumenty na text',
        abstract: 'Konvertuje svoje argumenty na text',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/t-function-fb83aeec-45e7-4924-af95-53e073541228',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať.' },
        },
    },
    TEXT: {
        description: 'Formátuje číslo a konvertuje ho na text',
        abstract: 'Formátuje číslo a konvertuje ho na text',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/text-function-20d5ac4d-7b94-49fd-bb38-93d29371225c',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Číselná hodnota, ktorú chcete previesť na text.' },
            formatText: { name: 'formát_textu', detail: 'Textový reťazec, ktorý definuje formátovanie, ktoré sa má použiť na zadanú hodnotu.' },
        },
    },
    TEXTAFTER: {
        description: 'Vracia text, ktorý sa nachádza za daným znakom alebo reťazcom',
        abstract: 'Vracia text, ktorý sa nachádza za daným znakom alebo reťazcom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/textafter-function-c8db2546-5b51-416a-9690-c7e6722e90b4',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, v ktorom hľadáte. Zástupné znaky nie sú povolené.' },
            delimiter: { name: 'oddeľovač', detail: 'Text, ktorý označuje bod, pred ktorým chcete extrahovať text.' },
            instanceNum: { name: 'poradie_výskytu', detail: 'Výskyt oddeľovača, pred ktorým chcete extrahovať text.' },
            matchMode: {
                name: 'režim_zhody',
                detail: 'Určuje, či sa pri hľadaní rozlišujú veľké a malé písmená. Predvolene sa rozlišuje.',
            },
            matchEnd: {
                name: 'zhoda_na_konci',
                detail: 'Považuje koniec textu za oddeľovač. Predvolene sa vyžaduje presná zhoda.',
            },
            ifNotFound: { name: 'ak_nenájdené', detail: 'Hodnota vrátená, ak sa nenájde zhoda. Predvolene sa vracia #N/A.' },
        },
    },
    TEXTBEFORE: {
        description: 'Vracia text, ktorý sa nachádza pred daným znakom alebo reťazcom',
        abstract: 'Vracia text, ktorý sa nachádza pred daným znakom alebo reťazcom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/textbefore-function-d099c28a-dba8-448e-ac6c-f086d0fa1b29',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, v ktorom hľadáte. Zástupné znaky nie sú povolené.' },
            delimiter: { name: 'oddeľovač', detail: 'Text, ktorý označuje bod, za ktorým chcete extrahovať text.' },
            instanceNum: { name: 'poradie_výskytu', detail: 'Výskyt oddeľovača, za ktorým chcete extrahovať text.' },
            matchMode: {
                name: 'režim_zhody',
                detail: 'Určuje, či sa pri hľadaní rozlišujú veľké a malé písmená. Predvolene sa rozlišuje.',
            },
            matchEnd: {
                name: 'zhoda_na_konci',
                detail: 'Považuje koniec textu za oddeľovač. Predvolene sa vyžaduje presná zhoda.',
            },
            ifNotFound: { name: 'ak_nenájdené', detail: 'Hodnota vrátená, ak sa nenájde zhoda. Predvolene sa vracia #N/A.' },
        },
    },
    TEXTJOIN: {
        description: 'Text: Spája text z viacerých rozsahov a/alebo reťazcov',
        abstract: 'Text: Spája text z viacerých rozsahov a/alebo reťazcov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/textjoin-function-357b449a-ec91-49d0-80c3-0e8fc845691c',
            },
        ],
        functionParameter: {
            delimiter: {
                name: 'oddeľovač',
                detail: 'Textový reťazec, buď prázdny alebo jeden či viac znakov v dvojitých úvodzovkách, alebo odkaz na platný textový reťazec.',
            },
            ignoreEmpty: { name: 'ignorovať_prázdne', detail: 'Ak TRUE, ignoruje prázdne bunky.' },
            text1: { name: 'text1', detail: 'Textová položka na spojenie. Textový reťazec alebo pole reťazcov, napríklad rozsah buniek.' },
            text2: {
                name: 'text2',
                detail: 'Ďalšie textové položky na spojenie. Môže byť maximálne 252 textových argumentov vrátane text1. Každá môže byť textový reťazec alebo pole reťazcov, napríklad rozsah buniek.',
            },
        },
    },
    TEXTSPLIT: {
        description: 'Rozdelí textové reťazce pomocou oddeľovačov stĺpcov a riadkov',
        abstract: 'Rozdelí textové reťazce pomocou oddeľovačov stĺpcov a riadkov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/textsplit-function-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorý sa má rozdeliť.' },
            colDelimiter: { name: 'oddeľovač_stĺpcov', detail: 'Znak alebo reťazec, podľa ktorého sa delí stĺpec.' },
            rowDelimiter: { name: 'oddeľovač_riadkov', detail: 'Znak alebo reťazec, podľa ktorého sa delí riadok.' },
            ignoreEmpty: { name: 'ignorovať_prázdne', detail: 'Či sa majú ignorovať prázdne bunky. Predvolene FALSE.' },
            matchMode: {
                name: 'režim_zhody',
                detail: 'Hľadá zhodu oddeľovača v texte. Predvolene sa rozlišuje veľkosť písmen.',
            },
            padWith: { name: 'doplnit_s', detail: 'Hodnota použitá na doplnenie. Predvolene sa použije #N/A.' },
        },
    },
    TRIM: {
        description: 'Odstráni z textu všetky medzery okrem jednotlivých medzi slovami.',
        abstract: 'Odstráni medzery z textu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/trim-function-410388fa-c5df-49c6-b16c-9e5630b479f9',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, z ktorého chcete odstrániť medzery.' },
        },
    },
    UNICHAR: {
        description: 'Vracia znak Unicode, na ktorý odkazuje zadaná číselná hodnota',
        abstract: 'Vracia znak Unicode, na ktorý odkazuje zadaná číselná hodnota',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/unichar-function-ffeb64f5-f131-44c6-b332-5cd72f0659b8',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo je Unicode kód reprezentujúci znak.' },
        },
    },
    UNICODE: {
        description: 'Vracia číslo (kódový bod), ktorý zodpovedá prvému znaku textu',
        abstract: 'Vracia číslo (kódový bod), ktorý zodpovedá prvému znaku textu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/unicode-function-adb74aaa-a2a5-4dde-aff6-966e4e81f16f',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text je znak, pre ktorý chcete Unicode hodnotu.' },
        },
    },
    UPPER: {
        description: 'Konvertuje text na veľké písmená',
        abstract: 'Konvertuje text na veľké písmená',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/upper-function-c11f29b3-d1a3-4537-8df6-04d0049963d6',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text, ktorý chcete previesť na veľké písmená.' },
        },
    },
    VALUE: {
        description: 'Konvertuje textový argument na číslo',
        abstract: 'Konvertuje textový argument na číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/value-function-257d0108-07dc-437d-ae1c-bc2d3953d8c2',
            },
        ],
        functionParameter: {
            text: {
                name: 'text',
                detail: 'Text v úvodzovkách alebo odkaz na bunku obsahujúcu text, ktorý chcete previesť na číslo.',
            },
        },
    },
    VALUETOTEXT: {
        description: 'Vracia text z ľubovoľnej zadanej hodnoty',
        abstract: 'Vracia text z ľubovoľnej zadanej hodnoty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/valuetotext-function-5fff61a2-301a-4ab2-9ffa-0a5242a08fea',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorá sa má vrátiť ako text.' },
            format: {
                name: 'formát',
                detail: 'Formát vrátených údajov. Môže byť jedna z dvoch hodnôt: \n0 Predvolené. Stručný formát, ktorý sa ľahko číta. \n1 Prísny formát, ktorý obsahuje escape znaky a oddeľovače riadkov. Generuje reťazec, ktorý možno analyzovať po vložení do riadka vzorcov. Vrátené reťazce uzatvára do úvodzoviek okrem logických hodnôt, čísel a chýb.',
            },
        },
    },
    CALL: {
        description: 'Volá procedúru v dynamickej knižnici alebo kódovom zdroji',
        abstract: 'Volá procedúru v dynamickej knižnici alebo kódovom zdroji',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/call-function-32d58445-e646-4ffd-8d5e-b45077a5e995',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    EUROCONVERT: {
        description: 'Konvertuje číslo na eurá, konvertuje číslo z eur na menu členského štátu eurozóny alebo konvertuje číslo z jednej meny eurozóny na inú pomocou eura ako sprostredkovateľa (triangulácia)',
        abstract: 'Konvertuje číslo na eurá, konvertuje číslo z eur na menu členského štátu eurozóny alebo konvertuje číslo z jednej meny eurozóny na inú pomocou eura ako sprostredkovateľa (triangulácia)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/euroconvert-function-79c8fd67-c665-450c-bb6c-15fc92f8345c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    REGISTER_ID: {
        description: 'Vracia ID registrácie zadanej dynamickej knižnice (DLL) alebo kódového zdroja, ktorý bol predtým zaregistrovaný',
        abstract: 'Vracia ID registrácie zadanej dynamickej knižnice (DLL) alebo kódového zdroja, ktorý bol predtým zaregistrovaný',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/register-id-function-f8f0af0f-fd66-4704-a0f2-87b27b175b50',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
};

export default locale;
