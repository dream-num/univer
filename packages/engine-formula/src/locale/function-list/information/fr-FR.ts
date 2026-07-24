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
    CELL: {
        description: 'La fonction CELLULE renvoie des informations sur la mise en forme, l’emplacement ou le contenu d’une cellule. Par exemple, si vous voulez vérifier qu’une cellule contient bien une valeur numérique et non du texte avant de l’inclure dans un calcul, vous pouvez utiliser la formule suivante :',
        abstract: 'La fonction CELLULE renvoie des informations sur la mise en forme, l’emplacement ou le contenu d’une cellule. Par exemple, si vous voulez vérifier qu’une cellule contient bien une valeur numérique et non du texte avant de l’inclure dans un calcul, vous pouvez utiliser la formule suivante :',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: 'Valeur de texte qui spécifie le type d’informations de cellule que vous voulez obtenir. La liste suivante affiche les valeurs possibles de l’argument type_info et les résultats correspondants.' },
            reference: { name: 'reference', detail: 'Représente la cellule dont vous voulez obtenir des informations. En cas d’omission, les informations spécifiées dans l’argument info_type sont retournées pour la cellule sélectionnée au moment du calcul. Si l’argument référence est une plage de cellules, la fonction CELL renvoie les informations relatives à la cellule active dans la plage sélectionnée. Important: Bien que la référence technique soit facultative, il est recommandé de l’inclure dans votre formule, sauf si vous comprenez l’effet de son absence sur le résultat de votre formule et que vous souhaitez que cet effet soit en place. L’omission de l’argument de référence ne produit pas de manière fiable des informations sur une cellule spécifique, pour les raisons suivantes : En mode de calcul automatique, lorsqu’une cellule est modifiée par un utilisateur, le calcul peut être déclenché avant ou après la progression de la sélection, en fonction de la plateforme que vous utilisez pour Excel. Par exemple, Excel pour Windows déclenche actuellement le calcul avant la modification de la sélection, mais Excel sur le Web le déclenche par la suite. Lorsque Co-Authoring avec un autre utilisateur qui effectue une modification, cette fonction signale votre cellule active plutôt que celle de l’éditeur. Tout recalcul, pour instance appuyant sur F9, entraîne le retour d’un nouveau résultat par la fonction même si aucune modification de cellule n’a eu lieu.' },
        },
    },
    ERROR_TYPE: {
        description: 'Renvoie un nombre correspondant à l’une des valeurs d’erreur de Microsoft Excel ou la valeur #N/A s’il n’y a pas d’erreur. Vous pouvez utiliser la fonction TYPE.ERREUR dans une fonction SI pour tester une valeur d’erreur et renvoyer une chaîne de caractères telle qu’un message à la place de la valeur d’erreur.',
        abstract: 'Renvoie un nombre correspondant à l’une des valeurs d’erreur de Microsoft Excel ou la valeur #N/A s’il n’y a pas d’erreur. Vous pouvez utiliser la fonction TYPE.ERREUR dans une fonction SI pour tester une valeur d’erreur et renvoyer une chaîne de caractères telle qu’un message à la place de la valeur d’erreur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: 'Obligatoire. Il s’agit de la valeur d’erreur dont vous voulez trouver le numéro. Bien que l’argument valeur puisse être une valeur d’erreur proprement dite, il est généralement donné sous forme de référence à une cellule contenant une formule que vous souhaitez tester.' },
        },
    },
    INFO: {
        description: 'Renvoie des informations sur l’environnement d’exploitation en cours.',
        abstract: 'Renvoie des informations sur l’environnement d’exploitation en cours.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Type_text', detail: 'Obligatoire. Représente le texte qui spécifie le type d’informations à renvoyer.' },
        },
    },
    ISBETWEEN: {
        description: 'Vérifie si le nombre fourni est compris entre deux autres nombres (inclus ou exclus).',
        abstract: 'Vérifie si le nombre fourni est compris entre deux autres nombres (inclus ou exclus).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10538337?hl=fr',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: 'Valeur à tester comme se trouvant entre "valeur_inférieure" et "valeur_supérieure".' },
            lowerValue: { name: 'lower_value', detail: 'Limite inférieure de la plage de valeurs dans laquelle peut se trouver "valeur_à_comparer".' },
            upperValue: { name: 'upper_value', detail: 'Limite supérieure de la plage de valeurs dans laquelle peut se trouver "valeur_à_comparer".' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: 'Détermine si la plage de valeurs inclut "valeur_inférieure". TRUE par défaut' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: 'Détermine si la plage de valeurs inclut "valeur_supérieure". TRUE par défaut' },
        },
    },
    ISBLANK: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISDATE: {
        description: 'La fonction ISDATE indique si une valeur est une date.',
        abstract: 'La fonction ISDATE indique si une valeur est une date.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9061381?hl=fr',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Valeur à vérifier en tant que date.' },
        },
    },
    ISEMAIL: {
        description: 'Pour vérifier si une valeur est une adresse e-mail valide, utilisez la fonction ISEMAIL. Cette vérification permet de déterminer si la valeur suit un format d\'adresse e-mail couramment accepté, mais ne vérifie pas son existence.',
        abstract: 'Pour vérifier si une valeur est une adresse e-mail valide, utilisez la fonction ISEMAIL. Cette vérification permet de déterminer si la valeur suit un format d\'adresse e-mail couramment accepté, mais ne vérifie pas son existence.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256503?hl=fr',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'ISEMAIL("johndoe@yourname.com")' },
        },
    },
    ISERR: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISERROR: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISEVEN: {
        description: 'Renvoie la valeur VRAI si le nombre est pair et FAUX s’il est impair.',
        abstract: 'Renvoie la valeur VRAI si le nombre est pair et FAUX s’il est impair.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Représente la valeur à tester. Si nombre n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    ISFORMULA: {
        description: 'Vérifie s’il existe une référence à une cellule qui contient une formule et renvoie VRAI ou FAUX.',
        abstract: 'Vérifie s’il existe une référence à une cellule qui contient une formule et renvoie VRAI ou FAUX.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obligatoire. Référence est une référence à la cellule que vous souhaitez tester. Référence peut être une référence de cellule, une formule ou un nom qui fait référence à une cellule.' },
        },
    },
    ISLOGICAL: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISNA: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISNONTEXT: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISNUMBER: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISODD: {
        description: 'Renvoie la valeur VRAI si nombre est impair et FAUX si nombre est pair.',
        abstract: 'Renvoie la valeur VRAI si nombre est impair et FAUX si nombre est pair.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Représente la valeur à tester. Si nombre n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    ISOMITTED: {
        description: 'Vérifie si la valeur d’un lambda est manquante et retourne TRUE ou FALSE.',
        abstract: 'Vérifie si la valeur d’un lambda est manquante et retourne TRUE ou FALSE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argument', detail: 'Valeur que vous souhaitez tester, telle qu’un paramètre LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISTEXT: {
        description: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        abstract: 'Chacune de ces fonctions, regroupées sous l’appellation de fonctions EST , vérifie la valeur spécifiée et renvoie VRAI ou FAUX, selon le cas. Par exemple, la fonction ESTVIDE renvoie la valeur logique VRAI si l’argument valeur est une référence à une cellule vide et la valeur logique FAUX dans les autres cas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Valeur à tester. L’argument valeur peut être une valeur vide (cellule vide), d’erreur, une valeur logique, de texte, de nombre ou une valeur de référence ou un nom s’y référant.' },
        },
    },
    ISURL: {
        description: 'Vérifie si une valeur est une URL valide.',
        abstract: 'Vérifie si une valeur est une URL valide.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256501?hl=fr',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'ISURL("www.google.com")' },
        },
    },
    N: {
        description: 'Renvoie une valeur convertie en nombre.',
        abstract: 'Renvoie une valeur convertie en nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Représente la valeur à convertir. N convertit les valeurs en suivant les règles décrites dans le tableau suivant.' },
        },
    },
    NA: {
        description: 'Retourne la valeur d’erreur #N/A. #N/A est la valeur d’erreur qui signifie « aucune valeur n’est disponible ». Utilisez NA pour marquer des cellules vides. En entrant #N/A dans les cellules où vous manquez des informations, vous pouvez éviter le problème d’inclure involontairement des cellules vides dans vos calculs. (Lorsqu’une formule fait référence à une cellule contenant #N/A, la formule renvoie la valeur d’erreur #N/A.)',
        abstract: 'Retourne la valeur d’erreur #N/A. #N/A est la valeur d’erreur qui signifie « aucune valeur n’est disponible ». Utilisez NA pour marquer des cellules vides. En entrant #N/A dans les cellules où vous manquez des informations, vous pouvez éviter le problème d’inclure involontairement des cellules vides dans vos calculs. (Lorsqu’une formule fait référence à une cellule contenant #N/A, la formule renvoie la valeur d’erreur #N/A.)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'La fonction SHEET retourne le numéro de feuille de la feuille spécifiée ou une autre référence.',
        abstract: 'La fonction SHEET retourne le numéro de feuille de la feuille spécifiée ou une autre référence.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argument facultatif. Utilisez cette option pour spécifier le nom d’une feuille ou d’une référence pour laquelle vous souhaitez obtenir le numéro de feuille. Sinon, la fonction retourne le numéro de la feuille contenant la fonction SHEET.' },
        },
    },
    SHEETS: {
        description: 'Renvoie le nombre de feuilles dans une référence.',
        abstract: 'Renvoie le nombre de feuilles dans une référence.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Renvoie un nombre indiquant le type de données d’une valeur.',
        abstract: 'Renvoie un nombre indiquant le type de données d’une valeur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Peut être n’importe quelle valeur, par exemple un nombre, du texte ou une valeur logique.' },
        },
    },
};

export default locale;
