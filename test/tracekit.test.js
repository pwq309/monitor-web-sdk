import TestTracekit from '../src/tracekit';

beforeAll(() => {
    const window = {};
    window.navigator = {};
    global.window = window;
});

afterAll(() => {
    global.window = null;
});

test('test computeStackTrace for Error1', () => {
    let err = new Error('test');
    err.stack = 'Error: test';
    expect(TestTracekit.computeStackTrace(err)).toEqual({
        name: 'Error',
        message: 'test',
        url: 'http://localhost/',
    });
});

test('test computeStackTrace for object', () => {
    let obj = {
        t: 1
    };
    expect(TestTracekit.computeStackTrace(obj)).toEqual({
        name: undefined,
        message: undefined,
        url: 'http://localhost/',
    });
});

test('test computeStackTrace for Error2', () => {
    let err = new Error('test');
    let stackTrace = TestTracekit.computeStackTrace(err);
    expect(Array.isArray(stackTrace.stack)).toBe(true);
});

test('test computeStackTrace for safari Error', () => {
    let ex = new Error('test');
    ex.message = "Can't find variable: qq";
    ex.line = 59;
    ex.sourceId = 580238192;
    ex.sourceURL = 'http://localhost/';
    ex.expressionBeginOffset = 96;
    ex.expressionCaretOffset = 98;
    ex.expressionEndOffset = 98;
    ex.name = 'ReferenceError';
    expect(TestTracekit.computeStackTrace(ex)).toHaveProperty('stack');
});

test('test computeStackTrace for FIREFOX Error', () => {
    let ex = new Error('test');
    ex.message = 'qq is not defined';
    ex.fileName = 'http://localhost/';
    ex.lineNumber = 59;
    ex.columnNumber = 69;
    ex.stack = '...stack trace...';
    ex.name = 'ReferenceError';
    expect(TestTracekit.computeStackTrace(ex)).toHaveProperty('name');
});

test('test computeStackTrace for OPERA Error', () => {
    let ex = new Error('test');
    ex.message = 'qq is not defined';
    ex.name = 'ReferenceError';
    ex.sourceloc = '11  (pretty much useless, duplicates the info in ex.message)';
    ex.stacktrace = "n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'";

    expect(TestTracekit.computeStackTrace(ex)).toHaveProperty('name');
});

test('test computeStackTrace for exception', () => {
    let ex = new Error('test');
    ex.stack = 123;
    TestTracekit.debug = true;
    let result;
    try {
        TestTracekit.computeStackTrace(ex);
    } catch (error) {
        result = error;
    }
    expect({}.toString.call(result)).toBe('[object Error]');
});

