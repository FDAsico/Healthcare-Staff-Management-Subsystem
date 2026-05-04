import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './sidebar/Sidebar';
import InventoryTable from './table/table';
import { usePharmacyData } from './hooks/PharmacyData';
import './App.css';

function App() {
    const { products, loading, addProduct } = usePharmacyData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    if (loading) {
        return <div className="loading">Loading pharmacy data...</div>;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <h1>Good Day Pharmacist!</h1>
                    <h2>Pharmacy</h2>
                </header>

                <section className="pharmacy-section">
                    <motion.div 
                        animate={{ scale: isFormOpen ? 0.98 : 1, opacity: isFormOpen ? 0.5 : 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <InventoryTable 
                            data={filteredProducts} 
                            onSearch={setSearchTerm} 
                        />
                    </motion.div>
                </section>
            </main>
        </div>
    );
}

export default App;