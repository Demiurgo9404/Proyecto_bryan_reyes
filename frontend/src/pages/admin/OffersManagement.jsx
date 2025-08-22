import React, { useState, useEffect } from 'react';
import { FaPercentage, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaSearch, FaTags } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const OffersManagement = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [products, setProducts] = useState([]);
  
  // Datos de ejemplo (reemplazar con llamadas a la API)
  const sampleProducts = [
    { id: 1, name: 'Paquete Básico', coins: 100, price: 4.99 },
    { id: 2, name: 'Paquete Estándar', coins: 250, price: 9.99 },
    { id: 3, name: 'Paquete Premium', coins: 500, price: 19.99 },
  ];

  const sampleOffers = [
    { 
      id: 1, 
      name: 'Oferta de Verano', 
      description: 'Descuento especial de verano',
      discountType: 'percentage',
      discountValue: 20,
      productId: 1,
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      isActive: true,
      product: { id: 1, name: 'Paquete Básico' }
    },
    { 
      id: 2, 
      name: 'Oferta Flash', 
      description: 'Oferta por tiempo limitado',
      discountType: 'fixed',
      discountValue: 5,
      productId: 2,
      startDate: '2023-12-15',
      endDate: '2023-12-20',
      isActive: true,
      product: { id: 2, name: 'Paquete Estándar' }
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Aquí irían las llamadas a la API real
        // const [productsRes, offersRes] = await Promise.all([
        //   fetchProducts(),
        //   fetchOffers()
        // ]);
        
        // Usamos datos de ejemplo por ahora
        setProducts(sampleProducts);
        setOffers(sampleOffers);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta oferta?')) {
      try {
        // Llamada a la API para eliminar
        // await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/offers/${id}`, {
        //   method: 'DELETE',
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        
        // Actualización local para el ejemplo
        setOffers(offers.filter(o => o.id !== id));
        toast.success('Oferta eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar oferta:', error);
        toast.error('Error al eliminar la oferta');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const offerData = {
      name: formData.get('name'),
      description: formData.get('description'),
      discountType: formData.get('discountType'),
      discountValue: parseFloat(formData.get('discountValue')),
      productId: parseInt(formData.get('productId')),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      isActive: formData.get('isActive') === 'on',
    };

    try {
      if (editingOffer) {
        // Lógica para actualizar
        setOffers(offers.map(o => 
          o.id === editingOffer.id ? { 
            ...o, 
            ...offerData,
            product: products.find(p => p.id === parseInt(offerData.productId))
          } : o
        ));
        toast.success('Oferta actualizada correctamente');
      } else {
        // Lógica para crear
        const newOffer = {
          ...offerData,
          id: Math.max(...offers.map(o => o.id), 0) + 1,
          product: products.find(p => p.id === parseInt(offerData.productId))
        };
        setOffers([...offers, newOffer]);
        toast.success('Oferta creada correctamente');
      }
      
      setShowForm(false);
      setEditingOffer(null);
      e.target.reset();
    } catch (error) {
      console.error('Error al guardar la oferta:', error);
      toast.error('Error al guardar la oferta');
    }
  };

  const toggleOfferStatus = async (id) => {
    try {
      // Llamada a la API para actualizar estado
      // await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/offers/${id}/toggle`, {
      //   method: 'PATCH',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Actualización local para el ejemplo
      setOffers(offers.map(offer => 
        offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
      ));
      
      toast.success('Estado de la oferta actualizado');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (offer.product?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getProductName = (productId) => {
    return products.find(p => p.id === productId)?.name || 'Producto no encontrado';
  };

  const calculateNewPrice = (offer) => {
    const product = products.find(p => p.id === offer.productId);
    if (!product) return 'N/A';
    
    if (offer.discountType === 'percentage') {
      const discount = (product.price * offer.discountValue) / 100;
      return `$${(product.price - discount).toFixed(2)}`;
    } else {
      return `$${(product.price - offer.discountValue).toFixed(2)}`;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Ofertas</h1>
          <p className="text-gray-600">Administra las ofertas y descuentos para los paquetes de monedas</p>
        </div>
        <button
          onClick={() => {
            setEditingOffer(null);
            setShowForm(true);
          }}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Nueva Oferta
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
            placeholder="Buscar ofertas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Formulario de edición/creación */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Oferta
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingOffer?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows="2"
                  defaultValue={editingOffer?.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <select
                  name="productId"
                  defaultValue={editingOffer?.productId || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${product.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Descuento
                </label>
                <select
                  name="discountType"
                  defaultValue={editingOffer?.discountType || 'percentage'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor del Descuento
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="discountValue"
                    min="0.01"
                    step="0.01"
                    defaultValue={editingOffer?.discountValue || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={editingOffer?.startDate || ''}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={editingOffer?.endDate || ''}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingOffer ? editingOffer.isActive : true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Oferta activa
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingOffer(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingOffer ? 'Actualizar' : 'Crear'} Oferta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de ofertas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredOffers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredOffers.map((offer) => {
              const product = products.find(p => p.id === offer.productId) || {};
              const isActive = new Date(offer.startDate) <= new Date() && 
                              new Date(offer.endDate) >= new Date() && 
                              offer.isActive;
              
              return (
                <li key={offer.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full ${
                          isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FaTags className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-blue-600">{offer.name}</div>
                          <div className="text-sm text-gray-500">
                            {offer.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-6">
                          <div className="text-lg font-semibold text-gray-900">
                            {offer.discountType === 'percentage' 
                              ? `${offer.discountValue}%` 
                              : `$${offer.discountValue.toFixed(2)}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isActive ? 'Activa' : 'Inactiva'}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingOffer(offer);
                              setShowForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
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
                        <span className="mr-2">Producto:</span>
                        <span className="font-medium">{getProductName(offer.productId)}</span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="mr-2">Precio original:</span>
                        <span className="line-through mr-4">${product.price?.toFixed(2) || '0.00'}</span>
                        
                        <span className="mr-2">Precio con descuento:</span>
                        <span className="text-green-600 font-semibold">
                          {calculateNewPrice(offer)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1 text-gray-400" />
                      <span className="mr-4">
                        Inicio: {new Date(offer.startDate).toLocaleDateString()}
                      </span>
                      <FaCalendarAlt className="mr-1 text-gray-400" />
                      <span>
                        Fin: {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => toggleOfferStatus(offer.id)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {isActive ? 'Desactivar Oferta' : 'Activar Oferta'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="text-gray-400">
              <FaTags className="mx-auto h-12 w-12" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron ofertas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'No hay coincidencias con tu búsqueda.' 
                  : 'Comienza creando una nueva oferta.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersManagement;
