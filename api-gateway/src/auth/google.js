const { Issuer, generators } = require("openid-client");
const jwt = require("jsonwebtoken");
const axios = require("axios");

let _google;
async function getGoogle() {
  if (_google) return _google;
  const googleIssuer = await Issuer.discover("https://accounts.google.com");
  _google = new googleIssuer.Client({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
    response_types: ["code"]
  });
  return _google;
}

function signState(redirect) {
  return jwt.sign(
    { redirect },
    process.env.JWT_SECRET,
    { expiresIn: "10m", issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE }
  );
}
function verifyState(state) {
  return jwt.verify(state, process.env.JWT_SECRET, { issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE });
}

async function start(req, res) {
  const redirect = req.query.redirect || (process.env.OAUTH_ALLOWED_REDIRECTS || "").split(",")[0];
  console.log("OAuth start, redirect =", redirect);
  if (!redirect) return res.status(400).json({ error: "redirect missing" });

  const allow = (process.env.OAUTH_ALLOWED_REDIRECTS || "").split(",");
  if (!allow.includes(redirect)) return res.status(400).json({ error: "redirect not allowed" });

  const client = await getGoogle();
  const state = signState(redirect);
  const url = client.authorizationUrl({
    scope: "openid email profile",
    response_type: "code",
    state
  });
  return res.redirect(url);
}

async function callback(req, res) {
  try {
    const client = await getGoogle();
    const params = client.callbackParams(req);
    const { state } = params;
    const { redirect } = verifyState(state);

    const tokenSet = await client.callback(process.env.GOOGLE_REDIRECT_URI, params, { state });
    const id = tokenSet.claims(); 

    const payload = {
      provider: "google",
      providerId: id.sub,
      email: id.email,
      name: id.name,
      avatar: id.picture,
      emailVerified: !!id.email_verified
    };

    const resp = await axios.post("http://localhost:3001/api/oauth/login", payload);
    const { user, token } = resp.data;

    const b64User = Buffer.from(JSON.stringify(user)).toString("base64url");
    const location = `${redirect}#token=${encodeURIComponent(token)}&user=${b64User}`;
    console.log("OAuth callback, redirecting to", location);
    return res.redirect(location);
  } catch (e) {
    console.error("OAuth callback error", e);
    return res.status(400).send("OAuth failed");
  }
}

module.exports = { start, callback };
