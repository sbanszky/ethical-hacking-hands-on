import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
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
      toast.success("Code section copied to clipboard");
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [index]: false });
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy code section");
    }
  };

  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-300">Marked Code Sections:</h4>
      {sections.map((section, index) => (
        <div key={index} className="relative bg-gray-800 p-4 rounded group">
          <pre className="text-gray-300 whitespace-pre-wrap">
            <code>{section.content}</code>
          </pre>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopySection(section.content, index)}
            >
              {copiedStates[index] ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            {onRemoveSection && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveSection(index)}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarkedSections;