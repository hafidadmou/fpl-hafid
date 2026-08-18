import { NextResponse } from 'next/server';
import { fetchFplMeta, fetchTeamFromApi, getFriendlyApiError } from '@/lib/fpl';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = String(searchParams.get('teamId') || '').trim();

    if (teamId && /^\d+$/.test(teamId)) {
      const data = await fetchTeamFromApi(teamId);
      return NextResponse.json({ success: true, data });
    }

    const meta = await fetchFplMeta();
    return NextResponse.json({ success: true, data: meta });
  } catch (error) {
    console.error('FPL meta route failed', error);
    return NextResponse.json(
      { success: false, message: getFriendlyApiError(error) },
      { status: 422 },
    );
  }
}

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
