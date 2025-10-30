import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();

    const testCookie = cookieStore.get("test-cookie");
    const userAgent = headersList.get("user-agent");
    const host = headersList.get("host");

    const diagnostics = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      requestContext: {
        cookiesAccessible: true,
        headersAccessible: true,
        testCookieValue: testCookie?.value || null,
        userAgent: userAgent || "unknown",
        host: host || "unknown",
      },
      environment: {
        nodeVersion: process.version,
        runtime: "nodejs",
        webContainer: !!process.env.WEBCONTAINER_ID,
      },
    };

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: {
          message: (error as Error).message,
          name: (error as Error).name,
          stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}
