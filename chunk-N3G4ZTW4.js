import {
  en_US_default as en_US_default14
} from "./chunk-REZ6O7M2.js";
import {
  en_US_default,
  en_US_default10,
  en_US_default11,
  en_US_default12,
  en_US_default13,
  en_US_default14 as en_US_default15,
  en_US_default2,
  en_US_default3,
  en_US_default4,
  en_US_default5,
  en_US_default6,
  en_US_default7,
  en_US_default8,
  en_US_default9
} from "./chunk-62FTG3QU.js";
import {
  mergeLocales
} from "./chunk-EJSPXROI.js";

// ../packages/action-recorder/src/locale/de-DE.ts
var locale = {
  "action-recorder": {
    menu: {
      title: "Aktionen aufzeichnen",
      record: "Aktionen aufzeichnen...",
      "replay-local": "Lokale Aufzeichnung ersetzen...",
      "replay-local-name": "Lokale Aufzeichnung nach Untereinheit ersetzen...",
      "replay-local-active": "Lokale Aufzeichnung nach aktueller Untereinheit ersetzen..."
    }
  }
};
var de_DE_default = locale;

// ../packages/data-validation/src/locale/de-DE.ts
var locale2 = {
  "data-validation": {
    operators: {
      between: "zwischen",
      greaterThan: "gr\xF6\xDFer als",
      greaterThanOrEqual: "gr\xF6\xDFer als oder gleich",
      lessThan: "kleiner als",
      lessThanOrEqual: "kleiner als oder gleich",
      equal: "gleich",
      notEqual: "ungleich",
      notBetween: "nicht zwischen",
      legal: "ist g\xFCltiger Typ"
    },
    ruleName: {
      between: "Ist zwischen {FORMULA1} und {FORMULA2}",
      greaterThan: "Ist gr\xF6\xDFer als {FORMULA1}",
      greaterThanOrEqual: "Ist gr\xF6\xDFer als oder gleich {FORMULA1}",
      lessThan: "Ist kleiner als {FORMULA1}",
      lessThanOrEqual: "Ist kleiner als oder gleich {FORMULA1}",
      equal: "Ist gleich {FORMULA1}",
      notEqual: "Ist ungleich {FORMULA1}",
      notBetween: "Ist nicht zwischen {FORMULA1} und {FORMULA2}",
      legal: "Ist ein g\xFCltiger {TYPE}"
    },
    errorMsg: {
      between: "Wert muss zwischen {FORMULA1} und {FORMULA2} liegen",
      greaterThan: "Wert muss gr\xF6\xDFer als {FORMULA1} sein",
      greaterThanOrEqual: "Wert muss gr\xF6\xDFer als oder gleich {FORMULA1} sein",
      lessThan: "Wert muss kleiner als {FORMULA1} sein",
      lessThanOrEqual: "Wert muss kleiner als oder gleich {FORMULA1} sein",
      equal: "Wert muss gleich {FORMULA1} sein",
      notEqual: "Wert muss ungleich {FORMULA1} sein",
      notBetween: "Wert muss nicht zwischen {FORMULA1} und {FORMULA2} liegen",
      legal: "Wert muss ein g\xFCltiger {TYPE} sein"
    },
    date: {
      operators: {
        between: "zwischen",
        greaterThan: "nach",
        greaterThanOrEqual: "am oder nach",
        lessThan: "vor",
        lessThanOrEqual: "am oder vor",
        equal: "gleich",
        notEqual: "ungleich",
        notBetween: "nicht zwischen",
        legal: "ist ein g\xFCltiges Datum"
      },
      ruleName: {
        between: "ist zwischen {FORMULA1} und {FORMULA2}",
        greaterThan: "ist nach {FORMULA1}",
        greaterThanOrEqual: "ist am oder nach {FORMULA1}",
        lessThan: "ist vor {FORMULA1}",
        lessThanOrEqual: "ist am oder vor {FORMULA1}",
        equal: "ist {FORMULA1}",
        notEqual: "ist nicht {FORMULA1}",
        notBetween: "ist nicht zwischen {FORMULA1}",
        legal: "ist ein g\xFCltiges Datum"
      },
      errorMsg: {
        between: "Wert muss ein g\xFCltiges Datum sein und zwischen {FORMULA1} und {FORMULA2} liegen",
        greaterThan: "Wert muss ein g\xFCltiges Datum sein und nach {FORMULA1} liegen",
        greaterThanOrEqual: "Wert muss ein g\xFCltiges Datum sein und am oder nach {FORMULA1} liegen",
        lessThan: "Wert muss ein g\xFCltiges Datum sein und vor {FORMULA1} liegen",
        lessThanOrEqual: "Wert muss ein g\xFCltiges Datum sein und am oder vor {FORMULA1} liegen",
        equal: "Wert muss ein g\xFCltiges Datum sein und {FORMULA1} entsprechen",
        notEqual: "Wert muss ein g\xFCltiges Datum sein und nicht {FORMULA1} entsprechen",
        notBetween: "Wert muss ein g\xFCltiges Datum sein und nicht zwischen {FORMULA1} liegen",
        legal: "Wert muss ein g\xFCltiges Datum sein"
      },
      title: "Datum"
    },
    textLength: {
      errorMsg: {
        between: "Textl\xE4nge muss zwischen {FORMULA1} und {FORMULA2} liegen",
        greaterThan: "Textl\xE4nge muss gr\xF6\xDFer als {FORMULA1} sein",
        greaterThanOrEqual: "Textl\xE4nge muss gr\xF6\xDFer als oder gleich {FORMULA1} sein",
        lessThan: "Textl\xE4nge muss kleiner als {FORMULA1} sein",
        lessThanOrEqual: "Textl\xE4nge muss kleiner als oder gleich {FORMULA1} sein",
        equal: "Textl\xE4nge muss {FORMULA1} sein",
        notEqual: "Textl\xE4nge muss ungleich {FORMULA1} sein",
        notBetween: "Textl\xE4nge muss nicht zwischen {FORMULA1} liegen"
      },
      title: "Textl\xE4nge"
    },
    custom: {
      ruleName: "Benutzerdefinierte Formel ist {FORMULA1}",
      title: "Benutzerdefinierte Formel",
      validFail: "Bitte geben Sie eine g\xFCltige Formel ein",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel"
    },
    validFail: {
      value: "Bitte geben Sie einen Wert ein",
      common: "Bitte geben Sie einen Wert oder eine Formel ein",
      number: "Bitte geben Sie eine Zahl oder eine Formel ein",
      formula: "Bitte geben Sie eine Formel ein",
      integer: "Bitte geben Sie eine ganze Zahl oder eine Formel ein",
      date: "Bitte geben Sie ein Datum oder eine Formel ein",
      list: "Bitte geben Sie Optionen ein",
      listInvalid: "Die Listenquelle muss eine durch Trennzeichen getrennte Liste oder ein Bezug auf eine einzelne Zeile oder Spalte sein",
      checkboxEqual: "Geben Sie unterschiedliche Werte f\xFCr angekreuzte und nicht angekreuzte Zelleninhalte ein.",
      formulaError: "Der Bezugsbereich enth\xE4lt unsichtbare Daten, bitte passen Sie den Bereich an",
      listIntersects: "Der ausgew\xE4hlte Bereich darf sich nicht mit dem Geltungsbereich der Regeln \xFCberschneiden",
      primitive: "Formeln sind f\xFCr benutzerdefinierte angekreuzte und nicht angekreuzte Werte nicht zul\xE4ssig."
    },
    any: {
      title: "Beliebiger Wert",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel"
    },
    list: {
      title: "Dropdown",
      name: "Wert enth\xE4lt einen aus dem Bereich",
      error: "Eingabe muss im angegebenen Bereich liegen",
      emptyError: "Bitte geben Sie einen Wert ein",
      add: "Hinzuf\xFCgen",
      dropdown: "Ausw\xE4hlen",
      options: "Optionen",
      customOptions: "Benutzerdefiniert",
      refOptions: "Aus einem Bereich",
      formulaError: "Die Listenquelle muss eine durch Trennzeichen getrennte Datenliste oder ein Bezug auf eine einzelne Zeile oder Spalte sein.",
      edit: "Bearbeiten"
    },
    listMultiple: {
      title: "Dropdown-Mehrfachauswahl",
      dropdown: "Mehrfachauswahl"
    },
    decimal: {
      title: "Zahl"
    },
    whole: {
      title: "Ganze Zahl"
    },
    checkbox: {
      title: "Kontrollk\xE4stchen",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel",
      tips: "Benutzerdefinierte Werte in Zellen verwenden",
      checked: "Ausgew\xE4hlter Wert",
      unchecked: "Nicht ausgew\xE4hlter Wert"
    }
  }
};
var de_DE_default2 = locale2;

// ../packages/design/src/locale/de-DE.ts
var locale3 = {
  design: {
    Confirm: {
      cancel: "Abbrechen",
      confirm: "OK"
    },
    CascaderList: {
      empty: "Keine"
    },
    Calendar: {
      year: "",
      weekDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      months: [
        "Jan",
        "Feb",
        "M\xE4r",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez"
      ]
    },
    Select: {
      empty: "Keine"
    },
    ColorPicker: {
      more: "Mehr Farben",
      cancel: "Abbrechen",
      confirm: "OK"
    },
    GradientColorPicker: {
      linear: "Linear",
      radial: "Radial",
      angular: "Winkel",
      diamond: "Diamant",
      offset: "Versatz",
      angle: "Winkel",
      flip: "Umkehren",
      delete: "L\xF6schen"
    }
  }
};
var de_DE_default3 = locale3;

// ../packages/docs-drawing-ui/src/locale/de-DE.ts
var locale4 = {
  "docs-drawing-ui": {
    title: "Bild",
    upload: {
      float: "Bild einf\xFCgen"
    },
    panel: {
      title: "Bild bearbeiten"
    },
    "image-popup": {
      replace: "Ersetzen",
      delete: "L\xF6schen",
      edit: "Bearbeiten",
      crop: "Zuschneiden",
      reset: "Gr\xF6\xDFe zur\xFCcksetzen"
    },
    "image-text-wrap": {
      title: "Textumbruch",
      wrappingStyle: "Umbruchstil",
      square: "Quadratisch",
      topAndBottom: "Oben und unten",
      inline: "Im Textfluss",
      behindText: "Hinter dem Text",
      inFrontText: "Vor dem Text",
      wrapText: "Text umbrechen",
      bothSide: "Beide Seiten",
      leftOnly: "Nur links",
      rightOnly: "Nur rechts",
      distanceFromText: "Abstand vom Text",
      top: "Oben(px)",
      left: "Links(px)",
      bottom: "Unten(px)",
      right: "Rechts(px)"
    },
    "image-position": {
      title: "Position",
      horizontal: "Horizontal",
      vertical: "Vertikal",
      absolutePosition: "Absolute Position(px)",
      relativePosition: "Relative Position",
      toTheRightOf: "rechts von",
      relativeTo: "relativ zu",
      bellow: "unterhalb",
      options: "Optionen",
      moveObjectWithText: "Objekt mit Text verschieben",
      column: "Spalte",
      margin: "Rand",
      page: "Seite",
      line: "Zeile",
      paragraph: "Absatz"
    },
    "update-status": {
      exceedMaxSize: "Bildgr\xF6\xDFe \xFCberschreitet das Limit, das Limit ist {0}M",
      invalidImageType: "Ung\xFCltiger Bildtyp",
      exceedMaxCount: "Es k\xF6nnen nur {0} Bilder gleichzeitig hochgeladen werden",
      invalidImage: "Ung\xFCltiges Bild"
    },
    shortcut: {
      "drawing-view": "Zeichnungsansicht",
      "drawing-move-down": "Zeichnung nach unten verschieben",
      "drawing-move-up": "Zeichnung nach oben verschieben",
      "drawing-move-left": "Zeichnung nach links verschieben",
      "drawing-move-right": "Zeichnung nach rechts verschieben",
      "drawing-delete": "Zeichnung l\xF6schen"
    }
  }
};
var de_DE_default4 = locale4;

