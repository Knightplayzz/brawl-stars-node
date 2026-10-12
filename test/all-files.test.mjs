import assert from "node:assert/strict";
import { test } from "@jest/globals";
import {
  AuthenticationError,
  AuthorizationError,
  BrawlStarsAPIError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  RequestAbortedError,
  RequestTimeoutError,
  ServerError,
  ValidationError
} from "../dist/errors.js";
import {
  normalizeCountryCode,
  normalizeTag,
  validateBrawlerId,
  validateCountryCode,
  validateLimit,
  validateTag
} from "../dist/utils/validation.js";
import { getAuthToken, getClient, setAuthToken } from "../dist/auth/context.js";
import getPlayer from "../dist/endpoints/players/getPlayer.js";
import getBattlelog from "../dist/endpoints/players/getBattlelog.js";
import getClub from "../dist/endpoints/clubs/getClub.js";
import getMembers from "../dist/endpoints/clubs/getMembers.js";
import getPlayers from "../dist/endpoints/rankings/getPlayers.js";
import getClubs from "../dist/endpoints/rankings/getClubs.js";
import getBrawlerRankings from "../dist/endpoints/rankings/getBrawler.js";
import getBrawlers from "../dist/endpoints/brawlers/getBrawlers.js";
import getBrawler from "../dist/endpoints/brawlers/getBrawler.js";
import getGameModes from "../dist/endpoints/events/getGameModes.js";
import getRotation from "../dist/endpoints/events/getRotation.js";

const fakeClient = {
  fetch: async (endpoint, options) => ({ endpoint, options })
};

test("validates tags, countries, IDs, and limits", () => {
  assert.equal(normalizeTag(" #P289 ", "player"), "P289");
  assert.doesNotThrow(() => validateTag("#P2", "club"));
  assert.equal(normalizeCountryCode("BE"), "be");
  assert.doesNotThrow(() => validateCountryCode("global"));
  assert.doesNotThrow(() => validateBrawlerId(1));
  assert.doesNotThrow(() => validateLimit(100));
  assert.throws(() => normalizeTag("", "player"), ValidationError);
  assert.throws(() => normalizeTag("#!", "player"), ValidationError);
  assert.throws(() => validateCountryCode("Belgium"), ValidationError);
  assert.throws(() => validateBrawlerId(0), ValidationError);
  assert.throws(() => validateLimit(101), ValidationError);
  assert.throws(() => validateLimit(1.5), ValidationError);
});

test("constructs every endpoint through its intended module", async () => {
  assert.equal((await getPlayer(fakeClient)("#P2")).endpoint, "/players/%23P2");
  assert.equal((await getBattlelog(fakeClient)("#P2")).endpoint, "/players/%23P2/battlelog");
  assert.equal((await getClub(fakeClient)("#P2")).endpoint, "/clubs/%23P2");
  assert.match((await getMembers(fakeClient)("#P2", { limit: 10 })).endpoint, /limit=10/);
  assert.match((await getPlayers(fakeClient)("global", { after: "next" })).endpoint, /after=next/);
  assert.match((await getClubs(fakeClient)("BE", { before: "previous" })).endpoint, /before=previous/);
  assert.match((await getBrawlerRankings(fakeClient)("global", 1, { limit: 5 })).endpoint, /limit=5/);
  assert.match((await getBrawlers(fakeClient)({ limit: 5 })).endpoint, /limit=5/);
  assert.match(
    (await getBrawlers(fakeClient)({ before: "b", after: "a", limit: 5 })).endpoint,
    /before=b.*after=a.*limit=5/
  );
  assert.equal((await getBrawler(fakeClient)(1)).endpoint, "/brawlers/1");
  assert.equal((await getGameModes(fakeClient)({ limit: 5 })).endpoint, "/gamemodes");
  assert.equal((await getRotation(fakeClient)()).endpoint, "/events/rotation");
  await getMembers(fakeClient)("P2");
  await getPlayers(fakeClient)("global");
  await getClubs(fakeClient)("BE");
  await getBrawlerRankings(fakeClient)("global", 1);
  await getBrawlers(fakeClient)();
  await getGameModes(fakeClient)();
  await getPlayer(fakeClient)("P2", {});
  await getBattlelog(fakeClient)("P2", {});
  await getClub(fakeClient)("P2", {});
  await getMembers(fakeClient)("P2", { before: "b", after: "a", limit: 5 });
  await getPlayers(fakeClient)("global", { before: "b", after: "a", limit: 5 });
  await getClubs(fakeClient)("BE", { before: "b", after: "a", limit: 5 });
  await getBrawlerRankings(fakeClient)("global", 1, { before: "b", after: "a", limit: 5 });
  await getBrawler(fakeClient)(1, {});
  await getGameModes(fakeClient)({ before: "b", after: "a", limit: 5 });
  await getRotation(fakeClient)({});
});

test("exposes error metadata and legacy context", () => {
  const base = new BrawlStarsAPIError("message", "/test", "POST", 400, { cause: "cause", retryable: true });
  assert.equal(base.statusCode, 400);
  assert.equal(base.method, "POST");
  assert.equal(base.retryable, true);
  assert.equal(base.cause, "cause");
  const legacy = new BrawlStarsAPIError("legacy", 500, "/legacy");
  assert.equal(legacy.endpoint, "/legacy");
  assert.equal(legacy.statusCode, 500);

  for (const error of [
    new AuthenticationError("/auth"),
    new AuthorizationError("/auth"),
    new NotFoundError("/missing"),
    new RateLimitError("/limited", 1000),
    new ServerError("/server", 500),
    new RequestTimeoutError("/timeout", 100),
    new NetworkError("/network"),
    new RequestAbortedError("/aborted"),
    new ValidationError("invalid")
  ]) {
    assert.ok(error instanceof BrawlStarsAPIError);
  }

  assert.throws(() => getAuthToken(), /not set/);
  assert.throws(() => getClient(), /not initialized/);
  assert.throws(() => setAuthToken(1), TypeError);
  setAuthToken("token");
  assert.equal(getAuthToken(), "token");
  assert.equal(getClient().constructor.name, "BrawlStarsClient");
});
