# Super Phantom Cat — webOS Port

This repository contains a recovered browser build of **Super Phantom Cat**
adapted for webOS. The project packages the HTML5/Cocos2d game as a webOS
application and includes the recovered game assets, runtime patches, build
scripts, and validation tests.

## Project layout

- `app/` — webOS application package and game assets
- `tests/` — browser, rendering, and memory validation scripts and reports
- `build-ipk.sh` / `build-ipk.cmd` — Linux and Windows packaging helpers
- `changes*.patch` — source and rendering fixes applied to the recovered build

## Building

On Linux:

```sh
./build-ipk.sh
```

On Windows:

```bat
build-ipk.cmd
```

The scripts create an installable webOS package from the contents of `app/`.

## Testing

The JavaScript files in `tests/` contain the browser, rendering, and memory
checks used to validate the port. Generated screenshots, logs, and JSON reports
are kept alongside the test scripts for reproducibility.

## Status

This is a preservation and recovery project. It is intended for research,
archival, and compatibility testing of the recovered web build.
