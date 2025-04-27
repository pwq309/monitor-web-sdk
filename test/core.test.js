import TestCore from '../src/core';

beforeAll(() => {
    const window = {};
    window.navigator = {};
    window.location = {
        hostname: ''
    };
    global.window = window;
});

afterAll(() => {
    global.window = null;
});

let windowSpy;

beforeEach(() => {
    windowSpy = jest.spyOn(global, 'window', 'get');
});

afterEach(() => {
    windowSpy.mockRestore();
});

test('test core setup failed', () => {
    const Coronacore = new TestCore();
    const corona = Coronacore.config(null);
    expect(corona._isCoronaInstalled).toBe(false);
});

test('test core setup custom autoBreadcrumbs', () => {
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalOptions.autoBreadcrumbs).toEqual({
        xhr: true,
        console: true,
        dom: true,
        location: true,
        corona: false,
        fetch: false
    });
});

test('test core setup autoBreadcrumbs false', () => {
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'test', true, {
        autoBreadcrumbs: false
    }).install();
    expect(corona._globalOptions.autoBreadcrumbs).toBe(false);
});

test('test core setup autoBreadcrumbs true', () => {
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: true
    }).install();
    expect(corona._globalOptions.autoBreadcrumbs).toEqual({
        xhr: true,
        console: true,
        dom: true,
        location: true,
        corona: false,
    });
});

test('test core setup custom instrument', () => {
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'test', true, {
        instrument: {
            onerror: true
        }
    }).install();
    expect(corona._globalOptions.instrument).toEqual({
        tryCatch: true,
        onerror: true
    });
});

test('test core captureException', () => {
    const Coronacore = new TestCore();
    const err = new ErrorEvent('123');
    const result = Coronacore.captureException(err);
    expect(result).toHaveProperty('_tag');
});

test('test core captureMessage ignore', () => {
    const Coronacore = new TestCore();
    Coronacore.config(36, 'test', true).install();
    const err = 'Script error.';
    const result = Coronacore.captureMessage(err);
    expect(result).toBe(null);
});

test('test core wrap exception', () => {
    const Coronacore = new TestCore();
    const result = Coronacore.wrap({});
    expect(result).toEqual({});
});

test('test core wrap twice', () => {
    const Coronacore = new TestCore();
    let options = () => 'options';
    options.__corona_wrapper__ = {
        wrapped: true
    }
    let func = () => 'func';
    const result = Coronacore.wrap(options, func);
    expect(result).toEqual({
        wrapped: true
    });
});

test('test core wrapped exception', () => {
    const Coronacore = new TestCore();
    let options = () => {
        throw new Error('options test');
    };
    options.tag = 'corona';
    let func = () => {
        throw new Error('func test');
    };
    func.tag = 'corona';
    let before = () => {
        throw new Error('before test');
    };
    const result = Coronacore.wrap(options, func, before);
    expect(result).toHaveProperty('__corona__', true);
});

test('test core captureBreadcrumb exceed max length', () => {
    const Coronacore = new TestCore();

    const breadcrumb = {
        type: 'http',
        category: 'fetch',
        data: 'xxx',
    }
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    Coronacore.captureBreadcrumb(breadcrumb);
    const result = Coronacore.captureBreadcrumb(breadcrumb);
    expect(result._breadcrumbs).toHaveLength(10);
});

test('test core _ignoreNextOnError', () => {
    const Coronacore = new TestCore();

    Coronacore._handleOnErrorStackInfo();
    Coronacore._ignoreNextOnError();
    Coronacore._handleOnErrorStackInfo();

    expect(Coronacore._ignoreOnError).toBe(1);
});

test('test core _breadcrumbEventHandler click twice', () => {
    const Coronacore = new TestCore();

    let clickHandler = Coronacore._breadcrumbEventHandler('click');
    Coronacore._lastCapturedEvent = 'click';
    let result = clickHandler('click');

    expect(result).toBe(undefined);
});

