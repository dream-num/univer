import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';
import { getDocsUpdateBody } from '../../Shared/Common';
import { Nullable } from '../../Shared/Types';
import { ICustomBlock, ICustomRange, IDocumentBody, IParagraph, ISectionBreak, ITable, ITextRun } from '../../Types/Interfaces/IDocumentData';
import { DocumentModel } from '../Domain/DocumentModel';
import {
    deleteCustomBlocks,
    deleteCustomRanges,
    deleteParagraphs,
    deleteSectionBreaks,
    deleteTables,
    deleteTextRuns,
    insertCustomBlocks,
    insertParagraphs,
    insertTables,
    insertTextRuns,
} from './Common';

export function UpdateAttributeApply(
    document: DocumentModel,
    updateBody: Nullable<IDocumentBody>,
    textLength: number,
    currentIndex: number,
    coverType = UpdateDocsAttributeType.COVER,
    segmentId?: string
): IDocumentBody {
    if (updateBody == null) {
        return;
    }

    const doc = document.snapshot;

    const body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    return updateAttribute(body, updateBody, textLength, currentIndex, coverType);
}

function updateAttribute(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType): IDocumentBody {
    const removeTextRuns = updateTextRuns(body, updateBody, textLength, currentIndex, coverType);

    const removeParagraphs = updateParagraphs(body, updateBody, textLength, currentIndex, coverType);

    const removeSectionBreaks = updateSectionBreaks(body, updateBody, textLength, currentIndex, coverType);

    const removeCustomBlocks = updateCustomBlocks(body, updateBody, textLength, currentIndex, coverType);

    const removeTables = updateTables(body, updateBody, textLength, currentIndex, coverType);

    const removeCustomRanges = updateCustomRanges(body, updateBody, textLength, currentIndex, coverType);

    return {
        dataStream: '',
        textRuns: removeTextRuns,
        paragraphs: removeParagraphs,
        sectionBreaks: removeSectionBreaks,
        customBlocks: removeCustomBlocks,
        tables: removeTables,
        customRanges: removeCustomRanges,
    };
}

function updateTextRuns(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType) {
    const { textRuns } = body;

    const { textRuns: updateDataTextRuns } = updateBody;

    if (textRuns == null || updateDataTextRuns == null) {
        return;
    }

    const removeTextRuns = deleteTextRuns(body, textLength, currentIndex);
    if (coverType !== UpdateDocsAttributeType.REPLACE) {
        const newUpdateTextRun = coverTextRun(updateDataTextRuns, removeTextRuns, coverType);
        updateBody.textRuns = newUpdateTextRun;
    }
    insertTextRuns(body, updateBody, textLength, currentIndex);

    return removeTextRuns;
}

function coverTextRun(updateDataTextRuns: ITextRun[], removeTextRuns: ITextRun[], coverType: UpdateDocsAttributeType) {
    const newUpdateTextRun: ITextRun[] = [];
    for (const updateTextRun of updateDataTextRuns) {
        let { st: updateSt } = updateTextRun;
        const { ed: updateEd, ts: updateStyle } = updateTextRun;
        let splitUpdateTextRuns: ITextRun[] = [];
        for (const removeTextRun of removeTextRuns) {
            const { st: removeSt, ed: removeEd, ts: removeStyle, sId } = removeTextRun;
            let newTs;
            if (coverType === UpdateDocsAttributeType.COVER) {
                newTs = { ...removeStyle, ...updateStyle };
            } else {
                newTs = { ...updateStyle, ...removeStyle };
            }
            if (updateSt >= removeSt && updateEd <= removeEd) {
                splitUpdateTextRuns.push({
                    st: updateSt,
                    ed: updateEd,
                    ts: newTs,
                    sId,
                });
                continue;
            } else if (updateSt <= removeSt && updateEd >= removeEd) {
                if (updateSt <= removeSt - 1) {
                    splitUpdateTextRuns.push({
                        st: updateSt,
                        ed: removeSt - 1,
                        ts: newTs,
                        sId,
                    });
                }
                splitUpdateTextRuns.push({
                    st: removeSt,
                    ed: removeEd,
                    ts: newTs,
                    sId,
                });
                splitUpdateTextRuns.push({
                    st: removeEd + 1,
                    ed: updateEd,
                    ts: newTs,
                    sId,
                });

                updateSt = removeEd + 1;
            } else if (updateSt >= removeSt && updateSt <= removeEd) {
                splitUpdateTextRuns.push({
                    st: updateSt,
                    ed: removeEd,
                    ts: newTs,
                    sId,
                });
                splitUpdateTextRuns.push({
                    st: removeEd + 1,
                    ed: updateEd,
                    ts: newTs,
                    sId,
                });
                updateSt = removeEd + 1;
            } else if (updateEd >= removeSt && updateEd <= removeEd) {
                splitUpdateTextRuns.push({
                    st: removeSt,
                    ed: updateEd,
                    ts: newTs,
                    sId,
                });
            }
        }
        newUpdateTextRun.push(...splitUpdateTextRuns);
        splitUpdateTextRuns = [];
    }
    return newUpdateTextRun;
}

