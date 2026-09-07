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
        accessibility: {
            menu: 'Menü',
            zoom: 'Zoom',
            zoomIn: 'Vergrößern',
            zoomOut: 'Verkleinern',
            resetZoom: 'Zoom zurücksetzen',
        },
        objectPermission: {
            operationDenied: 'Dieser Inhalt ist geschützt. Diese Aktion ist nicht erlaubt.',
            remove: 'Schutz entfernen',
            roleOwner: 'Dateieigentümer',
            roleEditor: 'Dateibearbeiter',
            selectedCount: 'Ausgewählt: {0}',
            searchPeople: 'Personen suchen',
            noMatchingPeople: 'Keine passenden Personen',
            loadMore: 'Mehr laden',
            fileHint: 'Die Dateifreigabe regelt die Mitgliedschaft. Diese Einstellungen schränken die Aktionen dieser Mitglieder ein.',
            documentParent: 'Die Bearbeitungseinschränkungen des Dokuments gelten auch für diesen Abschnitt.',
            paragraphParent: 'Die Bearbeitungseinschränkungen des Dokuments und des übergeordneten Abschnitts gelten auch für diesen Absatz.',
            documentObjectParent: 'Das Dokument sowie die Abschnitte und Absätze, die dieses Objekt enthalten oder verankern, können die Bearbeitung ebenfalls einschränken.',
            slideParent: 'Die Bearbeitungseinschränkungen der Präsentation gelten ebenfalls.',
            slideObjectParent: 'Die Bearbeitungseinschränkungen der Präsentation und der übergeordneten Folie oder des Masters gelten ebenfalls.',
            baseParent: 'Die Bearbeitungseinschränkungen von Base gelten ebenfalls.',
            baseObjectParent: 'Die Bearbeitungseinschränkungen von Base und der übergeordneten Tabelle gelten ebenfalls.',
            recordParent: 'Die Einschränkungen von Base und der Tabelle gelten weiterhin. Zum Bearbeiten eines Werts ist auch eine Berechtigung für das zugehörige Feld erforderlich.',
            boardParent: 'Die Bearbeitungseinschränkungen des Boards gelten auch für dieses Objekt.',
            ownerInherit: 'Dateieigentümer, geerbter Zugriff',
            peopleError: 'Personen konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
            document: 'Dokument',
            section: 'Abschnitt',
            paragraph: 'Absatz',
            entity: 'Objekt',
            presentation: 'Präsentation',
            page: 'Folie',
            master: 'Masteransicht',
            base: 'Base',
            table: 'Tabelle',
            field: 'Feld',
            record: 'Datensatz',
            view: 'Ansicht',
            board: 'Board',
            objectName: '{0}: {1}',

            search: 'Objekte suchen',
            empty: 'Keine passenden Objekte',
            more: 'Die ersten 100 Objekte werden angezeigt. Grenzen Sie die Liste mit der Suche ein.',
            title: 'Berechtigungen',
            cancel: 'Abbrechen',
            save: 'Speichern',
            saving: 'Wird gespeichert…',
            loading: 'Wird geladen…',
            conflict: 'Die Berechtigungen wurden geändert. Laden Sie vor dem Speichern neu.',
            error: 'Berechtigungen konnten nicht geladen oder gespeichert werden. Ihre Änderungen wurden beibehalten.',
            reload: 'Neu laden',
            denied: 'Sie können die Berechtigungen für dieses Objekt nicht verwalten.',
            edit: 'Wer darf bearbeiten',
            all: 'Alle Dateibearbeiter',
            owner: 'Nur der Objekteigentümer',
            members: 'Ausgewählte Mitglieder',
            copy: 'Bearbeitern das Kopieren erlauben',
            print: 'Bearbeitern das Drucken erlauben',
            export: 'Bearbeitern das Exportieren erlauben',
            comment: 'Bearbeitern das Kommentieren erlauben',
            parentHint: 'Die Einschränkungen der Datei und des übergeordneten Objekts gelten weiterhin.',
        },
        featureSearch: {
            title: 'Funktionen suchen',
            placeholder: 'Funktion oder Menüname eingeben...',
            empty: 'Keine verfügbaren Funktionen gefunden',
            ribbon: 'Menüband',
            contextMenu: 'Kontextmenü',
        },
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
        symbolPicker: {
            mathematics: 'Mathematik',
            greek: 'Griechisch',
            common: 'Allgemein',
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
        rangeSelector: {
            cancel: 'Abbrechen',
        },
        'global-shortcut': 'Globale Tastenkürzel',
        row: 'Zeile',
        column: 'Spalte',
    },
};

export default locale;
