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
    BETADIST: {
        description: 'Renvoie la fonction de densité de distribution de la probabilité suivant une loi bêta cumulée. Cette fonction de distribution bêta est généralement utilisée pour étudier la variation du pourcentage d’un élément présent dans des échantillonnages, par exemple, la durée quotidienne pendant laquelle les gens regardent la télévision.',
        abstract: 'Renvoie la fonction de densité de distribution de la probabilité suivant une loi bêta cumulée. Cette fonction de distribution bêta est généralement utilisée pour étudier la variation du pourcentage d’un élément présent dans des échantillonnages, par exemple, la durée quotidienne pendant laquelle les gens regardent la télévision.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur comprise entre A et B à laquelle la fonction doit être calculée.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            A: { name: 'A', detail: 'Représente une limite inférieure de l’intervalle des x.' },
            B: { name: 'B', detail: 'Facultatif. Représente une limite supérieure de l’intervalle des x.' },
        },
    },
    BETAINV: {
        description: 'Renvoie l’inverse de la fonction de densité de distribution de la probabilité suivant une loi bêta cumulée. Si probabilité = LOI.BETA(x,...), alors BETA.INVERSE(probabilité,...) = x. La distribution bêta peut être utilisée en planification de projets afin de prévoir les dates d’achèvement probables en fonction d’une durée et d’une dispersion prévues.',
        abstract: 'Renvoie l’inverse de la fonction de densité de distribution de la probabilité suivant une loi bêta cumulée. Si probabilité = LOI.BETA(x,...), alors BETA.INVERSE(probabilité,...) = x. La distribution bêta peut être utilisée en planification de projets afin de prévoir les dates d’achèvement probables en fonction d’une durée et d’une dispersion prévues.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/betainv-function',
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
    BINOMDIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire discrète suivant la loi binomiale. Utilisez la fonction LOI.BINOMIALE pour résoudre des problèmes comportant un nombre de tests ou d’essais déterminé, lorsque le résultat des essais ne peut être qu’un succès ou un échec, lorsque les essais sont indépendants ou lorsque la probabilité de succès est constante au cours des expérimentations. La fonction LOI.BINOMIALE peut, par exemple, calculer la probabilité pour que deux des trois enfants à naître soient des garçons.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire discrète suivant la loi binomiale. Utilisez la fonction LOI.BINOMIALE pour résoudre des problèmes comportant un nombre de tests ou d’essais déterminé, lorsque le résultat des essais ne peut être qu’un succès ou un échec, lorsque les essais sont indépendants ou lorsque la probabilité de succès est constante au cours des expérimentations. La fonction LOI.BINOMIALE peut, par exemple, calculer la probabilité pour que deux des trois enfants à naître soient des garçons.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Obligatoire. Représente le nombre d’essais réussis.' },
            trials: { name: 'trials', detail: 'Obligatoire. Représente le nombre d’essais indépendants.' },
            probabilityS: { name: 'probability_s', detail: 'Obligatoire. Représente la probabilité de succès de chaque essai.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique qui détermine le mode de calcul de la fonction. Si l’argument cumulative a la valeur VRAI, alors LOI.BINOMIALE renvoie la fonction de distribution cumulée qui représente la probabilité qu’il y ait au plus nombre_s succès ; si l’argument cumulative a la valeur FAUX, LOI.BINOMIALE renvoie la fonction de probabilité de masse qui représente la probabilité qu’il y ait nombre_s succès.' },
        },
    },
    CHIDIST: {
        description: 'Renvoie la probabilité unilatérale à droite de la distribution khi-deux. La distribution χ2 est associée à un test χ2. Utilisez un test χ2 pour comparer les valeurs obtenues aux valeurs prévues. Par exemple, une expérience génétique fait l’hypothèse que la prochaine génération de plantes présentera un ensemble de couleurs donné. En comparant les résultats obtenus aux résultats prévus, vous pouvez déterminer si votre hypothèse de départ était correcte.',
        abstract: 'Renvoie la probabilité unilatérale à droite de la distribution khi-deux. La distribution χ2 est associée à un test χ2. Utilisez un test χ2 pour comparer les valeurs obtenues aux valeurs prévues. Par exemple, une expérience génétique fait l’hypothèse que la prochaine génération de plantes présentera un ensemble de couleurs donné. En comparant les résultats obtenus aux résultats prévus, vous pouvez déterminer si votre hypothèse de départ était correcte.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur à laquelle vous voulez évaluer la distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté.' },
        },
    },
    CHIINV: {
        description: 'Renvoie l’inverse de la probabilité unilatérale à droite de la distribution khi-deux. Si probabilité = LOI.KHIDEUX(x,...), alors KHIDEUX.INVERSE(probabilité,...) = x. Utilisez cette fonction pour comparer les résultats obtenus aux résultats prévus, afin de déterminer si votre hypothèse de départ était juste.',
        abstract: 'Renvoie l’inverse de la probabilité unilatérale à droite de la distribution khi-deux. Si probabilité = LOI.KHIDEUX(x,...), alors KHIDEUX.INVERSE(probabilité,...) = x. Utilisez cette fonction pour comparer les résultats obtenus aux résultats prévus, afin de déterminer si votre hypothèse de départ était juste.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité associée à la distribution khi-deux.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté.' },
        },
    },
    CHITEST: {
        description: 'Renvoie le test d’indépendance. TEST.KHIDEUX renvoie la valeur de la distribution khi-deux (χ2) pour la statistique et les degrés de liberté appropriés. Utilisez les tests χ2 pour déterminer si les résultats prévus sont vérifiés par une expérimentation.',
        abstract: 'Renvoie le test d’indépendance. TEST.KHIDEUX renvoie la valeur de la distribution khi-deux (χ2) pour la statistique et les degrés de liberté appropriés. Utilisez les tests χ2 pour déterminer si les résultats prévus sont vérifiés par une expérimentation.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Obligatoire. Représente la plage de données contenant les observations à comparer aux valeurs prévues.' },
            expectedRange: { name: 'expected_range', detail: 'Obligatoire. Représente la plage de données contenant le rapport du produit des totaux de ligne et de colonne avec le total général.' },
        },
    },
    CONFIDENCE: {
        description: 'Renvoie l’intervalle de confiance pour la moyenne d’une population, à l’aide d’une distribution normale.',
        abstract: 'Renvoie l’intervalle de confiance pour la moyenne d’une population, à l’aide d’une distribution normale.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obligatoire. Niveau de précision utilisé pour calculer le niveau de confiance. Le niveau de confiance est égal à 100*(1 - alpha) %, ou en d’autres termes, un alpha de 0,05 indique un niveau de confiance de 95 %.' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart-type de population pour la plage de données ; cet argument est supposé être connu.' },
            size: { name: 'size', detail: 'Obligatoire. Représente la taille de l’échantillon.' },
        },
    },
    COVAR: {
        description: 'Retourne la covariance, la moyenne des produits des écarts pour chaque paire de points de données dans deux jeux de données.',
        abstract: 'Retourne la covariance, la moyenne des produits des écarts pour chaque paire de points de données dans deux jeux de données.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obligatoire. Représente la première plage de cellules de nombres entiers.' },
            array2: { name: 'array2', detail: 'Obligatoire. Représente la seconde plage de cellules de nombres entiers.' },
        },
    },
    CRITBINOM: {
        description: 'Renvoie la plus petite valeur pour laquelle la distribution binomiale cumulée est supérieure ou égale à une valeur de critère. Utilisez cette fonction pour des applications d’assurance qualité. Par exemple, la fonction CRITERE.LOI.BINOMIALE vous permet de déterminer le nombre maximal de pièces défectueuses autorisées à la sortie d’une chaîne d’assemblage sans que le lot entier soit rejeté.',
        abstract: 'Renvoie la plus petite valeur pour laquelle la distribution binomiale cumulée est supérieure ou égale à une valeur de critère. Utilisez cette fonction pour des applications d’assurance qualité. Par exemple, la fonction CRITERE.LOI.BINOMIALE vous permet de déterminer le nombre maximal de pièces défectueuses autorisées à la sortie d’une chaîne d’assemblage sans que le lot entier soit rejeté.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obligatoire. Représente le nombre d’essais de Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Obligatoire. Représente la probabilité de succès de chaque essai.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente la valeur de critère.' },
        },
    },
    EXPONDIST: {
        description: 'Renvoie la distribution exponentielle. Utilisez la fonction LOI.EXPONENTIELLE pour prévoir la durée séparant des événements, tel le temps mis par un distributeur automatique bancaire pour délivrer de l’argent. Par exemple, vous pouvez utiliser LOI.EXPONENTIELLE pour calculer la probabilité que l’opération dure moins d’une minute.',
        abstract: 'Renvoie la distribution exponentielle. Utilisez la fonction LOI.EXPONENTIELLE pour prévoir la durée séparant des événements, tel le temps mis par un distributeur automatique bancaire pour délivrer de l’argent. Par exemple, vous pouvez utiliser LOI.EXPONENTIELLE pour calculer la probabilité que l’opération dure moins d’une minute.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur de la fonction.' },
            lambda: { name: 'lambda', detail: 'Obligatoire. Représente la valeur du paramètre.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Valeur logique qui indique la forme de la fonction exponentielle à fournir. Si cumulative a la valeur TRUE, EXPONDIST retourne la fonction de distribution cumulative ; si la valeur est FALSE, elle retourne la fonction de densité de probabilité.' },
        },
    },
    FDIST: {
        description: 'Renvoie la probabilité (unilatérale à droite) d’une variable aléatoire suivant une loi F pour deux jeux de données. Vous pouvez utiliser cette fonction pour déterminer si deux jeux de données ont des degrés de diversité différents. Par exemple, vous pouvez comparer les résultats de tests soumis aux garçons et aux filles à l’entrée à l’université et déterminer si la dispersion parmi les filles est la même que parmi les garçons.',
        abstract: 'Renvoie la probabilité (unilatérale à droite) d’une variable aléatoire suivant une loi F pour deux jeux de données. Vous pouvez utiliser cette fonction pour déterminer si deux jeux de données ont des degrés de diversité différents. Par exemple, vous pouvez comparer les résultats de tests soumis aux garçons et aux filles à l’entrée à l’université et déterminer si la dispersion parmi les filles est la même que parmi les garçons.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obligatoire. Représente le numérateur des degrés de liberté.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obligatoire. Représente le dénominateur des degrés de liberté.' },
        },
    },
    FINV: {
        description: 'Renvoie l’inverse de la distribution de probabilité F (unilatérale à droite). Si p = LOI.F(x,...), alors INVERSE.LOI.F(p,...) = x.',
        abstract: 'Renvoie l’inverse de la distribution de probabilité F (unilatérale à droite). Si p = LOI.F(x,...), alors INVERSE.LOI.F(p,...) = x.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité associée à la distribution cumulée F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obligatoire. Représente le numérateur des degrés de liberté.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obligatoire. Représente le dénominateur des degrés de liberté.' },
        },
    },
    FTEST: {
        description: 'Retourne le résultat d’un test F. Un test F renvoie la probabilité bi-tailed que les variances dans array1 et array2 ne soient pas significativement différentes. Utilisez cette fonction pour comparer les variances de deux échantillons. Par exemple, à partir des résultats d’examens dans des écoles publiques et privées, vous pouvez déterminer si ces écoles présentent des degrés de diversité différents en termes de résultats.',
        abstract: 'Retourne le résultat d’un test F. Un test F renvoie la probabilité bi-tailed que les variances dans array1 et array2 ne soient pas significativement différentes. Utilisez cette fonction pour comparer les variances de deux échantillons. Par exemple, à partir des résultats d’examens dans des écoles publiques et privées, vous pouvez déterminer si ces écoles présentent des degrés de diversité différents en termes de résultats.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obligatoire. Représente la première matrice ou plage de données.' },
            array2: { name: 'array2', detail: 'Obligatoire. Représente la seconde matrice ou plage de données.' },
        },
    },
    GAMMADIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Gamma. Vous pouvez utiliser cette fonction pour étudier des variables dont la distribution est susceptible d’être asymétrique. La loi gamma est couramment utilisée dans l’étude de files d’attente.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Gamma. Vous pouvez utiliser cette fonction pour étudier des variables dont la distribution est susceptible d’être asymétrique. La loi gamma est couramment utilisée dans l’étude de files d’attente.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur à laquelle vous voulez évaluer la distribution.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution. Si bêta = 1, LOI.GAMMA renvoie la loi Gamma standard.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si l’argument cumulative est VRAI, la fonction LOI.GAMMA renvoie la fonction de distribution cumulée ; si l’argument cumulative est FAUX, la fonction renvoie la fonction de densité de probabilité.' },
        },
    },
    GAMMAINV: {
        description: 'Renvoie l’inverse de la distribution cumulée suivant une loi Gamma. Si l’argument p = LOI.GAMMA(x;...), la fonction LOI.GAMMA.INVERSE(p;...) = x. Vous pouvez utiliser cette fonction pour étudier une variable dont la distribution est susceptible d’être asymétrique.',
        abstract: 'Renvoie l’inverse de la distribution cumulée suivant une loi Gamma. Si l’argument p = LOI.GAMMA(x;...), la fonction LOI.GAMMA.INVERSE(p;...) = x. Vous pouvez utiliser cette fonction pour étudier une variable dont la distribution est susceptible d’être asymétrique.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente la probabilité associée à la loi Gamma.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution. Si bêta = 1, LOI.GAMMA.INVERSE renvoie la loi Gamma standard.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Renvoie la loi hypergéométrique. La fonction LOI.HYPERGEOMETRIQUE renvoie la probabilité d’obtenir un nombre donné de tirages « succès » sur un échantillon, connaissant la taille de l’échantillon, le nombre de succès de la population et sa taille. Utilisez la fonction LOI.HYPERGEOMETRIQUE dans des problèmes supposant une population déterminée, dans lesquels chaque observation est soit un succès, soit un échec et où chaque sous-ensemble d’une taille donnée est constitué avec la même vraisemblance.',
        abstract: 'Renvoie la loi hypergéométrique. La fonction LOI.HYPERGEOMETRIQUE renvoie la probabilité d’obtenir un nombre donné de tirages « succès » sur un échantillon, connaissant la taille de l’échantillon, le nombre de succès de la population et sa taille. Utilisez la fonction LOI.HYPERGEOMETRIQUE dans des problèmes supposant une population déterminée, dans lesquels chaque observation est soit un succès, soit un échec et où chaque sous-ensemble d’une taille donnée est constitué avec la même vraisemblance.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Obligatoire. Représente le nombre de succès de l’échantillon.' },
            numberSample: { name: 'number_sample', detail: 'Obligatoire. Représente la taille de l’échantillon.' },
            populationS: { name: 'population_s', detail: 'Obligatoire. Représente le nombre de succès de la population.' },
            numberPop: { name: 'number_pop', detail: 'Obligatoire. Représente la taille de la population.' },
        },
    },
    LOGINV: {
        description: 'Renvoie l’inverse de la fonction de distribution de x suivant la loi lognormale cumulée, où ln(x) est normalement distribué avec les paramètres espérance et écart_type. Si p = LOI.LOGNORMALE(x;...), alors LOI.LOGNORMALE.INVERSE(p;...) = x.',
        abstract: 'Renvoie l’inverse de la fonction de distribution de x suivant la loi lognormale cumulée, où ln(x) est normalement distribué avec les paramètres espérance et écart_type. Si p = LOI.LOGNORMALE(x;...), alors LOI.LOGNORMALE.INVERSE(p;...) = x.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité associée à la distribution lognormale.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente l’espérance mathématique de ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Renvoie la distribution de x suivant une loi lognormale cumulée, où ln(x) est normalement distribué à l’aide des paramètres moyenne et écart_type. Cette fonction vous permet d’analyser des données après leur transformation logarithmique.',
        abstract: 'Renvoie la distribution de x suivant une loi lognormale cumulée, où ln(x) est normalement distribué à l’aide des paramètres moyenne et écart_type. Cette fonction vous permet d’analyser des données après leur transformation logarithmique.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente l’espérance mathématique de ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de ln(x).' },
        },
    },
    MODE: {
        description: 'Supposons que vous souhaitez connaître le nombre d’espèces d’oiseaux les plus courantes observées dans un échantillon de nombre d’oiseaux dans une zone humide critique sur une période de 30 ans, ou que vous souhaitez connaître le nombre d’appels téléphoniques les plus fréquents dans un centre de support téléphonique pendant les heures creuses. Pour calculer le mode d’un groupe de nombres, utilisez la fonction MODE .',
        abstract: 'Supposons que vous souhaitez connaître le nombre d’espèces d’oiseaux les plus courantes observées dans un échantillon de nombre d’oiseaux dans une zone humide critique sur une période de 30 ans, ou que vous souhaitez connaître le nombre d’appels téléphoniques les plus fréquents dans un centre de support téléphonique pendant les heures creuses. Pour calculer le mode d’un groupe de nombres, utilisez la fonction MODE .',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Représente le premier argument numérique pour lequel vous souhaitez calculer le mode.' },
            number2: { name: 'number2', detail: 'Optionnel. Représente les arguments numériques 2 à 255 dont vous souhaitez déterminer le mode. Vous pouvez également utiliser une matrice unique ou une référence à une matrice, au lieu d’arguments séparés par des points-virgules.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire discrète suivant une loi binomiale négative. La fonction LOI.BINOMIALE.NEG renvoie la probabilité d’obtenir un nombre d’échecs égal à l’argument nombre_échecs avant de parvenir au succès dont le rang est donné par l’argument nombre_succès, lorsque la probabilité de succès, définie par l’argument probabilité_succès, est constante. Cette fonction est similaire à la loi binomiale, à la différence que le nombre de succès est fixe et le nombre d’essais variable. Comme pour la loi binomiale, les essais sont supposés indépendants.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire discrète suivant une loi binomiale négative. La fonction LOI.BINOMIALE.NEG renvoie la probabilité d’obtenir un nombre d’échecs égal à l’argument nombre_échecs avant de parvenir au succès dont le rang est donné par l’argument nombre_succès, lorsque la probabilité de succès, définie par l’argument probabilité_succès, est constante. Cette fonction est similaire à la loi binomiale, à la différence que le nombre de succès est fixe et le nombre d’essais variable. Comme pour la loi binomiale, les essais sont supposés indépendants.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Obligatoire. Représente le nombre d’échecs.' },
            numberS: { name: 'number_s', detail: 'Obligatoire. Représente le nombre de succès à obtenir.' },
            probabilityS: { name: 'probability_s', detail: 'Obligatoire. Représente la probabilité d’obtenir un succès.' },
        },
    },
    NORMDIST: {
        description: 'La fonction NORMDIST retourne la distribution normale pour la moyenne et l’écart type spécifiés. Cette fonction a un large éventail d’applications en statistiques, y compris les tests d’hypothèses.',
        abstract: 'La fonction NORMDIST retourne la distribution normale pour la moyenne et l’écart type spécifiés. Cette fonction a un large éventail d’applications en statistiques, y compris les tests d’hypothèses.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Valeur pour laquelle vous souhaitez la distribution' },
            mean: { name: 'mean', detail: 'Obligatoire. Moyenne arithmétique de la distribution' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Écart type de la distribution' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Représente une valeur logique déterminant le mode de calcul de la fonction : cumulatif ou non. Si cumulative a la valeur TRUE, NORMDIST retourne la fonction de distribution cumulative ; si cumulative a la valeur FALSE, elle retourne la fonction de probabilité de masse.' },
        },
    },
    NORMINV: {
        description: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale pour la moyenne et l’écart type spécifiés.',
        abstract: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale pour la moyenne et l’écart type spécifiés.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité correspondant à la distribution normale.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente la moyenne arithmétique de la distribution.' },
            standardDev: { name: 'standard_dev', detail: 'Obligatoire. Représente l’écart type de la distribution.' },
        },
    },
    NORMSDIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire continue suivant une loi normale standard (ou centrée réduite). Cette distribution a une moyenne égale à 0 (zéro) et un écart type égal à 1. La présente fonction remplace l’usage de la table donnant la valeur des aires comprises sous une courbe normale centrée réduite.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire continue suivant une loi normale standard (ou centrée réduite). Cette distribution a une moyenne égale à 0 (zéro) et un écart type égal à 1. La présente fonction remplace l’usage de la table donnant la valeur des aires comprises sous une courbe normale centrée réduite.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obligatoire. Représente la valeur dont vous recherchez la distribution.' },
        },
    },
    NORMSINV: {
        description: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale standard (ou centrée réduite). Cette distribution a une moyenne égale à zéro et un écart type égal à 1.',
        abstract: 'Renvoie, pour une probabilité donnée, la valeur d’une variable aléatoire suivant une loi normale standard (ou centrée réduite). Cette distribution a une moyenne égale à zéro et un écart type égal à 1.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente une probabilité correspondant à la distribution normale.' },
        },
    },
    PERCENTILE: {
        description: 'Renvoie le k-ième centile des valeurs d’une plage. Cette fonction vous permet de définir un seuil d’acceptation. Par exemple, vous pouvez décider de n’étudier que les candidats ayant obtenu un résultat supérieur au 90e centile.',
        abstract: 'Renvoie le k-ième centile des valeurs d’une plage. Cette fonction vous permet de définir un seuil d’acceptation. Par exemple, vous pouvez décider de n’étudier que les candidats ayant obtenu un résultat supérieur au 90e centile.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de données définissant l’étendue relative.' },
            k: { name: 'k', detail: 'Obligatoire. Représente le centile ; celui-ci doit être compris entre 0 et 1 inclus.' },
        },
    },
    PERCENTRANK: {
        description: 'La fonction PERCENTRANK retourne le rang d’une valeur dans un jeu de données sous la forme d’un pourcentage du jeu de données, essentiellement le statut relatif d’une valeur dans l’ensemble du jeu de données. Par exemple, vous pouvez utiliser PERCENTRANK pour déterminer la position d’une personne au test dans le champ de toutes les notes du même test.',
        abstract: 'La fonction PERCENTRANK retourne le rang d’une valeur dans un jeu de données sous la forme d’un pourcentage du jeu de données, essentiellement le statut relatif d’une valeur dans l’ensemble du jeu de données. Par exemple, vous pouvez utiliser PERCENTRANK pour déterminer la position d’une personne au test dans le champ de toutes les notes du même test.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Plage de données (ou tableau prédéfini) de valeurs numériques dans laquelle le rang en pourcentage est déterminé.' },
            x: { name: 'x', detail: 'Obligatoire. Valeur pour laquelle vous souhaitez connaître le rang dans le tableau.' },
            significance: { name: 'significance', detail: 'Optionnel. Représente une valeur indiquant le nombre de décimales du pourcentage renvoyé. Si cet argument est omis, la fonction RANG.POURCENTAGE conserve trois décimales (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Renvoie la probabilité d’une variable aléatoire suivant une loi de Poisson. Une application courante de la loi de Poisson est la prédiction du nombre d’événements susceptibles de se produire sur une période de temps déterminée, par exemple, le nombre de voitures qui se présentent à un poste de péage en l’espace d’une minute.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire suivant une loi de Poisson. Une application courante de la loi de Poisson est la prédiction du nombre d’événements susceptibles de se produire sur une période de temps déterminée, par exemple, le nombre de voitures qui se présentent à un poste de péage en l’espace d’une minute.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente le nombre d’événements.' },
            mean: { name: 'mean', detail: 'Obligatoire. Représente la valeur numérique attendue.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Valeur logique qui détermine la forme de la distribution de probabilité retournée. Si cumulative a la valeur TRUE, POISSON renvoie la probabilité poisson cumulée que le nombre d’événements aléatoires se produisant soit compris entre zéro et x inclus ; si la valeur est FALSE, elle renvoie la fonction de masse de probabilité de Poisson qui indique que le nombre d’événements qui se produisent sera exactement x.' },
        },
    },
    QUARTILE: {
        description: 'Renvoie le quartile d’une série de données. Les quartiles sont souvent utilisés pour les données relatives aux ventes et aux enquêtes afin de séparer les populations en groupes. Ainsi, vous pouvez utiliser la fonction QUARTILE pour déterminer les vingt-cinq pour cent de revenus les plus élevés d’une population.',
        abstract: 'Renvoie le quartile d’une série de données. Les quartiles sont souvent utilisés pour les données relatives aux ventes et aux enquêtes afin de séparer les populations en groupes. Ainsi, vous pouvez utiliser la fonction QUARTILE pour déterminer les vingt-cinq pour cent de revenus les plus élevés d’une population.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Représente la matrice ou la plage de cellules de valeurs numériques pour laquelle vous recherchez la valeur du quartile.' },
            quart: { name: 'quart', detail: 'Obligatoire. Indique quelle valeur renvoyer.' },
        },
    },
    RANK: {
        description: 'Renvoie le rang d’un nombre dans une liste d’arguments. Le rang d’un nombre est donné par sa taille comparée aux autres valeurs de la liste. (Si vous deviez trier la liste, le rang d’un nombre serait sa position).',
        abstract: 'Renvoie le rang d’un nombre dans une liste d’arguments. Le rang d’un nombre est donné par sa taille comparée aux autres valeurs de la liste. (Si vous deviez trier la liste, le rang d’un nombre serait sa position).',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obligatoire. Représente le nombre dont vous voulez connaître le rang.' },
            ref: { name: 'ref', detail: 'Obligatoire. Référence à une liste de nombres. Les valeurs non numériques dans référence sont ignorées.' },
            order: { name: 'order', detail: 'Optionnel. Représente un numéro qui spécifie comment déterminer le rang de l’argument nombre. Si l’argument ordre a la valeur 0 (zéro) ou si cet argument est omis, Microsoft Excel calcule le rang d’un nombre comme si la liste définie par l’argument référence était triée par ordre décroissant. Si la valeur de l’argument ordre est différente de zéro, Microsoft Excel calcule le rang d’un nombre comme si la liste définie par l’argument référence était triée par ordre croissant.' },
        },
    },
    STDEV: {
        description: 'Calcule l’écart type sur la base d’un échantillon. L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        abstract: 'Calcule l’écart type sur la base d’un échantillon. L’écart type mesure la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à un échantillon de population.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 255 correspondant à un échantillon de population. Vous pouvez aussi utiliser une matrice ou une référence à une matrice plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    STDEVP: {
        description: 'Calcule l’écart type d’une population à partir de la population entière telle que la déterminent les arguments. L’écart type est une mesure de la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        abstract: 'Calcule l’écart type d’une population à partir de la population entière telle que la déterminent les arguments. L’écart type est une mesure de la dispersion des valeurs par rapport à la moyenne (valeur moyenne).',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à une population.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 255 correspondant à une population entière. Vous pouvez aussi utiliser une matrice ou une référence à une matrice plutôt que des arguments séparés par des points-virgules.' },
        },
    },
    TDIST: {
        description: 'Renvoie la probabilité d’une variable aléatoire suivant la loi de t de Student, dans laquelle une valeur numérique (x) est une valeur calculée de t dont il faut calculer la probabilité. La loi de t est utilisée pour les tests d’hypothèse sur des échantillons de petite taille. Utilisez cette fonction au lieu d’une table des valeurs critiques de la loi de t.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire suivant la loi de t de Student, dans laquelle une valeur numérique (x) est une valeur calculée de t dont il faut calculer la probabilité. La loi de t est utilisée pour les tests d’hypothèse sur des échantillons de petite taille. Utilisez cette fonction au lieu d’une table des valeurs critiques de la loi de t.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la valeur numérique à laquelle la distribution doit être évaluée.' },
            degFreedom: { name: 'degFreedom', detail: 'Obligatoire. Représente un nombre entier indiquant le nombre de degrés de liberté.' },
            tails: { name: 'tails', detail: 'Obligatoire. Indique le type de distribution à renvoyer : unilatérale ou bilatérale. Si l’argument uni/bilatéral = 1, la fonction LOI.STUDENT renvoie la distribution unilatérale. Si l’argument uni/bilatéral = 2, la fonction LOI.STUDENT renvoie la distribution bilatérale.' },
        },
    },
    TINV: {
        description: 'Renvoie, pour une probabilité donnée, la valeur inverse bilatérale d’une variable aléatoire suivant une loi T de Student.',
        abstract: 'Renvoie, pour une probabilité donnée, la valeur inverse bilatérale d’une variable aléatoire suivant une loi T de Student.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obligatoire. Représente la probabilité associée à la loi bilatérale T de Student.' },
            degFreedom: { name: 'degFreedom', detail: 'Obligatoire. Représente le nombre de degrés de liberté utilisés pour caractériser la distribution.' },
        },
    },
    TTEST: {
        description: 'Renvoie la probabilité associée à un test T de Student. Utilisez la fonction TEST.STUDENT pour déterminer dans quelle mesure deux échantillons sont susceptibles de provenir de deux populations sous-jacentes ayant la même moyenne.',
        abstract: 'Renvoie la probabilité associée à un test T de Student. Utilisez la fonction TEST.STUDENT pour déterminer dans quelle mesure deux échantillons sont susceptibles de provenir de deux populations sous-jacentes ayant la même moyenne.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obligatoire. Représente la première série de données.' },
            array2: { name: 'array2', detail: 'Obligatoire. Représente la seconde série de données.' },
            tails: { name: 'tails', detail: 'Obligatoire. Indique le type de distribution à renvoyer : unilatérale ou bilatérale. Si l’argument uni/bilatéral = 1, la fonction TEST.STUDENT utilise la distribution unilatérale. Si l’argument uni/bilatéral = 2, la fonction TEST.STUDENT utilise la distribution bilatérale.' },
            type: { name: 'type', detail: 'Obligatoire. Représente le type de test T à effectuer.' },
        },
    },
    VAR: {
        description: 'Calcule la variance sur la base d’un échantillon.',
        abstract: 'Calcule la variance sur la base d’un échantillon.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à un échantillon de population.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 255 correspondant à un échantillon de population.' },
        },
    },
    VARP: {
        description: 'Calcule la variance sur la base de l’ensemble de la population.',
        abstract: 'Calcule la variance sur la base de l’ensemble de la population.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obligatoire. Premier argument numérique correspondant à une population.' },
            number2: { name: 'number2', detail: 'Optionnel. Arguments numériques 2 à 255 correspondant à une population entière.' },
        },
    },
    WEIBULL: {
        description: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Weibull. Utilisez cette distribution dans une analyse de fiabilité telle que le calcul du temps moyen de fonctionnement sans panne d’un appareil.',
        abstract: 'Renvoie la probabilité d’une variable aléatoire suivant une loi Weibull. Utilisez cette distribution dans une analyse de fiabilité telle que le calcul du temps moyen de fonctionnement sans panne d’un appareil.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatoire. Représente la variable avec laquelle la fonction doit être calculée.' },
            alpha: { name: 'alpha', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            beta: { name: 'beta', detail: 'Obligatoire. Représente un paramètre de la distribution.' },
            cumulative: { name: 'cumulative', detail: 'Obligatoire. Détermine la forme de la fonction.' },
        },
    },
    ZTEST: {
        description: 'Renvoie la valeur-probabilité unilatérale d’un test z. Pour une moyenne de population supposée donnée, μ0, TEST.Z renvoie la probabilité que la moyenne d’échantillonnage soit supérieure à la moyenne des observations dans l’ensemble de données (matrice), à savoir la moyenne d’échantillonnage observée.',
        abstract: 'Renvoie la valeur-probabilité unilatérale d’un test z. Pour une moyenne de population supposée donnée, μ0, TEST.Z renvoie la probabilité que la moyenne d’échantillonnage soit supérieure à la moyenne des observations dans l’ensemble de données (matrice), à savoir la moyenne d’échantillonnage observée.',
        links: [
            {
                title: 'Instructions',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ztest-function',
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
