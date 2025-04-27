import TestConsole from '../src/console';

beforeAll(() => {
    const window = {};
    window.navigator = {};
    global.window = window;
});

afterAll(() => {
    global.window = null;
});

test('wrap console warn', () => {
    TestConsole.wrapMethod(console, 'warn', () => {
        throw new Error('wrapMethod test');
    });
    function getConsoleWrapFn() {
        console.warn('test');
    }
    expect(getConsoleWrapFn).toThrow('wrapMethod test');
});

test('wrap console assert', () => {
    TestConsole.wrapMethod(console, 'assert', (msg) => {
        throw new Error('wrapMethod test');
    });
    function getConsoleWrapFn() {
        console.assert(5 % 2 === 0);
    }
    expect(getConsoleWrapFn).toThrow('wrapMethod test');
});

test('wrap console null', () => {
    expect(TestConsole.wrapMethod(console, 'xxx', (msg) => {
        throw new Error('wrapMethod test');
    })).toBe(undefined);
});

test('wrap console fatal with originalConsole', () => {
    let originFunc = {
        fatal: () => {}
    }
    let result = '';
    TestConsole.wrapMethod(originFunc, 'fatal', () => {
        result = 'fatal';
    });
    originFunc.fatal('test');
    expect(result).toBe('fatal');
});
