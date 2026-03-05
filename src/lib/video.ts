const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;

export function getEmbedUrl(url: string): string | null {
	const ytMatch = url.match(YOUTUBE_REGEX);
	if (ytMatch) {
		return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
	}
	const vimeoMatch = url.match(VIMEO_REGEX);
	if (vimeoMatch) {
		return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
	}
	return null;
}
