# Super Phantom Cat - Recovered Web Build

This repository contains a runnable browser recovery of the original Super
Phantom Cat game. It combines reconstructed JavaScript sources, the resources
required by the game, and the Cocos2d-JS runtime modules used by this build.

The recovery targets the single-player campaign and local mini/event content.
Native services such as ads, in-app purchases, social login, multiplayer, and
platform-specific integrations are replaced or omitted.

## Run

Python 3 is the only runtime prerequisite.

```powershell
python serve.py --port 8000
```

On Windows, `start.bat` runs the same command. Then open:

<http://127.0.0.1:8000/assets/index.webv1.html>

The game must be served over HTTP. Opening the HTML directly through `file://`
does not work because Cocos2d-JS loads scripts and resources with web requests.

## Repository layout

- `assets/`: browser entry point and game resources
- `recovered-src/src/`: reconstructed game JavaScript
- `recovered-src/runtime/html5/`: browser runtime shim
- `frameworks/cocos2d-html5/`: required Cocos2d-JS runtime modules and licenses
- `serve.py`: dependency-free local HTTP server tuned for the startup request burst

## Rights and provenance

This is an unofficial source recovery and is not an official release by the
original developers or publishers. No new license is granted for the game
code, artwork, audio, fonts, level data, or other game assets. Their respective
rights remain with their original owners.

Cocos2d-JS license and attribution files are preserved under
`frameworks/cocos2d-html5/`.
