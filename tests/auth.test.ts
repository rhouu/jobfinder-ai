import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import { Role } from "@prisma/client";

describe("Authentication & Session Security", () => {
  it("hashes password and verifies successfully", async () => {
    const raw = "SuperSecretPassword123!";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    const valid = await verifyPassword(raw, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("WrongPassword", hash);
    expect(invalid).toBe(false);
  });

  it("signs and verifies JWT session token with roles", async () => {
    const payload = {
      userId: "user-123",
      email: "test@domain.com",
      role: Role.CANDIDATE,
      name: "Test Candidate",
    };

    const token = await createSessionToken(payload);
    expect(token).toBeDefined();

    const decoded = await verifySessionToken(token);
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(Role.CANDIDATE);
  });
});
