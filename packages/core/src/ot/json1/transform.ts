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

// Adapted from ot-json1 1.0.2 (Joseph Gentle). See THIRD_PARTY_NOTICES.txt.

import type { IJSON1Component, IJSON1Conflict, JSON1Document, JSONXActions } from './json1';
import type { OperationList } from './snapshot';
import { compose } from './compose';
import { JSON1ReadCursor, JSON1WriteCursor } from './cursor';
import { advancer } from './navigation';
import {
    checkValidOp,
    editOp,
    getEdit,
    getEditType,
    insertOp,
    moveOp,
    normalize,
    removeOp,
    writeEdit,
} from './operation';
import { assert, deepClone, deepEqual, getComponent, hasDrop, hasPick } from './snapshot';

export enum ConflictType {
    RM_UNEXPECTED_CONTENT = 1,
    DROP_COLLISION = 2,
    BLACKHOLE = 3,
}

const LEFT = 0;
const RIGHT = 1;

const shallowCloneOp = (op: JSONXActions) => {
    if (op == null) {
        return null;
    }
    const result = op.slice();
    for (let i = 0; i < op.length; i++) {
        const c = result[i];
        if (Array.isArray(c)) {
            result[i] = shallowCloneOp(c) as OperationList;
        }
    }
    return result;
};

