import { XMLParser } from 'fast-xml-parser';

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  category: string;
  description: string;
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const RSS_URL = 'https://www.forexlive.com/feed/news/';

export const fetchRSSFeed = async (): Promise<RSSItem[]> => {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(RSS_URL)}`);
    const xmlData = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "text",
      removeNSPrefix: true
    });
    
    const result = parser.parse(xmlData);
    const items = result.rss.channel.item;
    
    return items.map((item: any) => ({
      title: item.title?.text || item.title,
      link: item.link,
      pubDate: item.pubDate,
      creator: item['dc:creator']?.text || item['dc:creator'],
      category: item.category?.text || item.category,
      description: item.description?.text || item.description
    }));
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return [];
  }
};