// ../packages/docs-hyper-link-ui/src/locale/de-DE.ts
var locale5 = {
  "docs-hyper-link-ui": {
    edit: {
      confirm: "Best\xE4tigen",
      cancel: "Abbrechen",
      title: "Link",
      address: "Link",
      placeholder: "Bitte eine Link-URL eingeben",
      addressError: "URL ist ung\xFCltig!",
      label: "Bezeichnung",
      labelError: "Bitte die Bezeichnung des Links eingeben"
    },
    info: {
      copy: "Kopieren",
      edit: "Bearbeiten",
      cancel: "Link abbrechen",
      coped: "Link in die Zwischenablage kopiert"
    },
    menu: {
      tooltip: "Link hinzuf\xFCgen"
    }
  }
};
var de_DE_default5 = locale5;

// ../packages/docs-quick-insert-ui/src/locale/de-DE.ts
var locale6 = {
  "docs-quick-insert-ui": {
    menu: {
      numberedList: "Nummerierte Liste",
      bulletedList: "Aufz\xE4hlungsliste",
      divider: "Trennlinie",
      text: "Text",
      table: "Tabelle",
      image: "Bild"
    },
    group: {
      basics: "Grundlagen"
    },
    placeholder: "Keine Ergebnisse gefunden",
    keywordInputPlaceholder: "Stichw\xF6rter eingeben"
  }
};
var de_DE_default6 = locale6;

// ../packages/docs-thread-comment-ui/src/locale/de-DE.ts
var locale7 = {
  "docs-thread-comment-ui": {
    panel: {
      title: "Kommentarverwaltung",
      addComment: "Kommentar hinzuf\xFCgen"
    }
  }
};
var de_DE_default7 = locale7;

// ../packages/docs-ui/src/locale/de-DE.ts
var locale8 = {
  "docs-ui": {
    toolbar: {
      undo: "R\xFCckg\xE4ngig",
      redo: "Wiederholen",
      font: "Schriftart",
      fontSize: "Schriftgr\xF6\xDFe",
      bold: "Fett",
      italic: "Kursiv",
      strikethrough: "Durchgestrichen",
      subscript: "Tiefgestellt",
      superscript: "Hochgestellt",
      underline: "Unterstrichen",
      textColor: {
        main: "Textfarbe"
      },
      fillColor: {
        main: "Texthintergrundfarbe"
      },
      table: {
        main: "Tabelle",
        insert: "Tabelle einf\xFCgen",
        colCount: "Spaltenanzahl",
        rowCount: "Zeilenanzahl"
      },
      resetColor: "Zur\xFCcksetzen",
      order: "Nummerierte Liste",
      unorder: "Aufz\xE4hlungsliste",
      checklist: "Aufgabenliste",
      documentFlavor: "Moderner Modus",
      alignLeft: "Linksb\xFCndig",
      alignCenter: "Zentriert",
      alignRight: "Rechtsb\xFCndig",
      alignJustify: "Blocksatz",
      horizontalLine: "Horizontale Linie",
      headerFooter: "Kopf- und Fu\xDFzeile",
      pageSetup: "Seite einrichten"
    },
    table: {
      insert: "Einf\xFCgen",
      insertRowAbove: "Zeile oben einf\xFCgen",
      insertRowBelow: "Zeile unten einf\xFCgen",
      insertColumnLeft: "Spalte links einf\xFCgen",
      insertColumnRight: "Spalte rechts einf\xFCgen",
      delete: "L\xF6schen",
      deleteRows: "Zeile l\xF6schen",
      deleteColumns: "Spalte l\xF6schen",
      deleteTable: "Tabelle l\xF6schen"
    },
    headerFooter: {
      header: "Kopfzeile",
      footer: "Fu\xDFzeile",
      panel: "Kopf- und Fu\xDFzeileneinstellungen",
      firstPageCheckBox: "Andere erste Seite",
      oddEvenCheckBox: "Unterschiedliche ungerade und gerade Seiten",
      headerTopMargin: "Kopfzeilenoberer Rand (px)",
      footerBottomMargin: "Fu\xDFzeilenunterer Rand (px)",
      closeHeaderFooter: "Kopf- und Fu\xDFzeile schlie\xDFen",
      disableText: "Kopf- und Fu\xDFzeileneinstellungen sind deaktiviert"
    },
    doc: {
      menu: {
        paragraphSetting: "Absatzeinstellungen"
      },
      slider: {
        paragraphSetting: "Absatzeinstellungen"
      },
      paragraphSetting: {
        alignment: "Ausrichtung",
        indentation: "Einzug",
        left: "Links",
        right: "Rechts",
        firstLine: "Erste Zeile",
        hanging: "H\xE4ngender Einzug",
        spacing: "Abstand",
        before: "Vor",
        after: "Nach",
        lineSpace: "Zeilenabstand",
        multiSpace: "Mehrfacher Abstand",
        fixedValue: "Fester Wert (px)"
      }
    },
    rightClick: {
      copy: "Kopieren",
      cut: "Ausschneiden",
      paste: "Einf\xFCgen",
      delete: "L\xF6schen",
      bulletList: "Aufz\xE4hlungsliste",
      orderList: "Nummerierte Liste",
      checkList: "Aufgabenliste",
      insertBellow: "Unten einf\xFCgen"
    },
    "page-settings": {
      "document-setting": "Dokumenteneinstellung",
      mode: "Modus",
      "modern-mode": "Modern",
      "classic-mode": "Klassisch",
      "modern-width": "Inhaltsbreite",
      "modern-width-narrow": "Schmal",
      "modern-width-medium": "Mittel",
      "modern-width-wide": "Breit",
      "paper-size": "Papierformat",
      "page-size": {
        main: "Papierformat",
        a4: "A4",
        a3: "A3",
        a5: "A5",
        b4: "B4",
        b5: "B5",
        letter: "Letter",
        legal: "Legal",
        tabloid: "Tabloid",
        statement: "Statement",
        executive: "Executive",
        folio: "Folio"
      },
      orientation: "Ausrichtung",
      portrait: "Hochformat",
      landscape: "Querformat",
      "custom-paper-size": "Benutzerdefiniertes Papierformat",
      top: "Oben",
      bottom: "Unten",
      left: "Links",
      right: "Rechts",
      cancel: "Abbrechen",
      confirm: "Best\xE4tigen"
    }
  }
};
var de_DE_default8 = locale8;

// ../packages/drawing-ui/src/locale/de-DE.ts
var locale9 = {
  "drawing-ui": {
    "image-cropper": {
      error: "Nicht-Bildobjekte k\xF6nnen nicht zugeschnitten werden."
    },
    "image-panel": {
      arrange: {
        title: "Anordnen",
        forward: "Eine Ebene nach vorne",
        backward: "Eine Ebene nach hinten",
        front: "In den Vordergrund",
        back: "In den Hintergrund"
      },
      transform: {
        title: "Transformieren",
        rotate: "Drehen (\xB0)",
        x: "X (px)",
        y: "Y (px)",
        width: "Breite (px)",
        height: "H\xF6he (px)",
        lock: "Verh\xE4ltnis sperren (%)"
      },
      crop: {
        title: "Zuschneiden",
        start: "Zuschneiden starten",
        mode: "Frei"
      },
      group: {
        title: "Gruppe",
        group: "Gruppieren",
        unGroup: "Gruppierung aufheben"
      },
      align: {
        title: "Ausrichten",
        default: "Ausrichtungstyp ausw\xE4hlen",
        left: "Linksb\xFCndig",
        center: "Zentriert",
        right: "Rechtsb\xFCndig",
        top: "Oben b\xFCndig",
        middle: "Mittig",
        bottom: "Unten b\xFCndig",
        horizon: "Horizontal verteilen",
        vertical: "Vertikal verteilen"
      },
      null: "Keine Objektauswahl"
    },
    "image-text-wrap": {
      title: "Textumbruch",
      wrappingStyle: "Umbruchstil",
      square: "Quadratisch",
      topAndBottom: "Oben und unten",
      inline: "Im Textfluss",
      behindText: "Hinter dem Text",
      inFrontText: "Vor dem Text",
      wrapText: "Text umbrechen",
      bothSide: "Beide Seiten",
      leftOnly: "Nur links",
      rightOnly: "Nur rechts",
      distanceFromText: "Abstand vom Text",
      top: "Oben(px)",
      left: "Links(px)",
      bottom: "Unten(px)",
      right: "Rechts(px)"
    },
    "image-popup": {
      replace: "Ersetzen",
      delete: "L\xF6schen",
      edit: "Bearbeiten",
      crop: "Zuschneiden",
      reset: "Gr\xF6\xDFe zur\xFCcksetzen"
    }
  }
};
var de_DE_default9 = locale9;

// ../packages/find-replace/src/locale/de-DE.ts
var locale10 = {
  "find-replace": {
    toolbar: "Suchen & Ersetzen",
    shortcut: {
      "open-find-dialog": "Suchdialog \xF6ffnen",
      "open-replace-dialog": "Ersetzungsdialog \xF6ffnen",
      "close-dialog": "Suchen & Ersetzen-Dialog schlie\xDFen",
      "go-to-next-match": "Zum n\xE4chsten Treffer springen",
      "go-to-previous-match": "Zum vorherigen Treffer springen",
      "focus-selection": "Auswahl fokussieren",
      panel: "Suchen & Ersetzen"
    },
    dialog: {
      title: "Suchen",
      find: "Suchen",
      replace: "Ersetzen",
      "replace-all": "Alle ersetzen",
      "case-sensitive": "Gro\xDF-/Kleinschreibung beachten",
      "find-placeholder": "In diesem Blatt suchen",
      "advanced-finding": "Erweitertes Suchen & Ersetzen",
      "replace-placeholder": "Ersetzungstext eingeben",
      "match-the-whole-cell": "Ganze Zelle vergleichen",
      "find-direction": {
        title: "Suchrichtung",
        row: "Nach Zeile suchen",
        column: "Nach Spalte suchen"
      },
      "find-scope": {
        title: "Suchbereich",
        "current-sheet": "Aktuelles Blatt",
        workbook: "Arbeitsmappe"
      },
      "find-by": {
        title: "Suchen nach",
        value: "Nach Wert suchen",
        formula: "Formel suchen"
      },
      "no-match": "Suche abgeschlossen, aber kein Treffer gefunden.",
      "no-result": "Kein Ergebnis"
    },
    replace: {
      "all-success": "Alle {0} Treffer ersetzt",
      "all-failure": "Ersetzen fehlgeschlagen",
      confirm: {
        title: "Sollen alle Treffer ersetzt werden?"
      }
    },
    button: {
      confirm: "OK",
      cancel: "Abbrechen"
    }
  }
};
var de_DE_default10 = locale10;

// ../packages/sheets/src/locale/de-DE.ts
var locale11 = {
  sheets: {
    tabs: {
      sheetCopy: "(Kopie{0})",
      sheet: "Blatt"
    },
    info: {
      overlappingSelections: "Dieser Befehl kann nicht f\xFCr \xFCberlappende Auswahlen verwendet werden",
      acrossMergedCell: "\xDCber eine verbundene Zelle",
      partOfCell: "Es ist nur ein Teil einer verbundenen Zelle ausgew\xE4hlt",
      hideSheet: "Nach dem Ausblenden ist kein Blatt mehr sichtbar"
    },
    definedName: {
      nameEmpty: "Name darf nicht leer sein",
      nameDuplicate: "Name existiert bereits",
      nameInvalid: "Der Name ist ung\xFCltig",
      nameSheetConflict: "Der Name steht im Konflikt mit dem Blattnamen",
      formulaOrRefStringEmpty: "Formel oder Referenzzeichenfolge darf nicht leer sein",
      nameConflict: "Der Name steht im Konflikt mit dem Funktionsnamen",
      defaultName: "Definierter Name"
    },
    permission: {
      dialog: {
        autoFillErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Berechtigung f\xFCr das automatische Ausf\xFCllen. Um das automatische Ausf\xFCllen zu verwenden, wenden Sie sich bitte an den Ersteller.",
        editErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, wenden Sie sich bitte an den Ersteller.",
        formulaErr: "Der Bereich oder der referenzierte Bereich ist gesch\xFCtzt, und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, wenden Sie sich bitte an den Ersteller.",
        insertOrDeleteMoveRangeErr: "Der eingef\xFCgte oder gel\xF6schte Bereich \xFCberschneidet sich mit dem gesch\xFCtzten Bereich, und dieser Vorgang wird derzeit nicht unterst\xFCtzt.",
        insertRowColErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Berechtigung, Zeilen und Spalten einzuf\xFCgen. Um Zeilen und Spalten einzuf\xFCgen, wenden Sie sich bitte an den Ersteller.",
        moveRangeErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Berechtigung, die Auswahl zu verschieben. Um die Auswahl zu verschieben, wenden Sie sich bitte an den Ersteller.",
        moveRowColErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Berechtigung, Zeilen und Spalten zu verschieben. Um Zeilen und Spalten zu verschieben, wenden Sie sich bitte an den Ersteller.",
        operatorSheetErr: "Das Arbeitsblatt ist gesch\xFCtzt, und Sie haben keine Berechtigung, das Arbeitsblatt zu bearbeiten. Um das Arbeitsblatt zu bearbeiten, wenden Sie sich bitte an den Ersteller.",
        removeRowColErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Berechtigung, Zeilen und Spalten zu l\xF6schen. Um Zeilen und Spalten zu l\xF6schen, wenden Sie sich bitte an den Ersteller.",
        setRowColStyleErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Berechtigung, Zeilen- und Spaltenstile festzulegen. Um Zeilen- und Spaltenstile festzulegen, wenden Sie sich bitte an den Ersteller.",
        setStyleErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Berechtigung, Stile festzulegen. Um Stile festzulegen, wenden Sie sich bitte an den Ersteller."
      }
    },
    autoFill: {
      copy: "Zelle kopieren",
      series: "Reihe ausf\xFCllen",
      formatOnly: "Nur Format",
      noFormat: "Kein Format"
    },
    merge: {
      confirm: {
        title: "Beim Fortfahren mit dem Zusammenf\xFChren bleibt nur der Wert der oberen linken Zelle erhalten, andere Werte werden verworfen. M\xF6chten Sie wirklich fortfahren?",
        cancel: "Zusammenf\xFChren abbrechen",
        confirm: "Zusammenf\xFChren fortsetzen",
        warning: "Warnung",
        dismantleMergeCellWarning: "Dadurch werden einige verbundene Zellen aufgeteilt. M\xF6chten Sie fortfahren?"
      }
    }
  }
};
var de_DE_default11 = locale11;

