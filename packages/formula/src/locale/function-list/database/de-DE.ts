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
    DAVERAGE: {
        description: 'Liefert den Mittelwert aus den Werten eines Felds (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        abstract: 'Liefert den Mittelwert aus den Werten eines Felds (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'ist der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'ist der Zellbereich, der die von Ihnen angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DCOUNT: {
        description: 'Ermittelt die Anzahl der Zellen, die Zahlen enthalten, in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        abstract: 'Ermittelt die Anzahl der Zellen, die Zahlen enthalten, in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DCOUNTA: {
        description: 'Ermittelt die Anzahl nicht leerer Zellen in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entspricht.',
        abstract: 'Ermittelt die Anzahl nicht leerer Zellen in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entspricht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Optional. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DGET: {
        description: 'Gibt einen einzelnen Wert aus einer Spalte einer Liste oder Datenbank zurück, der den von Ihnen angegebenen Bedingungen entspricht.',
        abstract: 'Gibt einen einzelnen Wert aus einer Spalte einer Liste oder Datenbank zurück, der den von Ihnen angegebenen Bedingungen entspricht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DMAX: {
        description: 'Gibt den größten Wert in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank zurück, der den von Ihnen angegebenen Bedingungen entspricht.',
        abstract: 'Gibt den größten Wert in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank zurück, der den von Ihnen angegebenen Bedingungen entspricht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DMIN: {
        description: 'Gibt den kleinsten Wert in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank zurück, der den von Ihnen angegebenen Bedingungen entspricht.',
        abstract: 'Gibt den kleinsten Wert in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank zurück, der den von Ihnen angegebenen Bedingungen entspricht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DPRODUCT: {
        description: 'Multipliziert die Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        abstract: 'Multipliziert die Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DSTDEV: {
        description: 'Schätzt die Standardabweichung einer Grundgesamtheit auf der Grundlage einer Stichprobe, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        abstract: 'Schätzt die Standardabweichung einer Grundgesamtheit auf der Grundlage einer Stichprobe, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DSTDEVP: {
        description: 'Berechnet die Standardabweichung auf der Grundlage der Grundgesamtheit, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        abstract: 'Berechnet die Standardabweichung auf der Grundlage der Grundgesamtheit, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DSUM: {
        description: 'In einer Liste oder Datenbank stellt DSUM die Summe der Zahlen in Feldern (Spalten) von Datensätzen bereit, die den angegebenen Bedingungen entsprechen.',
        abstract: 'In einer Liste oder Datenbank stellt DSUM die Summe der Zahlen in Feldern (Spalten) von Datensätzen bereit, die den angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Dies ist der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in denen Zeilen verwandter Informationen Datensätze und Datenspalten Felder sind. Die erste Zeile einer Liste enthält Bezeichnungen für jede Spalte darin.' },
            field: { name: 'field', detail: 'Erforderlich. Dies gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbezeichnung an, die in doppelte Anführungszeichen eingeschlossen ist, z. B. "Age" oder "Yield". Alternativ können Sie eine Zahl (ohne Anführungszeichen) angeben, die die Position der Spalte innerhalb der Liste darstellt: z. B. 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Dies ist der Zellbereich, der die von Ihnen angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DVAR: {
        description: 'Schätzt die Varianz einer Grundgesamtheit auf der Grundlage einer Stichprobe, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        abstract: 'Schätzt die Varianz einer Grundgesamtheit auf der Grundlage einer Stichprobe, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
    DVARP: {
        description: 'Berechnet die Varianz auf der Grundlage der Grundgesamtheit, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        abstract: 'Berechnet die Varianz auf der Grundlage der Grundgesamtheit, mithilfe der Werte in einem Feld (einer Spalte) mit Datensätzen in einer Liste oder Datenbank, die den von Ihnen angegebenen Bedingungen entsprechen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Erforderlich. Der Zellbereich, aus dem die Liste oder Datenbank besteht. Eine Datenbank ist eine Liste verwandter Daten, in der Zeilen mit verwandten Informationen Datensätze und Datenspalten Felder bilden. Die erste Zeile der Liste enthält Beschriftungen für die einzelnen Spalten.' },
            field: { name: 'field', detail: 'Erforderlich. Gibt an, welche Spalte in der Funktion verwendet wird. Geben Sie die Spaltenbeschriftung zwischen Anführungszeichen ein, z. B. als "Alter" oder "Ertrag", oder eine Zahl (ohne Anführungszeichen), die die Position der Spalte in der Liste darstellt: 1 für die erste Spalte, 2 für die zweite Spalte usw.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Der Zellbereich, der die angegebenen Bedingungen enthält. Sie können jeden Bereich verwenden, der mindestens eine Spaltenbeschriftung und eine Zelle unter der Beschriftung zum Angeben der Bedingung enthält.' },
        },
    },
};

export default locale;
