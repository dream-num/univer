import {
    BaseClipboardExtension,
    BaseClipboardExtensionFactory,
    handelExcelToJson,
    handelTableToJson,
    handlePlainToJson,
    handleTableColgroup,
    handleTableRowGroup,
    IClipboardData,
} from '@univerjs/base-ui';
import { ClipboardPlugin } from '../../ClipboardPlugin';

export class ClipboardExtension extends BaseClipboardExtension<ClipboardPlugin> {
    execute() {
        let content = this._data.html || this._data.plain;

        let data;
        let colInfo;
        let rowInfo;
        if (content) {
            var content1= `<html xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
            
            <head>
            <meta http-equiv=Content-Type content="text/html; charset=utf-8">
            <meta name=ProgId content=Excel.Sheet>
            <meta name=Generator content="Microsoft Excel 15">
            <link id=Main-File rel=Main-File
            href="file:///C:/Users/Alex/AppData/Local/Temp/msohtmlclip1/01/clip.htm">
            <link rel=File-List
            href="file:///C:/Users/Alex/AppData/Local/Temp/msohtmlclip1/01/clip_filelist.xml">
            <style>
            <!--table
                {mso-displayed-decimal-separator:"\.";
                mso-displayed-thousand-separator:"\,";}
            @page
                {margin:.75in .7in .75in .7in;
                mso-header-margin:.3in;
                mso-footer-margin:.3in;}
            .font5
                {color:windowtext;
                font-size:9.0pt;
                font-weight:400;
                font-style:normal;
                text-decoration:none;
                font-family:等线;
                mso-generic-font-family:auto;
                mso-font-charset:134;}
            tr
                {mso-height-source:auto;
                mso-ruby-visibility:none;}
            col
                {mso-width-source:auto;
                mso-ruby-visibility:none;}
            br
                {mso-data-placement:same-cell;}
            td
                {padding-top:1px;
                padding-right:1px;
                padding-left:1px;
                mso-ignore:padding;
                color:black;
                font-size:11.0pt;
                font-weight:400;
                font-style:normal;
                text-decoration:none;
                font-family:等线;
                mso-generic-font-family:auto;
                mso-font-charset:134;
                mso-number-format:General;
                text-align:general;
                vertical-align:middle;
                border:none;
                mso-background-source:auto;
                mso-pattern:auto;
                mso-protection:locked visible;
                white-space:nowrap;
                mso-rotate:0;}
            .xl65
                {white-space:normal;}
            .xl66
                {font-weight:700;
                border:.5pt solid #D9D9D9;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl67
                {font-weight:700;
                text-align:center;
                border:.5pt solid #D9D9D9;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl68
                {color:#0188FB;
                font-size:12.0pt;
                text-align:center;
                white-space:normal;}
            .xl69
                {color:#0188FB;
                text-align:center;
                background:#FFFBE0;
                mso-pattern:black none;
                white-space:normal;}
            .xl70
                {background:#BF9000;
                mso-pattern:black none;
                white-space:normal;}
            .xl71
                {background:#C27BA0;
                mso-pattern:black none;
                white-space:normal;}
            .xl72
                {background:#FF9900;
                mso-pattern:black none;
                white-space:normal;}
            .xl73
                {background:#38761D;
                mso-pattern:black none;
                white-space:normal;}
            .xl74
                {mso-number-format:"\[ENG\]d\\-mmm";
                text-align:center;
                white-space:normal;}
            .xl75
                {font-size:10.0pt;
                border:.5pt solid #D9D9D9;
                background:#FFFBE0;
                mso-pattern:black none;
                white-space:normal;}
            .xl76
                {font-size:10.0pt;
                text-align:left;
                white-space:normal;
                padding-left:24px;
                mso-char-indent-count:2;}
            .xl77
                {font-size:24.0pt;
                font-weight:700;
                white-space:normal;}
            .xl78
                {font-weight:700;
                text-align:center;
                border-top:none;
                border-right:none;
                border-bottom:none;
                border-left:.5pt solid #D9D9D9;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl79
                {font-weight:700;
                text-align:center;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl80
                {color:#5C5C5C;
                vertical-align:top;
                white-space:normal;}
            ruby
                {ruby-align:left;}
            rt
                {color:windowtext;
                font-size:9.0pt;
                font-weight:400;
                font-style:normal;
                text-decoration:none;
                font-family:等线;
                mso-generic-font-family:auto;
                mso-font-charset:134;
                mso-char-type:none;
                display:none;}
            -->
            </style>
            </head>
            
            <body link="#0563C1" vlink="#954F72">
            
            <table border=0 cellpadding=0 cellspacing=0 width=1336 style='border-collapse:
             collapse;width:1003pt'>
            <!--StartFragment-->
             <col width=253 style='mso-width-source:userset;mso-width-alt:8096;width:190pt'>
             <col width=146 style='mso-width-source:userset;mso-width-alt:4672;width:110pt'>
             <col width=73 style='mso-width-source:userset;mso-width-alt:2336;width:55pt'>
             <col width=72 span=12 style='width:54pt'>
             <tr height=76 style='mso-height-source:userset;height:57.0pt'>
              <td colspan=15 height=76 class=xl77 width=1336 style='height:57.0pt;
              width:1003pt'>A Schedule of Items</td>
             </tr>
             <tr height=40 style='mso-height-source:userset;height:30.0pt'>
              <td height=40 class=xl66 width=253 style='height:30.0pt;width:190pt'>Division
              of Project</td>
              <td class=xl67 width=146 style='border-left:none;width:110pt'>Responsible
              Person</td>
              <td colspan=13 class=xl78 width=937 style='border-left:none;width:703pt'>Date</td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl65 width=253 style='height:20.1pt;width:190pt'>General
              Project Manager</td>
              <td class=xl68 width=146 style='width:110pt'>@XXX</td>
              <td class=xl74 width=73 style='width:55pt'>1-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>2-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>3-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>4-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>5-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>6-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>7-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>8-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>9-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>10-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>11-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>12-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>13-Mar</td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl75 width=253 style='height:20.1pt;width:190pt'>1、Responsible
              Person of Model Section</td>
              <td class=xl69 width=146 style='width:110pt'>@George</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Advertisement
              Signboard</td>
              <td class=xl68 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Transport
              Ready</td>
              <td class=xl68 width=146 style='width:110pt'>@George</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl75 width=253 style='height:20.1pt;width:190pt'>2、Head
              of Special Effects Section</td>
              <td class=xl69 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Render
              Output Parameter Test</td>
              <td class=xl68 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Camera
              Moving Mirror</td>
              <td class=xl68 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl75 width=253 style='height:20.1pt;width:190pt'>3、Responsible
              Person of Rendering Section</td>
              <td class=xl69 width=146 style='width:110pt'>@Jennifer</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Scene
              Dynamic Element Design</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Sky Map
              Selection</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Reference
              Scenario Data Collection</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Scene
              Dynamic Element Design</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl73 width=73 style='width:55pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=127 style='mso-height-source:userset;height:95.25pt'>
              <td colspan=15 height=127 class=xl80 width=1336 style='height:95.25pt;
              width:1003pt'>Instructions:<br>
                ①Project division - Fill in the specific division of labor after the
              project is disassembled:<br>
                ②Responsible Person - Enter the responsible person's name here:<br>
                ③Date-The specific execution time of the project (detailed to the date of a
              certain month), and the gray color block marks the planned real-time time of
              the division of labor of the project (for example,the specific execution time
              of [regional scene model arrangement and construction] is the 2 days marked
              in gray.<span style='mso-spacerun:yes'> </span></td>
             </tr>
            <!--EndFragment-->
            </table>
            
            </body>
            
            </html>            
            `

            content= `<html xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
            
            <head>
            <meta http-equiv=Content-Type content="text/html; charset=utf-8">
            <meta name=ProgId content=Excel.Sheet>
            <meta name=Generator content="Microsoft Excel 15">
            <link id=Main-File rel=Main-File
            href="file:///C:/Users/Alex/AppData/Local/Temp/msohtmlclip1/01/clip.htm">
            <link rel=File-List
            href="file:///C:/Users/Alex/AppData/Local/Temp/msohtmlclip1/01/clip_filelist.xml">
            <style>
            <!--table
                {mso-displayed-decimal-separator:"\.";
                mso-displayed-thousand-separator:"\,";}
            @page
                {margin:.75in .7in .75in .7in;
                mso-header-margin:.3in;
                mso-footer-margin:.3in;}
            .font5
                {color:windowtext;
                font-size:9.0pt;
                font-weight:400;
                font-style:normal;
                text-decoration:none;
                font-family:等线;
                mso-generic-font-family:auto;
                mso-font-charset:134;}
            tr
                {mso-height-source:auto;
                mso-ruby-visibility:none;}
            col
                {mso-width-source:auto;
                mso-ruby-visibility:none;}
            br
                {mso-data-placement:same-cell;}
            td
                {padding-top:1px;
                padding-right:1px;
                padding-left:1px;
                mso-ignore:padding;
                color:black;
                font-size:11.0pt;
                font-weight:400;
                font-style:normal;
                text-decoration:none;
                font-family:等线;
                mso-generic-font-family:auto;
                mso-font-charset:134;
                mso-number-format:General;
                text-align:general;
                vertical-align:middle;
                border:none;
                mso-background-source:auto;
                mso-pattern:auto;
                mso-protection:locked visible;
                white-space:nowrap;
                mso-rotate:0;}
            .xl65
                {white-space:normal;}
            .xl66
                {font-weight:700;
                border:.5pt solid #D9D9D9;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl67
                {font-weight:700;
                text-align:center;
                border:.5pt solid #D9D9D9;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl68
                {color:#0188FB;
                font-size:12.0pt;
                text-align:center;
                white-space:normal;}
            .xl69
                {color:#0188FB;
                text-align:center;
                background:#FFFBE0;
                mso-pattern:black none;
                white-space:normal;}
            .xl70
                {background:#BF9000;
                mso-pattern:black none;
                white-space:normal;}
            .xl71
                {background:#C27BA0;
                mso-pattern:black none;
                white-space:normal;}
            .xl72
                {background:#FF9900;
                mso-pattern:black none;
                white-space:normal;}
            .xl73
                {background:#38761D;
                mso-pattern:black none;
                white-space:normal;}
            .xl74
                {mso-number-format:"\[ENG\]d\\-mmm";
                text-align:center;
                white-space:normal;}
            .xl75
                {font-size:10.0pt;
                border:.5pt solid #D9D9D9;
                background:#FFFBE0;
                mso-pattern:black none;
                white-space:normal;}
            .xl76
                {font-size:10.0pt;
                text-align:left;
                white-space:normal;
                padding-left:24px;
                mso-char-indent-count:2;}
            .xl77
                {font-size:24.0pt;
                font-weight:700;
                white-space:normal;}
            .xl78
                {font-weight:700;
                text-align:center;
                border-top:none;
                border-right:none;
                border-bottom:none;
                border-left:.5pt solid #D9D9D9;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl79
                {font-weight:700;
                text-align:center;
                background:#FFE266;
                mso-pattern:black none;
                white-space:normal;}
            .xl80
                {color:#5C5C5C;
                vertical-align:top;
                white-space:normal;}
            ruby
                {ruby-align:left;}
            rt
                {color:windowtext;
                font-size:9.0pt;
                font-weight:400;
                font-style:normal;
                text-decoration:none;
                font-family:等线;
                mso-generic-font-family:auto;
                mso-font-charset:134;
                mso-char-type:none;
                display:none;}
            -->
            </style>
            </head>
            
            <body link="#0563C1" vlink="#954F72">
            
            <table border=0 cellpadding=0 cellspacing=0 width=1336 style='border-collapse:
             collapse;width:1003pt'>
            <!--StartFragment-->
             <col width=253 style='mso-width-source:userset;mso-width-alt:8096;width:190pt'>
             <col width=146 style='mso-width-source:userset;mso-width-alt:4672;width:110pt'>
             <col width=73 style='mso-width-source:userset;mso-width-alt:2336;width:55pt'>
             <col width=72 span=12 style='width:54pt'>
             <tr height=76 style='mso-height-source:userset;height:57.0pt'>
              <td colspan=15 height=76 class=xl77 width=1336 style='height:57.0pt;
              width:1003pt'>A Schedule of Items</td>
             </tr>
             <tr height=40 style='mso-height-source:userset;height:30.0pt'>
              <td height=40 class=xl66 width=253 style='height:30.0pt;width:190pt'>Division
              of Project</td>
              <td class=xl67 width=146 style='border-left:none;width:110pt'>Responsible
              Person</td>
              <td colspan=13 class=xl78 width=937 style='border-left:none;width:703pt'>Date</td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl65 width=253 style='height:20.1pt;width:190pt'>General
              Project Manager</td>
              <td class=xl68 width=146 style='width:110pt'>@XXX</td>
              <td class=xl74 width=73 style='width:55pt'>1-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>2-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>3-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>4-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>5-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>6-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>7-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>8-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>9-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>10-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>11-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>12-Mar</td>
              <td class=xl74 width=72 style='width:54pt'>13-Mar</td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl75 width=253 style='height:20.1pt;width:190pt'>1、Responsible
              Person of Model Section</td>
              <td class=xl69 width=146 style='width:110pt'>@George</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Advertisement
              Signboard</td>
              <td class=xl68 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl70 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Transport
              Ready</td>
              <td class=xl68 width=146 style='width:110pt'>@George</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl75 width=253 style='height:20.1pt;width:190pt'>2、Head
              of Special Effects Section</td>
              <td class=xl69 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Render
              Output Parameter Test</td>
              <td class=xl68 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl71 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Camera
              Moving Mirror</td>
              <td class=xl68 width=146 style='width:110pt'>@Paul</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl75 width=253 style='height:20.1pt;width:190pt'>3、Responsible
              Person of Rendering Section</td>
              <td class=xl69 width=146 style='width:110pt'>@Jennifer</td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Scene
              Dynamic Element Design</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl72 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Sky Map
              Selection</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Reference
              Scenario Data Collection</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl65 width=73 style='width:55pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=26 style='mso-height-source:userset;height:20.1pt'>
              <td height=26 class=xl76 width=253 style='height:20.1pt;width:190pt'>Scene
              Dynamic Element Design</td>
              <td class=xl65 width=146 style='width:110pt'></td>
              <td class=xl73 width=73 style='width:55pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl73 width=72 style='width:54pt'>　</td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
              <td class=xl65 width=72 style='width:54pt'></td>
             </tr>
             <tr height=127 style='mso-height-source:userset;height:95.25pt'>
              <td colspan=15 height=127 class=xl80 width=1336 style='height:95.25pt;
              width:1003pt'>Instructions:<br>
                ①Project division - Fill in the specific division of labor after the
              project is disassembled:<br>
                ②Responsible Person - Enter the responsible person's name here:<br>
                ③Date-The specific execution time of the project (detailed to the date of a
              certain month), and the gray color block marks the planned real-time time of
              the division of labor of the project (for example,the specific execution time
              of [regional scene model arrangement and construction] is the 2 days marked
              in gray.<span style='mso-spacerun:yes'> </span></td>
             </tr>
            <!--EndFragment-->
            </table>
            
            </body>
            
            </html>            
            `
            if (content.indexOf('xmlns:x="urn:schemas-microsoft-com:office:excel"') > -1) {
                data = handelExcelToJson(content);
                colInfo = handleTableColgroup(content);
                rowInfo = handleTableRowGroup(content);
            } else if (content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
                data = handelTableToJson(content);
                colInfo = handleTableColgroup(content);
                rowInfo = handleTableRowGroup(content);
            } else {
                data = handlePlainToJson(content);
            }
        }

        this._plugin.getUniverPaste().pasteTo({
            data,
            colInfo,
            rowInfo,
        });
    }
}

export class ClipboardExtensionFactory extends BaseClipboardExtensionFactory<ClipboardPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: IClipboardData): BaseClipboardExtension {
        return new ClipboardExtension(data, this._plugin);
    }

    check(data: IClipboardData): false | BaseClipboardExtension {
        const content = data.html || data.plain;
        if (content && content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
            return this.create(data);
        }

        return false;
    }
}
