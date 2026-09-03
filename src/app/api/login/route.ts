import { NextResponse } from 'next/server';
import { loginAction } from 'src/actions/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await loginAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
