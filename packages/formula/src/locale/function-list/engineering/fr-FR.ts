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
        description: 'Renvoie la fonction de Bessel modifiée In(x) qui équivaut à la fonction de Bessel évaluée pour des arguments purement imaginaires.',
        abstract: 'Renvoie la fonction de Bessel modifiée In(x) qui équivaut à la fonction de Bessel évaluée pour des arguments purement imaginaires.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            n: { name: 'N', detail: 'Obligatoire. Représente l’indice de la fonction de Bessel. Si n n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    BESSELJ: {
        description: 'Renvoie la fonction de Bessel Jn(x).',
        abstract: 'Renvoie la fonction de Bessel Jn(x).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            n: { name: 'N', detail: 'Obligatoire. Représente l’indice de la fonction de Bessel. Si n n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    BESSELK: {
        description: 'Renvoie la fonction de Bessel modifiée Kn(x).',
        abstract: 'Renvoie la fonction de Bessel modifiée Kn(x).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            n: { name: 'N', detail: 'Obligatoire. Représente l’indice de la fonction. Si n n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    BESSELY: {
        description: 'Renvoie la fonction de Bessel Yn(x), également appelée fonction de Weber ou fonction de Neumann.',
        abstract: 'Renvoie la fonction de Bessel Yn(x), également appelée fonction de Weber ou fonction de Neumann.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            n: { name: 'N', detail: 'Obligatoire. Représente l’indice de la fonction. Si n n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    BIN2DEC: {
        description: 'Convertit un nombre binaire en nombre décimal.',
        abstract: 'Convertit un nombre binaire en nombre décimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre binaire à convertir. L’argument nombre ne peut pas comporter plus de 10 caractères (10 bits). Le bit de poids fort de l’argument nombre est le bit de signe. Les 9 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
        },
    },
    BIN2HEX: {
        description: 'Convertit un nombre binaire en nombre hexadécimal.',
        abstract: 'Convertit un nombre binaire en nombre hexadécimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre binaire à convertir. L’argument nombre ne peut pas comporter plus de 10 caractères (10 bits). Le bit de poids fort de l’argument nombre est le bit de signe. Les 9 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
            places: { name: 'places', detail: 'Optionnel. Représente le nombre de caractères à utiliser. Si l’argument nb_car est omis, BINHEX utilise le nombre de caractères minimal nécessaire. L’argument nb_car sert notamment à compléter la valeur renvoyée avec des zéros (0) non significatifs.' },
        },
    },
    BIN2OCT: {
        description: 'Convertit un nombre binaire en nombre octal.',
        abstract: 'Convertit un nombre binaire en nombre octal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre binaire à convertir. L’argument nombre ne peut pas comporter plus de 10 caractères (10 bits). Le bit de poids fort de l’argument nombre est le bit de signe. Les 9 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
            places: { name: 'places', detail: 'Optionnel. Représente le nombre de caractères à utiliser. Si l’argument nb_car est omis, BINOCT utilise le nombre de caractères minimal nécessaire. L’argument nb_car sert notamment à compléter la valeur renvoyée avec des zéros (0) non significatifs.' },
        },
    },
    BITAND: {
        description: 'Renvoie une opération binaire « ET » de deux nombres.',
        abstract: 'Renvoie une opération binaire « ET » de deux nombres.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Doit être au format décimal et supérieur ou égal à 0.' },
            number2: { name: 'number2', detail: 'Obligatoire. Doit être au format décimal et supérieur ou égal à 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Renvoie un nombre décalé vers la gauche du nombre de bits spécifié.',
        abstract: 'Renvoie un nombre décalé vers la gauche du nombre de bits spécifié.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Doit être un entier supérieur ou égal à 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Obligatoire. Doit être un entier.' },
        },
    },
    BITOR: {
        description: 'Renvoie une opération binaire « OU » de deux nombres.',
        abstract: 'Renvoie une opération binaire « OU » de deux nombres.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Doit être au format décimal et supérieur ou égal à 0.' },
            number2: { name: 'number2', detail: 'Obligatoire. Doit être au format décimal et supérieur ou égal à 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Renvoie un nombre décalé vers la droite du nombre de bits spécifié.',
        abstract: 'Renvoie un nombre décalé vers la droite du nombre de bits spécifié.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Doit être un entier supérieur ou égal à 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Obligatoire. Doit être un entier.' },
        },
    },
    BITXOR: {
        description: 'Renvoie une opération binaire « XOU » de deux nombres.',
        abstract: 'Renvoie une opération binaire « XOU » de deux nombres.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Doit être supérieur ou égal à 0.' },
            number2: { name: 'number2', detail: 'Obligatoire. Doit être supérieur ou égal à 0.' },
        },
    },
    COMPLEX: {
        description: 'Cette fonction convertit des coefficients réels et imaginaires en un nombre complexe de la forme x + yi ou x + yj.',
        abstract: 'Cette fonction convertit des coefficients réels et imaginaires en un nombre complexe de la forme x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'Obligatoire. Représente le coefficient réel du nombre complexe.' },
            iNum: { name: 'i_num', detail: 'Obligatoire. Représente le coefficient imaginaire du nombre complexe.' },
            suffix: { name: 'suffix', detail: 'Optionnel. Représente le suffixe de la partie imaginaire du nombre complexe. Si l’argument suffixe est omis, sa valeur par défaut est « i ».' },
        },
    },
    CONVERT: {
        description: 'Convertit un nombre d’une unité à une autre unité. Par exemple, la fonction CONVERT peut traduire un tableau de distances en milles en un tableau de distances exprimées en kilomètres.',
        abstract: 'Convertit un nombre d’une unité à une autre unité. Par exemple, la fonction CONVERT peut traduire un tableau de distances en milles en un tableau de distances exprimées en kilomètres.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'La valeur en from_unit à convertir.' },
            fromUnit: { name: 'from_unit', detail: 'L’unité de number.' },
            toUnit: { name: 'to_unit', detail: 'L’unité du résultat.' },
        },
    },
    DEC2BIN: {
        description: 'Convertit un nombre décimal en nombre binaire.',
        abstract: 'Convertit un nombre décimal en nombre binaire.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre entier décimal à convertir. Si nombre est négatif, les valeurs nb_car valides ne sont pas prises en compte, et DECBIN renvoie un nombre binaire de 10 caractères (10 bits), dans lequel le bit de poids fort est le bit de signe. Les 9 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
            places: { name: 'places', detail: 'Optionnel. Représente le nombre de caractères à utiliser. Si nb_car est omis, DECBIN utilise le nombre de caractères minimal nécessaire. L’argument nb_car sert notamment à compléter la valeur renvoyée avec des zéros (0) non significatifs.' },
        },
    },
    DEC2HEX: {
        description: 'Convertit un nombre décimal en nombre hexadécimal.',
        abstract: 'Convertit un nombre décimal en nombre hexadécimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre entier décimal à convertir. Si nombre est négatif, nb_car n’est pas pris en compte, et DECHEX renvoie un nombre hexadécimal de 10 caractères (40 bits), dans lequel le bit de poids fort est le bit de signe. Les 39 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
            places: { name: 'places', detail: 'Facultatif. Représente le nombre de caractères à utiliser. Si nb_car est omis, DECHEX utilise le nombre de caractères minimal nécessaire. L’argument nb_car sert notamment à compléter la valeur renvoyée avec des zéros (0) non significatifs.' },
        },
    },
    DEC2OCT: {
        description: 'Convertit un nombre décimal en nombre octal.',
        abstract: 'Convertit un nombre décimal en nombre octal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre entier décimal à convertir. Si nombre est négatif, l’argument nb_car n’est pas pris en compte, et DECOCT renvoie un nombre octal de 10 caractères (30 bits), dans lequel le bit de poids fort est le bit de signe. Les 29 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
            places: { name: 'places', detail: 'Optionnel. Représente le nombre de caractères à utiliser. Si nb_car est omis, DECOCT utilise le nombre de caractères minimal nécessaire. L’argument nb_car sert notamment à compléter la valeur renvoyée avec des zéros (0) non significatifs.' },
        },
    },
    DELTA: {
        description: 'Teste l’égalité de deux nombres. Renvoie 1 si l’argument nombre1 est égal à l’argument nombre2 ; sinon, renvoie 0. Utilisez cette fonction pour filtrer un ensemble de valeurs. Ainsi, en additionnant les résultats de plusieurs fonctions DELTA, vous calculez le nombre de paires égales. Cette fonction est également connue sous le nom de fonction Delta de Kronecker.',
        abstract: 'Teste l’égalité de deux nombres. Renvoie 1 si l’argument nombre1 est égal à l’argument nombre2 ; sinon, renvoie 0. Utilisez cette fonction pour filtrer un ensemble de valeurs. Ainsi, en additionnant les résultats de plusieurs fonctions DELTA, vous calculez le nombre de paires égales. Cette fonction est également connue sous le nom de fonction Delta de Kronecker.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Représente le premier nombre.' },
            number2: { name: 'number2', detail: 'Optionnel. Représente le second nombre. S’il est omis, nombre2 est supposé être égal à zéro.' },
        },
    },
    ERF: {
        description: 'Renvoie la valeur de la fonction d’erreur entre limite_inf et limite_sup.',
        abstract: 'Renvoie la valeur de la fonction d’erreur entre limite_inf et limite_sup.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'Obligatoire. Représente la limite inférieure pour l’intégration de la fonction ERF.' },
            upperLimit: { name: 'upper_limit', detail: 'Optionnel. Représente la limite supérieure pour l’intégration de la fonction ERF. Si cette limite est omise, ERF s’intègre entre zéro et limite_inf.' },
        },
    },
    ERF_PRECISE: {
        description: 'Renvoie la fonction d’erreur.',
        abstract: 'Renvoie la fonction d’erreur.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la limite inférieure pour l’intégration de la fonction ERF.PRECIS.' },
        },
    },
    ERFC: {
        description: 'Renvoie la fonction ERF complémentaire intégrée entre x et l’infini.',
        abstract: 'Renvoie la fonction ERF complémentaire intégrée entre x et l’infini.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la limite inférieure pour l’intégration de la fonction ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Renvoie la fonction ERF complémentaire intégrée entre x et l’infini.',
        abstract: 'Renvoie la fonction ERF complémentaire intégrée entre x et l’infini.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la limite inférieure pour l’intégration de la fonction ERFC.PRECIS.' },
        },
    },
    GESTEP: {
        description: 'Renvoie 1 si l’argument nombre est supérieur ou égal à l’argument seuil ou 0 (zéro) dans le cas contraire. Utilisez cette fonction pour filtrer un ensemble de valeurs. Ainsi, en additionnant les résultats de plusieurs fonctions SUP.SEUIL, vous déterminez le nombre de valeurs supérieures à un seuil.',
        abstract: 'Renvoie 1 si l’argument nombre est supérieur ou égal à l’argument seuil ou 0 (zéro) dans le cas contraire. Utilisez cette fonction pour filtrer un ensemble de valeurs. Ainsi, en additionnant les résultats de plusieurs fonctions SUP.SEUIL, vous déterminez le nombre de valeurs supérieures à un seuil.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente la valeur à comparer à l’argument seuil.' },
            step: { name: 'step', detail: 'Optionnel. Représente la valeur seuil. Si vous n’indiquez pas de valeur pour seuil, SUP.SEUIL utilise zéro.' },
        },
    },
    HEX2BIN: {
        description: 'Convertit un nombre hexadécimal en nombre binaire.',
        abstract: 'Convertit un nombre hexadécimal en nombre binaire.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre hexadécimal à convertir. L’argument nombre ne peut pas comporter plus de 10 caractères. Le bit de poids fort de nombre est le bit de signe. Les 9 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
            places: { name: 'places', detail: 'Facultatif. Représente le nombre de caractères à utiliser. Si nb_car est omis, HEXBIN utilise le nombre de caractères minimal nécessaire. L’argument nb_car sert notamment à compléter la valeur renvoyée avec des zéros (0) non significatifs.' },
        },
    },
    HEX2DEC: {
        description: 'Convertit un nombre hexadécimal en nombre décimal.',
        abstract: 'Convertit un nombre hexadécimal en nombre décimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre hexadécimal à convertir. L’argument nombre ne peut pas comporter plus de 10 caractères (40 bits). Le bit poids fort de l’argument nombre est le bit de signe. Les 39 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
        },
    },
    HEX2OCT: {
        description: 'Convertit un nombre hexadécimal en nombre octal.',
        abstract: 'Convertit un nombre hexadécimal en nombre octal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre hexadécimal à convertir. L’argument nombre ne peut pas comporter plus de 10 caractères. Le bit de poids fort de l’argument nombre est le bit de signe. Les 39 autres bits sont des bits de grandeur. Les nombres négatifs sont représentés à l’aide de la notation de complément à 2.' },
            places: { name: 'places', detail: 'Facultatif. Indique le nombre de caractères à utiliser. Si nb_car est omis, HEXOCT utilise le nombre de caractères minimal nécessaire. L’argument nb_car sert notamment à compléter la valeur renvoyée avec des zéros (0) non significatifs.' },
        },
    },
    IMABS: {
        description: 'Cette fonction renvoie la valeur absolue (le module) d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie la valeur absolue (le module) d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez la valeur absolue.' },
        },
    },
    IMAGINARY: {
        description: 'Cette fonction renvoie le coefficient imaginaire d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le coefficient imaginaire d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le coefficient imaginaire.' },
        },
    },
    IMARGUMENT: {
        description: 'Retourne l’argument (theta), un angle exprimé en radians, de sorte que :',
        abstract: 'Retourne l’argument (theta), un angle exprimé en radians, de sorte que :',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Nombre complexe pour lequel vous souhaitez l’argument .' },
        },
    },
    IMCONJUGATE: {
        description: 'Cette fonction renvoie le nombre complexe conjugué d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le nombre complexe conjugué d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le conjugué.' },
        },
    },
    IMCOS: {
        description: 'Cette fonction renvoie le cosinus d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le cosinus d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le cosinus.' },
        },
    },
    IMCOSH: {
        description: 'Renvoie le cosinus hyperbolique d’un nombre complexe au format texte x+yi ou x+yj.',
        abstract: 'Renvoie le cosinus hyperbolique d’un nombre complexe au format texte x+yi ou x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Un nombre complexe pour lequel vous souhaitez obtenir le cosinus hyperbolique.' },
        },
    },
    IMCOT: {
        description: 'Retourne la cotangente d’un nombre complexe au format texte x+yi ou x+yj.',
        abstract: 'Retourne la cotangente d’un nombre complexe au format texte x+yi ou x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Le nombre complexe dont vous souhaitez obtenir la cotangente.' },
        },
    },
    IMCOTH: {
        description: 'La fonction IMCOTH affiche la cotangente hyperbolique du nombre complexe donné. Par exemple, le nombre complexe "x+yi" affiche "coth(x+yi)".',
        abstract: 'La fonction IMCOTH affiche la cotangente hyperbolique du nombre complexe donné. Par exemple, le nombre complexe "x+yi" affiche "coth(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=fr',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Nombre complexe dont vous souhaitez afficher la cotangente hyperbolique. Cela peut être le résultat de la fonction COMPLEXE, un nombre réel interprété comme un nombre complexe avec des parties imaginaires égales à 0, ou une chaîne au format "x+yi" où x et y sont numériques.' },
        },
    },
    IMCSC: {
        description: 'Retourne la cosécante d’un nombre complexe au format texte x+yi ou x+yj.',
        abstract: 'Retourne la cosécante d’un nombre complexe au format texte x+yi ou x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Un nombre complexe pour lequel vous souhaitez obtenir la cosécante.' },
        },
    },
    IMCSCH: {
        description: 'Renvoie la cosécante hyperbolique d’un nombre complexe.',
        abstract: 'Renvoie la cosécante hyperbolique d’un nombre complexe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Un nombre complexe pour lequel vous souhaitez obtenir la cosécante hyperbolique.' },
        },
    },
    IMDIV: {
        description: 'Cette fonction renvoie le quotient de deux nombres complexes en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le quotient de deux nombres complexes en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Obligatoire. Représente le nombre complexe numérateur ou dividende.' },
            inumber2: { name: 'inumber2', detail: 'Obligatoire. Représente le nombre complexe dénominateur ou diviseur.' },
        },
    },
    IMEXP: {
        description: 'Cette fonction renvoie la fonction exponentielle d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie la fonction exponentielle d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez la fonction exponentielle.' },
        },
    },
    IMLN: {
        description: 'Cette fonction renvoie le logarithme népérien d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le logarithme népérien d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le logarithme népérien.' },
        },
    },
    IMLOG: {
        description: 'La fonction COMPLEXE.LOG affiche le logarithme d\'un nombre complexe pour une base spécifiée.',
        abstract: 'La fonction COMPLEXE.LOG affiche le logarithme d\'un nombre complexe pour une base spécifiée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=fr',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Valeur d\'entrée de la fonction logarithme. Le nombre peut être écrit sous forme brute (1, par exemple) et sera alors interprété comme un nombre réel. Le nombre peut être entouré de guillemets, pour spécifier à la fois les coefficients réels et complexes.' },
            base: { name: 'base', detail: 'Base servant à calculer le logarithme. Doit être un nombre réel positif.' },
        },
    },
    IMLOG10: {
        description: 'Cette fonction renvoie le logarithme en base 10 d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le logarithme en base 10 d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le logarithme.' },
        },
    },
    IMLOG2: {
        description: 'Cette fonction renvoie le logarithme en base 2 d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le logarithme en base 2 d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le logarithme de base 2.' },
        },
    },
    IMPOWER: {
        description: 'Cette fonction renvoie un nombre complexe en format texte x + yi ou x + yj, après l’avoir élevé à une puissance.',
        abstract: 'Cette fonction renvoie un nombre complexe en format texte x + yi ou x + yj, après l’avoir élevé à une puissance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente le nombre complexe que vous voulez élever à une puissance.' },
            number: { name: 'number', detail: 'Obligatoire. Représente la puissance à laquelle vous voulez élever ce nombre complexe.' },
        },
    },
    IMPRODUCT: {
        description: 'Cette fonction renvoie le produit de 1 à 255 nombres complexes au format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le produit de 1 à 255 nombres complexes au format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'nombre_complexe1 est obligatoire, mais les nombres_complexes suivants ne le sont pas. Il s’agit des nombres complexes de 1 à 255 à multiplier.' },
            inumber2: { name: 'inumber2', detail: 'nombre_complexe1 est obligatoire, mais les nombres_complexes suivants ne le sont pas. Il s’agit des nombres complexes de 1 à 255 à multiplier.' },
        },
    },
    IMREAL: {
        description: 'Cette fonction renvoie le coefficient réel d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le coefficient réel d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le coefficient réel.' },
        },
    },
    IMSEC: {
        description: 'Retourne la sécante d’un nombre complexe au format texte x+yi ou x+yj.',
        abstract: 'Retourne la sécante d’un nombre complexe au format texte x+yi ou x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Un nombre complexe pour lequel vous souhaitez obtenir la sécante.' },
        },
    },
    IMSECH: {
        description: 'Renvoie la sécante hyperbolique d’un nombre complexe.',
        abstract: 'Renvoie la sécante hyperbolique d’un nombre complexe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Un nombre complexe pour lequel vous souhaitez obtenir la sécante hyperbolique.' },
        },
    },
    IMSIN: {
        description: 'Cette fonction renvoie le sinus d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie le sinus d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez le sinus.' },
        },
    },
    IMSINH: {
        description: 'La fonction IMSINH retourne le sinus hyperbolique d’un nombre complexe au format texte x+yi ou x+yj.',
        abstract: 'La fonction IMSINH retourne le sinus hyperbolique d’un nombre complexe au format texte x+yi ou x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Un nombre complexe pour lequel vous souhaitez obtenir le sinus hyperbolique.' },
        },
    },
    IMSQRT: {
        description: 'Cette fonction renvoie la racine carrée d’un nombre complexe en format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie la racine carrée d’un nombre complexe en format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Représente un nombre complexe dont vous recherchez la racine carrée.' },
        },
    },
    IMSUB: {
        description: 'Cette fonction renvoie la différence entre deux nombres complexes au format texte x + yi ou x + yj.',
        abstract: 'Cette fonction renvoie la différence entre deux nombres complexes au format texte x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Obligatoire. Représente le nombre complexe duquel vous voulez soustraire l’argument nombre_complexe2.' },
            inumber2: { name: 'inumber2', detail: 'Obligatoire. Représente le nombre complexe à soustraire de l’argument nombre_complexe1.' },
        },
    },
    IMSUM: {
        description: 'Renvoie la somme de nombres complexes.',
        abstract: 'Renvoie la somme de nombres complexes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: '1 à 255 nombres complexes à additionner.' },
            inumber2: { name: 'inumber2', detail: 'Nombre complexe supplémentaire à additionner.' },
        },
    },
    IMTAN: {
        description: 'Renvoie la tangente d’un nombre complexe.',
        abstract: 'Renvoie la tangente d’un nombre complexe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obligatoire. Un nombre complexe pour lequel vous souhaitez obtenir la tangente.' },
        },
    },
    IMTANH: {
        description: 'La fonction IMTANH affiche la tangente hyperbolique du nombre complexe donné. Par exemple, le nombre complexe "x+yi" affiche "tanh(x+yi)".',
        abstract: 'La fonction IMTANH affiche la tangente hyperbolique du nombre complexe donné. Par exemple, le nombre complexe "x+yi" affiche "tanh(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=fr',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Nombre complexe dont vous souhaitez afficher la tangente hyperbolique. Cela peut être le résultat de la fonction COMPLEXE, un nombre réel interprété comme un nombre complexe avec des parties imaginaires égales à 0, ou une chaîne au format "x+yi" où x et y sont numériques.' },
        },
    },
    OCT2BIN: {
        description: 'Convertit un nombre octal en nombre binaire.',
        abstract: 'Convertit un nombre octal en nombre binaire.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre octal à convertir. Il ne doit pas comporter plus de 10 caractères; le bit de poids fort est le bit de signe.' },
            places: { name: 'places', detail: 'Facultatif. Représente le nombre de caractères à utiliser. S’il est omis, OCT2BIN utilise le nombre minimal nécessaire.' },
        },
    },
    OCT2DEC: {
        description: 'Convertit un nombre octal en nombre décimal.',
        abstract: 'Convertit un nombre octal en nombre décimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre octal à convertir. Il ne doit pas comporter plus de 10 caractères octaux; le bit de poids fort est le bit de signe.' },
        },
    },
    OCT2HEX: {
        description: 'Convertit un nombre octal en nombre hexadécimal.',
        abstract: 'Convertit un nombre octal en nombre hexadécimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre octal à convertir. Il ne doit pas comporter plus de 10 caractères octaux; le bit de poids fort est le bit de signe.' },
            places: { name: 'places', detail: 'Optionnel. Représente le nombre de caractères à utiliser. S’il est omis, OCT2HEX utilise le nombre minimal nécessaire.' },
        },
    },
};

export default locale;
