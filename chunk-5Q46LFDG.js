import {
  en_US_default,
  en_US_default10,
  en_US_default11,
  en_US_default12,
  en_US_default13,
  en_US_default14,
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

// ../packages/action-recorder/src/locale/fr-FR.ts
var locale = {
  "action-recorder": {
    menu: {
      title: "Enregistrer les actions",
      record: "Enregistrer les actions...",
      "replay-local": "Lecture de l'enregistrement local...",
      "replay-local-name": "Remplacer l'enregistrement local par le sous-unit\xE9...",
      "replay-local-active": "Remplacer l'enregistrement local par le sous-unit\xE9 actuel..."
    }
  }
};
var fr_FR_default = locale;

// ../packages/data-validation/src/locale/fr-FR.ts
var locale2 = {
  "data-validation": {
    operators: {
      between: "entre",
      greaterThan: "sup\xE9rieur \xE0",
      greaterThanOrEqual: "sup\xE9rieur ou \xE9gal \xE0",
      lessThan: "inf\xE9rieur \xE0",
      lessThanOrEqual: "inf\xE9rieur ou \xE9gal \xE0",
      equal: "\xE9gal \xE0",
      notEqual: "diff\xE9rent de",
      notBetween: "pas entre",
      legal: "est de type l\xE9gal"
    },
    ruleName: {
      between: "est entre {FORMULA1} et {FORMULA2}",
      greaterThan: "est sup\xE9rieur \xE0 {FORMULA1}",
      greaterThanOrEqual: "est sup\xE9rieur ou \xE9gal \xE0 {FORMULA1}",
      lessThan: "est inf\xE9rieur \xE0 {FORMULA1}",
      lessThanOrEqual: "est inf\xE9rieur ou \xE9gal \xE0 {FORMULA1}",
      equal: "est \xE9gal \xE0 {FORMULA1}",
      notEqual: "est diff\xE9rent de {FORMULA1}",
      notBetween: "n'est pas entre {FORMULA1} et {FORMULA2}",
      legal: "est un {TYPE} l\xE9gal"
    },
    errorMsg: {
      between: "La valeur doit \xEAtre entre {FORMULA1} et {FORMULA2}",
      greaterThan: "La valeur doit \xEAtre sup\xE9rieure \xE0 {FORMULA1}",
      greaterThanOrEqual: "La valeur doit \xEAtre sup\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
      lessThan: "La valeur doit \xEAtre inf\xE9rieure \xE0 {FORMULA1}",
      lessThanOrEqual: "La valeur doit \xEAtre inf\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
      equal: "La valeur doit \xEAtre \xE9gale \xE0 {FORMULA1}",
      notEqual: "La valeur doit \xEAtre diff\xE9rente de {FORMULA1}",
      notBetween: "La valeur ne doit pas \xEAtre entre {FORMULA1} et {FORMULA2}",
      legal: "La valeur doit \xEAtre un {TYPE} l\xE9gal"
    },
    date: {
      operators: {
        between: "entre",
        greaterThan: "apr\xE8s",
        greaterThanOrEqual: "le ou apr\xE8s",
        lessThan: "avant",
        lessThanOrEqual: "le ou avant",
        equal: "\xE9gal \xE0",
        notEqual: "diff\xE9rent de",
        notBetween: "pas entre",
        legal: "est une date l\xE9gale"
      },
      ruleName: {
        between: "est entre {FORMULA1} et {FORMULA2}",
        greaterThan: "est apr\xE8s {FORMULA1}",
        greaterThanOrEqual: "est le ou apr\xE8s {FORMULA1}",
        lessThan: "est avant {FORMULA1}",
        lessThanOrEqual: "est le ou avant {FORMULA1}",
        equal: "est {FORMULA1}",
        notEqual: "n'est pas {FORMULA1}",
        notBetween: "n'est pas entre {FORMULA1}",
        legal: "est une date l\xE9gale"
      },
      errorMsg: {
        between: "La valeur doit \xEAtre une date l\xE9gale et entre {FORMULA1} et {FORMULA2}",
        greaterThan: "La valeur doit \xEAtre une date l\xE9gale et apr\xE8s {FORMULA1}",
        greaterThanOrEqual: "La valeur doit \xEAtre une date l\xE9gale et le ou apr\xE8s {FORMULA1}",
        lessThan: "La valeur doit \xEAtre une date l\xE9gale et avant {FORMULA1}",
        lessThanOrEqual: "La valeur doit \xEAtre une date l\xE9gale et le ou avant {FORMULA1}",
        equal: "La valeur doit \xEAtre une date l\xE9gale et {FORMULA1}",
        notEqual: "La valeur doit \xEAtre une date l\xE9gale et non {FORMULA1}",
        notBetween: "La valeur doit \xEAtre une date l\xE9gale et non entre {FORMULA1}",
        legal: "La valeur doit \xEAtre une date l\xE9gale"
      },
      title: "Date"
    },
    textLength: {
      errorMsg: {
        between: "La longueur du texte doit \xEAtre entre {FORMULA1} et {FORMULA2}",
        greaterThan: "La longueur du texte doit \xEAtre sup\xE9rieure \xE0 {FORMULA1}",
        greaterThanOrEqual: "La longueur du texte doit \xEAtre sup\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
        lessThan: "La longueur du texte doit \xEAtre inf\xE9rieure \xE0 {FORMULA1}",
        lessThanOrEqual: "La longueur du texte doit \xEAtre inf\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
        equal: "La longueur du texte doit \xEAtre {FORMULA1}",
        notEqual: "La longueur du texte doit \xEAtre diff\xE9rente de {FORMULA1}",
        notBetween: "La longueur du texte ne doit pas \xEAtre entre {FORMULA1} et {FORMULA2}"
      },
      title: "Longueur du texte"
    },
    custom: {
      ruleName: "La formule personnalis\xE9e est {FORMULA1}",
      title: "Formule personnalis\xE9e",
      validFail: "Veuillez entrer une formule valide",
      error: "Le contenu de cette cellule viole sa r\xE8gle de validation"
    },
    validFail: {
      value: "Veuillez entrer une valeur",
      common: "Veuillez entrer une valeur ou une formule",
      number: "Veuillez entrer un nombre ou une formule",
      formula: "Veuillez entrer une formule",
      integer: "Veuillez entrer un entier ou une formule",
      date: "Veuillez entrer une date ou une formule",
      list: "Veuillez entrer des options",
      listInvalid: "La source de la liste doit \xEAtre une liste d\xE9limit\xE9e ou une r\xE9f\xE9rence \xE0 une seule ligne ou colonne",
      checkboxEqual: "Entrez des valeurs diff\xE9rentes pour les contenus des cellules coch\xE9es et d\xE9coch\xE9es.",
      formulaError: "La plage de r\xE9f\xE9rence contient des donn\xE9es invisibles, veuillez r\xE9ajuster la plage",
      listIntersects: "La plage s\xE9lectionn\xE9e ne peut pas croiser le champ des r\xE8gles",
      primitive: "Les formules ne sont pas autoris\xE9es pour les valeurs personnalis\xE9es coch\xE9es et d\xE9coch\xE9es."
    },
    any: {
      title: "N'importe quelle valeur",
      error: "Le contenu de cette cellule viole la r\xE8gle de validation"
    },
    list: {
      title: "Liste d\xE9roulante",
      name: "La valeur contient une de la plage",
      error: "L'entr\xE9e doit \xEAtre dans la plage sp\xE9cifi\xE9e",
      emptyError: "Veuillez entrer une valeur",
      add: "Ajouter",
      dropdown: "S\xE9lectionner",
      options: "Options",
      customOptions: "Personnalis\xE9",
      refOptions: "D'une plage",
      formulaError: "La source de la liste doit \xEAtre une liste d\xE9limit\xE9e de donn\xE9es, ou une r\xE9f\xE9rence \xE0 une seule ligne ou colonne.",
      edit: "\xC9diter"
    },
    listMultiple: {
      title: "Liste d\xE9roulante-Multiple",
      dropdown: "S\xE9lection multiple"
    },
    decimal: {
      title: "Nombre"
    },
    whole: {
      title: "Entier"
    },
    checkbox: {
      title: "Case \xE0 cocher",
      error: "Le contenu de cette cellule viole sa r\xE8gle de validation",
      tips: "Utiliser des valeurs personnalis\xE9es dans les cellules",
      checked: "Valeur s\xE9lectionn\xE9e",
      unchecked: "Valeur non s\xE9lectionn\xE9e"
    }
  }
};
var fr_FR_default2 = locale2;

// ../packages/design/src/locale/fr-FR.ts
var locale3 = {
  design: {
    Confirm: {
      cancel: "annuler",
      confirm: "ok"
    },
    CascaderList: {
      empty: "Aucun"
    },
    Calendar: {
      year: "",
      weekDays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
      months: [
        "Janvier",
        "F\xE9vrier",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Ao\xFBt",
        "Septembre",
        "Octobre",
        "Novembre",
        "D\xE9cembre"
      ]
    },
    Select: {
      empty: "Aucun"
    },
    ColorPicker: {
      more: "Plus de couleurs",
      cancel: "annuler",
      confirm: "ok"
    },
    GradientColorPicker: {
      linear: "Lin\xE9aire",
      radial: "Radial",
      angular: "Angulaire",
      diamond: "Diamant",
      offset: "D\xE9calage",
      angle: "Angle",
      flip: "Retourner",
      delete: "Supprimer"
    }
  }
};
var fr_FR_default3 = locale3;

// ../packages/docs-drawing-ui/src/locale/fr-FR.ts
var locale4 = {
  "docs-drawing-ui": {
    title: "Image",
    upload: {
      float: "Ins\xE9rer une image"
    },
    panel: {
      title: "Modifier l'image"
    },
    "image-popup": {
      replace: "Remplacer",
      delete: "Supprimer",
      edit: "Modifier",
      crop: "Rogner",
      reset: "R\xE9initialiser la taille"
    },
    "image-text-wrap": {
      title: "Habillage du texte",
      wrappingStyle: "Style d'habillage",
      square: "Carr\xE9",
      topAndBottom: "Haut et bas",
      inline: "Align\xE9 avec le texte",
      behindText: "Derri\xE8re le texte",
      inFrontText: "Devant le texte",
      wrapText: "Habiller le texte",
      bothSide: "Des deux c\xF4t\xE9s",
      leftOnly: "Seulement \xE0 gauche",
      rightOnly: "Seulement \xE0 droite",
      distanceFromText: "Distance du texte",
      top: "Haut(px)",
      left: "Gauche(px)",
      bottom: "Bas(px)",
      right: "Droite(px)"
    },
    "image-position": {
      title: "Position",
      horizontal: "Horizontal",
      vertical: "Vertical",
      absolutePosition: "Position absolue(px)",
      relativePosition: "Position relative",
      toTheRightOf: "\xE0 droite de",
      relativeTo: "par rapport \xE0",
      bellow: "en dessous",
      options: "Options",
      moveObjectWithText: "D\xE9placer l'objet avec le texte",
      column: "Colonne",
      margin: "Marge",
      page: "Page",
      line: "Ligne",
      paragraph: "Paragraphe"
    },
    "update-status": {
      exceedMaxSize: "La taille de l'image d\xE9passe la limite, la limite est de {0}M",
      invalidImageType: "Type d'image invalide",
      exceedMaxCount: "Seulement {0} images peuvent \xEAtre t\xE9l\xE9charg\xE9es \xE0 la fois",
      invalidImage: "Image invalide"
    },
    shortcut: {
      "drawing-view": "Vue du dessin",
      "drawing-move-down": "D\xE9placer le dessin vers le bas",
      "drawing-move-up": "D\xE9placer le dessin vers le haut",
      "drawing-move-left": "D\xE9placer le dessin vers la gauche",
      "drawing-move-right": "D\xE9placer le dessin vers la droite",
      "drawing-delete": "Supprimer le dessin"
    }
  }
};
var fr_FR_default4 = locale4;

// ../packages/docs-hyper-link-ui/src/locale/fr-FR.ts
var locale5 = {
  "docs-hyper-link-ui": {
    edit: {
      confirm: "Confirmer",
      cancel: "Annuler",
      title: "Lien",
      address: "Link",
      placeholder: "Veuillez entrer un lien",
      addressError: "L'url est ill\xE9gal!",
      label: "Label",
      labelError: "Veuillez entrer le label du lien"
    },
    info: {
      copy: "Copy",
      edit: "Edit",
      cancel: "Cancel link",
      coped: "Link copied to clipboard"
    },
    menu: {
      tooltip: "Add link"
    }
  }
};
var fr_FR_default5 = locale5;

// ../packages/docs-quick-insert-ui/src/locale/fr-FR.ts
var locale6 = {
  "docs-quick-insert-ui": {
    menu: {
      numberedList: "Liste num\xE9rot\xE9e",
      bulletedList: "Liste \xE0 puces",
      divider: "Ligne de s\xE9paration",
      text: "Texte",
      table: "Tableau",
      image: "Image"
    },
    group: {
      basics: "Basiques"
    },
    placeholder: "Aucun r\xE9sultat",
    keywordInputPlaceholder: "Entrez des mots cl\xE9s"
  }
};
var fr_FR_default6 = locale6;

// ../packages/docs-thread-comment-ui/src/locale/fr-FR.ts
var locale7 = {
  "docs-thread-comment-ui": {
    panel: {
      title: "Gestion des commentaires",
      addComment: "Ajouter un commentaire"
    }
  }
};
var fr_FR_default7 = locale7;

// ../packages/docs-ui/src/locale/fr-FR.ts
var locale8 = {
  "docs-ui": {
    toolbar: {
      undo: "Annuler",
      redo: "R\xE9tablir",
      font: "Police",
      fontSize: "Taille de la police",
      bold: "Gras",
      italic: "Italique",
      strikethrough: "Barr\xE9",
      subscript: "Indice",
      superscript: "Exposant",
      underline: "Soulign\xE9",
      textColor: {
        main: "Couleur du texte"
      },
      fillColor: {
        main: "Couleur de fond du texte"
      },
      table: {
        main: "Tableau",
        insert: "Ins\xE9rer un tableau",
        colCount: "Nombre de colonnes",
        rowCount: "Nombre de lignes"
      },
      resetColor: "R\xE9initialiser",
      order: "Liste ordonn\xE9e",
      unorder: "Liste non ordonn\xE9e",
      checklist: "Liste de t\xE2ches",
      documentFlavor: "Modern Mode",
      alignLeft: "Aligner \xE0 gauche",
      alignCenter: "Aligner au centre",
      alignRight: "Aligner \xE0 droite",
      alignJustify: "Justifier",
      horizontalLine: "Horizontal line",
      headerFooter: "En-t\xEAte et pied de page",
      pageSetup: "Param\xE8tres de page"
    },
    table: {
      insert: "Ins\xE9rer",
      insertRowAbove: "Ins\xE9rer une ligne au-dessus",
      insertRowBelow: "Ins\xE9rer une ligne en dessous",
      insertColumnLeft: "Ins\xE9rer une colonne \xE0 gauche",
      insertColumnRight: "Ins\xE9rer une colonne \xE0 droite",
      delete: "Supprimer",
      deleteRows: "Supprimer une ligne",
      deleteColumns: "Supprimer une colonne",
      deleteTable: "Supprimer le tableau"
    },
    headerFooter: {
      header: "En-t\xEAte",
      footer: "Pied de page",
      panel: "En-t\xEAte et pied de page",
      firstPageCheckBox: "Diff\xE9rente la premi\xE8re page",
      oddEvenCheckBox: "Diff\xE9rente les pages impaires et paires",
      headerTopMargin: "Marge en haut de l'en-t\xEAte(px)",
      footerBottomMargin: "Marge en bas du pied de page(px)",
      closeHeaderFooter: "Fermer l'en-t\xEAte et le pied de page",
      disableText: "Les param\xE8tres de l'en-t\xEAte et du pied de page sont d\xE9sactiv\xE9s"
    },
    doc: {
      menu: {
        paragraphSetting: "Param\xE8tres de paragraphe"
      },
      slider: {
        paragraphSetting: "Param\xE8tres de paragraphe"
      },
      paragraphSetting: {
        alignment: "Alignement",
        indentation: "Indentation",
        left: "Gauche",
        right: "Droite",
        firstLine: "Premi\xE8re ligne",
        hanging: "Retrait",
        spacing: "Espacement",
        before: "Avant",
        after: "Apr\xE8s",
        lineSpace: "Espacement de ligne",
        multiSpace: "Espacement multiple",
        fixedValue: "Valeur fixe(px)"
      }
    },
    rightClick: {
      copy: "Copier",
      cut: "Couper",
      paste: "Coller",
      delete: "Supprimer",
      bulletList: "Liste non ordonn\xE9e",
      orderList: "Liste ordonn\xE9e",
      checkList: "Liste de t\xE2ches",
      insertBellow: "Ins\xE9rer dans le bas"
    },
    "page-settings": {
      "document-setting": "Param\xE8tres du document",
      mode: "Mode",
      "modern-mode": "Moderne",
      "classic-mode": "Classique",
      "modern-width": "Largeur du contenu",
      "modern-width-narrow": "\xC9troit",
      "modern-width-medium": "Moyen",
      "modern-width-wide": "Large",
      "paper-size": "Format du papier",
      "page-size": {
        main: "Format du papier",
        a4: "A4",
        a3: "A3",
        a5: "A5",
        b4: "B4",
        b5: "B5",
        letter: "Format Lettre US",
        legal: "Format L\xE9gal US",
        tabloid: "Format Tablo\xEFd",
        statement: "Format D\xE9claration",
        executive: "Format Ex\xE9cutif",
        folio: "Format Folio"
      },
      orientation: "Orientation",
      portrait: "Portrait",
      landscape: "Paysage",
      "custom-paper-size": "Format de papier personnalis\xE9",
      top: "Haut",
      bottom: "Bas",
      left: "Gauche",
      right: "Droite",
      cancel: "Annuler",
      confirm: "Confirmer"
    }
  }
};
var fr_FR_default8 = locale8;

// ../packages/drawing-ui/src/locale/fr-FR.ts
var locale9 = {
  "drawing-ui": {
    "image-cropper": {
      error: "Impossible de rogner des objets non image."
    },
    "image-panel": {
      arrange: {
        title: "Arranger",
        forward: "Avancer",
        backward: "Reculer",
        front: "Mettre au premier plan",
        back: "Mettre \xE0 l'arri\xE8re-plan"
      },
      transform: {
        title: "Transformer",
        rotate: "Pivoter (\xB0)",
        x: "X (px)",
        y: "Y (px)",
        width: "Largeur (px)",
        height: "Hauteur (px)",
        lock: "Verrouiller le ratio (%)"
      },
      crop: {
        title: "Rogner",
        start: "Commencer \xE0 rogner",
        mode: "Libre"
      },
      group: {
        title: "Grouper",
        group: "Grouper",
        unGroup: "D\xE9grouper"
      },
      align: {
        title: "Aligner",
        default: "S\xE9lectionner le type d'alignement",
        left: "Aligner \xE0 gauche",
        center: "Aligner au centre",
        right: "Aligner \xE0 droite",
        top: "Aligner en haut",
        middle: "Aligner au milieu",
        bottom: "Aligner en bas",
        horizon: "Distribuer horizontalement",
        vertical: "Distribuer verticalement"
      },
      null: "Aucune s\xE9lection d'objet"
    },
    "image-text-wrap": {
      title: "Habillage du texte",
      wrappingStyle: "Style d'habillage",
      square: "Carr\xE9",
      topAndBottom: "Haut et bas",
      inline: "Align\xE9 avec le texte",
      behindText: "Derri\xE8re le texte",
      inFrontText: "Devant le texte",
      wrapText: "Habiller le texte",
      bothSide: "Des deux c\xF4t\xE9s",
      leftOnly: "Seulement \xE0 gauche",
      rightOnly: "Seulement \xE0 droite",
      distanceFromText: "Distance du texte",
      top: "Haut(px)",
      left: "Gauche(px)",
      bottom: "Bas(px)",
      right: "Droite(px)"
    },
    "image-popup": {
      replace: "Remplacer",
      delete: "Supprimer",
      edit: "Modifier",
      crop: "Rogner",
      reset: "R\xE9initialiser la taille"
    }
  }
};
var fr_FR_default9 = locale9;

// ../packages/find-replace/src/locale/fr-FR.ts
var locale10 = {
  "find-replace": {
    toolbar: "Rechercher & Remplacer",
    shortcut: {
      "open-find-dialog": "Ouvrir la bo\xEEte de dialogue de recherche",
      "open-replace-dialog": "Ouvrir la bo\xEEte de dialogue de remplacement",
      "close-dialog": "Fermer la bo\xEEte de dialogue de recherche et de remplacement",
      "go-to-next-match": "Aller \xE0 la correspondance suivante",
      "go-to-previous-match": "Aller \xE0 la correspondance pr\xE9c\xE9dente",
      "focus-selection": "Concentrer la s\xE9lection",
      panel: "Rechercher & Remplacer"
    },
    dialog: {
      title: "Rechercher",
      find: "Rechercher",
      replace: "Remplacer",
      "replace-all": "Remplacer tout",
      "case-sensitive": "Sensible \xE0 la casse",
      "find-placeholder": "Rechercher dans cette feuille",
      "advanced-finding": "Recherche et remplacement avanc\xE9s",
      "replace-placeholder": "Saisir la cha\xEEne de remplacement",
      "match-the-whole-cell": "Correspondance de la cellule enti\xE8re",
      "find-direction": {
        title: "Direction de la recherche",
        row: "Rechercher par ligne",
        column: "Rechercher par colonne"
      },
      "find-scope": {
        title: "Plage de recherche",
        "current-sheet": "Feuille actuelle",
        workbook: "Classeur"
      },
      "find-by": {
        title: "Rechercher par",
        value: "Rechercher par valeur",
        formula: "Rechercher une formule"
      },
      "no-match": "Recherche termin\xE9e mais aucune correspondance trouv\xE9e.",
      "no-result": "Aucun r\xE9sultat"
    },
    replace: {
      "all-success": "Toutes les {0} correspondances ont \xE9t\xE9 remplac\xE9es",
      "all-failure": "\xC9chec du remplacement",
      confirm: {
        title: "\xCAtes-vous s\xFBr de vouloir remplacer toutes les correspondances ?"
      }
    },
    button: {
      confirm: "OK",
      cancel: "Annuler"
    }
  }
};
var fr_FR_default10 = locale10;

// ../packages/sheets/src/locale/fr-FR.ts
var locale11 = {
  sheets: {
    tabs: {
      sheetCopy: "(Copie{0})",
      sheet: "Feuille"
    },
    info: {
      overlappingSelections: "Impossible d'utiliser cette commande sur des s\xE9lections qui se chevauchent",
      acrossMergedCell: "\xC0 travers une cellule fusionn\xE9e",
      partOfCell: "Seule une partie d'une cellule fusionn\xE9e est s\xE9lectionn\xE9e",
      hideSheet: "Aucune feuille visible apr\xE8s avoir masqu\xE9 celle-ci"
    },
    definedName: {
      nameEmpty: "Le nom ne peut pas \xEAtre vide",
      nameDuplicate: "Le nom existe d\xE9j\xE0",
      nameInvalid: "Le nom est invalide",
      nameSheetConflict: "Le nom entre en conflit avec le nom de la feuille",
      formulaOrRefStringEmpty: "La formule ou la cha\xEEne de r\xE9f\xE9rence ne peut pas \xEAtre vide",
      nameConflict: "Le nom entre en conflit avec le nom de la fonction",
      defaultName: "NomD\xE9fini"
    },
    permission: {
      dialog: {
        autoFillErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission pour le remplissage automatique. Pour utiliser le remplissage automatique, veuillez contacter le cr\xE9ateur.",
        editErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de modifier. Pour modifier, veuillez contacter le cr\xE9ateur.",
        formulaErr: "La plage ou la plage r\xE9f\xE9renc\xE9e est prot\xE9g\xE9e, et vous n'avez pas la permission de modifier. Pour modifier, veuillez contacter le cr\xE9ateur.",
        insertOrDeleteMoveRangeErr: "La plage ins\xE9r\xE9e ou supprim\xE9e intersecte la plage prot\xE9g\xE9e, et cette op\xE9ration n'est pas support\xE9e pour le moment.",
        insertRowColErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission d'ins\xE9rer des lignes et des colonnes. Pour ins\xE9rer des lignes et des colonnes, veuillez contacter le cr\xE9ateur.",
        moveRangeErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9placer la s\xE9lection. Pour d\xE9placer la s\xE9lection, veuillez contacter le cr\xE9ateur.",
        moveRowColErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9placer les lignes et les colonnes. Pour d\xE9placer les lignes et les colonnes, veuillez contacter le cr\xE9ateur.",
        operatorSheetErr: "La feuille de calcul est prot\xE9g\xE9e, et vous n'avez pas la permission de travailler sur la feuille de calcul. Pour travailler sur la feuille de calcul, veuillez contacter le cr\xE9ateur.",
        removeRowColErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de supprimer les lignes et les colonnes. Pour supprimer les lignes et les colonnes, veuillez contacter le cr\xE9ateur.",
        setRowColStyleErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9finir les styles de ligne et de colonne. Pour d\xE9finir les styles de ligne et de colonne, veuillez contacter le cr\xE9ateur.",
        setStyleErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9finir les styles. Pour d\xE9finir les styles, veuillez contacter le cr\xE9ateur."
      }
    },
    autoFill: {
      copy: "Copier la cellule",
      series: "Remplir la s\xE9rie",
      formatOnly: "Format uniquement",
      noFormat: "Aucun format"
    },
    merge: {
      confirm: {
        title: "Continuer la fusion ne conservera que la valeur de la cellule en haut \xE0 gauche, en supprimant les autres valeurs. \xCAtes-vous s\xFBr de vouloir continuer ?",
        cancel: "Annuler la fusion",
        confirm: "Continuer la fusion",
        warning: "Avertissement",
        dismantleMergeCellWarning: "Cela divisera certaines cellules fusionn\xE9es. Voulez-vous continuer ?"
      }
    }
  }
};
var fr_FR_default11 = locale11;

// ../packages/sheets-conditional-formatting-ui/src/locale/fr-FR.ts
var locale12 = {
  "sheets-conditional-formatting-ui": {
    title: "Mise en forme conditionnelle",
    menu: {
      manageConditionalFormatting: "G\xE9rer la mise en forme conditionnelle",
      createConditionalFormatting: "Cr\xE9er une mise en forme conditionnelle",
      clearRangeRules: "Effacer les r\xE8gles pour la plage s\xE9lectionn\xE9e",
      clearWorkSheetRules: "Effacer les r\xE8gles pour toute la feuille"
    },
    form: {
      lessThan: "La valeur doit \xEAtre inf\xE9rieure \xE0 {0}",
      lessThanOrEqual: "La valeur doit \xEAtre inf\xE9rieure ou \xE9gale \xE0 {0}",
      greaterThan: "La valeur doit \xEAtre sup\xE9rieure \xE0 {0}",
      greaterThanOrEqual: "La valeur doit \xEAtre sup\xE9rieure ou \xE9gale \xE0 {0}",
      rangeSelector: "S\xE9lectionner une plage ou entrer une valeur"
    },
    iconSet: {
      direction: "Direction",
      shape: "Forme",
      mark: "Marque",
      rank: "Rang",
      rule: "R\xE8gle",
      icon: "Ic\xF4ne",
      type: "Type",
      value: "Valeur",
      reverseIconOrder: "Inverser l'ordre des ic\xF4nes",
      and: "Et",
      when: "Quand",
      onlyShowIcon: "Afficher uniquement l'ic\xF4ne"
    },
    symbol: {
      greaterThan: ">",
      greaterThanOrEqual: ">=",
      lessThan: "<",
      lessThanOrEqual: "<="
    },
    panel: {
      createRule: "Cr\xE9er une r\xE8gle",
      clear: "Effacer toutes les r\xE8gles",
      range: "Appliquer la plage",
      styleType: "Type de style",
      submit: "Soumettre",
      cancel: "Annuler",
      rankAndAverage: "Haut/Bas/Moyenne",
      styleRule: "R\xE8gle de style",
      isNotBottom: "Haut",
      isBottom: "Bas",
      greaterThanAverage: "Sup\xE9rieur \xE0 la moyenne",
      lessThanAverage: "Inf\xE9rieur \xE0 la moyenne",
      medianValue: "Valeur m\xE9diane",
      fillType: "Type de remplissage",
      pureColor: "Couleur unie",
      gradient: "D\xE9grad\xE9",
      colorSet: "Ensemble de couleurs",
      positive: "Positif",
      native: "N\xE9gatif",
      workSheet: "Toute la feuille",
      selectedRange: "Plage s\xE9lectionn\xE9e",
      managerRuleSelect: "G\xE9rer les r\xE8gles de {0}",
      onlyShowDataBar: "Afficher uniquement les barres de donn\xE9es"
    },
    preview: {
      describe: {
        beginsWith: "Commence par {0}",
        endsWith: "Se termine par {0}",
        containsText: "Le texte contient {0}",
        notContainsText: "Le texte ne contient pas {0}",
        equal: "\xC9gal \xE0 {0}",
        notEqual: "Diff\xE9rent de {0}",
        containsBlanks: "Contient des blancs",
        notContainsBlanks: "Ne contient pas de blancs",
        containsErrors: "Contient des erreurs",
        notContainsErrors: "Ne contient pas d'erreurs",
        greaterThan: "Sup\xE9rieur \xE0 {0}",
        greaterThanOrEqual: "Sup\xE9rieur ou \xE9gal \xE0 {0}",
        lessThan: "Inf\xE9rieur \xE0 {0}",
        lessThanOrEqual: "Inf\xE9rieur ou \xE9gal \xE0 {0}",
        notBetween: "Pas entre {0} et {1}",
        between: "Entre {0} et {1}",
        yesterday: "Hier",
        tomorrow: "Demain",
        last7Days: "Les 7 derniers jours",
        thisMonth: "Ce mois-ci",
        lastMonth: "Le mois dernier",
        nextMonth: "Le mois prochain",
        thisWeek: "Cette semaine",
        lastWeek: "La semaine derni\xE8re",
        nextWeek: "La semaine prochaine",
        today: "Aujourd'hui",
        topN: "Top {0}",
        bottomN: "Bas {0}",
        topNPercent: "Top {0}%",
        bottomNPercent: "Bas {0}%"
      }
    },
    operator: {
      beginsWith: "Commence par",
      endsWith: "Se termine par",
      containsText: "Le texte contient",
      notContainsText: "Le texte ne contient pas",
      equal: "\xC9gal \xE0",
      notEqual: "Diff\xE9rent de",
      containsBlanks: "Contient des blancs",
      notContainsBlanks: "Ne contient pas de blancs",
      containsErrors: "Contient des erreurs",
      notContainsErrors: "Ne contient pas d'erreurs",
      greaterThan: "Sup\xE9rieur \xE0",
      greaterThanOrEqual: "Sup\xE9rieur ou \xE9gal \xE0",
      lessThan: "Inf\xE9rieur \xE0",
      lessThanOrEqual: "Inf\xE9rieur ou \xE9gal \xE0",
      notBetween: "Pas entre",
      between: "Entre",
      yesterday: "Hier",
      tomorrow: "Demain",
      last7Days: "Les 7 derniers jours",
      thisMonth: "Ce mois-ci",
      lastMonth: "Le mois dernier",
      nextMonth: "Le mois prochain",
      thisWeek: "Cette semaine",
      lastWeek: "La semaine derni\xE8re",
      nextWeek: "La semaine prochaine",
      today: "Aujourd'hui"
    },
    ruleType: {
      highlightCell: "Mettre en surbrillance la cellule",
      dataBar: "Barre de donn\xE9es",
      colorScale: "\xC9chelle de couleurs",
      formula: "Formule personnalis\xE9e",
      iconSet: "Jeu d'ic\xF4nes",
      duplicateValues: "Valeurs en double",
      uniqueValues: "Valeurs uniques"
    },
    subRuleType: {
      uniqueValues: "Valeurs uniques",
      duplicateValues: "Valeurs en double",
      rank: "Rang",
      text: "Texte",
      timePeriod: "P\xE9riode",
      number: "Nombre",
      average: "Moyenne"
    },
    valueType: {
      num: "Nombre",
      min: "Minimum",
      max: "Maximum",
      percent: "Pourcentage",
      percentile: "Percentile",
      formula: "Formule",
      none: "Aucun"
    },
    errorMessage: {
      notBlank: "La condition ne peut pas \xEAtre vide",
      rangeError: "Plage invalide",
      formulaError: "Formule incorrecte"
    },
    permission: {
      dialog: {
        setStyleErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9finir les styles. Pour d\xE9finir les styles, veuillez contacter le cr\xE9ateur."
      }
    }
  }
};
var fr_FR_default12 = locale12;

// ../packages/sheets-crosshair-highlight/src/locale/fr-FR.ts
var locale13 = {
  "sheets-crosshair-highlight": {
    button: {
      tooltip: "Surlignage du r\xE9ticule"
    }
  }
};
var fr_FR_default13 = locale13;

// ../packages/sheets-data-validation/src/locale/fr-FR.ts
var locale14 = {
  "sheets-data-validation": {
    operators: {
      between: "entre",
      greaterThan: "sup\xE9rieur \xE0",
      greaterThanOrEqual: "sup\xE9rieur ou \xE9gal \xE0",
      lessThan: "inf\xE9rieur \xE0",
      lessThanOrEqual: "inf\xE9rieur ou \xE9gal \xE0",
      equal: "\xE9gal \xE0",
      notEqual: "diff\xE9rent de",
      notBetween: "pas entre",
      legal: "est de type l\xE9gal"
    },
    ruleName: {
      between: "est entre {FORMULA1} et {FORMULA2}",
      greaterThan: "est sup\xE9rieur \xE0 {FORMULA1}",
      greaterThanOrEqual: "est sup\xE9rieur ou \xE9gal \xE0 {FORMULA1}",
      lessThan: "est inf\xE9rieur \xE0 {FORMULA1}",
      lessThanOrEqual: "est inf\xE9rieur ou \xE9gal \xE0 {FORMULA1}",
      equal: "est \xE9gal \xE0 {FORMULA1}",
      notEqual: "est diff\xE9rent de {FORMULA1}",
      notBetween: "n'est pas entre {FORMULA1} et {FORMULA2}",
      legal: "est un {TYPE} l\xE9gal"
    },
    errorMsg: {
      between: "La valeur doit \xEAtre entre {FORMULA1} et {FORMULA2}",
      greaterThan: "La valeur doit \xEAtre sup\xE9rieure \xE0 {FORMULA1}",
      greaterThanOrEqual: "La valeur doit \xEAtre sup\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
      lessThan: "La valeur doit \xEAtre inf\xE9rieure \xE0 {FORMULA1}",
      lessThanOrEqual: "La valeur doit \xEAtre inf\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
      equal: "La valeur doit \xEAtre \xE9gale \xE0 {FORMULA1}",
      notEqual: "La valeur doit \xEAtre diff\xE9rente de {FORMULA1}",
      notBetween: "La valeur ne doit pas \xEAtre entre {FORMULA1} et {FORMULA2}",
      legal: "La valeur doit \xEAtre un {TYPE} l\xE9gal"
    },
    date: {
      operators: {
        between: "entre",
        greaterThan: "apr\xE8s",
        greaterThanOrEqual: "le ou apr\xE8s",
        lessThan: "avant",
        lessThanOrEqual: "le ou avant",
        equal: "\xE9gal \xE0",
        notEqual: "diff\xE9rent de",
        notBetween: "pas entre",
        legal: "est une date l\xE9gale"
      },
      ruleName: {
        between: "est entre {FORMULA1} et {FORMULA2}",
        greaterThan: "est apr\xE8s {FORMULA1}",
        greaterThanOrEqual: "est le ou apr\xE8s {FORMULA1}",
        lessThan: "est avant {FORMULA1}",
        lessThanOrEqual: "est le ou avant {FORMULA1}",
        equal: "est {FORMULA1}",
        notEqual: "n'est pas {FORMULA1}",
        notBetween: "n'est pas entre {FORMULA1}",
        legal: "est une date l\xE9gale"
      },
      errorMsg: {
        between: "La valeur doit \xEAtre une date l\xE9gale et entre {FORMULA1} et {FORMULA2}",
        greaterThan: "La valeur doit \xEAtre une date l\xE9gale et apr\xE8s {FORMULA1}",
        greaterThanOrEqual: "La valeur doit \xEAtre une date l\xE9gale et le ou apr\xE8s {FORMULA1}",
        lessThan: "La valeur doit \xEAtre une date l\xE9gale et avant {FORMULA1}",
        lessThanOrEqual: "La valeur doit \xEAtre une date l\xE9gale et le ou avant {FORMULA1}",
        equal: "La valeur doit \xEAtre une date l\xE9gale et {FORMULA1}",
        notEqual: "La valeur doit \xEAtre une date l\xE9gale et non {FORMULA1}",
        notBetween: "La valeur doit \xEAtre une date l\xE9gale et non entre {FORMULA1}",
        legal: "La valeur doit \xEAtre une date l\xE9gale"
      },
      title: "Date"
    },
    textLength: {
      errorMsg: {
        between: "La longueur du texte doit \xEAtre entre {FORMULA1} et {FORMULA2}",
        greaterThan: "La longueur du texte doit \xEAtre sup\xE9rieure \xE0 {FORMULA1}",
        greaterThanOrEqual: "La longueur du texte doit \xEAtre sup\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
        lessThan: "La longueur du texte doit \xEAtre inf\xE9rieure \xE0 {FORMULA1}",
        lessThanOrEqual: "La longueur du texte doit \xEAtre inf\xE9rieure ou \xE9gale \xE0 {FORMULA1}",
        equal: "La longueur du texte doit \xEAtre {FORMULA1}",
        notEqual: "La longueur du texte doit \xEAtre diff\xE9rente de {FORMULA1}",
        notBetween: "La longueur du texte ne doit pas \xEAtre entre {FORMULA1} et {FORMULA2}"
      },
      title: "Longueur du texte"
    },
    custom: {
      ruleName: "La formule personnalis\xE9e est {FORMULA1}",
      title: "Formule personnalis\xE9e",
      validFail: "Veuillez entrer une formule valide",
      error: "Le contenu de cette cellule viole sa r\xE8gle de validation"
    },
    validFail: {
      value: "Veuillez entrer une valeur",
      common: "Veuillez entrer une valeur ou une formule",
      number: "Veuillez entrer un nombre ou une formule",
      formula: "Veuillez entrer une formule",
      integer: "Veuillez entrer un entier ou une formule",
      date: "Veuillez entrer une date ou une formule",
      list: "Veuillez entrer des options",
      listInvalid: "La source de la liste doit \xEAtre une liste d\xE9limit\xE9e ou une r\xE9f\xE9rence \xE0 une seule ligne ou colonne",
      checkboxEqual: "Entrez des valeurs diff\xE9rentes pour les contenus des cellules coch\xE9es et d\xE9coch\xE9es.",
      formulaError: "La plage de r\xE9f\xE9rence contient des donn\xE9es invisibles, veuillez r\xE9ajuster la plage",
      listIntersects: "La plage s\xE9lectionn\xE9e ne peut pas croiser le champ des r\xE8gles",
      primitive: "Les formules ne sont pas autoris\xE9es pour les valeurs personnalis\xE9es coch\xE9es et d\xE9coch\xE9es."
    },
    any: {
      title: "N'importe quelle valeur",
      error: "Le contenu de cette cellule viole la r\xE8gle de validation"
    },
    list: {
      title: "Liste d\xE9roulante",
      name: "La valeur contient une de la plage",
      error: "L'entr\xE9e doit \xEAtre dans la plage sp\xE9cifi\xE9e",
      emptyError: "Veuillez entrer une valeur",
      add: "Ajouter",
      dropdown: "S\xE9lectionner",
      options: "Options",
      customOptions: "Personnalis\xE9",
      refOptions: "D'une plage",
      formulaError: "La source de la liste doit \xEAtre une liste d\xE9limit\xE9e de donn\xE9es, ou une r\xE9f\xE9rence \xE0 une seule ligne ou colonne.",
      edit: "\xC9diter"
    },
    listMultiple: {
      title: "Liste d\xE9roulante-Multiple",
      dropdown: "S\xE9lection multiple"
    },
    decimal: {
      title: "Nombre"
    },
    whole: {
      title: "Entier"
    },
    checkbox: {
      title: "Case \xE0 cocher",
      error: "Le contenu de cette cellule viole sa r\xE8gle de validation",
      tips: "Utiliser des valeurs personnalis\xE9es dans les cellules",
      checked: "Valeur s\xE9lectionn\xE9e",
      unchecked: "Valeur non s\xE9lectionn\xE9e"
    }
  }
};
var fr_FR_default14 = locale14;

// ../packages/sheets-data-validation-ui/src/locale/fr-FR.ts
var locale15 = {
  "sheets-data-validation-ui": {
    title: "Validation des donn\xE9es",
    validFail: {
      value: "Veuillez entrer une valeur",
      common: "Veuillez entrer une valeur ou une formule",
      number: "Veuillez entrer un nombre ou une formule",
      formula: "Veuillez entrer une formule",
      integer: "Veuillez entrer un entier ou une formule",
      date: "Veuillez entrer une date ou une formule",
      list: "Veuillez entrer des options",
      listInvalid: "La source de la liste doit \xEAtre une liste d\xE9limit\xE9e ou une r\xE9f\xE9rence \xE0 une seule ligne ou colonne",
      checkboxEqual: "Entrez des valeurs diff\xE9rentes pour les contenus des cellules coch\xE9es et d\xE9coch\xE9es.",
      formulaError: "La plage de r\xE9f\xE9rence contient des donn\xE9es invisibles, veuillez r\xE9ajuster la plage",
      listIntersects: "La plage s\xE9lectionn\xE9e ne peut pas croiser le champ des r\xE8gles",
      primitive: "Les formules ne sont pas autoris\xE9es pour les valeurs personnalis\xE9es coch\xE9es et d\xE9coch\xE9es."
    },
    panel: {
      title: "Gestion de la validation des donn\xE9es",
      addTitle: "Cr\xE9er une nouvelle validation des donn\xE9es",
      removeAll: "Tout supprimer",
      add: "Ajouter une r\xE8gle",
      range: "Plages",
      type: "Type",
      options: "Options avanc\xE9es",
      operator: "Op\xE9rateur",
      removeRule: "Supprimer",
      done: "Termin\xE9",
      formulaPlaceholder: "Veuillez entrer une valeur ou une formule",
      valuePlaceholder: "Veuillez entrer une valeur",
      formulaAnd: "et",
      invalid: "Invalide",
      showWarning: "Afficher un avertissement",
      rejectInput: "Rejeter l'entr\xE9e",
      messageInfo: "Message d'aide",
      showInfo: "Afficher le texte d'aide pour une cellule s\xE9lectionn\xE9e",
      rangeError: "Les plages ne sont pas l\xE9gales",
      allowBlank: "Autoriser les valeurs vides"
    },
    any: {
      title: "N'importe quelle valeur",
      error: "Le contenu de cette cellule viole la r\xE8gle de validation"
    },
    date: {
      title: "Date"
    },
    list: {
      title: "Liste d\xE9roulante",
      name: "La valeur contient une de la plage",
      error: "L'entr\xE9e doit \xEAtre dans la plage sp\xE9cifi\xE9e",
      emptyError: "Veuillez entrer une valeur",
      add: "Ajouter",
      dropdown: "S\xE9lectionner",
      options: "Options",
      customOptions: "Personnalis\xE9",
      refOptions: "D'une plage",
      formulaError: "La source de la liste doit \xEAtre une liste d\xE9limit\xE9e de donn\xE9es, ou une r\xE9f\xE9rence \xE0 une seule ligne ou colonne.",
      edit: "\xC9diter"
    },
    listMultiple: {
      title: "Liste d\xE9roulante-Multiple",
      dropdown: "S\xE9lection multiple"
    },
    textLength: {
      title: "Longueur du texte"
    },
    decimal: {
      title: "Nombre"
    },
    whole: {
      title: "Entier"
    },
    checkbox: {
      title: "Case \xE0 cocher",
      error: "Le contenu de cette cellule viole sa r\xE8gle de validation",
      tips: "Utiliser des valeurs personnalis\xE9es dans les cellules",
      checked: "Valeur s\xE9lectionn\xE9e",
      unchecked: "Valeur non s\xE9lectionn\xE9e"
    },
    custom: {
      title: "Formule personnalis\xE9e",
      error: "Le contenu de cette cellule viole sa r\xE8gle de validation",
      validFail: "Veuillez entrer une formule valide"
    },
    alert: {
      title: "Erreur",
      ok: "OK"
    },
    error: {
      title: "Invalide :"
    },
    renderMode: {
      arrow: "Fl\xE8che",
      chip: "Puce",
      text: "Texte brut",
      label: "Style d'affichage"
    },
    showTime: {
      label: "Afficher le s\xE9lecteur de temps"
    },
    permission: {
      dialog: {
        setStyleErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9finir les styles. Pour d\xE9finir les styles, veuillez contacter le cr\xE9ateur."
      }
    }
  }
};
var fr_FR_default15 = locale15;

// ../packages/sheets-drawing-ui/src/locale/fr-FR.ts
var locale16 = {
  "sheets-drawing-ui": {
    title: "Image",
    upload: {
      float: "Image flottante",
      cell: "Image de cellule"
    },
    panel: {
      title: "Modifier l'image"
    },
    save: {
      title: "Enregistrer les images de cellule",
      menuLabel: "Enregistrer les images de cellule",
      imageCount: "Nombre d'images",
      fileNameConfig: "Nom du fichier",
      useRowCol: "Utiliser l'adresse de cellule (A1, B2...)",
      useColumnValue: "Utiliser la valeur de la colonne",
      selectColumn: "S\xE9lectionner la colonne",
      cancel: "Annuler",
      confirm: "Enregistrer",
      saving: "Enregistrement...",
      error: "\xC9chec de l'enregistrement des images de cellule"
    },
    "image-popup": {
      replace: "Remplacer",
      delete: "Supprimer",
      edit: "\xC9diter",
      crop: "Rogner",
      reset: "R\xE9initialiser la taille",
      flipH: "Retournement horizontal",
      flipV: "Retournement vertical"
    },
    "update-status": {
      exceedMaxSize: "La taille de l'image d\xE9passe la limite, la limite est de {0}M",
      invalidImageType: "Type d'image invalide",
      exceedMaxCount: "Seulement {0} images peuvent \xEAtre t\xE9l\xE9charg\xE9es \xE0 la fois",
      invalidImage: "Image invalide"
    },
    "drawing-anchor": {
      title: "Propri\xE9t\xE9s de l'ancre",
      both: "D\xE9placer et redimensionner avec les cellules",
      position: "D\xE9placer mais ne pas redimensionner avec les cellules",
      none: "Ne pas d\xE9placer ni redimensionner avec les cellules"
    },
    "cell-image": {
      pasteTitle: "Coller comme image de cellule",
      pasteContent: "Coller une image de cellule \xE9crasera le contenu existant de la cellule, continuer le collage",
      pasteError: "Le copier-coller d'image de cellule n'est pas pris en charge dans cette unit\xE9"
    },
    permission: {
      dialog: {
        editErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de modifier. Pour modifier, veuillez contacter le cr\xE9ateur."
      }
    },
    shortcut: {
      "drawing-view": "Vue du dessin",
      "drawing-move-down": "D\xE9placer le dessin vers le bas",
      "drawing-move-up": "D\xE9placer le dessin vers le haut",
      "drawing-move-left": "D\xE9placer le dessin vers la gauche",
      "drawing-move-right": "D\xE9placer le dessin vers la droite",
      "drawing-delete": "Supprimer le dessin"
    }
  }
};
var fr_FR_default16 = locale16;

// ../packages/sheets-filter/src/locale/fr-FR.ts
var locale17 = {
  "sheets-filter": {
    command: {
      "not-valid-filter-range": "La plage s\xE9lectionn\xE9e n'a qu'une seule ligne et n'est pas valide pour le filtre."
    },
    msg: {
      "filter-header-forbidden": "Vous ne pouvez pas d\xE9placer la ligne d'en-t\xEAte d'un filtre."
    }
  }
};
var fr_FR_default17 = locale17;

// ../packages/sheets-filter-ui/src/locale/fr-FR.ts
var locale18 = {
  "sheets-filter-ui": {
    toolbar: {
      "smart-toggle-filter-tooltip": "Inverser le filtre",
      "clear-filter-criteria": "Effacer les conditions de filtre",
      "re-calc-filter-conditions": "Recalculer les conditions de filtre"
    },
    shortcut: {
      "smart-toggle-filter": "Inverser le filtre"
    },
    panel: {
      "clear-filter": "Effacer le filtre",
      cancel: "Annuler",
      confirm: "Confirmer",
      "by-values": "Par valeurs",
      "by-colors": "Par couleurs",
      "filter-by-cell-fill-color": "Filtrer par couleur de remplissage de cellule",
      "filter-by-cell-text-color": "Filtrer par couleur de texte de cellule",
      "filter-by-color-none": "Cette colonne ne contient qu'une seule couleur",
      "by-conditions": "Par conditions",
      "filter-only": "Filtrer uniquement",
      "search-placeholder": "Utilisez un espace pour s\xE9parer les mots-cl\xE9s",
      "select-all": "Tout s\xE9lectionner",
      "input-values-placeholder": "Saisir des valeurs",
      and: "ET",
      or: "OU",
      empty: "(vide)",
      "?": "Utilisez \u201C?\u201D pour repr\xE9senter un seul caract\xE8re.",
      "*": "Utilisez \u201C*\u201D pour repr\xE9senter plusieurs caract\xE8res."
    },
    conditions: {
      none: "Aucun",
      empty: "Est vide",
      "not-empty": "N'est pas vide",
      "text-contains": "Le texte contient",
      "does-not-contain": "Le texte ne contient pas",
      "starts-with": "Le texte commence par",
      "ends-with": "Le texte se termine par",
      equals: "Le texte est \xE9gal \xE0",
      "greater-than": "Sup\xE9rieur \xE0",
      "greater-than-or-equal": "Sup\xE9rieur ou \xE9gal \xE0",
      "less-than": "Inf\xE9rieur \xE0",
      "less-than-or-equal": "Inf\xE9rieur ou \xE9gal \xE0",
      equal: "\xC9gal \xE0",
      "not-equal": "Diff\xE9rent de",
      between: "Entre",
      "not-between": "Pas entre",
      custom: "Personnalis\xE9"
    },
    date: {
      1: "Jan",
      2: "F\xE9v",
      3: "Mar",
      4: "Avr",
      5: "Mai",
      6: "Juin",
      7: "Juil",
      8: "Ao\xFBt",
      9: "Sept",
      10: "Oct",
      11: "Nov",
      12: "D\xE9c"
    },
    sync: {
      title: "Le filtre est visible par tous",
      statusTips: {
        on: "Une fois activ\xE9, tous les collaborateurs verront les r\xE9sultats du filtre",
        off: "Une fois d\xE9sactiv\xE9, seul vous verrez les r\xE9sultats du filtre"
      },
      switchTips: {
        on: "\u201CLe filtre est visible par tous\u201D est activ\xE9, tous les collaborateurs verront les r\xE9sultats du filtre",
        off: "\u201CLe filtre est visible par tous\u201D est d\xE9sactiv\xE9, seul vous verrez les r\xE9sultats du filtre"
      }
    }
  }
};
var fr_FR_default18 = locale18;

// ../packages/sheets-formula/src/locale/function-list/array/fr-FR.ts
var locale19 = en_US_default;
var fr_FR_default19 = locale19;

// ../packages/sheets-formula/src/locale/function-list/compatibility/fr-FR.ts
var locale20 = en_US_default2;
var fr_FR_default20 = locale20;

// ../packages/sheets-formula/src/locale/function-list/cube/fr-FR.ts
var locale21 = en_US_default3;
var fr_FR_default21 = locale21;

// ../packages/sheets-formula/src/locale/function-list/database/fr-FR.ts
var locale22 = en_US_default4;
var fr_FR_default22 = locale22;

// ../packages/sheets-formula/src/locale/function-list/date/fr-FR.ts
var locale23 = en_US_default5;
var fr_FR_default23 = locale23;

// ../packages/sheets-formula/src/locale/function-list/engineering/fr-FR.ts
var locale24 = en_US_default6;
var fr_FR_default24 = locale24;

// ../packages/sheets-formula/src/locale/function-list/financial/fr-FR.ts
var locale25 = en_US_default7;
var fr_FR_default25 = locale25;

// ../packages/sheets-formula/src/locale/function-list/information/fr-FR.ts
var locale26 = en_US_default8;
var fr_FR_default26 = locale26;

// ../packages/sheets-formula/src/locale/function-list/logical/fr-FR.ts
var locale27 = en_US_default9;
var fr_FR_default27 = locale27;

// ../packages/sheets-formula/src/locale/function-list/lookup/fr-FR.ts
var locale28 = en_US_default10;
var fr_FR_default28 = locale28;

// ../packages/sheets-formula/src/locale/function-list/math/fr-FR.ts
var locale29 = en_US_default11;
var fr_FR_default29 = locale29;

// ../packages/sheets-formula/src/locale/function-list/statistical/fr-FR.ts
var locale30 = en_US_default12;
var fr_FR_default30 = locale30;

// ../packages/sheets-formula/src/locale/function-list/text/fr-FR.ts
var locale31 = en_US_default13;
var fr_FR_default31 = locale31;

// ../packages/sheets-formula/src/locale/function-list/univer/fr-FR.ts
var locale32 = {};
var fr_FR_default32 = locale32;

// ../packages/sheets-formula/src/locale/function-list/web/fr-FR.ts
var locale33 = en_US_default14;
var fr_FR_default33 = locale33;

// ../packages/sheets-formula/src/locale/fr-FR.ts
var locale34 = {
  "sheets-formula": {
    functionList: {
      ...fr_FR_default19,
      ...fr_FR_default20,
      ...fr_FR_default21,
      ...fr_FR_default22,
      ...fr_FR_default23,
      ...fr_FR_default24,
      ...fr_FR_default25,
      ...fr_FR_default26,
      ...fr_FR_default27,
      ...fr_FR_default28,
      ...fr_FR_default29,
      ...fr_FR_default30,
      ...fr_FR_default31,
      ...fr_FR_default32,
      ...fr_FR_default33
    }
  }
};
var fr_FR_default34 = locale34;

// ../packages/sheets-formula-ui/src/locale/fr-FR.ts
var locale35 = {
  "sheets-formula-ui": {
    shortcut: {
      "quick-sum": "Somme rapide"
    },
    insert: {
      tooltip: "Fonctions",
      common: "Fonctions courantes"
    },
    prompt: {
      helpExample: "EXEMPLE",
      helpAbstract: "\xC0 PROPOS",
      required: "Requis.",
      optional: "Optionnel."
    },
    error: {
      title: "Erreur",
      divByZero: "Erreur de division par z\xE9ro",
      name: "Erreur de nom invalide",
      value: "Erreur de valeur",
      num: "Erreur de nombre",
      na: "Erreur de valeur non disponible",
      cycle: "Erreur de r\xE9f\xE9rence circulaire",
      ref: "Erreur de r\xE9f\xE9rence de cellule invalide",
      spill: "La plage de d\xE9bordement n'est pas vide",
      calc: "Erreur de calcul",
      error: "Erreur",
      connect: "R\xE9cup\xE9ration des donn\xE9es",
      null: "Erreur nulle"
    },
    functionType: {
      financial: "Financier",
      date: "Date & Heure",
      math: "Math & Trigo",
      statistical: "Statistique",
      lookup: "Recherche & R\xE9f\xE9rence",
      database: "Base de donn\xE9es",
      text: "Texte",
      logical: "Logique",
      information: "Information",
      engineering: "Ing\xE9nierie",
      cube: "Cube",
      compatibility: "Compatibilit\xE9",
      web: "Web",
      array: "Tableau",
      univer: "Univer",
      user: "D\xE9finies par l'utilisateur",
      definedname: "Nom d\xE9fini"
    },
    moreFunctions: {
      confirm: "Confirmer",
      prev: "Pr\xE9c\xE9dent",
      next: "Suivant",
      searchFunctionPlaceholder: "Rechercher une fonction",
      allFunctions: "Toutes les fonctions",
      syntax: "SYNTAXE"
    },
    operation: {
      copyFormulaOnly: "Copier uniquement la formule",
      pasteFormula: "Coller la formule"
    },
    rangeSelector: {
      title: "S\xE9lectionner une plage de donn\xE9es",
      addAnotherRange: "Ajouter une plage",
      buttonTooltip: "S\xE9lectionner une plage de donn\xE9es",
      placeHolder: "S\xE9lectionner une plage ou entrer.",
      confirm: "Confirmer",
      cancel: "Annuler"
    }
  }
};
var fr_FR_default35 = locale35;

// ../packages/sheets-hyper-link/src/locale/fr-FR.ts
var locale36 = {
  "sheets-hyper-link": {
    message: {
      refError: "Plage invalide"
    }
  }
};
var fr_FR_default36 = locale36;

// ../packages/sheets-hyper-link-ui/src/locale/fr-FR.ts
var locale37 = {
  "sheets-hyper-link-ui": {
    form: {
      editTitle: "Modifier le lien",
      addTitle: "Ins\xE9rer un lien",
      label: "Titre",
      type: "Type",
      link: "Lien",
      linkPlaceholder: "Entrez le lien",
      range: "Plage",
      worksheet: "Feuille de calcul",
      definedName: "Nom d\xE9fini",
      ok: "Confirmer",
      cancel: "Annuler",
      labelPlaceholder: "Entrez le titre",
      inputError: "Veuillez entrer",
      selectError: "Veuillez s\xE9lectionner",
      linkError: "Veuillez entrer un lien valide"
    },
    menu: {
      add: "Ins\xE9rer un lien"
    },
    message: {
      noSheet: "La feuille cible a \xE9t\xE9 supprim\xE9e",
      refError: "Plage invalide",
      hiddenSheet: "Impossible d'ouvrir le lien car la feuille li\xE9e est masqu\xE9e",
      coped: "Lien copi\xE9 dans le presse-papiers"
    },
    popup: {
      copy: "Copier le lien",
      edit: "Modifier le lien",
      cancel: "Annuler le lien"
    }
  }
};
var fr_FR_default37 = locale37;

// ../packages/sheets-note-ui/src/locale/fr-FR.ts
var locale38 = {
  "sheets-note-ui": {
    note: {
      placeholder: "\xC9crivez ici"
    },
    rightClick: {
      addNote: "Ajouter une note",
      deleteNote: "Supprimer la note",
      toggleNote: "Afficher/Masquer la note"
    }
  }
};
var fr_FR_default38 = locale38;

// ../packages/sheets-numfmt-ui/src/locale/fr-FR.ts
var locale39 = {
  "sheets-numfmt-ui": {
    title: "Format de nombre",
    numfmtType: "Types de format",
    cancel: "Annuler",
    confirm: "Confirmer",
    general: "G\xE9n\xE9ral",
    accounting: "Comptabilit\xE9",
    text: "Texte",
    number: "Nombre",
    percent: "Pourcentage",
    scientific: "Scientifique",
    currency: "Devise",
    date: "Date",
    time: "Heure",
    thousandthPercentile: "S\xE9parateur de milliers",
    preview: "Aper\xE7u",
    dateTime: "Date et heure",
    decimalLength: "Nombre de d\xE9cimales",
    currencyType: "Symbole de devise",
    moreFmt: "Formats",
    financialValue: "Valeur financi\xE8re",
    roundingCurrency: "Arrondir la devise",
    timeDuration: "Dur\xE9e",
    currencyDes: "Le format de devise est utilis\xE9 pour repr\xE9senter des valeurs mon\xE9taires g\xE9n\xE9rales. Le format de comptabilit\xE9 aligne une colonne de valeurs avec des points d\xE9cimaux",
    accountingDes: "Le format de nombre de comptabilit\xE9 aligne une colonne de valeurs avec des symboles de devise et des points d\xE9cimaux",
    dateType: "Type de date",
    dateDes: "Le format de date pr\xE9sente les valeurs de la s\xE9rie date et heure sous forme de valeurs de date.",
    negType: "Type de nombre n\xE9gatif",
    generalDes: "Le format g\xE9n\xE9ral ne contient aucun format de nombre sp\xE9cifique.",
    thousandthPercentileDes: "Le format de percentile est utilis\xE9 pour la repr\xE9sentation des nombres ordinaires. Les formats mon\xE9taires et comptables fournissent un format sp\xE9cialis\xE9 pour les calculs de valeurs mon\xE9taires.",
    addDecimal: "Augmenter les d\xE9cimales",
    subtractDecimal: "Diminuer les d\xE9cimales",
    customFormat: "Format personnalis\xE9",
    customFormatDes: "G\xE9n\xE9rer des formats de nombre personnalis\xE9s bas\xE9s sur des formats existants.",
    info: {
      error: "Erreur",
      forceStringInfo: "Nombre stock\xE9 en tant que texte"
    }
  }
};
var fr_FR_default39 = locale39;

// ../packages/sheets-sort-ui/src/locale/fr-FR.ts
var locale40 = {
  "sheets-sort-ui": {
    general: {
      sort: "Trier",
      "sort-asc": "Croissant",
      "sort-desc": "D\xE9croissant",
      "sort-custom": "Tri personnalis\xE9",
      "sort-asc-ext": "\xC9tendre croissant",
      "sort-desc-ext": "\xC9tendre d\xE9croissant",
      "sort-asc-cur": "Croissant",
      "sort-desc-cur": "D\xE9croissant"
    },
    error: {
      "merge-size": "La plage s\xE9lectionn\xE9e contient des cellules fusionn\xE9es de tailles diff\xE9rentes, qui ne peuvent pas \xEAtre tri\xE9es.",
      empty: "La plage s\xE9lectionn\xE9e ne contient aucun contenu et ne peut pas \xEAtre tri\xE9e.",
      single: "La plage s\xE9lectionn\xE9e ne contient qu'une seule ligne et ne peut pas \xEAtre tri\xE9e.",
      "formula-array": "La plage s\xE9lectionn\xE9e contient des formules matricielles et ne peut pas \xEAtre tri\xE9e."
    },
    dialog: {
      "sort-reminder": "Rappel de tri",
      "sort-reminder-desc": "\xC9tendre le tri de la plage ou conserver le tri de la plage?",
      "sort-reminder-ext": "\xC9tendre le tri de la plage",
      "sort-reminder-no": "Conserver le tri de la plage",
      "first-row-check": "La premi\xE8re ligne ne participe pas au tri",
      "add-condition": "Ajouter une condition",
      cancel: "Annuler",
      confirm: "Confirmer"
    },
    info: {
      tooltip: "Info-bulle"
    }
  }
};
var fr_FR_default40 = locale40;

// ../packages/sheets-table/src/locale/fr-FR.ts
var locale41 = {
  "sheets-table": {
    columnPrefix: "Colonne",
    tablePrefix: "Tableau",
    tableNameError: "Le nom du tableau ne peut pas contenir d'espaces, ne peut pas commencer par un chiffre et ne peut pas \xEAtre identique \xE0 un nom de tableau existant"
  }
};
var fr_FR_default41 = locale41;

// ../packages/sheets-table-ui/src/locale/fr-FR.ts
var locale42 = {
  "sheets-table-ui": {
    title: "Tableau",
    selectRange: "S\xE9lectionner la plage du tableau",
    rename: "Renommer le tableau",
    renamePlaceholder: "Enter table name",
    updateRange: "Mettre \xE0 jour la plage du tableau",
    tableRangeWithMergeError: "La plage du tableau ne peut pas chevaucher des cellules fusionn\xE9es",
    tableRangeWithOtherTableError: "La plage du tableau ne peut pas chevaucher d'autres tableaux",
    tableRangeSingleRowError: "La plage du tableau ne peut pas \xEAtre une seule ligne",
    updateError: "Impossible de d\xE9finir la plage du tableau sur une zone qui ne chevauche pas l'original et n'est pas sur la m\xEAme ligne",
    tableStyle: "Style du tableau",
    defaultStyle: "Style par d\xE9faut",
    customStyle: "Style personnalis\xE9",
    customTooMore: "Le nombre de th\xE8mes personnalis\xE9s d\xE9passe la limite maximale, veuillez supprimer certains th\xE8mes inutiles et les ajouter \xE0 nouveau",
    setTheme: "D\xE9finir le th\xE8me du tableau",
    removeTable: "Supprimer le tableau",
    cancel: "Annuler",
    confirm: "Confirmer",
    header: "En-t\xEAte",
    footer: "Pied de page",
    firstLine: "Premi\xE8re ligne",
    secondLine: "Deuxi\xE8me ligne",
    columnPrefix: "Colonne",
    tablePrefix: "Tableau",
    tableNameError: "Le nom du tableau ne peut pas contenir d'espaces, ne peut pas commencer par un chiffre et ne peut pas \xEAtre identique \xE0 un nom de tableau existant",
    columnMenu: {
      "insert-left": "Insert 1 table column left",
      "insert-right": "Insert 1 table column right",
      delete: "Delete table column"
    },
    sort: {
      "sort-asc": "Croissant",
      "sort-desc": "D\xE9croissant"
    },
    insert: {
      main: "Ins\xE9rer un tableau",
      row: "Ins\xE9rer une ligne de tableau",
      col: "Ins\xE9rer une colonne de tableau"
    },
    remove: {
      main: "Supprimer le tableau",
      row: "Supprimer une ligne de tableau",
      col: "Supprimer une colonne de tableau"
    },
    condition: {
      string: "Texte",
      number: "Nombre",
      date: "Date",
      empty: "(Vide)"
    },
    string: {
      compare: {
        equal: "\xC9gal \xE0",
        notEqual: "Diff\xE9rent de",
        contains: "Contient",
        notContains: "Ne contient pas",
        startsWith: "Commence par",
        endsWith: "Se termine par"
      }
    },
    number: {
      compare: {
        equal: "\xC9gal \xE0",
        notEqual: "Diff\xE9rent de",
        greaterThan: "Sup\xE9rieur \xE0",
        greaterThanOrEqual: "Sup\xE9rieur ou \xE9gal \xE0",
        lessThan: "Inf\xE9rieur \xE0",
        lessThanOrEqual: "Inf\xE9rieur ou \xE9gal \xE0",
        between: "Entre",
        notBetween: "Pas entre",
        above: "Sup\xE9rieur \xE0",
        below: "Inf\xE9rieur \xE0",
        topN: "Top {0}"
      }
    },
    date: {
      compare: {
        equal: "\xC9gal \xE0",
        notEqual: "Diff\xE9rent de",
        after: "Apr\xE8s",
        afterOrEqual: "Apr\xE8s ou \xE9gal \xE0",
        before: "Avant",
        beforeOrEqual: "Avant ou \xE9gal \xE0",
        between: "Entre",
        notBetween: "Pas entre",
        today: "Aujourd'hui",
        yesterday: "Hier",
        tomorrow: "Demain",
        thisWeek: "Cette semaine",
        lastWeek: "La semaine derni\xE8re",
        nextWeek: "La semaine prochaine",
        thisMonth: "Ce mois-ci",
        lastMonth: "Le mois dernier",
        nextMonth: "Le mois prochain",
        thisQuarter: "Ce trimestre",
        lastQuarter: "Le trimestre dernier",
        nextQuarter: "Le trimestre prochain",
        thisYear: "Cette ann\xE9e",
        nextYear: "L'ann\xE9e prochaine",
        lastYear: "L'ann\xE9e derni\xE8re",
        quarter: "Par trimestre",
        month: "Par mois",
        q1: "Premier trimestre",
        q2: "Deuxi\xE8me trimestre",
        q3: "Troisi\xE8me trimestre",
        q4: "Quatri\xE8me trimestre",
        m1: "Janvier",
        m2: "F\xE9vrier",
        m3: "Mars",
        m4: "Avril",
        m5: "Mai",
        m6: "Juin",
        m7: "Juillet",
        m8: "Ao\xFBt",
        m9: "Septembre",
        m10: "Octobre",
        m11: "Novembre",
        m12: "D\xE9cembre"
      }
    },
    filter: {
      "by-values": "Par valeurs",
      "by-conditions": "Par conditions",
      "clear-filter": "Effacer le filtre",
      cancel: "Annuler",
      confirm: "Confirmer",
      "search-placeholder": "Utilisez un espace pour s\xE9parer les mots-cl\xE9s",
      "select-all": "Tout s\xE9lectionner"
    }
  }
};
var fr_FR_default42 = locale42;

// ../packages/sheets-thread-comment-ui/src/locale/fr-FR.ts
var locale43 = {
  "sheets-thread-comment-ui": {
    panel: {
      title: "Gestion des commentaires"
    },
    menu: {
      addComment: "Ajouter un commentaire",
      commentManagement: "Gestion des commentaires"
    }
  }
};
var fr_FR_default43 = locale43;

// ../packages/sheets-ui/src/locale/fr-FR.ts
var locale44 = {
  "sheets-ui": {
    toolbar: {
      undo: "Annuler",
      redo: "Refaire",
      formatPainter: "Reproduire la mise en forme",
      font: "Police",
      fontSize: "Taille de police",
      fontSizeIncrease: "Augmenter la taille de la police",
      fontSizeDecrease: "Diminuer la taille de la police",
      bold: "Gras",
      italic: "Italique",
      strikethrough: "Barr\xE9",
      subscript: "Indice",
      superscript: "Exposant",
      underline: "Souligner",
      textColor: {
        main: "Couleur du texte",
        right: "Choisir la couleur"
      },
      resetColor: "R\xE9initialiser",
      fillColor: {
        main: "Couleur de remplissage",
        right: "Choisir la couleur"
      },
      border: {
        main: "Bordure",
        right: "Style de bordure"
      },
      mergeCell: {
        main: "Fusionner les cellules",
        right: "Choisir le type de fusion"
      },
      horizontalAlignMode: {
        main: "Alignement horizontal",
        right: "Alignement"
      },
      verticalAlignMode: {
        main: "Alignement vertical",
        right: "Alignement"
      },
      textWrapMode: {
        main: "Renvoi \xE0 la ligne",
        right: "Mode de renvoi \xE0 la ligne"
      },
      textRotateMode: {
        main: "Rotation du texte",
        right: "Mode de rotation du texte"
      },
      more: "Plus",
      toggleGridlines: "Activer/d\xE9sactiver le quadrillage",
      textToNumber: "Texte en nombre"
    },
    align: {
      left: "gauche",
      center: "centre",
      right: "droite",
      top: "haut",
      middle: "milieu",
      bottom: "bas"
    },
    button: {
      confirm: "OK",
      cancel: "Annuler",
      close: "Fermer",
      insert: "Ins\xE9rer",
      prevPage: "Pr\xE9c\xE9dent",
      nextPage: "Suivant",
      total: "total :"
    },
    borderLine: {
      borderTop: "bordureHaut",
      borderBottom: "bordureBas",
      borderLeft: "bordureGauche",
      borderRight: "bordureDroite",
      borderNone: "aucuneBordure",
      borderAll: "toutesLesBordures",
      borderOutside: "bordureExt\xE9rieure",
      borderInside: "bordureInt\xE9rieure",
      borderHorizontal: "bordureHorizontale",
      borderVertical: "bordureVerticale",
      borderColor: "couleurDeBordure",
      borderSize: "tailleDeBordure",
      borderType: "typeDeBordure"
    },
    merge: {
      all: "Tout fusionner",
      vertical: "Fusion verticale",
      horizontal: "Fusion horizontale",
      cancel: "Annuler la fusion",
      overlappingError: "Impossible de fusionner des zones qui se chevauchent",
      partiallyError: "Impossible d'effectuer cette op\xE9ration sur des cellules partiellement fusionn\xE9es"
    },
    filter: {},
    textWrap: {
      overflow: "D\xE9bordement",
      wrap: "Renvoi \xE0 la ligne",
      clip: "Couper"
    },
    textRotate: {
      none: "Aucun",
      angleUp: "Incliner vers le haut",
      angleDown: "Incliner vers le bas",
      vertical: "Empiler verticalement",
      rotationUp: "Pivoter vers le haut",
      rotationDown: "Pivoter vers le bas"
    },
    sheetConfig: {
      delete: "Supprimer",
      copy: "Copier",
      rename: "Renommer",
      changeColor: "Changer la couleur",
      hide: "Masquer",
      unhide: "Afficher",
      moveLeft: "D\xE9placer \xE0 gauche",
      moveRight: "D\xE9placer \xE0 droite",
      resetColor: "R\xE9initialiser la couleur",
      cancelText: "Annuler",
      chooseText: "Confirmer la couleur",
      tipNameRepeat: "Le nom de l'onglet ne peut pas \xEAtre r\xE9p\xE9t\xE9 ! Veuillez modifier",
      noMoreSheet: "Le classeur contient au moins une feuille de calcul visible. Pour supprimer la feuille s\xE9lectionn\xE9e, veuillez ins\xE9rer une nouvelle feuille ou afficher une feuille masqu\xE9e.",
      confirmDelete: "\xCAtes-vous s\xFBr de vouloir supprimer",
      redoDelete: "Peut \xEAtre annul\xE9 par Ctrl+Z",
      noHide: "Impossible de masquer, au moins une \xE9tiquette de feuille doit \xEAtre conserv\xE9e",
      chartEditNoOpt: "Cette op\xE9ration n'est pas autoris\xE9e en mode d'\xE9dition de graphique !",
      sheetNameErrorTitle: "Il y a eu un probl\xE8me",
      sheetNameSpecCharError: "Le nom ne peut pas d\xE9passer 31 caract\xE8res, ne peut pas commencer ou se terminer par ', et ne peut pas contenir : [ ] : \\ ? * /",
      sheetNameCannotIsEmptyError: "Le nom de la feuille ne peut pas \xEAtre vide.",
      sheetNameAlreadyExistsError: "Le nom de la feuille existe d\xE9j\xE0. Veuillez entrer un autre nom.",
      deleteSheet: "Supprimer la feuille de calcul",
      deleteSheetContent: "Confirmer la suppression de cette feuille de calcul ?",
      deleteLargeSheetContent: "Confirmer la suppression de cette feuille de calcul. Elle ne pourra pas \xEAtre r\xE9cup\xE9r\xE9e apr\xE8s suppression. \xCAtes-vous s\xFBr de vouloir la supprimer ?",
      addProtectSheet: "Prot\xE9ger la feuille de calcul",
      removeProtectSheet: "D\xE9prot\xE9ger la feuille de calcul",
      changeSheetPermission: "Modifier les autorisations de la feuille de calcul",
      viewAllProtectArea: "Voir toutes les zones de protection"
    },
    rightClick: {
      copy: "Copier",
      cut: "Couper",
      paste: "Coller",
      copySpecial: "Collage sp\xE9cial",
      pasteSpecial: "Collage sp\xE9cial",
      pasteValue: "Coller la valeur",
      pasteFormat: "Coller le format",
      pasteColWidth: "Coller la largeur de la colonne",
      pasteBesidesBorder: "Coller \xE0 c\xF4t\xE9 des styles de bordure",
      insert: "Ins\xE9rer",
      insertRow: "Ins\xE9rer une ligne",
      insertRowBefore: "Ins\xE9rer une ligne avant",
      insertRowsAfter: "Ins\xE9rer",
      insertRowsAbove: "Ins\xE9rer",
      insertRowsAfterSuffix: "lignes apr\xE8s",
      insertRowsAboveSuffix: "lignes au-dessus",
      insertColumn: "Ins\xE9rer une colonne",
      insertColumnBefore: "Ins\xE9rer une colonne avant",
      insertColsLeft: "Ins\xE9rer",
      insertColsRight: "Ins\xE9rer",
      insertColsLeftSuffix: "colonnes \xE0 gauche",
      insertColsRightSuffix: "colonnes \xE0 droite",
      delete: "Supprimer",
      deleteCell: "Supprimer la cellule",
      insertCell: "Ins\xE9rer une cellule",
      deleteSelected: "Supprimer la s\xE9lection",
      hide: "Masquer",
      hideSelected: "Masquer la s\xE9lection",
      showHide: "Afficher les masqu\xE9s",
      toTopAdd: "Ajouter vers le haut",
      toBottomAdd: "Ajouter vers le bas",
      toLeftAdd: "Ajouter vers la gauche",
      toRightAdd: "Ajouter vers la droite",
      deleteSelectedRow: "Supprimer la ligne s\xE9lectionn\xE9e",
      deleteSelectedColumn: "Supprimer la colonne s\xE9lectionn\xE9e",
      hideSelectedRow: "Masquer la ligne s\xE9lectionn\xE9e",
      showHideRow: "Afficher la ligne s\xE9lectionn\xE9e",
      rowHeight: "Hauteur de ligne",
      hideSelectedColumn: "Masquer la colonne s\xE9lectionn\xE9e",
      showHideColumn: "Afficher/Masquer la colonne",
      columnWidth: "Largeur de colonne",
      moveLeft: "D\xE9placer \xE0 gauche",
      moveUp: "D\xE9placer vers le haut",
      moveRight: "D\xE9placer \xE0 droite",
      moveDown: "D\xE9placer vers le bas",
      add: "Ajouter",
      row: "Ligne",
      column: "Colonne",
      confirm: "Confirmer",
      clearSelection: "Effacer",
      clearContent: "Effacer le contenu",
      clearFormat: "Effacer les formats",
      clearAll: "Tout effacer",
      root: "Racine",
      log: "Logarithme",
      delete0: "Supprimer les valeurs 0 aux deux extr\xE9mit\xE9s",
      removeDuplicate: "Supprimer les valeurs en double",
      byRow: "Par ligne",
      byCol: "Par colonne",
      generateNewMatrix: "G\xE9n\xE9rer une nouvelle matrice",
      fitContent: "Adapter au contenu",
      freeze: "Figer",
      freezeCell: "Figer jusqu'\xE0 la cellule active ({0} ligne {1} colonne)",
      freezeCol: "Figer jusqu'\xE0 la colonne {0}",
      freezeRow: "Figer jusqu'\xE0 la ligne {0}",
      freezeFirstCol: "Figer la premi\xE8re colonne",
      freezeFirstRow: "Figer la premi\xE8re ligne",
      cancelFreeze: "Annuler le figement",
      deleteAllRowsAlert: "Vous ne pouvez pas supprimer toutes les lignes de la feuille",
      deleteAllColumnsAlert: "Vous ne pouvez pas supprimer toutes les colonnes de la feuille",
      hideAllRowsAlert: "Vous ne pouvez pas masquer toutes les lignes de la feuille",
      hideAllColumnsAlert: "Vous ne pouvez pas masquer toutes les colonnes de la feuille",
      protectRange: "Prot\xE9ger les lignes et les colonnes",
      editProtectRange: "D\xE9finir la plage de protection",
      removeProtectRange: "Supprimer la plage de protection",
      turnOnProtectRange: "Ajouter une plage de protection",
      viewAllProtectArea: "Voir toutes les zones de protection",
      textToNumber: "Texte en nombre"
    },
    info: {
      notChangeMerge: "Vous ne pouvez pas apporter de modifications partielles aux cellules fusionn\xE9es",
      detailUpdate: "Nouvellement ouvert",
      detailSave: "Cache local restaur\xE9",
      row: "Ligne",
      column: "Colonne",
      loading: "Chargement...",
      copy: "Copier",
      return: "Quitter",
      rename: "Renommer",
      tips: "Renommer",
      noName: "Feuille de calcul sans titre",
      wait: "en attente de mise \xE0 jour",
      add: "Ajouter",
      addLast: "plus de lignes en bas",
      backTop: "Retour en haut",
      nextPage: "Suivant",
      tipInputNumber: "Veuillez entrer le nombre",
      tipInputNumberLimit: "L'augmentatiion de la plage est limit\xE9e \xE0 1-100",
      tipRowHeightLimit: "La hauteur de la ligne doit \xEAtre comprise entre 0 et 545",
      tipColumnWidthLimit: "La largeur de la colonne doit \xEAtre comprise entre 0 et 2038",
      problem: "Il y a eu un probl\xE8me"
    },
    clipboard: {
      paste: {
        exceedMaxCells: "Le nombre de cellules coll\xE9es d\xE9passe le nombre maximum de cellules",
        overlappingMergedCells: "La zone de collage chevauche des cellules fusionn\xE9es"
      },
      shortCutNotify: {
        title: "Veuillez coller en utilisant les raccourcis clavier.",
        useShortCutInstead: "Contenu Excel d\xE9tect\xE9. Utilisez le raccourci clavier pour coller."
      }
    },
    statusbar: {
      sum: "Somme",
      average: "Moyenne",
      min: "Min",
      max: "Max",
      count: "Nombre num\xE9rique",
      countA: "Nombre",
      clickToCopy: "Cliquez pour copier",
      copied: "Copi\xE9"
    },
    shortcut: {
      "sheet-view": "Sheet View",
      "sheet-edit": "Sheet Edit",
      sheet: {
        "zoom-in": "Zoom avant",
        "zoom-out": "Zoom arri\xE8re",
        "reset-zoom": "R\xE9initialiser le niveau de zoom",
        "select-below-cell": "S\xE9lectionner la cellule en dessous",
        "select-up-cell": "S\xE9lectionner la cellule au-dessus",
        "select-left-cell": "S\xE9lectionner la cellule \xE0 gauche",
        "select-right-cell": "S\xE9lectionner la cellule \xE0 droite",
        "select-next-cell": "S\xE9lectionner la cellule suivante",
        "select-previous-cell": "S\xE9lectionner la cellule pr\xE9c\xE9dente",
        "select-up-value-cell": "S\xE9lectionner la cellule au-dessus qui a une valeur",
        "select-below-value-cell": "S\xE9lectionner la cellule en dessous qui a une valeur",
        "select-left-value-cell": "S\xE9lectionner la cellule \xE0 gauche qui a une valeur",
        "select-right-value-cell": "S\xE9lectionner la cellule \xE0 droite qui a une valeur",
        "expand-selection-down": "\xC9tendre la s\xE9lection vers le bas",
        "expand-selection-up": "\xC9tendre la s\xE9lection vers le haut",
        "expand-selection-left": "\xC9tendre la s\xE9lection vers la gauche",
        "expand-selection-right": "\xC9tendre la s\xE9lection vers la droite",
        "expand-selection-to-left-gap": "\xC9tendre la s\xE9lection jusqu'\xE0 l'\xE9cart \xE0 gauche",
        "expand-selection-to-below-gap": "\xC9tendre la s\xE9lection jusqu'\xE0 l'\xE9cart en dessous",
        "expand-selection-to-right-gap": "\xC9tendre la s\xE9lection jusqu'\xE0 l'\xE9cart \xE0 droite",
        "expand-selection-to-up-gap": "\xC9tendre la s\xE9lection jusqu'\xE0 l'\xE9cart en haut",
        "select-all": "Tout s\xE9lectionner",
        "toggle-editing": "Basculer en mode \xE9dition",
        "delete-and-start-editing": "Effacer et commencer \xE0 \xE9diter",
        "abort-editing": "Annuler l'\xE9dition",
        "break-line": "Saut de ligne",
        "set-bold": "Basculer en gras",
        "start-editing": "Commencer l'\xE9dition (S\xE9lection dans l'\xE9diteur)",
        "repeat-last-action": "R\xE9p\xE9ter la derni\xE8re action",
        "set-italic": "Basculer en italique",
        "set-underline": "Basculer en soulign\xE9",
        "set-strike-through": "Basculer en barr\xE9"
      }
    },
    definedName: {
      managerTitle: "G\xE9rer les noms d\xE9finis",
      managerDescription: "Cr\xE9ez un nom d\xE9fini en s\xE9lectionnant des cellules ou des formules, et en entrant le nom souhait\xE9 dans la zone de texte.",
      addButton: "Ajouter un nom d\xE9fini",
      featureTitle: "Noms d\xE9finis",
      ratioRange: "Plage",
      ratioFormula: "Formule",
      confirm: "Confirmer",
      cancel: "Annuler",
      scopeWorkbook: "Classeur",
      inputNamePlaceholder: "Veuillez entrer un nom (espace non autoris\xE9)",
      inputCommentPlaceholder: "Veuillez entrer un commentaire",
      inputRangePlaceholder: "Veuillez entrer une plage (espace non autoris\xE9)",
      inputFormulaPlaceholder: "Veuillez entrer une formule (espace non autoris\xE9)",
      formulaOrRefStringInvalid: "Formule ou cha\xEEne de r\xE9f\xE9rence invalide",
      defaultName: "NomD\xE9fini",
      updateButton: "Mettre \xE0 jour",
      deleteButton: "Supprimer",
      deleteConfirmText: "\xCAtes-vous s\xFBr de vouloir supprimer ce nom d\xE9fini?"
    },
    uploadLoading: {
      loading: "Chargement..., restant"
    },
    "data-validation": {
      alert: {
        ok: "OK"
      },
      list: {
        edit: "Modifier",
        dropdown: "S\xE9lectionnez un \xE9l\xE9ment"
      },
      listMultiple: {
        dropdown: "S\xE9lectionnez des \xE9l\xE9ments"
      }
    },
    permission: {
      toolbarMenu: "Protection",
      panel: {
        title: "Prot\xE9ger les lignes et les colonnes",
        name: "Nom",
        protectedRange: "Plage prot\xE9g\xE9e",
        permissionDirection: "Description des permissions",
        permissionDirectionPlaceholder: "Entrez la description des permissions",
        editPermission: "Modifier les permissions",
        onlyICanEdit: "Seul moi peut modifier",
        designedUserCanEdit: "Utilisateurs sp\xE9cifi\xE9s peuvent modifier",
        viewPermission: "Voir les permissions",
        othersCanView: "Les autres peuvent voir",
        noOneElseCanView: "Personne d'autre ne peut voir",
        designedPerson: "Personnes sp\xE9cifi\xE9es",
        addPerson: "Ajouter une personne",
        canEdit: "Peut modifier",
        canView: "Peut voir",
        delete: "Supprimer",
        currentSheet: "Feuille actuelle",
        allSheet: "Toutes les feuilles",
        edit: "Modifier",
        Print: "Imprimer",
        Comment: "Commenter",
        Copy: "Copier",
        SetCellStyle: "D\xE9finir le style de cellule",
        SetCellValue: "D\xE9finir la valeur de la cellule",
        SetHyperLink: "D\xE9finir le lien hypertexte",
        Sort: "Trier",
        Filter: "Filtrer",
        PivotTable: "Tableau crois\xE9 dynamique",
        FloatImage: "Image flottante",
        RowHeightColWidth: "Hauteur de ligne et largeur de colonne",
        RowHeightColWidthReadonly: "Hauteur de ligne et largeur de colonne en lecture seule",
        FilterReadonly: "Filtre en lecture seule",
        nameError: "Le nom ne peut pas \xEAtre vide",
        created: "Cr\xE9\xE9",
        iCanEdit: "Je peux modifier",
        iCanNotEdit: "Je ne peux pas modifier",
        iCanView: "Je peux voir",
        iCanNotView: "Je ne peux pas voir",
        emptyRangeError: "La plage ne peut pas \xEAtre vide",
        rangeOverlapError: "La plage ne peut pas se chevaucher",
        rangeOverlapOverPermissionError: "La plage ne peut pas se chevaucher avec la plage ayant la m\xEAme permission",
        InsertHyperlink: "Ins\xE9rer un lien hypertexte",
        SetRowStyle: "D\xE9finir le style de ligne",
        SetColumnStyle: "D\xE9finir le style de colonne",
        InsertColumn: "Ins\xE9rer une colonne",
        InsertRow: "Ins\xE9rer une ligne",
        DeleteRow: "Supprimer la ligne",
        DeleteColumn: "Supprimer la colonne",
        EditExtraObject: "Modifier l'objet suppl\xE9mentaire"
      },
      dialog: {
        allowUserToEdit: "Autoriser l'utilisateur \xE0 modifier",
        allowedPermissionType: "Types de permissions autoris\xE9es",
        setCellValue: "D\xE9finir la valeur de la cellule",
        setCellStyle: "D\xE9finir le style de cellule",
        copy: "Copier",
        alert: "Alerte",
        search: "Rechercher",
        ownerInherit: "Propri\xE9taire du document, h\xE9ritage des permissions activ\xE9",
        ownerWithoutInherit: "Propri\xE9taire du document, h\xE9ritage des permissions non activ\xE9",
        alertContent: "Cette plage est prot\xE9g\xE9e et aucune permission de modification n'est actuellement disponible. Si vous avez besoin de modifier, veuillez contacter le cr\xE9ateur.",
        userEmpty: "aucune personne d\xE9sign\xE9e, Partagez le lien pour inviter des personnes sp\xE9cifiques.",
        listEmpty: "Vous n'avez d\xE9fini aucune plage ou feuille comme prot\xE9g\xE9e.",
        commonErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission pour cette op\xE9ration. Pour modifier, veuillez contacter le cr\xE9ateur.",
        editErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de modifier. Pour modifier, veuillez contacter le cr\xE9ateur.",
        pasteErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de coller. Pour coller, veuillez contacter le cr\xE9ateur.",
        setStyleErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9finir les styles. Pour d\xE9finir les styles, veuillez contacter le cr\xE9ateur.",
        copyErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de copier. Pour copier, veuillez contacter le cr\xE9ateur.",
        workbookCopyErr: "Le classeur est prot\xE9g\xE9, et vous n'avez pas la permission de copier. Pour copier, veuillez contacter le cr\xE9ateur.",
        setRowColStyleErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9finir les styles de ligne et de colonne. Pour d\xE9finir les styles de ligne et de colonne, veuillez contacter le cr\xE9ateur.",
        moveRowColErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9placer les lignes et les colonnes. Pour d\xE9placer les lignes et les colonnes, veuillez contacter le cr\xE9ateur.",
        moveRangeErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9placer la s\xE9lection. Pour d\xE9placer la s\xE9lection, veuillez contacter le cr\xE9ateur.",
        insertRowColErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission d'ins\xE9rer des lignes et des colonnes. Pour ins\xE9rer des lignes et des colonnes, veuillez contacter le cr\xE9ateur.",
        removeRowColErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de supprimer les lignes et les colonnes. Pour supprimer les lignes et les colonnes, veuillez contacter le cr\xE9ateur.",
        autoFillErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission pour le remplissage automatique. Pour utiliser le remplissage automatique, veuillez contacter le cr\xE9ateur.",
        filterErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de filtrer. Pour filtrer, veuillez contacter le cr\xE9ateur.",
        operatorSheetErr: "La feuille de calcul est prot\xE9g\xE9e, et vous n'avez pas la permission de travailler sur la feuille de calcul. Pour travailler sur la feuille de calcul, veuillez contacter le cr\xE9ateur.",
        insertOrDeleteMoveRangeErr: "La plage ins\xE9r\xE9e ou supprim\xE9e intersecte la plage prot\xE9g\xE9e, et cette op\xE9ration n'est pas support\xE9e pour le moment.",
        printErr: "La feuille de calcul est prot\xE9g\xE9e, et vous n'avez pas la permission d'imprimer. Pour imprimer, veuillez contacter le cr\xE9ateur.",
        formulaErr: "La plage ou la plage r\xE9f\xE9renc\xE9e est prot\xE9g\xE9e, et vous n'avez pas la permission de modifier. Pour modifier, veuillez contacter le cr\xE9ateur.",
        hyperLinkErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de d\xE9finir des liens hypertextes. Pour d\xE9finir des liens hypertextes, veuillez contacter le cr\xE9ateur.",
        commentErr: "La plage est prot\xE9g\xE9e, et vous n'avez pas la permission de commenter. Pour commenter, veuillez contacter le cr\xE9ateur."
      },
      button: {
        confirm: "Confirmer",
        cancel: "Annuler",
        addNewPermission: "Ajouter une nouvelle permission"
      }
    }
  }
};
var fr_FR_default44 = locale44;

// ../packages/sheets-zen-editor/src/locale/fr-FR.ts
var locale45 = {
  "sheets-zen-editor": {
    rightClick: {
      zenEditor: "\xC9diteur plein \xE9cran"
    },
    shortcut: {
      sheet: {
        "zen-edit-cancel": "Annuler l'\xE9dition plein \xE9cran",
        "zen-edit-confirm": "Confirmer l'\xE9dition plein \xE9cran"
      }
    }
  }
};
var fr_FR_default45 = locale45;

// ../packages/slides-ui/src/locale/fr-FR.ts
var locale46 = {
  "slides-ui": {
    append: "Ajouter une diapositive",
    text: {
      insert: {
        title: "Ins\xE9rer du texte"
      }
    },
    shape: {
      insert: {
        title: "Ins\xE9rer une forme",
        rectangle: "Ins\xE9rer un rectangle",
        ellipse: "Ins\xE9rer une ellipse"
      }
    },
    image: {
      insert: {
        title: "Ins\xE9rer une image",
        float: "Ins\xE9rer une image flottante"
      }
    },
    popup: {
      edit: "\xC9diter",
      delete: "Supprimer"
    },
    sidebar: {
      text: "\xC9diter le texte",
      shape: "\xC9diter la forme",
      image: "\xC9diter l'image"
    },
    "image-panel": {
      arrange: {
        title: "Arranger",
        forward: "Avancer",
        backward: "Reculer",
        front: "Mettre au premier plan",
        back: "Mettre \xE0 l'arri\xE8re-plan"
      },
      transform: {
        title: "Transformer",
        width: "Largeur (px)",
        height: "Hauteur (px)",
        x: "X (px)",
        y: "Y (px)",
        rotate: "Pivoter (\xB0)"
      }
    },
    panel: {
      fill: {
        title: "Couleur de remplissage"
      }
    }
  }
};
var fr_FR_default46 = locale46;

// ../packages/thread-comment-ui/src/locale/fr-FR.ts
var locale47 = {
  "thread-comment-ui": {
    panel: {
      title: "Gestion des commentaires",
      empty: "Pas encore de commentaires",
      filterEmpty: "Aucun r\xE9sultat correspondant",
      reset: "R\xE9initialiser le filtre",
      addComment: "Ajouter un commentaire",
      solved: "R\xE9solu"
    },
    editor: {
      placeholder: "R\xE9pondre ou ajouter d'autres avec @",
      reply: "Commenter",
      cancel: "Annuler",
      save: "Enregistrer"
    },
    item: {
      edit: "Modifier",
      delete: "Supprimer ce commentaire"
    },
    filter: {
      sheet: {
        all: "Toutes les feuilles",
        current: "Feuille actuelle"
      },
      status: {
        all: "Tous les commentaires",
        resolved: "R\xE9solu",
        unsolved: "Non r\xE9solu",
        concernMe: "Me concerne"
      }
    }
  }
};
var fr_FR_default47 = locale47;

// ../packages/ui/src/locale/fr-FR.ts
var locale48 = {
  ui: {
    toolbar: {
      heading: {
        normal: "Normal",
        title: "Titre",
        subTitle: "Sous-titre",
        1: "Titre 1",
        2: "Titre 2",
        3: "Titre 3",
        4: "Titre 4",
        5: "Titre 5",
        6: "Titre 6",
        tooltip: "D\xE9finir un titre"
      }
    },
    ribbon: {
      start: "D\xE9marrer",
      startDesc: "Initialiser la feuille de calcul et d\xE9finir les param\xE8tres de base.",
      insert: "Ins\xE9rer",
      insertDesc: "Ins\xE9rer des lignes, des colonnes, des graphiques et divers autres \xE9l\xE9ments.",
      formulas: "Formules",
      formulasDesc: "Utiliser des fonctions et des formules pour les calculs de donn\xE9es.",
      data: "Donn\xE9es",
      dataDesc: "G\xE9rer les donn\xE9es, y compris l'importation, le tri et le filtrage.",
      view: "Vue",
      viewDesc: "Changer les modes d'affichage et ajuster l'effet d'affichage.",
      others: "Autres",
      othersDesc: "Autres fonctions et param\xE8tres.",
      more: "Plus"
    },
    fontFamily: {
      "not-supported": "Aucune police de ce type trouv\xE9e dans le syst\xE8me, utilisation de la police par d\xE9faut.",
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
      title: "Raccourcis"
    },
    shortcut: {
      undo: "Annuler",
      redo: "Refaire",
      cut: "Couper",
      copy: "Copier",
      paste: "Coller",
      "shortcut-panel": "Basculer le panneau de raccourcis"
    },
    "common-edit": "Raccourcis d'\xE9dition courants",
    "toggle-shortcut-panel": "Basculer le panneau de raccourcis",
    clipboard: {
      authentication: {
        title: "Permission refus\xE9e",
        content: "Veuillez autoriser Univer \xE0 acc\xE9der \xE0 votre presse-papiers."
      }
    },
    textEditor: {
      formulaError: "Veuillez entrer une formule valide, telle que =SOMME(A1)",
      rangeError: "Veuillez entrer une plage valide, telle que A1:B10"
    },
    rangeSelector: {
      title: "S\xE9lectionner une plage de donn\xE9es",
      addAnotherRange: "Ajouter une plage",
      buttonTooltip: "S\xE9lectionner une plage de donn\xE9es",
      placeHolder: "S\xE9lectionner une plage ou entrer.",
      confirm: "Confirmer",
      cancel: "Annuler"
    },
    "global-shortcut": "Raccourci global",
    "zoom-slider": {
      resetTo: "R\xE9initialiser \xE0"
    },
    row: "Ligne",
    column: "Colonne"
  }
};
var fr_FR_default48 = locale48;

// ../packages/uniscript/src/locale/fr-FR.ts
var locale49 = {
  uniscript: {
    title: "Uniscript",
    tooltip: {
      "menu-button": "Basculer le panneau Uniscript"
    },
    panel: {
      execute: "Ex\xE9cuter le script"
    },
    message: {
      success: "Ex\xE9cution r\xE9ussie",
      failed: "\xC9chec de l'ex\xE9cution"
    }
  }
};
var fr_FR_default49 = locale49;

// ../common/mockdata/src/locales/fr-FR.ts
var fr_FR_default50 = mergeLocales(
  fr_FR_default,
  fr_FR_default2,
  fr_FR_default3,
  fr_FR_default4,
  fr_FR_default5,
  fr_FR_default6,
  fr_FR_default7,
  fr_FR_default8,
  fr_FR_default9,
  fr_FR_default10,
  fr_FR_default11,
  fr_FR_default12,
  fr_FR_default13,
  fr_FR_default14,
  fr_FR_default15,
  fr_FR_default16,
  fr_FR_default17,
  fr_FR_default18,
  fr_FR_default34,
  fr_FR_default35,
  fr_FR_default36,
  fr_FR_default37,
  fr_FR_default38,
  fr_FR_default39,
  fr_FR_default40,
  fr_FR_default41,
  fr_FR_default42,
  fr_FR_default43,
  fr_FR_default44,
  fr_FR_default45,
  fr_FR_default46,
  fr_FR_default47,
  fr_FR_default48,
  fr_FR_default49
);

export {
  fr_FR_default50 as fr_FR_default
};
