# Project Notes

## Versioning

Use `npm version` to bump the version. It updates both `package.json` and `package-lock.json` atomically and creates a git tag.

```bash
npm version patch   # bug fixes
npm version minor   # new features
npm version major   # breaking changes
```

Then push the commit and tag together:

```bash
git push --follow-tags
```

Pushing the tag triggers the release workflow (`.github/workflows/release.yml`), which builds the card and publishes a GitHub release with the changelog section for that version.

Before releasing, move the `[Unreleased]` section in `CHANGELOG.md` to the new version number.
