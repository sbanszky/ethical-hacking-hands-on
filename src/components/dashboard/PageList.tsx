import { Button } from "@/components/ui/button";

interface PageListProps {
  pages: any[];
  menus: any[];
  onDeletePage: (id: string) => void;
}

const PageList = ({ pages, menus, onDeletePage }: PageListProps) => {
  return (
    <div className="space-y-2 mt-4">
      {pages && pages.length > 0 ? (
        pages.map((page: any) => (
          <div key={page.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div className="flex flex-col">
              <span className="font-medium">{page.title}</span>
              <span className="text-sm text-gray-400">
                {menus.find((m: any) => m.id === page.menu_id)?.title || 'No menu'}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeletePage(page.id)}
            >
              Delete
            </Button>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center py-4">No pages created yet</p>
      )}
    </div>
  );
};

export default PageList;