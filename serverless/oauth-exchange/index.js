// DO Functions handler. Not deployed — see docs/contribute-oauth-design.md.
//
// Sole job: exchange the GitHub OAuth `code` for a user access token using
// the GitHub App's client secret, which must never reach the browser.
// Every other step (fork, branch, commit, PR) happens client-side against
// api.github.com using the token this returns.

async function main(args) {
  const { code, state } = args;

  if (!code) {
    return { statusCode: 400, body: { error: 'missing code' } };
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: args.GITHUB_CLIENT_ID,
      client_secret: args.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const data = await res.json();

  if (data.error) {
    return { statusCode: 401, body: { error: data.error_description ?? data.error } };
  }

  // TODO before deploy: verify `state` against what the frontend sent
  // (currently unused — placeholder until the CSRF check is wired up).
  void state;

  return {
    statusCode: 200,
    body: { access_token: data.access_token, expires_in: data.expires_in }
  };
}

module.exports = { main };
