// /robots.txt: this wiki is for internal use only, so every crawler is asked to stay out.
import type { APIRoute } from 'astro';

export const GET: APIRoute = () =>
  new Response('User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
