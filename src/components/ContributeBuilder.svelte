<script lang="ts">
  import { onMount } from 'svelte';
  import {
    buildEntryMdx,
    buildIssueUrl,
    buildNewFileUrl,
    buildPrefillUrl,
    emptyDraft,
    entryLangs,
    entryTypes,
    licenseOptions,
    slugifyTitle,
    PREFILL_URL_LIMIT,
    type EntryDraft
  } from '../site';

  const STORAGE_KEY = 'synfun:contribute-draft';

  let draft: EntryDraft = { ...emptyDraft };
  let mounted = false;
  let status = '';
  let statusTimer: ReturnType<typeof setTimeout>;

  $: mdx = buildEntryMdx(draft);
  $: slug = slugifyTitle(draft.title);
  $: filename = `src/content/entries/${slug || 'my-entry'}.mdx`;
  $: prefillUrl = buildPrefillUrl(slug, mdx);
  $: prefillFits = prefillUrl.length <= PREFILL_URL_LIMIT;

  $: missing = [
    !draft.title.trim() && 'title',
    !draft.summary.trim() && 'summary',
    !draft.submittedBy.trim() && 'your handle'
  ].filter(Boolean) as string[];
  $: valid = missing.length === 0;

  // Autosave to this browser so a refresh or accidental nav never loses work.
  $: if (mounted && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        draft = { ...emptyDraft, ...JSON.parse(saved) };
      }
    } catch {
      // ignore a corrupt draft and start clean
    }
    mounted = true;
  });

  function flash(message: string) {
    status = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (status = ''), 4000);
  }

  function openInNewTab(url: string) {
    window.open(url, '_blank', 'noopener');
  }

  async function copyMdx() {
    try {
      await navigator.clipboard.writeText(mdx);
      flash('Copied the .mdx to your clipboard.');
    } catch {
      flash('Could not access the clipboard — select the text below and copy it.');
    }
  }

  function openPullRequest() {
    if (!valid) {
      return;
    }
    if (prefillFits) {
      openInNewTab(prefillUrl);
      flash('Opened a prefilled pull request in a new tab. Review it there and click "Propose new file".');
    } else {
      openInNewTab(buildNewFileUrl(slug));
      navigator.clipboard.writeText(mdx).catch(() => {});
      flash('Your entry is long, so we copied it to your clipboard. Paste it into the editor in the new tab.');
    }
  }

  function openIssue() {
    if (!valid) {
      return;
    }
    openInNewTab(buildIssueUrl(draft, slug));
    flash('Opened a prefilled issue in a new tab. A maintainer can turn it into a file.');
  }

  function clearAll() {
    if (!confirm('Clear every field and delete the saved draft in this browser?')) {
      return;
    }
    draft = { ...emptyDraft };
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    flash('Cleared. Starting fresh.');
  }
</script>

