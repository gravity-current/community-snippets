const repoUrl = import.meta.env.PUBLIC_REPO_URL ?? 'https://github.com/your-org/your-repo';
const repoBranch = import.meta.env.PUBLIC_REPO_BRANCH ?? 'main';

export const entryTemplate = `---
title: PLACEHOLDER_CONTENT_myFunction
type: function
lang: glsl
summary: PLACEHOLDER_CONTENT one-line explanation.
excerpt:
tags: []
submittedBy: PLACEHOLDER_CONTENT_your-handle
originalAuthor:
source:
license: Unlicensed
example:
date: 2026-05-28
featured: false
cover:
---

PLACEHOLDER_CONTENT: replace this sample content before submitting.

\`\`\`glsl
float myFunction(float x) {
  return x;
}
\`\`\`
`;

function repoPath(pathname: string) {
  return `${repoUrl.replace(/\/$/, '')}${pathname}`;
}

export const site = {
  name: 'syn.fun',
  repoUrl,
  repoBranch
};

export function buildNewEntryUrl(filename = 'my-function.mdx') {
  const url = new URL(repoPath(`/new/${repoBranch}`));
  url.searchParams.set('filename', `src/content/entries/${filename}`);
  url.searchParams.set('value', entryTemplate);
  return url.toString();
}

export function buildEditEntryUrl(entryId: string) {
  return repoPath(`/edit/${repoBranch}/src/content/entries/${entryId}.mdx`);
}
