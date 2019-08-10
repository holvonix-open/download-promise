# request-stream-promise - Promise for streamed downloads using request

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE) [![npm](https://img.shields.io/npm/v/request-stream-promise.svg)](https://www.npmjs.com/package/request-stream-promise) [![Build Status](https://travis-ci.com/holvonix-open/request-stream-promise.svg?branch=master)](https://travis-ci.com/holvonix-open/request-stream-promise) [![GitHub last commit](https://img.shields.io/github/last-commit/holvonix-open/request-stream-promise.svg)](https://github.com/holvonix-open/request-stream-promise/commits) [![codecov](https://codecov.io/gh/holvonix-open/request-stream-promise/branch/master/graph/badge.svg)](https://codecov.io/gh/holvonix-open/request-stream-promise) [![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=holvonix-open/request-stream-promise)](https://dependabot.com) [![DeepScan grade](https://deepscan.io/api/teams/4465/projects/6260/branches/51418/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=4465&pid=6260&bid=51418) [![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts) [![npm bundle size](https://img.shields.io/bundlephobia/min/request-stream-promise.svg)](https://bundlephobia.com/result?p=request-stream-promise) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


## Quick Start

After `yarn add request request-stream-promise':

````typescript
import * as request from 'request';
import { download } from 'request-stream-promise';
import * as fs from 'fs';

async function getIt() {
  // The file is streamed internally.
  await download(
    request.get('https://example.com/aVeryLargeFile.txt'), '/tmp/file.txt'
  );
  // etc.
  console.log(fs.readFileSync('/tmp/file.txt', 'utf-8'));
}
````


## License

Read the [LICENSE](LICENSE) for details.  
The entire [NOTICE](NOTICE) file serves as the NOTICE that must be included under
Section 4d of the License.

````

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

````
