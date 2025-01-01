import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MarkedSection } from "@/types/marked-sections";
import { Info } from "lucide-react";

interface TextSelectionAreaProps {
  content: string;
  onMarkSection: (section: MarkedSection) => void;
}

const TextSelectionArea = ({ content, onMarkSection }: TextSelectionAreaProps) => {
  const [selectedText, setSelectedText] = useState<{ start: number; end: number } | null>(null);

  const handleTextSelection = (e: React.MouseEvent<HTMLPreElement>) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const preElement = e.currentTarget;
      const fullText = preElement.textContent || '';
      
      // Get the start and end positions relative to the full content
      const start = fullText.indexOf(selection.toString());
      const end = start + selection.toString().length;
      
      if (start !== -1) {
        setSelectedText({ start, end });
        toast.success("Text selected! Click 'Mark as Code' to add a copy button for this section.");
      }
    }
  };

  return (
    <div className="relative bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-300">Content:</h3>
          <div className="flex items-center text-gray-400 text-xs">
            <Info className="h-4 w-4 mr-1" />
            Select text to mark it as copyable code
          </div>
        </div>
        {selectedText && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const selectedContent = content.substring(selectedText.start, selectedText.end);
              onMarkSection({
                start: selectedText.start,
                end: selectedText.end,
                content: selectedContent
              });
              setSelectedText(null);
            }}
          >
            Mark as Code
          </Button>
        )}
      </div>
      <pre
        className="text-gray-300 whitespace-pre-wrap cursor-text border border-gray-700 rounded p-4 bg-gray-900"
        onMouseUp={handleTextSelection}
      >
        <code>{content || 'No content'}</code>
      </pre>
    </div>
  );
};

export default TextSelectionArea;