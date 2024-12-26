type ParsedSearch = {
  song?: string;
  artist?: string;
  album?: string;
};

export function parseSearchQuery(query: string): ParsedSearch {
  const parsed: ParsedSearch = {};

  // Regular expression patterns for different prefixes, supporting quoted strings
  const patterns = {
    song: /(?:^|\s)s:(?:"([^"]+)"|([^"\s]+))(?=\s+\w+:|$)/,
    artist: /(?:^|\s)aa:(?:"([^"]+)"|([^"\s]+))(?=\s+\w+:|$)/,
    album: /(?:^|\s)al:(?:"([^"]+)"|([^"\s]+))(?=\s+\w+:|$)/,
  };

  // Extract values for each prefix
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = query.match(pattern);
    if (match) {
      // match[1] will contain quoted string if present, match[2] will contain unquoted string
      parsed[key as keyof ParsedSearch] = (match[1] || match[2]).trim();
    }
  });

  // If no prefixes found, treat entire query as song title
  if (Object.keys(parsed).length === 0 && query.trim()) {
    // Check if the entire query is quoted
    const fullQueryMatch = query.match(/^"([^"]+)"$|^([^"]+)$/);
    if (fullQueryMatch) {
      parsed.song = (fullQueryMatch[1] || fullQueryMatch[2]).trim();
    } else {
      parsed.song = query.trim();
    }
  }

  return parsed;
}

// Test cases:
/*
console.log(parseSearchQuery('s:"hello world" aa:"ag cook" al:"pop 2"'));
// { song: "hello world", artist: "ag cook", album: "pop 2" }

console.log(parseSearchQuery('aa:"ag cook"'));
// { artist: "ag cook" }

console.log(parseSearchQuery('s:hello aa:cook al:pop'));
// { song: "hello", artist: "cook", album: "pop" }
*/
