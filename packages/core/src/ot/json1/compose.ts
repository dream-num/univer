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

import type { IJSON1Component, JSON1Document, JSONXActions } from './json1';
import type { IJSONObject } from './snapshot';
import { JSON1ReadCursor, JSON1WriteCursor } from './cursor';
import { advancer, eachChildOf } from './navigation';
import { checkValidOp, getEdit, getEditType, writeEdit } from './operation';
import { assert, getComponent, hasDrop, hasPick, setOrRemoveChild } from './snapshot';

/** Join sequential operations at the intermediate snapshot, keeping move slots connected across both operations. */
export function compose(op1: JSONXActions, op2: JSONXActions) {
    checkValidOp(op1);
    checkValidOp(op2);
    if (op1 == null) {
        return op2;
    }
    if (op2 == null) {
        return op1;
    }
    let nextSlot = 0;
    const r1 = new JSON1ReadCursor(op1);
    const r2 = new JSON1ReadCursor(op2);
    const w = new JSON1WriteCursor();
    const heldPickWrites: JSON1WriteCursor[] = [];
    const heldDropWrites: JSON1WriteCursor[] = [];
    const held1Pick: JSON1ReadCursor[] = [];
    const held2Drop: JSON1ReadCursor[] = [];
    const p1SlotMap: number[] = [];
    const p2SlotMap: number[] = [];
    const visitedOp2EditCs = new Set<IJSON1Component>();
    r1.traverse(null, (c) => {
        if (c.p != null) {
            held1Pick[c.p] = r1.clone();
        }
    });
    r2.traverse(null, (c) => {
        if (c.d != null) {
            held2Drop[c.d] = r2.clone();
        }
    });
    // At the intermediate snapshot, match the first operation’s drops to the second operation’s picks.
    // Stage writes for moved subtrees until their source or destination in the composed operation is known.
    function xfBoundary(
        r1Pick: JSON1ReadCursor | null,
        r1Drop: JSON1ReadCursor | null,
        r2Pick: JSON1ReadCursor | null,
        r2Drop: JSON1ReadCursor | null,
        litIn: JSON1Document | undefined,
        rmParent: boolean,
        wd: JSON1WriteCursor,
        wp: JSON1WriteCursor
    ) {
        assert(r1Drop || r2Pick);
        const c1d = getComponent(r1Drop);
        const c2p = getComponent(r2Pick);
        const rmHere = c2p ? c2p.r !== undefined : false;
        const insHere = c1d ? c1d.i !== undefined : false;
        const drop1Slot = c1d ? c1d.d : null;
        const pick2Slot = c2p ? c2p.p : null;
        const rmChildren = (rmParent || rmHere) && pick2Slot == null;
        if (pick2Slot != null) {
            r2Drop = held2Drop[pick2Slot];
            wd = heldDropWrites[pick2Slot] = new JSON1WriteCursor();
        } else if (c2p && c2p.r !== undefined) {
            r2Drop = null;
        } else {
            const c2d = getComponent(r2Drop);
            if (c2d && c2d.d != null) {
                r2Drop = null;
            }
        }
        const c2d = getComponent(r2Drop);
        if (drop1Slot != null) {
            r1Pick = held1Pick[drop1Slot];
            wp = heldPickWrites[drop1Slot] = new JSON1WriteCursor();
            if (!rmChildren) {
                const slot = (p1SlotMap[drop1Slot] = nextSlot++);
                wd.write('d', slot);
            } else {
                if (rmParent && !rmHere) {
                    wp.write('r', true);
                }
            }
        } else if (c1d && c1d.i !== undefined) {
            r1Pick = null;
        } else {
            const c1p = getComponent(r1Pick);
            if (c1p && c1p.p != null) {
                r1Pick = null;
            }
        }
        let litOut: JSON1Document | undefined;
        if (insHere) {
            assert(litIn === undefined);
            litOut = c1d!.i as JSON1Document;
        } else {
            litOut = litIn;
        }
        const insComponent = (pick2Slot == null ? insHere && !rmParent && !rmHere : litOut !== undefined)
            ? wd.getComponent()
            : null;
        if (pick2Slot != null) {
            if (litIn === undefined && !insHere) {
                const slot = drop1Slot != null ? p1SlotMap[drop1Slot] : nextSlot++;
                p2SlotMap[pick2Slot] = slot;
                wp.write('p', slot);
            }
        } else if (rmHere) {
            if (!insHere && litIn === undefined) {
                wp.write('r', c2p!.r);
            }
        }
        const type1 = !rmChildren ? getEditType(c1d) : null;
        const type2 = getEditType(c2d);
        if (type1 && type2) {
            assert(type1 === type2);
            const e1 = getEdit(c1d!);
            const e2 = getEdit(c2d!);
            const r = type1.compose(e1, e2);
            writeEdit(wd, type1, r);
            visitedOp2EditCs.add(c2d!);
        } else if (type1) {
            writeEdit(wd, type1, getEdit(c1d!));
        } else if (type2) {
            writeEdit(wd, type2, getEdit(c2d!));
            visitedOp2EditCs.add(c2d!);
        }
        const hasContainerLiteral = typeof litOut === 'object' && litOut != null;
        let isCloned = false;
        // Each cursor sees a different array. Track each pass's offset against the shared intermediate index.
        let p1PickOff = 0;
        let p1DropOff = 0;
        let p2PickOff = 0;
        let p2DropOff = 0;
        let litOff = 0;
        const p2DropAdv = advancer(
            r2Drop,
            (k, c) => (hasDrop(c) ? p2DropOff - k - 1 : k - p2DropOff),
            (k, c) => {
                if (hasDrop(c)) {
                    p2DropOff++;
                }
            }
        );
        const p1PickAdv = advancer(
            r1Pick,
            (k, c) => (hasPick(c) ? p1PickOff - k - 1 : k - p1PickOff),
            (k, c) => {
                if (hasPick(c)) {
                    p1PickOff++;
                }
            }
        );
        eachChildOf(r1Drop, r2Pick, (inKey, _p1Drop, _p2Pick) => {
            let p1PickKey = inKey;
            let p2DropKey = inKey;
            let litKey = inKey;
            let _p1Pick, _p2Drop;
            if (typeof inKey === 'number') {
                const p2Mid = inKey + p2PickOff;
                _p2Drop = p2DropAdv(p2Mid);
                p2DropKey = p2Mid + p2DropOff;
                const p1Mid = inKey + p1DropOff;
                _p1Pick = p1PickAdv(p1Mid);
                if (hasDrop(getComponent(_p2Drop))) {
                    _p1Pick = null;
                }
                p1PickKey = p1Mid + p1PickOff;
                litKey = inKey + litOff;
                assert(p1PickKey >= 0, 'p1PickKey is negative');
                assert(p2DropKey >= 0, 'p2DropKey is negative');
                const hd1 = hasDrop(getComponent(_p1Drop));
                const hp2 = hasPick(getComponent(_p2Pick));
                if (hd1 || (hp2 && !rmChildren)) {
                    litOff--;
                }
                if (hd1) {
                    p1DropOff--;
                }
                if (hp2) {
                    p2PickOff--;
                }
            } else {
                _p1Pick = p1PickAdv(inKey);
                _p2Drop = p2DropAdv(inKey);
            }
            wp.descend(p1PickKey);
            wd.descend(p2DropKey);
            const _lit = hasContainerLiteral && !hasDrop(getComponent(_p1Drop)) ? (litOut as IJSONObject)[litKey] : undefined;
            const _litResult = xfBoundary(_p1Pick, _p1Drop, _p2Pick, _p2Drop, _lit, rmChildren, wd, wp);
            if (hasContainerLiteral && !rmChildren) {
                if (_lit !== _litResult) {
                    if (!isCloned) {
                        litOut = Array.isArray(litOut) ? litOut.slice() : Object.assign({}, litOut);
                        isCloned = true;
                    }
                    setOrRemoveChild(litOut as JSON1Document[] | IJSONObject, litKey, _litResult);
                }
            } else {
                assert(_litResult === undefined);
            }
            wd.ascend();
            wp.ascend();
        });
        p1PickAdv.end();
        p2DropAdv.end();
        if (insComponent != null) {
            insComponent.i = litOut;
        } else if (!rmParent && !rmHere && pick2Slot == null) {
            return litOut;
        }
    }
    const w2 = new JSON1WriteCursor();
    xfBoundary(r1, r1.clone(), r2, r2.clone(), undefined, false, w, w2);
    w.reset();
    w.mergeTree(w2.get());
    w.reset();
    r1.traverse(w, (c, w) => {
        const slot1 = c.p;
        if (slot1 != null) {
            const slot = p1SlotMap[slot1];
            if (slot != null) {
                w.write('p', slot);
            }
            const _w = heldPickWrites[slot1];
            if (_w) {
                w.mergeTree(_w.get());
            }
        } else if (c.r !== undefined) {
            w.write('r', c.r);
        }
    });
    w.reset();
    r2.traverse(w, (c, w) => {
        const slot2 = c.d;
        if (slot2 != null) {
            const slot = p2SlotMap[slot2];
            if (slot != null) {
                w.write('d', slot);
            }
            const _w = heldDropWrites[slot2];
            if (_w) {
                w.mergeTree(_w.get());
            }
        } else if (c.i !== undefined) {
            w.write('i', c.i);
        }
        const t = getEditType(c);
        if (t && !visitedOp2EditCs.has(c)) {
            writeEdit(w, t, getEdit(c));
        }
    });
    const result = w.get();
    return result;
}
