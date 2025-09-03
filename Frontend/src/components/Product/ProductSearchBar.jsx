const ProductSearchBar = ({ search, setSearch }) => (
  <input
    type="text"
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64"
  />
);

export default ProductSearchBar;
