import { IBorderData, IStyleData, IWorksheetConfig } from '../../Types/Interfaces';

export function border(newSheet: Partial<IWorksheetConfig>, sheet: any) {
    newSheet.cellData = {};
    for (const borderInfo of sheet.config.borderInfo) {
        if (borderInfo.rangeType === 'cell') {
            const rowIndex = borderInfo.value.row_index;
            const colIndex = borderInfo.value.col_index;

            if (!newSheet.cellData[rowIndex]) {
                newSheet.cellData[rowIndex] = {};
            }

            if (!newSheet.cellData[rowIndex][colIndex]) {
                newSheet.cellData[rowIndex][colIndex] = {};
            }

            if (!newSheet.cellData[rowIndex][colIndex].s) {
                newSheet.cellData[rowIndex][colIndex].s = {};
            }

            const newBorder: IBorderData = {};

            if (borderInfo.value.l) {
                newBorder.l = {
                    s: borderInfo.value.l.style,
                    cl: {
                        rgb: borderInfo.value.l.color,
                    },
                };

                if (
                    newSheet.cellData[rowIndex] &&
                    (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.r
                ) {
                    delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.r;
                }
            }
            if (borderInfo.value.r) {
                newBorder.r = {
                    s: borderInfo.value.r.style,
                    cl: {
                        rgb: borderInfo.value.r.color,
                    },
                };

                if (
                    newSheet.cellData[rowIndex] &&
                    (newSheet.cellData[rowIndex][Number(colIndex) + 1]?.s as IStyleData)?.bd?.l
                ) {
                    delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.l;
                }
            }
            if (borderInfo.value.t) {
                newBorder.t = {
                    s: borderInfo.value.t.style,
                    cl: {
                        rgb: borderInfo.value.t.color,
                    },
                };

                if (
                    newSheet.cellData[rowIndex - 1] &&
                    (newSheet.cellData[rowIndex][colIndex]?.s as IStyleData)?.bd?.b
                ) {
                    delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.b;
                }
            }
            if (borderInfo.value.b) {
                newBorder.b = {
                    s: borderInfo.value.b.style,
                    cl: {
                        rgb: borderInfo.value.b.color,
                    },
                };

                if (
                    newSheet.cellData[Number(rowIndex) + 1] &&
                    (newSheet.cellData[rowIndex][colIndex]?.s as IStyleData)?.bd?.t
                ) {
                    delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.t;
                }
            }

            (newSheet.cellData[rowIndex][colIndex].s as IStyleData).bd = Object.assign(
                (newSheet.cellData[rowIndex][colIndex].s as IStyleData).bd || {},
                newBorder
            );
        } else if (borderInfo.rangeType === 'range') {
            for (const range of borderInfo.range) {
                const startRow = range.row[0];
                const endRow = range.row[1];
                const startColumn = range.column[0];
                const endColumn = range.column[1];

                switch (borderInfo.borderType) {
                    case 'border-left':
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c < startColumn + 1; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                newBorder.l = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign(
                                    (newSheet.cellData[r][c].s as IStyleData).bd || {},
                                    newBorder
                                );
                            }
                        }

                        // 去除 左侧单元格的右边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn - 1; c < startColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                                    delete (newSheet.cellData[r][c].s as IStyleData)?.bd?.r;
                                }
                            }
                        }

                        break;
                    case 'border-right':
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = endColumn; c < endColumn + 1; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                newBorder.r = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign(
                                    (newSheet.cellData[r][c].s as IStyleData).bd || {},
                                    newBorder
                                );
                            }
                        }

                        // 去除 右侧单元格的左边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = endColumn + 1; c < endColumn + 2; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.l;
                                }
                            }
                        }

                        break;
                    case 'border-top':
                        for (let r = startRow; r < startRow + 1; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                newBorder.t = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign(
                                    (newSheet.cellData[r][c].s as IStyleData).bd || {},
                                    newBorder
                                );
                            }
                        }

                        // 去除 上侧单元格的下边框
                        for (let r = startRow - 1; r < startRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.b;
                                }
                            }
                        }

                        break;
                    case 'border-bottom':
                        for (let r = endRow; r < endRow + 1; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                newBorder.b = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign(
                                    (newSheet.cellData[r][c].s as IStyleData).bd || {},
                                    newBorder
                                );
                            }
                        }

                        // 去除 下侧单元格的上边框
                        for (let r = endRow + 1; r < endRow + 2; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.t;
                                }
                            }
                        }

                        break;
                    case 'border-all':
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                // 所有单元格都有左上边框，最后一列补 右边框，最后一行补 下边框
                                newBorder.l = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                newBorder.t = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                if (c === endColumn) {
                                    newBorder.r = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                }

                                if (r === endRow) {
                                    newBorder.b = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                }

                                (newSheet.cellData[r][c].s as IStyleData).bd = newBorder;
                            }
                        }

                        // 去除 左侧单元格的右边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn - 1; c < startColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.r;
                                }
                            }
                        }

                        // 去除 右侧单元格的左边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = endColumn + 1; c < endColumn + 2; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.l;
                                }
                            }
                        }

                        // 去除 上侧单元格的下边框
                        for (let r = startRow - 1; r < startRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.b;
                                }
                            }
                        }

                        // 去除 下侧单元格的上边框
                        for (let r = endRow + 1; r < endRow + 2; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.t;
                                }
                            }
                        }

                        break;
                    case 'border-outside':
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                // 第一行
                                if (r === startRow) {
                                    newBorder.t = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                }
                                // 最后一行
                                if (r === endRow) {
                                    newBorder.b = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                }
                                // 第一列
                                if (c === startColumn) {
                                    newBorder.l = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                }
                                // 最后一列
                                if (c === endColumn) {
                                    newBorder.r = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                }

                                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign(
                                    (newSheet.cellData[r][c].s as IStyleData).bd || {},
                                    newBorder
                                );
                            }
                        }

                        // 去除 左侧单元格的右边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn - 1; c < startColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.r;
                                }
                            }
                        }

                        // 去除 右侧单元格的左边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = endColumn + 1; c < endColumn + 2; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.l;
                                }
                            }
                        }

                        // 去除 上侧单元格的下边框
                        for (let r = startRow - 1; r < startRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.b;
                                }
                            }
                        }

                        // 去除 下侧单元格的上边框
                        for (let r = endRow + 1; r < endRow + 2; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.t;
                                }
                            }
                        }

                        break;
                    case 'border-inside':
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                // 第一行第一列 没有样式
                                // 第一行 左边框
                                // 第一列 上边框
                                // 其他 左上边框
                                if (r === startRow && c === startColumn) {
                                    continue;
                                }

                                if (r === startRow) {
                                    newBorder.l = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                } else if (c === startColumn) {
                                    newBorder.t = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                } else {
                                    newBorder.l = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };

                                    newBorder.t = {
                                        s: borderInfo.style,
                                        cl: {
                                            rgb: borderInfo.color,
                                        },
                                    };
                                }

                                (newSheet.cellData[r][c].s as IStyleData).bd = newBorder;
                            }
                        }

                        break;
                    case 'border-horizontal':
                        for (let r = startRow; r < endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                newBorder.b = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign(
                                    (newSheet.cellData[r][c].s as IStyleData).bd || {},
                                    newBorder
                                );
                            }
                        }

                        // 去除 第二行开始的上边框
                        for (let r = startRow + 1; r <= endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.t;
                                }
                            }
                        }

                        break;
                    case 'border-vertical':
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c < endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    newSheet.cellData[r] = {};
                                }

                                if (!newSheet.cellData[r][c]) {
                                    newSheet.cellData[r][c] = {};
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    newSheet.cellData[r][c].s = {};
                                }

                                const newBorder: IBorderData = {};

                                newBorder.r = {
                                    s: borderInfo.style,
                                    cl: {
                                        rgb: borderInfo.color,
                                    },
                                };

                                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign(
                                    (newSheet.cellData[r][c].s as IStyleData).bd || {},
                                    newBorder
                                );
                            }
                        }

                        // 去除 第二列开始的左边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn + 1; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.l;
                                }
                            }
                        }

                        break;
                    case 'border-none':
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (!newSheet.cellData[r]) {
                                    continue;
                                }

                                if (!newSheet.cellData[r][c]) {
                                    continue;
                                }

                                if (!newSheet.cellData[r][c].s) {
                                    continue;
                                }

                                // 置空
                                const newBorder: IBorderData = {};

                                (newSheet.cellData[r][c].s as IStyleData).bd = newBorder;
                            }
                        }

                        // 去除 左侧单元格的右边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn - 1; c < startColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.r;
                                }
                            }
                        }

                        // 去除 右侧单元格的左边框
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = endColumn + 1; c < endColumn + 2; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.l;
                                }
                            }
                        }

                        // 去除 上侧单元格的下边框
                        for (let r = startRow - 1; r < startRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.b;
                                }
                            }
                        }

                        // 去除 下侧单元格的上边框
                        for (let r = endRow + 1; r < endRow + 2; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                                    delete (newSheet.cellData[r][c].s as IStyleData).bd?.t;
                                }
                            }
                        }

                        break;

                    default:
                        break;
                }
            }
        }
    }
}