// Rebase the first operation against the second. A conflict carries the conflicting slices from both operands.
function tryTransform(
    op1: JSONXActions,
    op2: JSONXActions,
    direction: 'left' | 'right'
):
    | {
        ok: true;
        result: JSONXActions;
    }
    | {
        ok: false;
        conflict: IJSON1Conflict;
    } {
    assert(direction === 'left' || direction === 'right', 'Direction must be left or right');
    const side = direction === 'left' ? LEFT : RIGHT;
    if (op2 == null) {
        return { ok: true, result: op1 };
    }
    checkValidOp(op1);
    checkValidOp(op2);
    let conflict: null | IJSON1Conflict = null;
    type SparseRCList = (JSON1ReadCursor | null)[];
    const heldOp1PickByOp1: JSON1ReadCursor[] = [];
    const heldOp1DropByOp1: SparseRCList = [];
    const heldOp2PickByOp2: SparseRCList = [];
    const heldOp2DropByOp2: SparseRCList = [];
    const heldOp1PickByOp2: SparseRCList = [];
    const heldOp2PickByOp1: SparseRCList = [];
    const heldOp2DropByOp1: JSON1ReadCursor[] = [];
    const heldOp2RmForOp1: SparseRCList = [];
    const heldOp1RmForOp2: SparseRCList = [];
    const cancelledOp2: (true | undefined)[] = [];
    const discardedOp2Drop: (true | undefined)[] = [];
    const heldPickWrites: JSON1WriteCursor[] = [];
    const heldDropWrites: JSON1WriteCursor[] = [];
    const op1PickAtOp2Pick: number[] = [];
    const op1PicksOp2DropSlots: number[][] = [];
    let nextSlot = 0;
    const r1 = new JSON1ReadCursor(op1);
    const r2 = new JSON1ReadCursor(op2);
    const w = new JSON1WriteCursor();
    // Index the peer’s picks in the original snapshot so descendants can follow a moved ancestor.
    function scanOp2Pick(
        r2Pick: JSON1ReadCursor,
        r1Pick: JSON1ReadCursor | null = null,
        removed1: JSON1ReadCursor | null
    ) {
        const c1 = getComponent(r1Pick);
        if (c1) {
            if (c1.r !== undefined) {
                removed1 = r1Pick!.clone();
            } else if (c1.p != null) {
                removed1 = null;
                heldOp2PickByOp1[c1.p] = r2Pick.clone();
            }
        }
        const c2 = r2Pick.getComponent();
        let slot2;
        if (c2 && (slot2 = c2.p) != null) {
            heldOp1PickByOp2[slot2] = r1Pick ? r1Pick.clone() : null;
            heldOp2PickByOp2[slot2] = r2Pick.clone();
            if (removed1) {
                cancelledOp2[slot2] = true;
                heldOp1RmForOp2[slot2] = removed1;
            }
            if (c1 && c1.p != null) {
                op1PickAtOp2Pick[slot2] = c1.p;
            }
        }
        const ap1 = advancer(r1Pick);
        for (const key of r2Pick) {
            scanOp2Pick(r2Pick, ap1(key), removed1);
        }
        ap1.end();
    }
    scanOp2Pick(r2, r1, null);
    // Locate the peer’s drop destinations and detect moves into a deleted ancestor.
    function scanOp2Drop(
        r1Pick: JSON1ReadCursor | null,
        r2Pick: JSON1ReadCursor | null,
        r2Drop: JSON1ReadCursor,
        pickSlot1: number | null,
        removed1: JSON1ReadCursor | null
    ) {
        const c2d = r2Drop.getComponent();
        let droppedHere = false;
        let slot2;
        if (c2d) {
            if ((slot2 = c2d.d) != null) {
                heldOp2DropByOp2[slot2] = r2Drop.clone();
                if (pickSlot1 != null) {
                    if (op1PicksOp2DropSlots[pickSlot1] == null) {
                        op1PicksOp2DropSlots[pickSlot1] = [];
                    }
                    op1PicksOp2DropSlots[pickSlot1].push(slot2);
                }
                r1Pick = heldOp1PickByOp2[slot2] || null;
                r2Pick = heldOp2PickByOp2[slot2] || null;
                if (cancelledOp2[slot2]) {
                    if (removed1) {
                        discardedOp2Drop[slot2] = true;
                    }
                    removed1 = heldOp1RmForOp2[slot2] || null;
                } else if (removed1 && (side === RIGHT || op1PickAtOp2Pick[slot2] == null)) {
                    if (conflict == null) {
                        conflict = {
                            type: ConflictType.RM_UNEXPECTED_CONTENT,
                            op1: removeOp(removed1.getPath()),
                            op2: moveOp(r2Pick!.getPath(), r2Drop.getPath()),
                        };
                    }
                }
                droppedHere = true;
            } else if (c2d.i !== undefined) {
                r1Pick = r2Pick = null;
                droppedHere = true;
                if (removed1) {
                    if (conflict == null) {
                        conflict = {
                            type: ConflictType.RM_UNEXPECTED_CONTENT,
                            op1: removeOp(removed1.getPath()),
                            op2: insertOp(r2Drop.getPath(), c2d.i as JSON1Document),
                        };
                    }
                }
            }
        }
        const c1p = getComponent(r1Pick);
        if (c1p) {
            if (c1p.r !== undefined) {
                removed1 = r1Pick!.clone();
            } else if (c1p.p != null) {
                pickSlot1 = c1p.p;
                removed1 = null;
            }
        }
        const t2 = getEditType(c2d);
        if (t2 && removed1) {
            if (conflict == null) {
                conflict = {
                    type: ConflictType.RM_UNEXPECTED_CONTENT,
                    op1: removeOp(removed1.getPath()),
                    op2: editOp(r2Drop.getPath(), t2, getEdit(c2d!), true),
                };
            }
        }
        let p2PickOff = 0;
        let p2DropOff = 0;
        const ap2 = advancer(
            r2Pick,
            (k, c) => (hasPick(c) ? p2PickOff - k - 1 : k - p2PickOff),
            (k, c) => {
                if (hasPick(c)) {
                    p2PickOff++;
                }
            }
        );
        const ap1 = advancer(r1Pick);
        for (const key of r2Drop) {
            if (typeof key === 'number') {
                const p2Mid = key - p2DropOff;
                const _p2Pick = ap2(p2Mid);
                const raw = p2Mid + p2PickOff;
                const _p1Pick = ap1(raw);
                p2DropOff += +scanOp2Drop(_p1Pick, _p2Pick, r2Drop, pickSlot1, removed1);
            } else {
                const _p2Pick = ap2(key);
                const _p1Pick = ap1(key);
                scanOp2Drop(_p1Pick, _p2Pick, r2Drop, pickSlot1, removed1);
            }
        }
        ap2.end();
        ap1.end();
        return droppedHere;
    }
    scanOp2Drop(r1, r2, r2.clone(), null, null);
    if (conflict) {
        return { ok: false, conflict };
    }
    const pickComponents: (null | IJSON1Component)[] = [];
    let cancelledRemoves: null | Set<IJSON1Component> = null;
    // Write surviving picks, deferring children whose destination depends on a peer move.
    function writeOp1Pick(
        r1Pick: JSON1ReadCursor,
        r2Pick: JSON1ReadCursor | null,
        r2Drop: JSON1ReadCursor | null,
        w: JSON1WriteCursor,
        removed2: JSON1ReadCursor | null
    ) {
        let iAmMoved = false;
        const c2p = getComponent(r2Pick);
        if (hasPick(c2p)) {
            const slot2 = c2p!.p;
            if (slot2 != null) {
                r2Drop = heldOp2DropByOp2[slot2]!;
                w = heldPickWrites[slot2] = new JSON1WriteCursor();
                iAmMoved = true;
                removed2 = null;
            } else {
                r2Drop = null;
                removed2 = r2Pick!.clone();
            }
        } else if (hasDrop(getComponent(r2Drop))) {
            r2Drop = null;
        }
        const c1 = r1Pick.getComponent();
        if (c1) {
            const slot1 = c1.p;
            if (slot1 != null) {
                if (removed2) {
                    heldOp2RmForOp1[slot1] = removed2;
                }
                if (removed2 || (side === RIGHT && iAmMoved)) {
                    pickComponents[slot1] = null;
                } else {
                    pickComponents[slot1] = w.getComponent();
                }
                heldOp1PickByOp1[slot1] = r1Pick.clone();
                if (r2Drop) {
                    heldOp2DropByOp1[slot1] = r2Drop.clone();
                }
            } else if (c1.r !== undefined) {
                if (!removed2) {
                    w.write('r', true);
                }
                if (removed2 || iAmMoved) {
                    if (cancelledRemoves == null) {
                        cancelledRemoves = new Set();
                    }
                    cancelledRemoves.add(c1);
                }
            }
        }
        let p2PickOff = 0;
        let p2DropOff = 0;
        const ap2Pick = advancer(r2Pick, undefined, (k, c) => {
            if (hasPick(c)) {
                p2PickOff++;
            }
        });
        const ap2Drop = advancer(
            r2Drop,
            (k, c) => (hasDrop(c) ? ~(k - p2DropOff) : k - p2DropOff),
            (k, c) => {
                if (hasDrop(c)) {
                    p2DropOff++;
                }
            }
        );
        if (r1Pick) {
            for (const key of r1Pick) {
                if (typeof key === 'string') {
                    const p2Pick_ = ap2Pick(key);
                    const p2Drop_ = ap2Drop(key);
                    w.descend(key);
                    writeOp1Pick(r1Pick, p2Pick_, p2Drop_, w, removed2);
                    w.ascend();
                } else {
                    const p2Pick_ = ap2Pick(key);
                    const p2Mid = key - p2PickOff;
                    const p2Drop_ = hasPick(getComponent(p2Pick_)) ? null : ap2Drop(p2Mid);
                    const finalKey = p2Mid + p2DropOff;
                    assert(finalKey >= 0);
                    w.descend(finalKey);
                    writeOp1Pick(r1Pick, p2Pick_, p2Drop_, w, removed2);
                    w.ascend();
                }
            }
        }
        ap2Pick.end();
        ap2Drop.end();
    }
    writeOp1Pick(r1, r2, r2.clone(), w, null);
    w.reset();
    const outputSlotMap: number[] = [];
    // Translate array indices through both pick and drop phases and write the rebased edits.
    function writeOp1Drop(
        p1Pick: JSON1ReadCursor | null,
        p1Drop: JSON1ReadCursor,
        p2Pick: JSON1ReadCursor | null,
        p2Drop: JSON1ReadCursor | null,
        w: JSON1WriteCursor,
        removed2: JSON1ReadCursor | null
    ) {
        assert(p1Drop);
        const c1d = p1Drop.getComponent();
        let c2d = getComponent(p2Drop);
        let droppedHere = false;
        const insOrMv = (r1: JSON1ReadCursor | null, r2: JSON1ReadCursor, c: IJSON1Component) =>
            r1 ? moveOp(r1.getPath(), r2.getPath()) : insertOp(r2.getPath(), c.i as JSON1Document);
        if (hasDrop(c1d)) {
            const slot1 = c1d!.d;
            if (slot1 != null) {
                heldOp1DropByOp1[slot1] = p1Drop.clone();
            }
            const pc = slot1 != null ? pickComponents[slot1] : null;
            let identical = false;
            if (c1d!.i !== undefined || (slot1 != null && pc)) {
                let slot2;
                if (c2d && (c2d.i !== undefined || ((slot2 = c2d.d) != null && !cancelledOp2[slot2]))) {
                    identical =
                        slot2 != null
                            ? slot1 != null && slot1 === op1PickAtOp2Pick[slot2]
                            : deepEqual(c2d.i as JSON1Document, c1d!.i as JSON1Document);
                    if (!identical && (slot2 == null || side === RIGHT || op1PickAtOp2Pick[slot2] == null)) {
                        if (conflict == null) {
                            conflict = {
                                type: ConflictType.DROP_COLLISION,
                                op1: insOrMv(slot1 != null ? heldOp1PickByOp1[slot1] : null, p1Drop, c1d!),
                                op2: insOrMv(slot2 != null ? heldOp2PickByOp2[slot2]! : null, p2Drop!, c2d),
                            };
                        }
                    }
                }
                if (!identical) {
                    if (removed2) {
                        if (conflict == null) {
                            conflict = {
                                type: ConflictType.RM_UNEXPECTED_CONTENT,
                                op1: insOrMv(slot1 != null ? heldOp1PickByOp1[slot1] : null, p1Drop, c1d!),
                                op2: removeOp(removed2.getPath()),
                            };
                        }
                    } else {
                        if (slot1 != null) {
                            outputSlotMap[nextSlot] = slot1;
                            w.write('d', (pc!.p = nextSlot++));
                        } else {
                            w.write('i', deepClone(c1d!.i as JSON1Document));
                        }
                        droppedHere = true;
                    }
                }
            } else if (slot1 != null && !pc) {
                const h = heldOp2RmForOp1[slot1];
                if (h) {
                    removed2 = h.clone();
                }
            }
            if (slot1 != null) {
                p1Pick = heldOp1PickByOp1[slot1];
                p2Pick = heldOp2PickByOp1[slot1];
                p2Drop = heldOp2DropByOp1[slot1];
            } else if (c1d!.i !== undefined) {
                p1Pick = p2Pick = null;
                if (!identical) {
                    p2Drop = null;
                }
            }
        } else if (hasPick(getComponent(p1Pick))) {
            p1Pick = p2Pick = p2Drop = null;
        }
        const c1p = getComponent(p1Pick);
        const c2p = getComponent(p2Pick);
        if (hasPick(c2p)) {
            const slot2 = c2p!.p;
            if ((c2p!.r !== undefined && (!c1p || c1p.r === undefined)) || cancelledOp2[slot2!]) {
                p2Drop = null;
                removed2 = p2Pick!.clone();
            } else if (slot2 != null) {
                p2Drop = heldOp2DropByOp2[slot2];
                if (side === RIGHT || op1PickAtOp2Pick[slot2] == null) {
                    if (!(w = heldDropWrites[slot2])) {
                        w = heldDropWrites[slot2] = new JSON1WriteCursor();
                    }
                    w.reset();
                    removed2 = null;
                }
            }
        } else if (!hasDrop(c1d) && hasDrop(c2d)) {
            p2Drop = null;
        }
        c2d = p2Drop != null ? p2Drop.getComponent() : null;
        const t1 = getEditType(c1d);
        if (t1) {
            const e1 = getEdit(c1d!);
            if (!removed2) {
                const t2 = getEditType(c2d);
                let e;
                if (t2) {
                    if (t1 !== t2) {
                        throw new Error('Transforming incompatible types');
                    }
                    const e2 = getEdit(c2d!);
                    e = t1.transform(e1, e2, direction);
                } else {
                    e = deepClone(e1 as JSON1Document);
                }
                writeEdit(w, t1, e);
            } else {
                if (conflict == null) {
                    conflict = {
                        type: ConflictType.RM_UNEXPECTED_CONTENT,
                        op1: editOp(p1Drop.getPath(), t1, e1, true),
                        op2: removeOp(removed2.getPath()),
                    };
                }
            }
        }
        let p1PickOff = 0;
        let p1DropOff = 0;
        let p2PickOff = 0;
        let p2DropOff = 0;
        let outPickOff = 0;
        let outDropOff = 0;
        let p1pValid = p1Pick != null ? p1Pick.descendFirst() : false;
        const p1pDidDescend = p1pValid;
        const ap2p = advancer(p2Pick, undefined, (k, c) => {
            if (hasPick(c)) {
                p2PickOff++;
            }
        });
        let p2dValid = p2Drop != null ? p2Drop.descendFirst() : false;
        const p2dDidDescend = p2dValid;
        for (const key of p1Drop) {
            if (typeof key === 'number') {
                let _p1Pick;
                const hd1 = hasDrop(p1Drop.getComponent());
                const k1Mid = key - p1DropOff;
                {
                    let p1k;
                    while (p1pValid && typeof (p1k = p1Pick!.getKey()) === 'number') {
                        p1k += p1PickOff;
                        const c = p1Pick!.getComponent()!;
                        const hp = hasPick(c);
                        if (p1k > k1Mid || (p1k === k1Mid && (!hp || (side === LEFT && hd1)))) {
                            break;
                        }
                        if (hp) {
                            p1PickOff--;
                            const slot1 = c.p;
                            if (
                                (c.r !== undefined && (!cancelledRemoves || !cancelledRemoves.has(c))) ||
                                (slot1 != null &&
                                    pickComponents[slot1] &&
                                    (side === RIGHT || !op1PickAtOp2Pick.includes(slot1)))
                            ) {
                                outPickOff--;
                            }
                        }
                        p1pValid = p1Pick!.nextSibling();
                    }
                    _p1Pick = p1pValid && p1k === k1Mid ? p1Pick : null;
                }
                const raw = k1Mid - p1PickOff;
                let _p2Pick = ap2p(raw);
                const k2Mid = raw - p2PickOff;
                let _p2Drop: JSON1ReadCursor | null = null;
                {
                    let p2dk, op2Mid;
                    while (p2dValid && typeof (p2dk = p2Drop!.getKey()) === 'number') {
                        op2Mid = p2dk - p2DropOff;
                        const c = p2Drop!.getComponent()!;
                        const hd2 = hasDrop(c);
                        if (op2Mid > k2Mid) {
                            break;
                        }
                        if (op2Mid === k2Mid) {
                            if (hd2) {
                                if (side === LEFT && hd1) {
                                    _p2Drop = p2Drop!;
                                    break;
                                }
                                const hp2 = _p2Pick && hasPick(_p2Pick.getComponent());
                                if (side === LEFT && hp2) {
                                    break;
                                }
                            } else {
                                _p2Drop = p2Drop!;
                                break;
                            }
                        }
                        if (hd2) {
                            const slot2 = c.d!;
                            if (
                                c.i !== undefined ||
                                (!cancelledOp2[slot2] && (op1PickAtOp2Pick[slot2] == null || side === RIGHT))
                            ) {
                                p2DropOff++;
                            } else if (cancelledOp2[slot2] || (op1PickAtOp2Pick[slot2] != null && side === LEFT)) {
                                p2DropOff++;
                                outDropOff--;
                            }
                        }
                        p2dValid = p2Drop!.nextSibling();
                    }
                }
                const k2Final = k2Mid + p2DropOff;
                const descend = k2Final + outPickOff + outDropOff;
                assert(descend >= 0, 'trying to descend to a negative index');
                w.descend(descend);
                if (hd1) {
                    _p1Pick = _p2Pick = _p2Drop = null;
                    p1DropOff++;
                }
                if (writeOp1Drop(_p1Pick, p1Drop, _p2Pick, _p2Drop, w, removed2)) {
                    outDropOff++;
                }
                w.ascend();
            } else {
                let p1k;
                while (p1pValid) {
                    p1k = p1Pick!.getKey();
                    if (typeof p1k === 'string' && (p1k > key || p1k === key)) {
                        break;
                    }
                    p1pValid = p1Pick!.nextSibling();
                }
                const _p1Pick = p1pValid && p1k === key ? p1Pick : null;
                const _p2Pick = ap2p(key);
                let p2dk;
                while (p2dValid) {
                    p2dk = p2Drop!.getKey();
                    if (typeof p2dk === 'string' && (p2dk > key || p2dk === key)) {
                        break;
                    }
                    p2dValid = p2Drop!.nextSibling();
                }
                const _p2Drop = p2dValid && p2dk === key ? p2Drop : null;
                w.descend(key);
                writeOp1Drop(_p1Pick, p1Drop, _p2Pick, _p2Drop, w, removed2);
                w.ascend();
            }
        }
        ap2p.end();
        if (p1pDidDescend) {
            p1Pick!.ascend();
        }
        if (p2dDidDescend) {
            p2Drop!.ascend();
        }
        return droppedHere;
    }
    writeOp1Drop(r1, r1.clone(), r2, r2.clone(), w, null);
    if (conflict) {
        return { ok: false, conflict };
    }
    w.reset();
    const eachDrop = <W extends null | JSON1WriteCursor>(
        r: JSON1ReadCursor,
        w: W,
        fn: (slot: number, r: JSON1ReadCursor, w: W) => void
    ) =>
        r.traverse(w, (c, w) => {
            if (c.d != null) {
                fn(c.d, r, w);
            }
        });
    if (cancelledOp2.length || heldPickWrites.length) {
        eachDrop(r2, w, (slot2, r, w) => {
            if (cancelledOp2[slot2] && !discardedOp2Drop[slot2]) {
                w.write('r', true);
            }
            if (heldPickWrites[slot2]) {
                w.mergeTree(heldPickWrites[slot2].get());
            }
        });
        w.reset();
    }
    const heldOutDropRead: JSON1ReadCursor[] = [];
    const heldOutDropWrites: JSON1WriteCursor[] = [];
    // Attach deferred edits at their final destinations. A cycle of unresolved moves forms a blackhole conflict.
    function writeHeldOp2Drop(
        p2Drop: JSON1ReadCursor,
        outPick: JSON1ReadCursor | null,
        outDrop: JSON1ReadCursor | null,
        w: JSON1WriteCursor,
        parentC: IJSON1Component | null,
        removedOut: JSON1Document
    ) {
        const coutp = getComponent(outPick);
        if (coutp && hasPick(coutp)) {
            if (coutp.p != null) {
                parentC = coutp;
                const slot = coutp.p;
                outDrop = heldOutDropRead[slot];
                w = heldOutDropWrites[slot] = new JSON1WriteCursor();
            } else if (coutp.r !== undefined) {
                outDrop = null;
                removedOut = true;
            }
        } else if (hasDrop(getComponent(outDrop))) {
            outDrop = null;
        }
        const c2 = p2Drop.getComponent();
        if (c2) {
            let slot2;
            if ((slot2 = c2.d) != null) {
                const _w = heldDropWrites[slot2];
                if (_w) {
                    w.mergeTree(_w.get());
                    outDrop = new JSON1ReadCursor(_w.get());
                }
            }
        }
        let outPickOff = 0;
        let outDropOff = 0;
        const oPickAdv = advancer(outPick, undefined, (k, c) => {
            if (hasPick(c)) {
                outPickOff--;
            }
        });
        const oDropAdv = advancer(
            outDrop,
            (k, c) => (hasDrop(c) ? -(k - outDropOff) - 1 : k - outDropOff),
            (k, c) => {
                if (hasDrop(c)) {
                    outDropOff++;
                }
            }
        );
        for (const o2dk of p2Drop) {
            if (typeof o2dk === 'number') {
                const _outPick = oPickAdv(o2dk);
                const rmid = o2dk + outPickOff;
                const _outDrop = oDropAdv(rmid);
                const rfinal = rmid + outDropOff;
                w.descend(rfinal);
                writeHeldOp2Drop(p2Drop, _outPick, _outDrop, w, parentC, removedOut);
                w.ascend();
            } else {
                w.descend(o2dk);
                writeHeldOp2Drop(p2Drop, oPickAdv(o2dk), oDropAdv(o2dk), w, parentC, removedOut);
                w.ascend();
            }
        }
        oPickAdv.end();
        oDropAdv.end();
    }
    if ((heldDropWrites.length || cancelledOp2.length) && !conflict) {
        const rOut = new JSON1ReadCursor(shallowCloneOp(w.get()));
        eachDrop(rOut, null, (slotOut, r) => {
            heldOutDropRead[slotOut] = r.clone();
        });
        heldDropWrites.forEach((hdw) => {
            if (hdw) {
                eachDrop(new JSON1ReadCursor(hdw.get()), null, (slotOut, r) => {
                    heldOutDropRead[slotOut] = r.clone();
                });
            }
        });
        writeHeldOp2Drop(r2, rOut, rOut.clone(), w, null, false);
        w.reset();
        if (conflict) {
            return { ok: false, conflict };
        }
        if (heldOutDropWrites.length) {
            const heldOutDropContent = heldOutDropWrites.map((w) => (w ? w.get() : null));
            const rOut2 = new JSON1ReadCursor(shallowCloneOp(w.get()));
            eachDrop(rOut2, w, (slotOut, r, w) => {
                const data = heldOutDropContent[slotOut];
                if (data) {
                    w.mergeTree(data);
                    heldOutDropContent[slotOut] = null;
                }
            });
            if (heldOutDropContent.find((x) => x)) {
                const w1 = new JSON1WriteCursor();
                const w2 = new JSON1WriteCursor();
                let nextSlot1 = 0;
                let nextSlot2 = 0;
                heldOutDropContent.forEach((data) => {
                    if (data != null) {
                        eachDrop(new JSON1ReadCursor(data), null, (c) => {
                            const slot1 = outputSlotMap[c];
                            w1.writeMove(
                                heldOp1PickByOp1[slot1].getPath(),
                                heldOp1DropByOp1[slot1]!.getPath(),
                                nextSlot1++
                            );
                            const slot2s = op1PicksOp2DropSlots[slot1];
                            if (slot2s) {
                                slot2s.forEach((slot2) => {
                                    if (!cancelledOp2[slot2] && (side === RIGHT || op1PickAtOp2Pick[slot2] == null)) {
                                        w2.writeMove(
                                            heldOp2PickByOp2[slot2]!.getPath(),
                                            heldOp2DropByOp2[slot2]!.getPath(),
                                            nextSlot2++
                                        );
                                    }
                                });
                            }
                        });
                    }
                });
                conflict = {
                    type: ConflictType.BLACKHOLE,
                    op1: w1.get(),
                    op2: w2.get(),
                };
            }
        }
    }
    if (conflict) {
        return { ok: false, conflict };
    } else {
        const result = w.get();
        return { ok: true, result };
    }
}

