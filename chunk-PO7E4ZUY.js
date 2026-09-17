import {
  en_US_default as en_US_default15
} from "./chunk-REZ6O7M2.js";
import {
  en_US_default
} from "./chunk-EXS3H27I.js";
import {
  en_US_default as en_US_default2,
  en_US_default10 as en_US_default11,
  en_US_default11 as en_US_default12,
  en_US_default12 as en_US_default13,
  en_US_default13 as en_US_default14,
  en_US_default14 as en_US_default16,
  en_US_default2 as en_US_default3,
  en_US_default3 as en_US_default4,
  en_US_default4 as en_US_default5,
  en_US_default5 as en_US_default6,
  en_US_default6 as en_US_default7,
  en_US_default7 as en_US_default8,
  en_US_default8 as en_US_default9,
  en_US_default9 as en_US_default10
} from "./chunk-62FTG3QU.js";
import {
  mergeLocales
} from "./chunk-EJSPXROI.js";

// ../packages/action-recorder/src/locale/en-US.ts
var locale = {
  "action-recorder": {
    menu: {
      title: "Record Actions",
      record: "Record Actions...",
      "replay-local": "Replace Local Record...",
      "replay-local-name": "Replace Local Record by Subunit...",
      "replay-local-active": "Replace Local Record by Current Subunit..."
    }
  }
};
var en_US_default17 = locale;

// ../packages/data-validation/src/locale/en-US.ts
var locale2 = {
  "data-validation": {
    operators: {
      between: "between",
      greaterThan: "greater than",
      greaterThanOrEqual: "greater than or equal",
      lessThan: "less than",
      lessThanOrEqual: "less than or equal",
      equal: "equal",
      notEqual: "not equal",
      notBetween: "not between",
      legal: "is legal type"
    },
    ruleName: {
      between: "Is between {FORMULA1} and {FORMULA2}",
      greaterThan: "Is greater than {FORMULA1}",
      greaterThanOrEqual: "Is greater than or equal to {FORMULA1}",
      lessThan: "Is less than {FORMULA1}",
      lessThanOrEqual: "Is less than or equal to {FORMULA1}",
      equal: "Is equal to {FORMULA1}",
      notEqual: "Is not equal to {FORMULA1}",
      notBetween: "Is not between {FORMULA1} and {FORMULA2}",
      legal: "Is a legal {TYPE}"
    },
    errorMsg: {
      between: "Value must be between {FORMULA1} and {FORMULA2}",
      greaterThan: "Value must be greater than {FORMULA1}",
      greaterThanOrEqual: "Value must be greater than or equal to {FORMULA1}",
      lessThan: "Value must be less than {FORMULA1}",
      lessThanOrEqual: "Value must be less than or equal to {FORMULA1}",
      equal: "Value must be equal to {FORMULA1}",
      notEqual: "Value must be not equal to {FORMULA1}",
      notBetween: "Value must be not between {FORMULA1} and {FORMULA2}",
      legal: "Value must be a legal {TYPE}"
    },
    date: {
      operators: {
        between: "between",
        greaterThan: "after",
        greaterThanOrEqual: "on or after",
        lessThan: "before",
        lessThanOrEqual: "on or before",
        equal: "equal",
        notEqual: "not equal",
        notBetween: "not between",
        legal: "is a legal date"
      },
      ruleName: {
        between: "is between {FORMULA1} and {FORMULA2}",
        greaterThan: "is after {FORMULA1}",
        greaterThanOrEqual: "is on or after {FORMULA1}",
        lessThan: "is before {FORMULA1}",
        lessThanOrEqual: "is on or before {FORMULA1}",
        equal: "is {FORMULA1}",
        notEqual: "is not {FORMULA1}",
        notBetween: "is not between {FORMULA1}",
        legal: "is a legal date"
      },
      errorMsg: {
        between: "Value must be a legal date and between {FORMULA1} and {FORMULA2}",
        greaterThan: "Value must be a legal date and after {FORMULA1}",
        greaterThanOrEqual: "Value must be a legal date and on or after {FORMULA1}",
        lessThan: "Value must be a legal date and before {FORMULA1}",
        lessThanOrEqual: "Value must be a legal date and on or before {FORMULA1}",
        equal: "Value must be a legal date and {FORMULA1}",
        notEqual: "Value must be a legal date and not {FORMULA1}",
        notBetween: "Value must be a legal date and not between {FORMULA1}",
        legal: "Value must be a legal date"
      },
      title: "Date"
    },
    textLength: {
      errorMsg: {
        between: "Text length must be between {FORMULA1} and {FORMULA2}",
        greaterThan: "Text length must be after {FORMULA1}",
        greaterThanOrEqual: "Text length must be on or after {FORMULA1}",
        lessThan: "Text length must be before {FORMULA1}",
        lessThanOrEqual: "Text length must be on or before {FORMULA1}",
        equal: "Text length must be {FORMULA1}",
        notEqual: "Text length must be not {FORMULA1}",
        notBetween: "Text length must be not between {FORMULA1}"
      },
      title: "Text length"
    },
    custom: {
      ruleName: "Custom formula is {FORMULA1}",
      title: "Custom formula",
      validFail: "Please input a valid formula",
      error: "This cell's contents violate its validation rule"
    },
    validFail: {
      value: "Please input a value",
      common: "Please input value or formula",
      number: "Please input number or formula",
      formula: "Please input formula",
      integer: "Please input integer or formula",
      date: "Please input date or formula",
      list: "Please input options",
      listInvalid: "The list source must be a delimited list or a reference to a single row or column",
      checkboxEqual: "Enter different values for ticked and unticked cell contents.",
      formulaError: "The reference range contains invisible data, please readjust the range",
      listIntersects: "The selected range cannot intersect with the scope of the rules",
      primitive: "Formulas are not permitted for custom ticked and unticked values."
    },
    any: {
      title: "Any value",
      error: "The content of this cell violates the validation rule"
    },
    list: {
      title: "Dropdown",
      name: "Value contains one from range",
      error: "Input must fall within specified range",
      emptyError: "Please enter a value",
      add: "Add",
      dropdown: "Select",
      options: "Options",
      customOptions: "Custom",
      refOptions: "From a range",
      formulaError: "The list source must be a delimited list of data, or a reference to a single row or column.",
      edit: "Edit"
    },
    listMultiple: {
      title: "Dropdown-Multiple",
      dropdown: "Multiple select"
    },
    decimal: {
      title: "Number"
    },
    whole: {
      title: "Integer"
    },
    checkbox: {
      title: "Checkbox",
      error: "This cell's contents violate its validation rule",
      tips: "Use custom values within cells",
      checked: "Selected value",
      unchecked: "Unselected value"
    }
  }
};
var en_US_default18 = locale2;

// ../packages/design/src/locale/en-US.ts
var locale3 = {
  design: {
    Confirm: {
      cancel: "cancel",
      confirm: "ok"
    },
    CascaderList: {
      empty: "None"
    },
    Calendar: {
      year: "",
      weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]
    },
    Select: {
      empty: "None"
    },
    ColorPicker: {
      more: "More Colors",
      cancel: "cancel",
      confirm: "ok"
    },
    GradientColorPicker: {
      linear: "Linear",
      radial: "Radial",
      angular: "Angular",
      diamond: "Diamond",
      offset: "Offset",
      angle: "Angle",
      flip: "Flip",
      delete: "Delete"
    }
  }
};
var en_US_default19 = locale3;

// ../packages/docs-drawing-ui/src/locale/en-US.ts
var locale4 = {
  "docs-drawing-ui": {
    title: "Image",
    upload: {
      float: "Insert Image"
    },
    panel: {
      title: "Edit Image"
    },
    "image-popup": {
      replace: "Replace",
      delete: "Delete",
      edit: "Edit",
      crop: "Crop",
      reset: "Reset Size"
    },
    "image-text-wrap": {
      title: "Text Wrapping",
      wrappingStyle: "Wrapping Style",
      square: "Square",
      topAndBottom: "Top and Bottom",
      inline: "In line with text",
      behindText: "Behind text",
      inFrontText: "In front of text",
      wrapText: "Wrap text",
      bothSide: "Both sides",
      leftOnly: "Left only",
      rightOnly: "Right only",
      distanceFromText: "Distance from text",
      top: "Top(px)",
      left: "Left(px)",
      bottom: "Bottom(px)",
      right: "Right(px)"
    },
    "image-position": {
      title: "Position",
      horizontal: "Horizontal",
      vertical: "Vertical",
      absolutePosition: "Absolute Position(px)",
      relativePosition: "Relative Position",
      toTheRightOf: "to the right of",
      relativeTo: "relative to",
      bellow: "bellow",
      options: "Options",
      moveObjectWithText: "Move object with text",
      column: "Column",
      margin: "Margin",
      page: "Page",
      line: "Line",
      paragraph: "Paragraph"
    },
    "update-status": {
      exceedMaxSize: "Image size exceeds limit, limit is {0}M",
      invalidImageType: "Invalid image type",
      exceedMaxCount: "Only {0} images can be uploaded at a time",
      invalidImage: "Invalid image"
    },
    shortcut: {
      "drawing-view": "Drawing View",
      "drawing-move-down": "Move Drawing down",
      "drawing-move-up": "Move Drawing up",
      "drawing-move-left": "Move Drawing left",
      "drawing-move-right": "Move Drawing right",
      "drawing-delete": "Delete Drawing"
    }
  }
};
var en_US_default20 = locale4;

