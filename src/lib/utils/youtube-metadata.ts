export interface YouTubeMetadata {
  title: string;
  duration: string;
  thumbnail: string;
  channel: string;
  description: string;
  viewCount?: string;
  publishedAt?: string;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export async function getYouTubeMetadata(url: string): Promise<YouTubeMetadata | null> {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Usando a API pública do oEmbed do YouTube
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const data = await response.json();
    
    // Para obter mais detalhes, podemos usar a API do YouTube Data v3
    // Mas para isso precisaríamos de uma API key
    // Por enquanto, vamos usar os dados básicos do oEmbed
    
    return {
      title: data.title,
      duration: 'Unknown', // oEmbed não fornece duração
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channel: data.author_name,
      description: data.title, // oEmbed não fornece descrição completa
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
}

// Função alternativa usando iframe para extrair metadados
export function createYouTubeIframe(videoId: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.style.display = 'none';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  
  return iframe;
}

// Função para validar se é uma URL do YouTube válida
export function isValidYouTubeUrl(url: string): boolean {
  const videoId = extractVideoId(url);
  return videoId !== null && videoId.length === 11;
} 