// ../packages/sheets-conditional-formatting-ui/src/locale/de-DE.ts
var locale12 = {
  "sheets-conditional-formatting-ui": {
    title: "Bedingte Formatierung",
    menu: {
      manageConditionalFormatting: "Bedingte Formatierung verwalten",
      createConditionalFormatting: "Bedingte Formatierung erstellen",
      clearRangeRules: "Regeln f\xFCr ausgew\xE4hlten Bereich l\xF6schen",
      clearWorkSheetRules: "Regeln f\xFCr gesamtes Blatt l\xF6schen"
    },
    form: {
      lessThan: "Der Wert muss kleiner als {0} sein",
      lessThanOrEqual: "Der Wert muss kleiner oder gleich {0} sein",
      greaterThan: "Der Wert muss gr\xF6\xDFer als {0} sein",
      greaterThanOrEqual: "Der Wert muss gr\xF6\xDFer oder gleich {0} sein",
      rangeSelector: "Bereich ausw\xE4hlen oder Wert eingeben"
    },
    iconSet: {
      direction: "Richtung",
      shape: "Form",
      mark: "Zeichen",
      rank: "Rang",
      rule: "Regel",
      icon: "Symbol",
      type: "Typ",
      value: "Wert",
      reverseIconOrder: "Symbolreihenfolge umkehren",
      and: "Und",
      when: "Wenn",
      onlyShowIcon: "Nur Symbol anzeigen"
    },
    symbol: {
      greaterThan: ">",
      greaterThanOrEqual: ">=",
      lessThan: "<",
      lessThanOrEqual: "<="
    },
    panel: {
      createRule: "Regel erstellen",
      clear: "Alle Regeln l\xF6schen",
      range: "Bereich anwenden",
      styleType: "Stiltyp",
      submit: "Anwenden",
      cancel: "Abbrechen",
      rankAndAverage: "Oben/Unten/Mittelwert",
      styleRule: "Stilregel",
      isNotBottom: "Oben",
      isBottom: "Unten",
      greaterThanAverage: "Gr\xF6\xDFer als Mittelwert",
      lessThanAverage: "Kleiner als Mittelwert",
      medianValue: "Medianwert",
      fillType: "F\xFClltyp",
      pureColor: "Einfarbig",
      gradient: "Farbverlauf",
      colorSet: "Farbsatz",
      positive: "Positiv",
      native: "Negativ",
      workSheet: "Gesamtes Blatt",
      selectedRange: "Ausgew\xE4hlter Bereich",
      managerRuleSelect: "{0} Regeln verwalten",
      onlyShowDataBar: "Nur Datenbalken anzeigen"
    },
    preview: {
      describe: {
        beginsWith: "Beginnt mit {0}",
        endsWith: "Endet mit {0}",
        containsText: "Text enth\xE4lt {0}",
        notContainsText: "Text enth\xE4lt nicht {0}",
        equal: "Gleich {0}",
        notEqual: "Ungleich {0}",
        containsBlanks: "Enth\xE4lt Leerzellen",
        notContainsBlanks: "Enth\xE4lt keine Leerzellen",
        containsErrors: "Enth\xE4lt Fehler",
        notContainsErrors: "Enth\xE4lt keine Fehler",
        greaterThan: "Gr\xF6\xDFer als {0}",
        greaterThanOrEqual: "Gr\xF6\xDFer oder gleich {0}",
        lessThan: "Kleiner als {0}",
        lessThanOrEqual: "Kleiner oder gleich {0}",
        notBetween: "Nicht zwischen {0} und {1}",
        between: "Zwischen {0} und {1}",
        yesterday: "Gestern",
        tomorrow: "Morgen",
        last7Days: "Letzte 7 Tage",
        thisMonth: "Dieser Monat",
        lastMonth: "Letzter Monat",
        nextMonth: "N\xE4chster Monat",
        thisWeek: "Diese Woche",
        lastWeek: "Letzte Woche",
        nextWeek: "N\xE4chste Woche",
        today: "Heute",
        topN: "Oben {0}",
        bottomN: "Unten {0}",
        topNPercent: "Oben {0}%",
        bottomNPercent: "Unten {0}%"
      }
    },
    operator: {
      beginsWith: "Beginnt mit",
      endsWith: "Endet mit",
      containsText: "Text enth\xE4lt",
      notContainsText: "Text enth\xE4lt nicht",
      equal: "Gleich",
      notEqual: "Ungleich",
      containsBlanks: "Enth\xE4lt Leerzellen",
      notContainsBlanks: "Enth\xE4lt keine Leerzellen",
      containsErrors: "Enth\xE4lt Fehler",
      notContainsErrors: "Enth\xE4lt keine Fehler",
      greaterThan: "Gr\xF6\xDFer als",
      greaterThanOrEqual: "Gr\xF6\xDFer oder gleich",
      lessThan: "Kleiner als",
      lessThanOrEqual: "Kleiner oder gleich",
      notBetween: "Nicht zwischen",
      between: "Zwischen",
      yesterday: "Gestern",
      tomorrow: "Morgen",
      last7Days: "Letzte 7 Tage",
      thisMonth: "Dieser Monat",
      lastMonth: "Letzter Monat",
      nextMonth: "N\xE4chster Monat",
      thisWeek: "Diese Woche",
      lastWeek: "Letzte Woche",
      nextWeek: "N\xE4chste Woche",
      today: "Heute"
    },
    ruleType: {
      highlightCell: "Zelle hervorheben",
      dataBar: "Datenbalken",
      colorScale: "Farbskala",
      formula: "Benutzerdefinierte Formel",
      iconSet: "Symbolsatz",
      duplicateValues: "Doppelte Werte",
      uniqueValues: "Einzigartige Werte"
    },
    subRuleType: {
      uniqueValues: "Einzigartige Werte",
      duplicateValues: "Doppelte Werte",
      rank: "Rang",
      text: "Text",
      timePeriod: "Zeitraum",
      number: "Zahl",
      average: "Mittelwert"
    },
    valueType: {
      num: "Zahl",
      min: "Minimum",
      max: "Maximum",
      percent: "Prozent",
      percentile: "Perzentil",
      formula: "Formel",
      none: "Keine"
    },
    errorMessage: {
      notBlank: "Bedingung darf nicht leer sein",
      formulaError: "Falsche Formel",
      rangeError: "Ung\xFCltige Auswahl"
    },
    permission: {
      dialog: {
        setStyleErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung, Stile festzulegen. Um Stile festzulegen, wenden Sie sich bitte an den Ersteller."
      }
    }
  }
};
var de_DE_default12 = locale12;

// ../packages/sheets-crosshair-highlight/src/locale/de-DE.ts
var locale13 = {
  "sheets-crosshair-highlight": {
    button: {
      tooltip: "Fadenkreuz-Hervorhebung"
    }
  }
};
var de_DE_default13 = locale13;

