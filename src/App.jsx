import React, { useEffect, useState } from "react";

const BookFinder = () => {
  const [query, setQuery] = useState("harry potter");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch books
  const fetchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?title=${query}`);
      const data = await res.json();
      setBooks(data.docs.slice(0, 20));
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Handle theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
    setSidebarOpen(false);
  };

  const handleFavorite = (book) => {
    const isFav = favorites.some((b) => b.key === book.key);
    let updatedFavs;
    if (isFav) {
      updatedFavs = favorites.filter((b) => b.key !== book.key);
    } else {
      updatedFavs = [...favorites, book];
    }
    setFavorites(updatedFavs);
    localStorage.setItem("favorites", JSON.stringify(updatedFavs));
  };

  const isFavorite = (book) => favorites.some((b) => b.key === book.key);

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Sidebar (mobile + desktop) */}
      <aside
        className={`fixed md:relative z-20 top-0 left-0 w-64 md:w-1/4 bg-white dark:bg-gray-800 h-full p-6 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📚 BookMate</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-2xl hover:scale-110 transition"
          >
            ✖
          </button>
        </div>

        {/* Theme toggle */}
        <div className="flex justify-between mb-4">
          <span className="font-medium">Theme</span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-2 py-1 rounded-md border text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <p className="text-sm mb-4 opacity-80">
          Hey Alex! Search books, explore details, and save your favorites.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <input
            type="text"
            placeholder="Search by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 placeholder-gray-400"
                : "bg-gray-50 border-gray-300"
            }`}
          />
          <button
            type="submit"
            className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {/* Favorites Section */}
        <div className="overflow-y-auto max-h-60">
          <h3 className="text-lg font-semibold mb-3">❤️ Favorites</h3>
          {favorites.length === 0 ? (
            <p className="text-sm opacity-70">No favorites yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {favorites.map((book) => (
                <li
                  key={book.key}
                  className="truncate border-b border-gray-300 dark:border-gray-700 pb-1"
                >
                  {book.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl hover:scale-110 transition"
          >
            ☰
          </button>
          <h2 className="text-xl font-bold">Book Finder</h2>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-lg border rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {loading ? (
          <p className="text-center opacity-70 animate-pulse">Loading books...</p>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl shadow-lg transition hover:-translate-y-1 ${
                  theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
                }`}
              >
                <img
                  src={
                    book.cover_i
                      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                      : "https://via.placeholder.com/150x220?text=No+Cover"
                  }
                  alt={book.title}
                  className="w-full h-56 object-cover rounded-lg mb-3"
                />
                <h4 className="text-lg font-semibold mb-1 truncate">{book.title}</h4>
                <p className="text-sm opacity-80 mb-1">
                  Author: {book.author_name?.[0] || "Unknown"}
                </p>
                <p className="text-sm opacity-80 mb-1">
                  Year: {book.first_publish_year || "N/A"}
                </p>
                <p className="text-xs opacity-60 mb-3">
                  Publisher: {book.publisher?.[0] || "N/A"}
                </p>

                <button
                  onClick={() => handleFavorite(book)}
                  className={`w-full py-2 rounded-lg mt-1 transition ${
                    isFavorite(book)
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : theme === "dark"
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {isFavorite(book) ? "Remove Favorite" : "Add to Favorites"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center opacity-70">No books found. Try a different search!</p>
        )}
      </main>
    </div>
  );
};

export default BookFinder;
