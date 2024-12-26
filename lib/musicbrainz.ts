interface SearchParams {
  type?: string;
  query?: string;
  artist?: string;
  title?: string;
  album?: string;
  limit?: number;
}

export async function searchMusicBrainz(params: SearchParams) {
  const baseUrl = "https://musicbrainz.org/ws/2";

  // Determine endpoint based on type or default to recording search
  const endpoint = params.type ? params.type : "recording";

  // Build query string based on provided parameters
  let query = params.query;
  if (!query) {
    const queryParts = [];
    if (params.artist) queryParts.push(`artist:"${params.artist}"`);
    if (params.title) queryParts.push(`recording:"${params.title}"`);
    if (params.album) queryParts.push(`release:"${params.album}"`);
    query = queryParts.join(" AND ");
  }

  const searchParams = new URLSearchParams({
    query,
    fmt: "json",
    limit: params.limit?.toString() || "25",
  });

  const response = await fetch(`${baseUrl}/${endpoint}?${searchParams}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "MyMusicApp/1.0.0 (contact@yourdomain.com)",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MusicBrainz API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // Process results based on endpoint type and add cover art URLs
  switch (endpoint) {
    case "artist":
      return data.artists || [];
    case "release":
      return data.releases || [];
    case "recording":
    default:
      return (
        data.recordings?.map((recording: any) => ({
          ...recording,
          coverArt: recording.releases?.[0]?.id
            ? `https://coverartarchive.org/release/${recording.releases[0].id}/front-250`
            : "/default-album-art.jpg",
        })) || []
      );
  }
}
