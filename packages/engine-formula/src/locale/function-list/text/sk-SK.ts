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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/asc-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/arraytotext-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bahttext-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/char-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/clean-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/code-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/concat-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/concatenate-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dbcs-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dollar-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/exact-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/this-article-has-been-retired',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/this-article-has-been-retired',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/fixed-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/left-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/left-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/len-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/len-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/lower-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mid-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mid-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/numbervalue-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Odkaz', detail: 'Text, rozsah alebo odkaz obsahujúci fonetický text, ktorý sa má extrahovať.' },
        },
    },
    PROPER: {
        description: 'Zmení prvé písmeno v každom slove na veľké',
        abstract: 'Zmení prvé písmeno v každom slove na veľké',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/proper-function',
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
                url: 'https://support.google.com/docs/answer/3098244?hl=sk',
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
                url: 'https://support.google.com/docs/answer/3098292?hl=sk',
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
                url: 'https://support.google.com/docs/answer/3098245?hl=sk',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/replace-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/replace-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rept-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/right-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/right-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/search-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/search-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/substitute-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/t-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/text-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/textafter-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/textbefore-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/textjoin-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/textsplit-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/trim-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/unichar-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/unicode-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/upper-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/value-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/valuetotext-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Text modulu', detail: 'Názov dynamicky prepájanej knižnice (DLL), ktorá obsahuje procedúru.' },
            procedure: { name: 'Procedúra', detail: 'Názov alebo poradové číslo procedúry v knižnici DLL.' },
            typeText: { name: 'Text typu', detail: 'Text určujúci typy údajov argumentov a vrátenej hodnoty.' },
            argument1: { name: 'Argument 1', detail: 'Voliteľné. Prvý argument odovzdaný procedúre.' },
        },
    },
    EUROCONVERT: {
        description: 'Konvertuje číslo na eurá, konvertuje číslo z eur na menu členského štátu eurozóny alebo konvertuje číslo z jednej meny eurozóny na inú pomocou eura ako sprostredkovateľa (triangulácia)',
        abstract: 'Konvertuje číslo na eurá, konvertuje číslo z eur na menu členského štátu eurozóny alebo konvertuje číslo z jednej meny eurozóny na inú pomocou eura ako sprostredkovateľa (triangulácia)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Číslo', detail: 'Hodnota meny, ktorá sa má skonvertovať.' },
            source: { name: 'Zdroj', detail: 'Kód zdrojovej meny.' },
            target: { name: 'Cieľ', detail: 'Kód cieľovej meny.' },
            fullPrecision: { name: 'Úplná presnosť', detail: 'Logická hodnota určujúca zaokrúhľovanie podľa pravidiel meny.' },
            triangulationPrecision: { name: 'Presnosť triangulácie', detail: 'Voliteľné. Počet platných číslic pri medziprevode cez euro.' },
        },
    },
    REGISTER_ID: {
        description: 'Vracia ID registrácie zadanej dynamickej knižnice (DLL) alebo kódového zdroja, ktorý bol predtým zaregistrovaný',
        abstract: 'Vracia ID registrácie zadanej dynamickej knižnice (DLL) alebo kódového zdroja, ktorý bol predtým zaregistrovaný',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Text modulu', detail: 'Názov knižnice DLL alebo zdroja kódu obsahujúceho procedúru.' },
            procedure: { name: 'Procedúra', detail: 'Názov alebo poradové číslo procedúry.' },
            typeText: { name: 'Text typu', detail: 'Voliteľné. Text určujúci typy údajov argumentov a vrátenej hodnoty.' },
        },
    },
};

export default locale;
