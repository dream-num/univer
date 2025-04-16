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

import type { IKeyValue, Nullable } from '@univerjs/core';

import type { IObjectFullState } from '../basics/interfaces';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '../basics/interfaces';
import { Shape } from './shape';

interface IPathDataArray {
    command: string;
    points: number[];
    start: {
        x: number;
        y: number;
    };
    pathLength: number;
}

interface IPathFixConfig {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface IPathProps extends IShapeProps {
    data?: string;
    dataArray?: IPathDataArray[];
}

export const PATH_OBJECT_ARRAY = ['dataArray'];

export class Path extends Shape<IPathProps> {
    private _dataArray: IPathDataArray[] = [];

    private _pathLength: number = 0;

    private _selfRectCache: IPathFixConfig = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    };

    private _reCalculateCache: boolean = true;

    constructor(key?: string, props?: IPathProps) {
        super(key, props);
        if (props?.data) {
            this._dataArray = Path.parsePathData(props.data);
        } else if (props?.dataArray) {
            this._dataArray = props.dataArray;
        }

        for (let i = 0; i < this.dataArray.length; ++i) {
            this._pathLength += this.dataArray[i].pathLength;
        }

        this._setFixBoundingBox();

        this.onTransformChange$.subscribeEvent((changeState) => {
            const { type, preValue } = changeState;
            if (type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize || type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.all) {
                this._reCalculateCache = true;

                const { left, top, width, height } = this._getSelfRect();

                const { width: preWidth, height: preHeight } = preValue as IObjectFullState;

                let fixX;
                let fixY;

                if (!preWidth) {
                    fixX = 0;
                } else {
                    fixX = (this.width as number) - preWidth;
                }

                if (!preHeight) {
                    fixY = 0;
                } else {
                    fixY = (this.height as number) - preHeight;
                }

                const increaseScaleX = fixX / width;

                const increaseScaleY = fixY / height;

                this.scaleX += increaseScaleX;
                this.scaleY += increaseScaleY;

                this.left = (this.left as number) - left * increaseScaleX;
                this.top = (this.top as number) - top * increaseScaleY;

                // console.log({
                //     left: this.left,
                //     top: this.top,
                //     scaleX: this.scaleX,
                //     scaleY: this.scaleY,
                //     width: this.width,
                //     preWidth,
                //     height: this.height,
                //     preHeight,
                //     originWidth: width,
                //     originHeight: height,
                //     originLeft: left,
                //     originTop: top,
                // });

                this._setTransForm();
            }
        });
    }

    get dataArray() {
        return this._dataArray;
    }

