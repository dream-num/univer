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

const locale = {
    'drawing-ui': {
        'image-cropper': {
            error: 'Cannot crop non-image objects.',
        },
        objectListPanel: {
            title: 'Object list',
            empty: 'No objects',
            showAll: 'Show all',
            hideAll: 'Hide all',
            moveForward: 'Bring forward',
            moveBackward: 'Send backward',
            close: 'Close',
            show: 'Show',
            hide: 'Hide',
            lock: 'Lock',
            unlock: 'Unlock',
            name: 'Name',
            nameInput: 'Object name',
            description: 'Description',
            descriptionPlaceholder: 'Add description',
            details: 'Details',
            locate: 'Locate',
            expand: 'Expand',
            collapse: 'Collapse',
            dragToReorder: 'Drag to reorder',
            search: 'Search objects',
            filterAll: 'All',
            filterHidden: 'Hidden',
            filterLocked: 'Locked',
            sectionCanvas: 'Canvas layer',
            sectionFloating: 'Floating layer',
            typeNames: {
                object: 'Object',
                shape: 'Shape',
                connector: 'Connector',
                image: 'Image',
                chart: 'Chart',
                table: 'Table',
                smartArt: 'SmartArt',
                video: 'Video',
                group: 'Group',
                unit: 'Unit',
                dom: 'DOM',
                text: 'Text',
                placeholder: 'Placeholder',
                container: 'Container',
            },
            noSelection: 'Select an object to edit its details',
        },
        'image-panel': {
            arrange: {
                title: 'Arrange',
                forward: 'Bring Forward',
                backward: 'Send Backward',
                front: 'Bring to Front',
                back: 'Send to Back',
            },
            transform: {
                title: 'Transform',
                rotate: 'Rotate (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Width (px)',
                height: 'Height (px)',
                lock: 'Lock Ratio (%)',
            },
            crop: {
                title: 'Crop',
                start: 'Start Crop',
                mode: 'Free',
            },
            group: {
                title: 'Group',
                group: 'Group',
                unGroup: 'Ungroup',
            },
            align: {
                title: 'Align',
                default: 'Select Align Type',
                left: 'Align Left',
                center: 'Align Center',
                right: 'Align Right',
                top: 'Align Top',
                middle: 'Align Middle',
                bottom: 'Align Bottom',
                horizon: 'Distribute Horizontally ',
                vertical: 'Distribute Vertically ',
            },
            null: 'No Object Selection',
        },
        'image-popup': {
            replace: 'Replace',
            delete: 'Delete',
            edit: 'Edit',
            crop: 'Crop',
            reset: 'Reset Size',
        },
        'image-text-wrap': {
            title: 'Text Wrapping',
            wrappingStyle: 'Wrapping Style',
            square: 'Square',
            topAndBottom: 'Top and Bottom',
            inline: 'In line with text',
            behindText: 'Behind text',
            inFrontText: 'In front of text',
            wrapText: 'Wrap text',
            bothSide: 'Both sides',
            leftOnly: 'Left only',
            rightOnly: 'Right only',
            distanceFromText: 'Distance from text',
            top: 'Top(px)',
            left: 'Left(px)',
            bottom: 'Bottom(px)',
            right: 'Right(px)',
        },
    },
};

export default locale;
