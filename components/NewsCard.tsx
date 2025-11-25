import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Button from './Button';
import { Newspaper, ExternalLink, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NewsItem: React.FC<{ title: string; uri: string }> = ({ title, uri }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 75;
  const shouldTruncate = title.length > maxLength;

  const displayTitle = isExpanded || !shouldTruncate 
    ? title 
    : `${title.slice(0, maxLength).trim()}...`;

  return (
    <div className="flex items-start gap-2">
      <div className="mt-2 w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0"></div>
      <div className="text-sm">
        <a 
          href={uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors inline"
        >
          {displayTitle}
          <ExternalLink className="inline ml-1 h-3 w-3 mb-0.5 opacity-70" />
        </a>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs font-semibold text-slate-500 hover:text-purple-600 dark:text-slate-500 dark:hover:text-purple-400 transition-colors focus:outline-none"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
};

const NewsSkeleton: React.FC = () => (
  <div className="space-y-4 mb-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-2 animate-pulse">
        <div className="mt-2 w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full shrink-0"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const NewsCard: React.FC = () => {
  const [news, setNews] = useState<{title: string, uri: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    setNews([]); // Clear existing news to show skeleton
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Find 3 recent news headlines about "AI in Education" or "EdTech Innovation".',
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      const extractedNews = chunks
        ?.filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }))
        .slice(0, 3) || [];

      if (extractedNews.length === 0) {
        // Fallback if no specific chunks
        const text = response.text;
        if (!text) throw new Error("No content returned");
        // If text exists but no chunks, we might want to just show error for now as we want links
        setError("No linked news found. Try again.");
      } else {
        setNews(extractedNews);
      }
      
    } catch (err) {
      console.error("Error fetching news:", err);
      setError('Unable to fetch news updates.');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, delay: 0.4 } // Delayed slightly after other cards
  };

  return (
    <motion.div 
      {...fadeInUp}
      className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-purple-900/10 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Newspaper className="h-7 w-7 text-purple-600 dark:text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Industry Updates</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 text-sm flex-grow">
        Stay informed with real-time news about AI in education, powered by Google Search.
      </p>

      {loading ? (
        <NewsSkeleton />
      ) : (
        news.length > 0 && (
          <div className="space-y-4 mb-6">
            {news.map((item, index) => (
              <NewsItem key={index} title={item.title} uri={item.uri} />
            ))}
          </div>
        )
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-tight">{error}</p>
        </div>
      )}

      <Button 
        onClick={fetchNews} 
        isLoading={loading}
        variant="outline"
        size="sm"
        className="w-full mt-auto border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"
      >
        {news.length > 0 ? 'Refresh News' : 'Fetch Latest News'}
      </Button>
    </motion.div>
  );
};

export default NewsCard;