    static override drawWith(ctx: UniverRenderingContext, props: IPathProps | Path) {
        const ca = props.dataArray;
        if (!ca) {
            return;
        }
        // context position
        ctx.beginPath();
        // let isClosed = false;
        for (let n = 0; n < ca.length; n++) {
            const c = ca[n].command;
            const p = ca[n].points;
            switch (c) {
                case 'L':
                    ctx.lineTo(p[0], p[1]);
                    break;
                case 'M':
                    ctx.moveTo(p[0], p[1]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                    break;
                case 'Q':
                    ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                    break;
                case 'A': {
                    const cx = p[0];
                    const cy = p[1];
                    const rx = p[2];
                    const ry = p[3];
                    const theta = p[4];
                    const dTheta = p[5];
                    const psi = p[6];
                    const fs = p[7];

                    const r = rx > ry ? rx : ry;
                    const scaleX = rx > ry ? 1 : rx / ry;
                    const scaleY = rx > ry ? ry / rx : 1;

                    ctx.translate(cx, cy);
                    ctx.rotate(psi);
                    ctx.scale(scaleX, scaleY);
                    ctx.arc(0, 0, r, theta, theta + dTheta, !!(1 - fs));
                    ctx.scale(1 / scaleX, 1 / scaleY);
                    ctx.rotate(-psi);
                    ctx.translate(-cx, -cy);

                    break;
                }
                case 'z':
                    // isClosed = true;
                    ctx.closePath();
                    break;
            }
        }

        this._renderPaintInOrder(ctx, props as IPathProps);
    }

    static getLineLength(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }

    static getPointOnLine(
        dist: number,
        P1x: number,
        P1y: number,
        P2x: number,
        P2y: number,
        fromX?: number,
        fromY?: number
    ) {
        if (fromX === undefined) {
            fromX = P1x;
        }
        if (fromY === undefined) {
            fromY = P1y;
        }

        const m = (P2y - P1y) / (P2x - P1x + 0.00000001);
        let run = Math.sqrt((dist * dist) / (1 + m * m));
        if (P2x < P1x) {
            run *= -1;
        }
        let rise = m * run;
        let pt;

        if (P2x === P1x) {
            // vertical line
            pt = {
                x: fromX,
                y: fromY + rise,
            };
        } else if ((fromY - P1y) / (fromX - P1x + 0.00000001) === m) {
            pt = {
                x: fromX + run,
                y: fromY + rise,
            };
        } else {
            const len = this.getLineLength(P1x, P1y, P2x, P2y);
            // if (len < 0.00000001) {
            //   return {
            //     x: P1x,
            //     y: P1y,
            //   };
            // }
            let u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
            u /= len * len;
            const ix = P1x + u * (P2x - P1x);
            const iy = P1y + u * (P2y - P1y);

            const pRise = this.getLineLength(fromX, fromY, ix, iy);
            const pRun = Math.sqrt(dist * dist - pRise * pRise);
            run = Math.sqrt((pRun * pRun) / (1 + m * m));
            if (P2x < P1x) {
                run *= -1;
            }
            rise = m * run;
            pt = {
                x: ix + run,
                y: iy + rise,
            };
        }

        return pt;
    }

    static getPointOnCubicBezier(
        pct: number,
        P1x: number,
        P1y: number,
        P2x: number,
        P2y: number,
        P3x: number,
        P3y: number,
        P4x: number,
        P4y: number
    ) {
        function CB1(t: number) {
            return t * t * t;
        }
        function CB2(t: number) {
            return 3 * t * t * (1 - t);
        }
        function CB3(t: number) {
            return 3 * t * (1 - t) * (1 - t);
        }
        function CB4(t: number) {
            return (1 - t) * (1 - t) * (1 - t);
        }
        const x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
        const y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);

        return {
            x,
            y,
        };
    }

    static getPointOnQuadraticBezier(
        pct: number,
        P1x: number,
        P1y: number,
        P2x: number,
        P2y: number,
        P3x: number,
        P3y: number
    ) {
        function QB1(t: number) {
            return t * t;
        }
        function QB2(t: number) {
            return 2 * t * (1 - t);
        }
        function QB3(t: number) {
            return (1 - t) * (1 - t);
        }
        const x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
        const y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);