// ../packages/sheets-data-validation/src/locale/de-DE.ts
var locale14 = {
  "sheets-data-validation": {
    operators: {
      between: "zwischen",
      greaterThan: "gr\xF6\xDFer als",
      greaterThanOrEqual: "gr\xF6\xDFer als oder gleich",
      lessThan: "kleiner als",
      lessThanOrEqual: "kleiner als oder gleich",
      equal: "gleich",
      notEqual: "ungleich",
      notBetween: "nicht zwischen",
      legal: "ist g\xFCltiger Typ"
    },
    ruleName: {
      between: "Ist zwischen {FORMULA1} und {FORMULA2}",
      greaterThan: "Ist gr\xF6\xDFer als {FORMULA1}",
      greaterThanOrEqual: "Ist gr\xF6\xDFer als oder gleich {FORMULA1}",
      lessThan: "Ist kleiner als {FORMULA1}",
      lessThanOrEqual: "Ist kleiner als oder gleich {FORMULA1}",
      equal: "Ist gleich {FORMULA1}",
      notEqual: "Ist ungleich {FORMULA1}",
      notBetween: "Ist nicht zwischen {FORMULA1} und {FORMULA2}",
      legal: "Ist ein g\xFCltiger {TYPE}"
    },
    errorMsg: {
      between: "Wert muss zwischen {FORMULA1} und {FORMULA2} liegen",
      greaterThan: "Wert muss gr\xF6\xDFer als {FORMULA1} sein",
      greaterThanOrEqual: "Wert muss gr\xF6\xDFer als oder gleich {FORMULA1} sein",
      lessThan: "Wert muss kleiner als {FORMULA1} sein",
      lessThanOrEqual: "Wert muss kleiner als oder gleich {FORMULA1} sein",
      equal: "Wert muss gleich {FORMULA1} sein",
      notEqual: "Wert muss ungleich {FORMULA1} sein",
      notBetween: "Wert muss nicht zwischen {FORMULA1} und {FORMULA2} liegen",
      legal: "Wert muss ein g\xFCltiger {TYPE} sein"
    },
    date: {
      operators: {
        between: "zwischen",
        greaterThan: "nach",
        greaterThanOrEqual: "am oder nach",
        lessThan: "vor",
        lessThanOrEqual: "am oder vor",
        equal: "gleich",
        notEqual: "ungleich",
        notBetween: "nicht zwischen",
        legal: "ist ein g\xFCltiges Datum"
      },
      ruleName: {
        between: "ist zwischen {FORMULA1} und {FORMULA2}",
        greaterThan: "ist nach {FORMULA1}",
        greaterThanOrEqual: "ist am oder nach {FORMULA1}",
        lessThan: "ist vor {FORMULA1}",
        lessThanOrEqual: "ist am oder vor {FORMULA1}",
        equal: "ist {FORMULA1}",
        notEqual: "ist nicht {FORMULA1}",
        notBetween: "ist nicht zwischen {FORMULA1}",
        legal: "ist ein g\xFCltiges Datum"
      },
      errorMsg: {
        between: "Wert muss ein g\xFCltiges Datum sein und zwischen {FORMULA1} und {FORMULA2} liegen",
        greaterThan: "Wert muss ein g\xFCltiges Datum sein und nach {FORMULA1} liegen",
        greaterThanOrEqual: "Wert muss ein g\xFCltiges Datum sein und am oder nach {FORMULA1} liegen",
        lessThan: "Wert muss ein g\xFCltiges Datum sein und vor {FORMULA1} liegen",
        lessThanOrEqual: "Wert muss ein g\xFCltiges Datum sein und am oder vor {FORMULA1} liegen",
        equal: "Wert muss ein g\xFCltiges Datum sein und {FORMULA1} entsprechen",
        notEqual: "Wert muss ein g\xFCltiges Datum sein und nicht {FORMULA1} entsprechen",
        notBetween: "Wert muss ein g\xFCltiges Datum sein und nicht zwischen {FORMULA1} liegen",
        legal: "Wert muss ein g\xFCltiges Datum sein"
      },
      title: "Datum"
    },
    textLength: {
      errorMsg: {
        between: "Textl\xE4nge muss zwischen {FORMULA1} und {FORMULA2} liegen",
        greaterThan: "Textl\xE4nge muss gr\xF6\xDFer als {FORMULA1} sein",
        greaterThanOrEqual: "Textl\xE4nge muss gr\xF6\xDFer als oder gleich {FORMULA1} sein",
        lessThan: "Textl\xE4nge muss kleiner als {FORMULA1} sein",
        lessThanOrEqual: "Textl\xE4nge muss kleiner als oder gleich {FORMULA1} sein",
        equal: "Textl\xE4nge muss {FORMULA1} sein",
        notEqual: "Textl\xE4nge muss ungleich {FORMULA1} sein",
        notBetween: "Textl\xE4nge muss nicht zwischen {FORMULA1} liegen"
      },
      title: "Textl\xE4nge"
    },
    custom: {
      ruleName: "Benutzerdefinierte Formel ist {FORMULA1}",
      title: "Benutzerdefinierte Formel",
      validFail: "Bitte geben Sie eine g\xFCltige Formel ein",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel"
    },
    validFail: {
      value: "Bitte geben Sie einen Wert ein",
      common: "Bitte geben Sie einen Wert oder eine Formel ein",
      number: "Bitte geben Sie eine Zahl oder eine Formel ein",
      formula: "Bitte geben Sie eine Formel ein",
      integer: "Bitte geben Sie eine ganze Zahl oder eine Formel ein",
      date: "Bitte geben Sie ein Datum oder eine Formel ein",
      list: "Bitte geben Sie Optionen ein",
      listInvalid: "Die Listenquelle muss eine durch Trennzeichen getrennte Liste oder ein Bezug auf eine einzelne Zeile oder Spalte sein",
      checkboxEqual: "Geben Sie unterschiedliche Werte f\xFCr angekreuzte und nicht angekreuzte Zelleninhalte ein.",
      formulaError: "Der Bezugsbereich enth\xE4lt unsichtbare Daten, bitte passen Sie den Bereich an",
      listIntersects: "Der ausgew\xE4hlte Bereich darf sich nicht mit dem Geltungsbereich der Regeln \xFCberschneiden",
      primitive: "Formeln sind f\xFCr benutzerdefinierte angekreuzte und nicht angekreuzte Werte nicht zul\xE4ssig."
    },
    any: {
      title: "Beliebiger Wert",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel"
    },
    list: {
      title: "Dropdown",
      name: "Wert enth\xE4lt einen aus dem Bereich",
      error: "Eingabe muss im angegebenen Bereich liegen",
      emptyError: "Bitte geben Sie einen Wert ein",
      add: "Hinzuf\xFCgen",
      dropdown: "Ausw\xE4hlen",
      options: "Optionen",
      customOptions: "Benutzerdefiniert",
      refOptions: "Aus einem Bereich",
      formulaError: "Die Listenquelle muss eine durch Trennzeichen getrennte Datenliste oder ein Bezug auf eine einzelne Zeile oder Spalte sein.",
      edit: "Bearbeiten"
    },
    listMultiple: {
      title: "Dropdown-Mehrfachauswahl",
      dropdown: "Mehrfachauswahl"
    },
    decimal: {
      title: "Zahl"
    },
    whole: {
      title: "Ganze Zahl"
    },
    checkbox: {
      title: "Kontrollk\xE4stchen",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel",
      tips: "Benutzerdefinierte Werte in Zellen verwenden",
      checked: "Ausgew\xE4hlter Wert",
      unchecked: "Nicht ausgew\xE4hlter Wert"
    }
  }
};
var de_DE_default14 = locale14;

// ../packages/sheets-data-validation-ui/src/locale/de-DE.ts
var locale15 = {
  "sheets-data-validation-ui": {
    title: "Daten\xFCberpr\xFCfung",
    validFail: {
      value: "Bitte einen Wert eingeben",
      common: "Bitte Wert oder Formel eingeben",
      number: "Bitte Zahl oder Formel eingeben",
      formula: "Bitte Formel eingeben",
      integer: "Bitte Ganzzahl oder Formel eingeben",
      date: "Bitte Datum oder Formel eingeben",
      list: "Bitte Optionen eingeben",
      listInvalid: "Die Listenquelle muss eine durch Trennzeichen getrennte Liste oder ein Bezug auf eine einzelne Zeile oder Spalte sein",
      checkboxEqual: "Geben Sie unterschiedliche Werte f\xFCr angekreuzte und nicht angekreuzte Zelleninhalte ein.",
      formulaError: "Der Referenzbereich enth\xE4lt unsichtbare Daten, bitte passen Sie den Bereich an",
      listIntersects: "Der ausgew\xE4hlte Bereich darf sich nicht mit dem G\xFCltigkeitsbereich der Regeln \xFCberschneiden",
      primitive: "Formeln sind f\xFCr benutzerdefinierte angekreuzte und nicht angekreuzte Werte nicht zul\xE4ssig."
    },
    panel: {
      title: "Daten\xFCberpr\xFCfungsverwaltung",
      addTitle: "Neue Daten\xFCberpr\xFCfung erstellen",
      removeAll: "Alle entfernen",
      add: "Regel hinzuf\xFCgen",
      range: "Bereiche",
      type: "Typ",
      options: "Erweiterte Optionen",
      operator: "Operator",
      removeRule: "Entfernen",
      done: "Fertig",
      formulaPlaceholder: "Bitte Wert oder Formel eingeben",
      valuePlaceholder: "Bitte Wert eingeben",
      formulaAnd: "und",
      invalid: "Ung\xFCltig",
      showWarning: "Warnung anzeigen",
      rejectInput: "Eingabe ablehnen",
      messageInfo: "Hilfemeldung",
      showInfo: "Hilfetext f\xFCr ausgew\xE4hlte Zelle anzeigen",
      rangeError: "Bereiche sind ung\xFCltig",
      allowBlank: "Leere Werte zulassen"
    },
    any: {
      title: "Beliebiger Wert",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel"
    },
    date: {
      title: "Datum"
    },
    list: {
      title: "Dropdown",
      name: "Wert enth\xE4lt einen aus dem Bereich",
      error: "Eingabe muss innerhalb des angegebenen Bereichs liegen",
      emptyError: "Bitte einen Wert eingeben",
      add: "Hinzuf\xFCgen",
      dropdown: "Ausw\xE4hlen",
      options: "Optionen",
      customOptions: "Benutzerdefiniert",
      refOptions: "Aus einem Bereich",
      formulaError: "Die Listenquelle muss eine durch Trennzeichen getrennte Liste von Daten oder ein Bezug auf eine einzelne Zeile oder Spalte sein.",
      edit: "Bearbeiten"
    },
    listMultiple: {
      title: "Dropdown-Mehrfachauswahl",
      dropdown: "Mehrfachauswahl"
    },
    textLength: {
      title: "Textl\xE4nge"
    },
    decimal: {
      title: "Zahl"
    },
    whole: {
      title: "Ganzzahl"
    },
    checkbox: {
      title: "Kontrollk\xE4stchen",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel",
      tips: "Benutzerdefinierte Werte in Zellen verwenden",
      checked: "Ausgew\xE4hlter Wert",
      unchecked: "Nicht ausgew\xE4hlter Wert"
    },
    custom: {
      title: "Benutzerdefinierte Formel",
      error: "Der Inhalt dieser Zelle verst\xF6\xDFt gegen die \xDCberpr\xFCfungsregel",
      validFail: "Bitte eine g\xFCltige Formel eingeben"
    },
    alert: {
      title: "Fehler",
      ok: "OK"
    },
    error: {
      title: "Ung\xFCltig:"
    },
    renderMode: {
      arrow: "Pfeil",
      chip: "Chip",
      text: "Reiner Text",
      label: "Anzeigestil"
    },
    showTime: {
      label: "Zeitauswahl anzeigen"
    },
    permission: {
      dialog: {
        setStyleErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung, Stile festzulegen. Um Stile festzulegen, wenden Sie sich bitte an den Ersteller."
      }
    }
  }
};
var de_DE_default15 = locale15;

// ../packages/sheets-drawing-ui/src/locale/de-DE.ts
var locale16 = {
  "sheets-drawing-ui": {
    title: "Bild",
    upload: {
      float: "Schwebendes Bild",
      cell: "Zellenbild"
    },
    panel: {
      title: "Bild bearbeiten"
    },
    save: {
      title: "Zellenbilder speichern",
      menuLabel: "Zellenbilder speichern",
      imageCount: "Bildanzahl",
      fileNameConfig: "Dateiname",
      useRowCol: "Zellenadresse verwenden (A1, B2...)",
      useColumnValue: "Spaltenwert verwenden",
      selectColumn: "Spalte ausw\xE4hlen",
      cancel: "Abbrechen",
      confirm: "Speichern",
      saving: "Speichern...",
      error: "Zellenbilder konnten nicht gespeichert werden"
    },
    "image-popup": {
      replace: "Ersetzen",
      delete: "L\xF6schen",
      edit: "Bearbeiten",
      crop: "Zuschneiden",
      reset: "Gr\xF6\xDFe zur\xFCcksetzen",
      flipH: "Horizontal spiegeln",
      flipV: "Vertikal spiegeln"
    },
    "update-status": {
      exceedMaxSize: "Bildgr\xF6\xDFe \xFCberschreitet das Limit, Limit ist {0}M",
      invalidImageType: "Ung\xFCltiger Bildtyp",
      exceedMaxCount: "Es k\xF6nnen nur {0} Bilder gleichzeitig hochgeladen werden",
      invalidImage: "Ung\xFCltiges Bild"
    },
    "drawing-anchor": {
      title: "Anker-Eigenschaften",
      both: "Mit Zellen verschieben und skalieren",
      position: "Mit Zellen verschieben, aber nicht skalieren",
      none: "Weder verschieben noch skalieren mit Zellen"
    },
    "cell-image": {
      pasteTitle: "Als Zellenbild einf\xFCgen",
      pasteContent: "Das Einf\xFCgen eines Zellenbilds \xFCberschreibt den bestehenden Inhalt der Zelle, mit dem Einf\xFCgen fortfahren?",
      pasteError: "Kopieren und Einf\xFCgen von Zellenbildern wird in dieser Einheit nicht unterst\xFCtzt"
    },
    permission: {
      dialog: {
        editErr: "Der Bereich ist gesch\xFCtzt, und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, wenden Sie sich bitte an den Ersteller."
      }
    },
    shortcut: {
      "drawing-view": "Zeichnungsansicht",
      "drawing-move-down": "Zeichnung nach unten verschieben",
      "drawing-move-up": "Zeichnung nach oben verschieben",
      "drawing-move-left": "Zeichnung nach links verschieben",
      "drawing-move-right": "Zeichnung nach rechts verschieben",
      "drawing-delete": "Zeichnung l\xF6schen"
    }
  }
};
var de_DE_default16 = locale16;

// ../packages/sheets-filter/src/locale/de-DE.ts
var locale17 = {
  "sheets-filter": {
    command: {
      "not-valid-filter-range": "Der ausgew\xE4hlte Bereich hat nur eine Zeile und ist f\xFCr den Filter ung\xFCltig."
    },
    msg: {
      "filter-header-forbidden": "Die Kopfzeile eines Filters kann nicht verschoben werden."
    }
  }
};
var de_DE_default17 = locale17;

