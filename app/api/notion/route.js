import { getSiteData } from '../../../lib/notion';

export async function GET() {
  try {
    return Response.json(await getSiteData());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Notion request failed' },
      { status: 500 }
    );
  }
}
