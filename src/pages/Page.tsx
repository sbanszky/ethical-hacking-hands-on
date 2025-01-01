import { useParams, Link } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkedSection } from "@/types/marked-sections";

const Page = () => {
  const { slug } = useParams();
  const { pages, isLoading } = useContent();
  
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
                  {Array.isArray(page.marked_sections) && (page.marked_sections as unknown as MarkedSection[]).length > 0 ? (
                    <div className="text-white">
                      {page.content.split('').map((char, index) => {
                        const markedSections = (page.marked_sections as unknown as MarkedSection[]) || [];
                        const isInMarkedSection = markedSections.some(
                          section => index >= section.start && index < section.end
                        );
                        return isInMarkedSection ? (
                          <span key={index} className="bg-gray-700 font-mono">
                            {char}
                          </span>
                        ) : char;
                      })}
                    </div>
                  ) : (
                    <div className="text-white whitespace-pre-wrap">{page.content}</div>
                  )}
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