// ../packages/docs-hyper-link-ui/src/locale/en-US.ts
var locale5 = {
  "docs-hyper-link-ui": {
    edit: {
      confirm: "Confirm",
      cancel: "Cancel",
      title: "Link",
      address: "Link",
      placeholder: "Please input a link url",
      addressError: "Url is illegal!",
      label: "Label",
      labelError: "Please input label of link"
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
var en_US_default21 = locale5;

// ../packages/docs-quick-insert-ui/src/locale/en-US.ts
var locale6 = {
  "docs-quick-insert-ui": {
    menu: {
      numberedList: "Numbered List",
      bulletedList: "Bulleted List",
      divider: "Divider",
      text: "Text",
      table: "Table",
      image: "Image"
    },
    group: {
      basics: "Basics"
    },
    placeholder: "No results found",
    keywordInputPlaceholder: "Enter keywords"
  }
};
var en_US_default22 = locale6;

// ../packages/docs-thread-comment-ui/src/locale/en-US.ts
var locale7 = {
  "docs-thread-comment-ui": {
    panel: {
      title: "Comment Management",
      addComment: "Add Comment"
    }
  }
};
var en_US_default23 = locale7;

// ../packages/docs-ui/src/locale/en-US.ts
var locale8 = {
  "docs-ui": {
    toolbar: {
      undo: "Undo",
      redo: "Redo",
      font: "Font",
      fontSize: "Font size",
      bold: "Bold",
      italic: "Italic",
      strikethrough: "Strikethrough",
      subscript: "Subscript",
      superscript: "Superscript",
      underline: "Underline",
      textColor: {
        main: "Text color"
      },
      fillColor: {
        main: "Text Background color"
      },
      table: {
        main: "Table",
        insert: "Insert Table",
        colCount: "Column count",
        rowCount: "Row count"
      },
      resetColor: "Reset",
      order: "Ordered list",
      unorder: "Unordered list",
      checklist: "Task list",
      documentFlavor: "Modern Mode",
      alignLeft: "Align Left",
      alignCenter: "Align Center",
      alignRight: "Align Right",
      alignJustify: "Justify",
      horizontalLine: "Horizontal line",
      headerFooter: "Header & Footer",
      pageSetup: "Page Setup"
    },
    table: {
      insert: "Insert",
      insertRowAbove: "Insert row above",
      insertRowBelow: "Insert row below",
      insertColumnLeft: "Insert column left",
      insertColumnRight: "Insert column right",
      delete: "Table delete",
      deleteRows: "Delete row",
      deleteColumns: "Delete column",
      deleteTable: "Delete table"
    },
    headerFooter: {
      header: "Header",
      footer: "Footer",
      panel: "Header & Footer Settings",
      firstPageCheckBox: "Different first page",
      oddEvenCheckBox: "Different odd and even pages",
      headerTopMargin: "Header top margin(px)",
      footerBottomMargin: "Footer bottom margin(px)",
      closeHeaderFooter: "Close header & footer",
      disableText: "Header & footer settings are disabled"
    },
    doc: {
      menu: {
        paragraphSetting: "Paragraph Settings"
      },
      slider: {
        paragraphSetting: "Paragraph Settings"
      },
      paragraphSetting: {
        alignment: "Alignment",
        indentation: "Indentation",
        left: "Left",
        right: "Right",
        firstLine: "First Line",
        hanging: "Hanging",
        spacing: "Spacing",
        before: "Before",
        after: "After",
        lineSpace: "Line Space",
        multiSpace: "Multi Space",
        fixedValue: "Fixed Value(px)"
      }
    },
    rightClick: {
      copy: "Copy",
      cut: "Cut",
      paste: "Paste",
      delete: "Delete",
      bulletList: "Bullet list",
      orderList: "Ordered list",
      checkList: "Task list",
      insertBellow: "Insert below"
    },
    "page-settings": {
      "document-setting": "Document Setting",
      mode: "Mode",
      "modern-mode": "Modern",
      "classic-mode": "Classic",
      "modern-width": "Content width",
      "modern-width-narrow": "Narrow",
      "modern-width-medium": "Medium",
      "modern-width-wide": "Wide",
      "paper-size": "Paper size",
      "page-size": {
        main: "Paper size",
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
      orientation: "Orientation",
      portrait: "Portrait",
      landscape: "Landscape",
      "custom-paper-size": "Custom Paper size",
      top: "Top",
      bottom: "Bottom",
      left: "Left",
      right: "Right",
      cancel: "Cancel",
      confirm: "Confirm"
    }
  }
};
var en_US_default24 = locale8;

// ../packages/drawing-ui/src/locale/en-US.ts
var locale9 = {
  "drawing-ui": {
    "image-cropper": {
      error: "Cannot crop non-image objects."
    },
    "image-panel": {
      arrange: {
        title: "Arrange",
        forward: "Bring Forward",
        backward: "Send Backward",
        front: "Bring to Front",
        back: "Send to Back"
      },
      transform: {
        title: "Transform",
        rotate: "Rotate (\xB0)",
        x: "X (px)",
        y: "Y (px)",
        width: "Width (px)",
        height: "Height (px)",
        lock: "Lock Ratio (%)"
      },
      crop: {
        title: "Crop",
        start: "Start Crop",
        mode: "Free"
      },
      group: {
        title: "Group",
        group: "Group",
        unGroup: "Ungroup"
      },
      align: {
        title: "Align",
        default: "Select Align Type",
        left: "Align Left",
        center: "Align Center",
        right: "Align Right",
        top: "Align Top",
        middle: "Align Middle",
        bottom: "Align Bottom",
        horizon: "Distribute Horizontally ",
        vertical: "Distribute Vertically "
      },
      null: "No Object Selection"
    },
    "image-popup": {
      replace: "Replace",
      delete: "Delete",
      edit: "Edit",
      crop: "Crop",
      reset: "Reset Size"
    },
    "image-text-wrap": {
      title: "Text Wrapping",
      wrappingStyle: "Wrapping Style",
      square: "Square",
      topAndBottom: "Top and Bottom",
      inline: "In line with text",
      behindText: "Behind text",
      inFrontText: "In front of text",
      wrapText: "Wrap text",
      bothSide: "Both sides",
      leftOnly: "Left only",
      rightOnly: "Right only",
      distanceFromText: "Distance from text",
      top: "Top(px)",
      left: "Left(px)",
      bottom: "Bottom(px)",
      right: "Right(px)"
    }
  }
};
var en_US_default25 = locale9;

// ../packages/find-replace/src/locale/en-US.ts
var locale10 = {
  "find-replace": {
    toolbar: "Find & Replace",
    shortcut: {
      "open-find-dialog": "Open Find Dialog",
      "open-replace-dialog": "Open Replace Dialog",
      "close-dialog": "Close Find & Replace Dialog",
      "go-to-next-match": "Go to Next Match",
      "go-to-previous-match": "Go to Previous Match",
      "focus-selection": "Focus Selection",
      panel: "Find & Replace"
    },
    dialog: {
      title: "Find",
      find: "Find",
      replace: "Replace",
      "replace-all": "Replace All",
      "case-sensitive": "Case Sensitive",
      "find-placeholder": "Find in this Sheet",
      "advanced-finding": "Advanced Searching & Replace",
      "replace-placeholder": "Input Replace String",
      "match-the-whole-cell": "Match the Whole Cell",
      "find-direction": {
        title: "Find Direction",
        row: "Search by Row",
        column: "Search by Column"
      },
      "find-scope": {
        title: "Find Range",
        "current-sheet": "Current Sheet",
        workbook: "Workbook"
      },
      "find-by": {
        title: "Find By",
        value: "Find by Value",
        formula: "Find Formula"
      },
      "no-match": "Finding completed but no match found.",
      "no-result": "No Result"
    },
    replace: {
      "all-success": "Replaced all {0} matches",
      "all-failure": "Replace failed",
      confirm: {
        title: "Are you sure to replace all matches?"
      }
    },
    button: {
      confirm: "OK",
      cancel: "Cancel"
    }
  }
};
var en_US_default26 = locale10;

// ../packages/sheets/src/locale/en-US.ts
var locale11 = {
  sheets: {
    tabs: {
      sheetCopy: "(Copy{0})",
      sheet: "Sheet"
    },
    info: {
      overlappingSelections: "Cannot use that command on overlapping selections",
      acrossMergedCell: "Across a merged cell",
      partOfCell: "Only part of a merged cell is selected",
      hideSheet: "No visible sheet after you hide this"
    },
    definedName: {
      nameEmpty: "Name cannot be empty",
      nameDuplicate: "Name already exists",
      nameInvalid: "The name is invalid",
      nameSheetConflict: "The name conflicts with the sheet name",
      formulaOrRefStringEmpty: "Formula or reference string cannot be empty",
      nameConflict: "The name conflicts with the function name",
      defaultName: "DefinedName"
    },
    permission: {
      dialog: {
        autoFillErr: "The range is protected, and you do not have permission for auto-fill. To use auto-fill, please contact the creator.",
        editErr: "The range is protected, and you do not have edit permission. To edit, please contact the creator.",
        formulaErr: "The range or the referenced range is protected, and you do not have edit permission. To edit, please contact the creator.",
        insertOrDeleteMoveRangeErr: "The inserted or deleted range intersects with the protected range, and this operation is not supported for now.",
        insertRowColErr: "The range is protected, and you do not have permission to insert rows and columns. To insert rows and columns, please contact the creator.",
        moveRangeErr: "The range is protected, and you do not have permission to move the selection. To move the selection, please contact the creator.",
        moveRowColErr: "The range is protected, and you do not have permission to move rows and columns. To move rows and columns, please contact the creator.",
        operatorSheetErr: "The worksheet is protected, and you do not have permission to operate the worksheet. To operate the worksheet, please contact the creator.",
        removeRowColErr: "The range is protected, and you do not have permission to delete rows and columns. To delete rows and columns, please contact the creator.",
        setRowColStyleErr: "The range is protected, and you do not have permission to set row and column styles. To set row and column styles, please contact the creator.",
        setStyleErr: "The range is protected, and you do not have permission to set styles. To set styles, please contact the creator."
      }
    },
    autoFill: {
      copy: "Copy Cell",
      series: "Fill Series",
      formatOnly: "Format Only",
      noFormat: "No Format"
    },
    merge: {
      confirm: {
        title: "Continue merging would only keep the upper-left cell value, discard other values. Are you sure to continue?",
        cancel: "Cancel merging",
        confirm: "Continue merging",
        warning: "Warning",
        dismantleMergeCellWarning: "This will cause some merged cells to be split. Do you want to continue?"
      }
    }
  }
};
var en_US_default27 = locale11;

// ../packages/sheets-conditional-formatting-ui/src/locale/en-US.ts
var locale12 = {
  "sheets-conditional-formatting-ui": {
    title: "Conditional Formatting",
    menu: {
      manageConditionalFormatting: "Manage Conditional Formatting",
      createConditionalFormatting: "Create Conditional Formatting",
      clearRangeRules: "Clear Rules for Selected Range",
      clearWorkSheetRules: "Clear Rules for Entire Sheet"
    },
    form: {
      lessThan: "The value must be less than {0}",
      lessThanOrEqual: "The value must be less than or equal to {0}",
      greaterThan: "The value must be greater than {0}",
      greaterThanOrEqual: "The value must be greater than or equal to {0}",
      rangeSelector: "Select Range or Enter Value"
    },
    iconSet: {
      direction: "Direction",
      shape: "Shape",
      mark: "Mark",
      rank: "Rank",
      rule: "Rule",
      icon: "Icon",
      type: "Type",
      value: "Value",
      reverseIconOrder: "Reverse Icon Order",
      and: "And",
      when: "When",
      onlyShowIcon: "Only Show Icon"
    },
    symbol: {
      greaterThan: ">",
      greaterThanOrEqual: ">=",
      lessThan: "<",
      lessThanOrEqual: "<="
    },
    panel: {
      createRule: "Create Rule",
      clear: "Clear All Rules",
      range: "Apply Range",
      styleType: "Style Type",
      submit: "Submit",
      cancel: "Cancel",
      rankAndAverage: "Top/Bottom/Average",
      styleRule: "Style Rule",
      isNotBottom: "Top",
      isBottom: "Bottom",
      greaterThanAverage: "Greater Than Average",
      lessThanAverage: "Less Than Average",
      medianValue: "Median Value",
      fillType: "Fill Type",
      pureColor: "Solid Color",
      gradient: "Gradient",
      colorSet: "Color Set",
      positive: "Positive",
      native: "Negative",
      workSheet: "Entire Sheet",
      selectedRange: "Selected Range",
      managerRuleSelect: "Manage {0} Rules",
      onlyShowDataBar: "Only Show Data Bars"
    },
    preview: {
      describe: {
        beginsWith: "Begins with {0}",
        endsWith: "Ends with {0}",
        containsText: "Text contains {0}",
        notContainsText: "Text does not contain {0}",
        equal: "Equal to {0}",
        notEqual: "Not equal to {0}",
        containsBlanks: "Contains Blanks",
        notContainsBlanks: "Does not contain Blanks",
        containsErrors: "Contains Errors",
        notContainsErrors: "Does not contain Errors",
        greaterThan: "Greater than {0}",
        greaterThanOrEqual: "Greater than or equal to {0}",
        lessThan: "Less than {0}",
        lessThanOrEqual: "Less than or equal to {0}",
        notBetween: "Not between {0} and {1}",
        between: "Between {0} and {1}",
        yesterday: "Yesterday",
        tomorrow: "Tomorrow",
        last7Days: "Last 7 Days",
        thisMonth: "This Month",
        lastMonth: "Last Month",
        nextMonth: "Next Month",
        thisWeek: "This Week",
        lastWeek: "Last Week",
        nextWeek: "Next Week",
        today: "Today",
        topN: "Top {0}",
        bottomN: "Bottom {0}",
        topNPercent: "Top {0}%",
        bottomNPercent: "Bottom {0}%"
      }
    },
    operator: {
      beginsWith: "Begins with",
      endsWith: "Ends with",
      containsText: "Text contains",
      notContainsText: "Text does not contain",
      equal: "Equal to",
      notEqual: "Not equal to",
      containsBlanks: "Contains Blanks",
      notContainsBlanks: "Does not contain Blanks",
      containsErrors: "Contains Errors",
      notContainsErrors: "Does not contain Errors",
      greaterThan: "Greater than",
      greaterThanOrEqual: "Greater than or equal to",
      lessThan: "Less than",
      lessThanOrEqual: "Less than or equal to",
      notBetween: "Not between",
      between: "Between",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      last7Days: "Last 7 Days",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      nextMonth: "Next Month",
      thisWeek: "This Week",
      lastWeek: "Last Week",
      nextWeek: "Next Week",
      today: "Today"
    },
    ruleType: {
      highlightCell: "Highlight Cell",
      dataBar: "Data Bar",
      colorScale: "Color Scale",
      formula: "Custom Formula",
      iconSet: "Icon Set",
      duplicateValues: "Duplicate Values",
      uniqueValues: "Unique Values"
    },
    subRuleType: {
      uniqueValues: "Unique Values",
      duplicateValues: "Duplicate Values",
      rank: "Rank",
      text: "Text",
      timePeriod: "Time Period",
      number: "Number",
      average: "Average"
    },
    valueType: {
      num: "Number",
      min: "Minimum",
      max: "Maximum",
      percent: "Percentage",
      percentile: "Percentile",
      formula: "Formula",
      none: "None"
    },
    errorMessage: {
      notBlank: "Condition can not be empty",
      formulaError: "Wrong formula",
      rangeError: "Bad selection"
    },
    permission: {
      dialog: {
        setStyleErr: "The range is protected, and you do not have permission to set styles. To set styles, please contact the creator."
      }
    }
  }
};
var en_US_default28 = locale12;

// ../packages/sheets-crosshair-highlight/src/locale/en-US.ts
var locale13 = {
  "sheets-crosshair-highlight": {
    button: {
      tooltip: "Crosshair Highlight"
    }
  }
};
var en_US_default29 = locale13;

// ../packages/sheets-data-validation/src/locale/en-US.ts
var locale14 = {
  "sheets-data-validation": {
    operators: {
      between: "between",
      greaterThan: "greater than",
      greaterThanOrEqual: "greater than or equal",
      lessThan: "less than",
      lessThanOrEqual: "less than or equal",
      equal: "equal",
      notEqual: "not equal",
      notBetween: "not between",
      legal: "is legal type"
    },
    ruleName: {
      between: "Is between {FORMULA1} and {FORMULA2}",
      greaterThan: "Is greater than {FORMULA1}",
      greaterThanOrEqual: "Is greater than or equal to {FORMULA1}",
      lessThan: "Is less than {FORMULA1}",
      lessThanOrEqual: "Is less than or equal to {FORMULA1}",
      equal: "Is equal to {FORMULA1}",
      notEqual: "Is not equal to {FORMULA1}",
      notBetween: "Is not between {FORMULA1} and {FORMULA2}",
      legal: "Is a legal {TYPE}"
    },
    errorMsg: {
      between: "Value must be between {FORMULA1} and {FORMULA2}",
      greaterThan: "Value must be greater than {FORMULA1}",
      greaterThanOrEqual: "Value must be greater than or equal to {FORMULA1}",
      lessThan: "Value must be less than {FORMULA1}",
      lessThanOrEqual: "Value must be less than or equal to {FORMULA1}",
      equal: "Value must be equal to {FORMULA1}",
      notEqual: "Value must be not equal to {FORMULA1}",
      notBetween: "Value must be not between {FORMULA1} and {FORMULA2}",
      legal: "Value must be a legal {TYPE}"
    },
    date: {
      operators: {
        between: "between",
        greaterThan: "after",
        greaterThanOrEqual: "on or after",
        lessThan: "before",
        lessThanOrEqual: "on or before",
        equal: "equal",
        notEqual: "not equal",
        notBetween: "not between",
        legal: "is a legal date"
      },
      ruleName: {
        between: "is between {FORMULA1} and {FORMULA2}",
        greaterThan: "is after {FORMULA1}",
        greaterThanOrEqual: "is on or after {FORMULA1}",
        lessThan: "is before {FORMULA1}",
        lessThanOrEqual: "is on or before {FORMULA1}",
        equal: "is {FORMULA1}",
        notEqual: "is not {FORMULA1}",
        notBetween: "is not between {FORMULA1}",
        legal: "is a legal date"
      },
      errorMsg: {
        between: "Value must be a legal date and between {FORMULA1} and {FORMULA2}",
        greaterThan: "Value must be a legal date and after {FORMULA1}",
        greaterThanOrEqual: "Value must be a legal date and on or after {FORMULA1}",
        lessThan: "Value must be a legal date and before {FORMULA1}",
        lessThanOrEqual: "Value must be a legal date and on or before {FORMULA1}",
        equal: "Value must be a legal date and {FORMULA1}",
        notEqual: "Value must be a legal date and not {FORMULA1}",
        notBetween: "Value must be a legal date and not between {FORMULA1}",
        legal: "Value must be a legal date"
      },
      title: "Date"
    },
    textLength: {
      errorMsg: {
        between: "Text length must be between {FORMULA1} and {FORMULA2}",
        greaterThan: "Text length must be after {FORMULA1}",
        greaterThanOrEqual: "Text length must be on or after {FORMULA1}",
        lessThan: "Text length must be before {FORMULA1}",
        lessThanOrEqual: "Text length must be on or before {FORMULA1}",
        equal: "Text length must be {FORMULA1}",
        notEqual: "Text length must be not {FORMULA1}",
        notBetween: "Text length must be not between {FORMULA1}"
      },
      title: "Text length"
    },
    custom: {
      ruleName: "Custom formula is {FORMULA1}",
      title: "Custom formula",
      validFail: "Please input a valid formula",
      error: "This cell's contents violate its validation rule"
    },
    validFail: {
      value: "Please input a value",
      common: "Please input value or formula",
      number: "Please input number or formula",
      formula: "Please input formula",
      integer: "Please input integer or formula",
      date: "Please input date or formula",
      list: "Please input options",
      listInvalid: "The list source must be a delimited list or a reference to a single row or column",
      checkboxEqual: "Enter different values for ticked and unticked cell contents.",
      formulaError: "The reference range contains invisible data, please readjust the range",
      listIntersects: "The selected range cannot intersect with the scope of the rules",
      primitive: "Formulas are not permitted for custom ticked and unticked values."
    },
    any: {
      title: "Any value",
      error: "The content of this cell violates the validation rule"
    },
    list: {
      title: "Dropdown",
      name: "Value contains one from range",
      error: "Input must fall within specified range",
      emptyError: "Please enter a value",
      add: "Add",
      dropdown: "Select",
      options: "Options",
      customOptions: "Custom",
      refOptions: "From a range",
      formulaError: "The list source must be a delimited list of data, or a reference to a single row or column.",
      edit: "Edit"
    },
    listMultiple: {
      title: "Dropdown-Multiple",
      dropdown: "Multiple select"
    },
    decimal: {
      title: "Number"
    },
    whole: {
      title: "Integer"
    },
    checkbox: {
      title: "Checkbox",
      error: "This cell's contents violate its validation rule",
      tips: "Use custom values within cells",
      checked: "Selected value",
      unchecked: "Unselected value"
    }
  }
};
var en_US_default30 = locale14;

// ../packages/sheets-data-validation-ui/src/locale/en-US.ts
var locale15 = {
  "sheets-data-validation-ui": {
    title: "Data validation",
    validFail: {
      value: "Please input a value",
      common: "Please input value or formula",
      number: "Please input number or formula",
      formula: "Please input formula",
      integer: "Please input integer or formula",
      date: "Please input date or formula",
      list: "Please input options",
      listInvalid: "The list source must be a delimited list or a reference to a single row or column",
      checkboxEqual: "Enter different values for ticked and unticked cell contents.",
      formulaError: "The reference range contains invisible data, please readjust the range",
      listIntersects: "The selected range cannot intersect with the scope of the rules",
      primitive: "Formulas are not permitted for custom ticked and unticked values."
    },
    panel: {
      title: "Data validation management",
      addTitle: "Create new data validation",
      removeAll: "Remove All",
      add: "Add Rule",
      range: "Ranges",
      type: "Type",
      options: "Advance options",
      operator: "Operator",
      removeRule: "Remove",
      done: "Done",
      formulaPlaceholder: "Please input value or formula",
      valuePlaceholder: "Please input value",
      formulaAnd: "and",
      invalid: "Invalid",
      showWarning: "Show warning",
      rejectInput: "Reject input",
      messageInfo: "Helper message",
      showInfo: "Show help text for a selected cell",
      rangeError: "Ranges are not legal",
      allowBlank: "Allow blank values"
    },
    any: {
      title: "Any value",
      error: "The content of this cell violates the validation rule"
    },
    date: {
      title: "Date"
    },
    list: {
      title: "Dropdown",
      name: "Value contains one from range",
      error: "Input must fall within specified range",
      emptyError: "Please enter a value",
      add: "Add",
      dropdown: "Select",
      options: "Options",
      customOptions: "Custom",
      refOptions: "From a range",
      formulaError: "The list source must be a delimited list of data, or a reference to a single row or column.",
      edit: "Edit"
    },
    listMultiple: {
      title: "Dropdown-Multiple",
      dropdown: "Multiple select"
    },
    textLength: {
      title: "Text length"
    },
    decimal: {
      title: "Number"
    },
    whole: {
      title: "Integer"
    },
    checkbox: {
      title: "Checkbox",
      error: "This cell's contents violate its validation rule",
      tips: "Use custom values within cells",
      checked: "Selected value",
      unchecked: "Unselected value"
    },
    custom: {
      title: "Custom formula",
      error: "This cell's contents violate its validation rule",
      validFail: "Please input a valid formula"
    },
    alert: {
      title: "Error",
      ok: "OK"
    },
    error: {
      title: "Invalid:"
    },
    renderMode: {
      arrow: "Arrow",
      chip: "Chip",
      text: "Plain text",
      label: "Display style"
    },
    showTime: {
      label: "Show TimePicker"
    },
    permission: {
      dialog: {
        setStyleErr: "The range is protected, and you do not have permission to set styles. To set styles, please contact the creator."
      }
    }
  }
};
var en_US_default31 = locale15;

// ../packages/sheets-drawing-ui/src/locale/en-US.ts
var locale16 = {
  "sheets-drawing-ui": {
    title: "Image",
    upload: {
      float: "Float Image",
      cell: "Cell Image"
    },
    panel: {
      title: "Edit Image"
    },
    save: {
      title: "Save Cell Images",
      menuLabel: "Save Cell Images",
      imageCount: "Image Count",
      fileNameConfig: "File Name",
      useRowCol: "Use Cell Address (A1, B2...)",
      useColumnValue: "Use Column Value",
      selectColumn: "Select Column",
      cancel: "Cancel",
      confirm: "Save",
      saving: "Saving...",
      error: "Failed to save cell images"
    },
    "image-popup": {
      replace: "Replace",
      delete: "Delete",
      edit: "Edit",
      crop: "Crop",
      reset: "Reset Size",
      flipH: "Flip Horizontal",
      flipV: "Flip Vertical"
    },
    "update-status": {
      exceedMaxSize: "Image size exceeds limit, limit is {0}M",
      invalidImageType: "Invalid image type",
      exceedMaxCount: "Only {0} images can be uploaded at a time",
      invalidImage: "Invalid image"
    },
    "drawing-anchor": {
      title: "Anchor Properties",
      both: "Move and size with cells",
      position: "Move but don't size with cells",
      none: "Don't move or size with cells"
    },
    "cell-image": {
      pasteTitle: "Paste as cell image",
      pasteContent: "Pasting a cell image will overwrite the existing content of the cell, continue pasting",
      pasteError: "Sheet cell image copy paste is not supported in this unit"
    },
    permission: {
      dialog: {
        editErr: "The range is protected, and you do not have edit permission. To edit, please contact the creator."
      }
    },
    shortcut: {
      "drawing-view": "Drawing View",
      "drawing-move-down": "Move Drawing down",
      "drawing-move-up": "Move Drawing up",
      "drawing-move-left": "Move Drawing left",
      "drawing-move-right": "Move Drawing right",
      "drawing-delete": "Delete Drawing"
    }
  }
};
var en_US_default32 = locale16;

// ../packages/sheets-filter/src/locale/en-US.ts
var locale17 = {
  "sheets-filter": {
    command: {
      "not-valid-filter-range": "The selected range only has one row and not valid for filter."
    },
    msg: {
      "filter-header-forbidden": "You can't move the header row of a filter."
    }
  }
};
var en_US_default33 = locale17;

// ../packages/sheets-filter-ui/src/locale/en-US.ts
var locale18 = {
  "sheets-filter-ui": {
    toolbar: {
      "smart-toggle-filter-tooltip": "Toggle Filter",
      "clear-filter-criteria": "Clear Filter Conditions",
      "re-calc-filter-conditions": "Re-calc Filter Conditions"
    },
    shortcut: {
      "smart-toggle-filter": "Toggle Filter"
    },
    panel: {
      "clear-filter": "Clear Filter",
      cancel: "Cancel",
      confirm: "Confirm",
      "by-values": "By Values",
      "by-colors": "By Colors",
      "filter-by-cell-fill-color": "Filter by cell fill color",
      "filter-by-cell-text-color": "Filter by cell text color",
      "filter-by-color-none": "The column contains only one color",
      "by-conditions": "By Conditions",
      "filter-only": "Filter Only",
      "search-placeholder": "Use space to separate keywords",
      "select-all": "Select All",
      "input-values-placeholder": "Input Values",
      and: "AND",
      or: "OR",
      empty: "(empty)",
      "?": "Use \u201C?\u201D to represent a single character.",
      "*": "Use \u201C*\u201D to represent multiple characters."
    },
    conditions: {
      none: "None",
      empty: "Is Empty",
      "not-empty": "Is Not Empty",
      "text-contains": "Text Contains",
      "does-not-contain": "Text Does Not Contain",
      "starts-with": "Text Starts With",
      "ends-with": "Text Ends With",
      equals: "Text Equals",
      "greater-than": "Greater Than",
      "greater-than-or-equal": "Greater Than Or Equal To",
      "less-than": "Less Than",
      "less-than-or-equal": "Less Than Or Equal To",
      equal: "Equal",
      "not-equal": "Not Equal",
      between: "Between",
      "not-between": "Not Between",
      custom: "Custom"
    },
    date: {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December"
    },
    sync: {
      title: "Filter is visible to everyone",
      statusTips: {
        on: "Once on, all collaborators will see the filter results",
        off: "Once off, only you will see the filter results"
      },
      switchTips: {
        on: '"Filter is visible to everyone" is turned on, all collaborators will see the filter results',
        off: '"Filter is visible to everyone" is turned off, only you will see the filter results'
      }
    }
  }
};
var en_US_default34 = locale18;

// ../packages/sheets-formula/src/locale/en-US.ts
var locale19 = {
  "sheets-formula": {
    functionList: {
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
      ...en_US_default15,
      ...en_US_default16
    }
  }
};
var en_US_default35 = locale19;

// ../packages/sheets-formula-ui/src/locale/en-US.ts
var locale20 = {
  "sheets-formula-ui": {
    shortcut: {
      "quick-sum": "Quick Sum"
    },
    insert: {
      tooltip: "Functions",
      common: "Common Functions"
    },
    prompt: {
      helpExample: "EXAMPLE",
      helpAbstract: "ABOUT",
      required: "Required.",
      optional: "Optional."
    },
    error: {
      title: "Error",
      divByZero: "Divide by zero error",
      name: "Invalid name error",
      value: "Error in value",
      num: "Number error",
      na: "Value not available error",
      cycle: "Circular reference error",
      ref: "Invalid cell reference error",
      spill: "Spill range isn't blank",
      calc: "Calculation error",
      error: "Error",
      connect: "Getting data",
      null: "Null Error"
    },
    functionType: {
      financial: "Financial",
      date: "Date & Time",
      math: "Math & Trig",
      statistical: "Statistical",
      lookup: "Lookup & Reference",
      database: "Database",
      text: "Text",
      logical: "Logical",
      information: "Information",
      engineering: "Engineering",
      cube: "Cube",
      compatibility: "Compatibility",
      web: "Web",
      array: "Array",
      univer: "Univer",
      user: "User Defined",
      definedname: "Defined Name"
    },
    moreFunctions: {
      confirm: "Confirm",
      prev: "Previous",
      next: "Next",
      searchFunctionPlaceholder: "Search function",
      allFunctions: "All Functions",
      syntax: "SYNTAX"
    },
    operation: {
      copyFormulaOnly: "Copy Formula Only",
      pasteFormula: "Paste Formula"
    },
    rangeSelector: {
      title: "Select a data range",
      addAnotherRange: "Add range",
      buttonTooltip: "Select data range",
      placeHolder: "Select range or enter.",
      confirm: "Confirm",
      cancel: "Cancel"
    }
  }
};
var en_US_default36 = locale20;

// ../packages/sheets-hyper-link/src/locale/en-US.ts
var locale21 = {
  "sheets-hyper-link": {
    message: {
      refError: "Invalid Range"
    }
  }
};
var en_US_default37 = locale21;

// ../packages/sheets-hyper-link-ui/src/locale/en-US.ts
var locale22 = {
  "sheets-hyper-link-ui": {
    form: {
      editTitle: "Edit Link",
      addTitle: "Insert Link",
      label: "Label",
      type: "Type",
      link: "Link",
      linkPlaceholder: "Enter link",
      range: "Range",
      worksheet: "Worksheet",
      definedName: "Defined Name",
      ok: "Confirm",
      cancel: "Cancel",
      labelPlaceholder: "Enter label",
      inputError: "Please enter",
      selectError: "Please select",
      linkError: "Please enter a legal link"
    },
    menu: {
      add: "Insert Link"
    },
    message: {
      noSheet: "Target sheet has been delete",
      refError: "Invalid Range",
      hiddenSheet: "Cannot open the link because the linked sheet is hidden",
      coped: "Link copied to clipboard"
    },
    popup: {
      copy: "Copy Link",
      edit: "Edit Link",
      cancel: "Cancel Link"
    }
  }
};
var en_US_default38 = locale22;

// ../packages/sheets-note-ui/src/locale/en-US.ts
var locale23 = {
  "sheets-note-ui": {
    note: {
      placeholder: "Type here"
    },
    rightClick: {
      addNote: "Add Note",
      deleteNote: "Delete Note",
      toggleNote: "Show/Hide Note"
    }
  }
};
var en_US_default39 = locale23;

// ../packages/sheets-numfmt-ui/src/locale/en-US.ts
var locale24 = {
  "sheets-numfmt-ui": {
    title: "Number format",
    numfmtType: "Format types",
    cancel: "Cancel",
    confirm: "Confirm",
    general: "General",
    accounting: "Accounting",
    text: "Text",
    number: "Number",
    percent: "Percentage",
    scientific: "Scientific",
    currency: "Currency",
    date: "Date",
    time: "Time",
    thousandthPercentile: "Thousands separator",
    preview: "Preview",
    dateTime: "Date and time",
    decimalLength: "Decimal places",
    currencyType: "Currency Symbol",
    moreFmt: "Formats",
    financialValue: "Financial value",
    roundingCurrency: "Rounding up the currency",
    timeDuration: "Duration Time",
    currencyDes: "The currency format is used to represent general currency values. The accounting format aligns a column of values with decimal points",
    accountingDes: "The accounting number format aligns a column of values with currency symbols and decimal points",
    dateType: "Date Type",
    dateDes: "The date format presents date and time series values as date values.",
    negType: "A negative number type",
    generalDes: "The regular format does not contain any specific number format.",
    thousandthPercentileDes: "The percentile format is used for the representation of ordinary numbers. Monetary and accounting formats provide a specialized format for monetary value calculations.",
    addDecimal: "Increase decimal places",
    subtractDecimal: "Decreasing decimal places",
    customFormat: "Custom Format",
    customFormatDes: "Generate custom number formats based on existing formats.",
    info: {
      error: "Error",
      forceStringInfo: "Number stored as text"
    }
  }
};
var en_US_default40 = locale24;

// ../packages/sheets-sort-ui/src/locale/en-US.ts
var locale25 = {
  "sheets-sort-ui": {
    general: {
      sort: "Sort",
      "sort-asc": "Ascending",
      "sort-desc": "Descending",
      "sort-custom": "Custom Sort",
      "sort-asc-ext": "Expand Ascending",
      "sort-desc-ext": "Expand Descending",
      "sort-asc-cur": "Ascending",
      "sort-desc-cur": "Descending"
    },
    error: {
      "merge-size": "The selected range contains merged cells of different sizes, which cannot be sorted.",
      empty: "The selected range has no content and cannot be sorted.",
      single: "The selected range has only one row and cannot be sorted.",
      "formula-array": "The selected range has array formulas and cannot be sorted."
    },
    dialog: {
      "sort-reminder": "Sort Reminder",
      "sort-reminder-desc": "Extend range sorting or keep range sorting?",
      "sort-reminder-ext": "Extend range sorting",
      "sort-reminder-no": "Keep range sorting",
      "first-row-check": "First row does not participate in sorting",
      "add-condition": "Add condition",
      cancel: "Cancel",
      confirm: "Confirm"
    },
    info: {
      tooltip: "Tooltip"
    }
  }
};
var en_US_default41 = locale25;

// ../packages/sheets-table/src/locale/en-US.ts
var locale26 = {
  "sheets-table": {
    columnPrefix: "Column",
    tablePrefix: "Table",
    tableNameError: "Table name cannot contain spaces, cannot start with a number, and cannot be identical to an existing table name"
  }
};
var en_US_default42 = locale26;

// ../packages/sheets-table-ui/src/locale/en-US.ts
var locale27 = {
  "sheets-table-ui": {
    title: "Table",
    selectRange: "Select Table Range",
    rename: "Rename Table",
    renamePlaceholder: "Enter table name",
    updateRange: "Update Table Range",
    tableRangeWithMergeError: "Table range cannot overlap with merged cells",
    tableRangeWithOtherTableError: "Table range cannot overlap with other tables",
    tableRangeSingleRowError: "Table range cannot be a single row",
    updateError: "Cannot set table range to an area that does not overlap with the original and is not in the same row",
    tableStyle: "Table Style",
    defaultStyle: "Default Style",
    customStyle: "Custom Style",
    customTooMore: "The number of custom themes exceeds the maximum limit, please delete some unnecessary themes and add them again",
    setTheme: "Set Table Theme",
    removeTable: "Remove Table",
    cancel: "Cancel",
    confirm: "Confirm",
    header: "Header",
    footer: "Footer",
    firstLine: "First Line",
    secondLine: "Second Line",
    columnPrefix: "Column",
    tablePrefix: "Table",
    tableNameError: "Table name cannot contain spaces, cannot start with a number, and cannot be identical to an existing table name",
    columnMenu: {
      "insert-left": "Insert 1 table column left",
      "insert-right": "Insert 1 table column right",
      delete: "Delete table column"
    },
    sort: {
      "sort-asc": "Ascending",
      "sort-desc": "Descending"
    },
    insert: {
      main: "Insert Table",
      row: "Insert Table Row",
      col: "Insert Table Column"
    },
    remove: {
      main: "Remove Table",
      row: "Remove Table Row",
      col: "Remove Table Column"
    },
    condition: {
      string: "Text",
      number: "Number",
      date: "Date",
      empty: "(Empty)"
    },
    string: {
      compare: {
        equal: "Equal to",
        notEqual: "Not equal to",
        contains: "Contains",
        notContains: "Does not contain",
        startsWith: "Starts with",
        endsWith: "Ends with"
      }
    },
    number: {
      compare: {
        equal: "Equal to",
        notEqual: "Not equal to",
        greaterThan: "Greater than",
        greaterThanOrEqual: "Greater than or equal to",
        lessThan: "Less than",
        lessThanOrEqual: "Less than or equal to",
        between: "Between",
        notBetween: "Not between",
        above: "Above",
        below: "Below",
        topN: "Top {0}"
      }
    },
    date: {
      compare: {
        equal: "Equal to",
        notEqual: "Not equal to",
        after: "After",
        afterOrEqual: "After or equal to",
        before: "Before",
        beforeOrEqual: "Before or equal to",
        between: "Between",
        notBetween: "Not between",
        today: "Today",
        yesterday: "Yesterday",
        tomorrow: "Tomorrow",
        thisWeek: "This week",
        lastWeek: "Last week",
        nextWeek: "Next week",
        thisMonth: "This month",
        lastMonth: "Last month",
        nextMonth: "Next month",
        thisQuarter: "This quarter",
        lastQuarter: "Last quarter",
        nextQuarter: "Next quarter",
        thisYear: "This year",
        nextYear: "Next year",
        lastYear: "Last year",
        quarter: "By quarter",
        month: "By month",
        q1: "First quarter",
        q2: "Second quarter",
        q3: "Third quarter",
        q4: "Fourth quarter",
        m1: "January",
        m2: "February",
        m3: "March",
        m4: "April",
        m5: "May",
        m6: "June",
        m7: "July",
        m8: "August",
        m9: "September",
        m10: "October",
        m11: "November",
        m12: "December"
      }
    },
    filter: {
      "by-values": "By Values",
      "by-conditions": "By Conditions",
      "clear-filter": "Clear Filter",
      cancel: "Cancel",
      confirm: "Confirm",
      "search-placeholder": "Use space to separate keywords",
      "select-all": "Select All"
    }
  }
};
var en_US_default43 = locale27;

// ../packages/sheets-thread-comment-ui/src/locale/en-US.ts
var locale28 = {
  "sheets-thread-comment-ui": {
    panel: {
      title: "Comment Management"
    },
    menu: {
      addComment: "Add Comment",
      commentManagement: "Comment Management"
    }
  }
};
var en_US_default44 = locale28;

// ../packages/sheets-ui/src/locale/en-US.ts
var locale29 = {
  "sheets-ui": {
    toolbar: {
      undo: "Undo",
      redo: "Redo",
      formatPainter: "Paint format",
      font: "Font",
      fontSize: "Font size",
      fontSizeIncrease: "Increase font size",
      fontSizeDecrease: "Decrease font size",
      bold: "Bold",
      italic: "Italic",
      strikethrough: "Strikethrough",
      subscript: "Subscript",
      superscript: "Superscript",
      underline: "Underline",
      textColor: {
        main: "Text color",
        right: "Choose color"
      },
      resetColor: "Reset",
      fillColor: {
        main: "Fill color",
        right: "Choose color"
      },
      border: {
        main: "Border",
        right: "Border style"
      },
      mergeCell: {
        main: "Merge cells",
        right: "Choose merge type"
      },
      horizontalAlignMode: {
        main: "Horizontal align",
        right: "Alignment"
      },
      verticalAlignMode: {
        main: "Vertical align",
        right: "Alignment"
      },
      textWrapMode: {
        main: "Text wrap",
        right: "Text wrap mode"
      },
      textRotateMode: {
        main: "Text rotate",
        right: "Text rotate mode"
      },
      more: "More",
      toggleGridlines: "Toggle Gridlines",
      textToNumber: "Text to Number"
    },
    align: {
      left: "left",
      center: "center",
      right: "right",
      top: "top",
      middle: "middle",
      bottom: "bottom"
    },
    button: {
      confirm: "OK",
      cancel: "Cancel",
      close: "Close",
      insert: "Insert",
      prevPage: "Previous",
      nextPage: "Next",
      total: "total:"
    },
    borderLine: {
      borderTop: "borderTop",
      borderBottom: "borderBottom",
      borderLeft: "borderLeft",
      borderRight: "borderRight",
      borderNone: "borderNone",
      borderAll: "borderAll",
      borderOutside: "borderOutside",
      borderInside: "borderInside",
      borderHorizontal: "borderHorizontal",
      borderVertical: "borderVertical",
      borderColor: "borderColor",
      borderSize: "borderSize",
      borderType: "borderType"
    },
    merge: {
      all: "Merge all",
      vertical: "Vertical merge",
      horizontal: "Horizontal merge",
      cancel: "Cancel merge",
      overlappingError: "Cannot merge overlapping areas",
      partiallyError: "Cannot perform this operation on partially merged cells"
    },
    filter: {},
    textWrap: {
      overflow: "Overflow",
      wrap: "Wrap",
      clip: "Clip"
    },
    textRotate: {
      none: "None",
      angleUp: "Tilt Up",
      angleDown: "Tilt Down",
      vertical: "Stack Vertically",
      rotationUp: "Rotate Up",
      rotationDown: "Rotate Down"
    },
    sheetConfig: {
      delete: "Delete",
      copy: "Copy",
      rename: "Rename",
      changeColor: "Change color",
      hide: "Hide",
      unhide: "Unhide",
      moveLeft: "Move left",
      moveRight: "Move right",
      resetColor: "Reset color",
      cancelText: "Cancel",
      chooseText: "Confirm color",
      tipNameRepeat: "The name of the tab page cannot be repeated! Please revise",
      noMoreSheet: "The workbook contains at least one visual worksheet. To delete the selected worksheet, please insert a new worksheet or show a hidden worksheet.",
      confirmDelete: "Are you sure to delete",
      redoDelete: "Can be undo by Ctrl+Z",
      noHide: "Can't hide, at least keep one sheet tag",
      chartEditNoOpt: "This operation is not allowed in chart editing mode!",
      sheetNameErrorTitle: "There was a problem",
      sheetNameSpecCharError: "The name cannot exceed 31 characters, cannot start or end with ', and cannot contain: [ ] : \\ ? * /",
      sheetNameCannotIsEmptyError: "The sheet name cannot be empty.",
      sheetNameAlreadyExistsError: "The sheet name already exists. Please enter another name.",
      deleteSheet: "Delete worksheet",
      deleteSheetContent: "Confirm to delete this worksheet?",
      deleteLargeSheetContent: "Confirm to delete this worksheet. It will not be retrieved after deletion. Are you sure you want to delete it?",
      addProtectSheet: "Protect Worksheet",
      removeProtectSheet: "Unprotect Worksheet",
      changeSheetPermission: "Change Worksheet Permissions",
      viewAllProtectArea: "View All Protection Ranges"
    },
    rightClick: {
      copy: "Copy",
      cut: "Cut",
      paste: "Paste",
      copySpecial: "Copy Special",
      pasteSpecial: "Paste Special",
      pasteValue: "Paste Value",
      pasteFormat: "Paste Format",
      pasteColWidth: "Paste Column Width",
      pasteBesidesBorder: "Paste Besides Border Styles",
      insert: "Insert",
      insertRow: "Insert Row",
      insertRowBefore: "Insert Row Before",
      insertRowsAfter: "Insert",
      insertRowsAbove: "Insert",
      insertRowsAfterSuffix: "rows after",
      insertRowsAboveSuffix: "rows above",
      insertColumn: "Insert Column",
      insertColumnBefore: "Insert Column Before",
      insertColsLeft: "Insert",
      insertColsRight: "Insert",
      insertColsLeftSuffix: "cols left",
      insertColsRightSuffix: "cols right",
      delete: "Delete",
      deleteCell: "Delete Cell",
      insertCell: "Insert Cell",
      deleteSelected: "Delete Selected ",
      hide: "Hide",
      hideSelected: "Hide Selected ",
      showHide: "Show Hidden",
      toTopAdd: "Towards Top Add",
      toBottomAdd: "Towards Bottom Add",
      toLeftAdd: "Towards Left Add",
      toRightAdd: "Towards Right Add",
      deleteSelectedRow: "Delete Selected Row",
      deleteSelectedColumn: "Delete Selected Column",
      hideSelectedRow: "Hide Selected Row",
      showHideRow: "Show Hide Row",
      rowHeight: "Row Height",
      hideSelectedColumn: "Hide Selected Column",
      showHideColumn: "Show Hide Column",
      columnWidth: "Column Width",
      moveLeft: "Move Left",
      moveUp: "Move Up",
      moveRight: "Move Right",
      moveDown: "Move Down",
      add: "Add",
      row: "Row",
      column: "Column",
      confirm: "Confirm",
      clearSelection: "Clear",
      clearContent: "Clear Contents",
      clearFormat: "Clear Formats",
      clearAll: "Clear All",
      root: "Root",
      log: "Log",
      delete0: "Delete 0 values at both ends",
      removeDuplicate: "Remove duplicate values",
      byRow: "By row",
      byCol: "By column",
      generateNewMatrix: "Generate new matrix",
      fitContent: "Fit for data",
      freeze: "Freeze",
      freezeCell: "Freeze to active cell ({0} row {1} column)",
      freezeCol: "Freeze to column {0}",
      freezeRow: "Freeze to row {0}",
      freezeFirstCol: "Freeze first column",
      freezeFirstRow: "Freeze first row",
      cancelFreeze: "Cancel freeze",
      deleteAllRowsAlert: "You can't delete all the rows on the sheet",
      deleteAllColumnsAlert: "You can't delete all the columns on the sheet",
      hideAllRowsAlert: "You can't hide all the rows on the sheet",
      hideAllColumnsAlert: "You can't hide all the columns on the sheet",
      protectRange: "Protect Rows And Columns",
      editProtectRange: "Set Protection Range",
      removeProtectRange: "Remove Protection Range",
      turnOnProtectRange: "Add Protection Range",
      viewAllProtectArea: "View All Protection Ranges",
      textToNumber: "Text to Number"
    },
    info: {
      notChangeMerge: "You cannot make partial changes to the merged cells",
      detailUpdate: "New opened",
      detailSave: "Local cache restored",
      row: "",
      column: "",
      loading: "Loading...",
      copy: "Copy",
      return: "Exit",
      rename: "Rename",
      tips: "Rename",
      noName: "Untitled spreadsheet",
      wait: "waiting for update",
      add: "Add",
      addLast: "more rows at bottom",
      backTop: "Back to the top",
      nextPage: "Next",
      tipInputNumber: "Please enter the number",
      tipInputNumberLimit: "The increase range is limited to 1-100",
      tipRowHeightLimit: "Row height must be between 0 ~ 545",
      tipColumnWidthLimit: "The column width must be between 0 ~ 2038",
      problem: "There was a problem"
    },
    clipboard: {
      paste: {
        exceedMaxCells: "The number of cells pasted exceeds the maximum number of cells",
        overlappingMergedCells: "The paste area overlaps with merged cells"
      },
      shortCutNotify: {
        title: "Kindly paste using keyboard shortcuts.",
        useShortCutInstead: "Detected Excel content. Use keyboard shortcut to paste."
      }
    },
    statusbar: {
      sum: "Sum",
      average: "Average",
      min: "Min",
      max: "Max",
      count: "Numerical Count",
      countA: "Count",
      clickToCopy: "Click to Copy",
      copied: "Copied"
    },
    shortcut: {
      "sheet-view": "Sheet View",
      "sheet-edit": "Sheet Edit",
      sheet: {
        "zoom-in": "Zoom in",
        "zoom-out": "Zoom out",
        "reset-zoom": "Reset zoom level",
        "select-below-cell": "Select the cell below",
        "select-up-cell": "Select the cell above",
        "select-left-cell": "Select the left cell",
        "select-right-cell": "Select the right cell",
        "select-next-cell": "Select the next cell",
        "select-previous-cell": "Select the previous cell",
        "select-up-value-cell": "Select the cell above that has value",
        "select-below-value-cell": "Select the cell below that has value",
        "select-left-value-cell": "Select the cell left that has value",
        "select-right-value-cell": "Select the cell right that has value",
        "expand-selection-down": "Expand selection down",
        "expand-selection-up": "Expand selection up",
        "expand-selection-left": "Expand selection left",
        "expand-selection-right": "Expand selection right",
        "expand-selection-to-left-gap": "Expand selection to the left gap",
        "expand-selection-to-below-gap": "Expand selection to the below gap",
        "expand-selection-to-right-gap": "Expand selection to the right gap",
        "expand-selection-to-up-gap": "Expand selection to the up gap",
        "select-all": "Select all",
        "toggle-editing": "Toggle editing",
        "delete-and-start-editing": "Clear and start editing",
        "abort-editing": "Abort editing",
        "break-line": "Break line",
        "set-bold": "Toggle bold",
        "start-editing": "Start Editing (Selection into the Editor)",
        "repeat-last-action": "Repeat last action",
        "set-italic": "Toggle italic",
        "set-underline": "Toggle underline",
        "set-strike-through": "Toggle strike through"
      }
    },
    definedName: {
      managerTitle: "Manager named",
      managerDescription: "Create a defined name by selecting cells or formulas, and entering the desired name into the text box.",
      addButton: "Add a defined name",
      featureTitle: "Defined names",
      ratioRange: "Range",
      ratioFormula: "Formula",
      confirm: "Confirm",
      cancel: "Cancel",
      scopeWorkbook: "Workbook",
      inputNamePlaceholder: "Please enter a name(No space allowed)",
      inputCommentPlaceholder: "Please enter a comment",
      inputRangePlaceholder: "Please input range(No space allowed)",
      inputFormulaPlaceholder: "Please input a formula(No space allowed)",
      formulaOrRefStringInvalid: "Invalid formula or reference string",
      defaultName: "DefinedName",
      updateButton: "Update",
      deleteButton: "Delete",
      deleteConfirmText: "Are you sure you want to delete this defined name?"
    },
    uploadLoading: {
      loading: "Loading..., remaining"
      // 正在上传，当前剩余
    },
    "data-validation": {
      alert: {
        ok: "OK"
      },
      list: {
        edit: "Edit",
        dropdown: "Select an item"
      },
      listMultiple: {
        dropdown: "Select items"
      }
    },
    permission: {
      toolbarMenu: "Protection",
      panel: {
        title: "Protect Rows and Columns",
        name: "Name",
        protectedRange: "Protected Range",
        permissionDirection: "Permission Description",
        permissionDirectionPlaceholder: "Enter permission description",
        editPermission: "Edit Permissions",
        onlyICanEdit: "Only I can edit",
        designedUserCanEdit: "Specified users can edit",
        viewPermission: "View Permissions",
        othersCanView: "Others can view",
        noOneElseCanView: "No one else can view",
        designedPerson: "Specified persons",
        addPerson: "Add person",
        canEdit: "Can edit",
        canView: "Can view",
        delete: "Delete",
        currentSheet: "Current sheet",
        allSheet: "All sheets",
        edit: "Edit",
        Print: "Print",
        Comment: "Comment",
        Copy: "Copy",
        SetCellStyle: "Set cell style",
        SetCellValue: "Set cell value",
        SetHyperLink: "Set hyperlink",
        Sort: "Sort",
        Filter: "Filter",
        PivotTable: "Pivot table",
        FloatImage: "Float image",
        RowHeightColWidth: "Row height and column width",
        RowHeightColWidthReadonly: "Read-only row height and column width",
        FilterReadonly: "Read-only filter",
        nameError: "Name cannot be empty",
        created: "Created",
        iCanEdit: "I can edit",
        iCanNotEdit: "I can't edit",
        iCanView: "I can view",
        iCanNotView: "I can't view",
        emptyRangeError: "Range cannot be empty",
        rangeOverlapError: "Range cannot overlap",
        rangeOverlapOverPermissionError: "Range cannot overlap with the range that has the same permission",
        InsertHyperlink: "Insert hyperlink",
        SetRowStyle: "Set row style",
        SetColumnStyle: "Set column style",
        InsertColumn: "Insert column",
        InsertRow: "Insert row",
        DeleteRow: "Delete row",
        DeleteColumn: "Delete column",
        EditExtraObject: "Edit extra object"
      },
      dialog: {
        allowUserToEdit: "Allow user to edit",
        allowedPermissionType: "Allowed permission types",
        setCellValue: "Set cell value",
        setCellStyle: "Set cell style",
        copy: "Copy",
        alert: "Alert",
        search: "Search",
        ownerInherit: "Document owner, enabled permission inheritance",
        ownerWithoutInherit: "Document owner, not enabled permission inheritance",
        alertContent: "This range has been protected and no editing permissions are currently available. If you need to edit, please contact the creator.",
        userEmpty: "no designated person , Share link to invite specific people.",
        listEmpty: "You haven't set up any ranges or sheets as protected.",
        commonErr: "The range is protected, and you do not have permission for this operation. To edit, please contact the creator.",
        editErr: "The range is protected, and you do not have edit permission. To edit, please contact the creator.",
        pasteErr: "The range is protected, and you do not have paste permission. To paste, please contact the creator.",
        setStyleErr: "The range is protected, and you do not have permission to set styles. To set styles, please contact the creator.",
        copyErr: "The range is protected, and you do not have copy permission. To copy, please contact the creator.",
        workbookCopyErr: "The workbook is protected, and you do not have permission to copy. To copy, please contact the creator.",
        setRowColStyleErr: "The range is protected, and you do not have permission to set row and column styles. To set row and column styles, please contact the creator.",
        moveRowColErr: "The range is protected, and you do not have permission to move rows and columns. To move rows and columns, please contact the creator.",
        moveRangeErr: "The range is protected, and you do not have permission to move the selection. To move the selection, please contact the creator.",
        insertRowColErr: "The range is protected, and you do not have permission to insert rows and columns. To insert rows and columns, please contact the creator.",
        removeRowColErr: "The range is protected, and you do not have permission to delete rows and columns. To delete rows and columns, please contact the creator.",
        autoFillErr: "The range is protected, and you do not have permission for auto-fill. To use auto-fill, please contact the creator.",
        filterErr: "The range is protected, and you do not have filtering permission. To filter, please contact the creator.",
        operatorSheetErr: "The worksheet is protected, and you do not have permission to operate the worksheet. To operate the worksheet, please contact the creator.",
        insertOrDeleteMoveRangeErr: "The inserted or deleted range intersects with the protected range, and this operation is not supported for now.",
        printErr: "The worksheet is protected, and you do not have permission to print. To print, please contact the creator.",
        formulaErr: "The range or the referenced range is protected, and you do not have edit permission. To edit, please contact the creator.",
        hyperLinkErr: "The range is protected, and you do not have permission to set hyperlinks. To set hyperlinks, please contact the creator.",
        commentErr: "The range is protected, and you do not have permission to comment. To comment, please contact the creator."
      },
      button: {
        confirm: "Confirm",
        cancel: "Cancel",
        addNewPermission: "Add new permission"
      }
    }
  }
};
var en_US_default45 = locale29;

// ../packages/sheets-zen-editor/src/locale/en-US.ts
var locale30 = {
  "sheets-zen-editor": {
    rightClick: {
      zenEditor: "Full Screen Editor"
    },
    shortcut: {
      sheet: {
        "zen-edit-cancel": "Cancel Zen Edit",
        "zen-edit-confirm": "Confirm Zen Edit"
      }
    }
  }
};
var en_US_default46 = locale30;

// ../packages/thread-comment-ui/src/locale/en-US.ts
var locale31 = {
  "thread-comment-ui": {
    panel: {
      title: "Comment Management",
      empty: "No comments yet",
      filterEmpty: "No match result",
      reset: "Reset Filter",
      addComment: "Add Comment",
      solved: "Solved"
    },
    editor: {
      placeholder: "Reply or add others with @",
      reply: "Comment",
      cancel: "Cancel",
      save: "Save"
    },
    item: {
      edit: "Edit",
      delete: "Delete This Comment"
    },
    filter: {
      sheet: {
        all: "All sheet",
        current: "Current sheet"
      },
      status: {
        all: "All comments",
        resolved: "Resolved",
        unsolved: "Not resolved",
        concernMe: "Concern me"
      }
    }
  }
};
var en_US_default47 = locale31;

// ../packages/ui/src/locale/en-US.ts
var locale32 = {
  ui: {
    toolbar: {
      heading: {
        normal: "Normal",
        title: "Title",
        subTitle: "Sub Title",
        1: "Heading 1",
        2: "Heading 2",
        3: "Heading 3",
        4: "Heading 4",
        5: "Heading 5",
        6: "Heading 6",
        tooltip: "Set Heading"
      }
    },
    ribbon: {
      start: "Start",
      startDesc: "Initiate the worksheet and set basic parameters.",
      insert: "Insert",
      insertDesc: "Insert rows, columns, charts and various other elements.",
      formulas: "Formulas",
      formulasDesc: "Use functions and formulas for data calculations.",
      data: "Data",
      dataDesc: "Manage data, including import, sorting and filtering.",
      view: "View",
      viewDesc: "Switch view modes and adjust the display effect.",
      others: "Others",
      othersDesc: "Other functions and settings.",
      more: "More"
    },
    fontFamily: {
      "not-supported": "No such font found in the system, using default font.",
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
      title: "Shortcuts"
    },
    shortcut: {
      undo: "Undo",
      redo: "Redo",
      cut: "Cut",
      copy: "Copy",
      paste: "Paste",
      "shortcut-panel": "Toggle Shortcut Panel"
    },
    "common-edit": "Common Editing Shortcuts",
    "toggle-shortcut-panel": "Toggle Shortcut Panel",
    clipboard: {
      authentication: {
        title: "Permission Denied",
        content: "Please allow Univer to access your clipboard."
      }
    },
    textEditor: {
      formulaError: "Please enter a valid formula, such as =SUM(A1)",
      rangeError: "Please enter a valid range, such as A1:B10"
    },
    rangeSelector: {
      title: "Select a data range",
      addAnotherRange: "Add range",
      buttonTooltip: "Select data range",
      placeHolder: "Select range or enter.",
      confirm: "Confirm",
      cancel: "Cancel"
    },
    "global-shortcut": "Global Shortcut",
    "zoom-slider": {
      resetTo: "Reset to"
    },
    row: "Row",
    column: "Column"
  }
};
var en_US_default48 = locale32;

// ../packages/uniscript/src/locale/en-US.ts
var locale33 = {
  uniscript: {
    title: "Uniscript",
    tooltip: {
      "menu-button": "Toggle Uniscript Panel"
    },
    panel: {
      execute: "Execute Script"
    },
    message: {
      success: "Execution Success",
      failed: "Execution Failed"
    }
  }
};
var en_US_default49 = locale33;

// ../common/mockdata/src/locales/en-US.ts
var en_US_default50 = mergeLocales(
  en_US_default17,
  en_US_default18,
  en_US_default19,
  en_US_default20,
  en_US_default21,
  en_US_default22,
  en_US_default23,
  en_US_default24,
  en_US_default25,
  en_US_default26,
  en_US_default27,
  en_US_default28,
  en_US_default29,
  en_US_default30,
  en_US_default31,
  en_US_default32,
  en_US_default33,
  en_US_default34,
  en_US_default35,
  en_US_default36,
  en_US_default37,
  en_US_default38,
  en_US_default39,
  en_US_default40,
  en_US_default41,
  en_US_default42,
  en_US_default43,
  en_US_default44,
  en_US_default45,
  en_US_default46,
  en_US_default,
  en_US_default47,
  en_US_default48,
  en_US_default49
);

export {
  en_US_default50 as en_US_default
};
