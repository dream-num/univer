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
        description: 'Canvia les lletres angleses o katakana d\'amplada completa (doble byte) dins d\'una cadena de caràcters a caràcters d\'amplada mitjana (un sol byte)',
        abstract: 'Canvia les lletres angleses o katakana d\'amplada completa (doble byte) dins d\'una cadena de caràcters a caràcters d\'amplada mitjana (un sol byte)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/asc-function-0b6abf1c-c663-4004-a964-ebc00b723266',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text o una referència a una cel·la que conté el text que voleu canviar. Si el text no conté cap lletra d\'amplada completa, el text no es canvia.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Retorna una matriu de valors de text des de qualsevol rang especificat',
        abstract: 'Retorna una matriu de valors de text des de qualsevol rang especificat',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/arraytotext-function-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu a retornar com a text.' },
            format: { name: 'format', detail: 'El format de les dades retornades. Pot ser un de dos valors: \n0 Predeterminat. Format concís i fàcil de llegir. \n1 Format estricte que inclou caràcters d\'escapament i delimitadors de fila. Genera una cadena que es pot analitzar en introduir-la a la barra de fórmules. Encapsula les cadenes retornades entre cometes, excepte per a valors booleans, nombres i errors.' },
        },
    },
    BAHTTEXT: {
        description: 'Converteix un nombre a text, utilitzant el format de moneda ß (baht)',
        abstract: 'Converteix un nombre a text, utilitzant el format de moneda ß (baht)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/bahttext-function-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Un nombre que voleu convertir a text, o una referència a una cel·la que conté un nombre, o una fórmula que avalua a un nombre.' },
        },
    },
    CHAR: {
        description: 'Retorna el caràcter especificat pel número de codi',
        abstract: 'Retorna el caràcter especificat pel número de codi',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/char-function-bbd249c8-b36e-4a91-8017-1c133f9b837a',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Un nombre entre 1 i 255 que especifica quin caràcter voleu. El caràcter és del joc de caràcters utilitzat pel vostre ordinador.' },
        },
    },
    CLEAN: {
        description: 'Elimina tots els caràcters no imprimibles del text',
        abstract: 'Elimina tots els caràcters no imprimibles del text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/clean-function-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Qualsevol informació del full de càlcul de la qual voleu eliminar caràcters no imprimibles.' },
        },
    },
    CODE: {
        description: 'Retorna un codi numèric per al primer caràcter d\'una cadena de text',
        abstract: 'Retorna un codi numèric per al primer caràcter d\'una cadena de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/code-function-c32b692b-2ed0-4a04-bdd9-75640144b928',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text del qual voleu el codi del primer caràcter.' },
        },
    },
    CONCAT: {
        description: 'Combina el text de múltiples rangs i/o cadenes, però no proporciona els arguments de delimitador o IgnoraBuits.',
        abstract: 'Combina el text de múltiples rangs i/o cadenes, però no proporciona els arguments de delimitador o IgnoraBuits',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/concat-function-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Element de text a unir. Una cadena, o una matriu de cadenes, com un rang de cel·les.' },
            text2: { name: 'text2', detail: 'Elements de text addicionals a unir. Pot haver-hi un màxim de 253 arguments de text per als elements de text. Cadascun pot ser una cadena, o una matriu de cadenes, com un rang de cel·les.' },
        },
    },
    CONCATENATE: {
        description: 'Uneix diversos elements de text en un de sol',
        abstract: 'Uneix diversos elements de text en un de sol',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/concatenate-function-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'El primer element a unir. L\'element pot ser un valor de text, un nombre o una referència de cel·la.' },
            text2: { name: 'text2', detail: 'Elements de text addicionals a unir. Podeu tenir fins a 255 elements, fins a un total de 8,192 caràcters.' },
        },
    },
    DBCS: {
        description: 'Canvia les lletres angleses o katakana d\'amplada mitjana (un sol byte) dins d\'una cadena de caràcters a caràcters d\'amplada completa (doble byte)',
        abstract: 'Canvia les lletres angleses o katakana d\'amplada mitjana (un sol byte) dins d\'una cadena de caràcters a caràcters d\'amplada completa (doble byte)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/dbcs-function-a4025e73-63d2-4958-9423-21a24794c9e5',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text o una referència a una cel·la que conté el text que voleu canviar. Si el text no conté cap lletra anglesa d\'amplada mitjana o katakana, el text no es canvia.' },
        },
    },
    DOLLAR: {
        description: 'Converteix un nombre a text utilitzant el format de moneda',
        abstract: 'Converteix un nombre a text utilitzant el format de moneda',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/dollar-function-a6cd05d9-9740-4ad3-a469-8109d18ff611',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Un nombre, una referència a una cel·la que conté un nombre, o una fórmula que avalua a un nombre.' },
            decimals: { name: 'decimals', detail: 'El nombre de dígits a la dreta del punt decimal. Si és negatiu, el nombre s\'arrodoneix a l\'esquerra del punt decimal. Si ometeu decimals, s\'assumeix que són 2.' },
        },
    },
    EXACT: {
        description: 'Comprova si dos valors de text són idèntics',
        abstract: 'Comprova si dos valors de text són idèntics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/exact-function-d3087698-fc15-4a15-9631-12575cf29926',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'La primera cadena de text.' },
            text2: { name: 'text2', detail: 'La segona cadena de text.' },
        },
    },
    FIND: {
        description: 'Troba un valor de text dins d\'un altre (distingeix majúscules de minúscules)',
        abstract: 'Troba un valor de text dins d\'un altre (distingeix majúscules de minúscules)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/find-findb-functions-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: 'text_buscat', detail: 'El text que voleu trobar.' },
            withinText: { name: 'dins_text', detail: 'El text que conté el text que voleu trobar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el caràcter on començar la cerca. Si ometeu núm_inicial, s\'assumeix que és 1.' },
        },
    },
    FINDB: {
        description: 'Troba un valor de text dins d\'un altre (distingeix majúscules de minúscules)',
        abstract: 'Troba un valor de text dins d\'un altre (distingeix majúscules de minúscules)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/find-findb-functions-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: 'text_buscat', detail: 'El text que voleu trobar.' },
            withinText: { name: 'dins_text', detail: 'El text que conté el text que voleu trobar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el caràcter on començar la cerca. Si ometeu núm_inicial, s\'assumeix que és 1.' },
        },
    },
    FIXED: {
        description: 'Formata un nombre com a text amb un nombre fix de decimals',
        abstract: 'Formata un nombre com a text amb un nombre fix de decimals',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/fixed-function-ffd5723c-324c-45e9-8b96-e41be2a8274a',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir i convertir a text.' },
            decimals: { name: 'decimals', detail: 'El nombre de dígits a la dreta del punt decimal. Si és negatiu, el nombre s\'arrodoneix a l\'esquerra del punt decimal. Si ometeu decimals, s\'assumeix que són 2.' },
            noCommas: { name: 'sense_comes', detail: 'Un valor lògic que, si és CERT, impedeix que FIXAT inclogui comes en el text retornat.' },
        },
    },
    LEFT: {
        description: 'Retorna els caràcters de més a l\'esquerra d\'un valor de text',
        abstract: 'Retorna els caràcters de més a l\'esquerra d\'un valor de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/left-leftb-functions-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La cadena de text que conté els caràcters que voleu extreure.' },
            numChars: { name: 'nombre_caràcters', detail: 'Especifica el nombre de caràcters que voleu que ESQUERRA extregui.' },
        },
    },
    LEFTB: {
        description: 'Retorna els caràcters de més a l\'esquerra d\'un valor de text',
        abstract: 'Retorna els caràcters de més a l\'esquerra d\'un valor de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/left-leftb-functions-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La cadena de text que conté els caràcters que voleu extreure.' },
            numBytes: { name: 'nombre_bytes', detail: 'Especifica el nombre de caràcters que voleu que ESQUERRAB extregui, basat en bytes.' },
        },
    },
    LEN: {
        description: 'Retorna el nombre de caràcters d\'una cadena de text',
        abstract: 'Retorna el nombre de caràcters d\'una cadena de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/len-lenb-functions-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text del qual voleu trobar la longitud. Els espais compten com a caràcters.' },
        },
    },
    LENB: {
        description: 'Retorna el nombre de bytes utilitzats per representar els caràcters d\'una cadena de text',
        abstract: 'Retorna el nombre de bytes utilitzats per representar els caràcters d\'una cadena de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/len-lenb-functions-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text del qual voleu trobar la longitud. Els espais compten com a caràcters.' },
        },
    },
    LOWER: {
        description: 'Converteix el text a minúscules',
        abstract: 'Converteix el text a minúscules',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/lower-function-3f21df02-a80c-44b2-afaf-81358f9fdeb4',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text que voleu convertir a minúscules.' },
        },
    },
    MID: {
        description: 'Retorna un nombre específic de caràcters d\'una cadena de text començant a la posició que especifiqueu',
        abstract: 'Retorna un nombre específic de caràcters d\'una cadena de text començant a la posició que especifiqueu',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/mid-midb-functions-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La cadena de text que conté els caràcters que voleu extreure.' },
            startNum: { name: 'núm_inicial', detail: 'La posició del primer caràcter que voleu extreure en el text.' },
            numChars: { name: 'nombre_caràcters', detail: 'Especifica el nombre de caràcters que voleu que EXTRET extregui.' },
        },
    },
    MIDB: {
        description: 'Retorna un nombre específic de caràcters d\'una cadena de text començant a la posició que especifiqueu',
        abstract: 'Retorna un nombre específic de caràcters d\'una cadena de text començant a la posició que especifiqueu',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/mid-midb-functions-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La cadena de text que conté els caràcters que voleu extreure.' },
            startNum: { name: 'núm_inicial', detail: 'La posició del primer caràcter que voleu extreure en el text.' },
            numBytes: { name: 'nombre_bytes', detail: 'Especifica el nombre de caràcters que voleu que EXTRETB extregui, basat en bytes.' },
        },
    },
    NUMBERSTRING: {
        description: 'Converteix nombres a cadenes xineses',
        abstract: 'Converteix nombres a cadenes xineses',
        links: [
            {
                title: 'Instruccions',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor convertit a una cadena xinesa.' },
            type: { name: 'tipus', detail: 'El tipus del resultat retornat. \n1. Minúscules xineses \n2. Majúscules xineses \n3. Caràcters xinesos de lectura i escriptura' },
        },
    },
    NUMBERVALUE: {
        description: 'Converteix text a nombre d\'una manera independent de la configuració regional',
        abstract: 'Converteix text a nombre d\'una manera independent de la configuració regional',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/numbervalue-function-1b05c8cf-2bfa-4437-af70-596c7ea7d879',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text a convertir a nombre.' },
            decimalSeparator: { name: 'separador_decimal', detail: 'El caràcter utilitzat per separar la part entera i la fraccionària del resultat.' },
            groupSeparator: { name: 'separador_grup', detail: 'El caràcter utilitzat per separar agrupacions de nombres.' },
        },
    },
    PHONETIC: {
        description: 'Extreu els caràcters fonètics (furigana) d\'una cadena de text',
        abstract: 'Extreu els caràcters fonètics (furigana) d\'una cadena de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/phonetic-function-9a329dac-0c0f-42f8-9a55-639086988554',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    PROPER: {
        description: 'Posa en majúscula la primera lletra de cada paraula d\'un valor de text',
        abstract: 'Posa en majúscula la primera lletra de cada paraula d\'un valor de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/proper-function-52a5a283-e8b2-49be-8506-b2887b889f94',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text entre cometes, una fórmula que retorna text o una referència a una cel·la que conté el text que voleu capitalitzar parcialment.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Extreu les primeres subcadenes coincidents segons una expressió regular.',
        abstract: 'Extreu les primeres subcadenes coincidents segons una expressió regular.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/3098244?sjid=5628197291201472796-AP&hl=ca',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text d\'entrada.' },
            regularExpression: { name: 'expressió_regular', detail: 'Es retornarà la primera part del text que coincideixi amb aquesta expressió.' },
        },
    },
    REGEXMATCH: {
        description: 'Indica si un fragment de text coincideix amb una expressió regular.',
        abstract: 'Indica si un fragment de text coincideix amb una expressió regular.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/3098292?sjid=5628197291201472796-AP&hl=ca',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text a provar amb l\'expressió regular.' },
            regularExpression: { name: 'expressió_regular', detail: 'L\'expressió regular amb la qual provar el text.' },
        },
    },
    REGEXREPLACE: {
        description: 'Substitueix part d\'una cadena de text per una altra cadena de text mitjançant expressions regulars.',
        abstract: 'Substitueix part d\'una cadena de text per una altra cadena de text mitjançant expressions regulars.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/3098245?sjid=5628197291201472796-AP&hl=ca',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text, una part del qual serà substituïda.' },
            regularExpression: { name: 'expressió_regular', detail: 'L\'expressió regular. Totes les instàncies coincidents en el text seran substituïdes.' },
            replacement: { name: 'substitució', detail: 'El text que s\'inserirà en el text original.' },
        },
    },
    REPLACE: {
        description: 'Reemplaça caràcters dins del text',
        abstract: 'Reemplaça caràcters dins del text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/replace-replaceb-functions-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: 'text_antic', detail: 'Text en el qual voleu reemplaçar alguns caràcters.' },
            startNum: { name: 'núm_inicial', detail: 'La posició del caràcter en text_antic que voleu reemplaçar amb text_nou.' },
            numChars: { name: 'nombre_caràcters', detail: 'El nombre de caràcters en text_antic que voleu que REEMPLAÇA reemplaci amb text_nou.' },
            newText: { name: 'text_nou', detail: 'El text que reemplaçarà els caràcters en text_antic.' },
        },
    },
    REPLACEB: {
        description: 'Reemplaça caràcters dins del text',
        abstract: 'Reemplaça caràcters dins del text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/replace-replaceb-functions-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: 'text_antic', detail: 'Text en el qual voleu reemplaçar alguns caràcters.' },
            startNum: { name: 'núm_inicial', detail: 'La posició del caràcter en text_antic que voleu reemplaçar amb text_nou.' },
            numBytes: { name: 'nombre_bytes', detail: 'El nombre de bytes en text_antic que voleu que REEMPLAÇAB reemplaci amb text_nou.' },
            newText: { name: 'text_nou', detail: 'El text que reemplaçarà els caràcters en text_antic.' },
        },
    },
    REPT: {
        description: 'Repeteix el text un nombre determinat de vegades',
        abstract: 'Repeteix el text un nombre determinat de vegades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/rept-function-04c4d778-e712-43b4-9c15-d656582bb061',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text que voleu repetir.' },
            numberTimes: { name: 'nombre_vegades', detail: 'Un nombre positiu que especifica el nombre de vegades que cal repetir el text.' },
        },
    },
    RIGHT: {
        description: 'Retorna els caràcters de més a la dreta d\'un valor de text',
        abstract: 'Retorna els caràcters de més a la dreta d\'un valor de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/right-rightb-functions-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La cadena de text que conté els caràcters que voleu extreure.' },
            numChars: { name: 'nombre_caràcters', detail: 'Especifica el nombre de caràcters que voleu que DRETA extregui.' },
        },
    },
    RIGHTB: {
        description: 'Retorna els caràcters de més a la dreta d\'un valor de text',
        abstract: 'Retorna els caràcters de més a la dreta d\'un valor de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/right-rightb-functions-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La cadena de text que conté els caràcters que voleu extreure.' },
            numBytes: { name: 'nombre_bytes', detail: 'Especifica el nombre de caràcters que voleu que DRETAB extregui, basat en bytes.' },
        },
    },
    SEARCH: {
        description: 'Troba un valor de text dins d\'un altre (no distingeix majúscules de minúscules)',
        abstract: 'Troba un valor de text dins d\'un altre (no distingeix majúscules de minúscules)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/search-searchb-functions-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            findText: { name: 'text_buscat', detail: 'El text que voleu trobar.' },
            withinText: { name: 'dins_text', detail: 'El text que conté el text que voleu trobar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el caràcter on començar la cerca. Si ometeu núm_inicial, s\'assumeix que és 1.' },
        },
    },
    SEARCHB: {
        description: 'Troba un valor de text dins d\'un altre (no distingeix majúscules de minúscules)',
        abstract: 'Troba un valor de text dins d\'un altre (no distingeix majúscules de minúscules)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/search-searchb-functions-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            findText: { name: 'text_buscat', detail: 'El text que voleu trobar.' },
            withinText: { name: 'dins_text', detail: 'El text que conté el text que voleu trobar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el caràcter on començar la cerca. Si ometeu núm_inicial, s\'assumeix que és 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Substitueix text antic per text nou en una cadena de text',
        abstract: 'Substitueix text antic per text nou en una cadena de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/substitute-function-6434944e-a904-4336-a9b0-1e58df3bc332',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text o la referència a una cel·la que conté text en el qual voleu substituir caràcters.' },
            oldText: { name: 'text_antic', detail: 'El text que voleu reemplaçar.' },
            newText: { name: 'text_nou', detail: 'El text amb el qual voleu reemplaçar text_antic.' },
            instanceNum: { name: 'núm_instància', detail: 'Especifica quina ocurrència de text_antic voleu reemplaçar amb text_nou. Si especifiqueu núm_instància, només es reemplaça aquesta instància de text_antic. Altrament, cada ocurrència de text_antic en el text es canvia per text_nou.' },
        },
    },
    T: {
        description: 'Converteix els seus arguments a text',
        abstract: 'Converteix els seus arguments a text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/t-function-fb83aeec-45e7-4924-af95-53e073541228',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu provar.' },
        },
    },
    TEXT: {
        description: 'Formata un nombre i el converteix a text',
        abstract: 'Formata un nombre i el converteix a text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/text-function-20d5ac4d-7b94-49fd-bb38-93d29371225c',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Un valor numèric que voleu convertir en text.' },
            formatText: { name: 'format_text', detail: 'Una cadena de text que defineix el format que voleu aplicar al valor subministrat.' },
        },
    },
    TEXTAFTER: {
        description: 'Retorna el text que apareix després d\'un caràcter o cadena donats',
        abstract: 'Retorna el text que apareix després d\'un caràcter o cadena donats',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/textafter-function-c8db2546-5b51-416a-9690-c7e6722e90b4',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text dins del qual esteu cercant. No es permeten caràcters comodí.' },
            delimiter: { name: 'delimitador', detail: 'El text que marca el punt després del qual voleu extreure.' },
            instanceNum: { name: 'núm_instància', detail: 'La instància del delimitador després de la qual voleu extreure el text.' },
            matchMode: { name: 'mode_coincidència', detail: 'Determina si la cerca de text distingeix entre majúscules i minúscules. El valor per defecte és sensible a majúscules i minúscules.' },
            matchEnd: { name: 'coincidència_final', detail: 'Tracta el final del text com un delimitador. Per defecte, el text és una coincidència exacta.' },
            ifNotFound: { name: 'si_no_es_troba', detail: 'Valor retornat si no es troba cap coincidència. Per defecte, es retorna #N/A.' },
        },
    },
    TEXTBEFORE: {
        description: 'Retorna el text que apareix abans d\'un caràcter o cadena donats',
        abstract: 'Retorna el text que apareix abans d\'un caràcter o cadena donats',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/textbefore-function-d099c28a-dba8-448e-ac6c-f086d0fa1b29',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text dins del qual esteu cercant. No es permeten caràcters comodí.' },
            delimiter: { name: 'delimitador', detail: 'El text que marca el punt abans del qual voleu extreure.' },
            instanceNum: { name: 'núm_instància', detail: 'La instància del delimitador abans de la qual voleu extreure el text.' },
            matchMode: { name: 'mode_coincidència', detail: 'Determina si la cerca de text distingeix entre majúscules i minúscules. El valor per defecte és sensible a majúscules i minúscules.' },
            matchEnd: { name: 'coincidència_final', detail: 'Tracta el final del text com un delimitador. Per defecte, el text és una coincidència exacta.' },
            ifNotFound: { name: 'si_no_es_troba', detail: 'Valor retornat si no es troba cap coincidència. Per defecte, es retorna #N/A.' },
        },
    },
    TEXTJOIN: {
        description: 'Text: Combina el text de múltiples rangs i/o cadenes',
        abstract: 'Text: Combina el text de múltiples rangs i/o cadenes',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/textjoin-function-357b449a-ec91-49d0-80c3-0e8fc845691c',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimitador', detail: 'Una cadena de text, buida o amb un o més caràcters tancats entre cometes dobles, o una referència a una cadena de text vàlida.' },
            ignoreEmpty: { name: 'ignora_buits', detail: 'Si és CERT, ignora les cel·les buides.' },
            text1: { name: 'text1', detail: 'Element de text a unir. Una cadena de text, o una matriu de cadenes, com un rang de cel·les.' },
            text2: { name: 'text2', detail: 'Elements de text addicionals a unir. Pot haver-hi un màxim de 252 arguments de text per als elements de text, inclòs text1. Cadascun pot ser una cadena de text, o una matriu de cadenes, com un rang de cel·les.' },
        },
    },
    TEXTSPLIT: {
        description: 'Divideix cadenes de text utilitzant delimitadors de columna i fila',
        abstract: 'Divideix cadenes de text utilitzant delimitadors de columna i fila',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/textsplit-function-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text a dividir.' },
            colDelimiter: { name: 'delimitador_col', detail: 'El caràcter o cadena pel qual dividir la columna.' },
            rowDelimiter: { name: 'delimitador_fila', detail: 'El caràcter o cadena en què dividir la línia.' },
            ignoreEmpty: { name: 'ignora_buits', detail: 'Si s\'han d\'ignorar les cel·les buides. El valor per defecte és FALS.' },
            matchMode: { name: 'mode_coincidència', detail: 'Cerca una coincidència de delimitador en el text. Per defecte, es fa una coincidència sensible a majúscules i minúscules.' },
            padWith: { name: 'omplir_amb', detail: 'El valor a utilitzar per a l\'ompliment. Per defecte, s\'utilitza #N/A.' },
        },
    },
    TRIM: {
        description: 'Elimina tots els espais del text excepte els espais individuals entre paraules.',
        abstract: 'Elimina espais del text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/trim-function-410388fa-c5df-49c6-b16c-9e5630b479f9',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text del qual voleu eliminar els espais.' },
        },
    },
    UNICHAR: {
        description: 'Retorna el caràcter Unicode que es referencia pel valor numèric donat',
        abstract: 'Retorna el caràcter Unicode que es referencia pel valor numèric donat',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/unichar-function-ffeb64f5-f131-44c6-b332-5cd72f0659b8',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El Nombre és el número Unicode que representa el caràcter.' },
        },
    },
    UNICODE: {
        description: 'Retorna el nombre (punt de codi) que correspon al primer caràcter del text',
        abstract: 'Retorna el nombre (punt de codi) que correspon al primer caràcter del text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/unicode-function-adb74aaa-a2a5-4dde-aff6-966e4e81f16f',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El Text és el caràcter del qual voleu el valor Unicode.' },
        },
    },
    UPPER: {
        description: 'Converteix el text a majúscules',
        abstract: 'Converteix el text a majúscules',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/upper-function-c11f29b3-d1a3-4537-8df6-04d0049963d6',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text que voleu convertir a majúscules.' },
        },
    },
    VALUE: {
        description: 'Converteix un argument de text a un nombre',
        abstract: 'Converteix un argument de text a un nombre',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/value-function-257d0108-07dc-437d-ae1c-bc2d3953d8c2',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'El text entre cometes o una referència a una cel·la que conté el text que voleu convertir.' },
        },
    },
    VALUETOTEXT: {
        description: 'Retorna text des de qualsevol valor especificat',
        abstract: 'Retorna text des de qualsevol valor especificat',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/valuetotext-function-5fff61a2-301a-4ab2-9ffa-0a5242a08fea',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor a retornar com a text.' },
            format: { name: 'format', detail: 'El format de les dades retornades. Pot ser un de dos valors: \n0 Predeterminat. Format concís i fàcil de llegir. \n1 Format estricte que inclou caràcters d\'escapament i delimitadors de fila. Genera una cadena que es pot analitzar en introduir-la a la barra de fórmules. Encapsula les cadenes retornades entre cometes, excepte per a valors booleans, nombres i errors.' },
        },
    },
    CALL: {
        description: 'Crida a un procediment en una biblioteca d\'enllaç dinàmic o recurs de codi',
        abstract: 'Crida a un procediment en una biblioteca d\'enllaç dinàmic o recurs de codi',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/call-function-32d58445-e646-4ffd-8d5e-b45077a5e995',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    EUROCONVERT: {
        description: 'Converteix un nombre a euros, converteix un nombre d\'euros a una moneda d\'un membre de l\'euro, o converteix un nombre d\'una moneda d\'un membre de l\'euro a una altra utilitzant l\'euro com a intermediari (triangulació)',
        abstract: 'Converteix un nombre a euros, converteix un nombre d\'euros a una moneda d\'un membre de l\'euro, o converteix un nombre d\'una moneda d\'un membre de l\'euro a una altra utilitzant l\'euro com a intermediari (triangulació)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/euroconvert-function-79c8fd67-c665-450c-bb6c-15fc92f8345c',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    REGISTER_ID: {
        description: 'Retorna l\'ID de registre de la biblioteca d\'enllaç dinàmic (DLL) especificada o del recurs de codi que s\'ha registrat prèviament',
        abstract: 'Retorna l\'ID de registre de la biblioteca d\'enllaç dinàmic (DLL) especificada o del recurs de codi que s\'ha registrat prèviament',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/register-id-function-f8f0af0f-fd66-4704-a0f2-87b27b175b50',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
};

export default locale;
