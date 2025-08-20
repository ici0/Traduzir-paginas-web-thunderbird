# TWP for Thunderbird

Experimental Thunderbird MailExtension that translates email bodies in place using Google or Microsoft services. The extension injects a content script into message views and replaces text nodes with their translations. A toolbar button provides engine and language selection and allows restoring the original message.

## Building

The extension lives in the `thunderbird/` directory. To create an XPI file run:

```
zip -r twp-thunderbird.xpi *
```

## Installing

1. Open Thunderbird and choose **Add-ons and Themes** from the application menu.
2. Use the gear icon to select **Install Add-on From File…** and pick `twp-thunderbird.xpi`.
3. Confirm the prompts and restart Thunderbird if requested.

## Permissions

- `messagesRead` / `messagesModify`: required to read and alter message bodies.
- `storage`: stores preferences and API keys.
- `menus`, `tabs`: UI integration.
- host permissions for Google and Microsoft translation endpoints.

## License

This project is based on [TWP – Translate Web Pages](https://github.com/FilipePS/Traduzir-paginas-web) and is provided under the MPL-2.0 license.
