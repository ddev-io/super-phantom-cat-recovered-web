# Super Phantom Cat — webOS Port

This repository contains a recovered browser build of **Super Phantom Cat**
adapted for webOS. The project packages the HTML5/Cocos2d game as a webOS
application and includes the recovered game assets, runtime patches, and build
scripts.

## Project layout

- `app/` — webOS application package and game assets
- `build-ipk.sh` / `build-ipk.cmd` — Linux and Windows packaging helpers
- `changes*.patch` / `changes*.diff` — source and rendering fixes applied to the recovered build

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

## Status

This is a preservation and recovery project. It is intended for research,
archival, and compatibility testing of the recovered web build.
