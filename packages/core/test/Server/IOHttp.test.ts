/**
 * @jest-environment jsdom
 */
import { IOHttp, IOHttpRequestType } from '../../src/Shared/IOHttp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

const child_process = require('child_process');
const os = require('os');

function osType() {
    if (os.type() === 'Windows_NT') {
        // windows
        return 'windows';
    }
    if (os.type() === 'Darwin') {
        // mac
        return 'mac';
    }
    if (os.type() === 'Linux') {
        // Linux
        return 'linux';
    }
    // Prompt not supported
    return '';
}

describe('IOHttp', () => {
    afterAll(async () => {
        // stop http server
        if (osType() === 'windows') {
            child_process.exec(
                'for /f "tokens=5" %a in (\'netstat -aon ^| find "0.0.0.0:3998" ^| find "LISTENING"\') do taskkill /f /pid %a'
            );
        } else if (osType() === 'mac') {
            // https://stackoverflow.com/a/36917850
            child_process.exec(
                "kill -9 `lsof -i TCP:3998 | awk '/LISTEN/{print $2}'`"
            );
        }
    });

    test('IOHttp Get Test', (done) => {
        const service = {
            actionName: 'setStyle',
            type: 'color',
            value: 'red',
        };
        IOHttp({
            contentType: 'application/json',
            url: 'http://127.0.0.1:3998/action/',
            data: service,
            type: IOHttpRequestType.POST,
            success: (json: any) => {
                expect(json.message.actionName).toEqual(service.actionName);
                done();
            },
        });
        // IOHttp({
        //     contentType: 'application/json',
        //     url: 'http://universheet.lashuju.com/action/',
        //     data: service,
        //     type: IOHttpRequestType.POST,
        //     success: (json: any) => {
        //         expect(json.message.actionName).toEqual(service.actionName);
        //         done();
        //     },
        // });
    });
});
