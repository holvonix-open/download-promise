/*
# request-stream-promise

This product contains software originally developed by Holvonix LLC.
Original Repository: https://github.com/holvonix-open/request-stream-promise

Copyright (c) 2019 Holvonix LLC. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this software except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Dependencies may have their own licenses.
*/

import * as bbPromise from 'bluebird';
import * as request from 'request';
import { PathLike, createWriteStream } from 'fs';

export class DownloadError extends Error {
  wrappedError?: Error;
  response?: request.Response;
  statusCode?: number;

  constructor(
    msg: string,
    wrappedError?: Error,
    response?: request.Response,
    statusCode?: number
  ) {
    super(msg);
    Object.setPrototypeOf(this, DownloadError.prototype);

    this.wrappedError = wrappedError;
    this.response = response;
    this.statusCode = statusCode;
  }
}

export async function download(
  req: request.Request,
  toFile: PathLike
): Promise<request.Response> {
  req.pause();
  return new bbPromise((resolve, reject) => {
    (async () => {
      req
        .on('error', e => {
          // Failures during request construction.
          reject(e);
        })
        .on('response', r => {
          if (r.statusCode === 200) {
            const dest = createWriteStream(toFile);
            r.on('error', e => {
              dest.close();
              reject(
                new DownloadError(
                  'Failure on reading response pipe: ' + e.message,
                  e,
                  r,
                  r.statusCode
                )
              );
            })
              .pipe(dest)
              .on('error', e => {
                dest.close();
                reject(
                  new DownloadError(
                    'Failure on writing pipe: ' + e,
                    e,
                    r,
                    r.statusCode
                  )
                );
              })
              .on('close', () => {
                resolve(r);
              });
            r.resume();
          } else if (r.statusCode >= 400) {
            reject(
              new DownloadError(
                'Failure status code: ' + r.statusCode + '; ' + r.statusMessage,
                undefined,
                r,
                r.statusCode
              )
            );
          } else {
            // non-200, but ok.
            resolve(r);
          }
        });
    })();
  });
}