<div class="builder">
  <form class="builder__form" on:submit|preventDefault>
    <div class="field-grid">
      <label class="field field--wide">
        <span class="field__label">title <em>required</em></span>
        <input class="field__input" type="text" bind:value={draft.title} placeholder="myFunction" autocomplete="off" />
        {#if slug}
          <span class="field__hint">file: {filename}</span>
        {/if}
      </label>

      <label class="field">
        <span class="field__label">type</span>
        <select class="field__input" bind:value={draft.type}>
          {#each entryTypes as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field__label">language</span>
        <select class="field__input" bind:value={draft.lang}>
          {#each entryLangs as lang}
            <option value={lang}>{lang}</option>
          {/each}
        </select>
      </label>

      <label class="field field--wide">
        <span class="field__label">summary <em>required</em></span>
        <input class="field__input" type="text" bind:value={draft.summary} placeholder="One line on what this does and when to reach for it." autocomplete="off" />
      </label>

      <label class="field field--wide">
        <span class="field__label">tags</span>
        <input class="field__input" type="text" bind:value={draft.tags} placeholder="comma, separated, lowercase" autocomplete="off" />
      </label>

      <label class="field">
        <span class="field__label">submitted by <em>required</em></span>
        <input class="field__input" type="text" bind:value={draft.submittedBy} placeholder="your-github-handle" autocomplete="off" />
      </label>

      <label class="field">
        <span class="field__label">license</span>
        <input class="field__input" type="text" list="license-options" bind:value={draft.license} autocomplete="off" />
        <datalist id="license-options">
          {#each licenseOptions as license}
            <option value={license}></option>
          {/each}
        </datalist>
      </label>

      <label class="field">
        <span class="field__label">original author <em>optional</em></span>
        <input class="field__input" type="text" bind:value={draft.originalAuthor} placeholder="if it isn't your own work" autocomplete="off" />
      </label>

      <label class="field">
        <span class="field__label">source <em>optional</em></span>
        <input class="field__input" type="url" bind:value={draft.source} placeholder="https://..." autocomplete="off" />
      </label>

      <label class="field">
        <span class="field__label">excerpt <em>optional</em></span>
        <input class="field__input" type="text" bind:value={draft.excerpt} placeholder="longer blurb, mostly for write-ups" autocomplete="off" />
      </label>

      <label class="field">
        <span class="field__label">example link <em>optional</em></span>
        <input class="field__input" type="url" bind:value={draft.example} placeholder="https://... a scene or video" autocomplete="off" />
      </label>
    </div>

    <label class="field field--body">
      <span class="field__label">body <em>markdown + code fences</em></span>
      <textarea class="field__input field__textarea" rows="16" bind:value={draft.body} spellcheck="false"></textarea>
    </label>
  </form>

  <div class="builder__side">
    <div class="actions">
      <button class="button button-primary" type="button" on:click={openPullRequest} disabled={!valid}>
        {prefillFits ? 'Open pull request →' : 'Copy & open pull request →'}
      </button>
      <button class="button" type="button" on:click={openIssue} disabled={!valid}>Open as issue</button>
      <button class="button" type="button" on:click={copyMdx}>Copy .mdx</button>
      <button class="button button--ghost" type="button" on:click={clearAll}>Clear all</button>
    </div>

    {#if !valid}
      <p class="note note--warn">Fill in {missing.join(', ')} to submit.</p>
    {:else if !prefillFits}
      <p class="note">This entry is long, so the pull-request button copies it to your clipboard and opens a blank file for you to paste into.</p>
    {/if}

    <p class="note" aria-live="polite">{status || 'Both buttons open GitHub in a new tab, so you can come back here and switch paths.'}</p>

    <div class="preview">
      <div class="preview__head">
        <span class="preview__title">{filename}</span>
      </div>
      <pre class="preview__code">{mdx}</pre>
    </div>
  </div>
</div>

<style>
  .builder {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 24px;
    margin-top: 24px;
    align-items: start;
  }

  .field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field--wide {
    grid-column: 1 / -1;
  }

  .field--body {
    margin-top: 16px;
  }

  .field__label {
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .field__label em {
    margin-left: 6px;
    color: var(--faint);
    font-style: normal;
    text-transform: none;
    letter-spacing: 0;
  }

  .field__input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .field__input:focus {
    outline: none;
    border-color: var(--orange);
  }

  .field__textarea {
    resize: vertical;
    line-height: 1.5;
  }

  .field__hint {
    color: var(--faint);
    font-family: var(--font-mono);
    font-size: 11px;
  }

  .builder__side {
    position: sticky;
    top: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .button[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .button--ghost {
    margin-left: auto;
    border-color: transparent;
    color: var(--muted);
  }

  .button--ghost:hover {
    color: var(--text);
    border-color: var(--line-strong);
    background: transparent;
  }

  .note {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .note--warn {
    color: var(--orange);
  }

  .preview {
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface);
    overflow: hidden;
  }

  .preview__head {
    padding: 9px 12px;
    border-bottom: 1px solid var(--line);
  }

  .preview__title {
    color: var(--faint);
    font-family: var(--font-mono);
    font-size: 11px;
  }

  .preview__code {
    margin: 0;
    padding: 14px;
    max-height: 420px;
    overflow: auto;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  }

  @media (max-width: 860px) {
    .builder {
      grid-template-columns: 1fr;
    }

    .builder__side {
      position: static;
    }
  }
</style>
