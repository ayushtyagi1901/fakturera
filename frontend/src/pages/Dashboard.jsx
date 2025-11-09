import { useState } from 'react'
import { FaFileInvoice, FaUsers, FaBuilding, FaBook, FaListAlt, FaFileInvoiceDollar, FaExclamationCircle, FaGift, FaBoxes, FaUserCheck, FaExchangeAlt, FaSignOutAlt, FaCheck, FaSearch, FaPlus, FaPrint, FaCog, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'
import './Dashboard.css'
import './Login.css'

function Dashboard() {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [activeMenu, setActiveMenu] = useState('Price list')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  
  const [tableData, setTableData] = useState([
    { articleNo: 'ART001', productService: 'Product A', inPrice: 100.00, price: 150.00, unit: 'pcs', inStock: 50, description: 'Sample product description' },
    { articleNo: 'ART002', productService: 'Service B', inPrice: 200.00, price: 250.00, unit: 'hrs', inStock: 'N/A', description: 'Sample service description' },
    { articleNo: 'ART003', productService: 'Product C', inPrice: 50.00, price: 75.00, unit: 'pcs', inStock: 100, description: 'Another product description' },
    { articleNo: 'ART004', productService: 'Service D', inPrice: 300.00, price: 400.00, unit: 'hrs', inStock: 'N/A', description: 'Another service description' },
  ])

  const languages = [
    { code: 'sv', name: 'Svenska', flag: 'https://storage.123fakturere.no/public/flags/SE.png' },
    { code: 'en', name: 'English', flag: 'https://storage.123fakturere.no/public/flags/GB.png' }
  ]

  const currentLang = languages.find((lang) => lang.name === selectedLanguage) || languages[1]

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name)
    setIsLangDropdownOpen(false)
  }

  const handleSort = (column) => {
    let newDirection = 'asc'
    
    if (sortColumn === column) {
      // Toggle direction if same column
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }
    
    setSortColumn(column)
    setSortDirection(newDirection)

    const sortedData = [...tableData].sort((a, b) => {
      let aValue, bValue

      if (column === 'articleNo') {
        // Extract numeric part for numerical sorting
        aValue = parseInt(a.articleNo.replace(/\D/g, '')) || 0
        bValue = parseInt(b.articleNo.replace(/\D/g, '')) || 0
      } else if (column === 'productService') {
        // Alphabetical sorting
        aValue = a.productService.toLowerCase()
        bValue = b.productService.toLowerCase()
      }

      if (aValue < bValue) return newDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return newDirection === 'asc' ? 1 : -1
      return 0
    })

    setTableData(sortedData)
  }

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <FaSort className="dashboard-sort-icon" />
    }
    return sortDirection === 'asc' 
      ? <FaSortUp className="dashboard-sort-icon" />
      : <FaSortDown className="dashboard-sort-icon" />
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
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
                    onClick={() => handleLanguageSelect(lang)}
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
        <aside className="dashboard-sidebar">
          <h2 className="dashboard-menu-title">Menu</h2>
          <nav className="dashboard-menu">
            <div className={`dashboard-menu-item ${activeMenu === 'Invoices' ? 'active' : ''}`} onClick={() => setActiveMenu('Invoices')}>
              {activeMenu === 'Invoices' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaFileInvoice className="dashboard-menu-icon" />
              <span>Invoices</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'customers' ? 'active' : ''}`} onClick={() => setActiveMenu('customers')}>
              {activeMenu === 'customers' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaUsers className="dashboard-menu-icon" />
              <span>customers</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'My businesses' ? 'active' : ''}`} onClick={() => setActiveMenu('My businesses')}>
              {activeMenu === 'My businesses' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaBuilding className="dashboard-menu-icon" />
              <span>My businesses</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Invoice journal' ? 'active' : ''}`} onClick={() => setActiveMenu('Invoice journal')}>
              {activeMenu === 'Invoice journal' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaBook className="dashboard-menu-icon" />
              <span>Invoice journal</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Price list' ? 'active' : ''}`} onClick={() => setActiveMenu('Price list')}>
              {activeMenu === 'Price list' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaListAlt className="dashboard-menu-icon" />
              <span>Price list</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Multiple invoicing' ? 'active' : ''}`} onClick={() => setActiveMenu('Multiple invoicing')}>
              {activeMenu === 'Multiple invoicing' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaFileInvoiceDollar className="dashboard-menu-icon" />
              <span>Multiple invoicing</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Unpaid invoices' ? 'active' : ''}`} onClick={() => setActiveMenu('Unpaid invoices')}>
              {activeMenu === 'Unpaid invoices' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaExclamationCircle className="dashboard-menu-icon" />
              <span>Unpaid invoices</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Offer' ? 'active' : ''}`} onClick={() => setActiveMenu('Offer')}>
              {activeMenu === 'Offer' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaGift className="dashboard-menu-icon" />
              <span>Offer</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Inventory Control' ? 'active' : ''}`} onClick={() => setActiveMenu('Inventory Control')}>
              {activeMenu === 'Inventory Control' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaBoxes className="dashboard-menu-icon" />
              <span>Inventory Control</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Member Invoicing' ? 'active' : ''}`} onClick={() => setActiveMenu('Member Invoicing')}>
              {activeMenu === 'Member Invoicing' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaUserCheck className="dashboard-menu-icon" />
              <span>Member Invoicing</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Import/export' ? 'active' : ''}`} onClick={() => setActiveMenu('Import/export')}>
              {activeMenu === 'Import/export' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaExchangeAlt className="dashboard-menu-icon" />
              <span>Import/export</span>
            </div>
            <div className={`dashboard-menu-item ${activeMenu === 'Log out' ? 'active' : ''}`} onClick={() => setActiveMenu('Log out')}>
              {activeMenu === 'Log out' && (
                <div className="dashboard-menu-indicator">
                  <FaCheck className="dashboard-menu-check" />
                </div>
              )}
              <FaSignOutAlt className="dashboard-menu-icon" />
              <span>Log out</span>
            </div>
          </nav>
        </aside>
        <main className="dashboard-main">
          <div className="dashboard-search-container">
            <div className="dashboard-first-search-row">
              <div className="dashboard-search-wrapper">
                <input
                  type="text"
                  className="dashboard-search-bar"
                  placeholder="Search article no"
                />
                <FaSearch className="dashboard-search-icon" />
              </div>
              <div className="dashboard-action-buttons">
                <button className="dashboard-action-button">
                  <span>New Product</span>
                  <FaPlus className="dashboard-action-icon" />
                </button>
                <button className="dashboard-action-button">
                  <span>Print List</span>
                  <FaPrint className="dashboard-action-icon" />
                </button>
                <button className="dashboard-action-button">
                  <span>Advanced Mode</span>
                  <FaCog className="dashboard-action-icon" />
                </button>
              </div>
            </div>
            <div className="dashboard-search-wrapper">
              <input
                type="text"
                className="dashboard-search-bar"
                placeholder="Search product"
              />
              <FaSearch className="dashboard-search-icon" />
            </div>
          </div>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-sortable-header" onClick={() => handleSort('articleNo')}>
                    <span>Article no</span>
                    {getSortIcon('articleNo')}
                  </th>
                  <th className="dashboard-sortable-header" onClick={() => handleSort('productService')}>
                    <span>product/service</span>
                    {getSortIcon('productService')}
                  </th>
                  <th>In Price</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>In Stock</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.articleNo}</td>
                    <td>{row.productService}</td>
                    <td>{row.inPrice}</td>
                    <td>{row.price}</td>
                    <td>{row.unit}</td>
                    <td>{row.inStock}</td>
                    <td>{row.description}</td>
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
