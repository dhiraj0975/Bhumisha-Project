const CategoryRow = ({ index, category, onDelete, onEdit }) => (
    <tr className="bg-gray-200/50 hover:bg-white transition-colors duration-200 transform border-b border-gray-200">
      <td className="p-3">{index}</td>
      {/* <td className="p-3">
        <img src={category.image} alt={category.name} className="w-10 h-10 rounded" />
      </td> */}
      <td className="p-3">{category.name}</td>
      <td className="p-3">{category.createdAt}</td>
      <td className="p-3 flex gap-2">
        <button
          onClick={() => onEdit(category.id)}
          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      </td>
    </tr>
  );
  
  export default CategoryRow;
  