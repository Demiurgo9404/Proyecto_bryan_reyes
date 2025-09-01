import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { getMyTransactions } from '../../api/coinService';
import { FaCoins, FaArrowUp, FaArrowDown, FaSearch, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #fff;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  color: #fff;
`;

const FiltersContainer = styled.div`
  background: #1e1e2d;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: #8c8c9e;
`;

const FilterInput = styled.input`
  background: #2a2a3c;
  border: 1px solid #3a3a4a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #fff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const FilterSelect = styled.select`
  background: #2a2a3c;
  border: 1px solid #3a3a4a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const TransactionList = styled.div`
  background: #1e1e2d;
  border-radius: 8px;
  overflow: hidden;
`;

const TransactionHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  background: #2a2a3c;
  font-weight: 600;
  color: #8c8c9e;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TransactionItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 1.5rem;
  border-bottom: 1px solid #2a2a3c;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
`;

const TransactionMobileRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const TransactionLabel = styled.span`
  color: #8c8c9e;
  font-size: 0.9rem;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const TransactionValue = styled.span`
  color: ${({ type }) => 
    type === 'credit' ? '#4CAF50' : type === 'debit' ? '#ef4444' : '#fff'};
  font-weight: ${({ bold }) => (bold ? '600' : 'normal')};
`;

const StatusBadge = styled.span`
  background: ${({ status }) => 
    status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 
    status === 'pending' ? 'rgba(255, 152, 0, 0.1)' :
    'rgba(239, 68, 68, 0.1)'};
  color: ${({ status }) => 
    status === 'completed' ? '#4CAF50' : 
    status === 'pending' ? '#ff9800' :
    '#ef4444'};
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #8c8c9e;
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #4a4a5a;
  }
  
  h3 {
    color: #fff;
    margin-bottom: 0.5rem;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  background: ${({ active }) => (active ? '#6366f1' : '#2a2a3c')};
  color: ${({ active }) => (active ? '#fff' : '#8c8c9e')};
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ active }) => (active ? '#4f46e5' : '#3a3a4a')};
    color: #fff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = {
          pageNumber: filters.page,
          pageSize: filters.pageSize,
          transactionType: filters.type || undefined,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined
        };
        
        const data = await getMyTransactions(params);
        setTransactions(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('No se pudieron cargar las transacciones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy, hh:mm a", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  const getTransactionTypeLabel = (type) => {
    const types = {
      'purchase': 'Compra de monedas',
      'video_call': 'Llamada de video',
      'photo_access': 'Acceso a foto',
      'video_access': 'Acceso a video',
      'admin_adjustment': 'Ajuste de administrador',
      'refund': 'Reembolso'
    };
    
    return types[type] || type;
  };

  return (
    <Container>
      <Title>Historial de Transacciones</Title>
      
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Tipo de transacción</FilterLabel>
          <FilterSelect 
            name="type" 
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">Todos los tipos</option>
            <option value="purchase">Compra de monedas</option>
            <option value="video_call">Llamadas de video</option>
            <option value="photo_access">Acceso a fotos</option>
            <option value="video_access">Acceso a videos</option>
            <option value="admin_adjustment">Ajustes</option>
            <option value="refund">Reembolsos</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Estado</FilterLabel>
          <FilterSelect 
            name="status" 
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Desde</FilterLabel>
          <FilterInput 
            type="date" 
            name="startDate" 
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Hasta</FilterLabel>
          <FilterInput 
            type="date" 
            name="endDate" 
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </FilterGroup>
      </FiltersContainer>
      
      {isLoading ? (
        <EmptyState>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando transacciones...</p>
        </EmptyState>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : transactions.length === 0 ? (
        <EmptyState>
          <FaCoins />
          <h3>No hay transacciones</h3>
          <p>No se encontraron transacciones con los filtros seleccionados.</p>
        </EmptyState>
      ) : (
        <>
          <TransactionList>
            <TransactionHeader>
              <div>Transacción</div>
              <div>Fecha</div>
              <div>Monto</div>
              <div>Saldo</div>
              <div>Estado</div>
            </TransactionHeader>
            
            {transactions.map((tx) => (
              <TransactionItem key={tx.id}>
                <div>
                  <TransactionMobileRow>
                    <TransactionLabel>Transacción:</TransactionLabel>
                  </TransactionMobileRow>
                  <div>{getTransactionTypeLabel(tx.transactionType)}</div>
                  <div style={{ fontSize: '0.9rem', color: '#8c8c9e', marginTop: '0.25rem' }}>
                    {tx.description}
                  </div>
                </div>
                
                <TransactionMobileRow>
                  <TransactionLabel>Fecha:</TransactionLabel>
                  <TransactionValue>{formatDate(tx.createdAt)}</TransactionValue>
                </TransactionMobileRow>
                <div className="d-none d-md-block">
                  {formatDate(tx.createdAt)}
                </div>
                
                <TransactionMobileRow>
                  <TransactionLabel>Monto:</TransactionLabel>
                  <TransactionValue type={tx.amount >= 0 ? 'credit' : 'debit'}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} <FaCoins style={{ color: '#ffd700' }} />
                  </TransactionValue>
                </TransactionMobileRow>
                <div className="d-none d-md-block">
                  <TransactionValue type={tx.amount >= 0 ? 'credit' : 'debit'}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} <FaCoins style={{ color: '#ffd700' }} />
                  </TransactionValue>
                </div>
                
                <TransactionMobileRow>
                  <TransactionLabel>Saldo:</TransactionLabel>
                  <TransactionValue bold>{tx.balanceAfter?.toLocaleString()} <FaCoins style={{ color: '#ffd700' }} /></TransactionValue>
                </TransactionMobileRow>
                <div className="d-none d-md-block">
                  <TransactionValue bold>{tx.balanceAfter?.toLocaleString()} <FaCoins style={{ color: '#ffd700' }} /></TransactionValue>
                </div>
                
                <TransactionMobileRow>
                  <TransactionLabel>Estado:</TransactionLabel>
                  <StatusBadge status={tx.status?.toLowerCase()}>
                    {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1).toLowerCase()}
                  </StatusBadge>
                </TransactionMobileRow>
                <div className="d-none d-md-block">
                  <StatusBadge status={tx.status?.toLowerCase()}>
                    {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1).toLowerCase()}
                  </StatusBadge>
                </div>
              </TransactionItem>
            ))}
          </TransactionList>
          
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
              >
                Anterior
              </PageButton>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (filters.page <= 3) {
                  pageNum = i + 1;
                } else if (filters.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = filters.page - 2 + i;
                }
                
                return (
                  <PageButton 
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    active={filters.page === pageNum}
                  >
                    {pageNum}
                  </PageButton>
                );
              })}
              
              <PageButton 
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
              >
                Siguiente
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default TransactionHistoryPage;
