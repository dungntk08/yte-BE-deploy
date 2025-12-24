import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../modules/products/models/Product';
import { getProducts } from '../../modules/products/services/productService';
import { Search, Loader } from 'lucide-react';

interface ProductSearchSelectProps {
    value?: number | string;
    initialDisplayName?: string;
    onSelect: (product: Product) => void;
    placeholder?: string;
}

const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({ value, initialDisplayName, onSelect, placeholder = 'Tìm thuốc...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState(initialDisplayName || '');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialDisplayName) {
            setKeyword(initialDisplayName);
        }
    }, [initialDisplayName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                // Also check if click is inside the portal dropdown
                const dropdown = document.getElementById('product-search-dropdown');
                if (dropdown && dropdown.contains(event.target as Node)) {
                    return;
                }
                setIsOpen(false);
            }
        };
        
        const handleScroll = () => {
             if (isOpen) setIsOpen(false); // Close on scroll to avoid detached popup
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true); // Capture phase to detect table scroll
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const updatePosition = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width
            });
        }
    };

    const handleSearch = async (term: string) => {
        setKeyword(term);
        if (!term.trim()) {
            setResults([]);
            return;
        }

        updatePosition();
        setLoading(true);
        setIsOpen(true);
        try {
            const data = await getProducts(1, term);
            const list = Array.isArray(data) ? data : data.data || [];
            setResults(list);
        } catch (error) {
            console.error('Search error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (product: Product) => {
        onSelect(product);
        setKeyword(`${product.name} (${product.code})`);
        setIsOpen(false);
    };

    const dropdownContent = (
        <div 
            id="product-search-dropdown"
            className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto"
            style={{
                left: coords.left,
                width: coords.width,
                bottom: window.innerHeight - coords.top + 4 // Position ABOVE the input
            }}
        >
             {results.length > 0 ? (
                results.map((product) => (
                    <div
                        key={product.id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-sm"
                        onClick={() => handleSelect(product)}
                    >
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-gray-500 text-xs">Mã: {product.code} | ĐVT: {product.unit}</div>
                    </div>
                ))
            ) : (
                <div className="p-2 text-center text-gray-500 text-sm">
                    {loading ? 'Đang tìm...' : 'Không tìm thấy kết quả'}
                </div>
            )}
        </div>
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 pl-8 focus:outline-none focus:border-blue-500"
                    value={keyword}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => {
                        updatePosition();
                        if (keyword) handleSearch(keyword);
                        else setIsOpen(true);
                    }}
                    onClick={updatePosition}
                    autoComplete="off"
                    placeholder={placeholder}
                />
                <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {loading && <Loader size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />}
            </div>

            {isOpen && (results.length > 0 || loading || (keyword && results.length === 0)) && 
                createPortal(dropdownContent, document.body)
            }
        </div>
    );
};

export default ProductSearchSelect;
