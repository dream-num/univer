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
    ADDRESS: {
        description: 'Vous pouvez utiliser la fonction ADRESSE pour obtenir l’adresse d’une cellule dans une feuille de calcul, selon des numéros de lignes et de colonnes spécifiés. Par exemple, ADDRESS(2,3) retourne $C$2 . Autre exemple, ADDRESS(77 300) renvoie $KN 77 $ . D’autres fonctions, telles que les fonctions LIGNE et COLONNE , permettent de fournir les arguments des numéros de lignes et de colonnes pour la fonction ADRESSE .',
        abstract: 'Vous pouvez utiliser la fonction ADRESSE pour obtenir l’adresse d’une cellule dans une feuille de calcul, selon des numéros de lignes et de colonnes spécifiés. Par exemple, ADDRESS(2,3) retourne $C$2 . Autre exemple, ADDRESS(77 300) renvoie $KN 77 $ . D’autres fonctions, telles que les fonctions LIGNE et COLONNE , permettent de fournir les arguments des numéros de lignes et de colonnes pour la fonction ADRESSE .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: 'row number', detail: 'Obligatoire. Valeur numérique spécifiant le numéro de ligne à utiliser dans la référence de la cellule.' },
            column_num: { name: 'column number', detail: 'Obligatoire. Valeur numérique spécifiant le numéro de colonne à utiliser dans la référence de la cellule.' },
            abs_num: { name: 'type of reference', detail: 'Optionnel. Valeur numérique spécifiant le type de référence à renvoyer.' },
            a1: { name: 'style of reference', detail: 'Optionnel. Valeur logique indiquant si le style de référence est A1 ou L1C1. Dans le style A1, les colonnes sont étiquetées par ordre alphabétique et les lignes sont étiquetées numériquement. Dans le style de référence L1C1, les colonnes et les lignes sont toutes étiquetées numériquement. Si l’argument A1 est VRAI ou omis, la fonction ADRESSE renvoie une référence au style A1 ; s’il est FAUX, la fonction ADRESSE renvoie une référence au style L1C1. Remarque Pour modifier le style de référence utilisé par Excel, cliquez sur l’onglet Fichier , cliquez sur Options , puis cliquez sur Formules . Sous Manipulation de formules , activez ou désactivez la case à cocher Style de référence L1C1 .' },
            sheet_text: { name: 'worksheet name', detail: 'Optionnel. Une valeur de texte qui spécifie le nom de la feuille de calcul à utiliser comme référence externe. Par exemple, la formule =ADDRESS(1,1,,,"Sheet2 ») renvoie Sheet2 !$A$1 . Si l’argument sheet_text est omis, aucun nom de feuille n’est utilisé et l’adresse retournée par la fonction fait référence à une cellule de la feuille active.' },
        },
    },
    AREAS: {
        description: 'Renvoie le nombre de zones dans une référence. Une zone se compose d’une plage de cellules adjacentes ou d’une cellule unique.',
        abstract: 'Renvoie le nombre de zones dans une référence. Une zone se compose d’une plage de cellules adjacentes ou d’une cellule unique.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obligatoire. Représente une référence à une cellule ou à une plage de cellules, et peut se référer à plusieurs zones. Si vous souhaitez spécifier un argument unique comprenant plusieurs références, vous devez inclure une paire de parenthèses supplémentaire, pour éviter que Microsoft Excel n’interprète le point-virgule comme un séparateur de champ. Voir l’exemple suivant.' },
        },
    },
    CHOOSE: {
        description: 'Utilise l’argument no_index pour renvoyer l’une des valeurs de la liste des arguments valeur. Utilisez la fonction CHOISIR pour sélectionner l’une des 254 valeurs possibles à partir du rang donné par l’argument no_index. Ainsi, si les arguments valeur1 à valeur7 représentent les jours de la semaine, la fonction CHOISIR renvoie l’un de ces jours lorsque la valeur de l’argument no_index est un nombre compris entre 1 et 7.',
        abstract: 'Utilise l’argument no_index pour renvoyer l’une des valeurs de la liste des arguments valeur. Utilisez la fonction CHOISIR pour sélectionner l’une des 254 valeurs possibles à partir du rang donné par l’argument no_index. Ainsi, si les arguments valeur1 à valeur7 représentent les jours de la semaine, la fonction CHOISIR renvoie l’un de ces jours lorsque la valeur de l’argument no_index est un nombre compris entre 1 et 7.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'Obligatoire. Désigne l’argument valeur qui doit être sélectionné. L’argument no_index doit être un nombre compris entre 1 et 254, ou une formule, ou une référence à une cellule contenant un nombre compris entre 1 et 254. Si la valeur de l’argument no_index est égale à 1, la fonction CHOISIR renvoie l’argument valeur1, si elle est égale à 2, elle renvoie l’argument valeur2, et ainsi de suite. Si index_num est inférieur à 1 ou supérieur au nombre de la dernière valeur de la liste, CHOOSE renvoie la #VALUE ! #VALEUR!. Si la valeur de l’argument no_index est une fraction, il est ramené par troncature au nombre entier immédiatement inférieur avant d’être pris en compte.' },
            value1: { name: 'value1', detail: 'La valeur 1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 254 arguments valeur parmi lesquels la fonction CHOISIR sélectionne une valeur ou une action à exécuter en fonction de l’argument no_index spécifié. Ces arguments peuvent être des nombres, des références de cellule, des noms définis, des formules, des fonctions ou du texte.' },
            value2: { name: 'value2', detail: 'La valeur 1 est obligatoire, les valeurs suivantes sont facultatives. Il s’agit des 1 à 254 arguments valeur parmi lesquels la fonction CHOISIR sélectionne une valeur ou une action à exécuter en fonction de l’argument no_index spécifié. Ces arguments peuvent être des nombres, des références de cellule, des noms définis, des formules, des fonctions ou du texte.' },
        },
    },
    CHOOSECOLS: {
        description: 'Renvoie les colonnes spécifiées à partir d’une matrice.',
        abstract: 'Renvoie les colonnes spécifiées à partir d’une matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau contenant les colonnes à retourner dans le nouveau tableau. Obligatoire.' },
            colNum1: { name: 'col_num1', detail: 'Première colonne à retourner. Obligatoire.' },
            colNum2: { name: 'col_num2', detail: 'Colonnes supplémentaires à retourner. Facultatif.' },
        },
    },
    CHOOSEROWS: {
        description: 'Renvoie les lignes spécifiées à partir d’une matrice.',
        abstract: 'Renvoie les lignes spécifiées à partir d’une matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau contenant les colonnes à retourner dans le nouveau tableau. Obligatoire.' },
            rowNum1: { name: 'row_num1', detail: 'Numéro de la première ligne à retourner. Obligatoire.' },
            rowNum2: { name: 'row_num2', detail: 'Numéros de ligne supplémentaires à retourner. Facultatif.' },
        },
    },
    COLUMN: {
        description: 'La fonction COLUMN retourne le numéro de colonne de la référence de cellule donnée. Par exemple, la formule =COLUMN(D10) retourne 4, car la colonne D est la quatrième colonne.',
        abstract: 'La fonction COLUMN retourne le numéro de colonne de la référence de cellule donnée. Par exemple, la formule =COLUMN(D10) retourne 4, car la colonne D est la quatrième colonne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Optionnel. Cellule ou plage de cellules pour lesquelles vous souhaitez retourner le numéro de colonne. Si l’argument référence est omis ou correspond à une plage de cellules et que la fonction COLONNE est entrée en tant que formule de tableau horizontal, la fonction COLONNE renvoie les numéros de colonne de la référence sous forme de tableau horizontal. Remarque Si vous disposez d’une version actuelle de Microsoft 365 , vous pouvez simplement entrer la formule dans la cellule supérieure gauche de la plage de sortie, puis appuyer sur Entrée pour confirmer la formule en tant que formule de tableau dynamique. Sinon, vous devez entrer la formule comme une formule de tableau héritée : sélectionnez la plage de sortie, entrez la formule dans la cellule en haut à gauche de la plage de sortie, puis appuyez sur Ctrl+Maj+Entrée pour confirmer la formule. Excel ajoute automatiquement des accolades au début et à la fin de la formule. Pour plus d’informations sur les formules de tableau, voir Instructions et exemples de formules de tableau . Si l’argument référence est une plage de cellules et que la fonction COLONNE n’est pas entrée en tant que formule de tableau horizontal, la fonction COLONNE renvoie le numéro de la dernière colonne de gauche. Si l’argument référence est omis, l’argument par défaut est la référence de la cellule dans laquelle est placée la fonction COLONNE. L’argument référence ne peut pas faire référence à plusieurs zones.' },
        },
    },
    COLUMNS: {
        description: 'Retourne le nombre de colonnes dans un tableau ou une référence.',
        abstract: 'Retourne le nombre de colonnes dans un tableau ou une référence.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Une formule de tableau ou de tableau, ou une référence à une plage de cellules pour laquelle vous souhaitez le nombre de colonnes.' },
        },
    },
    DROP: {
        description: 'Exclut un nombre spécifié de lignes ou de colonnes du début ou de la fin d’un tableau. Cette fonction peut vous être utile pour supprimer les en-têtes et pieds de page d’un rapport Excel afin de retourner uniquement les données.',
        abstract: 'Exclut un nombre spécifié de lignes ou de colonnes du début ou de la fin d’un tableau. Cette fonction peut vous être utile pour supprimer les en-têtes et pieds de page d’un rapport Excel afin de retourner uniquement les données.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau à partir duquel supprimer des lignes ou des colonnes.' },
            rows: { name: 'rows', detail: 'Nombre de lignes à supprimer. Une valeur négative est exclue de la fin du tableau.' },
            columns: { name: 'columns', detail: 'Nombre de colonnes à exclure. Une valeur négative est exclue de la fin du tableau.' },
        },
    },
    EXPAND: {
        description: 'Permet d’étendre ou de remplir un tableau aux dimensions spécifiées des lignes et des colonnes.',
        abstract: 'Permet d’étendre ou de remplir un tableau aux dimensions spécifiées des lignes et des colonnes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau à développer.' },
            rows: { name: 'rows', detail: 'Nombre de lignes dans le tableau développé. S’il est manquant, les lignes ne sont pas développées.' },
            columns: { name: 'columns', detail: 'Nombre de colonnes dans le tableau développé. S’il est manquant, les colonnes ne sont pas développées.' },
            padWith: { name: 'pad_with', detail: 'Valeur avec laquelle effectuer le remplissage. La valeur par défaut est #N/A.' },
        },
    },
    FILTER: {
        description: 'Dans l’exemple suivant, nous avons utilisé la formule =FILTRE(A5:D20;C5:C20=H2;"") pour renvoyer tous les enregistrements pour Pomme, tel que sélectionné dans la cellule H2 et s’il n’y a pas de pommes, renvoyer une chaîne vide (« »).',
        abstract: 'Dans l’exemple suivant, nous avons utilisé la formule =FILTRE(A5:D20;C5:C20=H2;"") pour renvoyer tous les enregistrements pour Pomme, tel que sélectionné dans la cellule H2 et s’il n’y a pas de pommes, renvoyer une chaîne vide (« »).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'La fonction FILTRE renvoie une matrice qui débordera si c’est le résultat final d’une formule. Cela signifie qu’Excel crée dynamiquement la plage de tableau de dimension appropriée lorsque vous appuyez sur entrée . Si vos données de prise en charge se trouvent dans un tableau Excel , la matrice est automatiquement redimensionnée quand vous ajoutez ou supprimez des données dans votre plage de tableau si vous utilisez les références structurées . Pour plus d’informations, consultez cet article sur comportement de matrice renversé .' },
            include: { name: 'include', detail: 'Si votre ensemble de données comporte le potentiel de renvoyer une valeur vide, utilisez le 3ème argument ( [if_empty] ). Sinon, une erreur #CALC ! se produit, car Excel ne prend actuellement pas en charge les tableaux vides.' },
            ifEmpty: { name: 'if_empty', detail: 'Si une valeur de l’argument include est une erreur (#N/A, #VALUE, etc.) ou ne peut pas être convertie en booléen, la fonction FILTER renvoie une erreur.' },
        },
    },
    FORMULATEXT: {
        description: 'Renvoie une formule sous forme de chaîne.',
        abstract: 'Renvoie une formule sous forme de chaîne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obligatoire. Référence à une cellule ou à une plage de cellules.' },
        },
    },
    GETPIVOTDATA: {
        description: 'La capture d’écran ci-dessous montre la disposition de tableau croisé dynamique utilisée dans les sections suivantes. Dans cet exemple, =LIREDONNEESTABCROISDYNAMIQUE("Ventes";A3) retourne le montant total des ventes :',
        abstract: 'La capture d’écran ci-dessous montre la disposition de tableau croisé dynamique utilisée dans les sections suivantes. Dans cet exemple, =LIREDONNEESTABCROISDYNAMIQUE("Ventes";A3) retourne le montant total des ventes :',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: '' },
            pivotTable: { name: 'pivotTable', detail: '' },
            field1: { name: 'field1', detail: '' },
            item1: { name: 'item1', detail: '' },
        },
    },
    HLOOKUP: {
        description: 'Recherche une valeur dans la ligne supérieure d’une table ou d’un tableau de valeurs, puis renvoie une valeur dans la même colonne à partir d’une ligne que vous spécifiez dans la table ou le tableau. Utilisez la fonction RECHERCHEH lorsque les valeurs de comparaison sont situées dans une ligne en haut de la table de données, et que vous souhaitez effectuer la recherche n lignes plus bas. Utilisez la fonction RECHERCHEV lorsque les valeurs de comparaison se trouvent dans une colonne située à gauche des données recherchées.',
        abstract: 'Recherche une valeur dans la ligne supérieure d’une table ou d’un tableau de valeurs, puis renvoie une valeur dans la même colonne à partir d’une ligne que vous spécifiez dans la table ou le tableau. Utilisez la fonction RECHERCHEH lorsque les valeurs de comparaison sont situées dans une ligne en haut de la table de données, et que vous souhaitez effectuer la recherche n lignes plus bas. Utilisez la fonction RECHERCHEV lorsque les valeurs de comparaison se trouvent dans une colonne située à gauche des données recherchées.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Obligatoire. Représente la valeur à rechercher dans la première ligne de la table. Il peut s’agir d’une valeur, d’une référence ou d’une chaîne de texte.' },
            tableArray: { name: 'table_array', detail: 'Obligatoire. Représente la table de données dans laquelle est exécutée la recherche de la valeur. Utilisez une référence à une plage ou un nom de plage. Les valeurs de la première ligne de table_matrice peuvent être du texte, des chiffres ou des valeurs logiques. Si range_lookup a la valeur TRUE, les valeurs de la première ligne de table_array doivent être placées dans l’ordre croissant : ...-2, -1, 0, 1, 2,... , A-Z, FALSE, TRUE ; dans le cas contraire, RECHERCHEH risque de ne pas donner la valeur correcte. Si range_lookup a la valeur FALSE, table_array n’a pas besoin d’être trié. La fonction ne fait pas de distinction entre les majuscules et les minuscules. Trier les valeurs dans l’ordre croissant, de gauche à droite. Pour plus d’informations, voir Trier les données d’une plage ou d’un tableau .' },
            rowIndexNum: { name: 'row_index_num', detail: 'Obligatoire. Numéro de ligne dans table_array à partir duquel la valeur correspondante sera retournée. Une row_index_num de 1 retourne la première valeur de ligne dans table_array, une row_index_num de 2 renvoie la valeur de la deuxième ligne dans table_array, etc. Si row_index_num est inférieur à 1, rechercheH renvoie le #VALUE ! valeur d’erreur ; si row_index_num est supérieur au nombre de lignes sur table_array, RECHERCHEH renvoie le #REF ! #VALEUR!.' },
            rangeLookup: { name: 'range_lookup', detail: 'Optionnel. Représente une valeur logique qui spécifie si vous voulez que RECHERCHEH trouve une correspondance exacte ou approximative. Si cet argument est VRAI ou omis, une donnée proche est renvoyée. En d’autres termes, si aucune valeur exacte n’est trouvée, la valeur immédiatement inférieure à valeur_cherchée est renvoyée. Si cet argument est FAUX, RECHERCHEH recherche une correspondance exacte. S’il n’en trouve pas, la valeur d’erreur #N/A est renvoyée.' },
        },
    },
    HSTACK: {
        description: 'Ajoute des tableaux horizontalement et dans l’ordre pour renvoyer un tableau plus grand.',
        abstract: 'Ajoute des tableaux horizontalement et dans l’ordre pour renvoyer un tableau plus grand.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Nombre maximal de lignes de chacun des arguments du tableau.' },
            array2: { name: 'array', detail: 'Nombre combiné de toutes les colonnes de chacun des arguments du tableau.' },
        },
    },
    HYPERLINK: {
        description: 'Crée un lien hypertexte dans une cellule.',
        abstract: 'Crée un lien hypertexte dans une cellule.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=fr',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL intégrale de l\'emplacement du lien, entre guillemets, ou référence à une cellule contenant cette URL. Seuls certains types de liens sont autorisés. Les liens http:// , https:// , mailto: , aim: , ftp:// , gopher:// , telnet:// et news:// sont autorisés, mais les autres sont explicitement interdits. Si un autre protocole est spécifié, link_label s\'affiche dans la cellule, mais ne constitue pas un lien hypertexte. Si aucun protocole n\'est spécifié, http:// est utilisé par défaut et ajouté en préfixe à url .' },
            linkLabel: { name: 'link_label', detail: '[ FACULTATIF – url par défaut ] : texte à afficher dans la cellule en tant que lien, entre guillemets, ou référence à une cellule contenant un tel libellé. Si link_label est une référence à une cellule vide, url s\'affiche sous forme de lien si elle est valide, ou sous forme de texte brut dans le cas contraire. Si link_label est la chaîne littérale vide (""), la cellule s\'affiche comme étant vide, mais le lien reste accessible en cliquant sur la cellule ou en y accédant.' },
        },
    },
    IMAGE: {
        description: 'La fonction IMAGE insère des images dans des cellules à partir d’un emplacement source, ainsi qu’un texte de remplacement. Vous pouvez ensuite déplacer et redimensionner des cellules, trier et filtrer, et utiliser des images dans un tableau Excel. Utilisez cette fonction pour améliorer visuellement des listes de données telles que les inventaires, les jeux, les employés et les concepts mathématiques.',
        abstract: 'La fonction IMAGE insère des images dans des cellules à partir d’un emplacement source, ainsi qu’un texte de remplacement. Vous pouvez ensuite déplacer et redimensionner des cellules, trier et filtrer, et utiliser des images dans un tableau Excel. Utilisez cette fonction pour améliorer visuellement des listes de données telles que les inventaires, les jeux, les employés et les concepts mathématiques.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'Chemin URL du fichier image utilisant le protocole « https ».' },
            altText: { name: 'alt_text', detail: 'Texte de remplacement décrivant l’image à des fins d’accessibilité.' },
            sizing: { name: 'sizing', detail: 'Indique les dimensions de l’image.' },
            height: { name: 'height', detail: 'Hauteur personnalisée de l’image en pixels.' },
            width: { name: 'width', detail: 'Largeur personnalisée de l’image en pixels.' },
        },
    },
    INDEX: {
        description: 'Renvoie la valeur d’un élément d’un tableau ou d’une matrice, sélectionné à partir des index de numéros de ligne et de colonne.',
        abstract: 'Renvoie la valeur d’un élément d’un tableau ou d’une matrice, sélectionné à partir des index de numéros de ligne et de colonne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Référence à une ou plusieurs plages de cellules.' },
            rowNum: { name: 'row_num', detail: 'Numéro de la ligne de reference à partir de laquelle renvoyer une référence.' },
            columnNum: { name: 'column_num', detail: 'Numéro de la colonne de reference à partir de laquelle renvoyer une référence.' },
            areaNum: { name: 'area_num', detail: 'Sélectionne dans reference une plage dont l’intersection de row_num et column_num doit être renvoyée.' },
        },
    },
    INDIRECT: {
        description: 'Renvoie la référence spécifiée par une chaîne de caractères. Les références sont immédiatement évaluées afin d’afficher leur contenu. Utilisez la fonction INDIRECT lorsque vous voulez modifier la référence à une cellule à l’intérieur d’une formule sans modifier la formule à proprement parler.',
        abstract: 'Renvoie la référence spécifiée par une chaîne de caractères. Les références sont immédiatement évaluées afin d’afficher leur contenu. Utilisez la fonction INDIRECT lorsque vous voulez modifier la référence à une cellule à l’intérieur d’une formule sans modifier la formule à proprement parler.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'Obligatoire. Référence à une cellule qui contient une référence de style A1, une référence de style R1C1, un nom défini comme référence ou une référence à une cellule sous forme de chaîne de texte. Si ref_text n’est pas une référence de cellule valide, INDIRECT retourne la #REF ! #VALEUR!. Si ref_text fait référence à un autre classeur (une référence externe), l’autre classeur doit être ouvert. Si le classeur source n’est pas ouvert, INDIRECT retourne le #REF ! #VALEUR!. Remarque Les références externes ne sont pas prises en charge dans Excel Web App. Si ref_text fait référence à une plage de cellules en dehors de la limite de lignes de 1 048 576 ou de la limite de colonne de 16 384 (XFD), INDIRECT renvoie une #REF ! erreur.' },
            a1: { name: 'a1', detail: 'Optionnel. Représente une valeur logique qui indique le type de référence contenu dans la cellule de l’argument réf_texte. Si l’argument a1 est VRAI ou omis, l’argument réf_texte est interprété comme une référence de type A1. Si l’argument a1 est FAUX, l’argument réf_texte est interprété comme une référence de type L1C1.' },
        },
    },
    LOOKUP: {
        description: 'La forme vectorielle de la fonction RECHERCHE recherche une valeur dans une plage à une ligne ou colonne (appelée vecteur) et renvoie une valeur à partir de la même position dans une seconde plage à une ligne ou colonne.',
        abstract: 'La forme vectorielle de la fonction RECHERCHE recherche une valeur dans une plage à une ligne ou colonne (appelée vecteur) et renvoie une valeur à partir de la même position dans une seconde plage à une ligne ou colonne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Valeur recherchée par LOOKUP dans le premier vecteur. lookup_value peut être un nombre, du texte, une valeur logique, un nom ou une référence qui désigne une valeur.' },
            lookupVectorOrArray: { name: 'lookup_vectorOrArray', detail: 'Plage ne contenant qu’une ligne ou qu’une colonne.' },
            resultVector: { name: 'result_vector', detail: 'Plage ne contenant qu’une ligne ou qu’une colonne. result_vector doit avoir la même taille que lookup_vector.' },
        },
    },
    MATCH: {
        description: 'La fonction EQUIV recherche un élément spécifié dans une plage de cellules, puis renvoie la position relative de cet élément dans la plage. Par exemple, si la plage A1:A3 contient les valeurs 5, 25 et 38, la formule =EQUIV(25;A1:A3;0) renvoie le chiffre 2 étant donné que 25 est le deuxième élément dans la plage.',
        abstract: 'La fonction EQUIV recherche un élément spécifié dans une plage de cellules, puis renvoie la position relative de cet élément dans la plage. Par exemple, si la plage A1:A3 contient les valeurs 5, 25 et 38, la formule =EQUIV(25;A1:A3;0) renvoie le chiffre 2 étant donné que 25 est le deuxième élément dans la plage.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'MATCH recherche la plus grande valeur inférieure ou égale à lookup_value . Les valeurs de l’argument lookup_array doivent être placées dans l’ordre croissant, par exemple : ...-2, -1, 0, 1, 2, ..., A-Z, FALSE, TRUE.' },
            lookupArray: { name: 'lookup_array', detail: 'MATCH recherche la première valeur qui est exactement égale à lookup_value . Les valeurs de l’argument lookup_array peuvent être dans n’importe quel ordre.' },
            matchType: { name: 'match_type', detail: 'MATCH recherche la plus petite valeur supérieure ou égale à lookup_value . Les valeurs de l’argument lookup_array doivent être placées dans l’ordre décroissant, par exemple : TRUE, FALSE, Z-A, ... 2, 1, 0, -1, -2, ..., etc.' },
        },
    },
    OFFSET: {
        description: 'Renvoie une référence à une plage qui correspond à un nombre déterminé de lignes et de colonnes d’une cellule ou plage de cellules. La référence qui est renvoyée peut être une cellule unique ou une plage de cellules. Vous pouvez spécifier le nombre de lignes et de colonnes à renvoyer.',
        abstract: 'Renvoie une référence à une plage qui correspond à un nombre déterminé de lignes et de colonnes d’une cellule ou plage de cellules. La référence qui est renvoyée peut être une cellule unique ou une plage de cellules. Vous pouvez spécifier le nombre de lignes et de colonnes à renvoyer.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obligatoire. Représente la référence par rapport à laquelle le décalage doit être opéré. La référence doit désigner une cellule ou une plage de cellules adjacentes ; sinon, la fonction DECALER renvoie la valeur d’erreur #VALEUR! .' },
            rows: { name: 'rows', detail: 'Obligatoire. Représente le nombre de lignes vers le haut ou vers le bas dont la cellule supérieure gauche de la référence renvoyée doit être décalée. Si l’argument lignes est égal à 5, la cellule supérieure gauche de la référence est décalée de cinq lignes en dessous de la référence. L’argument lignes peut être positif (c’est-à-dire en dessous de la référence de départ) ou négatif (c’est-à-dire au-dessus de la référence de départ).' },
            cols: { name: 'columns', detail: 'Obligatoire. Représente le nombre de colonnes vers la droite ou vers la gauche dont la cellule supérieure gauche de la référence renvoyée doit être décalée. Si l’argument colonnes est égal à 5, la cellule supérieure gauche de la référence est décalée de cinq colonnes vers la droite par rapport à la référence. L’argument colonnes peut être positif (c’est-à-dire à droite de la référence de départ) ou négatif (c’est-à-dire à gauche de la référence de départ).' },
            height: { name: 'height', detail: 'Optionnel. Représente la hauteur, exprimée en nombre de lignes que la référence renvoyée doit avoir. L’argument hauteur doit être un nombre positif.' },
            width: { name: 'width', detail: 'Optionnel. Représente la largeur, exprimée en nombre de colonnes que la référence renvoyée doit avoir. L’argument largeur doit être un nombre positif.' },
        },
    },
    ROW: {
        description: 'Donne le numéro de ligne d’une référence.',
        abstract: 'Donne le numéro de ligne d’une référence.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Optionnel. Représente la cellule ou la plage de cellules dont vous voulez obtenir le numéro de ligne. Si l’argument référence est omis, la référence par défaut est celle de la cellule dans laquelle la fonction LIGNE apparaît. Si référence est une plage de cellules et si ROW est entré en tant que tableau vertical, ROW renvoie les numéros de ligne de référence sous forme de tableau vertical. L’argument référence ne peut pas faire référence à des zones multiples.' },
        },
    },
    ROWS: {
        description: 'Renvoie le nombre de lignes d’une matrice ou d’une référence.',
        abstract: 'Renvoie le nombre de lignes d’une matrice ou d’une référence.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obligatoire. Tableau, formule matricielle ou référence à une plage de cellules pour laquelle vous souhaitez le nombre de lignes.' },
        },
    },
    RTD: {
        description: 'Récupère des données en temps réel d’un programme qui prend en charge l’automatisation COM.',
        abstract: 'Récupère des données en temps réel d’un programme qui prend en charge l’automatisation COM.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Obligatoire. Nom du ProgID d’un complément Com Automation inscrit qui a été installé sur l’ordinateur local. Placez des guillemets de part et d’autre de ce nom.' },
            server: { name: 'server', detail: 'Obligatoire. Nom du serveur sur lequel le complément doit être exécuté. Si vous ne disposez pas d’un serveur et si le programme est exécuté localement, laissez l’argument vide. Sinon, tapez des guillemets ("") de part et d’autre du nom du serveur. Si vous utilisez RTD dans Visual Basic pour Applications (VBA), des guillemets doubles ou la propriété VBA NullString sont requis pour le serveur, même si celui-ci est exécuté localement.' },
            topic1: { name: 'topic1', detail: 'Topic1 est obligatoire, les rubriques suivantes sont facultatives. Paramètres 1 à 253 qui, ensemble, représentent une donnée unique en temps réel.' },
            topic2: { name: 'topic2', detail: 'Topic1 est obligatoire, les rubriques suivantes sont facultatives. Paramètres 1 à 253 qui, ensemble, représentent une donnée unique en temps réel.' },
        },
    },
    SORT: {
        description: 'Dans cet exemple, nous faisons le tri par région, représentant commercial et produit individuellement avec =TRIER(A2:A17) copié sur les cellules F2, H2 et J2.',
        abstract: 'Dans cet exemple, nous faisons le tri par région, représentant commercial et produit individuellement avec =TRIER(A2:A17) copié sur les cellules F2, H2 et J2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'La plage ou tableau à trier' },
            sortIndex: { name: 'sort_index', detail: 'Un nombre indiquant la ligne ou colonne à trier' },
            sortOrder: { name: 'sort_order', detail: 'Un nombre indiquant l’ordre de tri désiré ; 1 pour l’ordre croissant (par défaut) -1 pour l’ordre décroissant' },
            byCol: { name: 'by_col', detail: 'Une valeur logique indiquant le sens de tri désiré ; FAUX pour effectuer le tri par ligne (par défaut), VRAI pour trier par colonne' },
        },
    },
    SORTBY: {
        description: 'Dans cet exemple, nous trions une liste de noms de personnes selon l’âge, dans l’ordre croissant.',
        abstract: 'Dans cet exemple, nous trions une liste de noms de personnes selon l’âge, dans l’ordre croissant.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'La matrice ou plage à trier' },
            byArray1: { name: 'by_array1', detail: 'La matrice ou plage selon laquelle trier' },
            sortOrder1: { name: 'sort_order1', detail: 'L’ordre à appliquer pour le tri. 1 pour l’ordre croissant, -1 pour l’ordre décroissant. L’ordre par défaut est croissant.' },
            byArray2: { name: 'by_array2', detail: 'La matrice ou plage selon laquelle trier' },
            sortOrder2: { name: 'sort_order2', detail: 'L’ordre à appliquer pour le tri. 1 pour l’ordre croissant, -1 pour l’ordre décroissant. L’ordre par défaut est croissant.' },
        },
    },
    TAKE: {
        description: 'Renvoie un nombre donné de lignes ou de colonnes contiguës depuis le début ou la fin d’une matrice.',
        abstract: 'Renvoie un nombre donné de lignes ou de colonnes contiguës depuis le début ou la fin d’une matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau à partir duquel prendre des lignes ou des colonnes.' },
            rows: { name: 'rows', detail: 'Nombre de lignes à prendre. Une valeur négative prend à partir de la fin du tableau.' },
            columns: { name: 'columns', detail: 'Nombre de colonnes à prendre. Une valeur négative prend à partir de la fin du tableau.' },
        },
    },
    TOCOL: {
        description: 'Renvoie la matrice dans une seule colonne.',
        abstract: 'Renvoie la matrice dans une seule colonne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau ou référence à renvoyer sous forme de colonne.' },
            ignore: { name: 'ignore', detail: 'Indique s’il faut ignorer certains types de valeurs. Par défaut, aucune valeur n’est ignorée :\n0 Conserver toutes les valeurs (par défaut)\n1 Ignorer les cellules vides\n2 Ignorer les erreurs\n3 Ignorer les cellules vides et les erreurs' },
            scanByColumn: { name: 'scan_by_column', detail: 'Analyse le tableau par colonne. Par défaut, il est analysé par ligne. L’analyse détermine si les valeurs sont ordonnées par ligne ou par colonne.' },
        },
    },
    TOROW: {
        description: 'Renvoie la matrice dans une seule ligne.',
        abstract: 'Renvoie la matrice dans une seule ligne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tableau ou référence à renvoyer sous forme de ligne.' },
            ignore: { name: 'ignore', detail: 'Indique s’il faut ignorer certains types de valeurs. Par défaut, aucune valeur n’est ignorée :\n0 Conserver toutes les valeurs (par défaut)\n1 Ignorer les cellules vides\n2 Ignorer les erreurs\n3 Ignorer les cellules vides et les erreurs' },
            scanByColumn: { name: 'scan_by_column', detail: 'Analyse le tableau par colonne. Par défaut, il est analysé par ligne. L’analyse détermine si les valeurs sont ordonnées par ligne ou par colonne.' },
        },
    },
    TRANSPOSE: {
        description: 'Vous devez parfois basculer ou faire pivoter des cellules. Vous pouvez effectuer ceci par copier-coller ou à l’aide de l’option TRANSPOSE . L’utilisation de celle-ci crée toutefois des données en double. Pour éviter cela, vous pouvez taper une formule plutôt que d’utiliser la fonction TRANSPOSE. Par exemple, dans l’image suivante, la formule =TRANSPOSE(A1:B4) utilise les cellules A1 à B4 et les réorganise horizontalement.',
        abstract: 'Vous devez parfois basculer ou faire pivoter des cellules. Vous pouvez effectuer ceci par copier-coller ou à l’aide de l’option TRANSPOSE . L’utilisation de celle-ci crée toutefois des données en double. Pour éviter cela, vous pouvez taper une formule plutôt que d’utiliser la fonction TRANSPOSE. Par exemple, dans l’image suivante, la formule =TRANSPOSE(A1:B4) utilise les cellules A1 à B4 et les réorganise horizontalement.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Plage de cellules ou tableau dans une feuille de calcul.' },
        },
    },
    UNIQUE: {
        description: 'Renvoyer des noms uniques à partir d’une liste de noms',
        abstract: 'Renvoyer des noms uniques à partir d’une liste de noms',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Plage ou tableau à partir duquel retourner des lignes ou des colonnes uniques' },
            byCol: { name: 'by_col', detail: 'L’argument by_col est une valeur logique indiquant comment effectuer une comparaison. TRUE compare les colonnes les unes aux autres et retourne les colonnes uniques FALSE (ou omis) compare les lignes les unes aux autres et retourne les lignes uniques' },
            exactlyOnce: { name: 'exactly_once', detail: 'L’argument exactly_once est une valeur logique qui retourne des lignes ou des colonnes qui se produisent exactement une fois dans la plage ou le tableau. Il s’agit du concept de base de données unique. TRUE retourne toutes les lignes ou colonnes distinctes qui se produisent exactement une fois à partir de la plage ou du tableau FALSE (ou omis) retourne toutes les lignes ou colonnes distinctes de la plage ou du tableau' },
        },
    },
    VLOOKUP: {
        description: 'Utilisez VLOOKUP lorsque vous devez rechercher des éléments par ligne dans un tableau ou une plage. Par exemple, recherchez le prix d’une pièce automobile par son numéro, ou le nom d’un employé à partir de son identifiant.',
        abstract: 'Utilisez VLOOKUP lorsque vous devez rechercher des éléments par ligne dans un tableau ou une plage.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: 'Valeur à rechercher. Elle doit se trouver dans la première colonne de la plage de cellules indiquée dans l’argument table_array.',
            },
            tableArray: {
                name: 'table_array',
                detail: 'Plage de cellules dans laquelle VLOOKUP recherche lookup_value et la valeur de retour. Vous pouvez utiliser une plage nommée ou un tableau, ainsi que des noms au lieu de références de cellules.',
            },
            colIndexNum: {
                name: 'col_index_num',
                detail: 'Numéro de la colonne contenant la valeur de retour, en commençant par 1 pour la colonne la plus à gauche de table_array.',
            },
            rangeLookup: {
                name: 'range_lookup',
                detail: 'Valeur logique indiquant si VLOOKUP doit trouver une concordance approximative ou exacte : approximative – 1/TRUE, exacte – 0/FALSE.',
            },
        },
    },
    VSTACK: {
        description: 'Ajoute des matrices verticalement et dans l’ordre afin de renvoyer une matrice plus grande.',
        abstract: 'Ajoute des matrices verticalement et dans l’ordre afin de renvoyer une matrice plus grande.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Les tableaux à ajouter.' },
            array2: { name: 'array', detail: 'Les tableaux à ajouter.' },
        },
    },
    WRAPCOLS: {
        description: 'Répartit la ligne ou colonne de valeurs fournie par colonnes après un nombre d’éléments indiqué.',
        abstract: 'Répartit la ligne ou colonne de valeurs fournie par colonnes après un nombre d’éléments indiqué.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Vecteur ou référence à répartir.' },
            wrapCount: { name: 'wrap_count', detail: 'Nombre maximal de valeurs pour chaque colonne.' },
            padWith: { name: 'pad_with', detail: 'Valeur à utiliser pour le remplissage. La valeur par défaut est #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Répartit la ligne ou colonne de valeurs fournie par lignes après un nombre d’éléments indiqué.',
        abstract: 'Répartit la ligne ou colonne de valeurs fournie par lignes après un nombre d’éléments indiqué.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Vecteur ou référence à répartir.' },
            wrapCount: { name: 'wrap_count', detail: 'Nombre maximal de valeurs pour chaque ligne.' },
            padWith: { name: 'pad_with', detail: 'Valeur à utiliser pour le remplissage. La valeur par défaut est #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Recherche dans une plage ou une matrice et renvoie l’élément correspondant à la première concordance trouvée. En l’absence de concordance, XLOOKUP peut renvoyer la concordance la plus proche (approximative).',
        abstract: 'Recherche dans une plage ou une matrice et renvoie l’élément correspondant à la première concordance trouvée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: 'Valeur à rechercher. Si elle est omise, XLOOKUP renvoie les cellules vides trouvées dans lookup_array.',
            },
            lookupArray: { name: 'lookup_array', detail: 'Tableau ou plage dans lequel effectuer la recherche.' },
            returnArray: { name: 'return_array', detail: 'Tableau ou plage à renvoyer.' },
            ifNotFound: {
                name: 'if_not_found',
                detail: 'Lorsqu’aucune concordance valide n’est trouvée, renvoie le texte [if_not_found] fourni. Si [if_not_found] est absent, #N/A est renvoyé.',
            },
            matchMode: {
                name: 'match_mode',
                detail: 'Indique le type de concordance : 0 – exacte, renvoie #N/A si aucune n’est trouvée (par défaut) ; -1 – exacte ou élément immédiatement inférieur ; 1 – exacte ou élément immédiatement supérieur ; 2 – concordance générique où *, ? et ~ ont une signification particulière.',
            },
            searchMode: {
                name: 'search_mode',
                detail: 'Indique le mode de recherche : 1 – depuis le premier élément (par défaut) ; -1 – recherche inversée depuis le dernier ; 2 – recherche binaire nécessitant lookup_array trié par ordre croissant ; -2 – recherche binaire nécessitant lookup_array trié par ordre décroissant. Sans tri requis, des résultats non valides peuvent être renvoyés.',
            },
        },
    },
    XMATCH: {
        description: 'Recherche un élément donné dans une matrice ou une plage de cellules, puis renvoie sa position relative.',
        abstract: 'Recherche un élément donné dans une matrice ou une plage de cellules, puis renvoie sa position relative.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Valeur de recherche.' },
            lookupArray: { name: 'lookup_array', detail: 'Le tableau ou la plage à rechercher.' },
            matchMode: { name: 'match_mode', detail: 'Type de correspondance : 0, exacte par défaut; -1, exacte ou élément immédiatement inférieur; 1, exacte ou élément immédiatement supérieur; 2, correspondance générique avec *, ? et ~.' },
            searchMode: { name: 'search_mode', detail: 'Type de recherche : 1, du premier au dernier par défaut; -1, du dernier au premier; 2, recherche binaire sur un tableau trié par ordre croissant; -2, recherche binaire sur un tableau trié par ordre décroissant.' },
        },
    },
};

export default locale;
