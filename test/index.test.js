import TestIndex from '../src/index';

beforeAll(() => {
    const window = {};
    window.navigator = {};
    global.window = window;
});

afterAll(() => {
    global.window = null;
});

test('test init exception', () => {
    expect(TestIndex(1)).toBe(null);
});

test('test init success', () => {
    expect(TestIndex({
        id: 1,
        env: 'dev'
    })).toHaveProperty('info');
});

test('test uploadCacheError in dev', () => {
    let err = new Error('test');
    let err2 = new Error('test2');
    err2.type = '__corona_wrapper__';
    let err3 = new ErrorEvent('');
    let rej = Promise.reject('test');
    let rej2 = {
        usage: 'for test'
    };
    let rej3 = new XMLHttpRequest('');
    window.corona_error_cache = {};
    window.corona_error_cache.data = [{
        event: 'error',
        e: err
    }, {
        event: 'error',
        e: err2
    }, {
        event: 'error',
        e: err3
    }, {
        event: 'unhandledrejection',
        e: rej
    }, {
        event: 'unhandledrejection',
        e: rej2
    }, {
        event: 'unhandledrejection',
        e: rej3
    }];
    const corona = TestIndex({
        id: 1,
        env: 'dev'
    });
    Promise.reject('test2');
    corona.info('info', {
        usage: 'for test'
    });
    corona.info({
        usage: 'for test'
    });
    corona.info(err);
    corona.warn('warn', {
        usage: 'for test'
    });
    corona.warn({
        usage: 'for test'
    });
    corona.warn(err);
    corona.error('error', {
        usage: 'for test'
    }, true, 'TypeError');
    corona.error({
        usage: 'for test'
    });
    corona.error({
        usage: 'for test'
    });
    corona.error(err2);
    window.location = {
        href: 'http://st.music.174.com/mlog/result.html',
        hostname: 'st.music.174.com'
    };
    corona.error(err2, {
        usage: 'for test'
    });
    expect(window.corona_error_cache).toBeUndefined();
});