test('test core _breadcrumbEventHandler click', () => {
    const Coronacore = new TestCore();

    let clickHandler = Coronacore._breadcrumbEventHandler('click');

    clickHandler('click');

    expect(Coronacore._breadcrumbs).toHaveLength(1);
});

test('test core _captureUrlChange', () => {
    window.location = {
        href: 'http://st.music.174.com/mlog/result.html'
    };
    const Coronacore = new TestCore();
    Coronacore.config(36, 'test', true).install();
    let from = 'http://st.music.174.com/mlog/mlog.html?t=1&s=2';
    let to = 'http://st.music.174.com/mlog/index.html';
    Coronacore._captureUrlChange(from, to);
    let request = window.XMLHttpRequest && new window.XMLHttpRequest();
    request.open('GET', 'http://st.music.174.com/mlog/result.html');
    request.onreadystatechange = () => {
        if (request.readyState !== 4) {
            return null;
        } else if (request.status === 200) {
            return 'success';
        }
    };
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send('xxx');
    expect(Coronacore._breadcrumbs).toHaveLength(1);
});

test('test core _captureUrlChange', () => {
    window.location = {
        href: 'http://st.music.174.com/mlog/result.html'
    };
    const Coronacore = new TestCore();
    Coronacore.config(36, 'test', true).install();
    let from = 'http://st.music.174.com/mlog/mlog.html?t=1&s=2';
    let to = 'http://st.music.174.com/mlog/index.html';
    Coronacore._captureUrlChange(from, to);
    let request = window.XMLHttpRequest && new window.XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState !== 4) {
            return null;
        } else if (request.status === 200) {
            return 'success';
        }
    };
    request.open('GET', 'http://st.music.174.com/mlog/result.html');
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send('xxx');
    expect(Coronacore._breadcrumbs).toHaveLength(1);
});


test('test core captureMessage fetch', () => {
    window.fetch = () => window;
    window.then = () => window;
    window.catch = () => { };
    window.Headers = () => { };
    window.Request = () => { };
    window.Response = () => { };
    const Coronacore = new TestCore();
    Coronacore.config(36, 'test', true).install();
    const err = 'corona test';
    const breadcrumb = {
        type: 'http',
        category: 'fetch',
        data: 'xxx',
    }
    Coronacore.captureBreadcrumb(breadcrumb);
    const result = Coronacore.captureMessage(err);
    expect(result).toHaveProperty('_lastData');
});

test('test core _patchFunctionToString', () => {
    const Coronacore = new TestCore();
    Coronacore._patchFunctionToString();
    expect(Coronacore).toHaveProperty('_originalFunctionToString');
});

test('test core _evaluateHash', () => {
    const Coronacore = new TestCore();
    const hash = {
        a: 1,
        b: () => 2
    };
    const result = Coronacore._evaluateHash(hash);
    expect(result).toEqual({
        a: 1,
        b: 2
    });
});

test('test auto match hostname choose test upload api', () => {
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'test', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://qa.igame.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'st.k.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.k.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api2', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'look.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.music.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api3', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'stlook.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.music.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api4', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'iplay.174.com.cn'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.music.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api5', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'music.iplay.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.music.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api6', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: '2iplay.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.music.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api7', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'dev-look.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.music.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api8 for friend', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'st.friend.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://clientlog.friend.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api9 for crush', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'h5.crush.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://api.crush.174.com/api/feedback/weblog/sys');
});

test('test auto match hostname choose prod upload api10 for mirth', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'st.wave.174.com'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    expect(corona._globalServer).toEqual('http://api.wave.174.com/api/feedback/weblog/sys');
});

test('test setEventUrl', () => {
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'dev.test.baechat.my'
        }
    }));
    const Coronacore = new TestCore();
    const corona = Coronacore.config(36, 'prod', true, {
        autoBreadcrumbs: {
            fetch: false
        }
    }).install();
    Coronacore.setEventUrl('http://clientlog.baechat.my/api/feedback/weblog/sys')
    expect(corona._globalServer).toEqual('http://clientlog.baechat.my/api/feedback/weblog/sys');
});
