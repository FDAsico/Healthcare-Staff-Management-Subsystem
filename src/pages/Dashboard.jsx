import React from 'react';

const InventoryTable = ({ data, onSearch }) => {
    // Shared classes to keep the code clean
    const inputClasses = "py-2 px-3 border border-[#e5e7eb] rounded-[6px] text-[0.9rem] focus:outline-none focus:border-[#007bff]";
    const thClasses = "bg-[#f9fafb] py-3 px-4 text-[0.85rem] font-semibold text-[#4b5563] border-b border-[#e5e7eb]";
    const tdClasses = "p-4 text-[0.9rem] text-[#1f2937] border-b border-[#f3f4f6]";

    return (
            <div className="min-h-screen bg-[#f9fafb] w-full p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Good Day Pharmacist!
                    </h1>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Pharmacy
                    </h2>
                </div>  
                
<div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-3">
        <h3 className="text-[1.1rem] font-bold text-[#111827] m-0">
            Total Products
        </h3>
        <span className="bg-[#f97316] text-white px-2 py-0.5 rounded-[6px] text-[0.75rem] font-bold">
            {data?.length || 0}
        </span>
    </div>

    <div className="flex gap-3 items-center">
        <div className="relative">
            <input 
                type="text" 
                placeholder="Search" 
                className="py-2 pl-3 pr-10 border border-[#e5e7eb] rounded-[8px] text-[0.85rem] text-[#6b7280] w-[240px] focus:outline-none focus:border-[#3b82f6] transition-colors"
                onChange={(e) => onSearch(e.target.value)} 
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
        </div>
        
        <select className="py-2 px-3 border border-[#e5e7eb] rounded-[8px] text-[0.85rem] text-[#374151] bg-white cursor-pointer focus:outline-none">
            <option>Sort By : Newest</option>
            <option>Sort By : Oldest</option>
            <option>Sort By : Stock</option>
        </select>
    </div>
</div>
            </div>

            <table className="w-full border-collapse text-left">
                <thead>
                    <tr>
                        <th className={thClasses}><input type="checkbox" className="cursor-pointer" /></th>
                        <th className={thClasses}>ID ⇅</th>
                        <th className={thClasses}>Product Name ⇅</th>
                        <th className={thClasses}>Price</th>
                        <th className={thClasses}>Stock ⇅</th>
                        <th className={thClasses}>Description</th>
                        <th className={thClasses}>Unit ⇅</th>
                        <th className={thClasses}></th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className={tdClasses}><input type="checkbox" className="cursor-pointer" /></td>
                            <td className={tdClasses}>{product.id}</td>
                            <td className={tdClasses + " font-medium"}>{product.productName}</td>
                            <td className={tdClasses}>₱{product.price}</td>
                            <td className={tdClasses}>{product.stock}</td>
                            {/* desc-cell conversion: text-color + max-width + truncate */}
                            <td className={`${tdClasses} text-[#6b7280] max-w-[300px] truncate`}>
                                {product.description}
                            </td>
                            <td className={tdClasses}>{product.unit}</td>
                            <td className={`${tdClasses} cursor-pointer font-bold text-[#9ca3af] hover:text-[#111] text-center text-xl`}>
                                ⋮
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                    <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            Showing 
            <select className="border border-gray-200 rounded p-1 outline-none">
              <option>10</option>
            </select>
            Results
          </div>
          
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded-l-md hover:bg-gray-50">Prev</button>
            <button className="px-3 py-1 bg-blue-600 text-white border border-blue-600">1</button>
            <button className="px-3 py-1 border border-gray-200 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded-r-md hover:bg-gray-50">Next</button>
          </div>
        </div>
          </div>
    
  );

};


export default InventoryTable;