// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  hmr: false,
  apiURL: 'https://localhost:8000/api/',
  baseURL: '/',
  baseHref: '/',
  mediaURL: 'https://localhost:8000/media/',
  lagunitaHost: 'https://lagunita.stanford.edu',
  lagunitaPreviewHost: 'https://preview.lagunita.stanford.edu',

  maxRecordingFileSize: 10e+6,
  maxSupportingFileSize: 2e+6,
  maxSupportingFileCount: 5
};
