import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFileInvoice, FaUsers, FaBuilding, FaBook, FaListAlt, FaFileInvoiceDollar, FaExclamationCircle, FaGift, FaBoxes, FaUserCheck, FaExchangeAlt, FaSignOutAlt, FaCheck, FaSearch, FaPlus, FaPrint, FaCog, FaSort, FaSortUp, FaSortDown, FaBars } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import API_URL from '../config/api.js'
import './Dashboard.css'
import './Login.css'

const dashboardTranslations = {
  en: {
    menu: {
      title: 'Menu',
      invoices: 'Invoices',
      customers: 'customers',
      businesses: 'My businesses',
      journal: 'Invoice journal',
      price_list: 'Price list',
      multiple_invoicing: 'Multiple invoicing',
      unpaid: 'Unpaid invoices',
      offer: 'Offer',
      inventory: 'Inventory Control',
      member: 'Member Invoicing',
      import_export: 'Import/export',
      logout: 'Log out'
    },
    search: {
      article_no: 'Search article no',
      product: 'Search product'
    },
    button: {
      new_product: 'New Product',
      print_list: 'Print List',
      advanced_mode: 'Advanced Mode'
    },
    table: {
      article_no: 'Article no',
      product_service: 'product/service',
      in_price: 'In Price',
      price: 'Price',
      unit: 'Unit',
      in_stock: 'In Stock',
      description: 'Description'
    }
  },
  sv: {
    menu: {
      title: 'Meny',
      invoices: 'Fakturor',
      customers: 'kunder',
      businesses: 'Mina företag',
      journal: 'Fakturajournal',
      price_list: 'Prislista',
      multiple_invoicing: 'Multipla faktureringar',
      unpaid: 'Obetalda fakturor',
      offer: 'Offert',
      inventory: 'Lagerstyrning',
      member: 'Medlemsfakturering',
      import_export: 'Import/export',
      logout: 'Logga ut'
    },
    search: {
      article_no: 'Sök artikelnr',
      product: 'Sök produkt'
    },
    button: {
      new_product: 'Ny produkt',
      print_list: 'Skriv ut lista',
      advanced_mode: 'Avancerat läge'
    },
    table: {
      article_no: 'Artikelnr',
      product_service: 'produkt/tjänst',
      in_price: 'Inköpspris',
      price: 'Pris',
      unit: 'Enhet',
      in_stock: 'I lager',
      description: 'Beskrivning'
    }
  }
}

