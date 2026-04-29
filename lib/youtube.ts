import ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';

export async function getVideoMetadata(url: string) {
  try {
    const info = await ytdl.getInfo(url);
    return {
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      channel: info.videoDetails.author.name,
      id: info.videoDetails.videoId,
    };
  } catch (error) {
    // Basic fallback parsing if ytdl fails (common due to frequent YouTube changes)
    const urlObj = new URL(url);
    let id = urlObj.searchParams.get('v');
    if (!id && urlObj.hostname === 'youtu.be') {
      id = urlObj.pathname.slice(1);
    }
    if (!id) throw new Error('Invalid YouTube URL');
    return {
      title: 'YouTube Video',
      description: '',
      channel: 'Unknown',
      id
    };
  }
}

export async function getTranscript(url: string, videoId: string) {
  try {
    const transcriptLines = await YoutubeTranscript.fetchTranscript(videoId);
    return transcriptLines.map((t: any) => t.text).join(' ');
  } catch (error) {
    console.warn('Transcript not available, returning empty.');
    return '';
  }
}
