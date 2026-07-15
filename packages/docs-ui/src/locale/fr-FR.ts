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
    'docs-ui': {
        toolbar: {
            undo: 'Annuler',
            redo: 'Rétablir',
            font: 'Police',
            fontSize: 'Taille de la police',
            bold: 'Gras',
            italic: 'Italique',
            strikethrough: 'Barré',
            subscript: 'Indice',
            superscript: 'Exposant',
            underline: 'Souligné',
            textColor: {
                main: 'Couleur du texte',
            },
            fillColor: {
                main: 'Couleur de fond du texte',
            },
            table: {
                main: 'Tableau',
                insert: 'Insérer un tableau',
                colCount: 'Nombre de colonnes',
                rowCount: 'Nombre de lignes',
            },
            resetColor: 'Réinitialiser',
            order: 'Liste ordonnée',
            unorder: 'Liste non ordonnée',
            checklist: 'Liste de tâches',
            documentFlavor: 'Modern Mode',
            alignLeft: 'Aligner à gauche',
            alignCenter: 'Aligner au centre',
            alignRight: 'Aligner à droite',
            alignJustify: 'Justifier',
            horizontalLine: 'Horizontal line',
            headerFooter: 'En-tête et pied de page',
            pageSetup: 'Paramètres de page',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
        },
        table: {
            insert: 'Insérer',
            insertRowAbove: 'Insérer une ligne au-dessus',
            insertRowBelow: 'Insérer une ligne en dessous',
            insertColumnLeft: 'Insérer une colonne à gauche',
            insertColumnRight: 'Insérer une colonne à droite',
            delete: 'Supprimer',
            deleteRows: 'Supprimer une ligne',
            deleteColumns: 'Supprimer une colonne',
            deleteTable: 'Supprimer le tableau',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'En-tête',
            footer: 'Pied de page',
            panel: 'En-tête et pied de page',
            firstPageCheckBox: 'Différente la première page',
            oddEvenCheckBox: 'Différente les pages impaires et paires',
            headerTopMargin: 'Marge en haut de l\'en-tête(px)',
            footerBottomMargin: 'Marge en bas du pied de page(px)',
            closeHeaderFooter: 'Fermer l\'en-tête et le pied de page',
            disableText: 'Les paramètres de l\'en-tête et du pied de page sont désactivés',
        },
        placeholder: {
            heading1: 'Titre 1',
            heading2: 'Titre 2',
            heading3: 'Titre 3',
            heading4: 'Titre 4',
            heading5: 'Titre 5',
            normalText: 'Saisissez du texte ou appuyez sur « / » pour les commandes',
            listItem: 'Élément',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Faire glisser le bloc',
            },

            menu: {
                paragraphSetting: 'Paramètres de paragraphe',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Paramètres de paragraphe',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Alignement',
                indentation: 'Indentation',
                left: 'Gauche',
                right: 'Droite',
                firstLine: 'Première ligne',
                hanging: 'Retrait',
                spacing: 'Espacement',
                before: 'Avant',
                after: 'Après',
                lineSpace: 'Espacement de ligne',
                multiSpace: 'Espacement multiple',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Valeur fixe(px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
            },
        },
        rightClick: {
            copy: 'Copier',
            cut: 'Couper',
            paste: 'Coller',
            delete: 'Supprimer',
            bulletList: 'Liste non ordonnée',
            orderList: 'Liste ordonnée',
            checkList: 'Liste de tâches',
            insertBellow: 'Insérer dans le bas',
        },
        paragraphMenu: {
            alignAndIndent: 'Alignement et retrait',
            align: 'Alignement',
            indent: 'Retrait',
            color: 'Couleurs',
            increase: 'Augmenter',
            decrease: 'Diminuer',
            increaseIndent: 'Augmenter le retrait',
            decreaseIndent: 'Diminuer le retrait',
            defaultTextColor: 'Couleur de texte par défaut',
            noBackground: 'Aucun arrière-plan',
        },
        'page-settings': {
            'document-setting': 'Paramètres du document',
            mode: 'Mode',
            'modern-mode': 'Moderne',
            'classic-mode': 'Classique',
            'modern-width': 'Largeur du contenu',
            'modern-width-narrow': 'Étroit',
            'modern-width-medium': 'Moyen',
            'modern-width-wide': 'Large',
            'paper-size': 'Format du papier',
            'page-size': {
                main: 'Format du papier',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Format Lettre US',
                legal: 'Format Légal US',
                tabloid: 'Format Tabloïd',
                statement: 'Format Déclaration',
                executive: 'Format Exécutif',
                folio: 'Format Folio',
            },
            orientation: 'Orientation',
            portrait: 'Portrait',
            landscape: 'Paysage',
            'custom-paper-size': 'Format de papier personnalisé',
            top: 'Haut',
            bottom: 'Bas',
            left: 'Gauche',
            right: 'Droite',
            cancel: 'Annuler',
            confirm: 'Confirmer',
        },
    },
};

export default locale;
