import { getToken } from '@vercel/connect';

export async function GET() {
  try {
    const token = await getToken('notion/ugc-portfolio', {
      subject: { type: 'app' }
    });

    const response = await fetch(
      'https://api.notion.com/v1/databases/3e075d69a71c80039d79c560544e665a/query',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data },
        { status: response.status }
      );
    }

    return Response.json(data);

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}