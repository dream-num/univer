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
        description: 'Sie können die Funktion ADRESSE verwenden, um die Adresse einer Zelle eines Arbeitsblatts anhand bestimmter Zeilen- und Spaltennummern abzurufen. Address (2,3) gibt beispielsweise $C$ 2 zurück. Als weiteres Beispiel gibt ADDRESS(77.300) $KN$77 zurück. Sie können andere Funktionen verwenden, z. B. die Funktionen ZEILE und SPALTE , um die Argumente für die Zeilen- und Spaltennummer für die Funktion ADRESSE bereitzustellen.',
        abstract: 'Sie können die Funktion ADRESSE verwenden, um die Adresse einer Zelle eines Arbeitsblatts anhand bestimmter Zeilen- und Spaltennummern abzurufen. Address (2,3) gibt beispielsweise $C$ 2 zurück. Als weiteres Beispiel gibt ADDRESS(77.300) $KN$77 zurück. Sie können andere Funktionen verwenden, z. B. die Funktionen ZEILE und SPALTE , um die Argumente für die Zeilen- und Spaltennummer für die Funktion ADRESSE bereitzustellen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: 'row number', detail: 'Erforderlich. Ein numerischer Wert, der die Zeilennummer angibt, die für den Zellbezug verwendet werden soll.' },
            column_num: { name: 'column number', detail: 'Erforderlich. Ein numerischer Wert, der die Spaltennummer angibt, die für den Zellbezug verwendet werden soll.' },
            abs_num: { name: 'type of reference', detail: 'Optional. Ein numerischer Wert, der angibt, welcher Bezugstyp zurückgegeben werden soll.' },
            a1: { name: 'style of reference', detail: 'Optional. Ein Wahrheitswert, der angibt, ob der jeweilige Bezug in der A1- oder der Z1S1-Schreibweise ausgegeben werden soll. Bei der A1-Schreibweise werden Spalten alphabetisch und Zeilen numerisch beschriftet. Bei der Z1S1-Schreibweise werden sowohl Spalten als auch Zeilen numerisch beschriftet. Ist das A1-Argument mit WAHR belegt oder nicht angegeben, liegt der von der Funktion ADRESSE gelieferte Bezug in A1-Schreibweise vor. Ist das A1-Argument mit FALSCH belegt, liegt der von der Funktion ADRESSE gelieferte Bezug in der Z1S1-Schreibweise vor. Hinweis Zum Ändern der von Excel verwendeten Bezugsart klicken Sie auf die Registerkarte Datei , klicken Sie auf Optionen und dann auf Formeln . Aktivieren oder deaktivieren Sie unter Arbeiten mit Formeln das Kontrollkästchen Z1S1-Bezugsart .' },
            sheet_text: { name: 'worksheet name', detail: 'Optional. Ein Textwert, der den Namen des Arbeitsblatts angibt, das als externer Bezug verwendet werden soll. Die Formel =ADDRESS(1;1,,,"Sheet2") gibt beispielsweise Sheet2!$A$1 zurück. Wenn das argument sheet_text nicht angegeben wird, wird kein Blattname verwendet, und die von der Funktion zurückgegebene Adresse verweist auf eine Zelle auf dem aktuellen Blatt.' },
        },
    },
    AREAS: {
        description: 'Gibt die Anzahl der innerhalb eines Bezuges aufgeführten Bereiche zurück. Ein Bereich (Teilbereich) kann sowohl aus mehreren zusammenhängenden Zellen (Zellbereich) als auch aus nur einer Zelle bestehen.',
        abstract: 'Gibt die Anzahl der innerhalb eines Bezuges aufgeführten Bereiche zurück. Ein Bereich (Teilbereich) kann sowohl aus mehreren zusammenhängenden Zellen (Zellbereich) als auch aus nur einer Zelle bestehen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Erforderlich. Ein Bezug auf eine Zelle oder einen Zellbereich, der sich auf mehrere Bereiche gleichzeitig beziehen kann. Für den Fall, dass Sie mehrere Bezüge als ein Argument angeben möchten, müssen Sie ein zusätzliches Klammernpaar einfügen, damit Microsoft Excel nicht versucht, die Semikolons als Listentrennzeichen zu interpretieren. Das folgende Beispiel verdeutlicht dies.' },
        },
    },
    CHOOSE: {
        description: 'Verwendet Index, um einen Wert aus der Liste der Werteargumente zurückzugeben. Verwenden Sie WAHL, um bis zu 254 Werte auf der Grundlage der Indexnummer auszuwählen. Wenn beispielsweise Wert1 bis Wert7 Tage der Woche sind, gibt WAHL einen der Tage zurück, wenn eine Zahl zwischen 1 und 7 als Index verwendet wird.',
        abstract: 'Verwendet Index, um einen Wert aus der Liste der Werteargumente zurückzugeben. Verwenden Sie WAHL, um bis zu 254 Werte auf der Grundlage der Indexnummer auszuwählen. Wenn beispielsweise Wert1 bis Wert7 Tage der Woche sind, gibt WAHL einen der Tage zurück, wenn eine Zahl zwischen 1 und 7 als Index verwendet wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'Gibt an, welches Wertargument ausgewählt wird. index_num muss eine Zahl zwischen 1 und 254, eine Formel oder ein Bezug auf eine Zelle mit einer Zahl zwischen 1 und 254 sein.\nWenn index_num 1 ist, gibt CHOOSE value1 zurück; bei 2 value2 usw.\nIst index_num kleiner als 1 oder größer als die Nummer des letzten Werts in der Liste, gibt CHOOSE den Fehlerwert #VALUE! zurück.\nIst index_num ein Bruch, wird er vor der Verwendung auf die nächstkleinere ganze Zahl gekürzt.' },
            value1: { name: 'value1', detail: 'CHOOSE wählt anhand von index_num einen Wert oder eine auszuführende Aktion aus. Die Argumente können Zahlen, Zellbezüge, definierte Namen, Formeln, Funktionen oder Text sein.' },
            value2: { name: 'value2', detail: '1 bis 254 Wertargumente.' },
        },
    },
    CHOOSECOLS: {
        description: 'Gibt die angegebenen Spalten aus einem Array zurück.',
        abstract: 'Gibt die angegebenen Spalten aus einem Array zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Das Array, das die Spalten enthält, die im neuen Array zurückgegeben werden sollen. Erforderlich.' },
            colNum1: { name: 'col_num1', detail: 'Die erste Spalte, die zurückgegeben werden soll. Erforderlich.' },
            colNum2: { name: 'col_num2', detail: 'Zusätzliche Spalten, die zurückgegeben werden sollen. Optional.' },
        },
    },
    CHOOSEROWS: {
        description: 'Gibt die angegebenen Zeilen aus einem Array zurück.',
        abstract: 'Gibt die angegebenen Zeilen aus einem Array zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Das Array, das die Spalten enthält, die im neuen Array zurückgegeben werden sollen. Erforderlich.' },
            rowNum1: { name: 'row_num1', detail: 'Die nummer der ersten Zeile, die zurückgegeben werden soll. Erforderlich.' },
            rowNum2: { name: 'row_num2', detail: 'Zusätzliche Zeilennummern, die zurückgegeben werden sollen. Optional.' },
        },
    },
    COLUMN: {
        description: 'Die COLUMN-Funktion gibt die Spaltennummer des angegebenen Zellbezugs zurück. Beispielsweise gibt die Formel =COLUMN(D10) 4 zurück, da Spalte D die vierte Spalte ist.',
        abstract: 'Die COLUMN-Funktion gibt die Spaltennummer des angegebenen Zellbezugs zurück. Beispielsweise gibt die Formel =COLUMN(D10) 4 zurück, da Spalte D die vierte Spalte ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Die Zelle oder der Zellbereich, für die bzw. den Sie die Spaltennummer zurückgeben möchten.' },
        },
    },
    COLUMNS: {
        description: 'Gibt die Anzahl der Spalten in einem Array oder Verweis zurück.',
        abstract: 'Gibt die Anzahl der Spalten in einem Array oder Verweis zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Ein Array oder eine Arrayformel oder ein Verweis auf einen Zellbereich, für den Sie die Anzahl der Spalten verwenden möchten.' },
        },
    },
    DROP: {
        description: 'Schließt eine angegebene Anzahl von Zeilen oder Spalten vom Anfang oder Ende einer Matrix aus. Diese Funktion kann hilfreich sein, um Kopf- und Fußzeilen in einem Excel-Bericht zu entfernen, um nur die Daten zurückzugeben.',
        abstract: 'Schließt eine angegebene Anzahl von Zeilen oder Spalten vom Anfang oder Ende einer Matrix aus. Diese Funktion kann hilfreich sein, um Kopf- und Fußzeilen in einem Excel-Bericht zu entfernen, um nur die Daten zurückzugeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Das Array, aus dem Zeilen oder Spalten gelöscht werden sollen.' },
            rows: { name: 'rows', detail: 'Die Anzahl der zu löschenden Zeilen. Ein negativer Wert wird vom Ende der Matrix entfernt.' },
            columns: { name: 'columns', detail: 'Die Anzahl der auszuschließenden Spalten. Ein negativer Wert wird vom Ende der Matrix entfernt.' },
        },
    },
    EXPAND: {
        description: 'Erweitert oder füllt ein Array auf die angegebenen Zeilen- und Spaltenmaße auf.',
        abstract: 'Erweitert oder füllt ein Array auf die angegebenen Zeilen- und Spaltenmaße auf.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Das zu erweiternde Array.' },
            rows: { name: 'rows', detail: 'Die Anzahl der Zeilen im erweiterten Array. Wenn nicht angegeben, werden die Zeilen nicht erweitert.' },
            columns: { name: 'columns', detail: 'Die Anzahl der Spalten im erweiterten Array. Wenn nicht angegeben, werden die Spalten nicht erweitert.' },
            padWith: { name: 'pad_with', detail: 'Der Wert, mit dem auf der Füllung polstert werden soll. Der Standardwert lautet #N/A.' },
        },
    },
    FILTER: {
        description: 'Im folgenden Beispiel wird die Formel = FILTER(A5:D20;C5:C20=H2; "") verwendet, um alle Datensätze für "Apfel" zurückzugeben, wie in Zelle H2 ausgewählt. Wenn keine Äpfel vorhanden sind, wird eine leere Zeichenfolge ("") zurückgegeben.',
        abstract: 'Im folgenden Beispiel wird die Formel = FILTER(A5:D20;C5:C20=H2; "") verwendet, um alle Datensätze für "Apfel" zurückzugeben, wie in Zelle H2 ausgewählt. Wenn keine Äpfel vorhanden sind, wird eine leere Zeichenfolge ("") zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Das Array oder der Bereich, das/der gefiltert werden soll' },
            include: { name: 'include', detail: 'Ein boolesches Array, dessen Höhe oder Breite mit dem Array identisch ist' },
            ifEmpty: { name: 'if_empty', detail: 'Der Wert, der zurückgegeben werden soll, wenn alle Werte im eingeschlossenen Array leer sind (Filter gibt nichts zurück)' },
        },
    },
    FORMULATEXT: {
        description: 'Gibt eine Formel als eine Zeichenfolge zurück.',
        abstract: 'Gibt eine Formel als eine Zeichenfolge zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Erforderlich. Ein Bezug auf eine Zelle oder einen Zellbereich.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Gibt sichtbare Daten zurück, die in einer PivotTable gespeichert sind.',
        abstract: 'Gibt sichtbare Daten zurück, die in einer PivotTable gespeichert sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'Der Name der PivotTable, die die Daten enthält, die Sie abrufen möchten. Dies muss in Anführungszeichen stehen. Beispiel: =GETPIVOTDATA("Sales", A3). Hier ist "Sales" das Feld Werte, das abgerufen werden soll. Da kein anderes Feld angegeben ist, gibt GETPIVOTDATA den Gesamtumsatz zurück.' },
            pivotTable: { name: 'pivotTable', detail: 'Stellt einen Bezug auf eine Zelle, einen Zellbereich oder einen benannten Zellbereich in einer PivotTable dar. Mit diesen Informationen wird ermittelt, welche PivotTable die Daten enthält, die Sie abrufen möchten. Beispiel: =GETPIVOTDATA("Sales", A3). Hier ist A3 ein Verweis innerhalb der PivotTable und teilt der Formel mit, welche PivotTable verwendet werden soll.' },
            field1: { name: 'field1', detail: 'Stehen für Paare aus Feld- und Elementnamen (zwischen 1 und 126), die die Daten beschreiben, die Sie abrufen möchten. Diese Paare können in einer beliebigen Reihenfolge auftreten. Feld- und Elementnamen, die nicht aus Datumsangaben oder Zahlen bestehen, müssen in Anführungszeichen eingeschlossen sein. Beispiel: =GETPIVOTDATA("Sales"; A3, "Month", "Mar"). Hier ist "Month" das Feld und "Mar" ist das Element. Um mehrere Elemente für ein Feld anzugeben, schließen Sie sie in geschweifte Klammern ein (z. B. {"Mar", "Apr"}). Für OLAP-PivotTables können Elemente den Quellnamen der Dimension sowie den Quellnamen des Elements enthalten. Ein Paar aus Feld und Element könnte für eine OLAP-PivotTable wie folgt aussehen: "[Produkt]";"[Produkt].[Alle Produkte].[Lebensmittel].[Backwaren]"' },
            item1: { name: 'item1', detail: 'Stehen für Paare aus Feld- und Elementnamen (zwischen 1 und 126), die die Daten beschreiben, die Sie abrufen möchten. Diese Paare können in einer beliebigen Reihenfolge auftreten. Feld- und Elementnamen, die nicht aus Datumsangaben oder Zahlen bestehen, müssen in Anführungszeichen eingeschlossen sein. Beispiel: =GETPIVOTDATA("Sales"; A3, "Month", "Mar"). Hier ist "Month" das Feld und "Mar" ist das Element. Um mehrere Elemente für ein Feld anzugeben, schließen Sie sie in geschweifte Klammern ein (z. B. {"Mar", "Apr"}). Für OLAP-PivotTables können Elemente den Quellnamen der Dimension sowie den Quellnamen des Elements enthalten. Ein Paar aus Feld und Element könnte für eine OLAP-PivotTable wie folgt aussehen: "[Produkt]";"[Produkt].[Alle Produkte].[Lebensmittel].[Backwaren]"' },
        },
    },
    HLOOKUP: {
        description: 'Sucht nach einem Wert in der obersten Zeile einer Tabelle oder einer Matrix und gibt dann einen Wert in derselben Spalte einer Zeile zurück, die Sie in der Tabelle oder der Matrix angeben. Verwenden Sie WVERWEIS, wenn sich die Vergleichswerte in einer Zeile am Anfang einer Datentabelle befinden und Sie eine bestimmte Anzahl von Spalten nach unten durchsuchen möchten. Verwenden Sie SVERWEIS, wenn sich die Vergleichswerte in einer Spalte links neben den Daten befinden, die Sie durchsuchen möchten.',
        abstract: 'Sucht nach einem Wert in der obersten Zeile einer Tabelle oder einer Matrix und gibt dann einen Wert in derselben Spalte einer Zeile zurück, die Sie in der Tabelle oder der Matrix angeben. Verwenden Sie WVERWEIS, wenn sich die Vergleichswerte in einer Zeile am Anfang einer Datentabelle befinden und Sie eine bestimmte Anzahl von Spalten nach unten durchsuchen möchten. Verwenden Sie SVERWEIS, wenn sich die Vergleichswerte in einer Spalte links neben den Daten befinden, die Sie durchsuchen möchten.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Erforderlich. Der Wert, der in der ersten Zeile der Tabelle gefunden werden soll. "Suchkriterium" kann ein Wert, ein Bezug oder eine Zeichenfolge sein.' },
            tableArray: { name: 'table_array', detail: 'Erforderlich. Eine Tabelle mit Informationen, in der Daten gesucht werden. Verwenden Sie einen Bezug auf einen Bereich oder einen Bereichsnamen. Bei den Werten in der ersten Zeile von "Matrix" kann es sich um Text, Zahlen oder Wahrheitswerte handeln. Wenn "Bereich_Verweis" WAHR ist, müssen die Werte in der ersten Zeile von "Matrix" in aufsteigender Reihenfolge angeordnet werden: ..., -2, -1, 0, 1, 2, ..., A-Z, FALSCH, WAHR; andernfalls gibt WVERWEIS möglicherweise nicht den richtigen Wert zurück. Wenn "Bereich_Verweis" FALSCH ist, muss "Matrix" nicht sortiert werden. Bei Zeichenfolgen (Texten) wird nicht zwischen Groß- und Kleinbuchstaben unterschieden. Sortieren Sie die Werte in aufsteigender Reihenfolge von links nach rechts. Weitere Informationen finden Sie unter Sortieren von Daten in einem Bereich oder einer Tabelle .' },
            rowIndexNum: { name: 'row_index_num', detail: 'Erforderlich. Die Nummer der Zeile in "Matrix", aus der der entsprechende Wert zurückgegeben wird. Ein Zeilenindex von 1 gibt den ersten Zeilenwert in "Matrix" zurück, ein Zeilenindex von 2 gibt den zweiten Zeilenwert in "Matrix" zurück usw. Wenn "Zeilenindex" kleiner als 1 ist, gibt WVERWEIS den Fehlerwert #WERT! zurück; wenn "Zeilenindex" größer als die Anzahl der Zeilen in "Matrix" ist, gibt WVERWEIS den Fehlerwert #BEZUG! zurück.' },
            rangeLookup: { name: 'range_lookup', detail: 'Optional. Ein Wahrheitswert, der angibt, ob WVERWEIS eine genaue Entsprechung oder eine ungefähre Entsprechung suchen soll. Wenn dieser Parameter WAHR ist oder weggelassen wird, wird eine ungefähre Entsprechung zurückgegeben. Anders ausgedrückt, wird der nächstgrößere Wert zurückgegeben, der kleiner als "Suchkriterium" ist, wenn keine genaue Entsprechung gefunden wird. Ist der Parameter FALSCH, sucht WVERWEIS eine genaue Entsprechung. Wenn keine gefunden wird, wird der Fehlerwert #NV zurückgegeben.' },
        },
    },
    HSTACK: {
        description: 'Fügt Arrays horizontal und nacheinander an, um ein größeres Array zurückzugeben.',
        abstract: 'Fügt Arrays horizontal und nacheinander an, um ein größeres Array zurückzugeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Die anzufügenden Matrizen.' },
            array2: { name: 'array', detail: 'Die anzufügenden Matrizen.' },
        },
    },
    HYPERLINK: {
        description: 'Erstellt einen Hyperlink innerhalb einer Zelle.',
        abstract: 'Erstellt einen Hyperlink innerhalb einer Zelle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=de',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Die vollständige, in Anführungszeichen eingeschlossene URL des Linkziels oder ein Bezug auf eine Zelle mit einer solchen URL. Nur bestimmte Linktypen sind zulässig: http://, https://, mailto:, aim:, ftp://, gopher://, telnet:// und news://. Andere sind ausdrücklich nicht zulässig. Bei einem anderen Protokoll wird link_label in der Zelle angezeigt, aber nicht verlinkt. Wenn kein Protokoll angegeben ist, wird http:// angenommen und url vorangestellt.' },
            linkLabel: { name: 'link_label', detail: '[ OPTIONAL – standardmäßig url ] – Der in der Zelle als Link anzuzeigende Text in Anführungszeichen oder ein Bezug auf eine Zelle mit einem solchen Text. Verweist link_label auf eine leere Zelle, wird url als Link angezeigt, wenn sie gültig ist, andernfalls als Text. Ist link_label die leere Zeichenfolge (""), erscheint die Zelle leer, der Link bleibt jedoch per Klick oder Zellnavigation erreichbar.' },
        },
    },
    IMAGE: {
        description: 'Die Funktion BILD fügt Bilder zusammen mit Alternativtext aus einer Quellposition in Zellen ein. Anschließend können Sie Zellen verschieben und deren Größe ändern, sie sortieren und filtern und mit Bildern in einer Excel-Tabelle arbeiten. Verwenden Sie diese Funktion, um Listen von Daten, z. B. Bestände, Spiele, Mitarbeiter und mathematische Konzepte, visuell zu verbessern.',
        abstract: 'Die Funktion BILD fügt Bilder zusammen mit Alternativtext aus einer Quellposition in Zellen ein. Anschließend können Sie Zellen verschieben und deren Größe ändern, sie sortieren und filtern und mit Bildern in einer Excel-Tabelle arbeiten. Verwenden Sie diese Funktion, um Listen von Daten, z. B. Bestände, Spiele, Mitarbeiter und mathematische Konzepte, visuell zu verbessern.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'Der URL-Pfad der Bilddatei mit dem Protokoll „https“.' },
            altText: { name: 'alt_text', detail: 'Alternativtext, der das Bild für die Barrierefreiheit beschreibt.' },
            sizing: { name: 'sizing', detail: 'Gibt die Bildabmessungen an.' },
            height: { name: 'height', detail: 'Die benutzerdefinierte Höhe des Bilds in Pixeln.' },
            width: { name: 'width', detail: 'Die benutzerdefinierte Breite des Bilds in Pixeln.' },
        },
    },
    INDEX: {
        description: 'Gibt den Wert eines Elements in einer Tabelle oder einem Array zurück, ausgewählt anhand der Zeilen- und Spaltennummerindizes.',
        abstract: 'Gibt den Wert eines Elements in einer Tabelle oder einem Array zurück, ausgewählt anhand der Zeilen- und Spaltennummerindizes.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Ein Bezug auf einen oder mehrere Zellbereiche.' },
            rowNum: { name: 'row_num', detail: 'Die Nummer der Zeile in reference, aus der ein Bezug zurückgegeben werden soll.' },
            columnNum: { name: 'column_num', detail: 'Die Nummer der Spalte in reference, aus der ein Bezug zurückgegeben werden soll.' },
            areaNum: { name: 'area_num', detail: 'Wählt einen Bereich in reference aus, aus dem die Schnittmenge von row_num und column_num zurückgegeben wird.' },
        },
    },
    INDIRECT: {
        description: 'Gibt den Bezug eines Textwerts zurück. Bezüge werden sofort ausgewertet, sodass die zu ihnen gehörenden Werte angezeigt werden. Verwenden Sie die INDIREKT-Funktion, um den Bezug auf eine in einer Formel befindliche Zelle zu ändern ohne die Formel selbst zu ändern.',
        abstract: 'Gibt den Bezug eines Textwerts zurück. Bezüge werden sofort ausgewertet, sodass die zu ihnen gehörenden Werte angezeigt werden. Verwenden Sie die INDIREKT-Funktion, um den Bezug auf eine in einer Formel befindliche Zelle zu ändern ohne die Formel selbst zu ändern.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'Erforderlich. Der Bezug auf eine Zelle, die einen Bezug in der A1-Schreibweise, einen Bezug in der Z1S1-Schreibweise, einen definierten Namen als Bezug oder einen Zellbezug als Zeichenfolge enthält. Gibt "Bezug" einen unzulässigen Zellbezug an, gibt INDIREKT den Fehlerwert #BEZUG! zurück. Verweist "Bezug" auf eine andere Arbeitsmappe (ein externer Bezug) muss diese Arbeitsmappe geöffnet sein. Ist die Quellarbeitsmappe nicht geöffnet, gibt die INDIREKT-Funktion den Fehlerwert #BEZUG! zurück. Hinweis Externe Verweise werden in Excel Web App nicht unterstützt. Wenn sich ref_text auf einen Zellbereich außerhalb des Zeilenlimits von 1.048.576 oder dem Spaltengrenzwert von 16.384 (XFD) bezieht, gibt INDIRECT eine #REF! was zu einem #BEZUG!-Fehler führt.' },
            a1: { name: 'a1', detail: 'Optional. Ein Wahrheitswert, der angibt, welche Art von Bezug in der Zelle enthalten ist Ist "A1" gleich WAHR oder nicht angegeben, wird "Bezug" als ein Bezug interpretiert, der in der A1-Schreibweise vorliegt. Ist "A1" gleich FALSCH, wird "Bezug" als ein Bezug interpretiert, der in der Z1S1-Schreibweise vorliegt.' },
        },
    },
    LOOKUP: {
        description: 'Die Vektorversion von VERWEIS durchsucht einen Bereich mit einer Zeile oder einer Spalte (auch als Vektor bezeichnet) nach einem Wert und gibt einen Wert von derselben Position in einem zweiten Bereich mit einer Zeile oder einer Spalte zurück.',
        abstract: 'Die Vektorversion von VERWEIS durchsucht einen Bereich mit einer Zeile oder einer Spalte (auch als Vektor bezeichnet) nach einem Wert und gibt einen Wert von derselben Position in einem zweiten Bereich mit einer Zeile oder einer Spalte zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Ein Wert, nach dem LOOKUP im ersten Vektor sucht. lookup_value kann eine Zahl, Text, ein Wahrheitswert oder ein Name bzw. Bezug sein, der auf einen Wert verweist.' },
            lookupVectorOrArray: { name: 'lookup_vectorOrArray', detail: 'Ein Bereich, der nur eine Zeile oder eine Spalte enthält.' },
            resultVector: { name: 'result_vector', detail: 'Ein Bereich, der nur eine Zeile oder Spalte enthält. result_vector muss dieselbe Größe wie lookup_vector haben.' },
        },
    },
    MATCH: {
        description: 'Die Funktion VERGLEICH sucht nach einem bestimmten Element in einem Bereich von Zellen und gibt dann die relative Position dieses Elements in dem Bereich zurück. Ein Beispiel: Wenn der Bereich A1:A3 die Werte "5", "25" und "38" enthält, gibt die Formel =VERGLEICH(25;A1:A3;0) den Wert "2" zurück, weil "25" der zweite Wert im Bereich ist.',
        abstract: 'Die Funktion VERGLEICH sucht nach einem bestimmten Element in einem Bereich von Zellen und gibt dann die relative Position dieses Elements in dem Bereich zurück. Ein Beispiel: Wenn der Bereich A1:A3 die Werte "5", "25" und "38" enthält, gibt die Formel =VERGLEICH(25;A1:A3;0) den Wert "2" zurück, weil "25" der zweite Wert im Bereich ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'MATCH findet den größten Wert, der kleiner oder gleich lookup_value ist. Die Werte im lookup_array Argument müssen in aufsteigender Reihenfolge platziert werden, z. B. ...-2, -1, 0, 1, 2, ..., A-Z, FALSE, TRUE.' },
            lookupArray: { name: 'lookup_array', detail: 'MATCH findet den ersten Wert, der genau gleich lookup_value ist. Die Werte im lookup_array Argument können in beliebiger Reihenfolge angegeben werden.' },
            matchType: { name: 'match_type', detail: 'MATCH findet den kleinsten Wert, der größer oder gleich lookup_value ist. Die Werte im lookup_array Argument müssen in absteigender Reihenfolge platziert werden, z. B.: TRUE, FALSE, Z-A, ... 2, 1, 0, -1, -2, ... usw.' },
        },
    },
    OFFSET: {
        description: 'Gibt einen Bezug zurück, der gegenüber dem angegebenen Bezug versetzt ist. Der zurückgegebene Bezug kann eine einzelne Zelle oder ein Zellbereich sein. Sie können die Anzahl der zurückzugebenden Zeilen und Spalten festlegen.',
        abstract: 'Gibt einen Bezug zurück, der gegenüber dem angegebenen Bezug versetzt ist. Der zurückgegebene Bezug kann eine einzelne Zelle oder ein Zellbereich sein. Sie können die Anzahl der zurückzugebenden Zeilen und Spalten festlegen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Erforderlich. Der Verweis, auf dem der Offset basieren soll. Bezug muss sich auf eine Zelle oder einen Bereich angrenzender Zellen beziehen; Andernfalls gibt OFFSET die #VALUE! zurück.' },
            rows: { name: 'rows', detail: 'Erforderlich. Die Anzahl der Zeilen, um die Sie die obere linke Eckzelle des Bereichs nach oben oder nach unten verschieben möchten. Entspricht das Argument Zeilen beispielsweise 5, bedeutet dies, dass die obere linke Ecke des neuen Bezugs fünf Zeilen unterhalb von Bezug liegt. Das Argument Zeilen kann sowohl einen positiven (unterhalb des Ausgangsbezugs liegen) als auch einen negativen Wert annehmen (oberhalb des Ausgangsbezugs liegen).' },
            cols: { name: 'columns', detail: 'Erforderlich. Die Anzahl der Spalten, um die Sie die obere linke Eckzelle des Bereichs nach links oder nach rechts verschieben möchten. Ist das Argument Spalten beispielsweise gleich 5, so bedeutet dies, dass die obere linke Ecke des neuen Bezugs fünf Spalten rechts von Bezug liegt. Spalten kann sowohl einen positiven (rechts des Ausgangsbezugs liegen) als auch einen negativen Wert annehmen (links des Ausgangsbezugs liegen).' },
            height: { name: 'height', detail: 'Optional. Die Höhe des neuen Bezugs in Zeilen. Für "Höhe" muss ein positiver Wert angegeben werden.' },
            width: { name: 'width', detail: 'Optional. Die Breite des neuen Bezugs in Spalten. Für "Breite" muss ein positiver Wert angegeben werden.' },
        },
    },
    ROW: {
        description: 'Gibt die Zeilennummer eines Bezugs zurück.',
        abstract: 'Gibt die Zeilennummer eines Bezugs zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Optional. Die Zelle oder der Zellbereich, für die Sie die Zeilennummer verwenden möchten. Fehlt das Argument "Bezug", wird es als Bezug der Zelle angenommen, in der die Funktion ZEILE steht. Wenn reference ein Zellbereich ist und ROW als vertikales Array eingegeben wird, gibt ROW die Zeilennummern des Bezugs als vertikales Array zurück. "Bezug" darf sich nicht auf mehrere Bereiche beziehen.' },
        },
    },
    ROWS: {
        description: 'Gibt die Anzahl der Zeilen in einem Verweis oder Array zurück.',
        abstract: 'Gibt die Anzahl der Zeilen in einem Verweis oder Array zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Ein Array, eine Arrayformel oder ein Verweis auf einen Zellbereich, für den Sie die Anzahl der Zeilen verwenden möchten.' },
        },
    },
    RTD: {
        description: 'Ruft Echtzeitdaten aus einem Programm ab, das die COM-Automatisierung unterstützt',
        abstract: 'Ruft Echtzeitdaten aus einem Programm ab, das die COM-Automatisierung unterstützt',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Erforderlich. Der Name der ProgID eines registrierten COM-Automatisierungs-Add-Ins, das auf dem lokalen Computer installiert wurde. Schließen Sie den Namen in Anführungszeichen ein.' },
            server: { name: 'server', detail: 'Erforderlich. Der Name des Servers, auf dem das Add-In ausgeführt werden soll. Wenn kein Server vorhanden ist und das Programm lokal ausgeführt wird, dann geben Sie keinen Wert für das Argument ein. Andernfalls schließen Sie den Servernamen in Anführungszeichen ("") ein. Wenn Sie RTD in Visual Basic for Applications (VBA) verwenden, sind für den Server doppelte Anführungszeichen oder die VBA-Eigenschaft NullString erforderlich, auch wenn der Server lokal ausgeführt wird.' },
            topic1: { name: 'topic1', detail: 'Topic1 ist erforderlich, nachfolgende Themen sind optional. 1 bis 253 Parameter, die zusammen einen eindeutigen Teil der Echtzeitdaten darstellen.' },
            topic2: { name: 'topic2', detail: 'Topic1 ist erforderlich, nachfolgende Themen sind optional. 1 bis 253 Parameter, die zusammen einen eindeutigen Teil der Echtzeitdaten darstellen.' },
        },
    },
    SORT: {
        description: 'In diesem Beispiel wurde nach "Region", "Vertriebsmitarbeiter" und "Produkt " einzeln mit =SORTIEREN(A2:A17) sortiert und über die Zellen F2, H2 und J2 kopiert.',
        abstract: 'In diesem Beispiel wurde nach "Region", "Vertriebsmitarbeiter" und "Produkt " einzeln mit =SORTIEREN(A2:A17) sortiert und über die Zellen F2, H2 und J2 kopiert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Der Bereich oder das Array, der/das sortiert werden soll' },
            sortIndex: { name: 'sort_index', detail: 'Eine Zahl, die die Zeile oder Spalte angibt, nach der sortiert werden soll' },
            sortOrder: { name: 'sort_order', detail: 'Eine Zahl, die die gewünschte Sortierreihenfolge angibt: "1" für aufsteigende Reihenfolge (Standard), "-1" für absteigende Reihenfolge' },
            byCol: { name: 'by_col', detail: 'Ein Wahrheitswert, der die gewünschte Sortierrichtung angibt: FALSCH zum Sortieren nach Zeile (Standard), WAHR zum Sortieren nach Spalte' },
        },
    },
    SORTBY: {
        description: 'In diesem Beispiel wird eine Liste mit den Namen von Personen nach deren Alter in aufsteigender Reihenfolge sortiert.',
        abstract: 'In diesem Beispiel wird eine Liste mit den Namen von Personen nach deren Alter in aufsteigender Reihenfolge sortiert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Das Array oder der Bereich, das/der sortiert werden soll' },
            byArray1: { name: 'by_array1', detail: 'Das Array oder der Bereich, nach dem sortiert werden soll' },
            sortOrder1: { name: 'sort_order1', detail: 'Die Reihenfolge, in der sortiert werden soll. 1 für "aufsteigend", -1 für "absteigend". Standard ist "aufsteigend".' },
            byArray2: { name: 'by_array2', detail: 'Die Matrix oder der Bereich, nach der bzw. dem sortiert werden soll' },
            sortOrder2: { name: 'sort_order2', detail: 'Die Reihenfolge, in der sortiert werden soll. 1 für "aufsteigend", -1 für "absteigend". Standard ist "aufsteigend".' },
        },
    },
    TAKE: {
        description: 'Gibt eine bestimmte Anzahl zusammenhängender Zeilen oder Spalten ab dem Anfang oder Ende einer Matrix zurück.',
        abstract: 'Gibt eine bestimmte Anzahl zusammenhängender Zeilen oder Spalten ab dem Anfang oder Ende einer Matrix zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Das Array, aus dem Zeilen oder Spalten entnommen werden sollen.' },
            rows: { name: 'rows', detail: 'Die Anzahl der zu nehmenden Zeilen. Bei einem negativen Wert erfolgt die Übernahme vom Ende des Arrays.' },
            columns: { name: 'columns', detail: 'Die Anzahl der zu nehmenden Spalten. Bei einem negativen Wert erfolgt die Übernahme vom Ende des Arrays.' },
        },
    },
    TOCOL: {
        description: 'Gibt das Array in einer einzelnen Spalte zurück.',
        abstract: 'Gibt das Array in einer einzelnen Spalte zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Die Matrix oder der Bezug, die bzw. der als Spalte zurückgegeben werden soll.' },
            ignore: { name: 'ignore', detail: 'Gibt an, ob bestimmte Werttypen ignoriert werden. Standardmäßig werden keine Werte ignoriert. Geben Sie einen der folgenden Werte an:\n0 Alle Werte beibehalten (Standard)\n1 Leere Zellen ignorieren\n2 Fehler ignorieren\n3 Leere Zellen und Fehler ignorieren' },
            scanByColumn: { name: 'scan_by_column', detail: 'Durchsucht die Matrix spaltenweise. Standardmäßig wird die Matrix zeilenweise durchsucht. Die Durchsuchung bestimmt, ob die Werte zeilen- oder spaltenweise angeordnet werden.' },
        },
    },
    TOROW: {
        description: 'Gibt die Matrix in einer einzelnen Zeile zurück.',
        abstract: 'Gibt die Matrix in einer einzelnen Zeile zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Die Matrix oder der Bezug, die bzw. der als Zeile zurückgegeben werden soll.' },
            ignore: { name: 'ignore', detail: 'Gibt an, ob bestimmte Werttypen ignoriert werden. Standardmäßig werden keine Werte ignoriert. Geben Sie einen der folgenden Werte an:\n0 Alle Werte beibehalten (Standard)\n1 Leere Zellen ignorieren\n2 Fehler ignorieren\n3 Leere Zellen und Fehler ignorieren' },
            scanByColumn: { name: 'scan_by_column', detail: 'Durchsucht die Matrix spaltenweise. Standardmäßig wird die Matrix zeilenweise durchsucht. Die Durchsuchung bestimmt, ob die Werte zeilen- oder spaltenweise angeordnet werden.' },
        },
    },
    TRANSPOSE: {
        description: 'Es kann vorkommen, dass Sie Zellen wechseln oder drehen müssen. Zu diesem Zweck können Sie die Zellen kopieren, einfügen und dann die Option "Transponieren" verwenden . Auf diese Weise werden jedoch Duplikate erstellt. Wenn Sie dies verhindern möchten, können Sie eine Formel anstelle von MTRANS verwenden. In der folgenden Abbildung werden mit der Formel =MTRANS(A1:B4) beispielsweise die Zellen A1 bis B4 horizontal angeordnet.',
        abstract: 'Es kann vorkommen, dass Sie Zellen wechseln oder drehen müssen. Zu diesem Zweck können Sie die Zellen kopieren, einfügen und dann die Option "Transponieren" verwenden . Auf diese Weise werden jedoch Duplikate erstellt. Wenn Sie dies verhindern möchten, können Sie eine Formel anstelle von MTRANS verwenden. In der folgenden Abbildung werden mit der Formel =MTRANS(A1:B4) beispielsweise die Zellen A1 bis B4 horizontal angeordnet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Ein Zellbereich oder eine Matrix in einem Arbeitsblatt.' },
        },
    },
    UNIQUE: {
        description: 'Zurückgeben von eindeutigen Namen aus einer Liste von Namen',
        abstract: 'Zurückgeben von eindeutigen Namen aus einer Liste von Namen',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Der Bereich oder das Array, aus dem eindeutige Zeilen oder Spalten zurückgegeben werden sollen' },
            byCol: { name: 'by_col', detail: 'Das Argument "nach_Spalte" ist ein logischer Wert, der angibt, wie verglichen werden soll. WAHR vergleicht Spalten miteinander und gibt die eindeutigen Spalten zurück. FALSCH (oder ausgelassen) vergleicht Zeilen miteinander und gibt die eindeutigen Zeilen zurück.' },
            exactlyOnce: { name: 'exactly_once', detail: 'Das Argument "genau_einmal" ist ein logischer Wert, der Zeilen oder Spalten zurückgibt, die im Bereich oder Array genau einmal vorkommen. Dies ist das Datenbankkonzept von EINDEUTIG. WAHR gibt alle unterschiedlichen Zeilen oder Spalten aus dem Bereich oder Array zurück, die exakt einmal vorkommen. FALSCH (oder ausgelassen) gibt alle unterschiedlichen Zeilen oder Spalten aus dem Bereich oder Array zurück.' },
        },
    },
    VLOOKUP: {
        description: 'Verwenden Sie die Funktion SVERWEIS zum Nachschlagen eines Werts in einer Tabelle.',
        abstract: 'Verwenden Sie die Funktion SVERWEIS zum Nachschlagen eines Werts in einer Tabelle.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Der Wert, nach dem Sie suchen möchten. Er muss sich in der ersten Spalte des Zellbereichs befinden, den Sie im Argument table_array angeben.' },
            tableArray: { name: 'table_array', detail: 'Der Zellbereich, in dem VLOOKUP nach lookup_value und dem Rückgabewert sucht. Sie können einen benannten Bereich oder eine Tabelle verwenden und im Argument Namen statt Zellbezügen einsetzen.' },
            colIndexNum: { name: 'col_index_num', detail: 'Die Spaltennummer (beginnend bei 1 für die äußerste linke Spalte von table_array), die den Rückgabewert enthält.' },
            rangeLookup: { name: 'range_lookup', detail: 'Ein Wahrheitswert, der angibt, ob VLOOKUP eine ungefähre oder exakte Übereinstimmung finden soll: ungefähre Übereinstimmung – 1/TRUE, exakte Übereinstimmung – 0/FALSE.' },
        },
    },
    VSTACK: {
        description: 'Fügt Arrays vertikal und nacheinander an, um ein größeres Array zurückzugeben.',
        abstract: 'Fügt Arrays vertikal und nacheinander an, um ein größeres Array zurückzugeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Die anzufügenden Matrizen.' },
            array2: { name: 'array', detail: 'Die anzufügenden Matrizen.' },
        },
    },
    WRAPCOLS: {
        description: 'Umbricht die bereitgestellte Zeile oder Spalte mit Werten spaltenweise nach einer angegebenen Anzahl von Elementen, um ein neues Array zu bilden.',
        abstract: 'Umbricht die bereitgestellte Zeile oder Spalte mit Werten spaltenweise nach einer angegebenen Anzahl von Elementen, um ein neues Array zu bilden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Der zu umschließende Vektor oder Verweis.' },
            wrapCount: { name: 'wrap_count', detail: 'Die maximale Anzahl von Werten für jede Spalte.' },
            padWith: { name: 'pad_with', detail: 'Der Wert, mit dem auf der Füllung polstert werden soll. Der Standardwert lautet #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Umbricht die bereitgestellte Zeile oder Spalte mit Werten zeilenweise nach einer angegebenen Anzahl von Elementen, um ein neues Array zu bilden.',
        abstract: 'Umbricht die bereitgestellte Zeile oder Spalte mit Werten zeilenweise nach einer angegebenen Anzahl von Elementen, um ein neues Array zu bilden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Der zu umschließende Vektor oder Verweis.' },
            wrapCount: { name: 'wrap_count', detail: 'Die maximale Anzahl von Werten für jede Zeile.' },
            padWith: { name: 'pad_with', detail: 'Der Wert, mit dem auf der Füllung polstert werden soll. Der Standardwert lautet #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Verwenden Sie die XVERWEIS Funktion, wenn Sie Elemente in einer Tabelle oder einem Bereich nach Zeile suchen. Sie können z. B. nach dem Preis eines Kfz-Teils anhand der Artikelnummer suchen oder nach einem Mitarbeiternamen anhand seiner Mitarbeiter-ID. Mit XVERWEIS können Sie in einer Spalte nach einem bestimmten Suchbegriff suchen und ein Ergebnis aus derselben Zeile in einer anderen Spalte abrufen, und zwar unabhängig davon, auf welcher Seite sich die Ergebnisspalte befindet.',
        abstract: 'Verwenden Sie die XVERWEIS Funktion, wenn Sie Elemente in einer Tabelle oder einem Bereich nach Zeile suchen. Sie können z. B. nach dem Preis eines Kfz-Teils anhand der Artikelnummer suchen oder nach einem Mitarbeiternamen anhand seiner Mitarbeiter-ID. Mit XVERWEIS können Sie in einer Spalte nach einem bestimmten Suchbegriff suchen und ein Ergebnis aus derselben Zeile in einer anderen Spalte abrufen, und zwar unabhängig davon, auf welcher Seite sich die Ergebnisspalte befindet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Der wert, nach dem gesucht werden soll *Wenn keine Angabe erfolgt, gibt XVERWEIS leere Zellen zurück, die in lookup_array gefunden werden.' },
            lookupArray: { name: 'lookup_array', detail: 'Die Matrix oder der Bereich, die/der durchsucht werden soll' },
            returnArray: { name: 'return_array', detail: 'Das Array oder der Bereich, das/der zurückgegeben werden soll' },
            ifNotFound: { name: 'if_not_found', detail: 'Wenn keine gültige Übereinstimmung gefunden wird, wird der von Ihnen bereitgestellte "[wenn_nicht_gefunden]"-Text zurückgegeben. Wenn keine gültige Übereinstimmung gefunden wird und [falls_nicht_gefunden] fehlt, wird #n/v zurückgegeben.' },
            matchMode: { name: 'match_mode', detail: 'Geben Sie den Übereinstimmungstyp an: 0: genaue Übereinstimmung. Wenn keine gefunden wird, wird "#N/V" zurückgegeben. Dies ist die Standardeinstellung. -1: genaue Übereinstimmung. Wenn keine gefunden wurde, geben Sie das nächstkleinere Element zurück. 1: genaue Übereinstimmung. Wenn keine gefunden wurde, geben Sie das nächstgrößere Element zurück. 2: eine Platzhalterübereinstimmung, wobei *, ? und ~ eine Sonderbedeutung haben.' },
            searchMode: { name: 'search_mode', detail: 'Geben Sie den zu verwendenden Suchmodus an: 1: Führen Sie eine Suche durch, die beim ersten Element beginnt. Dies ist die Standardeinstellung. -1: Führen Sie eine umgekehrte Suche durch, die beim letzten Element beginnt. 2: Führen Sie eine Binärsuche durch, die darauf basiert, dass eine Suchmatrix in aufsteigender Reihenfolge sortiert ist. Ist diese nicht so sortiert, werden ungültige Ergebnisse zurückgegeben. -2: Führen Sie eine Binärsuche durch, die darauf basiert, dass eine Suchmatrix in absteigender Reihenfolge sortiert ist. Ist diese nicht so sortiert, werden ungültige Ergebnisse zurückgegeben.' },
        },
    },
    XMATCH: {
        description: 'Angenommen, wir haben eine Liste von Produkten in den Zellen C3 bis C7 und möchten ermitteln, wo sich das Produkt aus Zelle E3 in der Liste befindet. Hier verwenden wir XVERGLEICH, um die Position eines Elements in einer Liste zu bestimmen.',
        abstract: 'Angenommen, wir haben eine Liste von Produkten in den Zellen C3 bis C7 und möchten ermitteln, wo sich das Produkt aus Zelle E3 in der Liste befindet. Hier verwenden wir XVERGLEICH, um die Position eines Elements in einer Liste zu bestimmen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Das Suchkriterium' },
            lookupArray: { name: 'lookup_array', detail: 'Die Matrix oder der Bereich, die/der durchsucht werden soll' },
            matchMode: { name: 'match_mode', detail: 'Geben Sie den Übereinstimmungstyp an: 0: exakte Übereinstimmung (Standard) -1: exakte Übereinstimmung oder nächstkleineres Element 1: exakte Übereinstimmung oder nächstgrößeres Element 2: eine Platzhalterübereinstimmung, wobei *, ? und ~ eine Sonderbedeutung haben.' },
            searchMode: { name: 'search_mode', detail: 'Geben Sie den Suchtyp an: 1: Von erstem zu letztem Element suchen (Standard) -1: Von letztem zu erstem Element suchen (umgekehrte Suche). 2: Führen Sie eine Binärsuche durch, die darauf basiert, dass eine Suchmatrix in aufsteigender Reihenfolge sortiert ist. Ist diese nicht so sortiert, werden ungültige Ergebnisse zurückgegeben. -2: Führen Sie eine Binärsuche durch, die darauf basiert, dass eine Suchmatrix in absteigender Reihenfolge sortiert ist. Ist diese nicht so sortiert, werden ungültige Ergebnisse zurückgegeben.' },
        },
    },
};

export default locale;
