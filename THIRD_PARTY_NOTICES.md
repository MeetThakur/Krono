# Third-party notices

The app's source code is distributed under the GPLv3 license in `LICENSE`.

The bundled Fredoka, Nunito, Space Grotesk, JetBrains Mono and Space Mono font files retain their SIL Open Font License 1.1 notices. Copies are bundled in `app/src/main/assets/licenses/`, so they are distributed inside each APK. Upstream font projects and copyright notices are identified in those files.

The resolved store runtime dependency inventory is in [distribution/dependency-licenses.json](distribution/dependency-licenses.json), with versioned Maven POM links. Its 111 modules declare Apache 2.0 or BSD 3-Clause licensing (Guava ListenableFuture inherits its license from its parent POM). This inventory excludes build tools and test dependencies.

`app/src/main/assets/licenses/Runtime-notices.txt` retains the distinct license and notice texts found inside the runtime JAR/AAR files, including Jakarta Dependency Injection's notice and OkHttp's Public Suffix List attribution. The Apache license, Protobuf's BSD license, Mozilla Public License 2.0 for the Public Suffix List, and Krono's GPLv3 license are bundled in the APK assets alongside the font notices.

Library source is available from the SCM/source links in the referenced Maven POMs and their corresponding source artifacts. The Public Suffix List data source is https://publicsuffix.org/list/; OkHttp's packaged list and attribution are available in https://github.com/square/okhttp/tree/parent-4.12.0/okhttp/src/main/resources/okhttp3/internal/publicsuffix.

Coding-platform names and logos identify their respective services. Krono is an independent project and does not claim endorsement by those services. Store screenshots use the existing synthetic demo accounts described in the README.
