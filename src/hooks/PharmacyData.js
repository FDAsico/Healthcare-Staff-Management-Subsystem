import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePharmacyData = () => {
    const [names, setNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    const API_BASE_URL = 'https://healthcare-staff-management-api-648283514768.asia-southeast1.run.app'; 

    useEffect(() => {
        const fetchNames = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/name`);
                setNames(response.data);
            } catch (err) {
                console.error('Error fetching medicines:', err);
                setError(err.message || 'Failed to load medicines');
            } finally {
                setLoading(false);
            }
        };

        fetchNames();
    }, []);

    return { names, loading, error }; 
};