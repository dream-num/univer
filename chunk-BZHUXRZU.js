import {
  mergeLocales
} from "./chunk-EJSPXROI.js";

// ../packages/action-recorder/src/locale/es-ES.ts
var locale = {
  "action-recorder": {
    menu: {
      title: "Grabar acciones",
      record: "Grabar acciones...",
      "replay-local": "Reemplazar grabaci\xF3n local...",
      "replay-local-name": "Reemplazar grabaci\xF3n local por subunidad...",
      "replay-local-active": "Reemplazar grabaci\xF3n local por subunidad actual..."
    }
  }
};
var es_ES_default = locale;

// ../packages/data-validation/src/locale/es-ES.ts
var locale2 = {
  "data-validation": {
    operators: {
      between: "entre",
      greaterThan: "mayor que",
      greaterThanOrEqual: "mayor o igual que",
      lessThan: "menor que",
      lessThanOrEqual: "menor o igual que",
      equal: "igual",
      notEqual: "no igual",
      notBetween: "no entre",
      legal: "es tipo legal"
    },
    ruleName: {
      between: "Est\xE1 entre {FORMULA1} y {FORMULA2}",
      greaterThan: "Es mayor que {FORMULA1}",
      greaterThanOrEqual: "Es mayor o igual que {FORMULA1}",
      lessThan: "Es menor que {FORMULA1}",
      lessThanOrEqual: "Es menor o igual que {FORMULA1}",
      equal: "Es igual a {FORMULA1}",
      notEqual: "No es igual a {FORMULA1}",
      notBetween: "No est\xE1 entre {FORMULA1} y {FORMULA2}",
      legal: "Es un {TYPE} legal"
    },
    errorMsg: {
      between: "El valor debe estar entre {FORMULA1} y {FORMULA2}",
      greaterThan: "El valor debe ser mayor que {FORMULA1}",
      greaterThanOrEqual: "El valor debe ser mayor o igual que {FORMULA1}",
      lessThan: "El valor debe ser menor que {FORMULA1}",
      lessThanOrEqual: "El valor debe ser menor o igual que {FORMULA1}",
      equal: "El valor debe ser igual a {FORMULA1}",
      notEqual: "El valor no debe ser igual a {FORMULA1}",
      notBetween: "El valor no debe estar entre {FORMULA1} y {FORMULA2}",
      legal: "El valor debe ser un {TYPE} legal"
    },
    date: {
      operators: {
        between: "entre",
        greaterThan: "despu\xE9s de",
        greaterThanOrEqual: "en o despu\xE9s de",
        lessThan: "antes de",
        lessThanOrEqual: "en o antes de",
        equal: "igual",
        notEqual: "no igual",
        notBetween: "no entre",
        legal: "es una fecha legal"
      },
      ruleName: {
        between: "est\xE1 entre {FORMULA1} y {FORMULA2}",
        greaterThan: "es despu\xE9s de {FORMULA1}",
        greaterThanOrEqual: "es en o despu\xE9s de {FORMULA1}",
        lessThan: "es antes de {FORMULA1}",
        lessThanOrEqual: "es en o antes de {FORMULA1}",
        equal: "es {FORMULA1}",
        notEqual: "no es {FORMULA1}",
        notBetween: "no est\xE1 entre {FORMULA1}",
        legal: "es una fecha legal"
      },
      errorMsg: {
        between: "El valor debe ser una fecha legal y estar entre {FORMULA1} y {FORMULA2}",
        greaterThan: "El valor debe ser una fecha legal y despu\xE9s de {FORMULA1}",
        greaterThanOrEqual: "El valor debe ser una fecha legal y en o despu\xE9s de {FORMULA1}",
        lessThan: "El valor debe ser una fecha legal y antes de {FORMULA1}",
        lessThanOrEqual: "El valor debe ser una fecha legal y en o antes de {FORMULA1}",
        equal: "El valor debe ser una fecha legal y {FORMULA1}",
        notEqual: "El valor debe ser una fecha legal y no {FORMULA1}",
        notBetween: "El valor debe ser una fecha legal y no estar entre {FORMULA1}",
        legal: "El valor debe ser una fecha legal"
      },
      title: "Fecha"
    },
    textLength: {
      errorMsg: {
        between: "La longitud del texto debe estar entre {FORMULA1} y {FORMULA2}",
        greaterThan: "La longitud del texto debe ser mayor que {FORMULA1}",
        greaterThanOrEqual: "La longitud del texto debe ser mayor o igual que {FORMULA1}",
        lessThan: "La longitud del texto debe ser menor que {FORMULA1}",
        lessThanOrEqual: "La longitud del texto debe ser menor o igual que {FORMULA1}",
        equal: "La longitud del texto debe ser {FORMULA1}",
        notEqual: "La longitud del texto no debe ser {FORMULA1}",
        notBetween: "La longitud del texto no debe estar entre {FORMULA1}"
      },
      title: "Longitud del texto"
    },
    custom: {
      ruleName: "La f\xF3rmula personalizada es {FORMULA1}",
      title: "F\xF3rmula personalizada",
      validFail: "Por favor, introduce una f\xF3rmula v\xE1lida",
      error: "El contenido de esta celda viola su regla de validaci\xF3n"
    },
    validFail: {
      value: "Por favor, introduce un valor",
      common: "Por favor, introduce un valor o f\xF3rmula",
      number: "Por favor, introduce un n\xFAmero o f\xF3rmula",
      formula: "Por favor, introduce una f\xF3rmula",
      integer: "Por favor, introduce un entero o f\xF3rmula",
      date: "Por favor, introduce una fecha o f\xF3rmula",
      list: "Por favor, introduce opciones",
      listInvalid: "La fuente de la lista debe ser una lista delimitada o una referencia a una sola fila o columna",
      checkboxEqual: "Introduce valores diferentes para los contenidos de celda marcados y desmarcados.",
      formulaError: "El rango de referencia contiene datos invisibles, ajusta el rango",
      listIntersects: "El rango seleccionado no puede cruzarse con el \xE1mbito de las reglas",
      primitive: "No se permiten f\xF3rmulas para valores personalizados marcados y desmarcados."
    },
    any: {
      title: "Cualquier valor",
      error: "El contenido de esta celda viola la regla de validaci\xF3n"
    },
    list: {
      title: "Desplegable",
      name: "El valor contiene uno del rango",
      error: "La entrada debe estar dentro del rango especificado",
      emptyError: "Por favor, introduce un valor",
      add: "A\xF1adir",
      dropdown: "Seleccionar",
      options: "Opciones",
      customOptions: "Personalizado",
      refOptions: "De un rango",
      formulaError: "La fuente de la lista debe ser una lista delimitada de datos o una referencia a una sola fila o columna.",
      edit: "Editar"
    },
    listMultiple: {
      title: "Desplegable-m\xFAltiple",
      dropdown: "Selecci\xF3n m\xFAltiple"
    },
    decimal: {
      title: "N\xFAmero"
    },
    whole: {
      title: "Entero"
    },
    checkbox: {
      title: "Casilla de verificaci\xF3n",
      error: "El contenido de esta celda viola su regla de validaci\xF3n",
      tips: "Usa valores personalizados dentro de las celdas",
      checked: "Valor seleccionado",
      unchecked: "Valor no seleccionado"
    }
  }
};
var es_ES_default2 = locale2;

// ../packages/design/src/locale/es-ES.ts
var locale3 = {
  design: {
    Confirm: {
      cancel: "cancel\xB7la",
      confirm: "ok"
    },
    CascaderList: {
      empty: "Cap"
    },
    Calendar: {
      year: "",
      weekDays: ["Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"],
      months: [
        "Gener",
        "Febrer",
        "Mar\xE7",
        "Abril",
        "Maig",
        "Juny",
        "Juliol",
        "Agost",
        "Setembre",
        "Octubre",
        "Novembre",
        "Desembre"
      ]
    },
    Select: {
      empty: "Cap"
    },
    ColorPicker: {
      more: "M\xE9s colors",
      cancel: "cancel\xB7la",
      confirm: "ok"
    },
    GradientColorPicker: {
      linear: "Lineal",
      radial: "Radial",
      angular: "Angular",
      diamond: "Diamant",
      offset: "Despla\xE7ament",
      angle: "Angle",
      flip: "Girar",
      delete: "Eliminar"
    }
  }
};
var es_ES_default3 = locale3;

// ../packages/docs-drawing-ui/src/locale/es-ES.ts
var locale4 = {
  "docs-drawing-ui": {
    title: "Imagen",
    upload: {
      float: "Insertar imagen"
    },
    panel: {
      title: "Editar imagen"
    },
    "image-popup": {
      replace: "Reemplazar",
      delete: "Eliminar",
      edit: "Editar",
      crop: "Recortar",
      reset: "Restablecer tama\xF1o"
    },
    "image-text-wrap": {
      title: "Ajuste de texto",
      wrappingStyle: "Estilo de ajuste",
      square: "Cuadrado",
      topAndBottom: "Arriba y abajo",
      inline: "En l\xEDnea con el texto",
      behindText: "Detr\xE1s del texto",
      inFrontText: "Delante del texto",
      wrapText: "Ajustar texto",
      bothSide: "Ambos lados",
      leftOnly: "Solo izquierda",
      rightOnly: "Solo derecha",
      distanceFromText: "Distancia del texto",
      top: "Arriba(px)",
      left: "Izquierda(px)",
      bottom: "Abajo(px)",
      right: "Derecha(px)"
    },
    "image-position": {
      title: "Posici\xF3n",
      horizontal: "Horizontal",
      vertical: "Vertical",
      absolutePosition: "Posici\xF3n absoluta(px)",
      relativePosition: "Posici\xF3n relativa",
      toTheRightOf: "a la derecha de",
      relativeTo: "relativo a",
      bellow: "debajo",
      options: "Opciones",
      moveObjectWithText: "Mover objeto con el texto",
      column: "Columna",
      margin: "Margen",
      page: "P\xE1gina",
      line: "L\xEDnea",
      paragraph: "P\xE1rrafo"
    },
    "update-status": {
      exceedMaxSize: "El tama\xF1o de la imagen excede el l\xEDmite, el l\xEDmite es {0}M",
      invalidImageType: "Tipo de imagen no v\xE1lido",
      exceedMaxCount: "Solo se pueden subir {0} im\xE1genes a la vez",
      invalidImage: "Imagen no v\xE1lida"
    },
    shortcut: {
      "drawing-view": "Vista de dibujo",
      "drawing-move-down": "Mover dibujo hacia abajo",
      "drawing-move-up": "Mover dibujo hacia arriba",
      "drawing-move-left": "Mover dibujo a la izquierda",
      "drawing-move-right": "Mover dibujo a la derecha",
      "drawing-delete": "Eliminar dibujo"
    }
  }
};
var es_ES_default4 = locale4;

// ../packages/docs-hyper-link-ui/src/locale/es-ES.ts
var locale5 = {
  "docs-hyper-link-ui": {
    edit: {
      confirm: "Confirmar",
      cancel: "Cancelar",
      title: "Enlace",
      address: "Enlace",
      placeholder: "Por favor, introduce una URL",
      addressError: "\xA1La URL no es v\xE1lida!",
      label: "Etiqueta",
      labelError: "Por favor, introduce la etiqueta del enlace"
    },
    info: {
      copy: "Copiar",
      edit: "Editar",
      cancel: "Eliminar enlace",
      coped: "Enlace copiado al portapapeles"
    },
    menu: {
      tooltip: "A\xF1adir enlace"
    }
  }
};
var es_ES_default5 = locale5;

// ../packages/docs-quick-insert-ui/src/locale/es-ES.ts
var locale6 = {
  "docs-quick-insert-ui": {
    menu: {
      numberedList: "Lista numerada",
      bulletedList: "Lista con vi\xF1etas",
      divider: "Divisor",
      text: "Texto",
      table: "Tabla",
      image: "Imagen"
    },
    group: {
      basics: "B\xE1sicos"
    },
    placeholder: "No se han encontrado resultados",
    keywordInputPlaceholder: "Introduce palabras clave"
  }
};
var es_ES_default6 = locale6;

// ../packages/docs-thread-comment-ui/src/locale/es-ES.ts
var locale7 = {
  "docs-thread-comment-ui": {
    panel: {
      title: "Gesti\xF3n de comentarios",
      addComment: "A\xF1adir comentario"
    }
  }
};
var es_ES_default7 = locale7;

// ../packages/docs-ui/src/locale/es-ES.ts
var locale8 = {
  "docs-ui": {
    toolbar: {
      undo: "Deshacer",
      redo: "Rehacer",
      font: "Fuente",
      fontSize: "Tama\xF1o de fuente",
      bold: "Negrita",
      italic: "Cursiva",
      strikethrough: "Tachado",
      subscript: "Sub\xEDndice",
      superscript: "Super\xEDndice",
      underline: "Subrayado",
      textColor: {
        main: "Color de texto"
      },
      fillColor: {
        main: "Color de fondo de texto"
      },
      table: {
        main: "Tabla",
        insert: "Insertar tabla",
        colCount: "N\xFAmero de columnas",
        rowCount: "N\xFAmero de filas"
      },
      resetColor: "Restablecer",
      order: "Lista ordenada",
      unorder: "Lista desordenada",
      checklist: "Lista de tareas",
      documentFlavor: "Modo moderno",
      alignLeft: "Alinear a la izquierda",
      alignCenter: "Centrar",
      alignRight: "Alinear a la derecha",
      alignJustify: "Justificar",
      horizontalLine: "L\xEDnea horizontal",
      headerFooter: "Encabezado y pie de p\xE1gina",
      pageSetup: "Configuraci\xF3n de p\xE1gina"
    },
    table: {
      insert: "Insertar",
      insertRowAbove: "Insertar fila arriba",
      insertRowBelow: "Insertar fila abajo",
      insertColumnLeft: "Insertar columna a la izquierda",
      insertColumnRight: "Insertar columna a la derecha",
      delete: "Eliminar tabla",
      deleteRows: "Eliminar fila",
      deleteColumns: "Eliminar columna",
      deleteTable: "Eliminar tabla"
    },
    headerFooter: {
      header: "Encabezado",
      footer: "Pie de p\xE1gina",
      panel: "Configuraci\xF3n de encabezado y pie de p\xE1gina",
      firstPageCheckBox: "Primera p\xE1gina diferente",
      oddEvenCheckBox: "P\xE1ginas impares y pares diferentes",
      headerTopMargin: "Margen superior del encabezado (px)",
      footerBottomMargin: "Margen inferior del pie de p\xE1gina (px)",
      closeHeaderFooter: "Cerrar encabezado y pie de p\xE1gina",
      disableText: "La configuraci\xF3n de encabezado y pie de p\xE1gina est\xE1 deshabilitada"
    },
    doc: {
      menu: {
        paragraphSetting: "Configuraci\xF3n de p\xE1rrafo"
      },
      slider: {
        paragraphSetting: "Configuraci\xF3n de p\xE1rrafo"
      },
      paragraphSetting: {
        alignment: "Alineaci\xF3n",
        indentation: "Sangr\xEDa",
        left: "Izquierda",
        right: "Derecha",
        firstLine: "Primera l\xEDnea",
        hanging: "Colgante",
        spacing: "Espaciado",
        before: "Antes",
        after: "Despu\xE9s",
        lineSpace: "Espacio entre l\xEDneas",
        multiSpace: "Espacio m\xFAltiple",
        fixedValue: "Valor fijo (px)"
      }
    },
    rightClick: {
      copy: "Copiar",
      cut: "Cortar",
      paste: "Pegar",
      delete: "Eliminar",
      bulletList: "Lista de vi\xF1etas",
      orderList: "Lista ordenada",
      checkList: "Lista de tareas",
      insertBellow: "Insertar debajo"
    },
    "page-settings": {
      "document-setting": "Configuraci\xF3n de documento",
      mode: "Modo",
      "modern-mode": "Moderno",
      "classic-mode": "Cl\xE1sico",
      "modern-width": "Ancho del contenido",
      "modern-width-narrow": "Estrecho",
      "modern-width-medium": "Medio",
      "modern-width-wide": "Ancho",
      "paper-size": "Tama\xF1o de papel",
      "page-size": {
        main: "Tama\xF1o de papel",
        a4: "A4",
        a3: "A3",
        a5: "A5",
        b4: "B4",
        b5: "B5",
        letter: "Carta",
        legal: "Legal",
        tabloid: "Tabloide",
        statement: "Declaraci\xF3n",
        executive: "Ejecutivo",
        folio: "Folio"
      },
      orientation: "Orientaci\xF3n",
      portrait: "Vertical",
      landscape: "Horizontal",
      "custom-paper-size": "Tama\xF1o de papel personalizado",
      top: "Superior",
      bottom: "Inferior",
      left: "Izquierda",
      right: "Derecha",
      cancel: "Cancelar",
      confirm: "Confirmar"
    }
  }
};
var es_ES_default8 = locale8;

// ../packages/drawing-ui/src/locale/es-ES.ts
var locale9 = {
  "drawing-ui": {
    "image-cropper": {
      error: "No se pueden recortar objetos que no sean im\xE1genes."
    },
    "image-panel": {
      arrange: {
        title: "Organizar",
        forward: "Traer adelante",
        backward: "Enviar atr\xE1s",
        front: "Traer al frente",
        back: "Enviar al fondo"
      },
      transform: {
        title: "Transformar",
        rotate: "Rotar (\xB0)",
        x: "X (px)",
        y: "Y (px)",
        width: "Ancho (px)",
        height: "Alto (px)",
        lock: "Bloquear proporci\xF3n (%)"
      },
      crop: {
        title: "Recortar",
        start: "Iniciar recorte",
        mode: "Libre"
      },
      group: {
        title: "Agrupar",
        group: "Agrupar",
        unGroup: "Desagrupar"
      },
      align: {
        title: "Alinear",
        default: "Seleccionar tipo de alineaci\xF3n",
        left: "Alinear a la izquierda",
        center: "Alinear al centro",
        right: "Alinear a la derecha",
        top: "Alinear arriba",
        middle: "Alinear al medio",
        bottom: "Alinear abajo",
        horizon: "Distribuir horizontalmente",
        vertical: "Distribuir verticalmente"
      },
      null: "Ning\xFAn objeto seleccionado"
    },
    "image-text-wrap": {
      title: "Ajuste de texto",
      wrappingStyle: "Estilo de ajuste",
      square: "Cuadrado",
      topAndBottom: "Arriba y abajo",
      inline: "En l\xEDnea con el texto",
      behindText: "Detr\xE1s del texto",
      inFrontText: "Delante del texto",
      wrapText: "Ajustar texto",
      bothSide: "Ambos lados",
      leftOnly: "Solo izquierda",
      rightOnly: "Solo derecha",
      distanceFromText: "Distancia del texto",
      top: "Arriba(px)",
      left: "Izquierda(px)",
      bottom: "Abajo(px)",
      right: "Derecha(px)"
    },
    "image-popup": {
      replace: "Reemplazar",
      delete: "Eliminar",
      edit: "Editar",
      crop: "Recortar",
      reset: "Restablecer tama\xF1o"
    }
  }
};
var es_ES_default9 = locale9;

// ../packages/find-replace/src/locale/es-ES.ts
var locale10 = {
  "find-replace": {
    toolbar: "Buscar y reemplazar",
    shortcut: {
      "open-find-dialog": "Abrir cuadro de di\xE1logo de b\xFAsqueda",
      "open-replace-dialog": "Abrir cuadro de di\xE1logo de reemplazo",
      "close-dialog": "Cerrar cuadro de di\xE1logo de b\xFAsqueda y reemplazo",
      "go-to-next-match": "Ir a la siguiente coincidencia",
      "go-to-previous-match": "Ir a la coincidencia anterior",
      "focus-selection": "Enfocar selecci\xF3n",
      panel: "Buscar y reemplazar"
    },
    dialog: {
      title: "Buscar",
      find: "Buscar",
      replace: "Reemplazar",
      "replace-all": "Reemplazar todo",
      "case-sensitive": "Distinguir may\xFAsculas y min\xFAsculas",
      "find-placeholder": "Buscar en esta hoja",
      "advanced-finding": "B\xFAsqueda y reemplazo avanzados",
      "replace-placeholder": "Introducir cadena de reemplazo",
      "match-the-whole-cell": "Coincidir con toda la celda",
      "find-direction": {
        title: "Direcci\xF3n de b\xFAsqueda",
        row: "Buscar por fila",
        column: "Buscar por columna"
      },
      "find-scope": {
        title: "Rango de b\xFAsqueda",
        "current-sheet": "Hoja actual",
        workbook: "Libro"
      },
      "find-by": {
        title: "Buscar por",
        value: "Buscar por valor",
        formula: "Buscar f\xF3rmula"
      },
      "no-match": "B\xFAsqueda completada pero no se encontraron coincidencias.",
      "no-result": "Sin resultados"
    },
    replace: {
      "all-success": "Se reemplazaron todas las {0} coincidencias",
      "all-failure": "Error al reemplazar",
      confirm: {
        title: "\xBFEst\xE1 seguro de que desea reemplazar todas las coincidencias?"
      }
    },
    button: {
      confirm: "Aceptar",
      cancel: "Cancelar"
    }
  }
};
var es_ES_default10 = locale10;

// ../packages/sheets/src/locale/es-ES.ts
var locale11 = {
  sheets: {
    tabs: {
      sheetCopy: "(Copia{0})",
      sheet: "Hoja"
    },
    info: {
      overlappingSelections: "No se puede usar ese comando en selecciones superpuestas",
      acrossMergedCell: "A trav\xE9s de una celda combinada",
      partOfCell: "Solo una parte de una celda combinada est\xE1 seleccionada",
      hideSheet: "No hay hojas visibles despu\xE9s de ocultar esta"
    },
    definedName: {
      nameEmpty: "El nombre no puede estar vac\xEDo",
      nameDuplicate: "El nombre ya existe",
      nameInvalid: "El nombre no es v\xE1lido",
      nameSheetConflict: "El nombre entra en conflicto con el nombre de la hoja",
      formulaOrRefStringEmpty: "La f\xF3rmula o la cadena de referencia no pueden estar vac\xEDas",
      nameConflict: "El nombre entra en conflicto con el nombre de la funci\xF3n",
      defaultName: "NombreDefinido"
    },
    permission: {
      dialog: {
        autoFillErr: "El rango est\xE1 protegido y no tienes permiso para autorrellenar. Para usar el autorrellenado, contacta al creador.",
        editErr: "El rango est\xE1 protegido y no tienes permiso de edici\xF3n. Para editar, contacta al creador.",
        formulaErr: "El rango o el rango referenciado est\xE1 protegido, y no tienes permiso de edici\xF3n. Para editar, contacta al creador.",
        insertOrDeleteMoveRangeErr: "El rango insertado o eliminado se cruza con el rango protegido, y esta operaci\xF3n no es compatible por ahora.",
        insertRowColErr: "El rango est\xE1 protegido y no tienes permiso para insertar filas y columnas. Para insertar filas y columnas, contacta al creador.",
        moveRangeErr: "El rango est\xE1 protegido y no tienes permiso para mover la selecci\xF3n. Para mover la selecci\xF3n, contacta al creador.",
        moveRowColErr: "El rango est\xE1 protegido y no tienes permiso para mover filas y columnas. Para mover filas y columnas, contacta al creador.",
        operatorSheetErr: "La hoja de c\xE1lculo est\xE1 protegida y no tienes permiso para operar en ella. Para operar en la hoja de c\xE1lculo, contacta al creador.",
        removeRowColErr: "El rango est\xE1 protegido y no tienes permiso para eliminar filas y columnas. Para eliminar filas y columnas, contacta al creador.",
        setRowColStyleErr: "El rango est\xE1 protegido y no tienes permiso para establecer estilos de fila y columna. Para establecer estilos de fila y columna, contacta al creador.",
        setStyleErr: "El rango est\xE1 protegido y no tienes permiso para establecer estilos. Para establecer estilos, contacta al creador."
      }
    },
    autoFill: {
      copy: "Copiar celda",
      series: "Rellenar serie",
      formatOnly: "Solo formato",
      noFormat: "Sin formato"
    },
    merge: {
      confirm: {
        title: "Continuar la fusi\xF3n solo conservar\xE1 el valor de la celda superior izquierda, descartando los otros valores. \xBFEst\xE1s seguro de continuar?",
        cancel: "Cancelar fusi\xF3n",
        confirm: "Continuar fusi\xF3n",
        warning: "Advertencia",
        dismantleMergeCellWarning: "Esto dividir\xE1 algunas celdas fusionadas. \xBFQuieres continuar?"
      }
    }
  }
};
var es_ES_default11 = locale11;

// ../packages/sheets-conditional-formatting-ui/src/locale/es-ES.ts
var locale12 = {
  "sheets-conditional-formatting-ui": {
    title: "Formato condicional",
    menu: {
      manageConditionalFormatting: "Gestionar formato condicional",
      createConditionalFormatting: "Crear formato condicional",
      clearRangeRules: "Borrar reglas del rango seleccionado",
      clearWorkSheetRules: "Borrar reglas de toda la hoja"
    },
    form: {
      lessThan: "El valor debe ser menor que {0}",
      lessThanOrEqual: "El valor debe ser menor o igual que {0}",
      greaterThan: "El valor debe ser mayor que {0}",
      greaterThanOrEqual: "El valor debe ser mayor o igual que {0}",
      rangeSelector: "Selecciona un rango o introduce un valor"
    },
    iconSet: {
      direction: "Direcci\xF3n",
      shape: "Forma",
      mark: "Marca",
      rank: "Rango",
      rule: "Regla",
      icon: "Icono",
      type: "Tipo",
      value: "Valor",
      reverseIconOrder: "Invertir orden de iconos",
      and: "Y",
      when: "Cuando",
      onlyShowIcon: "Mostrar solo icono"
    },
    symbol: {
      greaterThan: ">",
      greaterThanOrEqual: ">=",
      lessThan: "<",
      lessThanOrEqual: "<="
    },
    panel: {
      createRule: "Crear regla",
      clear: "Borrar todas las reglas",
      range: "Aplicar rango",
      styleType: "Tipo de estilo",
      submit: "Enviar",
      cancel: "Cancelar",
      rankAndAverage: "Superior/Inferior/Promedio",
      styleRule: "Regla de estilo",
      isNotBottom: "Superior",
      isBottom: "Inferior",
      greaterThanAverage: "Mayor que el promedio",
      lessThanAverage: "Menor que el promedio",
      medianValue: "Valor mediano",
      fillType: "Tipo de relleno",
      pureColor: "Color s\xF3lido",
      gradient: "Gradiente",
      colorSet: "Conjunto de colores",
      positive: "Positivo",
      native: "Negativo",
      workSheet: "Toda la hoja",
      selectedRange: "Rango seleccionado",
      managerRuleSelect: "Gestionar reglas de {0}",
      onlyShowDataBar: "Mostrar solo barras de datos"
    },
    preview: {
      describe: {
        beginsWith: "Empieza con {0}",
        endsWith: "Termina con {0}",
        containsText: "El texto contiene {0}",
        notContainsText: "El texto no contiene {0}",
        equal: "Igual a {0}",
        notEqual: "Distinto de {0}",
        containsBlanks: "Contiene espacios en blanco",
        notContainsBlanks: "No contiene espacios en blanco",
        containsErrors: "Contiene errores",
        notContainsErrors: "No contiene errores",
        greaterThan: "Mayor que {0}",
        greaterThanOrEqual: "Mayor o igual que {0}",
        lessThan: "Menor que {0}",
        lessThanOrEqual: "Menor o igual que {0}",
        notBetween: "No est\xE1 entre {0} y {1}",
        between: "Entre {0} y {1}",
        yesterday: "Ayer",
        tomorrow: "Ma\xF1ana",
        last7Days: "\xDAltimos 7 d\xEDas",
        thisMonth: "Este mes",
        lastMonth: "Mes pasado",
        nextMonth: "Mes siguiente",
        thisWeek: "Esta semana",
        lastWeek: "Semana pasada",
        nextWeek: "Semana siguiente",
        today: "Hoy",
        topN: "Top {0}",
        bottomN: "Inferior {0}",
        topNPercent: "Top {0}%",
        bottomNPercent: "Inferior {0}%"
      }
    },
    operator: {
      beginsWith: "Empieza con",
      endsWith: "Termina con",
      containsText: "El texto contiene",
      notContainsText: "El texto no contiene",
      equal: "Igual a",
      notEqual: "Distinto de",
      containsBlanks: "Contiene espacios en blanco",
      notContainsBlanks: "No contiene espacios en blanco",
      containsErrors: "Contiene errores",
      notContainsErrors: "No contiene errores",
      greaterThan: "Mayor que",
      greaterThanOrEqual: "Mayor o igual que",
      lessThan: "Menor que",
      lessThanOrEqual: "Menor o igual que",
      notBetween: "No est\xE1 entre",
      between: "Entre",
      yesterday: "Ayer",
      tomorrow: "Ma\xF1ana",
      last7Days: "\xDAltimos 7 d\xEDas",
      thisMonth: "Este mes",
      lastMonth: "Mes pasado",
      nextMonth: "Mes siguiente",
      thisWeek: "Esta semana",
      lastWeek: "Semana pasada",
      nextWeek: "Semana siguiente",
      today: "Hoy"
    },
    ruleType: {
      highlightCell: "Resaltar celda",
      dataBar: "Barra de datos",
      colorScale: "Escala de colores",
      formula: "F\xF3rmula personalizada",
      iconSet: "Conjunto de iconos",
      duplicateValues: "Valores duplicados",
      uniqueValues: "Valores \xFAnicos"
    },
    subRuleType: {
      uniqueValues: "Valores \xFAnicos",
      duplicateValues: "Valores duplicados",
      rank: "Rango",
      text: "Texto",
      timePeriod: "Periodo de tiempo",
      number: "N\xFAmero",
      average: "Promedio"
    },
    valueType: {
      num: "N\xFAmero",
      min: "M\xEDnimo",
      max: "M\xE1ximo",
      percent: "Porcentaje",
      percentile: "Percentil",
      formula: "F\xF3rmula",
      none: "Ninguno"
    },
    errorMessage: {
      notBlank: "La condici\xF3n no puede estar vac\xEDa",
      formulaError: "F\xF3rmula incorrecta",
      rangeError: "Selecci\xF3n incorrecta"
    },
    permission: {
      dialog: {
        setStyleErr: "El rango est\xE1 protegido y no tienes permiso para establecer estilos. Para establecer estilos, contacta al creador."
      }
    }
  }
};
var es_ES_default12 = locale12;

// ../packages/sheets-crosshair-highlight/src/locale/es-ES.ts
var locale13 = {
  "sheets-crosshair-highlight": {
    button: {
      tooltip: "Resaltado de cruz"
    }
  }
};
var es_ES_default13 = locale13;

// ../packages/sheets-data-validation/src/locale/es-ES.ts
var locale14 = {
  "sheets-data-validation": {
    operators: {
      between: "entre",
      greaterThan: "mayor que",
      greaterThanOrEqual: "mayor o igual que",
      lessThan: "menor que",
      lessThanOrEqual: "menor o igual que",
      equal: "igual",
      notEqual: "no igual",
      notBetween: "no entre",
      legal: "es tipo legal"
    },
    ruleName: {
      between: "Est\xE1 entre {FORMULA1} y {FORMULA2}",
      greaterThan: "Es mayor que {FORMULA1}",
      greaterThanOrEqual: "Es mayor o igual que {FORMULA1}",
      lessThan: "Es menor que {FORMULA1}",
      lessThanOrEqual: "Es menor o igual que {FORMULA1}",
      equal: "Es igual a {FORMULA1}",
      notEqual: "No es igual a {FORMULA1}",
      notBetween: "No est\xE1 entre {FORMULA1} y {FORMULA2}",
      legal: "Es un {TYPE} legal"
    },
    errorMsg: {
      between: "El valor debe estar entre {FORMULA1} y {FORMULA2}",
      greaterThan: "El valor debe ser mayor que {FORMULA1}",
      greaterThanOrEqual: "El valor debe ser mayor o igual que {FORMULA1}",
      lessThan: "El valor debe ser menor que {FORMULA1}",
      lessThanOrEqual: "El valor debe ser menor o igual que {FORMULA1}",
      equal: "El valor debe ser igual a {FORMULA1}",
      notEqual: "El valor no debe ser igual a {FORMULA1}",
      notBetween: "El valor no debe estar entre {FORMULA1} y {FORMULA2}",
      legal: "El valor debe ser un {TYPE} legal"
    },
    date: {
      operators: {
        between: "entre",
        greaterThan: "despu\xE9s de",
        greaterThanOrEqual: "en o despu\xE9s de",
        lessThan: "antes de",
        lessThanOrEqual: "en o antes de",
        equal: "igual",
        notEqual: "no igual",
        notBetween: "no entre",
        legal: "es una fecha legal"
      },
      ruleName: {
        between: "est\xE1 entre {FORMULA1} y {FORMULA2}",
        greaterThan: "es despu\xE9s de {FORMULA1}",
        greaterThanOrEqual: "es en o despu\xE9s de {FORMULA1}",
        lessThan: "es antes de {FORMULA1}",
        lessThanOrEqual: "es en o antes de {FORMULA1}",
        equal: "es {FORMULA1}",
        notEqual: "no es {FORMULA1}",
        notBetween: "no est\xE1 entre {FORMULA1}",
        legal: "es una fecha legal"
      },
      errorMsg: {
        between: "El valor debe ser una fecha legal y estar entre {FORMULA1} y {FORMULA2}",
        greaterThan: "El valor debe ser una fecha legal y despu\xE9s de {FORMULA1}",
        greaterThanOrEqual: "El valor debe ser una fecha legal y en o despu\xE9s de {FORMULA1}",
        lessThan: "El valor debe ser una fecha legal y antes de {FORMULA1}",
        lessThanOrEqual: "El valor debe ser una fecha legal y en o antes de {FORMULA1}",
        equal: "El valor debe ser una fecha legal y {FORMULA1}",
        notEqual: "El valor debe ser una fecha legal y no {FORMULA1}",
        notBetween: "El valor debe ser una fecha legal y no estar entre {FORMULA1}",
        legal: "El valor debe ser una fecha legal"
      },
      title: "Fecha"
    },
    textLength: {
      errorMsg: {
        between: "La longitud del texto debe estar entre {FORMULA1} y {FORMULA2}",
        greaterThan: "La longitud del texto debe ser mayor que {FORMULA1}",
        greaterThanOrEqual: "La longitud del texto debe ser mayor o igual que {FORMULA1}",
        lessThan: "La longitud del texto debe ser menor que {FORMULA1}",
        lessThanOrEqual: "La longitud del texto debe ser menor o igual que {FORMULA1}",
        equal: "La longitud del texto debe ser {FORMULA1}",
        notEqual: "La longitud del texto no debe ser {FORMULA1}",
        notBetween: "La longitud del texto no debe estar entre {FORMULA1}"
      },
      title: "Longitud del texto"
    },
    custom: {
      ruleName: "La f\xF3rmula personalizada es {FORMULA1}",
      title: "F\xF3rmula personalizada",
      validFail: "Por favor, introduce una f\xF3rmula v\xE1lida",
      error: "El contenido de esta celda viola su regla de validaci\xF3n"
    },
    validFail: {
      value: "Por favor, introduce un valor",
      common: "Por favor, introduce un valor o f\xF3rmula",
      number: "Por favor, introduce un n\xFAmero o f\xF3rmula",
      formula: "Por favor, introduce una f\xF3rmula",
      integer: "Por favor, introduce un entero o f\xF3rmula",
      date: "Por favor, introduce una fecha o f\xF3rmula",
      list: "Por favor, introduce opciones",
      listInvalid: "La fuente de la lista debe ser una lista delimitada o una referencia a una sola fila o columna",
      checkboxEqual: "Introduce valores diferentes para los contenidos de celda marcados y desmarcados.",
      formulaError: "El rango de referencia contiene datos invisibles, ajusta el rango",
      listIntersects: "El rango seleccionado no puede cruzarse con el \xE1mbito de las reglas",
      primitive: "No se permiten f\xF3rmulas para valores personalizados marcados y desmarcados."
    },
    any: {
      title: "Cualquier valor",
      error: "El contenido de esta celda viola la regla de validaci\xF3n"
    },
    list: {
      title: "Desplegable",
      name: "El valor contiene uno del rango",
      error: "La entrada debe estar dentro del rango especificado",
      emptyError: "Por favor, introduce un valor",
      add: "A\xF1adir",
      dropdown: "Seleccionar",
      options: "Opciones",
      customOptions: "Personalizado",
      refOptions: "De un rango",
      formulaError: "La fuente de la lista debe ser una lista delimitada de datos o una referencia a una sola fila o columna.",
      edit: "Editar"
    },
    listMultiple: {
      title: "Desplegable-m\xFAltiple",
      dropdown: "Selecci\xF3n m\xFAltiple"
    },
    decimal: {
      title: "N\xFAmero"
    },
    whole: {
      title: "Entero"
    },
    checkbox: {
      title: "Casilla de verificaci\xF3n",
      error: "El contenido de esta celda viola su regla de validaci\xF3n",
      tips: "Usa valores personalizados dentro de las celdas",
      checked: "Valor seleccionado",
      unchecked: "Valor no seleccionado"
    }
  }
};
var es_ES_default14 = locale14;

// ../packages/sheets-data-validation-ui/src/locale/es-ES.ts
var locale15 = {
  "sheets-data-validation-ui": {
    title: "Validaci\xF3n de datos",
    validFail: {
      value: "Por favor, introduce un valor",
      common: "Por favor, introduce un valor o f\xF3rmula",
      number: "Por favor, introduce un n\xFAmero o f\xF3rmula",
      formula: "Por favor, introduce una f\xF3rmula",
      integer: "Por favor, introduce un entero o f\xF3rmula",
      date: "Por favor, introduce una fecha o f\xF3rmula",
      list: "Por favor, introduce opciones",
      listInvalid: "La fuente de la lista debe ser una lista delimitada o una referencia a una sola fila o columna",
      checkboxEqual: "Introduce valores diferentes para los contenidos de celda marcados y desmarcados.",
      formulaError: "El rango de referencia contiene datos invisibles, ajusta el rango",
      listIntersects: "El rango seleccionado no puede cruzarse con el \xE1mbito de las reglas",
      primitive: "No se permiten f\xF3rmulas para valores personalizados marcados y desmarcados."
    },
    panel: {
      title: "Gesti\xF3n de validaci\xF3n de datos",
      addTitle: "Crear nueva validaci\xF3n de datos",
      removeAll: "Eliminar todo",
      add: "A\xF1adir regla",
      range: "Rangos",
      type: "Tipo",
      options: "Opciones avanzadas",
      operator: "Operador",
      removeRule: "Eliminar",
      done: "Hecho",
      formulaPlaceholder: "Por favor, introduce valor o f\xF3rmula",
      valuePlaceholder: "Por favor, introduce valor",
      formulaAnd: "y",
      invalid: "Inv\xE1lido",
      showWarning: "Mostrar advertencia",
      rejectInput: "Rechazar entrada",
      messageInfo: "Mensaje de ayuda",
      showInfo: "Mostrar texto de ayuda para la celda seleccionada",
      rangeError: "Los rangos no son v\xE1lidos",
      allowBlank: "Permitir valores en blanco"
    },
    any: {
      title: "Cualquier valor",
      error: "El contenido de esta celda viola la regla de validaci\xF3n"
    },
    date: {
      title: "Fecha"
    },
    list: {
      title: "Desplegable",
      name: "El valor contiene uno del rango",
      error: "La entrada debe estar dentro del rango especificado",
      emptyError: "Por favor, introduce un valor",
      add: "A\xF1adir",
      dropdown: "Seleccionar",
      options: "Opciones",
      customOptions: "Personalizado",
      refOptions: "De un rango",
      formulaError: "La fuente de la lista debe ser una lista delimitada de datos o una referencia a una sola fila o columna.",
      edit: "Editar"
    },
    listMultiple: {
      title: "Desplegable-m\xFAltiple",
      dropdown: "Selecci\xF3n m\xFAltiple"
    },
    textLength: {
      title: "Longitud del texto"
    },
    decimal: {
      title: "N\xFAmero"
    },
    whole: {
      title: "Entero"
    },
    checkbox: {
      title: "Casilla de verificaci\xF3n",
      error: "El contenido de esta celda viola su regla de validaci\xF3n",
      tips: "Usa valores personalizados dentro de las celdas",
      checked: "Valor seleccionado",
      unchecked: "Valor no seleccionado"
    },
    custom: {
      title: "F\xF3rmula personalizada",
      error: "El contenido de esta celda viola su regla de validaci\xF3n",
      validFail: "Por favor, introduce una f\xF3rmula v\xE1lida"
    },
    alert: {
      title: "Error",
      ok: "OK"
    },
    error: {
      title: "Inv\xE1lido:"
    },
    renderMode: {
      arrow: "Flecha",
      chip: "Chip",
      text: "Texto plano",
      label: "Estilo de visualizaci\xF3n"
    },
    showTime: {
      label: "Mostrar selector de hora"
    },
    permission: {
      dialog: {
        setStyleErr: "El rango est\xE1 protegido y no tienes permiso para establecer estilos. Para establecer estilos, contacta al creador."
      }
    }
  }
};
var es_ES_default15 = locale15;

// ../packages/sheets-drawing-ui/src/locale/es-ES.ts
var locale16 = {
  "sheets-drawing-ui": {
    title: "Imagen",
    upload: {
      float: "Imagen flotante",
      cell: "Imagen de celda"
    },
    panel: {
      title: "Editar imagen"
    },
    save: {
      title: "Guardar im\xE1genes de celda",
      menuLabel: "Guardar im\xE1genes de celda",
      imageCount: "Cantidad de im\xE1genes",
      fileNameConfig: "Nombre del archivo",
      useRowCol: "Usar direcci\xF3n de celda (A1, B2...)",
      useColumnValue: "Usar valor de columna",
      selectColumn: "Seleccionar columna",
      cancel: "Cancelar",
      confirm: "Guardar",
      saving: "Guardando...",
      error: "Error al guardar las im\xE1genes de celda"
    },
    "image-popup": {
      replace: "Reemplazar",
      delete: "Eliminar",
      edit: "Editar",
      crop: "Recortar",
      reset: "Restablecer tama\xF1o",
      flipH: "Voltear horizontalmente",
      flipV: "Voltear verticalmente"
    },
    "update-status": {
      exceedMaxSize: "El tama\xF1o de la imagen supera el l\xEDmite, el l\xEDmite es {0}M",
      invalidImageType: "Tipo de imagen no v\xE1lido",
      exceedMaxCount: "Solo se pueden subir {0} im\xE1genes a la vez",
      invalidImage: "Imagen no v\xE1lida"
    },
    "drawing-anchor": {
      title: "Propiedades de anclaje",
      both: "Mover y cambiar tama\xF1o con las celdas",
      position: "Mover pero no cambiar tama\xF1o con las celdas",
      none: "No mover ni cambiar tama\xF1o con las celdas"
    },
    "cell-image": {
      pasteTitle: "Pegar como imagen de celda",
      pasteContent: "Pegar una imagen de celda sobrescribir\xE1 el contenido existente de la celda, continuar pegando",
      pasteError: "La copia y pegado de im\xE1genes de celda de hoja no est\xE1 soportada en esta unidad"
    },
    permission: {
      dialog: {
        editErr: "El rango est\xE1 protegido y no tienes permiso de edici\xF3n. Para editar, contacta al creador."
      }
    },
    shortcut: {
      "drawing-view": "Vista de dibujo",
      "drawing-move-down": "Mover dibujo hacia abajo",
      "drawing-move-up": "Mover dibujo hacia arriba",
      "drawing-move-left": "Mover dibujo a la izquierda",
      "drawing-move-right": "Mover dibujo a la derecha",
      "drawing-delete": "Eliminar dibujo"
    }
  }
};
var es_ES_default16 = locale16;

// ../packages/sheets-filter/src/locale/es-ES.ts
var locale17 = {
  "sheets-filter": {
    command: {
      "not-valid-filter-range": "El rango seleccionado solo tiene una fila y no es v\xE1lido para filtrar."
    },
    msg: {
      "filter-header-forbidden": "No puedes mover la fila de encabezado de un filtro."
    }
  }
};
var es_ES_default17 = locale17;

// ../packages/sheets-filter-ui/src/locale/es-ES.ts
var locale18 = {
  "sheets-filter-ui": {
    toolbar: {
      "smart-toggle-filter-tooltip": "Alternar filtro",
      "clear-filter-criteria": "Borrar condiciones de filtro",
      "re-calc-filter-conditions": "Recalcular condiciones de filtro"
    },
    shortcut: {
      "smart-toggle-filter": "Alternar filtro"
    },
    panel: {
      "clear-filter": "Borrar filtro",
      cancel: "Cancelar",
      confirm: "Confirmar",
      "by-values": "Por valores",
      "by-colors": "Por colores",
      "filter-by-cell-fill-color": "Filtrar por color de relleno de celda",
      "filter-by-cell-text-color": "Filtrar por color de texto de celda",
      "filter-by-color-none": "La columna contiene solo un color",
      "by-conditions": "Por condiciones",
      "filter-only": "Solo filtrar",
      "search-placeholder": "Usa espacio para separar palabras clave",
      "select-all": "Seleccionar todo",
      "input-values-placeholder": "Introducir valores",
      and: "Y",
      or: "O",
      empty: "(vac\xEDo)",
      "?": "Usa \u201C?\u201D para representar un solo car\xE1cter.",
      "*": "Usa \u201C*\u201D para representar varios caracteres."
    },
    conditions: {
      none: "Ninguno",
      empty: "Est\xE1 vac\xEDo",
      "not-empty": "No est\xE1 vac\xEDo",
      "text-contains": "El texto contiene",
      "does-not-contain": "El texto no contiene",
      "starts-with": "El texto comienza con",
      "ends-with": "El texto termina con",
      equals: "El texto es igual a",
      "greater-than": "Mayor que",
      "greater-than-or-equal": "Mayor o igual que",
      "less-than": "Menor que",
      "less-than-or-equal": "Menor o igual que",
      equal: "Igual",
      "not-equal": "No igual",
      between: "Entre",
      "not-between": "No entre",
      custom: "Personalizado"
    },
    date: {
      1: "Enero",
      2: "Febrero",
      3: "Marzo",
      4: "Abril",
      5: "Mayo",
      6: "Junio",
      7: "Julio",
      8: "Agosto",
      9: "Septiembre",
      10: "Octubre",
      11: "Noviembre",
      12: "Diciembre"
    },
    sync: {
      title: "El filtro es visible para todos",
      statusTips: {
        on: "Una vez activado, todos los colaboradores ver\xE1n los resultados del filtro",
        off: "Una vez desactivado, solo t\xFA ver\xE1s los resultados del filtro"
      },
      switchTips: {
        on: '"El filtro es visible para todos" est\xE1 activado, todos los colaboradores ver\xE1n los resultados del filtro',
        off: '"El filtro es visible para todos" est\xE1 desactivado, solo t\xFA ver\xE1s los resultados del filtro'
      }
    }
  }
};
var es_ES_default18 = locale18;

// ../packages/sheets-formula/src/locale/function-list/array/es-ES.ts
var locale19 = {
  ARRAY_CONSTRAIN: {
    description: "Restringe un resultado de matriz a un tama\xF1o especificado.",
    abstract: "Restringe un resultado de matriz a un tama\xF1o especificado.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.google.com/docs/answer/3267036?hl=en&sjid=8484774178571403392-AP"
      }
    ],
    functionParameter: {
      inputRange: { name: "rango_entrada", detail: "El rango a restringir." },
      numRows: { name: "num_filas", detail: "El n\xFAmero de filas que debe contener el resultado." },
      numCols: { name: "num_columnas", detail: "El n\xFAmero de columnas que debe contener el resultado" }
    }
  },
  FLATTEN: {
    description: "Aplana todos los valores de uno o m\xE1s rangos en una sola columna.",
    abstract: "Aplana todos los valores de uno o m\xE1s rangos en una sola columna.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.google.com/docs/answer/10307761?hl=zh-Hans&sjid=17375453483079636084-AP"
      }
    ],
    functionParameter: {
      range1: { name: "rango1", detail: "El primer rango a aplanar." },
      range2: { name: "rango2", detail: "Rangos adicionales a aplanar." }
    }
  }
};
var es_ES_default19 = locale19;

// ../packages/sheets-formula/src/locale/function-list/compatibility/es-ES.ts
var locale20 = {
  BETADIST: {
    description: "Devuelve la funci\xF3n de distribuci\xF3n acumulativa beta.",
    abstract: "Devuelve la funci\xF3n de distribuci\xF3n acumulativa beta.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-beta-function-49f1b9a9-a5da-470f-8077-5f1730b5fd47"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor entre A y B en el que se eval\xFAa la funci\xF3n." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      A: { name: "A", detail: "Un l\xEDmite inferior para el intervalo de x." },
      B: { name: "B", detail: "Un l\xEDmite superior para el intervalo de x." }
    }
  },
  BETAINV: {
    description: "Devuelve la funci\xF3n inversa de la funci\xF3n de distribuci\xF3n acumulativa para una distribuci\xF3n beta especificada.",
    abstract: "Devuelve la funci\xF3n inversa de la funci\xF3n de distribuci\xF3n acumulativa para una distribuci\xF3n beta especificada.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-beta-inv-function-8b914ade-b902-43c1-ac9c-c05c54f10d6c"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n beta." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      A: { name: "A", detail: "Un l\xEDmite inferior para el intervalo de x." },
      B: { name: "B", detail: "Un l\xEDmite superior para el intervalo de x." }
    }
  },
  BINOMDIST: {
    description: "Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribuci\xF3n binomial.",
    abstract: "Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribuci\xF3n binomial.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-binom-function-506a663e-c4ca-428d-b9a8-05583d68789c"
      }
    ],
    functionParameter: {
      numberS: { name: "n\xFAm_\xE9xito", detail: "El n\xFAmero de \xE9xitos en los ensayos." },
      trials: { name: "ensayos", detail: "El n\xFAmero de ensayos independientes." },
      probabilityS: { name: "prob_\xE9xito", detail: "La probabilidad de \xE9xito en cada ensayo." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.BINOM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de masa de probabilidad." }
    }
  },
  CHIDIST: {
    description: "Devuelve la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    abstract: "Devuelve la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-chi-function-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se desea evaluar la distribuci\xF3n." },
      degFreedom: { name: "grados_libertad", detail: "El n\xFAmero de grados de libertad." }
    }
  },
  CHIINV: {
    description: "Devuelve la inversa de la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    abstract: "Devuelve la inversa de la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/inv-chi-function-cfbea3f6-6e4f-40c9-a87f-20472e0512af"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n chi-cuadrado." },
      degFreedom: { name: "grados_libertad", detail: "El n\xFAmero de grados de libertad." }
    }
  },
  CHITEST: {
    description: "Devuelve la prueba de independencia.",
    abstract: "Devuelve la prueba de independencia.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/prueba-chi-function-981ff871-b694-4134-848e-38ec704577ac"
      }
    ],
    functionParameter: {
      actualRange: { name: "rango_real", detail: "El rango de datos que contiene las observaciones para contrastar con los valores esperados." },
      expectedRange: { name: "rango_esperado", detail: "El rango de datos que contiene la proporci\xF3n del producto de los totales de fila y los totales de columna con respecto al total general." }
    }
  },
  CONFIDENCE: {
    description: "Devuelve el intervalo de confianza para la media de una poblaci\xF3n, usando una distribuci\xF3n normal.",
    abstract: "Devuelve el intervalo de confianza para la media de una poblaci\xF3n, usando una distribuci\xF3n normal.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/intervalo-confianza-function-75ccc007-f77c-4343-bc14-673642091ad6"
      }
    ],
    functionParameter: {
      alpha: { name: "alfa", detail: "El nivel de significaci\xF3n usado para calcular el nivel de confianza. El nivel de confianza es igual a 100*(1 - alfa)%, o en otras palabras, un alfa de 0,05 indica un nivel de confianza del 95 por ciento." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la poblaci\xF3n para el rango de datos y se asume que es conocida." },
      size: { name: "tama\xF1o", detail: "El tama\xF1o de la muestra." }
    }
  },
  COVAR: {
    description: "Devuelve la covarianza de la poblaci\xF3n, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.",
    abstract: "Devuelve la covarianza de la poblaci\xF3n.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/covar-function-50479552-2c03-4daf-bd71-a5ab88b2db03"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "Un primer rango de valores de celda." },
      array2: { name: "matriz2", detail: "Un segundo rango de valores de celda." }
    }
  },
  CRITBINOM: {
    description: "Devuelve el menor valor para el cual la distribuci\xF3n binomial acumulativa es menor o igual a un valor de criterio.",
    abstract: "Devuelve el menor valor para el cual la distribuci\xF3n binomial acumulativa es menor o igual a un valor de criterio.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/critbinom-function-eb6b871d-796b-4d21-b69b-e4350d5f407b"
      }
    ],
    functionParameter: {
      trials: { name: "ensayos", detail: "El n\xFAmero de ensayos de Bernoulli." },
      probabilityS: { name: "prob_\xE9xito", detail: "La probabilidad de \xE9xito en cada ensayo." },
      alpha: { name: "alfa", detail: "El valor de criterio." }
    }
  },
  EXPONDIST: {
    description: "Devuelve la distribuci\xF3n exponencial.",
    abstract: "Devuelve la distribuci\xF3n exponencial.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-exp-function-68ab45fd-cd6d-4887-9770-9357eb8ee06a"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se desea evaluar la distribuci\xF3n." },
      lambda: { name: "lambda", detail: "El valor del par\xE1metro." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.EXP devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  FDIST: {
    description: "Devuelve la distribuci\xF3n de probabilidad F (de cola derecha).",
    abstract: "Devuelve la distribuci\xF3n de probabilidad F (de cola derecha).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-f-function-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se eval\xFAa la funci\xF3n." },
      degFreedom1: { name: "grados_libertad1", detail: "Los grados de libertad del numerador." },
      degFreedom2: { name: "grados_libertad2", detail: "Los grados de libertad del denominador." }
    }
  },
  FINV: {
    description: "Devuelve la inversa de la distribuci\xF3n de probabilidad F (de cola derecha).",
    abstract: "Devuelve la inversa de la distribuci\xF3n de probabilidad F (de cola derecha).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-f-inv-function-4d46c97c-c368-4852-bc15-41e8e31140b1"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n F acumulativa." },
      degFreedom1: { name: "grados_libertad1", detail: "Los grados de libertad del numerador." },
      degFreedom2: { name: "grados_libertad2", detail: "Los grados de libertad del denominador." }
    }
  },
  FTEST: {
    description: "Devuelve el resultado de una prueba F.",
    abstract: "Devuelve el resultado de una prueba F.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/prueba-f-function-4c9e1202-53fe-428c-a737-976f6fc3f9fd"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "La primera matriz o rango de datos." },
      array2: { name: "matriz2", detail: "La segunda matriz o rango de datos." }
    }
  },
  GAMMADIST: {
    description: "Devuelve la distribuci\xF3n gamma.",
    abstract: "Devuelve la distribuci\xF3n gamma.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-gamma-function-7327c94d-0f05-4511-83df-1dd7ed23e19e"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.GAMMA devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  GAMMAINV: {
    description: "Devuelve la inversa de la distribuci\xF3n gamma acumulativa.",
    abstract: "Devuelve la inversa de la distribuci\xF3n gamma acumulativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/gamma-inv-function-06393558-37ab-47d0-aa63-432f99e7916d"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n gamma." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." }
    }
  },
  HYPGEOMDIST: {
    description: "Devuelve la distribuci\xF3n hipergeom\xE9trica.",
    abstract: "Devuelve la distribuci\xF3n hipergeom\xE9trica.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-hipergeom-function-23e37961-2871-4195-9629-d0b2c108a12e"
      }
    ],
    functionParameter: {
      sampleS: { name: "muestra_\xE9xito", detail: "El n\xFAmero de \xE9xitos en la muestra." },
      numberSample: { name: "n\xFAm_muestra", detail: "El tama\xF1o de la muestra." },
      populationS: { name: "poblaci\xF3n_\xE9xito", detail: "El n\xFAmero de \xE9xitos en la poblaci\xF3n." },
      numberPop: { name: "n\xFAm_poblaci\xF3n", detail: "El tama\xF1o de la poblaci\xF3n." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.HIPERGEOM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  LOGINV: {
    description: "Devuelve la inversa de la funci\xF3n de distribuci\xF3n logar\xEDtmico-normal acumulativa.",
    abstract: "Devuelve la inversa de la funci\xF3n de distribuci\xF3n logar\xEDtmico-normal acumulativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-log-inv-function-0bd7631a-2725-482b-afb4-de23df77acfe"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad correspondiente a la distribuci\xF3n logar\xEDtmico-normal." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." }
    }
  },
  LOGNORMDIST: {
    description: "Devuelve la distribuci\xF3n logar\xEDtmico-normal acumulativa.",
    abstract: "Devuelve la distribuci\xF3n logar\xEDtmico-normal acumulativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-log-norm-function-f8d194cb-9ee3-4034-8c75-1bdb3884100b"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DIST.LOGNORM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  MODE: {
    description: "Devuelve el valor m\xE1s com\xFAn en un conjunto de datos.",
    abstract: "Devuelve el valor m\xE1s com\xFAn en un conjunto de datos.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/moda-function-e45192ce-9122-4980-82ed-4bdc34973120"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea calcular la moda." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros, referencias de celda o rangos adicionales para los que desea calcular la moda, hasta un m\xE1ximo de 255." }
    }
  },
  NEGBINOMDIST: {
    description: "Devuelve la distribuci\xF3n binomial negativa.",
    abstract: "Devuelve la distribuci\xF3n binomial negativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-neg-bin-function-f59b0a37-bae2-408d-b115-a315609ba714"
      }
    ],
    functionParameter: {
      numberF: { name: "n\xFAm_fracasos", detail: "El n\xFAmero de fracasos." },
      numberS: { name: "n\xFAm_\xE9xitos", detail: "El n\xFAmero umbral de \xE9xitos." },
      probabilityS: { name: "prob_\xE9xito", detail: "La probabilidad de un \xE9xito." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.NEGBINOM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  NORMDIST: {
    description: "Devuelve la distribuci\xF3n normal acumulativa.",
    abstract: "Devuelve la distribuci\xF3n normal acumulativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-norm-function-126db625-c53e-4591-9a22-c9ff422d6d58"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.NORM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  NORMINV: {
    description: "Devuelve la inversa de la distribuci\xF3n normal acumulativa.",
    abstract: "Devuelve la inversa de la distribuci\xF3n normal acumulativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-norm-inv-function-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad correspondiente a la distribuci\xF3n normal." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." }
    }
  },
  NORMSDIST: {
    description: "Devuelve la distribuci\xF3n normal est\xE1ndar acumulativa.",
    abstract: "Devuelve la distribuci\xF3n normal est\xE1ndar acumulativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-norm-estand-function-463369ea-0345-445d-802a-4ff0d6ce7cac"
      }
    ],
    functionParameter: {
      z: { name: "z", detail: "El valor para el que desea la distribuci\xF3n." }
    }
  },
  NORMSINV: {
    description: "Devuelve la inversa de la distribuci\xF3n normal est\xE1ndar acumulativa.",
    abstract: "Devuelve la inversa de la distribuci\xF3n normal est\xE1ndar acumulativa.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-norm-estand-inv-function-8d1bce66-8e4d-4f3b-967c-30eed61f019d"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad correspondiente a la distribuci\xF3n normal." }
    }
  },
  PERCENTILE: {
    description: "Devuelve el k-\xE9simo percentil de los valores de un conjunto de datos (incluye 0 y 1).",
    abstract: "Devuelve el k-\xE9simo percentil de los valores de un conjunto de datos (incluye 0 y 1).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/percentil-function-91b43a53-543c-4708-93de-d626debdddca"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos que define la posici\xF3n relativa." },
      k: { name: "k", detail: "El valor del percentil en el rango de 0 a 1 (incluidos)." }
    }
  },
  PERCENTRANK: {
    description: "Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1).",
    abstract: "Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/rango-percentil-function-f1b5836c-9619-4847-9fc9-080ec9024442"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos que define la posici\xF3n relativa." },
      x: { name: "x", detail: "El valor cuyo rango desea conocer." },
      significance: { name: "cifras_significativas", detail: "Un valor que identifica el n\xFAmero de d\xEDgitos significativos para el valor de porcentaje devuelto. Si se omite, RANGO.PERCENTIL.INC usa tres d\xEDgitos (0,xxx)." }
    }
  },
  POISSON: {
    description: "Devuelve la distribuci\xF3n de Poisson.",
    abstract: "Devuelve la distribuci\xF3n de Poisson.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/poisson-function-d81f7294-9d7c-4f75-bc23-80aa8624173a"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, POISSON devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de masa de probabilidad." }
    }
  },
  QUARTILE: {
    description: "Devuelve el cuartil de un conjunto de datos (incluye 0 y 1).",
    abstract: "Devuelve el cuartil de un conjunto de datos (incluye 0 y 1).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/cuartil-function-93cf8f62-60cd-4fdb-8a92-8451041e1a2a"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos para el que desea los valores de cuartil." },
      quart: { name: "cuartil", detail: "El valor de cuartil a devolver." }
    }
  },
  RANK: {
    description: "Devuelve el rango de un n\xFAmero en una lista de n\xFAmeros.",
    abstract: "Devuelve el rango de un n\xFAmero en una lista de n\xFAmeros.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/jerarquia-function-6a2fc49d-1831-4a03-9d8c-c279cf99f723"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero cuyo rango desea encontrar." },
      ref: { name: "ref", detail: "Una referencia a una lista de n\xFAmeros. Los valores no num\xE9ricos en ref se ignoran." },
      order: { name: "orden", detail: "Un n\xFAmero que especifica c\xF3mo clasificar el n\xFAmero. Si el orden es 0 (cero) u se omite, Microsoft Excel clasifica el n\xFAmero como si ref fuera una lista ordenada en orden descendente. Si el orden es cualquier valor distinto de cero, Microsoft Excel clasifica el n\xFAmero como si ref fuera una lista ordenada en orden ascendente." }
    }
  },
  STDEV: {
    description: "Estima la desviaci\xF3n est\xE1ndar bas\xE1ndose en una muestra. La desviaci\xF3n est\xE1ndar es una medida de la dispersi\xF3n de los valores con respecto al valor promedio (la media).",
    abstract: "Estima la desviaci\xF3n est\xE1ndar bas\xE1ndose en una muestra.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/desvest-function-51fecaaa-231e-4bbb-9230-33650a72c9b0"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una muestra de una poblaci\xF3n." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 255 correspondientes a una muestra de una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." }
    }
  },
  STDEVP: {
    description: "Calcula la desviaci\xF3n est\xE1ndar bas\xE1ndose en la poblaci\xF3n total dada como argumentos.",
    abstract: "Calcula la desviaci\xF3n est\xE1ndar bas\xE1ndose en la poblaci\xF3n total.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/desvestp-function-1f7c1c88-1bec-4422-8242-e9f7dc8bb195"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una poblaci\xF3n." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 255 correspondientes a una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." }
    }
  },
  TDIST: {
    description: "Devuelve la probabilidad de la distribuci\xF3n t de Student.",
    abstract: "Devuelve la probabilidad de la distribuci\xF3n t de Student.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/distr-t-function-630a7695-4021-4853-9468-4a1f9dcdd192"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor num\xE9rico en el que evaluar la distribuci\xF3n." },
      degFreedom: { name: "grados_libertad", detail: "Un entero que indica el n\xFAmero de grados de libertad." },
      tails: { name: "colas", detail: "Especifica el n\xFAmero de colas de distribuci\xF3n a devolver. Si Colas = 1, DISTR.T devuelve la distribuci\xF3n de una cola. Si Colas = 2, DISTR.T devuelve la distribuci\xF3n de dos colas." }
    }
  },
  TINV: {
    description: "Devuelve la inversa de la probabilidad de la distribuci\xF3n t de Student (dos colas).",
    abstract: "Devuelve la inversa de la probabilidad de la distribuci\xF3n t de Student (dos colas).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/inv-t-function-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "La probabilidad asociada con la distribuci\xF3n t de Student." },
      degFreedom: { name: "grados_libertad", detail: "Un entero que indica el n\xFAmero de grados de libertad." }
    }
  },
  TTEST: {
    description: "Devuelve la probabilidad asociada con una prueba t de Student.",
    abstract: "Devuelve la probabilidad asociada con una prueba t de Student.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/prueba-t-function-1696ffc1-4811-40fd-9d13-a0eaad83c7ae"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "La primera matriz o rango de datos." },
      array2: { name: "matriz2", detail: "La segunda matriz o rango de datos." },
      tails: { name: "colas", detail: "Especifica el n\xFAmero de colas de distribuci\xF3n. Si colas = 1, PRUEBA.T usa la distribuci\xF3n de una cola. Si colas = 2, PRUEBA.T usa la distribuci\xF3n de dos colas." },
      type: { name: "tipo", detail: "El tipo de prueba t a realizar." }
    }
  },
  VAR: {
    description: "Estima la varianza bas\xE1ndose en una muestra.",
    abstract: "Estima la varianza bas\xE1ndose en una muestra.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/var-function-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una muestra de una poblaci\xF3n." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 255 correspondientes a una muestra de una poblaci\xF3n." }
    }
  },
  VARP: {
    description: "Calcula la varianza bas\xE1ndose en la poblaci\xF3n total.",
    abstract: "Calcula la varianza bas\xE1ndose en la poblaci\xF3n total.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/varp-function-26a541c4-ecee-464d-a731-bd4c575b1a6b"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una poblaci\xF3n." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 255 correspondientes a una poblaci\xF3n." }
    }
  },
  WEIBULL: {
    description: "Devuelve la distribuci\xF3n de Weibull.",
    abstract: "Devuelve la distribuci\xF3n de Weibull.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/weibull-function-b83dc2c6-260b-4754-bef2-633196f6fdcc"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      cumulative: { name: "acumulado", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, WEIBULL devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  ZTEST: {
    description: "Devuelve el valor de probabilidad de una cola de una prueba z.",
    abstract: "Devuelve el valor de probabilidad de una cola de una prueba z.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/prueba-z-function-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos contra el que probar x." },
      x: { name: "x", detail: "El valor a probar." },
      sigma: { name: "sigma", detail: "La desviaci\xF3n est\xE1ndar de la poblaci\xF3n (conocida). Si se omite, se usa la desviaci\xF3n est\xE1ndar de la muestra." }
    }
  }
};
var es_ES_default20 = locale20;

// ../packages/sheets-formula/src/locale/function-list/cube/es-ES.ts
var locale21 = {
  CUBEKPIMEMBER: {
    description: "Devuelve una propiedad de indicador clave de rendimiento (KPI) y muestra el nombre del KPI en la celda. Un KPI es una medida cuantificable, como el beneficio bruto mensual o la rotaci\xF3n trimestral de empleados, que se utiliza para supervisar el rendimiento de una organizaci\xF3n.",
    abstract: "Devuelve una propiedad de indicador clave de rendimiento (KPI) y muestra el nombre del KPI en la celda. Un KPI es una medida cuantificable, como el beneficio bruto mensual o la rotaci\xF3n trimestral de empleados, que se utiliza para supervisar el rendimiento de una organizaci\xF3n.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cubekpimember-function-744608bf-2c62-42cd-b67a-a56109f4b03b"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  CUBEMEMBER: {
    description: "Devuelve un miembro o tupla del cubo. \xDAselo para validar que el miembro o la tupla existe en el cubo.",
    abstract: "Devuelve un miembro o tupla del cubo. \xDAselo para validar que el miembro o la tupla existe en el cubo.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cubemember-function-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  CUBEMEMBERPROPERTY: {
    description: "Devuelve el valor de una propiedad de miembro del cubo. \xDAselo para validar que existe un nombre de miembro dentro del cubo y para devolver la propiedad especificada para este miembro.",
    abstract: "Devuelve el valor de una propiedad de miembro del cubo. \xDAselo para validar que existe un nombre de miembro dentro del cubo y para devolver la propiedad especificada para este miembro.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cubememberproperty-function-001e57d6-b35a-49e5-abcd-05ff599e8951"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  CUBERANKEDMEMBER: {
    description: "Devuelve el en\xE9simo miembro, o clasificado, en un conjunto. \xDAselo para devolver uno o m\xE1s elementos en un conjunto, como el mejor vendedor o los 10 mejores estudiantes.",
    abstract: "Devuelve el en\xE9simo miembro, o clasificado, en un conjunto. \xDAselo para devolver uno o m\xE1s elementos en un conjunto, como el mejor vendedor o los 10 mejores estudiantes.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cuberankedmember-function-07efecde-e669-4075-b4bf-6b40df2dc4b3"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  CUBESET: {
    description: "Define un conjunto calculado de miembros o tuplas enviando una expresi\xF3n de conjunto al cubo en el servidor, que crea el conjunto y luego devuelve ese conjunto a Microsoft Excel.",
    abstract: "Define un conjunto calculado de miembros o tuplas enviando una expresi\xF3n de conjunto al cubo en el servidor, que crea el conjunto y luego devuelve ese conjunto a Microsoft Excel.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cubeset-function-5b2146bd-62d6-4d04-9d8f-670e993ee1d9"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  CUBESETCOUNT: {
    description: "Devuelve el n\xFAmero de elementos en un conjunto.",
    abstract: "Devuelve el n\xFAmero de elementos en un conjunto.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cubesetcount-function-c4c2a438-c1ff-4061-80fe-982f2d705286"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  CUBEVALUE: {
    description: "Devuelve un valor agregado del cubo.",
    abstract: "Devuelve un valor agregado del cubo.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cubevalue-function-8733da24-26d1-4e34-9b3a-84a8f00dcbe0"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  }
};
var es_ES_default21 = locale21;

// ../packages/sheets-formula/src/locale/function-list/database/es-ES.ts
var locale22 = {
  DAVERAGE: {
    description: "Devuelve el promedio de las entradas de base de datos seleccionadas",
    abstract: "Devuelve el promedio de las entradas de base de datos seleccionadas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/daverage-function-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DCOUNT: {
    description: "Cuenta las celdas que contienen n\xFAmeros en una base de datos",
    abstract: "Cuenta las celdas que contienen n\xFAmeros en una base de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dcount-function-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DCOUNTA: {
    description: "Cuenta las celdas no vac\xEDas en una base de datos",
    abstract: "Cuenta las celdas no vac\xEDas en una base de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dcounta-function-00232a6d-5a66-4a01-a25b-c1653fda1244"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DGET: {
    description: "Extrae de una base de datos un \xFAnico registro que coincide con los criterios especificados",
    abstract: "Extrae de una base de datos un \xFAnico registro que coincide con los criterios especificados",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dget-function-455568bf-4eef-45f7-90f0-ec250d00892e"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DMAX: {
    description: "Devuelve el valor m\xE1ximo de las entradas de base de datos seleccionadas",
    abstract: "Devuelve el valor m\xE1ximo de las entradas de base de datos seleccionadas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dmax-function-f4e8209d-8958-4c3d-a1ee-6351665d41c2"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DMIN: {
    description: "Devuelve el valor m\xEDnimo de las entradas de base de datos seleccionadas",
    abstract: "Devuelve el valor m\xEDnimo de las entradas de base de datos seleccionadas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dmin-function-4ae6f1d9-1f26-40f1-a783-6dc3680192a3"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DPRODUCT: {
    description: "Multiplica los valores en un campo particular de registros que coinciden con los criterios en una base de datos",
    abstract: "Multiplica los valores en un campo particular de registros que coinciden con los criterios en una base de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dproduct-function-4f96b13e-d49c-47a7-b769-22f6d017cb31"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DSTDEV: {
    description: "Estima la desviaci\xF3n est\xE1ndar basada en una muestra de entradas de base de datos seleccionadas",
    abstract: "Estima la desviaci\xF3n est\xE1ndar basada en una muestra de entradas de base de datos seleccionadas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dstdev-function-026b8c73-616d-4b5e-b072-241871c4ab96"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DSTDEVP: {
    description: "Calcula la desviaci\xF3n est\xE1ndar basada en la poblaci\xF3n completa de entradas de base de datos seleccionadas",
    abstract: "Calcula la desviaci\xF3n est\xE1ndar basada en la poblaci\xF3n completa de entradas de base de datos seleccionadas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dstdevp-function-04b78995-da03-4813-bbd9-d74fd0f5d94b"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DSUM: {
    description: "Suma los n\xFAmeros en la columna de campo de registros en la base de datos que coinciden con los criterios",
    abstract: "Suma los n\xFAmeros en la columna de campo de registros en la base de datos que coinciden con los criterios",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dsum-function-53181285-0c4b-4f5a-aaa3-529a322be41b"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DVAR: {
    description: "Estima la varianza basada en una muestra de entradas de base de datos seleccionadas",
    abstract: "Estima la varianza basada en una muestra de entradas de base de datos seleccionadas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dvar-function-d6747ca9-99c7-48bb-996e-9d7af00f3ed1"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  },
  DVARP: {
    description: "Calcula la varianza basada en la poblaci\xF3n completa de entradas de base de datos seleccionadas",
    abstract: "Calcula la varianza basada en la poblaci\xF3n completa de entradas de base de datos seleccionadas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dvarp-function-eb0ba387-9cb7-45c8-81e9-0394912502fc"
      }
    ],
    functionParameter: {
      database: { name: "base_datos", detail: "El rango de celdas que compone la lista o base de datos." },
      field: { name: "campo", detail: "Indica qu\xE9 columna se utiliza en la funci\xF3n." },
      criteria: { name: "criterios", detail: "El rango de celdas que contiene las condiciones que especifica." }
    }
  }
};
var es_ES_default22 = locale22;

// ../packages/sheets-formula/src/locale/function-list/date/es-ES.ts
var locale23 = {
  DATE: {
    description: "Devuelve el n\xFAmero de serie de una fecha particular",
    abstract: "Devuelve el n\xFAmero de serie de una fecha particular",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/date-function-e36c0c8c-4104-49da-ab83-82328b832349"
      }
    ],
    functionParameter: {
      year: { name: "a\xF1o", detail: "El valor del argumento a\xF1o puede incluir de uno a cuatro d\xEDgitos. Excel interpreta el argumento a\xF1o seg\xFAn el sistema de fechas que use su equipo. De forma predeterminada, Univer usa el sistema de fechas de 1900, lo que significa que la primera fecha es el 1 de enero de 1900." },
      month: { name: "mes", detail: "Un entero positivo o negativo que representa el mes del a\xF1o del 1 al 12 (enero a diciembre)." },
      day: { name: "d\xEDa", detail: "Un entero positivo o negativo que representa el d\xEDa del mes del 1 al 31." }
    }
  },
  DATEDIF: {
    description: "Calcula el n\xFAmero de d\xEDas, meses o a\xF1os entre dos fechas. Esta funci\xF3n es \xFAtil en f\xF3rmulas donde necesita calcular una edad.",
    abstract: "Calcula el n\xFAmero de d\xEDas, meses o a\xF1os entre dos fechas. Esta funci\xF3n es \xFAtil en f\xF3rmulas donde necesita calcular una edad.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/datedif-function-25dba1a4-2812-480b-84dd-8b32a451b35c"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la primera fecha, o fecha de inicio de un per\xEDodo determinado." },
      endDate: { name: "fecha_final", detail: "Una fecha que representa la \xFAltima fecha, o fecha de finalizaci\xF3n del per\xEDodo." },
      method: { name: "m\xE9todo", detail: "El tipo de informaci\xF3n que desea que se devuelva." }
    }
  },
  DATEVALUE: {
    description: "Convierte una fecha en forma de texto a un n\xFAmero de serie.",
    abstract: "Convierte una fecha en forma de texto a un n\xFAmero de serie",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252"
      }
    ],
    functionParameter: {
      dateText: { name: "texto_fecha", detail: 'Texto que representa una fecha en un formato de fecha de Excel, o una referencia a una celda que contiene texto que representa una fecha en un formato de fecha de Excel. Por ejemplo, "30/1/2008" o "30-Ene-2008" son cadenas de texto entre comillas que representan fechas.\\nUsando el sistema de fechas predeterminado en Microsoft Excel para Windows, el argumento texto_fecha debe representar una fecha entre el 1 de enero de 1900 y el 31 de diciembre de 9999. La funci\xF3n DATEVALUE devuelve el valor de error #VALUE! si el valor del argumento texto_fecha est\xE1 fuera de este rango.\\nSi se omite la parte del a\xF1o del argumento texto_fecha, la funci\xF3n DATEVALUE usa el a\xF1o actual del reloj integrado de su equipo. La informaci\xF3n de hora en el argumento texto_fecha se ignora.' }
    }
  },
  DAY: {
    description: "Devuelve el d\xEDa de una fecha, representado por un n\xFAmero de serie. El d\xEDa se proporciona como un entero que va del 1 al 31.",
    abstract: "Convierte un n\xFAmero de serie a un d\xEDa del mes",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/day-function-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "La fecha del d\xEDa que intenta encontrar. Las fechas deben introducirse usando la funci\xF3n DATE, o como resultados de otras f\xF3rmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el d\xEDa 23 de mayo de 2008." }
    }
  },
  DAYS: {
    description: "Devuelve el n\xFAmero de d\xEDas entre dos fechas",
    abstract: "Devuelve el n\xFAmero de d\xEDas entre dos fechas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/days-function-57740535-d549-4395-8728-0f07bff0b9df"
      }
    ],
    functionParameter: {
      endDate: { name: "fecha_final", detail: "Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el n\xFAmero de d\xEDas." },
      startDate: { name: "fecha_inicial", detail: "Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el n\xFAmero de d\xEDas." }
    }
  },
  DAYS360: {
    description: "Calcula el n\xFAmero de d\xEDas entre dos fechas bas\xE1ndose en un a\xF1o de 360 d\xEDas",
    abstract: "Calcula el n\xFAmero de d\xEDas entre dos fechas bas\xE1ndose en un a\xF1o de 360 d\xEDas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/days360-function-b9a509fd-49ef-407e-94df-0cbda5718c2a"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el n\xFAmero de d\xEDas." },
      endDate: { name: "fecha_final", detail: "Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el n\xFAmero de d\xEDas." },
      method: { name: "m\xE9todo", detail: "Un valor l\xF3gico que especifica si se usa el m\xE9todo estadounidense o europeo en el c\xE1lculo." }
    }
  },
  EDATE: {
    description: "Devuelve el n\xFAmero de serie que representa la fecha que est\xE1 el n\xFAmero indicado de meses antes o despu\xE9s de una fecha especificada (la fecha_inicial). Use EDATE para calcular fechas de vencimiento o fechas de vencimiento que caen en el mismo d\xEDa del mes que la fecha de emisi\xF3n.",
    abstract: "Devuelve el n\xFAmero de serie de la fecha que est\xE1 el n\xFAmero indicado de meses antes o despu\xE9s de la fecha inicial",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/edate-function-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la fecha inicial. Las fechas deben introducirse usando la funci\xF3n DATE, o como resultados de otras f\xF3rmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el d\xEDa 23 de mayo de 2008. Pueden ocurrir problemas si las fechas se introducen como texto." },
      months: { name: "meses", detail: "El n\xFAmero de meses antes o despu\xE9s de fecha_inicial. Un valor positivo para meses produce una fecha futura; un valor negativo produce una fecha pasada." }
    }
  },
  EOMONTH: {
    description: "Devuelve el n\xFAmero de serie del \xFAltimo d\xEDa del mes antes o despu\xE9s de un n\xFAmero especificado de meses",
    abstract: "Devuelve el n\xFAmero de serie del \xFAltimo d\xEDa del mes antes o despu\xE9s de un n\xFAmero especificado de meses",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/eomonth-function-7314ffa1-2bc9-4005-9d66-f49db127d628"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la fecha inicial." },
      months: { name: "meses", detail: "El n\xFAmero de meses antes o despu\xE9s de fecha_inicial." }
    }
  },
  EPOCHTODATE: {
    description: "Convierte una marca de tiempo de \xE9poca Unix en segundos, milisegundos o microsegundos a una fecha y hora en Tiempo Universal Coordinado (UTC).",
    abstract: "Convierte una marca de tiempo de \xE9poca Unix en segundos, milisegundos o microsegundos a una fecha y hora en Tiempo Universal Coordinado (UTC).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/13193461?hl=zh-Hans&sjid=2155433538747546473-AP"
      }
    ],
    functionParameter: {
      timestamp: { name: "marca_tiempo", detail: "Una marca de tiempo de \xE9poca Unix, en segundos, milisegundos o microsegundos." },
      unit: { name: "unidad", detail: "La unidad de tiempo en la que se expresa la marca de tiempo. 1 por defecto: \\n1 indica que la unidad de tiempo son segundos. \\n2 indica que la unidad de tiempo son milisegundos.\\n3 indica que la unidad de tiempo son microsegundos." }
    }
  },
  HOUR: {
    description: "Convierte un n\xFAmero de serie a una hora",
    abstract: "Convierte un n\xFAmero de serie a una hora",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/hour-function-a3afa879-86cb-4339-b1b5-2dd2d7310ac7"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "La fecha del d\xEDa que intenta encontrar. Las fechas deben introducirse usando la funci\xF3n DATE, o como resultados de otras f\xF3rmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el d\xEDa 23 de mayo de 2008." }
    }
  },
  ISOWEEKNUM: {
    description: "Devuelve el n\xFAmero de la semana ISO del a\xF1o para una fecha determinada",
    abstract: "Devuelve el n\xFAmero de la semana ISO del a\xF1o para una fecha determinada",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/isoweeknum-function-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e"
      }
    ],
    functionParameter: {
      date: { name: "fecha", detail: "Fecha es el c\xF3digo de fecha y hora utilizado por Excel para el c\xE1lculo de fecha y hora." }
    }
  },
  MINUTE: {
    description: "Convierte un n\xFAmero de serie a un minuto",
    abstract: "Convierte un n\xFAmero de serie a un minuto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/minute-function-af728df0-05c4-4b07-9eed-a84801a60589"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "La fecha del d\xEDa que intenta encontrar. Las fechas deben introducirse usando la funci\xF3n DATE, o como resultados de otras f\xF3rmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el d\xEDa 23 de mayo de 2008." }
    }
  },
  MONTH: {
    description: "Devuelve el mes de una fecha representada por un n\xFAmero de serie. El mes se proporciona como un entero, que va del 1 (enero) al 12 (diciembre).",
    abstract: "Convierte un n\xFAmero de serie a un mes",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/month-function-579a2881-199b-48b2-ab90-ddba0eba86e8"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "La fecha del mes que intenta encontrar. Las fechas deben introducirse usando la funci\xF3n DATE, o como resultados de otras f\xF3rmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el d\xEDa 23 de mayo de 2008." }
    }
  },
  NETWORKDAYS: {
    description: "Devuelve el n\xFAmero de d\xEDas laborables completos entre dos fechas",
    abstract: "Devuelve el n\xFAmero de d\xEDas laborables completos entre dos fechas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la fecha inicial." },
      endDate: { name: "fecha_final", detail: "Una fecha que representa la fecha final." },
      holidays: { name: "d\xEDas_festivos", detail: "Un rango opcional de una o m\xE1s fechas para excluir del calendario laboral, como d\xEDas festivos estatales y federales y d\xEDas festivos flotantes." }
    }
  },
  NETWORKDAYS_INTL: {
    description: "Devuelve el n\xFAmero de d\xEDas laborables completos entre dos fechas usando par\xE1metros para indicar cu\xE1les y cu\xE1ntos d\xEDas son d\xEDas de fin de semana",
    abstract: "Devuelve el n\xFAmero de d\xEDas laborables completos entre dos fechas usando par\xE1metros para indicar cu\xE1les y cu\xE1ntos d\xEDas son d\xEDas de fin de semana",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/networkdays-intl-function-a9b26239-4f20-46a1-9ab8-4e925bfd5e28"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la fecha inicial." },
      endDate: { name: "fecha_final", detail: "Una fecha que representa la fecha final." },
      weekend: { name: "fin_semana", detail: "es un n\xFAmero o cadena de fin de semana que especifica cu\xE1ndo ocurren los fines de semana." },
      holidays: { name: "d\xEDas_festivos", detail: "Un rango opcional de una o m\xE1s fechas para excluir del calendario laboral, como d\xEDas festivos estatales y federales y d\xEDas festivos flotantes." }
    }
  },
  NOW: {
    description: "Devuelve el n\xFAmero de serie de la fecha y hora actuales.",
    abstract: "Devuelve el n\xFAmero de serie de la fecha y hora actuales",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/now-function-3337fd29-145a-4347-b2e6-20c904739c46"
      }
    ],
    functionParameter: {}
  },
  SECOND: {
    description: "Convierte un n\xFAmero de serie a un segundo",
    abstract: "Convierte un n\xFAmero de serie a un segundo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/second-function-740d1cfc-553c-4099-b668-80eaa24e8af1"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "La fecha del d\xEDa que intenta encontrar. Las fechas deben introducirse usando la funci\xF3n DATE, o como resultados de otras f\xF3rmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el d\xEDa 23 de mayo de 2008." }
    }
  },
  TIME: {
    description: "Devuelve el n\xFAmero de serie de una hora particular.",
    abstract: "Devuelve el n\xFAmero de serie de una hora particular",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/time-function-9a5aff99-8f7d-4611-845e-747d0b8d5457"
      }
    ],
    functionParameter: {
      hour: { name: "hora", detail: "Un n\xFAmero del 0 (cero) al 32767 que representa la hora. Cualquier valor mayor que 23 se dividir\xE1 por 24 y el resto se tratar\xE1 como el valor de la hora. Por ejemplo, TIME(27,0,0) = TIME(3,0,0) = .125 o 3:00 AM." },
      minute: { name: "minuto", detail: "Un n\xFAmero del 0 al 32767 que representa el minuto. Cualquier valor mayor que 59 se convertir\xE1 a horas y minutos. Por ejemplo, TIME(0,750,0) = TIME(12,30,0) = .520833 o 12:30 PM." },
      second: { name: "segundo", detail: "Un n\xFAmero del 0 al 32767 que representa el segundo. Cualquier valor mayor que 59 se convertir\xE1 a horas, minutos y segundos. Por ejemplo, TIME(0,0,2000) = TIME(0,33,22) = .023148 o 12:33:20 AM." }
    }
  },
  TIMEVALUE: {
    description: "Convierte una hora en forma de texto a un n\xFAmero de serie.",
    abstract: "Convierte una hora en forma de texto a un n\xFAmero de serie",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/timevalue-function-0b615c12-33d8-4431-bf3d-f3eb6d186645"
      }
    ],
    functionParameter: {
      timeText: { name: "texto_hora", detail: 'Una cadena de texto que representa una hora en cualquiera de los formatos de hora de Microsoft Excel; por ejemplo, "6:45 PM" y "18:45" cadenas de texto entre comillas que representan hora.' }
    }
  },
  TO_DATE: {
    description: "Convierte un n\xFAmero proporcionado a una fecha.",
    abstract: "Convierte un n\xFAmero proporcionado a una fecha.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/3094239?hl=en&sjid=2155433538747546473-AP"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El argumento o referencia a una celda que se convertir\xE1 a una fecha." }
    }
  },
  TODAY: {
    description: "Devuelve el n\xFAmero de serie de la fecha de hoy",
    abstract: "Devuelve el n\xFAmero de serie de la fecha de hoy",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/today-function-5eb3078d-a82c-4736-8930-2f51a028fdd9"
      }
    ],
    functionParameter: {}
  },
  WEEKDAY: {
    description: "Convierte un n\xFAmero de serie a un d\xEDa de la semana",
    abstract: "Convierte un n\xFAmero de serie a un d\xEDa de la semana",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/weekday-function-60e44483-2ed1-439f-8bd0-e404c190949a"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "Un n\xFAmero secuencial que representa la fecha del d\xEDa que intenta encontrar." },
      returnType: { name: "tipo_devuelto", detail: "Un n\xFAmero que determina el tipo de valor devuelto." }
    }
  },
  WEEKNUM: {
    description: "Convierte un n\xFAmero de serie a un n\xFAmero que representa d\xF3nde cae la semana num\xE9ricamente dentro de un a\xF1o",
    abstract: "Convierte un n\xFAmero de serie a un n\xFAmero que representa d\xF3nde cae la semana num\xE9ricamente dentro de un a\xF1o",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/weeknum-function-e5c43a03-b4ab-426c-b411-b18c13c75340"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "Una fecha dentro de la semana." },
      returnType: { name: "tipo_devuelto", detail: "Un n\xFAmero que determina en qu\xE9 d\xEDa comienza la semana. El predeterminado es 1." }
    }
  },
  WORKDAY: {
    description: "Devuelve el n\xFAmero de serie de la fecha antes o despu\xE9s de un n\xFAmero especificado de d\xEDas laborables",
    abstract: "Devuelve el n\xFAmero de serie de la fecha antes o despu\xE9s de un n\xFAmero especificado de d\xEDas laborables",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la fecha inicial." },
      days: { name: "d\xEDas", detail: "El n\xFAmero de d\xEDas no fines de semana y no festivos antes o despu\xE9s de fecha_inicial. Un valor positivo para d\xEDas produce una fecha futura; un valor negativo produce una fecha pasada." },
      holidays: { name: "d\xEDas_festivos", detail: "Un rango opcional de una o m\xE1s fechas para excluir del calendario laboral, como d\xEDas festivos estatales y federales y d\xEDas festivos flotantes." }
    }
  },
  WORKDAY_INTL: {
    description: "Devuelve el n\xFAmero de serie de la fecha antes o despu\xE9s de un n\xFAmero especificado de d\xEDas laborables usando par\xE1metros para indicar cu\xE1les y cu\xE1ntos d\xEDas son d\xEDas de fin de semana",
    abstract: "Devuelve el n\xFAmero de serie de la fecha antes o despu\xE9s de un n\xFAmero especificado de d\xEDas laborables usando par\xE1metros para indicar cu\xE1les y cu\xE1ntos d\xEDas son d\xEDas de fin de semana",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/workday-intl-function-a378391c-9ba7-4678-8a39-39611a9bf81d"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la fecha inicial." },
      days: { name: "d\xEDas", detail: "El n\xFAmero de d\xEDas no fines de semana y no festivos antes o despu\xE9s de fecha_inicial. Un valor positivo para d\xEDas produce una fecha futura; un valor negativo produce una fecha pasada." },
      weekend: { name: "fin_semana", detail: "es un n\xFAmero o cadena de fin de semana que especifica cu\xE1ndo ocurren los fines de semana." },
      holidays: { name: "d\xEDas_festivos", detail: "Un rango opcional de una o m\xE1s fechas para excluir del calendario laboral, como d\xEDas festivos estatales y federales y d\xEDas festivos flotantes." }
    }
  },
  YEAR: {
    description: "Devuelve el a\xF1o correspondiente a una fecha. El a\xF1o se devuelve como un entero en el rango 1900-9999.",
    abstract: "Convierte un n\xFAmero de serie a un a\xF1o",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/year-function-c64f017a-1354-490d-981f-578e8ec8d3b9"
      }
    ],
    functionParameter: {
      serialNumber: { name: "n\xFAmero_serie", detail: "La fecha del a\xF1o que desea encontrar. Las fechas deben introducirse usando la funci\xF3n DATE, o como resultados de otras f\xF3rmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el d\xEDa 23 de mayo de 2008. Pueden ocurrir problemas si las fechas se introducen como texto." }
    }
  },
  YEARFRAC: {
    description: "Devuelve la fracci\xF3n de a\xF1o que representa el n\xFAmero de d\xEDas completos entre fecha_inicial y fecha_final",
    abstract: "Devuelve la fracci\xF3n de a\xF1o que representa el n\xFAmero de d\xEDas completos entre fecha_inicial y fecha_final",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/yearfrac-function-3844141e-c76d-4143-82b6-208454ddc6a8"
      }
    ],
    functionParameter: {
      startDate: { name: "fecha_inicial", detail: "Una fecha que representa la fecha inicial." },
      endDate: { name: "fecha_final", detail: "Una fecha que representa la fecha final." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se utilizar\xE1." }
    }
  }
};
var es_ES_default23 = locale23;

// ../packages/sheets-formula/src/locale/function-list/engineering/es-ES.ts
var locale24 = {
  BESSELI: {
    description: "Devuelve la funci\xF3n de Bessel modificada In(x)",
    abstract: "Devuelve la funci\xF3n de Bessel modificada In(x)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/besseli-function-8d33855c-9a8d-444b-98e0-852267b1c0df"
      }
    ],
    functionParameter: {
      x: { name: "X", detail: "El valor en el que se eval\xFAa la funci\xF3n." },
      n: { name: "N", detail: "El orden de la funci\xF3n de Bessel. Si n no es un entero, se trunca." }
    }
  },
  BESSELJ: {
    description: "Devuelve la funci\xF3n de Bessel Jn(x)",
    abstract: "Devuelve la funci\xF3n de Bessel Jn(x)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/besselj-function-839cb181-48de-408b-9d80-bd02982d94f7"
      }
    ],
    functionParameter: {
      x: { name: "X", detail: "El valor en el que se eval\xFAa la funci\xF3n." },
      n: { name: "N", detail: "El orden de la funci\xF3n de Bessel. Si n no es un entero, se trunca." }
    }
  },
  BESSELK: {
    description: "Devuelve la funci\xF3n de Bessel modificada Kn(x)",
    abstract: "Devuelve la funci\xF3n de Bessel modificada Kn(x)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/besselk-function-606d11bc-06d3-4d53-9ecb-2803e2b90b70"
      }
    ],
    functionParameter: {
      x: { name: "X", detail: "El valor en el que se eval\xFAa la funci\xF3n." },
      n: { name: "N", detail: "El orden de la funci\xF3n de Bessel. Si n no es un entero, se trunca." }
    }
  },
  BESSELY: {
    description: "Devuelve la funci\xF3n de Bessel Yn(x)",
    abstract: "Devuelve la funci\xF3n de Bessel Yn(x)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bessely-function-f3a356b3-da89-42c3-8974-2da54d6353a2"
      }
    ],
    functionParameter: {
      x: { name: "X", detail: "El valor en el que se eval\xFAa la funci\xF3n." },
      n: { name: "N", detail: "El orden de la funci\xF3n de Bessel. Si n no es un entero, se trunca." }
    }
  },
  BIN2DEC: {
    description: "Convierte un n\xFAmero binario a decimal",
    abstract: "Convierte un n\xFAmero binario a decimal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bin2dec-function-63905b57-b3a0-453d-99f4-647bb519cd6c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero binario que desea convertir." }
    }
  },
  BIN2HEX: {
    description: "Convierte un n\xFAmero binario a hexadecimal",
    abstract: "Convierte un n\xFAmero binario a hexadecimal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bin2hex-function-0375e507-f5e5-4077-9af8-28d84f9f41cc"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero binario que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  BIN2OCT: {
    description: "Convierte un n\xFAmero binario a octal",
    abstract: "Convierte un n\xFAmero binario a octal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bin2oct-function-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero binario que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  BITAND: {
    description: 'Devuelve una "Y bit a bit" de dos n\xFAmeros',
    abstract: 'Devuelve una "Y bit a bit" de dos n\xFAmeros',
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bitand-function-8a2be3d7-91c3-4b48-9517-64548008563a"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "Debe estar en forma decimal y ser mayor o igual a 0." },
      number2: { name: "n\xFAmero2", detail: "Debe estar en forma decimal y ser mayor o igual a 0." }
    }
  },
  BITLSHIFT: {
    description: "Devuelve un n\xFAmero de valor desplazado a la izquierda por cantidad_desplazamiento bits",
    abstract: "Devuelve un n\xFAmero de valor desplazado a la izquierda por cantidad_desplazamiento bits",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bitlshift-function-c55bb27e-cacd-4c7c-b258-d80861a03c9c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "N\xFAmero debe ser un entero mayor o igual a 0." },
      shiftAmount: { name: "cantidad_desplazamiento", detail: "Cantidad_desplazamiento debe ser un entero." }
    }
  },
  BITOR: {
    description: "Devuelve un O bit a bit de 2 n\xFAmeros",
    abstract: "Devuelve un O bit a bit de 2 n\xFAmeros",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bitor-function-f6ead5c8-5b98-4c9e-9053-8ad5234919b2"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "Debe estar en forma decimal y ser mayor o igual a 0." },
      number2: { name: "n\xFAmero2", detail: "Debe estar en forma decimal y ser mayor o igual a 0." }
    }
  },
  BITRSHIFT: {
    description: "Devuelve un n\xFAmero de valor desplazado a la derecha por cantidad_desplazamiento bits",
    abstract: "Devuelve un n\xFAmero de valor desplazado a la derecha por cantidad_desplazamiento bits",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bitrshift-function-274d6996-f42c-4743-abdb-4ff95351222c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "N\xFAmero debe ser un entero mayor o igual a 0." },
      shiftAmount: { name: "cantidad_desplazamiento", detail: "Cantidad_desplazamiento debe ser un entero." }
    }
  },
  BITXOR: {
    description: 'Devuelve un "O exclusivo" bit a bit de dos n\xFAmeros',
    abstract: 'Devuelve un "O exclusivo" bit a bit de dos n\xFAmeros',
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/bitxor-function-c81306a1-03f9-4e89-85ac-b86c3cba10e4"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "Debe estar en forma decimal y ser mayor o igual a 0." },
      number2: { name: "n\xFAmero2", detail: "Debe estar en forma decimal y ser mayor o igual a 0." }
    }
  },
  COMPLEX: {
    description: "Convierte coeficientes reales e imaginarios en un n\xFAmero complejo",
    abstract: "Convierte coeficientes reales e imaginarios en un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/complex-function-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128"
      }
    ],
    functionParameter: {
      realNum: { name: "n\xFAm_real", detail: "El coeficiente real del n\xFAmero complejo." },
      iNum: { name: "n\xFAm_i", detail: "El coeficiente imaginario del n\xFAmero complejo." },
      suffix: { name: "sufijo", detail: 'El sufijo para el componente imaginario del n\xFAmero complejo. Si se omite, se supone que el sufijo es "i".' }
    }
  },
  CONVERT: {
    description: "Convierte un n\xFAmero de un sistema de medida a otro",
    abstract: "Convierte un n\xFAmero de un sistema de medida a otro",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/convert-function-d785bef1-808e-4aac-bdcd-666c810f9af2"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "es el valor en unidades_origen que se va a convertir." },
      fromUnit: { name: "unidad_origen", detail: "son las unidades de n\xFAmero." },
      toUnit: { name: "unidad_destino", detail: "son las unidades para el resultado." }
    }
  },
  DEC2BIN: {
    description: "Convierte un n\xFAmero decimal a binario",
    abstract: "Convierte un n\xFAmero decimal a binario",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dec2bin-function-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero decimal que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  DEC2HEX: {
    description: "Convierte un n\xFAmero decimal a hexadecimal",
    abstract: "Convierte un n\xFAmero decimal a hexadecimal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dec2hex-function-6344ee8b-b6b5-4c6a-a672-f64666704619"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero decimal que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  DEC2OCT: {
    description: "Convierte un n\xFAmero decimal a octal",
    abstract: "Convierte un n\xFAmero decimal a octal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dec2oct-function-c9d835ca-20b7-40c4-8a9e-d3be351ce00f"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero decimal que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  DELTA: {
    description: "Comprueba si dos valores son iguales",
    abstract: "Comprueba si dos valores son iguales",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/delta-function-2f763672-c959-4e07-ac33-fe03220ba432"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero." },
      number2: { name: "n\xFAmero2", detail: "El segundo n\xFAmero. Si se omite, se supone que n\xFAmero2 es cero." }
    }
  },
  ERF: {
    description: "Devuelve la funci\xF3n de error",
    abstract: "Devuelve la funci\xF3n de error",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/erf-function-c53c7e7b-5482-4b6c-883e-56df3c9af349"
      }
    ],
    functionParameter: {
      lowerLimit: { name: "l\xEDmite_inferior", detail: "El l\xEDmite inferior para integrar ERF." },
      upperLimit: { name: "l\xEDmite_superior", detail: "El l\xEDmite superior para integrar ERF. Si se omite, ERF integra entre cero y l\xEDmite_inferior." }
    }
  },
  ERF_PRECISE: {
    description: "Devuelve la funci\xF3n de error",
    abstract: "Devuelve la funci\xF3n de error",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/erf-precise-function-9a349593-705c-4278-9a98-e4122831a8e0"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El l\xEDmite inferior para integrar ERF.PRECISE." }
    }
  },
  ERFC: {
    description: "Devuelve la funci\xF3n de error complementaria",
    abstract: "Devuelve la funci\xF3n de error complementaria",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/erfc-function-736e0318-70ba-4e8b-8d08-461fe68b71b3"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El l\xEDmite inferior para integrar ERFC." }
    }
  },
  ERFC_PRECISE: {
    description: "Devuelve la funci\xF3n ERF complementaria integrada entre x e infinito",
    abstract: "Devuelve la funci\xF3n ERF complementaria integrada entre x e infinito",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/erfc-precise-function-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El l\xEDmite inferior para integrar ERFC.PRECISE." }
    }
  },
  GESTEP: {
    description: "Comprueba si un n\xFAmero es mayor que un valor umbral",
    abstract: "Comprueba si un n\xFAmero es mayor que un valor umbral",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/gestep-function-f37e7d2a-41da-4129-be95-640883fca9df"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor que se va a probar contra escal\xF3n." },
      step: { name: "escal\xF3n", detail: "El valor umbral. Si omite un valor para escal\xF3n, GESTEP usa cero." }
    }
  },
  HEX2BIN: {
    description: "Convierte un n\xFAmero hexadecimal a binario",
    abstract: "Convierte un n\xFAmero hexadecimal a binario",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/hex2bin-function-a13aafaa-5737-4920-8424-643e581828c1"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero hexadecimal que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  HEX2DEC: {
    description: "Convierte un n\xFAmero hexadecimal a decimal",
    abstract: "Convierte un n\xFAmero hexadecimal a decimal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/hex2dec-function-8c8c3155-9f37-45a5-a3ee-ee5379ef106e"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero hexadecimal que desea convertir." }
    }
  },
  HEX2OCT: {
    description: "Convierte un n\xFAmero hexadecimal a octal",
    abstract: "Convierte un n\xFAmero hexadecimal a octal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/hex2oct-function-54d52808-5d19-4bd0-8a63-1096a5d11912"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero hexadecimal que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  IMABS: {
    description: "Devuelve el valor absoluto (m\xF3dulo) de un n\xFAmero complejo",
    abstract: "Devuelve el valor absoluto (m\xF3dulo) de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imabs-function-b31e73c6-d90c-4062-90bc-8eb351d765a1"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el valor absoluto." }
    }
  },
  IMAGINARY: {
    description: "Devuelve el coeficiente imaginario de un n\xFAmero complejo",
    abstract: "Devuelve el coeficiente imaginario de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imaginary-function-dd5952fd-473d-44d9-95a1-9a17b23e428a"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el coeficiente imaginario." }
    }
  },
  IMARGUMENT: {
    description: "Devuelve el argumento theta, un \xE1ngulo expresado en radianes",
    abstract: "Devuelve el argumento theta, un \xE1ngulo expresado en radianes",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imargument-function-eed37ec1-23b3-4f59-b9f3-d340358a034a"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el argumento theta." }
    }
  },
  IMCONJUGATE: {
    description: "Devuelve el conjugado complejo de un n\xFAmero complejo",
    abstract: "Devuelve el conjugado complejo de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imconjugate-function-2e2fc1ea-f32b-4f9b-9de6-233853bafd42"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el conjugado." }
    }
  },
  IMCOS: {
    description: "Devuelve el coseno de un n\xFAmero complejo",
    abstract: "Devuelve el coseno de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imcos-function-dad75277-f592-4a6b-ad6c-be93a808a53c"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el coseno." }
    }
  },
  IMCOSH: {
    description: "Devuelve el coseno hiperb\xF3lico de un n\xFAmero complejo",
    abstract: "Devuelve el coseno hiperb\xF3lico de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imcosh-function-053e4ddb-4122-458b-be9a-457c405e90ff"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el coseno hiperb\xF3lico." }
    }
  },
  IMCOT: {
    description: "Devuelve la cotangente de un n\xFAmero complejo",
    abstract: "Devuelve la cotangente de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imcot-function-dc6a3607-d26a-4d06-8b41-8931da36442c"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la cotangente." }
    }
  },
  IMCOTH: {
    description: "Devuelve la cotangente hiperb\xF3lica de un n\xFAmero complejo",
    abstract: "Devuelve la cotangente hiperb\xF3lica de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/9366256?hl=en&sjid=1719420110567985051-AP"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la cotangente hiperb\xF3lica." }
    }
  },
  IMCSC: {
    description: "Devuelve la cosecante de un n\xFAmero complejo",
    abstract: "Devuelve la cosecante de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imcsc-function-9e158d8f-2ddf-46cd-9b1d-98e29904a323"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la cosecante." }
    }
  },
  IMCSCH: {
    description: "Devuelve la cosecante hiperb\xF3lica de un n\xFAmero complejo",
    abstract: "Devuelve la cosecante hiperb\xF3lica de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imcsch-function-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la cosecante hiperb\xF3lica." }
    }
  },
  IMDIV: {
    description: "Devuelve el cociente de dos n\xFAmeros complejos",
    abstract: "Devuelve el cociente de dos n\xFAmeros complejos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imdiv-function-a505aff7-af8a-4451-8142-77ec3d74d83f"
      }
    ],
    functionParameter: {
      inumber1: { name: "n\xFAm_imaginario1", detail: "El numerador o dividendo complejo." },
      inumber2: { name: "n\xFAm_imaginario2", detail: "El denominador o divisor complejo." }
    }
  },
  IMEXP: {
    description: "Devuelve la exponencial de un n\xFAmero complejo",
    abstract: "Devuelve la exponencial de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imexp-function-c6f8da1f-e024-4c0c-b802-a60e7147a95f"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la exponencial." }
    }
  },
  IMLN: {
    description: "Devuelve el logaritmo natural de un n\xFAmero complejo",
    abstract: "Devuelve el logaritmo natural de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imln-function-32b98bcf-8b81-437c-a636-6fb3aad509d8"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el logaritmo natural." }
    }
  },
  IMLOG: {
    description: "Devuelve el logaritmo de un n\xFAmero complejo para una base especificada",
    abstract: "Devuelve el logaritmo de un n\xFAmero complejo para una base especificada",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/9366486?hl=zh-Hans&sjid=1719420110567985051-AP"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo cuyo logaritmo a una base espec\xEDfica se debe calcular." },
      base: { name: "base", detail: "La base que se usa al calcular el logaritmo." }
    }
  },
  IMLOG10: {
    description: "Devuelve el logaritmo en base 10 de un n\xFAmero complejo",
    abstract: "Devuelve el logaritmo en base 10 de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imlog10-function-58200fca-e2a2-4271-8a98-ccd4360213a5"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el logaritmo com\xFAn." }
    }
  },
  IMLOG2: {
    description: "Devuelve el logaritmo en base 2 de un n\xFAmero complejo",
    abstract: "Devuelve el logaritmo en base 2 de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imlog2-function-152e13b4-bc79-486c-a243-e6a676878c51"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el logaritmo en base 2." }
    }
  },
  IMPOWER: {
    description: "Devuelve un n\xFAmero complejo elevado a una potencia entera",
    abstract: "Devuelve un n\xFAmero complejo elevado a una potencia entera",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/impower-function-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo que desea elevar a una potencia." },
      number: { name: "n\xFAmero", detail: "La potencia a la que desea elevar el n\xFAmero complejo." }
    }
  },
  IMPRODUCT: {
    description: "Devuelve el producto de 1 a 255 n\xFAmeros complejos",
    abstract: "Devuelve el producto de 1 a 255 n\xFAmeros complejos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/improduct-function-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba"
      }
    ],
    functionParameter: {
      inumber1: { name: "n\xFAm_imaginario1", detail: "De 1 a 255 n\xFAmeros complejos para multiplicar." },
      inumber2: { name: "n\xFAm_imaginario2", detail: "De 1 a 255 n\xFAmeros complejos para multiplicar." }
    }
  },
  IMREAL: {
    description: "Devuelve el coeficiente real de un n\xFAmero complejo",
    abstract: "Devuelve el coeficiente real de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imreal-function-d12bc4c0-25d0-4bb3-a25f-ece1938bf366"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el coeficiente real." }
    }
  },
  IMSEC: {
    description: "Devuelve la secante de un n\xFAmero complejo",
    abstract: "Devuelve la secante de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imsec-function-6df11132-4411-4df4-a3dc-1f17372459e0"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la secante." }
    }
  },
  IMSECH: {
    description: "Devuelve la secante hiperb\xF3lica de un n\xFAmero complejo",
    abstract: "Devuelve la secante hiperb\xF3lica de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imsech-function-f250304f-788b-4505-954e-eb01fa50903b"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la secante hiperb\xF3lica." }
    }
  },
  IMSIN: {
    description: "Devuelve el seno de un n\xFAmero complejo",
    abstract: "Devuelve el seno de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imsin-function-1ab02a39-a721-48de-82ef-f52bf37859f6"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el seno." }
    }
  },
  IMSINH: {
    description: "Devuelve el seno hiperb\xF3lico de un n\xFAmero complejo",
    abstract: "Devuelve el seno hiperb\xF3lico de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imsinh-function-dfb9ec9e-8783-4985-8c42-b028e9e8da3d"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener el seno hiperb\xF3lico." }
    }
  },
  IMSQRT: {
    description: "Devuelve la ra\xEDz cuadrada de un n\xFAmero complejo",
    abstract: "Devuelve la ra\xEDz cuadrada de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imsqrt-function-e1753f80-ba11-4664-a10e-e17368396b70"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la ra\xEDz cuadrada." }
    }
  },
  IMSUB: {
    description: "Devuelve la diferencia entre dos n\xFAmeros complejos",
    abstract: "Devuelve la diferencia entre dos n\xFAmeros complejos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imsub-function-2e404b4d-4935-4e85-9f52-cb08b9a45054"
      }
    ],
    functionParameter: {
      inumber1: { name: "n\xFAm_imaginario1", detail: "n\xFAm_imaginario1." },
      inumber2: { name: "n\xFAm_imaginario2", detail: "n\xFAm_imaginario2." }
    }
  },
  IMSUM: {
    description: "Devuelve la suma de n\xFAmeros complejos",
    abstract: "Devuelve la suma de n\xFAmeros complejos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imsum-function-81542999-5f1c-4da6-9ffe-f1d7aaa9457f"
      }
    ],
    functionParameter: {
      inumber1: { name: "n\xFAm_imaginario1", detail: "De 1 a 255 n\xFAmeros complejos para sumar." },
      inumber2: { name: "n\xFAm_imaginario2", detail: "De 1 a 255 n\xFAmeros complejos para sumar." }
    }
  },
  IMTAN: {
    description: "Devuelve la tangente de un n\xFAmero complejo",
    abstract: "Devuelve la tangente de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/imtan-function-8478f45d-610a-43cf-8544-9fc0b553a132"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la tangente." }
    }
  },
  IMTANH: {
    description: "Devuelve la tangente hiperb\xF3lica de un n\xFAmero complejo",
    abstract: "Devuelve la tangente hiperb\xF3lica de un n\xFAmero complejo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/9366655?hl=en&sjid=1719420110567985051-AP"
      }
    ],
    functionParameter: {
      inumber: { name: "n\xFAm_imaginario", detail: "Un n\xFAmero complejo del que desea obtener la tangente hiperb\xF3lica." }
    }
  },
  OCT2BIN: {
    description: "Convierte un n\xFAmero octal a binario",
    abstract: "Convierte un n\xFAmero octal a binario",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/oct2bin-function-55383471-3c56-4d27-9522-1a8ec646c589"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero octal que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  },
  OCT2DEC: {
    description: "Convierte un n\xFAmero octal a decimal",
    abstract: "Convierte un n\xFAmero octal a decimal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/oct2dec-function-87606014-cb98-44b2-8dbb-e48f8ced1554"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero octal que desea convertir." }
    }
  },
  OCT2HEX: {
    description: "Convierte un n\xFAmero octal a hexadecimal",
    abstract: "Convierte un n\xFAmero octal a hexadecimal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/oct2hex-function-912175b4-d497-41b4-a029-221f051b858f"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero octal que desea convertir." },
      places: { name: "posiciones", detail: "El n\xFAmero de caracteres que se van a usar." }
    }
  }
};
var es_ES_default24 = locale24;

// ../packages/sheets-formula/src/locale/function-list/financial/es-ES.ts
var locale25 = {
  ACCRINT: {
    description: "Devuelve el inter\xE9s acumulado de un valor que paga intereses peri\xF3dicos",
    abstract: "Devuelve el inter\xE9s acumulado de un valor que paga intereses peri\xF3dicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/accrint-function-fe45d089-6722-4fb3-9379-e1f911d8dc74"
      }
    ],
    functionParameter: {
      issue: { name: "emisi\xF3n", detail: "La fecha de emisi\xF3n del valor." },
      firstInterest: { name: "primer_inter\xE9s", detail: "La fecha del primer inter\xE9s del valor." },
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de vencimiento del valor." },
      rate: { name: "tasa", detail: "La tasa de cup\xF3n anual del valor." },
      par: { name: "valor_nominal", detail: "El valor nominal del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." },
      calcMethod: { name: "m\xE9todo_c\xE1lculo", detail: "Es un valor l\xF3gico: el inter\xE9s se acumula desde la fecha de emisi\xF3n = VERDADERO o se ignora; el inter\xE9s se acumula desde la fecha del \xFAltimo pago de cup\xF3n = FALSO." }
    }
  },
  ACCRINTM: {
    description: "Devuelve el inter\xE9s acumulado de un valor que paga intereses al vencimiento",
    abstract: "Devuelve el inter\xE9s acumulado de un valor que paga intereses al vencimiento",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/accrintm-function-f62f01f9-5754-4cc4-805b-0e70199328a7"
      }
    ],
    functionParameter: {
      issue: { name: "emisi\xF3n", detail: "La fecha de emisi\xF3n del valor." },
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de vencimiento del valor." },
      rate: { name: "tasa", detail: "La tasa de cup\xF3n anual del valor." },
      par: { name: "valor_nominal", detail: "El valor nominal del valor." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  AMORDEGRC: {
    description: "Devuelve la depreciaci\xF3n de cada periodo contable mediante un coeficiente de depreciaci\xF3n",
    abstract: "Devuelve la depreciaci\xF3n de cada periodo contable mediante un coeficiente de depreciaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/amordegrc-function-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  AMORLINC: {
    description: "Devuelve la depreciaci\xF3n de cada periodo contable",
    abstract: "Devuelve la depreciaci\xF3n de cada periodo contable",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/amorlinc-function-7d417b45-f7f5-4dba-a0a5-3451a81079a8"
      }
    ],
    functionParameter: {
      cost: { name: "costo", detail: "El costo del activo." },
      datePurchased: { name: "fecha_compra", detail: "La fecha de compra del activo." },
      firstPeriod: { name: "primer_periodo", detail: "La fecha del final del primer periodo." },
      salvage: { name: "valor_residual", detail: "El valor residual al final de la vida del activo." },
      period: { name: "periodo", detail: "El periodo." },
      rate: { name: "tasa", detail: "La tasa de depreciaci\xF3n." },
      basis: { name: "base", detail: "La base del a\xF1o que se usar\xE1." }
    }
  },
  COUPDAYBS: {
    description: "Devuelve el n\xFAmero de d\xEDas desde el principio del periodo de cup\xF3n hasta la fecha de liquidaci\xF3n",
    abstract: "Devuelve el n\xFAmero de d\xEDas desde el principio del periodo de cup\xF3n hasta la fecha de liquidaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/coupdaybs-function-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  COUPDAYS: {
    description: "Devuelve el n\xFAmero de d\xEDas del periodo de cup\xF3n que contiene la fecha de liquidaci\xF3n",
    abstract: "Devuelve el n\xFAmero de d\xEDas del periodo de cup\xF3n que contiene la fecha de liquidaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/coupdays-function-cc64380b-315b-4e7b-950c-b30b0a76f671"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  COUPDAYSNC: {
    description: "Devuelve el n\xFAmero de d\xEDas desde la fecha de liquidaci\xF3n hasta la siguiente fecha de cup\xF3n",
    abstract: "Devuelve el n\xFAmero de d\xEDas desde la fecha de liquidaci\xF3n hasta la siguiente fecha de cup\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/coupdaysnc-function-5ab3f0b2-029f-4a8b-bb65-47d525eea547"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  COUPNCD: {
    description: "Devuelve la siguiente fecha de cup\xF3n despu\xE9s de la fecha de liquidaci\xF3n",
    abstract: "Devuelve la siguiente fecha de cup\xF3n despu\xE9s de la fecha de liquidaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/coupncd-function-fd962fef-506b-4d9d-8590-16df5393691f"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  COUPNUM: {
    description: "Devuelve el n\xFAmero de cupones pagaderos entre la fecha de liquidaci\xF3n y la fecha de vencimiento",
    abstract: "Devuelve el n\xFAmero de cupones pagaderos entre la fecha de liquidaci\xF3n y la fecha de vencimiento",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/coupnum-function-a90af57b-de53-4969-9c99-dd6139db2522"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  COUPPCD: {
    description: "Devuelve la fecha de cup\xF3n anterior antes de la fecha de liquidaci\xF3n",
    abstract: "Devuelve la fecha de cup\xF3n anterior antes de la fecha de liquidaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/couppcd-function-2eb50473-6ee9-4052-a206-77a9a385d5b3"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  CUMIPMT: {
    description: "Devuelve el inter\xE9s acumulativo pagado entre dos periodos",
    abstract: "Devuelve el inter\xE9s acumulativo pagado entre dos periodos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cumipmt-function-61067bb0-9016-427d-b95b-1a752af0e606"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago." },
      pv: { name: "va", detail: "El valor actual." },
      startPeriod: { name: "periodo_inicial", detail: "El primer periodo en el c\xE1lculo. Los periodos de pago se numeran comenzando con 1." },
      endPeriod: { name: "periodo_final", detail: "El \xFAltimo periodo en el c\xE1lculo." },
      type: { name: "tipo", detail: "El momento del pago." }
    }
  },
  CUMPRINC: {
    description: "Devuelve el capital acumulativo pagado de un pr\xE9stamo entre dos periodos",
    abstract: "Devuelve el capital acumulativo pagado de un pr\xE9stamo entre dos periodos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/cumprinc-function-94a4516d-bd65-41a1-bc16-053a6af4c04d"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago." },
      pv: { name: "va", detail: "El valor actual." },
      startPeriod: { name: "periodo_inicial", detail: "El primer periodo en el c\xE1lculo. Los periodos de pago se numeran comenzando con 1." },
      endPeriod: { name: "periodo_final", detail: "El \xFAltimo periodo en el c\xE1lculo." },
      type: { name: "tipo", detail: "El momento del pago." }
    }
  },
  DB: {
    description: "Devuelve la depreciaci\xF3n de un activo durante un periodo especificado, usando el m\xE9todo de saldo de disminuci\xF3n fija",
    abstract: "Devuelve la depreciaci\xF3n de un activo durante un periodo especificado, usando el m\xE9todo de saldo de disminuci\xF3n fija",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/db-function-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7"
      }
    ],
    functionParameter: {
      cost: { name: "costo", detail: "El costo inicial del activo." },
      salvage: { name: "valor_residual", detail: "El valor al final de la depreciaci\xF3n (a veces llamado el valor residual del activo)." },
      life: { name: "vida", detail: "El n\xFAmero de periodos durante los cuales se deprecia el activo (a veces llamado la vida \xFAtil del activo)." },
      period: { name: "periodo", detail: "El periodo para el cual desea calcular la depreciaci\xF3n." },
      month: { name: "mes", detail: "El n\xFAmero de meses del primer a\xF1o. Si se omite el mes, se supone que es 12." }
    }
  },
  DDB: {
    description: "Devuelve la depreciaci\xF3n de un activo durante un periodo especificado usando el m\xE9todo de saldo de doble disminuci\xF3n u otro m\xE9todo que especifique",
    abstract: "Devuelve la depreciaci\xF3n de un activo durante un periodo especificado usando el m\xE9todo de saldo de doble disminuci\xF3n u otro m\xE9todo que especifique",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/ddb-function-519a7a37-8772-4c96-85c0-ed2c209717a5"
      }
    ],
    functionParameter: {
      cost: { name: "costo", detail: "El costo inicial del activo." },
      salvage: { name: "valor_residual", detail: "El valor al final de la depreciaci\xF3n (a veces llamado el valor residual del activo)." },
      life: { name: "vida", detail: "El n\xFAmero de periodos durante los cuales se deprecia el activo (a veces llamado la vida \xFAtil del activo)." },
      period: { name: "periodo", detail: "El periodo para el cual desea calcular la depreciaci\xF3n." },
      factor: { name: "factor", detail: "La tasa a la que disminuye el saldo. Si se omite el factor, se supone que es 2 (el m\xE9todo de saldo de doble disminuci\xF3n)." }
    }
  },
  DISC: {
    description: "Devuelve la tasa de descuento de un valor",
    abstract: "Devuelve la tasa de descuento de un valor",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/disc-function-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      pr: { name: "precio", detail: "El precio del valor por $100 de valor nominal." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  DOLLARDE: {
    description: "Convierte un precio en d\xF3lares, expresado como fracci\xF3n, en un precio en d\xF3lares, expresado como n\xFAmero decimal",
    abstract: "Convierte un precio en d\xF3lares, expresado como fracci\xF3n, en un precio en d\xF3lares, expresado como n\xFAmero decimal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dollarde-function-db85aab0-1677-428a-9dfd-a38476693427"
      }
    ],
    functionParameter: {
      fractionalDollar: { name: "d\xF3lar_fraccionario", detail: "Un n\xFAmero expresado como una parte entera y una parte fraccionaria, separadas por un s\xEDmbolo decimal." },
      fraction: { name: "fracci\xF3n", detail: "El entero que se usar\xE1 en el denominador de la fracci\xF3n." }
    }
  },
  DOLLARFR: {
    description: "Convierte un precio en d\xF3lares, expresado como n\xFAmero decimal, en un precio en d\xF3lares, expresado como fracci\xF3n",
    abstract: "Convierte un precio en d\xF3lares, expresado como n\xFAmero decimal, en un precio en d\xF3lares, expresado como fracci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/dollarfr-function-0835d163-3023-4a33-9824-3042c5d4f495"
      }
    ],
    functionParameter: {
      decimalDollar: { name: "d\xF3lar_decimal", detail: "Un n\xFAmero decimal." },
      fraction: { name: "fracci\xF3n", detail: "El entero que se usar\xE1 en el denominador de la fracci\xF3n." }
    }
  },
  DURATION: {
    description: "Devuelve la duraci\xF3n anual de un valor con pagos de intereses peri\xF3dicos",
    abstract: "Devuelve la duraci\xF3n anual de un valor con pagos de intereses peri\xF3dicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/duration-function-b254ea57-eadc-4602-a86a-c8e369334038"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      coupon: { name: "cup\xF3n", detail: "La tasa de cup\xF3n anual del valor." },
      yld: { name: "rendimiento", detail: "El rendimiento anual del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  EFFECT: {
    description: "Devuelve la tasa de inter\xE9s anual efectiva",
    abstract: "Devuelve la tasa de inter\xE9s anual efectiva",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/effect-function-910d4e4c-79e2-4009-95e6-507e04f11bc4"
      }
    ],
    functionParameter: {
      nominalRate: { name: "tasa_nominal", detail: "La tasa de inter\xE9s nominal." },
      npery: { name: "n\xFAm_per_a\xF1o", detail: "El n\xFAmero de periodos de composici\xF3n por a\xF1o." }
    }
  },
  FV: {
    description: "Devuelve el valor futuro de una inversi\xF3n",
    abstract: "Devuelve el valor futuro de una inversi\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/fv-function-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s por periodo." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago en una anualidad." },
      pmt: { name: "pago", detail: "El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad." },
      pv: { name: "va", detail: "El valor actual, o la cantidad total que vale ahora una serie de pagos futuros." },
      type: { name: "tipo", detail: "El n\xFAmero 0 o 1 e indica cu\xE1ndo vencen los pagos." }
    }
  },
  FVSCHEDULE: {
    description: "Devuelve el valor futuro de un capital inicial despu\xE9s de aplicar una serie de tasas de inter\xE9s compuesto",
    abstract: "Devuelve el valor futuro de un capital inicial despu\xE9s de aplicar una serie de tasas de inter\xE9s compuesto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/fvschedule-function-bec29522-bd87-4082-bab9-a241f3fb251d"
      }
    ],
    functionParameter: {
      principal: { name: "capital", detail: "El valor actual." },
      schedule: { name: "programa", detail: "Una matriz de tasas de inter\xE9s que aplicar." }
    }
  },
  INTRATE: {
    description: "Devuelve la tasa de inter\xE9s de un valor completamente invertido",
    abstract: "Devuelve la tasa de inter\xE9s de un valor completamente invertido",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/intrate-function-5cb34dde-a221-4cb6-b3eb-0b9e55e1316f"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      investment: { name: "inversi\xF3n", detail: "La cantidad invertida en el valor." },
      redemption: { name: "rescate", detail: "La cantidad que se recibir\xE1 al vencimiento." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  IPMT: {
    description: "Devuelve el pago de intereses de una inversi\xF3n durante un periodo determinado",
    abstract: "Devuelve el pago de intereses de una inversi\xF3n durante un periodo determinado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/ipmt-function-5cce0ad6-8402-4a41-8d29-61a0b054cb6f"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s por periodo." },
      per: { name: "periodo", detail: "El periodo para el cual desea buscar el inter\xE9s y debe estar en el rango de 1 a n\xFAm_pagos." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago en una anualidad." },
      pv: { name: "va", detail: "El valor actual, o la cantidad total que vale ahora una serie de pagos futuros." },
      fv: { name: "vf", detail: "El valor futuro, o un saldo en efectivo que desea lograr despu\xE9s de realizar el \xFAltimo pago." },
      type: { name: "tipo", detail: "El n\xFAmero 0 o 1 e indica cu\xE1ndo vencen los pagos." }
    }
  },
  IRR: {
    description: "Devuelve la tasa interna de retorno para una serie de flujos de efectivo",
    abstract: "Devuelve la tasa interna de retorno para una serie de flujos de efectivo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/irr-function-64925eaa-9988-495b-b290-3ad0c163c1bc"
      }
    ],
    functionParameter: {
      values: { name: "valores", detail: "Una matriz o una referencia a celdas que contienen n\xFAmeros para los cuales desea calcular la tasa interna de retorno.\n1.Los valores deben contener al menos un valor positivo y uno negativo para calcular la tasa interna de retorno.\n2.TIR usa el orden de valores para interpretar el orden de los flujos de efectivo. Aseg\xFArese de introducir los valores de pago e ingresos en la secuencia que desee.\n3.Si un argumento de matriz o referencia contiene texto, valores l\xF3gicos o celdas vac\xEDas, esos valores se ignoran." },
      guess: { name: "estimaci\xF3n", detail: "Un n\xFAmero que estima est\xE1 cerca del resultado de TIR." }
    }
  },
  ISPMT: {
    description: "Calcula el inter\xE9s pagado durante un periodo espec\xEDfico de una inversi\xF3n",
    abstract: "Calcula el inter\xE9s pagado durante un periodo espec\xEDfico de una inversi\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/ispmt-function-fa58adb6-9d39-4ce0-8f43-75399cea56cc"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s para la inversi\xF3n." },
      per: { name: "periodo", detail: "El periodo para el cual desea buscar el inter\xE9s, y debe estar entre 1 y N\xFAm_pagos." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago para la inversi\xF3n." },
      pv: { name: "va", detail: "El valor actual de la inversi\xF3n. Para un pr\xE9stamo, Va es la cantidad del pr\xE9stamo." }
    }
  },
  MDURATION: {
    description: "Devuelve la duraci\xF3n modificada de Macauley para un valor con un valor nominal asumido de $100",
    abstract: "Devuelve la duraci\xF3n modificada de Macauley para un valor con un valor nominal asumido de $100",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/mduration-function-b3786a69-4f20-469a-94ad-33e5b90a763c"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      coupon: { name: "cup\xF3n", detail: "La tasa de cup\xF3n anual del valor." },
      yld: { name: "rendimiento", detail: "El rendimiento anual del valor." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  MIRR: {
    description: "Devuelve la tasa interna de retorno donde los flujos de efectivo positivos y negativos se financian a diferentes tasas",
    abstract: "Devuelve la tasa interna de retorno donde los flujos de efectivo positivos y negativos se financian a diferentes tasas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/mirr-function-b020f038-7492-4fb4-93c1-35c345b53524"
      }
    ],
    functionParameter: {
      values: { name: "valores", detail: "Una matriz o una referencia a celdas que contienen n\xFAmeros. Estos n\xFAmeros representan una serie de pagos (valores negativos) e ingresos (valores positivos) que ocurren en periodos regulares.\n1.Los valores deben contener al menos un valor positivo y uno negativo para calcular la tasa interna de retorno modificada. De lo contrario, TIRM devuelve el valor de error #\xA1DIV/0!.\n2.Si un argumento de matriz o referencia contiene texto, valores l\xF3gicos o celdas vac\xEDas, esos valores se ignoran; sin embargo, se incluyen las celdas con el valor cero." },
      financeRate: { name: "tasa_financiamiento", detail: "La tasa de inter\xE9s que paga sobre el dinero usado en los flujos de efectivo." },
      reinvestRate: { name: "tasa_reinversi\xF3n", detail: "La tasa de inter\xE9s que recibe sobre los flujos de efectivo cuando los reinvierte." }
    }
  },
  NOMINAL: {
    description: "Devuelve la tasa de inter\xE9s nominal anual",
    abstract: "Devuelve la tasa de inter\xE9s nominal anual",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/nominal-function-7f1ae29b-6b92-435e-b950-ad8b190ddd2b"
      }
    ],
    functionParameter: {
      effectRate: { name: "tasa_efectiva", detail: "La tasa de inter\xE9s efectiva." },
      npery: { name: "n\xFAm_per_a\xF1o", detail: "El n\xFAmero de periodos de composici\xF3n por a\xF1o." }
    }
  },
  NPER: {
    description: "Devuelve el n\xFAmero de periodos para una inversi\xF3n",
    abstract: "Devuelve el n\xFAmero de periodos para una inversi\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/nper-function-240535b5-6653-4d2d-bfcf-b6a38151d815"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s por periodo." },
      pmt: { name: "pago", detail: "El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad." },
      pv: { name: "va", detail: "El valor actual, o la cantidad total que vale ahora una serie de pagos futuros." },
      fv: { name: "vf", detail: "El valor futuro, o un saldo en efectivo que desea lograr despu\xE9s de realizar el \xFAltimo pago." },
      type: { name: "tipo", detail: "El n\xFAmero 0 o 1 e indica cu\xE1ndo vencen los pagos." }
    }
  },
  NPV: {
    description: "Devuelve el valor actual neto de una inversi\xF3n basada en una serie de flujos de efectivo peri\xF3dicos y una tasa de descuento",
    abstract: "Devuelve el valor actual neto de una inversi\xF3n basada en una serie de flujos de efectivo peri\xF3dicos y una tasa de descuento",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/npv-function-8672cb67-2576-4d07-b67b-ac28acf2a568"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de descuento durante la duraci\xF3n de un periodo." },
      value1: { name: "valor1", detail: "De 1 a 254 argumentos que representan los pagos e ingresos." },
      value2: { name: "valor2", detail: "De 1 a 254 argumentos que representan los pagos e ingresos." }
    }
  },
  ODDFPRICE: {
    description: "Devuelve el precio por $100 de valor nominal de un valor con un primer periodo impar",
    abstract: "Devuelve el precio por $100 de valor nominal de un valor con un primer periodo impar",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/oddfprice-function-d7d664a8-34df-4233-8d2b-922bcf6a69e1"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      issue: { name: "emisi\xF3n", detail: "La fecha de emisi\xF3n del valor." },
      firstCoupon: { name: "primer_cup\xF3n", detail: "La fecha del primer cup\xF3n del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      yld: { name: "rendimiento", detail: "El rendimiento anual del valor." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  ODDFYIELD: {
    description: "Devuelve el rendimiento de un valor con un primer periodo impar",
    abstract: "Devuelve el rendimiento de un valor con un primer periodo impar",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/oddfyield-function-66bc8b7b-6501-4c93-9ce3-2fd16220fe37"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      issue: { name: "emisi\xF3n", detail: "La fecha de emisi\xF3n del valor." },
      firstCoupon: { name: "primer_cup\xF3n", detail: "La fecha del primer cup\xF3n del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      pr: { name: "precio", detail: "El precio del valor." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  ODDLPRICE: {
    description: "Devuelve el precio por $100 de valor nominal de un valor con un \xFAltimo periodo impar",
    abstract: "Devuelve el precio por $100 de valor nominal de un valor con un \xFAltimo periodo impar",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/oddlprice-function-fb657749-d200-4902-afaf-ed5445027fc4"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      lastInterest: { name: "\xFAltimo_inter\xE9s", detail: "La fecha del \xFAltimo cup\xF3n del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      yld: { name: "rendimiento", detail: "El rendimiento anual del valor." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  ODDLYIELD: {
    description: "Devuelve el rendimiento de un valor con un \xFAltimo periodo impar",
    abstract: "Devuelve el rendimiento de un valor con un \xFAltimo periodo impar",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/oddlyield-function-c873d088-cf40-435f-8d41-c8232fee9238"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      lastInterest: { name: "\xFAltimo_inter\xE9s", detail: "La fecha del \xFAltimo cup\xF3n del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      pr: { name: "precio", detail: "El precio del valor." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  PDURATION: {
    description: "Devuelve el n\xFAmero de periodos requeridos por una inversi\xF3n para alcanzar un valor especificado",
    abstract: "Devuelve el n\xFAmero de periodos requeridos por una inversi\xF3n para alcanzar un valor especificado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/pduration-function-44f33460-5be5-4c90-b857-22308892adaf"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "Tasa es la tasa de inter\xE9s por periodo." },
      pv: { name: "va", detail: "Va es el valor actual de la inversi\xF3n." },
      fv: { name: "vf", detail: "Vf es el valor futuro deseado de la inversi\xF3n." }
    }
  },
  PMT: {
    description: "Devuelve el pago peri\xF3dico de una anualidad",
    abstract: "Devuelve el pago peri\xF3dico de una anualidad",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/pmt-function-0214da64-9a63-4996-bc20-214433fa6441"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s por periodo." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago en una anualidad." },
      pv: { name: "va", detail: "El valor actual, o la cantidad total que vale ahora una serie de pagos futuros." },
      fv: { name: "vf", detail: "El valor futuro, o un saldo en efectivo que desea lograr despu\xE9s de realizar el \xFAltimo pago." },
      type: { name: "tipo", detail: "El n\xFAmero 0 o 1 e indica cu\xE1ndo vencen los pagos." }
    }
  },
  PPMT: {
    description: "Devuelve el pago del capital de una inversi\xF3n durante un periodo determinado",
    abstract: "Devuelve el pago del capital de una inversi\xF3n durante un periodo determinado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/ppmt-function-c370d9e3-7749-4ca4-beea-b06c6ac95e1b"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s por periodo." },
      per: { name: "periodo", detail: "El periodo para el cual desea buscar el inter\xE9s y debe estar en el rango de 1 a n\xFAm_pagos." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago en una anualidad." },
      pv: { name: "va", detail: "El valor actual, o la cantidad total que vale ahora una serie de pagos futuros." },
      fv: { name: "vf", detail: "El valor futuro, o un saldo en efectivo que desea lograr despu\xE9s de realizar el \xFAltimo pago." },
      type: { name: "tipo", detail: "El n\xFAmero 0 o 1 e indica cu\xE1ndo vencen los pagos." }
    }
  },
  PRICE: {
    description: "Devuelve el precio por $100 de valor nominal de un valor que paga intereses peri\xF3dicos",
    abstract: "Devuelve el precio por $100 de valor nominal de un valor que paga intereses peri\xF3dicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/price-function-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      yld: { name: "rendimiento", detail: "El rendimiento anual del valor." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  PRICEDISC: {
    description: "Devuelve el precio por $100 de valor nominal de un valor descontado",
    abstract: "Devuelve el precio por $100 de valor nominal de un valor descontado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/pricedisc-function-d06ad7c1-380e-4be7-9fd9-75e3079acfd3"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      discount: { name: "descuento", detail: "La tasa de descuento del valor." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  PRICEMAT: {
    description: "Devuelve el precio por $100 de valor nominal de un valor que paga intereses al vencimiento",
    abstract: "Devuelve el precio por $100 de valor nominal de un valor que paga intereses al vencimiento",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/pricemat-function-52c3b4da-bc7e-476a-989f-a95f675cae77"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      issue: { name: "emisi\xF3n", detail: "La fecha de emisi\xF3n del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      yld: { name: "rendimiento", detail: "El rendimiento anual del valor." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  PV: {
    description: "Devuelve el valor actual de una inversi\xF3n",
    abstract: "Devuelve el valor actual de una inversi\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/pv-function-23879d31-0e02-4321-be01-da16e8168cbd"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de inter\xE9s por periodo." },
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago en una anualidad." },
      pmt: { name: "pago", detail: "El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad." },
      fv: { name: "vf", detail: "El valor futuro, o un saldo en efectivo que desea lograr despu\xE9s de realizar el \xFAltimo pago." },
      type: { name: "tipo", detail: "El n\xFAmero 0 o 1 e indica cu\xE1ndo vencen los pagos." }
    }
  },
  RATE: {
    description: "Devuelve la tasa de inter\xE9s por periodo de una anualidad",
    abstract: "Devuelve la tasa de inter\xE9s por periodo de una anualidad",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/rate-function-9f665657-4a7e-4bb7-a030-83fc59e748ce"
      }
    ],
    functionParameter: {
      nper: { name: "n\xFAm_pagos", detail: "El n\xFAmero total de periodos de pago en una anualidad." },
      pmt: { name: "pago", detail: "El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad." },
      pv: { name: "va", detail: "El valor actual, o la cantidad total que vale ahora una serie de pagos futuros." },
      fv: { name: "vf", detail: "El valor futuro, o un saldo en efectivo que desea lograr despu\xE9s de realizar el \xFAltimo pago." },
      type: { name: "tipo", detail: "El n\xFAmero 0 o 1 e indica cu\xE1ndo vencen los pagos." },
      guess: { name: "estimaci\xF3n", detail: "Su estimaci\xF3n de cu\xE1l ser\xE1 la tasa." }
    }
  },
  RECEIVED: {
    description: "Devuelve la cantidad recibida al vencimiento para un valor completamente invertido",
    abstract: "Devuelve la cantidad recibida al vencimiento para un valor completamente invertido",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/received-function-7a3f8b93-6611-4f81-8576-828312c9b5e5"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      investment: { name: "inversi\xF3n", detail: "La cantidad invertida en el valor." },
      discount: { name: "descuento", detail: "La tasa de descuento del valor." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  RRI: {
    description: "Devuelve una tasa de inter\xE9s equivalente para el crecimiento de una inversi\xF3n",
    abstract: "Devuelve una tasa de inter\xE9s equivalente para el crecimiento de una inversi\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/rri-function-6f5822d8-7ef1-4233-944c-79e8172930f4"
      }
    ],
    functionParameter: {
      nper: { name: "n\xFAm_pagos", detail: "N\xFAm_pagos es el n\xFAmero de periodos para la inversi\xF3n." },
      pv: { name: "va", detail: "Va es el valor actual de la inversi\xF3n." },
      fv: { name: "vf", detail: "Vf es el valor futuro de la inversi\xF3n." }
    }
  },
  SLN: {
    description: "Devuelve la depreciaci\xF3n por m\xE9todo directo de un activo en un periodo",
    abstract: "Devuelve la depreciaci\xF3n por m\xE9todo directo de un activo en un periodo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/sln-function-cdb666e5-c1c6-40a7-806a-e695edc2f1c8"
      }
    ],
    functionParameter: {
      cost: { name: "costo", detail: "El costo inicial del activo." },
      salvage: { name: "valor_residual", detail: "El valor al final de la depreciaci\xF3n (a veces llamado el valor residual del activo)." },
      life: { name: "vida", detail: "El n\xFAmero de periodos durante los cuales se deprecia el activo (a veces llamado la vida \xFAtil del activo)." }
    }
  },
  SYD: {
    description: "Devuelve la depreciaci\xF3n por suma de a\xF1os de los d\xEDgitos de un activo durante un periodo especificado",
    abstract: "Devuelve la depreciaci\xF3n por suma de a\xF1os de los d\xEDgitos de un activo durante un periodo especificado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/syd-function-069f8106-b60b-4ca2-98e0-2a0f206bdb27"
      }
    ],
    functionParameter: {
      cost: { name: "costo", detail: "El costo inicial del activo." },
      salvage: { name: "valor_residual", detail: "El valor al final de la depreciaci\xF3n (a veces llamado el valor residual del activo)." },
      life: { name: "vida", detail: "El n\xFAmero de periodos durante los cuales se deprecia el activo (a veces llamado la vida \xFAtil del activo)." },
      per: { name: "periodo", detail: "El periodo y debe usar las mismas unidades que vida." }
    }
  },
  TBILLEQ: {
    description: "Devuelve el rendimiento equivalente de un bono del Tesoro",
    abstract: "Devuelve el rendimiento equivalente de un bono del Tesoro",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/tbilleq-function-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del pagar\xE9 del Tesoro." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del pagar\xE9 del Tesoro." },
      discount: { name: "descuento", detail: "La tasa de descuento del pagar\xE9 del Tesoro." }
    }
  },
  TBILLPRICE: {
    description: "Devuelve el precio por $100 de valor nominal de un pagar\xE9 del Tesoro",
    abstract: "Devuelve el precio por $100 de valor nominal de un pagar\xE9 del Tesoro",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/tbillprice-function-eacca992-c29d-425a-9eb8-0513fe6035a2"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del pagar\xE9 del Tesoro." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del pagar\xE9 del Tesoro." },
      discount: { name: "descuento", detail: "La tasa de descuento del pagar\xE9 del Tesoro." }
    }
  },
  TBILLYIELD: {
    description: "Devuelve el rendimiento de un pagar\xE9 del Tesoro",
    abstract: "Devuelve el rendimiento de un pagar\xE9 del Tesoro",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/tbillyield-function-6d381232-f4b0-4cd5-8e97-45b9c03468ba"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del pagar\xE9 del Tesoro." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del pagar\xE9 del Tesoro." },
      pr: { name: "precio", detail: "El precio del pagar\xE9 del Tesoro por $100 de valor nominal." }
    }
  },
  VDB: {
    description: "Devuelve la depreciaci\xF3n de un activo durante un periodo especificado o parcial usando un m\xE9todo de saldo decreciente",
    abstract: "Devuelve la depreciaci\xF3n de un activo durante un periodo especificado o parcial usando un m\xE9todo de saldo decreciente",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/vdb-function-dde4e207-f3fa-488d-91d2-66d55e861d73"
      }
    ],
    functionParameter: {
      cost: { name: "costo", detail: "El costo inicial del activo." },
      salvage: { name: "valor_residual", detail: "El valor al final de la depreciaci\xF3n (a veces llamado el valor residual del activo)." },
      life: { name: "vida", detail: "El n\xFAmero de periodos durante los cuales se est\xE1 depreciando el activo (a veces llamado la vida \xFAtil del activo)." },
      startPeriod: { name: "periodo_inicial", detail: "El periodo inicial para el cual desea calcular la depreciaci\xF3n." },
      endPeriod: { name: "periodo_final", detail: "El periodo final para el cual desea calcular la depreciaci\xF3n." },
      factor: { name: "factor", detail: "La tasa a la que disminuye el saldo. Si se omite el factor, se supone que es 2 (el m\xE9todo de saldo de doble disminuci\xF3n)." },
      noSwitch: { name: "no_cambiar", detail: "Un valor l\xF3gico que especifica si se debe cambiar a depreciaci\xF3n en l\xEDnea recta cuando la depreciaci\xF3n es mayor que el c\xE1lculo de saldo decreciente." }
    }
  },
  XIRR: {
    description: "Devuelve la tasa interna de retorno para un flujo de efectivo que no es necesariamente peri\xF3dico",
    abstract: "Devuelve la tasa interna de retorno para un flujo de efectivo que no es necesariamente peri\xF3dico",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/xirr-function-de1242ec-6477-445b-b11b-a303ad9adc9d"
      }
    ],
    functionParameter: {
      values: { name: "valores", detail: "Una serie de flujos de efectivo que corresponde a un programa de pagos en fechas. El primer pago es opcional y corresponde a un costo o pago que ocurre al principio de la inversi\xF3n. Si el primer valor es un costo o pago, debe ser un valor negativo. Todos los pagos sucesivos se descuentan bas\xE1ndose en un a\xF1o de 365 d\xEDas. La serie de valores debe contener al menos un valor positivo y uno negativo." },
      dates: { name: "fechas", detail: "Un programa de fechas de pago que corresponde a los pagos de flujo de efectivo. Las fechas pueden ocurrir en cualquier orden." },
      guess: { name: "estimaci\xF3n", detail: "Un n\xFAmero que estima est\xE1 cerca del resultado de TIRX." }
    }
  },
  XNPV: {
    description: "Devuelve el valor actual neto para un flujo de efectivo que no es necesariamente peri\xF3dico",
    abstract: "Devuelve el valor actual neto para un flujo de efectivo que no es necesariamente peri\xF3dico",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/xnpv-function-1b42bbf6-370f-4532-a0eb-d67c16b664b7"
      }
    ],
    functionParameter: {
      rate: { name: "tasa", detail: "La tasa de descuento que aplicar a los flujos de efectivo." },
      values: { name: "valores", detail: "Una serie de flujos de efectivo que corresponde a un programa de pagos en fechas. El primer pago es opcional y corresponde a un costo o pago que ocurre al principio de la inversi\xF3n. Si el primer valor es un costo o pago, debe ser un valor negativo. Todos los pagos sucesivos se descuentan bas\xE1ndose en un a\xF1o de 365 d\xEDas. La serie de valores debe contener al menos un valor positivo y uno negativo." },
      dates: { name: "fechas", detail: "Un programa de fechas de pago que corresponde a los pagos de flujo de efectivo. Las fechas pueden ocurrir en cualquier orden." }
    }
  },
  YIELD: {
    description: "Devuelve el rendimiento de un valor que paga intereses peri\xF3dicos",
    abstract: "Devuelve el rendimiento de un valor que paga intereses peri\xF3dicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/yield-function-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      pr: { name: "precio", detail: "El precio del valor por $100 de valor nominal." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      frequency: { name: "frecuencia", detail: "El n\xFAmero de pagos de cup\xF3n por a\xF1o. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  YIELDDISC: {
    description: "Devuelve el rendimiento anual de un valor descontado; por ejemplo, un pagar\xE9 del Tesoro",
    abstract: "Devuelve el rendimiento anual de un valor descontado; por ejemplo, un pagar\xE9 del Tesoro",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/yielddisc-function-a9dbdbae-7dae-46de-b995-615faffaaed7"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      pr: { name: "precio", detail: "El precio del valor por $100 de valor nominal." },
      redemption: { name: "rescate", detail: "El valor de rescate del valor por $100 de valor nominal." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  },
  YIELDMAT: {
    description: "Devuelve el rendimiento anual de un valor que paga intereses al vencimiento",
    abstract: "Devuelve el rendimiento anual de un valor que paga intereses al vencimiento",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/en-us/office/yieldmat-function-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f"
      }
    ],
    functionParameter: {
      settlement: { name: "liquidaci\xF3n", detail: "La fecha de liquidaci\xF3n del valor." },
      maturity: { name: "vencimiento", detail: "La fecha de vencimiento del valor." },
      issue: { name: "emisi\xF3n", detail: "La fecha de emisi\xF3n del valor." },
      rate: { name: "tasa", detail: "La tasa de inter\xE9s del valor." },
      pr: { name: "precio", detail: "El precio del valor por $100 de valor nominal." },
      basis: { name: "base", detail: "El tipo de base de recuento de d\xEDas que se usar\xE1." }
    }
  }
};
var es_ES_default25 = locale25;

// ../packages/sheets-formula/src/locale/function-list/information/es-ES.ts
var locale26 = {
  CELL: {
    description: "Devuelve informaci\xF3n sobre el formato, la ubicaci\xF3n o el contenido de una celda",
    abstract: "Devuelve informaci\xF3n sobre el formato, la ubicaci\xF3n o el contenido de una celda",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/cell-function-51bd39a5-f338-4dbe-a33f-955d67c2b2cf"
      }
    ],
    functionParameter: {
      infoType: { name: "tipo_info", detail: "Un valor de texto que especifica qu\xE9 tipo de informaci\xF3n de celda desea devolver." },
      reference: { name: "referencia", detail: "La celda sobre la que desea obtener informaci\xF3n." }
    }
  },
  ERROR_TYPE: {
    description: "Devuelve un n\xFAmero correspondiente a un tipo de error",
    abstract: "Devuelve un n\xFAmero correspondiente a un tipo de error",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/error-type-function-10958677-7c8d-44f7-ae77-b9a9ee6eefaa"
      }
    ],
    functionParameter: {
      errorVal: { name: "valor_error", detail: "El valor de error cuyo n\xFAmero de identificaci\xF3n desea encontrar." }
    }
  },
  INFO: {
    description: "Devuelve informaci\xF3n sobre el entorno operativo actual",
    abstract: "Devuelve informaci\xF3n sobre el entorno operativo actual",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/info-function-725f259a-0e4b-49b3-8b52-58815c69acae"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  ISBETWEEN: {
    description: "Comprueba si un n\xFAmero proporcionado se encuentra entre otros dos n\xFAmeros, de forma inclusiva o exclusiva.",
    abstract: "Comprueba si un n\xFAmero proporcionado se encuentra entre otros dos n\xFAmeros, de forma inclusiva o exclusiva.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.google.com/docs/answer/10538337?hl=es"
      }
    ],
    functionParameter: {
      valueToCompare: { name: "valor_a_comparar", detail: "El valor a comprobar si est\xE1 entre `valor_inferior` y `valor_superior`." },
      lowerValue: { name: "valor_inferior", detail: "El l\xEDmite inferior del rango de valores en el que puede caer `valor_a_comparar`." },
      upperValue: { name: "valor_superior", detail: "El l\xEDmite superior del rango de valores en el que puede caer `valor_a_comparar`." },
      lowerValueIsInclusive: { name: "valor_inferior_es_inclusivo", detail: "Indica si el rango de valores incluye el `valor_inferior`. Por defecto es VERDADERO." },
      upperValueIsInclusive: { name: "valor_superior_es_inclusivo", detail: "Indica si el rango de valores incluye el `valor_superior`. Por defecto es VERDADERO." }
    }
  },
  ISBLANK: {
    description: "Devuelve VERDADERO si el valor est\xE1 en blanco",
    abstract: "Devuelve VERDADERO si el valor est\xE1 en blanco",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISDATE: {
    description: "Devuelve si un valor es una fecha.",
    abstract: "Devuelve si un valor es una fecha.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.google.com/docs/answer/9061381?hl=es"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que se verificar\xE1 como fecha." }
    }
  },
  ISEMAIL: {
    description: "Comprueba si un valor es una direcci\xF3n de correo electr\xF3nico v\xE1lida",
    abstract: "Comprueba si un valor es una direcci\xF3n de correo electr\xF3nico v\xE1lida",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.google.com/docs/answer/3256503?hl=es"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que se verificar\xE1 como una direcci\xF3n de correo electr\xF3nico." }
    }
  },
  ISERR: {
    description: "Devuelve VERDADERO si el valor es cualquier valor de error excepto #N/A",
    abstract: "Devuelve VERDADERO si el valor es cualquier valor de error excepto #N/A",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISERROR: {
    description: "Devuelve VERDADERO si el valor es cualquier valor de error",
    abstract: "Devuelve VERDADERO si el valor es cualquier valor de error",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISEVEN: {
    description: "Devuelve VERDADERO si el n\xFAmero es par",
    abstract: "Devuelve VERDADERO si el n\xFAmero es par",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/iseven-function-aa15929a-d77b-4fbb-92f4-2f479af55356"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor a probar. Si el n\xFAmero no es un entero, se trunca." }
    }
  },
  ISFORMULA: {
    description: "Devuelve VERDADERO si hay una referencia a una celda que contiene una f\xF3rmula",
    abstract: "Devuelve VERDADERO si hay una referencia a una celda que contiene una f\xF3rmula",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/isformula-function-e4d1355f-7121-4ef2-801e-3839bfd6b1e5"
      }
    ],
    functionParameter: {
      reference: { name: "referencia", detail: "Referencia es una referencia a la celda que desea probar." }
    }
  },
  ISLOGICAL: {
    description: "Devuelve VERDADERO si el valor es un valor l\xF3gico",
    abstract: "Devuelve VERDADERO si el valor es un valor l\xF3gico",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISNA: {
    description: "Devuelve VERDADERO si el valor es el valor de error #N/A",
    abstract: "Devuelve VERDADERO si el valor es el valor de error #N/A",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISNONTEXT: {
    description: "Devuelve VERDADERO si el valor no es texto",
    abstract: "Devuelve VERDADERO si el valor no es texto",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISNUMBER: {
    description: "Devuelve VERDADERO si el valor es un n\xFAmero",
    abstract: "Devuelve VERDADERO si el valor es un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISODD: {
    description: "Devuelve VERDADERO si el n\xFAmero es impar",
    abstract: "Devuelve VERDADERO si el n\xFAmero es impar",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/isodd-function-1208a56d-4f10-4f44-a5fc-648cafd6c07a"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor a probar. Si el n\xFAmero no es un entero, se trunca." }
    }
  },
  ISOMITTED: {
    description: "Comprueba si falta el valor en una\xA0LAMBDA\xA0y devuelve VERDADERO o FALSO",
    abstract: "Comprueba si falta el valor en una\xA0LAMBDA\xA0y devuelve VERDADERO o FALSO",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/isomitted-function-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  ISREF: {
    description: "Devuelve VERDADERO si el valor es una referencia",
    abstract: "Devuelve VERDADERO si el valor es una referencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISTEXT: {
    description: "Devuelve VERDADERO si el valor es texto",
    abstract: "Devuelve VERDADERO si el valor es texto",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar. El argumento de valor puede ser una celda en blanco (vac\xEDa), error, valor l\xF3gico, texto, n\xFAmero o valor de referencia, o un nombre que se refiera a cualquiera de estos." }
    }
  },
  ISURL: {
    description: "Comprueba si un valor es una URL v\xE1lida.",
    abstract: "Comprueba si un valor es una URL v\xE1lida.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.google.com/docs/answer/3256501?hl=es"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que se verificar\xE1 como una URL." }
    }
  },
  N: {
    description: "Devuelve un valor convertido en un n\xFAmero",
    abstract: "Devuelve un valor convertido en un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/n-function-a624cad1-3635-4208-b54a-29733d1278c9"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea convertir." }
    }
  },
  NA: {
    description: "Devuelve el valor de error #N/A",
    abstract: "Devuelve el valor de error #N/A",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/na-function-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c"
      }
    ],
    functionParameter: {}
  },
  SHEET: {
    description: "Devuelve el n\xFAmero de hoja de la hoja de referencia",
    abstract: "Devuelve el n\xFAmero de hoja de la hoja de referencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sheet-function-44718b6f-8b87-47a1-a9d6-b701c06cff24"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "Valor es el nombre de una hoja o una referencia para la que desea el n\xFAmero de hoja. Si se omite el valor, HOJA devuelve el n\xFAmero de la hoja que contiene la funci\xF3n." }
    }
  },
  SHEETS: {
    description: "Devuelve el n\xFAmero de hojas en un libro",
    abstract: "Devuelve el n\xFAmero de hojas en un libro",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sheets-function-770515eb-e1e8-45ce-8066-b557e5e4b80b"
      }
    ],
    functionParameter: {}
  },
  TYPE: {
    description: "Devuelve un n\xFAmero que indica el tipo de datos de un valor",
    abstract: "Devuelve un n\xFAmero que indica el tipo de datos de un valor",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/type-function-45b4e688-4bc3-48b3-a105-ffa892995899"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "Puede ser cualquier valor, como un n\xFAmero, texto, valor l\xF3gico, etc." }
    }
  }
};
var es_ES_default26 = locale26;

// ../packages/sheets-formula/src/locale/function-list/logical/es-ES.ts
var locale27 = {
  AND: {
    description: "Devuelve VERDADERO si todos sus argumentos son VERDADERO",
    abstract: "Devuelve VERDADERO si todos sus argumentos son VERDADERO",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/and-function-5f19b2e8-e1df-4408-897a-ce285a19e9d9"
      }
    ],
    functionParameter: {
      logical1: { name: "l\xF3gico1", detail: "La primera condici\xF3n que se desea comprobar y que puede evaluarse como VERDADERO o FALSO." },
      logical2: { name: "l\xF3gico2", detail: "Otras condiciones que se desean comprobar, hasta un m\xE1ximo de 255, que pueden evaluarse como VERDADERO o FALSO." }
    }
  },
  BYCOL: {
    description: "Aplica una funci\xF3n LAMBDA a cada columna y devuelve una matriz de los resultados",
    abstract: "Aplica una funci\xF3n LAMBDA a cada columna y devuelve una matriz de los resultados",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/bycol-function-58463999-7de5-49ce-8f38-b7f7a2192bfb"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "Matriz que se va a separar por columnas." },
      lambda: { name: "lambda", detail: "Una funci\xF3n LAMBDA que toma una columna como un \xFAnico par\xE1metro y calcula un resultado. La funci\xF3n LAMBDA toma un \xFAnico par\xE1metro: una columna de la matriz." }
    }
  },
  BYROW: {
    description: "Aplica una funci\xF3n LAMBDA a cada fila y devuelve una matriz de los resultados",
    abstract: "Aplica una funci\xF3n LAMBDA a cada fila y devuelve una matriz de los resultados",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/byrow-function-2e04c677-78c8-4e6b-8c10-a4602f2602bb"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "Matriz que se va a separar por filas." },
      lambda: { name: "lambda", detail: "Una funci\xF3n LAMBDA que toma una fila como un \xFAnico par\xE1metro y calcula un resultado. La funci\xF3n LAMBDA toma un \xFAnico par\xE1metro: una fila de la matriz." }
    }
  },
  FALSE: {
    description: "Devuelve el valor l\xF3gico FALSO.",
    abstract: "Devuelve el valor l\xF3gico FALSO.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/false-function-2d58dfa5-9c03-4259-bf8f-f0ae14346904"
      }
    ],
    functionParameter: {}
  },
  IF: {
    description: "Especifica una prueba l\xF3gica que realizar",
    abstract: "Especifica una prueba l\xF3gica que realizar",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/if-function-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2"
      }
    ],
    functionParameter: {
      logicalTest: { name: "prueba_l\xF3gica", detail: "La condici\xF3n que desea probar." },
      valueIfTrue: {
        name: "valor_si_verdadero",
        detail: "El valor que desea que se devuelva si el resultado de la prueba_l\xF3gica es VERDADERO."
      },
      valueIfFalse: {
        name: "valor_si_falso",
        detail: "El valor que desea que se devuelva si el resultado de la prueba_l\xF3gica es FALSO."
      }
    }
  },
  IFERROR: {
    description: "Devuelve un valor que se especifica si una f\xF3rmula se eval\xFAa como un error; de lo contrario, devuelve el resultado de la f\xF3rmula",
    abstract: "Devuelve un valor que se especifica si una f\xF3rmula se eval\xFAa como un error; de lo contrario, devuelve el resultado de la f\xF3rmula",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/iferror-function-c526fd07-caeb-47b8-8bb6-63f3e417f611"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El argumento que se comprueba en busca de un error." },
      valueIfError: { name: "valor_si_error", detail: "El valor que se devolver\xE1 si la f\xF3rmula se eval\xFAa como un error. Se eval\xFAan los siguientes tipos de error: #N/A, #\xA1VALOR!, #\xA1REF!, #\xA1DIV/0!, #\xA1NUM!, #\xBFNOMBRE? o #\xA1NULO!." }
    }
  },
  IFNA: {
    description: "Devuelve el valor que se especifica si la expresi\xF3n se resuelve en #N/A; de lo contrario, devuelve el resultado de la expresi\xF3n",
    abstract: "Devuelve el valor que se especifica si la expresi\xF3n se resuelve en #N/A; de lo contrario, devuelve el resultado de la expresi\xF3n",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/ifna-function-6626c961-a569-42fc-a49d-79b4951fd461"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El argumento en el que se busca el valor de error #N/A." },
      valueIfNa: { name: "valor_si_na", detail: "El valor que se devolver\xE1 si la f\xF3rmula se eval\xFAa con el valor de error #N/A." }
    }
  },
  IFS: {
    description: "Comprueba si se cumplen una o m\xE1s condiciones y devuelve un valor que corresponde a la primera condici\xF3n VERDADERA.",
    abstract: "Comprueba si se cumplen una o m\xE1s condiciones y devuelve un valor que corresponde a la primera condici\xF3n VERDADERA.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/ifs-function-36329a26-37b2-467c-972b-4a39bd951d45"
      }
    ],
    functionParameter: {
      logicalTest1: { name: "prueba_l\xF3gica1", detail: "Condici\xF3n que se eval\xFAa como VERDADERO o FALSO." },
      valueIfTrue1: { name: "valor_si_verdadero1", detail: "Resultado que se devolver\xE1 si prueba_l\xF3gica1 se eval\xFAa como VERDADERO. Puede estar vac\xEDo." },
      logicalTest2: { name: "prueba_l\xF3gica2", detail: "Condici\xF3n que se eval\xFAa como VERDADERO o FALSO." },
      valueIfTrue2: { name: "valor_si_verdadero2", detail: "Resultado que se devolver\xE1 si prueba_l\xF3gicaN se eval\xFAa como VERDADERO. Cada valor_si_verdaderoN se corresponde con una condici\xF3n prueba_l\xF3gicaN. Puede estar vac\xEDo." }
    }
  },
  LAMBDA: {
    description: "Use una funci\xF3n LAMBDA para crear funciones personalizadas y reutilizables, y ll\xE1melas con un nombre descriptivo. La nueva funci\xF3n est\xE1 disponible en todo el libro y se llama como las funciones nativas de Excel.",
    abstract: "Crea funciones personalizadas y reutilizables y ll\xE1malas por un nombre descriptivo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/lambda-function-bd212d27-1cd1-4321-a34a-ccbf254b8b67"
      }
    ],
    functionParameter: {
      parameter: {
        name: "par\xE1metro",
        detail: "Un valor que desea pasar a la funci\xF3n, como una referencia de celda, una cadena o un n\xFAmero. Puede introducir hasta 253 par\xE1metros. Este argumento es opcional."
      },
      calculation: {
        name: "c\xE1lculo",
        detail: "La f\xF3rmula que desea ejecutar y devolver como resultado de la funci\xF3n. Debe ser el \xFAltimo argumento y debe devolver un resultado. Este argumento es obligatorio."
      }
    }
  },
  LET: {
    description: "Asigna nombres a los resultados de los c\xE1lculos",
    abstract: "Asigna nombres a los resultados de los c\xE1lculos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999"
      }
    ],
    functionParameter: {
      name1: { name: "nombre1", detail: "El primer nombre que se va a asignar. Debe empezar con una letra. No puede ser el resultado de una f\xF3rmula ni entrar en conflicto con la sintaxis de rango." },
      nameValue1: { name: "valor_nombre1", detail: "El valor que se asigna a nombre1." },
      calculationOrName2: { name: "c\xE1lculo_o_nombre2", detail: "Uno de los siguientes:\n1.Un c\xE1lculo que use todos los nombres de la funci\xF3n LET. Debe ser el \xFAltimo argumento de la funci\xF3n LET.\n2.Un segundo nombre para asignar a un segundo valor_nombre. Si se especifica un nombre, valor_nombre2 y c\xE1lculo_o_nombre3 son obligatorios." },
      nameValue2: { name: "valor_nombre2", detail: "El valor que se asigna a c\xE1lculo_o_nombre2." },
      calculationOrName3: { name: "c\xE1lculo_o_nombre3", detail: "Uno de los siguientes:\n1.Un c\xE1lculo que use todos los nombres de la funci\xF3n LET. El \xFAltimo argumento de la funci\xF3n LET debe ser un c\xE1lculo.\n2.Un tercer nombre para asignar a un tercer valor_nombre. Si se especifica un nombre, valor_nombre3 y c\xE1lculo_o_nombre4 son obligatorios." }
    }
  },
  MAKEARRAY: {
    description: "Devuelve una matriz calculada de un tama\xF1o de fila y columna especificado, mediante la aplicaci\xF3n de una LAMBDA",
    abstract: "Devuelve una matriz calculada de un tama\xF1o de fila y columna especificado, mediante la aplicaci\xF3n de una LAMBDA",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/makearray-function-b80da5ad-b338-4149-a523-5b221da09097"
      }
    ],
    functionParameter: {
      number1: { name: "filas", detail: "El n\xFAmero de filas de la matriz. Debe ser mayor que cero." },
      number2: { name: "columnas", detail: "El n\xFAmero de columnas de la matriz. Debe ser mayor que cero." },
      value3: {
        name: "lambda",
        detail: "Una funci\xF3n LAMBDA que se llama para crear la matriz. La funci\xF3n LAMBDA toma dos par\xE1metros: fila (el \xEDndice de fila de la matriz), columna (el \xEDndice de columna de la matriz)."
      }
    }
  },
  MAP: {
    description: "Devuelve una matriz formada al asignar cada valor de las matrices a un nuevo valor aplicando una LAMBDA para crear un nuevo valor.",
    abstract: "Devuelve una matriz formada al asignar cada valor de las matrices a un nuevo valor aplicando una LAMBDA para crear un nuevo valor.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/map-function-48006093-f97c-47c1-bfcc-749263bb1f01"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "Una matriz1 que se va a asignar." },
      array2: { name: "matriz2", detail: "Una matriz2 que se va a asignar." },
      lambda: { name: "lambda", detail: "Una funci\xF3n LAMBDA que debe ser el \xFAltimo argumento y que debe tener un par\xE1metro para cada matriz pasada." }
    }
  },
  NOT: {
    description: "Invierte el valor l\xF3gico de su argumento.",
    abstract: "Invierte el valor l\xF3gico de su argumento.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/not-function-9cfc6011-a054-40c7-a140-cd4ba2d87d77"
      }
    ],
    functionParameter: {
      logical: { name: "l\xF3gico", detail: "La condici\xF3n para la que desea invertir la l\xF3gica, que puede evaluarse como VERDADERO o FALSO." }
    }
  },
  OR: {
    description: "Devuelve VERDADERO si alguno de sus argumentos se eval\xFAa como VERDADERO, y devuelve FALSO si todos sus argumentos se eval\xFAan como FALSO.",
    abstract: "Devuelve VERDADERO si alg\xFAn argumento es VERDADERO",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/or-function-7d17ad14-8700-4281-b308-00b131e22af0"
      }
    ],
    functionParameter: {
      logical1: { name: "l\xF3gico1", detail: "La primera condici\xF3n que se desea comprobar y que puede evaluarse como VERDADERO o FALSO." },
      logical2: { name: "l\xF3gico2", detail: "Otras condiciones que se desean comprobar, hasta un m\xE1ximo de 255, que pueden evaluarse como VERDADERO o FALSO." }
    }
  },
  REDUCE: {
    description: "Reduce una matriz a un valor acumulado aplicando una LAMBDA a cada valor y devolviendo el valor total en el acumulador.",
    abstract: "Reduce una matriz a un valor acumulado aplicando una LAMBDA a cada valor y devolviendo el valor total en el acumulador.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/reduce-function-42e39910-b345-45f3-84b8-0642b568b7cb"
      }
    ],
    functionParameter: {
      initialValue: { name: "valor_inicial", detail: "Establece el valor inicial para el acumulador." },
      array: { name: "matriz", detail: "Una matriz que se va a reducir." },
      lambda: { name: "lambda", detail: "Una funci\xF3n LAMBDA que se llama para reducir la matriz. La funci\xF3n LAMBDA toma tres par\xE1metros: 1.El valor totalizado y devuelto como resultado final. 2.El valor actual de la matriz. 3.El c\xE1lculo aplicado a cada elemento de la matriz." }
    }
  },
  SCAN: {
    description: "Examina una matriz aplicando una LAMBDA a cada valor y devuelve una matriz que tiene cada valor intermedio.",
    abstract: "Examina una matriz aplicando una LAMBDA a cada valor y devuelve una matriz que tiene cada valor intermedio.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/scan-function-d58dfd11-9969-4439-b2dc-e7062724de29"
      }
    ],
    functionParameter: {
      initialValue: { name: "valor_inicial", detail: "Establece el valor inicial para el acumulador." },
      array: { name: "matriz", detail: "Una matriz que se va a examinar." },
      lambda: { name: "lambda", detail: "Una funci\xF3n LAMBDA que se llama para examinar la matriz. La funci\xF3n LAMBDA toma tres par\xE1metros: 1.El valor totalizado y devuelto como resultado final. 2.El valor actual de la matriz. 3.El c\xE1lculo aplicado a cada elemento de la matriz." }
    }
  },
  SWITCH: {
    description: "Eval\xFAa una expresi\xF3n compar\xE1ndola con una lista de valores y devuelve el resultado correspondiente al primer valor coincidente. Si no hay ninguna coincidencia, puede devolverse un valor predeterminado opcional.",
    abstract: "Eval\xFAa una expresi\xF3n compar\xE1ndola con una lista de valores y devuelve el resultado correspondiente al primer valor coincidente. Si no hay ninguna coincidencia, puede devolverse un valor predeterminado opcional.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/switch-function-47ab33c0-28ce-4530-8a45-d532ec4aa25e"
      }
    ],
    functionParameter: {
      expression: { name: "expresi\xF3n", detail: "Expresi\xF3n es el valor (como un n\xFAmero, fecha o texto) que se comparar\xE1 con valor1...valor126." },
      value1: { name: "valor1", detail: "ValorN es un valor que se comparar\xE1 con la expresi\xF3n." },
      result1: { name: "resultado1", detail: "ResultadoN es el valor que se devolver\xE1 cuando el argumento valorN correspondiente coincida con la expresi\xF3n. ResultadoN debe proporcionarse para cada argumento valorN correspondiente." },
      defaultOrValue2: { name: "predeterminado_o_valor2", detail: "Predeterminado es el valor que se devolver\xE1 en caso de que no se encuentren coincidencias en las expresiones valorN. El argumento Predeterminado se identifica por no tener una expresi\xF3n resultadoN correspondiente (consulte los ejemplos). Predeterminado debe ser el \xFAltimo argumento de la funci\xF3n." },
      result2: { name: "resultado2", detail: "ResultadoN es el valor que se devolver\xE1 cuando el argumento valorN correspondiente coincida con la expresi\xF3n. ResultadoN debe proporcionarse para cada argumento valorN correspondiente." }
    }
  },
  TRUE: {
    description: "Devuelve el valor l\xF3gico VERDADERO.",
    abstract: "Devuelve el valor l\xF3gico VERDADERO.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/true-function-7652c6e3-8987-48d0-97cd-ef223246b3fb"
      }
    ],
    functionParameter: {}
  },
  XOR: {
    description: "Devuelve VERDADERO si un n\xFAmero impar de sus argumentos se eval\xFAa como VERDADERO, y FALSO si un n\xFAmero par de sus argumentos se eval\xFAa como VERDADERO.",
    abstract: "Devuelve VERDADERO si un n\xFAmero impar de argumentos son VERDADERO",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/xor-function-1548d4c2-5e47-4f77-9a92-0533bba14f37"
      }
    ],
    functionParameter: {
      logical1: { name: "l\xF3gico1", detail: "La primera condici\xF3n que se desea comprobar y que puede evaluarse como VERDADERO o FALSO." },
      logical2: { name: "l\xF3gico2", detail: "Otras condiciones que se desean comprobar, hasta un m\xE1ximo de 255, que pueden evaluarse como VERDADERO o FALSO." }
    }
  }
};
var es_ES_default27 = locale27;

// ../packages/sheets-formula/src/locale/function-list/lookup/es-ES.ts
var locale28 = {
  ADDRESS: {
    description: "Obtiene la direcci\xF3n de una celda en una hoja de c\xE1lculo, dados los n\xFAmeros de fila y columna especificados. Por ejemplo, DIRECCION(2,3) devuelve $C$2. Como otro ejemplo, DIRECCION(77,300) devuelve $KN$77. Puede usar otras funciones, como las funciones FILA y COLUMNA, para proporcionar los argumentos de n\xFAmero de fila y columna para la funci\xF3n DIRECCION.",
    abstract: "Devuelve una referencia como texto a una celda \xFAnica en una hoja de c\xE1lculo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/address-function-d0c26c0d-3991-446b-8de4-ab46431d4f89"
      }
    ],
    functionParameter: {
      row_num: {
        name: "n\xFAmero de fila",
        detail: "Un valor num\xE9rico que especifica el n\xFAmero de fila a usar en la referencia de celda."
      },
      column_num: {
        name: "n\xFAmero de columna",
        detail: "Un valor num\xE9rico que especifica el n\xFAmero de columna a usar en la referencia de celda."
      },
      abs_num: {
        name: "tipo de referencia",
        detail: "Un valor num\xE9rico que especifica el tipo de referencia a devolver."
      },
      a1: {
        name: "estilo de referencia",
        detail: "Un valor l\xF3gico que especifica el estilo de referencia A1 o F1C1. En el estilo A1, las columnas se etiquetan alfab\xE9ticamente y las filas num\xE9ricamente. En el estilo de referencia F1C1, tanto las columnas como las filas se etiquetan num\xE9ricamente. Si el argumento A1 es VERDADERO o se omite, la funci\xF3n DIRECCION devuelve una referencia de estilo A1; si es FALSO, la funci\xF3n DIRECCION devuelve una referencia de estilo F1C1."
      },
      sheet_text: {
        name: "nombre de la hoja",
        detail: 'Un valor de texto que especifica el nombre de la hoja de c\xE1lculo que se utilizar\xE1 como referencia externa. Por ejemplo, la f\xF3rmula =DIRECCION(1,1,,,"Hoja2") devuelve Hoja2!$A$1. Si se omite el argumento nombre_hoja, no se usa ning\xFAn nombre de hoja y la direcci\xF3n devuelta por la funci\xF3n se refiere a una celda en la hoja actual.'
      }
    }
  },
  AREAS: {
    description: "Devuelve el n\xFAmero de \xE1reas en una referencia",
    abstract: "Devuelve el n\xFAmero de \xE1reas en una referencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/areas-function-8392ba32-7a41-43b3-96b0-3695d2ec6152"
      }
    ],
    functionParameter: {
      reference: { name: "referencia", detail: "Una referencia a una celda o rango de celdas y puede referirse a m\xFAltiples \xE1reas." }
    }
  },
  CHOOSE: {
    description: "Elige un valor de una lista de valores.",
    abstract: "Elige un valor de una lista de valores",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/choose-function-fc5c184f-cb62-4ec7-a46e-38653b98f5bc"
      }
    ],
    functionParameter: {
      indexNum: { name: "n\xFAm_\xEDndice", detail: "Especifica qu\xE9 argumento de valor se selecciona. N\xFAm_\xEDndice debe ser un n\xFAmero entre 1 y 254, o una f\xF3rmula o referencia a una celda que contenga un n\xFAmero entre 1 y 254.\nSi n\xFAm_\xEDndice es 1, ELEGIR devuelve valor1; si es 2, ELEGIR devuelve valor2; y as\xED sucesivamente.\nSi n\xFAm_\xEDndice es menor que 1 o mayor que el n\xFAmero del \xFAltimo valor de la lista, ELEGIR devuelve el valor de error #\xA1VALOR!.\nSi n\xFAm_\xEDndice es una fracci\xF3n, se trunca al entero inferior antes de ser utilizado." },
      value1: { name: "valor1", detail: "ELEGIR selecciona un valor o una acci\xF3n a realizar en funci\xF3n de n\xFAm_\xEDndice. Los argumentos pueden ser n\xFAmeros, referencias de celda, nombres definidos, f\xF3rmulas, funciones o texto." },
      value2: { name: "valor2", detail: "De 1 a 254 argumentos de valor." }
    }
  },
  CHOOSECOLS: {
    description: "Devuelve las columnas especificadas de una matriz",
    abstract: "Devuelve las columnas especificadas de una matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/choosecols-function-bf117976-2722-4466-9b9a-1c01ed9aebff"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz que contiene las columnas que se devolver\xE1n en la nueva matriz." },
      colNum1: { name: "col_n\xFAm1", detail: "La primera columna que se devolver\xE1." },
      colNum2: { name: "col_n\xFAm2", detail: "Columnas adicionales que se devolver\xE1n." }
    }
  },
  CHOOSEROWS: {
    description: "Devuelve las filas especificadas de una matriz",
    abstract: "Devuelve las filas especificadas de una matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/chooserows-function-51ace882-9bab-4a44-9625-7274ef7507a3"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz que contiene las filas que se devolver\xE1n en la nueva matriz." },
      rowNum1: { name: "fila_n\xFAm1", detail: "El n\xFAmero de la primera fila que se devolver\xE1." },
      rowNum2: { name: "fila_n\xFAm2", detail: "N\xFAmeros de filas adicionales que se devolver\xE1n." }
    }
  },
  COLUMN: {
    description: "Devuelve el n\xFAmero de columna de la referencia de celda dada.",
    abstract: "Devuelve el n\xFAmero de columna de una referencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/column-function-44e8c754-711c-4df3-9da4-47a55042554b"
      }
    ],
    functionParameter: {
      reference: { name: "referencia", detail: "La celda o rango de celdas para el cual desea devolver el n\xFAmero de columna." }
    }
  },
  COLUMNS: {
    description: "Devuelve el n\xFAmero de columnas en una matriz o referencia.",
    abstract: "Devuelve el n\xFAmero de columnas en una referencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/columns-function-4e8e7b4e-e603-43e8-b177-956088fa48ca"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "Una matriz o f\xF3rmula de matriz, o una referencia a un rango de celdas para el cual desea el n\xFAmero de columnas." }
    }
  },
  DROP: {
    description: "Excluye un n\xFAmero especificado de filas o columnas desde el inicio o el final de una matriz",
    abstract: "Excluye un n\xFAmero especificado de filas o columnas desde el inicio o el final de una matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/drop-function-1cb4e151-9e17-4838-abe5-9ba48d8c6a34"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz de la que se soltar\xE1n filas o columnas." },
      rows: { name: "filas", detail: "El n\xFAmero de filas a soltar. Un valor negativo suelta desde el final de la matriz." },
      columns: { name: "columnas", detail: "El n\xFAmero de columnas a excluir. Un valor negativo suelta desde el final de la matriz." }
    }
  },
  EXPAND: {
    description: "Expande o rellena una matriz a las dimensiones de fila y columna especificadas",
    abstract: "Expande o rellena una matriz a las dimensiones de fila y columna especificadas",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/expand-function-7433fba5-4ad1-41da-a904-d5d95808bc38"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz a expandir." },
      rows: { name: "filas", detail: "El n\xFAmero de filas en la matriz expandida. Si falta, las filas no se expandir\xE1n." },
      columns: { name: "columnas", detail: "El n\xFAmero de columnas en la matriz expandida. Si falta, las columnas no se expandir\xE1n." },
      padWith: { name: "rellenar_con", detail: "El valor con el que rellenar. El valor predeterminado es #N/A." }
    }
  },
  FILTER: {
    description: "Filtra un rango de datos en funci\xF3n de los criterios que defina",
    abstract: "Filtra un rango de datos en funci\xF3n de los criterios que defina",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/filter-function-f4f7cb66-82eb-4767-8f7c-4877ad80c759"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "El rango o matriz a filtrar." },
      include: { name: "incluir", detail: "Una matriz de valores booleanos donde VERDADERO indica que se debe retener una fila o columna." },
      ifEmpty: { name: "si_vac\xEDo", detail: "Si no se reservan elementos, devolver." }
    }
  },
  FORMULATEXT: {
    description: "Devuelve la f\xF3rmula en la referencia dada como texto",
    abstract: "Devuelve la f\xF3rmula en la referencia dada como texto",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/formulatext-function-0a786771-54fd-4ae2-96ee-09cda35439c8"
      }
    ],
    functionParameter: {
      reference: { name: "referencia", detail: "Una referencia a una celda o rango de celdas." }
    }
  },
  GETPIVOTDATA: {
    description: "Devuelve datos almacenados en un informe de tabla din\xE1mica",
    abstract: "Devuelve datos almacenados en un informe de tabla din\xE1mica",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/getpivotdata-function-8c083b99-a922-4ca0-af5e-3af55960761f"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  HLOOKUP: {
    description: "Busca en la fila superior de una matriz y devuelve el valor de la celda indicada",
    abstract: "Busca en la fila superior de una matriz y devuelve el valor de la celda indicada",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/hlookup-function-a3034eec-b719-4ba3-bb65-e1ad662ed95f"
      }
    ],
    functionParameter: {
      lookupValue: {
        name: "valor_buscado",
        detail: "El valor que se buscar\xE1 en la primera fila de la tabla. Valor_buscado puede ser un valor, una referencia o una cadena de texto."
      },
      tableArray: {
        name: "tabla_matriz",
        detail: "Una tabla de informaci\xF3n en la que se buscan datos. Use una referencia a un rango o un nombre de rango."
      },
      rowIndexNum: {
        name: "\xEDndice_fila_n\xFAm",
        detail: "El n\xFAmero de fila en tabla_matriz desde el cual se devolver\xE1 el valor coincidente. Un \xEDndice_fila_n\xFAm de 1 devuelve el valor de la primera fila en tabla_matriz, un \xEDndice_fila_n\xFAm de 2 devuelve el valor de la segunda fila en tabla_matriz, y as\xED sucesivamente."
      },
      rangeLookup: {
        name: "b\xFAsqueda_rango",
        detail: "Un valor l\xF3gico que especifica si desea que BUSCARH encuentre una coincidencia exacta o una coincidencia aproximada."
      }
    }
  },
  HSTACK: {
    description: "Anexa matrices horizontalmente y en secuencia para devolver una matriz m\xE1s grande",
    abstract: "Anexa matrices horizontalmente y en secuencia para devolver una matriz m\xE1s grande",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/hstack-function-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2"
      }
    ],
    functionParameter: {
      array1: { name: "matriz", detail: "Las matrices a anexar." },
      array2: { name: "matriz", detail: "Las matrices a anexar." }
    }
  },
  HYPERLINK: {
    description: "Crea un hiperv\xEDnculo dentro de una celda.",
    abstract: "Crea un hiperv\xEDnculo dentro de una celda.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.google.com/docs/answer/3093313?sjid=14131674310032162335-NC&hl=es"
      }
    ],
    functionParameter: {
      url: { name: "url", detail: "La URL completa de la ubicaci\xF3n del enlace entre comillas, o una referencia a una celda que contenga dicha URL." },
      linkLabel: { name: "etiqueta_enlace", detail: "El texto que se mostrar\xE1 en la celda como el enlace, entre comillas, o una referencia a una celda que contenga dicha etiqueta." }
    }
  },
  IMAGE: {
    description: "Devuelve una imagen de una fuente determinada",
    abstract: "Devuelve una imagen de una fuente determinada",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/image-function-7e112975-5e52-4f2a-b9da-1d913d51f5d5"
      }
    ],
    functionParameter: {
      source: { name: "origen", detail: 'La ruta de acceso URL, mediante un protocolo "https", del archivo de imagen.' },
      altText: { name: "texto_alternativo", detail: "Texto alternativo que describe la imagen para accesibilidad." },
      sizing: { name: "dimensiones", detail: "Especifica las dimensiones de la imagen." },
      height: { name: "alto", detail: "La altura personalizada de la imagen en p\xEDxeles." },
      width: { name: "ancho", detail: "La anchura personalizada de la imagen en p\xEDxeles." }
    }
  },
  INDEX: {
    description: "Devuelve la referencia de la celda en la intersecci\xF3n de una fila y columna particulares. Si la referencia est\xE1 compuesta por selecciones no adyacentes, puede elegir la selecci\xF3n en la que buscar.",
    abstract: "Usa un \xEDndice para elegir un valor de una referencia o matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/index-function-a5dcf0dd-996d-40a4-a822-b56b061328bd"
      }
    ],
    functionParameter: {
      reference: { name: "referencia", detail: "Una referencia a uno o m\xE1s rangos de celdas." },
      rowNum: { name: "fila_n\xFAm", detail: "El n\xFAmero de la fila en la referencia desde la cual devolver una referencia." },
      columnNum: { name: "columna_n\xFAm", detail: "El n\xFAmero de la columna en la referencia desde la cual devolver una referencia." },
      areaNum: { name: "\xE1rea_n\xFAm", detail: "Selecciona un rango en la referencia desde el cual devolver la intersecci\xF3n de fila_n\xFAm y columna_n\xFAm." }
    }
  },
  INDIRECT: {
    description: "Devuelve la referencia especificada por una cadena de texto. Las referencias se eval\xFAan inmediatamente para mostrar su contenido.",
    abstract: "Devuelve una referencia indicada por un valor de texto",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/indirect-function-474b3a3a-8a26-4f44-b491-92b6306fa261"
      }
    ],
    functionParameter: {
      refText: { name: "ref_texto", detail: "Una referencia a una celda que contiene una referencia de estilo A1, una referencia de estilo F1C1, un nombre definido como una referencia o una referencia a una celda como una cadena de texto." },
      a1: { name: "a1", detail: "Un valor l\xF3gico que especifica qu\xE9 tipo de referencia est\xE1 contenida en la celda ref_texto." }
    }
  },
  LOOKUP: {
    description: "Cuando necesite buscar en una sola fila o columna y encontrar un valor desde la misma posici\xF3n en una segunda fila o columna",
    abstract: "Busca valores en un vector o matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/lookup-function-446d94af-663b-451d-8251-369d5e3864cb"
      }
    ],
    functionParameter: {
      lookupValue: {
        name: "valor_buscado",
        detail: "Un valor que BUSCAR busca en el primer vector. Valor_buscado puede ser un n\xFAmero, texto, un valor l\xF3gico, o un nombre o referencia que se refiera a un valor."
      },
      lookupVectorOrArray: {
        name: "vector_o_matriz_buscado",
        detail: "Un rango que contiene solo una fila o una columna"
      },
      resultVector: {
        name: "vector_resultado",
        detail: "Un rango que contiene solo una fila o columna. El argumento vector_resultado debe tener el mismo tama\xF1o que vector_buscado."
      }
    }
  },
  MATCH: {
    description: "La funci\xF3n COINCIDIR busca un elemento especificado en un rango de celdas y luego devuelve la posici\xF3n relativa de ese elemento en el rango.",
    abstract: "Busca valores en una referencia o matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/match-function-e8dffd45-c762-47d6-bf89-533f4a37673a"
      }
    ],
    functionParameter: {
      lookupValue: { name: "valor_buscado", detail: "El valor que desea hacer coincidir en matriz_buscada." },
      lookupArray: { name: "matriz_buscada", detail: "El rango de celdas que se est\xE1 buscando." },
      matchType: { name: "tipo_coincidencia", detail: "El n\xFAmero -1, 0 o 1." }
    }
  },
  OFFSET: {
    description: "Devuelve una referencia desplazada desde una referencia dada",
    abstract: "Devuelve una referencia desplazada desde una referencia dada",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/offset-function-c8de19ae-dd79-4b9b-a14e-b4d906d11b66"
      }
    ],
    functionParameter: {
      reference: { name: "referencia", detail: "La referencia desde la que desea basar el desplazamiento." },
      rows: { name: "filas", detail: "El n\xFAmero de filas, hacia arriba o hacia abajo, a las que desea que se refiera la celda superior izquierda." },
      cols: { name: "columnas", detail: "El n\xFAmero de columnas, a la izquierda o a la derecha, a las que desea que se refiera la celda superior izquierda del resultado." },
      height: { name: "altura", detail: "La altura, en n\xFAmero de filas, que desea que tenga la referencia devuelta. La altura debe ser un n\xFAmero positivo." },
      width: { name: "anchura", detail: "La anchura, en n\xFAmero de columnas, que desea que tenga la referencia devuelta. La anchura debe ser un n\xFAmero positivo." }
    }
  },
  ROW: {
    description: "Devuelve el n\xFAmero de fila de una referencia",
    abstract: "Devuelve el n\xFAmero de fila de una referencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/row-function-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d"
      }
    ],
    functionParameter: {
      reference: { name: "referencia", detail: "La celda o rango de celdas para el cual desea el n\xFAmero de fila." }
    }
  },
  ROWS: {
    description: "Devuelve el n\xFAmero de filas en una matriz o referencia.",
    abstract: "Devuelve el n\xFAmero de filas en una referencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/rows-function-b592593e-3fc2-47f2-bec1-bda493811597"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "Una matriz, una f\xF3rmula de matriz o una referencia a un rango de celdas para el cual desea el n\xFAmero de filas." }
    }
  },
  RTD: {
    description: "Recupera datos en tiempo real de un programa que admite la automatizaci\xF3n COM",
    abstract: "Recupera datos en tiempo real de un programa que admite la automatizaci\xF3n COM",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/rtd-function-e0cc001a-56f0-470a-9b19-9455dc0eb593"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  SORT: {
    description: "Ordena el contenido de un rango o matriz",
    abstract: "Ordena el contenido de un rango o matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sort-function-22f63bd0-ccc8-492f-953d-c20e8e44b86c"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "El rango o matriz a ordenar." },
      sortIndex: { name: "\xEDndice_ordenaci\xF3n", detail: "Un n\xFAmero que indica el orden de clasificaci\xF3n (por fila o por columna)." },
      sortOrder: { name: "orden_clasificaci\xF3n", detail: "Un n\xFAmero que representa el orden de clasificaci\xF3n deseado; 1 para ascendente (predeterminado), -1 para descendente." },
      byCol: { name: "por_col", detail: "Valor l\xF3gico que indica la direcci\xF3n de clasificaci\xF3n deseada; FALSO ordena por filas (predeterminado), VERDADERO ordena por columnas." }
    }
  },
  SORTBY: {
    description: "Ordena el contenido de un rango o matriz en funci\xF3n de los valores en un rango o matriz correspondiente",
    abstract: "Ordena el contenido de un rango o matriz en funci\xF3n de los valores en un rango o matriz correspondiente",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sortby-function-cd2d7a62-1b93-435c-b561-d6a35134f28f"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "El rango o matriz a ordenar." },
      byArray1: { name: "por_matriz1", detail: "El rango o matriz en funci\xF3n del cual ordenar." },
      sortOrder1: { name: "orden_clasificaci\xF3n1", detail: "Un n\xFAmero que representa el orden de clasificaci\xF3n deseado; 1 para ascendente (predeterminado), -1 para descendente." },
      byArray2: { name: "por_matriz2", detail: "El rango o matriz en funci\xF3n del cual ordenar." },
      sortOrder2: { name: "orden_clasificaci\xF3n2", detail: "Un n\xFAmero que representa el orden de clasificaci\xF3n deseado; 1 para ascendente (predeterminado), -1 para descendente." }
    }
  },
  TAKE: {
    description: "Devuelve un n\xFAmero especificado de filas o columnas contiguas desde el inicio o el final de una matriz",
    abstract: "Devuelve un n\xFAmero especificado de filas o columnas contiguas desde el inicio o el final de una matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/take-function-25382ff1-5da1-4f78-ab43-f33bd2e4e003"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz de la que se tomar\xE1n filas o columnas." },
      rows: { name: "filas", detail: "El n\xFAmero de filas a tomar. Un valor negativo toma desde el final de la matriz." },
      columns: { name: "columnas", detail: "El n\xFAmero de columnas a tomar. Un valor negativo toma desde el final de la matriz." }
    }
  },
  TOCOL: {
    description: "Devuelve la matriz en una sola columna",
    abstract: "Devuelve la matriz en una sola columna",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/tocol-function-22839d9b-0b55-4fc1-b4e6-2761f8f122ed"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o referencia a devolver como una columna." },
      ignore: { name: "ignorar", detail: "Si se deben ignorar ciertos tipos de valores. Por defecto, no se ignora ning\xFAn valor. Especifique uno de los siguientes:\n0 Mantener todos los valores (predeterminado)\n1 Ignorar espacios en blanco\n2 Ignorar errores\n3 Ignorar espacios en blanco y errores" },
      scanByColumn: { name: "escanear_por_columna", detail: "Escanear la matriz por columna. Por defecto, la matriz se escanea por fila. El escaneo determina si los valores se ordenan por fila o por columna." }
    }
  },
  TOROW: {
    description: "Devuelve la matriz en una sola fila",
    abstract: "Devuelve la matriz en una sola fila",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/torow-function-b90d0964-a7d9-44b7-816b-ffa5c2fe2289"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o referencia a devolver como una fila." },
      ignore: { name: "ignorar", detail: "Si se deben ignorar ciertos tipos de valores. Por defecto, no se ignora ning\xFAn valor. Especifique uno de los siguientes:\n0 Mantener todos los valores (predeterminado)\n1 Ignorar espacios en blanco\n2 Ignorar errores\n3 Ignorar espacios en blanco y errores" },
      scanByColumn: { name: "escanear_por_columna", detail: "Escanear la matriz por columna. Por defecto, la matriz se escanea por fila. El escaneo determina si los valores se ordenan por fila o por columna." }
    }
  },
  TRANSPOSE: {
    description: "Devuelve la transpuesta de una matriz",
    abstract: "Devuelve la transpuesta de una matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/transpose-function-ed039415-ed8a-4a81-93e9-4b6dfac76027"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "Un rango de celdas o una matriz en una hoja de c\xE1lculo." }
    }
  },
  UNIQUE: {
    description: "Devuelve una lista de valores \xFAnicos en una lista o rango",
    abstract: "Devuelve una lista de valores \xFAnicos en una lista o rango",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/unique-function-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "El rango o matriz desde el cual se devuelven filas o columnas \xFAnicas." },
      byCol: { name: "por_col", detail: "Es un valor l\xF3gico: compara filas entre s\xED y devuelve valores \xFAnicos = FALSO, o se omite; compara columnas entre s\xED y devuelve valores \xFAnicos = VERDADERO." },
      exactlyOnce: { name: "exactamente_una_vez", detail: "Es un valor l\xF3gico: devuelve filas o columnas de la matriz que aparecen solo una vez = VERDADERO; devuelve todas las filas o columnas distintas de la matriz = FALSO, o se ha omitido." }
    }
  },
  VLOOKUP: {
    description: "Use BUSCARV cuando necesite encontrar cosas en una tabla o un rango por fila. Por ejemplo, busque el precio de una pieza de autom\xF3vil por el n\xFAmero de pieza, o encuentre el nombre de un empleado en funci\xF3n de su ID de empleado.",
    abstract: "Busca en la primera columna de una matriz y se mueve a trav\xE9s de la fila para devolver el valor de una celda",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1"
      }
    ],
    functionParameter: {
      lookupValue: {
        name: "valor_buscado",
        detail: "El valor que desea buscar. El valor que desea buscar debe estar en la primera columna del rango de celdas que especifique en el argumento tabla_matriz."
      },
      tableArray: {
        name: "tabla_matriz",
        detail: "El rango de celdas en el que BUSCARV buscar\xE1 el valor_buscado y el valor de retorno. Puede usar un rango con nombre o una tabla, y puede usar nombres en el argumento en lugar de referencias de celda."
      },
      colIndexNum: {
        name: "col_\xEDndice_n\xFAm",
        detail: "El n\xFAmero de columna (comenzando con 1 para la columna m\xE1s a la izquierda de tabla_matriz) que contiene el valor de retorno."
      },
      rangeLookup: {
        name: "b\xFAsqueda_rango",
        detail: "Un valor l\xF3gico que especifica si desea que BUSCARV encuentre una coincidencia aproximada o exacta: Coincidencia aproximada - 1/VERDADERO, Coincidencia exacta - 0/FALSO"
      }
    }
  },
  VSTACK: {
    description: "Anexa matrices verticalmente y en secuencia para devolver una matriz m\xE1s grande",
    abstract: "Anexa matrices verticalmente y en secuencia para devolver una matriz m\xE1s grande",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/vstack-function-a4b86897-be0f-48fc-adca-fcc10d795a9c"
      }
    ],
    functionParameter: {
      array1: { name: "matriz", detail: "Las matrices a anexar." },
      array2: { name: "matriz", detail: "Las matrices a anexar." }
    }
  },
  WRAPCOLS: {
    description: "Envuelve la fila o columna de valores proporcionada por columnas despu\xE9s de un n\xFAmero espec\xEDfico de elementos",
    abstract: "Envuelve la fila o columna de valores proporcionada por columnas despu\xE9s de un n\xFAmero espec\xEDfico de elementos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/wrapcols-function-d038b05a-57b7-4ee0-be94-ded0792511e2"
      }
    ],
    functionParameter: {
      vector: { name: "vector", detail: "El vector o referencia a envolver." },
      wrapCount: { name: "conteo_envoltura", detail: "El n\xFAmero m\xE1ximo de valores para cada columna." },
      padWith: { name: "rellenar_con", detail: "El valor con el que rellenar. El valor predeterminado es #N/A." }
    }
  },
  WRAPROWS: {
    description: "Envuelve la fila o columna de valores proporcionada por filas despu\xE9s de un n\xFAmero espec\xEDfico de elementos",
    abstract: "Envuelve la fila o columna de valores proporcionada por filas despu\xE9s de un n\xFAmero espec\xEDfico de elementos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/wraprows-function-796825f3-975a-4cee-9c84-1bbddf60ade0"
      }
    ],
    functionParameter: {
      vector: { name: "vector", detail: "El vector o referencia a envolver." },
      wrapCount: { name: "conteo_envoltura", detail: "El n\xFAmero m\xE1ximo de valores para cada fila." },
      padWith: { name: "rellenar_con", detail: "El valor con el que rellenar. El valor predeterminado es #N/A." }
    }
  },
  XLOOKUP: {
    description: "Busca un rango o una matriz, y devuelve un elemento correspondiente a la primera coincidencia que encuentra. Si no existe una coincidencia, entonces BUSCARX puede devolver la coincidencia m\xE1s cercana (aproximada).",
    abstract: "Busca un rango o una matriz, y devuelve un elemento correspondiente a la primera coincidencia que encuentra. Si no existe una coincidencia, entonces BUSCARX puede devolver la coincidencia m\xE1s cercana (aproximada).",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929"
      }
    ],
    functionParameter: {
      lookupValue: {
        name: "valor_buscado",
        detail: "El valor a buscar. Si se omite, BUSCARX devuelve las celdas en blanco que encuentra en matriz_buscada."
      },
      lookupArray: { name: "matriz_buscada", detail: "La matriz o rango a buscar" },
      returnArray: { name: "matriz_devuelta", detail: "La matriz o rango a devolver" },
      ifNotFound: {
        name: "si_no_encontrado",
        detail: "Donde no se encuentra una coincidencia v\xE1lida, devuelve el texto [si_no_encontrado] que proporcione. Si no se encuentra una coincidencia v\xE1lida, y [si_no_encontrado] falta, se devuelve #N/A."
      },
      matchMode: {
        name: "modo_coincidencia",
        detail: "Especifique el tipo de coincidencia: 0 - Coincidencia exacta. Si no se encuentra ninguna, devuelve #N/A. Este es el predeterminado. -1 - Coincidencia exacta. Si no se encuentra ninguna, devuelve el siguiente elemento m\xE1s peque\xF1o. 1 - Coincidencia exacta. Si no se encuentra ninguna, devuelve el siguiente elemento m\xE1s grande. 2 - Una coincidencia con comodines donde *, ?, y ~ tienen un significado especial."
      },
      searchMode: {
        name: "modo_b\xFAsqueda",
        detail: "Especifique el modo de b\xFAsqueda a usar: 1 - Realiza una b\xFAsqueda comenzando en el primer elemento. Este es el predeterminado. -1 - Realiza una b\xFAsqueda inversa comenzando en el \xFAltimo elemento. 2 - Realiza una b\xFAsqueda binaria que depende de que matriz_buscada est\xE9 ordenada en orden ascendente. Si no est\xE1 ordenada, se devolver\xE1n resultados no v\xE1lidos. -2 - Realiza una b\xFAsqueda binaria que depende de que matriz_buscada est\xE9 ordenada en orden descendente. Si no est\xE1 ordenada, se devolver\xE1n resultados no v\xE1lidos."
      }
    }
  },
  XMATCH: {
    description: "Busca un elemento especificado en una matriz o rango de celdas, y luego devuelve la posici\xF3n relativa del elemento.",
    abstract: "Devuelve la posici\xF3n relativa de un elemento en una matriz o rango de celdas.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/xmatch-function-d966da31-7a6b-4a13-a1c6-5a33ed6a0312"
      }
    ],
    functionParameter: {
      lookupValue: { name: "valor_buscado", detail: "El valor de b\xFAsqueda" },
      lookupArray: { name: "matriz_buscada", detail: "La matriz o rango a buscar" },
      matchMode: { name: "modo_coincidencia", detail: "Especifique el tipo de coincidencia:\n0 - Coincidencia exacta (predeterminado)\n-1 - Coincidencia exacta o siguiente elemento m\xE1s peque\xF1o\n1 - Coincidencia exacta o siguiente elemento m\xE1s grande\n2 - Una coincidencia con comodines donde *, ?, y ~ tienen un significado especial." },
      searchMode: { name: "modo_b\xFAsqueda", detail: "Especifique el tipo de b\xFAsqueda:\n1 - Buscar de primero a \xFAltimo (predeterminado)\n-1 - Buscar de \xFAltimo a primero (b\xFAsqueda inversa).\n2 - Realizar una b\xFAsqueda binaria que depende de que matriz_buscada est\xE9 ordenada en orden ascendente. Si no est\xE1 ordenada, se devolver\xE1n resultados no v\xE1lidos.\n-2 - Realizar una b\xFAsqueda binaria que depende de que matriz_buscada est\xE9 ordenada en orden descendente. Si no est\xE1 ordenada, se devolver\xE1n resultados no v\xE1lidos." }
    }
  }
};
var es_ES_default28 = locale28;

// ../packages/sheets-formula/src/locale/function-list/math/es-ES.ts
var locale29 = {
  ABS: {
    description: "Devuelve el valor absoluto de un n\xFAmero. El valor absoluto de un n\xFAmero es el n\xFAmero sin su signo.",
    abstract: "Devuelve el valor absoluto de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/abs-function-3420200f-5628-4e8c-99da-c99d7c87713c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero real del que desea obtener el valor absoluto." }
    }
  },
  ACOS: {
    description: "Devuelve el arcocoseno, o coseno inverso, de un n\xFAmero. El arcocoseno es el \xE1ngulo cuyo coseno es el n\xFAmero. El \xE1ngulo devuelto se da en radianes en el rango de 0 (cero) a pi.",
    abstract: "Devuelve el arcocoseno de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/acos-function-cb73173f-d089-4582-afa1-76e5524b5d5b"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El coseno del \xE1ngulo que desea y debe estar entre -1 y 1." }
    }
  },
  ACOSH: {
    description: "Devuelve el coseno hiperb\xF3lico inverso de un n\xFAmero. El n\xFAmero debe ser mayor o igual que 1. El coseno hiperb\xF3lico inverso es el valor cuyo coseno hiperb\xF3lico es el n\xFAmero, por lo que ACOSH(COSH(n\xFAmero)) es igual a n\xFAmero.",
    abstract: "Devuelve el coseno hiperb\xF3lico inverso de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/acosh-function-e3992cc1-103f-4e72-9f04-624b9ef5ebfe"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real igual o mayor que 1." }
    }
  },
  ACOT: {
    description: "Devuelve el valor principal del arcocotangente, o cotangente inversa, de un n\xFAmero.",
    abstract: "Devuelve el arcocotangente de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/acot-function-dc7e5008-fe6b-402e-bdd6-2eea8383d905"
      }
    ],
    functionParameter: {
      number: {
        name: "n\xFAmero",
        detail: "N\xFAmero es la cotangente del \xE1ngulo que desea. Debe ser un n\xFAmero real."
      }
    }
  },
  ACOTH: {
    description: "Devuelve el arcocotangente hiperb\xF3lico de un n\xFAmero",
    abstract: "Devuelve el arcocotangente hiperb\xF3lico de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/acoth-function-cc49480f-f684-4171-9fc5-73e4e852300f"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor absoluto de N\xFAmero debe ser mayor que 1." }
    }
  },
  AGGREGATE: {
    description: "Devuelve un agregado en una lista o base de datos",
    abstract: "Devuelve un agregado en una lista o base de datos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/aggregate-function-43b9278e-6aa7-4f17-92b6-e19993fa26df"
      }
    ],
    functionParameter: {
      functionNum: { name: "n\xFAm_funci\xF3n", detail: "Un n\xFAmero de 1 a 19 que especifica la funci\xF3n que se usar\xE1." },
      options: { name: "opciones", detail: "Un valor num\xE9rico que determina qu\xE9 valores del rango de evaluaci\xF3n de la funci\xF3n se omitir\xE1n." },
      ref1: { name: "ref1", detail: "El primer argumento num\xE9rico para las funciones que tienen varios argumentos num\xE9ricos de los que desea obtener el valor agregado." },
      ref2: { name: "ref2", detail: "Argumentos num\xE9ricos 2 a 252 cuyo valor agregado desea obtener." }
    }
  },
  ARABIC: {
    description: "Convierte un n\xFAmero romano a ar\xE1bigo, como un n\xFAmero",
    abstract: "Convierte un n\xFAmero romano a ar\xE1bigo, como un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/arabic-function-9a8da418-c17b-4ef9-a657-9370a30a674f"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: 'Una cadena entre comillas, una cadena vac\xEDa (""), o una referencia a una celda que contiene texto.' }
    }
  },
  ASIN: {
    description: "Devuelve el arcoseno de un n\xFAmero.",
    abstract: "Devuelve el arcoseno de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/asin-function-81fb95e5-6d6f-48c4-bc45-58f955c6d347"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El seno del \xE1ngulo que desea y debe estar entre -1 y 1." }
    }
  },
  ASINH: {
    description: "Devuelve el seno hiperb\xF3lico inverso de un n\xFAmero.",
    abstract: "Devuelve el seno hiperb\xF3lico inverso de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/asinh-function-4e00475a-067a-43cf-926a-765b0249717c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real." }
    }
  },
  ATAN: {
    description: "Devuelve el arcotangente de un n\xFAmero.",
    abstract: "Devuelve el arcotangente de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/atan-function-50746fa8-630a-406b-81d0-4a2aed395543"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "La tangente del \xE1ngulo que desea." }
    }
  },
  ATAN2: {
    description: "Devuelve el arcotangente de las coordenadas x e y.",
    abstract: "Devuelve el arcotangente de las coordenadas x e y",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/atan2-function-c04592ab-b9e3-4908-b428-c96b3a565033"
      }
    ],
    functionParameter: {
      xNum: { name: "x_n\xFAm", detail: "La coordenada x del punto." },
      yNum: { name: "y_n\xFAm", detail: "La coordenada y del punto." }
    }
  },
  ATANH: {
    description: "Devuelve la tangente hiperb\xF3lica inversa de un n\xFAmero.",
    abstract: "Devuelve la tangente hiperb\xF3lica inversa de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/atanh-function-3cd65768-0de7-4f1d-b312-d01c8c930d90"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real entre 1 y -1." }
    }
  },
  BASE: {
    description: "Convierte un n\xFAmero en una representaci\xF3n de texto con la base dada (ra\xEDz)",
    abstract: "Convierte un n\xFAmero en una representaci\xF3n de texto con la base dada (ra\xEDz)",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/base-function-2ef61411-aee9-4f29-a811-1c42456c6342"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero que desea convertir. Debe ser un entero mayor o igual a 0 y menor que 2^53." },
      radix: { name: "base", detail: "La base a la que desea convertir el n\xFAmero. Debe ser un entero mayor o igual a 2 y menor o igual a 36." },
      minLength: { name: "longitud_m\xEDnima", detail: "La longitud m\xEDnima de la cadena devuelta. Debe ser un entero mayor o igual a 0." }
    }
  },
  CEILING: {
    description: "Redondea un n\xFAmero al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    abstract: "Redondea un n\xFAmero al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/ceiling-function-0a5cd7c8-0720-4f0a-bd2c-c943e510899f"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor que desea redondear." },
      significance: { name: "cifra_significativa", detail: "El m\xFAltiplo al que desea redondear." }
    }
  },
  CEILING_MATH: {
    description: "Redondea un n\xFAmero hacia arriba, al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    abstract: "Redondea un n\xFAmero hacia arriba, al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/ceiling-math-function-80f95d2f-b499-4eee-9f16-f795a8e306c8"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor que desea redondear." },
      significance: { name: "cifra_significativa", detail: "El m\xFAltiplo al que desea redondear." },
      mode: { name: "modo", detail: "Para n\xFAmeros negativos, controla si el N\xFAmero se redondea hacia cero o en direcci\xF3n contraria a cero." }
    }
  },
  CEILING_PRECISE: {
    description: "Redondea un n\xFAmero al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa. Independientemente del signo del n\xFAmero, el n\xFAmero se redondea hacia arriba.",
    abstract: "Redondea un n\xFAmero al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa. Independientemente del signo del n\xFAmero, el n\xFAmero se redondea hacia arriba.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/ceiling-precise-function-f366a774-527a-4c92-ba49-af0a196e66cb"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor que desea redondear." },
      significance: { name: "cifra_significativa", detail: "El m\xFAltiplo al que desea redondear." }
    }
  },
  COMBIN: {
    description: "Devuelve el n\xFAmero de combinaciones para un n\xFAmero dado de objetos",
    abstract: "Devuelve el n\xFAmero de combinaciones para un n\xFAmero dado de objetos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/combin-function-12a3f276-0a21-423a-8de6-06990aaf638a"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero de elementos." },
      numberChosen: { name: "n\xFAmero_elegido", detail: "El n\xFAmero de elementos en cada combinaci\xF3n." }
    }
  },
  COMBINA: {
    description: "Devuelve el n\xFAmero de combinaciones con repeticiones para un n\xFAmero dado de elementos",
    abstract: "Devuelve el n\xFAmero de combinaciones con repeticiones para un n\xFAmero dado de elementos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/combina-function-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero de elementos." },
      numberChosen: { name: "n\xFAmero_elegido", detail: "El n\xFAmero de elementos en cada combinaci\xF3n." }
    }
  },
  COS: {
    description: "Devuelve el coseno de un n\xFAmero.",
    abstract: "Devuelve el coseno de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/cos-function-0fb808a5-95d6-4553-8148-22aebdce5f05"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El \xE1ngulo en radianes del que desea el coseno." }
    }
  },
  COSH: {
    description: "Devuelve el coseno hiperb\xF3lico de un n\xFAmero",
    abstract: "Devuelve el coseno hiperb\xF3lico de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/cosh-function-e460d426-c471-43e8-9540-a57ff3b70555"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real del que desee encontrar el coseno hiperb\xF3lico." }
    }
  },
  COT: {
    description: "Devuelve la cotangente de un \xE1ngulo",
    abstract: "Devuelve la cotangente de un \xE1ngulo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/cot-function-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El \xE1ngulo en radianes del que desea la cotangente." }
    }
  },
  COTH: {
    description: "Devuelve la cotangente hiperb\xF3lica de un n\xFAmero",
    abstract: "Devuelve la cotangente hiperb\xF3lica de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/coth-function-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real del que desee encontrar la cotangente hiperb\xF3lica." }
    }
  },
  CSC: {
    description: "Devuelve la cosecante de un \xE1ngulo",
    abstract: "Devuelve la cosecante de un \xE1ngulo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/csc-function-07379361-219a-4398-8675-07ddc4f135c1"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El \xE1ngulo en radianes del que desea la cosecante." }
    }
  },
  CSCH: {
    description: "Devuelve la cosecante hiperb\xF3lica de un \xE1ngulo",
    abstract: "Devuelve la cosecante hiperb\xF3lica de un \xE1ngulo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/csch-function-f58f2c22-eb75-4dd6-84f4-a503527f8eeb"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El \xE1ngulo en radianes del que desea la cosecante hiperb\xF3lica." }
    }
  },
  DECIMAL: {
    description: "Convierte una representaci\xF3n de texto de un n\xFAmero en una base dada en un n\xFAmero decimal",
    abstract: "Convierte una representaci\xF3n de texto de un n\xFAmero en una base dada en un n\xFAmero decimal",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/decimal-function-ee554665-6176-46ef-82de-0a283658da2e"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "La longitud de la cadena de Texto debe ser menor o igual a 255 caracteres." },
      radix: { name: "base", detail: "La base a la que desea convertir el n\xFAmero. Debe ser un entero mayor o igual a 2 y menor o igual a 36." }
    }
  },
  DEGREES: {
    description: "Convierte radianes a grados",
    abstract: "Convierte radianes a grados",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/degrees-function-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1"
      }
    ],
    functionParameter: {
      angle: { name: "\xE1ngulo", detail: "El \xE1ngulo en radianes que desea convertir." }
    }
  },
  EVEN: {
    description: "Redondea un n\xFAmero hacia arriba al entero par m\xE1s cercano",
    abstract: "Redondea un n\xFAmero hacia arriba al entero par m\xE1s cercano",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/even-function-197b5f06-c795-4c1e-8696-3c3b8a646cf9"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor a redondear." }
    }
  },
  EXP: {
    description: "Devuelve e elevado a la potencia de un n\xFAmero dado",
    abstract: "Devuelve e elevado a la potencia de un n\xFAmero dado",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/exp-function-c578f034-2c45-4c37-bc8c-329660a63abe"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El exponente aplicado a la base e." }
    }
  },
  FACT: {
    description: "Devuelve el factorial de un n\xFAmero",
    abstract: "Devuelve el factorial de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/fact-function-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero no negativo del que desea el factorial. Si el n\xFAmero no es un entero, se trunca." }
    }
  },
  FACTDOUBLE: {
    description: "Devuelve el doble factorial de un n\xFAmero",
    abstract: "Devuelve el doble factorial de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/factdouble-function-e67697ac-d214-48eb-b7b7-cce2589ecac8"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero no negativo del que desea el doble factorial. Si el n\xFAmero no es un entero, se trunca." }
    }
  },
  FLOOR: {
    description: "Redondea un n\xFAmero hacia abajo, hacia cero",
    abstract: "Redondea un n\xFAmero hacia abajo, hacia cero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/floor-function-14bb497c-24f2-4e04-b327-b0b4de5a8886"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor que desea redondear." },
      significance: { name: "cifra_significativa", detail: "El m\xFAltiplo al que desea redondear." }
    }
  },
  FLOOR_MATH: {
    description: "Redondea un n\xFAmero hacia abajo, al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    abstract: "Redondea un n\xFAmero hacia abajo, al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/floor-math-function-c302b599-fbdb-4177-ba19-2c2b1249a2f5"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor que desea redondear." },
      significance: { name: "cifra_significativa", detail: "El m\xFAltiplo al que desea redondear." },
      mode: { name: "modo", detail: "Para n\xFAmeros negativos, controla si el N\xFAmero se redondea hacia cero o en direcci\xF3n contraria a cero." }
    }
  },
  FLOOR_PRECISE: {
    description: "Redondea un n\xFAmero hacia abajo al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa. Independientemente del signo del n\xFAmero, el n\xFAmero se redondea hacia abajo.",
    abstract: "Redondea un n\xFAmero hacia abajo al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/floor-precise-function-f769b468-1452-4617-8dc3-02f842a0702e"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor que desea redondear." },
      significance: { name: "cifra_significativa", detail: "El m\xFAltiplo al que desea redondear." }
    }
  },
  GCD: {
    description: "Devuelve el m\xE1ximo com\xFAn divisor",
    abstract: "Devuelve el m\xE1ximo com\xFAn divisor",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/gcd-function-d5107a51-69e3-461f-8e4c-ddfc21b5073a"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "Para encontrar el primer n\xFAmero del m\xE1ximo com\xFAn divisor, tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de los par\xE1metros separados por comas." },
      number2: { name: "n\xFAmero2", detail: "El segundo n\xFAmero cuyo m\xE1ximo com\xFAn divisor se va a encontrar. Se pueden especificar hasta 255 n\xFAmeros de esta manera." }
    }
  },
  INT: {
    description: "Redondea un n\xFAmero hacia abajo al entero m\xE1s cercano",
    abstract: "Redondea un n\xFAmero hacia abajo al entero m\xE1s cercano",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/int-function-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero real que desea redondear hacia abajo a un entero." }
    }
  },
  ISO_CEILING: {
    description: "Devuelve un n\xFAmero redondeado hacia arriba al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    abstract: "Devuelve un n\xFAmero redondeado hacia arriba al entero m\xE1s cercano o al m\xFAltiplo m\xE1s cercano de la cifra significativa",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/iso-ceiling-function-e587bb73-6cc2-4113-b664-ff5b09859a83"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  LCM: {
    description: "Devuelve el m\xEDnimo com\xFAn m\xFAltiplo",
    abstract: "Devuelve el m\xEDnimo com\xFAn m\xFAltiplo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/lcm-function-7152b67a-8bb5-4075-ae5c-06ede5563c94"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "Para encontrar el primer n\xFAmero del m\xEDnimo com\xFAn m\xFAltiplo, tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de los par\xE1metros separados por comas." },
      number2: { name: "n\xFAmero2", detail: "El segundo n\xFAmero cuyo m\xEDnimo com\xFAn m\xFAltiplo se va a encontrar. Se pueden especificar hasta 255 n\xFAmeros de esta manera." }
    }
  },
  LET: {
    description: "Asigna nombres a los resultados de los c\xE1lculos para permitir el almacenamiento de c\xE1lculos intermedios, valores o la definici\xF3n de nombres dentro de una f\xF3rmula",
    abstract: "Asigna nombres a los resultados de los c\xE1lculos para permitir el almacenamiento de c\xE1lculos intermedios, valores o la definici\xF3n de nombres dentro de una f\xF3rmula",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  LN: {
    description: "Devuelve el logaritmo natural de un n\xFAmero",
    abstract: "Devuelve el logaritmo natural de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/ln-function-81fe1ed7-dac9-4acd-ba1d-07a142c6118f"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero real positivo del que desea el logaritmo natural." }
    }
  },
  LOG: {
    description: "Devuelve el logaritmo de un n\xFAmero en una base especificada",
    abstract: "Devuelve el logaritmo de un n\xFAmero en una base especificada",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/log-function-4e82f196-1ca9-4747-8fb0-6c4a3abb3280"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero real positivo del que desea el logaritmo." },
      base: { name: "base", detail: "La base del logaritmo. Si se omite la base, se asume que es 10." }
    }
  },
  LOG10: {
    description: "Devuelve el logaritmo en base 10 de un n\xFAmero",
    abstract: "Devuelve el logaritmo en base 10 de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/log10-function-c75b881b-49dd-44fb-b6f4-37e3486a0211"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero real positivo del que desea el logaritmo en base 10." }
    }
  },
  MDETERM: {
    description: "Devuelve el determinante matricial de una matriz",
    abstract: "Devuelve el determinante matricial de una matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/mdeterm-function-e7bfa857-3834-422b-b871-0ffd03717020"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "Una matriz num\xE9rica con un n\xFAmero igual de filas y columnas." }
    }
  },
  MINVERSE: {
    description: "Devuelve la matriz inversa de una matriz",
    abstract: "Devuelve la matriz inversa de una matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/minverse-function-11f55086-adde-4c9f-8eb9-59da2d72efc6"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "Una matriz num\xE9rica con un n\xFAmero igual de filas y columnas." }
    }
  },
  MMULT: {
    description: "Devuelve el producto matricial de dos matrices",
    abstract: "Devuelve el producto matricial de dos matrices",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/mmult-function-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "Las matrices que desea multiplicar." },
      array2: { name: "matriz2", detail: "Las matrices que desea multiplicar." }
    }
  },
  MOD: {
    description: "Devuelve el resto despu\xE9s de que el n\xFAmero se divida por el divisor. El resultado tiene el mismo signo que el divisor.",
    abstract: "Devuelve el resto de la divisi\xF3n",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/mod-function-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero del que desea encontrar el resto." },
      divisor: { name: "divisor", detail: "El n\xFAmero por el que desea dividir el n\xFAmero." }
    }
  },
  MROUND: {
    description: "Devuelve un n\xFAmero redondeado al m\xFAltiplo deseado",
    abstract: "Devuelve un n\xFAmero redondeado al m\xFAltiplo deseado",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/mround-function-c299c3b0-15a5-426d-aa4b-d2d5b3baf427"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor a redondear." },
      multiple: { name: "m\xFAltiplo", detail: "El m\xFAltiplo al que desea redondear el n\xFAmero." }
    }
  },
  MULTINOMIAL: {
    description: "Devuelve el multinomial de un conjunto de n\xFAmeros",
    abstract: "Devuelve el multinomial de un conjunto de n\xFAmeros",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/multinomial-function-6fa6373c-6533-41a2-a45e-a56db1db1bf6"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer valor o rango a usar en el c\xE1lculo." },
      number2: { name: "n\xFAmero2", detail: "Valores o rangos adicionales a usar en los c\xE1lculos." }
    }
  },
  MUNIT: {
    description: "Devuelve la matriz unitaria o la dimensi\xF3n especificada",
    abstract: "Devuelve la matriz unitaria o la dimensi\xF3n especificada",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/munit-function-c9fe916a-dc26-4105-997d-ba22799853a3"
      }
    ],
    functionParameter: {
      dimension: { name: "dimensi\xF3n", detail: "Dimensi\xF3n es un entero que especifica la dimensi\xF3n de la matriz unitaria que desea devolver. Devuelve una matriz. La dimensi\xF3n debe ser mayor que cero." }
    }
  },
  ODD: {
    description: "Redondea un n\xFAmero hacia arriba al entero impar m\xE1s cercano",
    abstract: "Redondea un n\xFAmero hacia arriba al entero impar m\xE1s cercano",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/odd-function-deae64eb-e08a-4c88-8b40-6d0b42575c98"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor a redondear." }
    }
  },
  PI: {
    description: "Devuelve el valor de pi",
    abstract: "Devuelve el valor de pi",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/pi-function-264199d0-a3ba-46b8-975a-c4a04608989b"
      }
    ],
    functionParameter: {}
  },
  POWER: {
    description: "Devuelve el resultado de un n\xFAmero elevado a una potencia.",
    abstract: "Devuelve el resultado de un n\xFAmero elevado a una potencia",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/power-function-d3f2908b-56f4-4c3f-895a-07fb519c362a"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero base. Puede ser cualquier n\xFAmero real." },
      power: { name: "potencia", detail: "El exponente al que se eleva el n\xFAmero base." }
    }
  },
  PRODUCT: {
    description: "Multiplica todos los n\xFAmeros dados como argumentos y devuelve el producto.",
    abstract: "Multiplica sus argumentos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/product-function-8e6b5b24-90ee-4650-aeec-80982a0512ce"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero o rango que desea multiplicar." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros o rangos adicionales que desea multiplicar, hasta un m\xE1ximo de 255 argumentos." }
    }
  },
  QUOTIENT: {
    description: "Devuelve la parte entera de una divisi\xF3n",
    abstract: "Devuelve la parte entera de una divisi\xF3n",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/quotient-function-9f7bf099-2a18-4282-8fa4-65290cc99dee"
      }
    ],
    functionParameter: {
      numerator: { name: "numerador", detail: "El dividendo." },
      denominator: { name: "denominador", detail: "El divisor." }
    }
  },
  RADIANS: {
    description: "Convierte grados a radianes",
    abstract: "Convierte grados a radianes",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/radians-function-ac409508-3d48-45f5-ac02-1497c92de5bf"
      }
    ],
    functionParameter: {
      angle: { name: "\xE1ngulo", detail: "Un \xE1ngulo en grados que desea convertir." }
    }
  },
  RAND: {
    description: "Devuelve un n\xFAmero aleatorio entre 0 y 1",
    abstract: "Devuelve un n\xFAmero aleatorio entre 0 y 1",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/rand-function-4cbfa695-8869-4788-8d90-021ea9f5be73"
      }
    ],
    functionParameter: {}
  },
  RANDARRAY: {
    description: "Devuelve una matriz de n\xFAmeros aleatorios entre 0 y 1. Sin embargo, puede especificar el n\xFAmero de filas y columnas a rellenar, los valores m\xEDnimos y m\xE1ximos, y si se devuelven n\xFAmeros enteros o valores decimales.",
    abstract: "Devuelve una matriz de n\xFAmeros aleatorios entre 0 y 1.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/randarray-function-21261e55-3bec-4885-86a6-8b0a47fd4d33"
      }
    ],
    functionParameter: {
      rows: { name: "filas", detail: "El n\xFAmero de filas que se devolver\xE1n" },
      columns: { name: "columnas", detail: "El n\xFAmero de columnas que se devolver\xE1n" },
      min: { name: "min", detail: "El n\xFAmero m\xEDnimo que le gustar\xEDa que se devolviera" },
      max: { name: "max", detail: "El n\xFAmero m\xE1ximo que le gustar\xEDa que se devolviera" },
      wholeNumber: { name: "n\xFAmero_entero", detail: "Devolver un n\xFAmero entero o un valor decimal" }
    }
  },
  RANDBETWEEN: {
    description: "Devuelve un n\xFAmero aleatorio entre los n\xFAmeros que especifique",
    abstract: "Devuelve un n\xFAmero aleatorio entre los n\xFAmeros que especifique",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/randbetween-function-4cc7f0d1-87dc-4eb7-987f-a469ab381685"
      }
    ],
    functionParameter: {
      bottom: { name: "inferior", detail: "El entero m\xE1s peque\xF1o que devolver\xE1 ALEATORIO.ENTRE." },
      top: { name: "superior", detail: "El entero m\xE1s grande que devolver\xE1 ALEATORIO.ENTRE." }
    }
  },
  ROMAN: {
    description: "Convierte un n\xFAmero ar\xE1bigo a romano, como texto",
    abstract: "Convierte un n\xFAmero ar\xE1bigo a romano, como texto",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/roman-function-d6b0b99e-de46-4704-a518-b45a0f8b56f5"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero ar\xE1bigo que desea convertir." },
      form: { name: "forma", detail: "Un n\xFAmero que especifica el tipo de n\xFAmero romano que desea. El estilo del n\xFAmero romano var\xEDa de Cl\xE1sico a Simplificado, volvi\xE9ndose m\xE1s conciso a medida que aumenta el valor de la forma." }
    }
  },
  ROUND: {
    description: "Redondea un n\xFAmero a un n\xFAmero especificado de d\xEDgitos",
    abstract: "Redondea un n\xFAmero a un n\xFAmero especificado de d\xEDgitos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/round-function-c018c5d8-40fb-4053-90b1-b3e7f61a213c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero que desea redondear." },
      numDigits: { name: "num_d\xEDgitos", detail: "El n\xFAmero de d\xEDgitos al que desea redondear el argumento de n\xFAmero." }
    }
  },
  ROUNDBANK: {
    description: "Redondea un n\xFAmero con redondeo bancario",
    abstract: "Redondea un n\xFAmero con redondeo bancario",
    links: [
      {
        title: "Instrucci\xF3n",
        url: ""
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero que desea redondear con redondeo bancario." },
      numDigits: { name: "num_d\xEDgitos", detail: "El n\xFAmero de d\xEDgitos al que desea redondear con redondeo bancario." }
    }
  },
  ROUNDDOWN: {
    description: "Redondea un n\xFAmero hacia abajo, hacia cero",
    abstract: "Redondea un n\xFAmero hacia abajo, hacia cero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/rounddown-function-2ec94c73-241f-4b01-8c6f-17e6d7968f53"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero que desea redondear." },
      numDigits: { name: "num_d\xEDgitos", detail: "El n\xFAmero de d\xEDgitos al que desea redondear el argumento de n\xFAmero." }
    }
  },
  ROUNDUP: {
    description: "Redondea un n\xFAmero hacia arriba, en direcci\xF3n contraria a cero",
    abstract: "Redondea un n\xFAmero hacia arriba, en direcci\xF3n contraria a cero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/roundup-function-f8bc9b23-e795-47db-8703-db171d0c42a7"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero que desea redondear." },
      numDigits: { name: "num_d\xEDgitos", detail: "El n\xFAmero de d\xEDgitos al que desea redondear el argumento de n\xFAmero." }
    }
  },
  SEC: {
    description: "Devuelve la secante de un \xE1ngulo",
    abstract: "Devuelve la secante de un \xE1ngulo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sec-function-ff224717-9c87-4170-9b58-d069ced6d5f7"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "N\xFAmero es el \xE1ngulo en radianes del que desea la secante." }
    }
  },
  SECH: {
    description: "Devuelve la secante hiperb\xF3lica de un \xE1ngulo",
    abstract: "Devuelve la secante hiperb\xF3lica de un \xE1ngulo",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sech-function-e05a789f-5ff7-4d7f-984a-5edb9b09556f"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "N\xFAmero es el \xE1ngulo en radianes del que desea la secante hiperb\xF3lica." }
    }
  },
  SERIESSUM: {
    description: "Devuelve la suma de una serie de potencias basada en la f\xF3rmula",
    abstract: "Devuelve la suma de una serie de potencias basada en la f\xF3rmula",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/seriessum-function-a3ab25b5-1093-4f5b-b084-96c49087f637"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor de entrada a la serie de potencias." },
      n: { name: "n", detail: "La potencia inicial a la que desea elevar x." },
      m: { name: "m", detail: "El paso por el cual aumentar n para cada t\xE9rmino de la serie." },
      coefficients: { name: "coeficientes", detail: "Un conjunto de coeficientes por los que se multiplica cada potencia sucesiva de x." }
    }
  },
  SEQUENCE: {
    description: "Genera una lista de n\xFAmeros secuenciales en una matriz, como 1, 2, 3, 4",
    abstract: "Genera una lista de n\xFAmeros secuenciales en una matriz, como 1, 2, 3, 4",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sequence-function-57467a98-57e0-4817-9f14-2eb78519ca90"
      }
    ],
    functionParameter: {
      rows: { name: "filas", detail: "El n\xFAmero de filas a devolver." },
      columns: { name: "columnas", detail: "El n\xFAmero de columnas a devolver." },
      start: { name: "inicio", detail: "El primer n\xFAmero en la secuencia." },
      step: { name: "paso", detail: "La cantidad a incrementar cada valor subsiguiente en la matriz." }
    }
  },
  SIGN: {
    description: "Devuelve el signo de un n\xFAmero",
    abstract: "Devuelve el signo de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sign-function-109c932d-fcdc-4023-91f1-2dd0e916a1d8"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real." }
    }
  },
  SIN: {
    description: "Devuelve el seno del \xE1ngulo dado",
    abstract: "Devuelve el seno del \xE1ngulo dado",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sin-function-cf0e3432-8b9e-483c-bc55-a76651c95602"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El \xE1ngulo en radianes del que desea el seno." }
    }
  },
  SINH: {
    description: "Devuelve el seno hiperb\xF3lico de un n\xFAmero",
    abstract: "Devuelve el seno hiperb\xF3lico de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sinh-function-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real." }
    }
  },
  SQRT: {
    description: "Devuelve una ra\xEDz cuadrada positiva",
    abstract: "Devuelve una ra\xEDz cuadrada positiva",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sqrt-function-654975c2-05c4-4831-9a24-2c65e4040fdf"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero del que desea la ra\xEDz cuadrada." }
    }
  },
  SQRTPI: {
    description: "Devuelve la ra\xEDz cuadrada de (n\xFAmero * pi)",
    abstract: "Devuelve la ra\xEDz cuadrada de (n\xFAmero * pi)",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sqrtpi-function-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero por el que se multiplica pi." }
    }
  },
  SUBTOTAL: {
    description: "Devuelve un subtotal en una lista o base de datos.",
    abstract: "Devuelve un subtotal en una lista o base de datos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/subtotal-function-7b027003-f060-4ade-9040-e478765b9939"
      }
    ],
    functionParameter: {
      functionNum: { name: "n\xFAm_funci\xF3n", detail: "El n\xFAmero 1-11 o 101-111 que especifica la funci\xF3n a usar para el subtotal. 1-11 incluye filas ocultas manualmente, mientras que 101-111 las excluye; las celdas filtradas siempre se excluyen." },
      ref1: { name: "ref1", detail: "El primer rango con nombre o referencia para el que desea el subtotal." },
      ref2: { name: "ref2", detail: "Rangos con nombre o referencias 2 a 254 para los que desea el subtotal." }
    }
  },
  SUM: {
    description: "Puede sumar valores individuales, referencias de celda o rangos, o una mezcla de los tres.",
    abstract: "Suma sus argumentos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sum-function-043e1c7d-7726-4e80-8f32-07b23e057f89"
      }
    ],
    functionParameter: {
      number1: {
        name: "N\xFAmero 1",
        detail: "El primer n\xFAmero que desea sumar. El n\xFAmero puede ser como 4, una referencia de celda como B6, o un rango de celdas como B2:B8."
      },
      number2: {
        name: "N\xFAmero 2",
        detail: "Este es el segundo n\xFAmero que desea sumar. Puede especificar hasta 255 n\xFAmeros de esta manera."
      }
    }
  },
  SUMIF: {
    description: "Suma los valores en un rango que cumplen con los criterios que especifique.",
    abstract: "Suma las celdas especificadas por un criterio dado",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sumif-function-169b8c99-c05c-4483-a712-1697a653039b"
      }
    ],
    functionParameter: {
      range: {
        name: "rango",
        detail: "El rango de celdas que desea evaluar por criterios."
      },
      criteria: {
        name: "criterio",
        detail: "El criterio en forma de n\xFAmero, expresi\xF3n, una referencia de celda, texto o una funci\xF3n que define qu\xE9 celdas se sumar\xE1n. Se pueden incluir caracteres comod\xEDn: un signo de interrogaci\xF3n (?) para coincidir con cualquier car\xE1cter individual, un asterisco (*) para coincidir con cualquier secuencia de caracteres. Si desea encontrar un signo de interrogaci\xF3n o asterisco real, escriba una tilde (~) antes del car\xE1cter."
      },
      sumRange: {
        name: "rango_suma",
        detail: "Las celdas reales a sumar, si desea sumar celdas distintas a las especificadas en el argumento de rango. Si se omite el argumento rango_suma, Excel suma las celdas especificadas en el argumento de rango (las mismas celdas a las que se aplica el criterio)."
      }
    }
  },
  SUMIFS: {
    description: "Suma todos sus argumentos que cumplen con m\xFAltiples criterios.",
    abstract: "Suma todos sus argumentos que cumplen con m\xFAltiples criterios.",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sumifs-function-c9e748f5-7ea7-455d-9406-611cebce642b"
      }
    ],
    functionParameter: {
      sumRange: { name: "rango_suma", detail: "El rango de celdas a sumar." },
      criteriaRange1: { name: "rango_criterio1 ", detail: "El rango que se prueba usando criterio1. rango_criterio1 y criterio1 establecen un par de b\xFAsqueda mediante el cual se busca un rango para criterios espec\xEDficos. Una vez que se encuentran los elementos en el rango, se suman sus valores correspondientes en rango_suma." },
      criteria1: { name: "criterio1", detail: 'El criterio que define qu\xE9 celdas en rango_criterio1 se sumar\xE1n. Por ejemplo, el criterio se puede introducir como 32, ">32", B4, "manzanas" o "32".' },
      criteriaRange2: { name: "rango_criterio2", detail: "Rangos adicionales. Puede introducir hasta 127 pares de rangos." },
      criteria2: { name: "criterio2", detail: "Criterios asociados adicionales. Puede introducir hasta 127 pares de criterios." }
    }
  },
  SUMPRODUCT: {
    description: "Devuelve la suma de los productos de los componentes correspondientes de la matriz",
    abstract: "Devuelve la suma de los productos de los componentes correspondientes de la matriz",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sumproduct-function-16753e75-9f68-4874-94ac-4d2145a2fd2e"
      }
    ],
    functionParameter: {
      array1: { name: "matriz", detail: "El primer argumento de matriz cuyos componentes desea multiplicar y luego sumar." },
      array2: { name: "matriz", detail: "Argumentos de matriz 2 a 255 cuyos componentes desea multiplicar y luego sumar." }
    }
  },
  SUMSQ: {
    description: "Devuelve la suma de los cuadrados de los argumentos",
    abstract: "Devuelve la suma de los cuadrados de los argumentos",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sumsq-function-e3313c02-51cc-4963-aae6-31442d9ec307"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "Para elevar al cuadrado y encontrar el primer n\xFAmero, tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de par\xE1metros separados por comas." },
      number2: { name: "n\xFAmero2", detail: "El segundo n\xFAmero que se elevar\xE1 al cuadrado y se sumar\xE1. Se pueden especificar hasta 255 n\xFAmeros de esta manera." }
    }
  },
  SUMX2MY2: {
    description: "Devuelve la suma de la diferencia de cuadrados de los valores correspondientes en dos matrices",
    abstract: "Devuelve la suma de la diferencia de cuadrados de los valores correspondientes en dos matrices",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sumx2my2-function-9e599cc5-5399-48e9-a5e0-e37812dfa3e9"
      }
    ],
    functionParameter: {
      arrayX: { name: "matriz_x", detail: "La primera matriz o rango de valores." },
      arrayY: { name: "matriz_y", detail: "La segunda matriz o rango de valores." }
    }
  },
  SUMX2PY2: {
    description: "Devuelve la suma de la suma de cuadrados de los valores correspondientes en dos matrices",
    abstract: "Devuelve la suma de la suma de cuadrados de los valores correspondientes en dos matrices",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sumx2py2-function-826b60b4-0aa2-4e5e-81d2-be704d3d786f"
      }
    ],
    functionParameter: {
      arrayX: { name: "matriz_x", detail: "La primera matriz o rango de valores." },
      arrayY: { name: "matriz_y", detail: "La segunda matriz o rango de valores." }
    }
  },
  SUMXMY2: {
    description: "Devuelve la suma de los cuadrados de las diferencias de los valores correspondientes en dos matrices",
    abstract: "Devuelve la suma de los cuadrados de las diferencias de los valores correspondientes en dos matrices",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/sumxmy2-function-9d144ac1-4d79-43de-b524-e2ecee23b299"
      }
    ],
    functionParameter: {
      arrayX: { name: "matriz_x", detail: "La primera matriz o rango de valores." },
      arrayY: { name: "matriz_y", detail: "La segunda matriz o rango de valores." }
    }
  },
  TAN: {
    description: "Devuelve la tangente de un n\xFAmero.",
    abstract: "Devuelve la tangente de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/tan-function-08851a40-179f-4052-b789-d7f699447401"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El \xE1ngulo en radianes del que desea la tangente." }
    }
  },
  TANH: {
    description: "Devuelve la tangente hiperb\xF3lica de un n\xFAmero.",
    abstract: "Devuelve la tangente hiperb\xF3lica de un n\xFAmero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/tanh-function-017222f0-a0c3-4f69-9787-b3202295dc6c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Cualquier n\xFAmero real." }
    }
  },
  TRUNC: {
    description: "Trunca un n\xFAmero a un entero",
    abstract: "Trunca un n\xFAmero a un entero",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/es-es/office/trunc-function-8b86a64c-3127-43db-ba14-aa5ceb292721"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero que desea truncar." },
      numDigits: { name: "num_d\xEDgitos", detail: "Un n\xFAmero que especifica la precisi\xF3n del truncamiento. El valor predeterminado para num_d\xEDgitos es 0 (cero)." }
    }
  }
};
var es_ES_default29 = locale29;

// ../packages/sheets-formula/src/locale/function-list/statistical/es-ES.ts
var locale30 = {
  AVEDEV: {
    description: "Devuelve el promedio de las desviaciones absolutas de los puntos de datos con respecto a su media.",
    abstract: "Devuelve el promedio de las desviaciones absolutas de los puntos de datos con respecto a su media",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/avedev-function-58fe8d65-2a84-4dc7-8052-f3f87b5c6639"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea el promedio." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea el promedio, hasta un m\xE1ximo de 255." }
    }
  },
  AVERAGE: {
    description: "Devuelve el promedio (media aritm\xE9tica) de los argumentos.",
    abstract: "Devuelve el promedio de sus argumentos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/average-function-047bac88-d466-426c-a32b-8f33eb960cf6"
      }
    ],
    functionParameter: {
      number1: {
        name: "n\xFAmero1",
        detail: "El primer n\xFAmero, referencia de celda o rango para el que desea el promedio."
      },
      number2: {
        name: "n\xFAmero2",
        detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea el promedio, hasta un m\xE1ximo de 255."
      }
    }
  },
  AVERAGE_WEIGHTED: {
    description: "Encuentra el promedio ponderado de un conjunto de valores, dados los valores y las ponderaciones correspondientes.",
    abstract: "Encuentra el promedio ponderado de un conjunto de valores, dados los valores y las ponderaciones correspondientes.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/9084098?hl=es&ref_topic=3105600&sjid=2155433538747546473-AP"
      }
    ],
    functionParameter: {
      values: { name: "valores", detail: "Los valores para los que se va a calcular el promedio." },
      weights: { name: "ponderaciones", detail: "La lista de ponderaciones correspondientes a aplicar." },
      additionalValues: { name: "valores_adicionales", detail: "Otros valores para los que se va a calcular el promedio." },
      additionalWeights: { name: "ponderaciones_adicionales", detail: "Otras ponderaciones a aplicar." }
    }
  },
  AVERAGEA: {
    description: "Devuelve el promedio de sus argumentos, incluyendo n\xFAmeros, texto y valores l\xF3gicos.",
    abstract: "Devuelve el promedio de sus argumentos, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/averagea-function-f5f84098-d453-4f4c-bbba-3d2c66356091"
      }
    ],
    functionParameter: {
      value1: {
        name: "valor1",
        detail: "El primer n\xFAmero, referencia de celda o rango para el que desea el promedio."
      },
      value2: {
        name: "valor2",
        detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea el promedio, hasta un m\xE1ximo de 255."
      }
    }
  },
  AVERAGEIF: {
    description: "Devuelve el promedio (media aritm\xE9tica) de todas las celdas en un rango que cumplen un criterio determinado.",
    abstract: "Devuelve el promedio (media aritm\xE9tica) de todas las celdas en un rango que cumplen un criterio determinado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/averageif-function-faec8e2e-0dec-4308-af69-f5576d8ac642"
      }
    ],
    functionParameter: {
      range: { name: "rango", detail: "Una o m\xE1s celdas para promediar, incluyendo n\xFAmeros o nombres, matrices o referencias que contengan n\xFAmeros." },
      criteria: { name: "criterio", detail: 'El criterio en forma de n\xFAmero, expresi\xF3n, referencia de celda o texto que define qu\xE9 celdas se promedian. Por ejemplo, el criterio puede expresarse como 32, "32", ">32", "manzanas" o B4.' },
      averageRange: { name: "rango_promedio", detail: "El conjunto real de celdas a promediar. Si se omite, se utiliza el rango." }
    }
  },
  AVERAGEIFS: {
    description: "Devuelve el promedio (media aritm\xE9tica) de todas las celdas que cumplen m\xFAltiples criterios.",
    abstract: "Devuelve el promedio (media aritm\xE9tica) de todas las celdas que cumplen m\xFAltiples criterios",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/averageifs-function-48910c45-1fc0-4389-a028-f7c5c3001690"
      }
    ],
    functionParameter: {
      averageRange: { name: "rango_promedio", detail: "Una o m\xE1s celdas para promediar, incluyendo n\xFAmeros o nombres, matrices o referencias que contengan n\xFAmeros." },
      criteriaRange1: { name: "rango_criterios1", detail: "Es el conjunto de celdas a evaluar con el criterio." },
      criteria1: { name: "criterio1", detail: 'Se utiliza para definir las celdas cuyo promedio se calcular\xE1. Por ejemplo, el criterio puede expresarse como 32, "32", ">32", "manzana" o B4' },
      criteriaRange2: { name: "rango_criterios2", detail: "Rangos adicionales. Puede introducir hasta 127 rangos." },
      criteria2: { name: "criterio2", detail: "Criterios adicionales asociados. Puede introducir hasta 127 criterios." }
    }
  },
  BETA_DIST: {
    description: "Devuelve la funci\xF3n de distribuci\xF3n acumulativa beta",
    abstract: "Devuelve la funci\xF3n de distribuci\xF3n acumulativa beta",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/beta-dist-function-11188c9c-780a-42c7-ba43-9ecb5a878d31"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor entre A y B en el que se eval\xFAa la funci\xF3n." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.BETA devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." },
      A: { name: "A", detail: "Un l\xEDmite inferior para el intervalo de x." },
      B: { name: "B", detail: "Un l\xEDmite superior para el intervalo de x." }
    }
  },
  BETA_INV: {
    description: "Devuelve la inversa de la funci\xF3n de distribuci\xF3n acumulativa para una distribuci\xF3n beta especificada",
    abstract: "Devuelve la inversa de la funci\xF3n de distribuci\xF3n acumulativa para una distribuci\xF3n beta especificada",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/beta-inv-function-e84cb8aa-8df0-4cf6-9892-83a341d252eb"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n beta." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      A: { name: "A", detail: "Un l\xEDmite inferior para el intervalo de x." },
      B: { name: "B", detail: "Un l\xEDmite superior para el intervalo de x." }
    }
  },
  BINOM_DIST: {
    description: "Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribuci\xF3n binomial",
    abstract: "Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribuci\xF3n binomial",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/binom-dist-function-c5ae37b6-f39c-4be2-94c2-509a1480770c"
      }
    ],
    functionParameter: {
      numberS: { name: "n\xFAm_\xE9xito", detail: "El n\xFAmero de \xE9xitos en los ensayos." },
      trials: { name: "ensayos", detail: "El n\xFAmero de ensayos independientes." },
      probabilityS: { name: "prob_\xE9xito", detail: "La probabilidad de \xE9xito en cada ensayo." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.BINOM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  BINOM_DIST_RANGE: {
    description: "Devuelve la probabilidad de un resultado de ensayo usando una distribuci\xF3n binomial",
    abstract: "Devuelve la probabilidad de un resultado de ensayo usando una distribuci\xF3n binomial",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/binom-dist-range-function-17331329-74c7-4053-bb4c-6653a7421595"
      }
    ],
    functionParameter: {
      trials: { name: "ensayos", detail: "El n\xFAmero de ensayos independientes." },
      probabilityS: { name: "prob_\xE9xito", detail: "La probabilidad de \xE9xito en cada ensayo." },
      numberS: { name: "n\xFAm_\xE9xito", detail: "El n\xFAmero de \xE9xitos en los ensayos." },
      numberS2: { name: "n\xFAm_\xE9xito2", detail: "Si se proporciona, devuelve la probabilidad de que el n\xFAmero de ensayos exitosos se encuentre entre n\xFAm_\xE9xito y n\xFAm_\xE9xito2." }
    }
  },
  BINOM_INV: {
    description: "Devuelve el menor valor para el cual la distribuci\xF3n binomial acumulativa es menor o igual a un valor de criterio",
    abstract: "Devuelve el menor valor para el cual la distribuci\xF3n binomial acumulativa es menor o igual a un valor de criterio",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/binom-inv-function-80a0370c-ada6-49b4-83e7-05a91ba77ac9"
      }
    ],
    functionParameter: {
      trials: { name: "ensayos", detail: "El n\xFAmero de ensayos de Bernoulli." },
      probabilityS: { name: "prob_\xE9xito", detail: "La probabilidad de \xE9xito en cada ensayo." },
      alpha: { name: "alfa", detail: "El valor de criterio." }
    }
  },
  CHISQ_DIST: {
    description: "Devuelve la probabilidad de cola izquierda de la distribuci\xF3n chi-cuadrado.",
    abstract: "Devuelve la probabilidad de cola izquierda de la distribuci\xF3n chi-cuadrado.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/chisq-dist-function-8486b05e-5c05-4942-a9ea-f6b341518732"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se desea evaluar la distribuci\xF3n." },
      degFreedom: { name: "grados_libertad", detail: "El n\xFAmero de grados de libertad." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.CHI devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  CHISQ_DIST_RT: {
    description: "Devuelve la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    abstract: "Devuelve la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/chisq-dist-rt-function-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se desea evaluar la distribuci\xF3n." },
      degFreedom: { name: "grados_libertad", detail: "El n\xFAmero de grados de libertad." }
    }
  },
  CHISQ_INV: {
    description: "Devuelve la inversa de la probabilidad de cola izquierda de la distribuci\xF3n chi-cuadrado.",
    abstract: "Devuelve la inversa de la probabilidad de cola izquierda de la distribuci\xF3n chi-cuadrado.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/chisq-inv-function-400db556-62b3-472d-80b3-254723e7092f"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n chi-cuadrado." },
      degFreedom: { name: "grados_libertad", detail: "El n\xFAmero de grados de libertad." }
    }
  },
  CHISQ_INV_RT: {
    description: "Devuelve la inversa de la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    abstract: "Devuelve la inversa de la probabilidad de cola derecha de la distribuci\xF3n chi-cuadrado.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/chisq-inv-rt-function-435b5ed8-98d5-4da6-823f-293e2cbc94fe"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n chi-cuadrado." },
      degFreedom: { name: "grados_libertad", detail: "El n\xFAmero de grados de libertad." }
    }
  },
  CHISQ_TEST: {
    description: "Devuelve la prueba de independencia",
    abstract: "Devuelve la prueba de independencia",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/chisq-test-function-2e8a7861-b14a-4985-aa93-fb88de3f260f"
      }
    ],
    functionParameter: {
      actualRange: { name: "rango_real", detail: "El rango de datos que contiene las observaciones para contrastar con los valores esperados." },
      expectedRange: { name: "rango_esperado", detail: "El rango de datos que contiene la proporci\xF3n del producto de los totales de fila y los totales de columna con respecto al total general." }
    }
  },
  CONFIDENCE_NORM: {
    description: "Devuelve el intervalo de confianza para la media de una poblaci\xF3n, usando una distribuci\xF3n normal.",
    abstract: "Devuelve el intervalo de confianza para la media de una poblaci\xF3n, usando una distribuci\xF3n normal.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/confidence-norm-function-7cec58a6-85bb-488d-91c3-63828d4fbfd4"
      }
    ],
    functionParameter: {
      alpha: { name: "alfa", detail: "El nivel de significaci\xF3n usado para calcular el nivel de confianza. El nivel de confianza es igual a 100*(1 - alfa)%, o en otras palabras, un alfa de 0,05 indica un nivel de confianza del 95 por ciento." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la poblaci\xF3n para el rango de datos y se asume que es conocida." },
      size: { name: "tama\xF1o", detail: "El tama\xF1o de la muestra." }
    }
  },
  CONFIDENCE_T: {
    description: "Devuelve el intervalo de confianza para la media de una poblaci\xF3n, usando una distribuci\xF3n t de Student",
    abstract: "Devuelve el intervalo de confianza para la media de una poblaci\xF3n, usando una distribuci\xF3n t de Student",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/confidence-t-function-e8eca395-6c3a-4ba9-9003-79ccc61d3c53"
      }
    ],
    functionParameter: {
      alpha: { name: "alfa", detail: "El nivel de significaci\xF3n usado para calcular el nivel de confianza. El nivel de confianza es igual a 100*(1 - alfa)%, o en otras palabras, un alfa de 0,05 indica un nivel de confianza del 95 por ciento." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la poblaci\xF3n para el rango de datos y se asume que es conocida." },
      size: { name: "tama\xF1o", detail: "El tama\xF1o de la muestra." }
    }
  },
  CORREL: {
    description: "Devuelve el coeficiente de correlaci\xF3n entre dos conjuntos de datos",
    abstract: "Devuelve el coeficiente de correlaci\xF3n entre dos conjuntos de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/correl-function-995dcef7-0c0a-4bed-a3fb-239d7b68ca92"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "Un primer rango de valores de celda." },
      array2: { name: "matriz2", detail: "Un segundo rango de valores de celda." }
    }
  },
  COUNT: {
    description: "Cuenta el n\xFAmero de celdas que contienen n\xFAmeros y cuenta los n\xFAmeros dentro de la lista de argumentos.",
    abstract: "Cuenta cu\xE1ntos n\xFAmeros hay en la lista de argumentos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/count-function-a59cd7fc-b623-4d93-87a4-d23bf411294c"
      }
    ],
    functionParameter: {
      value1: {
        name: "valor1",
        detail: "El primer elemento, referencia de celda o rango dentro del cual desea contar n\xFAmeros."
      },
      value2: {
        name: "valor2",
        detail: "Hasta 255 elementos, referencias de celda o rangos adicionales dentro de los cuales desea contar n\xFAmeros."
      }
    }
  },
  COUNTA: {
    description: `Cuenta las celdas que contienen cualquier tipo de informaci\xF3n, incluyendo valores de error y texto vac\xEDo ("")
        Si no necesita contar valores l\xF3gicos, texto o valores de error`,
    abstract: "Cuenta cu\xE1ntos valores hay en la lista de argumentos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/counta-function-7dc98875-d5c1-46f1-9a82-53f3219e2509"
      }
    ],
    functionParameter: {
      number1: {
        name: "valor1",
        detail: "El primer argumento que representa los valores que desea contar."
      },
      number2: {
        name: "valor2",
        detail: "Argumentos adicionales que representan los valores que desea contar, hasta un m\xE1ximo de 255 argumentos."
      }
    }
  },
  COUNTBLANK: {
    description: "Cuenta el n\xFAmero de celdas en blanco dentro de un rango.",
    abstract: "Cuenta el n\xFAmero de celdas en blanco dentro de un rango",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/countblank-function-6a92d772-675c-4bee-b346-24af6bd3ac22"
      }
    ],
    functionParameter: {
      range: { name: "rango", detail: "El rango desde el cual desea contar las celdas en blanco." }
    }
  },
  COUNTIF: {
    description: "Cuenta el n\xFAmero de celdas dentro de un rango que cumplen el criterio dado.",
    abstract: "Cuenta el n\xFAmero de celdas dentro de un rango que cumplen el criterio dado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/countif-function-e0de10c6-f885-4e71-abb4-1f464816df34"
      }
    ],
    functionParameter: {
      range: { name: "rango", detail: "El grupo de celdas que desea contar. El rango puede contener n\xFAmeros, matrices, un rango con nombre o referencias que contengan n\xFAmeros. Los valores en blanco y de texto se ignoran." },
      criteria: { name: "criterio", detail: 'Un n\xFAmero, expresi\xF3n, referencia de celda o cadena de texto que determina qu\xE9 celdas se contar\xE1n.\nPor ejemplo, puede usar un n\xFAmero como 32, una comparaci\xF3n como ">32", una celda como B4 o una palabra como "manzanas".\nCONTAR.SI usa solo un \xFAnico criterio. Use CONTAR.SI.CONJUNTO si desea usar m\xFAltiples criterios.' }
    }
  },
  COUNTIFS: {
    description: "Cuenta el n\xFAmero de celdas dentro de un rango que cumplen m\xFAltiples criterios.",
    abstract: "Cuenta el n\xFAmero de celdas dentro de un rango que cumplen m\xFAltiples criterios",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/countifs-function-dda3dc6e-f74e-4aee-88bc-aa8c2a866842"
      }
    ],
    functionParameter: {
      criteriaRange1: { name: "rango_criterios1", detail: "El primer rango en el que evaluar los criterios asociados." },
      criteria1: { name: "criterio1", detail: 'El criterio en forma de n\xFAmero, expresi\xF3n, referencia de celda o texto que define qu\xE9 celdas se contar\xE1n. Por ejemplo, los criterios pueden expresarse como 32, ">32", B4, "manzanas" o "32".' },
      criteriaRange2: { name: "rango_criterios2", detail: "Rangos adicionales. Puede introducir hasta 127 rangos." },
      criteria2: { name: "criterio2", detail: "Criterios adicionales asociados. Puede introducir hasta 127 criterios." }
    }
  },
  COVARIANCE_P: {
    description: "Devuelve la covarianza de la poblaci\xF3n, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.",
    abstract: "Devuelve la covarianza de la poblaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/covariance-p-function-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "Un primer rango de valores de celda." },
      array2: { name: "matriz2", detail: "Un segundo rango de valores de celda." }
    }
  },
  COVARIANCE_S: {
    description: "Devuelve la covarianza de la muestra, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.",
    abstract: "Devuelve la covarianza de la muestra",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/covariance-s-function-0a539b74-7371-42aa-a18f-1f5320314977"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "Un primer rango de valores de celda." },
      array2: { name: "matriz2", detail: "Un segundo rango de valores de celda." }
    }
  },
  DEVSQ: {
    description: "Devuelve la suma de los cuadrados de las desviaciones",
    abstract: "Devuelve la suma de los cuadrados de las desviaciones",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/devsq-function-8b739616-8376-4df5-8bd0-cfe0a6caf444"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento para el que desea calcular la suma de las desviaciones al cuadrado." },
      number2: { name: "n\xFAmero2", detail: "Los argumentos del 2 al 255 para los que desea calcular la suma de las desviaciones al cuadrado." }
    }
  },
  EXPON_DIST: {
    description: "Devuelve la distribuci\xF3n exponencial",
    abstract: "Devuelve la distribuci\xF3n exponencial",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/expon-dist-function-4c12ae24-e563-4155-bf3e-8b78b6ae140e"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se desea evaluar la distribuci\xF3n." },
      lambda: { name: "lambda", detail: "El valor del par\xE1metro." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.EXP devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  F_DIST: {
    description: "Devuelve la distribuci\xF3n de probabilidad F",
    abstract: "Devuelve la distribuci\xF3n de probabilidad F",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/f-dist-function-a887efdc-7c8e-46cb-a74a-f884cd29b25d"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se eval\xFAa la funci\xF3n." },
      degFreedom1: { name: "grados_libertad1", detail: "Los grados de libertad del numerador." },
      degFreedom2: { name: "grados_libertad2", detail: "Los grados de libertad del denominador." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.F devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  F_DIST_RT: {
    description: "Devuelve la distribuci\xF3n de probabilidad F (de cola derecha)",
    abstract: "Devuelve la distribuci\xF3n de probabilidad F (de cola derecha)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/f-dist-rt-function-d74cbb00-6017-4ac9-b7d7-6049badc0520"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor en el que se eval\xFAa la funci\xF3n." },
      degFreedom1: { name: "grados_libertad1", detail: "Los grados de libertad del numerador." },
      degFreedom2: { name: "grados_libertad2", detail: "Los grados de libertad del denominador." }
    }
  },
  F_INV: {
    description: "Devuelve la inversa de la distribuci\xF3n de probabilidad F",
    abstract: "Devuelve la inversa de la distribuci\xF3n de probabilidad F",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/f-inv-function-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n F acumulativa." },
      degFreedom1: { name: "grados_libertad1", detail: "Los grados de libertad del numerador." },
      degFreedom2: { name: "grados_libertad2", detail: "Los grados de libertad del denominador." }
    }
  },
  F_INV_RT: {
    description: "Devuelve la inversa de la distribuci\xF3n de probabilidad F (de cola derecha)",
    abstract: "Devuelve la inversa de la distribuci\xF3n de probabilidad F (de cola derecha)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/f-inv-rt-function-d371aa8f-b0b1-40ef-9cc2-496f0693ac00"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n F acumulativa." },
      degFreedom1: { name: "grados_libertad1", detail: "Los grados de libertad del numerador." },
      degFreedom2: { name: "grados_libertad2", detail: "Los grados de libertad del denominador." }
    }
  },
  F_TEST: {
    description: "Devuelve el resultado de una prueba F",
    abstract: "Devuelve el resultado de una prueba F",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/f-test-function-100a59e7-4108-46f8-8443-78ffacb6c0a7"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "La primera matriz o rango de datos." },
      array2: { name: "matriz2", detail: "La segunda matriz o rango de datos." }
    }
  },
  FISHER: {
    description: "Devuelve la transformaci\xF3n de Fisher",
    abstract: "Devuelve la transformaci\xF3n de Fisher",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/fisher-function-d656523c-5076-4f95-b87b-7741bf236c69"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "Un valor num\xE9rico para el que desea la transformaci\xF3n." }
    }
  },
  FISHERINV: {
    description: "Devuelve la inversa de la transformaci\xF3n de Fisher",
    abstract: "Devuelve la inversa de la transformaci\xF3n de Fisher",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/fisherinv-function-62504b39-415a-4284-a285-19c8e82f86bb"
      }
    ],
    functionParameter: {
      y: { name: "y", detail: "El valor para el que desea realizar la inversa de la transformaci\xF3n." }
    }
  },
  FORECAST: {
    description: "Devuelve un valor a lo largo de una tendencia lineal",
    abstract: "Devuelve un valor a lo largo de una tendencia lineal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El punto de datos para el que desea predecir un valor." },
      knownYs: { name: "conocido_y", detail: "La matriz o rango de datos dependiente." },
      knownXs: { name: "conocido_x", detail: "La matriz o rango de datos independiente." }
    }
  },
  FORECAST_ETS: {
    description: "Devuelve un valor futuro basado en valores existentes (hist\xF3ricos) utilizando la versi\xF3n AAA del algoritmo de Suavizado Exponencial (ETS)",
    abstract: "Devuelve un valor futuro basado en valores existentes (hist\xF3ricos) utilizando la versi\xF3n AAA del algoritmo de Suavizado Exponencial (ETS)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  FORECAST_ETS_CONFINT: {
    description: "Devuelve un intervalo de confianza para el valor de pron\xF3stico en la fecha objetivo especificada",
    abstract: "Devuelve un intervalo de confianza para el valor de pron\xF3stico en la fecha objetivo especificada",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  FORECAST_ETS_SEASONALITY: {
    description: "Devuelve la longitud del patr\xF3n repetitivo que Excel detecta para la serie temporal especificada",
    abstract: "Devuelve la longitud del patr\xF3n repetitivo que Excel detecta para la serie temporal especificada",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  FORECAST_ETS_STAT: {
    description: "Devuelve un valor estad\xEDstico como resultado de la previsi\xF3n de series temporales",
    abstract: "Devuelve un valor estad\xEDstico como resultado de la previsi\xF3n de series temporales",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  FORECAST_LINEAR: {
    description: "Devuelve un valor futuro basado en valores existentes",
    abstract: "Devuelve un valor futuro basado en valores existentes",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El punto de datos para el que desea predecir un valor." },
      knownYs: { name: "conocido_y", detail: "La matriz o rango de datos dependiente." },
      knownXs: { name: "conocido_x", detail: "La matriz o rango de datos independiente." }
    }
  },
  FREQUENCY: {
    description: "Devuelve una distribuci\xF3n de frecuencia como una matriz vertical",
    abstract: "Devuelve una distribuci\xF3n de frecuencia como una matriz vertical",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/frequency-function-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9"
      }
    ],
    functionParameter: {
      dataArray: { name: "matriz_datos", detail: "Una matriz o referencia a un conjunto de valores para los que desea contar frecuencias. Si matriz_datos no contiene valores, FRECUENCIA devuelve una matriz de ceros." },
      binsArray: { name: "matriz_bins", detail: "Una matriz o referencia a intervalos en los que desea agrupar los valores de matriz_datos. Si matriz_bins no contiene valores, FRECUENCIA devuelve el n\xFAmero de elementos en matriz_datos." }
    }
  },
  GAMMA: {
    description: "Devuelve el valor de la funci\xF3n Gamma",
    abstract: "Devuelve el valor de la funci\xF3n Gamma",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/gamma-function-ce1702b1-cf55-471d-8307-f83be0fc5297"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Valor de entrada para la funci\xF3n gamma." }
    }
  },
  GAMMA_DIST: {
    description: "Devuelve la distribuci\xF3n gamma",
    abstract: "Devuelve la distribuci\xF3n gamma",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/gamma-dist-function-9b6f1538-d11c-4d5f-8966-21f6a2201def"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.GAMMA devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  GAMMA_INV: {
    description: "Devuelve la inversa de la distribuci\xF3n gamma acumulativa",
    abstract: "Devuelve la inversa de la distribuci\xF3n gamma acumulativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/gamma-inv-function-74991443-c2b0-4be5-aaab-1aa4d71fbb18"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad asociada con la distribuci\xF3n gamma." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." }
    }
  },
  GAMMALN: {
    description: "Devuelve el logaritmo natural de la funci\xF3n gamma, \u0393(x)",
    abstract: "Devuelve el logaritmo natural de la funci\xF3n gamma, \u0393(x)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/gammaln-function-b838c48b-c65f-484f-9e1d-141c55470eb9"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea calcular GAMMALN." }
    }
  },
  GAMMALN_PRECISE: {
    description: "Devuelve el logaritmo natural de la funci\xF3n gamma, \u0393(x)",
    abstract: "Devuelve el logaritmo natural de la funci\xF3n gamma, \u0393(x)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/gammaln-precise-function-5cdfe601-4e1e-4189-9d74-241ef1caa599"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea calcular GAMMALN.PRECISO." }
    }
  },
  GAUSS: {
    description: "Devuelve 0.5 menos que la distribuci\xF3n normal acumulativa est\xE1ndar",
    abstract: "Devuelve 0.5 menos que la distribuci\xF3n normal acumulativa est\xE1ndar",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/gauss-function-069f1b4e-7dee-4d6a-a71f-4b69044a6b33"
      }
    ],
    functionParameter: {
      z: { name: "z", detail: "El valor para el que desea la distribuci\xF3n." }
    }
  },
  GEOMEAN: {
    description: "Devuelve la media geom\xE9trica",
    abstract: "Devuelve la media geom\xE9trica",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/geomean-function-db1ac48d-25a5-40a0-ab83-0b38980e40d5"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea la media geom\xE9trica." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea la media geom\xE9trica, hasta un m\xE1ximo de 255." }
    }
  },
  GROWTH: {
    description: "Devuelve valores a lo largo de una tendencia exponencial",
    abstract: "Devuelve valores a lo largo de una tendencia exponencial",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/growth-function-541a91dc-3d5e-437d-b156-21324e68b80d"
      }
    ],
    functionParameter: {
      knownYs: { name: "conocido_y", detail: "El conjunto de valores y que ya conoce en la relaci\xF3n y = b*m^x." },
      knownXs: { name: "conocido_x", detail: "El conjunto de valores x que ya conoce en la relaci\xF3n y = b*m^x." },
      newXs: { name: "nuevo_x", detail: "Son nuevos valores x para los que desea que CRECIMIENTO devuelva los valores y correspondientes." },
      constb: { name: "constante", detail: "Un valor l\xF3gico que especifica si se debe forzar que la constante b sea igual a 1." }
    }
  },
  HARMEAN: {
    description: "Devuelve la media arm\xF3nica",
    abstract: "Devuelve la media arm\xF3nica",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/harmean-function-5efd9184-fab5-42f9-b1d3-57883a1d3bc6"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea la media arm\xF3nica." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea la media arm\xF3nica, hasta un m\xE1ximo de 255." }
    }
  },
  HYPGEOM_DIST: {
    description: "Devuelve la distribuci\xF3n hipergeom\xE9trica",
    abstract: "Devuelve la distribuci\xF3n hipergeom\xE9trica",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/hypgeom-dist-function-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf"
      }
    ],
    functionParameter: {
      sampleS: { name: "muestra_\xE9xito", detail: "El n\xFAmero de \xE9xitos en la muestra." },
      numberSample: { name: "n\xFAm_muestra", detail: "El tama\xF1o de la muestra." },
      populationS: { name: "poblaci\xF3n_\xE9xito", detail: "El n\xFAmero de \xE9xitos en la poblaci\xF3n." },
      numberPop: { name: "n\xFAm_poblaci\xF3n", detail: "El tama\xF1o de la poblaci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.HIPERGEOM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  INTERCEPT: {
    description: "Devuelve la intersecci\xF3n de la l\xEDnea de regresi\xF3n lineal",
    abstract: "Devuelve la intersecci\xF3n de la l\xEDnea de regresi\xF3n lineal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/intercept-function-2a9b74e2-9d47-4772-b663-3bca70bf63ef"
      }
    ],
    functionParameter: {
      knownYs: { name: "conocido_y", detail: "La matriz o rango de datos dependiente." },
      knownXs: { name: "conocido_x", detail: "La matriz o rango de datos independiente." }
    }
  },
  KURT: {
    description: "Devuelve la curtosis de un conjunto de datos",
    abstract: "Devuelve la curtosis de un conjunto de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/kurt-function-bc3a265c-5da4-4dcb-b7fd-c237789095ab"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea la curtosis." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea la curtosis, hasta un m\xE1ximo de 255." }
    }
  },
  LARGE: {
    description: "Devuelve el k-\xE9simo valor m\xE1s grande de un conjunto de datos",
    abstract: "Devuelve el k-\xE9simo valor m\xE1s grande de un conjunto de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/large-function-3af0af19-1190-42bb-bb8b-01672ec00a64"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos para el que desea determinar el k-\xE9simo valor m\xE1s grande." },
      k: { name: "k", detail: "La posici\xF3n (desde el m\xE1s grande) en la matriz o rango de celdas de datos a devolver." }
    }
  },
  LINEST: {
    description: "Devuelve los par\xE1metros de una tendencia lineal",
    abstract: "Devuelve los par\xE1metros de una tendencia lineal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/linest-function-84d7d0d9-6e50-4101-977a-fa7abf772b6d"
      }
    ],
    functionParameter: {
      knownYs: { name: "conocido_y", detail: "El conjunto de valores y que ya conoce en la relaci\xF3n y = m*x+b." },
      knownXs: { name: "conocido_x", detail: "El conjunto de valores x que ya conoce en la relaci\xF3n y = m*x+b." },
      constb: { name: "constante", detail: "Un valor l\xF3gico que especifica si se debe forzar que la constante b sea igual a 0." },
      stats: { name: "estad\xEDsticas", detail: "Un valor l\xF3gico que especifica si se deben devolver estad\xEDsticas de regresi\xF3n adicionales." }
    }
  },
  LOGEST: {
    description: "Devuelve los par\xE1metros de una tendencia exponencial",
    abstract: "Devuelve los par\xE1metros de una tendencia exponencial",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/logest-function-f27462d8-3657-4030-866b-a272c1d18b4b"
      }
    ],
    functionParameter: {
      knownYs: { name: "conocido_y", detail: "El conjunto de valores y que ya conoce en la relaci\xF3n y = b*m^x." },
      knownXs: { name: "conocido_x", detail: "El conjunto de valores x que ya conoce en la relaci\xF3n y = b*m^x." },
      constb: { name: "constante", detail: "Un valor l\xF3gico que especifica si se debe forzar que la constante b sea igual a 1." },
      stats: { name: "estad\xEDsticas", detail: "Un valor l\xF3gico que especifica si se deben devolver estad\xEDsticas de regresi\xF3n adicionales." }
    }
  },
  LOGNORM_DIST: {
    description: "Devuelve la distribuci\xF3n logar\xEDtmico-normal acumulativa",
    abstract: "Devuelve la distribuci\xF3n logar\xEDtmico-normal acumulativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/lognorm-dist-function-eb60d00b-48a9-4217-be2b-6074aee6b070"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DIST.LOGNORM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  LOGNORM_INV: {
    description: "Devuelve la inversa de la distribuci\xF3n logar\xEDtmico-normal acumulativa",
    abstract: "Devuelve la inversa de la distribuci\xF3n logar\xEDtmico-normal acumulativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/lognorm-inv-function-fe79751a-f1f2-4af8-a0a1-e151b2d4f600"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad correspondiente a la distribuci\xF3n logar\xEDtmico-normal." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." }
    }
  },
  MARGINOFERROR: {
    description: "Calcula el margen de error a partir de un rango de valores y un nivel de confianza.",
    abstract: "Calcula el margen de error a partir de un rango de valores y un nivel de confianza.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/12487850?hl=es&sjid=11250989209896695200-AP"
      }
    ],
    functionParameter: {
      range: { name: "rango", detail: "El rango de valores utilizado para calcular el margen de error." },
      confidence: { name: "confianza", detail: "El nivel de confianza deseado entre (0, 1)." }
    }
  },
  MAX: {
    description: "Devuelve el valor m\xE1s grande de un conjunto de valores.",
    abstract: "Devuelve el valor m\xE1ximo en una lista de argumentos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/max-function-e0012414-9ac8-4b34-9a47-73e662c08098"
      }
    ],
    functionParameter: {
      number1: {
        name: "n\xFAmero1",
        detail: "El primer n\xFAmero, referencia de celda o rango del que calcular el valor m\xE1ximo."
      },
      number2: {
        name: "n\xFAmero2",
        detail: "N\xFAmeros adicionales, referencias de celda o rangos de los que calcular el valor m\xE1ximo, hasta un m\xE1ximo de 255."
      }
    }
  },
  MAXA: {
    description: "Devuelve el valor m\xE1ximo de una lista de argumentos, incluyendo n\xFAmeros, texto y valores l\xF3gicos.",
    abstract: "Devuelve el valor m\xE1ximo de una lista de argumentos, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/maxa-function-814bda1e-3840-4bff-9365-2f59ac2ee62d"
      }
    ],
    functionParameter: {
      value1: { name: "valor1", detail: "El primer argumento num\xE9rico para el que desea encontrar el valor m\xE1s grande." },
      value2: { name: "valor2", detail: "Argumentos num\xE9ricos de 2 a 255 para los que desea encontrar el valor m\xE1s grande." }
    }
  },
  MAXIFS: {
    description: "Devuelve el valor m\xE1ximo entre las celdas especificadas por un conjunto dado de condiciones o criterios.",
    abstract: "Devuelve el valor m\xE1ximo entre las celdas especificadas por un conjunto dado de condiciones o criterios",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/maxifs-function-dfd611e6-da2c-488a-919b-9b6376b28883"
      }
    ],
    functionParameter: {
      maxRange: { name: "rango_max", detail: "El rango de celdas a maximizar." },
      criteriaRange1: { name: "rango_criterios1", detail: "Es el conjunto de celdas a evaluar con el criterio." },
      criteria1: { name: "criterio1", detail: "Es el criterio en forma de n\xFAmero, expresi\xF3n o texto que define qu\xE9 celdas se evaluar\xE1n como m\xE1ximo." },
      criteriaRange2: { name: "rango_criterios2", detail: "Rangos adicionales. Puede introducir hasta 127 rangos." },
      criteria2: { name: "criterio2", detail: "Criterios adicionales asociados. Puede introducir hasta 127 criterios." }
    }
  },
  MEDIAN: {
    description: "Devuelve la mediana de los n\xFAmeros dados",
    abstract: "Devuelve la mediana de los n\xFAmeros dados",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/median-function-d0916313-4753-414c-8537-ce85bdd967d2"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea los n\xFAmeros dados." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea los n\xFAmeros dados, hasta un m\xE1ximo de 255." }
    }
  },
  MIN: {
    description: "Devuelve el n\xFAmero m\xE1s peque\xF1o de un conjunto de valores.",
    abstract: "Devuelve el valor m\xEDnimo en una lista de argumentos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/min-function-61635d12-920f-4ce2-a70f-96f202dcc152"
      }
    ],
    functionParameter: {
      number1: {
        name: "n\xFAmero1",
        detail: "El primer n\xFAmero, referencia de celda o rango del que calcular el valor m\xEDnimo."
      },
      number2: {
        name: "n\xFAmero2",
        detail: "N\xFAmeros adicionales, referencias de celda o rangos de los que calcular el valor m\xEDnimo, hasta un m\xE1ximo de 255."
      }
    }
  },
  MINA: {
    description: "Devuelve el valor m\xE1s peque\xF1o en una lista de argumentos, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    abstract: "Devuelve el valor m\xE1s peque\xF1o en una lista de argumentos, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/mina-function-245a6f46-7ca5-4dc7-ab49-805341bc31d3"
      }
    ],
    functionParameter: {
      value1: { name: "valor1", detail: "El primer n\xFAmero, referencia de celda o rango del que calcular el valor m\xEDnimo." },
      value2: { name: "valor2", detail: "N\xFAmeros adicionales, referencias de celda o rangos de los que calcular el valor m\xEDnimo, hasta un m\xE1ximo de 255." }
    }
  },
  MINIFS: {
    description: "Devuelve el valor m\xEDnimo entre las celdas especificadas por un conjunto dado de condiciones o criterios.",
    abstract: "Devuelve el valor m\xEDnimo entre las celdas especificadas por un conjunto dado de condiciones o criterios",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/minifs-function-6ca1ddaa-079b-4e74-80cc-72eef32e6599"
      }
    ],
    functionParameter: {
      minRange: { name: "rango_min", detail: "El rango real de celdas en el que se determinar\xE1 el valor m\xEDnimo." },
      criteriaRange1: { name: "rango_criterios1", detail: "Es el conjunto de celdas a evaluar con el criterio." },
      criteria1: { name: "criterio1", detail: "Es el criterio en forma de n\xFAmero, expresi\xF3n o texto que define qu\xE9 celdas se evaluar\xE1n como m\xEDnimo. El mismo conjunto de criterios funciona para las funciones MAXIFS, SUMIFS y AVERAGEIFS." },
      criteriaRange2: { name: "rango_criterios2", detail: "Rangos adicionales. Puede introducir hasta 127 rangos." },
      criteria2: { name: "criterio2", detail: "Criterios adicionales asociados. Puede introducir hasta 127 criterios." }
    }
  },
  MODE_MULT: {
    description: "Devuelve una matriz vertical de los valores m\xE1s frecuentes o repetitivos en una matriz o rango de datos",
    abstract: "Devuelve una matriz vertical de los valores m\xE1s frecuentes o repetitivos en una matriz o rango de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/mode-mult-function-50fd9464-b2ba-4191-b57a-39446689ae8c"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea calcular la moda." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea calcular la moda, hasta un m\xE1ximo de 255." }
    }
  },
  MODE_SNGL: {
    description: "Devuelve el valor m\xE1s com\xFAn en un conjunto de datos",
    abstract: "Devuelve el valor m\xE1s com\xFAn en un conjunto de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/mode-sngl-function-f1267c16-66c6-4386-959f-8fba5f8bb7f8"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea calcular la moda." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea calcular la moda, hasta un m\xE1ximo de 255." }
    }
  },
  NEGBINOM_DIST: {
    description: "Devuelve la distribuci\xF3n binomial negativa",
    abstract: "Devuelve la distribuci\xF3n binomial negativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/negbinom-dist-function-c8239f89-c2d0-45bd-b6af-172e570f8599"
      }
    ],
    functionParameter: {
      numberF: { name: "n\xFAm_fracasos", detail: "El n\xFAmero de fracasos." },
      numberS: { name: "n\xFAm_\xE9xitos", detail: "El n\xFAmero umbral de \xE9xitos." },
      probabilityS: { name: "prob_\xE9xito", detail: "La probabilidad de un \xE9xito." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.NEGBINOM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  NORM_DIST: {
    description: "Devuelve la distribuci\xF3n normal acumulativa",
    abstract: "Devuelve la distribuci\xF3n normal acumulativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/norm-dist-function-edb1cc14-a21c-4e53-839d-8082074c9f8d"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.NORM devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  NORM_INV: {
    description: "Devuelve la inversa de la distribuci\xF3n normal acumulativa",
    abstract: "Devuelve la inversa de la distribuci\xF3n normal acumulativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/norm-inv-function-54b30935-fee7-493c-bedb-2278a9db7e13"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad correspondiente a la distribuci\xF3n normal." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." }
    }
  },
  NORM_S_DIST: {
    description: "Devuelve la distribuci\xF3n normal est\xE1ndar acumulativa",
    abstract: "Devuelve la distribuci\xF3n normal est\xE1ndar acumulativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/norm-s-dist-function-1e787282-3832-4520-a9ae-bd2a8d99ba88"
      }
    ],
    functionParameter: {
      z: { name: "z", detail: "El valor para el que desea la distribuci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DISTR.NORM.S devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  NORM_S_INV: {
    description: "Devuelve la inversa de la distribuci\xF3n normal est\xE1ndar acumulativa",
    abstract: "Devuelve la inversa de la distribuci\xF3n normal est\xE1ndar acumulativa",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/norm-s-inv-function-d6d556b4-ab7f-49cd-b526-5a20918452b1"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "Una probabilidad correspondiente a la distribuci\xF3n normal." }
    }
  },
  PEARSON: {
    description: "Devuelve el coeficiente de correlaci\xF3n del producto momento de Pearson",
    abstract: "Devuelve el coeficiente de correlaci\xF3n del producto momento de Pearson",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/pearson-function-0c3e30fc-e5af-49c4-808a-3ef66e034c18"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "La matriz o rango de datos dependiente." },
      array2: { name: "matriz2", detail: "La matriz o rango de datos independiente." }
    }
  },
  PERCENTILE_EXC: {
    description: "Devuelve el k-\xE9simo percentil de los valores de un conjunto de datos (excluye 0 y 1).",
    abstract: "Devuelve el k-\xE9simo percentil de los valores de un conjunto de datos (excluye 0 y 1).",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos que define la posici\xF3n relativa." },
      k: { name: "k", detail: "El valor del percentil en el rango 0 y 1 (excluye 0 y 1)." }
    }
  },
  PERCENTILE_INC: {
    description: "Devuelve el k-\xE9simo percentil de los valores de un conjunto de datos (incluye 0 y 1)",
    abstract: "Devuelve el k-\xE9simo percentil de los valores de un conjunto de datos (incluye 0 y 1)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos que define la posici\xF3n relativa." },
      k: { name: "k", detail: "El valor del percentil en el rango 0 y 1 (incluye 0 y 1)." }
    }
  },
  PERCENTRANK_EXC: {
    description: "Devuelve el rango porcentual de un valor en un conjunto de datos (excluye 0 y 1)",
    abstract: "Devuelve el rango porcentual de un valor en un conjunto de datos (excluye 0 y 1)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/percentrank-exc-function-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos que define la posici\xF3n relativa." },
      x: { name: "x", detail: "El valor cuyo rango desea conocer." },
      significance: { name: "cifras_significativas", detail: "Un valor que identifica el n\xFAmero de d\xEDgitos significativos para el valor de porcentaje devuelto. Si se omite, RANGO.PERCENTIL.EXC usa tres d\xEDgitos (0,xxx)." }
    }
  },
  PERCENTRANK_INC: {
    description: "Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1)",
    abstract: "Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/percentrank-inc-function-149592c9-00c0-49ba-86c1-c1f45b80463a"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos que define la posici\xF3n relativa." },
      x: { name: "x", detail: "El valor cuyo rango desea conocer." },
      significance: { name: "cifras_significativas", detail: "Un valor que identifica el n\xFAmero de d\xEDgitos significativos para el valor de porcentaje devuelto. Si se omite, RANGO.PERCENTIL.INC usa tres d\xEDgitos (0,xxx)." }
    }
  },
  PERMUT: {
    description: "Devuelve el n\xFAmero de permutaciones para un n\xFAmero dado de objetos",
    abstract: "Devuelve el n\xFAmero de permutaciones para un n\xFAmero dado de objetos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/permut-function-3bd1cb9a-2880-41ab-a197-f246a7a602d3"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero de elementos." },
      numberChosen: { name: "n\xFAmero_elegido", detail: "El n\xFAmero de elementos en cada permutaci\xF3n." }
    }
  },
  PERMUTATIONA: {
    description: "Devuelve el n\xFAmero de permutaciones para un n\xFAmero dado de objetos (con repeticiones) que pueden ser seleccionados del total de objetos",
    abstract: "Devuelve el n\xFAmero de permutaciones para un n\xFAmero dado de objetos (con repeticiones) que pueden ser seleccionados del total de objetos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/permutationa-function-6c7d7fdc-d657-44e6-aa19-2857b25cae4e"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero de elementos." },
      numberChosen: { name: "n\xFAmero_elegido", detail: "El n\xFAmero de elementos en cada permutaci\xF3n." }
    }
  },
  PHI: {
    description: "Devuelve el valor de la funci\xF3n de densidad para una distribuci\xF3n normal est\xE1ndar",
    abstract: "Devuelve el valor de la funci\xF3n de densidad para una distribuci\xF3n normal est\xE1ndar",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/phi-function-23e49bc6-a8e8-402d-98d3-9ded87f6295c"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "X es el n\xFAmero para el que desea la densidad de la distribuci\xF3n normal est\xE1ndar." }
    }
  },
  POISSON_DIST: {
    description: "Devuelve la distribuci\xF3n de Poisson",
    abstract: "Devuelve la distribuci\xF3n de Poisson",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/poisson-dist-function-8fe148ff-39a2-46cb-abf3-7772695d9636"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, POISSON.DIST devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  PROB: {
    description: "Devuelve la probabilidad de que los valores en un rango est\xE9n entre dos l\xEDmites",
    abstract: "Devuelve la probabilidad de que los valores en un rango est\xE9n entre dos l\xEDmites",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/prob-function-9ac30561-c81c-4259-8253-34f0a238fc49"
      }
    ],
    functionParameter: {
      xRange: { name: "rango_x", detail: "El rango de valores num\xE9ricos de x con los que hay probabilidades asociadas." },
      probRange: { name: "rango_prob", detail: "Un conjunto de probabilidades asociadas con los valores en rango_x." },
      lowerLimit: { name: "l\xEDmite_inferior", detail: "El l\xEDmite inferior del valor para el que desea una probabilidad." },
      upperLimit: { name: "l\xEDmite_superior", detail: "El l\xEDmite superior del valor para el que desea una probabilidad." }
    }
  },
  QUARTILE_EXC: {
    description: "Devuelve el cuartil de un conjunto de datos (excluye 0 y 1)",
    abstract: "Devuelve el cuartil de un conjunto de datos (excluye 0 y 1)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/quartile-exc-function-5a355b7a-840b-4a01-b0f1-f538c2864cad"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos para el que desea los valores de cuartil." },
      quart: { name: "cuartil", detail: "El valor de cuartil a devolver." }
    }
  },
  QUARTILE_INC: {
    description: "Devuelve el cuartil de un conjunto de datos (incluye 0 y 1)",
    abstract: "Devuelve el cuartil de un conjunto de datos (incluye 0 y 1)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/quartile-inc-function-1bbacc80-5075-42f1-aed6-47d735c4819d"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos para el que desea los valores de cuartil." },
      quart: { name: "cuartil", detail: "El valor de cuartil a devolver." }
    }
  },
  RANK_AVG: {
    description: "Devuelve el rango de un n\xFAmero en una lista de n\xFAmeros",
    abstract: "Devuelve el rango de un n\xFAmero en una lista de n\xFAmeros",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/rank-avg-function-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero cuyo rango desea encontrar." },
      ref: { name: "ref", detail: "Una referencia a una lista de n\xFAmeros. Los valores no num\xE9ricos en ref se ignoran." },
      order: { name: "orden", detail: "Un n\xFAmero que especifica c\xF3mo clasificar el n\xFAmero. Si el orden es 0 (cero) u se omite, Microsoft Excel clasifica el n\xFAmero como si ref fuera una lista ordenada en orden descendente. Si el orden es cualquier valor distinto de cero, Microsoft Excel clasifica el n\xFAmero como si ref fuera una lista ordenada en orden ascendente." }
    }
  },
  RANK_EQ: {
    description: "Devuelve el rango de un n\xFAmero en una lista de n\xFAmeros",
    abstract: "Devuelve el rango de un n\xFAmero en una lista de n\xFAmeros",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/rank-eq-function-284858ce-8ef6-450e-b662-26245be04a40"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero cuyo rango desea encontrar." },
      ref: { name: "ref", detail: "Una referencia a una lista de n\xFAmeros. Los valores no num\xE9ricos en ref se ignoran." },
      order: { name: "orden", detail: "Un n\xFAmero que especifica c\xF3mo clasificar el n\xFAmero. Si el orden es 0 (cero) u se omite, Microsoft Excel clasifica el n\xFAmero como si ref fuera una lista ordenada en orden descendente. Si el orden es cualquier valor distinto de cero, Microsoft Excel clasifica el n\xFAmero como si ref fuera una lista ordenada en orden ascendente." }
    }
  },
  RSQ: {
    description: "Devuelve el cuadrado del coeficiente de correlaci\xF3n del producto momento de Pearson",
    abstract: "Devuelve el cuadrado del coeficiente de correlaci\xF3n del producto momento de Pearson",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/rsq-function-d7161715-250d-4a01-b80d-a8364f2be08f"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "La matriz o rango de datos dependiente." },
      array2: { name: "matriz2", detail: "La matriz o rango de datos independiente." }
    }
  },
  SKEW: {
    description: "Devuelve la asimetr\xEDa de una distribuci\xF3n",
    abstract: "Devuelve la asimetr\xEDa de una distribuci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/skew-function-bdf49d86-b1ef-4804-a046-28eaea69c9fa"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea la asimetr\xEDa." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea la asimetr\xEDa, hasta un m\xE1ximo de 255." }
    }
  },
  SKEW_P: {
    description: "Devuelve la asimetr\xEDa de una distribuci\xF3n basada en una poblaci\xF3n",
    abstract: "Devuelve la asimetr\xEDa de una distribuci\xF3n basada en una poblaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/skew-p-function-76530a5c-99b9-48a1-8392-26632d542fcb"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer n\xFAmero, referencia de celda o rango para el que desea la asimetr\xEDa." },
      number2: { name: "n\xFAmero2", detail: "N\xFAmeros adicionales, referencias de celda o rangos para los que desea la asimetr\xEDa, hasta un m\xE1ximo de 255." }
    }
  },
  SLOPE: {
    description: "Devuelve la pendiente de la l\xEDnea de regresi\xF3n lineal",
    abstract: "Devuelve la pendiente de la l\xEDnea de regresi\xF3n lineal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/slope-function-11fb8f97-3117-4813-98aa-61d7e01276b9"
      }
    ],
    functionParameter: {
      knownYs: { name: "conocido_y", detail: "La matriz o rango de datos dependiente." },
      knownXs: { name: "conocido_x", detail: "La matriz o rango de datos independiente." }
    }
  },
  SMALL: {
    description: "Devuelve el k-\xE9simo valor m\xE1s peque\xF1o de un conjunto de datos",
    abstract: "Devuelve el k-\xE9simo valor m\xE1s peque\xF1o de un conjunto de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/small-function-17da8222-7c82-42b2-961b-14c45384df07"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos para el que desea determinar el k-\xE9simo valor m\xE1s peque\xF1o." },
      k: { name: "k", detail: "La posici\xF3n (desde el m\xE1s peque\xF1o) en la matriz o rango de celdas de datos a devolver." }
    }
  },
  STANDARDIZE: {
    description: "Devuelve un valor normalizado",
    abstract: "Devuelve un valor normalizado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/standardize-function-81d66554-2d54-40ec-ba83-6437108ee775"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor que desea normalizar." },
      mean: { name: "media", detail: "La media aritm\xE9tica de la distribuci\xF3n." },
      standardDev: { name: "desv_est\xE1ndar", detail: "La desviaci\xF3n est\xE1ndar de la distribuci\xF3n." }
    }
  },
  STDEV_P: {
    description: "Calcula la desviaci\xF3n est\xE1ndar basada en toda la poblaci\xF3n dada como argumentos (ignora valores l\xF3gicos y texto).",
    abstract: "Calcula la desviaci\xF3n est\xE1ndar basada en toda la poblaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/stdev-p-function-6e917c05-31a0-496f-ade7-4f4e7462f285"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una poblaci\xF3n." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 254 correspondientes a una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." }
    }
  },
  STDEV_S: {
    description: "Estima la desviaci\xF3n est\xE1ndar basada en una muestra (ignora valores l\xF3gicos y texto en la muestra).",
    abstract: "Estima la desviaci\xF3n est\xE1ndar basada en una muestra",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/stdev-s-function-7d69cf97-0c1f-4acf-be27-f3e83904cc23"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una muestra de una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 254 correspondientes a una muestra de una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." }
    }
  },
  STDEVA: {
    description: "Estima la desviaci\xF3n est\xE1ndar basada en una muestra, incluyendo n\xFAmeros, texto y valores l\xF3gicos.",
    abstract: "Estima la desviaci\xF3n est\xE1ndar basada en una muestra, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/stdeva-function-5ff38888-7ea5-48de-9a6d-11ed73b29e9d"
      }
    ],
    functionParameter: {
      value1: { name: "valor1", detail: "El primer argumento de valor correspondiente a una muestra de una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." },
      value2: { name: "valor2", detail: "Argumentos de valor de 2 a 254 correspondientes a una muestra de una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." }
    }
  },
  STDEVPA: {
    description: "Calcula la desviaci\xF3n est\xE1ndar basada en toda la poblaci\xF3n dada como argumentos, incluyendo texto y valores l\xF3gicos.",
    abstract: "Calcula la desviaci\xF3n est\xE1ndar basada en toda la poblaci\xF3n, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/stdevpa-function-5578d4d6-455a-4308-9991-d405afe2c28c"
      }
    ],
    functionParameter: {
      value1: { name: "valor1", detail: "El primer argumento de valor correspondiente a una poblaci\xF3n." },
      value2: { name: "valor2", detail: "Argumentos de valor de 2 a 254 correspondientes a una poblaci\xF3n. Tambi\xE9n puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas." }
    }
  },
  STEYX: {
    description: "Devuelve el error est\xE1ndar del valor y predicho para cada x en la regresi\xF3n",
    abstract: "Devuelve el error est\xE1ndar del valor y predicho para cada x en la regresi\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/steyx-function-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab"
      }
    ],
    functionParameter: {
      knownYs: { name: "conocido_y", detail: "La matriz o rango de datos dependiente." },
      knownXs: { name: "conocido_x", detail: "La matriz o rango de datos independiente." }
    }
  },
  T_DIST: {
    description: "Devuelve la probabilidad para la distribuci\xF3n t de Student",
    abstract: "Devuelve la probabilidad para la distribuci\xF3n t de Student",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/t-dist-function-4329459f-ae91-48c2-bba8-1ead1c6c21b2"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor num\xE9rico en el que evaluar la distribuci\xF3n" },
      degFreedom: { name: "grados_libertad", detail: "Un entero que indica el n\xFAmero de grados de libertad." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, DIST.T devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  T_DIST_2T: {
    description: "Devuelve la probabilidad para la distribuci\xF3n t de Student (dos colas)",
    abstract: "Devuelve la probabilidad para la distribuci\xF3n t de Student (dos colas)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/t-dist-2t-function-198e9340-e360-4230-bd21-f52f22ff5c28"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor num\xE9rico en el que evaluar la distribuci\xF3n" },
      degFreedom: { name: "grados_libertad", detail: "Un entero que indica el n\xFAmero de grados de libertad." }
    }
  },
  T_DIST_RT: {
    description: "Devuelve la probabilidad para la distribuci\xF3n t de Student (cola derecha)",
    abstract: "Devuelve la probabilidad para la distribuci\xF3n t de Student (cola derecha)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/t-dist-rt-function-20a30020-86f9-4b35-af1f-7ef6ae683eda"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor num\xE9rico en el que evaluar la distribuci\xF3n" },
      degFreedom: { name: "grados_libertad", detail: "Un entero que indica el n\xFAmero de grados de libertad." }
    }
  },
  T_INV: {
    description: "Devuelve la inversa de la probabilidad para la distribuci\xF3n t de Student",
    abstract: "Devuelve la inversa de la probabilidad para la distribuci\xF3n t de Student",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/t-inv-function-2908272b-4e61-4942-9df9-a25fec9b0e2e"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "La probabilidad asociada con la distribuci\xF3n t de Student." },
      degFreedom: { name: "grados_libertad", detail: "Un entero que indica el n\xFAmero de grados de libertad." }
    }
  },
  T_INV_2T: {
    description: "Devuelve la inversa de la probabilidad para la distribuci\xF3n t de Student (dos colas)",
    abstract: "Devuelve la inversa de la probabilidad para la distribuci\xF3n t de Student (dos colas)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/t-inv-2t-function-ce72ea19-ec6c-4be7-bed2-b9baf2264f17"
      }
    ],
    functionParameter: {
      probability: { name: "probabilidad", detail: "La probabilidad asociada con la distribuci\xF3n t de Student." },
      degFreedom: { name: "grados_libertad", detail: "Un entero que indica el n\xFAmero de grados de libertad." }
    }
  },
  T_TEST: {
    description: "Devuelve la probabilidad asociada con una prueba t de Student",
    abstract: "Devuelve la probabilidad asociada con una prueba t de Student",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/t-test-function-d4e08ec3-c545-485f-962e-276f7cbed055"
      }
    ],
    functionParameter: {
      array1: { name: "matriz1", detail: "La primera matriz o rango de datos." },
      array2: { name: "matriz2", detail: "La segunda matriz o rango de datos." },
      tails: { name: "colas", detail: "Especifica el n\xFAmero de colas de distribuci\xF3n. Si colas = 1, PRUEBA.T usa la distribuci\xF3n de una cola. Si colas = 2, PRUEBA.T usa la distribuci\xF3n de dos colas." },
      type: { name: "tipo", detail: "El tipo de prueba t a realizar." }
    }
  },
  TREND: {
    description: "Devuelve valores a lo largo de una tendencia lineal",
    abstract: "Devuelve valores a lo largo de una tendencia lineal",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/trend-function-e2f135f0-8827-4096-9873-9a7cf7b51ef1"
      }
    ],
    functionParameter: {
      knownYs: { name: "conocido_y", detail: "El conjunto de valores y que ya conoce en la relaci\xF3n y = m*x+b." },
      knownXs: { name: "conocido_x", detail: "El conjunto de valores x que ya conoce en la relaci\xF3n y = m*x+b." },
      newXs: { name: "nuevo_x", detail: "Son nuevos valores x para los que desea que TENDENCIA devuelva los valores y correspondientes." },
      constb: { name: "constante", detail: "Un valor l\xF3gico que especifica si se debe forzar que la constante b sea igual a 0." }
    }
  },
  TRIMMEAN: {
    description: "Devuelve la media del interior de un conjunto de datos",
    abstract: "Devuelve la media del interior de un conjunto de datos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/trimmean-function-d90c9878-a119-4746-88fa-63d988f511d3"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de valores a recortar y promediar." },
      percent: { name: "porcentaje", detail: "El n\xFAmero fraccional de puntos de datos a excluir del c\xE1lculo." }
    }
  },
  VAR_P: {
    description: "Calcula la varianza basada en toda la poblaci\xF3n (ignora valores l\xF3gicos y texto en la poblaci\xF3n).",
    abstract: "Calcula la varianza basada en toda la poblaci\xF3n",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/var-p-function-73d1285c-108c-4843-ba5d-a51f90656f3a"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una poblaci\xF3n." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 254 correspondientes a una poblaci\xF3n." }
    }
  },
  VAR_S: {
    description: "Estima la varianza basada en una muestra (ignora valores l\xF3gicos y texto en la muestra).",
    abstract: "Estima la varianza basada en una muestra",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/var-s-function-913633de-136b-449d-813e-65a00b2b990b"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "El primer argumento num\xE9rico correspondiente a una muestra de una poblaci\xF3n." },
      number2: { name: "n\xFAmero2", detail: "Argumentos num\xE9ricos de 2 a 254 correspondientes a una muestra de una poblaci\xF3n." }
    }
  },
  VARA: {
    description: "Estima la varianza basada en una muestra, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    abstract: "Estima la varianza basada en una muestra, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/vara-function-3de77469-fa3a-47b4-85fd-81758a1e1d07"
      }
    ],
    functionParameter: {
      value1: { name: "valor1", detail: "El primer argumento de valor correspondiente a una muestra de una poblaci\xF3n." },
      value2: { name: "valor2", detail: "Argumentos de valor de 2 a 254 correspondientes a una muestra de una poblaci\xF3n." }
    }
  },
  VARPA: {
    description: "Calcula la varianza basada en toda la poblaci\xF3n, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    abstract: "Calcula la varianza basada en toda la poblaci\xF3n, incluyendo n\xFAmeros, texto y valores l\xF3gicos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/varpa-function-59a62635-4e89-4fad-88ac-ce4dc0513b96"
      }
    ],
    functionParameter: {
      value1: { name: "valor1", detail: "El primer argumento de valor correspondiente a una poblaci\xF3n." },
      value2: { name: "valor2", detail: "Argumentos de valor de 2 a 254 correspondientes a una poblaci\xF3n." }
    }
  },
  WEIBULL_DIST: {
    description: "Devuelve la distribuci\xF3n de Weibull",
    abstract: "Devuelve la distribuci\xF3n de Weibull",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/weibull-dist-function-4e783c39-9325-49be-bbc9-a83ef82b45db"
      }
    ],
    functionParameter: {
      x: { name: "x", detail: "El valor para el que desea la distribuci\xF3n." },
      alpha: { name: "alfa", detail: "Un par\xE1metro de la distribuci\xF3n." },
      beta: { name: "beta", detail: "Un par\xE1metro de la distribuci\xF3n." },
      cumulative: { name: "acumulativo", detail: "Un valor l\xF3gico que determina la forma de la funci\xF3n. Si es VERDADERO, WEIBULL.DIST devuelve la funci\xF3n de distribuci\xF3n acumulativa; si es FALSO, devuelve la funci\xF3n de densidad de probabilidad." }
    }
  },
  Z_TEST: {
    description: "Devuelve el valor de probabilidad de una cola de una prueba z",
    abstract: "Devuelve el valor de probabilidad de una cola de una prueba z",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/z-test-function-d633d5a3-2031-4614-a016-92180ad82bee"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz o rango de datos contra el que probar x." },
      x: { name: "x", detail: "El valor a probar." },
      sigma: { name: "sigma", detail: "La desviaci\xF3n est\xE1ndar de la poblaci\xF3n (conocida). Si se omite, se usa la desviaci\xF3n est\xE1ndar de la muestra." }
    }
  }
};
var es_ES_default30 = locale30;

// ../packages/sheets-formula/src/locale/function-list/text/es-ES.ts
var locale31 = {
  ASC: {
    description: "Cambia las letras inglesas o katakana de ancho completo (doble byte) dentro de una cadena de caracteres a caracteres de ancho medio (un solo byte)",
    abstract: "Cambia las letras inglesas o katakana de ancho completo (doble byte) dentro de una cadena de caracteres a caracteres de ancho medio (un solo byte)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/asc-function-0b6abf1c-c663-4004-a964-ebc00b723266"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto o una referencia a una celda que contiene el texto que desea cambiar. Si el texto no contiene ninguna letra de ancho completo, el texto no se cambia." }
    }
  },
  ARRAYTOTEXT: {
    description: "Devuelve una matriz de valores de texto desde cualquier rango especificado",
    abstract: "Devuelve una matriz de valores de texto desde cualquier rango especificado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/arraytotext-function-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b"
      }
    ],
    functionParameter: {
      array: { name: "matriz", detail: "La matriz a devolver como texto." },
      format: { name: "formato", detail: "El formato de los datos devueltos. Puede ser uno de dos valores: \n0 Predeterminado. Formato conciso y f\xE1cil de leer. \n1 Formato estricto que incluye caracteres de escape y delimitadores de fila. Genera una cadena que se puede analizar al introducirla en la barra de f\xF3rmulas. Encapsula las cadenas devueltas entre comillas, excepto para valores booleanos, n\xFAmeros y errores." }
    }
  },
  BAHTTEXT: {
    description: "Convierte un n\xFAmero a texto, usando el formato de moneda \xDF (baht)",
    abstract: "Convierte un n\xFAmero a texto, usando el formato de moneda \xDF (baht)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/bahttext-function-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Un n\xFAmero que desea convertir a texto, o una referencia a una celda que contiene un n\xFAmero, o una f\xF3rmula que se eval\xFAa como un n\xFAmero." }
    }
  },
  CHAR: {
    description: "Devuelve el car\xE1cter especificado por el n\xFAmero de c\xF3digo",
    abstract: "Devuelve el car\xE1cter especificado por el n\xFAmero de c\xF3digo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/char-function-bbd249c8-b36e-4a91-8017-1c133f9b837a"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Un n\xFAmero entre 1 y 255 que especifica qu\xE9 car\xE1cter desea. El car\xE1cter es del juego de caracteres utilizado por su ordenador." }
    }
  },
  CLEAN: {
    description: "Elimina todos los caracteres no imprimibles del texto",
    abstract: "Elimina todos los caracteres no imprimibles del texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/clean-function-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "Cualquier informaci\xF3n de la hoja de c\xE1lculo de la que desee eliminar caracteres no imprimibles." }
    }
  },
  CODE: {
    description: "Devuelve un c\xF3digo num\xE9rico para el primer car\xE1cter de una cadena de texto",
    abstract: "Devuelve un c\xF3digo num\xE9rico para el primer car\xE1cter de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/code-function-c32b692b-2ed0-4a04-bdd9-75640144b928"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto del que desea el c\xF3digo del primer car\xE1cter." }
    }
  },
  CONCAT: {
    description: "Combina el texto de m\xFAltiples rangos y/o cadenas, pero no proporciona los argumentos de delimitador o IgnoreEmpty.",
    abstract: "Combina el texto de m\xFAltiples rangos y/o cadenas, pero no proporciona los argumentos de delimitador o IgnoreEmpty",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/concat-function-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2"
      }
    ],
    functionParameter: {
      text1: { name: "texto1", detail: "Elemento de texto a unir. Una cadena, o una matriz de cadenas, como un rango de celdas." },
      text2: { name: "texto2", detail: "Elementos de texto adicionales a unir. Puede haber un m\xE1ximo de 253 argumentos de texto para los elementos de texto. Cada uno puede ser una cadena, o una matriz de cadenas, como un rango de celdas." }
    }
  },
  CONCATENATE: {
    description: "Une varios elementos de texto en uno solo",
    abstract: "Une varios elementos de texto en uno solo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/concatenate-function-8f8ae884-2ca8-4f7a-b093-75d702bea31d"
      }
    ],
    functionParameter: {
      text1: { name: "texto1", detail: "El primer elemento a unir. El elemento puede ser un valor de texto, un n\xFAmero o una referencia de celda." },
      text2: { name: "texto2", detail: "Elementos de texto adicionales a unir. Puede tener hasta 255 elementos, hasta un total de 8,192 caracteres." }
    }
  },
  DBCS: {
    description: "Cambia las letras inglesas o katakana de ancho medio (un solo byte) dentro de una cadena de caracteres a caracteres de ancho completo (doble byte)",
    abstract: "Cambia las letras inglesas o katakana de ancho medio (un solo byte) dentro de una cadena de caracteres a caracteres de ancho completo (doble byte)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/dbcs-function-a4025e73-63d2-4958-9423-21a24794c9e5"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto o una referencia a una celda que contiene el texto que desea cambiar. Si el texto no contiene ninguna letra inglesa de ancho medio o katakana, el texto \u043D\u0435 se cambia." }
    }
  },
  DOLLAR: {
    description: "Convierte un n\xFAmero a texto usando el formato de moneda",
    abstract: "Convierte un n\xFAmero a texto usando el formato de moneda",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/dollar-function-a6cd05d9-9740-4ad3-a469-8109d18ff611"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "Un n\xFAmero, una referencia a una celda que contiene un n\xFAmero, o una f\xF3rmula que se eval\xFAa como un n\xFAmero." },
      decimals: { name: "decimales", detail: "El n\xFAmero de d\xEDgitos a la derecha del punto decimal. Si es negativo, el n\xFAmero se redondea a la izquierda del punto decimal. Si omite los decimales, se asume que son 2." }
    }
  },
  EXACT: {
    description: "Comprueba si dos valores de texto son id\xE9nticos",
    abstract: "Comprueba si dos valores de texto son id\xE9nticos",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/exact-function-d3087698-fc15-4a15-9631-12575cf29926"
      }
    ],
    functionParameter: {
      text1: { name: "texto1", detail: "La primera cadena de texto." },
      text2: { name: "texto2", detail: "La segunda cadena de texto." }
    }
  },
  FIND: {
    description: "Busca un valor de texto dentro de otro (distingue may\xFAsculas y min\xFAsculas)",
    abstract: "Busca un valor de texto dentro de otro (distingue may\xFAsculas y min\xFAsculas)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/find-findb-functions-c7912941-af2a-4bdf-a553-d0d89b0a0628"
      }
    ],
    functionParameter: {
      findText: { name: "texto_buscado", detail: "El texto que desea buscar." },
      withinText: { name: "dentro_del_texto", detail: "El texto que contiene el texto que desea buscar." },
      startNum: { name: "n\xFAm_inicial", detail: "Especifica el car\xE1cter en el que iniciar la b\xFAsqueda. Si omite n\xFAm_inicial, se asume que es 1." }
    }
  },
  FINDB: {
    description: "Busca un valor de texto dentro de otro (distingue may\xFAsculas y min\xFAsculas)",
    abstract: "Busca un valor de texto dentro de otro (distingue may\xFAsculas y min\xFAsculas)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/find-findb-functions-c7912941-af2a-4bdf-a553-d0d89b0a0628"
      }
    ],
    functionParameter: {
      findText: { name: "texto_buscado", detail: "El texto que desea buscar." },
      withinText: { name: "dentro_del_texto", detail: "El texto que contiene el texto que desea buscar." },
      startNum: { name: "n\xFAm_inicial", detail: "Especifica el car\xE1cter en el que iniciar la b\xFAsqueda. Si omite n\xFAm_inicial, se asume que es 1." }
    }
  },
  FIXED: {
    description: "Formatea un n\xFAmero como texto con un n\xFAmero fijo de decimales",
    abstract: "Formatea un n\xFAmero como texto con un n\xFAmero fijo de decimales",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/fixed-function-ffd5723c-324c-45e9-8b96-e41be2a8274a"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El n\xFAmero que desea redondear y convertir a texto." },
      decimals: { name: "decimales", detail: "El n\xFAmero de d\xEDgitos a la derecha del punto decimal. Si es negativo, el n\xFAmero se redondea a la izquierda del punto decimal. Si omite los decimales, se asume que son 2." },
      noCommas: { name: "sin_comas", detail: "Un valor l\xF3gico que, si es VERDADERO, evita que DECIMAL incluya comas en el texto devuelto." }
    }
  },
  LEFT: {
    description: "Devuelve los caracteres del principio de una cadena de texto",
    abstract: "Devuelve los caracteres del principio de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/left-leftb-functions-9203d2d2-7960-479b-84c6-1ea52b99640c"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "La cadena de texto que contiene los caracteres que desea extraer." },
      numChars: { name: "n\xFAm_de_caracteres", detail: "Especifica el n\xFAmero de caracteres que desea que IZQUIERDA extraiga." }
    }
  },
  LEFTB: {
    description: "Devuelve los caracteres del principio de una cadena de texto",
    abstract: "Devuelve los caracteres del principio de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/left-leftb-functions-9203d2d2-7960-479b-84c6-1ea52b99640c"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "La cadena de texto que contiene los caracteres que desea extraer." },
      numBytes: { name: "n\xFAm_de_bytes", detail: "Especifica el n\xFAmero de caracteres que desea que IZQUIERDAB extraiga, basado en bytes." }
    }
  },
  LEN: {
    description: "Devuelve el n\xFAmero de caracteres de una cadena de texto",
    abstract: "Devuelve el n\xFAmero de caracteres de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/len-lenb-functions-29236f94-cedc-429d-affd-b5e33d2c67cb"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto cuya longitud desea encontrar. Los espacios cuentan como caracteres." }
    }
  },
  LENB: {
    description: "Devuelve el n\xFAmero de bytes utilizados para representar los caracteres de una cadena de texto.",
    abstract: "Devuelve el n\xFAmero de bytes utilizados para representar los caracteres de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/len-lenb-functions-29236f94-cedc-429d-affd-b5e33d2c67cb"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto cuya longitud desea encontrar. Los espacios cuentan como caracteres." }
    }
  },
  LOWER: {
    description: "Convierte el texto a min\xFAsculas.",
    abstract: "Convierte el texto a min\xFAsculas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/lower-function-3f21df02-a80c-44b2-afaf-81358f9fdeb4"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto que desea convertir a min\xFAsculas." }
    }
  },
  MID: {
    description: "Devuelve un n\xFAmero espec\xEDfico de caracteres de una cadena de texto, comenzando en la posici\xF3n que especifique.",
    abstract: "Devuelve un n\xFAmero espec\xEDfico de caracteres de una cadena de texto, comenzando en la posici\xF3n que especifique",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/mid-midb-functions-d5f9e25c-d7d6-472e-b568-4ecb12433028"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "La cadena de texto que contiene los caracteres que desea extraer." },
      startNum: { name: "n\xFAm_inicial", detail: "La posici\xF3n del primer car\xE1cter que desea extraer en el texto." },
      numChars: { name: "n\xFAm_de_caracteres", detail: "Especifica el n\xFAmero de caracteres que desea que EXTRAE extraiga." }
    }
  },
  MIDB: {
    description: "Devuelve un n\xFAmero espec\xEDfico de caracteres de una cadena de texto, comenzando en la posici\xF3n que especifique",
    abstract: "Devuelve un n\xFAmero espec\xEDfico de caracteres de una cadena de texto, comenzando en la posici\xF3n que especifique",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/mid-midb-functions-d5f9e25c-d7d6-472e-b568-4ecb12433028"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "La cadena de texto que contiene los caracteres que desea extraer." },
      startNum: { name: "n\xFAm_inicial", detail: "La posici\xF3n del primer car\xE1cter que desea extraer en el texto." },
      numBytes: { name: "n\xFAm_de_bytes", detail: "Especifica el n\xFAmero de caracteres que desea que EXTRAEB extraiga, basado en bytes." }
    }
  },
  NUMBERSTRING: {
    description: "Convertir n\xFAmeros a cadenas chinas",
    abstract: "Convertir n\xFAmeros a cadenas chinas",
    links: [
      {
        title: "Instrucciones",
        url: "https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "El valor convertido a una cadena china." },
      type: { name: "tipo", detail: "El tipo del resultado devuelto. \n1. Min\xFAsculas chinas \n2. May\xFAsculas chinas \n3. Caracteres chinos para lectura y escritura" }
    }
  },
  NUMBERVALUE: {
    description: "Convierte texto a n\xFAmero de una manera independiente de la configuraci\xF3n regional",
    abstract: "Convierte texto a n\xFAmero de una manera independiente de la configuraci\xF3n regional",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/numbervalue-function-1b05c8cf-2bfa-4437-af70-596c7ea7d879"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto a convertir en n\xFAmero." },
      decimalSeparator: { name: "separador_decimal", detail: "El car\xE1cter utilizado para separar la parte entera y la fraccionaria del resultado." },
      groupSeparator: { name: "separador_de_grupo", detail: "El car\xE1cter utilizado para separar agrupaciones de n\xFAmeros." }
    }
  },
  PHONETIC: {
    description: "Extrae los caracteres fon\xE9ticos (furigana) de una cadena de texto",
    abstract: "Extrae los caracteres fon\xE9ticos (furigana) de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/phonetic-function-9a329dac-0c0f-42f8-9a55-639086988554"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  PROPER: {
    description: "Pone en may\xFAscula la primera letra de cada palabra de un valor de texto",
    abstract: "Pone en may\xFAscula la primera letra de cada palabra de un valor de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/proper-function-52a5a283-e8b2-49be-8506-b2887b889f94"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "Texto entre comillas, una f\xF3rmula que devuelve texto o una referencia a una celda que contiene el texto que desea capitalizar parcialmente." }
    }
  },
  REGEXEXTRACT: {
    description: "Extrae las primeras subcadenas coincidentes seg\xFAn una expresi\xF3n regular.",
    abstract: "Extrae las primeras subcadenas coincidentes seg\xFAn una expresi\xF3n regular.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/3098244?sjid=5628197291201472796-AP&hl=es"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto de entrada." },
      regularExpression: { name: "expresi\xF3n_regular", detail: "Se devolver\xE1 la primera parte del texto que coincida con esta expresi\xF3n." }
    }
  },
  REGEXMATCH: {
    description: "Si un fragmento de texto coincide con una expresi\xF3n regular.",
    abstract: "Si un fragmento de texto coincide con una expresi\xF3n regular.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/3098292?sjid=5628197291201472796-AP&hl=es"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto que se probar\xE1 con la expresi\xF3n regular." },
      regularExpression: { name: "expresi\xF3n_regular", detail: "La expresi\xF3n regular con la que se probar\xE1 el texto." }
    }
  },
  REGEXREPLACE: {
    description: "Reemplaza parte de una cadena de texto con una cadena de texto diferente usando expresiones regulares.",
    abstract: "Reemplaza parte de una cadena de texto con una cadena de texto diferente usando expresiones regulares.",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.google.com/docs/answer/3098245?sjid=5628197291201472796-AP&hl=es"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto, del cual se reemplazar\xE1 una parte." },
      regularExpression: { name: "expresi\xF3n_regular", detail: "La expresi\xF3n regular. Todas las instancias coincidentes en el texto ser\xE1n reemplazadas." },
      replacement: { name: "reemplazo", detail: "El texto que se insertar\xE1 en el texto original." }
    }
  },
  REPLACE: {
    description: "Reemplaza caracteres dentro del texto",
    abstract: "Reemplaza caracteres dentro del texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/replace-replaceb-functions-8d799074-2425-4a8a-84bc-82472868878a"
      }
    ],
    functionParameter: {
      oldText: { name: "texto_antiguo", detail: "Texto en el que desea reemplazar algunos caracteres." },
      startNum: { name: "n\xFAm_inicial", detail: "La posici\xF3n del car\xE1cter en texto_antiguo que desea reemplazar con texto_nuevo." },
      numChars: { name: "n\xFAm_de_caracteres", detail: "El n\xFAmero de caracteres en texto_antiguo que desea que REEMPLAZAR reemplace con texto_nuevo." },
      newText: { name: "texto_nuevo", detail: "El texto que reemplazar\xE1 los caracteres en texto_antiguo." }
    }
  },
  REPLACEB: {
    description: "Reemplaza caracteres dentro del texto",
    abstract: "Reemplaza caracteres dentro del texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/replace-replaceb-functions-8d799074-2425-4a8a-84bc-82472868878a"
      }
    ],
    functionParameter: {
      oldText: { name: "texto_antiguo", detail: "Texto en el que desea reemplazar algunos caracteres." },
      startNum: { name: "n\xFAm_inicial", detail: "La posici\xF3n del car\xE1cter en texto_antiguo que desea reemplazar con texto_nuevo." },
      numBytes: { name: "n\xFAm_de_bytes", detail: "El n\xFAmero de bytes en texto_antiguo que desea que REEMPLAZARB reemplace con texto_nuevo." },
      newText: { name: "texto_nuevo", detail: "El texto que reemplazar\xE1 los caracteres en texto_antiguo." }
    }
  },
  REPT: {
    description: "Repite el texto un n\xFAmero determinado de veces",
    abstract: "Repite el texto un n\xFAmero determinado de veces",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/rept-function-04c4d778-e712-43b4-9c15-d656582bb061"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto que desea repetir." },
      numberTimes: { name: "n\xFAm_de_veces", detail: "Un n\xFAmero positivo que especifica el n\xFAmero de veces que se debe repetir el texto." }
    }
  },
  RIGHT: {
    description: "Devuelve los caracteres del final de una cadena de texto",
    abstract: "Devuelve los caracteres del final de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/right-rightb-functions-240267ee-9afa-4639-a02b-f19e1786cf2f"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "La cadena de texto que contiene los caracteres que desea extraer." },
      numChars: { name: "n\xFAm_de_caracteres", detail: "Especifica el n\xFAmero de caracteres que desea que DERECHA extraiga." }
    }
  },
  RIGHTB: {
    description: "Devuelve los caracteres del final de una cadena de texto",
    abstract: "Devuelve los caracteres del final de una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/right-rightb-functions-240267ee-9afa-4639-a02b-f19e1786cf2f"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "La cadena de texto que contiene los caracteres que desea extraer." },
      numBytes: { name: "n\xFAm_de_bytes", detail: "Especifica el n\xFAmero de caracteres que desea que DERECHAB extraiga, basado en bytes." }
    }
  },
  SEARCH: {
    description: "Busca un valor de texto dentro de otro (no distingue may\xFAsculas y min\xFAsculas)",
    abstract: "Busca un valor de texto dentro de otro (no distingue may\xFAsculas y min\xFAsculas)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/search-searchb-functions-9ab04538-0e55-4719-a72e-b6f54513b495"
      }
    ],
    functionParameter: {
      findText: { name: "texto_buscado", detail: "El texto que desea buscar." },
      withinText: { name: "dentro_del_texto", detail: "El texto que contiene el texto que desea buscar." },
      startNum: { name: "n\xFAm_inicial", detail: "Especifica el car\xE1cter en el que iniciar la b\xFAsqueda. Si omite n\xFAm_inicial, se asume que es 1." }
    }
  },
  SEARCHB: {
    description: "Busca un valor de texto dentro de otro (no distingue may\xFAsculas y min\xFAsculas)",
    abstract: "Busca un valor de texto dentro de otro (no distingue may\xFAsculas y min\xFAsculas)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/search-searchb-functions-9ab04538-0e55-4719-a72e-b6f54513b495"
      }
    ],
    functionParameter: {
      findText: { name: "texto_buscado", detail: "El texto que desea buscar." },
      withinText: { name: "dentro_del_texto", detail: "El texto que contiene el texto que desea buscar." },
      startNum: { name: "n\xFAm_inicial", detail: "Especifica el car\xE1cter en el que iniciar la b\xFAsqueda. Si omite n\xFAm_inicial, se asume que es 1." }
    }
  },
  SUBSTITUTE: {
    description: "Sustituye el texto antiguo por texto nuevo en una cadena de texto",
    abstract: "Sustituye el texto antiguo por texto nuevo en una cadena de texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/substitute-function-6434944e-a904-4336-a9b0-1e58df3bc332"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto o la referencia a una celda que contiene el texto en el que desea sustituir caracteres." },
      oldText: { name: "texto_antiguo", detail: "El texto que desea reemplazar." },
      newText: { name: "texto_nuevo", detail: "El texto con el que desea reemplazar texto_antiguo." },
      instanceNum: { name: "n\xFAm_de_instancia", detail: "Especifica qu\xE9 ocurrencia de texto_antiguo desea reemplazar con texto_nuevo. Si especifica n\xFAm_de_instancia, solo se reemplaza esa instancia de texto_antiguo. De lo contrario, cada ocurrencia de texto_antiguo en texto se cambia por texto_nuevo." }
    }
  },
  T: {
    description: "Convierte sus argumentos a texto",
    abstract: "Convierte sus argumentos a texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/t-function-fb83aeec-45e7-4924-af95-53e073541228"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor que desea probar." }
    }
  },
  TEXT: {
    description: "Da formato a un n\xFAmero y lo convierte en texto",
    abstract: "Da formato a un n\xFAmero y lo convierte en texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/text-function-20d5ac4d-7b94-49fd-bb38-93d29371225c"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "Un valor num\xE9rico que desea convertir a texto." },
      formatText: { name: "formato_texto", detail: "Una cadena de texto que define el formato que desea aplicar al valor suministrado." }
    }
  },
  TEXTAFTER: {
    description: "Devuelve el texto que aparece despu\xE9s de un car\xE1cter o cadena dados",
    abstract: "Devuelve el texto que aparece despu\xE9s de un car\xE1cter o cadena dados",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/textafter-function-c8db2546-5b51-416a-9690-c7e6722e90b4"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto en el que est\xE1 buscando. No se permiten caracteres comod\xEDn." },
      delimiter: { name: "delimitador", detail: "El texto que marca el punto despu\xE9s del cual desea extraer." },
      instanceNum: { name: "n\xFAm_de_instancia", detail: "La instancia del delimitador despu\xE9s de la cual desea extraer el texto." },
      matchMode: { name: "modo_de_coincidencia", detail: "Determina si la b\xFAsqueda de texto distingue entre may\xFAsculas y min\xFAsculas. El valor predeterminado es sensible a may\xFAsculas y min\xFAsculas." },
      matchEnd: { name: "coincidir_final", detail: "Trata el final del texto como un delimitador. Por defecto, el texto es una coincidencia exacta." },
      ifNotFound: { name: "si_no_se_encuentra", detail: "Valor devuelto si no se encuentra ninguna coincidencia. Por defecto, se devuelve #N/A." }
    }
  },
  TEXTBEFORE: {
    description: "Devuelve el texto que aparece antes de un car\xE1cter o cadena dados",
    abstract: "Devuelve el texto que aparece antes de un car\xE1cter o cadena dados",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/textbefore-function-d099c28a-dba8-448e-ac6c-f086d0fa1b29"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto en el que est\xE1 buscando. No se permiten caracteres comod\xEDn." },
      delimiter: { name: "delimitador", detail: "El texto que marca el punto antes del cual desea extraer." },
      instanceNum: { name: "n\xFAm_de_instancia", detail: "La instancia del delimitador antes de la cual desea extraer el texto." },
      matchMode: { name: "modo_de_coincidencia", detail: "Determina si la b\xFAsqueda de texto distingue entre may\xFAsculas y min\xFAsculas. El valor predeterminado es sensible a may\xFAsculas y min\xFAsculas." },
      matchEnd: { name: "coincidir_final", detail: "Trata el final del texto como un delimitador. Por defecto, el texto es una coincidencia exacta." },
      ifNotFound: { name: "si_no_se_encuentra", detail: "Valor devuelto si no se encuentra ninguna coincidencia. Por defecto, se devuelve #N/A." }
    }
  },
  TEXTJOIN: {
    description: "Texto: Combina el texto de m\xFAltiples rangos y/o cadenas",
    abstract: "Texto: Combina el texto de m\xFAltiples rangos y/o cadenas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/textjoin-function-357b449a-ec91-49d0-80c3-0e8fc845691c"
      }
    ],
    functionParameter: {
      delimiter: { name: "delimitador", detail: "Una cadena de texto, ya sea vac\xEDa, o uno o m\xE1s caracteres entre comillas dobles, o una referencia a una cadena de texto v\xE1lida." },
      ignoreEmpty: { name: "ignorar_vac\xEDas", detail: "Si es VERDADERO, ignora las celdas vac\xEDas." },
      text1: { name: "texto1", detail: "Elemento de texto a unir. Una cadena de texto, o una matriz de cadenas, como un rango de celdas." },
      text2: { name: "texto2", detail: "Elementos de texto adicionales a unir. Puede haber un m\xE1ximo de 252 argumentos de texto para los elementos de texto, incluido texto1. Cada uno puede ser una cadena de texto, o una matriz de cadenas, como un rango de celdas." }
    }
  },
  TEXTSPLIT: {
    description: "Divide cadenas de texto usando delimitadores de columna y fila",
    abstract: "Divide cadenas de texto usando delimitadores de columna y fila",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/textsplit-function-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto a dividir." },
      colDelimiter: { name: "delimitador_col", detail: "El car\xE1cter o cadena por el cual dividir la columna." },
      rowDelimiter: { name: "delimitador_fila", detail: "El car\xE1cter o cadena en el que dividir la l\xEDnea." },
      ignoreEmpty: { name: "ignorar_vac\xEDas", detail: "Si se deben ignorar las celdas vac\xEDas. El valor predeterminado es FALSO." },
      matchMode: { name: "modo_de_coincidencia", detail: "Busca una coincidencia de delimitador en el texto. Por defecto, se realiza una coincidencia sensible a may\xFAsculas y min\xFAsculas." },
      padWith: { name: "rellenar_con", detail: "El valor a usar para el relleno. Por defecto, se usa #N/A." }
    }
  },
  TRIM: {
    description: "Elimina todos los espacios del texto excepto los espacios individuales entre palabras.",
    abstract: "Elimina espacios del texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/trim-function-410388fa-c5df-49c6-b16c-9e5630b479f9"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto del que desea eliminar los espacios." }
    }
  },
  UNICHAR: {
    description: "Devuelve el car\xE1cter Unicode al que hace referencia el valor num\xE9rico dado",
    abstract: "Devuelve el car\xE1cter Unicode al que hace referencia el valor num\xE9rico dado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/unichar-function-ffeb64f5-f131-44c6-b332-5cd72f0659b8"
      }
    ],
    functionParameter: {
      number: { name: "n\xFAmero", detail: "N\xFAmero es el n\xFAmero Unicode que representa el car\xE1cter." }
    }
  },
  UNICODE: {
    description: "Devuelve el n\xFAmero (punto de c\xF3digo) que corresponde al primer car\xE1cter del texto",
    abstract: "Devuelve el n\xFAmero (punto de c\xF3digo) que corresponde al primer car\xE1cter del texto",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/unicode-function-adb74aaa-a2a5-4dde-aff6-966e4e81f16f"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "Texto es el car\xE1cter del que desea el valor Unicode." }
    }
  },
  UPPER: {
    description: "Convierte el texto a may\xFAsculas",
    abstract: "Convierte el texto a may\xFAsculas",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/upper-function-c11f29b3-d1a3-4537-8df6-04d0049963d6"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto que desea convertir a may\xFAsculas." }
    }
  },
  VALUE: {
    description: "Convierte un argumento de texto a un n\xFAmero",
    abstract: "Convierte un argumento de texto a un n\xFAmero",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/value-function-257d0108-07dc-437d-ae1c-bc2d3953d8c2"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "El texto entre comillas o una referencia a una celda que contiene el texto que desea convertir." }
    }
  },
  VALUETOTEXT: {
    description: "Devuelve texto desde cualquier valor especificado",
    abstract: "Devuelve texto desde cualquier valor especificado",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/valuetotext-function-5fff61a2-301a-4ab2-9ffa-0a5242a08fea"
      }
    ],
    functionParameter: {
      value: { name: "valor", detail: "El valor a devolver como texto." },
      format: { name: "formato", detail: "El formato de los datos devueltos. Puede ser uno de dos valores: \n0 Predeterminado. Formato conciso y f\xE1cil de leer. \n1 Formato estricto que incluye caracteres de escape y delimitadores de fila. Genera una cadena que se puede analizar al introducirla en la barra de f\xF3rmulas. Encapsula las cadenas devueltas entre comillas, excepto para valores booleanos, n\xFAmeros y errores." }
    }
  },
  CALL: {
    description: "Llama a un procedimiento en una biblioteca de v\xEDnculos din\xE1micos o recurso de c\xF3digo",
    abstract: "Llama a un procedimiento en una biblioteca de v\xEDnculos din\xE1micos o recurso de c\xF3digo",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/call-function-32d58445-e646-4ffd-8d5e-b45077a5e995"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  EUROCONVERT: {
    description: "Convierte un n\xFAmero a euros, convierte un n\xFAmero de euros a una moneda de un miembro del euro, o convierte un n\xFAmero de una moneda de un miembro del euro a otra usando el euro como intermediario (triangulaci\xF3n)",
    abstract: "Convierte un n\xFAmero a euros, convierte un n\xFAmero de euros a una moneda de un miembro del euro, o convierte un n\xFAmero de una moneda de un miembro del euro a otra usando el euro como intermediario (triangulaci\xF3n)",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/euroconvert-function-79c8fd67-c665-450c-bb6c-15fc92f8345c"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  REGISTER_ID: {
    description: "Devuelve el ID de registro de la biblioteca de v\xEDnculos din\xE1micos (DLL) especificada o del recurso de c\xF3digo que se ha registrado previamente",
    abstract: "Devuelve el ID de registro de la biblioteca de v\xEDnculos din\xE1micos (DLL) especificada o del recurso de c\xF3digo que se ha registrado previamente",
    links: [
      {
        title: "Instrucciones",
        url: "https://support.microsoft.com/es-es/office/register-id-function-f8f0af0f-fd66-4704-a0f2-87b27b175b50"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  }
};
var es_ES_default31 = locale31;

// ../packages/sheets-formula/src/locale/function-list/univer/es-ES.ts
var locale32 = {};
var es_ES_default32 = locale32;

// ../packages/sheets-formula/src/locale/function-list/web/es-ES.ts
var locale33 = {
  ENCODEURL: {
    description: "Devuelve una cadena codificada en URL",
    abstract: "Devuelve una cadena codificada en URL",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/en-us/office/encodeurl-function-07c7fb90-7c60-4bff-8687-fac50fe33d0e"
      }
    ],
    functionParameter: {
      text: { name: "texto", detail: "Una cadena que se va a codificar en URL" }
    }
  },
  FILTERXML: {
    description: "Devuelve datos espec\xEDficos del contenido XML utilizando la XPath especificada",
    abstract: "Devuelve datos espec\xEDficos del contenido XML utilizando la XPath especificada",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/en-us/office/filterxml-function-4df72efc-11ec-4951-86f5-c1374812f5b7"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  },
  WEBSERVICE: {
    description: "Devuelve datos de un servicio web",
    abstract: "Devuelve datos de un servicio web",
    links: [
      {
        title: "Instrucci\xF3n",
        url: "https://support.microsoft.com/en-us/office/webservice-function-0546a35a-ecc6-4739-aed7-c0b7ce1562c4"
      }
    ],
    functionParameter: {
      number1: { name: "n\xFAmero1", detail: "primero" },
      number2: { name: "n\xFAmero2", detail: "segundo" }
    }
  }
};
var es_ES_default33 = locale33;

// ../packages/sheets-formula/src/locale/es-ES.ts
var locale34 = {
  "sheets-formula": {
    functionList: {
      ...es_ES_default19,
      ...es_ES_default20,
      ...es_ES_default21,
      ...es_ES_default22,
      ...es_ES_default23,
      ...es_ES_default24,
      ...es_ES_default25,
      ...es_ES_default26,
      ...es_ES_default27,
      ...es_ES_default28,
      ...es_ES_default29,
      ...es_ES_default30,
      ...es_ES_default31,
      ...es_ES_default32,
      ...es_ES_default33
    }
  }
};
var es_ES_default34 = locale34;

// ../packages/sheets-formula-ui/src/locale/es-ES.ts
var locale35 = {
  "sheets-formula-ui": {
    shortcut: {
      "quick-sum": "Suma r\xE1pida"
    },
    insert: {
      tooltip: "Funciones",
      common: "Funciones comunes"
    },
    prompt: {
      helpExample: "EJEMPLO",
      helpAbstract: "ACERCA DE",
      required: "Obligatorio.",
      optional: "Opcional."
    },
    error: {
      title: "Error",
      divByZero: "Error de divisi\xF3n por cero",
      name: "Error de nombre no v\xE1lido",
      value: "Error en el valor",
      num: "Error num\xE9rico",
      na: "Error de valor no disponible",
      cycle: "Error de referencia circular",
      ref: "Error de referencia de celda no v\xE1lida",
      spill: "El rango de desbordamiento no est\xE1 vac\xEDo",
      calc: "Error de c\xE1lculo",
      error: "Error",
      connect: "Obteniendo datos",
      null: "Error nulo"
    },
    functionType: {
      financial: "Financiera",
      date: "Fecha y hora",
      math: "Matem\xE1ticas y trigonometr\xEDa",
      statistical: "Estad\xEDstica",
      lookup: "B\xFAsqueda y referencia",
      database: "Base de datos",
      text: "Texto",
      logical: "L\xF3gica",
      information: "Informaci\xF3n",
      engineering: "Ingenier\xEDa",
      cube: "Cubo",
      compatibility: "Compatibilidad",
      web: "Web",
      array: "Matriz",
      univer: "Univer",
      user: "Definida por el usuario",
      definedname: "Nombre definido"
    },
    moreFunctions: {
      confirm: "Confirmar",
      prev: "Anterior",
      next: "Siguiente",
      searchFunctionPlaceholder: "Buscar funci\xF3n",
      allFunctions: "Todas las funciones",
      syntax: "SINTAXIS"
    },
    operation: {
      copyFormulaOnly: "Copiar solo f\xF3rmula",
      pasteFormula: "Pegar f\xF3rmula"
    },
    rangeSelector: {
      title: "Selecciona un rango de datos",
      addAnotherRange: "Agregar rango",
      buttonTooltip: "Seleccionar rango de datos",
      placeHolder: "Selecciona un rango o escribe.",
      confirm: "Confirmar",
      cancel: "Cancelar"
    }
  }
};
var es_ES_default35 = locale35;

// ../packages/sheets-hyper-link/src/locale/es-ES.ts
var locale36 = {
  "sheets-hyper-link": {
    message: {
      refError: "Rango no v\xE1lido"
    }
  }
};
var es_ES_default36 = locale36;

// ../packages/sheets-hyper-link-ui/src/locale/es-ES.ts
var locale37 = {
  "sheets-hyper-link-ui": {
    form: {
      editTitle: "Editar enlace",
      addTitle: "Insertar enlace",
      label: "Etiqueta",
      type: "Tipo",
      link: "Enlace",
      linkPlaceholder: "Introduce el enlace",
      range: "Rango",
      worksheet: "Hoja de c\xE1lculo",
      definedName: "Nombre definido",
      ok: "Confirmar",
      cancel: "Cancelar",
      labelPlaceholder: "Introduce la etiqueta",
      inputError: "Por favor, introduce",
      selectError: "Por favor, selecciona",
      linkError: "Por favor, introduce un enlace v\xE1lido"
    },
    menu: {
      add: "Insertar enlace"
    },
    message: {
      noSheet: "La hoja de destino ha sido eliminada",
      refError: "Rango no v\xE1lido",
      hiddenSheet: "No se puede abrir el enlace porque la hoja enlazada est\xE1 oculta",
      coped: "Enlace copiado al portapapeles"
    },
    popup: {
      copy: "Copiar enlace",
      edit: "Editar enlace",
      cancel: "Cancelar enlace"
    }
  }
};
var es_ES_default37 = locale37;

// ../packages/sheets-note-ui/src/locale/es-ES.ts
var locale38 = {
  "sheets-note-ui": {
    note: {
      placeholder: "Escribe aqu\xED"
    },
    rightClick: {
      addNote: "Agregar nota",
      deleteNote: "Eliminar nota",
      toggleNote: "Mostrar/Ocultar nota"
    }
  }
};
var es_ES_default38 = locale38;

// ../packages/sheets-numfmt-ui/src/locale/es-ES.ts
var locale39 = {
  "sheets-numfmt-ui": {
    title: "Formato de n\xFAmero",
    numfmtType: "Tipos de formato",
    cancel: "Cancelar",
    confirm: "Confirmar",
    general: "General",
    accounting: "Contabilidad",
    text: "Texto",
    number: "N\xFAmero",
    percent: "Porcentaje",
    scientific: "Cient\xEDfico",
    currency: "Moneda",
    date: "Fecha",
    time: "Hora",
    thousandthPercentile: "Separador de miles",
    preview: "Vista previa",
    dateTime: "Fecha y hora",
    decimalLength: "Decimales",
    currencyType: "S\xEDmbolo de moneda",
    moreFmt: "Formatos",
    financialValue: "Valor financiero",
    roundingCurrency: "Redondear la moneda",
    timeDuration: "Duraci\xF3n",
    currencyDes: "El formato de moneda se utiliza para representar valores monetarios generales. El formato de contabilidad alinea una columna de valores con los puntos decimales.",
    accountingDes: "El formato de n\xFAmero de contabilidad alinea una columna de valores con s\xEDmbolos de moneda y puntos decimales.",
    dateType: "Tipo de fecha",
    dateDes: "El formato de fecha presenta valores de series de fecha y hora como valores de fecha.",
    negType: "Tipo de n\xFAmero negativo",
    generalDes: "El formato regular no contiene ning\xFAn formato de n\xFAmero espec\xEDfico.",
    thousandthPercentileDes: "El formato de separador de miles se utiliza para la representaci\xF3n de n\xFAmeros ordinarios. Los formatos monetarios y de contabilidad proporcionan un formato especializado para c\xE1lculos de valores monetarios.",
    addDecimal: "Aumentar decimales",
    subtractDecimal: "Disminuir decimales",
    customFormat: "Formato personalizado",
    customFormatDes: "Generar formatos de n\xFAmero personalizados basados en los existentes.",
    info: {
      error: "Error",
      forceStringInfo: "N\xFAmero almacenado como texto"
    }
  }
};
var es_ES_default39 = locale39;

// ../packages/sheets-sort-ui/src/locale/es-ES.ts
var locale40 = {
  "sheets-sort-ui": {
    general: {
      sort: "Ordenar",
      "sort-asc": "Ascendente",
      "sort-desc": "Descendente",
      "sort-custom": "Orden personalizado",
      "sort-asc-ext": "Expandir ascendente",
      "sort-desc-ext": "Expandir descendente",
      "sort-asc-cur": "Ascendente",
      "sort-desc-cur": "Descendente"
    },
    error: {
      "merge-size": "El rango seleccionado contiene celdas combinadas de diferentes tama\xF1os, que no se pueden ordenar.",
      empty: "El rango seleccionado no tiene contenido y no se puede ordenar.",
      single: "El rango seleccionado solo tiene una fila y no se puede ordenar.",
      "formula-array": "El rango seleccionado tiene f\xF3rmulas de matriz y no se puede ordenar."
    },
    dialog: {
      "sort-reminder": "Recordatorio de ordenaci\xF3n",
      "sort-reminder-desc": "\xBFExtender el rango de ordenaci\xF3n o mantener el rango?",
      "sort-reminder-ext": "Extender el rango de ordenaci\xF3n",
      "sort-reminder-no": "Mantener el rango de ordenaci\xF3n",
      "first-row-check": "La primera fila no participa en la ordenaci\xF3n",
      "add-condition": "Agregar condici\xF3n",
      cancel: "Cancelar",
      confirm: "Confirmar"
    },
    info: {
      tooltip: "Informaci\xF3n sobre la herramienta"
    }
  }
};
var es_ES_default40 = locale40;

// ../packages/sheets-table/src/locale/es-ES.ts
var locale41 = {
  "sheets-table": {
    columnPrefix: "Columna",
    tablePrefix: "Tabla",
    tableNameError: "El nombre de la tabla no puede contener espacios, no puede comenzar con un n\xFAmero y no puede ser id\xE9ntico a un nombre de tabla existente"
  }
};
var es_ES_default41 = locale41;

// ../packages/sheets-table-ui/src/locale/es-ES.ts
var locale42 = {
  "sheets-table-ui": {
    title: "Tabla",
    selectRange: "Seleccionar rango de tabla",
    rename: "Renombrar tabla",
    renamePlaceholder: "Enter table name",
    updateRange: "Actualizar rango de tabla",
    tableRangeWithMergeError: "El rango de la tabla no puede superponerse con celdas combinadas",
    tableRangeWithOtherTableError: "El rango de la tabla no puede superponerse con otras tablas",
    tableRangeSingleRowError: "El rango de la tabla no puede ser una sola fila",
    updateError: "No se puede establecer el rango de la tabla en un \xE1rea que no se superponga con la original y no est\xE9 en la misma fila",
    tableStyle: "Estilo de tabla",
    defaultStyle: "Estilo predeterminado",
    customStyle: "Estilo personalizado",
    customTooMore: "El n\xFAmero de temas personalizados excede el l\xEDmite m\xE1ximo, por favor, elimine algunos temas innecesarios y vuelva a a\xF1adirlos",
    setTheme: "Establecer tema de tabla",
    removeTable: "Eliminar tabla",
    cancel: "Cancelar",
    confirm: "Confirmar",
    header: "Encabezado",
    footer: "Pie de p\xE1gina",
    firstLine: "Primera l\xEDnea",
    secondLine: "Segunda l\xEDnea",
    columnPrefix: "Columna",
    tablePrefix: "Tabla",
    tableNameError: "El nombre de la tabla no puede contener espacios, no puede comenzar con un n\xFAmero y no puede ser id\xE9ntico a un nombre de tabla existente",
    columnMenu: {
      "insert-left": "Insert 1 table column left",
      "insert-right": "Insert 1 table column right",
      delete: "Delete table column"
    },
    sort: {
      "sort-asc": "Ascendente",
      "sort-desc": "Descendente"
    },
    insert: {
      main: "Insertar tabla",
      row: "Insertar fila de tabla",
      col: "Insertar columna de tabla"
    },
    remove: {
      main: "Eliminar tabla",
      row: "Eliminar fila de tabla",
      col: "Eliminar columna de tabla"
    },
    condition: {
      string: "Texto",
      number: "N\xFAmero",
      date: "Fecha",
      empty: "(Vac\xEDo)"
    },
    string: {
      compare: {
        equal: "Igual a",
        notEqual: "No es igual a",
        contains: "Contiene",
        notContains: "No contiene",
        startsWith: "Empieza por",
        endsWith: "Termina en"
      }
    },
    number: {
      compare: {
        equal: "Igual a",
        notEqual: "No es igual a",
        greaterThan: "Mayor que",
        greaterThanOrEqual: "Mayor o igual que",
        lessThan: "Menor que",
        lessThanOrEqual: "Menor o igual que",
        between: "Entre",
        notBetween: "No est\xE1 entre",
        above: "Por encima",
        below: "Por debajo",
        topN: "{0} superiores"
      }
    },
    date: {
      compare: {
        equal: "Igual a",
        notEqual: "No es igual a",
        after: "Despu\xE9s de",
        afterOrEqual: "Despu\xE9s o igual a",
        before: "Antes de",
        beforeOrEqual: "Antes o igual a",
        between: "Entre",
        notBetween: "No est\xE1 entre",
        today: "Hoy",
        yesterday: "Ayer",
        tomorrow: "Ma\xF1ana",
        thisWeek: "Esta semana",
        lastWeek: "La semana pasada",
        nextWeek: "La pr\xF3xima semana",
        thisMonth: "Este mes",
        lastMonth: "El mes pasado",
        nextMonth: "El pr\xF3ximo mes",
        thisQuarter: "Este trimestre",
        lastQuarter: "El trimestre pasado",
        nextQuarter: "El pr\xF3ximo trimestre",
        thisYear: "Este a\xF1o",
        nextYear: "El pr\xF3ximo a\xF1o",
        lastYear: "El a\xF1o pasado",
        quarter: "Por trimestre",
        month: "Por mes",
        q1: "Primer trimestre",
        q2: "Segundo trimestre",
        q3: "Tercer trimestre",
        q4: "Cuarto trimestre",
        m1: "Enero",
        m2: "Febrero",
        m3: "Marzo",
        m4: "Abril",
        m5: "Mayo",
        m6: "Junio",
        m7: "Julio",
        m8: "Agosto",
        m9: "Septiembre",
        m10: "Octubre",
        m11: "Noviembre",
        m12: "Diciembre"
      }
    },
    filter: {
      "by-values": "Por valores",
      "by-conditions": "Por condiciones",
      "clear-filter": "Borrar filtro",
      cancel: "Cancelar",
      confirm: "Confirmar",
      "search-placeholder": "Usa espacio para separar palabras clave",
      "select-all": "Seleccionar todo"
    }
  }
};
var es_ES_default42 = locale42;

// ../packages/sheets-thread-comment-ui/src/locale/es-ES.ts
var locale43 = {
  "sheets-thread-comment-ui": {
    panel: {
      title: "Gesti\xF3n de comentarios"
    },
    menu: {
      addComment: "A\xF1adir comentario",
      commentManagement: "Gesti\xF3n de comentarios"
    }
  }
};
var es_ES_default43 = locale43;

// ../packages/sheets-ui/src/locale/es-ES.ts
var locale44 = {
  "sheets-ui": {
    toolbar: {
      undo: "Deshacer",
      redo: "Rehacer",
      formatPainter: "Copiar formato",
      font: "Fuente",
      fontSize: "Tama\xF1o de fuente",
      fontSizeIncrease: "Aumentar tama\xF1o de fuente",
      fontSizeDecrease: "Disminuir tama\xF1o de fuente",
      bold: "Negrita",
      italic: "Cursiva",
      strikethrough: "Tachado",
      subscript: "Sub\xEDndice",
      superscript: "Super\xEDndice",
      underline: "Subrayado",
      textColor: {
        main: "Color del texto",
        right: "Elegir color"
      },
      resetColor: "Restablecer",
      fillColor: {
        main: "Color de relleno",
        right: "Elegir color"
      },
      border: {
        main: "Borde",
        right: "Estilo de borde"
      },
      mergeCell: {
        main: "Combinar celdas",
        right: "Elegir tipo de combinaci\xF3n"
      },
      horizontalAlignMode: {
        main: "Alineaci\xF3n horizontal",
        right: "Alineaci\xF3n"
      },
      verticalAlignMode: {
        main: "Alineaci\xF3n vertical",
        right: "Alineaci\xF3n"
      },
      textWrapMode: {
        main: "Ajuste de texto",
        right: "Modo de ajuste de texto"
      },
      textRotateMode: {
        main: "Girar texto",
        right: "Modo de giro de texto"
      },
      more: "M\xE1s",
      toggleGridlines: "Alternar l\xEDneas de cuadr\xEDcula",
      textToNumber: "Texto a n\xFAmero"
    },
    align: {
      left: "izquierda",
      center: "centro",
      right: "derecha",
      top: "superior",
      middle: "medio",
      bottom: "inferior"
    },
    button: {
      confirm: "Aceptar",
      cancel: "Cancelar",
      close: "Cerrar",
      insert: "Insertar",
      prevPage: "Anterior",
      nextPage: "Siguiente",
      total: "total:"
    },
    borderLine: {
      borderTop: "bordeSuperior",
      borderBottom: "bordeInferior",
      borderLeft: "bordeIzquierdo",
      borderRight: "bordeDerecho",
      borderNone: "sinBorde",
      borderAll: "todosLosBordes",
      borderOutside: "bordeExterior",
      borderInside: "bordeInterior",
      borderHorizontal: "bordeHorizontal",
      borderVertical: "bordeVertical",
      borderColor: "colorBorde",
      borderSize: "grosorBorde",
      borderType: "tipoBorde"
    },
    merge: {
      all: "Combinar todo",
      vertical: "Combinar verticalmente",
      horizontal: "Combinar horizontalmente",
      cancel: "Separar celdas",
      overlappingError: "No se pueden combinar \xE1reas superpuestas",
      partiallyError: "No se puede realizar esta operaci\xF3n en celdas parcialmente combinadas"
    },
    filter: {},
    textWrap: {
      overflow: "Desbordamiento",
      wrap: "Ajustar",
      clip: "Cortar"
    },
    textRotate: {
      none: "Ninguno",
      angleUp: "Inclinar hacia arriba",
      angleDown: "Inclinar hacia abajo",
      vertical: "Apilar verticalmente",
      rotationUp: "Girar hacia arriba",
      rotationDown: "Girar hacia abajo"
    },
    sheetConfig: {
      delete: "Eliminar",
      copy: "Copiar",
      rename: "Cambiar nombre",
      changeColor: "Cambiar color",
      hide: "Ocultar",
      unhide: "Mostrar",
      moveLeft: "Mover a la izquierda",
      moveRight: "Mover a la derecha",
      resetColor: "Restablecer color",
      cancelText: "Cancelar",
      chooseText: "Confirmar color",
      tipNameRepeat: "\xA1El nombre de la pesta\xF1a no se puede repetir! Por favor, revisa",
      noMoreSheet: "El libro de trabajo debe contener al menos una hoja de c\xE1lculo visible. Para eliminar la hoja de c\xE1lculo seleccionada, inserte una nueva o muestre una hoja oculta.",
      confirmDelete: "\xBFSeguro que quieres eliminar?",
      redoDelete: "Se puede deshacer con Ctrl+Z",
      noHide: "No se puede ocultar, mant\xE9n al menos una pesta\xF1a de hoja",
      chartEditNoOpt: "\xA1Esta operaci\xF3n no est\xE1 permitida en el modo de edici\xF3n de gr\xE1ficos!",
      sheetNameErrorTitle: "Ha habido un problema",
      sheetNameSpecCharError: "El nombre no puede exceder los 31 caracteres, no puede comenzar ni terminar con ', y no puede contener: [ ] : \\ ? * /",
      sheetNameCannotIsEmptyError: "El nombre de la hoja no puede estar vac\xEDo.",
      sheetNameAlreadyExistsError: "El nombre de la hoja ya existe. Por favor, introduce otro nombre.",
      deleteSheet: "Eliminar hoja de c\xE1lculo",
      deleteSheetContent: "\xBFConfirmar para eliminar esta hoja de c\xE1lculo?",
      deleteLargeSheetContent: "Confirma para eliminar esta hoja de c\xE1lculo. No se podr\xE1 recuperar despu\xE9s de la eliminaci\xF3n. \xBFEst\xE1s seguro de que quieres eliminarla?",
      addProtectSheet: "Proteger hoja de c\xE1lculo",
      removeProtectSheet: "Desproteger hoja de c\xE1lculo",
      changeSheetPermission: "Cambiar permisos de la hoja de c\xE1lculo",
      viewAllProtectArea: "Ver todos los rangos de protecci\xF3n"
    },
    rightClick: {
      copy: "Copiar",
      cut: "Cortar",
      paste: "Pegar",
      copySpecial: "Copiar especial",
      pasteSpecial: "Pegado especial",
      pasteValue: "Pegar solo valores",
      pasteFormat: "Pegar solo formato",
      pasteColWidth: "Pegar ancho de columna",
      pasteBesidesBorder: "Pegar todo excepto los bordes",
      insert: "Insertar",
      insertRow: "Insertar fila",
      insertRowBefore: "Insertar fila antes",
      insertRowsAfter: "Insertar",
      insertRowsAbove: "Insertar",
      insertRowsAfterSuffix: "filas despu\xE9s",
      insertRowsAboveSuffix: "filas arriba",
      insertColumn: "Insertar columna",
      insertColumnBefore: "Insertar columna antes",
      insertColsLeft: "Insertar",
      insertColsRight: "Insertar",
      insertColsLeftSuffix: "columnas a la izquierda",
      insertColsRightSuffix: "columnas a la derecha",
      delete: "Eliminar",
      deleteCell: "Eliminar celda",
      insertCell: "Insertar celda",
      deleteSelected: "Eliminar seleccionado ",
      hide: "Ocultar",
      hideSelected: "Ocultar seleccionado ",
      showHide: "Mostrar oculto",
      toTopAdd: "A\xF1adir hacia arriba",
      toBottomAdd: "A\xF1adir hacia abajo",
      toLeftAdd: "A\xF1adir a la izquierda",
      toRightAdd: "A\xF1adir a la derecha",
      deleteSelectedRow: "Eliminar fila seleccionada",
      deleteSelectedColumn: "Eliminar columna seleccionada",
      hideSelectedRow: "Ocultar fila seleccionada",
      showHideRow: "Mostrar/Ocultar fila",
      rowHeight: "Altura de fila",
      hideSelectedColumn: "Ocultar columna seleccionada",
      showHideColumn: "Mostrar/Ocultar columna",
      columnWidth: "Ancho de columna",
      moveLeft: "Mover a la izquierda",
      moveUp: "Mover hacia arriba",
      moveRight: "Mover a la derecha",
      moveDown: "Mover hacia abajo",
      add: "A\xF1adir",
      row: "Fila",
      column: "Columna",
      confirm: "Confirmar",
      clearSelection: "Borrar",
      clearContent: "Borrar contenido",
      clearFormat: "Borrar formato",
      clearAll: "Borrar todo",
      root: "Ra\xEDz",
      log: "Registro",
      delete0: "Eliminar 0 valores en ambos extremos",
      removeDuplicate: "Eliminar valores duplicados",
      byRow: "Por fila",
      byCol: "Por columna",
      generateNewMatrix: "Generar nueva matriz",
      fitContent: "Ajustar al contenido",
      freeze: "Inmovilizar",
      freezeCell: "Inmovilizar hasta la celda activa ({0} fila {1} columna)",
      freezeCol: "Inmovilizar hasta columna {0}",
      freezeRow: "Inmovilizar hasta fila {0}",
      freezeFirstCol: "Inmovilizar primera columna",
      freezeFirstRow: "Inmovilizar primera fila",
      cancelFreeze: "Movilizar paneles",
      deleteAllRowsAlert: "No puedes eliminar todas las filas de la hoja",
      deleteAllColumnsAlert: "No puedes eliminar todas las columnas de la hoja",
      hideAllRowsAlert: "No puedes ocultar todas las filas de la hoja",
      hideAllColumnsAlert: "No puedes ocultar todas las columnas de la hoja",
      protectRange: "Proteger filas y columnas",
      editProtectRange: "Establecer rango de protecci\xF3n",
      removeProtectRange: "Eliminar rango de protecci\xF3n",
      turnOnProtectRange: "A\xF1adir rango de protecci\xF3n",
      viewAllProtectArea: "Ver todos los rangos de protecci\xF3n",
      textToNumber: "Texto a n\xFAmero"
    },
    info: {
      notChangeMerge: "No puedes realizar cambios parciales en las celdas combinadas",
      detailUpdate: "Nuevo abierto",
      detailSave: "Cach\xE9 local restaurada",
      row: "",
      column: "",
      loading: "Cargando...",
      copy: "Copiar",
      return: "Salir",
      rename: "Cambiar nombre",
      tips: "Cambiar nombre",
      noName: "Hoja de c\xE1lculo sin t\xEDtulo",
      wait: "esperando actualizaci\xF3n",
      add: "A\xF1adir",
      addLast: "m\xE1s filas en la parte inferior",
      backTop: "Volver al principio",
      nextPage: "Siguiente",
      tipInputNumber: "Por favor, introduce el n\xFAmero",
      tipInputNumberLimit: "El rango de aumento est\xE1 limitado a 1-100",
      tipRowHeightLimit: "La altura de la fila debe estar entre 0 y 545",
      tipColumnWidthLimit: "El ancho de la columna debe estar entre 0 y 2038",
      problem: "Ha habido un problema"
    },
    clipboard: {
      paste: {
        exceedMaxCells: "El n\xFAmero de celdas pegadas excede el n\xFAmero m\xE1ximo de celdas",
        overlappingMergedCells: "El \xE1rea de pegado se superpone con celdas combinadas"
      },
      shortCutNotify: {
        title: "Por favor, pega usando los atajos de teclado.",
        useShortCutInstead: "Se detect\xF3 contenido de Excel. Usa el atajo de teclado para pegar."
      }
    },
    statusbar: {
      sum: "Suma",
      average: "Promedio",
      min: "M\xEDn",
      max: "M\xE1x",
      count: "Recuento num\xE9rico",
      countA: "Contar",
      clickToCopy: "Hacer clic para copiar",
      copied: "Copiado"
    },
    shortcut: {
      "sheet-view": "Sheet View",
      "sheet-edit": "Sheet Edit",
      sheet: {
        "zoom-in": "Acercar",
        "zoom-out": "Alejar",
        "reset-zoom": "Restablecer nivel de zoom",
        "select-below-cell": "Seleccionar la celda de abajo",
        "select-up-cell": "Seleccionar la celda de arriba",
        "select-left-cell": "Seleccionar la celda de la izquierda",
        "select-right-cell": "Seleccionar la celda de la derecha",
        "select-next-cell": "Seleccionar la celda siguiente",
        "select-previous-cell": "Seleccionar la celda anterior",
        "select-up-value-cell": "Seleccionar la celda superior que tiene valor",
        "select-below-value-cell": "Seleccionar la celda inferior que tiene valor",
        "select-left-value-cell": "Seleccionar la celda izquierda que tiene valor",
        "select-right-value-cell": "Seleccionar la celda derecha que tiene valor",
        "expand-selection-down": "Expandir selecci\xF3n hacia abajo",
        "expand-selection-up": "Expandir selecci\xF3n hacia arriba",
        "expand-selection-left": "Expandir selecci\xF3n a la izquierda",
        "expand-selection-right": "Expandir selecci\xF3n a la derecha",
        "expand-selection-to-left-gap": "Expandir selecci\xF3n al espacio izquierdo",
        "expand-selection-to-below-gap": "Expandir selecci\xF3n al espacio inferior",
        "expand-selection-to-right-gap": "Expandir selecci\xF3n al espacio derecho",
        "expand-selection-to-up-gap": "Expandir selecci\xF3n al espacio superior",
        "select-all": "Seleccionar todo",
        "toggle-editing": "Alternar edici\xF3n",
        "delete-and-start-editing": "Borrar y comenzar a editar",
        "abort-editing": "Abortar edici\xF3n",
        "break-line": "Salto de l\xEDnea",
        "set-bold": "Alternar negrita",
        "start-editing": "Comenzar a editar (Selecci\xF3n en el editor)",
        "repeat-last-action": "Repetir \xFAltima acci\xF3n",
        "set-italic": "Alternar cursiva",
        "set-underline": "Alternar subrayado",
        "set-strike-through": "Alternar tachado"
      }
    },
    definedName: {
      managerTitle: "Administrador de nombres",
      managerDescription: "Crea un nombre definido seleccionando celdas o f\xF3rmulas e introduciendo el nombre deseado en el cuadro de texto.",
      addButton: "A\xF1adir un nombre definido",
      featureTitle: "Nombres definidos",
      ratioRange: "Rango",
      ratioFormula: "F\xF3rmula",
      confirm: "Confirmar",
      cancel: "Cancelar",
      scopeWorkbook: "Libro de trabajo",
      inputNamePlaceholder: "Por favor, introduce un nombre (sin espacios)",
      inputCommentPlaceholder: "Por favor, introduce un comentario",
      inputRangePlaceholder: "Por favor, introduce un rango (sin espacios)",
      inputFormulaPlaceholder: "Por favor, introduce una f\xF3rmula (sin espacios)",
      formulaOrRefStringInvalid: "F\xF3rmula o cadena de referencia no v\xE1lida",
      defaultName: "NombreDefinido",
      updateButton: "Actualizar",
      deleteButton: "Eliminar",
      deleteConfirmText: "\xBFEst\xE1s seguro de que quieres eliminar este nombre definido?"
    },
    uploadLoading: {
      loading: "Cargando..., restante"
    },
    "data-validation": {
      alert: {
        ok: "Aceptar"
      },
      list: {
        edit: "Editar",
        dropdown: "Seleccione un elemento"
      },
      listMultiple: {
        dropdown: "Seleccione elementos"
      }
    },
    permission: {
      toolbarMenu: "Protecci\xF3n",
      panel: {
        title: "Proteger filas y columnas",
        name: "Nombre",
        protectedRange: "Rango protegido",
        permissionDirection: "Descripci\xF3n del permiso",
        permissionDirectionPlaceholder: "Introducir descripci\xF3n del permiso",
        editPermission: "Permisos de edici\xF3n",
        onlyICanEdit: "Solo yo puedo editar",
        designedUserCanEdit: "Los usuarios especificados pueden editar",
        viewPermission: "Permisos de visualizaci\xF3n",
        othersCanView: "Otros pueden ver",
        noOneElseCanView: "Nadie m\xE1s puede ver",
        designedPerson: "Personas especificadas",
        addPerson: "A\xF1adir persona",
        canEdit: "Puede editar",
        canView: "Puede ver",
        delete: "Eliminar",
        currentSheet: "Hoja actual",
        allSheet: "Todas las hojas",
        edit: "Editar",
        Print: "Imprimir",
        Comment: "Comentar",
        Copy: "Copiar",
        SetCellStyle: "Establecer estilo de celda",
        SetCellValue: "Establecer valor de celda",
        SetHyperLink: "Establecer hiperv\xEDnculo",
        Sort: "Ordenar",
        Filter: "Filtrar",
        PivotTable: "Tabla din\xE1mica",
        FloatImage: "Imagen flotante",
        RowHeightColWidth: "Altura de fila y ancho de columna",
        RowHeightColWidthReadonly: "Altura de fila y ancho de columna de solo lectura",
        FilterReadonly: "Filtro de solo lectura",
        nameError: "El nombre no puede estar vac\xEDo",
        created: "Creado",
        iCanEdit: "Puedo editar",
        iCanNotEdit: "No puedo editar",
        iCanView: "Puedo ver",
        iCanNotView: "No puedo ver",
        emptyRangeError: "El rango \u043D\u0435 puede estar vac\xEDo",
        rangeOverlapError: "El rango no puede superponerse",
        rangeOverlapOverPermissionError: "El rango no puede superponerse con el rango que tiene el mismo permiso",
        InsertHyperlink: "Insertar hiperv\xEDnculo",
        SetRowStyle: "Establecer estilo de fila",
        SetColumnStyle: "Establecer estilo de columna",
        InsertColumn: "Insertar columna",
        InsertRow: "Insertar fila",
        DeleteRow: "Eliminar fila",
        DeleteColumn: "Eliminar columna",
        EditExtraObject: "Editar objeto extra"
      },
      dialog: {
        allowUserToEdit: "Permitir al usuario editar",
        allowedPermissionType: "Tipos de permisos permitidos",
        setCellValue: "Establecer valor de celda",
        setCellStyle: "Establecer estilo de celda",
        copy: "Copiar",
        alert: "Alerta",
        search: "Buscar",
        ownerInherit: "Propietario del documento, herencia de permisos habilitada",
        ownerWithoutInherit: "Propietario del documento, herencia de permisos no habilitada",
        alertContent: "Este rango est\xE1 protegido y no hay permisos de edici\xF3n disponibles actualmente. Si necesitas editar, contacta al creador.",
        userEmpty: "ninguna persona designada, comparte el enlace para invitar a personas espec\xEDficas.",
        listEmpty: "No has configurado ning\xFAn rango u hoja como protegido.",
        commonErr: "El rango est\xE1 protegido y no tienes permiso para esta operaci\xF3n. Para editar, contacta al creador.",
        editErr: "El rango est\xE1 protegido y no tienes permiso de edici\xF3n. Para editar, contacta al creador.",
        pasteErr: "El rango est\xE1 protegido y no tienes permiso para pegar. Para pegar, contacta al creador.",
        setStyleErr: "El rango est\xE1 protegido y no tienes permiso para establecer estilos. Para establecer estilos, contacta al creador.",
        copyErr: "El rango est\xE1 protegido y no tienes permiso para copiar. Para copiar, contacta al creador.",
        workbookCopyErr: "El libro de trabajo est\xE1 protegido y no tienes permiso para copiar. Para copiar, contacta al creador.",
        setRowColStyleErr: "El rango est\xE1 protegido y no tienes permiso para establecer estilos de fila y columna. Para establecer estilos de fila y columna, contacta al creador.",
        moveRowColErr: "El rango est\xE1 protegido y no tienes permiso para mover filas y columnas. Para mover filas y columnas, contacta al creador.",
        moveRangeErr: "El rango est\xE1 protegido y no tienes permiso para mover la selecci\xF3n. Para mover la selecci\xF3n, contacta al creador.",
        insertRowColErr: "El rango est\xE1 protegido y no tienes permiso para insertar filas y columnas. Para insertar filas y columnas, contacta al creador.",
        removeRowColErr: "El rango est\xE1 protegido y no tienes permiso para eliminar filas y columnas. Para eliminar filas y columnas, contacta al creador.",
        autoFillErr: "El rango est\xE1 protegido y no tienes permiso para autorrellenar. Para usar el autorrellenado, contacta al creador.",
        filterErr: "El rango est\xE1 protegido y no tienes permiso para filtrar. Para filtrar, contacta al creador.",
        operatorSheetErr: "La hoja de c\xE1lculo est\xE1 protegida y no tienes permiso para operar en ella. Para operar en la hoja de c\xE1lculo, contacta al creador.",
        insertOrDeleteMoveRangeErr: "El rango insertado o eliminado se cruza con el rango protegido, y esta operaci\xF3n no es compatible por ahora.",
        printErr: "La hoja de c\xE1lculo est\xE1 protegida y no tienes permiso para imprimir. Para imprimir, contacta al creador.",
        formulaErr: "El rango o el rango referenciado est\xE1 protegido, y no tienes permiso de edici\xF3n. Para editar, contacta al creador.",
        hyperLinkErr: "El rango est\xE1 protegido y no tienes permiso para establecer hiperv\xEDnculos. Para establecer hiperv\xEDnculos, contacta al creador.",
        commentErr: "El rango est\xE1 protegido y no tienes permiso para comentar. Para comentar, contacta al creador."
      },
      button: {
        confirm: "Confirmar",
        cancel: "Cancelar",
        addNewPermission: "A\xF1adir nuevo permiso"
      }
    }
  }
};
var es_ES_default44 = locale44;

// ../packages/sheets-zen-editor/src/locale/es-ES.ts
var locale45 = {
  "sheets-zen-editor": {
    rightClick: {
      zenEditor: "Editor a pantalla completa"
    },
    shortcut: {
      sheet: {
        "zen-edit-cancel": "Cancelar edici\xF3n Zen",
        "zen-edit-confirm": "Confirmar edici\xF3n Zen"
      }
    }
  }
};
var es_ES_default45 = locale45;

// ../packages/slides-ui/src/locale/es-ES.ts
var locale46 = {
  "slides-ui": {
    append: "A\xF1adir diapositiva",
    text: {
      insert: {
        title: "Insertar texto"
      }
    },
    shape: {
      insert: {
        title: "Insertar forma",
        rectangle: "Insertar rect\xE1ngulo",
        ellipse: "Insertar elipse"
      }
    },
    image: {
      insert: {
        title: "Insertar imagen",
        float: "Insertar imagen flotante"
      }
    },
    popup: {
      edit: "Editar",
      delete: "Eliminar"
    },
    sidebar: {
      text: "Editar texto",
      shape: "Editar forma",
      image: "Editar imagen"
    },
    "image-panel": {
      arrange: {
        title: "Organizar",
        forward: "Traer adelante",
        backward: "Enviar atr\xE1s",
        front: "Traer al frente",
        back: "Enviar al fondo"
      },
      transform: {
        title: "Transformar",
        width: "Ancho (px)",
        height: "Alto (px)",
        x: "X (px)",
        y: "Y (px)",
        rotate: "Rotar (\xB0)"
      }
    },
    panel: {
      fill: {
        title: "Color de relleno"
      }
    }
  }
};
var es_ES_default46 = locale46;

// ../packages/thread-comment-ui/src/locale/es-ES.ts
var locale47 = {
  "thread-comment-ui": {
    panel: {
      title: "Gesti\xF3n de comentarios",
      empty: "A\xFAn no hay comentarios",
      filterEmpty: "Sin resultados coincidentes",
      reset: "Restablecer filtro",
      addComment: "A\xF1adir comentario",
      solved: "Resuelto"
    },
    editor: {
      placeholder: "Responde o a\xF1ade a otros con @",
      reply: "Comentar",
      cancel: "Cancelar",
      save: "Guardar"
    },
    item: {
      edit: "Editar",
      delete: "Eliminar este comentario"
    },
    filter: {
      sheet: {
        all: "Todas las hojas",
        current: "Hoja actual"
      },
      status: {
        all: "Todos los comentarios",
        resolved: "Resueltos",
        unsolved: "No resueltos",
        concernMe: "Me concierne"
      }
    }
  }
};
var es_ES_default47 = locale47;

// ../packages/ui/src/locale/es-ES.ts
var locale48 = {
  ui: {
    toolbar: {
      heading: {
        normal: "Normal",
        title: "T\xEDtulo",
        subTitle: "Subt\xEDtulo",
        1: "Encabezado 1",
        2: "Encabezado 2",
        3: "Encabezado 3",
        4: "Encabezado 4",
        5: "Encabezado 5",
        6: "Encabezado 6",
        tooltip: "Establecer encabezado"
      }
    },
    ribbon: {
      start: "Inicio",
      startDesc: "Inicia la hoja de c\xE1lculo y establece los par\xE1metros b\xE1sicos.",
      insert: "Insertar",
      insertDesc: "Inserta filas, columnas, gr\xE1ficos y otros elementos.",
      formulas: "F\xF3rmulas",
      formulasDesc: "Utiliza funciones y f\xF3rmulas para c\xE1lculos de datos.",
      data: "Datos",
      dataDesc: "Gestiona los datos, incluyendo importaci\xF3n, ordenaci\xF3n y filtrado.",
      view: "Vista",
      viewDesc: "Cambia los modos de vista y ajusta el efecto de visualizaci\xF3n.",
      others: "Otros",
      othersDesc: "Otras funciones y configuraciones.",
      more: "M\xE1s"
    },
    fontFamily: {
      "not-supported": "No se encontr\xF3 esta fuente en el sistema, se utiliza la fuente predeterminada.",
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
      title: "Atajos"
    },
    shortcut: {
      undo: "Deshacer",
      redo: "Rehacer",
      cut: "Cortar",
      copy: "Copiar",
      paste: "Pegar",
      "shortcut-panel": "Alternar panel de atajos"
    },
    "common-edit": "Atajos de edici\xF3n comunes",
    "toggle-shortcut-panel": "Alternar panel de atajos",
    clipboard: {
      authentication: {
        title: "Permiso denegado",
        content: "Por favor, permite que Univer acceda a tu portapapeles."
      }
    },
    textEditor: {
      formulaError: "Por favor, introduce una f\xF3rmula v\xE1lida, como =SUMA(A1)",
      rangeError: "Por favor, introduce un rango v\xE1lido, como A1:B10"
    },
    rangeSelector: {
      title: "Selecciona un rango de datos",
      addAnotherRange: "Agregar rango",
      buttonTooltip: "Seleccionar rango de datos",
      placeHolder: "Selecciona un rango o escribe.",
      confirm: "Confirmar",
      cancel: "Cancelar"
    },
    "global-shortcut": "Atajo global",
    "zoom-slider": {
      resetTo: "Restablecer a"
    },
    row: "Fila",
    column: "Columna"
  }
};
var es_ES_default48 = locale48;

// ../packages/uniscript/src/locale/es-ES.ts
var locale49 = {
  uniscript: {
    title: "Uniscript",
    tooltip: {
      "menu-button": "Mostrar/Ocultar panel de Uniscript"
    },
    panel: {
      execute: "Ejecutar script"
    },
    message: {
      success: "Ejecuci\xF3n exitosa",
      failed: "Ejecuci\xF3n fallida"
    }
  }
};
var es_ES_default49 = locale49;

// ../common/mockdata/src/locales/es-ES.ts
var es_ES_default50 = mergeLocales(
  es_ES_default,
  es_ES_default2,
  es_ES_default3,
  es_ES_default4,
  es_ES_default5,
  es_ES_default6,
  es_ES_default7,
  es_ES_default8,
  es_ES_default9,
  es_ES_default10,
  es_ES_default11,
  es_ES_default12,
  es_ES_default13,
  es_ES_default14,
  es_ES_default15,
  es_ES_default16,
  es_ES_default17,
  es_ES_default18,
  es_ES_default34,
  es_ES_default35,
  es_ES_default36,
  es_ES_default37,
  es_ES_default38,
  es_ES_default39,
  es_ES_default40,
  es_ES_default41,
  es_ES_default42,
  es_ES_default43,
  es_ES_default44,
  es_ES_default45,
  es_ES_default46,
  es_ES_default47,
  es_ES_default48,
  es_ES_default49
);

export {
  es_ES_default50 as es_ES_default
};
