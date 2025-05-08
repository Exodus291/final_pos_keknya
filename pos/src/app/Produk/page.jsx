const Produk = () => {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h1 className="text-xl font-bold">Daftar Produk</h1>
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full mb-4"
                />
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <ul className="space-y-2">
                        {produk.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                            <li key={item.id} className="border-b py-2 flex justify-between items-center">
                                <span>{item.name}</span>
                                <span>{item.price}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
export default Produk;