// ../packages/sheets-filter-ui/src/locale/de-DE.ts
var locale18 = {
  "sheets-filter-ui": {
    toolbar: {
      "smart-toggle-filter-tooltip": "Filter ein-/ausschalten",
      "clear-filter-criteria": "Filterbedingungen l\xF6schen",
      "re-calc-filter-conditions": "Filterbedingungen neu berechnen"
    },
    shortcut: {
      "smart-toggle-filter": "Filter ein-/ausschalten"
    },
    panel: {
      "clear-filter": "Filter l\xF6schen",
      cancel: "Abbrechen",
      confirm: "Best\xE4tigen",
      "by-values": "Nach Werten",
      "by-colors": "Nach Farben",
      "filter-by-cell-fill-color": "Nach Zellenf\xFCllfarbe filtern",
      "filter-by-cell-text-color": "Nach Zellentextfarbe filtern",
      "filter-by-color-none": "Die Spalte enth\xE4lt nur eine Farbe",
      "by-conditions": "Nach Bedingungen",
      "filter-only": "Nur filtern",
      "search-placeholder": "Verwenden Sie Leerzeichen, um Schl\xFCsselw\xF6rter zu trennen",
      "select-all": "Alle ausw\xE4hlen",
      "input-values-placeholder": "Werte eingeben",
      and: "UND",
      or: "ODER",
      empty: "(leer)",
      "?": 'Verwenden Sie "?" f\xFCr ein einzelnes Zeichen.',
      "*": 'Verwenden Sie "*" f\xFCr mehrere Zeichen.'
    },
    conditions: {
      none: "Keine",
      empty: "Ist leer",
      "not-empty": "Ist nicht leer",
      "text-contains": "Text enth\xE4lt",
      "does-not-contain": "Text enth\xE4lt nicht",
      "starts-with": "Text beginnt mit",
      "ends-with": "Text endet mit",
      equals: "Text ist gleich",
      "greater-than": "Gr\xF6\xDFer als",
      "greater-than-or-equal": "Gr\xF6\xDFer als oder gleich",
      "less-than": "Kleiner als",
      "less-than-or-equal": "Kleiner als oder gleich",
      equal: "Gleich",
      "not-equal": "Ungleich",
      between: "Zwischen",
      "not-between": "Nicht zwischen",
      custom: "Benutzerdefiniert"
    },
    date: {
      1: "Januar",
      2: "Februar",
      3: "M\xE4rz",
      4: "April",
      5: "Mai",
      6: "Juni",
      7: "Juli",
      8: "August",
      9: "September",
      10: "Oktober",
      11: "November",
      12: "Dezember"
    },
    sync: {
      title: "Filter ist f\xFCr alle sichtbar",
      statusTips: {
        on: "Wenn eingeschaltet, sehen alle Bearbeiter die Filterergebnisse",
        off: "Wenn ausgeschaltet, sehen nur Sie die Filterergebnisse"
      },
      switchTips: {
        on: '"Filter ist f\xFCr alle sichtbar" ist eingeschaltet, alle Bearbeiter sehen die Filterergebnisse',
        off: '"Filter ist f\xFCr alle sichtbar" ist ausgeschaltet, nur Sie sehen die Filterergebnisse'
      }
    }
  }
};
var de_DE_default18 = locale18;

// ../packages/sheets-formula/src/locale/de-DE.ts
var locale19 = {
  "sheets-formula": {
    functionList: {
      ...en_US_default,
      ...en_US_default2,
      ...en_US_default3,
      ...en_US_default4,
      ...en_US_default5,
      ...en_US_default6,
      ...en_US_default7,
      ...en_US_default8,
      ...en_US_default9,
      ...en_US_default10,
      ...en_US_default11,
      ...en_US_default12,
      ...en_US_default13,
      ...en_US_default14,
      ...en_US_default15
    }
  }
};
var de_DE_default19 = locale19;

// ../packages/sheets-formula-ui/src/locale/de-DE.ts
var locale20 = {
  "sheets-formula-ui": {
    shortcut: {
      "quick-sum": "Schnelle Summe"
    },
    insert: {
      tooltip: "Funktionen",
      common: "H\xE4ufige Funktionen"
    },
    prompt: {
      helpExample: "BEISPIEL",
      helpAbstract: "INFO",
      required: "Erforderlich.",
      optional: "Optional."
    },
    error: {
      title: "Fehler",
      divByZero: "Divisionsfehler",
      name: "Ung\xFCltiger Name",
      value: "Wertfehler",
      num: "Zahlenfehler",
      na: "Wert nicht verf\xFCgbar",
      cycle: "Zirkelbezug",
      ref: "Ung\xFCltiger Zellbezug",
      spill: "Bereich ist nicht leer",
      calc: "Berechnungsfehler",
      error: "Fehler",
      connect: "Daten werden abgerufen",
      null: "Null-Fehler"
    },
    functionType: {
      financial: "Finanzmathematik",
      date: "Datum und Uhrzeit",
      math: "Mathematik und Trigonometrie",
      statistical: "Statistik",
      lookup: "Suchen und Verweisen",
      database: "Datenbank",
      text: "Text",
      logical: "Logik",
      information: "Information",
      engineering: "Technik",
      cube: "Cube",
      compatibility: "Kompatibilit\xE4t",
      web: "Web",
      array: "Array",
      univer: "Univer",
      user: "Benutzerdefiniert",
      definedname: "Definierter Name"
    },
    moreFunctions: {
      confirm: "Best\xE4tigen",
      prev: "Zur\xFCck",
      next: "Weiter",
      searchFunctionPlaceholder: "Funktion suchen",
      allFunctions: "Alle Funktionen",
      syntax: "SYNTAX"
    },
    operation: {
      copyFormulaOnly: "Nur Formel kopieren",
      pasteFormula: "Formel einf\xFCgen"
    },
    rangeSelector: {
      title: "Datenbereich ausw\xE4hlen",
      addAnotherRange: "Bereich hinzuf\xFCgen",
      buttonTooltip: "Datenbereich ausw\xE4hlen",
      placeHolder: "Bereich ausw\xE4hlen oder eingeben.",
      confirm: "Best\xE4tigen",
      cancel: "Abbrechen"
    }
  }
};
var de_DE_default20 = locale20;

// ../packages/sheets-hyper-link/src/locale/de-DE.ts
var locale21 = {
  "sheets-hyper-link": {
    message: {
      refError: "Ung\xFCltiger Bereich"
    }
  }
};
var de_DE_default21 = locale21;

// ../packages/sheets-hyper-link-ui/src/locale/de-DE.ts
var locale22 = {
  "sheets-hyper-link-ui": {
    form: {
      editTitle: "Link bearbeiten",
      addTitle: "Link einf\xFCgen",
      label: "Beschriftung",
      type: "Typ",
      link: "Link",
      linkPlaceholder: "Link eingeben",
      range: "Bereich",
      worksheet: "Arbeitsblatt",
      definedName: "Definierter Name",
      ok: "Best\xE4tigen",
      cancel: "Abbrechen",
      labelPlaceholder: "Beschriftung eingeben",
      inputError: "Bitte eingeben",
      selectError: "Bitte ausw\xE4hlen",
      linkError: "Bitte einen g\xFCltigen Link eingeben"
    },
    menu: {
      add: "Link einf\xFCgen"
    },
    message: {
      noSheet: "Zielblatt wurde gel\xF6scht",
      refError: "Ung\xFCltiger Bereich",
      hiddenSheet: "Der Link kann nicht ge\xF6ffnet werden, da das verkn\xFCpfte Blatt ausgeblendet ist",
      coped: "Link in Zwischenablage kopiert"
    },
    popup: {
      copy: "Link kopieren",
      edit: "Link bearbeiten",
      cancel: "Link aufheben"
    }
  }
};
var de_DE_default22 = locale22;

// ../packages/sheets-note-ui/src/locale/de-DE.ts
var locale23 = {
  "sheets-note-ui": {
    note: {
      placeholder: "Hier eingeben"
    },
    rightClick: {
      addNote: "Notiz hinzuf\xFCgen",
      deleteNote: "Notiz l\xF6schen",
      toggleNote: "Notiz anzeigen/ausblenden"
    }
  }
};
var de_DE_default23 = locale23;

// ../packages/sheets-numfmt-ui/src/locale/de-DE.ts
var locale24 = {
  "sheets-numfmt-ui": {
    title: "Zahlenformat",
    numfmtType: "Formattypen",
    cancel: "Abbrechen",
    confirm: "Best\xE4tigen",
    general: "Allgemein",
    accounting: "Buchhaltung",
    text: "Text",
    number: "Zahl",
    percent: "Prozent",
    scientific: "Wissenschaftlich",
    currency: "W\xE4hrung",
    date: "Datum",
    time: "Zeit",
    thousandthPercentile: "Tausendertrennzeichen",
    preview: "Vorschau",
    dateTime: "Datum und Uhrzeit",
    decimalLength: "Dezimalstellen",
    currencyType: "W\xE4hrungssymbol",
    moreFmt: "Formate",
    financialValue: "Finanzwert",
    roundingCurrency: "W\xE4hrung aufrunden",
    timeDuration: "Dauer",
    currencyDes: "Das W\xE4hrungsformat wird verwendet, um allgemeine W\xE4hrungswerte darzustellen. Das Buchhaltungsformat richtet eine Spalte von Werten an Dezimalpunkten aus",
    accountingDes: "Das Buchhaltungszahlenformat richtet eine Spalte von Werten an W\xE4hrungssymbolen und Dezimalpunkten aus",
    dateType: "Datumstyp",
    dateDes: "Das Datumsformat stellt Datums- und Zeitserienwerte als Datumswerte dar.",
    negType: "Negativer Zahlentyp",
    generalDes: "Das allgemeine Format enth\xE4lt kein spezifisches Zahlenformat.",
    thousandthPercentileDes: "Das Tausendertrennzeichenformat wird f\xFCr die Darstellung gew\xF6hnlicher Zahlen verwendet. W\xE4hrungs- und Buchhaltungsformate bieten ein spezialisiertes Format f\xFCr W\xE4hrungswertberechnungen.",
    addDecimal: "Dezimalstellen erh\xF6hen",
    subtractDecimal: "Dezimalstellen verringern",
    customFormat: "Benutzerdefiniertes Format",
    customFormatDes: "Benutzerdefinierte Zahlenformate basierend auf vorhandenen Formaten erstellen.",
    info: {
      error: "Fehler",
      forceStringInfo: "Zahl als Text gespeichert"
    }
  }
};
var de_DE_default24 = locale24;

// ../packages/sheets-sort-ui/src/locale/de-DE.ts
var locale25 = {
  "sheets-sort-ui": {
    general: {
      sort: "Sortieren",
      "sort-asc": "Aufsteigend",
      "sort-desc": "Absteigend",
      "sort-custom": "Benutzerdefiniertes Sortieren",
      "sort-asc-ext": "Aufsteigend erweitern",
      "sort-desc-ext": "Absteigend erweitern",
      "sort-asc-cur": "Aufsteigend",
      "sort-desc-cur": "Absteigend"
    },
    error: {
      "merge-size": "Der ausgew\xE4hlte Bereich enth\xE4lt verbundene Zellen unterschiedlicher Gr\xF6\xDFe und kann nicht sortiert werden.",
      empty: "Der ausgew\xE4hlte Bereich hat keinen Inhalt und kann nicht sortiert werden.",
      single: "Der ausgew\xE4hlte Bereich hat nur eine Zeile und kann nicht sortiert werden.",
      "formula-array": "Der ausgew\xE4hlte Bereich enth\xE4lt Matrixformeln und kann nicht sortiert werden."
    },
    dialog: {
      "sort-reminder": "Sortierhinweis",
      "sort-reminder-desc": "Bereichssortierung erweitern oder beibehalten?",
      "sort-reminder-ext": "Bereichssortierung erweitern",
      "sort-reminder-no": "Bereichssortierung beibehalten",
      "first-row-check": "Erste Zeile nimmt nicht am Sortieren teil",
      "add-condition": "Bedingung hinzuf\xFCgen",
      cancel: "Abbrechen",
      confirm: "Best\xE4tigen"
    },
    info: {
      tooltip: "Tooltip"
    }
  }
};
var de_DE_default25 = locale25;

// ../packages/sheets-table/src/locale/de-DE.ts
var locale26 = {
  "sheets-table": {
    columnPrefix: "Spalte",
    tablePrefix: "Tabelle",
    tableNameError: "Tabellenname darf keine Leerzeichen enthalten, darf nicht mit einer Zahl beginnen und darf nicht mit einem vorhandenen Tabellennamen identisch sein"
  }
};
var de_DE_default26 = locale26;

