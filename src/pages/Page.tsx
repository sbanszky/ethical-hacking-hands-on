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

  const renderMarkedSections = () => {
    const markedSections = page.marked_sections as unknown as MarkedSection[];
    if (!Array.isArray(markedSections) || markedSections.length === 0) return null;

    return (
      <div className="space-y-4 mt-4">
        {markedSections.map((section, index) => (
          <div key={index} className="relative bg-gray-900 border border-gray-700 p-4 rounded-lg">
            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
              <code>{section.content}</code>
            </pre>
            <div className="absolute top-2 right-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3"
                onClick={() => handleCopySection(section.content, index)}
              >
                {copiedStates[index] ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
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
                  <div className="text-white whitespace-pre-wrap">{page.content}</div>
                  {renderMarkedSections()}
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