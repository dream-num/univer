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
    AND: {
        description: 'La fonction ET renvoie la valeur VRAI si tous ses arguments produisent un résultat vrai, et la valeur FAUX si au moins l’un des arguments produit un résultat faux.',
        abstract: 'La fonction ET renvoie la valeur VRAI si tous ses arguments produisent un résultat vrai, et la valeur FAUX si au moins l’un des arguments produit un résultat faux.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Première condition à tester, pouvant prendre la valeur TRUE ou FALSE.' },
            logical2: { name: 'logical2', detail: 'Conditions supplémentaires à tester, pouvant prendre la valeur TRUE ou FALSE, dans la limite de 255 conditions.' },
        },
    },
    BYCOL: {
        description: 'Applique une expression LAMBDA à chaque colonne et retourne un tableau des résultats. Par exemple, si le tableau d’origine est de 3 colonnes par 2 lignes, le tableau retourné est de 3 colonnes par 1 ligne.',
        abstract: 'Applique une expression LAMBDA à chaque colonne et retourne un tableau des résultats. Par exemple, si le tableau d’origine est de 3 colonnes par 2 lignes, le tableau retourné est de 3 colonnes par 1 ligne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau à séparer par colonne.' },
            lambda: { name: 'lambda', detail: 'Lambda qui prend une colonne comme paramètre unique et calcule un résultat. LambDA accepte un seul paramètre :' },
        },
    },
    BYROW: {
        description: 'Applique un lambda à chaque ligne et retourne un tableau des résultats. Par exemple, si le tableau d’origine est de 3 colonnes par 2 lignes, le tableau retourné est de 1 colonne par 2 lignes.',
        abstract: 'Applique un lambda à chaque ligne et retourne un tableau des résultats. Par exemple, si le tableau d’origine est de 3 colonnes par 2 lignes, le tableau retourné est de 1 colonne par 2 lignes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau à séparer par ligne.' },
            lambda: { name: 'lambda', detail: 'Lambda qui prend une ligne comme paramètre unique et calcule un résultat. LambDA accepte un seul paramètre :' },
        },
    },
    FALSE: {
        description: 'Renvoie la valeur logique FAUX.',
        abstract: 'Renvoie la valeur logique FAUX.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'Par exemple, SI(C2="Oui";1;2) indique SI(C2 = Oui, renvoyer un 1, sinon renvoyer un 2)',
        abstract: 'Par exemple, SI(C2="Oui";1;2) indique SI(C2 = Oui, renvoyer un 1, sinon renvoyer un 2)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'Condition que vous souhaitez tester.' },
            valueIfTrue: { name: 'value_if_true', detail: 'Valeur que vous souhaitez retourner si le résultat de logical_test est TRUE.' },
            valueIfFalse: { name: 'value_if_false', detail: 'Valeur que vous souhaitez retourner si le résultat de logical_test est FALSE.' },
        },
    },
    IFERROR: {
        description: 'Vous pouvez utiliser la fonction SIERREUR pour gérer les erreurs dans une formule. La fonction SIERREUR renvoie une valeur que vous spécifiez si une formule génère une erreur ; sinon, elle renvoie le résultat de la formule.',
        abstract: 'Vous pouvez utiliser la fonction SIERREUR pour gérer les erreurs dans une formule. La fonction SIERREUR renvoie une valeur que vous spécifiez si une formule génère une erreur ; sinon, elle renvoie le résultat de la formule.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obligatoire. Représente l’argument vérifié.' },
            valueIfError: { name: 'value_if_error', detail: 'Obligatoire. Représente la valeur à renvoyer si une formule génère une erreur. Les types d’erreur suivants sont évalués : #N/A, #VALEUR!, #REF!, #DIV/0!, #NOMBRE!, #NOM?, ou #NUL!.' },
        },
    },
    IFNA: {
        description: 'La fonction IFNA retourne la valeur que vous spécifiez si une formule retourne la valeur d’erreur #N/A ; sinon, elle retourne le résultat de la formule.',
        abstract: 'La fonction IFNA retourne la valeur que vous spécifiez si une formule retourne la valeur d’erreur #N/A ; sinon, elle retourne le résultat de la formule.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'L’argument dans lequel la valeur d’erreur #N/A est contrôlée.' },
            valueIfNa: { name: 'value_if_na', detail: 'La valeur à retourner si la formule produit une valeur d’erreur #N/A.' },
        },
    },
    IFS: {
        description: 'La fonction SI.CONDITIONS vérifie si une ou plusieurs conditions sont remplies et renvoie une valeur correspondant à la première condition vraie. L’utilisation de cette fonction revient à utiliser plusieurs instructions SI imbriquées, mais elle reste bien plus facile à lire quand plusieurs conditions se suivent.',
        abstract: 'La fonction SI.CONDITIONS vérifie si une ou plusieurs conditions sont remplies et renvoie une valeur correspondant à la première condition vraie. L’utilisation de cette fonction revient à utiliser plusieurs instructions SI imbriquées, mais elle reste bien plus facile à lire quand plusieurs conditions se suivent.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'Condition qui renvoie TRUE ou FALSE.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'Résultat à renvoyer si logical_test1 renvoie TRUE. Peut être vide.' },
            logicalTest2: { name: 'logical_test2', detail: 'Condition qui renvoie TRUE ou FALSE.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'Résultat à renvoyer si logical_testN renvoie TRUE. Chaque value_if_trueN correspond à une condition logical_testN. Peut être vide.' },
        },
    },
    LAMBDA: {
        description: 'Vous pouvez créer une fonction pour une formule couramment utilisée. Cela vous permet de ne plus copier-coller cette formule, ce qui peut entraîner des erreurs. Vous pouvez également ajouter de façon efficace vos propres fonctions à la bibliothèque de fonctions Excel native. En outre, une fonction LAMBDA ne nécessite pas de VBA, de macros ou de JavaScript, de sorte que les non-programmeurs peuvent également tirer parti de son utilisation.',
        abstract: 'Vous pouvez créer une fonction pour une formule couramment utilisée. Cela vous permet de ne plus copier-coller cette formule, ce qui peut entraîner des erreurs. Vous pouvez également ajouter de façon efficace vos propres fonctions à la bibliothèque de fonctions Excel native. En outre, une fonction LAMBDA ne nécessite pas de VBA, de macros ou de JavaScript, de sorte que les non-programmeurs peuvent également tirer parti de son utilisation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: 'Une valeur que vous souhaitez transmettre à la fonction, comme une référence de cellule, une chaîne ou un nombre. Vous pouvez entrer jusqu’à 253 paramètres. Cet argument est facultatif.' },
            calculation: { name: 'calculation', detail: 'La formule que vous souhaitez exécuter et renvoyer comme résultat de la fonction. Cette formule doit être le dernier argument et doit renvoyer un résultat. Il s’agit d’un argument obligatoire.' },
        },
    },
    LET: {
        description: 'La LET fonction affecte des noms aux résultats de calcul. Cela permet de stocker des calculs intermédiaires, des valeurs ou de définir des noms à l\'intérieur d\'une formule. Ces noms s’appliquent uniquement dans l’étendue de la LET fonction. À l’instar des variables en programmation, LET s’effectue par le biais de la syntaxe de formule native d’Excel.',
        abstract: 'La LET fonction affecte des noms aux résultats de calcul. Cela permet de stocker des calculs intermédiaires, des valeurs ou de définir des noms à l\'intérieur d\'une formule. Ces noms s’appliquent uniquement dans l’étendue de la LET fonction. À l’instar des variables en programmation, LET s’effectue par le biais de la syntaxe de formule native d’Excel.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'Premier nom à attribuer. Il doit commencer par une lettre. Il ne peut pas être le résultat d’une formule ni entrer en conflit avec la syntaxe de plage.' },
            nameValue1: { name: 'name_value1', detail: 'Valeur attribuée à name1.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'L’un des éléments suivants :\n1. Un calcul utilisant tous les noms de la fonction LET. Il doit être le dernier argument de LET.\n2. Un deuxième nom auquel attribuer un deuxième name_value. Si un nom est spécifié, name_value2 et calculation_or_name3 deviennent obligatoires.' },
            nameValue2: { name: 'name_value2', detail: 'Valeur attribuée à calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'L’un des éléments suivants :\n1. Un calcul utilisant tous les noms de la fonction LET. Le dernier argument de LET doit être un calcul.\n2. Un troisième nom auquel attribuer un troisième name_value. Si un nom est spécifié, name_value3 et calculation_or_name4 deviennent obligatoires.' },
        },
    },
    MAKEARRAY: {
        description: 'Retourne un tableau calculé d’une taille de ligne et de colonne spécifiée, en appliquant une fonction LAMBDA .',
        abstract: 'Retourne un tableau calculé d’une taille de ligne et de colonne spécifiée, en appliquant une fonction LAMBDA .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'Nombre de lignes dans le tableau. Doit être supérieur à zéro.' },
            number2: { name: 'cols', detail: 'Nombre de colonnes dans le tableau. Doit être supérieur à zéro.' },
            value3: { name: 'lambda', detail: 'Lambda appelé pour créer le tableau. Le LAMBDA prend deux paramètres : Ligne Index de ligne du tableau. col Index de colonne du tableau.' },
        },
    },
    MAP: {
        description: 'Retourne un tableau formé en mappant chaque valeur du ou des tableaux à une nouvelle valeur en appliquant une expression LAMBDA pour créer une valeur.',
        abstract: 'Retourne un tableau formé en mappant chaque valeur du ou des tableaux à une nouvelle valeur en appliquant une expression LAMBDA pour créer une valeur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Tableau array1 à mapper.' },
            array2: { name: 'array2', detail: 'Tableau array2 à mapper.' },
            lambda: { name: 'lambda', detail: 'Expression LAMBDA qui doit être le dernier argument et comporter un paramètre pour chaque tableau transmis.' },
        },
    },
    NOT: {
        description: 'Inverse la logique de son argument.',
        abstract: 'Inverse la logique de son argument.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'Condition dont vous souhaitez inverser la logique et qui peut prendre la valeur TRUE ou FALSE.' },
        },
    },
    OR: {
        description: 'La fonction OU renvoie VRAI si l’un de ses arguments a pour résultat VRAI, et renvoie FAUX si l’un de ses arguments a pour résultat FAUX.',
        abstract: 'La fonction OU renvoie VRAI si l’un de ses arguments a pour résultat VRAI, et renvoie FAUX si l’un de ses arguments a pour résultat FAUX.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Première condition à tester, pouvant prendre la valeur TRUE ou FALSE.' },
            logical2: { name: 'logical2', detail: 'Conditions supplémentaires à tester, pouvant prendre la valeur TRUE ou FALSE, dans la limite de 255 conditions.' },
        },
    },
    REDUCE: {
        description: 'Réduit un tableau à une valeur cumulée en appliquant un LAMBDA à chaque valeur et en retournant la valeur totale dans l’accumulateur.',
        abstract: 'Réduit un tableau à une valeur cumulée en appliquant un LAMBDA à chaque valeur et en retournant la valeur totale dans l’accumulateur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Définit la valeur de départ de l’accumulateur.' },
            array: { name: 'array', detail: 'Tableau à réduire.' },
            lambda: { name: 'lambda', detail: 'Lambda appelé pour réduire le tableau. Le lambda prend trois paramètres : Accumulateur Valeur cumulée et retournée comme résultat final. Valeur Valeur actuelle du tableau. Corps Calcul appliqué à chaque élément du tableau.' },
        },
    },
    SCAN: {
        description: 'Analyse un tableau en appliquant un LAMBDA à chaque valeur et retourne un tableau qui a chaque valeur intermédiaire.',
        abstract: 'Analyse un tableau en appliquant un LAMBDA à chaque valeur et retourne un tableau qui a chaque valeur intermédiaire.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Définit la valeur de départ de l’accumulateur.' },
            array: { name: 'array', detail: 'Tableau à analyser.' },
            lambda: { name: 'lambda', detail: 'Lambda appelé pour réduire le tableau. Le lambda prend trois paramètres : Accumulateur Valeur cumulée et retournée comme résultat final. Valeur Valeur actuelle du tableau. Corps Calcul appliqué à chaque élément du tableau.' },
        },
    },
    SWITCH: {
        description: 'Évalue une expression par rapport à une liste de valeurs et renvoie le résultat correspondant à la première valeur qui concorde. En l’absence de concordance, une valeur par défaut facultative peut être renvoyée.',
        abstract: 'Évalue une expression par rapport à une liste de valeurs et renvoie le résultat correspondant à la première valeur qui concorde. En l’absence de concordance, une valeur par défaut facultative peut être renvoyée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'Expression est la valeur (un nombre, une date ou du texte, par exemple) comparée à value1…value126.' },
            value1: { name: 'value1', detail: 'ValueN est une valeur comparée à expression.' },
            result1: { name: 'result1', detail: 'ResultN est la valeur renvoyée lorsque l’argument valueN correspondant concorde avec expression. Un ResultN doit être fourni pour chaque argument valueN correspondant.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'Default est la valeur renvoyée lorsqu’aucune concordance n’est trouvée dans les expressions valueN. L’argument Default est identifié par l’absence d’expression resultN correspondante. Default doit être le dernier argument de la fonction.' },
            result2: { name: 'result2', detail: 'ResultN est la valeur renvoyée lorsque l’argument valueN correspondant concorde avec expression. Un ResultN doit être fourni pour chaque argument valueN correspondant.' },
        },
    },
    TRUE: {
        description: 'Renvoie la valeur logique VRAI.',
        abstract: 'Renvoie la valeur logique VRAI.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/true-function',
            },
        ],
        functionParameter: {},
    },
    XOR: {
        description: 'Renvoie VRAI si un nombre impair de ses arguments est évalué à VRAI, et FAUX si un nombre pair de ses arguments est évalué à VRAI.',
        abstract: 'Renvoie VRAI si un nombre impair de ses arguments est évalué à VRAI, et FAUX si un nombre pair de ses arguments est évalué à VRAI.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Première condition à tester, pouvant prendre la valeur TRUE ou FALSE.' },
            logical2: { name: 'logical2', detail: 'Conditions supplémentaires à tester, pouvant prendre la valeur TRUE ou FALSE, dans la limite de 255 conditions.' },
        },
    },
};

export default locale;
