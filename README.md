# ON.energy Signature Generator

Simple in-browser tool for building an ON.energy branded email signature. The page renders a live preview while you type, validates the required fields, and copies fully inlined HTML (logo included) that pastes cleanly into Gmail.

## Features
- Guided form for name, title, phone (multi-region formats), and email
- Live preview that mirrors the final signature markup
- Copy button that prioritises HTML clipboard APIs with fallbacks
- Inlined brand logo so pasted signatures work even when Gmail blocks remote images

## Running Locally
- No build step is required; open `index.html` in any modern browser, or serve the folder with a static file server (`npx serve .`).
- All styling is handled via `styles.css`; dynamic behaviour lives in `script.js`.

## Using the Generator
- Fill in all required fields; the copy button enables once the placeholder phone number is replaced and every field passes validation.
- Click **Copy Signature** and paste into Gmail’s signature editor. The preview updates automatically while you type.

## Updating the Embedded Logo
- The fallback logo is embedded directly inside `script.js` via `buildFallbackLogoDataUrl()`. This ensures the copied signature keeps the logo even if remote fetches fail.
- To refresh the fallback after updating `resources/on-yellow-profile.png`, run a quick Node script from the project root:

	```bash
		node -e "const fs=require('fs');const data=fs.readFileSync('resources/on-yellow-profile.png').toString('base64');const size=100;console.log('    return (\"data:image/png;base64,\" +');for(let i=0;i<data.length;i+=size){const chunk=data.slice(i,i+size);const suffix=i+size>=data.length?'\"':'\" +';console.log(`    \"${chunk}\"${suffix}`);}console.log('    );');"
	```
- Replace the contents inside `buildFallbackLogoDataUrl()` with the generated output.

## Assets
- `resources/on-yellow-profile.png` – primary brand logo used in the signature
- `resources/UniversNextPro-Regular.otf` and `resources/UniversNextPro-Light.otf` – bundled web fonts referenced by `styles.css`

## License
- Internal tooling for ON.energy. Review font licensing before distributing externally.