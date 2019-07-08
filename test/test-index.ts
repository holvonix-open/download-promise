import * as assert from 'assert';
import * as tmp from 'tmp-promise';
import * as request from 'request';
import * as download from '../src/index';
import * as fs from 'fs';

import * as nock from 'nock';
import { Readable } from 'stream';

describe('Streaming Downloads', () => {
  describe('URLs', () => {
    beforeEach(() => {
      nock.disableNetConnect();
    });
    afterEach(() => {
      nock.enableNetConnect();
    });
    it('works on small files', () => {
      return (async () => {
        nock('https://example.com/')
          .get('/r200')
          .reply(200, { a: 100, b: 'hello' });
        const { path, cleanup } = await tmp.file();
        await download.download(request.get('https://example.com/r200'), path);
        assert.deepStrictEqual(
          fs.readFileSync(path, 'utf-8'),
          '{"a":100,"b":"hello"}'
        );
        await cleanup();
      })();
    });

    it('passes through non-200 success codes', () => {
      return (async () => {
        nock('https://example.com/')
          .get('/r204')
          .reply(204, 'Hello');
        const { path, cleanup } = await tmp.file();
        const c = await download.download(
          request.get('https://example.com/r204'),
          path
        );
        assert.deepStrictEqual(c.statusCode, 204);
        assert.deepStrictEqual(fs.statSync(path).size, 0);
        await cleanup();
      })();
    });

    it('works on large files #slow', () => {
      const len = 1024 * 1024 * 5;
      return (async () => {
        nock('https://example.com/')
          .get('/r200')
          .reply(200, new Array(len + 1).join('ABC'));
        const { path, cleanup } = await tmp.file();
        await download.download(request.get('https://example.com/r200'), path);
        assert.deepStrictEqual(fs.statSync(path).size, len * 3);
        await cleanup();
      })();
    });

    it('works on large files slowly sent #slow', () => {
      const len = 1024 * 1024 * 1;
      return (async () => {
        nock('https://example.com/')
          .get('/r200')
          .reply(200, (u, rb) => {
            const s = new Readable();
            s._read = () => {};
            setTimeout(() => {
              s.push(new Array(len + 1).join('ABC'));
              s.pause();
              setTimeout(() => {
                s.resume();
                s.push(new Array(len + 1).join('ABC'));
                setTimeout(() => {
                  s.push(new Array(len + 1).join('ABC'));
                  s.push(null);
                }, 100);
              }, 100);
            }, 100);
            return s;
          });
        const { path, cleanup } = await tmp.file();
        await download.download(request.get('https://example.com/r200'), path);
        assert.deepStrictEqual(fs.statSync(path).size, len * 9);
        await cleanup();
      })();
    }).timeout(10000);

    it('fails gracefully on large file errors #slow', () => {
      const len = 1024 * 1024 * 1;
      return (async () => {
        nock('https://example.com/')
          .get('/r200thenX')
          .reply(200, (u, rb) => {
            const s = new Readable();
            s._read = () => {};
            setTimeout(() => {
              s.push(new Array(len + 1).join('ABC'));
              setTimeout(() => {
                s.push(new Array(len + 1).join('ABC'));
                setTimeout(() => {
                  s.push(new Array(len + 1).join('ABC'));
                  s.destroy(new Error('destroyed'));
                }, 100);
              }, 100);
            }, 100);
            return s;
          });
        const { path, cleanup } = await tmp.file();
        try {
          await download.download(
            request.get('https://example.com/r200thenX'),
            path
          );
        } catch (e) {
          assert.deepStrictEqual(e instanceof download.DownloadError, true);
          return;
        } finally {
          await cleanup();
        }
        assert.fail('Did not error');
      })();
    }).timeout(10000);

    it('fails gracefully on 404s', () => {
      return (async () => {
        nock('https://example.com/')
          .get('/r404')
          .reply(404, 'Not found');
        const { path, cleanup } = await tmp.file();
        try {
          await download.download(
            request.get('https://example.com/r404'),
            path
          );
        } catch (e) {
          assert.deepStrictEqual(e instanceof download.DownloadError, true);
          return;
        } finally {
          await cleanup();
        }
        assert.fail('Did not error');
      })();
    });

    it('fails gracefully on 500s', () => {
      return (async () => {
        nock('https://example.com/')
          .get('/r500')
          .reply(500, 'Internal server error');
        const { path, cleanup } = await tmp.file();
        try {
          await download.download(
            request.get('https://example.com/r500'),
            path
          );
          assert.fail('Did not error');
        } catch (e) {
          assert.deepStrictEqual(e instanceof download.DownloadError, true);
          return;
        } finally {
          await cleanup();
        }
        assert.fail('Did not error');
      })();
    });

    it('fails gracefully on bad files', () => {
      return (async () => {
        nock('https://example.com/')
          .get('/r200')
          .reply(200, 'OK!');
        const { path, cleanup } = await tmp.file();
        try {
          await download.download(
            request.get('https://example.com/r200'),
            path + '/.NON/A'
          );
          assert.fail('Did not error');
        } catch (e) {
          assert.deepStrictEqual(e instanceof download.DownloadError, true);
          return;
        } finally {
          await cleanup();
        }
        assert.fail('Did not error');
      })();
    });

    it('fails gracefully on request errors', () => {
      return (async () => {
        nock('https://example.com/')
          .get('/r500x')
          .replyWithError('Request error');
        const { path, cleanup } = await tmp.file();
        try {
          await download.download(
            request.get('https://example.com/r500x'),
            path
          );
          assert.fail('Did not error');
        } catch (e) {
          assert.deepStrictEqual(e instanceof download.DownloadError, false);
          return;
        } finally {
          await cleanup();
        }
        assert.fail('Did not error');
      })();
    });
  }).timeout(3000);
});