// ../packages/sheets-table-ui/src/locale/de-DE.ts
var locale27 = {
  "sheets-table-ui": {
    title: "Tabelle",
    selectRange: "Tabellenbereich ausw\xE4hlen",
    rename: "Tabelle umbenennen",
    renamePlaceholder: "Tabellennamen eingeben",
    updateRange: "Tabellenbereich aktualisieren",
    tableRangeWithMergeError: "Tabellenbereich darf sich nicht mit verbundenen Zellen \xFCberschneiden",
    tableRangeWithOtherTableError: "Tabellenbereich darf sich nicht mit anderen Tabellen \xFCberschneiden",
    tableRangeSingleRowError: "Tabellenbereich darf nicht nur eine Zeile sein",
    updateError: "Tabellenbereich kann nicht auf einen Bereich festgelegt werden, der sich nicht mit dem Original \xFCberschneidet und nicht in derselben Zeile liegt",
    tableStyle: "Tabellenstil",
    defaultStyle: "Standardstil",
    customStyle: "Benutzerdefinierter Stil",
    customTooMore: "Die Anzahl der benutzerdefinierten Designs \xFCberschreitet das Maximum, bitte l\xF6schen Sie einige unn\xF6tige Designs und f\xFCgen Sie sie erneut hinzu",
    setTheme: "Tabellenthema festlegen",
    removeTable: "Tabelle entfernen",
    cancel: "Abbrechen",
    confirm: "Best\xE4tigen",
    header: "Kopfzeile",
    footer: "Fu\xDFzeile",
    firstLine: "Erste Zeile",
    secondLine: "Zweite Zeile",
    columnPrefix: "Spalte",
    tablePrefix: "Tabelle",
    tableNameError: "Tabellenname darf keine Leerzeichen enthalten, darf nicht mit einer Zahl beginnen und darf nicht mit einem bestehenden Tabellennamen identisch sein",
    columnMenu: {
      "insert-left": "1 Tabellenspalte links einf\xFCgen",
      "insert-right": "1 Tabellenspalte rechts einf\xFCgen",
      delete: "Tabellenspalte l\xF6schen"
    },
    sort: {
      "sort-asc": "Aufsteigend",
      "sort-desc": "Absteigend"
    },
    insert: {
      main: "Tabelle einf\xFCgen",
      row: "Tabellenzeile einf\xFCgen",
      col: "Tabellenspalte einf\xFCgen"
    },
    remove: {
      main: "Tabelle entfernen",
      row: "Tabellenzeile entfernen",
      col: "Tabellenspalte entfernen"
    },
    condition: {
      string: "Text",
      number: "Zahl",
      date: "Datum",
      empty: "(Leer)"
    },
    string: {
      compare: {
        equal: "Gleich",
        notEqual: "Ungleich",
        contains: "Enth\xE4lt",
        notContains: "Enth\xE4lt nicht",
        startsWith: "Beginnt mit",
        endsWith: "Endet mit"
      }
    },
    number: {
      compare: {
        equal: "Gleich",
        notEqual: "Ungleich",
        greaterThan: "Gr\xF6\xDFer als",
        greaterThanOrEqual: "Gr\xF6\xDFer oder gleich",
        lessThan: "Kleiner als",
        lessThanOrEqual: "Kleiner oder gleich",
        between: "Zwischen",
        notBetween: "Nicht zwischen",
        above: "\xDCber",
        below: "Unter",
        topN: "Oben {0}"
      }
    },
    date: {
      compare: {
        equal: "Gleich",
        notEqual: "Ungleich",
        after: "Nach",
        afterOrEqual: "Nach oder gleich",
        before: "Vor",
        beforeOrEqual: "Vor oder gleich",
        between: "Zwischen",
        notBetween: "Nicht zwischen",
        today: "Heute",
        yesterday: "Gestern",
        tomorrow: "Morgen",
        thisWeek: "Diese Woche",
        lastWeek: "Letzte Woche",
        nextWeek: "N\xE4chste Woche",
        thisMonth: "Dieser Monat",
        lastMonth: "Letzter Monat",
        nextMonth: "N\xE4chster Monat",
        thisQuarter: "Dieses Quartal",
        lastQuarter: "Letztes Quartal",
        nextQuarter: "N\xE4chstes Quartal",
        thisYear: "Dieses Jahr",
        nextYear: "N\xE4chstes Jahr",
        lastYear: "Letztes Jahr",
        quarter: "Nach Quartal",
        month: "Nach Monat",
        q1: "Erstes Quartal",
        q2: "Zweites Quartal",
        q3: "Drittes Quartal",
        q4: "Viertes Quartal",
        m1: "Januar",
        m2: "Februar",
        m3: "M\xE4rz",
        m4: "April",
        m5: "Mai",
        m6: "Juni",
        m7: "Juli",
        m8: "August",
        m9: "September",
        m10: "Oktober",
        m11: "November",
        m12: "Dezember"
      }
    },
    filter: {
      "by-values": "Nach Werten",
      "by-conditions": "Nach Bedingungen",
      "clear-filter": "Filter l\xF6schen",
      cancel: "Abbrechen",
      confirm: "Best\xE4tigen",
      "search-placeholder": "Leerzeichen zum Trennen von Schl\xFCsselw\xF6rtern verwenden",
      "select-all": "Alle ausw\xE4hlen"
    }
  }
};
var de_DE_default27 = locale27;

// ../packages/sheets-thread-comment-ui/src/locale/de-DE.ts
var locale28 = {
  "sheets-thread-comment-ui": {
    panel: {
      title: "Kommentarverwaltung"
    },
    menu: {
      addComment: "Kommentar hinzuf\xFCgen",
      commentManagement: "Kommentarverwaltung"
    }
  }
};
var de_DE_default28 = locale28;

