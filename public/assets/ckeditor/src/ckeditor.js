/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter.js';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount.js';
import Specialcharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import Mathematics from 'ckeditor5-math/src/math';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';

export default class ClassicEditor extends ClassicEditorBase { }

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
    Alignment,
    Autoformat,
    BlockQuote,
    Bold,
    Italic,
    Underline,
    Subscript,
    Superscript,
    CodeBlock,
    Essentials,
    FontSize,
    FontColor,
    FontBackgroundColor,
    FontFamily,
    Heading,
    Image,
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    Italic,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    SimpleUploadAdapter,
    Specialcharacters,
    SpecialCharactersEssentials,
    Table,
    TableToolbar,
    TextTransformation,
    WordCount,
    Mathematics
];

// Editor configuration.
ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'bold',
            'italic',
            'underline',
            'subscript',
            'superscript',
            '|',
            'fontSize',
            'fontColor',
            'fontBackgroundColor',
            'fontFamily',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'link',
            'math',
            'imageUpload',
            'insertTable',
            'codeBlock',
            'specialCharacters',
            '|',
            'indent',
            'outdent',
            '|',
            'undo',
            'redo'
        ]
    },
    image: {
        toolbar: [
            'resizeImage',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            '|',
            'toggleImageCaption',
            'imageTextAlternative'
        ],
        resizeUnit: 'px',
        resizeOptions: [
            {
                name: 'resizeImage:original',
                label: 'Original',
                value: null
            },
            {
                name: 'resizeImage:50',
                label: '50px',
                value: '50'
            },
            {
                name: 'resizeImage:100',
                label: '100px',
                value: '100'
            },
            {
                name: 'resizeImage:200',
                label: '200px',
                value: '200'
            }
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    link: {
        addTargetToExternalLinks: true
    },
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en',
    math: {
        engine: 'mathjax', // or katex or function. E.g. (equation, element, display) => { ... }
        lazyLoad: undefined, // async () => { ... }, called once before rendering first equation if engine doesn't exist. After resolving promise, plugin renders equations.
        outputType: 'script', // or span
        forceOutputType: false, // forces output to use outputType
        enablePreview: true, // Enable preview view
        previewClassName: [], // Class names to add to previews
        popupClassName: [] // Class names to add to math popup balloon
    },
    fontFamily: {
        options: [
            'Hindi',
            // 'DevLys',
            // 'Raavi',
            // 'Satluj',
            // 'Vijaya',
            // 'Latha',
            // 'Madhu',
            // 'Amar Bangla Normal',
            // 'Arjun',
            // 'Sawarabi Gothic',
            'Arial, Helvetica, sans-serif',
            'Comic Sans MS, cursive',
            'Courier New, Courier, monospace',
            'Georgia, serif',
            'Lucida Sans Unicode, Lucida Grande, sans-serif',
            'Tahoma, Geneva, sans-serif',
            'Times New Roman, Times, serif',
            'Trebuchet MS, Helvetica, sans-serif',
            'Verdana, Geneva, sans-serif'
        ]
    }
};
