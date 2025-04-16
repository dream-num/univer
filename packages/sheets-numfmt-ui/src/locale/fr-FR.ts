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
    sheet: {
        numfmt: {
            title: 'Format de nombre',
            numfmtType: 'Types de format',
            cancel: 'Annuler',
            confirm: 'Confirmer',
            general: 'Général',
            accounting: 'Comptabilité',
            text: 'Texte',
            number: 'Nombre',
            percent: 'Pourcentage',
            scientific: 'Scientifique',
            currency: 'Devise',
            date: 'Date',
            time: 'Heure',
            thousandthPercentile: 'Séparateur de milliers',
            preview: 'Aperçu',
            dateTime: 'Date et heure',
            decimalLength: 'Nombre de décimales',
            currencyType: 'Symbole de devise',
            moreFmt: 'Formats',
            financialValue: 'Valeur financière',
            roundingCurrency: 'Arrondir la devise',
            timeDuration: 'Durée',
            currencyDes: 'Le format de devise est utilisé pour représenter des valeurs monétaires générales. Le format de comptabilité aligne une colonne de valeurs avec des points décimaux',
            accountingDes: 'Le format de nombre de comptabilité aligne une colonne de valeurs avec des symboles de devise et des points décimaux',
            dateType: 'Type de date',
            dateDes: 'Le format de date présente les valeurs de la série date et heure sous forme de valeurs de date.',
            negType: 'Type de nombre négatif',
            generalDes: 'Le format général ne contient aucun format de nombre spécifique.',
            thousandthPercentileDes: 'Le format de percentile est utilisé pour la représentation des nombres ordinaires. Les formats monétaires et comptables fournissent un format spécialisé pour les calculs de valeurs monétaires.',
            addDecimal: 'Augmenter les décimales',
            subtractDecimal: 'Diminuer les décimales',
            customFormat: 'Format personnalisé',
            customFormatDes: 'Générer des formats de nombre personnalisés basés sur des formats existants.',
        },
    },
};

export default locale;
