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
    CUBEKPIMEMBER: {
        description: 'Renvoie une propriété d’indicateur de performance clé et affiche le nom de l’indicateur dans la cellule. Un indicateur de performance clé est une mesure quantifiable, telle que la marge bénéficiaire brute mensuelle ou la rotation trimestrielle du personnel, utilisée pour évaluer les performances d’une entreprise.',
        abstract: 'Renvoie une propriété d’indicateur de performance clé et affiche le nom de l’indicateur dans la cellule. Un indicateur de performance clé est une mesure quantifiable, telle que la marge bénéficiaire brute mensuelle ou la rotation trimestrielle du personnel, utilisée pour évaluer les performances d’une entreprise.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexion', detail: 'Obligatoire. Chaîne de texte qui représente le nom de la connexion au cube.' },
            kpiName: { name: 'Kpi_name', detail: 'Obligatoire. Chaîne de texte qui représente le nom de l’indicateur de performance clé dans le cube.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Obligatoire. Le composant d’indicateur de performance clé retourné et peut être l’un des éléments suivants :' },
            caption: { name: 'Légende', detail: 'Optionnel. Chaîne de texte alternative affichée dans la cellule à la place de nom_icp et propriété_icp.' },
        },
    },
    CUBEMEMBER: {
        description: 'Renvoie un membre ou un tuple du cube. Utilisez cette fonction pour valider l’existence du membre ou du tuple dans le cube.',
        abstract: 'Renvoie un membre ou un tuple du cube. Utilisez cette fonction pour valider l’existence du membre ou du tuple dans le cube.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexion', detail: 'Obligatoire. Chaîne de texte qui représente le nom de la connexion au cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Obligatoire. Chaîne de texte d’une expression multidimensionnelle (MDX) qui indique un membre du cube. Cet argument peut également être un tuple, spécifié en tant que plage de cellules ou de constante matricielle.' },
            caption: { name: 'Légende', detail: 'Optionnel. Chaîne de texte affichée dans la cellule à la place de la légende provenant du cube, si celle-ci est définie. Lorsqu’un tuple est renvoyé, la légende utilisée est celle du dernier membre dans le tuple.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'La fonction CUBEMEMBERPROPERTY , l’une des fonctions Cube dans Excel, retourne la valeur d’une propriété membre à partir d’un cube. Utilisez cette fonction pour valider l’existence d’un nom de membre dans le cube et pour renvoyer la propriété spécifiée pour ce membre.',
        abstract: 'La fonction CUBEMEMBERPROPERTY , l’une des fonctions Cube dans Excel, retourne la valeur d’une propriété membre à partir d’un cube. Utilisez cette fonction pour valider l’existence d’un nom de membre dans le cube et pour renvoyer la propriété spécifiée pour ce membre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexion', detail: 'Obligatoire. Chaîne de texte qui représente le nom de la connexion au cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Obligatoire. Chaîne de texte d’une expression multidimensionnelle (MDX) d’un membre dans le cube.' },
            property: { name: 'Propriété', detail: 'Obligatoire. Chaîne de texte qui représente le nom de la propriété renvoyée ou une référence à une cellule qui contient le nom de la propriété.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Renvoie le nième membre ou le membre placé à un certain rang dans un ensemble. Utilisez cette fonction pour renvoyer un ou plusieurs éléments d’un ensemble, tels que les meilleurs vendeurs ou les 10 meilleurs étudiants.',
        abstract: 'Renvoie le nième membre ou le membre placé à un certain rang dans un ensemble. Utilisez cette fonction pour renvoyer un ou plusieurs éléments d’un ensemble, tels que les meilleurs vendeurs ou les 10 meilleurs étudiants.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexion', detail: 'Obligatoire. Chaîne de texte qui représente le nom de la connexion au cube.' },
            setExpression: { name: 'Set_expression', detail: 'Obligatoire. Chaîne de texte qui représente une expression définie, telle que "{[Élément1].enfants}". L’argument expression_données peut également être la fonction JEUCUBE ou une référence à une cellule contenant la fonction JEUCUBE.' },
            rank: { name: 'Rang', detail: 'Obligatoire. Représente une valeur entière spécifiant la valeur supérieure. Si la valeur du rang est 1, la valeur supérieure est renvoyée, si la valeur du rang est 2, la valeur venant en second après la valeur supérieure est renvoyée, et ainsi de suite. Pour renvoyer les 5 valeurs supérieures, utilisez RANGMEMBRECUBE cinq fois, en spécifiant à chaque fois un rang différent, de 1 à 5.' },
            caption: { name: 'Légende', detail: 'Optionnel. Chaîne de texte affichée dans la cellule à la place de la légende provenant du cube, si celle-ci est définie.' },
        },
    },
    CUBESET: {
        description: 'Définit un ensemble calculé de membres ou de tuples en envoyant une expression définie au cube sur le serveur qui crée l’ensemble et le renvoie à Microsoft Excel.',
        abstract: 'Définit un ensemble calculé de membres ou de tuples en envoyant une expression définie au cube sur le serveur qui crée l’ensemble et le renvoie à Microsoft Excel.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexion', detail: 'Obligatoire. Chaîne de texte qui représente le nom de la connexion au cube.' },
            setExpression: { name: 'Set_expression', detail: 'Obligatoire. Chaîne de texte qui représente une expression de données qui produit un ensemble de membres ou de tuples. Cet argument peut également être une référence de cellule renvoyant à une plage Excel qui contient un ou plusieurs membres, tuples ou ensembles inclus dans l’ensemble.' },
            caption: { name: 'Légende', detail: 'Optionnel. Chaîne de texte affichée dans la cellule à la place de la légende provenant du cube, si celle-ci est définie.' },
            sortOrder: { name: 'Sort_order', detail: 'Optionnel. Représente le type de tri, le cas échéant, à effectuer et peut être ce qui suit :' },
            sortBy: { name: 'Sort_by', detail: 'Optionnel. Chaîne de texte de la valeur par laquelle trier. Par exemple, pour obtenir la ville avec les ventes les plus élevées, set_expression serait un ensemble de villes, et sort_by serait la mesure des ventes. Ou, pour obtenir la ville avec la population la plus élevée, set_expression serait un ensemble de villes, et sort_by serait la mesure de la population. Si sort_order nécessite sort_by et que sort_by est omis, CUBESET renvoie la #VALUE ! est renvoyé.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Renvoie le nombre d’éléments dans un ensemble.',
        abstract: 'Renvoie le nombre d’éléments dans un ensemble.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Ensemble', detail: 'Obligatoire. Chaîne de texte qui représente une expression Microsoft Excel qui indique un ensemble défini par la fonction JEUCUBE. L’argument ensemble peut également être la fonction JEUCUBE ou une référence à une cellule qui contient la fonction JEUCUBE.' },
        },
    },
    CUBEVALUE: {
        description: 'Renvoie une valeur d’agrégation issue du cube.',
        abstract: 'Renvoie une valeur d’agrégation issue du cube.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexion', detail: 'Obligatoire. Chaîne de texte qui représente le nom de la connexion au cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Optionnel. Chaîne de texte qui représente une expression multidimensionnelle (MDX) qui indique un membre ou un tuple dans le cube. L’argument expression_membre peut également être un ensemble défini avec la fonction JEUCUBE. Utilisez l’argument expression_membre comme délimiteur pour définir la partie du cube pour laquelle la valeur d’agrégation est renvoyée. Si aucune mesure n’est spécifiée dans l’argument expression_membre, la mesure par défaut pour ce cube est utilisée.' },
        },
    },
};

export default locale;