        return {
            x,
            y,
        };
    }

    static getPointOnEllipticalArc(cx: number, cy: number, rx: number, ry: number, theta: number, psi: number) {
        const cosPsi = Math.cos(psi);
        const sinPsi = Math.sin(psi);
        const pt = {
            x: rx * Math.cos(theta),
            y: ry * Math.sin(theta),
        };
        return {
            x: cx + (pt.x * cosPsi - pt.y * sinPsi),
            y: cy + (pt.x * sinPsi + pt.y * cosPsi),
        };
    }

    /*
     * get parsed data array from the data
     *  string.  V, v, H, h, and l data are converted to
     *  L data for the purpose of high performance Path
     *  rendering
     */

    // eslint-disable-next-line max-lines-per-function, complexity
    static parsePathData(data: string) {
        // Path Data Segment must begin with a moveTo
        //m (x y)+  Relative moveTo (subsequent points are treated as lineTo)
        //M (x y)+  Absolute moveTo (subsequent points are treated as lineTo)
        //l (x y)+  Relative lineTo
        //L (x y)+  Absolute LineTo
        //h (x)+    Relative horizontal lineTo
        //H (x)+    Absolute horizontal lineTo
        //v (y)+    Relative vertical lineTo
        //V (y)+    Absolute vertical lineTo
        //z (closepath)
        //Z (closepath)
        //c (x1 y1 x2 y2 x y)+ Relative Bezier curve
        //C (x1 y1 x2 y2 x y)+ Absolute Bezier curve
        //q (x1 y1 x y)+       Relative Quadratic Bezier
        //Q (x1 y1 x y)+       Absolute Quadratic Bezier
        //t (x y)+    Shorthand/Smooth Relative Quadratic Bezier
        //T (x y)+    Shorthand/Smooth Absolute Quadratic Bezier
        //s (x2 y2 x y)+       Shorthand/Smooth Relative Bezier curve
        //S (x2 y2 x y)+       Shorthand/Smooth Absolute Bezier curve
        //a (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+     Relative Elliptical Arc
        //A (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+  Absolute Elliptical Arc

        // return early if data is not defined
        if (!data) {
            return [];
        }

        // command string
        let cs = data;

        // command chars
        const cc = ['m', 'M', 'l', 'L', 'v', 'V', 'h', 'H', 'z', 'Z', 'c', 'C', 'q', 'Q', 't', 'T', 's', 'S', 'a', 'A'];
        // convert white spaces to commas
        cs = cs.replace(new RegExp(' ', 'g'), ',');
        // create pipes so that we can split the data
        for (let n = 0, len = cc.length; n < len; n++) {
            cs = cs.replace(new RegExp(cc[n], 'g'), `|${cc[n]}`);
        }
        // create array
        const arr = cs.split('|');
        const ca: IPathDataArray[] = [];
        const coords = [];
        // init context point
        let cpx = 0;
        let cpy = 0;

        const re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
        let match;
        for (let n = 1, len = arr.length; n < len; n++) {
            let str = arr[n];
            let c = str.charAt(0);
            str = str.slice(1);

            coords.length = 0;
            while ((match = re.exec(str))) {
                coords.push(match[0]);
            }

            // while ((match = re.exec(str))) {
            //   coords.push(match[0]);
            // }
            const p = [];

            for (let j = 0, jLen = coords.length; j < jLen; j++) {
                // extra case for merged flags
                if (coords[j] === '00') {
                    p.push(0, 0);
                    continue;
                }
                const parsed = Number.parseFloat(coords[j]);
                if (!isNaN(parsed)) {
                    p.push(parsed);
                } else {
                    p.push(0);
                }
            }

            while (p.length > 0) {
                if (isNaN(p[0])) {
                    // case for a trailing comma before next command
                    break;
                }

                let cmd: Nullable<string>;
                let points: number[] = [];
                const startX = cpx;
                const startY = cpy;
                // Move var from within the switch to up here (jshint)
                let prevCmd: IPathDataArray;
                let ctlPtx: number;
                let ctlPty: number; // Ss, Tt
                let rx: number;
                let ry: number;
                let psi: number;
                let fa: number;
                let fs: number;
                let x1: number;
                let y1: number; // Aa

                // convert l, H, h, V, and v to L
                switch (c) {
                    // Note: Keep the lineTo's above the moveTo's in this switch
                    case 'l':
                        cpx += p.shift() || 0;
                        cpy += p.shift() || 0;
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'L':
                        cpx = p.shift() || 0;
                        cpy = p.shift() || 0;
                        points.push(cpx, cpy);
                        break;
                    // Note: lineTo handlers need to be above this point
                    case 'm': {
                        const dx = p.shift() || 0;
                        const dy = p.shift() || 0;
                        cpx += dx;
                        cpy += dy;
                        cmd = 'M';
                        // After closing the path move the current position
                        // to the the first point of the path (if any).
                        if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
                            for (let idx = ca.length - 2; idx >= 0; idx--) {
                                if (ca[idx].command === 'M') {
                                    cpx = ca[idx].points[0] + dx;
                                    cpy = ca[idx].points[1] + dy;
                                    break;
                                }
                            }
                        }
                        points.push(cpx, cpy);
                        c = 'l';
                        // subsequent points are treated as relative lineTo
                        break;
                    }
                    case 'M':
                        cpx = p.shift() || 0;
                        cpy = p.shift() || 0;
                        cmd = 'M';
                        points.push(cpx, cpy);
                        c = 'L';
                        // subsequent points are treated as absolute lineTo
                        break;

                    case 'h':
                        cpx += p.shift() || 0;
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'H':
                        cpx = p.shift() || 0;
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'v':
                        cpy += p.shift() || 0;
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'V':
                        cpy = p.shift() || 0;
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'C':
                        points.push(p.shift() || 0, p.shift() || 0, p.shift() || 0, p.shift() || 0);
                        cpx = p.shift() || 0;
                        cpy = p.shift() || 0;
                        points.push(cpx, cpy);
                        break;
                    case 'c':
                        points.push(
                            cpx + (p.shift() || 0),
                            cpy + (p.shift() || 0),
                            cpx + (p.shift() || 0),
                            cpy + (p.shift() || 0)
                        );
                        cpx += p.shift() || 0;
                        cpy += p.shift() || 0;
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'S':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, p.shift() || 0, p.shift() || 0);
                        cpx = p.shift() || 0;
                        cpy = p.shift() || 0;
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 's':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, cpx + (p.shift() || 0), cpy + (p.shift() || 0));
                        cpx += p.shift() || 0;
                        cpy += p.shift() || 0;
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'Q':
                        points.push(p.shift() || 0, p.shift() || 0);
                        cpx = p.shift() || 0;
                        cpy = p.shift() || 0;
                        points.push(cpx, cpy);
                        break;
                    case 'q':
                        points.push(cpx + (p.shift() || 0), cpy + (p.shift() || 0));
                        cpx += p.shift() || 0;
                        cpy += p.shift() || 0;
                        cmd = 'Q';
                        points.push(cpx, cpy);
                        break;
                    case 'T':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx = p.shift() || 0;
                        cpy = p.shift() || 0;
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 't':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx += p.shift() || 0;
                        cpy += p.shift() || 0;
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 'A':
                        rx = p.shift() || 0;
                        ry = p.shift() || 0;
                        psi = p.shift() || 0;
                        fa = p.shift() || 0;
                        fs = p.shift() || 0;
                        x1 = cpx;
                        y1 = cpy;
                        cpx = p.shift() || 0;
                        cpy = p.shift() || 0;
                        cmd = 'A';
                        points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                    case 'a':
                        rx = p.shift() || 0;
                        ry = p.shift() || 0;
                        psi = p.shift() || 0;
                        fa = p.shift() || 0;
                        fs = p.shift() || 0;
                        x1 = cpx;
                        y1 = cpy;
                        cpx += p.shift() || 0;
                        cpy += p.shift() || 0;
                        cmd = 'A';
                        points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                }

                ca.push({
                    command: cmd || c,
                    points,
                    start: {
                        x: startX,
                        y: startY,
                    },
                    pathLength: this.calcLength(startX, startY, cmd || c, points),
                });
            }

            if (c === 'z' || c === 'Z') {
                ca.push({
                    command: 'z',
                    points: [],
                    start: {
                        x: 0,
                        y: 0,
                    },
                    pathLength: 0,
                });
            }
        }

        return ca;
    }

    static calcLength(x: number, y: number, cmd: string, points: number[]) {
        let len;
        let p1;
        let p2;
        let t;
        const path = Path;

        switch (cmd) {
            case 'L':
                return path.getLineLength(x, y, points[0], points[1]);
            case 'C':
                // Approximates by breaking curve into 100 line segments
                len = 0.0;
                p1 = path.getPointOnCubicBezier(
                    0,
                    x,
                    y,
                    points[0],
                    points[1],
                    points[2],
                    points[3],
                    points[4],
                    points[5]
                );
                for (t = 0.01; t <= 1; t += 0.01) {
                    p2 = path.getPointOnCubicBezier(
                        t,
                        x,
                        y,
                        points[0],
                        points[1],
                        points[2],
                        points[3],
                        points[4],
                        points[5]
                    );
                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'Q':
                // Approximates by breaking curve into 100 line segments
                len = 0.0;
                p1 = path.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                for (t = 0.01; t <= 1; t += 0.01) {
                    p2 = path.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'A': {
                // Approximates by breaking curve into line segments
                len = 0.0;
                const start = points[4];
                // 4 = theta
                const dTheta = points[5];
                // 5 = dTheta
                const end = points[4] + dTheta;
                let inc = Math.PI / 180.0;
                // 1 degree resolution
                if (Math.abs(start - end) < inc) {
                    inc = Math.abs(start - end);
                }
                // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
                p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                if (dTheta < 0) {
                    // clockwise
                    for (t = start - inc; t > end; t -= inc) {
                        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                } else {
                    // counter-clockwise
                    for (t = start + inc; t < end; t += inc) {
                        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                }
                p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);

                return len;
            }
        }

        return 0;
    }

    static convertEndpointToCenterParameterization(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        fa: number,
        fs: number,
        rx: number,
        ry: number,
        psiDeg: number
    ) {
        // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        const psi = psiDeg * (Math.PI / 180.0);
        const xp = (Math.cos(psi) * (x1 - x2)) / 2.0 + (Math.sin(psi) * (y1 - y2)) / 2.0;
        const yp = (-1 * Math.sin(psi) * (x1 - x2)) / 2.0 + (Math.cos(psi) * (y1 - y2)) / 2.0;

        const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }

        let f = Math.sqrt(
            (rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) /
                (rx * rx * (yp * yp) + ry * ry * (xp * xp))
        );

        if (fa === fs) {
            f *= -1;
        }
        if (isNaN(f)) {
            f = 0;
        }

        const cxp = (f * rx * yp) / ry;
        const cyp = (f * -ry * xp) / rx;

        const cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
        const cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;

        const vMag = (v: number[]) => Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        const vRatio = (u: number[], v: number[]) => (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
        const vAngle = (u: number[], v: number[]) => (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
        const theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
        const u = [(xp - cxp) / rx, (yp - cyp) / ry];
        const v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
        let dTheta = vAngle(u, v);

        if (vRatio(u, v) <= -1) {
            dTheta = Math.PI;
        }
        if (vRatio(u, v) >= 1) {
            dTheta = 0;
        }
        if (fs === 0 && dTheta > 0) {
            dTheta -= 2 * Math.PI;
        }
        if (fs === 1 && dTheta < 0) {
            dTheta += 2 * Math.PI;
        }
        return [cx, cy, rx, ry, theta, dTheta, psi, fs];
    }

    override toJson() {
        const props: IKeyValue = {};
        PATH_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof Path]) {
                props[key] = this[key as keyof Path];
            }
        });
        return {
            ...super.toJson(),
            ...props,
        };
    }

    override getState() {
        const { left, top, width, height } = this.getRect();
        return {
            left,
            top,
            width,
            height,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            angle: this.angle,
            skewX: this.skewX,
            skewY: this.skewY,
            flipX: this.flipX,
            flipY: this.flipY,
        };
    }

    getRect() {
        const { left, top, width, height } = this._getSelfRect();
        return {
            left: left * this.scaleX + this.left,
            top: top * this.scaleY + this.top,
            width: width * this.scaleX,
            height: height * this.scaleY,
        };
    }

    /**
     * Return length of the path.
     * @method
     * @returns {number} length
     * @example
     * var length = path.getLength();
     */
    getLength() {
        return this._pathLength;
    }

    /**
     * Get point on path at specific length of the path
     * @method
     * @param {number} length length
     * @returns {object} point {x,y} point
     * @example
     * var point = path.getPointAtLength(10);
     */
    getPointAtLength(length: number) {
        let point;
        let i = 0;
        const ii = this.dataArray.length;

        if (!ii) {
            return null;
        }

        while (i < ii && length > this.dataArray[i].pathLength) {
            length -= this.dataArray[i].pathLength;
            ++i;
        }

        if (i === ii) {
            point = this.dataArray[i - 1].points.slice(-2);
            return {
                x: point[0],
                y: point[1],
            };
        }

        if (length < 0.01) {
            point = this.dataArray[i].points.slice(0, 2);
            return {
                x: point[0],
                y: point[1],
            };
        }

        const cp = this.dataArray[i];
        const p = cp.points;
        switch (cp.command) {
            case 'L':
                return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);
            case 'C':
                return Path.getPointOnCubicBezier(
                    length / cp.pathLength,
                    cp.start.x,
                    cp.start.y,
                    p[0],
                    p[1],
                    p[2],
                    p[3],
                    p[4],
                    p[5]
                );
            case 'Q':
                return Path.getPointOnQuadraticBezier(
                    length / cp.pathLength,
                    cp.start.x,
                    cp.start.y,
                    p[0],
                    p[1],
                    p[2],
                    p[3]
                );
            case 'A': {
                const cx = p[0];
                const cy = p[1];
                const rx = p[2];
                const ry = p[3];
                let theta = p[4];
                const dTheta = p[5];
                const psi = p[6];
                theta += (dTheta * length) / cp.pathLength;
                return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
            }
        }

        return null;
    }

    protected override _draw(ctx: UniverRenderingContext) {
        Path.drawWith(ctx, this);
    }

    private _setFixBoundingBox() {
        const { left, top, width, height } = this._getSelfRect();

        // this.left = (this.left as number) - left;
        // this.top = (this.top as number) - top;
        const fixScaleX = (this.width as number) / width;
        const fixScaleY = (this.height as number) / height;

        this.left = (this.left as number) - left * fixScaleX;
        this.top = (this.top as number) - top * fixScaleY;
        this.scaleX = fixScaleX;
        this.scaleY = fixScaleY;
        this.width = width;
        this.height = height;

        this._setTransForm();
    }

    private _getSelfRect() {
        if (!this._reCalculateCache) {
            return this._selfRectCache;
        }
        let points: number[] = [];
        this.dataArray.forEach((data) => {
            if (data.command === 'A') {
                // Approximates by breaking curve into line segments
                const start = data.points[4];
                // 4 = theta
                const dTheta = data.points[5];
                // 5 = dTheta
                const end = data.points[4] + dTheta;
                let inc = Math.PI / 180.0;
                // 1 degree resolution
                if (Math.abs(start - end) < inc) {
                    inc = Math.abs(start - end);
                }
                if (dTheta < 0) {
                    // clockwise
                    for (let t = start - inc; t > end; t -= inc) {
                        const point = Path.getPointOnEllipticalArc(
                            data.points[0],
                            data.points[1],
                            data.points[2],
                            data.points[3],
                            t,
                            0
                        );
                        points.push(point.x, point.y);
                    }
                } else {
                    // counter-clockwise
                    for (let t = start + inc; t < end; t += inc) {
                        const point = Path.getPointOnEllipticalArc(
                            data.points[0],
                            data.points[1],
                            data.points[2],
                            data.points[3],
                            t,
                            0
                        );
                        points.push(point.x, point.y);
                    }
                }
            } else if (data.command === 'C') {
                // Approximates by breaking curve into 100 line segments
                for (let t = 0.0; t <= 1; t += 0.01) {
                    const point = Path.getPointOnCubicBezier(
                        t,
                        data.start.x,
                        data.start.y,
                        data.points[0],
                        data.points[1],
                        data.points[2],
                        data.points[3],
                        data.points[4],
                        data.points[5]
                    );
                    points.push(point.x, point.y);
                }
            } else {
                // TODO: how can we calculate bezier curves better?
                points = points.concat(data.points);
            }
        });
        let minX = points[0];
        let maxX = points[0];
        let minY = points[1];
        let maxY = points[1];
        let x;
        let y;
        for (let i = 0; i < points.length / 2; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];

            // skip bad values
            if (!isNaN(x)) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
            }
            if (!isNaN(y)) {
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }

        const cache = {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY,
        };

        this._selfRectCache = cache;

        return cache;
    }
}
