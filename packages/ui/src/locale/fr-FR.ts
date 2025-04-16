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
        heading: {
            normal: 'Normal',
            title: 'Titre',
            subTitle: 'Sous-titre',
            1: 'Titre 1',
            2: 'Titre 2',
            3: 'Titre 3',
            4: 'Titre 4',
            5: 'Titre 5',
            6: 'Titre 6',
            tooltip: 'Définir un titre',
        },
    },
    ribbon: {
        start: 'Démarrer',
        insert: 'Insérer',
        formulas: 'Formules',
        data: 'Données',
        view: 'Vue',
        others: 'Autres',
        more: 'Plus',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: 'Microsoft YaHei',
        SimSun: 'SimSun',
        SimHei: 'SimHei',
        Kaiti: 'Kaiti',
        FangSong: 'FangSong',
        NSimSun: 'NSimSun',
        STXinwei: 'STXinwei',
        STXingkai: 'STXingkai',
        STLiti: 'STLiti',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: 'Raccourcis',
    },
    shortcut: {
        undo: 'Annuler',
        redo: 'Refaire',
        cut: 'Couper',
        copy: 'Copier',
        paste: 'Coller',
        'shortcut-panel': 'Basculer le panneau de raccourcis',
    },
    'common-edit': 'Raccourcis d\'édition courants',
    'toggle-shortcut-panel': 'Basculer le panneau de raccourcis',
    clipboard: {
        authentication: {
            title: 'Permission refusée',
            content: 'Veuillez autoriser Univer à accéder à votre presse-papiers.',
        },
    },
    textEditor: {
        formulaError: 'Veuillez entrer une formule valide, telle que =SOMME(A1)',
        rangeError: 'Veuillez entrer une plage valide, telle que A1:B10',
    },
    rangeSelector: {
        title: 'Sélectionner une plage de données',
        addAnotherRange: 'Ajouter une plage',
        buttonTooltip: 'Sélectionner une plage de données',
        placeHolder: 'Sélectionner une plage ou entrer.',
        confirm: 'Confirmer',
        cancel: 'Annuler',
    },
    'global-shortcut': 'Raccourci global',
    'zoom-slider': {
        resetTo: 'Réinitialiser à',
    },
};

export default locale;
