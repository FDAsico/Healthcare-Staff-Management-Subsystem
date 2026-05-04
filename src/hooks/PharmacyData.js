import { useState, useEffect } from 'react';

export const usePharmacyData = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

useEffect(() => {
    fetch('/data.json')
        .then((res) => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then((data) => {
            setProducts(data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Fetch error:", err); // Fixed: added console.
            setLoading(false); // Good practice: stop loading even on error
        });
}, []);

    const addProduct = (newProduct) => {
        setProducts(prev => [newProduct, ...prev]);
    };

    return { products, loading, addProduct };
};