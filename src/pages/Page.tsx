import { useParams, Link } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkedSection } from "@/types/marked-sections";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const { slug } = useParams();
  const { pages, isLoading } = useContent();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  console.log("Page component - Current slug:", slug);
  console.log("Page component - Available pages:", pages);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const page = pages.find(p => p.slug === slug);
  
  console.log("Page component - Found page:", page);

  if (!page) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Page not found</h1>
          <Link to="/" className="text-blue-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const handleCopySection = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates({ ...copiedStates, [index]: true });
      toast.success("Code copied to clipboard");
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [index]: false });
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const renderContent = () => {
    if (!page.content) return null;

    const markedSections = page.marked_sections as unknown as MarkedSection[];
    let content = page.content;

    // Process images with custom formatting
    content = content.replace(/!\[(.*?)\|(.*?)\]\((.*?)\)/g, (match, alt, options, url) => {
      const params = new URLSearchParams(options.replace(/\|/g, '&'));
      const size = params.get('size')?.split('x') || [];
      const align = params.get('align') || 'center';
      const width = size[0] || 'auto';
      const height = size[1] || 'auto';

      return `<img 
        src="${url}" 
        alt="${alt}" 
        style="width: ${width}px; height: ${height}px; display: block; margin: ${align === 'center' ? '0 auto' : '0'};"
        class="max-w-full h-auto ${align === 'left' ? 'float-left mr-4' : align === 'right' ? 'float-right ml-4' : ''}"
      />`;
    });

    // Handle marked sections
    if (!Array.isArray(markedSections) || markedSections.length === 0) {
      return <div className="text-white whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    const sortedSections = [...markedSections].sort((a, b) => a.start - b.start);
    let lastIndex = 0;
    const contentParts = [];

    sortedSections.forEach((section, index) => {
      if (section.start > lastIndex) {
        contentParts.push(
          <span key={`text-${index}`} className="text-white" dangerouslySetInnerHTML={{ 
            __html: content.substring(lastIndex, section.start) 
          }} />
        );
      }

      contentParts.push(
        <div key={`marked-${index}`} className="relative inline-block group">
          <span className="bg-gray-900 px-2 py-1 rounded font-mono text-gray-300">
            {section.content}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="absolute -top-8 right-0 h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleCopySection(section.content, index)}
          >
            {copiedStates[index] ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      );

      lastIndex = section.end;
    });

    if (lastIndex < content.length) {
      contentParts.push(
        <span key="text-end" className="text-white" dangerouslySetInnerHTML={{ 
          __html: content.substring(lastIndex) 
        }} />
      );
    }

    return <div className="whitespace-pre-wrap">{contentParts}</div>;
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{page.title}</h1>
        </div>

        {page.content && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="mt-4 bg-gray-900 p-6 rounded-lg">
                <div className="prose prose-invert max-w-none">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;