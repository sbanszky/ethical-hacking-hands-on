import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageGalleryDialogProps {
  onImageSelected: (markdown: string) => void;
}

const ImageGalleryDialog = ({ onImageSelected }: ImageGalleryDialogProps) => {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.storage.from('images').list();
      
      if (error) {
        throw error;
      }

      const imageUrls = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(file.name);
          return {
            name: file.name,
            url: publicUrl
          };
        })
      );

      setImages(imageUrls);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image: { name: string; url: string }) => {
    const imageMarkdown = `![${image.name}|size=300x300|align=center](${image.url})\n`;
    onImageSelected(imageMarkdown);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="ml-2">
          <ImageIcon className="h-4 w-4 mr-2" />
          Browse Images
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Select Image</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.name}
                  className="relative group cursor-pointer"
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded-lg transition-transform hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span className="text-white text-sm">Select</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No images uploaded yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryDialog;