import assert from "node:assert/strict";
import { jest, test } from "@jest/globals";

const fetchMock = jest.fn();
globalThis.fetch = fetchMock;

const { BrawlStarsClient } = await import("../dist/client.js");
const { AuthenticationError, NetworkError, RateLimitError, ServerError } = await import("../dist/errors.js");
const { login } = await import("../dist/auth/login.js");

function response(status = 200, body = { ok: true }, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    headers: { get: (name) => headers[name.toLowerCase()] }
  };
}

test("requests all resources and supports cache controls", async () => {
  fetchMock.mockResolvedValue(response());
  const client = new BrawlStarsClient({
    token: "token",
    cache: { enabled: true, ttl: 10_000, maxSize: 20 }
  });

  await Promise.all([
    client.players.get("#P2"),
    client.players.getBattlelog("#P2"),
    client.clubs.get("#P2"),
    client.clubs.getClubMembers("#P2", { limit: 2 }),
    client.rankings.getPlayerRankings("global", { limit: 2 }),
    client.rankings.getClubRankings("BE", { after: "cursor" }),
    client.rankings.getBrawlerRankings("global", 1),
    client.brawlers.getBrawlers({ limit: 2 }),
    client.brawlers.getBrawler(1),
    client.events.getGameModes({ limit: 2 }),
    client.events.getRotation()
  ]);
  await Promise.all([
    client.players.getPlayer("#P2"),
    client.clubs.getClub("#P2"),
    client.clubs.getMembers("#P2"),
    client.rankings.getPlayers("global"),
    client.rankings.getClubs("global"),
    client.rankings.getBrawler("global", 1),
    client.brawlers.getAll(),
    client.brawlers.getBrawlerById(1)
  ]);
  const callsAfterResources = fetchMock.mock.calls.length;
  await client.players.get("#P2");
  assert.equal(fetchMock.mock.calls.length, callsAfterResources);
  await client.players.get("#P2", { useCache: false });
  client.clearCache();
  client.invalidateCache("/players/%23P2");
  client.invalidateCache();
  assert.ok(fetchMock.mock.calls.length > callsAfterResources);
  assert.equal(fetchMock.mock.calls[0][1].headers.Authorization, "Bearer token");
});

test("maps authentication, rate-limit, server, malformed, and network failures", async () => {
  const client = new BrawlStarsClient({ token: "token", retries: 0 });

  fetchMock.mockResolvedValueOnce(response(401));
  await assert.rejects(client.fetch("/auth"), AuthenticationError);

  fetchMock.mockResolvedValueOnce(response(403));
  await assert.rejects(client.fetch("/forbidden"));
  fetchMock.mockResolvedValueOnce(response(404));
  await assert.rejects(client.fetch("/missing"));
  fetchMock.mockResolvedValueOnce(response(400));
  await assert.rejects(client.fetch("/bad-request"));
  fetchMock.mockResolvedValueOnce(response(429, {}, { "retry-after": "0" }));
  await assert.rejects(client.fetch("/limited"), RateLimitError);

  fetchMock.mockResolvedValueOnce(response(500));
  await assert.rejects(client.fetch("/server"), ServerError);

  fetchMock.mockResolvedValueOnce({ ...response(), text: async () => "not-json" });
  await assert.rejects(client.fetch("/bad-json"));
  fetchMock.mockResolvedValueOnce({ ...response(), text: async () => "" });
  assert.deepEqual(await client.fetch("/empty"), {});
  fetchMock.mockResolvedValueOnce({ ...response(), text: async () => "[]" });
  await assert.rejects(client.fetch("/array"));
  fetchMock.mockResolvedValueOnce({ ...response(), text: async () => "null" });
  await assert.rejects(client.fetch("/null"));

  fetchMock.mockRejectedValueOnce(new Error("offline"));
  await assert.rejects(client.fetch("/offline"));
});

test("retries transient errors and validates request options", async () => {
  const client = new BrawlStarsClient({ token: "token", retries: 1 });
  fetchMock.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(response());
  assert.deepEqual(await client.fetch("/retry"), { ok: true });
  fetchMock.mockResolvedValueOnce(response(500)).mockResolvedValueOnce(response());
  assert.deepEqual(await client.fetch("/retry-server"), { ok: true });
  await assert.rejects(client.fetch("/bad", { retries: -1 }), /non-negative/);
  await assert.rejects(client.fetch("/bad", { timeout: 0 }), /positive/);
  assert.throws(() => client.fetch("/bad", { cacheSeconds: -1 }), /non-negative/);
});

test("validates cache configuration and login uses the shared client", async () => {
  assert.throws(() => new BrawlStarsClient({ token: "token", retries: -1 }), /non-negative/);
  assert.throws(() => new BrawlStarsClient({ token: "token", cache: { ttl: 0 } }), /cache.ttl/);
  assert.throws(() => new BrawlStarsClient({ token: "token", cache: { maxSize: 0 } }), /cache.maxSize/);
  fetchMock.mockResolvedValue(response());
  await login("login-token");
});

test("handles abort signals, cache eviction, and expired entries", async () => {
  fetchMock.mockResolvedValue(response());
  const client = new BrawlStarsClient({
    token: "token",
    cache: { enabled: true, ttl: 1, maxSize: 1 }
  });
  await client.fetch("/one");
  await new Promise((resolve) => setTimeout(resolve, 5));
  await client.fetch("/one");
  await client.fetch("/two");
  await client.events.getGameModes({ limit: 1 });
  client.invalidateCache("/gamemodes");
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(client.fetch("/aborted", { signal: controller.signal }));
  const liveController = new AbortController();
  const pending = client.fetch("/pending", { signal: liveController.signal });
  liveController.abort();
  await assert.rejects(pending);
  let requestStarted;
  const requestStartedPromise = new Promise((resolve) => {
    requestStarted = resolve;
  });
  fetchMock.mockImplementationOnce(
    (_, { signal }) =>
      new Promise((resolve, reject) => {
        requestStarted();
        signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      })
  );
  const rejectedController = new AbortController();
  const rejectedRequest = client.fetch("/rejected-abort", { signal: rejectedController.signal });
  await requestStartedPromise;
  rejectedController.abort();
  await assert.rejects(rejectedRequest);
});

test("maps timeout and retry-after date responses", async () => {
  fetchMock.mockReset();
  const client = new BrawlStarsClient({ token: "token", retries: 0, timeout: 1 });
  fetchMock.mockImplementationOnce(
    (_, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        setTimeout(() => resolve(response()), 10);
      })
  );
  await assert.rejects(client.fetch("/timeout"), /timed out/);
  const rateClient = new BrawlStarsClient({ token: "token", retries: 0, timeout: 1000 });
  fetchMock.mockResolvedValueOnce(response(429, {}, { "retry-after": "not-a-date" }));
  await assert.rejects(rateClient.fetch("/limited-date"), (error) => error instanceof RateLimitError);
  fetchMock.mockResolvedValueOnce(response(429, {}, { "retry-after": "Wed, 21 Oct 2015 07:28:00 GMT" }));
  await assert.rejects(rateClient.fetch("/limited-valid-date"), (error) => error instanceof RateLimitError);
  fetchMock.mockRejectedValueOnce(new NetworkError("/network"));
  await assert.rejects(rateClient.fetch("/typed-network"), NetworkError);
});
