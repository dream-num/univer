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
    DATE: {
        description: 'Mit der Funktion DATUM wird die fortlaufende Zahl zurückgegeben, die ein bestimmtes Datum darstellt.',
        abstract: 'Mit der Funktion DATUM wird die fortlaufende Zahl zurückgegeben, die ein bestimmtes Datum darstellt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'Der Wert des Arguments year kann ein bis vier Ziffern enthalten. Excel interpretiert year entsprechend dem auf Ihrem Computer verwendeten Datumssystem. Standardmäßig verwendet Univer das Datumssystem 1900; das erste Datum ist somit der 1. Januar 1900.' },
            month: { name: 'month', detail: 'Eine positive oder negative ganze Zahl, die den Monat des Jahres von 1 bis 12 (Januar bis Dezember) darstellt.' },
            day: { name: 'day', detail: 'Eine positive oder negative ganze Zahl, die den Tag des Monats von 1 bis 31 darstellt.' },
        },
    },
    DATEDIF: {
        description: 'Berechnet die Anzahl der Tage, Monate oder Jahre zwischen zwei Datumsangaben.',
        abstract: 'Berechnet die Anzahl der Tage, Monate oder Jahre zwischen zwei Datumsangaben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Ein Datum, das das erste Datum oder das Anfangsdatum eines bestimmten Zeitraums darstellt. Datumsangaben können als Textzeichenfolgen in Anführungszeichen (z. B. "2001/1/30"), als fortlaufende Zahlen (z. B. 36921, das den 30. Januar 2001 darstellt, wenn Sie das Datumssystem 1900 verwenden) oder als Ergebnisse anderer Formeln oder Funktionen (z. B. DATEVALUE("2001/1/30")) eingegeben werden.' },
            endDate: { name: 'end_date', detail: 'Ein Datum, das das letzte Datum des Zeitraums darstellt' },
            unit: { name: 'Einheit', detail: 'Der Typ der Informationen, die zurückgegeben werden sollen, wobei: Einheit****Gibt " Y "Die Anzahl der vollständigen Jahre im Zeitraum zurück." M "Die Anzahl der vollständigen Monate im Zeitraum." D "Die Anzahl der Tage im Zeitraum." MD "Der Unterschied zwischen den Tagen in start_date und end_date. Die Monate und Jahre der Datumsangaben werden ignoriert. Wichtig: Es wird davon abgeraten, das Argument "MD" zu verwenden, da es bekannte Einschränkungen gibt. Weitere Informationen finden Sie weiter unten im Abschnitt bekannte Probleme." YM "Der Unterschied zwischen den Monaten in start_date und end_date. Die Tage und Jahre der Datumsangaben werden ignoriert" YD "Der Unterschied zwischen den Tagen der start_date und end_date. Die Jahre der Datumsangaben werden ignoriert.' },
        },
    },
    DATEVALUE: {
        description: 'Die DATEVALUE-Funktion konvertiert ein datum, das als Text gespeichert ist, in eine fortlaufende Zahl, die Excel als Datum erkennt. Die Formel =DATEVALUE("1/1/2008") gibt beispielsweise 39448 zurück, die fortlaufende Nummer des Datums 1/1/2008. Denken Sie jedoch daran, dass die Systemdatumseinstellung Ihres Computers dazu führen kann, dass die Ergebnisse einer DATEVALUE-Funktion von diesem Beispiel abweichen.',
        abstract: 'Die DATEVALUE-Funktion konvertiert ein datum, das als Text gespeichert ist, in eine fortlaufende Zahl, die Excel als Datum erkennt. Die Formel =DATEVALUE("1/1/2008") gibt beispielsweise 39448 zurück, die fortlaufende Nummer des Datums 1/1/2008. Denken Sie jedoch daran, dass die Systemdatumseinstellung Ihres Computers dazu führen kann, dass die Ergebnisse einer DATEVALUE-Funktion von diesem Beispiel abweichen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Erforderlich. Text, der ein Datum in einem Excel-Datumsformat darstellt, oder einen Verweis auf eine Zelle, die Text enthält, der ein Datum in einem Excel-Datumsformat darstellt. Beispielsweise sind "30.01.2008" oder "30-Jan-2008" Textzeichenfolgen in Anführungszeichen, die Datumsangaben darstellen. Bei Verwendung des Standarddatumssystems in Microsoft Excel für Windows muss das argument date_text ein Datum zwischen dem 1. Januar 1900 und dem 31. Dezember 9999 darstellen. Die DATEVALUE-Funktion gibt die #VALUE! Fehlerwert, wenn der Wert des date_text Arguments außerhalb dieses Bereichs liegt. Wenn der Jahresteil des date_text Arguments ausgelassen wird, verwendet die DATEVALUE-Funktion das aktuelle Jahr der integrierten Uhr Ihres Computers. Zeitinformationen im argument date_text werden ignoriert.' },
        },
    },
    DAY: {
        description: 'Gibt den Tag eines Datums als fortlaufende Zahl zurück. Der Tag wird als ganze Zahl im Bereich von 1 bis 31 ausgegeben.',
        abstract: 'Gibt den Tag eines Datums als fortlaufende Zahl zurück. Der Tag wird als ganze Zahl im Bereich von 1 bis 31 ausgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Das Datum des Tages, den Sie suchen möchten. Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Beispiel: Verwenden Sie DATUM(2008,5,23) für den 23. Mai 2008. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden .' },
        },
    },
    DAYS: {
        description: 'Gibt die Anzahl von Tagen zurück, die zwischen zwei Datumswerten liegen.',
        abstract: 'Gibt die Anzahl von Tagen zurück, die zwischen zwei Datumswerten liegen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Erforderlich. "Ausgangsdatum" und "Zieldatum" sind die beiden Datumswerte, für die Sie die dazwischen liegenden Tage berechnen möchten.' },
            startDate: { name: 'start_date', detail: 'Erforderlich. "Ausgangsdatum" und "Zieldatum" sind die beiden Datumswerte, für die Sie die dazwischen liegenden Tage berechnen möchten.' },
        },
    },
    DAYS360: {
        description: 'Mit der Funktion TAGE360 wird ausgehend von einem Jahr, das 360 Tage umfasst, die Anzahl der zwischen zwei Datumsangaben liegenden Tage berechnet. Sie können diese Funktion als Hilfe für die Berechnung von Zahlungen verwenden, wenn Ihr Buchführungssystem auf 12 Monaten mit je 30 Tagen basiert.',
        abstract: 'Mit der Funktion TAGE360 wird ausgehend von einem Jahr, das 360 Tage umfasst, die Anzahl der zwischen zwei Datumsangaben liegenden Tage berechnet. Sie können diese Funktion als Hilfe für die Berechnung von Zahlungen verwenden, wenn Ihr Buchführungssystem auf 12 Monaten mit je 30 Tagen basiert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'start_date und end_date sind die zwei Daten, zwischen denen Sie die Anzahl der Tage ermitteln möchten.' },
            endDate: { name: 'end_date', detail: 'start_date und end_date sind die zwei Daten, zwischen denen Sie die Anzahl der Tage ermitteln möchten.' },
            method: { name: 'method', detail: 'Ein Wahrheitswert, der angibt, ob für die Berechnung die US-amerikanische oder die europäische Methode verwendet werden soll.' },
        },
    },
    EDATE: {
        description: 'Gibt die fortlaufende Nummer zurück, die das Datum darstellt, das der angegebenen Anzahl von Monaten vor oder nach einem angegebenen Datum entspricht (die start_date). Verwenden Sie EDATE, um Fälligkeitstermine oder Fälligkeitstermine zu berechnen, die auf denselben Tag des Monats wie das Ausgabedatum fallen.',
        abstract: 'Gibt die fortlaufende Nummer zurück, die das Datum darstellt, das der angegebenen Anzahl von Monaten vor oder nach einem angegebenen Datum entspricht (die start_date). Verwenden Sie EDATE, um Fälligkeitstermine oder Fälligkeitstermine zu berechnen, die auf denselben Tag des Monats wie das Ausgabedatum fallen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Erforderlich. Ein Datum, das das Ausgangsdatum angibt Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Beispiel: Verwenden Sie DATUM(2008,5,23) für den 23. Mai 2008. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden .' },
            months: { name: 'months', detail: 'Erforderlich. Gibt an, wie viele Monate vor oder nach dem Ausgangsdatum liegen sollen. Ein positiver Wert für Monate ergibt ein in der Zukunft, ein negativer Wert ein in der Vergangenheit liegendes Datum.' },
        },
    },
    EOMONTH: {
        description: 'Gibt die fortlaufende Nummer für den letzten Tag des Monats zurück, die die angegebene Anzahl von Monaten vor oder nach start_date. Verwenden Sie EOMONTH, um Fälligkeitstermine oder Fälligkeitsdaten zu berechnen, die auf den letzten Tag des Monats fallen.',
        abstract: 'Gibt die fortlaufende Nummer für den letzten Tag des Monats zurück, die die angegebene Anzahl von Monaten vor oder nach start_date. Verwenden Sie EOMONTH, um Fälligkeitstermine oder Fälligkeitsdaten zu berechnen, die auf den letzten Tag des Monats fallen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Erforderlich. Ein Datum, das das Startdatum darstellt. Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Beispiel: Verwenden Sie DATUM(2008,5,23) für den 23. Mai 2008. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden .' },
            months: { name: 'months', detail: 'Erforderlich. Gibt an, wie viele Monate vor oder nach dem Ausgangsdatum liegen sollen. Ein positiver Wert für Monate ergibt ein in der Zukunft, ein negativer Wert ein in der Vergangenheit liegendes Datum. Hinweis Ist "Monate" keine ganze Zahl, werden die Nachkommastellen abgeschnitten.' },
        },
    },
    EPOCHTODATE: {
        description: 'Konvertiert einen Unix-Epochenzeitstempel in Sekunden, Millisekunden oder Mikrosekunden in eine Datums- und Uhrzeitangabe in koordinierter Weltzeit (UTC).',
        abstract: 'Konvertiert einen Unix-Epochenzeitstempel in Sekunden, Millisekunden oder Mikrosekunden in eine Datums- und Uhrzeitangabe in koordinierter Weltzeit (UTC).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/13193461?hl=de',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'Ein Unix-Epochenzeitstempel in Sekunden, Millisekunden oder Mikrosekunden.' },
            unit: { name: 'unit', detail: '[OPTIONAL – standardmäßig 1]: Die Zeiteinheit, in der der Zeitstempel angegeben ist.' },
        },
    },
    HOUR: {
        description: 'Gibt die Stunde einer Zeitangabe zurück. Die Stunde wird als ganze Zahl ausgegeben, die einen Wert von 0 (0 Uhr) bis 23 (23 Uhr) annehmen kann.',
        abstract: 'Gibt die Stunde einer Zeitangabe zurück. Die Stunde wird als ganze Zahl ausgegeben, die einen Wert von 0 (0 Uhr) bis 23 (23 Uhr) annehmen kann.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Die Zeit, die die gewünschte Stunde enthält. Zeitangaben können als Textzeichenfolgen in Anführungszeichen (z. B. "18:45"), als Dezimalzahlen (z. B. 0,78125; dieser Wert stellt 18:45 Uhr dar) oder als Ergebnis anderer Formeln oder Funktionen (z. B. ZEITWERT("18:45")) eingegeben werden.' },
        },
    },
    ISOWEEKNUM: {
        description: 'Gibt die Zahl der ISO-Kalenderwoche des Jahres für ein angegebenes Datum zurück.',
        abstract: 'Gibt die Zahl der ISO-Kalenderwoche des Jahres für ein angegebenes Datum zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Erforderlich. Der von Excel für die Datums- und Uhrzeitberechnung verwendete Datums- und Uhrzeitcode.' },
        },
    },
    MINUTE: {
        description: 'Wandelt eine fortlaufende Zahl in eine Minute um. Die Minute wird als ganze Zahl ausgegeben, die einen Wert von 0 bis 59 annehmen kann.',
        abstract: 'Wandelt eine fortlaufende Zahl in eine Minute um. Die Minute wird als ganze Zahl ausgegeben, die einen Wert von 0 bis 59 annehmen kann.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Der Code für Datum und Zeit, den Microsoft Excel für Datums- und Zeitberechnungen verwendet. Zeitangaben können als Textzeichenfolgen in Anführungszeichen (beispielsweise "18:45"), als Dezimalzahlen (beispielsweise 0,78125; dieser Wert stellt 18:45 Uhr dar) oder als Ergebnis anderer Formeln oder Funktionen (beispielsweise ZEITWERT("18:45")) eingegeben werden.' },
        },
    },
    MONTH: {
        description: 'Wandelt eine fortlaufende Zahl in einen Monat um. Der Monat wird als ganze Zahl ausgegeben, die einen Wert von 1 (Januar) bis 12 (Dezember) annehmen kann.',
        abstract: 'Wandelt eine fortlaufende Zahl in einen Monat um. Der Monat wird als ganze Zahl ausgegeben, die einen Wert von 1 (Januar) bis 12 (Dezember) annehmen kann.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Das Datum des Monats, den Sie suchen möchten. Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Beispiel: Verwenden Sie DATUM(2008,5,23) für den 23. Mai 2008. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden .' },
        },
    },
    NETWORKDAYS: {
        description: 'Gibt die Anzahl der Arbeitstage in einem Zeitintervall zurück. Nicht zu den Arbeitstagen gezählt werden Wochenenden sowie die Tage, die als Ferien (Feiertage) angegeben sind. Mit NETTOARBEITSTAGE können Sie beispielsweise die für Arbeitnehmer zu zahlenden Leistungen berechnen, die auf der zu einem bestimmten Zeitraum gehörenden Anzahl an Arbeitstagen basieren.',
        abstract: 'Gibt die Anzahl der Arbeitstage in einem Zeitintervall zurück. Nicht zu den Arbeitstagen gezählt werden Wochenenden sowie die Tage, die als Ferien (Feiertage) angegeben sind. Mit NETTOARBEITSTAGE können Sie beispielsweise die für Arbeitnehmer zu zahlenden Leistungen berechnen, die auf der zu einem bestimmten Zeitraum gehörenden Anzahl an Arbeitstagen basieren.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Erforderlich. Ein Datum, das das Ausgangsdatum angibt' },
            endDate: { name: 'end_date', detail: 'Erforderlich. Ein Datum, das das Enddatum angibt' },
            holidays: { name: 'holidays', detail: 'Optional. Ein optionaler Bereich von einer oder mehreren Datumsangaben, die alle Arten von arbeitsfreien Tagen repräsentieren kann, die aus dem Arbeitskalender ausgeschlossen werden sollen, also z. B. staatliche oder regionale Feiertage und Freischichten. Bei der Liste kann es sich entweder um einen Zellbereich, der die Datumsangaben enthält, oder eine Matrixkonstante der fortlaufenden Zahlen handeln, die die Datumsangaben darstellen.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Gibt die Anzahl der ganzen Arbeitstage zwischen zwei Datumsangaben mithilfe von Parametern zurück, um anzugeben, welche und wie viele Tage Wochenenden sind. Wochenendtage und als Feiertage angegebene Tage werden nicht als Arbeitstage betrachtet.',
        abstract: 'Gibt die Anzahl der ganzen Arbeitstage zwischen zwei Datumsangaben mithilfe von Parametern zurück, um anzugeben, welche und wie viele Tage Wochenenden sind. Wochenendtage und als Feiertage angegebene Tage werden nicht als Arbeitstage betrachtet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Ein Datum, das das Startdatum darstellt.' },
            endDate: { name: 'end_date', detail: 'Ein Datum, das das Enddatum darstellt.' },
            weekend: { name: 'weekend', detail: 'Eine Wochenendnummer oder Zeichenfolge, die angibt, wann Wochenenden auftreten.' },
            holidays: { name: 'holidays', detail: 'Ein optionaler Bereich mit einem oder mehreren Daten, die aus dem Arbeitskalender ausgeschlossen werden, etwa staatliche, bundesweite oder bewegliche Feiertage.' },
        },
    },
    NOW: {
        description: 'Mit dieser Funktion wird die fortlaufende Zahl des aktuellen Datums und der aktuellen Uhrzeit zurückgegeben. Wenn das Zellenformat vor dem Eingeben der Funktion auf Standard gesetzt war, ändert Excel das Zellenformat so, dass es dem Datums- und Uhrzeitformat in den regionalen Einstellungen entspricht. Sie können das Datums- und Uhrzeitformat für die Zelle mithilfe der Befehle ändern, die über das Menüband auf der Registerkarte Start in der Gruppe Zahl bereitstehen.',
        abstract: 'Mit dieser Funktion wird die fortlaufende Zahl des aktuellen Datums und der aktuellen Uhrzeit zurückgegeben. Wenn das Zellenformat vor dem Eingeben der Funktion auf Standard gesetzt war, ändert Excel das Zellenformat so, dass es dem Datums- und Uhrzeitformat in den regionalen Einstellungen entspricht. Sie können das Datums- und Uhrzeitformat für die Zelle mithilfe der Befehle ändern, die über das Menüband auf der Registerkarte Start in der Gruppe Zahl bereitstehen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Wandelt eine fortlaufende Zahl in eine Sekunde um. Die Sekunde wird als ganze Zahl ausgegeben, die einen Wert von 0 (Null) bis 59 annehmen kann.',
        abstract: 'Wandelt eine fortlaufende Zahl in eine Sekunde um. Die Sekunde wird als ganze Zahl ausgegeben, die einen Wert von 0 (Null) bis 59 annehmen kann.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Die Zeitangabe, die die Sekunden enthält, nach denen Sie suchen möchten. Zeitangaben können als Textzeichenfolgen in Anführungszeichen (z. B. "18:45"), als Dezimalzahlen (z. B. 0,78125; dieser Wert stellt 18:45 Uhr dar) oder als Ergebnis anderer Formeln oder Funktionen (z. B. ZEITWERT("18:45")) eingegeben werden.' },
        },
    },
    TIME: {
        description: 'Gibt die Dezimalzahl einer bestimmten Uhrzeit zurück. Wenn für das Zellenformat vor der Eingabe der Funktion die Option Allgemein festgelegt war, wird das Ergebnis als Datum formatiert.',
        abstract: 'Gibt die Dezimalzahl einer bestimmten Uhrzeit zurück. Wenn für das Zellenformat vor der Eingabe der Funktion die Option Allgemein festgelegt war, wird das Ergebnis als Datum formatiert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'Erforderlich. Eine Zahl von 0 (Null) bis 32767, die die Stunde angibt. Jeder Wert, der größer ist als 23, wird durch 24 geteilt und der Rest als Wert für die Stunde angenommen. Zum Beispiel ZEIT(27;0;0) = ZEIT(3;0;0) = 0,125 oder 3:00.' },
            minute: { name: 'minute', detail: 'Erforderlich. Eine Zahl von 0 bis 32767, die die Minute angibt. Jeder Wert, der größer ist als 59, wird in Stunden und Minuten umgerechnet. Zum Beispiel ZEIT(0;750;0) = ZEIT(12;30;0) = 0,520833 oder 12:30.' },
            second: { name: 'second', detail: 'Erforderlich. Eine Zahl von 0 bis 32767, die die Sekunde angibt. Jeder Wert, der größer ist als 59, wird in Stunden, Minuten und Sekunden umgerechnet. Zum Beispiel ZEIT(0;0;2000) = ZEIT(0;33;22) = 0,023148 oder 0:33:22' },
        },
    },
    TIMEVALUE: {
        description: 'Wandelt eine als Text vorliegende Zeitangabe in eine fortlaufende Zahl um. Diese fortlaufende Zahl ist ein Wert im Bereich von 0 (Null) bis 0.99988426 und entspricht einer Uhrzeit von 0:00:00 (24:00:00) bis 23:59:59.',
        abstract: 'Wandelt eine als Text vorliegende Zeitangabe in eine fortlaufende Zahl um. Diese fortlaufende Zahl ist ein Wert im Bereich von 0 (Null) bis 0.99988426 und entspricht einer Uhrzeit von 0:00:00 (24:00:00) bis 23:59:59.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Erforderlich. Eine Textzeichenfolge, die eine Uhrzeit in einem der Microsoft Excel-Zeitformate darstellt; Beispielsweise textzeichenfolgen "18:45 pm" und "18:45" in Anführungszeichen, die die Zeit darstellen.' },
        },
    },
    TO_DATE: {
        description: 'Konvertiert eine angegebene Zahl in ein Datum.',
        abstract: 'Konvertiert eine angegebene Zahl in ein Datum.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3094239?hl=de',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Das Argument oder der Bezug auf eine Zelle, die in ein Datum umgewandelt werden soll. Ist value eine Zahl oder ein Bezug auf eine Zelle mit einem numerischen Wert, gibt TO_DATE value als Datum zurück und interpretiert value als Anzahl der Tage seit dem 30. Dezember 1899. Negative Werte werden als Tage vor diesem Datum interpretiert, Bruchwerte geben die Uhrzeit seit Mitternacht an. Ist value keine Zahl und kein Bezug auf eine Zelle mit Zahlenwert, gibt TO_DATE value unverändert zurück.' },
        },
    },
    TODAY: {
        description: 'Die TODAY-Funktion gibt die fortlaufende Nummer des aktuellen Datums zurück. Die fortlaufende Zahl ist der Datums-/Uhrzeitcode, der von Excel für Datums- und Uhrzeitberechnungen verwendet wird. Wenn das Zellformat vor der Eingabe der Funktion Allgemein war, ändert Excel das Zellenformat in Datum . Wenn Sie die Seriennummer anzeigen möchten, müssen Sie das Zellenformat in Allgemein oder Zahl ändern.',
        abstract: 'Die TODAY-Funktion gibt die fortlaufende Nummer des aktuellen Datums zurück. Die fortlaufende Zahl ist der Datums-/Uhrzeitcode, der von Excel für Datums- und Uhrzeitberechnungen verwendet wird. Wenn das Zellformat vor der Eingabe der Funktion Allgemein war, ändert Excel das Zellenformat in Datum . Wenn Sie die Seriennummer anzeigen möchten, müssen Sie das Zellenformat in Allgemein oder Zahl ändern.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Wandelt eine fortlaufende Zahl in einen Wochentag um. Der Tag wird standardmäßig als ganze Zahl ausgegeben, die einen Wert von 1 (Sonntag) bis 7 (Samstag) annehmen kann.',
        abstract: 'Wandelt eine fortlaufende Zahl in einen Wochentag um. Der Tag wird standardmäßig als ganze Zahl ausgegeben, die einen Wert von 1 (Sonntag) bis 7 (Samstag) annehmen kann.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Eine sequenzielle Zahl, die das Datum des Tages darstellt, den Sie suchen möchten. Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Beispiel: Verwenden Sie DATUM(2008,5,23) für den 23. Mai 2008. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden.' },
            returnType: { name: 'return_type', detail: 'Optional. Eine Zahl, mit der der Typ des Rückgabewerts bestimmt wird' },
        },
    },
    WEEKNUM: {
        description: 'Gibt die Wochennummer eines bestimmten Datums zurück. Beispielsweise ist die Woche, die den 1. Januar enthält, die erste Woche des Jahres und woche 1 nummeriert.',
        abstract: 'Gibt die Wochennummer eines bestimmten Datums zurück. Beispielsweise ist die Woche, die den 1. Januar enthält, die erste Woche des Jahres und woche 1 nummeriert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Ein Datum innerhalb der Woche. Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Beispiel: Verwenden Sie DATUM(2008,5,23) für den 23. Mai 2008. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden.' },
            returnType: { name: 'return_type', detail: 'Optional. Eine Zahl, mit der festgelegt wird, an welchem Tag eine Woche beginnt. Die Standardeinstellung ist 1.' },
        },
    },
    WORKDAY: {
        description: 'Gibt die Datumsangabe als fortlaufenden Tag im Jahr zurück, vor oder nach einer bestimmten Anzahl von Arbeitstagen. Nicht zu den Arbeitstagen gezählt werden Wochenenden sowie die Tage, die als Ferien ("Freie_Tage") angegeben sind. ARBEITSTAG ermöglicht es Ihnen, Wochenenden oder Ferien auszuschließen, wenn Sie Fälligkeitstermine für Rechnungen, zu erwartende Lieferzeiten oder die Anzahl bereits verstrichener Arbeitstage berechnen möchten.',
        abstract: 'Gibt die Datumsangabe als fortlaufenden Tag im Jahr zurück, vor oder nach einer bestimmten Anzahl von Arbeitstagen. Nicht zu den Arbeitstagen gezählt werden Wochenenden sowie die Tage, die als Ferien ("Freie_Tage") angegeben sind. ARBEITSTAG ermöglicht es Ihnen, Wochenenden oder Ferien auszuschließen, wenn Sie Fälligkeitstermine für Rechnungen, zu erwartende Lieferzeiten oder die Anzahl bereits verstrichener Arbeitstage berechnen möchten.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Erforderlich. Ein Datum, das das Ausgangsdatum angibt' },
            days: { name: 'days', detail: 'Erforderlich. Die Anzahl der nicht auf ein Wochenende oder auf einen Feiertag fallenden Tage vor oder nach dem "Ausgangsdatum". Ein positiver Wert für "Tage" bedeutet ein zukünftiges Datum, und ein negativer Wert ergibt ein zurückliegendes Datum.' },
            holidays: { name: 'holidays', detail: 'Optional. Eine optionale Liste einer oder mehrerer Datumsangaben, die alle Arten von arbeitsfreien Tagen repräsentieren kann, die aus dem Arbeitskalender ausgeschlossen werden sollen, beispielsweise staatliche oder regionale Feiertage und Freischichten. Bei der Liste kann es sich um einen Zellbereich, der die Datumsangaben enthält, oder um eine Matrixkonstante der fortlaufenden Zahlen handeln, die die Datumsangaben darstellen.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Diese Funktion gibt die fortlaufende Nummer des Datums vor oder nach einer angegebenen Anzahl von Arbeitstagen mit benutzerdefinierten Wochenendparametern zurück. Optionale Weekend-Parameter können angeben, welche und wie viele Tage Wochenenden sind. Beachten Sie, dass Wochenendtage und alle Tage, die als Feiertage angegeben sind, nicht als Arbeitstage betrachtet werden.',
        abstract: 'Diese Funktion gibt die fortlaufende Nummer des Datums vor oder nach einer angegebenen Anzahl von Arbeitstagen mit benutzerdefinierten Wochenendparametern zurück. Optionale Weekend-Parameter können angeben, welche und wie viele Tage Wochenenden sind. Beachten Sie, dass Wochenendtage und alle Tage, die als Feiertage angegeben sind, nicht als Arbeitstage betrachtet werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Erforderlich. Das auf eine ganze Zahl gekürzte Startdatum' },
            days: { name: 'days', detail: 'Erforderlich. Die Anzahl der Arbeitstage vor oder nach dem start_date. Ein positiver Wert ergibt ein zukünftiges Datum; ein negativer Wert ergibt ein vergangenes Datum; ein Nullwert ergibt die bereits angegebene start_date. Der Tagoffset wird auf eine ganze Zahl abgeschnitten.' },
            weekend: { name: 'weekend', detail: 'Optional. Wenn verwendet, gibt dies die Wochentage an, die Wochenenden sind und nicht als Arbeitstage gelten. Das Weekend-Argument ist eine Wochenendnummer oder eine Zeichenfolge, die angibt, wann Wochenenden auftreten. Die Werte für die Anzahl von Wochenenden geben die Wochenenden an, wie unten dargestellt.' },
            holidays: { name: 'holidays', detail: 'Dies ist ein optionales Argument am Ende der Syntax. Es gibt einen optionalen Satz von einem oder mehreren Datumsangaben an, die aus dem Arbeitstagkalender ausgeschlossen werden sollen. Feiertage müssen ein Zellbereich sein, der die Datumsangaben enthält – oder eine Arraykonstante der seriellen Werte, die diese Datumsangaben darstellen. Die Reihenfolge von Datumsangaben oder seriellen Werten in Feiertagen kann beliebig sein.' },
        },
    },
    YEAR: {
        description: 'Wandelt eine fortlaufende Zahl in eine Jahreszahl um. Das Jahr wird als ganze Zahl zurückgegeben, die einen Wert von 1900 bis 9999 annehmen kann.',
        abstract: 'Wandelt eine fortlaufende Zahl in eine Jahreszahl um. Das Jahr wird als ganze Zahl zurückgegeben, die einen Wert von 1900 bis 9999 annehmen kann.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Erforderlich. Das Datum des Jahres, das Sie suchen möchten. Datumsangaben sollten mit der Funktion DATUM oder als Ergebnis anderer Formeln oder Funktionen eingegeben werden. Verwenden Sie beispielsweise DATE(2025,5,23) für den 23. Mai 2025. Probleme können auftreten, wenn Datumsangaben als Text eingegeben werden.' },
        },
    },
    YEARFRAC: {
        description: 'BRTEILJAHRE wandelt die Anzahl der ganzen Tage zwischen Ausgangsdatum und Enddatum in Bruchteile von Jahren um. Sie können BRTEILJAHRE beispielsweise verwenden, um Laufzeiten von Forderungen oder Verbindlichkeiten besser miteinander zu vergleichen.',
        abstract: 'BRTEILJAHRE wandelt die Anzahl der ganzen Tage zwischen Ausgangsdatum und Enddatum in Bruchteile von Jahren um. Sie können BRTEILJAHRE beispielsweise verwenden, um Laufzeiten von Forderungen oder Verbindlichkeiten besser miteinander zu vergleichen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Ein Datum, das das Startdatum darstellt.' },
            endDate: { name: 'end_date', detail: 'Ein Datum, das das Enddatum darstellt.' },
            basis: { name: 'basis', detail: 'Der zu verwendende Typ der Zinstageberechnung.' },
        },
    },
};

export default locale;
