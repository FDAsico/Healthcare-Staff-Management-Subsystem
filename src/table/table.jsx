import React from 'react';
import './Table.css';

const InventoryTable = ({ data, onSearch }) => {
    return (
        <div className="table-container">
            <div className="table-controls">
                <h3><span className="badge">Total Products {data.length}</span></h3>
                <div className="controls-right">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        onChange={(e) => onSearch(e.target.value)} 
                    />
                    <select><option>Sort By: Newest</option></select>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
                        <th>ID ⇅</th>
                        <th>Product Name ⇅</th>
                        <th>Price</th>
                        <th>Stock ⇅</th>
                        <th>Description</th>
                        <th>Unit ⇅</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(product => (
                        <tr key={product.id}>
                            <td><input type="checkbox" /></td>
                            <td>{product.id}</td>
                            <td>{product.productName}</td>
                            <td>₱{product.price}</td>
                            <td>{product.stock}</td>
                            <td className="desc-cell">{product.description}</td>
                            <td>{product.unit}</td>
                            <td className="actions">⋮</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;