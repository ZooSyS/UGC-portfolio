import { getToken } from '@vercel/connect';

const DATABASE_ID = '3e075d69a71c80039d79c560544e665a';
const CONTENT_PAGE_ID = '3e075d69a71c802287c1e7ea748cbcef';
const NOTION_VERSION = '2022-06-28';

async function notionFetch(token, url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

function plainText(richText = []) {
  return richText.map((item) => item.plain_text || '').join('');
}

function blockContent(block) {
  const data = block[block.type];
  if (!data) return null;

  if (data.rich_text) return { type: 'text', value: plainText(data.rich_text) };

  if (block.type === 'image') {
    const url = data.type === 'external' ? data.external?.url : data.file?.url;
    return url ? { type: 'image', value: url } : null;
  }

  return null;
}

function setField(target, key, value) {
  if (target[key] === undefined) {
    target[key] = value;
  } else if (Array.isArray(target[key])) {
    target[key].push(value);
  } else {
    target[key] = [target[key], value];
  }
}

function parseContentBlocks(blocks) {
  const content = {};
  let section = null;
  let field = null;
  let buffer = [];

  const flushField = () => {
    if (!section || !field || buffer.length === 0) return;

    const text = buffer.filter((item) => item.type === 'text').map((item) => item.value).join('\n').trim();
    const images = buffer.filter((item) => item.type === 'image').map((item) => item.value);

    if (text) setField(content[section], field, text);
    images.forEach((url) => setField(content[section], field, url));

    buffer = [];
  };

  const openSection = (name) => {
    flushField();
    section = name.toLowerCase();
    field = null;
    content[section] ||= {};
  };

  const closeSection = (name) => {
    flushField();
    if (section === name.toLowerCase()) {
      section = null;
      field = null;
    }
  };

  const openField = (name) => {
    flushField();
    if (!section) return;
    field = name.toLowerCase();
    buffer = [];
  };

  const closeField = (name) => {
    if (!section || field !== name.toLowerCase()) return;
    flushField();
    field = null;
  };

  for (const block of blocks) {
    const item = blockContent(block);
    if (!item) continue;

    if (item.type === 'image') {
      if (section && field) buffer.push(item);
      continue;
    }

    for (const line of item.value.split(/\r?\n/)) {
      const value = line.trim();
      if (!value) continue;

      const closing = value.match(/^\[\/(.+)\]$/);
      if (closing) {
        if (field) closeField(closing[1].trim());
        else closeSection(closing[1].trim());
        continue;
      }

      const opening = value.match(/^\[(.+)\]$/);
      if (opening) {
        if (!section) openSection(opening[1].trim());
        else openField(opening[1].trim());
        continue;
      }

      if (section && field) buffer.push({ type: 'text', value });
    }
  }

  flushField();
  return content;
}

async function getProjects(token) {
  const response = await notionFetch(token, `https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Notion database request failed');
  return data.results || [];
}

async function getContent(token) {
  const response = await notionFetch(token, `https://api.notion.com/v1/blocks/${CONTENT_PAGE_ID}/children?page_size=100`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Notion content page request failed');
  return parseContentBlocks(data.results || []);
}

export async function getSiteData() {
  const token = await getToken('notion/ugc-portfolio', {
    subject: { type: 'app' },
  });

  const [projects, content] = await Promise.all([
    getProjects(token),
    getContent(token),
  ]);

  return { projects, content };
}