function Dashboard() {
  const navigate = useNavigate()
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const { languages, currentLang, handleLanguageSelect, currentLangCode } = useLanguage()
  const { token, logout } = useAuth()
  const [activeMenu, setActiveMenu] = useState('Price list')
  const [sortColumn, setSortColumn] = useState('article_no')
  const [sortDirection, setSortDirection] = useState('asc')
  const [allProducts, setAllProducts] = useState([])
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [articleNoSearch, setArticleNoSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [editingCell, setEditingCell] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }
    
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  const getTranslation = (key) => {
    const keys = key.split('.')
    let value = dashboardTranslations[currentLangCode]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  const applyFilters = (products, articleNoFilter, productFilter) => {
    let filtered = [...products]
    
    if (articleNoFilter.trim()) {
      filtered = filtered.filter(product =>
        product.articleNo.toLowerCase().includes(articleNoFilter.toLowerCase().trim())
      )
    }
    
    if (productFilter.trim()) {
      filtered = filtered.filter(product =>
        product.productService.toLowerCase().includes(productFilter.toLowerCase().trim())
      )
    }
    
    setTableData(filtered)
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        let sortParam = 'article_no';
        if (sortColumn === 'name') {
          sortParam = 'name';
        } else if (sortColumn === 'article_no') {
          sortParam = 'article_no';
        }
        
        const response = await fetch(
          `${API_URL}/api/products?lang=${currentLangCode}&sort=${sortParam}&order=${sortDirection}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        if (!response.ok) {
          if (response.status === 401) {
            logout()
            navigate('/login/')
            return
          }
          throw new Error(`Failed to fetch products: ${response.statusText}`)
        }
        const data = await response.json()
        
        const transformedData = data.products.map(product => ({
          id: product.id,
          articleNo: product.article_no,
          productService: product.name,
          inPrice: product.in_price ? parseFloat(product.in_price) : null,
          price: parseFloat(product.price),
          unit: product.unit,
          inStock: product.in_stock,
          description: product.description
        }))
        
        setAllProducts(transformedData)
        applyFilters(transformedData, articleNoSearch, productSearch)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentLangCode, sortColumn, sortDirection, token, logout, navigate])

  useEffect(() => {
    setArticleNoSearch('')
    setProductSearch('')
  }, [currentLangCode])

  const handleArticleNoSearch = (e) => {
    const value = e.target.value
    setArticleNoSearch(value)
    applyFilters(allProducts, value, productSearch)
  }

  // Handle product search
  const handleProductSearch = (e) => {
    const value = e.target.value
    setProductSearch(value)
    applyFilters(allProducts, articleNoSearch, value)
  }

  const handleLanguageClick = (language) => {
    handleLanguageSelect(language)
    setIsLangDropdownOpen(false)
  }

  const handleSort = (column) => {
    let newDirection = 'asc'
    let apiColumn = 'article_no';
    if (column === 'productService') {
      apiColumn = 'name';
    } else if (column === 'articleNo') {
      apiColumn = 'article_no';
    }
    
    if (sortColumn === apiColumn) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }
    
    setSortColumn(apiColumn)
    setSortDirection(newDirection)
  }

  const getSortIcon = (column) => {
    const apiColumn = column === 'articleNo' ? 'article_no' : 'name'
    if (sortColumn !== apiColumn) {
      return <FaSort className="dashboard-sort-icon" />
    }
    return sortDirection === 'asc' 
      ? <FaSortUp className="dashboard-sort-icon" />
      : <FaSortDown className="dashboard-sort-icon" />
  }

  const handleCellEdit = (rowId, field, displayValue) => {
    setEditingCell({ rowId, field })
    const row = tableData.find(r => r.id === rowId)
    if (!row) return
    
    let actualValue = row[field]
    if (actualValue === null || actualValue === undefined || actualValue === '') {
      setEditingValue('')
    } else {
      setEditingValue(String(actualValue))
    }
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setEditingValue('')
  }

  const handleCellSave = async (rowId, field) => {
    if (saving) return

    setSaving(true)
    try {
      const updatePayload = {}
      let value = editingValue

      if (field === 'inPrice' || field === 'price') {
        value = value === '' ? null : parseFloat(value)
        if (isNaN(value) && value !== null) {
          alert('Invalid number')
          setSaving(false)
          return
        }
      } else if (field === 'inStock') {
        value = value === '' ? 0 : parseInt(value)
        if (isNaN(value)) {
          alert('Invalid number')
          setSaving(false)
          return
        }
      }

      const fieldMap = {
        'productService': 'name',
        'inPrice': 'in_price',
        'price': 'price',
        'unit': 'unit',
        'inStock': 'in_stock',
        'description': 'description'
      }

      updatePayload[fieldMap[field]] = value

      const response = await fetch(
        `${API_URL}/api/products/${rowId}?lang=${currentLangCode}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatePayload)
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          logout()
          navigate('/login/')
          return
        }
        throw new Error(`Failed to update product: ${response.statusText}`)
      }

      const data = await response.json()
      
      const updatedProducts = allProducts.map(product => {
        if (product.id === rowId) {
          const updated = { ...product }
          if (field === 'productService') {
            updated.productService = data.product.name
          } else if (field === 'inPrice') {
            updated.inPrice = data.product.in_price ? parseFloat(data.product.in_price) : null
          } else if (field === 'price') {
            updated.price = parseFloat(data.product.price)
          } else if (field === 'unit') {
            updated.unit = data.product.unit
          } else if (field === 'inStock') {
            updated.inStock = data.product.in_stock
          } else if (field === 'description') {
            updated.description = data.product.description
          }
          return updated
        }
        return product
      })

      setAllProducts(updatedProducts)
      applyFilters(updatedProducts, articleNoSearch, productSearch)
      setEditingCell(null)
      setEditingValue('')
    } catch (error) {
      console.error('Error updating product:', error)
      alert(`Error saving: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const renderEditableCell = (row, field, displayValue) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === field
    const isReadOnly = field === 'articleNo'
    
    const fieldClassMap = {
      'articleNo': 'dashboard-col-article',
      'productService': 'dashboard-col-product',
      'inPrice': 'dashboard-col-inprice',
      'price': 'dashboard-col-price',
      'unit': 'dashboard-col-unit',
      'inStock': 'dashboard-col-stock',
      'description': 'dashboard-col-description'
    }
    const cellClass = fieldClassMap[field] || ''

    if (isReadOnly) {
      return <td className={cellClass}>{displayValue}</td>
    }

    if (isEditing) {
      return (
        <td className={cellClass}>
          <input
            type={field === 'inPrice' || field === 'price' || field === 'inStock' ? 'number' : 'text'}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={() => handleCellSave(row.id, field)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellSave(row.id, field)
              } else if (e.key === 'Escape') {
                handleCellCancel()
              }
            }}
            autoFocus
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid #3b82f6',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            disabled={saving}
          />
        </td>
      )
    }

    return (
      <td
        className={cellClass}
        onClick={() => handleCellEdit(row.id, field, row[field])}
        style={{
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Click to edit"
      >
        {displayValue}
        <span style={{
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '10px',
          color: '#9ca3af',
          opacity: 0
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0'}
        >✎</span>
      </td>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          {(isTablet || isMobile) && (
            <button className="dashboard-hamburger-button" aria-label="Menu">
              <FaBars />
            </button>
          )}
          {!isTablet && !isMobile && (
            <div className="dashboard-user-profile">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                alt="User Profile" 
                className="dashboard-profile-image"
              />
              <div className="dashboard-user-info">
                <div className="dashboard-user-name">Ayush Tyagi</div>
                <div className="dashboard-user-post">manager</div>
              </div>
            </div>
          )}
          <div className="dashboard-language-switcher">
            <button
              type="button"
              className="dashboard-language-button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            >
              <span>{currentLang.name}</span>
              <img src={currentLang.flag} alt={currentLang.name} className="dashboard-language-flag" />
            </button>
            {isLangDropdownOpen && (
              <div className="dashboard-language-dropdown">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className="dashboard-language-option"
                    onClick={() => handleLanguageClick(lang)}
                  >
                    <span>{lang.name}</span>
                    <img src={lang.flag} alt={lang.name} className="dashboard-language-flag" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {!isTablet && !isMobile && (
          <aside className="dashboard-sidebar">
            <h2 className="dashboard-menu-title">{getTranslation('menu.title')}</h2>
            <nav className="dashboard-menu">
              <div className={`dashboard-menu-item ${activeMenu === 'Invoices' ? 'active' : ''}`} onClick={() => setActiveMenu('Invoices')}>
                {activeMenu === 'Invoices' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaFileInvoice className="dashboard-menu-icon" />
                <span>{getTranslation('menu.invoices')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'customers' ? 'active' : ''}`} onClick={() => setActiveMenu('customers')}>
                {activeMenu === 'customers' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaUsers className="dashboard-menu-icon" />
                <span>{getTranslation('menu.customers')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'My businesses' ? 'active' : ''}`} onClick={() => setActiveMenu('My businesses')}>
                {activeMenu === 'My businesses' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaBuilding className="dashboard-menu-icon" />
                <span>{getTranslation('menu.businesses')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Invoice journal' ? 'active' : ''}`} onClick={() => setActiveMenu('Invoice journal')}>
                {activeMenu === 'Invoice journal' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaBook className="dashboard-menu-icon" />
                <span>{getTranslation('menu.journal')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Price list' ? 'active' : ''}`} onClick={() => setActiveMenu('Price list')}>
                {activeMenu === 'Price list' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaListAlt className="dashboard-menu-icon" />
                <span>{getTranslation('menu.price_list')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Multiple invoicing' ? 'active' : ''}`} onClick={() => setActiveMenu('Multiple invoicing')}>
                {activeMenu === 'Multiple invoicing' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaFileInvoiceDollar className="dashboard-menu-icon" />
                <span>{getTranslation('menu.multiple_invoicing')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Unpaid invoices' ? 'active' : ''}`} onClick={() => setActiveMenu('Unpaid invoices')}>
                {activeMenu === 'Unpaid invoices' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaExclamationCircle className="dashboard-menu-icon" />
                <span>{getTranslation('menu.unpaid')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Offer' ? 'active' : ''}`} onClick={() => setActiveMenu('Offer')}>
                {activeMenu === 'Offer' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaGift className="dashboard-menu-icon" />
                <span>{getTranslation('menu.offer')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Inventory Control' ? 'active' : ''}`} onClick={() => setActiveMenu('Inventory Control')}>
                {activeMenu === 'Inventory Control' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaBoxes className="dashboard-menu-icon" />
                <span>{getTranslation('menu.inventory')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Member Invoicing' ? 'active' : ''}`} onClick={() => setActiveMenu('Member Invoicing')}>
                {activeMenu === 'Member Invoicing' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaUserCheck className="dashboard-menu-icon" />
                <span>{getTranslation('menu.member')}</span>
              </div>
              <div className={`dashboard-menu-item ${activeMenu === 'Import/export' ? 'active' : ''}`} onClick={() => setActiveMenu('Import/export')}>
                {activeMenu === 'Import/export' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaExchangeAlt className="dashboard-menu-icon" />
                <span>{getTranslation('menu.import_export')}</span>
              </div>
              <div 
                className={`dashboard-menu-item ${activeMenu === 'Log out' ? 'active' : ''}`} 
                onClick={() => {
                  logout()
                  navigate('/login/')
                }}
              >
                {activeMenu === 'Log out' && (
                  <div className="dashboard-menu-indicator">
                    <FaCheck className="dashboard-menu-check" />
                  </div>
                )}
                <FaSignOutAlt className="dashboard-menu-icon" />
                <span>{getTranslation('menu.logout')}</span>
              </div>
            </nav>
          </aside>
        )}
        <main className="dashboard-main">
          <div className="dashboard-search-container">
            {isMobile ? (
              <>
                <div className="dashboard-search-wrapper">
                  <input
                    type="text"
                    className="dashboard-search-bar"
                    placeholder={getTranslation('search.article_no')}
                    value={articleNoSearch}
                    onChange={handleArticleNoSearch}
                  />
                  <FaSearch className="dashboard-search-icon" />
                </div>
                <div className="dashboard-search-wrapper">
                  <input
                    type="text"
                    className="dashboard-search-bar"
                    placeholder={getTranslation('search.product')}
                    value={productSearch}
                    onChange={handleProductSearch}
                  />
                  <FaSearch className="dashboard-search-icon" />
                </div>
                <div className="dashboard-action-buttons dashboard-action-buttons-mobile">
                  <button className="dashboard-action-button">
                    <FaPlus className="dashboard-action-icon" />
                  </button>
                  <button className="dashboard-action-button">
                    <FaPrint className="dashboard-action-icon" />
                  </button>
                  <button className="dashboard-action-button">
                    <FaCog className="dashboard-action-icon" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="dashboard-first-search-row">
                  <div className="dashboard-search-wrapper">
                    <input
                      type="text"
                      className="dashboard-search-bar"
                      placeholder={getTranslation('search.article_no')}
                      value={articleNoSearch}
                      onChange={handleArticleNoSearch}
                    />
                    <FaSearch className="dashboard-search-icon" />
                  </div>
                  <div className="dashboard-action-buttons">
                    <button className="dashboard-action-button">
                      {!isTablet && <span>{getTranslation('button.new_product')}</span>}
                      <FaPlus className="dashboard-action-icon" />
                    </button>
                    <button className="dashboard-action-button">
                      {!isTablet && <span>{getTranslation('button.print_list')}</span>}
                      <FaPrint className="dashboard-action-icon" />
                    </button>
                    <button className="dashboard-action-button">
                      {!isTablet && <span>{getTranslation('button.advanced_mode')}</span>}
                      <FaCog className="dashboard-action-icon" />
                    </button>
                  </div>
                </div>
                <div className="dashboard-search-wrapper">
                  <input
                    type="text"
                    className="dashboard-search-bar"
                    placeholder={getTranslation('search.product')}
                    value={productSearch}
                    onChange={handleProductSearch}
                  />
                  <FaSearch className="dashboard-search-icon" />
                </div>
              </>
            )}
          </div>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  {!isMobile && (
                    <th className="dashboard-sortable-header dashboard-col-article" onClick={() => handleSort('articleNo')}>
                      <span>{getTranslation('table.article_no')}</span>
                      {getSortIcon('articleNo')}
                    </th>
                  )}
                  <th className="dashboard-sortable-header dashboard-col-product" onClick={() => handleSort('productService')}>
                    <span>{getTranslation('table.product_service')}</span>
                    {getSortIcon('productService')}
                  </th>
                  {!isTablet && !isMobile && <th className="dashboard-col-inprice">{getTranslation('table.in_price')}</th>}
                  <th className="dashboard-col-price">{getTranslation('table.price')}</th>
                  {!isMobile && <th className="dashboard-col-unit">{getTranslation('table.unit')}</th>}
                  {!isMobile && <th className="dashboard-col-stock">{getTranslation('table.in_stock')}</th>}
                  {!isTablet && !isMobile && <th className="dashboard-col-description">{getTranslation('table.description')}</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={isMobile ? 2 : isTablet ? 5 : 7} style={{ textAlign: 'center', padding: '20px' }}>
                      Loading products...
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={isMobile ? 2 : isTablet ? 5 : 7} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                      Error: {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && tableData.length === 0 && (
                  <tr>
                    <td colSpan={isMobile ? 2 : isTablet ? 5 : 7} style={{ textAlign: 'center', padding: '20px' }}>
                      No products found
                    </td>
                  </tr>
                )}
                {!loading && !error && tableData.map((row) => (
                  <tr key={row.id}>
                    {!isMobile && renderEditableCell(row, 'articleNo', row.articleNo)}
                    {renderEditableCell(row, 'productService', row.productService)}
                    {!isTablet && !isMobile && renderEditableCell(row, 'inPrice', row.inPrice !== null && row.inPrice !== undefined ? Number(row.inPrice).toFixed(2) : '-')}
                    {renderEditableCell(row, 'price', Number(row.price).toFixed(2))}
                    {!isMobile && renderEditableCell(row, 'unit', row.unit || '-')}
                    {!isMobile && renderEditableCell(row, 'inStock', row.inStock)}
                    {!isTablet && !isMobile && renderEditableCell(row, 'description', row.description || '-')}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
