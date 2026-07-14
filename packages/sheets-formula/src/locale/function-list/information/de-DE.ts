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
    CELL: {
        description: 'Mit der Funktion ZELLE werden Informationen zur Formatierung, zur Position oder zum Inhalt einer Zelle zurückgegeben. Wenn Sie beispielsweise vor dem Ausführen einer Berechnung für eine Zelle prüfen möchten, ob sie einen numerischen Wert und keinen Text enthält, können Sie die folgende Formel verwenden:',
        abstract: 'Mit der Funktion ZELLE werden Informationen zur Formatierung, zur Position oder zum Inhalt einer Zelle zurückgegeben. Wenn Sie beispielsweise vor dem Ausführen einer Berechnung für eine Zelle prüfen möchten, ob sie einen numerischen Wert und keinen Text enthält, können Sie die folgende Formel verwenden:',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: 'Ein Textwert, der angibt, welcher Typ von Zellinformationen zurückgegeben werden soll. In der folgenden Liste werden die möglichen Werte für das Argument "Infotyp" und die entsprechenden Ergebnisse angezeigt.' },
            reference: { name: 'reference', detail: 'Die Zelle, zu der Sie Informationen wünschen. Wenn das Argument "Infotyp" ausgelassen wird, werden die darin angegebenen Informationen für die zum Zeitpunkt der Berechnung ausgewählte Zelle zurückgegeben. Wenn es sich bei dem Argument „Bezug“ um einen Zellbereich handelt, gibt die Funktion ZELLE die Informationen für die aktive Zelle im ausgewählten Bereich zurück. Wichtig: Obwohl ein Verweis technisch gesehen optional ist, wird die Aufnahme in ihre Formel empfohlen, es sei denn, Sie verstehen, welche Auswirkungen ihr Fehlen auf das Formelergebnis hat, und möchten, dass dieser Effekt vorhanden ist. Das Weglassen des Arguments Verweis liefert aus folgenden Gründen keine verlässlichen Informationen zu einer bestimmten Zelle: Im automatischen Berechnungsmodus kann die Berechnung, wenn eine Zelle von einer Person geändert wird, je nach verwendeter Excel-Plattform vor oder nach der Änderung der Auswahl ausgelöst werden. Beispielsweise löst Excel für Windows derzeit berechnungen aus, bevor die Auswahl geändert wird, aber Excel für das Web löst sie danach aus. Wenn Co-Authoring mit einem anderen Benutzer, der eine Bearbeitung vornimmt, meldet diese Funktion Ihre aktive Zelle und nicht die des Editors. Jede Neuberechnung für instance Drücken von F9 bewirkt, dass die Funktion ein neues Ergebnis zurückgibt, obwohl keine Zellbearbeitung erfolgt ist.' },
        },
    },
    ERROR_TYPE: {
        description: 'Gibt eine Zahl zurück, die einem der Fehlerwerte in Microsoft Excel entspricht, oder den Fehlerwert #NV, wenn kein Fehler vorhanden ist. Sie können FEHLER.TYP in einer WENN-Funktion verwenden, um einen Fehlerwert zu ermitteln und eine Zeichenfolge, beispielsweise eine Meldung, anstelle des Fehlerwerts zurückzugeben.',
        abstract: 'Gibt eine Zahl zurück, die einem der Fehlerwerte in Microsoft Excel entspricht, oder den Fehlerwert #NV, wenn kein Fehler vorhanden ist. Sie können FEHLER.TYP in einer WENN-Funktion verwenden, um einen Fehlerwert zu ermitteln und eine Zeichenfolge, beispielsweise eine Meldung, anstelle des Fehlerwerts zurückzugeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: 'Erforderlich. Der Fehlerwert, dessen Identifikationsnummer Sie finden möchten. Obwohl error_val der tatsächliche Fehlerwert sein kann, handelt es sich in der Regel um einen Verweis auf eine Zelle, die eine Formel enthält, die Sie testen möchten.' },
        },
    },
    INFO: {
        description: 'Gibt Informationen zur aktuellen Betriebssystemumgebung zurück.',
        abstract: 'Gibt Informationen zur aktuellen Betriebssystemumgebung zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Type_text', detail: 'Erforderlich. Text, der bestimmt, welche Art von Informationen Sie erhalten möchten' },
        },
    },
    ISBETWEEN: {
        description: 'Prüft, ob eine angegebene Zahl einschließlich oder ausschließlich zwischen zwei anderen Zahlen liegt.',
        abstract: 'Prüft, ob eine angegebene Zahl einschließlich oder ausschließlich zwischen zwei anderen Zahlen liegt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10538337?hl=de',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: 'Der Wert, der darauf geprüft wird, ob er zwischen `lower_value` und `upper_value` liegt.' },
            lowerValue: { name: 'lower_value', detail: 'Die Untergrenze des Wertebereichs, in den `value_to_compare` fallen kann.' },
            upperValue: { name: 'upper_value', detail: 'Die Obergrenze des Wertebereichs, in den `value_to_compare` fallen kann.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: 'Ob der Wertebereich `lower_value` einschließt. Standardmäßig TRUE.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: 'Ob der Wertebereich `upper_value` einschließt. Standardmäßig TRUE.' },
        },
    },
    ISBLANK: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISDATE: {
        description: 'Die Funktion ISDATE gibt zurück, ob ein Wert ein Datum ist.',
        abstract: 'Die Funktion ISDATE gibt zurück, ob ein Wert ein Datum ist.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9061381?hl=de',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Der Wert, der als Datum überprüft werden soll.' },
        },
    },
    ISEMAIL: {
        description: 'Mit der Funktion ISEMAIL wird geprüft, ob ein Wert eine gültige E-Mail-Adresse ist. Dabei wird geprüft, ob der Wert einem allgemein akzeptierten E-Mail-Adressformat entspricht, nicht jedoch, ob die Adresse tatsächlich existiert.',
        abstract: 'Mit der Funktion ISEMAIL wird geprüft, ob ein Wert eine gültige E-Mail-Adresse ist. Dabei wird geprüft, ob der Wert einem allgemein akzeptierten E-Mail-Adressformat entspricht, nicht jedoch, ob die Adresse tatsächlich existiert.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256503?hl=de',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Der Wert, der als E-Mail-Adresse überprüft werden soll.' },
        },
    },
    ISERR: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISERROR: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISEVEN: {
        description: 'Gibt WAHR zurück, wenn die Zahl gerade ist, oder FALSCH, wenn die Zahl ungerade ist.',
        abstract: 'Gibt WAHR zurück, wenn die Zahl gerade ist, oder FALSCH, wenn die Zahl ungerade ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der zu prüfende Wert. Ist "Zahl" keine ganze Zahl, werden deren Nachkommastellen abgeschnitten.' },
        },
    },
    ISFORMULA: {
        description: 'Überprüft, ob ein Bezug auf eine Zelle verweist, die eine Formel enthält, und gibt WAHR oder FALSCH zurück.',
        abstract: 'Überprüft, ob ein Bezug auf eine Zelle verweist, die eine Formel enthält, und gibt WAHR oder FALSCH zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Erforderlich. Ein Bezug auf die zu prüfende Zelle. Der Bezug kann ein Zellbezug, eine Formel oder ein Name sein, der auf eine Zelle verweist.' },
        },
    },
    ISLOGICAL: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISNA: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISNONTEXT: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISNUMBER: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISODD: {
        description: 'Gibt WAHR zurück, wenn die Zahl ungerade ist, oder FALSCH, wenn die Zahl gerade ist.',
        abstract: 'Gibt WAHR zurück, wenn die Zahl ungerade ist, oder FALSCH, wenn die Zahl gerade ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der zu prüfende Wert. Ist "Zahl" keine ganze Zahl, werden deren Nachkommastellen abgeschnitten.' },
        },
    },
    ISOMITTED: {
        description: 'Überprüft, ob der Wert in einem LAMBDA fehlt , und gibt TRUE oder FALSE zurück.',
        abstract: 'Überprüft, ob der Wert in einem LAMBDA fehlt , und gibt TRUE oder FALSE zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argument', detail: 'Der Wert, den Sie testen möchten, z. B. ein LAMBDA-Parameter.' },
        },
    },
    ISREF: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISTEXT: {
        description: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        abstract: 'Mit jeder dieser Funktionen, die zusammen als IST -Funktionen bezeichnet werden, wird der angegebene Wert überprüft und je nach Ergebnis WAHR oder FALSCH zurückgegeben. Beispielsweise gibt die Funktion ISTLEER den Wahrheitswert WAHR zurück, wenn das Argument für den Wert einen Bezug auf eine leere Zelle darstellt. Andernfalls wird FALSCH zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, der geprüft werden soll. Das Argument für den Wert kann eine leere Zelle, ein Fehlerwert, ein Wahrheitswert, Text, eine Zahl, ein Bezugswert oder ein Name sein, der sich auf eine dieser Möglichkeiten bezieht.' },
        },
    },
    ISURL: {
        description: 'Prüft, ob ein Wert eine gültige URL ist.',
        abstract: 'Prüft, ob ein Wert eine gültige URL ist.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256501?hl=de',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Der Wert, der als URL überprüft werden soll.' },
        },
    },
    N: {
        description: 'Gibt den in eine Zahl umgewandelten Wert zurück.',
        abstract: 'Gibt den in eine Zahl umgewandelten Wert zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der Wert, den Sie in eine Zahl umwandeln möchten. "N" wandelt Werte gemäß der folgenden Tabelle um.' },
        },
    },
    NA: {
        description: 'Gibt den Fehlerwert #NV zurück. #N/A ist der Fehlerwert, der bedeutet, dass kein Wert verfügbar ist. Verwenden Sie NA, um leere Zellen zu markieren. Indem Sie #NV in Zellen eingeben, die keine Informationen enthalten, können Sie verhindern, dass leere Zellen unbeabsichtigt in Ihre Berechnungen einbezogen werden. (Wenn sich eine Formel auf eine Zelle bezieht, die den Wert #NV enthält, gibt die Formel den Fehlerwert #NV zurück.)',
        abstract: 'Gibt den Fehlerwert #NV zurück. #N/A ist der Fehlerwert, der bedeutet, dass kein Wert verfügbar ist. Verwenden Sie NA, um leere Zellen zu markieren. Indem Sie #NV in Zellen eingeben, die keine Informationen enthalten, können Sie verhindern, dass leere Zellen unbeabsichtigt in Ihre Berechnungen einbezogen werden. (Wenn sich eine Formel auf eine Zelle bezieht, die den Wert #NV enthält, gibt die Formel den Fehlerwert #NV zurück.)',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'Die SHEET-Funktion gibt die Blattnummer des angegebenen Blatts oder einer anderen Referenz zurück.',
        abstract: 'Die SHEET-Funktion gibt die Blattnummer des angegebenen Blatts oder einer anderen Referenz zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Optionales Argument. Verwenden Sie diese Option, um den Namen eines Blatts oder eines Verweises anzugeben, für das Sie die Blattnummer abrufen möchten. Andernfalls gibt die Funktion die Nummer des Blatts zurück, das die SHEET-Funktion enthält.' },
        },
    },
    SHEETS: {
        description: 'Gibt die Anzahl der Blätter in einem Bezug zurück.',
        abstract: 'Gibt die Anzahl der Blätter in einem Bezug zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Gibt eine Zahl zurück, die den Datentyp des angegebenen Werts anzeigt. Die Funktion TYP können Sie immer dann verwenden, wenn das weitere Verhalten einer Funktion vom Typ des in einer bestimmten Zelle enthaltenen Werts abhängt.',
        abstract: 'Gibt eine Zahl zurück, die den Datentyp des angegebenen Werts anzeigt. Die Funktion TYP können Sie immer dann verwenden, wenn das weitere Verhalten einer Funktion vom Typ des in einer bestimmten Zelle enthaltenen Werts abhängt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Kann ein beliebiger Microsoft Excel-Wert sein, beispielsweise eine Zahl, ein Text, ein Wahrheitswert usw.' },
        },
    },
};

export default locale;
