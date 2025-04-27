import TestStringify from '../src/safestr';

beforeAll(() => {
    const window = {};
    window.navigator = {};
    global.window = window;
});

afterAll(() => {
    global.window = null;
});

test('test stringify number', () => {
    expect(TestStringify(123)).toBe('123');
});

test('test stringify string', () => {
    expect(TestStringify('abc')).toBe('"abc"');
});

test('test stringify object', () => {
    let obj = {
        t: 1
    };
    expect(TestStringify(obj)).toBe('{"t":1}');
});

test('test stringify circular structure object', () => {
    let obj = {
        t: 1
    };
    obj.d = obj;
    expect(TestStringify(obj)).toBe('{"t":1,"d":"[Circular ~]"}');
});

test('test stringify Error', () => {
    let err = new Error('test');
    err.stack = 'Error: test';
    err.corona = 'test';
    expect(TestStringify(err)).toBe('{"stack":"Error: test","message":"test","name":"Error","corona":"test"}');
});
