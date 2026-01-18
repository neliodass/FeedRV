import { ExternalLink, CheckCircle, Trash2 } from 'lucide-react';

interface Tag {
    name: string;
}

interface ItemProps {
    item: {
        id: number;
        title: string;
        summary: string;
        url: string;
        source_type: string;
        priority: number;
        is_consumed: boolean;
        tags: Tag[];
        image_url: string | null;
    };
    onDelete: (id: number) => void;
    onToggleConsume: (id: number) => void;
}

const ItemCard = ({ item, onDelete, onToggleConsume }: ItemProps) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
            {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            )}
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{item.source_type}</span>
                    <div className="flex gap-2">
                        <button onClick={() => onToggleConsume(item.id)} className={item.is_consumed ? 'text-green-500' : 'text-slate-500'}>
                            <CheckCircle size={18} />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="text-slate-500 hover:text-red-500">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <h3 className="font-semibold text-slate-100 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4">{item.summary}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, index) => (
                        <span key={`${item.id}-${tag.name}-${index}`} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">#{tag.name}</span>
                    ))}
                </div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium">
                    Otwórz źródło <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
};

export default ItemCard;
