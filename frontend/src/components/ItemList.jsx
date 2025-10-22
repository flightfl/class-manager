import React from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';

const ItemList = ({ items, viewTab, onToggleStatus, onDelete, type, extraInfo }) => {
  const filteredItems = items.filter(item => 
    viewTab === 'active' ? item.status === 'active' : item.status === 'archived'
  );
  
  if (filteredItems.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        {viewTab === 'active' ? `No active ${type}` : `No archived ${type}`}
      </p>
    );
  }
  
  return filteredItems.map(item => (
    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <span className="font-medium">{item.name}</span>
        {item.grade && <span className="text-gray-500 ml-3">{item.grade}</span>}
        {item.year && <span className="text-gray-500 ml-3">{item.year} {item.term}</span>}
        {extraInfo && <span className="text-sm text-gray-400 ml-3">{extraInfo(item)}</span>}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onToggleStatus(item._id)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50"
          title={item.status === 'active' ? 'Archive' : 'Restore'}
        >
          {item.status === 'active' ? <Archive size={18} /> : <ArchiveRestore size={18} />}
          <span className="text-sm">{item.status === 'active' ? 'Archive' : 'Restore'}</span>
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="text-red-600 hover:text-red-700"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  ));
};

export default ItemList;