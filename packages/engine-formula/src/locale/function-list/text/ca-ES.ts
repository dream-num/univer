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
                url: 'https://support.microsoft.com/ca-es/excel/functions/asc-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/arraytotext-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/bahttext-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/char-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/clean-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/code-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/concat-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/concatenate-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dbcs-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dollar-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/exact-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/this-article-has-been-retired',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/this-article-has-been-retired',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/fixed-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/left-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/left-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/len-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/len-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/lower-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/mid-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/mid-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/numbervalue-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Referència', detail: 'Text, interval o referència que conté el text fonètic que voleu extreure.' },
        },
    },
    PROPER: {
        description: 'Posa en majúscula la primera lletra de cada paraula d\'un valor de text',
        abstract: 'Posa en majúscula la primera lletra de cada paraula d\'un valor de text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text entre cometes, una fórmula que retorna text o una referència a una cel·la que conté el text que voleu capitalitzar parcialment.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Extreu subcadenes coincidents d\'acord amb una expressió regular.',
        abstract: 'Extreu subcadenes coincidents d\'acord amb una expressió regular.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/3098244?hl=ca',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Consell : l\'exemple anterior tornarà dues columnes de dades: "extreure" a la primera i "valors" a la segona.' },
            regularExpression: { name: 'expressió_regular', detail: 'Es retornarà la primera part del text que coincideixi amb aquesta expressió.' },
        },
    },
    REGEXMATCH: {
        description: 'Determina si una part del text coincideix amb una expressió regular.',
        abstract: 'Determina si una part del text coincideix amb una expressió regular.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/3098292?hl=ca',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'text que cal contrastar amb l\'expressió regular.' },
            regularExpression: { name: 'expressió_regular', detail: 'expressió regular amb què es contrastarà el text.' },
        },
    },
    REGEXREPLACE: {
        description: 'Substitueix part d\'una cadena de text per una altra cadena de text utilitzant expressions regulars.',
        abstract: 'Substitueix part d\'una cadena de text per una altra cadena de text utilitzant expressions regulars.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/3098245?hl=ca',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'text, una part del qual cal substituir.' },
            regularExpression: { name: 'expressió_regular', detail: 'l\'expressió regular. Totes les coincidències de l\'argument text se substituiran.' },
            replacement: { name: 'substitució', detail: 'text que cal inserir al text original.' },
        },
    },
    REPLACE: {
        description: 'Reemplaça caràcters dins del text',
        abstract: 'Reemplaça caràcters dins del text',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/replace-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/replace-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/rept-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/right-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/right-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/search-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/search-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/substitute-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/t-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/text-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/textafter-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/textbefore-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/textjoin-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/textsplit-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/trim-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/unichar-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/unicode-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/upper-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/value-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/valuetotext-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Text del mòdul', detail: 'Nom de la biblioteca d’enllaç dinàmic (DLL) que conté el procediment.' },
            procedure: { name: 'Procediment', detail: 'Nom o número ordinal del procediment de la DLL.' },
            typeText: { name: 'Text del tipus', detail: 'Text que especifica els tipus de dades dels arguments i del valor retornat.' },
            argument1: { name: 'Argument 1', detail: 'Opcional. Primer argument que es passa al procediment.' },
        },
    },
    EUROCONVERT: {
        description: 'Converteix un nombre a euros, converteix un nombre d\'euros a una moneda d\'un membre de l\'euro, o converteix un nombre d\'una moneda d\'un membre de l\'euro a una altra utilitzant l\'euro com a intermediari (triangulació)',
        abstract: 'Converteix un nombre a euros, converteix un nombre d\'euros a una moneda d\'un membre de l\'euro, o converteix un nombre d\'una moneda d\'un membre de l\'euro a una altra utilitzant l\'euro com a intermediari (triangulació)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Nombre', detail: 'Valor de moneda que s’ha de convertir.' },
            source: { name: 'Origen', detail: 'Codi de la moneda d’origen.' },
            target: { name: 'Destinació', detail: 'Codi de la moneda de destinació.' },
            fullPrecision: { name: 'Precisió completa', detail: 'Valor lògic que controla si s’arrodoneix amb les regles específiques de la moneda.' },
            triangulationPrecision: { name: 'Precisió de triangulació', detail: 'Opcional. Nombre de dígits significatius per a la conversió intermèdia a euros.' },
        },
    },
    REGISTER_ID: {
        description: 'Retorna l\'ID de registre de la biblioteca d\'enllaç dinàmic (DLL) especificada o del recurs de codi que s\'ha registrat prèviament',
        abstract: 'Retorna l\'ID de registre de la biblioteca d\'enllaç dinàmic (DLL) especificada o del recurs de codi que s\'ha registrat prèviament',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Text del mòdul', detail: 'Nom de la DLL o del recurs de codi que conté el procediment.' },
            procedure: { name: 'Procediment', detail: 'Nom o número ordinal del procediment.' },
            typeText: { name: 'Text del tipus', detail: 'Opcional. Text que especifica els tipus de dades dels arguments i del valor retornat.' },
        },
    },
};

export default locale;
