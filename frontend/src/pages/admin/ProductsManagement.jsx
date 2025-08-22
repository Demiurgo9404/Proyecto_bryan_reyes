import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCoins, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const ProductsManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Datos de ejemplo (reemplazar con llamada a la API)
  const sampleProducts = [
    { id: 1, name: 'Paquete Básico', coins: 100, price: 4.99, isActive: true },
    { id: 2, name: 'Paquete Estándar', coins: 250, price: 9.99, isActive: true },
    { id: 3, name: 'Paquete Premium', coins: 500, price: 19.99, isActive: true },
    { id: 4, name: 'Paquete VIP', coins: 1000, price: 34.99, isActive: true },
    { id: 5, name: 'Paquete Oro', coins: 2500, price: 79.99, isActive: true },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Aquí iría la llamada a la API real
        // const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await response.json();
        
        // Usamos datos de ejemplo por ahora
        setProducts(sampleProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este paquete?')) {
      try {
        // Llamada a la API para eliminar
        // await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${id}`, {
        //   method: 'DELETE',
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        
        // Actualización local para el ejemplo
        setProducts(products.filter(p => p.id !== id));
        toast.success('Paquete eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        toast.error('Error al eliminar el paquete');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      coins: parseInt(formData.get('coins')),
      price: parseFloat(formData.get('price')),
      isActive: formData.get('isActive') === 'on',
    };

    try {
      if (editingProduct) {
        // Lógica para actualizar
        setProducts(products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ));
        toast.success('Paquete actualizado correctamente');
      } else {
        // Lógica para crear
        const newProduct = {
          ...productData,
          id: Math.max(...products.map(p => p.id), 0) + 1,
        };
        setProducts([...products, newProduct]);
        toast.success('Paquete creado correctamente');
      }
      
      setShowForm(false);
      setEditingProduct(null);
      e.target.reset();
    } catch (error) {
      console.error('Error al guardar el paquete:', error);
      toast.error('Error al guardar el paquete');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.coins.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Paquetes de Monedas</h1>
          <p className="text-gray-600">Administra los paquetes de monedas disponibles para la compra</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Nuevo Paquete
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar paquetes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Formulario de edición/creación */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Editar Paquete' : 'Nuevo Paquete'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Paquete
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Monedas
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="coins"
                    min="1"
                    step="1"
                    defaultValue={editingProduct?.coins || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaCoins className="text-yellow-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    min="0.01"
                    step="0.01"
                    defaultValue={editingProduct?.price || ''}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingProduct ? editingProduct.isActive : true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Paquete activo
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingProduct ? 'Actualizar' : 'Crear'} Paquete
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de paquetes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                        <FaCoins className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.coins.toLocaleString()} monedas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-6">
                        <div className="text-lg font-semibold text-gray-900">
                          ${product.price.toFixed(2)} USD
                        </div>
                        <div className="text-sm text-gray-500">
                          ${(product.price / product.coins).toFixed(3)} por moneda
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <span className="text-yellow-500 font-medium">
                        {product.coins} monedas
                      </span>
                      <span className="mx-1">•</span>
                      <span className="text-green-600 font-semibold">
                        ${product.price.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-12 text-center">
              <div className="text-gray-400">
                <FaCoins className="mx-auto h-12 w-12" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron paquetes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'No hay coincidencias con tu búsqueda.' 
                    : 'Comienza creando un nuevo paquete.'}
                </p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProductsManagement;
