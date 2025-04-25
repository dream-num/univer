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
            right: 'Choisir une couleur',
        },
        fillColor: {
            main: 'Couleur de fond du texte',
            right: 'Choisir une couleur',
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
    doc: {
        menu: {
            paragraphSetting: 'Paramètres de paragraphe',
        },
        slider: {
            paragraphSetting: 'Paramètres de paragraphe',
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
            fixedValue: 'Valeur fixe(px)',
        },
    },
    rightClick: {
        bulletList: 'Liste non ordonnée',
        orderList: 'Liste ordonnée',
        checkList: 'Liste de tâches',
        insertBellow: 'Insérer dans le bas',
    },
    'page-settings': {
        'document-setting': 'Paramètres du document',
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
};

export default locale;
