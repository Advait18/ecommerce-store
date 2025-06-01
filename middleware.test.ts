import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

vi.mock("next-auth/jwt", () => ({
    getToken: vi.fn(),
}));
import { getToken } from "next-auth/jwt";

import { middleware } from "./middleware";

describe("middleware()", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("redirects to /api/auth/signin?callbackUrl=/admin when no token is present and path starts with /admin", async () => {
        vi.mocked(getToken).mockResolvedValue(null);

        const req = new NextRequest("http://example.com/admin/dashboard");
        const response = await middleware(req);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(307);

        const locationHeader = response.headers.get("location");
        expect(locationHeader).not.toBeNull();

        const redirectedUrl = new URL(locationHeader!);
        expect(redirectedUrl.pathname).toBe("/api/auth/signin");
        expect(redirectedUrl.searchParams.get("callbackUrl")).toBe("/admin");
    });

    test("returns NextResponse.next() when a valid token exists and path starts with /admin", async () => {
        vi.mocked(getToken).mockResolvedValue({ sub: "user-id" });

        const req = new NextRequest("http://example.com/admin/settings");
        const response = await middleware(req);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
    });

    test("returns NextResponse.next() for non-admin paths regardless of token", async () => {
        vi.mocked(getToken).mockResolvedValue(null);
        let req = new NextRequest("http://example.com/public/page");
        let response = await middleware(req);
        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();

        vi.mocked(getToken).mockResolvedValue({ sub: "someone" });
        req = new NextRequest("http://example.com/about");
        response = await middleware(req);
        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
    });
});