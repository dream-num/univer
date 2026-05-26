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
    'sheets-numfmt-ui': {
        title: 'Zahlenformat',
        numfmtType: 'Formattypen',
        cancel: 'Abbrechen',
        confirm: 'Bestätigen',
        general: 'Allgemein',
        accounting: 'Buchhaltung',
        text: 'Text',
        number: 'Zahl',
        percent: 'Prozent',
        scientific: 'Wissenschaftlich',
        currency: 'Währung',
        date: 'Datum',
        time: 'Zeit',
        thousandthPercentile: 'Tausendertrennzeichen',
        preview: 'Vorschau',
        dateTime: 'Datum und Uhrzeit',
        decimalLength: 'Dezimalstellen',
        currencyType: 'Währungssymbol',
        moreFmt: 'Formate',
        financialValue: 'Finanzwert',
        roundingCurrency: 'Währung aufrunden',
        timeDuration: 'Dauer',
        currencyDes: 'Das Währungsformat wird verwendet, um allgemeine Währungswerte darzustellen. Das Buchhaltungsformat richtet eine Spalte von Werten an Dezimalpunkten aus',
        accountingDes: 'Das Buchhaltungszahlenformat richtet eine Spalte von Werten an Währungssymbolen und Dezimalpunkten aus',
        dateType: 'Datumstyp',
        dateDes: 'Das Datumsformat stellt Datums- und Zeitserienwerte als Datumswerte dar.',
        negType: 'Negativer Zahlentyp',
        generalDes: 'Das allgemeine Format enthält kein spezifisches Zahlenformat.',
        thousandthPercentileDes: 'Das Tausendertrennzeichenformat wird für die Darstellung gewöhnlicher Zahlen verwendet. Währungs- und Buchhaltungsformate bieten ein spezialisiertes Format für Währungswertberechnungen.',
        addDecimal: 'Dezimalstellen erhöhen',
        subtractDecimal: 'Dezimalstellen verringern',
        customFormat: 'Benutzerdefiniertes Format',
        customFormatDes: 'Benutzerdefinierte Zahlenformate basierend auf vorhandenen Formaten erstellen.',
        info: {
            error: 'Fehler',
            forceStringInfo: 'Zahl als Text gespeichert',
        },
    },
};

export default locale;
