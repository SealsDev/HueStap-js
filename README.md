# HueStep

RGB colors and smooth text gradients for the Node.js terminal. Zero dependencies,
with support for ESM and CommonJS.

## Installation

```sh
npm install huestep
```

Requires Node.js 20 or later and a terminal with RGB color support.

## Usage

```js
import HueStep from 'huestep';

console.log(HueStep.rgb('Purple text', 170, 85, 255));
console.log(HueStep.gradient('Text with an RGB gradient'));

console.log(HueStep.autorgb('Connecting...'));
console.log(HueStep.autorgb('Loading...'));
console.log(HueStep.autorgb('Ready.'));
```

For CommonJS, use `const HueStep = require('huestep')`.
For ESM, use a `.mjs` file or set `"type": "module"` in your `package.json`.

## API

All color functions return strings. Use `console.log()` or your preferred output method to print them.

| Method | Description |
| --- | --- |
| `rgb(text, r, g, b)` | Apply one color. Channels must be integers from 0 to 255. |
| `gradient(text, phase = 0)` | Apply a gradient across the text. The optional phase shifts its colors. |
| `autorgb(text)` | Apply a gradient, then advance the phase by `0.16` radians by default. |
| `configure(options)` | Update settings and return the instance. |
| `reset(phase = 0)` | Reset the automatic phase without changing other settings. Returns the instance. |
| `createHueStep(options)` | Create an instance with its own settings and phase counter. |

`autorgb()` advances once per call, including empty strings and output with colors
disabled. It does not animate previously printed text. Calls to `rgb()` and
`gradient()` do not change the automatic phase.

## Configuration

```js
HueStep.configure({
  step: 0.16,
  phase: 0,
  color: 'auto'
});
```

| Option | Default | Description |
| --- | --- | --- |
| `step` | `0.16` | Phase increment per automatic call. Zero holds the phase; negative values reverse progression. |
| `phase` | `0` | Phase for the next automatic call, in radians. |
| `color` | `'auto'` | `'auto'`, `'always'`, or `'never'`. |

`step` and `phase` must be finite numbers. Phase values wrap around at `2π`.
Invalid arguments throw an error. Current settings are available through the
read-only `phase`, `step`, and `color` properties.

For a separate color sequence:

```js
const logger = HueStep.createHueStep({ step: 0.5 });

console.log(logger.autorgb('Independent colors'));
```

## Color support

In `auto` mode, a nonempty `NO_COLOR` disables colors. Otherwise, `FORCE_COLOR=0`
disables them and any other defined value enables them. Without either override,
HueStep enables colors for TTY output unless `TERM=dumb`.

Set `color: 'always'` to force colors or `color: 'never'` to return plain text.
These settings override environment detection.

Use plain text as input; existing ANSI sequences are not parsed. Gradients
operate on Unicode code points and preserve line endings. Combined symbols may
receive more than one color.

## Example

From the repository root:

```sh
npm run example
```

No dependency installation or build step is required.

## License

[MIT](LICENSE)
