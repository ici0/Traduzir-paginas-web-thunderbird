# TWP for Thunderbird (MVP)

Minimal Thunderbird MailExtension that translates the currently displayed email using Google or Microsoft.

## Install

1. Build the extension into an `.xpi` archive (zip).
   ```
   cd thunderbird
   zip -r ../twp-tb-mvp.xpi *
   ```
2. In Thunderbird open Add-ons Manager → Gear → Install Add-on From File… and select the generated `.xpi`.

## Permissions

The extension requests the following permissions:

- `storage` – save engine and target language settings.
- `menus` – reserved for future context menu integration.
- `messagesRead` – access the displayed message contents.
- `tabs` – communicate with the content script.

## Engine setup

Google Translate works out of the box.

Microsoft Translator requires an API key stored under `msKey` in the extension’s local storage. You can set it from the developer console:

```js
browser.storage.local.set({msKey: 'YOUR_KEY'});
```

## Known limitations

- Only manual translation is supported.
- Translates entire message body; quoted replies (`blockquote[type="cite"]`) are skipped.
- No automatic language detection or automatic translation.
