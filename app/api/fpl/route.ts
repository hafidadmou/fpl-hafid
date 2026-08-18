import { NextResponse } from 'next/server';
import { fetchTeamFromApi, getFriendlyApiError } from '@/lib/fpl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const teamId = String(body?.teamId || '').trim();

    if (!teamId || !/^\d+$/.test(teamId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'أدخل معرّف فريق صحيح.',
        },
        { status: 400 },
      );
    }

    const data = await fetchTeamFromApi(teamId);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('FPL route failed', {
      teamId: String((await request.clone().json()).teamId || '').trim(),
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      {
        success: false,
        message: getFriendlyApiError(error),
      },
      { status: 422 },
    );
  }
}
