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
        description: 'En ce qui concerne les langues à jeu de caractères codés sur deux octets (DBCS, Double-byte Character Set), la fonction remplace les caractères à pleine chasse (codés sur deux octets) en caractères à demi-chasse (codés sur un octet).',
        abstract: 'En ce qui concerne les langues à jeu de caractères codés sur deux octets (DBCS, Double-byte Character Set), la fonction remplace les caractères à pleine chasse (codés sur deux octets) en caractères à demi-chasse (codés sur un octet).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente le texte ou une référence à une cellule contenant le texte que vous souhaitez modifier. Si le texte ne contient pas de lettres à pleine chasse, il n’est pas modifié.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'La fonction ARRAYTOTEXT renvoie une matrice de valeurs de texte à partir de toute plage spécifiée. Elle transfère les valeurs de texte inchangées et convertit les valeurs non textuelles en texte.',
        abstract: 'La fonction ARRAYTOTEXT renvoie une matrice de valeurs de texte à partir de toute plage spécifiée. Elle transfère les valeurs de texte inchangées et convertit les valeurs non textuelles en texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice à renvoyer comme texte. Obligatoire.' },
            format: { name: 'format', detail: 'Le format des données retournées. Facultatif. Il peut s’agir de l’une des deux valeurs : 0 Valeur par défaut. Format concis facile à lire. Le texte renvoyé est identique au texte rendu dans une cellule dans laquelle une mise en forme générale est appliquée. 1 Format strict qui inclut des caractères d’échappement et des délimiteurs de lignes. Génère une chaîne qui peut être analysée lors de la saisie dans la barre de formule. Encapsule les chaînes renvoyées entre guillemets, à l’exception des valeurs booléennes, des nombres et des erreurs.' },
        },
    },
    BAHTTEXT: {
        description: 'Convertit un nombre en texte en langue thaï et ajoute le suffixe « Baht »',
        abstract: 'Convertit un nombre en texte en langue thaï et ajoute le suffixe « Baht »',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Un nombre que vous convertissez en texte, une référence à une cellule contenant un nombre ou une formule qui retourne un nombre.' },
        },
    },
    CHAR: {
        description: 'Renvoie le caractère spécifié par un nombre. Utilisez CAR pour convertir en caractères des numéros de pages de codes provenant de fichiers stockés sur d’autres types d’ordinateurs.',
        abstract: 'Renvoie le caractère spécifié par un nombre. Utilisez CAR pour convertir en caractères des numéros de pages de codes provenant de fichiers stockés sur d’autres types d’ordinateurs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente un nombre compris entre 1 et 255, indiquant le caractère recherché. Ce dernier provient du jeu de caractères utilisé par votre ordinateur. Remarque Excel sur le Web prend uniquement en charge CHAR(9), CHAR(10), CHAR(13) et CHAR(32) et versions ultérieures.' },
        },
    },
    CLEAN: {
        description: 'Supprime tous les caractères de contrôle du texte. Utilisez EPURAGE pour du texte importé d’autres applications contenant des caractères qui ne pourront peut-être pas être imprimés sous votre système d’exploitation. Par exemple, la fonction EPURAGE vous permet de supprimer certains codes de bas niveau généralement placés par le système au début et à la fin des fichiers de données, et qui ne peuvent pas être imprimés.',
        abstract: 'Supprime tous les caractères de contrôle du texte. Utilisez EPURAGE pour du texte importé d’autres applications contenant des caractères qui ne pourront peut-être pas être imprimés sous votre système d’exploitation. Par exemple, la fonction EPURAGE vous permet de supprimer certains codes de bas niveau généralement placés par le système au début et à la fin des fichiers de données, et qui ne peuvent pas être imprimés.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente toute information d’une feuille de calcul dont vous voulez supprimer les caractères non imprimables.' },
        },
    },
    CODE: {
        description: 'Renvoie le numéro de code du premier caractère du texte. Le code renvoyé correspond au jeu de caractères utilisé par votre ordinateur.',
        abstract: 'Renvoie le numéro de code du premier caractère du texte. Le code renvoyé correspond au jeu de caractères utilisé par votre ordinateur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Texte dont vous voulez obtenir le code du premier caractère.' },
        },
    },
    CONCAT: {
        description: 'La fonction CONCAT combine le texte de plusieurs plages et/ou chaînes, mais elle ne fournit pas d’arguments délimiteur ou IgnoreEmpty.',
        abstract: 'La fonction CONCAT combine le texte de plusieurs plages et/ou chaînes, mais elle ne fournit pas d’arguments délimiteur ou IgnoreEmpty.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Élément de texte à joindre. Chaîne, ou tableau de chaînes, par exemple une plage de cellules.' },
            text2: { name: 'text2', detail: 'Autres éléments de texte à joindre. Vous pouvez faire figurer jusqu’à 253 arguments de texte. Il peut s’agir de chaînes ou de tableaux de chaînes, comme une plage de cellules.' },
        },
    },
    CONCATENATE: {
        description: 'La fonction CONCATENER , qui fait partie des fonctions de texte permet de joindre plusieurs chaînes au sein d’une seule chaîne.',
        abstract: 'La fonction CONCATENER , qui fait partie des fonctions de texte permet de joindre plusieurs chaînes au sein d’une seule chaîne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Premier élément à joindre. Il peut s’agir d’une valeur texte, d’un nombre ou d’une référence de cellule.' },
            text2: { name: 'text2', detail: 'Éléments de texte supplémentaires à joindre. Vous pouvez avoir jusqu’à 255 éléments, pour un total de 8 192 caractères.' },
        },
    },
    DBCS: {
        description: 'La fonction décrite dans cette rubrique d’aide convertit des lettres à demi-chasse (codées sur un octet) à l’intérieur d’une chaîne de caractères en caractères à pleine chasse (codés sur deux octets). Le nom de la fonction (et du caractère qu’elle ajoute) dépend de vos paramètres de langue.',
        abstract: 'La fonction décrite dans cette rubrique d’aide convertit des lettres à demi-chasse (codées sur un octet) à l’intérieur d’une chaîne de caractères en caractères à pleine chasse (codés sur deux octets). Le nom de la fonction (et du caractère qu’elle ajoute) dépend de vos paramètres de langue.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente le texte ou une référence à une cellule contenant le texte que vous souhaitez modifier. Si l’argument texte ne contient pas de caractères Anglais ou Katakana à demi-chasse, le texte n’est pas modifié.' },
        },
    },
    DOLLAR: {
        description: 'La fonction DOLLAR , l’une des fonctions TEXT , convertit un nombre en texte à l’aide du format monétaire, avec les décimales arrondies au nombre d’emplacements que vous spécifiez. DOLLAR utilise $#,##0.00_) ; Format de nombre ($#,##0.00), bien que le symbole monétaire appliqué dépend de vos paramètres de langue locale.',
        abstract: 'La fonction DOLLAR , l’une des fonctions TEXT , convertit un nombre en texte à l’aide du format monétaire, avec les décimales arrondies au nombre d’emplacements que vous spécifiez. DOLLAR utilise $#,##0.00_) ; Format de nombre ($#,##0.00), bien que le symbole monétaire appliqué dépend de vos paramètres de langue locale.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente un nombre, une référence à une cellule contenant un nombre ou une formule qui renvoie un nombre.' },
            decimals: { name: 'decimals', detail: 'Optionnel. Représente le nombre de chiffres après la virgule. Si cette valeur est négative, le nombre est arrondi à gauche de la virgule décimale. Si décimales est omis, le nombre de décimales par défaut est 2.' },
        },
    },
    EXACT: {
        description: 'Compare deux chaînes de texte et renvoie la valeur VRAI si elles sont identiques ou la valeur FAUX dans le cas contraire. EXACT respecte la casse, mais ne tient pas compte des différences de mise en forme. Utilisez EXACT pour tester la conformité d’un texte tapé dans un document.',
        abstract: 'Compare deux chaînes de texte et renvoie la valeur VRAI si elles sont identiques ou la valeur FAUX dans le cas contraire. EXACT respecte la casse, mais ne tient pas compte des différences de mise en forme. Utilisez EXACT pour tester la conformité d’un texte tapé dans un document.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Obligatoire. Représente la première chaîne de texte.' },
            text2: { name: 'text2', detail: 'Obligatoire. Représente la seconde chaîne de texte.' },
        },
    },
    FIND: {
        description: 'Recherche une valeur textuelle dans une autre en respectant la casse.',
        abstract: 'Recherche une valeur textuelle dans une autre en respectant la casse.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Texte à rechercher.' },
            withinText: { name: 'within_text', detail: 'Texte contenant le texte à rechercher.' },
            startNum: { name: 'start_num', detail: 'Indique le caractère auquel commencer la recherche. Si start_num est omis, sa valeur est 1.' },
        },
    },
    FINDB: {
        description: 'Recherche une valeur textuelle dans une autre en respectant la casse.',
        abstract: 'Recherche une valeur textuelle dans une autre en respectant la casse.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Texte à rechercher.' },
            withinText: { name: 'within_text', detail: 'Texte contenant le texte à rechercher.' },
            startNum: { name: 'start_num', detail: 'Indique le caractère auquel commencer la recherche. Si start_num est omis, sa valeur est 1.' },
        },
    },
    FIXED: {
        description: 'Arrondit un nombre au nombre de décimales spécifié, lui applique le format décimal, à l’aide d’une virgule et d’espaces, et renvoie le résultat sous forme de texte.',
        abstract: 'Arrondit un nombre au nombre de décimales spécifié, lui applique le format décimal, à l’aide d’une virgule et d’espaces, et renvoie le résultat sous forme de texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre que vous voulez arrondir et convertir en texte.' },
            decimals: { name: 'decimals', detail: 'Optionnel. Représente le nombre de chiffres après la virgule.' },
            noCommas: { name: 'no_commas', detail: 'Optionnel. Représente une valeur logique qui, lorsqu’elle est VRAI, permet d’éviter que des virgules soient insérées dans le texte renvoyé par CTXT.' },
        },
    },
    LEFT: {
        description: 'Renvoie les caractères les plus à gauche d’une valeur textuelle.',
        abstract: 'Renvoie les caractères les plus à gauche d’une valeur textuelle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chaîne de texte contenant les caractères à extraire.' },
            numChars: { name: 'num_chars', detail: 'Indique le nombre de caractères que LEFT doit extraire.' },
        },
    },
    LEFTB: {
        description: 'Renvoie les caractères les plus à gauche d’une valeur textuelle.',
        abstract: 'Renvoie les caractères les plus à gauche d’une valeur textuelle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chaîne de texte contenant les caractères à extraire.' },
            numBytes: { name: 'num_bytes', detail: 'Indique le nombre de caractères que LEFTB doit extraire en fonction des octets.' },
        },
    },
    LEN: {
        description: 'Renvoie le nombre de caractères d’une chaîne de texte.',
        abstract: 'Renvoie le nombre de caractères d’une chaîne de texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Texte dont vous souhaitez connaître la longueur. Les espaces comptent comme des caractères.' },
        },
    },
    LENB: {
        description: 'Renvoie le nombre d’octets utilisés pour représenter les caractères d’une chaîne de texte.',
        abstract: 'Renvoie le nombre d’octets utilisés pour représenter les caractères d’une chaîne de texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Texte dont vous souhaitez connaître la longueur. Les espaces comptent comme des caractères.' },
        },
    },
    LOWER: {
        description: 'Convertit toutes les lettres majuscules d’une chaîne de texte en lettres minuscules.',
        abstract: 'Convertit toutes les lettres majuscules d’une chaîne de texte en lettres minuscules.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente le texte à convertir en caractères minuscules. La fonction MINUSCULE ne modifie pas les caractères du texte qui ne sont pas des lettres.' },
        },
    },
    MID: {
        description: 'Renvoie un nombre donné de caractères d’une chaîne de texte à partir de la position indiquée.',
        abstract: 'Renvoie un nombre donné de caractères d’une chaîne de texte à partir de la position indiquée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chaîne de texte contenant les caractères à extraire.' },
            startNum: { name: 'start_num', detail: 'Position du premier caractère de text à extraire.' },
            numChars: { name: 'num_chars', detail: 'Indique le nombre de caractères que MID doit extraire.' },
        },
    },
    MIDB: {
        description: 'Renvoie un nombre donné de caractères d’une chaîne de texte à partir de la position indiquée.',
        abstract: 'Renvoie un nombre donné de caractères d’une chaîne de texte à partir de la position indiquée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chaîne de texte contenant les caractères à extraire.' },
            startNum: { name: 'start_num', detail: 'Position du premier caractère de text à extraire.' },
            numBytes: { name: 'num_bytes', detail: 'Indique le nombre de caractères que MIDB doit extraire en fonction des octets.' },
        },
    },
    NUMBERSTRING: {
        description: 'Convertit des nombres en chaînes de caractères chinoises.',
        abstract: 'Convertit des nombres en chaînes de caractères chinoises.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Valeur convertie en chaîne chinoise.' },
            type: { name: 'type', detail: 'Type du résultat renvoyé. \n1. Chinois en minuscules \n2. Chinois en majuscules \n3. Caractères chinois de lecture et d’écriture' },
        },
    },
    NUMBERVALUE: {
        description: 'Convertit un texte en nombre en fonction de paramètres régionaux.',
        abstract: 'Convertit un texte en nombre en fonction de paramètres régionaux.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Le texte à convertir en nombre.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'Optionnel. Le caractère utilisé pour séparer l’entier et la partie fractionnaire du résultat.' },
            groupSeparator: { name: 'group_separator', detail: 'Optionnel. Le caractère utilisé pour séparer les regroupements de nombres, par exemple pour séparer les milliers des centaines et les millions des milliers.' },
        },
    },
    PHONETIC: {
        description: 'Extrait les caractères phonétiques (furigana) d’une chaîne de texte.',
        abstract: 'Extrait les caractères phonétiques (furigana) d’une chaîne de texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Référence', detail: 'Obligatoire. Représente une chaîne de texte, ou une référence à une cellule unique ou à une plage de cellules contenant une chaîne de texte furigana.' },
        },
    },
    PROPER: {
        description: 'Met en majuscule la première lettre de chaque chaîne de caractères et toute lettre d’un texte qui suit un caractère non alphabétique. Toutes les autres lettres sont converties en lettres minuscules.',
        abstract: 'Met en majuscule la première lettre de chaque chaîne de caractères et toute lettre d’un texte qui suit un caractère non alphabétique. Toutes les autres lettres sont converties en lettres minuscules.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente un texte entre guillemets, une formule qui renvoie du texte ou une référence à une cellule contenant un texte dont vous voulez que certaines lettres soient en majuscules.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Extrait les premières sous-chaînes correspondant à une expression régulière.',
        abstract: 'Extrait les premières sous-chaînes correspondant à une expression régulière.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=fr',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Astuce : L\'exemple ci-dessus renvoie deux colonnes de données, "extraire" (première) et "valeurs" (seconde).' },
            regularExpression: { name: 'regular_expression', detail: 'La première partie de text qui correspond à cette expression est renvoyée.' },
        },
    },
    REGEXMATCH: {
        description: 'Indique si une partie d\'un texte correspond à une expression régulière.',
        abstract: 'Indique si une partie d\'un texte correspond à une expression régulière.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=fr',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'texte à tester par rapport à l\'expression régulière.' },
            regularExpression: { name: 'regular_expression', detail: 'expression régulière à tester par rapport au texte.' },
        },
    },
    REGEXREPLACE: {
        description: 'Remplace une partie d\'une chaîne de texte par une autre chaîne en utilisant des expressions régulières.',
        abstract: 'Remplace une partie d\'une chaîne de texte par une autre chaîne en utilisant des expressions régulières.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=fr',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'texte dont une partie doit être remplacée.' },
            regularExpression: { name: 'regular_expression', detail: 'expression régulière. Toutes les instances présentant une correspondance avec texte seront remplacées.' },
            replacement: { name: 'replacement', detail: 'texte à insérer dans le texte d\'origine.' },
        },
    },
    REPLACE: {
        description: 'Remplace des caractères dans un texte.',
        abstract: 'Remplace des caractères dans un texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Texte dans lequel vous souhaitez remplacer certains caractères.' },
            startNum: { name: 'start_num', detail: 'Position du caractère dans old_text à remplacer par new_text.' },
            numChars: { name: 'num_chars', detail: 'Nombre de caractères dans old_text que REPLACE doit remplacer par new_text.' },
            newText: { name: 'new_text', detail: 'Texte qui remplace les caractères dans old_text.' },
        },
    },
    REPLACEB: {
        description: 'Remplace des caractères dans un texte.',
        abstract: 'Remplace des caractères dans un texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Texte dans lequel vous souhaitez remplacer certains caractères.' },
            startNum: { name: 'start_num', detail: 'Position du caractère dans old_text à remplacer par new_text.' },
            numBytes: { name: 'num_bytes', detail: 'Nombre d’octets dans old_text que REPLACEB doit remplacer par new_text.' },
            newText: { name: 'new_text', detail: 'Texte qui remplace les caractères dans old_text.' },
        },
    },
    REPT: {
        description: 'Répète un texte un certain nombre de fois. Utilisez la fonction REPT pour remplir une cellule avec plusieurs instances d’une chaîne de texte.',
        abstract: 'Répète un texte un certain nombre de fois. Utilisez la fonction REPT pour remplir une cellule avec plusieurs instances d’une chaîne de texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente le texte à répéter.' },
            numberTimes: { name: 'number_times', detail: 'Obligatoire. Représente un nombre positif indiquant le nombre de répétitions de la chaîne de texte.' },
        },
    },
    RIGHT: {
        description: 'Renvoie les caractères les plus à droite d’une valeur textuelle.',
        abstract: 'Renvoie les caractères les plus à droite d’une valeur textuelle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chaîne de texte contenant les caractères à extraire.' },
            numChars: { name: 'num_chars', detail: 'Indique le nombre de caractères que RIGHT doit extraire.' },
        },
    },
    RIGHTB: {
        description: 'Renvoie les caractères les plus à droite d’une valeur textuelle.',
        abstract: 'Renvoie les caractères les plus à droite d’une valeur textuelle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chaîne de texte contenant les caractères à extraire.' },
            numBytes: { name: 'num_bytes', detail: 'Indique le nombre de caractères que RIGHTB doit extraire en fonction des octets.' },
        },
    },
    SEARCH: {
        description: 'Recherche une valeur textuelle dans une autre sans respecter la casse.',
        abstract: 'Recherche une valeur textuelle dans une autre sans respecter la casse.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Texte à rechercher.' },
            withinText: { name: 'within_text', detail: 'Texte contenant le texte à rechercher.' },
            startNum: { name: 'start_num', detail: 'Indique le caractère auquel commencer la recherche. Si start_num est omis, sa valeur est 1.' },
        },
    },
    SEARCHB: {
        description: 'Recherche une valeur textuelle dans une autre sans respecter la casse.',
        abstract: 'Recherche une valeur textuelle dans une autre sans respecter la casse.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Texte à rechercher.' },
            withinText: { name: 'within_text', detail: 'Texte contenant le texte à rechercher.' },
            startNum: { name: 'start_num', detail: 'Indique le caractère auquel commencer la recherche. Si start_num est omis, sa valeur est 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Remplace new_text old_text dans une chaîne de texte. Utilisez SUBSTITUTE lorsque vous souhaitez remplacer du texte spécifique dans une chaîne de texte ; utilisez REPLACE lorsque vous souhaitez remplacer tout texte qui se trouve à un emplacement spécifique dans une chaîne de texte.',
        abstract: 'Remplace new_text old_text dans une chaîne de texte. Utilisez SUBSTITUTE lorsque vous souhaitez remplacer du texte spécifique dans une chaîne de texte ; utilisez REPLACE lorsque vous souhaitez remplacer tout texte qui se trouve à un emplacement spécifique dans une chaîne de texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente le texte ou la référence à une cellule contenant le texte dont vous voulez remplacer certains caractères.' },
            oldText: { name: 'old_text', detail: 'Obligatoire. Représente le texte à remplacer.' },
            newText: { name: 'new_text', detail: 'Obligatoire. Représente le texte qui doit remplacer ancien_texte.' },
            instanceNum: { name: 'instance_num', detail: 'Optionnel. Spécifie quelle occurrence de ancien_texte vous souhaitez remplacer par nouveau_texte. Si vous spécifiez no_position, seule l’occurrence correspondante de ancien_texte est remplacée. Sinon, toutes les occurrences de ancien_texte dans texte sont remplacées par nouveau_texte.' },
        },
    },
    T: {
        description: 'Renvoie le texte auquel l’argument valeur fait référence.',
        abstract: 'Renvoie le texte auquel l’argument valeur fait référence.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Représente la valeur à tester.' },
        },
    },
    TEXT: {
        description: 'La fonction TEXTE vous permet de modifier la manière dont un nombre est affiché en lui appliquant une mise en forme qui utilise des codes de format . Cela peut vous être utile lorsque vous souhaitez afficher des nombres dans un format plus lisible, ou quand vous souhaitez combiner des nombres à du texte ou des symboles.',
        abstract: 'La fonction TEXTE vous permet de modifier la manière dont un nombre est affiché en lui appliquant une mise en forme qui utilise des codes de format . Cela peut vous être utile lorsque vous souhaitez afficher des nombres dans un format plus lisible, ou quand vous souhaitez combiner des nombres à du texte ou des symboles.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Valeur numérique que vous souhaitez convertir en texte.' },
            formatText: { name: 'format_text', detail: 'Chaîne de texte qui définit la mise en forme à appliquer à la valeur fournie.' },
        },
    },
    TEXTAFTER: {
        description: 'Retourne le texte qui se trouve après le caractère ou la chaîne de caractères donnés. C’est l’opposé de la fonction TEXTE.AVANTE.',
        abstract: 'Retourne le texte qui se trouve après le caractère ou la chaîne de caractères donnés. C’est l’opposé de la fonction TEXTE.AVANTE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Texte dans lequel effectuer la recherche. Les caractères génériques ne sont pas autorisés.' },
            delimiter: { name: 'delimiter', detail: 'Texte qui marque le point après lequel extraire.' },
            instanceNum: { name: 'instance_num', detail: 'Occurrence du délimiteur après laquelle extraire le texte.' },
            matchMode: { name: 'match_mode', detail: 'Détermine si la recherche respecte la casse. Par défaut, elle respecte la casse.' },
            matchEnd: { name: 'match_end', detail: 'Traite la fin du texte comme un délimiteur. Par défaut, le texte doit correspondre exactement.' },
            ifNotFound: { name: 'if_not_found', detail: 'Valeur renvoyée si aucune correspondance n’est trouvée. Par défaut, #N/A est renvoyé.' },
        },
    },
    TEXTBEFORE: {
        description: 'Retourne le texte qui se trouve avant un caractère ou une chaîne de caractères donnés. C’est l’opposé de la fonction TEXTAFTER .',
        abstract: 'Retourne le texte qui se trouve avant un caractère ou une chaîne de caractères donnés. C’est l’opposé de la fonction TEXTAFTER .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Texte dans lequel effectuer la recherche. Les caractères génériques ne sont pas autorisés.' },
            delimiter: { name: 'delimiter', detail: 'Texte qui marque le point avant lequel extraire.' },
            instanceNum: { name: 'instance_num', detail: 'Occurrence du délimiteur avant laquelle extraire le texte.' },
            matchMode: { name: 'match_mode', detail: 'Détermine si la recherche respecte la casse. Par défaut, elle respecte la casse.' },
            matchEnd: { name: 'match_end', detail: 'Traite le début du texte comme un délimiteur. Par défaut, le texte doit correspondre exactement.' },
            ifNotFound: { name: 'if_not_found', detail: 'Valeur renvoyée si aucune correspondance n’est trouvée. Par défaut, #N/A est renvoyé.' },
        },
    },
    TEXTJOIN: {
        description: 'La fonction JOINDRE.TEXTE combine le texte à partir de plusieurs plages et/ou chaînes, et inclut un séparateur que vous spécifiez entre chaque valeur de texte à combiner. Si le séparateur est une chaîne de texte vide, cette fonction concatène effectivement les plages.',
        abstract: 'La fonction JOINDRE.TEXTE combine le texte à partir de plusieurs plages et/ou chaînes, et inclut un séparateur que vous spécifiez entre chaque valeur de texte à combiner. Si le séparateur est une chaîne de texte vide, cette fonction concatène effectivement les plages.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'Chaîne de texte, vide ou constituée d’un ou plusieurs caractères entre guillemets, ou référence à une chaîne de texte valide. Si un nombre est fourni, il sera traité comme du texte.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Si la valeur est TRUE, ignore les cellules vides.' },
            text1: { name: 'text1', detail: 'Élément de texte à joindre. Chaîne de texte, ou tableau de chaînes, par exemple une plage de cellules.' },
            text2: { name: 'text2', detail: 'Autres éléments de texte à joindre. Vous pouvez faire figurer jusqu’à 252 arguments de texte, texte1 compris. Il peut s’agir de chaînes de texte ou de tableaux de chaînes, comme une plage de cellules.' },
        },
    },
    TEXTSPLIT: {
        description: 'La fonction FRACTIONNER.TEXTE fonctionne de la même manière que l’Assistant Texte à colonnes , mais sous forme de formule. Il vous permet de fractionner les colonnes ou vers le bas par lignes. Il s’agit de l’inverse de la fonction TEXTJOIN .',
        abstract: 'La fonction FRACTIONNER.TEXTE fonctionne de la même manière que l’Assistant Texte à colonnes , mais sous forme de formule. Il vous permet de fractionner les colonnes ou vers le bas par lignes. Il s’agit de l’inverse de la fonction TEXTJOIN .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Texte à fractionner. Obligatoire.' },
            colDelimiter: { name: 'col_delimiter', detail: 'Texte qui marque le point où le texte doit être renversé dans les colonnes.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'Texte qui marque le point où renverser le texte vers le bas des lignes. Facultatif.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Spécifiez TRUE pour ignorer les délimiteurs consécutifs. La valeur par défaut est FALSE, qui crée une cellule vide. Facultatif.' },
            matchMode: { name: 'match_mode', detail: 'Spécifiez 1 pour effectuer une correspondance ne respectant pas la casse. La valeur par défaut est 0, ce qui correspond à une correspondance respectant la casse. Facultatif.' },
            padWith: { name: 'pad_with', detail: 'Valeur avec laquelle compléter le résultat. La valeur par défaut est #N/A.' },
        },
    },
    TRIM: {
        description: 'Supprime tous les espaces de texte à l’exception des espaces simples entre les mots. Exécutez la fonction SUPPRESPACE sur le texte provenant d’autres applications et dont l’espacement peut être irrégulier.',
        abstract: 'Supprime tous les espaces de texte à l’exception des espaces simples entre les mots. Exécutez la fonction SUPPRESPACE sur le texte provenant d’autres applications et dont l’espacement peut être irrégulier.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Texte dont vous souhaitez supprimer les espaces. Le texte doit être contenu entre guillemets.' },
        },
    },
    UNICHAR: {
        description: 'Renvoie le caractère unicode référencé par la valeur numérique donnée.',
        abstract: 'Renvoie le caractère unicode référencé par la valeur numérique donnée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Nombre est le nombre unicode qui représente le caractère.' },
        },
    },
    UNICODE: {
        description: 'Renvoie le nombre (point de code) qui correspond au premier caractère du texte.',
        abstract: 'Renvoie le nombre (point de code) qui correspond au premier caractère du texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Texte est le caractère pour lequel vous souhaitez obtenir la valeur unicode.' },
        },
    },
    UPPER: {
        description: 'Convertit un texte en majuscules.',
        abstract: 'Convertit un texte en majuscules.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente le texte que vous voulez convertir en caractères majuscules. L’argument texte peut être une référence ou une chaîne de caractères.' },
        },
    },
    VALUE: {
        description: 'Convertit en nombre une chaîne de caractères représentant un nombre.',
        abstract: 'Convertit en nombre une chaîne de caractères représentant un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Représente le texte placé entre guillemets ou une référence à une cellule contenant le texte que vous voulez convertir.' },
        },
    },
    VALUETOTEXT: {
        description: 'La fonction VALEUR.EN.TEXTE renvoie le texte d’une valeur spécifiée. Elle transfère les valeurs de texte inchangées et convertit les valeurs non textuelles en texte.',
        abstract: 'La fonction VALEUR.EN.TEXTE renvoie le texte d’une valeur spécifiée. Elle transfère les valeurs de texte inchangées et convertit les valeurs non textuelles en texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'La valeur à renvoyer comme texte. Obligatoire.' },
            format: { name: 'format', detail: 'Le format des données retournées. Facultatif. Il peut s’agir de l’une des deux valeurs : 0 Valeur par défaut. Format concis facile à lire. Le texte renvoyé est identique au texte rendu dans une cellule dans laquelle une mise en forme générale est appliquée. 1 Format strict qui inclut des caractères d’échappement et des délimiteurs de lignes. Génère une chaîne qui peut être analysée lors de la saisie dans la barre de formule. Encapsule les chaînes renvoyées entre guillemets, à l’exception des valeurs booléennes, des nombres et des erreurs.' },
        },
    },
    CALL: {
        description: 'Appelle une procédure dans la bibliothèque de liens dynamiques ou de ressource de code. Cette fonction adopte deux formes de syntaxe. Utilisez la première uniquement avec une ressource de code préalablement mise en registre et utilisant des arguments de la fonction REGISTRE. Utilisez la syntaxe 2a ou 2b pour appeler et mettre en registre simultanément une ressource de code.',
        abstract: 'Appelle une procédure dans la bibliothèque de liens dynamiques ou de ressource de code. Cette fonction adopte deux formes de syntaxe. Utilisez la première uniquement avec une ressource de code préalablement mise en registre et utilisant des arguments de la fonction REGISTRE. Utilisez la syntaxe 2a ou 2b pour appeler et mettre en registre simultanément une ressource de code.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Obligatoire. Représente un texte entre guillemets qui spécifie le nom de la bibliothèque de liens dynamiques contenant la procédure dans Microsoft Excel pour Windows.' },
            procedure: { name: 'Procédure', detail: 'Obligatoire. Représente un texte qui spécifie le nom de la fonction dans la DLL dans Microsoft Excel pour Windows. Vous pouvez aussi utiliser la valeur ordinale de la fonction à partir de l’instruction EXPORTS dans le fichier de définition de module (.DEF). La valeur ordinale ne doit pas être sous forme de texte.' },
            typeText: { name: 'Type_text', detail: 'Obligatoire. Représente un texte qui spécifie le type de données de la valeur renvoyée et les types de données de tous les arguments de la DLL ou de la ressource de code. La première lettre de l’argument type_texte spécifie la valeur renvoyée. Les codes utilisés pour l’argument type_texte sont décrits en détail dans la rubrique Utilisation des fonctions FONCTION.APPELANTE et REGISTRE . Pour des DLL ou des ressources de code (XML) autonomes, vous pouvez omettre cet argument.' },
            argument1: { name: 'Argument1 ,...', detail: 'Optionnel. Représentent les arguments à entrer dans la procédure.' },
        },
    },
    EUROCONVERT: {
        description: 'Convertit un chiffre en euros, convertit dans les devises européennes un chiffre en euros ou convertit un chiffre d’une devise de la zone euro dans une autre en utilisant l’euro comme intermédiaire (triangulation). Les devises disponibles pour cette conversion sont celles des pays membres de l’Union Européenne (UE) qui ont adopté l’euro. Cette fonction utilise des taux de conversion fixes établis par l’UE.',
        abstract: 'Convertit un chiffre en euros, convertit dans les devises européennes un chiffre en euros ou convertit un chiffre d’une devise de la zone euro dans une autre en utilisant l’euro comme intermédiaire (triangulation). Les devises disponibles pour cette conversion sont celles des pays membres de l’Union Européenne (UE) qui ont adopté l’euro. Cette fonction utilise des taux de conversion fixes établis par l’UE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Nombre', detail: 'Obligatoire. Il s’agit de la valeur de la devise que vous souhaitez convertir, ou d’une référence à une cellule qui contient cette valeur.' },
            source: { name: 'Source', detail: 'Obligatoire. Il s’agit d’une chaîne de trois lettres ou une référence à une cellule contenant cette chaîne, qui correspond au code ISO de la devise source. Les codes de devises suivants sont disponibles dans la fonction EUROCONVERT :' },
            target: { name: 'Cible', detail: 'Obligatoire. Il s’agit d’une chaîne de trois lettres ou une référence de cellule, qui correspond au code ISO de la devise dans laquelle vous souhaitez convertir le nombre. Voir la table Source précédente pour obtenir les codes ISO.' },
            fullPrecision: { name: 'Full_precision', detail: 'Obligatoire. Représente une valeur logique (VRAI ou FAUX) ou une expression qui renvoie une valeur VRAI ou FAUX, qui indique comment afficher le résultat.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Obligatoire. Représente un entier supérieur ou égal à 3 qui indique le nombre de chiffres significatifs à utiliser pour la valeur intermédiaire en euros lors de la conversion entre deux devises faisant partie de la zone euro. Si vous ne spécifiez pas cet argument, Excel n’arrondit pas la valeur intermédiaire en euros. Si vous spécifiez cet argument lors de la conversion en euros d’une devise appartenant à la zone euro, Excel calcule la valeur intermédiaire en euros, qui peut ensuite être convertie en devise appartenant à la zone euro.' },
        },
    },
    REGISTER_ID: {
        description: 'Renvoie l’identifiant d’inscription de la bibliothèque de liens dynamiques (DLL) ou de la ressource de code spécifiée précédemment inscrite.',
        abstract: 'Renvoie l’identifiant d’inscription de la bibliothèque de liens dynamiques (DLL) ou de la ressource de code spécifiée précédemment inscrite.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Obligatoire. Représente le texte spécifiant le nom de la DLL qui contient la fonction, dans Microsoft Excel pour Windows.' },
            procedure: { name: 'Procédure', detail: 'Obligatoire. Représente un texte qui spécifie le nom de la fonction dans la DLL dans Microsoft Excel pour Windows. Vous pouvez également utiliser la valeur ordinale de la fonction tirée de l’instruction EXPORTS du fichier de définition de module (.DEF). La valeur ordinale ou le numéro d’identification de la ressource ne doit pas être sous forme de texte.' },
            typeText: { name: 'Type_text', detail: 'Optionnel. Représente le texte indiquant à la DLL le type de données de la valeur renvoyée et celui de tous les arguments. La première lettre de l’argument type_texte spécifie la valeur de retour. Si la fonction ou la ressource de code est déjà mise en Registre, vous pouvez omettre cet argument.' },
        },
    },
};

export default locale;
