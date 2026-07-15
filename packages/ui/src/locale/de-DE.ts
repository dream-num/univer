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
import emojiLocale from './emoji-locale/de-DE.generated';

const locale: typeof enUS = {
    ui: {
        emojiPicker: {
            search: 'Suchen',
            random: 'Zufälliges Emoji',
            recents: 'Zuletzt verwendet',
            emojis: 'Emojis',
            animals: 'Tiere',
            food: 'Essen',
            activities: 'Aktivitäten',
            places: 'Orte',
            objects: 'Objekte',
            symbols: 'Symbole',
            searchResults: 'Suchergebnisse',
            noResults: 'Kein Emoji gefunden',
            ...emojiLocale,
        },
        toolbar: {
            heading: {
                normal: 'Normal',
                title: 'Titel',
                subTitle: 'Untertitel',
                1: 'Überschrift 1',
                2: 'Überschrift 2',
                3: 'Überschrift 3',
                4: 'Überschrift 4',
                5: 'Überschrift 5',
                6: 'Überschrift 6',
                tooltip: 'Überschrift festlegen',
            },
        },
        ribbon: {
            start: 'Start',
            startDesc: 'Arbeitsblatt initiieren und grundlegende Parameter festlegen.',
            insert: 'Einfügen',
            insertDesc: 'Zeilen, Spalten, Diagramme und verschiedene andere Elemente einfügen.',
            formulas: 'Formeln',
            formulasDesc: 'Funktionen und Formeln für Datenberechnungen verwenden.',
            data: 'Daten',
            dataDesc: 'Daten verwalten, einschließlich Import, Sortierung und Filterung.',
            view: 'Ansicht',
            viewDesc: 'Ansichtsmodi wechseln und Anzeigeeffekt anpassen.',
            others: 'Sonstiges',
            othersDesc: 'Weitere Funktionen und Einstellungen.',
            more: 'Mehr',
        },
        fontFamily: {
            'not-supported': 'Schriftart nicht im System gefunden, Standard-Schriftart wird verwendet.',
            arial: 'Arial',
            'times-new-roman': 'Times New Roman',
            tahoma: 'Tahoma',
            verdana: 'Verdana',
            'microsoft-yahei': 'Microsoft YaHei',
            simsun: 'SimSun',
            simhei: 'SimHei',
            kaiti: 'Kaiti',
            fangsong: 'FangSong',
            nsimsun: 'NSimSun',
            stxinwei: 'STXinwei',
            stxingkai: 'STXingkai',
            stliti: 'STLiti',
        },
        'shortcut-panel': {
            title: 'Tastenkürzel',
        },
        shortcut: {
            undo: 'Rückgängig',
            redo: 'Wiederholen',
            cut: 'Ausschneiden',
            copy: 'Kopieren',
            paste: 'Einfügen',
            'shortcut-panel': 'Tastenkürzel-Panel ein-/ausblenden',
        },
        'common-edit': 'Häufige Bearbeitungstastenkürzel',
        'toggle-shortcut-panel': 'Tastenkürzel-Panel ein-/ausblenden',
        navigation: {
            back: 'Zurück',
            previous: 'Vorherige',
            next: 'Nächste',
        },
        sidebar: {
            panel: 'Seitenleiste',
            resize: 'Größe der Seitenleiste ändern',
            close: 'Seitenleiste schließen',
        },
        beforeClose: {
            title: 'Einige Änderungen wurden nicht gespeichert',
        },
        clipboard: {
            authentication: {
                title: 'Berechtigung verweigert',
                content: 'Bitte erlauben Sie Univer den Zugriff auf Ihre Zwischenablage.',
            },
        },
        textEditor: {
            formulaError: 'Bitte geben Sie eine gültige Formel ein, z. B. =SUM(A1)',
            rangeError: 'Bitte geben Sie einen gültigen Bereich ein, z. B. A1:B10',
        },
        rangeSelector: {
            title: 'Datenbereich auswählen',
            addAnotherRange: 'Bereich hinzufügen',
            buttonTooltip: 'Datenbereich auswählen',
            placeHolder: 'Bereich auswählen oder eingeben.',
            confirm: 'Bestätigen',
            cancel: 'Abbrechen',
        },
        'global-shortcut': 'Globale Tastenkürzel',
        'zoom-slider': {
            resetTo: 'Zurücksetzen auf',
        },
        row: 'Zeile',
        column: 'Spalte',
    },
};

export default locale;