function throwConflictErr(conflict: IJSON1Conflict): never {
    throw Object.assign(new Error('Transform detected write conflict'), {
        name: 'writeConflict',
        type: 'writeConflict',
        conflict,
    });
}

export function transform(op1: JSONXActions, op2: JSONXActions, side: 'left' | 'right') {
    const res = tryTransform(op1, op2, side);
    if (res.ok) {
        return res.result;
    } else {
        throwConflictErr(res.conflict);
    }
}

const opThatRemovesDE = (op: JSONXActions) => {
    const w = new JSON1WriteCursor();
    new JSON1ReadCursor(op).traverse(w, (c, w) => {
        if (hasDrop(c) || getEditType(c)) {
            w.write('r', true);
        }
    });
    return w.get();
};

const resolveConflict = (conflict: IJSON1Conflict, side: 'left' | 'right') => {
    const { type, op1, op2 } = conflict;
    switch (type) {
        case ConflictType.DROP_COLLISION:
            return side === 'left' ? [null, opThatRemovesDE(op2)] : [opThatRemovesDE(op1), null];
        case ConflictType.RM_UNEXPECTED_CONTENT: {
            let op1HasRemove = false;
            new JSON1ReadCursor(op1).traverse(null, (c) => {
                if (c.r !== undefined) {
                    op1HasRemove = true;
                }
            });
            return op1HasRemove ? [null, opThatRemovesDE(op2)] : [opThatRemovesDE(op1), null];
        }
        case ConflictType.BLACKHOLE:
            return [opThatRemovesDE(op1), opThatRemovesDE(op2)];
        default:
            throw new Error(`Unrecognised conflict: ${type}`);
    }
};

type AllowConflictPred = (c: IJSON1Conflict) => boolean;

// Resolve one accepted conflict at a time. Normalize before retrying so empty subtype edits make progress.
export function transformWithConflictsPred(
    allowConflict: AllowConflictPred,
    op1: JSONXActions,
    op2: JSONXActions,
    side: 'left' | 'right'
) {
    let r2Aggregate = null;
    while (true) {
        const res = tryTransform(op1, op2, side);
        if (res.ok) {
            return compose(r2Aggregate, res.result);
        } else {
            const { conflict } = res;
            if (!allowConflict(conflict)) {
                throwConflictErr(conflict);
            }
            const [r1, r2] = resolveConflict(conflict, side);
            op1 = compose(normalize(op1), r1);
            op2 = compose(normalize(op2), r2);
            r2Aggregate = compose(r2Aggregate, r2);
        }
    }
}
