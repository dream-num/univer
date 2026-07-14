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
    DAVERAGE: {
        description: 'Calcule la moyenne des valeurs d’un champ (colonne) d’enregistrements dans une liste ou une base de données qui remplissent les conditions spécifiées.',
        abstract: 'Calcule la moyenne des valeurs d’un champ (colonne) d’enregistrements dans une liste ou une base de données qui remplissent les conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'est la plage de cellules qui compose la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'indique la colonne utilisée dans la fonction . Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'est la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DCOUNT: {
        description: 'Compte les cellules d’un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui contiennent des nombres répondant aux conditions spécifiées.',
        abstract: 'Compte les cellules d’un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui contiennent des nombres répondant aux conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions spécifiées. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois que celui-ci comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DCOUNTA: {
        description: 'Compte les cellules non vides dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions que vous spécifiez.',
        abstract: 'Compte les cellules non vides dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions que vous spécifiez.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Optionnel. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DGET: {
        description: 'Extrait une seule valeur répondant aux conditions spécifiées à partir d’une colonne d’une liste ou d’une base de données.',
        abstract: 'Extrait une seule valeur répondant aux conditions spécifiées à partir d’une colonne d’une liste ou d’une base de données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DMAX: {
        description: 'Renvoie le plus grand nombre dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions que vous spécifiez.',
        abstract: 'Renvoie le plus grand nombre dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions que vous spécifiez.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DMIN: {
        description: 'Renvoie le plus petit nombre dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions que vous spécifiez.',
        abstract: 'Renvoie le plus petit nombre dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions que vous spécifiez.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DPRODUCT: {
        description: 'Multiplie les valeurs d’un champ (colonne) d’enregistrements dans une liste ou une base de données qui remplissent les conditions spécifiées.',
        abstract: 'Multiplie les valeurs d’un champ (colonne) d’enregistrements dans une liste ou une base de données qui remplissent les conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DSTDEV: {
        description: 'Calcule l’écart-type standard d’une population sur la base d’un échantillon en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        abstract: 'Calcule l’écart-type standard d’une population sur la base d’un échantillon en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DSTDEVP: {
        description: 'Calcule l’écart-type standard d’une population en prenant en compte toute la population et en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        abstract: 'Calcule l’écart-type standard d’une population en prenant en compte toute la population et en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DSUM: {
        description: 'Dans une liste ou une base de données, DSUM fournit la somme des nombres dans les champs (colonnes) des enregistrements qui correspondent à vos conditions spécifiées.',
        abstract: 'Dans une liste ou une base de données, DSUM fournit la somme des nombres dans les champs (colonnes) des enregistrements qui correspondent à vos conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Il s’agit de la plage de cellules qui compose la liste ou la base de données. Une base de données est une liste de données associées dans laquelle les lignes d’informations associées sont des enregistrements et les colonnes de données sont des champs . La première ligne d’une liste contient des étiquettes pour chaque colonne qui s’y trouve.' },
            field: { name: 'field', detail: 'Obligatoire. Cela spécifie la colonne utilisée dans la fonction . Spécifiez l’étiquette de colonne entre guillemets doubles, par exemple « Âge » ou « Rendement ». Vous pouvez également spécifier un nombre (sans guillemets) qui représente la position de la colonne dans la liste : par exemple, 1 pour la première colonne, 2 pour la deuxième colonne, etc.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Il s’agit de la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DVAR: {
        description: 'Calcule la variance d’une population sur la base d’un échantillon en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        abstract: 'Calcule la variance d’une population sur la base d’un échantillon en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
    DVARP: {
        description: 'Calcule la variance d’une population en prenant en compte toute la population et en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        abstract: 'Calcule la variance d’une population en prenant en compte toute la population et en utilisant les valeurs contenues dans un champ (colonne) d’enregistrements d’une liste ou d’une base de données qui remplissent les conditions spécifiées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obligatoire. Représente la plage de cellules qui constitue la liste ou la base de données. Une base de données est une liste de données liées dans laquelle les lignes d’informations liées sont des enregistrements et les colonnes de données sont des champs. La première ligne de la liste contient les étiquettes de chaque colonne.' },
            field: { name: 'field', detail: 'Obligatoire. Indique la colonne utilisée dans la fonction. Entrez l’étiquette de la colonne placée entre guillemets doubles, par exemple "Âge" ou "Rendement", ou un nombre (sans guillemets) représentant la position de la colonne dans la liste : 1 pour la première colonne, 2 pour la seconde, et ainsi de suite.' },
            criteria: { name: 'criteria', detail: 'Obligatoire. Représente la plage de cellules qui contient les conditions que vous spécifiez. Vous pouvez utiliser n’importe quelle plage comme argument critères, à condition toutefois qu’elle comprenne au moins une étiquette de colonne et au moins une cellule sous celle-ci dans laquelle vous spécifiez une condition pour la colonne.' },
        },
    },
};

export default locale;
