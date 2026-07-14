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
        description: 'Renvoie la valeur absolue d’un nombre. La valeur absolue d’un nombre est le nombre sans son signe.',
        abstract: 'Renvoie la valeur absolue d’un nombre. La valeur absolue d’un nombre est le nombre sans son signe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre réel dont vous voulez obtenir la valeur absolue.' },
        },
    },
    ACOS: {
        description: 'Renvoie l’arccosinus d’un nombre. L’arccosinus, ou inverse du cosinus, est l’angle dont le cosinus est l’argument nombre . L’angle renvoyé, exprimé en radians, est compris entre 0 (zéro) et pi.',
        abstract: 'Renvoie l’arccosinus d’un nombre. L’arccosinus, ou inverse du cosinus, est l’angle dont le cosinus est l’argument nombre . L’angle renvoyé, exprimé en radians, est compris entre 0 (zéro) et pi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Cosinus de l’angle souhaité et doit être de -1 à 1.' },
        },
    },
    ACOSH: {
        description: 'Renvoie le cosinus hyperbolique inverse d’un nombre. L’argument Nombre doit être supérieur ou égal à 1. Le cosinus hyperbolique inverse est la valeur dont le cosinus hyperbolique est nombre , de sorte que ACOSH(COSH(nombre)) égale nombre .',
        abstract: 'Renvoie le cosinus hyperbolique inverse d’un nombre. L’argument Nombre doit être supérieur ou égal à 1. Le cosinus hyperbolique inverse est la valeur dont le cosinus hyperbolique est nombre , de sorte que ACOSH(COSH(nombre)) égale nombre .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente un nombre réel quelconque supérieur ou égal à 1.' },
        },
    },
    ACOT: {
        description: 'Renvoie la valeur principale de l’arccotangente, ou cotangente inverse, d’un nombre.',
        abstract: 'Renvoie la valeur principale de l’arccotangente, ou cotangente inverse, d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Ce nombre représente la cotangente de l’angle souhaité. Il doit s’agit d’un nombre réel.' },
        },
    },
    ACOTH: {
        description: 'Renvoie la cotangente hyperbolique inverse d’un nombre.',
        abstract: 'Renvoie la cotangente hyperbolique inverse d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'La valeur absolue de number doit être supérieure à 1.' },
        },
    },
    AGGREGATE: {
        description: 'Renvoie un agrégat dans une liste ou une base de données. La fonction AGREGAT peut appliquer diverses fonctions d’agrégation à une liste ou à une base de données en proposant l’option d’ignorer les lignes masquées et les valeurs d’erreur.',
        abstract: 'Renvoie un agrégat dans une liste ou une base de données. La fonction AGREGAT peut appliquer diverses fonctions d’agrégation à une liste ou à une base de données en proposant l’option d’ignorer les lignes masquées et les valeurs d’erreur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Obligatoire. Un nombre compris entre 1 et 19 et incluant ces valeurs qui spécifie la fonction à utiliser.' },
            options: { name: 'options', detail: 'Obligatoire. Valeur numérique qui détermine les valeurs à ignorer dans la plage d’évaluation de la fonction. Remarque La fonction n’ignore pas les lignes masquées, les sous-totaux imbriqués ou les agrégats imbriqués si l’argument de tableau inclut un calcul, par exemple : =AGGREGATE(14,3,A1 :A100*(A1 :A100>0),1)' },
            ref1: { name: 'ref1', detail: 'Obligatoire. Premier argument numérique des fonctions qui acceptent plusieurs arguments numériques pour lesquels vous souhaitez obtenir la valeur d’agrégation.' },
            ref2: { name: 'ref2', detail: 'Optionnel. Arguments numériques compris entre 2 et 253 pour lesquels vous souhaitez obtenir la valeur d’agrégation. Pour les fonctions qui acceptent une matrice, réf1 est une matrice, une formule matricielle ou une référence à une plage de cellules pour lesquelles vous souhaitez obtenir la valeur d’agrégation. Réf2 est un deuxième argument obligatoire pour certaines fonctions. Les fonctions suivantes exigent un argument réf2 :' },
        },
    },
    ARABIC: {
        description: 'Convertit un chiffre romain en chiffre arabe.',
        abstract: 'Convertit un chiffre romain en chiffre arabe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire. Chaîne placée entre guillemets, chaîne vide ("") ou référence à une cellule contenant du texte.' },
        },
    },
    ASIN: {
        description: 'Renvoie l’arcsinus, ou sinus inverse, d’un nombre. L’arcsinus est l’angle dont le sinus est ce nombre. L’angle renvoyé est exprimé en radians entre -pi/2 et pi/2.',
        abstract: 'Renvoie l’arcsinus, ou sinus inverse, d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Sinus de l’angle souhaité; il doit être compris entre -1 et 1.' },
        },
    },
    ASINH: {
        description: 'Renvoie le sinus hyperbolique inverse d’un nombre. Le sinus hyperbolique inverse est la valeur dont le sinus hyperbolique est ce nombre ; ainsi ASINH(SINH(nombre)) est égal à nombre.',
        abstract: 'Renvoie le sinus hyperbolique inverse d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Tout nombre réel.' },
        },
    },
    ATAN: {
        description: 'Renvoie l’arctangente ou la tangente inverse d’un nombre. L’arctangente est l’angle dont la tangente est l’argument nombre . L’angle renvoyé, exprimé en radians, est compris entre -pi/2 et pi/2.',
        abstract: 'Renvoie l’arctangente ou la tangente inverse d’un nombre. L’arctangente est l’angle dont la tangente est l’argument nombre . L’angle renvoyé, exprimé en radians, est compris entre -pi/2 et pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la tangente de l’angle.' },
        },
    },
    ATAN2: {
        description: 'Renvoie l’arctangente ou la tangente inverse des coordonnées x et y spécifiées. L’arctangente est l’angle formé par l’axe des abscisses (x) et une droite passant par l’origine (0, 0) et un point dont les coordonnées sont (no_x, no_y). Cet angle, exprimé en radians, est compris entre -pi et pi, -pi non compris.',
        abstract: 'Renvoie l’arctangente ou la tangente inverse des coordonnées x et y spécifiées. L’arctangente est l’angle formé par l’axe des abscisses (x) et une droite passant par l’origine (0, 0) et un point dont les coordonnées sont (no_x, no_y). Cet angle, exprimé en radians, est compris entre -pi et pi, -pi non compris.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'Obligatoire. Représente l’abscisse du point (coordonnée sur l’axe des x).' },
            yNum: { name: 'y_num', detail: 'Obligatoire. Représente l’ordonnée du point (coordonnée sur l’axe des y).' },
        },
    },
    ATANH: {
        description: 'Renvoie la tangente hyperbolique inverse d’un nombre. L’argument nombre doit être strictement compris entre -1 et 1 (-1 et 1 non compris). La tangente hyperbolique inverse est la valeur dont la tangente hyperbolique est l’argument nombre , de sorte que ATANH(TANH(nombre)) égale nombre .',
        abstract: 'Renvoie la tangente hyperbolique inverse d’un nombre. L’argument nombre doit être strictement compris entre -1 et 1 (-1 et 1 non compris). La tangente hyperbolique inverse est la valeur dont la tangente hyperbolique est l’argument nombre , de sorte que ATANH(TANH(nombre)) égale nombre .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente un nombre réel quelconque compris entre -1 et 1.' },
        },
    },
    BASE: {
        description: 'Convertit un nombre en une représentation textuelle avec la base donnée.',
        abstract: 'Convertit un nombre en une représentation textuelle avec la base donnée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Nombre à convertir. Doit être un entier supérieur ou égal à 0 et inférieur à 2^53.' },
            radix: { name: 'radix', detail: 'Obligatoire. Base dans laquelle convertir le nombre. Doit être un entier supérieur ou égal à 2 et inférieur ou égal à 36.' },
            minLength: { name: 'min_length', detail: 'Optionnel. Longueur minimale de la chaîne renvoyée. Doit être un entier supérieur ou égal à 0.' },
        },
    },
    CEILING: {
        description: 'Renvoie l’argument nombre après l’avoir arrondi au multiple de l’argument précision en s’éloignant de zéro. Par exemple, si vous voulez que la valeur décimale de vos prix soit toujours un multiple de 5 centimes, et que le prix de votre produit est 4,42 F, utilisez la formule =PLAFOND(4,42;0,05) pour arrondir les centimes au multiple de 5 supérieur.',
        abstract: 'Renvoie l’argument nombre après l’avoir arrondi au multiple de l’argument précision en s’éloignant de zéro. Par exemple, si vous voulez que la valeur décimale de vos prix soit toujours un multiple de 5 centimes, et que le prix de votre produit est 4,42 F, utilisez la formule =PLAFOND(4,42;0,05) pour arrondir les centimes au multiple de 5 supérieur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à arrondir.' },
            significance: { name: 'significance', detail: 'Obligatoire. Représente le multiple auquel vous souhaitez arrondir.' },
        },
    },
    CEILING_MATH: {
        description: 'Le PLAFOND. La fonction MATH arrondit un nombre jusqu’à l’entier le plus proche ou, éventuellement, au multiple de précision le plus proche.',
        abstract: 'Le PLAFOND. La fonction MATH arrondit un nombre jusqu’à l’entier le plus proche ou, éventuellement, au multiple de précision le plus proche.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. (doit être compris entre -2.229E-308.et 9.99E+307.)' },
            significance: { name: 'significance', detail: 'Optionnel. Il s’agit du nombre de chiffres significatifs après la virgule décimale à laquelle le nombre doit être arrondi.' },
            mode: { name: 'mode', detail: 'Optionnel. Cela contrôle si les nombres négatifs sont arrondis vers ou loin de zéro.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Renvoie un nombre arrondi au nombre entier le plus proche ou au multiple le plus proche de l’argument précision en s’éloignant de zéro. Quel que soit son signe, ce nombre est arrondi à l’entier supérieur. Toutefois, si le nombre ou l’argument précision est égal à zéro, zéro est retourné.',
        abstract: 'Renvoie un nombre arrondi au nombre entier le plus proche ou au multiple le plus proche de l’argument précision en s’éloignant de zéro. Quel que soit son signe, ce nombre est arrondi à l’entier supérieur. Toutefois, si le nombre ou l’argument précision est égal à zéro, zéro est retourné.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à arrondir.' },
            significance: { name: 'significance', detail: 'Optionnel. Multiple auquel le nombre doit être arrondi. Si l’argument précision est omis, sa valeur par défaut est 1.' },
        },
    },
    COMBIN: {
        description: 'Renvoie le nombre de combinaisons pour un nombre donné d’éléments. Utilisez COMBIN pour déterminer le nombre total de groupes qu’il est possible de former à partir d’un nombre donné d’éléments.',
        abstract: 'Renvoie le nombre de combinaisons pour un nombre donné d’éléments. Utilisez COMBIN pour déterminer le nombre total de groupes qu’il est possible de former à partir d’un nombre donné d’éléments.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre d’éléments.' },
            numberChosen: { name: 'number_chosen', detail: 'Obligatoire. Représente le nombre d’éléments dans chaque combinaison.' },
        },
    },
    COMBINA: {
        description: 'Renvoie le nombre de combinaisons (avec répétitions) pour un nombre d’éléments donné.',
        abstract: 'Renvoie le nombre de combinaisons (avec répétitions) pour un nombre d’éléments donné.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Doit être supérieur ou égal à 0 et supérieur ou égal à Number_chosen. Les valeurs non entières sont tronquées.' },
            numberChosen: { name: 'number_chosen', detail: 'Obligatoire. Doit être supérieur ou égal à 0. Les valeurs non entières sont tronquées.' },
        },
    },
    COS: {
        description: 'Renvoie le cosinus de l’angle spécifié.',
        abstract: 'Renvoie le cosinus de l’angle spécifié.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente l’angle, exprimé en radians, dont vous voulez obtenir le cosinus.' },
        },
    },
    COSH: {
        description: 'Renvoie le cosinus hyperbolique d’un nombre.',
        abstract: 'Renvoie le cosinus hyperbolique d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente n’importe quel nombre réel dont vous voulez le cosinus hyperbolique.' },
        },
    },
    COT: {
        description: 'Renvoie la cotangente d’un angle spécifié en radians.',
        abstract: 'Renvoie la cotangente d’un angle spécifié en radians.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Angle exprimé en radians dont vous voulez calculer la cotangente.' },
        },
    },
    COTH: {
        description: 'Retourne la cotangente hyperbolique d’un angle hyperbolique.',
        abstract: 'Retourne la cotangente hyperbolique d’un angle hyperbolique.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire.' },
        },
    },
    CSC: {
        description: 'Renvoie la cosécante d’un angle spécifié en radians.',
        abstract: 'Renvoie la cosécante d’un angle spécifié en radians.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire.' },
        },
    },
    CSCH: {
        description: 'Renvoie la cosécante hyperbolique d’un angle spécifié en radians.',
        abstract: 'Renvoie la cosécante hyperbolique d’un angle spécifié en radians.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire.' },
        },
    },
    DECIMAL: {
        description: 'Convertit une représentation textuelle d’un nombre dans une base donnée en nombre décimal.',
        abstract: 'Convertit une représentation textuelle d’un nombre dans une base donnée en nombre décimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obligatoire.' },
            radix: { name: 'radix', detail: 'Obligatoire. La base doit être un entier.' },
        },
    },
    DEGREES: {
        description: 'Cette fonction convertit les radians en degrés.',
        abstract: 'Cette fonction convertit les radians en degrés.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Obligatoire. Représente l’angle en radians que vous souhaitez convertir.' },
        },
    },
    EVEN: {
        description: 'Retourne un nombre arrondi à l’entier pair le plus proche. Vous pouvez utiliser cette fonction pour traiter les éléments qui sont fournis en deux. Par exemple, une caisse d’emballage accepte des lignes d’un ou deux éléments. La caisse est pleine lorsque le nombre d’éléments, arrondi aux deux plus proches, correspond à la capacité de la caisse.',
        abstract: 'Retourne un nombre arrondi à l’entier pair le plus proche. Vous pouvez utiliser cette fonction pour traiter les éléments qui sont fournis en deux. Par exemple, une caisse d’emballage accepte des lignes d’un ou deux éléments. La caisse est pleine lorsque le nombre d’éléments, arrondi aux deux plus proches, correspond à la capacité de la caisse.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à arrondir.' },
        },
    },
    EXP: {
        description: 'Renvoie la constante e élevée à la puissance de l’argument nombre. La constante e est égale à 2,71828182845904, soit la base du logarithme népérien.',
        abstract: 'Renvoie la constante e élevée à la puissance de l’argument nombre. La constante e est égale à 2,71828182845904, soit la base du logarithme népérien.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente l’exposant de la base e.' },
        },
    },
    FACT: {
        description: 'Donne la factorielle d’un nombre. La factorielle de l’argument nombre est égale à 1*2*3*...* nombre.',
        abstract: 'Donne la factorielle d’un nombre. La factorielle de l’argument nombre est égale à 1*2*3*...* nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre non négatif dont vous voulez obtenir la factorielle. Si ce nombre n’est pas un nombre entier, il sera tronqué à sa partie entière.' },
        },
    },
    FACTDOUBLE: {
        description: 'Renvoie la factorielle double d’un nombre.',
        abstract: 'Renvoie la factorielle double d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur dont vous voulez obtenir la factorielle double. Si nombre n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    FLOOR: {
        description: 'La fonction FLOOR dans Excel arrondit un nombre spécifié au multiple de précision spécifié le plus proche. Les nombres négatifs sont arrondis vers le bas (négatif supplémentaire) au multiple entier le plus proche en dessous de zéro.',
        abstract: 'La fonction FLOOR dans Excel arrondit un nombre spécifié au multiple de précision spécifié le plus proche. Les nombres négatifs sont arrondis vers le bas (négatif supplémentaire) au multiple entier le plus proche en dessous de zéro.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur numérique à arrondir.' },
            significance: { name: 'significance', detail: 'Obligatoire. Représente le multiple auquel vous souhaitez arrondir.' },
        },
    },
    FLOOR_MATH: {
        description: 'Arrondir un nombre au nombre entier inférieur le plus proche ou au multiple le plus proche de l’argument précision en tendant vers zéro.',
        abstract: 'Arrondir un nombre au nombre entier inférieur le plus proche ou au multiple le plus proche de l’argument précision en tendant vers zéro.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Nombre à arrondir vers le bas.' },
            significance: { name: 'significance', detail: 'Optionnel. Multiple auquel vous souhaitez arrondir.' },
            mode: { name: 'mode', detail: 'Optionnel. Direction (vers 0 ou en s’éloignant de 0) pour l’arrondi des nombres négatifs.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Renvoie un nombre arrondi au nombre entier inférieur le plus proche ou au multiple le plus proche de l’argument précision en s’éloignant de zéro. Quel que soit son signe, ce nombre est arrondi à l’entier inférieur. Toutefois, si le nombre ou l’argument précision est égal à zéro, zéro est retourné.',
        abstract: 'Renvoie un nombre arrondi au nombre entier inférieur le plus proche ou au multiple le plus proche de l’argument précision en s’éloignant de zéro. Quel que soit son signe, ce nombre est arrondi à l’entier inférieur. Toutefois, si le nombre ou l’argument précision est égal à zéro, zéro est retourné.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à arrondir.' },
            significance: { name: 'significance', detail: 'Optionnel. Multiple auquel le nombre doit être arrondi. Si l’argument précision est omis, sa valeur par défaut est 1.' },
        },
    },
    GCD: {
        description: 'Renvoie le plus grand commun diviseur de plusieurs nombres entiers. Le plus grand commun diviseur est le nombre entier le plus grand qui puisse diviser nombre1 et nombre2 sans qu’il y ait de reste.',
        abstract: 'Renvoie le plus grand commun diviseur de plusieurs nombres entiers. Le plus grand commun diviseur est le nombre entier le plus grand qui puisse diviser nombre1 et nombre2 sans qu’il y ait de reste.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent 1 à 255 valeurs. Si une valeur n’est pas un nombre entier, elle sera tronquée à sa partie entière.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent 1 à 255 valeurs. Si une valeur n’est pas un nombre entier, elle sera tronquée à sa partie entière.' },
        },
    },
    INT: {
        description: 'Arrondit un nombre à l’entier immédiatement inférieur.',
        abstract: 'Arrondit un nombre à l’entier immédiatement inférieur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre réel que vous souhaitez arrondir au nombre entier immédiatement inférieur.' },
        },
    },
    ISO_CEILING: {
        description: 'Renvoie un nombre arrondi à l’entier supérieur le plus proche ou au multiple de précision supérieur le plus proche.',
        abstract: 'Renvoie un nombre arrondi à l’entier supérieur le plus proche ou au multiple de précision supérieur le plus proche.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à arrondir.' },
            significance: { name: 'significance', detail: 'Optionnel. Multiple auquel le nombre doit être arrondi. Si l’argument précision est omis, sa valeur par défaut est 1.' },
        },
    },
    LCM: {
        description: 'Retourne le multiple le moins commun d’entiers. Le multiple le moins commun est le plus petit entier positif qui est un multiple de tous les arguments entiers nombre1, nombre2, etc. Utilisez LCM pour ajouter des fractions avec différents dénominateurs.',
        abstract: 'Retourne le multiple le moins commun d’entiers. Le multiple le moins commun est le plus petit entier positif qui est un multiple de tous les arguments entiers nombre1, nombre2, etc. Utilisez LCM pour ajouter des fractions avec différents dénominateurs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 valeurs dont vous recherchez le plus petit commun multiple. Si une valeur n’est pas un nombre entier, elle est tronquée à sa partie entière.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 valeurs dont vous recherchez le plus petit commun multiple. Si une valeur n’est pas un nombre entier, elle est tronquée à sa partie entière.' },
        },
    },
    LN: {
        description: 'Donne le logarithme népérien d’un nombre. Les logarithmes népériens sont ceux dont la base est la constante e (2,71828182845904).',
        abstract: 'Donne le logarithme népérien d’un nombre. Les logarithmes népériens sont ceux dont la base est la constante e (2,71828182845904).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre réel positif dont vous souhaitez obtenir le logarithme népérien.' },
        },
    },
    LOG: {
        description: 'Renvoie le logarithme d’un nombre de la base spécifiée.',
        abstract: 'Renvoie le logarithme d’un nombre de la base spécifiée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre réel positif dont vous souhaitez obtenir le logarithme.' },
            base: { name: 'base', detail: 'Optionnel. Représente la base du logarithme. Si base est omis, la valeur par défaut est 10.' },
        },
    },
    LOG10: {
        description: 'Calcule le logarithme en base 10 d’un nombre.',
        abstract: 'Calcule le logarithme en base 10 d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre réel positif dont vous souhaitez obtenir le logarithme en base 10.' },
        },
    },
    MDETERM: {
        description: 'Renvoie le déterminant matriciel d’une matrice.',
        abstract: 'Renvoie le déterminant matriciel d’une matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente une matrice numérique comportant un nombre égal de lignes et de colonnes.' },
        },
    },
    MINVERSE: {
        description: 'Renvoie l’inverse matricielle d’une matrice.',
        abstract: 'Renvoie l’inverse matricielle d’une matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau numérique comportant le même nombre de lignes et de colonnes.' },
        },
    },
    MMULT: {
        description: 'Renvoie le produit matriciel de deux matrices.',
        abstract: 'Renvoie le produit matriciel de deux matrices.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Les tableaux à multiplier.' },
            array2: { name: 'array2', detail: 'Les tableaux à multiplier.' },
        },
    },
    MOD: {
        description: 'Renvoie le reste de la division de l’argument nombre par l’argument diviseur. Le résultat est du même signe que diviseur.',
        abstract: 'Renvoie le reste de la division de l’argument nombre par l’argument diviseur. Le résultat est du même signe que diviseur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre à diviser pour obtenir le reste.' },
            divisor: { name: 'divisor', detail: 'Obligatoire. Représente le nombre par lequel vous souhaitez diviser le nombre.' },
        },
    },
    MROUND: {
        description: 'MROUND retourne un nombre arrondi au multiple souhaité.',
        abstract: 'MROUND retourne un nombre arrondi au multiple souhaité.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à arrondir.' },
            multiple: { name: 'multiple', detail: 'Obligatoire. Représente le multiple auquel vous souhaitez arrondir le nombre.' },
        },
    },
    MULTINOMIAL: {
        description: 'Renvoie le rapport de la factorielle d’une somme de valeurs sur le produit des factorielles.',
        abstract: 'Renvoie le rapport de la factorielle d’une somme de valeurs sur le produit des factorielles.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 valeurs dont vous souhaitez obtenir la multinomiale.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 valeurs dont vous souhaitez obtenir la multinomiale.' },
        },
    },
    MUNIT: {
        description: 'La fonction MUNIT retourne la matrice d’unités pour la dimension spécifiée.',
        abstract: 'La fonction MUNIT retourne la matrice d’unités pour la dimension spécifiée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'Entier indiquant la dimension de la matrice unité à renvoyer. La fonction renvoie un tableau. Dimension doit être supérieure à zéro.' },
        },
    },
    ODD: {
        description: 'Renvoie le nombre, arrondi à la valeur du nombre entier impair le plus proche en s’éloignant de zéro.',
        abstract: 'Renvoie le nombre, arrondi à la valeur du nombre entier impair le plus proche en s’éloignant de zéro.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à arrondir.' },
        },
    },
    PI: {
        description: 'Renvoie la valeur 3,14159265358979, la constante mathématique pi, avec une précision de 15 décimales.',
        abstract: 'Renvoie la valeur 3,14159265358979, la constante mathématique pi, avec une précision de 15 décimales.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Renvoie la valeur du nombre élevé à une puissance.',
        abstract: 'Renvoie la valeur du nombre élevé à une puissance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Numéro de base. Il peut s’agir de n’importe quel nombre réel.' },
            power: { name: 'power', detail: 'Obligatoire. Représente l’exposant auquel le nombre de base est élevé.' },
        },
    },
    PRODUCT: {
        description: 'La fonction PRODUIT multiplie tous les nombres donnés comme arguments et renvoie le produit. Par exemple, si les cellules A1 et A2 contiennent des nombres, vous pouvez utiliser la formule =PRODUCT(A1, A2) pour multiplier ces deux nombres ensemble. Vous pouvez également effectuer la même opération à l’aide de l’opérateur mathématique de multiplication ( * ), par exemple, =A1*A2 .',
        abstract: 'La fonction PRODUIT multiplie tous les nombres donnés comme arguments et renvoie le produit. Par exemple, si les cellules A1 et A2 contiennent des nombres, vous pouvez utiliser la formule =PRODUCT(A1, A2) pour multiplier ces deux nombres ensemble. Vous pouvez également effectuer la même opération à l’aide de l’opérateur mathématique de multiplication ( * ), par exemple, =A1*A2 .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier nombre ou plage que vous souhaitez multiplier.' },
            number2: { name: 'number2', detail: 'Optionnel. Nombres ou plages supplémentaires que vous voulez multiplier, jusqu’à un maximum de 255 arguments.' },
        },
    },
    QUOTIENT: {
        description: 'Renvoie la partie entière du résultat d’une division. Utilisez cette fonction lorsque vous voulez ignorer le reste d’une division.',
        abstract: 'Renvoie la partie entière du résultat d’une division. Utilisez cette fonction lorsque vous voulez ignorer le reste d’une division.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'Obligatoire. Représente le dividende.' },
            denominator: { name: 'denominator', detail: 'Obligatoire. Représente le diviseur.' },
        },
    },
    RADIANS: {
        description: 'Convertit des degrés en radians.',
        abstract: 'Convertit des degrés en radians.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Obligatoire. Désigne l’angle en degrés que vous souhaitez convertir.' },
        },
    },
    RAND: {
        description: 'ALEA renvoie un nombre réel aléatoire distribué de manière symétrique supérieur ou égal à 0 et inférieur à 1. Un nouveau nombre réel aléatoire est renvoyé chaque fois que la feuille de calcul est recalculée.',
        abstract: 'ALEA renvoie un nombre réel aléatoire distribué de manière symétrique supérieur ou égal à 0 et inférieur à 1. Un nouveau nombre réel aléatoire est renvoyé chaque fois que la feuille de calcul est recalculée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Dans l’exemple suivant, nous avons créé un tableau de 5 lignes en hauteur x 3 colonnes de large. La première renvoie un ensemble de valeurs aléatoire compris entre 0 et 1, c\'est-à-dire le comportement par défaut de TABLEAU. ALEA. L’autre renvoie une série de valeurs décimales aléatoires compris entre 1 et 100. Enfin, le troisième exemple renvoie une série de nombres entiers aléatoires compris entre 1 et 100.',
        abstract: 'Dans l’exemple suivant, nous avons créé un tableau de 5 lignes en hauteur x 3 colonnes de large. La première renvoie un ensemble de valeurs aléatoire compris entre 0 et 1, c\'est-à-dire le comportement par défaut de TABLEAU. ALEA. L’autre renvoie une série de valeurs décimales aléatoires compris entre 1 et 100. Enfin, le troisième exemple renvoie une série de nombres entiers aléatoires compris entre 1 et 100.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Nombre de lignes à renvoyer' },
            columns: { name: 'columns', detail: 'Nombre de colonnes à renvoyer' },
            min: { name: 'min', detail: 'Le nombre minimal que vous souhaitez renvoyé' },
            max: { name: 'max', detail: 'Le nombre maximal que vous souhaitez renvoyé' },
            wholeNumber: { name: 'whole_number', detail: 'Renvoyer un nombre entier ou une valeur décimale Vrai pour un nombre entier FALSE pour un nombre décimal' },
        },
    },
    RANDBETWEEN: {
        description: 'Renvoie un nombre entier aléatoire entre les nombres que vous spécifiez. Un nouveau nombre entier aléatoire est renvoyé chaque fois que la feuille de calcul est calculée.',
        abstract: 'Renvoie un nombre entier aléatoire entre les nombres que vous spécifiez. Un nouveau nombre entier aléatoire est renvoyé chaque fois que la feuille de calcul est calculée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'Obligatoire. Représente le plus petit nombre entier que la fonction ALEA.ENTRE.BORNES peut renvoyer.' },
            top: { name: 'top', detail: 'Obligatoire. Représente le plus grand nombre entier que la fonction ALEA.ENTRE.BORNES peut renvoyer.' },
        },
    },
    ROMAN: {
        description: 'Convertit un nombre arabe en nombre romain, sous forme de texte.',
        abstract: 'Convertit un nombre arabe en nombre romain, sous forme de texte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le chiffre arabe que vous souhaitez convertir.' },
            form: { name: 'form', detail: 'Optionnel. Représente un argument déterminant le type de chiffres romains que vous souhaitez obtenir. Le style peut aller de Classique à Simplifié, c’est-à-dire devenir plus concis à mesure que les valeurs augmentent. Reportez-vous à l’exemple ROMAN(499,0) ci-dessous.' },
        },
    },
    ROUND: {
        description: 'La fonction ARRONDI arrondi un nombre à un nombre spécifié de chiffres. Par exemple, si la cellule A1 contient la valeur 23,7825 et que vous voulez l’arrondir à deux décimales, vous pouvez utiliser la formule suivante :',
        abstract: 'La fonction ARRONDI arrondi un nombre à un nombre spécifié de chiffres. Par exemple, si la cellule A1 contient la valeur 23,7825 et que vous voulez l’arrondir à deux décimales, vous pouvez utiliser la formule suivante :',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Nombre à arrondir.' },
            numDigits: { name: 'num_digits', detail: 'Obligatoire. Nombre de chiffres auquel vous voulez arrondir l’argument nombre.' },
        },
    },
    ROUNDBANK: {
        description: 'Arrondit un nombre selon la méthode de l’arrondi bancaire.',
        abstract: 'Arrondit un nombre selon la méthode de l’arrondi bancaire.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Nombre à arrondir selon la méthode de l’arrondi bancaire.' },
            numDigits: { name: 'num_digits', detail: 'Nombre de chiffres auquel effectuer l’arrondi bancaire.' },
        },
    },
    ROUNDDOWN: {
        description: 'Arrondit un nombre en tendant vers 0 (zéro).',
        abstract: 'Arrondit un nombre en tendant vers 0 (zéro).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente un nombre réel quelconque à arrondir en tendant vers zéro.' },
            numDigits: { name: 'num_digits', detail: 'Obligatoire. Représente le nombre de chiffres à prendre en compte pour arrondir l’argument nombre.' },
        },
    },
    ROUNDUP: {
        description: 'Arrondit un nombre en s’éloignant de 0 (zéro).',
        abstract: 'Arrondit un nombre en s’éloignant de 0 (zéro).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente un nombre réel quelconque à arrondir en s’éloignant de zéro.' },
            numDigits: { name: 'num_digits', detail: 'Obligatoire. Représente le nombre de chiffres à prendre en compte pour arrondir l’argument nombre.' },
        },
    },
    SEC: {
        description: 'Renvoie la sécante d’un angle.',
        abstract: 'Renvoie la sécante d’un angle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angle en radians dont vous souhaitez obtenir la sécante.' },
        },
    },
    SECH: {
        description: 'Renvoie la sécante hyperbolique d’un angle.',
        abstract: 'Renvoie la sécante hyperbolique d’un angle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angle en radians dont vous souhaitez obtenir la sécante hyperbolique.' },
        },
    },
    SERIESSUM: {
        description: 'Renvoie la somme d’une série géométrique en s’appuyant sur la formule suivante :',
        abstract: 'Renvoie la somme d’une série géométrique en s’appuyant sur la formule suivante :',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur d’entrée de la série de puissances.' },
            n: { name: 'n', detail: 'Obligatoire. Représente la puissance initiale à laquelle vous voulez élever x.' },
            m: { name: 'm', detail: 'Obligatoire. Représente le degré d’accroissement de la valeur de l’argument n pour chacun des termes de la série.' },
            coefficients: { name: 'coefficients', detail: 'Obligatoire. Représente un ensemble de coefficients multiplicateurs de chaque puissance successive de l’argument x. Le nombre de valeurs de l’argument coefficients détermine le nombre de termes de la série de puissances. Ainsi, si l’argument coefficients est composé de trois valeurs, la série comporte trois termes.' },
        },
    },
    SEQUENCE: {
        description: 'Dans l’exemple suivant, nous avons créé un tableau de 4 lignes x 5 colonnes avec la formule =SEQUENCE(4;5) .',
        abstract: 'Dans l’exemple suivant, nous avons créé un tableau de 4 lignes x 5 colonnes avec la formule =SEQUENCE(4;5) .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Nombre de lignes à renvoyer' },
            columns: { name: 'columns', detail: 'Nombre de colonnes à renvoyer' },
            start: { name: 'start', detail: 'Premier nombre de la séquence' },
            step: { name: 'step', detail: 'Montant à appliquer pour incrémenter chaque valeur suivante dans le tableau' },
        },
    },
    SIGN: {
        description: 'Détermine le signe d’un nombre. Renvoie 1 si le nombre est positif, zéro (0) si le nombre est égal à 0 et -1 si le nombre est négatif.',
        abstract: 'Détermine le signe d’un nombre. Renvoie 1 si le nombre est positif, zéro (0) si le nombre est égal à 0 et -1 si le nombre est négatif.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente n’importe quel nombre réel.' },
        },
    },
    SIN: {
        description: 'Renvoie le sinus d’un nombre.',
        abstract: 'Renvoie le sinus d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente l’angle exprimé en radians dont vous voulez obtenir le sinus.' },
        },
    },
    SINH: {
        description: 'Renvoie le sinus hyperbolique d’un nombre.',
        abstract: 'Renvoie le sinus hyperbolique d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente n’importe quel nombre réel.' },
        },
    },
    SQRT: {
        description: 'Donne la racine carrée d’un nombre.',
        abstract: 'Donne la racine carrée d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre dont vous voulez obtenir la racine carrée.' },
        },
    },
    SQRTPI: {
        description: 'Renvoie la racine carrée de (nombre * pi).',
        abstract: 'Renvoie la racine carrée de (nombre * pi).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre par lequel pi est multiplié.' },
        },
    },
    SUBTOTAL: {
        description: 'Renvoie un sous-total dans une liste ou une base de données. Il est généralement plus facile de créer une liste comportant des sous-totaux à l’aide de la commande Sous-total du groupe Contour dans l’onglet Données de l’application de bureau Excel. Une fois cette liste de sous-totaux créée, vous pouvez la modifier en changeant la fonction SOUS.TOTAL.',
        abstract: 'Renvoie un sous-total dans une liste ou une base de données. Il est généralement plus facile de créer une liste comportant des sous-totaux à l’aide de la commande Sous-total du groupe Contour dans l’onglet Données de l’application de bureau Excel. Une fois cette liste de sous-totaux créée, vous pouvez la modifier en changeant la fonction SOUS.TOTAL.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Obligatoire. Le nombre 1 à 11 ou 101 à 111 qui spécifie la fonction à utiliser pour calculer le sous-total. 1 à 11 inclut les lignes masquées manuellement, tandis que 101 à 111 les exclut ; les cellules filtrées sont toujours exclues.' },
            ref1: { name: 'ref1', detail: 'Obligatoire. Première référence ou plage nommée dont vous souhaitez calculer le sous-total.' },
            ref2: { name: 'ref2', detail: 'Optionnel. Plages ou références nommées 2 à 254 dont vous souhaitez calculer le sous-total.' },
        },
    },
    SUM: {
        description: 'La fonction SUM ajoute des valeurs. Vous pouvez ajouter des valeurs individuelles, des références ou des plages de cellules, ou une combinaison des trois.',
        abstract: 'La fonction SUM ajoute des valeurs. Vous pouvez ajouter des valeurs individuelles, des références ou des plages de cellules, ou une combinaison des trois.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Number 1', detail: 'Premier nombre à additionner. Le nombre peut être comme 4, une référence de cellule comme B6 ou une plage de cellules comme B2 :B8.' },
            number2: { name: 'Number 2', detail: 'Il s’agit du deuxième nombre à additionner. Vous pouvez spécifier jusqu’à 255 nombres de cette façon.' },
        },
    },
    SUMIF: {
        description: 'Vous utilisez la fonction SUMIF pour additionner les valeurs d’une plage qui répondent aux critères que vous spécifiez. Par exemple, supposons que dans une colonne contenant des nombres, vous vouliez uniquement calculer la somme des valeurs supérieures à 5. Vous pouvez utiliser la formule suivante : =SUMIF(B2 :B25,">5 »)',
        abstract: 'Vous utilisez la fonction SUMIF pour additionner les valeurs d’une plage qui répondent aux critères que vous spécifiez. Par exemple, supposons que dans une colonne contenant des nombres, vous vouliez uniquement calculer la somme des valeurs supérieures à 5. Vous pouvez utiliser la formule suivante : =SUMIF(B2 :B25,">5 »)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Obligatoire. Plage de cellules à calculer en fonction du critère. Les cellules de chaque plage doivent être des nombres ou des noms, des matrices ou des références contenant des nombres. Les valeurs vides ou textuelles ne sont pas prises en compte. La plage sélectionnée peut contenir des dates au format Excel standard (voir exemples ci-dessous).' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Critère, exprimé sous forme de nombre, d’expression, de référence de cellule, de texte ou de fonction qui définit les cellules à ajouter. Des caractères génériques peuvent être inclus : un point d’interrogation ( ?) pour correspondre à n’importe quel caractère, un astérisque (*) pour correspondre à n’importe quelle séquence de caractères. Si vous souhaitez trouver un point d’interrogation ou un astérisque réel, tapez un tilde ( ~ ) qui précède le caractère. Par exemple, les critères peuvent être exprimés sous la forme 32, «> 32 », « B5 », « 3 ? », « apple* », « *~ ? » ou TODAY(). Important Tous les critères textuels et tous les critères qui contiennent des symboles mathématiques ou logiques doivent être placés entre guillemets ( " ). En revanche, les guillemets ne sont pas nécessaires pour les critères numériques.' },
            sumRange: { name: 'sum_range', detail: 'Optionnel. Cellules réelles à ajouter, si vous souhaitez ajouter des cellules autres que celles spécifiées dans l’argument plage . Si l’argument sum_range est omis, Excel ajoute les cellules spécifiées dans l’argument range (les cellules auxquelles les critères sont appliqués). Sum_range doit avoir la même taille et la même forme que la plage . Si ce n’est pas le cas, les performances peuvent en pâtir et la formule additionne une plage de cellules qui commence par la première cellule de sum_range mais a les mêmes dimensions que la plage . Par exemple : plage plage_somme Cellules additionnées réelles A1:A5 B1:B5 B1:B5 A1:A5 B1:K5 B1:B5' },
        },
    },
    SUMIFS: {
        description: 'Additionne tous les arguments qui répondent à plusieurs critères.',
        abstract: 'Additionne tous les arguments qui répondent à plusieurs critères.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'Plage de cellules à additionner.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Plage testée avec criteria1. criteria_range1 et criteria1 forment une paire de recherche : la plage est recherchée selon des critères précis, puis les valeurs correspondantes de sum_range sont additionnées.' },
            criteria1: { name: 'criteria1', detail: 'Critère définissant les cellules de criteria_range1 à ajouter. Par exemple : 32, ">32", B4, "pommes" ou "32".' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Plages supplémentaires. Vous pouvez saisir jusqu’à 127 paires de plages.' },
            criteria2: { name: 'criteria2', detail: 'Critères associés supplémentaires. Vous pouvez saisir jusqu’à 127 paires de critères.' },
        },
    },
    SUMPRODUCT: {
        description: 'La fonction SUMPRODUCT retourne la somme des produits des plages ou tableaux correspondants. L’opération par défaut est la multiplication, mais l’addition, la soustraction et la division sont également possibles.',
        abstract: 'La fonction SUMPRODUCT retourne la somme des produits des plages ou tableaux correspondants. L’opération par défaut est la multiplication, mais l’addition, la soustraction et la division sont également possibles.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Représente le premier argument de matrice dont vous voulez multiplier les valeurs pour ensuite additionner leur produit.' },
            array2: { name: 'array', detail: 'Arguments de matrices 2 à 255 dont vous voulez multiplier les valeurs pour ensuite additionner leur produit.' },
        },
    },
    SUMSQ: {
        description: 'Renvoie la somme des carrés des arguments.',
        abstract: 'Renvoie la somme des carrés des arguments.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire. Les numéros suivants sont facultatifs. Il peut y avoir jusqu’à 255 arguments pour lesquels vous souhaitez la somme des carrés.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire. Les numéros suivants sont facultatifs. Il peut y avoir jusqu’à 255 arguments pour lesquels vous souhaitez la somme des carrés.' },
        },
    },
    SUMX2MY2: {
        description: 'Renvoie la somme des différences des carrés des valeurs correspondantes de deux matrices.',
        abstract: 'Renvoie la somme des différences des carrés des valeurs correspondantes de deux matrices.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Obligatoire. Représente la première matrice ou plage de valeurs.' },
            arrayY: { name: 'array_y', detail: 'Obligatoire. Représente la seconde matrice ou plage de valeurs.' },
        },
    },
    SUMX2PY2: {
        description: 'Renvoie la somme des sommes des carrés des valeurs correspondantes de deux matrices.',
        abstract: 'Renvoie la somme des sommes des carrés des valeurs correspondantes de deux matrices.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Premier tableau ou première plage de valeurs.' },
            arrayY: { name: 'array_y', detail: 'Deuxième tableau ou deuxième plage de valeurs.' },
        },
    },
    SUMXMY2: {
        description: 'La fonction SUMXMY2 retourne la somme des carrés des différences de valeurs correspondantes dans deux tableaux.',
        abstract: 'La fonction SUMXMY2 retourne la somme des carrés des différences de valeurs correspondantes dans deux tableaux.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Premier tableau ou plage de valeurs. Obligatoire.' },
            arrayY: { name: 'array_y', detail: 'Deuxième tableau ou plage de valeurs. Obligatoire.' },
        },
    },
    TAN: {
        description: 'Renvoie la tangente de l’angle donné.',
        abstract: 'Renvoie la tangente de l’angle donné.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente l’angle exprimé en radians dont vous voulez calculer la tangente.' },
        },
    },
    TANH: {
        description: 'Donne la tangente hyperbolique d’un nombre.',
        abstract: 'Donne la tangente hyperbolique d’un nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente n’importe quel nombre réel.' },
        },
    },
    TRUNC: {
        description: 'Les fonctions TRUNC tronquent un nombre en entier en supprimant la partie fractionnaire du nombre.',
        abstract: 'Les fonctions TRUNC tronquent un nombre en entier en supprimant la partie fractionnaire du nombre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre à tronquer.' },
            numDigits: { name: 'num_digits', detail: 'Optionnel. Représente le nombre de décimales apparaissant à droite de la virgule après que le chiffre a été tronqué. La valeur par défaut de no_chiffres est 0 (zéro).' },
        },
    },
};

export default locale;
