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
    ACCRINT: {
        description: 'Gibt die aufgelaufenen Zinsen (Stückzinsen) eines Wertpapiers mit periodischen Zinszahlungen zurück.',
        abstract: 'Gibt die aufgelaufenen Zinsen (Stückzinsen) eines Wertpapiers mit periodischen Zinszahlungen zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Erforderlich. Das Datum der Wertpapieremission' },
            firstInterest: { name: 'first_interest', detail: 'Erforderlich. Der erste Zinstermin des Wertpapiers.' },
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            rate: { name: 'rate', detail: 'Erforderlich. Der jährliche Nominalzins (Kuponzinssatz) des Wertpapiers' },
            par: { name: 'par', detail: 'Erforderlich. Der Nennwert des Wertpapiers. Wenn Sie keinen Nennwert angeben, verwendet AUFGELZINS den Wert "1.000 €".' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
            calcMethod: { name: 'calc_method', detail: 'Optional. Ein logischer Wert, der die Methode zum Berechnen des gesamten aufgelaufenen Zinses angibt, wenn das Abrechnungsdatum nach dem Datum der first_interest liegt. Der Wert TRUE (1) gibt die insgesamt aufgelaufenen Zinszahlungen von der Ausgabe bis zur Abrechnung zurück. Ein Wert von FALSE (0) gibt die aufgelaufenen Zinsen von first_interest bis zur Abrechnung zurück. Wenn Sie das Argument nicht eingeben, wird standardmäßig TRUE verwendet.' },
        },
    },
    ACCRINTM: {
        description: 'Liefert die aufgelaufenen Zinsen (Stückzinsen) eines Wertpapiers, die bei Fälligkeit ausgezahlt werden.',
        abstract: 'Liefert die aufgelaufenen Zinsen (Stückzinsen) eines Wertpapiers, die bei Fälligkeit ausgezahlt werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Erforderlich. Das Datum der Wertpapieremission' },
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers.' },
            rate: { name: 'rate', detail: 'Erforderlich. Der jährliche Nominalzins (Kuponzinssatz) des Wertpapiers' },
            par: { name: 'par', detail: 'Erforderlich. Der Nennwert des Wertpapiers. Wenn Sie keinen Nennwert angeben, verwendet AUFGELZINSF den Wert "1.000 €".' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    AMORDEGRC: {
        description: 'Gibt die Abschreibung für jeden Abrechnungszeitraum zurück. Diese Funktion wird für das französische Buchhaltungssystem bereitgestellt. Wenn ein Vermögenswert in der Mitte des Abrechnungszeitraums erworben wird, wird die anteilige Abschreibung berücksichtigt. Die Funktion ähnelt AMORLINC, mit der Ausnahme, dass bei der Berechnung abhängig von der Lebensdauer der Vermögenswerte ein Abschreibungskoeffizienten angewendet wird.',
        abstract: 'Gibt die Abschreibung für jeden Abrechnungszeitraum zurück. Diese Funktion wird für das französische Buchhaltungssystem bereitgestellt. Wenn ein Vermögenswert in der Mitte des Abrechnungszeitraums erworben wird, wird die anteilige Abschreibung berücksichtigt. Die Funktion ähnelt AMORLINC, mit der Ausnahme, dass bei der Berechnung abhängig von der Lebensdauer der Vermögenswerte ein Abschreibungskoeffizienten angewendet wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Erforderlich. Die Anschaffungskosten des Anlageguts.' },
            datePurchased: { name: 'date_purchased', detail: 'Erforderlich. Das Anschaffungsdatum des Anlageguts.' },
            firstPeriod: { name: 'first_period', detail: 'Erforderlich. Das Datum des Endes der ersten Periode.' },
            salvage: { name: 'salvage', detail: 'Erforderlich. Der Restwert, den das Anlagegut am Ende der Nutzungsdauer hat.' },
            period: { name: 'period', detail: 'Erforderlich. Die Periode.' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Abschreibungssatz.' },
            basis: { name: 'basis', detail: 'Optional. Die zu verwendende Jahresbasis.' },
        },
    },
    AMORLINC: {
        description: 'Gibt die Abschreibung für jeden Abrechnungszeitraum zurück. Diese Funktion wird für das französische Buchhaltungssystem bereitgestellt. Wenn ein Vermögenswert in der Mitte des Abrechnungszeitraums erworben wird, wird die anteilige Abschreibung berücksichtigt.',
        abstract: 'Gibt die Abschreibung für jeden Abrechnungszeitraum zurück. Diese Funktion wird für das französische Buchhaltungssystem bereitgestellt. Wenn ein Vermögenswert in der Mitte des Abrechnungszeitraums erworben wird, wird die anteilige Abschreibung berücksichtigt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Erforderlich. Die Anschaffungskosten des Anlageguts.' },
            datePurchased: { name: 'date_purchased', detail: 'Erforderlich. Das Anschaffungsdatum des Anlageguts.' },
            firstPeriod: { name: 'first_period', detail: 'Erforderlich. Das Datum des Endes der ersten Periode.' },
            salvage: { name: 'salvage', detail: 'Erforderlich. Der Restwert, den das Anlagegut am Ende der Nutzungsdauer hat.' },
            period: { name: 'period', detail: 'Erforderlich. Die Periode.' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Abschreibungssatz.' },
            basis: { name: 'basis', detail: 'Optional. Die zu verwendende Jahresbasis.' },
        },
    },
    COUPDAYBS: {
        description: 'Von der Funktion ZINSTERMTAGVA wird die Anzahl von Tagen ab dem Beginn einer Zinsperiode bis zum Abrechnungstermin zurückgegeben.',
        abstract: 'Von der Funktion ZINSTERMTAGVA wird die Anzahl von Tagen ab dem Beginn einer Zinsperiode bis zum Abrechnungstermin zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    COUPDAYS: {
        description: 'Gibt die Anzahl der Tage der Zinsperiode zurück, die den Abrechnungstermin einschließt.',
        abstract: 'Gibt die Anzahl der Tage der Zinsperiode zurück, die den Abrechnungstermin einschließt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    COUPDAYSNC: {
        description: 'Gibt die Anzahl der Tage vom Abrechnungstermin bis zum nächsten Zinstermin an.',
        abstract: 'Gibt die Anzahl der Tage vom Abrechnungstermin bis zum nächsten Zinstermin an.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    COUPNCD: {
        description: 'Gibt eine Zahl zurück, die den nächsten Zinstermin nach dem Abrechnungstermin angibt.',
        abstract: 'Gibt eine Zahl zurück, die den nächsten Zinstermin nach dem Abrechnungstermin angibt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    COUPNUM: {
        description: 'Gibt die Anzahl der zwischen dem Abrechnungsdatum und dem Fälligkeitsdatum zahlbaren Zinszahlungen an, und zwar aufgerundet zur nächsten ganzzahligen Zinszahlung.',
        abstract: 'Gibt die Anzahl der zwischen dem Abrechnungsdatum und dem Fälligkeitsdatum zahlbaren Zinszahlungen an, und zwar aufgerundet zur nächsten ganzzahligen Zinszahlung.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    COUPPCD: {
        description: 'Gibt eine Zahl an, die die letzte Zinszahlung vor dem Abrechnungstermin repräsentiert.',
        abstract: 'Gibt eine Zahl an, die die letzte Zinszahlung vor dem Abrechnungstermin repräsentiert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    CUMIPMT: {
        description: 'Berechnet die kumulierten Zinsen, die zwischen zwei Perioden zu zahlen sind.',
        abstract: 'Berechnet die kumulierten Zinsen, die zwischen zwei Perioden zu zahlen sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode.' },
            nper: { name: 'nper', detail: 'Erforderlich. Die Gesamtzahl der Zahlungsperioden (Zzr = Anzahl der Zahlungszeiträume).' },
            pv: { name: 'pv', detail: 'Erforderlich. Der Barwert oder Gegenwartswert (Bw = Barwert).' },
            startPeriod: { name: 'start_period', detail: 'Erforderlich. Die erste in die Berechnung einfließende Periode. Die Zahlungsperioden sind, beginnend mit 1, durchnummeriert.' },
            endPeriod: { name: 'end_period', detail: 'Erforderlich. Die letzte in die Berechnung einfließende Periode.' },
            type: { name: 'type', detail: 'Erforderlich. (Fälligkeit) gibt an, zu welchem Zeitpunkt einer Periode jeweils eine Zahlung fällig ist.' },
        },
    },
    CUMPRINC: {
        description: 'Berechnet die aufgelaufene Tilgung eines Darlehens, die zwischen zwei Perioden zu zahlen ist.',
        abstract: 'Berechnet die aufgelaufene Tilgung eines Darlehens, die zwischen zwei Perioden zu zahlen ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode.' },
            nper: { name: 'nper', detail: 'Erforderlich. Die Gesamtzahl der Zahlungsperioden (Zzr = Anzahl der Zahlungszeiträume).' },
            pv: { name: 'pv', detail: 'Erforderlich. Der Barwert oder Gegenwartswert (Bw = Barwert).' },
            startPeriod: { name: 'start_period', detail: 'Erforderlich. Die erste in die Berechnung einfließende Periode. Die Zahlungsperioden sind, beginnend mit 1, durchnummeriert.' },
            endPeriod: { name: 'end_period', detail: 'Erforderlich. Die letzte in die Berechnung einfließende Periode.' },
            type: { name: 'type', detail: 'Erforderlich. (Fälligkeit) gibt an, zu welchem Zeitpunkt einer Periode jeweils eine Zahlung fällig ist.' },
        },
    },
    DB: {
        description: 'Gibt die geometrisch-degressive Abschreibung eines Wirtschaftsgutes für eine bestimmte Periode zurück.',
        abstract: 'Gibt die geometrisch-degressive Abschreibung eines Wirtschaftsgutes für eine bestimmte Periode zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Erforderlich. Die Anschaffungskosten eines Wirtschaftsgutes.' },
            salvage: { name: 'salvage', detail: 'Erforderlich. Der Restwert am Ende der Nutzungsdauer (wird häufig auch als Schrottwert bezeichnet).' },
            life: { name: 'life', detail: 'Erforderlich. Die Anzahl der Perioden, über die das Wirtschaftsgut abgeschrieben wird (auch als Nutzungsdauer bezeichnet).' },
            period: { name: 'period', detail: 'Erforderlich. Die Periode, deren Abschreibungsbetrag Sie berechnen möchten. Für das Argument "Periode" muss dieselbe Zeiteinheit verwendet werden wie für die Nutzungsdauer.' },
            month: { name: 'month', detail: 'Optional. Die Anzahl der Monate im ersten Jahr. Wird das Argument "Monat" nicht angegeben, wird der Wert 12 angenommen.' },
        },
    },
    DDB: {
        description: 'Gibt die Abschreibung eines Anlagegutes für einen angegebenen Zeitraum unter Verwendung der degressiven Doppelraten-Abschreibung oder eines anderen von Ihnen angegebenen Abschreibungsverfahrens zurück.',
        abstract: 'Gibt die Abschreibung eines Anlagegutes für einen angegebenen Zeitraum unter Verwendung der degressiven Doppelraten-Abschreibung oder eines anderen von Ihnen angegebenen Abschreibungsverfahrens zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Erforderlich. Die Anschaffungskosten eines Wirtschaftsgutes.' },
            salvage: { name: 'salvage', detail: 'Erforderlich. Der Restwert am Ende der Nutzungsdauer (wird häufig auch als Schrottwert bezeichnet). Der Wert kann 0 betragen.' },
            life: { name: 'life', detail: 'Erforderlich. Die Anzahl der Perioden, über die das Wirtschaftsgut abgeschrieben wird (auch als Nutzungsdauer bezeichnet).' },
            period: { name: 'period', detail: 'Erforderlich. Die Periode, deren Abschreibungsbetrag Sie berechnen möchten. Für das Argument "Periode" muss dieselbe Zeiteinheit verwendet werden wie für die Nutzungsdauer.' },
            factor: { name: 'factor', detail: 'Optional. Die Rate, um die der Restbuchwert abnimmt. Fehlt das Argument Faktor, wird es als 2 angenommen (das Verfahren der degressiven Doppelraten-Abschreibung).' },
        },
    },
    DISC: {
        description: 'Gibt den in Prozent ausgedrückten Abzinsungssatz eines Wertpapiers zurück.',
        abstract: 'Gibt den in Prozent ausgedrückten Abzinsungssatz eines Wertpapiers zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            pr: { name: 'pr', detail: 'Erforderlich. Der Kurs des Wertpapiers pro 100 € Nennwert.' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    DOLLARDE: {
        description: 'Wandelt eine Notierung, die durch eine Kombination aus ganzer Zahl und Dezimalbruch (z. B. 1,02) ausgedrückt wurde, in eine Dezimalzahl um. Als Dezimalbrüche angegebene €-Zahlen werden z. B. für die Kurse festverzinslicher Wertpapiere oder amerikanische Aktiennotierungen verwendet.',
        abstract: 'Wandelt eine Notierung, die durch eine Kombination aus ganzer Zahl und Dezimalbruch (z. B. 1,02) ausgedrückt wurde, in eine Dezimalzahl um. Als Dezimalbrüche angegebene €-Zahlen werden z. B. für die Kurse festverzinslicher Wertpapiere oder amerikanische Aktiennotierungen verwendet.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: 'Erforderlich. Eine Zahl, die durch eine Kombination aus Ganzzahl und Dezimalbruch, getrennt durch ein Dezimaltrennzeichen ausgedrückt wurde.' },
            fraction: { name: 'fraction', detail: 'Erforderlich. Eine ganze Zahl, die als Nenner des Dezimalbruchs verwendet wird.' },
        },
    },
    DOLLARFR: {
        description: 'Mit NOTIERUNGBRU können Sie als Dezimalzahlen angegebene €-Zahlen in €-Zahlen umwandeln, die als Dezimalbrüche formuliert sind (z. B. die Kurse festverzinslicher Wertpapiere).',
        abstract: 'Mit NOTIERUNGBRU können Sie als Dezimalzahlen angegebene €-Zahlen in €-Zahlen umwandeln, die als Dezimalbrüche formuliert sind (z. B. die Kurse festverzinslicher Wertpapiere).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: 'Erforderlich. Eine Dezimalzahl.' },
            fraction: { name: 'fraction', detail: 'Erforderlich. Eine ganze Zahl, die als Nenner eines Dezimalbruchs verwendet wird.' },
        },
    },
    DURATION: {
        description: 'Die DURATION-Funktion , eine der Finanzfunktionen , gibt die Macauley-Dauer für einen angenommenen Paritätswert von 100 USD zurück. Die Duration wird als gewichteter Durchschnitt des Barwerts der Cashflows definiert und als Maß für die Reaktion eines Anleihenkurses auf Renditeänderungen verwendet.',
        abstract: 'Die DURATION-Funktion , eine der Finanzfunktionen , gibt die Macauley-Dauer für einen angenommenen Paritätswert von 100 USD zurück. Die Duration wird als gewichteter Durchschnitt des Barwerts der Cashflows definiert und als Maß für die Reaktion eines Anleihenkurses auf Renditeänderungen verwendet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            coupon: { name: 'coupon', detail: 'Erforderlich. Der jährliche Nominalzins (Kuponzinssatz) des Wertpapiers' },
            yld: { name: 'yld', detail: 'Erforderlich. Die jährliche Rendite des Wertpapiers' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    EFFECT: {
        description: 'Gibt die jährliche Effektivverzinsung zurück, ausgehend von einer Nominalverzinsung sowie der jeweiligen Anzahl der Zinszahlungen pro Jahr.',
        abstract: 'Gibt die jährliche Effektivverzinsung zurück, ausgehend von einer Nominalverzinsung sowie der jeweiligen Anzahl der Zinszahlungen pro Jahr.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'Erforderlich. Die Nominalverzinsung.' },
            npery: { name: 'npery', detail: 'Erforderlich. Die Anzahl der Verzinsungsperioden innerhalb eines Jahres' },
        },
    },
    FV: {
        description: 'ZW , eine der finanzmathematischen Funktionen , berechnet den zukünftigen Wert oder Endwert einer Investition, wobei ein konstanter Zinssatz vorausgesetzt wird. Sie können ZW entweder mit regelmäßigen, konstanten Zahlungen oder der Zahlung eines einzigen Pauschalbetrags verwenden.',
        abstract: 'ZW , eine der finanzmathematischen Funktionen , berechnet den zukünftigen Wert oder Endwert einer Investition, wobei ein konstanter Zinssatz vorausgesetzt wird. Sie können ZW entweder mit regelmäßigen, konstanten Zahlungen oder der Zahlung eines einzigen Pauschalbetrags verwenden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode (Zahlungszeitraum)' },
            nper: { name: 'nper', detail: 'Erforderlich. Gibt an, über wie viele Perioden die jeweilige Annuität (Rente) gezahlt wird.' },
            pmt: { name: 'pmt', detail: 'Erforderlich. Die Zahlung, die für jeden Zeitraum geleistet wird; sie kann sich während der Lebensdauer der Annuität nicht ändern. In der Regel enthält pmt Prinzipal und Zinsen, aber keine anderen Gebühren oder Steuern. Wenn pmt nicht angegeben wird, müssen Sie das pv-Argument einschließen.' },
            pv: { name: 'pv', detail: 'Optional. Der Barwert oder der heutige Gesamtwert einer Reihe zukünftiger Zahlungen (Bw = Barwert) Wenn pv nicht angegeben wird, wird davon ausgegangen, dass es 0 (null) ist, und Sie müssen das Argument pmt einschließen.' },
            type: { name: 'type', detail: 'Optional. Kann den Wert "0" oder "1" annehmen und gibt an, wann die Zahlungen fällig sind. Wenn type nicht angegeben wird, wird davon ausgegangen, dass er 0 ist.' },
        },
    },
    FVSCHEDULE: {
        description: 'Gibt den aufgezinsten Wert des Anfangskapitals für eine Reihe periodisch unterschiedlicher Zinssätze zurück. Mit ZW2 können Sie den Endwert (zukünftigen Wert) einer Investition (Kapitalanlage) berechnen, für die ein variabler oder wechselnder Zinssatz vereinbart ist.',
        abstract: 'Gibt den aufgezinsten Wert des Anfangskapitals für eine Reihe periodisch unterschiedlicher Zinssätze zurück. Mit ZW2 können Sie den Endwert (zukünftigen Wert) einer Investition (Kapitalanlage) berechnen, für die ein variabler oder wechselnder Zinssatz vereinbart ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'Erforderlich. Der Barwert oder Gegenwartswert (Bw = Barwert).' },
            schedule: { name: 'schedule', detail: 'Erforderlich. Eine Matrix, die die einzusetzenden Zinssätze enthält.' },
        },
    },
    INTRATE: {
        description: 'Gibt den Zinssatz eines voll investierten Wertpapiers zurück.',
        abstract: 'Gibt den Zinssatz eines voll investierten Wertpapiers zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            investment: { name: 'investment', detail: 'Erforderlich. Der Betrag, der in dem Wertpapier angelegt werden soll' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Betrag, der bei Fälligkeit zu erwarten ist' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    IPMT: {
        description: 'Gibt die Zinszahlung einer Investition für die angegebene Periode zurück, ausgehend von regelmäßigen, konstanten Zahlungen und einem konstanten Zinssatz.',
        abstract: 'Gibt die Zinszahlung einer Investition für die angegebene Periode zurück, ausgehend von regelmäßigen, konstanten Zahlungen und einem konstanten Zinssatz.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode (Zahlungszeitraum)' },
            per: { name: 'per', detail: 'Erforderlich. Der Zeitraum, für den Sie das Interesse ermitteln möchten, und muss im Bereich von 1 bis nper liegen.' },
            nper: { name: 'nper', detail: 'Erforderlich. Gibt an, über wie viele Perioden die jeweilige Annuität (Rente) gezahlt wird.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der Barwert oder der heutige Gesamtwert einer Reihe zukünftiger Zahlungen (Bw = Barwert)' },
            fv: { name: 'fv', detail: 'Optional. Der zukünftige Wert (Endwert) oder der Kassenbestand, den Sie nach der letzten Zahlung erreicht haben möchten. Fehlt das Argument "Zw", wird es als 0 angenommen (beispielsweise ist der Endwert eines Kredits gleich 0).' },
            type: { name: 'type', detail: 'Optional. Kann den Wert "0" oder "1" annehmen und gibt an, wann die Zahlungen fällig sind. Wenn type nicht angegeben wird, wird davon ausgegangen, dass er 0 ist.' },
        },
    },
    IRR: {
        description: 'Gibt den internen Zinssatz für eine Reihe von Cashflows zurück, die durch die Zahlen in -Werten dargestellt werden. Diese Cashflows müssen nicht gerade sein, wie sie für eine Annuität wären. Die Cashflows müssen jedoch in regelmäßigen Abständen erfolgen, z. B. monatlich oder jährlich. Der interne Zinssatz ist der Zinssatz für eine Investition, die aus Zahlungen (negative Werte) und Einkommen (positive Werte) besteht, die in regelmäßigen Zeiträumen auftreten.',
        abstract: 'Gibt den internen Zinssatz für eine Reihe von Cashflows zurück, die durch die Zahlen in -Werten dargestellt werden. Diese Cashflows müssen nicht gerade sein, wie sie für eine Annuität wären. Die Cashflows müssen jedoch in regelmäßigen Abständen erfolgen, z. B. monatlich oder jährlich. Der interne Zinssatz ist der Zinssatz für eine Investition, die aus Zahlungen (negative Werte) und Einkommen (positive Werte) besteht, die in regelmäßigen Zeiträumen auftreten.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Eine Matrix oder ein Bezug auf Zellen mit Zahlen, für die Sie den internen Zinsfuß berechnen möchten.\n1. Values müssen mindestens einen positiven und einen negativen Wert enthalten.\n2. IRR verwendet die Reihenfolge der Werte als Reihenfolge der Zahlungsströme. Geben Sie Zahlungen und Einnahmen daher in der gewünschten Reihenfolge ein.\n3. Text, Wahrheitswerte und leere Zellen in einer Matrix oder einem Bezug werden ignoriert.' },
            guess: { name: 'guess', detail: 'Eine Zahl, die Ihrer Schätzung nach nahe am Ergebnis von IRR liegt.' },
        },
    },
    ISPMT: {
        description: 'Berechnet die gezahlten (oder erhaltenen) Zinsen für den angegebenen Zeitraum eines Kredits (oder einer Investition) mit gleichmäßigen Tilgungszahlungen.',
        abstract: 'Berechnet die gezahlten (oder erhaltenen) Zinsen für den angegebenen Zeitraum eines Kredits (oder einer Investition) mit gleichmäßigen Tilgungszahlungen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Die Effektivverzinsung für die Investition.' },
            per: { name: 'per', detail: 'Erforderlich. Der Zeitraum, für den Sie den Zins ermitteln möchten, und muss zwischen 1 und Nper sein.' },
            nper: { name: 'nper', detail: 'Erforderlich. Die Gesamtanzahl der Zahlungszeiträume für die Investition.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der gegenwärtige Wert der Investition. Bei einem Kredit ist "Bw" die Kreditsumme.' },
        },
    },
    MDURATION: {
        description: 'Gibt die modifizierte Macauley-Dauer eines Wertpapiers mit einem angenommenen Nennwert von 100 € zurück.',
        abstract: 'Gibt die modifizierte Macauley-Dauer eines Wertpapiers mit einem angenommenen Nennwert von 100 € zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            coupon: { name: 'coupon', detail: 'Erforderlich. Der jährliche Nominalzins (Kuponzinssatz) des Wertpapiers' },
            yld: { name: 'yld', detail: 'Erforderlich. Die jährliche Rendite des Wertpapiers' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    MIRR: {
        description: 'Gibt den geänderten internen Zinssatz für eine Reihe regelmäßiger Cashflows zurück. MIRR berücksichtigt sowohl die Kosten der Investition als auch die Zinsen, die für die Reinvestition von Bargeld erhalten wurden.',
        abstract: 'Gibt den geänderten internen Zinssatz für eine Reihe regelmäßiger Cashflows zurück. MIRR berücksichtigt sowohl die Kosten der Investition als auch die Zinsen, die für die Reinvestition von Bargeld erhalten wurden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Erforderlich. Eine Matrix oder ein Bezug auf Zellen, die Zahlen enthalten. Diese Zahlen entsprechen einer Reihe von Auszahlungen (negative Werte) sowie Einzahlungen (positive Werte), die in gleichlangen Perioden erfolgen. Werte müssen mindestens einen positiven und einen negativen Wert enthalten, um die geänderte interne Rendite zu berechnen. Andernfalls gibt MIRR die #DIV/0! zurück. Enthält ein als Matrix oder Bezug angegebenes Argument Text, Wahrheitswerte oder leere Zellen, werden diese Werte ignoriert. Zellen, die den Wert 0 enthalten, werden dagegen berücksichtigt.' },
            financeRate: { name: 'finance_rate', detail: 'Erforderlich. Der Zinssatz, den Sie für die gezahlten Gelder ansetzen' },
            reinvestRate: { name: 'reinvest_rate', detail: 'Erforderlich. Der Zinssatz, den Sie für reinvestierte Gelder erzielen' },
        },
    },
    NOMINAL: {
        description: 'Gibt die jährliche Nominalverzinsung zurück, ausgehend vom effektiven Zinssatz sowie der Anzahl der Verzinsungsperioden innerhalb eines Jahres.',
        abstract: 'Gibt die jährliche Nominalverzinsung zurück, ausgehend vom effektiven Zinssatz sowie der Anzahl der Verzinsungsperioden innerhalb eines Jahres.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: 'Erforderlich. Der effektive Zinssatz (Effektivverzinsung)' },
            npery: { name: 'npery', detail: 'Erforderlich. Die Anzahl der Verzinsungsperioden innerhalb eines Jahres' },
        },
    },
    NPER: {
        description: 'Gibt die Anzahl der Zahlungsperioden einer Investition zurück, die auf periodischen, gleichbleibenden Zahlungen sowie einem konstanten Zinssatz basiert. (ZZR = Anzahl der Zahlungszeiträume)',
        abstract: 'Gibt die Anzahl der Zahlungsperioden einer Investition zurück, die auf periodischen, gleichbleibenden Zahlungen sowie einem konstanten Zinssatz basiert. (ZZR = Anzahl der Zahlungszeiträume)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode (Zahlungszeitraum)' },
            pmt: { name: 'pmt', detail: 'Erforderlich. Die Zahlung, die für jeden Zeitraum geleistet wird; sie kann sich während der Lebensdauer der Annuität nicht ändern. In der Regel enthält pmt Prinzipal und Zinsen, aber keine anderen Gebühren oder Steuern.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der Barwert oder der heutige Gesamtwert einer Reihe zukünftiger Zahlungen (Bw = Barwert)' },
            fv: { name: 'fv', detail: 'Optional. Der zukünftige Wert (Endwert) oder der Kassenbestand, den Sie nach der letzten Zahlung erreicht haben möchten. Fehlt das Argument "Zw", wird es als 0 angenommen (beispielsweise ist der Endwert eines Kredits gleich 0).' },
            type: { name: 'type', detail: 'Optional. Kann den Wert "0" oder "1" annehmen und gibt an, wann die Zahlungen fällig sind.' },
        },
    },
    NPV: {
        description: 'Liefert den Nettobarwert (Kapitalwert) einer Investition auf der Basis eines Abzinsungsfaktors für eine Reihe periodischer Zahlungen.',
        abstract: 'Liefert den Nettobarwert (Kapitalwert) einer Investition auf der Basis eines Abzinsungsfaktors für eine Reihe periodischer Zahlungen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Abzinsungsfaktor für die Dauer einer Periode' },
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 254 Argumente, die den Auszahlungen und den Einzahlungen entsprechen. Wert1; Wert2; ... müssen als Zahlungsvorgänge in gleichbleibenden Zeitabständen erfolgen und sind jeweils am Ende einer Periode vorzunehmen. NBW bestimmt anhand der Reihenfolge von Wert1; Wert2;... die Reihenfolge der Zahlungen. Sie müssen daher darauf achten, dass Sie die Auszahlungen und Einzahlungen in der richtigen Reihenfolge eingeben. Argumente, bei denen es sich um leere Zellen, Wahrheitswerte, Zahlen in Textform, Fehlerwerte oder Text handelt, der sich nicht in eine Zahl umwandeln lässt, werden ignoriert. Ist als Argument eine Matrix oder ein Bezug angegeben, werden nur die Elemente der Matrix oder des Bezugs berücksichtigt, die Zahlen enthalten. Leere Zellen, Wahrheitswerte, Texte oder Fehlerwerte werden ignoriert.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 254 Argumente, die den Auszahlungen und den Einzahlungen entsprechen. Wert1; Wert2; ... müssen als Zahlungsvorgänge in gleichbleibenden Zeitabständen erfolgen und sind jeweils am Ende einer Periode vorzunehmen. NBW bestimmt anhand der Reihenfolge von Wert1; Wert2;... die Reihenfolge der Zahlungen. Sie müssen daher darauf achten, dass Sie die Auszahlungen und Einzahlungen in der richtigen Reihenfolge eingeben. Argumente, bei denen es sich um leere Zellen, Wahrheitswerte, Zahlen in Textform, Fehlerwerte oder Text handelt, der sich nicht in eine Zahl umwandeln lässt, werden ignoriert. Ist als Argument eine Matrix oder ein Bezug angegeben, werden nur die Elemente der Matrix oder des Bezugs berücksichtigt, die Zahlen enthalten. Leere Zellen, Wahrheitswerte, Texte oder Fehlerwerte werden ignoriert.' },
        },
    },
    ODDFPRICE: {
        description: 'Liefert den Kurs pro 100 € Nennwert eines Wertpapiers mit einem unregelmäßigen (kurzen oder langen) ersten Zinstermin.',
        abstract: 'Liefert den Kurs pro 100 € Nennwert eines Wertpapiers mit einem unregelmäßigen (kurzen oder langen) ersten Zinstermin.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            issue: { name: 'issue', detail: 'Erforderlich. Das Datum der Wertpapieremission' },
            firstCoupon: { name: 'first_coupon', detail: 'Erforderlich. Der erste Zinstermin des Wertpapiers' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz des Wertpapiers.' },
            yld: { name: 'yld', detail: 'Erforderlich. Die jährliche Rendite des Wertpapiers' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    ODDFYIELD: {
        description: 'Gibt die Rendite eines Wertpapiers mit einem unregelmäßigen (kurzen oder langen) ersten Zinstermin zurück.',
        abstract: 'Gibt die Rendite eines Wertpapiers mit einem unregelmäßigen (kurzen oder langen) ersten Zinstermin zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            issue: { name: 'issue', detail: 'Erforderlich. Das Datum der Wertpapieremission' },
            firstCoupon: { name: 'first_coupon', detail: 'Erforderlich. Der erste Zinstermin des Wertpapiers' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz des Wertpapiers.' },
            pr: { name: 'pr', detail: 'Erforderlich. Der Kurs des Wertpapiers' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    ODDLPRICE: {
        description: 'Gibt den Kurs pro 100 € Nennwert eines Wertpapiers mit einem unregelmäßigen letzten Zinstermin zurück.',
        abstract: 'Gibt den Kurs pro 100 € Nennwert eines Wertpapiers mit einem unregelmäßigen letzten Zinstermin zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            lastInterest: { name: 'last_interest', detail: 'Erforderlich. Der letzte Zinstermin des Wertpapiers vor dem Fälligkeitstermin' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz des Wertpapiers.' },
            yld: { name: 'yld', detail: 'Erforderlich. Die jährliche Rendite des Wertpapiers' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    ODDLYIELD: {
        description: 'Gibt die Rendite eines Wertpapiers mit einem unregelmäßigen letzten Zinstermin unabhängig von der Dauer zurück.',
        abstract: 'Gibt die Rendite eines Wertpapiers mit einem unregelmäßigen letzten Zinstermin unabhängig von der Dauer zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            lastInterest: { name: 'last_interest', detail: 'Erforderlich. Der letzte Zinstermin des Wertpapiers vor dem Fälligkeitstermin' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz des Wertpapiers' },
            pr: { name: 'pr', detail: 'Erforderlich. Der Kurs des Wertpapiers' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    PDURATION: {
        description: 'Gibt die Anzahl von Perioden zurück, die erforderlich sind, bis eine Investition einen angegebenen Wert erreicht hat.',
        abstract: 'Gibt die Anzahl von Perioden zurück, die erforderlich sind, bis eine Investition einen angegebenen Wert erreicht hat.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Zahlungsperiode.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der aktuelle Wert der Investition.' },
            fv: { name: 'fv', detail: 'Erforderlich. Der gewünschte zukünftige Wert der Investition.' },
        },
    },
    PMT: {
        description: 'RMZ , eine der finanzmathematischen Funktionen , berechnet die konstante Zahlung einer Annuität pro Periode, wobei konstante Zahlungen und ein konstanter Zinssatz vorausgesetzt werden. (RMZ = Regelmäßige Zahlung)',
        abstract: 'RMZ , eine der finanzmathematischen Funktionen , berechnet die konstante Zahlung einer Annuität pro Periode, wobei konstante Zahlungen und ein konstanter Zinssatz vorausgesetzt werden. (RMZ = Regelmäßige Zahlung)',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode (Zahlungszeitraum).' },
            nper: { name: 'nper', detail: 'Erforderlich. Die Gesamtzahl der Zahlungen für das Darlehen.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der Barwert oder der Gesamtbetrag, den eine Reihe zukünftiger Zahlungen jetzt wert ist. Dieser Wert wird auch „Darlehenswert“ genannt.' },
            fv: { name: 'fv', detail: 'Optional. Der zukünftige Wert (Endwert) oder der Kassenbestand, den Sie nach der letzten Zahlung erreicht haben möchten. Wenn Zw weggelassen wird, wird davon ausgegangen, dass er 0 (null) ist, d. h., der zukünftige Wert eines Kredits ist 0.' },
            type: { name: 'type', detail: 'Optional. Der Wert kann 0 (null) oder 1 sein und gibt an, wann Zahlungen fällig sind.' },
        },
    },
    PPMT: {
        description: 'Gibt die Kapitalrückzahlung einer Investition für eine angegebene Periode zurück. Es werden konstante periodische Zahlungen und ein konstanter Zinssatz vorausgesetzt. (KAPZ = Kapitalrückzahlung)',
        abstract: 'Gibt die Kapitalrückzahlung einer Investition für eine angegebene Periode zurück. Es werden konstante periodische Zahlungen und ein konstanter Zinssatz vorausgesetzt. (KAPZ = Kapitalrückzahlung)',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode (Zahlungszeitraum)' },
            per: { name: 'per', detail: 'Erforderlich. Gibt den Zeitraum an und muss zwischen 1 und Zzr liegen.' },
            nper: { name: 'nper', detail: 'Erforderlich. Gibt an, über wie viele Perioden die jeweilige Annuität (Rente) gezahlt wird.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der Barwert: der Gesamtbetrag, den eine Reihe zukünftiger Zahlungen zum gegenwärtigen Zeitpunkt wert ist.' },
            fv: { name: 'fv', detail: 'Optional. Der zukünftige Wert (Endwert) oder der Kassenbestand, den Sie nach der letzten Zahlung erreicht haben möchten. Wenn Zw weggelassen wird, wird davon ausgegangen, dass er 0 (null) ist, d. h., der zukünftige Wert eines Kredits ist 0.' },
            type: { name: 'type', detail: 'Optional. Kann den Wert "0" oder "1" annehmen und gibt an, wann die Zahlungen fällig sind.' },
        },
    },
    PRICE: {
        description: 'Gibt den Kurs pro 100 € Nennwert eines Wertpapiers zurück, das periodisch Zinsen auszahlt.',
        abstract: 'Gibt den Kurs pro 100 € Nennwert eines Wertpapiers zurück, das periodisch Zinsen auszahlt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            rate: { name: 'rate', detail: 'Erforderlich. Der jährliche Nominalzins (Kuponzinssatz) des Wertpapiers' },
            yld: { name: 'yld', detail: 'Erforderlich. Die jährliche Rendite des Wertpapiers' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    PRICEDISC: {
        description: 'Gibt den Kurs pro 100 € Nennwert eines unverzinslichen Wertpapiers zurück.',
        abstract: 'Gibt den Kurs pro 100 € Nennwert eines unverzinslichen Wertpapiers zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            discount: { name: 'discount', detail: 'Erforderlich. Der in Prozent ausgedrückte Abschlag (Disagio) des Wertpapiers' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    PRICEMAT: {
        description: 'Gibt den Kurs pro 100 € Nennwert eines Wertpapiers zurück, das Zinsen am Fälligkeitsdatum auszahlt.',
        abstract: 'Gibt den Kurs pro 100 € Nennwert eines Wertpapiers zurück, das Zinsen am Fälligkeitsdatum auszahlt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            issue: { name: 'issue', detail: 'Erforderlich. Das Datum der Wertpapieremission, als fortlaufende Zahl angegeben' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz des Wertpapiers am Emissionsdatum' },
            yld: { name: 'yld', detail: 'Erforderlich. Die jährliche Rendite des Wertpapiers' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    PV: {
        description: 'BW , eine der finanzmathematischen Funktionen , berechnet den aktuellen Wert eines Darlehens oder einer Investition, wobei ein konstanter Zinssatz vorausgesetzt wird. (BW = Barwert) Sie können BW entweder mit regelmäßigen, konstanten Zahlungen (z. B. im Zusammenhang mit einer Hypothek oder einem anderen Kredit) oder mit einem zukünftigen Wert, der Ihr Investitionsziel darstellt, verwenden.',
        abstract: 'BW , eine der finanzmathematischen Funktionen , berechnet den aktuellen Wert eines Darlehens oder einer Investition, wobei ein konstanter Zinssatz vorausgesetzt wird. (BW = Barwert) Sie können BW entweder mit regelmäßigen, konstanten Zahlungen (z. B. im Zusammenhang mit einer Hypothek oder einem anderen Kredit) oder mit einem zukünftigen Wert, der Ihr Investitionsziel darstellt, verwenden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz pro Periode (Zahlungszeitraum) Wenn Sie z. B. einen Kredit für ein Auto mit einem jährlichen Zinssatz von 10 Prozent erhalten und monatliche Zahlungen leisten, beträgt der Zinssatz pro Monat 10 %/12 oder 0,83 %. Sie geben „10 %/12“ oder „0,83 %“ oder „0,0083“ als Rate in die Formel ein.' },
            nper: { name: 'nper', detail: 'Erforderlich. Gibt an, über wie viele Perioden die jeweilige Annuität (Rente) gezahlt wird. Wenn Sie beispielsweise einen 4 Jahre laufenden Kredit für ein Auto erhalten und monatliche Zahlungen leisten, weist ihr Darlehen 4 * 12 (also 48) Zeiträume auf. Sie geben „48“ in die Formel für Nper ein.' },
            pmt: { name: 'pmt', detail: 'Erforderlich. Die für jeden Zeitraum geleistete Zahlung kann sich während der Dauer der Annuität nicht ändern. In der Regel umfasst RMZ Prinzipal- und Zinszahlungen, aber keine anderen Gebühren oder Steuern. Beispielsweise betragen die monatlichen Zahlungen für einen vierjährigen Auto-Kredit für 10.000 US-Dollar mit 12 Prozent Zinsen 263,33 US-Dollar. Sie würden -263,33 als pmt in die Formel eingeben. Wenn pmt nicht angegeben wird, müssen Sie das Argument fv einschließen.' },
            fv: { name: 'fv', detail: 'Optional. Der zukünftige Wert oder ein Barguthaben, den Sie nach der letzten Zahlung erreichen möchten. Fehlt das Argument "Zw", wird es als 0 angenommen (beispielsweise ist der Endwert eines Kredits gleich 0). Wenn Sie beispielsweise 50.000 USD sparen möchten, um für ein spezielles Projekt in 18 Jahren zu bezahlen, ist 50.000 USD der zukünftige Wert. Sie können dann eine vorsichtige Schätzung zu einem Zinssatz treffen und bestimmen, wie viel Sie jeden Monat sparen müssen. Wenn "Zw" ausgelassen wird, müssen Sie das Argument "Rmz" verwenden.' },
            type: { name: 'type', detail: 'Optional. Kann den Wert "0" oder "1" annehmen und gibt an, wann die Zahlungen fällig sind.' },
        },
    },
    RATE: {
        description: 'Gibt den Zinssatz pro Zeitraum einer Annuität zurück. RATE wird nach Iteration berechnet und kann null oder mehr Lösungen enthalten. Wenn die aufeinanderfolgenden Ergebnisse von RATE nach 20 Iterationen nicht auf 0,0000001 konvergieren, gibt RATE die #NUM! zurück.',
        abstract: 'Gibt den Zinssatz pro Zeitraum einer Annuität zurück. RATE wird nach Iteration berechnet und kann null oder mehr Lösungen enthalten. Wenn die aufeinanderfolgenden Ergebnisse von RATE nach 20 Iterationen nicht auf 0,0000001 konvergieren, gibt RATE die #NUM! zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Erforderlich. Gibt an, über wie viele Perioden die jeweilige Annuität (Rente) gezahlt wird.' },
            pmt: { name: 'pmt', detail: 'Erforderlich. Die für jeden Zeitraum geleistete Zahlung kann sich während der Dauer der Annuität nicht ändern. In der Regel umfasst RMZ Prinzipal- und Zinszahlungen, aber keine anderen Gebühren oder Steuern. Wenn „RMZ“ ausgelassen wird, müssen Sie das Argument „Zw“ verwenden.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der Barwert: der Gesamtbetrag, den eine Reihe zukünftiger Zahlungen zum gegenwärtigen Zeitpunkt wert ist.' },
            fv: { name: 'fv', detail: 'Optional. Der zukünftige Wert (Endwert) oder der Kassenbestand, den Sie nach der letzten Zahlung erreicht haben möchten. Fehlt das Argument "Zw", wird es als 0 angenommen (beispielsweise ist der Endwert eines Kredits gleich 0). Wenn "Zw" ausgelassen wird, müssen Sie das Argument "Rmz" verwenden.' },
            type: { name: 'type', detail: 'Optional. Kann den Wert "0" oder "1" annehmen und gibt an, wann die Zahlungen fällig sind.' },
            guess: { name: 'guess', detail: 'Optional. Entspricht Ihrer Schätzung bezüglich der Höhe des Zinssatzes Wenn Sie keinen Wert für "Schätzwert" angeben, wird 10 Prozent angenommen. Wenn ZINS nicht konvergiert, sollten Sie einen anderen Wert für "Schätzwert" angeben. Normalerweise konvergiert ZINS, wenn "Schätzwert" zwischen 0 und 1 liegt.' },
        },
    },
    RECEIVED: {
        description: 'Gibt den Auszahlungsbetrag eines voll investierten Wertpapiers am Fälligkeitstermin zurück.',
        abstract: 'Gibt den Auszahlungsbetrag eines voll investierten Wertpapiers am Fälligkeitstermin zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            investment: { name: 'investment', detail: 'Erforderlich. Der Betrag, der in dem Wertpapier angelegt werden soll' },
            discount: { name: 'discount', detail: 'Erforderlich. Der in Prozent ausgedrückte Abschlag (Disagio) des Wertpapiers' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    RRI: {
        description: 'Gibt den effektiven Jahreszins für den Wertzuwachs einer Investition zurück.',
        abstract: 'Gibt den effektiven Jahreszins für den Wertzuwachs einer Investition zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Erforderlich. Die Anzahl der Perioden für die Investition.' },
            pv: { name: 'pv', detail: 'Erforderlich. Der aktuelle Wert der Investition.' },
            fv: { name: 'fv', detail: 'Erforderlich. Der zukünftige Wert der Investition.' },
        },
    },
    SLN: {
        description: 'Gibt die lineare Abschreibung eines Wirtschaftsgutes pro Periode zurück.',
        abstract: 'Gibt die lineare Abschreibung eines Wirtschaftsgutes pro Periode zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Erforderlich. Die Anschaffungskosten eines Wirtschaftsgutes.' },
            salvage: { name: 'salvage', detail: 'Erforderlich. Der Restwert am Ende der Nutzungsdauer (wird häufig auch als Schrottwert bezeichnet).' },
            life: { name: 'life', detail: 'Erforderlich. Die Anzahl der Perioden, über die das Wirtschaftsgut abgeschrieben wird (auch als Nutzungsdauer bezeichnet)' },
        },
    },
    SYD: {
        description: 'Gibt die arithmetisch-degressive Abschreibung eines Wirtschaftsgutes für eine bestimmte Periode zurück.',
        abstract: 'Gibt die arithmetisch-degressive Abschreibung eines Wirtschaftsgutes für eine bestimmte Periode zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Erforderlich. Die Anschaffungskosten eines Wirtschaftsgutes.' },
            salvage: { name: 'salvage', detail: 'Erforderlich. Der Restwert am Ende der Nutzungsdauer (wird häufig auch als Schrottwert bezeichnet).' },
            life: { name: 'life', detail: 'Erforderlich. Die Anzahl der Perioden, über die das Wirtschaftsgut abgeschrieben wird (auch als Nutzungsdauer bezeichnet)' },
            per: { name: 'per', detail: 'Erforderlich. Die Periode; hierfür muss dieselbe Zeiteinheit wie für die Nutzungsdauer verwendet werden.' },
        },
    },
    TBILLEQ: {
        description: 'Rechnet die Verzinsung eines Schatzwechsels (Treasury Bill) in die für Anleihen übliche einfache jährliche Verzinsung um.',
        abstract: 'Rechnet die Verzinsung eines Schatzwechsels (Treasury Bill) in die für Anleihen übliche einfache jährliche Verzinsung um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapiers. Der Abrechnungstermin des Wertpapierkaufs entspricht dem Zeitpunkt nach Emission, an dem das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            discount: { name: 'discount', detail: 'Erforderlich. Der in Prozent ausgedrückte Abschlag (Disagio) des Wertpapiers' },
        },
    },
    TBILLPRICE: {
        description: 'Gibt den Kurs pro 100 € Nennwert eines Schatzwechsels (Treasury Bill) zurück.',
        abstract: 'Gibt den Kurs pro 100 € Nennwert eines Schatzwechsels (Treasury Bill) zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapiers. Der Abrechnungstermin des Wertpapierkaufs entspricht dem Zeitpunkt nach Emission, an dem das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            discount: { name: 'discount', detail: 'Erforderlich. Der in Prozent ausgedrückte Abschlag (Disagio) des Wertpapiers' },
        },
    },
    TBILLYIELD: {
        description: 'Gibt die Rendite eines Schatzwechsels (Treasury Bill) zurück.',
        abstract: 'Gibt die Rendite eines Schatzwechsels (Treasury Bill) zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapiers. Der Abrechnungstermin des Wertpapierkaufs entspricht dem Zeitpunkt nach Emission, an dem das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            pr: { name: 'pr', detail: 'Erforderlich. Der Kurs (Kaufpreis) des Wertpapiers pro 100 € Nennwert' },
        },
    },
    VDB: {
        description: 'Gibt die degressive Doppelraten-Abschreibung eines Wirtschaftsgutes für eine bestimmte Periode oder Teilperiode zurück. VDB ist ein Akronym für "variable declining balance" (variabler abnehmender Saldo).',
        abstract: 'Gibt die degressive Doppelraten-Abschreibung eines Wirtschaftsgutes für eine bestimmte Periode oder Teilperiode zurück. VDB ist ein Akronym für "variable declining balance" (variabler abnehmender Saldo).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Erforderlich. Die Anschaffungskosten eines Wirtschaftsgutes.' },
            salvage: { name: 'salvage', detail: 'Erforderlich. Der Restwert am Ende der Nutzungsdauer (wird häufig auch als Schrottwert bezeichnet). Der Wert kann 0 betragen.' },
            life: { name: 'life', detail: 'Erforderlich. Die Anzahl der Perioden, über die das Wirtschaftsgut abgeschrieben wird (auch als Nutzungsdauer bezeichnet)' },
            startPeriod: { name: 'start_period', detail: 'Erforderlich. Der Anfangszeitraum, für den Sie die Abschreibung berechnen möchten. "Anfang" muss in derselben Zeiteinheit vorliegen wie "Nutzungsdauer".' },
            endPeriod: { name: 'end_period', detail: 'Erforderlich. Der Endzeitraum, für den Sie die Abschreibung berechnen möchten. "Ende" muss in derselben Zeiteinheit vorliegen wie "Nutzungsdauer".' },
            factor: { name: 'factor', detail: 'Optional. Die Rate, um die der Restbuchwert abnimmt. Fehlt das Argument Faktor, wird es als 2 angenommen (das Verfahren der degressiven Doppelraten-Abschreibung). Wenn Sie das Verfahren der degressiven Doppelraten-Abschreibung nicht anwenden möchten, müssen Sie einen anderen Faktor angeben. Eine Beschreibung des Verfahrens der degressiven Doppelraten-Abschreibung finden Sie unter GDA.' },
            noSwitch: { name: 'no_switch', detail: 'Optional. Ein Wahrheitswert, mit dem angegeben wird, ob zur linearen Abschreibung gewechselt werden soll, wenn der dabei berechnete Abschreibungsbetrag größer ist als der bei der geometrischen Abschreibung. Ist Nicht_wechseln mit WAHR belegt, wechselt Microsoft Excel selbst dann nicht zu dem Verfahren der linearen Abschreibung, wenn der dabei berechnete Abschreibungsbetrag größer ist als der bei der geometrischen Abschreibung. Ist Nicht_wechseln mit FALSCH belegt oder nicht angegeben, wechselt Excel zu dem Verfahren der linearen Abschreibung, wenn der dabei berechnete Abschreibungsbetrag größer ist als der bei der geometrischen Abschreibung.' },
        },
    },
    XIRR: {
        description: 'Gibt den internen Zinsfuß einer Reihe nicht periodisch anfallender Zahlungen zurück. Verwenden Sie zum Berechnen des internen Zinsflusses einer Reihe periodisch anfallender Zahlungen die Funktion IKV.',
        abstract: 'Gibt den internen Zinsfuß einer Reihe nicht periodisch anfallender Zahlungen zurück. Verwenden Sie zum Berechnen des internen Zinsflusses einer Reihe periodisch anfallender Zahlungen die Funktion IKV.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Erforderlich. Eine Reihe nicht periodisch anfallender Zahlungen, die sich auf die Zeitpunkte des Zahlungsplans beziehen. Die erste Zahlung ist optional und entspricht einer Auszahlung, die zu Beginn der jeweiligen Investition erfolgt. Wenn es sich beim ersten Wert um Kosten oder eine Zahlung handelt, muss dieser Wert negativ sein. Alle folgenden Zahlungen werden, ausgehend von einem 365-Tage-Jahr, diskontiert (abgezinst). Die Wertereihe muss mindestens einen positiven Wert und einen negativen Wert enthalten.' },
            dates: { name: 'dates', detail: 'Erforderlich. Die Zeitpunkte im Zahlungsplan der nicht periodisch anfallenden Zahlungen. Datumsangaben können in beliebiger Reihenfolge auftreten. Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Beispiel: Verwenden Sie DATUM(2008,5,23) für den 23. Mai 2008. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden. .' },
            guess: { name: 'guess', detail: 'Optional. Eine Zahl, von der Sie annehmen, dass sie dem Ergebnis der Funktion XINTZINSFUSS nahe kommt' },
        },
    },
    XNPV: {
        description: 'Gibt den Nettobarwert (Kapitalwert) einer Reihe nicht periodisch anfallender Zahlungen zurück. Verwenden Sie zum Berechnen des Nettobarwerts einer Reihe periodisch anfallender Zahlungen die Funktion NBW.',
        abstract: 'Gibt den Nettobarwert (Kapitalwert) einer Reihe nicht periodisch anfallender Zahlungen zurück. Verwenden Sie zum Berechnen des Nettobarwerts einer Reihe periodisch anfallender Zahlungen die Funktion NBW.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Erforderlich. Der Kalkulationszinsfuß, der für die Zahlungen zu berücksichtigen ist' },
            values: { name: 'values', detail: 'Erforderlich. Eine Reihe nicht periodisch anfallender Zahlungen, die sich auf die Zeitpunkte des Zahlungsplans beziehen. Die erste Zahlung ist optional und entspricht einer Auszahlung, die zu Beginn der jeweiligen Investition erfolgt. Wenn es sich beim ersten Wert um Kosten oder eine Zahlung handelt, muss dieser Wert negativ sein. Alle folgenden Zahlungen werden, ausgehend von einem 365-Tage-Jahr, diskontiert (abgezinst). Die Wertereihe muss mindestens einen positiven Wert und einen negativen Wert enthalten.' },
            dates: { name: 'dates', detail: 'Erforderlich. Die Zeitpunkte im Zahlungsplan der nicht periodisch anfallenden Zahlungen. Der erste Zahlungstermin legt den Beginn des Zahlungsplans fest. Alle anderen Termine müssen später liegen als dieser Termin, können aber in beliebiger Reihenfolge angegeben sein.' },
        },
    },
    YIELD: {
        description: 'Gibt die Rendite eines Wertpapiers zurück, das periodisch Zinsen auszahlt. Mit RENDITE können Sie die Rendite von Anleihen und Obligationen berechnen.',
        abstract: 'Gibt die Rendite eines Wertpapiers zurück, das periodisch Zinsen auszahlt. Mit RENDITE können Sie die Rendite von Anleihen und Obligationen berechnen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            rate: { name: 'rate', detail: 'Erforderlich. Der jährliche Nominalzins (Kuponzinssatz) des Wertpapiers' },
            pr: { name: 'pr', detail: 'Erforderlich. Der Kurs des Wertpapiers pro 100 € Nennwert.' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            frequency: { name: 'frequency', detail: 'Erforderlich. Die Anzahl der Zinszahlungen pro Jahr. Bei jährlichen Zahlungen ist Häufigkeit = 1; bei halbjährlichen ist Häufigkeit = 2; bei vierteljährlichen ist Häufigkeit = 4.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    YIELDDISC: {
        description: 'Gibt die jährliche Rendite eines unverzinslichen Wertpapiers zurück.',
        abstract: 'Gibt die jährliche Rendite eines unverzinslichen Wertpapiers zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            pr: { name: 'pr', detail: 'Erforderlich. Der Kurs des Wertpapiers pro 100 € Nennwert.' },
            redemption: { name: 'redemption', detail: 'Erforderlich. Der Rückzahlungswert des Wertpapiers pro 100 € Nennwert' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
    YIELDMAT: {
        description: 'Gibt die jährliche Rendite eines Wertpapiers zurück, das Zinsen am Fälligkeitsdatum auszahlt.',
        abstract: 'Gibt die jährliche Rendite eines Wertpapiers zurück, das Zinsen am Fälligkeitsdatum auszahlt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Erforderlich. Der Abrechnungstermin des Wertpapierkaufs. Der Abrechnungstermin des Wertpapierkaufs ist das Datum nach der Wertpapieremission, wenn das Wertpapier in den Besitz des Käufers übergeht.' },
            maturity: { name: 'maturity', detail: 'Erforderlich. Der Fälligkeitstermin des Wertpapiers. Dabei handelt es sich um den Zeitpunkt, zu dem das Wertpapier abläuft.' },
            issue: { name: 'issue', detail: 'Erforderlich. Das Datum der Wertpapieremission, als fortlaufende Zahl angegeben' },
            rate: { name: 'rate', detail: 'Erforderlich. Der Zinssatz des Wertpapiers am Emissionsdatum' },
            pr: { name: 'pr', detail: 'Erforderlich. Der Kurs des Wertpapiers pro 100 € Nennwert.' },
            basis: { name: 'basis', detail: 'Optional. Der Typ, auf dessen Basis die Zinstage gezählt werden.' },
        },
    },
};

export default locale;
