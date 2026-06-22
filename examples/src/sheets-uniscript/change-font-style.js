// eslint-disable-next-line no-undef
const activeSheet = univerAPI.getActiveWorkbook().getActiveSheet();

// Set A1:B2 to bold
activeSheet.getRange(0, 0, 2, 2).setFontWeight('bold');
// Set B2 to normal
activeSheet.getRange(1, 1, 1, 1).setFontWeight('normal');

setTimeout(() => {
    // reset A1 to normal
    activeSheet.getRange(0, 0, 1, 1).setFontWeight(null);
}, 3000);
