const repoUrl = import.meta.env.PUBLIC_REPO_URL ?? 'https://github.com/gravity-current/community-snippets';
const repoBranch = import.meta.env.PUBLIC_REPO_BRANCH ?? 'main';

const today = new Date().toISOString().slice(0, 10);

export const entryTemplate = `---
title: myFunction
type: function
lang: glsl
summary: One-line explanation of what this does.
excerpt:
tags: []
submittedBy: your-github-handle
originalAuthor:
source:
license: Unlicensed
example:
date: ${today}
featured: false
cover:
---

Explain what the code does, when to reach for it, and anything worth knowing
before pasting it into a scene. Then drop the code:

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
  name: 'fun.syn.live',
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
