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

### Release checklist

1. Add changes under `## [Unreleased]` in `CHANGELOG.md` as you work
2. Run `npm version patch/minor/major`
   - automatically renames `[Unreleased]` to the new version and stages it into the version commit
3. `git push --follow-tags`

That's it — the changelog rename is handled automatically and is always included in the tagged commit.
