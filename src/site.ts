const repoUrl = import.meta.env.PUBLIC_REPO_URL ?? 'https://github.com/gravity-current/community-snippets';
const repoBranch = import.meta.env.PUBLIC_REPO_BRANCH ?? 'main';

function repoPath(pathname: string) {
  return `${repoUrl.replace(/\/$/, '')}${pathname}`;
}

export const site = {
  name: 'fun.syn.live',
  repoUrl,
  repoBranch
};

export const entryTypes = ['function', 'snippet', 'write-up'] as const;
export const entryLangs = ['glsl', 'js', 'json', 'none'] as const;
export const licenseOptions = ['MIT', 'CC0', 'Unlicense', 'CC BY 4.0', 'Apache-2.0', 'Unlicensed'];

export const defaultBody = `Explain what this does, when to reach for it, and anything worth
knowing before dropping it into a scene. Then the code:

\`\`\`glsl
float myFunction(float x) {
  return x;
}
\`\`\`
`;

export interface EntryDraft {
  title: string;
  type: string;
  lang: string;
  summary: string;
  excerpt: string;
  tags: string;
  submittedBy: string;
  originalAuthor: string;
  source: string;
  license: string;
  example: string;
  body: string;
}

export const emptyDraft: EntryDraft = {
  title: '',
  type: 'function',
  lang: 'glsl',
  summary: '',
  excerpt: '',
  tags: '',
  submittedBy: '',
  originalAuthor: '',
  source: '',
  license: 'MIT',
  example: '',
  body: defaultBody
};

export function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTags(raw: string) {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

// Quote a free-text value so a stray colon or hash can't break the YAML.
function yamlString(value: string) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function buildEntryMdx(draft: EntryDraft) {
  const today = new Date().toISOString().slice(0, 10);
  const tags = parseTags(draft.tags);
  const lines: string[] = ['---'];

  lines.push(`title: ${yamlString(draft.title.trim() || 'Untitled')}`);
  lines.push(`type: ${draft.type}`);
  lines.push(`lang: ${draft.lang}`);
  lines.push(`summary: ${yamlString(draft.summary.trim())}`);
  if (draft.excerpt.trim()) {
    lines.push(`excerpt: ${yamlString(draft.excerpt.trim())}`);
  }
  if (tags.length) {
    lines.push('tags:');
    for (const tag of tags) {
      lines.push(`  - ${tag}`);
    }
  } else {
    lines.push('tags: []');
  }
  lines.push(`submittedBy: ${draft.submittedBy.trim() || 'your-github-handle'}`);
  if (draft.originalAuthor.trim()) {
    lines.push(`originalAuthor: ${yamlString(draft.originalAuthor.trim())}`);
  }
  if (draft.source.trim()) {
    lines.push(`source: ${draft.source.trim()}`);
  }
  lines.push(`license: ${draft.license.trim() || 'Unlicensed'}`);
  if (draft.example.trim()) {
    lines.push(`example: ${draft.example.trim()}`);
  }
  lines.push(`date: ${today}`);
  lines.push('---');
  lines.push('');
  lines.push(draft.body.trim());
  lines.push('');

  return lines.join('\n');
}

// GitHub silently truncates very long new-file prefills, so once the prefilled
// URL crosses this length the builder falls back to copy-paste. Conservative on
// purpose; typical functions and snippets sit well under it.
export const PREFILL_URL_LIMIT = 8000;

// Single-click path: open GitHub's new-file editor with the filename AND the
// whole entry prefilled. The contributor just reviews and clicks "Propose".
export function buildPrefillUrl(slug: string, mdx: string) {
  const url = new URL(repoPath(`/new/${repoBranch}`));
  url.searchParams.set('filename', `src/content/entries/${slug || 'my-entry'}.mdx`);
  url.searchParams.set('value', mdx);
  return url.toString();
}

// Fallback path for entries too long to prefill: open the editor with just the
// filename, and the builder copies the body to the clipboard so it can be pasted
// without hitting the query-string length limit.
export function buildNewFileUrl(slug: string) {
  const url = new URL(repoPath(`/new/${repoBranch}`));
  url.searchParams.set('filename', `src/content/entries/${slug || 'my-entry'}.mdx`);
  return url.toString();
}

// Lower-friction fallback: a prefilled issue a maintainer can convert to a file.
export function buildIssueUrl(draft: EntryDraft, slug: string) {
  const url = new URL(repoPath('/issues/new'));
  url.searchParams.set('title', `New entry: ${draft.title.trim() || 'untitled'}`);
  const body = [
    'Submitted via the contribute builder. Proposed file:',
    '',
    `\`src/content/entries/${slug || 'my-entry'}.mdx\``,
    '',
    '```mdx',
    buildEntryMdx(draft),
    '```'
  ].join('\n');
  url.searchParams.set('body', body);
  return url.toString();
}

export function buildEditEntryUrl(entryId: string) {
  return repoPath(`/edit/${repoBranch}/src/content/entries/${entryId}.mdx`);
}