// ../packages/sheets-ui/src/locale/de-DE.ts
var locale29 = {
  "sheets-ui": {
    toolbar: {
      undo: "R\xFCckg\xE4ngig",
      redo: "Wiederholen",
      formatPainter: "Format \xFCbertragen",
      font: "Schriftart",
      fontSize: "Schriftgr\xF6\xDFe",
      fontSizeIncrease: "Schriftgr\xF6\xDFe vergr\xF6\xDFern",
      fontSizeDecrease: "Schriftgr\xF6\xDFe verkleinern",
      bold: "Fett",
      italic: "Kursiv",
      strikethrough: "Durchgestrichen",
      subscript: "Tiefgestellt",
      superscript: "Hochgestellt",
      underline: "Unterstrichen",
      textColor: {
        main: "Textfarbe",
        right: "Farbe ausw\xE4hlen"
      },
      resetColor: "Zur\xFCcksetzen",
      fillColor: {
        main: "F\xFCllfarbe",
        right: "Farbe ausw\xE4hlen"
      },
      border: {
        main: "Rahmen",
        right: "Rahmenstil"
      },
      mergeCell: {
        main: "Zellen verbinden",
        right: "Verbindungstyp ausw\xE4hlen"
      },
      horizontalAlignMode: {
        main: "Horizontale Ausrichtung",
        right: "Ausrichtung"
      },
      verticalAlignMode: {
        main: "Vertikale Ausrichtung",
        right: "Ausrichtung"
      },
      textWrapMode: {
        main: "Text umbrechen",
        right: "Textumbruchmodus"
      },
      textRotateMode: {
        main: "Text drehen",
        right: "Textdrehmodus"
      },
      more: "Mehr",
      toggleGridlines: "Gitterlinien ein-/ausblenden",
      textToNumber: "Text in Zahl umwandeln"
    },
    align: {
      left: "links",
      center: "zentriert",
      right: "rechts",
      top: "oben",
      middle: "mittig",
      bottom: "unten"
    },
    button: {
      confirm: "OK",
      cancel: "Abbrechen",
      close: "Schlie\xDFen",
      insert: "Einf\xFCgen",
      prevPage: "Zur\xFCck",
      nextPage: "Weiter",
      total: "Gesamt:"
    },
    borderLine: {
      borderTop: "Rahmen oben",
      borderBottom: "Rahmen unten",
      borderLeft: "Rahmen links",
      borderRight: "Rahmen rechts",
      borderNone: "Kein Rahmen",
      borderAll: "Alle Rahmen",
      borderOutside: "Rahmen au\xDFen",
      borderInside: "Rahmen innen",
      borderHorizontal: "Horizontale Rahmenlinie",
      borderVertical: "Vertikale Rahmenlinie",
      borderColor: "Rahmenfarbe",
      borderSize: "Rahmenst\xE4rke",
      borderType: "Rahmentyp"
    },
    merge: {
      all: "Alle verbinden",
      vertical: "Vertikal verbinden",
      horizontal: "Horizontal verbinden",
      cancel: "Verbindung aufheben",
      overlappingError: "\xDCberlappende Bereiche k\xF6nnen nicht verbunden werden",
      partiallyError: "Dieser Vorgang kann nicht f\xFCr teilweise verbundene Zellen ausgef\xFChrt werden"
    },
    filter: {},
    textWrap: {
      overflow: "\xDCberlauf",
      wrap: "Umbrechen",
      clip: "Abschneiden"
    },
    textRotate: {
      none: "Keine",
      angleUp: "Nach oben neigen",
      angleDown: "Nach unten neigen",
      vertical: "Vertikal stapeln",
      rotationUp: "Nach oben drehen",
      rotationDown: "Nach unten drehen"
    },
    sheetConfig: {
      delete: "L\xF6schen",
      copy: "Kopieren",
      rename: "Umbenennen",
      changeColor: "Farbe \xE4ndern",
      hide: "Ausblenden",
      unhide: "Einblenden",
      moveLeft: "Nach links verschieben",
      moveRight: "Nach rechts verschieben",
      resetColor: "Farbe zur\xFCcksetzen",
      cancelText: "Abbrechen",
      chooseText: "Farbe best\xE4tigen",
      tipNameRepeat: "Der Name der Registerkarte darf nicht doppelt vorkommen! Bitte korrigieren",
      noMoreSheet: "Die Arbeitsmappe muss mindestens ein sichtbares Arbeitsblatt enthalten. Um das ausgew\xE4hlte Arbeitsblatt zu l\xF6schen, f\xFCgen Sie bitte ein neues Arbeitsblatt ein oder blenden Sie ein ausgeblendetes Arbeitsblatt ein.",
      confirmDelete: "M\xF6chten Sie wirklich l\xF6schen",
      redoDelete: "Kann mit Strg+Z r\xFCckg\xE4ngig gemacht werden",
      noHide: "Ausblenden nicht m\xF6glich, es muss mindestens ein Blatt-Register erhalten bleiben",
      chartEditNoOpt: "Dieser Vorgang ist im Diagrammbearbeitungsmodus nicht zul\xE4ssig!",
      sheetNameErrorTitle: "Es ist ein Problem aufgetreten",
      sheetNameSpecCharError: "Der Name darf 31 Zeichen nicht \xFCberschreiten, darf nicht mit ' beginnen oder enden und darf folgende Zeichen nicht enthalten: [ ] : \\ ? * /",
      sheetNameCannotIsEmptyError: "Der Blattname darf nicht leer sein.",
      sheetNameAlreadyExistsError: "Der Blattname existiert bereits. Bitte geben Sie einen anderen Namen ein.",
      deleteSheet: "Arbeitsblatt l\xF6schen",
      deleteSheetContent: "M\xF6chten Sie dieses Arbeitsblatt wirklich l\xF6schen?",
      deleteLargeSheetContent: "M\xF6chten Sie dieses Arbeitsblatt wirklich l\xF6schen. Es kann nach dem L\xF6schen nicht wiederhergestellt werden. Sind Sie sicher, dass Sie es l\xF6schen m\xF6chten?",
      addProtectSheet: "Arbeitsblatt sch\xFCtzen",
      removeProtectSheet: "Arbeitsblattschutz aufheben",
      changeSheetPermission: "Arbeitsblattberechtigungen \xE4ndern",
      viewAllProtectArea: "Alle Schutzbereiche anzeigen"
    },
    rightClick: {
      copy: "Kopieren",
      cut: "Ausschneiden",
      paste: "Einf\xFCgen",
      copySpecial: "Inhalte kopieren",
      pasteSpecial: "Inhalte einf\xFCgen",
      pasteValue: "Werte einf\xFCgen",
      pasteFormat: "Formatierung einf\xFCgen",
      pasteColWidth: "Spaltenbreite einf\xFCgen",
      pasteBesidesBorder: "Rahmenstile einf\xFCgen",
      insert: "Einf\xFCgen",
      insertRow: "Zeile einf\xFCgen",
      insertRowBefore: "Zeile davor einf\xFCgen",
      insertRowsAfter: "Einf\xFCgen",
      insertRowsAbove: "Einf\xFCgen",
      insertRowsAfterSuffix: "Zeilen danach",
      insertRowsAboveSuffix: "Zeilen davor",
      insertColumn: "Spalte einf\xFCgen",
      insertColumnBefore: "Spalte davor einf\xFCgen",
      insertColsLeft: "Einf\xFCgen",
      insertColsRight: "Einf\xFCgen",
      insertColsLeftSuffix: "Spalten links",
      insertColsRightSuffix: "Spalten rechts",
      delete: "L\xF6schen",
      deleteCell: "Zelle l\xF6schen",
      insertCell: "Zelle einf\xFCgen",
      deleteSelected: "Ausgew\xE4hlte l\xF6schen ",
      hide: "Ausblenden",
      hideSelected: "Ausgew\xE4hlte ausblenden ",
      showHide: "Ausgeblendete anzeigen",
      toTopAdd: "Oben hinzuf\xFCgen",
      toBottomAdd: "Unten hinzuf\xFCgen",
      toLeftAdd: "Links hinzuf\xFCgen",
      toRightAdd: "Rechts hinzuf\xFCgen",
      deleteSelectedRow: "Ausgew\xE4hlte Zeile l\xF6schen",
      deleteSelectedColumn: "Ausgew\xE4hlte Spalte l\xF6schen",
      hideSelectedRow: "Ausgew\xE4hlte Zeile ausblenden",
      showHideRow: "Zeile ein-/ausblenden",
      rowHeight: "Zeilenh\xF6he",
      hideSelectedColumn: "Ausgew\xE4hlte Spalte ausblenden",
      showHideColumn: "Spalte ein-/ausblenden",
      columnWidth: "Spaltenbreite",
      moveLeft: "Nach links verschieben",
      moveUp: "Nach oben verschieben",
      moveRight: "Nach rechts verschieben",
      moveDown: "Nach unten verschieben",
      add: "Hinzuf\xFCgen",
      row: "Zeile",
      column: "Spalte",
      confirm: "Best\xE4tigen",
      clearSelection: "L\xF6schen",
      clearContent: "Inhalte l\xF6schen",
      clearFormat: "Formatierung l\xF6schen",
      clearAll: "Alles l\xF6schen",
      root: "Wurzel",
      log: "Protokoll",
      delete0: "0-Werte an beiden Enden l\xF6schen",
      removeDuplicate: "Doppelte Werte entfernen",
      byRow: "Nach Zeile",
      byCol: "Nach Spalte",
      generateNewMatrix: "Neue Matrix generieren",
      fitContent: "An Daten anpassen",
      freeze: "Einfrieren",
      freezeCell: "Bis zur aktiven Zelle einfrieren ({0}. Zeile {1}. Spalte)",
      freezeCol: "Bis zur Spalte {0} einfrieren",
      freezeRow: "Bis zur Zeile {0} einfrieren",
      freezeFirstCol: "Erste Spalte einfrieren",
      freezeFirstRow: "Erste Zeile einfrieren",
      cancelFreeze: "Einfrieren aufheben",
      deleteAllRowsAlert: "Sie k\xF6nnen nicht alle Zeilen im Blatt l\xF6schen",
      deleteAllColumnsAlert: "Sie k\xF6nnen nicht alle Spalten im Blatt l\xF6schen",
      hideAllRowsAlert: "Sie k\xF6nnen nicht alle Zeilen im Blatt ausblenden",
      hideAllColumnsAlert: "Sie k\xF6nnen nicht alle Spalten im Blatt ausblenden",
      protectRange: "Zeilen und Spalten sch\xFCtzen",
      editProtectRange: "Schutzbereich festlegen",
      removeProtectRange: "Schutzbereich entfernen",
      turnOnProtectRange: "Schutzbereich hinzuf\xFCgen",
      viewAllProtectArea: "Alle Schutzbereiche anzeigen",
      textToNumber: "Text in Zahl umwandeln"
    },
    info: {
      notChangeMerge: "Sie k\xF6nnen an verbundenen Zellen keine Teil\xE4nderungen vornehmen",
      detailUpdate: "Neu ge\xF6ffnet",
      detailSave: "Lokaler Cache wiederhergestellt",
      row: "",
      column: "",
      loading: "Wird geladen...",
      copy: "Kopieren",
      return: "Beenden",
      rename: "Umbenennen",
      tips: "Umbenennen",
      noName: "Unbenannte Tabelle",
      wait: "Warte auf Aktualisierung",
      add: "Hinzuf\xFCgen",
      addLast: "weitere Zeilen unten",
      backTop: "Zur\xFCck nach oben",
      nextPage: "Weiter",
      tipInputNumber: "Bitte geben Sie die Zahl ein",
      tipInputNumberLimit: "Der Erh\xF6hungsbereich ist auf 1\u2013100 begrenzt",
      tipRowHeightLimit: "Die Zeilenh\xF6he muss zwischen 0 und 545 liegen",
      tipColumnWidthLimit: "Die Spaltenbreite muss zwischen 0 und 2038 liegen",
      problem: "Es ist ein Problem aufgetreten"
    },
    clipboard: {
      paste: {
        exceedMaxCells: "Die Anzahl der eingef\xFCgten Zellen \xFCberschreitet die maximale Anzahl",
        overlappingMergedCells: "Der Einf\xFCgebereich \xFCberschneidet sich mit verbundenen Zellen"
      },
      shortCutNotify: {
        title: "Bitte f\xFCgen Sie mit Tastenk\xFCrzeln ein.",
        useShortCutInstead: "Excel-Inhalt erkannt. Bitte verwenden Sie Tastenk\xFCrzel zum Einf\xFCgen."
      }
    },
    statusbar: {
      sum: "Summe",
      average: "Mittelwert",
      min: "Min",
      max: "Max",
      count: "Numerische Anzahl",
      countA: "Anzahl",
      clickToCopy: "Zum Kopieren klicken",
      copied: "Kopiert"
    },
    shortcut: {
      "sheet-view": "Sheet View",
      "sheet-edit": "Sheet Edit",
      sheet: {
        "zoom-in": "Vergr\xF6\xDFern",
        "zoom-out": "Verkleinern",
        "reset-zoom": "Zoom zur\xFCcksetzen",
        "select-below-cell": "Zelle darunter ausw\xE4hlen",
        "select-up-cell": "Zelle dar\xFCber ausw\xE4hlen",
        "select-left-cell": "Linke Zelle ausw\xE4hlen",
        "select-right-cell": "Rechte Zelle ausw\xE4hlen",
        "select-next-cell": "N\xE4chste Zelle ausw\xE4hlen",
        "select-previous-cell": "Vorherige Zelle ausw\xE4hlen",
        "select-up-value-cell": "Zelle dar\xFCber mit Wert ausw\xE4hlen",
        "select-below-value-cell": "Zelle darunter mit Wert ausw\xE4hlen",
        "select-left-value-cell": "Linke Zelle mit Wert ausw\xE4hlen",
        "select-right-value-cell": "Rechte Zelle mit Wert ausw\xE4hlen",
        "expand-selection-down": "Auswahl nach unten erweitern",
        "expand-selection-up": "Auswahl nach oben erweitern",
        "expand-selection-left": "Auswahl nach links erweitern",
        "expand-selection-right": "Auswahl nach rechts erweitern",
        "expand-selection-to-left-gap": "Auswahl bis zur linken L\xFCcke erweitern",
        "expand-selection-to-below-gap": "Auswahl bis zur unteren L\xFCcke erweitern",
        "expand-selection-to-right-gap": "Auswahl bis zur rechten L\xFCcke erweitern",
        "expand-selection-to-up-gap": "Auswahl bis zur oberen L\xFCcke erweitern",
        "select-all": "Alles ausw\xE4hlen",
        "toggle-editing": "Bearbeitung umschalten",
        "delete-and-start-editing": "L\xF6schen und mit Bearbeitung beginnen",
        "abort-editing": "Bearbeitung abbrechen",
        "break-line": "Zeilenumbruch",
        "set-bold": "Fett umschalten",
        "start-editing": "Bearbeitung beginnen (Auswahl in den Editor)",
        "repeat-last-action": "Letzte Aktion wiederholen",
        "set-italic": "Kursiv umschalten",
        "set-underline": "Unterstrichen umschalten",
        "set-strike-through": "Durchgestrichen umschalten"
      }
    },
    definedName: {
      managerTitle: "Namen verwalten",
      managerDescription: "Erstellen Sie einen definierten Namen, indem Sie Zellen oder Formeln ausw\xE4hlen und den gew\xFCnschten Namen in das Textfeld eingeben.",
      addButton: "Definierten Namen hinzuf\xFCgen",
      featureTitle: "Definierte Namen",
      ratioRange: "Bereich",
      ratioFormula: "Formel",
      confirm: "Best\xE4tigen",
      cancel: "Abbrechen",
      scopeWorkbook: "Arbeitsmappe",
      inputNamePlaceholder: "Bitte geben Sie einen Namen ein (keine Leerzeichen erlaubt)",
      inputCommentPlaceholder: "Bitte geben Sie einen Kommentar ein",
      inputRangePlaceholder: "Bitte geben Sie einen Bereich ein (keine Leerzeichen erlaubt)",
      inputFormulaPlaceholder: "Bitte geben Sie eine Formel ein (keine Leerzeichen erlaubt)",
      formulaOrRefStringInvalid: "Ung\xFCltige Formel oder Referenzzeichenfolge",
      defaultName: "DefinierterName",
      updateButton: "Aktualisieren",
      deleteButton: "L\xF6schen",
      deleteConfirmText: "M\xF6chten Sie diesen definierten Namen wirklich l\xF6schen?"
    },
    uploadLoading: {
      loading: "Wird geladen..., verbleibend"
    },
    "data-validation": {
      alert: {
        ok: "OK"
      },
      list: {
        edit: "Bearbeiten",
        dropdown: "W\xE4hlen Sie einen Eintrag"
      },
      listMultiple: {
        dropdown: "W\xE4hlen Sie Eintr\xE4ge"
      }
    },
    permission: {
      toolbarMenu: "Schutz",
      panel: {
        title: "Zeilen und Spalten sch\xFCtzen",
        name: "Name",
        protectedRange: "Gesch\xFCtzter Bereich",
        permissionDirection: "Berechtigungsbeschreibung",
        permissionDirectionPlaceholder: "Berechtigungsbeschreibung eingeben",
        editPermission: "Berechtigungen bearbeiten",
        onlyICanEdit: "Nur ich kann bearbeiten",
        designedUserCanEdit: "Bestimmte Benutzer k\xF6nnen bearbeiten",
        viewPermission: "Berechtigungen anzeigen",
        othersCanView: "Andere k\xF6nnen anzeigen",
        noOneElseCanView: "Niemand sonst kann anzeigen",
        designedPerson: "Bestimmte Personen",
        addPerson: "Person hinzuf\xFCgen",
        canEdit: "Kann bearbeiten",
        canView: "Kann anzeigen",
        delete: "L\xF6schen",
        currentSheet: "Aktuelles Blatt",
        allSheet: "Alle Bl\xE4tter",
        edit: "Bearbeiten",
        Print: "Drucken",
        Comment: "Kommentar",
        Copy: "Kopieren",
        SetCellStyle: "Zellenstil festlegen",
        SetCellValue: "Zellenwert festlegen",
        SetHyperLink: "Hyperlink festlegen",
        Sort: "Sortieren",
        Filter: "Filter",
        PivotTable: "Pivot-Tabelle",
        FloatImage: "Schwebendes Bild",
        RowHeightColWidth: "Zeilenh\xF6he und Spaltenbreite",
        RowHeightColWidthReadonly: "Schreibgesch\xFCtzte Zeilenh\xF6he und Spaltenbreite",
        FilterReadonly: "Schreibgesch\xFCtzter Filter",
        nameError: "Name darf nicht leer sein",
        created: "Erstellt",
        iCanEdit: "Ich kann bearbeiten",
        iCanNotEdit: "Ich kann nicht bearbeiten",
        iCanView: "Ich kann anzeigen",
        iCanNotView: "Ich kann nicht anzeigen",
        emptyRangeError: "Bereich darf nicht leer sein",
        rangeOverlapError: "Bereiche d\xFCrfen sich nicht \xFCberschneiden",
        rangeOverlapOverPermissionError: "Bereich darf sich nicht mit einem Bereich mit denselben Berechtigungen \xFCberschneiden",
        InsertHyperlink: "Hyperlink einf\xFCgen",
        SetRowStyle: "Zeilenstil festlegen",
        SetColumnStyle: "Spaltenstil festlegen",
        InsertColumn: "Spalte einf\xFCgen",
        InsertRow: "Zeile einf\xFCgen",
        DeleteRow: "Zeile l\xF6schen",
        DeleteColumn: "Spalte l\xF6schen",
        EditExtraObject: "Zus\xE4tzliches Objekt bearbeiten"
      },
      dialog: {
        allowUserToEdit: "Benutzer das Bearbeiten erlauben",
        allowedPermissionType: "Erlaubte Berechtigungstypen",
        setCellValue: "Zellenwert festlegen",
        setCellStyle: "Zellenstil festlegen",
        copy: "Kopieren",
        alert: "Warnung",
        search: "Suchen",
        ownerInherit: "Dokumenteneigent\xFCmer, Berechtigungsvererbung aktiviert",
        ownerWithoutInherit: "Dokumenteneigent\xFCmer, Berechtigungsvererbung nicht aktiviert",
        alertContent: "Dieser Bereich ist gesch\xFCtzt und es sind derzeit keine Bearbeitungsberechtigungen verf\xFCgbar. Wenn Sie bearbeiten m\xFCssen, kontaktieren Sie bitte den Ersteller.",
        userEmpty: "Keine bestimmte Person, teilen Sie einen Link, um bestimmte Personen einzuladen.",
        listEmpty: "Sie haben noch keine Bereiche oder Bl\xE4tter als gesch\xFCtzt festgelegt.",
        commonErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung f\xFCr diesen Vorgang. Um zu bearbeiten, kontaktieren Sie bitte den Ersteller.",
        editErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, kontaktieren Sie bitte den Ersteller.",
        pasteErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Einf\xFCgeberechtigung. Um einzuf\xFCgen, kontaktieren Sie bitte den Ersteller.",
        setStyleErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum Festlegen von Stilen. Um Stile festzulegen, kontaktieren Sie bitte den Ersteller.",
        copyErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Kopierberechtigung. Um zu kopieren, kontaktieren Sie bitte den Ersteller.",
        workbookCopyErr: "Die Arbeitsmappe ist gesch\xFCtzt und Sie haben keine Berechtigung zum Kopieren. Um zu kopieren, kontaktieren Sie bitte den Ersteller.",
        setRowColStyleErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum Festlegen von Zeilen- und Spaltenstilen. Um Zeilen- und Spaltenstile festzulegen, kontaktieren Sie bitte den Ersteller.",
        moveRowColErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum Verschieben von Zeilen und Spalten. Um Zeilen und Spalten zu verschieben, kontaktieren Sie bitte den Ersteller.",
        moveRangeErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum Verschieben der Auswahl. Um die Auswahl zu verschieben, kontaktieren Sie bitte den Ersteller.",
        insertRowColErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum Einf\xFCgen von Zeilen und Spalten. Um Zeilen und Spalten einzuf\xFCgen, kontaktieren Sie bitte den Ersteller.",
        removeRowColErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum L\xF6schen von Zeilen und Spalten. Um Zeilen und Spalten zu l\xF6schen, kontaktieren Sie bitte den Ersteller.",
        autoFillErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung f\xFCr AutoFill. Um AutoFill zu verwenden, kontaktieren Sie bitte den Ersteller.",
        filterErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Filterberechtigung. Um zu filtern, kontaktieren Sie bitte den Ersteller.",
        operatorSheetErr: "Das Arbeitsblatt ist gesch\xFCtzt und Sie haben keine Berechtigung zum Bedienen des Arbeitsblatts. Um das Arbeitsblatt zu bedienen, kontaktieren Sie bitte den Ersteller.",
        insertOrDeleteMoveRangeErr: "Der eingef\xFCgte oder gel\xF6schte Bereich \xFCberschneidet sich mit dem gesch\xFCtzten Bereich, dieser Vorgang wird derzeit nicht unterst\xFCtzt.",
        printErr: "Das Arbeitsblatt ist gesch\xFCtzt und Sie haben keine Druckberechtigung. Um zu drucken, kontaktieren Sie bitte den Ersteller.",
        formulaErr: "Der Bereich oder der referenzierte Bereich ist gesch\xFCtzt und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, kontaktieren Sie bitte den Ersteller.",
        hyperLinkErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum Festlegen von Hyperlinks. Um Hyperlinks festzulegen, kontaktieren Sie bitte den Ersteller.",
        commentErr: "Der Bereich ist gesch\xFCtzt und Sie haben keine Berechtigung zum Kommentieren. Um zu kommentieren, kontaktieren Sie bitte den Ersteller."
      },
      button: {
        confirm: "Best\xE4tigen",
        cancel: "Abbrechen",
        addNewPermission: "Neue Berechtigung hinzuf\xFCgen"
      }
    }
  }
};
var de_DE_default29 = locale29;

