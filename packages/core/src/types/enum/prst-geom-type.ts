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

// TODO@Jocs: should be moved out of core.

export enum BasicShapes {
    Line = 'line',
    LineInv = 'lineInv',
    Triangle = 'triangle',
    RtTriangle = 'rtTriangle',
    Rect = 'rect',
    Diamond = 'diamond',
    Parallelogram = 'parallelogram',
    Trapezoid = 'trapezoid',
    NonIsocelesTrapezoid = 'nonIsocelesTrapezoid',
    Pentagon = 'pentagon',
    Hexagon = 'hexagon',
    Heptagon = 'heptagon',
    Octagon = 'octagon',
    Decagon = 'decagon',
    Dodecagon = 'dodecagon',
    Star4 = 'star4',
    Star5 = 'star5',
    Star6 = 'star6',
    Star7 = 'star7',
    Star8 = 'star8',
    Star10 = 'star10',
    Star12 = 'star12',
    Star16 = 'star16',
    Star24 = 'star24',
    Star32 = 'star32',
    RoundRect = 'roundRect',
    Round1Rect = 'round1Rect',
    Round2SameRect = 'round2SameRect',
    Round2DiagRect = 'round2DiagRect',
    Ellipse = 'ellipse',
}

export enum ArrowsAndMarkersShapes {
    RightArrow = 'rightArrow',
    LeftArrow = 'leftArrow',
    UpArrow = 'upArrow',
    DownArrow = 'downArrow',
    LeftRightArrow = 'leftRightArrow',
    UpDownArrow = 'upDownArrow',
    QuadArrow = 'quadArrow',
    LeftRightUpArrow = 'leftRightUpArrow',
    BentArrow = 'bentArrow',
    UturnArrow = 'uturnArrow',
    CircularArrow = 'circularArrow',
    NotchedRightArrow = 'notchedRightArrow',
    HomePlate = 'homePlate',
    Chevron = 'chevron',
    LeftCircularArrow = 'leftCircularArrow',
    LeftRightCircularArrow = 'leftRightCircularArrow',
}

export enum OtherShapes {
    Plaque = 'plaque',
    Can = 'can',
    Cube = 'cube',
    Bevel = 'bevel',
    Donut = 'donut',
    NoSmoking = 'noSmoking',
    BlockArc = 'blockArc',
    FoldedCorner = 'foldedCorner',
}

export enum SpecialShapes {
    SmileyFace = 'smileyFace',
    Heart = 'heart',
    LightningBolt = 'lightningBolt',
    Sun = 'sun',
    Moon = 'moon',
    Cloud = 'cloud',
    Arc = 'arc',
    Backpack = 'backpack',
    Frame = 'frame',
    HalfFrame = 'halfFrame',
    Corner = 'corner',
    Chord = 'chord',
    Pie = 'pie',
    Teardrop = 'teardrop',
    WedgeRectCallout = 'wedgeRectCallout',
    WedgeRRectCallout = 'wedgeRRectCallout',
    WedgeEllipseCallout = 'wedgeEllipseCallout',
    CloudCallout = 'cloudCallout',
    BorderCallout1 = 'borderCallout1',
    BorderCallout2 = 'borderCallout2',
    BorderCallout3 = 'borderCallout3',
    AccentCallout1 = 'accentCallout1',
    AccentCallout2 = 'accentCallout2',
    AccentCallout3 = 'accentCallout3',
    Callout1 = 'callout1',
    Callout2 = 'callout2',
    Callout3 = 'callout3',
    ActionButtonBackPrevious = 'actionButtonBackPrevious',
    ActionButtonEnd = 'actionButtonEnd',
    ActionButtonForwardNext = 'actionButtonForwardNext',
    ActionButtonHelp = 'actionButtonHelp',
    ActionButtonHome = 'actionButtonHome',
    ActionButtonInformation = 'actionButtonInformation',
    ActionButtonMovie = 'actionButtonMovie',
    ActionButtonReturn = 'actionButtonReturn',
    ActionButtonSound = 'actionButtonSound',
}

/**
 * 20.1.9.18 prstGeom (Preset geometry)
 */
export type ShapeType = BasicShapes | ArrowsAndMarkersShapes | OtherShapes | SpecialShapes;
export type PresetGeometryType = ShapeType | 'custom';
