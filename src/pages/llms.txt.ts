// /llms.txt: a plain-text map of the wiki for language-model readers.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { brand } from '../config/brand';
import { withBase } from '../utils/withBase';

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs', ({ data }) => data.draft !== true)).sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  const lines = [
    '# Claude for Private Equity',
    '',
    `> A teaching wiki on Claude.ai and Claude Code for ${brand.teamName} within ${brand.functionName} at ${brand.firmName}. Internal use only.`,
    '',
    '## Pages',
    '',
    ...docs.map((d) => `- [${d.data.title}](${withBase('/' + d.id)})${d.data.description ? `: ${d.data.description}` : ''}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