function updateParagraphs(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType) {
    const { paragraphs } = body;

    const { paragraphs: updateDataParagraphs } = updateBody;

    if (paragraphs == null || updateDataParagraphs == null) {
        return;
    }

    const removeParagraphs = deleteParagraphs(body, textLength, currentIndex, true);
    if (coverType !== UpdateDocsAttributeType.REPLACE) {
        const newUpdateParagraphs: IParagraph[] = [];
        for (const updateParagraph of updateDataParagraphs) {
            const { startIndex: updateStartIndex, paragraphStyle: updateParagraphStyle, bullet: updateBullet } = updateParagraph;
            let splitUpdateParagraphs: IParagraph[] = [];
            for (const removeParagraph of removeParagraphs) {
                const { startIndex: removeStartIndex, paragraphStyle: removeParagraphStyle, bullet: removeBullet } = removeParagraph;
                let newParagraphStyle;
                let newBullet;
                if (coverType === UpdateDocsAttributeType.COVER) {
                    newParagraphStyle = { ...removeParagraphStyle, ...updateParagraphStyle };
                    newBullet = { listId: '', nestingLevel: 0, textStyle: {}, ...removeBullet, ...updateBullet };
                } else {
                    newParagraphStyle = { ...updateParagraphStyle, ...removeParagraphStyle };
                    newBullet = { listId: '', nestingLevel: 0, textStyle: {}, ...updateBullet, ...removeBullet };
                }

                if (updateStartIndex === removeStartIndex) {
                    splitUpdateParagraphs.push({
                        startIndex: updateStartIndex,
                        paragraphStyle: newParagraphStyle,
                        bullet: newBullet,
                    });
                    break;
                }
            }
            newUpdateParagraphs.push(...splitUpdateParagraphs);
            splitUpdateParagraphs = [];
        }

        updateBody.paragraphs = newUpdateParagraphs;
    }
    insertParagraphs(body, updateBody, textLength, currentIndex);

    return removeParagraphs;
}

function updateSectionBreaks(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType) {
    const { sectionBreaks } = body;

    const { sectionBreaks: updateDataSectionBreaks } = updateBody;

    if (sectionBreaks == null || updateDataSectionBreaks == null) {
        return;
    }

    const removeSectionBreaks = deleteSectionBreaks(body, textLength, currentIndex);
    if (coverType !== UpdateDocsAttributeType.REPLACE) {
        const newUpdateSectionBreaks: ISectionBreak[] = [];
        for (const updateSectionBreak of updateDataSectionBreaks) {
            const { startIndex: updateStartIndex } = updateSectionBreak;
            let splitUpdateSectionBreaks: ISectionBreak[] = [];
            for (const removeSectionBreak of removeSectionBreaks) {
                const { startIndex: removeStartIndex } = removeSectionBreak;
                if (updateStartIndex === removeStartIndex) {
                    if (coverType === UpdateDocsAttributeType.COVER) {
                        splitUpdateSectionBreaks.push({
                            ...removeSectionBreak,
                            ...updateSectionBreak,
                        });
                    } else {
                        splitUpdateSectionBreaks.push({
                            ...updateSectionBreak,
                            ...removeSectionBreak,
                        });
                    }
                    break;
                }
            }
            newUpdateSectionBreaks.push(...splitUpdateSectionBreaks);
            splitUpdateSectionBreaks = [];
        }
        updateBody.sectionBreaks = newUpdateSectionBreaks;
    }
    insertParagraphs(body, updateBody, textLength, currentIndex);

    return removeSectionBreaks;
}

