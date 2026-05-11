import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePharmacyData = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    //const API_BASE_URL = 'https://healthcare-staff-management-api-648283514768.asia-southeast1.run.app'; 

    //useEffect(() => {
        //const fetchProducts = async () => {
            //try {
                //const response = await axios.get(`${API_BASE_URL}/products`);
                //setProducts(response.data);
        //     } catch (err) {
        //         console.error('Error fetching products:', err);
        //         setError(err.message || 'Failed to load products');
        //     } finally {
        //         setLoading(false);
        //     }
        // };

        fetchProducts();
    //}, []);

    return { products, loading, error }; 
};