// ../packages/sheets-zen-editor/src/locale/de-DE.ts
var locale30 = {
  "sheets-zen-editor": {
    rightClick: {
      zenEditor: "Vollbild-Editor"
    },
    shortcut: {
      sheet: {
        "zen-edit-cancel": "Zen-Bearbeitung abbrechen",
        "zen-edit-confirm": "Zen-Bearbeitung best\xE4tigen"
      }
    }
  }
};
var de_DE_default30 = locale30;

// ../packages/slides-ui/src/locale/de-DE.ts
var locale31 = {
  "slides-ui": {
    append: "Folie anh\xE4ngen",
    text: {
      insert: {
        title: "Text einf\xFCgen"
      }
    },
    shape: {
      insert: {
        title: "Form einf\xFCgen",
        rectangle: "Rechteck einf\xFCgen",
        ellipse: "Ellipse einf\xFCgen"
      }
    },
    image: {
      insert: {
        title: "Bild einf\xFCgen",
        float: "Schwebendes Bild einf\xFCgen"
      }
    },
    popup: {
      edit: "Bearbeiten",
      delete: "L\xF6schen"
    },
    sidebar: {
      text: "Text bearbeiten",
      shape: "Form bearbeiten",
      image: "Bild bearbeiten"
    },
    "image-panel": {
      arrange: {
        title: "Anordnen",
        forward: "Nach vorne",
        backward: "Nach hinten",
        front: "In den Vordergrund",
        back: "In den Hintergrund"
      },
      transform: {
        title: "Transformieren",
        width: "Breite (px)",
        height: "H\xF6he (px)",
        x: "X (px)",
        y: "Y (px)",
        rotate: "Drehen (\xB0)"
      }
    },
    panel: {
      fill: {
        title: "F\xFCllfarbe"
      }
    }
  }
};
var de_DE_default31 = locale31;

// ../packages/thread-comment-ui/src/locale/de-DE.ts
var locale32 = {
  "thread-comment-ui": {
    panel: {
      title: "Kommentarverwaltung",
      empty: "Noch keine Kommentare",
      filterEmpty: "Kein Treffer",
      reset: "Filter zur\xFCcksetzen",
      addComment: "Kommentar hinzuf\xFCgen",
      solved: "Gel\xF6st"
    },
    editor: {
      placeholder: "Antworten oder andere mit @ erw\xE4hnen",
      reply: "Kommentar",
      cancel: "Abbrechen",
      save: "Speichern"
    },
    item: {
      edit: "Bearbeiten",
      delete: "Diesen Kommentar l\xF6schen"
    },
    filter: {
      sheet: {
        all: "Alle Bl\xE4tter",
        current: "Aktuelles Blatt"
      },
      status: {
        all: "Alle Kommentare",
        resolved: "Gel\xF6st",
        unsolved: "Ungel\xF6st",
        concernMe: "Betrifft mich"
      }
    }
  }
};
var de_DE_default32 = locale32;

// ../packages/ui/src/locale/de-DE.ts
var locale33 = {
  ui: {
    toolbar: {
      heading: {
        normal: "Normal",
        title: "Titel",
        subTitle: "Untertitel",
        1: "\xDCberschrift 1",
        2: "\xDCberschrift 2",
        3: "\xDCberschrift 3",
        4: "\xDCberschrift 4",
        5: "\xDCberschrift 5",
        6: "\xDCberschrift 6",
        tooltip: "\xDCberschrift festlegen"
      }
    },
    ribbon: {
      start: "Start",
      startDesc: "Arbeitsblatt initiieren und grundlegende Parameter festlegen.",
      insert: "Einf\xFCgen",
      insertDesc: "Zeilen, Spalten, Diagramme und verschiedene andere Elemente einf\xFCgen.",
      formulas: "Formeln",
      formulasDesc: "Funktionen und Formeln f\xFCr Datenberechnungen verwenden.",
      data: "Daten",
      dataDesc: "Daten verwalten, einschlie\xDFlich Import, Sortierung und Filterung.",
      view: "Ansicht",
      viewDesc: "Ansichtsmodi wechseln und Anzeigeeffekt anpassen.",
      others: "Sonstiges",
      othersDesc: "Weitere Funktionen und Einstellungen.",
      more: "Mehr"
    },
    fontFamily: {
      "not-supported": "Schriftart nicht im System gefunden, Standard-Schriftart wird verwendet.",
      arial: "Arial",
      "times-new-roman": "Times New Roman",
      tahoma: "Tahoma",
      verdana: "Verdana",
      "microsoft-yahei": "Microsoft YaHei",
      simsun: "SimSun",
      simhei: "SimHei",
      kaiti: "Kaiti",
      fangsong: "FangSong",
      nsimsun: "NSimSun",
      stxinwei: "STXinwei",
      stxingkai: "STXingkai",
      stliti: "STLiti"
    },
    "shortcut-panel": {
      title: "Tastenk\xFCrzel"
    },
    shortcut: {
      undo: "R\xFCckg\xE4ngig",
      redo: "Wiederholen",
      cut: "Ausschneiden",
      copy: "Kopieren",
      paste: "Einf\xFCgen",
      "shortcut-panel": "Tastenk\xFCrzel-Panel ein-/ausblenden"
    },
    "common-edit": "H\xE4ufige Bearbeitungstastenk\xFCrzel",
    "toggle-shortcut-panel": "Tastenk\xFCrzel-Panel ein-/ausblenden",
    clipboard: {
      authentication: {
        title: "Berechtigung verweigert",
        content: "Bitte erlauben Sie Univer den Zugriff auf Ihre Zwischenablage."
      }
    },
    textEditor: {
      formulaError: "Bitte geben Sie eine g\xFCltige Formel ein, z. B. =SUM(A1)",
      rangeError: "Bitte geben Sie einen g\xFCltigen Bereich ein, z. B. A1:B10"
    },
    rangeSelector: {
      title: "Datenbereich ausw\xE4hlen",
      addAnotherRange: "Bereich hinzuf\xFCgen",
      buttonTooltip: "Datenbereich ausw\xE4hlen",
      placeHolder: "Bereich ausw\xE4hlen oder eingeben.",
      confirm: "Best\xE4tigen",
      cancel: "Abbrechen"
    },
    "global-shortcut": "Globale Tastenk\xFCrzel",
    "zoom-slider": {
      resetTo: "Zur\xFCcksetzen auf"
    },
    row: "Zeile",
    column: "Spalte"
  }
};
var de_DE_default33 = locale33;

// ../packages/uniscript/src/locale/de-DE.ts
var locale34 = {
  uniscript: {
    title: "Uniscript",
    tooltip: {
      "menu-button": "Uniscript-Panel ein-/ausblenden"
    },
    panel: {
      execute: "Skript ausf\xFChren"
    },
    message: {
      success: "Ausf\xFChrung erfolgreich",
      failed: "Ausf\xFChrung fehlgeschlagen"
    }
  }
};
var de_DE_default34 = locale34;

// ../common/mockdata/src/locales/de-DE.ts
var de_DE_default35 = mergeLocales(
  de_DE_default,
  de_DE_default2,
  de_DE_default3,
  de_DE_default4,
  de_DE_default5,
  de_DE_default6,
  de_DE_default7,
  de_DE_default8,
  de_DE_default9,
  de_DE_default10,
  de_DE_default11,
  de_DE_default12,
  de_DE_default13,
  de_DE_default14,
  de_DE_default15,
  de_DE_default16,
  de_DE_default17,
  de_DE_default18,
  de_DE_default19,
  de_DE_default20,
  de_DE_default21,
  de_DE_default22,
  de_DE_default23,
  de_DE_default24,
  de_DE_default25,
  de_DE_default26,
  de_DE_default27,
  de_DE_default28,
  de_DE_default29,
  de_DE_default30,
  de_DE_default31,
  de_DE_default32,
  de_DE_default33,
  de_DE_default34
);

export {
  de_DE_default35 as de_DE_default
};