function updateCustomBlocks(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType) {
    const { customBlocks } = body;

    const { customBlocks: updateDataCustomBlocks } = updateBody;

    if (customBlocks == null || updateDataCustomBlocks == null) {
        return;
    }

    const removeCustomBlocks = deleteCustomBlocks(body, textLength, currentIndex);
    if (coverType !== UpdateDocsAttributeType.REPLACE) {
        const newUpdateCustomBlocks: ICustomBlock[] = [];
        for (const updateCustomBlock of updateDataCustomBlocks) {
            const { startIndex: updateStartIndex } = updateCustomBlock;
            let splitUpdateCustomBlocks: ICustomBlock[] = [];
            for (const removeCustomBlock of removeCustomBlocks) {
                const { startIndex: removeStartIndex } = removeCustomBlock;
                if (updateStartIndex === removeStartIndex) {
                    if (coverType === UpdateDocsAttributeType.COVER) {
                        splitUpdateCustomBlocks.push({
                            ...removeCustomBlock,
                            ...updateCustomBlock,
                        });
                    } else {
                        splitUpdateCustomBlocks.push({
                            ...updateCustomBlock,
                            ...removeCustomBlock,
                        });
                    }
                    break;
                }
            }
            newUpdateCustomBlocks.push(...splitUpdateCustomBlocks);
            splitUpdateCustomBlocks = [];
        }
        updateBody.customBlocks = newUpdateCustomBlocks;
    }
    insertCustomBlocks(body, updateBody, textLength, currentIndex);

    return removeCustomBlocks;
}

function updateTables(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType) {
    const { tables } = body;

    const { tables: updateDataTables } = updateBody;

    if (tables == null || updateDataTables == null) {
        return;
    }

    const removeTables = deleteTables(body, textLength, currentIndex);
    if (coverType !== UpdateDocsAttributeType.REPLACE) {
        const newUpdateTables: ITable[] = [];
        for (const updateTable of updateDataTables) {
            const { startIndex: updateStartIndex, endIndex: updateEndIndex } = updateTable;
            let splitUpdateTables: ITable[] = [];
            for (const removeTable of removeTables) {
                const { startIndex: removeStartIndex, endIndex: removeEndIndex } = removeTable;
                if (removeStartIndex >= updateStartIndex && removeEndIndex <= updateEndIndex) {
                    if (coverType === UpdateDocsAttributeType.COVER) {
                        splitUpdateTables.push({
                            ...removeTable,
                            ...updateTable,
                        });
                    } else {
                        splitUpdateTables.push({
                            ...updateTable,
                            ...removeTable,
                        });
                    }
                    break;
                }
            }
            newUpdateTables.push(...splitUpdateTables);
            splitUpdateTables = [];
        }
        updateBody.tables = newUpdateTables;
    }
    insertTables(body, updateBody, textLength, currentIndex);

    return removeTables;
}

function updateCustomRanges(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType) {
    const { customRanges } = body;

    const { tables: updateDataCustomRanges } = updateBody;

    if (customRanges == null || updateDataCustomRanges == null) {
        return;
    }

    const removeCustomRanges = deleteCustomRanges(body, textLength, currentIndex);
    if (coverType !== UpdateDocsAttributeType.REPLACE) {
        const newUpdateCustomRanges: ICustomRange[] = [];
        for (const updateCustomRange of updateDataCustomRanges) {
            const { startIndex: updateStartIndex, endIndex: updateEndIndex } = updateCustomRange;
            let splitUpdateCustomRanges: ICustomRange[] = [];
            for (const removeCustomRange of removeCustomRanges) {
                const { startIndex: removeStartIndex, endIndex: removeEndIndex } = removeCustomRange;
                if (removeStartIndex >= updateStartIndex && removeEndIndex <= updateEndIndex) {
                    if (coverType === UpdateDocsAttributeType.COVER) {
                        splitUpdateCustomRanges.push({
                            ...removeCustomRange,
                            ...updateCustomRange,
                        });
                    } else {
                        splitUpdateCustomRanges.push({
                            ...updateCustomRange,
                            ...removeCustomRange,
                        });
                    }
                    break;
                }
            }
            newUpdateCustomRanges.push(...splitUpdateCustomRanges);
            splitUpdateCustomRanges = [];
        }
        updateBody.customRanges = newUpdateCustomRanges;
    }
    insertTables(body, updateBody, textLength, currentIndex);

    return removeCustomRanges;
}
