import TestConfig from '../src/config';

beforeAll(() => {
    const window = {};
    window.navigator = {};
    global.window = window;
});

afterAll(() => {
    global.window = null;
});

test('config', () => {
    expect(TestConfig).toEqual({
        ignoreErrors: [
            'diableNightMode is not defined',
            'Can\'t find variable: IsClickShowFun',
            'Cannot redefine property: BCMain',
        ],
        sampleRate: 1,
    });
});

