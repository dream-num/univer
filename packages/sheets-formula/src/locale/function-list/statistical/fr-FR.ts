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
    AVEDEV: {
        description: 'Renvoie la moyenne des écarts absolus des observations par rapport à leur moyenne arithmétique. ECART.MOYEN mesure la dispersion dans un ensemble de données.',
        abstract: 'Renvoie la moyenne des écarts absolus des observations par rapport à leur moyenne arithmétique. ECART.MOYEN mesure la dispersion dans un ensemble de données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments pour lesquels vous recherchez la moyenne des écarts par rapport à leur moyenne. Vous pouvez également substituer à des arguments séparés par un point-virgule, une matrice unique ou une référence à une matrice.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments pour lesquels vous recherchez la moyenne des écarts par rapport à leur moyenne. Vous pouvez également substituer à des arguments séparés par un point-virgule, une matrice unique ou une référence à une matrice.' },
        },
    },
    AVERAGE: {
        description: 'Retourne la moyenne (arithmétique) des arguments. Par exemple, si la plage A1 :A20 contient des nombres, la formule =AVERAGE(A1 :A20) retourne la moyenne de ces nombres.',
        abstract: 'Retourne la moyenne (arithmétique) des arguments. Par exemple, si la plage A1 :A20 contient des nombres, la formule =AVERAGE(A1 :A20) retourne la moyenne de ces nombres.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier nombre, référence de cellule ou plage pour lequel vous souhaitez obtenir la moyenne.' },
            number2: { name: 'number2', detail: 'Optionnel. Nombres, références de cellules ou plages supplémentaires dont vous voulez obtenir la moyenne (255 maximum).' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'La fonction AVERAGE.WEIGHTED calcule la moyenne pondérée d’un ensemble de valeurs à partir de ces valeurs et de leurs pondérations respectives.',
        abstract: 'La fonction AVERAGE.WEIGHTED calcule la moyenne pondérée d’un ensemble de valeurs à partir de ces valeurs et de leurs pondérations respectives.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=fr',
            },
        ],
        functionParameter: {
            values: { name: 'valeurs', detail: 'AVERAGE.WEIGHTED(A1:A2; B1:B2)' },
            weights: { name: 'pondérations', detail: 'AVERAGE.WEIGHTED(A1:A2; B1:B2; C1; C2)' },
            additionalValues: { name: 'valeurs_supplémentaires', detail: 'Valeurs supplémentaires dont calculer la moyenne. Ces valeurs sont facultatives.' },
            additionalWeights: { name: 'pondérations_supplémentaires', detail: 'Pondérations supplémentaires à appliquer. Elles sont facultatives, mais chaque valeur_supplémentaire doit être suivie d’exactement une pondération_supplémentaire.' },
        },
    },
    AVERAGEA: {
        description: 'Calcule la moyenne (arithmétique) des valeurs contenues dans la liste des arguments.',
        abstract: 'Calcule la moyenne (arithmétique) des valeurs contenues dans la liste des arguments.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 255 cellules, plages de cellules ou valeurs dont vous voulez calculer la moyenne.' },
            value2: { name: 'value2', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 255 cellules, plages de cellules ou valeurs dont vous voulez calculer la moyenne.' },
        },
    },
    AVERAGEIF: {
        description: 'Renvoie la moyenne (arithmétique) de toutes les cellules d’une plage qui répondent à des critères donnés.',
        abstract: 'Renvoie la moyenne (arithmétique) de toutes les cellules d’une plage qui répondent à des critères donnés.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Obligatoire. Une ou plusieurs cellules dont la moyenne doit être calculée, y compris des nombres ou des noms, des tableaux ou des références qui contiennent des nombres.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente le critère, sous forme de nombre, d’expression, de référence de cellule ou de texte, qui détermine les cellules dont la moyenne est à calculer. Par exemple, les critères peuvent être exprimés sous la forme 32, « 32 », «> 32 », « pommes » ou B4.' },
            averageRange: { name: 'average_range', detail: 'Optionnel. Représente l’ensemble des cellules dont la moyenne est à calculer. Si cet argument est omis, l’argument plage est utilisé.' },
        },
    },
    AVERAGEIFS: {
        description: 'Renvoie la moyenne (arithmétique) de toutes les cellules qui répondent à plusieurs critères.',
        abstract: 'Renvoie la moyenne (arithmétique) de toutes les cellules qui répondent à plusieurs critères.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: 'Obligatoire. Une ou plusieurs cellules dont la moyenne doit être calculée, y compris des nombres ou des noms, des tableaux ou des références qui contiennent des nombres.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Plage_critères1 est obligatoire, les plages_critères supplémentaires sont facultatives. Représente de 1 à 127 plages dans lesquelles les critères associés sont à évaluer.' },
            criteria1: { name: 'criteria1', detail: 'Criteria1 est obligatoire, les critères suivants sont facultatifs. Représente de 1 à 127 critères, sous forme de nombre, d’expression, de référence de cellule ou de texte, qui déterminent les cellules dont la moyenne doit être calculée. Par exemple, les critères peuvent être exprimés sous la forme 32, « 32 », «> 32 », « pommes » ou B4.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Plage_critères1 est obligatoire, les plages_critères supplémentaires sont facultatives. Représente de 1 à 127 plages dans lesquelles les critères associés sont à évaluer.' },
            criteria2: { name: 'criteria2', detail: 'Criteria1 est obligatoire, les critères suivants sont facultatifs. Représente de 1 à 127 critères, sous forme de nombre, d’expression, de référence de cellule ou de texte, qui déterminent les cellules dont la moyenne doit être calculée. Par exemple, les critères peuvent être exprimés sous la forme 32, « 32 », «> 32 », « pommes » ou B4.' },
        },
    },
    BETA_DIST: {
        description: 'Cette fonction de distribution bêta est généralement utilisée pour étudier la variation du pourcentage d’un élément présent dans des échantillonnages, par exemple, la durée quotidienne pendant laquelle les gens regardent la télévision.',
        abstract: 'Cette fonction de distribution bêta est généralement utilisée pour étudier la variation du pourcentage d’un élément présent dans des échantillonnages, par exemple, la durée quotidienne pendant laquelle les gens regardent la télévision.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur comprise entre A et B à laquelle la fonction doit être calculée.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si l’argument cumulative est VRAI, la fonction LOI.BETA.N renvoie la fonction de distribution cumulée ; si l’argument cumulative est FAUX, la fonction renvoie la fonction de densité de probabilité.' },
            A: { name: 'A', detail: 'Représente une limite inférieure de l’intervalle des x.' },
            B: { name: 'B', detail: 'Facultatif. Représente une limite supérieure de l’intervalle des x.' },
        },
    },
    BETA_INV: {
        description: 'Si probabilité = LOI.BETA.N(x,...VRAI), alors BETA.INVERSE.N(probabilité,...) = x. La distribution bêta peut être utilisée en planification de projets afin de prévoir les dates d’achèvement probables en fonction d’une durée et d’une dispersion prévues.',
        abstract: 'Si probabilité = LOI.BETA.N(x,...VRAI), alors BETA.INVERSE.N(probabilité,...) = x. La distribution bêta peut être utilisée en planification de projets afin de prévoir les dates d’achèvement probables en fonction d’une durée et d’une dispersion prévues.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente la probabilité associée à la distribution bêta.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            A: { name: 'A', detail: 'Représente une limite inférieure de l’intervalle des x.' },
            B: { name: 'B', detail: 'Facultatif. Représente une limite supérieure de l’intervalle des x.' },
        },
    },
    BINOM_DIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire discrète suivant la loi binomiale. Utilisez la fonction LOI.BINOMIALE.N pour résoudre des problèmes comportant un nombre de tests ou d’essais déterminé, lorsque le résultat des essais ne peut être qu’un succès ou un échec, lorsque les essais sont indépendants, ou lorsque la probabilité de succès est constante au cours des expérimentations. La fonction LOI.BINOMIALE.N peut, par exemple, calculer la probabilité pour que deux des trois enfants à naître soient des garçons.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire discrète suivant la loi binomiale. Utilisez la fonction LOI.BINOMIALE.N pour résoudre des problèmes comportant un nombre de tests ou d’essais déterminé, lorsque le résultat des essais ne peut être qu’un succès ou un échec, lorsque les essais sont indépendants, ou lorsque la probabilité de succès est constante au cours des expérimentations. La fonction LOI.BINOMIALE.N peut, par exemple, calculer la probabilité pour que deux des trois enfants à naître soient des garçons.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Obligatoire. Représente le nombre d’essais réussis.' },
            trials: { name: 'trials', detail: 'Obligatoire. Représente le nombre d’essais indépendants.' },
            probabilityS: { name: 'probability_s', detail: 'Obligatoire. Représente la probabilité de succès de chaque essai.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique qui détermine le mode de calcul de la fonction. Si l’argument cumulative a la valeur VRAI, alors LOI.BINOMIALE.N renvoie la fonction de distribution cumulée qui représente la probabilité qu’il y ait au plus nombre_s succès ; si l’argument cumulative a la valeur FAUX, LOI.BINOMIALE.N renvoie la fonction de probabilité de masse qui représente la probabilité qu’il y ait nombre_s succès.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Renvoie la probabilité d’un résultat d’essai à l’aide d’une distribution binomiale.',
        abstract: 'Renvoie la probabilité d’un résultat d’essai à l’aide d’une distribution binomiale.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obligatoire. Nombre d’essais indépendants. Doit être supérieur ou égal à 0.' },
            probabilityS: { name: 'probability_s', detail: 'Obligatoire. Représente la probabilité de succès de chaque essai. Doit être supérieur ou égal à 0 et inférieur ou égal à 1.' },
            numberS: { name: 'number_s', detail: 'Obligatoire. Représente le nombre de succès lors des essais. Doit être supérieur ou égal à 0 et inférieur ou égal à Essais.' },
            numberS2: { name: 'number_s2', detail: 'Optionnel. Si cet argument est fourni, renvoie la probabilité que le nombre d’essais réussis soit compris entre Nombre_succès et nombre_succès2. Doit être supérieur ou égal à Nombre_succès et inférieur ou égal à Essais.' },
        },
    },
    BINOM_INV: {
        description: 'Renvoie la plus petite valeur pour laquelle la distribution binomiale cumulée est supérieure ou égale à une valeur de critère.',
        abstract: 'Renvoie la plus petite valeur pour laquelle la distribution binomiale cumulée est supérieure ou égale à une valeur de critère.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obligatoire. Représente le nombre d’essais de Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Obligatoire. Représente la probabilité de succès de chaque essai.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente la valeur de critère.' },
        },
    },
    CHISQ_DIST: {
        description: 'Renvoie la distribution du Khi-deux.',
        abstract: 'Renvoie la distribution du Khi-deux.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur à laquelle vous voulez évaluer la distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si l’argument cumulative est VRAI, la fonction LOI.KHIDEUX.N renvoie la fonction de distribution cumulée ; si l’argument cumulative est FAUX, la fonction renvoie la fonction de densité de probabilité.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'La distribution χ2 est associée à un test χ2. Utilisez un test χ2 pour comparer les valeurs obtenues aux valeurs prévues. Par exemple, une expérience génétique fait l’hypothèse que la prochaine génération de plantes présentera un ensemble de couleurs donné. En comparant les résultats obtenus aux résultats prévus, vous pouvez déterminer si votre hypothèse de départ était correcte.',
        abstract: 'La distribution χ2 est associée à un test χ2. Utilisez un test χ2 pour comparer les valeurs obtenues aux valeurs prévues. Par exemple, une expérience génétique fait l’hypothèse que la prochaine génération de plantes présentera un ensemble de couleurs donné. En comparant les résultats obtenus aux résultats prévus, vous pouvez déterminer si votre hypothèse de départ était correcte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur à laquelle vous voulez évaluer la distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté.' },
        },
    },
    CHISQ_INV: {
        description: 'La distribution khi-deux est généralement utilisée pour étudier la variation du pourcentage d’un élément présent dans des échantillonnages, par exemple, la durée quotidienne pendant laquelle les gens regardent la télévision.',
        abstract: 'La distribution khi-deux est généralement utilisée pour étudier la variation du pourcentage d’un élément présent dans des échantillonnages, par exemple, la durée quotidienne pendant laquelle les gens regardent la télévision.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité associée à la distribution khi-deux.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Si probabilité = LOI.KHIDEUX.DROITE(x,...), alors LOI.KHIDEUX.INVERSE.DROITE(probabilité,...) = x. Utilisez cette fonction pour comparer les résultats obtenus aux résultats prévus afin de déterminer si votre hypothèse de départ était juste.',
        abstract: 'Si probabilité = LOI.KHIDEUX.DROITE(x,...), alors LOI.KHIDEUX.INVERSE.DROITE(probabilité,...) = x. Utilisez cette fonction pour comparer les résultats obtenus aux résultats prévus afin de déterminer si votre hypothèse de départ était juste.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité associée à la distribution khi-deux.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté.' },
        },
    },
    CHISQ_TEST: {
        description: 'Renvoie le test d’indépendance. CHISQ.TEST renvoie la valeur de la distribution khi-deux (χ2) pour la statistique et les degrés de liberté appropriés. Utilisez les tests χ2 pour déterminer si les résultats prévus sont vérifiés par une expérimentation.',
        abstract: 'Renvoie le test d’indépendance. CHISQ.TEST renvoie la valeur de la distribution khi-deux (χ2) pour la statistique et les degrés de liberté appropriés. Utilisez les tests χ2 pour déterminer si les résultats prévus sont vérifiés par une expérimentation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Obligatoire. Représente la plage de données contenant les observations à comparer aux valeurs prévues.' },
            expectedRange: { name: 'expected_range', detail: 'Obligatoire. Représente la plage de données contenant le rapport du produit des totaux de ligne et de colonne avec le total général.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'L’intervalle de confiance est une plage de valeurs. Votre moyenne d’échantillonnage, x, se trouve au centre de cette plage, et la plage est x ± INTERVALLE.CONFIANCE.NORMAL. Par exemple, si x est la moyenne d’échantillonnage des délais de livraison des articles commandés par courrier, x ± INTERVALLE.CONFIANCE.NORMAL est une plage de moyennes d’échantillonnage. Pour une moyenne de population au hasard, µ0, dans cette plage, la probabilité d’obtenir une moyenne d’échantillonnage plus éloignée de µ0 que x est plus élevée que alpha ; pour une moyenne de population au hasard, µ0, en dehors de cette plage, la probabilité d’obtenir une moyenne d’échantillonnage plus éloignée de µ0 que x est inférieure à alpha. En d’autres termes, supposons que nous utilisons x, standard_dev et size pour construire un test bilatéral au niveau critique alpha de l’hypothèse selon laquelle la moyenne de population est µ0. Dans ce cas, nous ne rejetterons pas l’hypothèse si µ0 se trouve dans l’intervalle de confiance, mais bien si µ0 ne s’y trouve pas. L’intervalle de confiance ne nous permet pas de déduire qu’il y a une probabilité de 1 – alpha que notre prochain paquet ait un délai de livraison situé dans l’intervalle de confiance.',
        abstract: 'L’intervalle de confiance est une plage de valeurs. Votre moyenne d’échantillonnage, x, se trouve au centre de cette plage, et la plage est x ± INTERVALLE.CONFIANCE.NORMAL. Par exemple, si x est la moyenne d’échantillonnage des délais de livraison des articles commandés par courrier, x ± INTERVALLE.CONFIANCE.NORMAL est une plage de moyennes d’échantillonnage. Pour une moyenne de population au hasard, µ0, dans cette plage, la probabilité d’obtenir une moyenne d’échantillonnage plus éloignée de µ0 que x est plus élevée que alpha ; pour une moyenne de population au hasard, µ0, en dehors de cette plage, la probabilité d’obtenir une moyenne d’échantillonnage plus éloignée de µ0 que x est inférieure à alpha. En d’autres termes, supposons que nous utilisons x, standard_dev et size pour construire un test bilatéral au niveau critique alpha de l’hypothèse selon laquelle la moyenne de population est µ0. Dans ce cas, nous ne rejetterons pas l’hypothèse si µ0 se trouve dans l’intervalle de confiance, mais bien si µ0 ne s’y trouve pas. L’intervalle de confiance ne nous permet pas de déduire qu’il y a une probabilité de 1 – alpha que notre prochain paquet ait un délai de livraison situé dans l’intervalle de confiance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obligatoire. Niveau de précision utilisé pour calculer le niveau de confiance. Le niveau de confiance est égal à 100*(1 - alpha) %, ou en d’autres termes, un alpha de 0,05 indique un niveau de confiance de 95 %.' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart-type de population pour la plage de données ; cet argument est supposé être connu.' },
            size: { name: 'size', detail: 'Obligatoire. Représente la taille de l’échantillon.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Renvoie l’intervalle de confiance pour la moyenne d’une population, à l’aide d’une distribution t de Student.',
        abstract: 'Renvoie l’intervalle de confiance pour la moyenne d’une population, à l’aide d’une distribution t de Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obligatoire. Niveau de précision utilisé pour calculer le niveau de confiance. Le niveau de confiance est égal à 100*(1 - alpha) %, ou en d’autres termes, un alpha de 0,05 indique un niveau de confiance de 95 %.' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart-type de population pour la plage de données ; cet argument est supposé être connu.' },
            size: { name: 'size', detail: 'Obligatoire. Représente la taille de l’échantillon.' },
        },
    },
    CORREL: {
        description: 'Renvoie le coefficient de corrélation entre deux jeux de données.',
        abstract: 'Renvoie le coefficient de corrélation entre deux jeux de données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Première plage de valeurs de cellules.' },
            array2: { name: 'array2', detail: 'Deuxième plage de valeurs de cellules.' },
        },
    },
    COUNT: {
        description: 'La fonction NB compte le nombre de cellules contenant des nombres et les nombres compris dans la liste des arguments. Utilisez la fonction NB pour obtenir le nombre d’entrées numériques dans un champ numérique d’une plage ou d’une matrice de nombres. Vous pouvez, par exemple, entrer la formule suivante pour compter les nombres de la plage A1:A20 : =NB(A1:A20) . Dans cet exemple, si 5 des cellules de la plage contiennent des nombres, le résultat est 5 .',
        abstract: 'La fonction NB compte le nombre de cellules contenant des nombres et les nombres compris dans la liste des arguments. Utilisez la fonction NB pour obtenir le nombre d’entrées numériques dans un champ numérique d’une plage ou d’une matrice de nombres. Vous pouvez, par exemple, entrer la formule suivante pour compter les nombres de la plage A1:A20 : =NB(A1:A20) . Dans cet exemple, si 5 des cellules de la plage contiennent des nombres, le résultat est 5 .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value 1', detail: 'Obligatoire. Premier élément, référence de la cellule ou plage dans laquelle vous souhaitez compter les nombres.' },
            value2: { name: 'value 2', detail: 'Optionnel. Jusqu’à 255 éléments supplémentaires, références de cellules ou plages dans lesquelles vous souhaitez compter les nombres.' },
        },
    },
    COUNTA: {
        description: 'La fonction COUNTA compte le nombre de cellules qui ne sont pas vides dans une plage.',
        abstract: 'La fonction COUNTA compte le nombre de cellules qui ne sont pas vides dans une plage.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 255 cellules, plages de cellules ou valeurs dont vous voulez calculer la moyenne.' },
            value2: { name: 'value2', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 255 cellules, plages de cellules ou valeurs dont vous voulez calculer la moyenne.' },
        },
    },
    COUNTBLANK: {
        description: 'Utilisez la fonction COUNTBLANK , l’une des fonctions statistiques , pour compter le nombre de cellules vides dans une plage de cellules.',
        abstract: 'Utilisez la fonction COUNTBLANK , l’une des fonctions statistiques , pour compter le nombre de cellules vides dans une plage de cellules.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Obligatoire. Représente la plage dans laquelle vous voulez compter les cellules vides.' },
        },
    },
    COUNTIF: {
        description: 'NB.SI, l’une des fonctions Statistiques , permet de compter le nombre de cellules qui répondent à un critère ; par exemple, pour compter le nombre de fois où le nom d’une ville apparaît dans une liste de clients.',
        abstract: 'NB.SI, l’une des fonctions Statistiques , permet de compter le nombre de cellules qui répondent à un critère ; par exemple, pour compter le nombre de fois où le nom d’une ville apparaît dans une liste de clients.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Le groupe de cellules à compter. La plage peut contenir des nombres, des tableaux, une plage nommée ou des références qui contiennent des nombres. Les valeurs vides et textuelles sont ignorées. Découvrez comment sélectionner des plages dans une feuille de calcul .' },
            criteria: { name: 'criteria', detail: 'Nombre, expression, référence de cellule ou chaîne de texte qui détermine les cellules à compter. Par exemple, vous pouvez utiliser un nombre comme 32, une comparaison comme «> 32 », une cellule comme B4 ou un mot comme « pommes ». NB.SI utilise un seul critère. Utilisez NB.SI.ENS Si vous voulez utiliser plusieurs critères.' },
        },
    },
    COUNTIFS: {
        description: 'La fonction COUNTIFS applique des critères à des cellules sur plusieurs plages et compte le nombre de fois où tous les critères sont remplis.',
        abstract: 'La fonction COUNTIFS applique des critères à des cellules sur plusieurs plages et compte le nombre de fois où tous les critères sont remplis.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: 'Obligatoire. La première plage dans laquelle évaluer les critères associés.' },
            criteria1: { name: 'criteria1', detail: 'Obligatoire. Critères, sous forme de nombre, d’expression, de référence de cellule ou de texte, qui déterminent les cellules à compter. Par exemple, les critères peuvent être exprimés sous la forme 32, «> 32 », B4, « pommes » ou « 32 ».' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Optionnel. Plages supplémentaires et leurs critères associés. Jusqu’à 127 paires plage/critères sont autorisées.' },
            criteria2: { name: 'criteria2', detail: 'Optionnel. Plages supplémentaires et leurs critères associés. Jusqu’à 127 paires plage/critères sont autorisées.' },
        },
    },
    COVARIANCE_P: {
        description: 'Renvoie la covariance de population, moyenne des produits des écarts pour chaque paire de points de données dans deux jeux de données. Utilisez la covariance pour déterminer la relation entre deux jeux de données. Par exemple, vous pouvez examiner si des revenus plus élevés correspondent à un meilleur niveau d’éducation.',
        abstract: 'Renvoie la covariance de population, moyenne des produits des écarts pour chaque paire de points de données dans deux jeux de données. Utilisez la covariance pour déterminer la relation entre deux jeux de données. Par exemple, vous pouvez examiner si des revenus plus élevés correspondent à un meilleur niveau d’éducation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obligatoire. Représente la première plage de cellules de nombres entiers.' },
            array2: { name: 'array2', detail: 'Obligatoire. Représente la seconde plage de cellules de nombres entiers.' },
        },
    },
    COVARIANCE_S: {
        description: 'Renvoie la covariance d’échantillon, moyenne des produits des écarts pour chaque paire de points de deux jeux de données.',
        abstract: 'Renvoie la covariance d’échantillon, moyenne des produits des écarts pour chaque paire de points de deux jeux de données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obligatoire. Représente la première plage de cellules de nombres entiers.' },
            array2: { name: 'array2', detail: 'Obligatoire. Représente la seconde plage de cellules de nombres entiers.' },
        },
    },
    DEVSQ: {
        description: 'Renvoie la somme des carrés des écarts entre les points de données et leur moyenne échantillonnée.',
        abstract: 'Renvoie la somme des carrés des écarts entre les points de données et leur moyenne échantillonnée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments pour lesquels vous voulez calculer la somme des carrés des écarts. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments pour lesquels vous voulez calculer la somme des carrés des écarts. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    EXPON_DIST: {
        description: 'Renvoie la distribution exponentielle. Utilisez la fonction LOI.EXPONENTIELLE.N pour prévoir la durée séparant des événements, tel le temps mis par un distributeur automatique bancaire pour délivrer de l’argent. Par exemple, vous pouvez utiliser LOI.EXPONENTIELLE.N pour calculer la probabilité que l’opération dure moins d’une minute.',
        abstract: 'Renvoie la distribution exponentielle. Utilisez la fonction LOI.EXPONENTIELLE.N pour prévoir la durée séparant des événements, tel le temps mis par un distributeur automatique bancaire pour délivrer de l’argent. Par exemple, vous pouvez utiliser LOI.EXPONENTIELLE.N pour calculer la probabilité que l’opération dure moins d’une minute.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur de la fonction.' },
            lambda: { name: 'lambda', detail: 'Obligatoire. Représente la valeur du paramètre.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Valeur logique qui indique la forme de la fonction exponentielle à fournir. Si cumulative a la valeur TRUE, EXPON. DIST retourne la fonction de distribution cumulée ; si la valeur est FALSE, elle retourne la fonction de densité de probabilité.' },
        },
    },
    F_DIST: {
        description: 'Renvoie la distribution de probabilité F.',
        abstract: 'Renvoie la distribution de probabilité F.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Valeur à laquelle évaluer la fonction.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Degrés de liberté du numérateur.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Degrés de liberté du dénominateur.' },
            cumulative: { name: 'cumulative', detail: 'Valeur logique qui détermine la forme de la fonction. Si cumulative vaut TRUE, F.DIST renvoie la fonction de distribution cumulée ; sinon, la fonction de densité de probabilité.' },
        },
    },
    F_DIST_RT: {
        description: 'Renvoie la distribution de probabilité F unilatérale à droite.',
        abstract: 'Renvoie la distribution de probabilité F unilatérale à droite.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Valeur à laquelle évaluer la fonction.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Degrés de liberté du numérateur.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Degrés de liberté du dénominateur.' },
        },
    },
    F_INV: {
        description: 'Renvoie l’inverse de la distribution de probabilité F.',
        abstract: 'Renvoie l’inverse de la distribution de probabilité F.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Probabilité associée à la distribution F cumulée.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Degrés de liberté du numérateur.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Degrés de liberté du dénominateur.' },
        },
    },
    F_INV_RT: {
        description: 'Renvoie l’inverse de la distribution de probabilité F unilatérale à droite.',
        abstract: 'Renvoie l’inverse de la distribution de probabilité F unilatérale à droite.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Probabilité associée à la distribution F cumulée.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Degrés de liberté du numérateur.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Degrés de liberté du dénominateur.' },
        },
    },
    F_TEST: {
        description: 'Renvoie le résultat d’un test F.',
        abstract: 'Renvoie le résultat d’un test F.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Premier tableau ou première plage de données.' },
            array2: { name: 'array2', detail: 'Deuxième tableau ou deuxième plage de données.' },
        },
    },
    FISHER: {
        description: 'Renvoie la transformation de Fisher.',
        abstract: 'Renvoie la transformation de Fisher.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Valeur numérique dont vous souhaitez obtenir la transformation.' },
        },
    },
    FISHERINV: {
        description: 'Renvoie l’inverse de la transformation de Fisher. Utilisez cette transformation pour analyser des corrélations entre plages ou matrices de données. Si y = FISHER(x), alors FISHER.INVERSE(y) = x.',
        abstract: 'Renvoie l’inverse de la transformation de Fisher. Utilisez cette transformation pour analyser des corrélations entre plages ou matrices de données. Si y = FISHER(x), alors FISHER.INVERSE(y) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'Obligatoire. Représente la valeur pour laquelle vous voulez réaliser l’inverse de la transformation.' },
        },
    },
    FORECAST: {
        description: 'Calculer ou prédire une valeur future à l’aide de valeurs existantes. La valeur future est une valeur y pour une valeur x donnée. Les valeurs existantes sont des valeurs x et y connues, et la valeur future est prédite à l’aide de la régression linéaire. Vous pouvez utiliser ces fonctions pour prédire les ventes futures, les besoins en stock ou les tendances des consommateurs.',
        abstract: 'Calculer ou prédire une valeur future à l’aide de valeurs existantes. La valeur future est une valeur y pour une valeur x donnée. Les valeurs existantes sont des valeurs x et y connues, et la valeur future est prédite à l’aide de la régression linéaire. Vous pouvez utiliser ces fonctions pour prédire les ventes futures, les besoins en stock ou les tendances des consommateurs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'oui Représente le point de données dont vous voulez prévoir la valeur.' },
            knownYs: { name: 'known_y\'s', detail: 'oui Représente la matrice ou la plage de données dépendante.' },
            knownXs: { name: 'known_x\'s', detail: 'oui Représente la matrice ou la plage de données indépendante.' },
        },
    },
    FORECAST_ETS: {
        description: 'Calcule ou prédit une valeur future à partir de valeurs existantes à l’aide de la version AAA de l’algorithme de lissage exponentiel (ETS).',
        abstract: 'Calcule ou prédit une valeur future à partir de valeurs existantes à l’aide de la version AAA de l’algorithme de lissage exponentiel (ETS).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Date cible', detail: 'Le point de données pour lequel vous souhaitez prévoir une valeur.' },
            values: { name: 'Valeurs', detail: 'Les valeurs historiques utilisées pour la prévision.' },
            timeline: { name: 'Chronologie', detail: 'Une plage ou matrice indépendante de dates ou heures numériques avec un pas constant.' },
            seasonality: { name: 'Caractère saisonnier', detail: 'Facultatif. Longueur saisonnière ; 1 pour la détection automatique et 0 sans saisonnalité.' },
            dataCompletion: { name: 'Saisie semi-automatique', detail: 'Facultatif. Utilisez 1 pour interpoler les points manquants ou 0 pour les traiter comme zéro.' },
            aggregation: { name: 'Agrégation', detail: 'Facultatif. Une valeur de 1 à 7 indique comment agréger les horodatages en double.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Renvoie l’intervalle de confiance d’une valeur prévisionnelle à la date cible spécifiée.',
        abstract: 'Renvoie l’intervalle de confiance d’une valeur prévisionnelle à la date cible spécifiée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Date cible', detail: 'Le point de données pour lequel vous souhaitez prévoir une valeur.' },
            values: { name: 'Valeurs', detail: 'Les valeurs historiques utilisées pour la prévision.' },
            timeline: { name: 'Chronologie', detail: 'Une plage ou matrice indépendante de dates ou heures numériques avec un pas constant.' },
            confidenceLevel: { name: 'Niveau de confiance', detail: 'Facultatif. Un nombre compris entre 0 et 1 ; la valeur par défaut est 0,95.' },
            seasonality: { name: 'Caractère saisonnier', detail: 'Facultatif. Longueur saisonnière ; 1 pour la détection automatique et 0 sans saisonnalité.' },
            dataCompletion: { name: 'Saisie semi-automatique', detail: 'Facultatif. Utilisez 1 pour interpoler les points manquants ou 0 pour les traiter comme zéro.' },
            aggregation: { name: 'Agrégation', detail: 'Facultatif. Une valeur de 1 à 7 indique comment agréger les horodatages en double.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Renvoie la longueur du modèle répétitif détecté par Excel pour la série chronologique spécifiée.',
        abstract: 'Renvoie la longueur du modèle répétitif détecté par Excel pour la série chronologique spécifiée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valeurs', detail: 'Les valeurs historiques utilisées pour la prévision.' },
            timeline: { name: 'Chronologie', detail: 'Une plage ou matrice indépendante de dates ou heures numériques avec un pas constant.' },
            dataCompletion: { name: 'Saisie semi-automatique', detail: 'Facultatif. Utilisez 1 pour interpoler les points manquants ou 0 pour les traiter comme zéro.' },
            aggregation: { name: 'Agrégation', detail: 'Facultatif. Une valeur de 1 à 7 indique comment agréger les horodatages en double.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Renvoie une valeur statistique résultant de la prévision d’une série chronologique.',
        abstract: 'Renvoie une valeur statistique résultant de la prévision d’une série chronologique.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valeurs', detail: 'Les valeurs historiques utilisées pour la prévision.' },
            timeline: { name: 'Chronologie', detail: 'Une plage ou matrice indépendante de dates ou heures numériques avec un pas constant.' },
            statisticType: { name: 'Type de statistique', detail: 'Une valeur de 1 à 8 indique la statistique de prévision à renvoyer.' },
            seasonality: { name: 'Caractère saisonnier', detail: 'Facultatif. Longueur saisonnière ; 1 pour la détection automatique et 0 sans saisonnalité.' },
            dataCompletion: { name: 'Saisie semi-automatique', detail: 'Facultatif. Utilisez 1 pour interpoler les points manquants ou 0 pour les traiter comme zéro.' },
            aggregation: { name: 'Agrégation', detail: 'Facultatif. Une valeur de 1 à 7 indique comment agréger les horodatages en double.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Calculer ou prédire une valeur future à l’aide de valeurs existantes. La valeur future est une valeur y pour une valeur x donnée. Les valeurs existantes sont des valeurs x et y connues, et la valeur future est prédite à l’aide de la régression linéaire. Vous pouvez utiliser ces fonctions pour prédire les ventes futures, les besoins en stock ou les tendances des consommateurs.',
        abstract: 'Calculer ou prédire une valeur future à l’aide de valeurs existantes. La valeur future est une valeur y pour une valeur x donnée. Les valeurs existantes sont des valeurs x et y connues, et la valeur future est prédite à l’aide de la régression linéaire. Vous pouvez utiliser ces fonctions pour prédire les ventes futures, les besoins en stock ou les tendances des consommateurs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'oui Représente le point de données dont vous voulez prévoir la valeur.' },
            knownYs: { name: 'known_y\'s', detail: 'oui Représente la matrice ou la plage de données dépendante.' },
            knownXs: { name: 'known_x\'s', detail: 'oui Représente la matrice ou la plage de données indépendante.' },
        },
    },
    FREQUENCY: {
        description: 'La fonction FREQUENCE calcule la fréquence à laquelle les valeurs se produisent dans une plage de valeurs, puis retourne un tableau vertical de nombres. Par exemple, utilisez la fonction FREQUENCE pour déterminer combien de résultats d’un test entrent dans une plage de résultats donnée. Dans la mesure où la fonction FREQUENCE renvoie une matrice, elle doit être tapée sous forme de formule matricielle.',
        abstract: 'La fonction FREQUENCE calcule la fréquence à laquelle les valeurs se produisent dans une plage de valeurs, puis retourne un tableau vertical de nombres. Par exemple, utilisez la fonction FREQUENCE pour déterminer combien de résultats d’un test entrent dans une plage de résultats donnée. Dans la mesure où la fonction FREQUENCE renvoie une matrice, elle doit être tapée sous forme de formule matricielle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: 'Obligatoire. Représente une matrice de valeurs ou une référence au jeu de valeurs dont vous souhaitez calculer les fréquences. Si l’argument tableau_données ne contient aucune valeur, la fonction FREQUENCE renvoie une matrice de zéros.' },
            binsArray: { name: 'bins_array', detail: 'Obligatoire. Représente une matrice d’intervalles ou une référence aux intervalles dans lesquels vous voulez regrouper les valeurs de l’argument tableau_données. Si l’argument matrice_intervalles ne contient aucune valeur, la fonction FREQUENCE renvoie le nombre d’éléments contenu dans l’argument tableau_données.' },
        },
    },
    GAMMA: {
        description: 'Renvoyer la valeur de fonction gamma.',
        abstract: 'Renvoyer la valeur de fonction gamma.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Renvoie un nombre.' },
        },
    },
    GAMMA_DIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Gamma. Vous pouvez utiliser cette fonction pour étudier des variables dont la distribution est susceptible d’être asymétrique. La loi gamma est couramment utilisée dans l’étude de files d’attente.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Gamma. Vous pouvez utiliser cette fonction pour étudier des variables dont la distribution est susceptible d’être asymétrique. La loi gamma est couramment utilisée dans l’étude de files d’attente.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur à laquelle vous voulez évaluer la distribution.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution. Si bêta = 1, LOI.GAMMA.N renvoie la loi Gamma standard.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si l’argument cumulative est VRAI, la fonction LOI.GAMMA.N renvoie la fonction de distribution cumulée ; si l’argument cumulative est FAUX, la fonction renvoie la fonction de densité de probabilité.' },
        },
    },
    GAMMA_INV: {
        description: 'Renvoie l’inverse de la distribution cumulée suivant une loi Gamma. Si l’argument p = LOI.GAMMA.N(x;...), la fonction LOI.GAMMA.INVERSE.N(p;...) = x. Vous pouvez utiliser cette fonction pour étudier une variable dont la distribution est susceptible d’être asymétrique.',
        abstract: 'Renvoie l’inverse de la distribution cumulée suivant une loi Gamma. Si l’argument p = LOI.GAMMA.N(x;...), la fonction LOI.GAMMA.INVERSE.N(p;...) = x. Vous pouvez utiliser cette fonction pour étudier une variable dont la distribution est susceptible d’être asymétrique.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente la probabilité associée à la loi Gamma.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution. Si bêta = 1, LOI.GAMMA.INVERSE.N renvoie la loi Gamma standard.' },
        },
    },
    GAMMALN: {
        description: 'Renvoie le logarithme népérien de la fonction Gamma.',
        abstract: 'Renvoie le logarithme népérien de la fonction Gamma.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur pour laquelle vous souhaitez calculer LNGAMMA.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Renvoie le logarithme népérien de la fonction Gamma.',
        abstract: 'Renvoie le logarithme népérien de la fonction Gamma.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur pour laquelle vous souhaitez calculer LNGAMMA.PRECIS.' },
        },
    },
    GAUSS: {
        description: 'Calcule la probabilité qu’un membre d’une population normale standard se situe entre la moyenne et les z déviations standard par rapport à la moyenne.',
        abstract: 'Calcule la probabilité qu’un membre d’une population normale standard se situe entre la moyenne et les z déviations standard par rapport à la moyenne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obligatoire. Renvoie un nombre.' },
        },
    },
    GEOMEAN: {
        description: 'Renvoie la moyenne géométrique d’une matrice ou d’une plage de données positives. Par exemple, vous pouvez utiliser la fonction MOYENNE.GEOMETRIQUE pour calculer un taux de croissance moyen à partir d’un intérêt composé à taux variables.',
        abstract: 'Renvoie la moyenne géométrique d’une matrice ou d’une plage de données positives. Par exemple, vous pouvez utiliser la fonction MOYENNE.GEOMETRIQUE pour calculer un taux de croissance moyen à partir d’un intérêt composé à taux variables.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments dont vous souhaitez calculer la moyenne. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments dont vous souhaitez calculer la moyenne. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    GROWTH: {
        description: 'Calcule la croissance exponentielle prévue à partir des données existantes. La fonction CROISSANCE renvoie les valeurs y pour une série de nouvelles valeurs x que vous spécifiez, en utilisant des valeurs x et y existantes. Vous pouvez également utiliser la fonction de feuille de calcul CROISSANCE afin d’ajuster une courbe exponentielle à des valeurs x et y existantes.',
        abstract: 'Calcule la croissance exponentielle prévue à partir des données existantes. La fonction CROISSANCE renvoie les valeurs y pour une série de nouvelles valeurs x que vous spécifiez, en utilisant des valeurs x et y existantes. Vous pouvez également utiliser la fonction de feuille de calcul CROISSANCE afin d’ajuster une courbe exponentielle à des valeurs x et y existantes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obligatoire. Représente la série des valeurs y déjà connues dans l’équation y = b*m^x. Si la matrice définie par l’argument y_connus occupe une seule colonne, chaque colonne de l’argument x_connus est interprétée comme étant une variable distincte. Si la matrice définie par l’argument y_connus occupe une seule ligne, chaque ligne de l’argument x_connus est interprétée comme étant une variable distincte. Si l’un des nombres de known_y est 0 ou négatif, GROWTH renvoie la #NUM ! #VALEUR!.' },
            knownXs: { name: 'known_x\'s', detail: 'Optionnel. Représente une série facultative de valeurs x, éventuellement déjà connues dans la relation y = b*m^x. L’argument x_connus peut contenir une ou plusieurs séries de variables. Si vous utilisez une seule variable, les arguments y_connus et x_connus peuvent être des plages de forme différente, à condition qu’elles aient la même dimension. Si vous utilisez plusieurs variables, l’argument y_connus doit être un vecteur (en d’autres termes, une plage comportant une seule ligne ou une seule colonne). Si l’argument x_connus est omis, il est supposé égal à la matrice {1.2.3....}, de même ordre que l’argument y_connus.' },
            newXs: { name: 'new_x\'s', detail: 'Optionnel. Représente la nouvelle série de variables x pour lesquelles vous voulez que CROISSANCE renvoie les valeurs y correspondantes. L’argument x_nouveaux doit comporter une colonne (ou une ligne) pour chaque variable indépendante, comme c’est le cas pour l’argument x_connus. Par conséquent, si l’argument y_connus occupe une seule colonne, les arguments x_connus et x_nouveaux doivent avoir le même nombre de colonnes. Si l’argument y_connus occupe une seule ligne, les arguments x_connus et x_nouveaux doivent avoir le même nombre de lignes. Si l’argument x_nouveaux est omis, l’argument par défaut est l’argument x_connus. Si les arguments x_connus et x_nouveaux sont omis, les matrices par défaut sont {1.2.3....}, de même ordre que l’argument y_connus.' },
            constb: { name: 'const', detail: 'Optionnel. Représente une valeur logique précisant si la constante b doit être égale à 1. Si l’argument constante est VRAI ou omis, la constante b est calculée normalement. Si l’argument constante est FAUX, b est égal à 1 et les valeurs m sont ajustées de façon à ce que y = m^x.' },
        },
    },
    HARMEAN: {
        description: 'Renvoie la moyenne harmonique d’une série de données. La moyenne harmonique est l’inverse de la moyenne arithmétique des inverses des observations.',
        abstract: 'Renvoie la moyenne harmonique d’une série de données. La moyenne harmonique est l’inverse de la moyenne arithmétique des inverses des observations.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments dont vous souhaitez calculer la moyenne. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments dont vous souhaitez calculer la moyenne. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Renvoie la loi hypergéométrique. La fonction LOI.HYPERGEOMETRIQUE.N renvoie la probabilité d’obtenir un nombre donné de tirages « succès » sur un échantillon, connaissant la taille de l’échantillon, le nombre de succès de la population et sa taille. Utilisez la fonction LOI.HYPERGEOMETRIQUE.N dans des problèmes supposant une population déterminée, dans lesquels chaque observation est soit un succès, soit un échec et où chaque sous-ensemble d’une taille donnée est constitué avec la même vraisemblance.',
        abstract: 'Renvoie la loi hypergéométrique. La fonction LOI.HYPERGEOMETRIQUE.N renvoie la probabilité d’obtenir un nombre donné de tirages « succès » sur un échantillon, connaissant la taille de l’échantillon, le nombre de succès de la population et sa taille. Utilisez la fonction LOI.HYPERGEOMETRIQUE.N dans des problèmes supposant une population déterminée, dans lesquels chaque observation est soit un succès, soit un échec et où chaque sous-ensemble d’une taille donnée est constitué avec la même vraisemblance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Obligatoire. Représente le nombre de succès de l’échantillon.' },
            numberSample: { name: 'number_sample', detail: 'Obligatoire. Représente la taille de l’échantillon.' },
            populationS: { name: 'population_s', detail: 'Obligatoire. Représente le nombre de succès de la population.' },
            numberPop: { name: 'number_pop', detail: 'Obligatoire. Représente la taille de la population.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si l’argument cumulative est VRAI, la fonction LOI.HYPERGEOMETRIQUE.N renvoie la fonction de distribution cumulée ; si l’argument cumulative est FAUX, la fonction renvoie la fonction de probabilité de masse.' },
        },
    },
    INTERCEPT: {
        description: 'Calcule le point auquel une droite doit couper l’axe des ordonnées en utilisant les valeurs x et y existantes. L’ordonnée à l’origine est déterminée en traçant une droite de régression linéaire qui passe par les valeurs x et y connues. Utilisez la fonction ORDONNEE.ORIGINE pour déterminer la valeur de la variable dépendante lorsque la variable indépendante est égale à 0 (zéro). Par exemple, vous pouvez utiliser la fonction ORDONNEE.ORIGINE pour prévoir la résistance électrique d’un métal à 0°C lorsque vos points de données ont été établis à des températures égales et supérieures à la température ambiante.',
        abstract: 'Calcule le point auquel une droite doit couper l’axe des ordonnées en utilisant les valeurs x et y existantes. L’ordonnée à l’origine est déterminée en traçant une droite de régression linéaire qui passe par les valeurs x et y connues. Utilisez la fonction ORDONNEE.ORIGINE pour déterminer la valeur de la variable dépendante lorsque la variable indépendante est égale à 0 (zéro). Par exemple, vous pouvez utiliser la fonction ORDONNEE.ORIGINE pour prévoir la résistance électrique d’un métal à 0°C lorsque vos points de données ont été établis à des températures égales et supérieures à la température ambiante.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obligatoire. Représente la série dépendante d’observations ou de données.' },
            knownXs: { name: 'known_x\'s', detail: 'Obligatoire. Représente la série indépendante d’observations ou de données.' },
        },
    },
    KURT: {
        description: 'Retourne le kurtosis d’un jeu de données. Kurtosis caractérise le pic relatif ou planness d’une distribution par rapport à la distribution normale. Le kurtosis positif indique une distribution relativement maximale. Le kurtosis négatif indique une distribution relativement plate.',
        abstract: 'Retourne le kurtosis d’un jeu de données. Kurtosis caractérise le pic relatif ou planness d’une distribution par rapport à la distribution normale. Le kurtosis positif indique une distribution relativement maximale. Le kurtosis négatif indique une distribution relativement plate.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments dont vous souhaitez calculer le kurtosis. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Il s’agit des 1 à 255 arguments dont vous souhaitez calculer le kurtosis. Vous pouvez aussi utiliser une matrice ou une référence à une matrice, plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    LARGE: {
        description: 'Renvoie la k-ième plus grande valeur d’une série de données. Vous pouvez utiliser cette fonction pour sélectionner une valeur en fonction de son rang. Ainsi, vous pouvez utiliser la fonction GRANDE.VALEUR pour renvoyer le résultat le plus élevé, le deuxième résultat ou le troisième.',
        abstract: 'Renvoie la k-ième plus grande valeur d’une série de données. Vous pouvez utiliser cette fonction pour sélectionner une valeur en fonction de son rang. Ainsi, vous pouvez utiliser la fonction GRANDE.VALEUR pour renvoyer le résultat le plus élevé, le deuxième résultat ou le troisième.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de données dans laquelle vous recherchez la k-ième plus grande valeur.' },
            k: { name: 'k', detail: 'Obligatoire. Représente, dans la matrice ou la plage de cellules, la position de la valeur à renvoyer, déterminée à partir de la valeur la plus grande.' },
        },
    },
    LINEST: {
        description: 'La fonction DROITEREG calcule les statistiques d’une droite par la méthode des moindres carrés afin de calculer une droite s’ajustant au plus près de vos données, puis renvoie une matrice qui décrit cette droite. Vous pouvez également combiner la fonction DROITEREG avec d’autres fonctions pour calculer les statistiques d’autres types de modèles linéaires dans les paramètres inconnus, y compris polynomial, logarithmique, exponentiel et série de puissances. Dans la mesure où cette fonction renvoie une matrice de valeurs, elle doit être tapée sous la forme d’une formule matricielle. Vous trouverez des instructions sous les exemples proposés dans cet article.',
        abstract: 'La fonction DROITEREG calcule les statistiques d’une droite par la méthode des moindres carrés afin de calculer une droite s’ajustant au plus près de vos données, puis renvoie une matrice qui décrit cette droite. Vous pouvez également combiner la fonction DROITEREG avec d’autres fonctions pour calculer les statistiques d’autres types de modèles linéaires dans les paramètres inconnus, y compris polynomial, logarithmique, exponentiel et série de puissances. Dans la mesure où cette fonction renvoie une matrice de valeurs, elle doit être tapée sous la forme d’une formule matricielle. Vous trouverez des instructions sous les exemples proposés dans cet article.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obligatoire. Série des valeurs y déjà connues par la relation y = mx + b. Si la plage de known_y se trouve dans une seule colonne, chaque colonne de known_x est interprétée comme une variable distincte. Si la plage de known_y est contenue dans une seule ligne, chaque ligne de known_x est interprétée comme une variable distincte.' },
            knownXs: { name: 'known_x\'s', detail: 'Optionnel. Série de valeurs x éventuellement déjà connues par la relation y = mx + b. La plage de known_x peut inclure un ou plusieurs ensembles de variables. Si une seule variable est utilisée, les known_y et known_x peuvent être des plages de n’importe quelle forme, tant qu’elles ont des dimensions égales. Si plusieurs variables sont utilisées, known_y doit être un vecteur (autrement dit, une plage avec une hauteur d’une ligne ou une largeur d’une colonne). Si known_x est omis, il est supposé être le tableau {1,2,3,...} qui a la même taille que known_y .' },
            constb: { name: 'const', detail: 'Optionnel. Valeur logique précisant si la constante b doit être forcée à 0. Si const est TRUE ou omis, b est calculé normalement. Si const a la valeur FALSE, b est défini sur 0 et les valeurs m sont ajustées pour ajuster y = mx.' },
            stats: { name: 'stats', detail: 'Optionnel. Représente une valeur logique indiquant si d’autres statistiques de régression doivent être renvoyées. Si les statistiques ont la valeur TRUE, LINEST retourne les statistiques de régression supplémentaires ; par conséquent, le tableau retourné est {mn,mn-1,...,m1,b ; sen,sen-1,...,se1,seb ; r 2,sey ; F,df ; ssreg,ssresid} . Si les statistiques ont la valeur FALSE ou sont omises , LINEST retourne uniquement les coefficients m et la constante b. Les statistiques de régression supplémentaires sont les suivantes :' },
        },
    },
    LOGEST: {
        description: 'L’équation de la courbe est la suivante :',
        abstract: 'L’équation de la courbe est la suivante :',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obligatoire. Représente la série des valeurs y déjà connues dans l’équation y = b*m^x. Si la matrice définie par l’argument y_connus occupe une seule colonne, chaque colonne de l’argument x_connus est interprétée comme étant une variable distincte. Si la matrice définie par l’argument y_connus occupe une seule ligne, chaque ligne de l’argument x_connus est interprétée comme étant une variable distincte.' },
            knownXs: { name: 'known_x\'s', detail: 'Optionnel. Représente une série facultative de valeurs x, éventuellement déjà connues dans la relation y = b*m^x. L’argument x_connus peut contenir une ou plusieurs séries de variables. Si une seule variable est utilisée, y_connus et x_connus peuvent prendre différentes formes, à condition d’avoir la même dimension. Si plusieurs variables sont utilisées, y_connus doit être une plage de cellules dont la hauteur est une seule ligne ou la largeur, une seule colonne (également connu sous le nom de vecteur). Si l’argument x_connus est omis, il est supposé égal à la matrice {1.2.3....}, de même ordre que l’argument y_connus.' },
            constb: { name: 'const', detail: 'Optionnel. Représente une valeur logique précisant si la constante b doit être égale à 1. Si l’argument constante est VRAI ou omis, la constante b est calculée normalement. Si constante est FAUX, b se voit attribuer la valeur 1 et les valeurs m sont ajustées pour que y = m^x.' },
            stats: { name: 'stats', detail: 'Optionnel. Représente une valeur logique indiquant si d’autres statistiques de régression doivent être renvoyées. Si statistiques est VRAI, LOGREG renvoie les statistiques de régression supplémentaires, sous la forme d’une matrice {mn.mn-1.....m1.b;sen.sen-1.....se1.seb;r 2.sey; F.df;ssreg.ssresid}. Si statistiques est FAUX ou omis, LOGREG renvoie uniquement les coefficients m et la constante b.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Renvoie la distribution de x suivant une loi lognormale, où ln(x) est normalement distribué à l’aide des paramètres moyenne et écart_type.',
        abstract: 'Renvoie la distribution de x suivant une loi lognormale, où ln(x) est normalement distribué à l’aide des paramètres moyenne et écart_type.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente l’espérance mathématique de ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de ln(x).' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si l’argument cumulative est VRAI, la fonction LOI.LOGNORMALE.N renvoie la fonction de distribution cumulée ; si l’argument cumulative est FAUX, la fonction renvoie la fonction de densité de probabilité.' },
        },
    },
    LOGNORM_INV: {
        description: 'Renvoie l’inverse de la fonction de distribution de x suivant la loi lognormale cumulée, où ln(x) est normalement distribué avec les paramètres espérance et écart_type. Si p = LOI.LOGNORMALE.N(x,...), alors LOI.LOGNORMALE.INVERSE.N(p,...) = x.',
        abstract: 'Renvoie l’inverse de la fonction de distribution de x suivant la loi lognormale cumulée, où ln(x) est normalement distribué avec les paramètres espérance et écart_type. Si p = LOI.LOGNORMALE.N(x,...), alors LOI.LOGNORMALE.INVERSE.N(p,...) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité associée à la distribution lognormale.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente l’espérance mathématique de ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de ln(x).' },
        },
    },
    MARGINOFERROR: {
        description: 'Cette fonction calcule la marge d\'erreur à partir d\'une plage de valeurs et d\'un niveau de confiance.',
        abstract: 'Cette fonction calcule la marge d\'erreur à partir d\'une plage de valeurs et d\'un niveau de confiance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=fr',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'MARGINOFERROR(A1:C3, 0.99)' },
            confidence: { name: 'confidence', detail: 'Confidence – Niveau de confiance souhaité entre 0 et 1.' },
        },
    },
    MAX: {
        description: 'Renvoie le plus grand nombre de la série de valeurs.',
        abstract: 'Renvoie le plus grand nombre de la série de valeurs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 nombres parmi lesquels vous souhaitez trouver la valeur la plus grande.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 nombres parmi lesquels vous souhaitez trouver la valeur la plus grande.' },
        },
    },
    MAXA: {
        description: 'Renvoie la plus grande valeur contenue dans une liste d’arguments.',
        abstract: 'Renvoie la plus grande valeur contenue dans une liste d’arguments.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Obligatoire. Le premier argument numérique pour lequel vous voulez rechercher la plus grande valeur.' },
            value2: { name: 'value2', detail: 'Optionnel. Représente les arguments numériques 2 à 255 parmi lesquels vous voulez rechercher la plus grande valeur.' },
        },
    },
    MAXIFS: {
        description: 'La fonction MAX.SI.ENS renvoie la valeur maximale parmi les cellules spécifiées par un ensemble de conditions ou critères.',
        abstract: 'La fonction MAX.SI.ENS renvoie la valeur maximale parmi les cellules spécifiées par un ensemble de conditions ou critères.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'La plage de cellules réelle dans laquelle la valeur maximale sera déterminée.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Est l’ensemble des cellules à comparer au critère.' },
            criteria1: { name: 'criteria1', detail: 'Représente le critère sous la forme d’un nombre, d’une expression ou d’un texte qui définit quelles cellules seront évaluées comme valeur maximale. Le même jeu de critères est valable pour les fonctions MIN.SI.ENS , SOMME.SI.ENS et MOYENNE.SI.ENS .' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Plages supplémentaires et leurs critères associés. Vous pouvez entrer jusqu’à 126 paires plage/critères.' },
            criteria2: { name: 'criteria2', detail: 'Plages supplémentaires et leurs critères associés. Vous pouvez entrer jusqu’à 126 paires plage/critères.' },
        },
    },
    MEDIAN: {
        description: 'Renvoie la valeur médiane des nombres. La médiane est la valeur qui se trouve au centre d’un ensemble de nombres.',
        abstract: 'Renvoie la valeur médiane des nombres. La médiane est la valeur qui se trouve au centre d’un ensemble de nombres.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 nombres dont vous souhaitez obtenir la médiane.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 nombres dont vous souhaitez obtenir la médiane.' },
        },
    },
    MIN: {
        description: 'Renvoie le plus petit nombre de la série de valeurs.',
        abstract: 'Renvoie le plus petit nombre de la série de valeurs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est facultatif, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 nombres parmi lesquels vous souhaitez trouver la valeur minimale.' },
            number2: { name: 'number2', detail: 'Number1 est facultatif, les numéros suivants sont facultatifs. Ils représentent les 1 à 255 nombres parmi lesquels vous souhaitez trouver la valeur minimale.' },
        },
    },
    MINA: {
        description: 'Renvoie la plus petite valeur contenue dans une liste d’arguments.',
        abstract: 'Renvoie la plus petite valeur contenue dans une liste d’arguments.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 255 des valeurs parmi lesquelles vous voulez rechercher la plus petite.' },
            value2: { name: 'value2', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 255 des valeurs parmi lesquelles vous voulez rechercher la plus petite.' },
        },
    },
    MINIFS: {
        description: 'La fonction MIN.SI.ENS renvoie la valeur minimale parmi les cellules spécifiées par un ensemble de conditions ou critères.',
        abstract: 'La fonction MIN.SI.ENS renvoie la valeur minimale parmi les cellules spécifiées par un ensemble de conditions ou critères.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: 'La plage de cellules réelle dans laquelle la valeur minimale sera déterminée.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Est l’ensemble des cellules à comparer au critère.' },
            criteria1: { name: 'criteria1', detail: 'Représente le critère sous la forme d’un nombre, d’une expression ou d’un texte qui définit quelles cellules seront évaluées comme valeur minimale. Le même jeu de critères est valable pour les fonctions MAX.SI.ENS , SOMME.SI.ENS et MOYENNE.SI.ENS .' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Plages supplémentaires et leurs critères associés. Vous pouvez entrer jusqu’à 126 paires plage/critères.' },
            criteria2: { name: 'criteria2', detail: 'Plages supplémentaires et leurs critères associés. Vous pouvez entrer jusqu’à 126 paires plage/critères.' },
        },
    },
    MODE_MULT: {
        description: 'En présence de plusieurs modes, plusieurs résultats seront renvoyés. Dans la mesure où cette fonction renvoie une matrice de valeurs, elle doit être tapée sous la forme d’une formule matricielle.',
        abstract: 'En présence de plusieurs modes, plusieurs résultats seront renvoyés. Dans la mesure où cette fonction renvoie une matrice de valeurs, elle doit être tapée sous la forme d’une formule matricielle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Représente le premier argument numérique pour lequel vous souhaitez calculer le mode.' },
            number2: { name: 'number2', detail: 'Optionnel. Représente les arguments numériques 2 à 254 dont vous souhaitez déterminer le mode. Vous pouvez également utiliser une matrice unique ou une référence à une matrice, au lieu d’arguments séparés par des points-virgules.' },
        },
    },
    MODE_SNGL: {
        description: 'Renvoie la valeur la plus fréquente ou la plus répétitive dans une matrice ou une plage de données.',
        abstract: 'Renvoie la valeur la plus fréquente ou la plus répétitive dans une matrice ou une plage de données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Représente le premier argument pour lequel vous souhaitez calculer le mode.' },
            number2: { name: 'number2', detail: 'Optionnel. Représente les arguments 2 à 254 dont vous souhaitez déterminer le mode. Vous pouvez également utiliser une matrice unique ou une référence à une matrice, au lieu d’arguments séparés par des points-virgules.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire discrète suivant une loi binomiale négative, la probabilité d’obtenir un nombre d’échecs égal à l’argument nombre_échecs avant de parvenir au succès dont le rang est donné par l’argument nombre_succès, avec la probabilité probabilité_succès d’un succès.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire discrète suivant une loi binomiale négative, la probabilité d’obtenir un nombre d’échecs égal à l’argument nombre_échecs avant de parvenir au succès dont le rang est donné par l’argument nombre_succès, avec la probabilité probabilité_succès d’un succès.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Obligatoire. Représente le nombre d’échecs.' },
            numberS: { name: 'number_s', detail: 'Obligatoire. Représente le nombre de succès à obtenir.' },
            probabilityS: { name: 'probability_s', detail: 'Obligatoire. Représente la probabilité d’obtenir un succès.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si l’argument cumulative est VRAI, la fonction LOI.BINOMIALE.NEG.N renvoie la fonction de distribution cumulée ; si l’argument cumulative est FAUX, la fonction renvoie la fonction de densité de probabilité.' },
        },
    },
    NORM_DIST: {
        description: 'Renvoie la distribution normale pour la moyenne et l’écart type spécifiés. Cette fonction a de nombreuses applications en statistique, y compris dans les tests d’hypothèse.',
        abstract: 'Renvoie la distribution normale pour la moyenne et l’écart type spécifiés. Cette fonction a de nombreuses applications en statistique, y compris dans les tests d’hypothèse.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur dont vous recherchez la distribution.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente la moyenne arithmétique de la distribution.' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de la distribution.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si cumulative a la valeur TRUE, NORM. DIST retourne la fonction de distribution cumulée ; si la valeur est FALSE, elle retourne la fonction de densité de probabilité.' },
        },
    },
    NORM_INV: {
        description: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale pour la moyenne et l’écart type spécifiés.',
        abstract: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale pour la moyenne et l’écart type spécifiés.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité correspondant à la distribution normale.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente la moyenne arithmétique de la distribution.' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de la distribution.' },
        },
    },
    NORM_S_DIST: {
        description: 'Renvoie la distribution normale cumulative standard.',
        abstract: 'Renvoie la distribution normale cumulative standard.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Valeur dont vous souhaitez obtenir la distribution.' },
            cumulative: { name: 'cumulative', detail: 'Valeur logique qui détermine la forme de la fonction. Si cumulative vaut TRUE, NORM.DIST renvoie la fonction de distribution cumulée ; sinon, la fonction de densité de probabilité.' },
        },
    },
    NORM_S_INV: {
        description: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale standard (ou centrée réduite). Cette distribution a une moyenne égale à zéro et un écart type égal à 1.',
        abstract: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale standard (ou centrée réduite). Cette distribution a une moyenne égale à zéro et un écart type égal à 1.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité correspondant à la distribution normale.' },
        },
    },
    PEARSON: {
        description: 'Renvoie le coefficient de corrélation d’échantillonnage de Pearson r, un indice dont la valeur varie entre -1,0 et 1,0 inclus qui reflète le degré de linéarité entre deux séries de données.',
        abstract: 'Renvoie le coefficient de corrélation d’échantillonnage de Pearson r, un indice dont la valeur varie entre -1,0 et 1,0 inclus qui reflète le degré de linéarité entre deux séries de données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obligatoire. Représente un jeu de valeurs indépendantes.' },
            array2: { name: 'array2', detail: 'Obligatoire. Représente un jeu de valeurs dépendantes.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'CENTILE. La fonction EXC retourne le k-ième centile des valeurs d’une plage, où k est dans la plage 0..1, exclusive.',
        abstract: 'CENTILE. La fonction EXC retourne le k-ième centile des valeurs d’une plage, où k est dans la plage 0..1, exclusive.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de données définissant l’étendue relative.' },
            k: { name: 'k', detail: 'Obligatoire. Valeur de centile dans la plage 0 < k < 1.' },
        },
    },
    PERCENTILE_INC: {
        description: 'Retourne le k-ième centile des valeurs d’une plage, où k est compris dans la plage comprise entre 0 et 1.',
        abstract: 'Retourne le k-ième centile des valeurs d’une plage, où k est compris dans la plage comprise entre 0 et 1.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de données définissant l’étendue relative.' },
            k: { name: 'k', detail: 'Obligatoire. Valeur de centile comprise entre 0 et 1, inclus.' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Renvoie le rang d’une valeur d’un jeu de données sous forme de pourcentage (0..1, exclus).',
        abstract: 'Renvoie le rang d’une valeur d’un jeu de données sous forme de pourcentage (0..1, exclus).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de données de valeurs numériques définissant l’étendue relative.' },
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur dont vous voulez connaître le rang.' },
            significance: { name: 'significance', detail: 'Optionnel. Représente une valeur indiquant le nombre de décimales du pourcentage renvoyé. Si cet argument est omis, la fonction RANG.POURCENTAGE.EXCLURE conserve trois décimales (0,xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Renvoie le rang d’une valeur d’un jeu de données sous forme de pourcentage (0..1, inclus).',
        abstract: 'Renvoie le rang d’une valeur d’un jeu de données sous forme de pourcentage (0..1, inclus).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de données de valeurs numériques définissant l’étendue relative.' },
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur dont vous voulez connaître le rang.' },
            significance: { name: 'significance', detail: 'Optionnel. Représente une valeur indiquant le nombre de décimales du pourcentage renvoyé. Si cet argument est omis, la fonction RANG.POURCENTAGE.INCLURE conserve trois décimales (0,xxx).' },
        },
    },
    PERMUT: {
        description: 'Renvoie le nombre de permutations pour un nombre donné d’objets pouvant être sélectionnés à partir d’un nombre d’objets déterminé par l’argument nombre. Une permutation est un ensemble ou un sous-ensemble d’objets ou d’événements ordonnés de façon précise et significative. En cela, les permutations diffèrent des combinaisons pour lesquelles l’ordre des éléments n’est pas significatif. Utilisez cette fonction dans les calculs de probabilité de type loterie.',
        abstract: 'Renvoie le nombre de permutations pour un nombre donné d’objets pouvant être sélectionnés à partir d’un nombre d’objets déterminé par l’argument nombre. Une permutation est un ensemble ou un sous-ensemble d’objets ou d’événements ordonnés de façon précise et significative. En cela, les permutations diffèrent des combinaisons pour lesquelles l’ordre des éléments n’est pas significatif. Utilisez cette fonction dans les calculs de probabilité de type loterie.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente un nombre entier correspondant au nombre d’objets.' },
            numberChosen: { name: 'number_chosen', detail: 'Obligatoire. Représente un nombre entier correspondant au nombre d’objets dans chaque permutation.' },
        },
    },
    PERMUTATIONA: {
        description: 'Renvoie le nombre de permutations pour un nombre d’objets donné (avec répétitions) pouvant être sélectionnés à partir du nombre total d’objets.',
        abstract: 'Renvoie le nombre de permutations pour un nombre d’objets donné (avec répétitions) pouvant être sélectionnés à partir du nombre total d’objets.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Nombre entier correspondant au nombre total d’objets.' },
            numberChosen: { name: 'number_chosen', detail: 'Obligatoire. Nombre entier correspondant au nombre d’objets dans chaque permutation.' },
        },
    },
    PHI: {
        description: 'Renvoie la valeur de la fonction de densité pour une distribution normale standard.',
        abstract: 'Renvoie la valeur de la fonction de densité pour une distribution normale standard.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. X est le nombre pour lequel vous souhaitez obtenir la densité pour une distribution normale standard.' },
        },
    },
    POISSON_DIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire suivant une loi de Poisson. Une application courante de la loi de Poisson est la prédiction du nombre d’événements susceptibles de se produire sur une période de temps déterminée, par exemple, le nombre de voitures qui se présentent à un poste de péage en l’espace d’une minute.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire suivant une loi de Poisson. Une application courante de la loi de Poisson est la prédiction du nombre d’événements susceptibles de se produire sur une période de temps déterminée, par exemple, le nombre de voitures qui se présentent à un poste de péage en l’espace d’une minute.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente le nombre d’événements.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente la valeur numérique attendue.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Valeur logique qui détermine la forme de la distribution de probabilité retournée. Si cumulative a la valeur TRUE, POISSON. DIST retourne la probabilité cumulée de Poisson que le nombre d’événements aléatoires se produisant soit compris entre zéro et x inclus ; si la valeur est FALSE, elle renvoie la fonction de masse de probabilité de Poisson qui indique que le nombre d’événements qui se produisent sera exactement x.' },
        },
    },
    PROB: {
        description: 'Renvoie la probabilité que des valeurs d’une plage soient comprises entre deux limites. Si l’argument limite_sup n’est pas fourni, la fonction renvoie la probabilité que les valeurs de l’argument plage_x soient égales à limite_inf.',
        abstract: 'Renvoie la probabilité que des valeurs d’une plage soient comprises entre deux limites. Si l’argument limite_sup n’est pas fourni, la fonction renvoie la probabilité que les valeurs de l’argument plage_x soient égales à limite_inf.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: 'Obligatoire. Représente la plage des valeurs numériques de x auxquelles sont associées des probabilités.' },
            probRange: { name: 'prob_range', detail: 'Obligatoire. Représente une série de probabilités associée aux valeurs de plage_x.' },
            lowerLimit: { name: 'lower_limit', detail: 'Optionnel. Représente la limite inférieure de la valeur pour laquelle vous recherchez une probabilité.' },
            upperLimit: { name: 'upper_limit', detail: 'Optionnel. Représente la limite supérieure facultative de la valeur pour laquelle vous recherchez une probabilité.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Retourne le quartile du jeu de données, basé sur des valeurs de centile comprises entre 0 et 1, exclusif.',
        abstract: 'Retourne le quartile du jeu de données, basé sur des valeurs de centile comprises entre 0 et 1, exclusif.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de cellules de valeurs numériques pour laquelle vous recherchez la valeur du quartile.' },
            quart: { name: 'quart', detail: 'Obligatoire. Indique quelle valeur renvoyer.' },
        },
    },
    QUARTILE_INC: {
        description: 'Les quartiles sont souvent utilisés pour les données relatives aux ventes et aux enquêtes afin de séparer les populations en groupes. Ainsi, vous pouvez utiliser la fonction QUARTILE.INCLURE pour déterminer les vingt-cinq pour cent de revenus les plus élevés d’une population.',
        abstract: 'Les quartiles sont souvent utilisés pour les données relatives aux ventes et aux enquêtes afin de séparer les populations en groupes. Ainsi, vous pouvez utiliser la fonction QUARTILE.INCLURE pour déterminer les vingt-cinq pour cent de revenus les plus élevés d’une population.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de cellules de valeurs numériques pour laquelle vous recherchez la valeur du quartile.' },
            quart: { name: 'quart', detail: 'Obligatoire. Indique quelle valeur renvoyer.' },
        },
    },
    RANK_AVG: {
        description: 'Retourne le rang d’un nombre dans une liste de nombres : sa taille par rapport aux autres valeurs de la liste. Si plusieurs valeurs ont le même rang, le classement moyen est retourné.',
        abstract: 'Retourne le rang d’un nombre dans une liste de nombres : sa taille par rapport aux autres valeurs de la liste. Si plusieurs valeurs ont le même rang, le classement moyen est retourné.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre dont vous voulez connaître le rang.' },
            ref: { name: 'ref', detail: 'Obligatoire. Représente une matrice ou une référence à une liste de nombres. Les valeurs non numériques dans référence sont ignorées.' },
            order: { name: 'order', detail: 'Optionnel. Représente un numéro qui spécifie comment déterminer le rang de l’argument nombre.' },
        },
    },
    RANK_EQ: {
        description: 'Renvoie le rang d’un nombre dans une liste de nombres. Sa taille est exprimée par rapport aux autres valeurs de la liste ; si deux valeurs, ou plus, possèdent le même rang, le rang supérieur de cet ensemble de valeurs est renvoyé.',
        abstract: 'Renvoie le rang d’un nombre dans une liste de nombres. Sa taille est exprimée par rapport aux autres valeurs de la liste ; si deux valeurs, ou plus, possèdent le même rang, le rang supérieur de cet ensemble de valeurs est renvoyé.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre dont vous voulez connaître le rang.' },
            ref: { name: 'ref', detail: 'Obligatoire. Représente une matrice ou une référence à une liste de nombres. Les valeurs non numériques dans référence sont ignorées.' },
            order: { name: 'order', detail: 'Optionnel. Représente un numéro qui spécifie comment déterminer le rang de l’argument nombre.' },
        },
    },
    RSQ: {
        description: 'Renvoie la valeur du coefficient de détermination R^2 d’une régression linéaire ajustée aux observations contenues dans les arguments y_connus et x_connus. Pour plus d’informations, voir la Fonction PEARSON . Le coefficient de détermination peut être interprété comme la proportion de la variance de y imputable à la variance de x.',
        abstract: 'Renvoie la valeur du coefficient de détermination R^2 d’une régression linéaire ajustée aux observations contenues dans les arguments y_connus et x_connus. Pour plus d’informations, voir la Fonction PEARSON . Le coefficient de détermination peut être interprété comme la proportion de la variance de y imputable à la variance de x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obligatoire. Représente une matrice ou une plage de cellules d’observations dépendantes.' },
            knownXs: { name: 'known_x\'s', detail: 'Obligatoire. Représente l’ensemble des observations indépendantes.' },
        },
    },
    SKEW: {
        description: 'Renvoie l’asymétrie d’une distribution. Cette fonction caractérise le degré d’asymétrie d’une distribution par rapport à sa moyenne. Une asymétrie positive indique une distribution unilatérale décalée vers les valeurs les plus positives. Une asymétrie négative indique une distribution unilatérale décalée vers les valeurs les plus négatives.',
        abstract: 'Renvoie l’asymétrie d’une distribution. Cette fonction caractérise le degré d’asymétrie d’une distribution par rapport à sa moyenne. Une asymétrie positive indique une distribution unilatérale décalée vers les valeurs les plus positives. Une asymétrie négative indique une distribution unilatérale décalée vers les valeurs les plus négatives.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Représentent les 1 à 255 arguments dont vous souhaitez déterminer l’asymétrie. Vous pouvez également utiliser une matrice unique ou une référence à une matrice, au lieu d’arguments séparés par des points-virgules.' },
            number2: { name: 'number2', detail: 'Number1 est obligatoire, les numéros suivants sont facultatifs. Représentent les 1 à 255 arguments dont vous souhaitez déterminer l’asymétrie. Vous pouvez également utiliser une matrice unique ou une référence à une matrice, au lieu d’arguments séparés par des points-virgules.' },
        },
    },
    SKEW_P: {
        description: 'Renvoie l’asymétrie d’une distribution en fonction d’une population : la caractérisation du degré d’asymétrie d’une distribution par rapport à sa moyenne.',
        abstract: 'Renvoie l’asymétrie d’une distribution en fonction d’une population : la caractérisation du degré d’asymétrie d’une distribution par rapport à sa moyenne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Premier nombre, référence de cellule ou plage dont vous souhaitez obtenir l’asymétrie.' },
            number2: { name: 'number2', detail: 'Nombres, références de cellules ou plages supplémentaires dont vous souhaitez obtenir l’asymétrie, jusqu’à 255 au maximum.' },
        },
    },
    SLOPE: {
        description: 'Renvoie la pente d’une droite de régression linéaire à l’aide de données sur les points d’abscisse et d’ordonnée connus. La pente est la distance verticale divisée par la distance horizontale séparant deux points d’une ligne ; elle exprime le taux de changement le long de la droite de régression.',
        abstract: 'Renvoie la pente d’une droite de régression linéaire à l’aide de données sur les points d’abscisse et d’ordonnée connus. La pente est la distance verticale divisée par la distance horizontale séparant deux points d’une ligne ; elle exprime le taux de changement le long de la droite de régression.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obligatoire. Représente une matrice ou une plage de cellules d’observations dépendantes.' },
            knownXs: { name: 'known_x\'s', detail: 'Obligatoire. Représente l’ensemble des observations indépendantes.' },
        },
    },
    SMALL: {
        description: 'Renvoie la k-ième plus petite valeur d’une série de données. Utilisez cette fonction pour renvoyer des valeurs avec une position relative particulière à l’intérieur d’une série de données.',
        abstract: 'Renvoie la k-ième plus petite valeur d’une série de données. Utilisez cette fonction pour renvoyer des valeurs avec une position relative particulière à l’intérieur d’une série de données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente une matrice ou une plage de données numériques dans laquelle vous recherchez la k-ième plus petite valeur.' },
            k: { name: 'k', detail: 'Obligatoire. Représente, dans la matrice ou la plage, le rang de la donnée à renvoyer, déterminé à partir de la valeur la plus petite.' },
        },
    },
    STANDARDIZE: {
        description: 'Renvoie une valeur centrée réduite d’une distribution caractérisée par les arguments moyenne et écart_type.',
        abstract: 'Renvoie une valeur centrée réduite d’une distribution caractérisée par les arguments moyenne et écart_type.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur à centrer et à réduire.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente la moyenne arithmétique de la distribution.' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de la distribution.' },
        },
    },
    STDEV_P: {
        description: 'L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        abstract: 'L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à une population.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 254 correspondant à une population entière. Vous pouvez aussi utiliser une matrice ou une référence à une matrice plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    STDEV_S: {
        description: 'L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        abstract: 'L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à un échantillon de population. Vous pouvez aussi utiliser une matrice ou une référence à une matrice plutôt que des arguments séparés par des points-virgules.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 254 correspondant à un échantillon de population. Vous pouvez aussi utiliser une matrice ou une référence à une matrice plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    STDEVA: {
        description: 'Estime l’écart type à partir d’un échantillon, y compris les nombres, le texte et les valeurs logiques.',
        abstract: 'Estime l’écart type à partir d’un échantillon, y compris les nombres, le texte et les valeurs logiques.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Premier argument de valeur correspondant à un échantillon d’une population. Vous pouvez aussi utiliser un seul tableau ou une référence à un tableau au lieu d’arguments séparés par des virgules.' },
            value2: { name: 'value2', detail: 'Arguments de valeur 2 à 254 correspondant à un échantillon d’une population. Vous pouvez aussi utiliser un seul tableau ou une référence à un tableau au lieu d’arguments séparés par des virgules.' },
        },
    },
    STDEVPA: {
        description: 'Calcule l’écart type d’une population en prenant en compte toute la population et en utilisant les arguments spécifiés, y compris le texte et les valeurs logiques. L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        abstract: 'Calcule l’écart type d’une population en prenant en compte toute la population et en utilisant les arguments spécifiés, y compris le texte et les valeurs logiques. L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Représentent 1 à 255 valeurs correspondant à une population. Vous pouvez aussi utiliser une matrice ou une référence à une matrice plutôt que des arguments séparés par des points-virgules.' },
            value2: { name: 'value2', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Représentent 1 à 255 valeurs correspondant à une population. Vous pouvez aussi utiliser une matrice ou une référence à une matrice plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    STEYX: {
        description: 'Renvoie l’erreur-type de la valeur y prévue pour chaque x de la régression. L’erreur type est une mesure du degré d’erreur dans la prévision de y à partir d’une valeur individuelle x.',
        abstract: 'Renvoie l’erreur-type de la valeur y prévue pour chaque x de la régression. L’erreur type est une mesure du degré d’erreur dans la prévision de y à partir d’une valeur individuelle x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obligatoire. Représente une matrice ou une plage d’observations dépendantes.' },
            knownXs: { name: 'known_x\'s', detail: 'Obligatoire. Représente une matrice ou une plage d’observations indépendantes.' },
        },
    },
    T_DIST: {
        description: 'Renvoie la probabilité de la distribution t de Student.',
        abstract: 'Renvoie la probabilité de la distribution t de Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Valeur numérique à laquelle évaluer la distribution.' },
            degFreedom: { name: 'degFreedom', detail: 'Entier indiquant le nombre de degrés de liberté.' },
            cumulative: { name: 'cumulative', detail: 'Valeur logique qui détermine la forme de la fonction. Si cumulative vaut TRUE, T.DIST renvoie la fonction de distribution cumulée ; sinon, la fonction de densité de probabilité.' },
        },
    },
    T_DIST_2T: {
        description: 'Renvoie la probabilité de la distribution t de Student bilatérale.',
        abstract: 'Renvoie la probabilité de la distribution t de Student bilatérale.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Valeur numérique à laquelle évaluer la distribution.' },
            degFreedom: { name: 'degFreedom', detail: 'Entier indiquant le nombre de degrés de liberté.' },
        },
    },
    T_DIST_RT: {
        description: 'Renvoie la probabilité de la distribution t de Student unilatérale à droite.',
        abstract: 'Renvoie la probabilité de la distribution t de Student unilatérale à droite.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur numérique à laquelle la distribution doit être évaluée.' },
            degFreedom: { name: 'degFreedom', detail: 'Obligatoire. Représente un nombre entier indiquant le nombre de degrés de liberté.' },
        },
    },
    T_INV: {
        description: 'Renvoie l’inverse de la probabilité de la distribution t de Student.',
        abstract: 'Renvoie l’inverse de la probabilité de la distribution t de Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente la probabilité associée à la loi T de Student.' },
            degFreedom: { name: 'degFreedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté utilisés pour caractériser la distribution.' },
        },
    },
    T_INV_2T: {
        description: 'Renvoie l’inverse de la probabilité de la distribution t de Student bilatérale.',
        abstract: 'Renvoie l’inverse de la probabilité de la distribution t de Student bilatérale.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente la probabilité associée à la loi T de Student.' },
            degFreedom: { name: 'degFreedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté utilisés pour caractériser la distribution.' },
        },
    },
    T_TEST: {
        description: 'Renvoie la probabilité associée à un test t de Student.',
        abstract: 'Renvoie la probabilité associée à un test t de Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obligatoire. Représente la première série de données.' },
            array2: { name: 'array2', detail: 'Obligatoire. Représente la seconde série de données.' },
            tails: { name: 'tails', detail: 'Obligatoire. Indique le type de distribution à renvoyer : unilatérale ou bilatérale. Si uni/bilatéral = 1, T.TEST utilise la distribution unilatérale; si uni/bilatéral = 2, il utilise la distribution bilatérale.' },
            type: { name: 'type', detail: 'Obligatoire. Représente le type de test T à effectuer.' },
        },
    },
    TREND: {
        description: 'La fonction TREND retourne des valeurs le long d’une tendance linéaire. Il ajuste une ligne droite (à l’aide de la méthode des moindres carrés) aux known_y et known_x du tableau. TREND retourne les valeurs y le long de cette ligne pour le tableau de new_x que vous spécifiez.',
        abstract: 'La fonction TREND retourne des valeurs le long d’une tendance linéaire. Il ajuste une ligne droite (à l’aide de la méthode des moindres carrés) aux known_y et known_x du tableau. TREND retourne les valeurs y le long de cette ligne pour le tableau de new_x que vous spécifiez.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Ensemble de valeurs y que vous connaissez déjà dans la relation y = mx + b Si la matrice définie par l’argument y_connus occupe une seule colonne, chaque colonne de l’argument x_connus est interprétée comme étant une variable distincte. Si la matrice définie par l’argument y_connus occupe une seule ligne, chaque ligne de l’argument x_connus est interprétée comme étant une variable distincte.' },
            knownXs: { name: 'known_x\'s', detail: 'Ensemble facultatif de valeurs x que vous connaissez peut-être déjà dans la relation y = mx + b L’argument x_connus peut contenir une ou plusieurs séries de variables. Si vous utilisez une seule variable, les arguments y_connus et x_connus peuvent être des plages de forme différente, à condition qu’elles aient la même dimension. Si vous utilisez plusieurs variables, l’argument y_connus doit être un vecteur (en d’autres termes, une plage comportant une seule ligne ou une seule colonne). Si l’argument x_connus est omis, il est supposé égal à la matrice {1.2.3....}, de même ordre que l’argument y_connus.' },
            newXs: { name: 'new_x\'s', detail: 'Nouvelles valeurs x pour lesquelles vous souhaitez que TREND retourne les valeurs y correspondantes L’argument x_nouveaux doit comporter une colonne (ou une ligne) pour chaque variable indépendante, comme c’est le cas pour l’argument x_connus. Par conséquent, si l’argument y_connus occupe une seule colonne, les arguments x_connus et x_nouveaux doivent avoir le même nombre de colonnes. Si l’argument y_connus occupe une seule ligne, les arguments x_connus et x_nouveaux doivent avoir le même nombre de lignes. Si l’argument x_nouveaux est omis, l’argument par défaut est l’argument x_connus. Si les deux arguments x_connus et x_nouveaux sont omis, les matrices par défaut sont la matrice {1.2.3....}, de même ordre que l’argument y_connus.' },
            constb: { name: 'const', detail: 'Valeur logique spécifiant s’il faut forcer la constante b à être égale à 0 Si l’argument constante est VRAI ou omis, la constante b est calculée normalement. Si l’argument constante est FAUX, b est égal à 0 (zéro) et les valeurs m sont ajustées de façon à ce que y = mx.' },
        },
    },
    TRIMMEAN: {
        description: 'Renvoie la moyenne de l’intérieur d’une série de données. La fonction MOYENNE.REDUITE calcule la moyenne d’une série de données après avoir éliminé un pourcentage d’observations aux extrémités inférieure et supérieure de la distribution. Vous pouvez utiliser cette fonction lorsque vous voulez exclure de votre analyse les observations extrêmes.',
        abstract: 'Renvoie la moyenne de l’intérieur d’une série de données. La fonction MOYENNE.REDUITE calcule la moyenne d’une série de données après avoir éliminé un pourcentage d’observations aux extrémités inférieure et supérieure de la distribution. Vous pouvez utiliser cette fonction lorsque vous voulez exclure de votre analyse les observations extrêmes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de valeurs à réduire et sur laquelle calculer la moyenne.' },
            percent: { name: 'percent', detail: 'Obligatoire. Représente le nombre fractionnaire d’observations à exclure du calcul. Par exemple, si l’argument pourcentage est égal à 0,2 et que la série de données contient 20 observations, 4 d’entre elles seront éliminées (20 x 0,2), 2 au début et 2 à la fin de la série.' },
        },
    },
    VAR_P: {
        description: 'Calcule la variance d’après la population entière, en ignorant les valeurs logiques et le texte de la population.',
        abstract: 'Calcule la variance d’après la population entière.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à une population.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 254 correspondant à une population entière.' },
        },
    },
    VAR_S: {
        description: 'Estime la variance à partir d’un échantillon, en ignorant les valeurs logiques et le texte de l’échantillon.',
        abstract: 'Estime la variance à partir d’un échantillon.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à un échantillon de population.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 254 correspondant à un échantillon de population.' },
        },
    },
    VARA: {
        description: 'Calcule la variance sur la base d’un échantillon.',
        abstract: 'Calcule la variance sur la base d’un échantillon.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Représentent les 1 à 255 arguments de valeurs correspondant à l’échantillon de la population.' },
            value2: { name: 'value2', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Représentent les 1 à 255 arguments de valeurs correspondant à l’échantillon de la population.' },
        },
    },
    VARPA: {
        description: 'Calcule la variance sur la base de l’ensemble de la population.',
        abstract: 'Calcule la variance sur la base de l’ensemble de la population.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Représentent les 1 à 255 arguments de valeurs correspondant à une population.' },
            value2: { name: 'value2', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Représentent les 1 à 255 arguments de valeurs correspondant à une population.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Weibull. Utilisez cette distribution dans une analyse de fiabilité telle que le calcul du temps moyen de fonctionnement sans panne d’un appareil.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Weibull. Utilisez cette distribution dans une analyse de fiabilité telle que le calcul du temps moyen de fonctionnement sans panne d’un appareil.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Détermine la forme de la fonction.' },
        },
    },
    Z_TEST: {
        description: 'Pour plus d’informations sur l’utilisation de Z.TEST dans une formule pour calculer une valeur de probabilité bilatérale, voir la section « Notes » ci-dessous.',
        abstract: 'Pour plus d’informations sur l’utilisation de Z.TEST dans une formule pour calculer une valeur de probabilité bilatérale, voir la section « Notes » ci-dessous.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de données par rapport à laquelle tester x.' },
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur à tester.' },
            sigma: { name: 'sigma', detail: 'Optionnel. Représente l’écart type (connu) de la population. Si l’argument est omis, la valeur de l’argument par défaut est l’écart type de l’échantillon.' },
        },
    },
};

export default locale;
