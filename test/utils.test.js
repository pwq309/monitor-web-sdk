import TestUtils from '../src/utils';

beforeAll(() => {
    const window = {};
    window.navigator = {};
    window.fetch = {};
    global.window = window;
});

afterAll(() => {
    global.window = null;
});

describe('test isError', () => {
    test('test [object Error]', () => {
        let error = new Error('test');
        expect(TestUtils.isError(error)).toBe(true);
    });
    test('test [object DOMException]', () => {
        let error = new DOMException();
        expect(TestUtils.isError(error)).toBe(true);
    });
    test('test [object object]', () => {
        let error = {};
        expect(TestUtils.isError(error)).toBe(false);
    });
    test('test [object object]', () => {
        let error = {};
        expect(TestUtils.isError(error)).toBe(false);
    });
});

describe('test supportsErrorEvent && isErrorEvent', () => {
    test('test supportsErrorEvent true', () => {
        expect(TestUtils.supportsErrorEvent()).toBe(true);
    });

    test('test isErrorEvent true', () => {
        let obj = new ErrorEvent('');
        expect(TestUtils.isErrorEvent(obj)).toBe(true);
    });

    test('test isErrorEvent false', () => {
        let obj = {};
        expect(TestUtils.isErrorEvent(obj)).toBe(false);
    });

    test('test supportsErrorEvent false', () => {
        delete window.ErrorEvent;
        expect(TestUtils.supportsErrorEvent()).toBe(false);
    });
});

describe('test isUndefined', () => {
    test('test isUndefined true', () => {
        expect(TestUtils.isUndefined(undefined)).toBe(true);
    });

    test('test isUndefined false', () => {
        expect(TestUtils.isUndefined({})).toBe(false);
    });
});

describe('test isFunction', () => {
    test('test isFunction true', () => {
        expect(TestUtils.isFunction(() => {})).toBe(true);
    });

    test('test isFunction false', () => {
        expect(TestUtils.isFunction({})).toBe(false);
    });
});

describe('test isPlainObject', () => {
    test('test isPlainObject false', () => {
        expect(TestUtils.isPlainObject(() => {})).toBe(false);
    });

    test('test isPlainObject true', () => {
        expect(TestUtils.isPlainObject({})).toBe(true);
    });
});

describe('test isString', () => {
    test('test isString false', () => {
        expect(TestUtils.isString(111)).toBe(false);
    });

    test('test isString true', () => {
        expect(TestUtils.isString('111')).toBe(true);
    });
});

describe('test isArray', () => {
    test('test isArray false', () => {
        expect(TestUtils.isArray(111)).toBe(false);
    });

    test('test isArray true', () => {
        expect(TestUtils.isArray([])).toBe(true);
    });
});

describe('test isXMLHttpRequest', () => {
    test('test isXMLHttpRequest false', () => {
        expect(TestUtils.isXMLHttpRequest(111)).toBe(false);
    });

    test('test isXMLHttpRequest true', () => {
        let xhr = new XMLHttpRequest('');
        expect(TestUtils.isXMLHttpRequest(xhr)).toBe(true);
    });
});

describe('test isBoolean', () => {
    test('test isBoolean false', () => {
        expect(TestUtils.isBoolean(111)).toBe(false);
    });

    test('test isBoolean true', () => {
        expect(TestUtils.isBoolean(false)).toBe(true);
    });

    test('test isBoolean true', () => {
        expect(TestUtils.isBoolean(true)).toBe(true);
    });
});

describe('test isEmptyObject', () => {
    test('test isEmptyObject false', () => {
        expect(TestUtils.isEmptyObject(111)).toBe(false);
    });

    test('test isEmptyObject true', () => {
        expect(TestUtils.isEmptyObject({})).toBe(true);
    });

    test('test isEmptyObject false 2', () => {
        expect(TestUtils.isEmptyObject({
            t: 1
        })).toBe(false);
    });
});

describe('test supportsFetch', () => {
    test('test supportsFetch false', () => {
        expect(TestUtils.supportsFetch()).toBe(false);
    });
});

test('test hasKey', () => {
    let obj = {
        t: 1
    };
    expect(TestUtils.hasKey(obj, 't')).toBe(true);
});

test('test each', () => {
    let testAry = {
        a: 1,
        b: 2,
        c: 3
    };
    let result = 0;
    TestUtils.each(testAry, (key, value) => {
        result += value;
    });

    expect(result).toBe(6);
});
describe('test objectMerge', () => {
    test('test objectMerge success', () => {
        let testAry = {
            a: 1,
            b: 2,
            c: 3
        };
        let testAry2 = {
            d: 4
        };
    
        expect(TestUtils.objectMerge(testAry, testAry2)).toEqual({
            a: 1,
            b: 2,
            c: 3,
            d: 4
        });
    });

    test('test objectMerge exception', () => {
        let testAry = {
            a: 1,
            b: 2,
            c: 3
        };
    
        expect(TestUtils.objectMerge(testAry)).toEqual({
            a: 1,
            b: 2,
            c: 3
        });
    });
});


test('test joinRegExp', () => {
    let ignoreErrors = [/^Script error\.?$/, 'development'];
    let result = TestUtils.joinRegExp(ignoreErrors);

    expect(Object.prototype.toString.call(result)).toBe('[object RegExp]');
});

describe('test parseUrl', () => {
    test('test parseUrl falied', () => {
        expect(TestUtils.parseUrl(111)).toEqual({});
    });

    test('test parseUrl success', () => {
        expect(TestUtils.parseUrl('https://st.music.174.com/mlog/summary.html?type=3')).toEqual({
            protocol: 'https',
            host: 'st.music.174.com',
            path: '/mlog/summary.html',
            relative: '/mlog/summary.html?type=3'
        });
    });
});

describe('test safeJoin', () => {
    test('test safeJoin exception', () => {
        expect(TestUtils.safeJoin('123')).toBe('');
    });

    test('test safeJoin success', () => {
        expect(TestUtils.safeJoin([1,2,3], '$')).toBe('1$2$3');
    });
});

describe('test htmlTreeAsString', () => {
    test('test safeJoin success', () => {
        let elem = {
            parentNode: {
                parentNode: {
                    parentNode: null,
                    className: 'container',
                    getAttribute: () => 'attr3'
                },
                tagName: 'SECTION',
                className: 'container',
                getAttribute: () => 'attr2'
            },
            tagName: 'DIV',
            id: 'SJIS',
            getAttribute: () => 'attr'
        };
        expect(TestUtils.htmlTreeAsString(elem)).toBe('div#SJIS[type="attr"][name="attr"][title="attr"][alt="attr"]');
    });
});

test('test fill', () => {
    let oritrack = [];
    let origin = {
        t: {
            usage: 'test'
        }
    };
    let replace = () => {
        return {
            usage: 'test2'
        }
    };
    TestUtils.fill(origin, 't', replace, oritrack);

    expect(oritrack).toEqual([[
        {
            t: {
                usage: 'test2',
                __corona__: true,
                __orig__: {
                    usage: 'test'
                }
            }
        },
        't',
        {
            usage: 'test'
        }
    ]]);
});

describe('test isUrl', () => {
    test('test isUrl true', () => {
        expect(TestUtils.isUrl('https://clientlog.baechat.my/api/feedback/weblog/sys')).toBe(true);
    });

    test('test isUrl false', () => {
        expect(TestUtils.isUrl({})).toBe(false);
    });
});