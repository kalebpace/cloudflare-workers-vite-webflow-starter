# Notes

- Unfortunately, once webfow bootstraps its preview env, it parses the domain for patterns like `https://preview.*/preview` to determine how to load the rest of its assets.
This affects local dev, so we must set `127.0.0.1 preview.localhost` in our `/etc/hosts/` file to mock this behavior
