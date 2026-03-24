import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { urlConfig } from '../../config';
import './SearchPage.css';

function SearchPage() {

    // ✅ Task 1: state variables
    const [searchQuery, setSearchQuery] = useState('');
    const [ageRange, setAgeRange] = useState(6);
    const [searchResults, setSearchResults] = useState([]);

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = `${urlConfig.backendUrl}/api/gifts`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);

    // ✅ Task 2: search function
    const handleSearch = async () => {
        const baseUrl = `${urlConfig.backendUrl}/api/search?`;

        const queryParams = new URLSearchParams({
            name: searchQuery,
            age_years: ageRange,
            category: document.getElementById('categorySelect').value,
            condition: document.getElementById('conditionSelect').value,
        }).toString();

        try {
            const response = await fetch(`${baseUrl}${queryParams}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    // ✅ Task 6: navigate
    const goToDetailsPage = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">

                    {/* 🔍 Filters */}
                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>

                        {/* ✅ Task 7: search input */}
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* ✅ Task 3: category dropdown */}
                        <label>Category</label>
                        <select id="categorySelect" className="form-control dropdown-filter">
                            <option value="">All</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        {/* ✅ Task 3: condition dropdown */}
                        <label>Condition</label>
                        <select id="conditionSelect" className="form-control dropdown-filter">
                            <option value="">All</option>
                            {conditions.map(condition => (
                                <option key={condition} value={condition}>
                                    {condition}
                                </option>
                            ))}
                        </select>

                        {/* ✅ Task 4: age slider */}
                        <label>Less than {ageRange} years</label>
                        <input
                            type="range"
                            className="age-range-slider"
                            min="1"
                            max="10"
                            value={ageRange}
                            onChange={(e) => setAgeRange(e.target.value)}
                        />

                        {/* ✅ Task 8: search button */}
                        <button
                            className="search-button"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>

                    {/* ✅ Task 5: results */}
                    <div className="search-results mt-4">
                        {searchResults.length > 0 ? (
                            searchResults.map(product => (
                                <div key={product.id} className="card mb-3 search-results-card">

                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="card-img-top"
                                    />

                                    <div className="card-body">
                                        <h5>{product.name}</h5>
                                        <p>
                                            {product.description?.slice(0, 100)}...
                                        </p>
                                    </div>

                                    <div className="card-footer">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => goToDetailsPage(product.id)}
                                        >
                                            View More
                                        </button>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="no-results-alert">
                                No products found. Please revise your filters.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default SearchPage;