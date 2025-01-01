import { Button } from "@/components/ui/button";
import { Copy, Check, Code, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MarkedSection } from "@/types/marked-sections";

interface MarkedSectionsProps {
  sections: MarkedSection[];
  onRemoveSection?: (index: number) => void;
}

const MarkedSections = ({ sections, onRemoveSection }: MarkedSectionsProps) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

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

  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
        <Code className="h-4 w-4" />
        <h4>Marked Code Sections:</h4>
      </div>
      {sections.map((section, index) => (
        <div key={index} className="relative bg-gray-900 border border-gray-700 p-4 rounded-lg group">
          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
            <code>{section.content}</code>
          </pre>
          <div className="absolute top-2 right-2 flex gap-2">
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
            {onRemoveSection && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onRemoveSection(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarkedSections;