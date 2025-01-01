import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MarkedSection } from "@/types/marked-sections";

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
      const start = range.startOffset;
      const end = range.endOffset;
      
      if (start !== end) {
        setSelectedText({ start, end });
        toast.success("Text selected! Click 'Mark for Copy' to save this section.");
      }
    }
  };

  return (
    <div className="relative bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-300">Content:</h3>
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
            Mark for Copy
          </Button>
        )}
      </div>
      <pre
        className="text-gray-300 whitespace-pre-wrap cursor-text border border-gray-700 rounded p-2"
        onMouseUp={handleTextSelection}
      >
        <code>{content || 'No content'}</code>
      </pre>
    </div>
  );
};

export default TextSelectionArea;