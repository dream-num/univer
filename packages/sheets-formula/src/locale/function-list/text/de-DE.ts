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
    ASC: {
        description: 'Für Sprachen mit einem Double-Byte-Zeichensatz (DBCS) werden in dieser Funktion Zeichen normaler Breite (Double-Byte-Zeichen) in Zeichen halber Breite (Single-Byte-Zeichen) umgewandelt.',
        abstract: 'Für Sprachen mit einem Double-Byte-Zeichensatz (DBCS) werden in dieser Funktion Zeichen normaler Breite (Double-Byte-Zeichen) in Zeichen halber Breite (Single-Byte-Zeichen) umgewandelt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der Text oder der Bezug auf eine Zelle, die den Text enthält, den Sie ändern möchten. Enthält dieser Text keinen Buchstaben normaler Breite, so wird er nicht geändert.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Die MATRIXZUTEXT-Funktion gibt ein Array von Textwerten aus einem beliebigen angegebenen Bereich zurück. Er übergibt Textwerte unverändert und wandelt nicht Textwerte in Text um.',
        abstract: 'Die MATRIXZUTEXT-Funktion gibt ein Array von Textwerten aus einem beliebigen angegebenen Bereich zurück. Er übergibt Textwerte unverändert und wandelt nicht Textwerte in Text um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Die Matrix, die als Text zurückgegeben werden soll. Erforderlich.' },
            format: { name: 'format', detail: 'Das Format der zurückgegebenen Daten. Optional. Es kann sich um einen von zwei Werten handeln: 0 Standardwert. Übersichtliches Format, das einfach zu lesen ist. Der zurückgegebene Text ist derselbe wie der Text, der in einer Zelle dargestellt wird, auf die die allgemeine Formatierung angewendet wurde. 1 Strenges Format, das Escapezeichen und Zeilentrennzeichen enthält. Generiert eine Zeichenfolge, die in der Bearbeitungsleiste eingegeben werden kann. Kapselt zurückgegebene Zeichenfolgen in Anführungszeichen mit Ausnahme von booleschen Werten, Zahlen und Fehlern.' },
        },
    },
    BAHTTEXT: {
        description: 'Wandelt eine Zahl in Thai-Text um und fügt ein Suffix "Baht" hinzu.',
        abstract: 'Wandelt eine Zahl in Thai-Text um und fügt ein Suffix "Baht" hinzu.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine Zahl, die Sie in Text konvertieren möchten, oder ein Bezug auf eine Zelle, die eine Zahl enthält, oder eine Formel, deren Ergebnis eine Zahl ist.' },
        },
    },
    CHAR: {
        description: 'Gibt das der Codezahl entsprechende Zeichen zurück. Verwenden Sie ZEICHEN, um Seitenzahlen in einer anderen Codierung, die Sie aus Dateien erhalten, die auf Computern anderen Typs erstellt wurden, in Zeichen umzuwandeln.',
        abstract: 'Gibt das der Codezahl entsprechende Zeichen zurück. Verwenden Sie ZEICHEN, um Seitenzahlen in einer anderen Codierung, die Sie aus Dateien erhalten, die auf Computern anderen Typs erstellt wurden, in Zeichen umzuwandeln.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine Zahl von 1 bis 255, die das von Ihnen gewünschte Zeichen angibt. Das jeweilige Zeichen ist Bestandteil des Zeichensatzes, der auf Ihrem Computer verwendet wird. Hinweis Excel für das Web unterstützt nur CHAR(9), CHAR(10), CHAR(13) und CHAR(32) und höher.' },
        },
    },
    CLEAN: {
        description: 'Löscht alle nicht druckbaren Zeichen aus einem Text. Verwenden Sie SÄUBERN für Texte, die aus anderen Anwendungsprogrammen importiert wurden und eventuell Zeichen enthalten, die das von Ihnen verwendete Betriebssystem nicht drucken kann. Beispielsweise können Sie SÄUBERN dazu verwenden, Code zu entfernen, der sich häufig am Anfang und Ende einer Datendatei befindet und nicht gedruckt werden kann.',
        abstract: 'Löscht alle nicht druckbaren Zeichen aus einem Text. Verwenden Sie SÄUBERN für Texte, die aus anderen Anwendungsprogrammen importiert wurden und eventuell Zeichen enthalten, die das von Ihnen verwendete Betriebssystem nicht drucken kann. Beispielsweise können Sie SÄUBERN dazu verwenden, Code zu entfernen, der sich häufig am Anfang und Ende einer Datendatei befindet und nicht gedruckt werden kann.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Beliebige Arbeitsblattinformation, aus der Sie die nicht druckbaren Zeichen entfernen möchten.' },
        },
    },
    CODE: {
        description: 'Gibt die Codezahl des ersten Zeichens in einem Text zurück. Die ausgegebene Codezahl entspricht dem Zeichensatz, mit dem Ihr Computer arbeitet.',
        abstract: 'Gibt die Codezahl des ersten Zeichens in einem Text zurück. Die ausgegebene Codezahl entspricht dem Zeichensatz, mit dem Ihr Computer arbeitet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der Text, für den Sie die Codezahl des ersten Zeichens bestimmen möchten.' },
        },
    },
    CONCAT: {
        description: 'Die CONCAT-Funktion kombiniert den Text aus mehreren Bereichen und/oder Zeichenfolgen, stellt jedoch keine Trennzeichen oder IgnoreEmpty-Argumente bereit.',
        abstract: 'Die CONCAT-Funktion kombiniert den Text aus mehreren Bereichen und/oder Zeichenfolgen, stellt jedoch keine Trennzeichen oder IgnoreEmpty-Argumente bereit.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Das zu verkettende Textelement. Eine Zeichenfolge oder ein Array von Zeichenfolgen, wie z. B. ein Zellbereich.' },
            text2: { name: 'text2', detail: 'Weitere zu verkettende Textelemente. Für die Textelemente sind maximal 253 Textargumente zulässig. Dabei kann es sich jeweils um eine Zeichenfolge oder ein Array von Zeichenfolgen, wie z. B. um einen Zellbereich, handeln.' },
        },
    },
    CONCATENATE: {
        description: 'Verwenden Sie VERKETTEN , also ein der Textfunktionen , um zwei der mehr Zeichenfolgen zu einer Zeichenfolge zu verbinden.',
        abstract: 'Verwenden Sie VERKETTEN , also ein der Textfunktionen , um zwei der mehr Zeichenfolgen zu einer Zeichenfolge zu verbinden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Das erste zu verknüpfende Element. Es kann ein Textwert, eine Zahl oder ein Zellbezug sein.' },
            text2: { name: 'text2', detail: 'Weitere zu verknüpfende Textelemente. Sie können bis zu 255 Elemente mit insgesamt bis zu 8.192 Zeichen verwenden.' },
        },
    },
    DBCS: {
        description: 'Die unter diesem Hilfethema beschriebene Funktion konvertiert Buchstaben mit halber Breite (Single-Byte) in einer Zeichenfolge in Zeichen mit normaler Breite (Double-Byte). Der Name der Funktion (sowie die von ihr konvertierten Zeichen) hängt von den Ländereinstellungen ab.',
        abstract: 'Die unter diesem Hilfethema beschriebene Funktion konvertiert Buchstaben mit halber Breite (Single-Byte) in einer Zeichenfolge in Zeichen mit normaler Breite (Double-Byte). Der Name der Funktion (sowie die von ihr konvertierten Zeichen) hängt von den Ländereinstellungen ab.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der Text oder der Bezug auf eine Zelle, die den Text enthält, den Sie ändern möchten. Enthält dieser Text keine lateinischen Buchstaben oder Katakana halber Breite, so wird er nicht geändert.' },
        },
    },
    DOLLAR: {
        description: 'Die DOLLAR-Funktion , eine der TEXT-Funktionen , konvertiert eine Zahl im Währungsformat in Text, wobei die Dezimalstellen auf die von Ihnen angegebene Anzahl von Stellen gerundet werden. DOLLAR verwendet $#,###0.00_); ($#,###0,00) Zahlenformat, obwohl das angewendete Währungssymbol von Ihren Lokalen Spracheinstellungen abhängt.',
        abstract: 'Die DOLLAR-Funktion , eine der TEXT-Funktionen , konvertiert eine Zahl im Währungsformat in Text, wobei die Dezimalstellen auf die von Ihnen angegebene Anzahl von Stellen gerundet werden. DOLLAR verwendet $#,###0.00_); ($#,###0,00) Zahlenformat, obwohl das angewendete Währungssymbol von Ihren Lokalen Spracheinstellungen abhängt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine Zahl, ein Bezug auf eine Zelle, die eine Zahl enthält, oder eine Formel, die zu einer Zahl ausgewertet wird.' },
            decimals: { name: 'decimals', detail: 'Optional. Die Anzahl der Ziffern rechts vom Dezimalkomma Wenn dies negativ ist, wird die Zahl links vom Dezimaltrennzeichen gerundet. Fehlt das Argument Dezimalstellen, wird es als 2 angenommen.' },
        },
    },
    EXACT: {
        description: 'Vergleicht zwei Textzeichenfolgen und gibt TRUE zurück, wenn sie genau identisch sind, andernfalls FALSE. Bei IDENTISCH wird die Groß-/Kleinschreibung beachtet, formatierungsbezogene Unterschiede werden jedoch ignoriert. Verwenden Sie EXACT, um zu testen, ob Text in ein Dokument eingegeben wird.',
        abstract: 'Vergleicht zwei Textzeichenfolgen und gibt TRUE zurück, wenn sie genau identisch sind, andernfalls FALSE. Bei IDENTISCH wird die Groß-/Kleinschreibung beachtet, formatierungsbezogene Unterschiede werden jedoch ignoriert. Verwenden Sie EXACT, um zu testen, ob Text in ein Dokument eingegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Erforderlich. Die erste Zeichenfolge.' },
            text2: { name: 'text2', detail: 'Erforderlich. Die zweite Zeichenfolge.' },
        },
    },
    FIND: {
        description: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird beachtet).',
        abstract: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird beachtet).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Der Text, den Sie suchen möchten.' },
            withinText: { name: 'within_text', detail: 'Der Text, der den zu suchenden Text enthält.' },
            startNum: { name: 'start_num', detail: 'Gibt das Zeichen an, an dem die Suche beginnt. Wenn start_num weggelassen wird, wird 1 angenommen.' },
        },
    },
    FINDB: {
        description: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird beachtet).',
        abstract: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird beachtet).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Der Text, den Sie suchen möchten.' },
            withinText: { name: 'within_text', detail: 'Der Text, der den zu suchenden Text enthält.' },
            startNum: { name: 'start_num', detail: 'Gibt das Zeichen an, an dem die Suche beginnt. Wenn start_num weggelassen wird, wird 1 angenommen.' },
        },
    },
    FIXED: {
        description: 'Formatiert eine Zahl als Text mit einer festen Anzahl von Nachkommastellen.',
        abstract: 'Formatiert eine Zahl als Text mit einer festen Anzahl von Nachkommastellen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, die Sie runden und in Text umwandeln möchten' },
            decimals: { name: 'decimals', detail: 'Optional. Die Anzahl der Ziffern rechts vom Dezimalkomma' },
            noCommas: { name: 'no_commas', detail: 'Optional. Ein logischer Wert, der bei TRUE verhindert, dass FIXED Kommas in den zurückgegebenen Text einschließt.' },
        },
    },
    LEFT: {
        description: 'Gibt die am weitesten links stehenden Zeichen eines Textwerts zurück.',
        abstract: 'Gibt die am weitesten links stehenden Zeichen eines Textwerts zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Die Textzeichenfolge mit den Zeichen, die Sie extrahieren möchten.' },
            numChars: { name: 'num_chars', detail: 'Gibt die Anzahl der Zeichen an, die LEFT extrahieren soll.' },
        },
    },
    LEFTB: {
        description: 'Gibt die am weitesten links stehenden Zeichen eines Textwerts zurück.',
        abstract: 'Gibt die am weitesten links stehenden Zeichen eines Textwerts zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Die Textzeichenfolge mit den Zeichen, die Sie extrahieren möchten.' },
            numBytes: { name: 'num_bytes', detail: 'Gibt die Anzahl der Zeichen an, die LEFTB auf Bytebasis extrahieren soll.' },
        },
    },
    LEN: {
        description: 'Gibt die Anzahl der Zeichen in einer Textzeichenfolge zurück.',
        abstract: 'Gibt die Anzahl der Zeichen in einer Textzeichenfolge zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, dessen Länge Sie ermitteln möchten. Leerzeichen zählen als Zeichen.' },
        },
    },
    LENB: {
        description: 'Gibt die Anzahl der Bytes zurück, mit denen die Zeichen in einer Textzeichenfolge dargestellt werden.',
        abstract: 'Gibt die Anzahl der Bytes zurück, mit denen die Zeichen in einer Textzeichenfolge dargestellt werden.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, dessen Länge Sie ermitteln möchten. Leerzeichen zählen als Zeichen.' },
        },
    },
    LOWER: {
        description: 'Wandelt einen Text in Kleinbuchstaben um.',
        abstract: 'Wandelt einen Text in Kleinbuchstaben um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der Text, den Sie in Kleinbuchstaben umwandeln möchten. "KLEIN" nimmt an Zeichen des Texts, die keine Buchstaben sind, keine Änderungen vor.' },
        },
    },
    MID: {
        description: 'Gibt eine bestimmte Anzahl von Zeichen aus einer Textzeichenfolge zurück, beginnend an der angegebenen Position.',
        abstract: 'Gibt eine bestimmte Anzahl von Zeichen aus einer Textzeichenfolge zurück, beginnend an der angegebenen Position.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Die Textzeichenfolge mit den Zeichen, die Sie extrahieren möchten.' },
            startNum: { name: 'start_num', detail: 'Die Position des ersten Zeichens in text, das Sie extrahieren möchten.' },
            numChars: { name: 'num_chars', detail: 'Gibt die Anzahl der Zeichen an, die MID extrahieren soll.' },
        },
    },
    MIDB: {
        description: 'Gibt eine bestimmte Anzahl von Zeichen aus einer Textzeichenfolge zurück, beginnend an der angegebenen Position.',
        abstract: 'Gibt eine bestimmte Anzahl von Zeichen aus einer Textzeichenfolge zurück, beginnend an der angegebenen Position.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Die Textzeichenfolge mit den Zeichen, die Sie extrahieren möchten.' },
            startNum: { name: 'start_num', detail: 'Die Position des ersten Zeichens in text, das Sie extrahieren möchten.' },
            numBytes: { name: 'num_bytes', detail: 'Gibt die Anzahl der Zeichen an, die MIDB auf Bytebasis extrahieren soll.' },
        },
    },
    NUMBERSTRING: {
        description: 'Konvertiert Zahlen in chinesische Zeichenfolgen.',
        abstract: 'Konvertiert Zahlen in chinesische Zeichenfolgen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Der Wert, der in eine chinesische Zeichenfolge umgewandelt wird.' },
            type: { name: 'type', detail: 'Der Typ des zurückgegebenen Ergebnisses. \n1. Chinesische Kleinbuchstaben \n2. Chinesische Großbuchstaben \n3. Chinesische Schriftzeichen zum Lesen und Schreiben' },
        },
    },
    NUMBERVALUE: {
        description: 'Konvertiert Text in Zahlen auf eine Weise, die vom Gebietsschema unabhängig ist.',
        abstract: 'Konvertiert Text in Zahlen auf eine Weise, die vom Gebietsschema unabhängig ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der in eine Zahl zu konvertierende Text.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'Optional. Das Zeichen, das zum Trennen der ganzen Zahl von den Nachkommastellen des Ergebnisses verwendet wird.' },
            groupSeparator: { name: 'group_separator', detail: 'Optional. Das Zeichen, das zum Trennen von Zahlengruppen verwendet wird, z. B. zwischen Tausender und Hunderter oder zwischen Millionen und Tausender.' },
        },
    },
    PHONETIC: {
        description: 'Extrahiert die phonetischen (Furigana-) Zeichen aus einer Textzeichenfolge.',
        abstract: 'Extrahiert die phonetischen (Furigana-) Zeichen aus einer Textzeichenfolge.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Verweis', detail: 'Erforderlich. Textzeichenfolge oder ein Verweis auf eine einzelne Zelle oder einen Zellbereich, die eine Furigana-Textzeichenfolge enthalten.' },
        },
    },
    PROPER: {
        description: 'Wandelt den ersten Buchstaben aller Wörter einer Zeichenfolge in Großbuchstaben um. Wandelt alle anderen Buchstaben in Kleinbuchstaben um.',
        abstract: 'Wandelt den ersten Buchstaben aller Wörter einer Zeichenfolge in Großbuchstaben um. Wandelt alle anderen Buchstaben in Kleinbuchstaben um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. In Anführungszeichen eingeschlossener Text, eine Formel, die Text zurückgibt, oder ein Bezug auf eine Zelle, die den Text enthält, den Sie teilweise groß schreiben möchten' },
        },
    },
    REGEXEXTRACT: {
        description: 'Extrahiert die erste Teilzeichenfolge, die einem regulären Ausdruck entspricht.',
        abstract: 'Extrahiert die erste Teilzeichenfolge, die einem regulären Ausdruck entspricht.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=de',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Eingabetext.' },
            regularExpression: { name: 'regular_expression', detail: 'Der erste Teil von text, der diesem Ausdruck entspricht, wird zurückgegeben.' },
        },
    },
    REGEXMATCH: {
        description: 'Gibt zurück, ob ein Text einem regulären Ausdruck entspricht.',
        abstract: 'Gibt zurück, ob ein Text einem regulären Ausdruck entspricht.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=de',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, der mit dem regulären Ausdruck geprüft werden soll.' },
            regularExpression: { name: 'regular_expression', detail: 'Der reguläre Ausdruck, mit dem der Text geprüft wird.' },
        },
    },
    REGEXREPLACE: {
        description: 'Ersetzt mithilfe regulärer Ausdrücke einen Teil einer Textzeichenfolge durch eine andere Textzeichenfolge.',
        abstract: 'Ersetzt mithilfe regulärer Ausdrücke einen Teil einer Textzeichenfolge durch eine andere Textzeichenfolge.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=de',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, von dem ein Teil ersetzt wird.' },
            regularExpression: { name: 'regular_expression', detail: 'Der reguläre Ausdruck. Alle passenden Vorkommen in text werden ersetzt.' },
            replacement: { name: 'replacement', detail: 'Der Text, der in den ursprünglichen Text eingefügt wird.' },
        },
    },
    REPLACE: {
        description: 'Ersetzt Zeichen innerhalb eines Texts.',
        abstract: 'Ersetzt Zeichen innerhalb eines Texts.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Text, in dem Sie einige Zeichen ersetzen möchten.' },
            startNum: { name: 'start_num', detail: 'Die Position des Zeichens in old_text, das Sie durch new_text ersetzen möchten.' },
            numChars: { name: 'num_chars', detail: 'Die Anzahl der Zeichen in old_text, die REPLACE durch new_text ersetzen soll.' },
            newText: { name: 'new_text', detail: 'Der Text, der Zeichen in old_text ersetzt.' },
        },
    },
    REPLACEB: {
        description: 'Ersetzt Zeichen innerhalb eines Texts.',
        abstract: 'Ersetzt Zeichen innerhalb eines Texts.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Text, in dem Sie einige Zeichen ersetzen möchten.' },
            startNum: { name: 'start_num', detail: 'Die Position des Zeichens in old_text, das Sie durch new_text ersetzen möchten.' },
            numBytes: { name: 'num_bytes', detail: 'Die Anzahl der Bytes in old_text, die REPLACEB durch new_text ersetzen soll.' },
            newText: { name: 'new_text', detail: 'Der Text, der Zeichen in old_text ersetzt.' },
        },
    },
    REPT: {
        description: 'Wiederholt einen Text so oft wie angegeben. Verwenden Sie WIEDERHOLEN, um eine Zeichenfolge (eine Basiszeichenfolge) in einer bestimmten Häufigkeit in eine Zelle einzugeben.',
        abstract: 'Wiederholt einen Text so oft wie angegeben. Verwenden Sie WIEDERHOLEN, um eine Zeichenfolge (eine Basiszeichenfolge) in einer bestimmten Häufigkeit in eine Zelle einzugeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der Text, den Sie wiederholen möchten' },
            numberTimes: { name: 'number_times', detail: 'Erforderlich. Eine positive Zahl, die angibt, wie oft "Text" wiederholt werden soll' },
        },
    },
    RIGHT: {
        description: 'Gibt die am weitesten rechts stehenden Zeichen eines Textwerts zurück.',
        abstract: 'Gibt die am weitesten rechts stehenden Zeichen eines Textwerts zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Die Textzeichenfolge mit den Zeichen, die Sie extrahieren möchten.' },
            numChars: { name: 'num_chars', detail: 'Gibt die Anzahl der Zeichen an, die RIGHT extrahieren soll.' },
        },
    },
    RIGHTB: {
        description: 'Gibt die am weitesten rechts stehenden Zeichen eines Textwerts zurück.',
        abstract: 'Gibt die am weitesten rechts stehenden Zeichen eines Textwerts zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Die Textzeichenfolge mit den Zeichen, die Sie extrahieren möchten.' },
            numBytes: { name: 'num_bytes', detail: 'Gibt die Anzahl der Zeichen an, die RIGHTB auf Bytebasis extrahieren soll.' },
        },
    },
    SEARCH: {
        description: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird nicht beachtet).',
        abstract: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird nicht beachtet).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Der Text, den Sie suchen möchten.' },
            withinText: { name: 'within_text', detail: 'Der Text, der den zu suchenden Text enthält.' },
            startNum: { name: 'start_num', detail: 'Gibt das Zeichen an, an dem die Suche beginnt. Wenn start_num weggelassen wird, wird 1 angenommen.' },
        },
    },
    SEARCHB: {
        description: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird nicht beachtet).',
        abstract: 'Sucht eine Textzeichenfolge innerhalb einer anderen (Groß-/Kleinschreibung wird nicht beachtet).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Der Text, den Sie suchen möchten.' },
            withinText: { name: 'within_text', detail: 'Der Text, der den zu suchenden Text enthält.' },
            startNum: { name: 'start_num', detail: 'Gibt das Zeichen an, an dem die Suche beginnt. Wenn start_num weggelassen wird, wird 1 angenommen.' },
        },
    },
    SUBSTITUTE: {
        description: 'Ersetzt new_text durch old_text in einer Textzeichenfolge. Verwenden Sie SUBSTITUTE, wenn Sie bestimmten Text in einer Textzeichenfolge ersetzen möchten. Verwenden Sie REPLACE, wenn Sie Text ersetzen möchten, der an einer bestimmten Stelle in einer Textzeichenfolge vorkommt.',
        abstract: 'Ersetzt new_text durch old_text in einer Textzeichenfolge. Verwenden Sie SUBSTITUTE, wenn Sie bestimmten Text in einer Textzeichenfolge ersetzen möchten. Verwenden Sie REPLACE, wenn Sie Text ersetzen möchten, der an einer bestimmten Stelle in einer Textzeichenfolge vorkommt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der in Anführungszeichen gesetzte Text oder der Bezug auf eine Zelle, die den Text enthält, in dem Zeichen ausgetauscht werden sollen' },
            oldText: { name: 'old_text', detail: 'Erforderlich. Der Text, den Sie ersetzen möchten' },
            newText: { name: 'new_text', detail: 'Erforderlich. Der Text, durch den Sie "Alter_Text" ersetzen möchten' },
            instanceNum: { name: 'instance_num', detail: 'Optional. Gibt an, an welchen Stellen "Alter Text" durch "Neuer_Text" ersetzt werden soll. Wenn Sie "ntes_Auftreten" angeben, wird nur dieses Vorkommen von "Alter_Text" ersetzt. Andernfalls wird "Alter_Text" an jeder Stelle, an der er in "Text" vorkommt, durch "Neuer_Text" ersetzt.' },
        },
    },
    T: {
        description: 'Wandelt die Argumente in Text um.',
        abstract: 'Wandelt die Argumente in Text um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Der zu testende Wert' },
        },
    },
    TEXT: {
        description: 'Mit der TEXT -Funktion können Sie durch das Anwenden einer Formatierung mithilfe von Formatcodes die Anzeige von Zahlen ändern. Diese Funktion ist in solchen Fällen nützlich, in denen Sie Zahlen in einem besser lesbaren Format anzeigen oder diese mit Text oder Symbolen kombinieren möchten.',
        abstract: 'Mit der TEXT -Funktion können Sie durch das Anwenden einer Formatierung mithilfe von Formatcodes die Anzeige von Zahlen ändern. Diese Funktion ist in solchen Fällen nützlich, in denen Sie Zahlen in einem besser lesbaren Format anzeigen oder diese mit Text oder Symbolen kombinieren möchten.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Ein Zahlenwert, den Sie in Text umwandeln möchten.' },
            formatText: { name: 'format_text', detail: 'Eine Textzeichenfolge, die die Formatierung definiert, die auf den angegebenen Wert angewendet werden soll.' },
        },
    },
    TEXTAFTER: {
        description: 'Gibt Text zurück, der nach einem bestimmten Zeichen oder einer Zeichenfolge auftritt. Sie ist das Gegenteil der Funktion TEXTBEFORE .',
        abstract: 'Gibt Text zurück, der nach einem bestimmten Zeichen oder einer Zeichenfolge auftritt. Sie ist das Gegenteil der Funktion TEXTBEFORE .',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, in dem Sie suchen. Platzhalterzeichen sind nicht zulässig.' },
            delimiter: { name: 'delimiter', detail: 'Der Text, der die Stelle markiert, nach der Sie extrahieren möchten.' },
            instanceNum: { name: 'instance_num', detail: 'Das Vorkommen des Trennzeichens, nach dem Sie Text extrahieren möchten.' },
            matchMode: { name: 'match_mode', detail: 'Legt fest, ob bei der Textsuche Groß-/Kleinschreibung beachtet wird. Standardmäßig wird sie beachtet.' },
            matchEnd: { name: 'match_end', detail: 'Behandelt das Textende als Trennzeichen. Standardmäßig muss der Text exakt übereinstimmen.' },
            ifNotFound: { name: 'if_not_found', detail: 'Wert, der zurückgegeben wird, wenn keine Übereinstimmung gefunden wird. Standardmäßig wird #N/A zurückgegeben.' },
        },
    },
    TEXTBEFORE: {
        description: 'Gibt Text zurück, der vor einem bestimmten Zeichen oder einer bestimmten Zeichenfolge auftritt. Es ist das Gegenteil der TEXTNACH-Funktion .',
        abstract: 'Gibt Text zurück, der vor einem bestimmten Zeichen oder einer bestimmten Zeichenfolge auftritt. Es ist das Gegenteil der TEXTNACH-Funktion .',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, in dem Sie suchen. Platzhalterzeichen sind nicht zulässig.' },
            delimiter: { name: 'delimiter', detail: 'Der Text, der die Stelle markiert, vor der Sie extrahieren möchten.' },
            instanceNum: { name: 'instance_num', detail: 'Das Vorkommen des Trennzeichens, vor dem Sie Text extrahieren möchten.' },
            matchMode: { name: 'match_mode', detail: 'Legt fest, ob bei der Textsuche Groß-/Kleinschreibung beachtet wird. Standardmäßig wird sie beachtet.' },
            matchEnd: { name: 'match_end', detail: 'Behandelt den Textanfang als Trennzeichen. Standardmäßig muss der Text exakt übereinstimmen.' },
            ifNotFound: { name: 'if_not_found', detail: 'Wert, der zurückgegeben wird, wenn keine Übereinstimmung gefunden wird. Standardmäßig wird #N/A zurückgegeben.' },
        },
    },
    TEXTJOIN: {
        description: 'Die Funktion "TEXTVERKETTEN" kombiniert den Text aus mehreren Bereichen und/oder Zeichenfolgen und fügt zwischen jedem zu kombinierenden Textwert ein von Ihnen angegebenes Trennzeichen ein. Wenn das Trennzeichen eine leere Textzeichenfolge ist, verkettet diese Funktion effektiv die Bereiche.',
        abstract: 'Die Funktion "TEXTVERKETTEN" kombiniert den Text aus mehreren Bereichen und/oder Zeichenfolgen und fügt zwischen jedem zu kombinierenden Textwert ein von Ihnen angegebenes Trennzeichen ein. Wenn das Trennzeichen eine leere Textzeichenfolge ist, verkettet diese Funktion effektiv die Bereiche.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'Eine Textzeichenfolge, entweder leer oder mindestens ein Zeichen in doppelten Anführungszeichen oder aber ein Bezug auf eine gültige Textzeichenfolge. Eine eingegebene Zahl wird als Text behandelt.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Wenn WAHR, werden leere Zellen ignoriert.' },
            text1: { name: 'text1', detail: 'Das zu verkettende Textelement. Eine Textzeichenfolge oder ein Array von Zeichenfolgen, z. B. ein Zellbereich.' },
            text2: { name: 'text2', detail: 'Weitere zu verkettende Textelemente. Für die Textelemente sind maximal 252 Textargumente zulässig, einschließlich Text1 . Dabei kann es sich jeweils um eine Textzeichenfolge oder ein Array von Zeichenfolgen (z. B. um einen Zellbereich) handeln.' },
        },
    },
    TEXTSPLIT: {
        description: 'Die TEXTTEILEN-Funktion funktioniert genauso wie der Text-zu-Spalten-Assistent , jedoch in Formelform. Sie ermöglicht Ihnen, spaltenweise oder zeilenweise nach unten aufzuteilen. Dies ist die Umkehrung der TEXTJOIN-Funktion .',
        abstract: 'Die TEXTTEILEN-Funktion funktioniert genauso wie der Text-zu-Spalten-Assistent , jedoch in Formelform. Sie ermöglicht Ihnen, spaltenweise oder zeilenweise nach unten aufzuteilen. Dies ist die Umkehrung der TEXTJOIN-Funktion .',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, den Sie teilen möchten. Erforderlich.' },
            colDelimiter: { name: 'col_delimiter', detail: 'Der Text, der den Punkt markiert, an dem der Text spaltenübergreifend überschüttet werden soll.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'Der Text, der den Punkt markiert, an dem der Text zeilenweise nach unten geschüttet werden soll. Optional.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Geben Sie TRUE an, um aufeinander folgende Trennzeichen zu ignorieren. Der Standardwert ist FALSCH, wodurch eine leere Zelle erstellt wird. Optional.' },
            matchMode: { name: 'match_mode', detail: 'Geben Sie 1 an, um eine Übereinstimmung ohne Berücksichtigung der Groß-/Kleinschreibung durchzuführen. Der Standardwert ist 0, wodurch die Groß-/Kleinschreibung beachtet wird. Optional.' },
            padWith: { name: 'pad_with', detail: 'Der Wert, mit dem das Ergebnis auffüllt werden soll. Der Standardwert lautet #N/A.' },
        },
    },
    TRIM: {
        description: 'Löscht Leerzeichen in einem Text, die nicht als jeweils einzelne zwischen Wörtern stehende Trennzeichen dienen. GLÄTTEN können Sie für Texte verwenden, die Sie aus anderen Anwendungsprogrammen übernommen haben und die eventuell unerwünschte Leerzeichen enthalten.',
        abstract: 'Löscht Leerzeichen in einem Text, die nicht als jeweils einzelne zwischen Wörtern stehende Trennzeichen dienen. GLÄTTEN können Sie für Texte verwenden, die Sie aus anderen Anwendungsprogrammen übernommen haben und die eventuell unerwünschte Leerzeichen enthalten.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Der Text, aus dem Leerzeichen entfernt werden sollen. Der Text muss in Anführungszeichen enthalten sein.' },
        },
    },
    UNICHAR: {
        description: 'Gibt das Unicode-Zeichen zurück, das durch den angegebenen Zahlenwert bezeichnet wird.',
        abstract: 'Gibt das Unicode-Zeichen zurück, das durch den angegebenen Zahlenwert bezeichnet wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Unicode-Zahl, die ein Zeichen darstellt.' },
        },
    },
    UNICODE: {
        description: 'Gibt die Zahl (Codepoint) zurück, die dem ersten Zeichen des Texts entspricht.',
        abstract: 'Gibt die Zahl (Codepoint) zurück, die dem ersten Zeichen des Texts entspricht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Das Zeichen, dessen Unicode-Wert Sie bestimmen möchten.' },
        },
    },
    UPPER: {
        description: 'Wandelt Text in Großbuchstaben um.',
        abstract: 'Wandelt Text in Großbuchstaben um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Der Text, der in Großbuchstaben umgewandelt werden soll. "Text" kann sowohl ein Bezug als auch eine Zeichenfolge sein.' },
        },
    },
    VALUE: {
        description: 'Wandelt ein als Text angegebenes Argument in eine Zahl um.',
        abstract: 'Wandelt ein als Text angegebenes Argument in eine Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Gibt den in Anführungszeichen eingeschlossenen Text oder einen Bezug auf eine Zelle an, die den Text enthält, den Sie umwandeln möchten' },
        },
    },
    VALUETOTEXT: {
        description: 'Die WERTZUTEXT-Funktion gibt Text aus einem beliebigen Wert zurück. Er übergibt Textwerte unverändert und wandelt nicht Textwerte in Text um.',
        abstract: 'Die WERTZUTEXT-Funktion gibt Text aus einem beliebigen Wert zurück. Er übergibt Textwerte unverändert und wandelt nicht Textwerte in Text um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Der Wert, der als Text zurückgegeben werden soll. Erforderlich.' },
            format: { name: 'format', detail: 'Das Format der zurückgegebenen Daten. Optional. Es kann sich um einen von zwei Werten handeln: 0 Standardwert. Übersichtliches Format, das einfach zu lesen ist. Der zurückgegebene Text ist derselbe wie der Text, der in einer Zelle dargestellt wird, auf die die allgemeine Formatierung angewendet wurde. 1 Strenges Format, das Escapezeichen und Zeilentrennzeichen enthält. Generiert eine Zeichenfolge, die in der Bearbeitungsleiste eingegeben werden kann. Kapselt zurückgegebene Zeichenfolgen in Anführungszeichen mit Ausnahme von booleschen Werten, Zahlen und Fehlern.' },
        },
    },
    CALL: {
        description: 'Ruft eine Prozedur in einer DLL (Dynamic Link Library)-Datei oder Coderessource auf. Für diese Funktion gibt es zwei Syntaxversionen. Syntax 1 können Sie nur für eine bereits angemeldete (registrierte) Coderessource einsetzen, die auf Argumente der REGISTER-Funktion zurückgreift. Syntax 2a oder 2b können Sie immer dann einsetzen, wenn Sie eine Coderessource gleichzeitig anmelden und aufrufen möchten.',
        abstract: 'Ruft eine Prozedur in einer DLL (Dynamic Link Library)-Datei oder Coderessource auf. Für diese Funktion gibt es zwei Syntaxversionen. Syntax 1 können Sie nur für eine bereits angemeldete (registrierte) Coderessource einsetzen, die auf Argumente der REGISTER-Funktion zurückgreift. Syntax 2a oder 2b können Sie immer dann einsetzen, wenn Sie eine Coderessource gleichzeitig anmelden und aufrufen möchten.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Erforderlich. Eine in Anführungszeichen stehende Zeichenfolge, die den Namen der DLL-Datei (Dynamic Link Library, DLL) angibt, zu der die aufzurufende Prozedur in Microsoft Excel für Windows gehört.' },
            procedure: { name: 'Verfahren', detail: 'Erforderlich. Eine Zeichenfolge, die in Microsoft Excel für Windows den Namen angibt, unter dem die aufzurufende Funktion in der angegebenen DLL-Datei abgelegt ist. Sie können auch den Ordinalwert verwenden, der der Funktion in der EXPORTS-Anweisung der Moduldefinitionsdatei (.DEF) zugeordnet ist. Der Ordinalwert darf nicht in Form von Text vorkommen.' },
            typeText: { name: 'Type_text', detail: 'Erforderlich. Text, der sowohl den Datentyp des Rückgabewerts als auch die Datentypen aller Argumente der DLL oder Coderessource angibt. Der erste Buchstabe des Arguments "Typ" gibt den Rückgabewert an. Die Codes, die Sie für "Typ" verwenden, werden in Verwenden der Funktionen "AUFRUFEN" und "REGISTER" ausführlich beschrieben. Bei eigenständigen DLLs oder Coderessourcen (XLLs) können Sie dieses Argument weglassen.' },
            argument1: { name: 'Argument1,...', detail: 'Optional. Die Argumente, die an die jeweilige Prozedur übergeben werden sollen.' },
        },
    },
    EUROCONVERT: {
        description: 'Sie können die EUROCONVERT-Funktion verwenden, um eine Zahl in Euro oder von Euro in eine beteiligte Währung umzuwandeln. Sie können die Funktion außerdem verwenden, um eine Zahl aus einer beteiligten Währung in eine andere umzuwandeln, indem Sie den Euro als Zwischenwert verwenden (Triangulieren). Die EUROCONVERT-Funktion verwendet feste Wechselkurse, die von der EU (Europäische Union) festgelegt wurden.',
        abstract: 'Sie können die EUROCONVERT-Funktion verwenden, um eine Zahl in Euro oder von Euro in eine beteiligte Währung umzuwandeln. Sie können die Funktion außerdem verwenden, um eine Zahl aus einer beteiligten Währung in eine andere umzuwandeln, indem Sie den Euro als Zwischenwert verwenden (Triangulieren). Die EUROCONVERT-Funktion verwendet feste Wechselkurse, die von der EU (Europäische Union) festgelegt wurden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Zahl', detail: 'Erforderlich. Die Zahl, die Sie umwandeln möchten, oder eine Referenz auf eine Zelle, die die Zahl enthält' },
            source: { name: 'Quelle', detail: 'Erforderlich. Eine Zeichenfolge aus drei Zeichen oder eine Referenz auf eine Zelle, die die Zeichenfolge enthält, die mit dem ISO (International Standards Organization)-Code für die Quellwährung übereinstimmt, die umgewandelt werden soll. Die folgenden ISO-Codes stehen in der EUROCONVERT-Funktion zur Verfügung:' },
            target: { name: 'Ziel', detail: 'Erforderlich. Eine Zeichenfolge aus drei Zeichen oder eine Referenz auf eine Zelle, die die Zeichenfolge enthält, die mit dem ISO-Code für die Währung übereinstimmt, in die umgewandelt werden soll. Die ISO-Codes finden Sie in der Quelltabelle weiter oben.' },
            fullPrecision: { name: 'Full_precision', detail: 'Erforderlich. Ein Wahrheitswert (WAHR oder FALSCH) oder ein Ausdruck, der den Wert WAHR oder FALSCH ergibt und der festlegt, wie das Ergebnis angezeigt wird' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Erforderlich. Ein Integer größer als oder gleich 3, mit dem die Anzahl von signifikanten Ziffern der Berechnungsgenauigkeit festgelegt wird, die für den Eurozwischenwert verwendet wird, wenn zwischen zwei Währungen von Euromitgliedsländern umgewandelt wird. Wenn Sie dieses Argument weglassen, wird der Eurozwischenwert in Excel nicht gerundet. Wenn Sie dieses Argument beim Umwandeln der Währung eines Euromitgliedslandes in Euro angeben, wird der Eurozwischenwert in Excel berechnet, der dann in die Währung eines Euromitgliedslandes umgewandelt werden kann.' },
        },
    },
    REGISTER_ID: {
        description: 'Gibt die Register-ID der angegebenen DLL (Dynamic Link Library) oder Coderessource zurück, die zuvor registriert wurde. Wenn die DLL- oder Coderessource nicht registriert wurde, registriert diese Funktion die DLL oder Coderessource und gibt dann die Register-ID zurück.',
        abstract: 'Gibt die Register-ID der angegebenen DLL (Dynamic Link Library) oder Coderessource zurück, die zuvor registriert wurde. Wenn die DLL- oder Coderessource nicht registriert wurde, registriert diese Funktion die DLL oder Coderessource und gibt dann die Register-ID zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Erforderlich. Text, der den Namen der DLL angibt, die die Funktion in Microsoft Excel für Windows enthält' },
            procedure: { name: 'Verfahren', detail: 'Erforderlich. Eine Zeichenfolge, die in Microsoft Excel für Windows den Namen angibt, unter dem die aufzurufende Funktion in der angegebenen DLL-Datei abgelegt ist. Sie können auch die Ordnungszahl verwenden, die der Funktion innerhalb der Exporte-Anweisung der Moduldefinitionsdatei (.DEF) zugeordnet ist. Eine Ordnungszahl oder die Kennnummer einer Ressource darf nicht in Anführungszeichen stehen.' },
            typeText: { name: 'Type_text', detail: 'Optional. Text, der sowohl den Datentyp des Rückgabewerts als auch die Datentypen der Argumente der DLL angibt. Der erste Buchstabe des Arguments Datentyp gibt den Datentyp des Rückgabewerts an. Ist die Funktion oder Code-Ressource bereits angemeldet (registriert), darf dieses Argument fehlen.' },
        },
    },
};

export default locale;
