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

import type {
    DocumentDataModel,
    IAccessor,
    IDocDrawingBase,
    IDocumentBody,
    ITransformState,
    JSONXActions,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import {
    DrawingTypeEnum,
    getRichTextEditPath,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    TextX,
    TextXActionType,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { collectDocDrawings } from '@univerjs/docs-drawing';

function findAnchor(model: DocumentDataModel, drawingId: string): { segmentId: string; index: number } | undefined {
    const snapshot = model.getSnapshot();
    const bodies: Array<[string, IDocumentBody | undefined]> = [
        ['', snapshot.body],
        ...Object.entries(snapshot.headers ?? {}).map(([id, header]): [string, IDocumentBody] => [id, header.body]),
        ...Object.entries(snapshot.footers ?? {}).map(([id, footer]): [string, IDocumentBody] => [id, footer.body]),
        ...Object.entries(snapshot.notes ?? {}).map(([id, note]): [string, IDocumentBody] => [id, note.body]),
    ];
    for (const [segmentId, body] of bodies) {
        const block = body?.customBlocks?.find((block) => block.blockId === drawingId);
        if (block) {
            return { segmentId, index: block.startIndex };
        }
    }
}

function docTransformFromScene(
    transform: ITransformState,
    reference: IDocDrawingBase,
    referenceTransform: ITransformState
): IDocDrawingBase['docTransform'] {
    const { positionH, positionV } = reference.docTransform;
    return {
        size: { width: transform.width ?? 0, height: transform.height ?? 0 },
        positionH: {
            relativeFrom: positionH.relativeFrom,
            posOffset: (positionH.posOffset ?? 0) + (transform.left ?? 0) - (referenceTransform.left ?? 0),
        },
        positionV: {
            relativeFrom: positionV.relativeFrom,
            posOffset: (positionV.posOffset ?? 0) + (transform.top ?? 0) - (referenceTransform.top ?? 0),
        },
        angle: transform.angle ?? 0,
        flipX: transform.flipX,
        flipY: transform.flipY,
    };
}

interface IGroupChanges {
    changes: Map<string, IDocDrawingBase | undefined>;
    replacements: Map<number, string[]>;
}

type IDrawingAnchors = Array<{ segmentId: string; index: number }>;

function ungroupDrawings(
    { parent, children }: IDrawingGroupUpdateParam,
    drawings: Record<string, IDocDrawingBase>,
    anchors: IDrawingAnchors,
    { changes, replacements }: IGroupChanges
): boolean {
    const anchor = anchors[0];
    const group = drawings[parent.drawingId];
    const childIds = new Set(children.map((child) => child.drawingId));
    if (!group || group.groupId || group.drawingType !== DrawingTypeEnum.DRAWING_GROUP ||
        Object.values(drawings).some((drawing) => drawing.groupId === parent.drawingId && !childIds.has(drawing.drawingId))) {
        return false;
    }
    replacements.set(anchor.index, children.map((child) => child.drawingId));
    changes.set(parent.drawingId, undefined);
    for (const child of children) {
        if (!child.transform || drawings[child.drawingId].groupId !== parent.drawingId) {
            return false;
        }
        const drawing = { ...drawings[child.drawingId] };
        delete drawing.groupId;
        drawing.layoutType = PositionedObjectLayoutType.WRAP_NONE;
        drawing.behindDoc = group.behindDoc;
        drawing.docTransform = docTransformFromScene(child.transform, group, parent.transform!);
        changes.set(child.drawingId, drawing);
    }
    return true;
}

function groupDrawings(
    { parent, children }: IDrawingGroupUpdateParam,
    drawings: Record<string, IDocDrawingBase>,
    anchors: IDrawingAnchors,
    { changes, replacements }: IGroupChanges
): boolean {
    if (children.length < 2 || drawings[parent.drawingId] || children.some((child) => drawings[child.drawingId].groupId || !child.transform)) {
        return false;
    }
    const firstIndex = Math.min(...anchors.map((item) => item!.index));
    const firstChild = children[anchors.findIndex((item) => item!.index === firstIndex)];
    const reference = drawings[firstChild.drawingId];
    const transform = parent.transform!;
    const group: IDocDrawingBase = {
        ...parent,
        drawingType: DrawingTypeEnum.DRAWING_GROUP,
        layoutType: reference.layoutType,
        behindDoc: reference.behindDoc,
        layoutInCell: reference.layoutInCell,
        allowOverlap: reference.allowOverlap,
        wrapText: reference.wrapText,
        distL: reference.distL,
        distR: reference.distR,
        distT: reference.distT,
        distB: reference.distB,
        docTransform: docTransformFromScene(transform, reference, firstChild.transform!),
        groupBaseBound: { left: 0, top: 0, width: transform.width ?? 0, height: transform.height ?? 0 },
    };
    changes.set(parent.drawingId, group);
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        replacements.set(anchors[index]!.index, anchors[index]!.index === firstIndex ? [parent.drawingId] : []);
        const localTransform = docTransformFromScene(child.transform!, group, transform);
        localTransform.positionH = { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: (child.transform!.left ?? 0) - (transform.left ?? 0) };
        localTransform.positionV = { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: (child.transform!.top ?? 0) - (transform.top ?? 0) };
        changes.set(child.drawingId, { ...drawings[child.drawingId], groupId: parent.drawingId, docTransform: localTransform });
    }
    return true;
}

function buildDrawingChanges(
    drawings: Record<string, IDocDrawingBase>,
    prefix: string[],
    changes: IGroupChanges['changes']
): JSONXActions[] {
    const jsonX = JSONX.getInstance();
    const actions: JSONXActions[] = [];
    for (const [id, drawing] of changes) {
        const previous = drawings[id];
        const path = [...prefix, 'drawings', id];
        if (!drawing) {
            actions.push(jsonX.removeOp(path, previous)!);
        } else if (!previous) {
            actions.push(jsonX.insertOp(path, drawing)!);
        } else {
            for (const key of ['groupId', 'docTransform', 'layoutType', 'behindDoc'] as const) {
                if (drawing[key] === previous[key]) {
                    continue;
                }
                if (drawing[key] === undefined) {
                    actions.push(jsonX.removeOp([...path, key], previous[key])!);
                } else if (previous[key] === undefined) {
                    actions.push(jsonX.insertOp([...path, key], drawing[key])!);
                } else {
                    actions.push(jsonX.replaceOp([...path, key], previous[key], drawing[key])!);
                }
            }
        }
    }
    return actions;
}

function buildGroupActions(
    model: DocumentDataModel,
    segmentId: string,
    params: IDrawingGroupUpdateParam[],
    ungroup: boolean,
    { changes, replacements }: IGroupChanges
): JSONXActions[] {
    const snapshot = model.getSnapshot();
    const { drawings } = collectDocDrawings(snapshot);
    const source = snapshot.notes?.[segmentId!] ?? snapshot;
    const prefix = snapshot.notes?.[segmentId!] ? ['notes', segmentId!] : [];
    const textX = new TextX();
    let cursor = 0;
    for (const [index, ids] of [...replacements].sort(([left], [right]) => left - right)) {
        if (index > cursor) {
            textX.push({ t: TextXActionType.RETAIN, len: index - cursor });
        }
        textX.push({ t: TextXActionType.DELETE, len: 1 });
        if (ids.length > 0) {
            textX.push({
                t: TextXActionType.INSERT,
                len: ids.length,
                body: { dataStream: '\b'.repeat(ids.length), customBlocks: ids.map((blockId, startIndex) => ({ blockId, startIndex })) },
            });
        }
        cursor = index + 1;
    }
    const jsonX = JSONX.getInstance();
    const actions: JSONXActions[] = [jsonX.editOp(textX.serialize(), getRichTextEditPath(model, segmentId))!];
    actions.push(...buildDrawingChanges(drawings, prefix, changes));
    const previousOrder = source.drawingsOrder ?? Object.keys(source.drawings ?? {});
    const order = previousOrder.filter((id) => !changes.has(id) || changes.get(id));
    for (const { parent, children } of params) {
        if (!ungroup) {
            order.splice(Math.max(0, order.indexOf(children[0].drawingId)), 0, parent.drawingId);
        }
    }
    actions.push(source.drawingsOrder
        ? jsonX.replaceOp([...prefix, 'drawingsOrder'], previousOrder, order)!
        : jsonX.insertOp([...prefix, 'drawingsOrder'], order)!);
    return actions;
}

/** Change drawing ownership and its text anchors in one undoable document mutation. */
export function changeDocDrawingGroups(
    accessor: IAccessor,
    params: IDrawingGroupUpdateParam[] | undefined,
    ungroup: boolean
): boolean {
    if (!params?.length) {
        return false;
    }
    const unitId = params[0].parent.unitId;
    const model = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
    if (!model || params.some(({ parent, children }) => parent.unitId !== unitId || children.some((child) => child.unitId !== unitId))) {
        return false;
    }
    const snapshot = model.getSnapshot();
    const { drawings } = collectDocDrawings(snapshot);
    const changes = new Map<string, IDocDrawingBase | undefined>();
    const replacements = new Map<number, string[]>();
    let segmentId: string | undefined;
    for (const { parent, children } of params) {
        const anchors = (ungroup ? [parent] : children).map(({ drawingId }) => findAnchor(model, drawingId));
        if (!children.length || anchors.some((anchor) => !anchor) || !parent.transform) {
            return false;
        }
        const anchor = anchors[0]!;
        segmentId ??= anchor.segmentId;
        if (anchors.some((item) => item!.segmentId !== segmentId) || children.some((child) => !drawings[child.drawingId] || changes.has(child.drawingId))) {
            return false;
        }
        const planned = ungroup
            ? ungroupDrawings({ parent, children }, drawings, anchors as IDrawingAnchors, { changes, replacements })
            : groupDrawings({ parent, children }, drawings, anchors as IDrawingAnchors, { changes, replacements });
        if (!planned) {
            return false;
        }
    }

    const actions = buildGroupActions(model, segmentId!, params, ungroup, { changes, replacements });
    return Boolean(accessor.get(ICommandService).syncExecuteCommand<IRichTextEditingMutationParams>(RichTextEditingMutation.id, {
        unitId,
        segmentId,
        actions: actions.reduce((result, action) => JSONX.compose(result, action), null as JSONXActions),
        textRanges: [],
    }));
}
