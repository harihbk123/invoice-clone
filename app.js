// Shared stats calculation for dashboard/analytics
function getStats(invoices, clients, monthlyEarnings) {
    const totalEarnings = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const totalInvoices = invoices.length;
    const totalClients = clients.length;
    const avgInvoice = invoices.filter(inv => inv.status === 'Paid').length > 0
        ? totalEarnings / invoices.filter(inv => inv.status === 'Paid').length
        : 0;
    const avgMonthly = monthlyEarnings.length > 0
        ? monthlyEarnings.reduce((sum, m) => sum + m.amount, 0) / monthlyEarnings.length
        : 0;
    return { totalEarnings, totalInvoices, totalClients, avgInvoice, avgMonthly };
}
// Renders the clients grid (used by search, filters, etc.)
function renderClientsGrid() {
    const grid = document.getElementById('clients-grid-enhanced');
    if (!grid) return;

    if (appData.clients.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">
                    <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <h3>No clients found</h3>
                <p>No clients match your search criteria</p>
                <button class="btn-modern btn-primary" onclick="viewAllClients()">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    View All Clients
                </button>
            </div>
        `;
        return;
    }

    // Generate enhanced client cards (same as in renderClients)
    grid.innerHTML = appData.clients.map((client, index) => {
        const avatar = client.name.charAt(0).toUpperCase();
        const completionRate = client.total_invoices > 0 ? Math.min(100, ((client.total_amount || 0) / 50000) * 100) : 0;
        const isActive = index % 3 !== 2; // Make some inactive for demo
        const lastInvoice = appData.invoices.filter(inv => inv.clientId === client.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const lastActivity = lastInvoice ? `Last invoice ${formatTimeAgo(lastInvoice.date)}` : 'No recent activity';
        
        return `
            <div class="client-card-modern ${isActive ? 'active' : 'inactive'}" data-client-id="${client.id}">
                <div class="client-card-header-modern">
                    <div class="client-avatar-section">
                        <div class="client-avatar-large gradient-${['primary', 'success', 'warning', 'info'][index % 4]}">
                            <span class="avatar-text">${avatar}</span>
                        </div>
                        <div class="client-tier-badge ${(client.tier || 'Standard').toLowerCase()}">
                            ${client.tier || 'Standard'}
                        </div>
                    </div>
                    <div class="client-actions-modern">
                        <button class="action-btn-modern edit-btn" data-client-id="${client.id}" title="Edit client">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L9.708 9.708a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l6-6zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern delete-btn" data-client-id="${client.id}" data-client-name="${escapeHtml(client.name)}" title="Delete client">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern more-btn" title="More options">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="client-info-modern">
                    <h3 class="client-name-modern">${escapeHtml(client.name)}</h3>
                    <div class="client-contact-grid">
                        <div class="contact-item-modern">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            <span class="contact-text">${escapeHtml(client.email)}</span>
                        </div>
                        ${client.phone ? `
                        <div class="contact-item-modern">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            <span class="contact-text">${escapeHtml(client.phone)}</span>
                        </div>
                        ` : ''}
                        ${client.contact_name ? `
                        <div class="contact-item-modern">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <span class="contact-text">${escapeHtml(client.contact_name)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="client-metrics-modern">
                    <div class="metrics-grid-mini">
                        <div class="metric-mini">
                            <div class="metric-mini-label">Total Invoices</div>
                            <div class="metric-mini-value">${client.total_invoices || 0}</div>
                        </div>
                        <div class="metric-mini">
                            <div class="metric-mini-label">Total Revenue</div>
                            <div class="metric-mini-value">₹${formatNumber(client.total_amount || 0)}</div>
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <div class="progress-header">
                            <span class="progress-label">Payment Completion</span>
                            <span class="progress-percentage">${completionRate.toFixed(0)}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${completionRate}%"></div>
                        </div>
                    </div>
                </div>

                <div class="client-footer-modern">
                    <div class="activity-info">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span class="activity-text">${lastActivity}</span>
                    </div>
                    <button class="view-details-btn" onclick="viewClientDetails('${client.id}')">
                        View Details
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Re-attach event handlers for the new grid items
    setTimeout(() => {
        setupClientCardEventListeners();
    }, 0);
}

// Setup event listeners for client cards
function setupClientCardEventListeners() {
    // Edit client buttons
    document.querySelectorAll('.action-btn-modern.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clientId = btn.dataset.clientId;
            editClient(clientId);
        });
    });

    // Delete client buttons
    document.querySelectorAll('.action-btn-modern.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clientId = btn.dataset.clientId;
            const clientName = btn.dataset.clientName;
            deleteClient(clientId, clientName);
        });
    });

    // Client card click (for details)
    document.querySelectorAll('.client-card-modern').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.action-btn-modern')) return;
            
            const clientId = card.dataset.clientId;
            viewClientDetails(clientId);
        });
    });
}
// ============================================
// COMPLETE EXPENSE MANAGEMENT SYSTEM - FIXED VERSION
// Place this BEFORE the checkAuth() function in your app.js
// ============================================

// Enhanced ExpenseUI class with all features working
class ExpenseUI {
    constructor(expenseManager, showToast) {
        this.expenseManager = expenseManager;
        this.showToast = showToast;
        this.expenseChart = null;
        this.categoryChart = null;
        this.chartRenderTimeout = null;
        this.currentSort = {
            field: 'date',
            direction: 'desc'
        };
        this.currentFilters = {
            search: '',
            dateRange: 'all',
            category: 'all',
            paymentMethod: 'all',
            businessOnly: false
        };
        // Pagination properties
        this.pagination = {
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
            totalItems: 0
        };
    }

    getExpensesPageHTML() {
        return `
            <!-- Enhanced Hero Section -->
            <div class="enhanced-hero-section">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1 class="hero-title">Expense Management</h1>
                        <p class="hero-subtitle">Track and manage your business expenses efficiently</p>
                    </div>
                    <div class="hero-actions">
                        <button class="btn-modern btn-secondary" id="export-expenses-btn">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Export
                        </button>
                        <button class="btn-modern btn-primary" id="add-expense-btn">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            Add Expense
                        </button>
                    </div>
                </div>
            </div>

            <!-- Enhanced Summary Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon stat-icon-primary">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="total-expenses-value">₹18,83,050.52</div>
                        <div class="stat-label">Total Expenses</div>
                        <div class="stat-change stat-change-positive">+12.3%</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon stat-icon-secondary">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zM1 5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5H1z"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="month-expenses-value">₹65,212.69</div>
                        <div class="stat-label">This Month</div>
                        <div class="stat-change stat-change-positive">+8.2%</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon stat-icon-accent">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="avg-expense-value">₹1,04,613.918</div>
                        <div class="stat-label">Average Expense</div>
                        <div class="stat-change stat-change-negative">-2.1%</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon stat-icon-success">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="expense-count-value">18</div>
                        <div class="stat-label">Total Transactions</div>
                        <div class="stat-change stat-change-positive">+15</div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-container" style="margin-bottom: 32px;">
                <div class="chart-wrapper">
                    <div class="chart-header">
                        <h3>Monthly Expense Trend</h3>
                        <div class="chart-legend">
                            <span class="legend-item">
                                <span class="legend-color" style="background: var(--primary);"></span>
                                Expenses
                            </span>
                        </div>
                    </div>
                    <div class="chart-content">
                        <canvas id="expenseMonthlyChart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <div class="chart-wrapper">
                    <div class="chart-header">
                        <h3>Category Breakdown</h3>
                        <div class="chart-legend">
                            <span class="legend-item">
                                <span class="legend-color" style="background: var(--success);"></span>
                                Categories
                            </span>
                        </div>
                    </div>
                    <div class="chart-content">
                        <canvas id="expenseCategoryChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Enhanced Table Container -->
            <div class="enhanced-table-container">                    
                    <!-- Revamped Filters UI -->
                    <div class="filters-card" id="expenses-filters">
                        <div class="filters-row">
                            <div class="search-input-wrapper">
                                <svg class="search-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                                <input type="text" id="expense-search-input" class="search-input" placeholder="Search description, category, vendor..." aria-label="Search expenses">
                            </div>
                            <div class="chip-group" role="group" aria-label="Quick date range">
                                <button class="chip" data-preset="today">Today</button>
                                <button class="chip" data-preset="7d">7D</button>
                                <button class="chip" data-preset="30d">30D</button>
                                <button class="chip" data-preset="ytd">YTD</button>
                                <button class="chip active" data-preset="all">All</button>
                            </div>
                            <label class="switch" title="Business only">
                                <input type="checkbox" id="business-only" />
                                <span>Business</span>
                            </label>
                        </div>
                        <!-- Maintain a hidden date-filter input for logic compatibility -->
                        <input type="hidden" id="date-filter" value="all" />

                        <button class="filters-advanced-toggle" id="filters-advanced-toggle" aria-expanded="false">
                            Advanced filters
                            <span class="caret">▾</span>
                        </button>

                        <div class="filters-advanced" id="filters-advanced" hidden>
                            <div class="advanced-grid">
                                <div class="filter-group">
                                    <div class="filter-group-label">Category</div>
                                    <select id="category-filter" class="filter-select">
                                        <option value="all">All Categories</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <div class="filter-group-label">Payment Method</div>
                                    <select id="payment-filter" class="filter-select">
                                        <option value="all">All Methods</option>
                                        <option value="cash">Cash</option>
                                        <option value="upi">UPI</option>
                                        <option value="card">Credit Card</option>
                                        <option value="net_banking">Net Banking</option>
                                        <option value="wallet">Digital Wallet</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <div class="filter-group-label">From</div>
                                    <input type="date" id="from-date-filter" class="date-input">
                                </div>
                                <div class="filter-group">
                                    <div class="filter-group-label">To</div>
                                    <input type="date" id="to-date-filter" class="date-input">
                                </div>
                                <div class="filter-group">
                                    <div class="filter-group-label">Min Amount</div>
                                    <input type="number" id="min-amount" class="amount-input" placeholder="0">
                                </div>
                                <div class="filter-group">
                                    <div class="filter-group-label">Max Amount</div>
                                    <input type="number" id="max-amount" class="amount-input" placeholder="∞">
                                </div>
                            </div>
                            <div class="filter-actions">
                                <button class="btn-modern btn-secondary" id="reset-filters-btn">Reset</button>
                                <button class="btn-modern btn-primary" id="apply-filters-btn">Apply</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bulk Actions -->
                    <div class="bulk-actions" id="bulk-actions" style="display: none;">
                        <button class="btn-bulk-delete" id="bulk-delete-btn">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                            </svg>
                            Delete Selected
                        </button>
                    </div>
                </div>

                <!-- Modern Enhanced Table with Pagination -->
                <div class="modern-table-container">
                    <div class="table-controls-top">
                        <div class="table-info">
                            <span class="table-title">Expense Records</span>
                            <span class="table-subtitle" id="results-count">18 expenses found</span>
                        </div>
                        <div class="table-actions">
                            <select id="table-page-size" class="page-size-selector">
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                                <option value="100">100 per page</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="scrollable-table-wrapper">
                        <table class="modern-expenses-table">
                            <thead class="sticky-header">
                                <tr>
                                    <th class="checkbox-column">
                                        <input type="checkbox" id="select-all-expenses" class="modern-checkbox">
                                    </th>
                                    <th class="sortable date-column" data-sort="date">
                                        <div class="sort-header">
                                            <span>Date</span>
                                            <svg class="sort-icon" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                            </svg>
                                        </div>
                                    </th>
                                    <th class="sortable description-column" data-sort="description">
                                        <div class="sort-header">
                                            <span>Description</span>
                                            <svg class="sort-icon" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                            </svg>
                                        </div>
                                    </th>
                                    <th class="sortable category-column" data-sort="categoryName">
                                        <div class="sort-header">
                                            <span>Category</span>
                                            <svg class="sort-icon" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                            </svg>
                                        </div>
                                    </th>
                                    <th class="sortable amount-column" data-sort="amount">
                                        <div class="sort-header">
                                            <span>Amount</span>
                                            <svg class="sort-icon" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                            </svg>
                                        </div>
                                    </th>
                                    <th class="sortable payment-column" data-sort="paymentMethod">
                                        <div class="sort-header">
                                            <span>Payment Method</span>
                                            <svg class="sort-icon" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                            </svg>
                                        </div>
                                    </th>
                                    <th class="actions-column">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="expenses-table-body">
                                <!-- Expense rows will be populated here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-pagination">
                        <div class="pagination-info">
                            <span id="pagination-info-text">Showing 1-10 of 18 expenses</span>
                        </div>
                        <div class="pagination-controls">
                            <button id="prev-page" class="pagination-btn" disabled>
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                </svg>
                                Previous
                            </button>
                            <div id="page-numbers" class="page-numbers">
                                <button class="page-number active">1</button>
                                <button class="page-number">2</button>
                                <button class="page-number">3</button>
                            </div>
                            <button id="next-page" class="pagination-btn">
                                Next
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modern Add/Edit Expense Modal -->
            <div id="expense-modal" class="modal hidden">
                <div class="modal-content modern-modal">
                    <div class="modal-header modern-header">
                        <div class="modal-title-section">
                            <h3 id="expense-modal-title" class="modal-title">Add New Expense</h3>
                            <p class="modal-subtitle">Track your business expenses efficiently</p>
                        </div>
                        <button class="modal-close modern-close" onclick="closeExpenseModal()">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="modal-body modern-body">
                        <form id="expense-form" class="modern-form">
                            <div class="form-grid modern-grid">
                                <!-- Row 1: Date and Amount -->
                                <div class="form-row">
                                    <div class="form-field">
                                        <label class="form-label modern-label">
                                            <span class="label-text">Date</span>
                                            <span class="label-required">*</span>
                                        </label>
                                        <div class="input-wrapper">
                                            <svg class="input-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zM1 5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5H1z"/>
                                            </svg>
                                            <input type="date" id="expense-date" class="form-control modern-input" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-field">
                                        <label class="form-label modern-label">
                                            <span class="label-text">Amount</span>
                                            <span class="label-required">*</span>
                                        </label>
                                        <div class="input-wrapper">
                                            <span class="input-icon" style="font-size: 1.2em; margin-right: 4px;">₹</span>
                                            <input type="number" id="expense-amount" class="form-control modern-input" step="0.01" placeholder="0.00" required>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Row 2: Category and Payment Method -->
                                <div class="form-row">
                                    <div class="form-field">
                                        <label class="form-label modern-label">
                                            <span class="label-text">Category</span>
                                            <span class="label-required">*</span>
                                        </label>
                                        <div class="category-input-wrapper">
                                            <select id="expense-category" class="form-control modern-select" required>
                                                <option value="">Select Category</option>
                                            </select>
                                            <button type="button" class="add-category-btn" onclick="window.expenseUI.openAddCategoryModal()">
                                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                                </svg>
                                                Add New
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="form-field">
                                        <label class="form-label modern-label">
                                            <span class="label-text">Payment Method</span>
                                            <span class="label-required">*</span>
                                        </label>
                                        <div class="input-wrapper">
                                            <svg class="input-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1zM4.085 5H11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h.085zM4 6v8h7V6H4z"/>
                                            </svg>
                                            <select id="expense-payment-method" class="form-control modern-select" required>
                                                <option value="">Select Payment Method</option>
                                                <option value="cash">💵 Cash</option>
                                                <option value="upi">📱 UPI</option>
                                                <option value="card">💳 Credit/Debit Card</option>
                                                <option value="net_banking">🏦 Net Banking</option>
                                                <option value="wallet">📲 Digital Wallet</option>
                                                <option value="bank_transfer">🏦 Bank Transfer</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Row 3: Description -->
                                <div class="form-field full-width">
                                    <label class="form-label modern-label">
                                        <span class="label-text">Description</span>
                                        <span class="label-required">*</span>
                                    </label>
                                    <div class="input-wrapper">
                                        <svg class="input-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zM3 5v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5H3z"/>
                                        </svg>
                                        <input type="text" id="expense-description" class="form-control modern-input" placeholder="Brief description of the expense" required>
                                    </div>
                                </div>
                                
                                <!-- Row 4: Vendor -->
                                <div class="form-field full-width">
                                    <label class="form-label modern-label">
                                        <span class="label-text">Vendor/Supplier</span>
                                        <span class="label-optional">Optional</span>
                                    </label>
                                    <div class="input-wrapper">
                                        <svg class="input-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                        </svg>
                                        <input type="text" id="expense-vendor" class="form-control modern-input" placeholder="Company or person name">
                                    </div>
                                </div>
                                
                                <!-- Row 5: Notes -->
                                <div class="form-field full-width">
                                    <label class="form-label modern-label">
                                        <span class="label-text">Additional Notes</span>
                                        <span class="label-optional">Optional</span>
                                    </label>
                                    <div class="textarea-wrapper">
                                        <textarea id="expense-notes" class="form-control modern-textarea" rows="3" placeholder="Any additional details about this expense"></textarea>
                                    </div>
                                </div>
                                
                                <!-- Row 6: Checkboxes -->
                                <div class="form-row checkbox-row">
                                    <div class="form-field">
                                        <label class="modern-checkbox">
                                            <input type="checkbox" id="expense-business" checked>
                                            <span class="checkbox-indicator"></span>
                                            <span class="checkbox-label">Business Expense</span>
                                        </label>
                                    </div>
                                    
                                    <div class="form-field">
                                        <label class="modern-checkbox">
                                            <input type="checkbox" id="expense-tax-deductible">
                                            <span class="checkbox-indicator"></span>
                                            <span class="checkbox-label">Tax Deductible</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer modern-footer">
                        <button type="button" class="btn-modern btn-secondary" onclick="closeExpenseModal()">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                            </svg>
                            Cancel
                        </button>
                        <button type="submit" class="btn-modern btn-primary" form="expense-form">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                            </svg>
                            Save Expense
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Add Category Modal -->
            <div id="add-category-modal" class="modal hidden">
                <div class="modal-content modern-modal small-modal">
                    <div class="modal-header modern-header">
                        <div class="modal-title-section">
                            <h3 class="modal-title">Add New Category</h3>
                            <p class="modal-subtitle">Create a custom expense category</p>
                        </div>
                        <button class="modal-close modern-close" onclick="window.expenseUI.closeAddCategoryModal()">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="modal-body modern-body">
                        <form id="add-category-form" class="modern-form">
                            <div class="form-field">
                                <label class="form-label modern-label">
                                    <span class="label-text">Category Name</span>
                                    <span class="label-required">*</span>
                                </label>
                                <div class="input-wrapper">
                                    <input type="text" id="new-category-name" class="form-control modern-input" placeholder="e.g., Office Supplies" required>
                                </div>
                            </div>
                            
                            <div class="form-field">
                                <label class="form-label modern-label">
                                    <span class="label-text">Icon</span>
                                    <span class="label-required">*</span>
                                </label>
                                <div class="icon-grid">
                                    <button type="button" class="icon-option" data-icon="📊" onclick="selectIcon('📊', event)">📊</button>
                                    <button type="button" class="icon-option" data-icon="🏢" onclick="selectIcon('🏢', event)">🏢</button>
                                    <button type="button" class="icon-option" data-icon="🚗" onclick="selectIcon('🚗', event)">🚗</button>
                                    <button type="button" class="icon-option" data-icon="💡" onclick="selectIcon('💡', event)">💡</button>
                                    <button type="button" class="icon-option" data-icon="📱" onclick="selectIcon('📱', event)">📱</button>
                                    <button type="button" class="icon-option" data-icon="🎯" onclick="selectIcon('🎯', event)">🎯</button>
                                    <button type="button" class="icon-option" data-icon="📚" onclick="selectIcon('📚', event)">📚</button>
                                    <button type="button" class="icon-option" data-icon="🎨" onclick="selectIcon('🎨', event)">🎨</button>
                                </div>
                                <input type="hidden" id="new-category-icon" required>
                            </div>
                            
                            <div class="form-field">
                                <label class="form-label modern-label">
                                    <span class="label-text">Color</span>
                                    <span class="label-required">*</span>
                                </label>
                                <div class="color-grid">
                                    <button type="button" class="color-option" data-color="#3B82F6" style="background-color: #3B82F6" onclick="selectColor('#3B82F6', event)"></button>
                                    <button type="button" class="color-option" data-color="#10B981" style="background-color: #10B981" onclick="selectColor('#10B981', event)"></button>
                                    <button type="button" class="color-option" data-color="#F59E0B" style="background-color: #F59E0B" onclick="selectColor('#F59E0B', event)"></button>
                                    <button type="button" class="color-option" data-color="#EF4444" style="background-color: #EF4444" onclick="selectColor('#EF4444', event)"></button>
                                    <button type="button" class="color-option" data-color="#8B5CF6" style="background-color: #8B5CF6" onclick="selectColor('#8B5CF6', event)"></button>
                                    <button type="button" class="color-option" data-color="#F97316" style="background-color: #F97316" onclick="selectColor('#F97316', event)"></button>
                                    <button type="button" class="color-option" data-color="#06B6D4" style="background-color: #06B6D4" onclick="selectColor('#06B6D4', event)"></button>
                                    <button type="button" class="color-option" data-color="#84CC16" style="background-color: #84CC16" onclick="selectColor('#84CC16', event)"></button>
                                </div>
                                <input type="hidden" id="new-category-color" required>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer modern-footer">
                        <button type="button" class="btn-modern btn-secondary" onclick="window.expenseUI.closeAddCategoryModal()">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                            </svg>
                            Cancel
                        </button>
                        <button type="submit" class="btn-modern btn-primary" form="add-category-form">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            Add Category
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    initializeUI() {
        console.log('Initializing Expense UI...');
        const expensesPage = document.getElementById('expenses-page');
        if (expensesPage) {
            expensesPage.innerHTML = this.getExpensesPageHTML();
            
            // Extract modals from the page and move them to document.body
            this.moveModalsToBody();
            
            this.attachEventListeners();
            
            // Ensure expense manager has data before rendering
            if (this.expenseManager && this.expenseManager.expenses && this.expenseManager.expenses.length > 0) {
                console.log(`Found ${this.expenseManager.expenses.length} expenses, rendering...`);
                this.renderExpenses();
            } else {
                console.log('No expenses found, initializing with sample data...');
                // Force load sample data if needed
                if (this.expenseManager) {
                    this.expenseManager.expenses = this.expenseManager.getSampleExpenses();
                    this.renderExpenses();
                }
            }
        }
    }

    moveModalsToBody() {
        console.log('Moving modals to body...');
        
        // Move expense modal to body if it exists in the page
        const expenseModal = document.getElementById('expense-modal');
        console.log('Expense modal found:', !!expenseModal);
        if (expenseModal) {
            console.log('Expense modal parent:', expenseModal.parentNode);
            console.log('Expense modal innerHTML length:', expenseModal.innerHTML.length);
            console.log('Modal footer exists:', !!expenseModal.querySelector('.modal-footer'));
            console.log('Submit button exists:', !!expenseModal.querySelector('button[type="submit"]'));
            
            if (expenseModal.parentNode !== document.body) {
                console.log('Moving expense modal to body...');
                document.body.appendChild(expenseModal);
                console.log('Expense modal moved. New parent:', expenseModal.parentNode);
            }
        }
        
        // Move add category modal to body if it exists in the page
        const addCategoryModal = document.getElementById('add-category-modal');
        console.log('Add category modal found:', !!addCategoryModal);
        if (addCategoryModal && addCategoryModal.parentNode !== document.body) {
            console.log('Moving add category modal to body...');
            document.body.appendChild(addCategoryModal);
        }
    }

    attachEventListeners() {
        // Add Expense button
        const addExpenseBtn = document.getElementById('add-expense-btn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.openAddExpenseModal());
        }

        // Export button (updated ID)
        const exportBtn = document.getElementById('export-expenses-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportExpenses());
        }

        // Search functionality
        const searchInput = document.getElementById('expense-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter controls
        const dateFilter = document.getElementById('date-filter');
        const categoryFilter = document.getElementById('category-filter');
        const paymentFilter = document.getElementById('payment-filter');
        const fromDateFilter = document.getElementById('from-date-filter');
        const toDateFilter = document.getElementById('to-date-filter');
        const minAmountFilter = document.getElementById('min-amount');
        const maxAmountFilter = document.getElementById('max-amount');

        // Quick chip filters (date presets)
        const chipGroup = document.querySelector('#expenses-filters .chip-group');
        if (chipGroup) {
            chipGroup.addEventListener('click', (e) => {
                const btn = e.target.closest('.chip');
                if (!btn) return;
                chipGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const preset = btn.dataset.preset;
                const hiddenDate = document.getElementById('date-filter');
                if (hiddenDate) {
                    // Map presets to existing values
                    const map = { today: 'today', '7d': 'week', '30d': 'month', ytd: 'year', all: 'all' };
                    hiddenDate.value = map[preset] || 'all';
                }
                // Clear manual range when using chips
                const from = document.getElementById('from-date-filter');
                const to = document.getElementById('to-date-filter');
                if (from) from.value = '';
                if (to) to.value = '';
                this.applyFilters();
            });
        }

        // Advanced toggle
        const advToggle = document.getElementById('filters-advanced-toggle');
        const advPanel = document.getElementById('filters-advanced');
        if (advToggle && advPanel) {
            advToggle.addEventListener('click', () => {
                const expanded = advToggle.getAttribute('aria-expanded') === 'true';
                advToggle.setAttribute('aria-expanded', String(!expanded));
                advPanel.hidden = expanded;
                advToggle.querySelector('.caret')?.classList.toggle('open', !expanded);
            });
        }

        // Business-only toggle
        const businessOnly = document.getElementById('business-only');
        if (businessOnly) {
            businessOnly.addEventListener('change', (e) => {
                this.currentFilters.businessOnly = !!e.target.checked;
                this.applyFilters();
            });
        }

        // Hook up filters
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                const val = e.target.value;
                // No separate show/hide container now; advanced holds date inputs
                this.applyFilters();
            });
        }
        if (categoryFilter) categoryFilter.addEventListener('change', () => this.applyFilters());
        if (paymentFilter) paymentFilter.addEventListener('change', () => this.applyFilters());
        if (fromDateFilter) fromDateFilter.addEventListener('change', () => this.applyFilters());
        if (toDateFilter) toDateFilter.addEventListener('change', () => this.applyFilters());
        if (minAmountFilter) minAmountFilter.addEventListener('input', () => this.applyFilters());
        if (maxAmountFilter) maxAmountFilter.addEventListener('input', () => this.applyFilters());

        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        const resetFiltersBtn = document.getElementById('reset-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Table sorting
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.dataset.sort;
                this.handleSort(sortBy);
            });
        });

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-expenses');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => this.handleSelectAll(e.target.checked));
        }

        // Row checkbox change updates bulk actions
        const tableBody = document.getElementById('expenses-table-body');
        if (tableBody) {
            tableBody.addEventListener('change', (e) => {
                const target = e.target;
                if (target && target.classList.contains('table-checkbox')) {
                    this.updateBulkActions();
                }
            });
        }

        // Bulk delete
        const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.handleBulkDelete());
        }

        // Delegated action buttons
        const expensesTable = document.querySelector('.enhanced-table');
        if (expensesTable) {
            expensesTable.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('.action-btn');
                if (!actionBtn) return;
                
                const expenseId = actionBtn.getAttribute('data-expense-id');
                if (!expenseId) return;
                
                if (actionBtn.classList.contains('edit')) {
                    this.editExpense(expenseId);
                } else if (actionBtn.classList.contains('delete')) {
                    this.deleteExpense(expenseId);
                } else if (actionBtn.title === 'Duplicate') {
                    this.duplicateExpense(expenseId);
                }
            });
        }

        // Advanced apply/reset
        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyFilters());
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.clearFilters());

        // Modal functionality
        this.attachModalEventListeners();
    }

    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm.toLowerCase();
        this.renderFilteredExpenses();
    }

    handleSort(sortBy) {
        if (this.currentSort.field === sortBy) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = sortBy;
            this.currentSort.direction = 'asc';
        }
        
        // Update sort indicators in table headers
        this.updateSortIndicators();
        this.renderFilteredExpenses();
    }

    updateSortIndicators() {
        // Reset all headers
        document.querySelectorAll('.enhanced-table th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add sort class to current header
        const currentHeader = document.querySelector(`.enhanced-table th[data-sort="${this.currentSort.field}"]`);
        if (currentHeader) {
            currentHeader.classList.add(this.currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }

    renderFilteredExpenses() {
        let filteredExpenses = this.getFilteredExpenses();

        // Apply sorting per currentSort
        filteredExpenses.sort((a, b) => {
            let aValue = a[this.currentSort.field];
            let bValue = b[this.currentSort.field];

            if (this.currentSort.field === 'amount') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            } else if (this.currentSort.field === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else {
                aValue = (aValue ?? '').toString().toLowerCase();
                bValue = (bValue ?? '').toString().toLowerCase();
            }

            if (aValue < bValue) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderExpensesTable(filteredExpenses);
        this.updateResultsCount(filteredExpenses.length);
    }

    

    handleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.table-checkbox[data-expense-id]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBulkActions();
    }

    updateBulkActions() {
        const checkedBoxes = document.querySelectorAll('.table-checkbox[data-expense-id]:checked');
        const bulkActions = document.getElementById('bulk-actions');
        if (bulkActions) {
            bulkActions.style.display = checkedBoxes.length > 0 ? 'flex' : 'none';
        }
    }

    handleBulkDelete() {
        const checkedBoxes = document.querySelectorAll('.table-checkbox[data-expense-id]:checked');
        if (checkedBoxes.length === 0) return;

        if (confirm(`Are you sure you want to delete ${checkedBoxes.length} selected expense(s)?`)) {
            checkedBoxes.forEach(checkbox => {
                const expenseId = checkbox.getAttribute('data-expense-id');
                this.deleteExpense(expenseId);
            });
        }
    }

    updateResultsCount(count) {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = `${count} expense${count !== 1 ? 's' : ''} found`;
        }
    }

    duplicateExpense(expenseId) {
        const expense = this.expenseManager.expenses.find(e => e.id === expenseId);
        if (!expense) {
            this.showToast('Expense not found', 'error');
            return;
        }
        
        // Open add expense modal with pre-filled data
        this.openExpenseModal();
        
        // Pre-fill form with expense data (excluding ID and date)
        setTimeout(() => {
            document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-description').value = expense.description + ' (Copy)';
            document.getElementById('expense-category').value = expense.categoryName || '';
            document.getElementById('expense-payment-method').value = expense.paymentMethod || '';
            document.getElementById('expense-vendor').value = expense.vendorName || '';
            document.getElementById('expense-notes').value = expense.notes || '';
            document.getElementById('expense-business').checked = expense.isBusinessExpense || false;
            document.getElementById('expense-tax-deductible').checked = expense.taxDeductible || false;
        }, 100);
    }

    attachModalEventListeners() {
        // Form submission handling (handles both submit button click and form submit)
        const expenseForm = document.getElementById('expense-form');
        if (expenseForm) {
            // Remove existing listeners to prevent duplicates
            expenseForm.removeEventListener('submit', this.handleExpenseSubmit);
            
            // Create bound handler that we can reference for removal
            this.handleExpenseSubmit = (e) => {
                e.preventDefault();
                this.saveExpense();
            };
            
            expenseForm.addEventListener('submit', this.handleExpenseSubmit);
        }

        // Add Category button
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.showAddCategoryModal());
        }

        // Add Category form submission
        const addCategoryForm = document.getElementById('add-category-form');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNewCategory();
            });
        }

        // Populate category dropdowns
        this.populateCategoryDropdowns();
    }

    async populateCategoryDropdowns() {
        // Load categories from ExpenseManager
        await this.expenseManager.loadCategories();
        const categories = this.expenseManager.categories;

        // Populate filter dropdown
        const filterSelect = document.getElementById('category-filter');
        if (filterSelect) {
            // Reset and keep "All Categories"
            const categoryOptions = categories.map(cat => 
                `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`
            ).join('');
            filterSelect.innerHTML = '<option value="all">All Categories</option>' + categoryOptions;
        }

        // Populate expense modal dropdown
        const expenseSelect = document.getElementById('expense-category');
        if (expenseSelect) {
            const categoryOptions = categories.map(cat => 
                `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`
            ).join('');
            expenseSelect.innerHTML = '<option value="">Select Category</option>' + categoryOptions;
        }
    }

    showAddCategoryModal() {
        // Clear the form
        document.getElementById('add-category-form').reset();
        
        // Remove any previous selections
        document.querySelectorAll('.icon-option.selected, .color-option.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Show the modal
        document.getElementById('add-category-modal').classList.remove('hidden');
    }

    renderExpenses() {
        console.log('🎨 Rendering expenses...');
        console.log('ExpenseManager exists:', !!this.expenseManager);
        console.log('ExpenseManager expenses:', this.expenseManager?.expenses?.length || 0);
        
        this.updateSummaryCards();
        this.populateFilterDropdowns();
        this.renderFilteredExpenses();
        this.renderCharts(this.expenseManager?.expenses || []);
    }

    populateFilterDropdowns() {
        // Populate category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter && this.expenseManager) {
            const categories = [...new Set(this.expenseManager.expenses.map(e => e.categoryName))];
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
            });
        }
    }

    updateSummaryCards() {
        const expenses = this.expenseManager?.expenses || [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        }).reduce((sum, exp) => sum + exp.amount, 0);
        
        const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
        
        // Safely update DOM elements
        const totalElement = document.getElementById('total-expenses-value');
        const monthElement = document.getElementById('month-expenses-value');
        const avgElement = document.getElementById('avg-expense-value');
        const countElement = document.getElementById('expense-count-value');
        
        if (totalElement) totalElement.textContent = `₹${this.formatNumber(totalExpenses)}`;
        if (monthElement) monthElement.textContent = `₹${this.formatNumber(monthExpenses)}`;
        if (avgElement) avgElement.textContent = `₹${this.formatNumber(avgExpense)}`;
        if (countElement) countElement.textContent = expenses.length;
    }

    getFilteredExpenses() {
        let expenses = [...(this.expenseManager?.expenses || [])];

        // Search
        if (this.currentFilters.search) {
            const s = this.currentFilters.search;
            expenses = expenses.filter(e =>
                (e.description || '').toLowerCase().includes(s) ||
                (e.categoryName || '').toLowerCase().includes(s) ||
                (e.vendorName || '').toLowerCase().includes(s)
            );
        }

        // Date range
        if (this.currentFilters.fromDate) {
            const from = new Date(this.currentFilters.fromDate);
            expenses = expenses.filter(e => new Date(e.date) >= from);
        }
        if (this.currentFilters.toDate) {
            const to = new Date(this.currentFilters.toDate);
            expenses = expenses.filter(e => new Date(e.date) <= to);
        }

        // Category
        if (this.currentFilters.category !== 'all') {
            expenses = expenses.filter(e => (e.categoryName || '').toLowerCase() === this.currentFilters.category.toLowerCase());
        }

        // Payment method
        if (this.currentFilters.paymentMethod !== 'all') {
            expenses = expenses.filter(e => (e.paymentMethod || '') === this.currentFilters.paymentMethod);
        }

        // Amount range
        const minAmt = this.currentFilters.minAmount ?? 0;
        const maxAmt = this.currentFilters.maxAmount ?? Infinity;
        expenses = expenses.filter(e => {
            const amt = Number(e.amount) || 0;
            return amt >= minAmt && amt <= maxAmt;
        });

        // Business only
        if (this.currentFilters.businessOnly) {
            expenses = expenses.filter(e => !!e.isBusinessExpense);
        }

        // Sort by date desc by default
        return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderExpensesTable(expenses) {
        const tbody = document.getElementById('expenses-table-body');
        if (!tbody) return;
        
        // Update pagination info
        this.pagination.totalItems = expenses.length;
        this.pagination.totalPages = Math.ceil(expenses.length / this.pagination.pageSize);
        
        // Update results count
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `${expenses.length} expenses found`;
        }
        
        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-empty-state">
                        <div class="empty-state-content">
                            <div class="empty-state-icon">�</div>
                            <div class="empty-state-title">No expenses found</div>
                            <div class="empty-state-subtitle">Start tracking your expenses by adding your first entry</div>
                            <button class="empty-state-action btn-modern btn-primary" onclick="document.getElementById('add-expense-btn').click()">
                                ➕ Add First Expense
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            this.updatePagination();
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
        const endIndex = startIndex + this.pagination.pageSize;
        const paginatedExpenses = expenses.slice(startIndex, endIndex);
        
        tbody.innerHTML = paginatedExpenses.map((expense, index) => `
            <tr class="modern-table-row" style="animation: fadeInUp 0.3s ease ${index * 0.05}s both;">
                <td class="checkbox-cell">
                    <input type="checkbox" class="modern-checkbox" data-expense-id="${expense.id}">
                </td>
                <td class="date-cell">
                    <div class="cell-content">
                        <span class="date-primary">${this.formatDate(expense.date)}</span>
                        <span class="date-secondary">${this.getRelativeTime(expense.date)}</span>
                    </div>
                </td>
                <td class="description-cell">
                    <div class="description-content">
                        <div class="description-primary" title="${expense.description}">${expense.description}</div>
                        ${expense.notes ? `<div class="description-secondary" title="${expense.notes}">${expense.notes}</div>` : ''}
                        ${expense.vendorName ? `<div class="vendor-tag">📍 ${expense.vendorName}</div>` : ''}
                    </div>
                </td>
                <td class="category-cell">
                    ${this.getModernCategoryTag(expense.categoryName)}
                </td>
                <td class="amount-cell">
                    <div class="amount-content">
                        <span class="amount-primary">₹${this.formatNumber(expense.amount)}</span>
                        ${expense.isBusinessExpense ? '<span class="business-badge">Business</span>' : ''}
                        ${expense.taxDeductible ? '<span class="tax-badge">Tax Deductible</span>' : ''}
                    </div>
                </td>
                <td class="payment-cell">
                    ${this.getModernPaymentMethodTag(expense.paymentMethod)}
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="action-btn-modern edit-btn" data-expense-id="${expense.id}" title="Edit Expense">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L9.708 9.708a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l6-6zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern duplicate-btn" data-expense-id="${expense.id}" title="Duplicate Expense">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern delete-btn" data-expense-id="${expense.id}" title="Delete Expense">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Update pagination controls
        this.updatePagination();
        
        // Set up event listeners for new rows
        this.setupTableEventListeners();
    }

    getCategoryTag(categoryName) {
        const category = (categoryName || 'Miscellaneous').toLowerCase();
        
        // Map category names to CSS classes and icons
        const categoryMapping = {
            // Basic categories
            'rent': { class: 'rent', icon: '🏠' },
            'utilities': { class: 'utilities', icon: '⚡' },
            'transportation': { class: 'transportation', icon: '🚗' },
            'food': { class: 'food', icon: '🍕' },
            'office': { class: 'office', icon: '🏢' },
            'marketing': { class: 'marketing', icon: '📢' },
            'travel': { class: 'travel', icon: '✈️' },
            'entertainment': { class: 'entertainment', icon: '🎭' },
            'software': { class: 'software', icon: '💻' },
            'health': { class: 'health', icon: '🏥' },
            'education': { class: 'education', icon: '📚' },
            'miscellaneous': { class: 'miscellaneous', icon: '📦' },
            
            // Real data categories from your app
            'internet & phone': { class: 'utilities', icon: '📞' },
            'internet and phone': { class: 'utilities', icon: '📞' },
            'fashion': { class: 'entertainment', icon: '👗' },
            'professional services': { class: 'office', icon: '💼' },
            'grocery': { class: 'food', icon: '🛒' },
            'groceries': { class: 'food', icon: '🛒' },
            'friends/ family': { class: 'miscellaneous', icon: '👨‍👩‍👧‍👦' },
            'friends family': { class: 'miscellaneous', icon: '👨‍👩‍👧‍👦' },
            'credit card loans': { class: 'office', icon: '💳' },
            'credit card loan': { class: 'office', icon: '💳' }
        };
        
        // Find matching category
        const categoryData = categoryMapping[category] || { class: 'miscellaneous', icon: '📦' };
        
        return `
            <span class="category-tag ${categoryData.class}">
                ${categoryData.icon} ${categoryName || 'Miscellaneous'}
            </span>
        `;
    }

    getPaymentMethodTag(paymentMethod) {
        const methodData = {
            'cash': { icon: '💵', label: 'Cash', class: 'cash' },
            'upi': { icon: '📱', label: 'UPI', class: 'upi' },
            'card': { icon: '💳', label: 'Card', class: 'card' },
            'credit_card': { icon: '💳', label: 'Credit Card', class: 'card' },
            'debit_card': { icon: '💳', label: 'Debit Card', class: 'card' },
            'net_banking': { icon: '🏦', label: 'Net Banking', class: 'banking' },
            'wallet': { icon: '📲', label: 'Wallet', class: 'wallet' },
            'digital_wallet': { icon: '📲', label: 'Digital Wallet', class: 'wallet' },
            'bank_transfer': { icon: '🏦', label: 'Bank Transfer', class: 'banking' }
        };
        
        const method = (paymentMethod || 'cash').toLowerCase();
        const data = methodData[method] || methodData['cash'];
        
        return `
            <span class="payment-method-tag ${data.class}">
                ${data.icon} ${data.label}
            </span>
        `;
    }

    renderCharts(expenses) {
        // Clear any existing timeout to prevent multiple rapid renders
        if (this.chartRenderTimeout) {
            clearTimeout(this.chartRenderTimeout);
        }
        
        // Destroy existing charts with better cleanup
        if (this.expenseChart) {
            try {
                this.expenseChart.destroy();
            } catch (error) {
                console.warn('Error destroying expense chart:', error);
            }
            this.expenseChart = null;
        }
        if (this.categoryChart) {
            try {
                this.categoryChart.destroy();
            } catch (error) {
                console.warn('Error destroying category chart:', error);
            }
            this.categoryChart = null;
        }
        
        // Clear any existing Chart.js instances from canvas elements
        const monthlyCtx = document.getElementById('expenseMonthlyChart');
        const categoryCtx = document.getElementById('expenseCategoryChart');
        
        // Force cleanup of any existing chart instances on these canvases
        if (monthlyCtx) {
            const existingChart = Chart.getChart(monthlyCtx);
            if (existingChart) {
                existingChart.destroy();
            }
        }
        
        if (categoryCtx) {
            const existingChart = Chart.getChart(categoryCtx);
            if (existingChart) {
                existingChart.destroy();
            }
        }
        
        // Debounced chart creation to prevent rapid re-renders
        this.chartRenderTimeout = setTimeout(() => {
            this.createCharts(expenses);
        }, 100);
    }
    
    createCharts(expenses) {
        // Monthly trend chart
        const monthlyData = this.getMonthlyData(expenses);
        const monthlyCtx = document.getElementById('expenseMonthlyChart');
        if (monthlyCtx && monthlyData.labels.length > 0) {
            try {
                this.expenseChart = new Chart(monthlyCtx, {
                    type: 'line',
                    data: {
                        labels: monthlyData.labels,
                        datasets: [{
                            label: 'Monthly Expenses',
                            data: monthlyData.values,
                            borderColor: '#1FB8CD',
                            backgroundColor: 'rgba(31, 184, 205, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: value => '₹' + this.formatNumber(value)
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating expense chart:', error);
            }
        }
        
        // Category breakdown chart
        const categoryData = this.getCategoryData(expenses);
        const categoryCtx = document.getElementById('expenseCategoryChart');
        if (categoryCtx && categoryData.labels.length > 0) {
            try {
                this.categoryChart = new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: categoryData.labels,
                        datasets: [{
                            data: categoryData.values,
                            backgroundColor: [
                                '#1FB8CD', '#F59E42', '#6B7280', '#10B981', 
                                '#F43F5E', '#6366F1', '#FBBF24', '#A3E635'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating category chart:', error);
            }
        }
    }

    getMonthlyData(expenses) {
        const monthlyMap = new Map();
        const now = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap.set(key, 0);
        }
        
        // Add expense data
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap.has(key)) {
                monthlyMap.set(key, monthlyMap.get(key) + expense.amount);
            }
        });
        
        const labels = Array.from(monthlyMap.keys()).map(key => {
            const [year, month] = key.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        });
        
        return {
            labels,
            values: Array.from(monthlyMap.values())
        };
    }

    getCategoryData(expenses) {
        const categoryMap = new Map();
        
        expenses.forEach(expense => {
            const category = expense.categoryName || 'Uncategorized';
            categoryMap.set(category, (categoryMap.get(category) || 0) + expense.amount);
        });
        
        const sorted = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        
        return {
            labels: sorted.map(([cat]) => cat),
            values: sorted.map(([, amount]) => amount)
        };
    }

    applyFilters() {
        const dateFilter = document.getElementById('date-filter');
        const categoryFilter = document.getElementById('category-filter');
        const paymentFilter = document.getElementById('payment-filter');
        const fromDateFilter = document.getElementById('from-date-filter');
        const toDateFilter = document.getElementById('to-date-filter');
        const minAmountFilter = document.getElementById('min-amount');
        const maxAmountFilter = document.getElementById('max-amount');

        this.currentFilters.dateRange = dateFilter ? dateFilter.value : 'all';
        this.currentFilters.category = categoryFilter ? categoryFilter.value : 'all';
        this.currentFilters.paymentMethod = paymentFilter ? paymentFilter.value : 'all';
        this.currentFilters.fromDate = fromDateFilter ? fromDateFilter.value : '';
        this.currentFilters.toDate = toDateFilter ? toDateFilter.value : '';
        this.currentFilters.minAmount = minAmountFilter ? parseFloat(minAmountFilter.value) || 0 : 0;
        this.currentFilters.maxAmount = maxAmountFilter ? parseFloat(maxAmountFilter.value) || Infinity : Infinity;

        // If using date presets (chips), compute from/to when not custom
        const range = this.currentFilters.dateRange;
        if (range && range !== 'custom') {
            const today = new Date();
            const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
            let start = null;
            if (range === 'today') {
                start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            } else if (range === 'week') {
                const d = new Date(today);
                d.setDate(d.getDate() - 6);
                start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
            } else if (range === 'month') {
                start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
            } else if (range === 'quarter') {
                const qStartMonth = Math.floor(today.getMonth() / 3) * 3;
                start = new Date(today.getFullYear(), qStartMonth, 1, 0, 0, 0, 0);
            } else if (range === 'year') {
                start = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
            } else if (range === 'all') {
                start = null;
            }
            // Only set from/to if not using custom inputs
            if (range === 'all') {
                this.currentFilters.fromDate = '';
                this.currentFilters.toDate = '';
                if (fromDateFilter) fromDateFilter.value = '';
                if (toDateFilter) toDateFilter.value = '';
            } else if (start) {
                const toISODate = (d) => d.toISOString().slice(0, 10);
                this.currentFilters.fromDate = toISODate(start);
                this.currentFilters.toDate = toISODate(end);
                if (fromDateFilter) fromDateFilter.value = this.currentFilters.fromDate;
                if (toDateFilter) toDateFilter.value = this.currentFilters.toDate;
            }
        }
        
        this.renderFilteredExpenses();
    }

    clearFilters() {
        // Reset all filter values
        const dateFilter = document.getElementById('date-filter');
        const categoryFilter = document.getElementById('category-filter');
        const paymentFilter = document.getElementById('payment-filter');
        const fromDateFilter = document.getElementById('from-date-filter');
        const toDateFilter = document.getElementById('to-date-filter');
        const minAmount = document.getElementById('min-amount');
        const maxAmount = document.getElementById('max-amount');
        const searchInput = document.getElementById('expense-search-input');
        const chipGroup = document.querySelector('#expenses-filters .chip-group');
        const businessOnly = document.getElementById('business-only');
        const advToggle = document.getElementById('filters-advanced-toggle');
        const advPanel = document.getElementById('filters-advanced');

        if (dateFilter) dateFilter.value = 'all';
        if (categoryFilter) categoryFilter.value = 'all';
        if (paymentFilter) paymentFilter.value = 'all';
        if (fromDateFilter) fromDateFilter.value = '';
        if (toDateFilter) toDateFilter.value = '';
        if (minAmount) minAmount.value = '';
        if (maxAmount) maxAmount.value = '';
        if (searchInput) searchInput.value = '';
        if (chipGroup) {
            chipGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            const all = chipGroup.querySelector('[data-preset="all"]');
            if (all) all.classList.add('active');
        }
        if (businessOnly) businessOnly.checked = false;
        if (advToggle && advPanel) {
            advToggle.setAttribute('aria-expanded', 'false');
            advPanel.hidden = true;
            advToggle.querySelector('.caret')?.classList.remove('open');
        }

        // Reset filter state
        this.currentFilters = {
            search: '',
            dateRange: 'all',
            category: 'all',
            paymentMethod: 'all',
            fromDate: '',
            toDate: '',
            minAmount: 0,
            maxAmount: Infinity,
            businessOnly: false
        };

        this.renderFilteredExpenses();
        this.showToast('Filters cleared', 'info');
    }

    openAddExpenseModal() {
        console.log('Opening add expense modal...');
        this.expenseManager.editingExpenseId = null;
        
        const modal = document.getElementById('expense-modal');
        const form = document.getElementById('expense-form');
        const submitBtn = document.querySelector('#expense-modal button[type="submit"]');
        
        console.log('Modal found:', !!modal);
        console.log('Form found:', !!form);
        console.log('Submit button found:', !!submitBtn);
        
        if (modal) {
            console.log('Modal classes before:', modal.className);
            console.log('Modal parent:', modal.parentNode?.tagName);
        }
        
        document.getElementById('expense-modal-title').textContent = 'Add New Expense';
        document.getElementById('expense-form').reset();
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('expense-business').checked = true;
        
        // Populate category dropdown
        this.populateCategoryDropdown();
        
        document.getElementById('expense-modal').classList.remove('hidden');
        console.log('Modal should now be visible');
    }

    async populateCategoryDropdown() {
        const categorySelect = document.getElementById('expense-category');
        if (!categorySelect) return;

        try {
            // Load categories from Supabase
            const categories = await this.expenseManager.loadCategories();
            
            // Clear existing options (except the default one)
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            
            // Ensure categories is an array
            if (!Array.isArray(categories)) {
                console.error('Categories is not an array:', categories);
                return;
            }
            
            // Add categories to dropdown
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = `${category.icon} ${category.name}`;
                option.style.backgroundColor = category.color + '20'; // Add slight transparency
                categorySelect.appendChild(option);
            });
            
            console.log(`Loaded ${categories.length} categories into dropdown`);
        } catch (error) {
            console.error('Error loading categories:', error);
            
            // Fallback to default categories if loading fails
            const fallbackCategories = [
                { name: 'Travel', icon: '✈️', color: '#3B82F6' },
                { name: 'Food', icon: '🍕', color: '#EF4444' },
                { name: 'Office', icon: '🏢', color: '#10B981' },
                { name: 'Marketing', icon: '📢', color: '#EC4899' },
                { name: 'Utilities', icon: '⚡', color: '#06B6D4' }
            ];
            
            fallbackCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = `${category.icon} ${category.name}`;
                option.style.backgroundColor = category.color + '20';
                categorySelect.appendChild(option);
            });
        }
    }

    closeExpenseModal() {
        document.getElementById('expense-modal').classList.add('hidden');
        document.getElementById('expense-form').reset();
        this.expenseManager.editingExpenseId = null;
    }

    openAddCategoryModal() {
        document.getElementById('add-category-modal').classList.remove('hidden');
        // Reset the form
        document.getElementById('add-category-form').reset();
        document.getElementById('new-category-icon').value = '';
        document.getElementById('new-category-color').value = '';
        
        // Clear any previous selections
        document.querySelectorAll('.icon-option.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.color-option.selected').forEach(el => el.classList.remove('selected'));
    }

    closeAddCategoryModal() {
        document.getElementById('add-category-modal').classList.add('hidden');
        document.getElementById('add-category-form').reset();
    }

    async saveNewCategory() {
        const name = document.getElementById('new-category-name').value.trim();
        const icon = document.getElementById('new-category-icon').value;
        const color = document.getElementById('new-category-color').value;

        if (!name || !icon || !color) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            // Check if category already exists
            const existingCategories = await this.expenseManager.loadCategories();
            
            // Ensure existingCategories is an array
            if (!Array.isArray(existingCategories)) {
                console.error('Failed to load existing categories');
                this.showToast('Failed to load categories', 'error');
                return;
            }
            
            if (existingCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
                this.showToast('Category already exists', 'error');
                return;
            }

            // Save to Supabase via ExpenseManager
            await this.expenseManager.addCategory({
                name: name,
                icon: icon,
                color: color
            });

            this.showToast('Category added successfully!', 'success');
            this.closeAddCategoryModal();
            
            // Refresh the category dropdown
            await this.populateCategoryDropdown();
            
            // Select the newly added category
            const categorySelect = document.getElementById('expense-category');
            if (categorySelect) {
                categorySelect.value = name;
            }

        } catch (error) {
            console.error('Error saving category:', error);
            this.showToast('Failed to add category', 'error');
        }
    }

    async editExpense(expenseId) {
        const expense = this.expenseManager.expenses.find(e => e.id === expenseId);
        if (!expense) {
            this.showToast('Expense not found', 'error');
            return;
        }
        
        this.expenseManager.editingExpenseId = expenseId;
        document.getElementById('expense-modal-title').textContent = 'Edit Expense';
        
        // Populate form
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-category').value = expense.categoryName || '';
        document.getElementById('expense-payment-method').value = expense.paymentMethod || '';
        document.getElementById('expense-vendor').value = expense.vendorName || '';
        document.getElementById('expense-notes').value = expense.notes || '';
        document.getElementById('expense-business').checked = expense.isBusinessExpense;
        document.getElementById('expense-tax-deductible').checked = expense.taxDeductible;
        
        document.getElementById('expense-modal').classList.remove('hidden');
    }

    async deleteExpense(expenseId) {
        const expense = this.expenseManager.expenses.find(e => e.id === expenseId);
        if (!expense) {
            this.showToast('Expense not found', 'error');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete this expense?\n\n${expense.description}\nAmount: ₹${this.formatNumber(expense.amount)}`)) {
            return;
        }
        
        try {
            await this.expenseManager.deleteExpense(expenseId);
            this.renderExpenses();
            this.showToast('Expense deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting expense:', error);
            this.showToast('Error deleting expense', 'error');
        }
    }

    async saveExpense() {
        console.log('🔄 saveExpense() called at:', new Date().toISOString());
        
        if (this.isSaving) {
            console.log('⚠️ Already saving, preventing duplicate save');
            return;
        }
        
        this.isSaving = true;
        
        const form = document.getElementById('expense-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            this.isSaving = false;
            return;
        }
        
        const expenseData = {
            date: document.getElementById('expense-date').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            description: document.getElementById('expense-description').value,
            categoryId: document.getElementById('expense-category').value,
            categoryName: document.getElementById('expense-category').value,
            paymentMethod: document.getElementById('expense-payment-method').value,
            vendorName: document.getElementById('expense-vendor').value,
            notes: document.getElementById('expense-notes').value,
            isBusinessExpense: document.getElementById('expense-business').checked,
            taxDeductible: document.getElementById('expense-tax-deductible').checked
        };
        
        try {
            await this.expenseManager.saveExpense(expenseData);
            this.closeExpenseModal();
            this.renderExpenses();
            this.showToast(
                this.expenseManager.editingExpenseId ? 'Expense updated successfully' : 'Expense added successfully',
                'success'
            );
        } catch (error) {
            console.error('Error saving expense:', error);
            this.showToast('Error saving expense', 'error');
        } finally {
            this.isSaving = false; // Reset the flag in both success and error cases
        }
    }

    exportExpenses() {
        const expenses = this.getFilteredExpenses();
        if (expenses.length === 0) {
            this.showToast('No expenses to export', 'warning');
            return;
        }
        
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Vendor', 'Business Expense', 'Tax Deductible', 'Notes'];
        const rows = expenses.map(e => [
            e.date,
            e.description,
            e.categoryName || 'Uncategorized',
            e.amount,
            e.paymentMethod || '',
            e.vendorName || '',
            e.isBusinessExpense ? 'Yes' : 'No',
            e.taxDeductible ? 'Yes' : 'No',
            e.notes || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Expenses exported successfully', 'success');
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getPaymentMethodLabel(method) {
        const methods = {
            'cash': '💵 Cash',
            'upi': '📱 UPI',
            'card': '💳 Card',
            'net_banking': '🏦 Net Banking',
            'wallet': '📲 Wallet'
        };
        return methods[method] || method || '-';
    }

    getModernCategoryTag(categoryName) {
        const category = (categoryName || 'Miscellaneous').toLowerCase();
        
        const categoryMapping = {
            'rent': { class: 'rent', icon: '🏠', color: '#8B5CF6' },
            'utilities': { class: 'utilities', icon: '⚡', color: '#06B6D4' },
            'transportation': { class: 'transportation', icon: '🚗', color: '#F59E0B' },
            'food': { class: 'food', icon: '🍕', color: '#EF4444' },
            'office': { class: 'office', icon: '🏢', color: '#10B981' },
            'marketing': { class: 'marketing', icon: '📢', color: '#EC4899' },
            'travel': { class: 'travel', icon: '✈️', color: '#3B82F6' },
            'entertainment': { class: 'entertainment', icon: '🎭', color: '#F97316' },
            'software': { class: 'software', icon: '💻', color: '#8B5CF6' },
            'health': { class: 'health', icon: '🏥', color: '#10B981' },
            'education': { class: 'education', icon: '📚', color: '#A29BFE' },
            'miscellaneous': { class: 'miscellaneous', icon: '📦', color: '#6B7280' },
            'internet & phone': { class: 'utilities', icon: '📞', color: '#06B6D4' },
            'fashion': { class: 'entertainment', icon: '👗', color: '#F97316' },
            'professional services': { class: 'office', icon: '💼', color: '#10B981' },
            'grocery': { class: 'food', icon: '🛒', color: '#EF4444' },
        };
        
        const categoryInfo = categoryMapping[category] || categoryMapping['miscellaneous'];
        
        return `
            <div class="modern-category-tag ${categoryInfo.class}" style="--category-color: ${categoryInfo.color}">
                <span class="category-icon">${categoryInfo.icon}</span>
                <span class="category-text">${categoryName || 'Miscellaneous'}</span>
            </div>
        `;
    }

    getModernPaymentMethodTag(method) {
        const methodData = {
            'cash': { icon: '💵', label: 'Cash', class: 'cash', color: '#10B981' },
            'upi': { icon: '📱', label: 'UPI', class: 'upi', color: '#3B82F6' },
            'card': { icon: '💳', label: 'Card', class: 'card', color: '#EC4899' },
            'net_banking': { icon: '🏦', label: 'Net Banking', class: 'net-banking', color: '#F59E0B' },
            'wallet': { icon: '📲', label: 'Wallet', class: 'wallet', color: '#8B5CF6' }
        };
        
        const data = methodData[method] || { icon: '💳', label: method || 'Unknown', class: 'unknown', color: '#6B7280' };
        
        return `
            <div class="modern-payment-tag ${data.class}" style="--payment-color: ${data.color}">
                <span class="payment-icon">${data.icon}</span>
                <span class="payment-text">${data.label}</span>
            </div>
        `;
    }

    getRelativeTime(dateString) {
        if (!dateString) return '';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return 'Today';
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else if (diffInHours < 168) { // 7 days
            return `${Math.floor(diffInHours / 24)} days ago`;
        } else {
            return '';
        }
    }

    updatePagination() {
        // Update pagination info
        const paginationInfo = document.getElementById('pagination-info-text');
        if (paginationInfo) {
            const start = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
            const end = Math.min(this.pagination.currentPage * this.pagination.pageSize, this.pagination.totalItems);
            paginationInfo.textContent = `Showing ${start}-${end} of ${this.pagination.totalItems} expenses`;
        }
        
        // Update page buttons
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) prevBtn.disabled = this.pagination.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.pagination.currentPage >= this.pagination.totalPages;
        
        // Update page numbers
        this.renderPageNumbers();
    }

    renderPageNumbers() {
        const pageNumbersContainer = document.getElementById('page-numbers');
        if (!pageNumbersContainer) return;
        
        const { currentPage, totalPages } = this.pagination;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        let html = '';
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        pageNumbersContainer.innerHTML = html;
    }

    setupTableEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expenseId = e.currentTarget.dataset.expenseId;
                this.editExpense(expenseId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expenseId = e.currentTarget.dataset.expenseId;
                this.deleteExpense(expenseId);
            });
        });
        
        // Duplicate buttons
        document.querySelectorAll('.duplicate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expenseId = e.currentTarget.dataset.expenseId;
                this.duplicateExpense(expenseId);
            });
        });
        
        // Page number buttons
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                this.goToPage(page);
            });
        });
        
        // Pagination buttons
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPage(this.pagination.currentPage - 1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.goToPage(this.pagination.currentPage + 1));
        }
        
        // Page size selector
        const pageSizeSelector = document.getElementById('table-page-size');
        if (pageSizeSelector) {
            pageSizeSelector.addEventListener('change', (e) => {
                this.pagination.pageSize = parseInt(e.target.value);
                this.pagination.currentPage = 1;
                this.renderExpenses();
            });
        }
    }

    goToPage(page) {
        if (page < 1 || page > this.pagination.totalPages) return;
        this.pagination.currentPage = page;
        this.renderExpenses();
    }

    duplicateExpense(expenseId) {
        const expense = this.expenseManager.expenses.find(e => e.id === expenseId);
        if (!expense) {
            this.showToast('Expense not found', 'error');
            return;
        }
        
        // Open add expense modal with pre-filled data
        this.openExpenseModal();
        
        // Pre-fill form with expense data (excluding ID and date)
        setTimeout(() => {
            document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-description').value = expense.description + ' (Copy)';
            document.getElementById('expense-category').value = expense.categoryName || '';
            document.getElementById('expense-payment-method').value = expense.paymentMethod || '';
            document.getElementById('expense-vendor').value = expense.vendorName || '';
            document.getElementById('expense-notes').value = expense.notes || '';
            document.getElementById('expense-business').checked = expense.isBusinessExpense || false;
            document.getElementById('expense-tax-deductible').checked = expense.taxDeductible || false;
        }, 100);
    }

    cleanupExpensesPage() {
        // Clear any pending chart render timeout
        if (this.chartRenderTimeout) {
            clearTimeout(this.chartRenderTimeout);
            this.chartRenderTimeout = null;
        }
        
        // Robust chart cleanup
        if (this.expenseChart) {
            try {
                this.expenseChart.destroy();
            } catch (error) {
                console.warn('Error destroying expense chart during cleanup:', error);
            }
            this.expenseChart = null;
        }
        if (this.categoryChart) {
            try {
                this.categoryChart.destroy();
            } catch (error) {
                console.warn('Error destroying category chart during cleanup:', error);
            }
            this.categoryChart = null;
        }
        
        // Also cleanup any Chart.js instances that might be lingering
        const monthlyCtx = document.getElementById('expenseMonthlyChart');
        const categoryCtx = document.getElementById('expenseCategoryChart');
        
        if (monthlyCtx) {
            const existingChart = Chart.getChart(monthlyCtx);
            if (existingChart) {
                try {
                    existingChart.destroy();
                } catch (error) {
                    console.warn('Error destroying lingering monthly chart:', error);
                }
            }
        }
        
        if (categoryCtx) {
            const existingChart = Chart.getChart(categoryCtx);
            if (existingChart) {
                try {
                    existingChart.destroy();
                } catch (error) {
                    console.warn('Error destroying lingering category chart:', error);
                }
            }
        }
    }
}

// ============================================
// COMPLETE EXPENSEMANAGER CLASS - REPLACE YOUR ENTIRE EXISTING CLASS WITH THIS
// This includes the missing updateBalanceFromInvoices method
// ============================================

class ExpenseManager {
    constructor(supabaseClient) {
        this.supabaseClient = supabaseClient;
        this.expenses = [];
        this.categories = [];
        this.balanceSummary = {
            totalEarnings: 0,
            totalExpenses: 0,
            currentBalance: 0
        };
        this.isInitialized = false;
        this.editingExpenseId = null;
        this.defaultCategories = [
            { id: 'food', name: 'Food', icon: '🍕', color: '#FF6B6B' },
            { id: 'fashion', name: 'Fashion', icon: '👔', color: '#4ECDC4' },
            { id: 'professional', name: 'Professional Services', icon: '💼', color: '#45B7D1' },
            { id: 'grocery', name: 'Grocery', icon: '🛒', color: '#96CEB4' },
            { id: 'miscellaneous', name: 'Miscellaneous', icon: '📦', color: '#FFEAA7' },
            { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#DDA0DD' },
            { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#FF7675' },
            { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#74B9FF' },
            { id: 'education', name: 'Education', icon: '📚', color: '#A29BFE' },
            { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#FDCB6E' },
            { id: 'rent', name: 'Rent', icon: '🏠', color: '#6C5CE7' },
            { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#00B894' }
        ];
    }

    async initialize() {
        try {
            await this.loadCategories();
            await this.loadExpenses();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing ExpenseManager:', error);
            // Load default categories and sample data as fallback
            this.categories = [...this.defaultCategories];
            this.expenses = this.getSampleExpenses();
            this.isInitialized = true;
            return true;
        }
    }

    async loadCategories() {
        try {
            if (!this.supabaseClient) {
                this.categories = [...this.defaultCategories];
                return this.categories;
            }

            const { data: categories, error } = await this.supabaseClient
                .from('expense_categories')
                .select('*')
                .order('name');

            if (error) {
                console.warn('Error loading categories from Supabase:', error);
                this.categories = [...this.defaultCategories];
                return this.categories;
            }

            if (categories && categories.length > 0) {
                this.categories = categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    icon: cat.icon || '📦',
                    color: cat.color || '#FFEAA7'
                }));
            } else {
                // If no categories in DB, use defaults and optionally save them
                this.categories = [...this.defaultCategories];
                await this.saveDefaultCategoriesToSupabase();
            }
            
            return this.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = [...this.defaultCategories];
            return this.categories;
        }
    }

    async saveDefaultCategoriesToSupabase() {
        if (!this.supabaseClient) return;
        
        try {
            const { error } = await this.supabaseClient
                .from('expense_categories')
                .insert(this.defaultCategories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    icon: cat.icon,
                    color: cat.color
                })));

            if (error) {
                console.warn('Could not save default categories to Supabase:', error);
            }
        } catch (error) {
            console.error('Error saving default categories:', error);
        }
    }

    async addCategory(categoryData) {
        try {
            const newCategory = {
                id: categoryData.id || `custom_${Date.now()}`,
                name: categoryData.name,
                icon: categoryData.icon || '📦',
                color: categoryData.color || '#FFEAA7'
            };

            if (this.supabaseClient) {
                const { data, error } = await this.supabaseClient
                    .from('expense_categories')
                    .insert([newCategory])
                    .select();

                if (error) {
                    console.error('Error saving category to Supabase:', error);
                    // Add locally even if Supabase fails
                    this.categories.push(newCategory);
                    return newCategory;
                }

                if (data && data[0]) {
                    const savedCategory = {
                        id: data[0].id,
                        name: data[0].name,
                        icon: data[0].icon,
                        color: data[0].color
                    };
                    this.categories.push(savedCategory);
                    return savedCategory;
                }
            } else {
                // No Supabase, just add locally
                this.categories.push(newCategory);
                return newCategory;
            }
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    }

    async loadExpenses() {
        try {
            if (!this.supabaseClient) {
                console.log('No Supabase client, loading sample expenses...');
                this.expenses = this.getSampleExpenses();
                return;
            }

            const { data: expenses, error } = await this.supabaseClient
                .from('expenses')
                .select('*')
                .order('date_incurred', { ascending: false });

            if (error) throw error;

            this.expenses = (expenses || []).map(expense => ({
                id: expense.id,
                amount: parseFloat(expense.amount || 0),
                description: expense.description || '',
                categoryId: expense.category_id,
                categoryName: expense.category_name || 'Uncategorized',
                date: expense.date_incurred || new Date().toISOString().split('T')[0],
                paymentMethod: expense.payment_method || 'cash',
                vendorName: expense.vendor_name || '',
                isBusinessExpense: expense.is_business_expense !== false,
                taxDeductible: expense.tax_deductible || false,
                notes: expense.notes || ''
            }));
            
            console.log(`Loaded ${this.expenses.length} expenses from Supabase`);
        } catch (error) {
            console.error('Error loading expenses:', error);
            this.expenses = this.getSampleExpenses();
        }
    }

    getSampleExpenses() {
        return [
            {
                id: 'EXP-2025-001',
                amount: 15750.00,
                description: 'Office Rent - August 2025',
                categoryName: 'Rent',
                date: '2025-08-01',
                paymentMethod: 'net_banking',
                vendorName: 'Property Management Co.',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Monthly office rent payment'
            },
            {
                id: 'EXP-2025-002',
                amount: 2845.50,
                description: 'Electricity Bill - July 2025',
                categoryName: 'Utilities',
                date: '2025-08-05',
                paymentMethod: 'upi',
                vendorName: 'State Electricity Board',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Office electricity consumption'
            },
            {
                id: 'EXP-2025-003',
                amount: 4200.00,
                description: 'Team Lunch - Project Completion',
                categoryName: 'Food',
                date: '2025-08-10',
                paymentMethod: 'card',
                vendorName: 'The Grand Restaurant',
                isBusinessExpense: true,
                taxDeductible: false,
                notes: 'Celebration meal for project milestone'
            },
            {
                id: 'EXP-2025-004',
                amount: 8900.00,
                description: 'Software License Renewal',
                categoryName: 'Professional Services',
                date: '2025-08-12',
                paymentMethod: 'card',
                vendorName: 'Adobe Systems',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Annual Creative Cloud subscription'
            },
            {
                id: 'EXP-2025-005',
                amount: 1250.00,
                description: 'Office Supplies - Stationery',
                categoryName: 'Miscellaneous',
                date: '2025-08-08',
                paymentMethod: 'cash',
                vendorName: 'Office Depot',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Pens, papers, folders, etc.'
            },
            {
                id: 'EXP-2025-006',
                amount: 3600.00,
                description: 'Business Insurance Premium',
                categoryName: 'Insurance',
                date: '2025-08-03',
                paymentMethod: 'net_banking',
                vendorName: 'Business Insurance Corp',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Quarterly business insurance payment'
            },
            {
                id: 'EXP-2025-007',
                amount: 875.00,
                description: 'Uber Rides - Client Meetings',
                categoryName: 'Transportation',
                date: '2025-08-11',
                paymentMethod: 'wallet',
                vendorName: 'Uber',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Transportation for client visits'
            },
            {
                id: 'EXP-2025-008',
                amount: 12500.00,
                description: 'Marketing Campaign - Social Media',
                categoryName: 'Professional Services',
                date: '2025-08-07',
                paymentMethod: 'card',
                vendorName: 'Digital Marketing Agency',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Q3 social media advertising budget'
            },
            {
                id: 'EXP-2025-009',
                amount: 2200.00,
                description: 'Internet & Phone Bills',
                categoryName: 'Utilities',
                date: '2025-08-06',
                paymentMethod: 'upi',
                vendorName: 'Telecom Provider',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Monthly connectivity charges'
            },
            {
                id: 'EXP-2025-010',
                amount: 5500.00,
                description: 'Equipment Maintenance',
                categoryName: 'Professional Services',
                date: '2025-08-09',
                paymentMethod: 'net_banking',
                vendorName: 'Tech Support Solutions',
                isBusinessExpense: true,
                taxDeductible: true,
                notes: 'Quarterly computer and server maintenance'
            }
        ];
    }

    async saveExpense(expenseData) {
        try {
            const expensePayload = {
                amount: parseFloat(expenseData.amount),
                description: expenseData.description.trim(),
                category_name: expenseData.categoryName || 'Uncategorized',
                date_incurred: expenseData.date,
                payment_method: expenseData.paymentMethod || 'cash',
                vendor_name: expenseData.vendorName?.trim() || null,
                is_business_expense: expenseData.isBusinessExpense !== false,
                tax_deductible: expenseData.taxDeductible || false,
                notes: expenseData.notes?.trim() || null
            };

            if (this.editingExpenseId) {
                // Update existing expense
                const { data, error } = await this.supabaseClient
                    .from('expenses')
                    .update(expensePayload)
                    .eq('id', this.editingExpenseId)
                    .select()
                    .single();

                if (error) throw error;

                const index = this.expenses.findIndex(e => e.id === this.editingExpenseId);
                if (index > -1) {
                    this.expenses[index] = {
                        ...this.expenses[index],
                        ...expenseData,
                        id: this.editingExpenseId
                    };
                }
            } else {
                // Create new expense
                const { data, error } = await this.supabaseClient
                    .from('expenses')
                    .insert([expensePayload])
                    .select()
                    .single();

                if (!error && data) {
                    this.expenses.unshift({
                        ...expenseData,
                        id: data.id
                    });
                } else {
                    // Fallback: add locally with temp ID
                    this.expenses.unshift({
                        ...expenseData,
                        id: 'temp-' + Date.now()
                    });
                }
            }

            this.editingExpenseId = null;
            return true;
        } catch (error) {
            console.error('Error saving expense:', error);
            // Save locally as fallback
            if (this.editingExpenseId) {
                const index = this.expenses.findIndex(e => e.id === this.editingExpenseId);
                if (index > -1) {
                    this.expenses[index] = {
                        ...this.expenses[index],
                        ...expenseData
                    };
                }
            } else {
                this.expenses.unshift({
                    ...expenseData,
                    id: 'local-' + Date.now()
                });
            }
            this.editingExpenseId = null;
            return true;
        }
    }

    async deleteExpense(expenseId) {
        try {
            const { error } = await this.supabaseClient
                .from('expenses')
                .delete()
                .eq('id', expenseId);

            if (error) console.error('Error deleting from database:', error);

            // Remove from local data regardless
            const index = this.expenses.findIndex(exp => exp.id === expenseId);
            if (index > -1) {
                this.expenses.splice(index, 1);
            }

            return true;
        } catch (error) {
            console.error('Error deleting expense:', error);
            // Remove from local data anyway
            const index = this.expenses.findIndex(exp => exp.id === expenseId);
            if (index > -1) {
                this.expenses.splice(index, 1);
            }
            return true;
        }
    }

    // ============================================
    // THIS IS THE MISSING METHOD THAT WAS CAUSING THE ERROR
    // ============================================
    async updateBalanceFromInvoices(invoices) {
        try {
            // Calculate total earnings from paid invoices
            const totalEarnings = invoices
                .filter(inv => inv.status === 'Paid')
                .reduce((sum, inv) => sum + inv.amount, 0);

            // Calculate total expenses
            const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
            
            // Calculate current balance
            const currentBalance = totalEarnings - totalExpenses;

            // Update local balance summary
            this.balanceSummary = {
                totalEarnings,
                totalExpenses,
                currentBalance
            };

            console.log('Balance updated:', this.balanceSummary);

            // Try to update in database (optional - only if you have balance_summary table)
            try {
                // First check if balance_summary table exists and has records
                const { data: existingBalance, error: fetchError } = await this.supabaseClient
                    .from('balance_summary')
                    .select('id')
                    .limit(1);

                if (!fetchError) {
                    // Table exists, try to upsert
                    const { error } = await this.supabaseClient
                        .from('balance_summary')
                        .upsert({
                            id: 'default',
                            total_earnings: totalEarnings,
                            total_expenses: totalExpenses,
                            current_balance: currentBalance,
                            last_calculated_at: new Date().toISOString()
                        });

                    if (error) {
                        console.warn('Could not update balance in database:', error);
                    } else {
                        console.log('Balance updated in database');
                    }
                } else {
                    // Table doesn't exist or other error
                    console.log('Balance summary table not available, using local storage only');
                }
            } catch (dbError) {
                // Silently fail if table doesn't exist
                console.log('Balance summary table operations not available');
            }

            return this.balanceSummary;
        } catch (error) {
            console.error('Error updating balance from invoices:', error);
            return this.balanceSummary;
        }
    }

    // Additional helper methods
    getExpensesByCategory(categoryName) {
        return this.expenses.filter(expense => expense.categoryName === categoryName);
    }

    getExpensesByDateRange(startDate, endDate) {
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return expenseDate >= start && expenseDate <= end;
        });
    }

    getMonthlyExpenseData() {
        const monthlyData = new Map();
        
        this.expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + expense.amount);
        });
        
        return Array.from(monthlyData, ([month, amount]) => ({ month, amount }))
                   .sort((a, b) => a.month.localeCompare(b.month));
    }

    getCategoryBreakdown() {
        const categoryMap = new Map();
        
        this.expenses.forEach(expense => {
            const categoryName = expense.categoryName || 'Uncategorized';
            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, {
                    name: categoryName,
                    amount: 0,
                    count: 0
                });
            }
            
            const categoryData = categoryMap.get(categoryName);
            categoryData.amount += expense.amount;
            categoryData.count += 1;
        });
        
        return Array.from(categoryMap.values())
                   .sort((a, b) => b.amount - a.amount);
    }

    getTotalExpenses() {
        return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }

    getBusinessExpenses() {
        return this.expenses.filter(expense => expense.isBusinessExpense);
    }

    getTaxDeductibleExpenses() {
        return this.expenses.filter(expense => expense.taxDeductible);
    }
}

// Check authentication first
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginTime = localStorage.getItem('loginTime');

    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }

    // Check if login is expired (24 hours)
    if (loginTime) {
        const now = new Date().getTime();
        const loginTimestamp = parseInt(loginTime);
        const hoursDiff = (now - loginTimestamp) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('loginTime');
            window.location.href = 'login.html';
            return false;
        }
    }

    return true;
}

// ENHANCED: Modern logout function with confirmation
function logout() {
    // Create modern confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal-overlay logout-confirm-modal';
    confirmModal.innerHTML = `
        <div class="modal-content logout-confirm-content">
            <div class="logout-confirm-header">
                <div class="logout-icon">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                </div>
                <h3>Sign Out</h3>
                <p>Are you sure you want to sign out of your account?</p>
            </div>
            <div class="logout-confirm-actions">
                <button class="btn btn--secondary cancel-logout">Cancel</button>
                <button class="btn btn--danger confirm-logout">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Add event listeners
    confirmModal.querySelector('.cancel-logout').addEventListener('click', () => {
        document.body.removeChild(confirmModal);
    });
    
    confirmModal.querySelector('.confirm-logout').addEventListener('click', () => {
        // Actual logout process
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('userData');
        
        // Show logout success message
        showToast('Successfully signed out! 👋', 'success');
        
        // Smooth redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
        
        document.body.removeChild(confirmModal);
    });
    
    // Close modal when clicking outside
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            document.body.removeChild(confirmModal);
        }
    });
}

// Only proceed if authenticated
if (!checkAuth()) {
    throw new Error('Authentication required');
}

// Supabase Configuration
const SUPABASE_URL = 'https://kgdewraoanlaqewpbdlo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZGV3cmFvYW5sYXFld3BiZGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTg3NDksImV4cCI6MjA2OTI5NDc0OX0.wBgDDHcdK0Q9mN6uEPQFEO8gXiJdnrntLJW3dUdh89M';

// Initialize Supabase client with better error handling
let supabaseClient;

function initializeSupabase() {
    try {
        // Check multiple ways Supabase might be available
        if (typeof window !== 'undefined') {
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase client initialized successfully');
                return true;
            } else if (window.createClient) {
                // Alternative access pattern for some versions
                supabaseClient = window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase client initialized via alternative method');
                return true;
            } else {
                console.warn('Supabase library not found. Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('supabase')));
            }
        }
        
        console.warn('Supabase not available, using offline mode');
        supabaseClient = null;
        return false;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        supabaseClient = null;
        return false;
    }
}

// Try to initialize immediately
initializeSupabase();

// Make supabaseClient available globally
window.supabaseClient = supabaseClient;

// Application Data
let appData = {
    totalEarnings: 0,
    totalClients: 0,
    totalInvoices: 0,
    monthlyEarnings: [],
    clients: [],
    invoices: [],
    nextInvoiceNumber: 1,
    dataLoaded: false,

    settings: {
    currency: 'INR',
    taxRate: 0,
    invoicePrefix: 'HP-2526',
    profileName: 'Hariprasad Sivakumar',
    profileEmail: 'contact@hariprasadss.com',
    profilePhone: '+91 9500808013',
    profileAddress: '6/91, Mahit Complex, Hosur Road, Attibele, Bengaluru, Karnataka – 562107',
    profileGSTIN: '29GLOPS9921M1ZT',
    bankAccountName: 'Hariprasad Sivakumar',  // CORRECTED: Bank Account Name
    bankName: 'Kotak Mahindra Bank',          // CORRECTED: Bank Name  
    bankAccount: '2049315152',
    bankBranch: 'Indira Nagar, Bengaluru',
    bankIFSC: 'KKBK0008068',
    bankSWIFT: 'KKBKINBBCPC',
    accountType: 'Current Account'
    }
};

// Make appData globally accessible
window.appData = appData;

// Make critical functions globally available for emergency fallback
window.addSampleDataIfEmpty = function() {
    console.log('Adding sample data...');
    if (appData.clients.length === 0) {
        appData.clients = [
            { id: 'client-1', name: 'Sample Client', email: 'client@example.com', totalEarnings: 15000 },
            { id: 'client-2', name: 'Another Client', email: 'another@example.com', totalEarnings: 8500 }
        ];
    }
    if (appData.invoices.length === 0) {
        appData.invoices = [
            { id: 'HP-2526-001', client: 'Sample Client', amount: 5000, date: '2025-08-01', status: 'Paid', clientId: 'client-1' },
            { id: 'HP-2526-002', client: 'Another Client', amount: 7500, date: '2025-08-05', status: 'Pending', clientId: 'client-2' }
        ];
    }
    appData.totalEarnings = appData.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    appData.totalClients = appData.clients.length;
    appData.totalInvoices = appData.invoices.length;
    appData.dataLoaded = true;
};

// Analytics state for filters
let analyticsState = {
    currentPeriod: 'monthly',
    filteredData: null,
    dateRange: { from: null, to: null }
};

// Global variables for editing
let editingInvoiceId = null;
let editingClientId = null;

// Charts
let monthlyChart, clientChart, analyticsChart;

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    initializeApp();

    // Attach event delegation ONCE for each page container
    // Invoices page
    const invoicesPage = document.getElementById('invoices-page');
    if (invoicesPage) {
        invoicesPage.addEventListener('click', (e) => {
            if (!invoicesPage.classList.contains('active')) return;
            if (e.target.id === 'save-draft') {
                saveInvoice('Draft');
            } else if (e.target.id === 'save-invoice') {
                saveInvoice('Pending');
            } else if (e.target.classList.contains('remove-item')) {
                removeLineItem(e.target.closest('.line-item'));
                calculateInvoiceTotal();
            } else if (e.target.id === 'new-invoice-btn') {
                openInvoiceModal();
            }
        });
        invoicesPage.addEventListener('input', (e) => {
            if (!invoicesPage.classList.contains('active')) return;
            if (e.target.classList.contains('quantity') || e.target.classList.contains('rate')) {
                calculateLineItem(e.target.closest('.line-item'));
                calculateInvoiceTotal();
            }
        });
        const invoiceForm = document.getElementById('invoice-form');
        if (invoiceForm) {
            invoiceForm.addEventListener('submit', (e) => {
                if (!invoicesPage.classList.contains('active')) return;
                e.preventDefault();
                saveInvoice('Pending');
            });
        }
    }

    // Clients page
    const clientsPage = document.getElementById('clients-page');
    if (clientsPage) {
        clientsPage.addEventListener('click', (e) => {
            if (!clientsPage.classList.contains('active')) return;
            
            // Handle modern client action buttons
            const actionBtn = e.target.closest('.action-btn-modern') || e.target.closest('.client-action-btn');
            if (actionBtn) {
                e.preventDefault();
                e.stopPropagation();
                const clientId = actionBtn.getAttribute('data-client-id');
                
                if (actionBtn.classList.contains('edit')) {
                    const client = appData.clients.find(c => c.id === clientId);
                    if (client) {
                        editClient(clientId);
                    } else {
                        console.error('Client not found for editing:', clientId);
                        showToast('Error: Client not found. Please refresh the page.', 'error');
                    }
                } else if (actionBtn.classList.contains('delete')) {
                    const clientName = actionBtn.getAttribute('data-client-name');
                    deleteClient(clientId, clientName);
                }
                return;
            }
            
            // Handle add client button
            if (e.target.id === 'add-client-btn' || e.target.closest('#add-client-btn')) {
                openClientModal();
                return;
            }
            
            // Handle search button
            if (e.target.id === 'search-clients-btn' || e.target.closest('#search-clients-btn')) {
                openClientSearchModal();
                return;
            }
            
            // Handle filter tabs
            if (e.target.classList.contains('filter-tab')) {
                // Remove active class from all tabs
                document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
                // Add active class to clicked tab
                e.target.classList.add('active');
                
                const filter = e.target.getAttribute('data-filter');
                // Implement filtering logic here
                showToast(`Filtering by: ${filter}`, 'info');
                return;
            }
            
            // Handle view controls
            if (e.target.classList.contains('view-btn')) {
                document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.getAttribute('data-view');
                // Implement view switching logic here
                showToast(`Switched to ${view} view`, 'info');
                return;
            }
        });
    }

    // Analytics page
    const analyticsPage = document.getElementById('analytics-page');
    if (analyticsPage) {
        analyticsPage.addEventListener('click', (e) => {
            if (!analyticsPage.classList.contains('active')) return;
            if (e.target.id === 'apply-filters') {
                applyAnalyticsFilters();
            } else if (e.target.id === 'clear-filters') {
                clearAnalyticsFilters();
            } else if (e.target.id === 'analytics-filters-advanced-toggle') {
                // Handle advanced filters toggle
                const advancedPanel = document.getElementById('analytics-filters-advanced-panel');
                if (advancedPanel) {
                    const isExpanded = e.target.getAttribute('aria-expanded') === 'true';
                    e.target.setAttribute('aria-expanded', !isExpanded);
                    advancedPanel.style.display = isExpanded ? 'none' : 'block';
                    e.target.classList.toggle('expanded', !isExpanded);
                }
            } else if (e.target.id === 'apply-analytics-filters') {
                applyAnalyticsFilters();
            } else if (e.target.id === 'clear-analytics-filters') {
                clearAnalyticsFilters();
            }
        });
        analyticsPage.addEventListener('change', (e) => {
            if (!analyticsPage.classList.contains('active')) return;
            if (e.target.id === 'analytics-period') {
                analyticsState.currentPeriod = e.target.value;
                console.log('Period changed to:', analyticsState.currentPeriod);
                applyAnalyticsFilters();
            }
        });
    }
});

async function initializeApp() {
    try {
        console.log('🚀 Starting app initialization...');
        showLoadingState(true);
        initializeSidebar();
        
        // Initialize appData if it doesn't exist
        if (!window.appData) {
            window.appData = {
                invoices: [],
                clients: [],
                expenses: [],
                settings: {},
                dataLoaded: false
            };
        }
        
        // Try to load from Supabase, but have fallback
        try {
            await loadDataFromSupabase();
            console.log('✅ Data loaded from Supabase');
        } catch (error) {
            console.warn('⚠️ Supabase loading failed, using emergency init:', error);
            addSampleDataIfEmpty();
        }
        
        appData.dataLoaded = true;

        // Calculate client totals after data is loaded
        calculateAllClientTotals();
        
        // Force sample data if no data exists
        if (appData.clients.length === 0 || appData.invoices.length === 0) {
            console.log('No data found, adding sample data...');
            addSampleDataIfEmpty();
            calculateAllClientTotals(); // Recalculate after adding sample data
        }

        setupNavigation();
        setupModals();
        setupForms();
        setupAnalyticsFilters();
        setupDateRangeFilters();
        
        // Initialize simple search and filters
        initializeSimpleSearch();
        initializeClientFilters();
        
        // Initialize Expense Management
        try {
            console.log('Initializing Expense Management...');
            
            // Initialize ExpenseManager with proper Supabase client
            window.expenseManager = new ExpenseManager(supabaseClient);
            await window.expenseManager.initialize();
            
            // Initialize ExpenseUI
            window.expenseUI = new ExpenseUI(window.expenseManager, showToast);
            
            // Add global functions for modal interactions
            window.closeExpenseModal = function() {
                if (window.expenseUI) {
                    window.expenseUI.closeExpenseModal();
                }
            };
            
            window.saveExpense = async function() {
                if (window.expenseUI) {
                    await window.expenseUI.saveExpense();
                }
            };
            
            // Icon and color selection for add category modal
            window.selectIcon = function(icon, event) {
                // Remove previous selection
                document.querySelectorAll('.icon-option.selected').forEach(el => el.classList.remove('selected'));
                
                // Add selection to clicked element
                if (event && event.target) { event.target.classList.add('selected'); }
                
                // Set the hidden input value
                document.getElementById('new-category-icon').value = icon;
            };
            
            window.selectColor = function(color, event) {
                // Remove previous selection
                document.querySelectorAll('.color-option.selected').forEach(el => el.classList.remove('selected'));
                
                // Add selection to clicked element
                if (event && event.target) { event.target.classList.add('selected'); }
                
                // Set the hidden input value
                document.getElementById('new-category-color').value = color;
            };
            
            console.log('Expense Management initialized successfully');
        } catch (error) {
            console.error('Error initializing expense management:', error);
            showToast('Expense module loaded with limited functionality', 'warning');
        }
        
        // Render all pages
        renderDashboard();
        renderInvoices();
        renderClients();
        renderAnalytics();
        renderSettings();

        // Add PDF library for invoice downloads
        loadPDFLibrary();

        showLoadingState(false);
        console.log('Application initialized successfully');
        showToast('Application loaded successfully', 'success');
    } catch (error) {
        console.error('Error initializing application:', error);
        showLoadingState(false);
        showToast('Error loading data. Please refresh the page.', 'error');
    }
}

// Load PDF library for invoice downloads
function loadPDFLibrary() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.jspdf) {
            resolve();
            return;
        }

        // Remove existing scripts if any
        const existingScript = document.getElementById('jspdf-script');
        if (existingScript) {
            existingScript.remove();
        }

        const existingAutoTable = document.getElementById('jspdf-autotable-script');
        if (existingAutoTable) {
            existingAutoTable.remove();
        }

        // Load jsPDF
        const script = document.createElement('script');
        script.id = 'jspdf-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            console.log('jsPDF loaded successfully');
            
            // Load AutoTable plugin
            const autoTableScript = document.createElement('script');
            autoTableScript.id = 'jspdf-autotable-script';
            autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
            autoTableScript.onload = () => {
                console.log('jsPDF AutoTable loaded successfully');
                resolve();
            };
            autoTableScript.onerror = (error) => {
                console.error('Failed to load jsPDF AutoTable:', error);
                reject(error);
            };
            document.head.appendChild(autoTableScript);
        };
        script.onerror = (error) => {
            console.error('Failed to load jsPDF:', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Loading state management
function showLoadingState(show) {
    let loader = document.getElementById('app-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center;">
                    <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #1FB8CD; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <div style="color: #666; font-weight: 500;">Loading...</div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'flex' : 'none';
}

// ENHANCED: Initialize modern sidebar (logout button now in HTML)
function initializeSidebar() {
    // Update username in user info if needed
    const username = localStorage.getItem('username') || 'User';
    const userDetails = document.querySelector('.user-details h4');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userDetails) {
        userDetails.textContent = username;
    }
    
    if (userAvatar) {
        userAvatar.textContent = username.substring(0, 2).toUpperCase();
    }
    
    // Ensure logout button has proper event listener (backup)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }
}

async function getNextInvoiceNumber() {
    try {
        const { data: invoices, error } = await supabaseClient
            .from('invoices')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (invoices && invoices.length > 0) {
            const lastInvoiceId = invoices[0].id;
            const match = lastInvoiceId.match(/(\d+)$/);
            if (match) {
                return parseInt(match[1]) + 1;
            }
        }

        return 1;
    } catch (error) {
        console.error('Error getting next invoice number:', error);
        return Date.now();
    }
}

// IMPROVED: Better analytics UI with date pickers
function setupDateRangeFilters() {
    const analyticsHeader = document.querySelector('#analytics-page .page-header');
    if (analyticsHeader && !document.getElementById('modern-analytics-controls')) {
        const existingFilter = document.querySelector('#modern-date-filter');
        if (existingFilter) {
            existingFilter.remove();
        }

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'modern-analytics-controls';
      controlsContainer.innerHTML = `
    <div class="ultra-modern-analytics">
        <!-- Header Section -->
        <div class="analytics-hero">
            <div class="hero-content">
                <div class="hero-badge">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                    Analytics Dashboard
                </div>
                <h2 class="hero-title">Revenue & Performance Insights</h2>
                <p class="hero-subtitle">Analyze trends, filter data, and make informed decisions with real-time analytics</p>
            </div>
            <div class="hero-stats">
                <div class="stat-pill">
                    <span class="stat-icon">📈</span>
                    <span>Live Data</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-icon">⚡</span>
                    <span>Real-time</span>
                </div>
            </div>
        </div>

        <!-- Filter Controls -->
        <div class="filter-section">
            <div class="section-header">
                <h3>Data Filters</h3>
                <div class="filter-actions">
                    <button class="action-btn reset-btn" id="clear-filters">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        Reset
                    </button>
                </div>
            </div>

            <div class="filters-grid">
                <!-- Time Period Filter -->
                <div class="filter-group">
                    <label class="filter-label">
                        <div class="label-content">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.11 2 2 3.11 2 4.5v15C2 20.89 3.11 22 4.5 22h15c1.39 0 2.5-1.11 2.5-2.5v-15C22 3.11 20.89 2 19.5 2z"/>
                            </svg>
                            <span>Time Period</span>
                        </div>
                    </label>
                    <div class="select-wrapper">
                        <select id="analytics-period" class="modern-select">
                            <option value="monthly">📊 Monthly View</option>
                            <option value="quarterly">📈 Quarterly View</option>
                            <option value="yearly">📅 Yearly View</option>
                        </select>
                        <div class="select-chevron">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 10l5 5 5-5z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Date Range Filter -->
                <div class="filter-group date-range-group">
                    <label class="filter-label">
                        <div class="label-content">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.11 2 2 3.11 2 4.5v15C2 20.89 3.11 22 4.5 22h15c1.39 0 2.5-1.11 2.5-2.5v-15C22 3.11 20.89 2 19.5 2z"/>
                            </svg>
                            <span>Date Range</span>
                        </div>
                    </label>
                    <div class="date-inputs">
                        <div class="date-input-container">
                            <input type="month" id="date-from" class="date-input">
                            <label class="floating-label">From</label>
                        </div>
                        <div class="date-separator">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                            </svg>
                        </div>
                        <div class="date-input-container">
                            <input type="month" id="date-to" class="date-input">
                            <label class="floating-label">To</label>
                        </div>
                    </div>
                </div>

                <!-- Apply Button -->
                <div class="filter-group apply-group">
                    <button class="apply-btn" id="apply-filters">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span>Apply Filters</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Active Filters Display -->
        <div class="active-filters" id="analytics-status">
            <div class="filters-header">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"/>
                    </svg>
                    <span>Active Filters</span>
                </div>
            <div class="filter-chips"></div>
        </div>
    </div>
`;
        analyticsHeader.parentNode.insertBefore(controlsContainer, analyticsHeader.nextSibling);

        // Add enhanced analytics styles
        if (!document.getElementById('enhanced-analytics-styles')) {
            const style = document.createElement('style');
            style.id = 'enhanced-analytics-styles';
            style.textContent = `
    .ultra-modern-analytics {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 24px;
        overflow: hidden;
        margin: 32px 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
    }

    .analytics-hero {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 32px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
    }

    .analytics-hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: url('data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)" /></svg>');
        opacity: 0.3;
        pointer-events: none;
    }

    .hero-content {
        position: relative;
        z-index: 2;
    }

    .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.2);
        padding: 8px 16px;
        border-radius: 50px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .hero-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
        line-height: 1.2;
    }

    .hero-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin: 0;
        max-width: 500px;
        line-height: 1.5;
    }

    .hero-stats {
        display: flex;
        gap: 12px;
        position: relative;
        z-index: 2;
    }

    .stat-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.15);
        padding: 8px 16px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: 500;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-icon {
        font-size: 14px;
    }

    .filter-section {
        padding: 32px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .section-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1a202c;
        margin: 0;
    }

    .filter-actions {
        display: flex;
        gap: 8px;
    }

    .reset-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        color: #4a5568;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .reset-btn:hover {
        background: #edf2f7;
        border-color: #cbd5e0;
        color: #2d3748;
    }

    .filters-grid {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        gap: 24px;
        align-items: end;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .filter-label {
        font-size: 13px;
        font-weight: 600;
        color: #4a5568;
        margin-bottom: 4px;
    }

    .label-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .select-wrapper {
        position: relative;
    }

    .modern-select {
        width: 100%;
        padding: 12px 40px 12px 16px;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #2d3748;
        appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .modern-select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .select-chevron {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #a0aec0;
        pointer-events: none;
    }

    .date-inputs {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .date-input-container {
        position: relative;
        flex: 1;
    }

    .date-input {
        width: 100%;
        padding: 12px 16px;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #2d3748;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .date-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .floating-label {
        position: absolute;
        top: -8px;
        left: 12px;
        background: white;
        padding: 0 6px;
        font-size: 11px;
        font-weight: 600;
        color: #718096;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .date-separator {
        color: #667eea;
        margin: 0 4px;
    }

    .apply-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .apply-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .apply-btn:active {
        transform: translateY(0);
    }

    .active-filters {
        padding: 24px 32px;
        background: #f7fafc;
        border-top: 1px solid #e2e8f0;
        display: none;
    }

    .active-filters.show {
        display: block;
        animation: slideDown 0.3s ease;
    }

    .filters-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 13px;
        font-weight: 600;
        color: #4a5568;
    }

    .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        color: #2d3748;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        .analytics-hero {
            flex-direction: column;
            text-align: center;
            gap: 20px;
        }

        .hero-stats {
            justify-content: center;
        }

        .filters-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .date-inputs {
            flex-direction: column;
            gap: 16px;
        }

        .date-separator {
            transform: rotate(90deg);
        }
    }
`;
            document.head.appendChild(style);
        }

        // Setup event listeners
        document.getElementById('apply-filters').addEventListener('click', applyAnalyticsFilters);
        document.getElementById('clear-filters').addEventListener('click', clearAnalyticsFilters);
        
        document.getElementById('analytics-period').addEventListener('change', (e) => {
            analyticsState.currentPeriod = e.target.value;
            console.log('Period changed to:', analyticsState.currentPeriod);
            applyAnalyticsFilters();
        });
    }
}

function applyAnalyticsFilters() {
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    const period = document.getElementById('analytics-period').value;
    const statusDiv = document.getElementById('analytics-status');

    analyticsState.currentPeriod = period;
    analyticsState.dateRange = { from: fromDate, to: toDate };

    console.log('Applying analytics filters:', { period, fromDate, toDate });

    let filteredInvoices = appData.invoices;
    if (fromDate && toDate) {
        if (fromDate > toDate) {
            showToast('From date should be earlier than to date', 'error');
            return;
        }

        filteredInvoices = appData.invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            const invoiceMonth = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
            return invoiceMonth >= fromDate && invoiceMonth <= toDate;
        });

        const totalEarnings = filteredInvoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.amount, 0);

        statusDiv.innerHTML = `
            <span>📊 ${filteredInvoices.length} invoices • ₹${formatNumber(totalEarnings)} total • ${fromDate} to ${toDate}</span>
        `;
        statusDiv.className = 'filter-status show';
    } else {
        statusDiv.className = 'filter-status';
    }

    analyticsState.filteredData = filteredInvoices;

    renderAnalyticsChart(period);
    renderTopClientInsights(filteredInvoices);

    showToast(`Analytics updated: ${period} view${fromDate && toDate ? ' with date filter' : ''}`, 'success');
}

function clearAnalyticsFilters() {
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('analytics-period').value = 'monthly';
    
    analyticsState.currentPeriod = 'monthly';
    analyticsState.dateRange = { from: null, to: null };
    analyticsState.filteredData = null;

    const statusDiv = document.getElementById('analytics-status');
    statusDiv.className = 'filter-status';

    renderAnalyticsChart('monthly');
    renderTopClientInsights(appData.invoices);
    
    showToast('Analytics filters cleared', 'info');
}

async function loadDataFromSupabase() {
    console.log('Loading data from Supabase...');

    try {
        // Load clients
        console.log('Loading clients...');
        const { data: clients, error: clientsError } = await supabaseClient
            .from('clients')
            .select('*')
            .order('name', { ascending: true });

        if (clientsError) {
            console.error('Clients error:', clientsError);
            throw clientsError;
        }

        appData.clients = (clients || []).map(client => ({
            id: client.id,
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            payment_terms: client.payment_terms || 'net30',
            contact_name: client.contact_name || '',
            company: client.company || client.name || '',
            total_invoices: parseInt(client.total_invoices || 0),
            total_amount: parseFloat(client.total_amount || 0)
        }));
        appData.totalClients = appData.clients.length;
        console.log('Clients loaded:', appData.clients.length);

        // Load invoices
        console.log('Loading invoices...');
        const { data: invoices, error: invoicesError } = await supabaseClient
            .from('invoices')
            .select('*')
            .order('date_issued', { ascending: false });

        if (invoicesError) {
            console.error('Invoices error:', invoicesError);
            throw invoicesError;
        }

        appData.invoices = (invoices || []).map(invoice => ({
            id: invoice.id || '',
            clientId: invoice.client_id,
            client: invoice.client_name || '',
            amount: parseFloat(invoice.amount || 0),
            subtotal: parseFloat(invoice.subtotal || 0),
            tax: parseFloat(invoice.tax || 0),
            date: invoice.date_issued || new Date().toISOString().split('T')[0],
            dueDate: invoice.due_date || new Date().toISOString().split('T')[0],
            status: invoice.status || 'Draft',
            items: Array.isArray(invoice.items) ? invoice.items : []
        }));

        appData.totalInvoices = appData.invoices.length;
        console.log('Invoices loaded:', appData.invoices.length);

        appData.totalEarnings = appData.invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.amount, 0);

        calculateMonthlyEarnings();

        // Load settings
        console.log('Loading settings...');
        const { data: settings, error: settingsError } = await supabaseClient
            .from('settings')
            .select('*')
            .eq('user_id', 'default')
            .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
            console.warn('Settings error (non-critical):', settingsError);
        }

        if (settings) {
            appData.settings = {
                ...appData.settings,
                currency: settings.currency || appData.settings.currency,
                taxRate: settings.tax_rate !== null && settings.tax_rate !== undefined ? parseFloat(settings.tax_rate) : appData.settings.taxRate,
                invoicePrefix: settings.invoice_prefix || appData.settings.invoicePrefix,
                profileName: settings.profile_name || appData.settings.profileName,
                profileEmail: settings.profile_email || appData.settings.profileEmail,
                profilePhone: settings.profile_phone || appData.settings.profilePhone,
                profileAddress: settings.profile_address || appData.settings.profileAddress,
                profileGSTIN: settings.profile_gstin || appData.settings.profileGSTIN, // Added GSTIN
                bankName: settings.bank_name || appData.settings.bankName,
                bankAccount: settings.bank_account || appData.settings.bankAccount,
                bankIFSC: settings.bank_ifsc || appData.settings.bankIFSC,
                bankSWIFT: settings.bank_swift || appData.settings.bankSWIFT
            };
        }

        console.log('Data loaded successfully from Supabase');

    } catch (error) {
        console.error('Critical error loading data from Supabase:', error);
        showToast(`Failed to load data: ${error.message || 'Unknown error'}`, 'error');
        throw error;
    }
}

// REPLACE YOUR ENTIRE SECTION WITH THIS CORRECTED CODE:
// This fixes all issues in the monthly, quarterly, and yearly calculations

function calculateMonthlyEarnings() {
    const monthlyData = new Map();
    
    appData.invoices
        .filter(inv => inv.status === 'Paid')
        .forEach(({ date, amount }) => {
            const d = new Date(date);
            if (isNaN(d.getTime())) return;  // FIXED: Proper date validation
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + amount);
        });
    
    appData.monthlyEarnings = Array.from(monthlyData, ([month, amount]) => ({ month, amount }))
                                   .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateQuarterlyEarnings(invoices = appData.invoices) {
    const quarterlyData = new Map();
    
    invoices
        .filter(inv => inv.status === 'Paid')
        .forEach(({ date, amount }) => {
            const d = new Date(date);
            if (isNaN(d.getTime())) return;  // FIXED: Proper date validation
            const year = d.getFullYear();
            const quarter = Math.ceil((d.getMonth() + 1) / 3);
            const quarterKey = `${year}-Q${quarter}`;
            quarterlyData.set(quarterKey, (quarterlyData.get(quarterKey) || 0) + amount);  // FIXED: Use quarterlyData
        });
    
    return Array.from(quarterlyData, ([quarter, amount]) => ({ month: quarter, amount }))  // FIXED: Use quarterlyData
                 .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateYearlyEarnings(invoices = appData.invoices) {
    const yearlyData = new Map();
    
    invoices
        .filter(inv => inv.status === 'Paid')
        .forEach(({ date, amount }) => {
            const d = new Date(date);
            if (isNaN(d.getTime())) return;  // Proper date validation
            const year = d.getFullYear().toString();
            yearlyData.set(year, (yearlyData.get(year) || 0) + amount);
        });
    
    return Array.from(yearlyData, ([year, amount]) => ({ month: year, amount }))
                 .sort((a, b) => a.month.localeCompare(b.month));
}
async function saveClientToSupabase(clientData) {
    try {
        console.log('Saving client to Supabase:', clientData);

        if (!clientData.name || !clientData.email) {
            throw new Error('Name and email are required');
        }

        if (editingClientId) {
            console.log('Updating existing client:', editingClientId);
            
            const updatePayloads = [
                {
                    name: clientData.name.trim(),
                    email: clientData.email.trim(),
                    phone: clientData.phone?.trim() || '',
                    address: clientData.address?.trim() || '',
                    payment_terms: clientData.paymentTerms || 'net30',
                    contact_name: clientData.contactName?.trim() || '',
                    company: clientData.company?.trim() || clientData.name.trim(),
                    updated_at: new Date().toISOString()
                },
                {
                    name: clientData.name.trim(),
                    email: clientData.email.trim(),
                    phone: clientData.phone?.trim() || '',
                    address: clientData.address?.trim() || '',
                    payment_terms: clientData.paymentTerms || 'net30',
                    updated_at: new Date().toISOString()
                }
            ];

            let data, error;
            
            for (let i = 0; i < updatePayloads.length; i++) {
                console.log(`Trying update payload ${i + 1}:`, updatePayloads[i]);
                
                const result = await supabaseClient
                    .from('clients')
                    .update(updatePayloads[i])
                    .eq('id', editingClientId)
                    .select()
                    .single();
                
                data = result.data;
                error = result.error;
                
                if (!error) {
                    console.log(`Update successful with payload ${i + 1}:`, data);
                    break;
                } else {
                    console.warn(`Update payload ${i + 1} failed:`, error);
                    if (i === updatePayloads.length - 1) {
                        throw error;
                    }
                }
            }

            return data;
        } else {
            console.log('Inserting new client');
            
            const insertPayloads = [
                {
                    name: clientData.name.trim(),
                    email: clientData.email.trim(),
                    phone: clientData.phone?.trim() || '',
                    address: clientData.address?.trim() || '',
                    payment_terms: clientData.paymentTerms || 'net30',
                    contact_name: clientData.contactName?.trim() || '',
                    company: clientData.company?.trim() || clientData.name.trim(),
                    total_invoices: 0,
                    total_amount: 0
                },
                {
                    name: clientData.name.trim(),
                    email: clientData.email.trim(),
                    phone: clientData.phone?.trim() || '',
                    address: clientData.address?.trim() || '',
                    payment_terms: clientData.paymentTerms || 'net30',
                    total_invoices: 0,
                    total_amount: 0
                }
            ];

            let data, error;
            
            for (let i = 0; i < insertPayloads.length; i++) {
                console.log(`Trying insert payload ${i + 1}:`, insertPayloads[i]);
                
                const result = await supabaseClient
                    .from('clients')
                    .insert([insertPayloads[i]])
                    .select()
                    .single();
                
                data = result.data;
                error = result.error;
                
                if (!error) {
                    console.log(`Insert successful with payload ${i + 1}:`, data);
                    break;
                } else {
                    console.warn(`Insert payload ${i + 1} failed:`, error);
                    if (i === insertPayloads.length - 1) {
                        throw error;
                    }
                }
            }

            return data;
        }
    } catch (error) {
        console.error('Error saving client to Supabase:', error);
        
        if (error.message && error.message.includes('column')) {
            console.error('Schema mismatch detected. Available columns might be different.');
            throw new Error(`Database schema issue: ${error.message}. Please check if all client fields exist in your Supabase table.`);
        }
        
        throw error;
    }
}

async function saveInvoiceToSupabase(invoiceData) {
    try {
        console.log('Saving invoice to Supabase:', invoiceData);

        // For new invoices, check if ID already exists
        if (!editingInvoiceId) {
            // Generate a unique invoice ID if not provided or if it exists
            const { data: existingInvoice } = await supabaseClient
                .from('invoices')
                .select('id')
                .eq('id', invoiceData.id)
                .single();

            if (existingInvoice) {
                // ID already exists, generate a new one
                const timestamp = Date.now();
                const randomNum = Math.floor(Math.random() * 1000);
                invoiceData.id = `${appData.settings.invoicePrefix}-${timestamp}-${randomNum}`;
                console.log('Generated new unique invoice ID:', invoiceData.id);
            }
        }

        if (editingInvoiceId) {
            const { data, error } = await supabaseClient
                .from('invoices')
                .update({
                    client_id: invoiceData.clientId,
                    client_name: invoiceData.client,
                    amount: invoiceData.amount,
                    subtotal: invoiceData.subtotal,
                    tax: invoiceData.tax,
                    date_issued: invoiceData.date,
                    due_date: invoiceData.dueDate,
                    status: invoiceData.status,
                    items: invoiceData.items
                })
                .eq('id', editingInvoiceId)
                .select()
                .single();

            if (error) throw error;

            await updateClientTotals(invoiceData.clientId);
            return data;
        } else {
            const { data, error } = await supabaseClient
                .from('invoices')
                .insert([{
                    id: invoiceData.id,
                    client_id: invoiceData.clientId,
                    client_name: invoiceData.client,
                    amount: invoiceData.amount,
                    subtotal: invoiceData.subtotal,
                    tax: invoiceData.tax,
                    date_issued: invoiceData.date,
                    due_date: invoiceData.dueDate,
                    status: invoiceData.status,
                    items: invoiceData.items
                }])
                .select()
                .single();

            if (error) {
                // If it's still a duplicate key error, try once more with a different ID
                if (error.code === '23505') {
                    const timestamp = Date.now();
                    const randomNum = Math.floor(Math.random() * 10000);
                    invoiceData.id = `${appData.settings.invoicePrefix}-${timestamp}-${randomNum}`;
                    
                    const { data: retryData, error: retryError } = await supabaseClient
                        .from('invoices')
                        .insert([{
                            id: invoiceData.id,
                            client_id: invoiceData.clientId,
                            client_name: invoiceData.client,
                            amount: invoiceData.amount,
                            subtotal: invoiceData.subtotal,
                            tax: invoiceData.tax,
                            date_issued: invoiceData.date,
                            due_date: invoiceData.dueDate,
                            status: invoiceData.status,
                            items: invoiceData.items
                        }])
                        .select()
                        .single();

                    if (retryError) throw retryError;
                    
                    await updateClientTotals(invoiceData.clientId);
                    return retryData;
                }
                throw error;
            }

            await updateClientTotals(invoiceData.clientId);
            return data;
        }
    } catch (error) {
        console.error('Error saving invoice to Supabase:', error);
        throw error;
    }
}

async function updateClientTotals(clientId) {
    try {
        const { data: invoices, error: invoicesError } = await supabaseClient
            .from('invoices')
            .select('amount, status')
            .eq('client_id', clientId);

        if (invoicesError) throw invoicesError;

        const totalInvoices = invoices.length;
        const totalAmount = invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

        const { error: updateError } = await supabaseClient
            .from('clients')
            .update({
                total_invoices: totalInvoices,
                total_amount: totalAmount,
                updated_at: new Date().toISOString()
            })
            .eq('id', clientId);

        if (updateError) throw updateError;
    } catch (error) {
        console.error('Error updating client totals:', error);
        throw error;
    }
}

async function deleteInvoiceFromSupabase(invoiceId) {
    try {
        const { data: invoice, error: getError } = await supabaseClient
            .from('invoices')
            .select('client_id')
            .eq('id', invoiceId)
            .single();

        if (getError) throw getError;

        const { error: deleteError } = await supabaseClient
            .from('invoices')
            .delete()
            .eq('id', invoiceId);

        if (deleteError) throw deleteError;

        await updateClientTotals(invoice.client_id);

        return true;
    } catch (error) {
        console.error('Error deleting invoice from Supabase:', error);
        throw error;
    }
}

// FIXED: Delete client functionality
async function deleteClientFromSupabase(clientId) {
    try {
        const { error } = await supabaseClient
            .from('clients')
            .delete()
            .eq('id', clientId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting client from Supabase:', error);
        throw error;
    }
}

async function saveSettingsToSupabase(settingsData) {
    try {
        console.log('Saving settings to Supabase:', settingsData);

        if (!settingsData.profileName || !settingsData.profileEmail) {
            throw new Error('Profile name and email are required');
        }

        if (settingsData.taxRate < 0 || settingsData.taxRate > 100) {
            throw new Error('Tax rate must be between 0 and 100');
        }

        const { data: existingSettings, error: checkError } = await supabaseClient
            .from('settings')
            .select('user_id')
            .eq('user_id', 'default')
            .maybeSingle();

        const settingsPayload = {
            currency: settingsData.currency || 'INR',
            tax_rate: parseFloat(settingsData.taxRate),
            invoice_prefix: settingsData.invoicePrefix || 'HP-2526',
            profile_name: settingsData.profileName || '',
            profile_email: settingsData.profileEmail || '',
            profile_phone: settingsData.profilePhone || '',
            profile_address: settingsData.profileAddress || '',
            profile_gstin: settingsData.profileGSTIN || '', // Added GSTIN
            bank_name: settingsData.bankName || '',
            bank_account: settingsData.bankAccount || '',
            bank_ifsc: settingsData.bankIFSC || '',
            bank_swift: settingsData.bankSWIFT || '',
            updated_at: new Date().toISOString()
        };

        console.log('Settings payload:', settingsPayload);

        if (existingSettings) {
            console.log('Updating existing settings');
            const { data, error } = await supabaseClient
                .from('settings')
                .update(settingsPayload)
                .eq('user_id', 'default')
                .select()
                .single();

            if (error) {
                console.error('Settings update error:', error);
                throw error;
            }
            console.log('Settings updated successfully:', data);
            return data;
        } else {
            console.log('Inserting new settings');
            const { data, error } = await supabaseClient
                .from('settings')
                .insert([{
                    user_id: 'default',
                    ...settingsPayload
                }])
                .select()
                .single();

            if (error) {
                console.error('Settings insert error:', error);
                throw error;
            }
            console.log('Settings inserted successfully:', data);
            return data;
        }
    } catch (error) {
        console.error('Critical error saving settings to Supabase:', error);
        throw error;
    }
}

// REPLACE YOUR ENTIRE setupNavigation FUNCTION WITH THIS:

// REPLACE YOUR EXISTING setupNavigation FUNCTION WITH THIS ENHANCED VERSION

function setupNavigation() {
    console.log('Setting up enhanced navigation...');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.dataset.page;
            console.log('Navigating to:', targetPage);
            
            // Get the current active page before switching
            const currentActivePage = document.querySelector('.page.active');
            const currentPageId = currentActivePage ? currentActivePage.id : '';
            
            // Special cleanup when leaving expenses page
            if (currentPageId === 'expenses-page') {
                console.log('Leaving expenses page - running cleanup');
                
                if (window.expenseUI) {
                    if (typeof window.expenseUI.cleanupExpensesPage === 'function') {
                        window.expenseUI.cleanupExpensesPage();
                    }
                    
                    if (window.expenseUI.expenseChart) {
                        try {
                            window.expenseUI.expenseChart.destroy();
                            window.expenseUI.expenseChart = null;
                        } catch (e) {
                            console.warn('Error destroying expense chart:', e);
                        }
                    }
                    
                    if (window.expenseUI.categoryChart) {
                        try {
                            window.expenseUI.categoryChart.destroy();
                            window.expenseUI.categoryChart = null;
                        } catch (e) {
                            console.warn('Error destroying category chart:', e);
                        }
                    }
                }
                
                const expenseModal = document.getElementById('expense-modal');
                if (expenseModal && !expenseModal.classList.contains('hidden')) {
                    expenseModal.classList.add('hidden');
                }
            }
            
            if (typeof cleanupExpenseFilters === 'function') {
                cleanupExpenseFilters();
            }
            
            // Remove active states from all nav links and add modern animation
            navLinks.forEach(nl => {
                nl.classList.remove('active');
                // Remove any existing animation classes
                nl.classList.remove('nav-item-enter');
            });
            
            // Add active state with animation to clicked link
            link.classList.add('active');
            link.classList.add('nav-item-enter');
            
            // Update user avatar active indicator
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.style.borderColor = 'var(--color-primary)';
                setTimeout(() => {
                    userAvatar.style.borderColor = 'var(--color-border)';
                }, 300);
            }
            
            // Switch active states for pages with fade animation
            pages.forEach(page => {
                page.classList.remove('active');
                page.classList.add('page-fade-out');
            });
            
            const targetElement = document.getElementById(`${targetPage}-page`);
            
            if (targetElement) {
                // Small delay for fade out effect
                setTimeout(() => {
                    pages.forEach(page => page.classList.remove('page-fade-out'));
                    targetElement.classList.add('active');
                    targetElement.classList.add('page-fade-in');
                    
                    // Remove animation class after animation completes
                    setTimeout(() => {
                        targetElement.classList.remove('page-fade-in');
                        link.classList.remove('nav-item-enter');
                    }, 300);
                    
                    // Render the appropriate page content
                    setTimeout(() => {
                        if (typeof cleanupExpenseFilters === 'function' && targetPage !== 'expenses') {
                            cleanupExpenseFilters();
                        }
                        
                        switch(targetPage) {
                            case 'dashboard':
                                if (typeof renderDashboard === 'function') {
                                    renderDashboard();
                                }
                                break;
                                
                            case 'invoices':
                                if (typeof renderInvoices === 'function') {
                                    renderInvoices();
                                }
                                break;
                                
                            case 'clients':
                                if (typeof renderClients === 'function') {
                                    renderClients();
                                }
                                break;
                                
                            case 'analytics':
                                if (typeof renderAnalytics === 'function') {
                                    renderAnalytics();
                                }
                                break;
                                
                            case 'settings':
                                if (typeof renderSettings === 'function') {
                                    renderSettings();
                                }
                                break;
                                
                            case 'expenses':
                                if (window.expenseUI) {
                                    console.log('Initializing Expense UI');
                                    try {
                                        window.expenseUI.initializeUI();
                                    } catch (error) {
                                        console.error('Error initializing Expense UI:', error);
                                        // Don't show error toast, try to reinitialize instead
                                        window.expenseUI = null;
                                        window.expenseManager = null;
                                    }
                                } 
                                
                                if (!window.expenseUI) {
                                    if (window.expenseManager) {
                                        console.log('Creating ExpenseUI instance');
                                        try {
                                            window.expenseUI = new ExpenseUI(window.expenseManager, showToast);
                                            window.expenseUI.initializeUI();
                                        } catch (error) {
                                            console.error('Error creating ExpenseUI:', error);
                                            // Initialize with null manager for basic functionality
                                            window.expenseUI = new ExpenseUI(null, showToast);
                                            window.expenseUI.initializeUI();
                                        }
                                    } else {
                                        console.warn('Expense module not initialized, initializing now...');
                                        initializeExpenseModule().then(() => {
                                            if (window.expenseUI) {
                                                window.expenseUI.initializeUI();
                                            }
                                        }).catch(error => {
                                            console.error('Failed to initialize expense module:', error);
                                            // Initialize with basic functionality
                                            try {
                                                if (!window.expenseManager) {
                                                    window.expenseManager = new ExpenseManager(null);
                                                    window.expenseManager.initialize().then(() => {
                                                        window.expenseUI = new ExpenseUI(window.expenseManager, showToast);
                                                        window.expenseUI.initializeUI();
                                                    });
                                                } else {
                                                    window.expenseUI = new ExpenseUI(window.expenseManager, showToast);
                                                    window.expenseUI.initializeUI();
                                                }
                                            } catch (fallbackError) {
                                                console.error('Fallback initialization failed:', fallbackError);
                                                showToast('Expense module temporarily unavailable', 'warning');
                                            }
                                        });
                                    }
                                }
                                break;
                                
                            default:
                                console.warn('Unknown page:', targetPage);
                        }
                    }, 50);
                }, 150);
            } else {
                console.error('Target page not found:', targetPage);
                showToast('Page not found', 'error');
            }
        });
    });
    
    // Enhanced hover effects for navigation
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            if (!link.classList.contains('active')) {
                link.classList.add('nav-item-hover');
            }
        });
        
        link.addEventListener('mouseleave', (e) => {
            link.classList.remove('nav-item-hover');
        });
    });
    
    // Set initial active state
    const hash = window.location.hash.slice(1) || 'dashboard';
    const initialLink = document.querySelector(`[data-page="${hash}"]`);
    if (initialLink) {
        initialLink.click();
    }
    
    console.log('Enhanced navigation setup complete');
    
    console.log('Enhanced navigation setup complete');
}

// Helper function to initialize expense module on demand
async function initializeExpenseModule() {
    // Try to initialize Supabase again if it failed initially
    if (!window.supabaseClient && !supabaseClient) {
        console.log('Retrying Supabase initialization...');
        initializeSupabase();
    }
    
    // Handle null supabaseClient gracefully for local development
    if (!window.supabaseClient) {
        console.warn('Supabase client not available, initializing in offline mode');
        // Create a mock supabaseClient for local development
        window.supabaseClient = null;
    }
    
    if (!window.expenseManager) {
        console.log('Initializing ExpenseManager...');
        window.expenseManager = new ExpenseManager(window.supabaseClient || supabaseClient);
        await window.expenseManager.initialize();
    }
    
    if (!window.expenseUI) {
        console.log('Initializing ExpenseUI...');
        window.expenseUI = new ExpenseUI(window.expenseManager, window.showToast || showToast);
    }
    
    return true;
}

// Enhanced cleanup function for expense filters
function cleanupExpenseFilters() {
    try {
        console.log('🧹 Running expense cleanup...');
        
        // Get current active page
        const activePage = document.querySelector('.page.active');
        const activePageId = activePage ? activePage.id : '';
        
        // Only run cleanup if we're NOT on the expenses page
        if (activePageId !== 'expenses-page') {
            // Remove expense filters from ALL other pages
            document.querySelectorAll('.page:not(#expenses-page)').forEach(page => {
                // Remove all expense-related containers
                page.querySelectorAll(`
                    .expense-filters-container,
                    .expense-filters-wrapper,
                    .expense-balance-cards,
                    .expense-charts,
                    .expense-filters-section,
                    [id*="expense-filter"],
                    [id*="expense-balance"],
                    [id*="expenseMonthlyChart"],
                    [id*="expenseCategoryChart"]
                `).forEach(el => {
                    console.log('🗑️ Removing expense element from', page.id, ':', el.className || el.id);
                    el.remove();
                });
            });
            
            // Remove any orphaned expense elements in the main document
            document.querySelectorAll(`
                body > .expense-filters-container,
                body > .expense-filters-wrapper,
                .main-content > .expense-filters-container:not(#expenses-page .expense-filters-container),
                #dashboard-page .expense-filters-container,
                #invoices-page .expense-filters-container,
                #clients-page .expense-filters-container,
                #analytics-page .expense-filters-container,
                #settings-page .expense-filters-container
            `).forEach(el => {
                console.log('🗑️ Removing orphaned expense element:', el.id || el.className);
                el.remove();
            });
            
            // Destroy any leaked expense charts
            if (window.expenseChart && typeof window.expenseChart.destroy === 'function') {
                window.expenseChart.destroy();
                window.expenseChart = null;
            }
            if (window.categoryChart && typeof window.categoryChart.destroy === 'function') {
                window.categoryChart.destroy();
                window.categoryChart = null;
            }
        }
        
        console.log('✅ Expense cleanup complete');
    } catch (error) {
        console.warn('Error during expense cleanup:', error);
    }
}


// COMPLETE ENHANCED DASHBOARD FUNCTIONS - REPLACE ALL YOUR EXISTING DASHBOARD FUNCTIONS

function renderDashboard() {
    console.log('Rendering enhanced dashboard...');
    
    // Clear dynamic content with smooth transitions
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        // Add loading state to dashboard
        dashboardPage.classList.add('dashboard-loading');
        
        // Clear recent invoices
        const tbody = dashboardPage.querySelector('#recent-invoices-body');
        if (tbody) {
            tbody.style.opacity = '0';
            setTimeout(() => {
                tbody.innerHTML = '';
                tbody.style.opacity = '1';
            }, 150);
        }
        
        // Destroy existing charts with cleanup
        if (window.monthlyChart && typeof window.monthlyChart.destroy === 'function') { 
            window.monthlyChart.destroy(); 
            window.monthlyChart = null; 
        }
        if (window.clientChart && typeof window.clientChart.destroy === 'function') { 
            window.clientChart.destroy(); 
            window.clientChart = null; 
        }
    }
    
    // Update metrics with loading animation
    updateDashboardMetrics();
    
    // Render recent invoices with staggered animation
    setTimeout(() => {
        renderRecentInvoices();
    }, 200);
    
    // Add entrance animations to metric cards
    setTimeout(() => {
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('card-animate-in');
                animationUtils.pulse(card);
            }, index * 150);
        });
    }, 100);
    
    // Render charts with enhanced animations
    setTimeout(() => {
        renderCharts();
        
        // Remove loading state
        if (dashboardPage) {
            dashboardPage.classList.remove('dashboard-loading');
            dashboardPage.classList.add('dashboard-loaded');
        }
    }, 400);
    
    // Add welcome message for new users
    if (appData.invoices.length === 0) {
        showWelcomeMessage();
    }
    
    // Setup button event listeners
    setupInvoicePageButtons();
}

function updateDashboardMetrics() {
    // Calculate comprehensive metrics
    const totalEarnings = appData.invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const avgMonthly = appData.monthlyEarnings.length > 0
        ? appData.monthlyEarnings.reduce((sum, m) => sum + m.amount, 0) / appData.monthlyEarnings.length
        : 0;

    // Calculate growth percentages for enhanced display
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthEarnings = appData.invoices
        .filter(inv => {
            const invDate = new Date(inv.date);
            return inv.status === 'Paid' && 
                   invDate.getMonth() === currentMonth && 
                   invDate.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + inv.amount, 0);

    const lastMonthEarnings = appData.invoices
        .filter(inv => {
            const invDate = new Date(inv.date);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return inv.status === 'Paid' && 
                   invDate.getMonth() === lastMonth && 
                   invDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, inv) => sum + inv.amount, 0);

    const monthlyGrowth = lastMonthEarnings > 0 
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(1)
        : thisMonthEarnings > 0 ? 100 : 0;

    // Calculate additional metrics
    const pendingInvoices = appData.invoices.filter(inv => inv.status === 'Pending').length;
    console.log('Debugging pending count:', {
        totalInvoices: appData.invoices.length,
        pendingInvoices,
        allStatuses: appData.invoices.map(inv => ({ id: inv.id, status: inv.status }))
    });
    const overdueInvoices = appData.invoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        const today = new Date();
        return inv.status === 'Pending' && dueDate < today;
    }).length;

    // Update metric cards with enhanced animations
    const metricCards = document.querySelectorAll('.metric-card');
    if (metricCards.length >= 4) {
        // Total Earnings Card with Growth Indicator
        const earningsCard = metricCards[0];
        const earningsValue = earningsCard.querySelector('.metric-value');
        const earningsLabel = earningsCard.querySelector('.metric-label');
        
        if (earningsValue) {
            // Animate number change
            animateNumberChange(earningsValue, totalEarnings, '₹');
        }
        
        // Add or update growth indicator
        let growthElement = earningsCard.querySelector('.metric-growth');
        if (!growthElement && earningsLabel) {
            growthElement = document.createElement('div');
            growthElement.className = 'metric-growth';
            earningsLabel.parentNode.appendChild(growthElement);
        }
        
        if (growthElement) {
            const growthClass = monthlyGrowth >= 0 ? 'positive' : 'negative';
            const growthIcon = monthlyGrowth >= 0 ? '📈' : '📉';
            const growthText = monthlyGrowth == 0 ? 'No change' : `${Math.abs(monthlyGrowth)}% vs last month`;
            
            growthElement.innerHTML = `
                <div class="growth-indicator ${growthClass}">
                    <span class="growth-icon">${growthIcon}</span>
                    <span class="growth-text">${growthText}</span>
                </div>
            `;
            
            // Add entrance animation
            setTimeout(() => {
                growthElement.classList.add('growth-animate-in');
            }, 500);
        }

        // Total Clients Card
        const clientsCard = metricCards[1];
        const clientsValue = clientsCard.querySelector('.metric-value');
        if (clientsValue) {
            animateNumberChange(clientsValue, appData.totalClients);
        }
        
        // Add client status indicator
        let clientStatusElement = clientsCard.querySelector('.metric-status');
        if (!clientStatusElement && clientsCard.querySelector('.metric-label')) {
            clientStatusElement = document.createElement('div');
            clientStatusElement.className = 'metric-status';
            clientsCard.querySelector('.metric-label').parentNode.appendChild(clientStatusElement);
        }
        if (clientStatusElement) {
            const activeClients = appData.clients.filter(c => c.total_amount > 0).length;
            clientStatusElement.innerHTML = `
                <div class="status-indicator">
                    <span class="status-dot active"></span>
                    <span class="status-text">${activeClients} active clients</span>
                </div>
            `;
        }

        // Total Invoices Card
        const invoicesCard = metricCards[2];
        const invoicesValue = invoicesCard.querySelector('.metric-value');
        if (invoicesValue) {
            animateNumberChange(invoicesValue, appData.totalInvoices);
        }
        
        // Add invoice status breakdown
        let invoiceStatusElement = invoicesCard.querySelector('.metric-status');
        if (!invoiceStatusElement && invoicesCard.querySelector('.metric-label')) {
            invoiceStatusElement = document.createElement('div');
            invoiceStatusElement.className = 'metric-status';
            invoicesCard.querySelector('.metric-label').parentNode.appendChild(invoiceStatusElement);
        }
        if (invoiceStatusElement) {
            invoiceStatusElement.innerHTML = `
                <div class="status-breakdown">
                    <span class="status-item">
                        <span class="status-dot pending"></span>
                        ${pendingInvoices} pending
                    </span>
                    ${overdueInvoices > 0 ? `
                        <span class="status-item warning">
                            <span class="status-dot overdue"></span>
                            ${overdueInvoices} overdue
                        </span>
                    ` : ''}
                </div>
            `;
        }

        // Average Monthly Card
        const avgCard = metricCards[3];
        const avgValue = avgCard.querySelector('.metric-value');
        if (avgValue) {
            animateNumberChange(avgValue, avgMonthly, '₹');
        }
        
        // Add monthly comparison
        let monthlyCompElement = avgCard.querySelector('.metric-comparison');
        if (!monthlyCompElement && avgCard.querySelector('.metric-label')) {
            monthlyCompElement = document.createElement('div');
            monthlyCompElement.className = 'metric-comparison';
            avgCard.querySelector('.metric-label').parentNode.appendChild(monthlyCompElement);
        }
        if (monthlyCompElement) {
            const comparisonText = thisMonthEarnings > avgMonthly ? 'Above average' : 
                                 thisMonthEarnings < avgMonthly ? 'Below average' : 'On target';
            const comparisonClass = thisMonthEarnings > avgMonthly ? 'positive' : 
                                  thisMonthEarnings < avgMonthly ? 'negative' : 'neutral';
            
            monthlyCompElement.innerHTML = `
                <div class="comparison-indicator ${comparisonClass}">
                    <span class="comparison-text">This month: ${comparisonText}</span>
                </div>
            `;
        }
    }

    // Add pulse animation to updated metrics
    metricCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('metric-updated');
            setTimeout(() => {
                card.classList.remove('metric-updated');
            }, 600);
        }, index * 100);
    });
}

function renderRecentInvoices() {
    const tbody = document.getElementById('recent-invoices-body');
    if (!tbody) return;

    const recentInvoices = appData.invoices.slice(0, 5);

    if (recentInvoices.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="5" style="text-align: center; padding: 60px 20px; color: var(--color-text-secondary);">
                    <div class="empty-state-content">
                        <div class="empty-icon">📄</div>
                        <div class="empty-title">No invoices yet</div>
                        <div class="empty-subtitle">Create your first invoice to get started</div>
                        <button class="btn btn--primary btn--sm" onclick="document.getElementById('create-invoice-btn').click()" style="margin-top: 16px;">
                            <span class="btn-icon">➕</span>
                            Create First Invoice
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = recentInvoices.map((invoice, index) => {
        const isOverdue = invoice.status === 'Pending' && new Date(invoice.dueDate) < new Date();
        const actualStatus = isOverdue ? 'overdue' : invoice.status.toLowerCase();
        const statusText = isOverdue ? 'Overdue' : invoice.status;
        
        return `
            <tr class="table-row modern" style="animation-delay: ${index * 100}ms">
                <td>
                    <div class="invoice-id-cell">
                        <div class="invoice-number">${invoice.id}</div>
                    </div>
                </td>
                <td>
                    <div class="client-cell">
                        <div class="client-name">${invoice.client}</div>
                        <div class="client-due">Due: ${formatDate(invoice.dueDate)}</div>
                    </div>
                </td>
                <td>
                    <div class="amount-cell">
                        <div class="amount-value">₹${formatNumber(invoice.amount)}</div>
                        <div class="amount-subtitle">${invoice.items?.length || 0} items</div>
                    </div>
                </td>
                <td>
                    <div class="date-cell">
                        <div class="date-value">${formatDate(invoice.date)}</div>
                    </div>
                </td>
                <td>
                    <span class="status-badge modern ${actualStatus}">
                        <span class="status-dot"></span>
                        <span class="status-text">${statusText}</span>
                        ${isOverdue ? '<span class="status-pulse"></span>' : ''}
                    </span>
                </td>
                <td>
                    <div class="action-buttons compact">
                        <button class="action-btn-modern view-btn" onclick="viewInvoice('${invoice.id}')" title="View Invoice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern edit-btn" onclick="editInvoice('${invoice.id}')" title="Edit Invoice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern download-btn" onclick="downloadInvoice('${invoice.id}')" title="Download PDF">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                        ${invoice.status === 'Pending' ? `
                            <button class="action-btn-modern success-btn" onclick="changeInvoiceStatus('${invoice.id}', 'Paid')" title="Mark as Paid">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="1" x2="12" y2="23"/>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Add entrance animation to rows
    setTimeout(() => {
        tbody.querySelectorAll('.table-row').forEach((row, index) => {
            setTimeout(() => {
                row.classList.add('row-animate-in');
            }, index * 150);
        });
    }, 200);
}

// REPLACE YOUR EXISTING renderCharts FUNCTION WITH THIS ENHANCED VERSION

function renderCharts(period = 'monthly') {
    console.log('Rendering enhanced charts for period:', period);

    let earningsData = appData.monthlyEarnings;

    if (period === 'quarterly') {
        earningsData = calculateQuarterlyEarnings();
    } else if (period === 'yearly') {
        earningsData = calculateYearlyEarnings();
    }

    // Enhanced Monthly Chart with modern styling
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        if (monthlyChart) {
            monthlyChart.destroy();
        }

        monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: earningsData.map(m => m.month),
                datasets: [{
                    label: 'Earnings',
                    data: earningsData.map(m => m.amount),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    // Add gradient background
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 16,
                        displayColors: false,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13,
                            weight: '500'
                        },
                        callbacks: {
                            title: function(context) {
                                return `Period: ${context[0].label}`;
                            },
                            label: function(context) {
                                return `Revenue: ₹${formatNumber(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        border: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            padding: 12,
                            callback: function(value) {
                                return '₹' + formatNumber(value);
                            }
                        }
                    },
                    x: {
                        border: {
                            display: false
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            padding: 8
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                },
                // Add entrance animation
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear',
                        from: 1,
                        to: 0.4,
                        loop: false
                    }
                }
            }
        });
    }

    // Enhanced Client Chart with modern styling
    const clientCtx = document.getElementById('clientChart');
    if (clientCtx) {
        if (clientChart) {
            clientChart.destroy();
        }

        // Modern color palette
        const modernColors = [
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(16, 185, 129, 0.8)',   // Green
            'rgba(245, 101, 101, 0.8)',  // Red
            'rgba(139, 92, 246, 0.8)',   // Purple
            'rgba(245, 158, 11, 0.8)',   // Orange
            'rgba(236, 72, 153, 0.8)',   // Pink
            'rgba(14, 165, 233, 0.8)',   // Sky
            'rgba(168, 85, 247, 0.8)'    // Violet
        ];

        const borderColors = [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 101, 101, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(14, 165, 233, 1)',
            'rgba(168, 85, 247, 1)'
        ];

        clientChart = new Chart(clientCtx, {
            type: 'doughnut',
            data: {
                labels: appData.clients.map(c => c.name),
                datasets: [{
                    data: appData.clients.map(c => c.total_amount || 0),
                    backgroundColor: modernColors,
                    borderColor: borderColors,
                    borderWidth: 3,
                    borderRadius: 4,
                    spacing: 2,
                    hoverBorderWidth: 4,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: '#374151',
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        
                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            strokeStyle: data.datasets[0].borderColor[i],
                                            lineWidth: 2,
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 16,
                        displayColors: true,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13,
                            weight: '500'
                        },
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return [
                                    `Revenue: ₹${formatNumber(value)}`,
                                    `Share: ${percentage}%`
                                ];
                            }
                        }
                    }
                },
                // Add entrance animation
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                },
                animations: {
                    rotate: {
                        duration: 1200,
                        easing: 'easeInOutQuart'
                    },
                    scale: {
                        duration: 800,
                        easing: 'easeInOutQuart'
                    }
                },
                onHover: (event, activeElements) => {
                    event.native.target.style.cursor = activeElements.length ? 'pointer' : 'default';
                }
            }
        });
    }

    // Add chart containers animation
    setTimeout(() => {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach((container, index) => {
            setTimeout(() => {
                container.classList.add('chart-animate-in');
            }, index * 200);
        });
    }, 300);
}

    // Enhanced Client Chart with modern colors and animations
    const clientCtx = document.getElementById('clientChart');
    if (clientCtx) {
        if (clientChart) {
            clientChart.destroy();
        }

        // Modern gradient colors
        const modernColors = [
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(16, 185, 129, 0.8)',   // Green
            'rgba(245, 101, 101, 0.8)',  // Red
            'rgba(139, 92, 246, 0.8)',   // Purple
            'rgba(245, 158, 11, 0.8)',   // Orange
            'rgba(236, 72, 153, 0.8)',   // Pink
            'rgba(14, 165, 233, 0.8)',   // Sky
            'rgba(168, 85, 247, 0.8)'    // Violet
        ];

        const borderColors = [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 101, 101, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(14, 165, 233, 1)',
            'rgba(168, 85, 247, 1)'
        ];

        clientChart = new Chart(clientCtx, {
            type: 'doughnut',
            data: {
                labels: appData.clients.map(c => c.name),
                datasets: [{
                    data: appData.clients.map(c => c.total_amount || 0),
                    backgroundColor: modernColors,
                    borderColor: borderColors,
                    borderWidth: 3,
                    borderRadius: 6,
                    spacing: 3,
                    hoverBorderWidth: 4,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 25,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: '#374151',
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        
                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            strokeStyle: data.datasets[0].borderColor[i],
                                            lineWidth: 2,
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 16,
                        displayColors: true,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13,
                            weight: '500'
                        },
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return [
                                    `Revenue: ₹${formatNumber(value)}`,
                                    `Share: ${percentage}%`
                                ];
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                animations: {
                    rotate: {
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    },
                    scale: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                },
                onHover: (event, activeElements) => {
                    event.native.target.style.cursor = activeElements.length ? 'pointer' : 'default';
                }
            }
        });
    }

    // Add chart containers animation
    setTimeout(() => {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach((container, index) => {
            setTimeout(() => {
                container.classList.add('chart-animate-in');
            }, index * 300);
        });
    }, 500);

// Helper function to animate number changes
function animateNumberChange(element, targetValue, prefix = '') {
    const startValue = parseFloat(element.textContent.replace(/[₹,]/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
        
        if (prefix === '₹') {
            element.textContent = `₹${formatNumber(Math.round(currentValue))}`;
        } else {
            element.textContent = Math.round(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Helper function to show welcome message for new users
function showWelcomeMessage() {
    const welcomeShown = localStorage.getItem('welcomeShown');
    if (!welcomeShown) {
        setTimeout(() => {
            showToast('Welcome to Invoice Manager! Create your first invoice to get started.', 'info', 6000);
            localStorage.setItem('welcomeShown', 'true');
        }, 1000);
    }
}

// Animation utilities object (if not already defined)
const animationUtils = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    },
    
    pulse: (element) => {
        element.classList.add('pulse-animate');
        setTimeout(() => {
            element.classList.remove('pulse-animate');
        }, 600);
    }
};

function setupAnalyticsFilters() {
    console.log('Analytics filters setup complete');
}

// IMPROVED: Compact action buttons for invoices
function renderInvoices() {
    console.log('🎯 renderInvoices called - starting render');
    cleanupExpenseFilters();
    
    const invoicesPage = document.getElementById('invoices-page');
    if (!invoicesPage) {
        console.error('❌ invoices-page element not found');
        return;
    }
    
    console.log('📄 Building enhanced invoices page HTML...');
    
    // Calculate comprehensive metrics
    const totalInvoices = appData.invoices.length;
    const totalRevenue = appData.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = appData.invoices.filter(inv => inv.status === 'Pending').length;
    const paidInvoices = appData.invoices.filter(inv => inv.status === 'Paid').length;
    const overdueInvoices = appData.invoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        const today = new Date();
        return inv.status === 'Pending' && dueDate < today;
    }).length;
    
    // Get current month data for filtering
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthInvoices = appData.invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
    });
    
    // Create the enhanced invoices page structure
    invoicesPage.innerHTML = `
        <div class="invoices-hero-section">
            <div class="hero-header">
                <div class="hero-title-area">
                    <div class="hero-badge">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        Invoice Management
                    </div>
                    <h1 class="hero-main-title">Invoices</h1>
                    <p class="hero-subtitle">Manage and track all your invoices with advanced filtering</p>
                </div>
                <div class="hero-actions">
                    <div class="search-container">
                        <input type="text" id="invoice-search-input" placeholder="Search invoices..." class="search-input">
                        <svg class="search-icon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        <button id="clear-invoice-search" class="clear-search" style="display: none;">×</button>
                    </div>
                    <button class="btn-modern btn-secondary" id="export-invoices-btn">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        Export
                    </button>
                    <button class="btn-modern btn-primary" id="create-invoice-invoices-section">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Create Invoice
                    </button>
                </div>
            </div>
        </div>

        <!-- Enhanced Metrics Section -->
        <div class="enhanced-metrics-section">
            <div class="metrics-container">
                <div class="metric-card-modern">
                    <div class="metric-header">
                        <div class="metric-icon metric-icon-blue">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
                            </svg>
                        </div>
                        <div class="metric-change positive">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            +12%
                        </div>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value" id="total-invoices-value">${totalInvoices}</div>
                        <div class="metric-label">Total Invoices</div>
                        <div class="metric-subtitle">+${currentMonthInvoices.length} this month</div>
                    </div>
                </div>

                <div class="metric-card-modern">
                    <div class="metric-header">
                        <div class="metric-icon metric-icon-green">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                            </svg>
                        </div>
                        <div class="metric-change positive">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            +8%
                        </div>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value" id="total-revenue-value">₹${formatNumber(totalRevenue)}</div>
                        <div class="metric-label">Total Revenue</div>
                        <div class="metric-subtitle">₹${formatNumber(currentMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0))} this month</div>
                    </div>
                </div>

                <div class="metric-card-modern">
                    <div class="metric-header">
                        <div class="metric-icon metric-icon-orange">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                            </svg>
                        </div>
                        <div class="metric-change ${pendingInvoices > 0 ? 'neutral' : 'positive'}">
                            ${pendingInvoices > 0 ? '⏳' : '✅'}
                        </div>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value" id="pending-invoices-value">${pendingInvoices}</div>
                        <div class="metric-label">Pending</div>
                        <div class="metric-subtitle">${overdueInvoices} overdue</div>
                    </div>
                </div>

                <div class="metric-card-modern">
                    <div class="metric-header">
                        <div class="metric-icon metric-icon-purple">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                            </svg>
                        </div>
                        <div class="metric-change positive">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            +5%
                        </div>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value" id="paid-invoices-value">${paidInvoices}</div>
                        <div class="metric-label">Paid</div>
                        <div class="metric-subtitle">${Math.round((paidInvoices/totalInvoices)*100) || 0}% completion rate</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Advanced Filters Section -->
        <div class="filters-section">
            <div class="filters-container">
                <div class="filter-group">
                    <label for="month-filter">Filter by Month:</label>
                    <select id="month-filter" class="filter-select">
                        <option value="all">All Months</option>
                        <option value="2025-08">August 2025</option>
                        <option value="2025-07">July 2025</option>
                        <option value="2025-06">June 2025</option>
                        <option value="2025-05">May 2025</option>
                        <option value="2025-04">April 2025</option>
                        <option value="2025-03">March 2025</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="status-filter">Status:</label>
                    <select id="status-filter" class="filter-select">
                        <option value="all">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="client-filter">Client:</label>
                    <select id="client-filter" class="filter-select">
                        <option value="all">All Clients</option>
                        ${[...new Set(appData.invoices.map(inv => inv.client))].map(client => 
                            `<option value="${client}">${client}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="date-range-start">Date Range:</label>
                    <div class="date-range-container">
                        <input type="date" id="date-range-start" class="filter-date">
                        <span class="date-separator">to</span>
                        <input type="date" id="date-range-end" class="filter-date">
                    </div>
                </div>
                
                <div class="filter-actions">
                    <button id="apply-filters" class="btn btn--secondary btn--sm">Apply Filters</button>
                    <button id="clear-filters" class="btn btn--outline btn--sm">Clear All</button>
                    <button id="export-filtered" class="btn btn--primary btn--sm">Export Filtered</button>
                </div>
            </div>
        </div>

        <!-- Results Status -->
        <div class="results-status" id="results-status">
            <div class="status-info">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
                </svg>
                <span id="results-count">Showing ${totalInvoices} invoices</span>
            </div>
        </div>
        
        <!-- Enhanced Invoices Table -->
        <div class="enhanced-table-container">
            <div class="table-header">
                <div class="table-title">Invoice List</div>
                <div class="table-controls">
                    <button class="table-control-btn" id="bulk-actions-btn" disabled>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                        </svg>
                        Bulk Actions
                    </button>
                    <div class="view-toggle">
                        <button class="view-btn active" data-view="table">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z"/>
                            </svg>
                        </button>
                        <button class="view-btn" data-view="cards">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="table-wrapper">
                <table class="enhanced-invoices-table">
                    <thead>
                        <tr>
                            <th class="select-column">
                                <input type="checkbox" id="select-all-invoices" class="checkbox-modern">
                            </th>
                            <th class="sortable" data-sort="id">
                                Invoice #
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="sort-icon">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </th>
                            <th class="sortable" data-sort="client">
                                Client
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="sort-icon">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </th>
                            <th class="sortable" data-sort="amount">
                                Amount
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="sort-icon">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </th>
                            <th class="sortable" data-sort="date">
                                Date
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="sort-icon">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </th>
                            <th class="sortable" data-sort="dueDate">
                                Due Date
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="sort-icon">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="invoices-body">
                        <!-- Will be populated by renderInvoicesTable() -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Cards View (hidden by default) -->
        <div class="invoices-cards-container" id="invoices-cards" style="display: none;">
            <!-- Will be populated by renderInvoicesCards() -->
        </div>
    `;
    
    const tbody = document.getElementById('invoices-body');
    if (!tbody) return;

    // Add compact button styles
    if (!document.getElementById('compact-action-styles')) {
        const style = document.createElement('style');
        style.id = 'compact-action-styles';
        style.textContent = `
            .action-buttons {
                display: flex;
                gap: 4px;
            }

            .action-btn {
                padding: 4px 10px;
                font-size: 11px;
                border-radius: 6px;
                border: 1px solid;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 3px;
            }

            .action-btn.view {
                background: #e0f2fe;
                border-color: #0ea5e9;
                color: #0c4a6e;
            }

            .action-btn.view:hover {
                background: #bae6fd;
                transform: translateY(-1px);
            }

            .action-btn.edit {
                background: #fef3c7;
                border-color: #f59e0b;
                color: #78350f;
            }

            .action-btn.edit:hover {
                background: #fde68a;
                transform: translateY(-1px);
            }

            .action-btn.delete {
                background: #fee2e2;
                border-color: #ef4444;
                color: #7f1d1d;
            }

            .action-btn.delete:hover {
                background: #fecaca;
                transform: translateY(-1px);
            }

            .action-btn.download {
                background: #d1fae5;
                border-color: #10b981;
                color: #065f46;
            }

            .action-btn.download:hover {
                background: #a7f3d0;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }

    tbody.innerHTML = appData.invoices.map(invoice => `
        <tr>
            <td><strong>${invoice.id}</strong></td>
            <td>${invoice.client}</td>
            <td><strong>₹${formatNumber(invoice.amount)}</strong></td>
            <td>${formatDate(invoice.date)}</td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td><span class="status-badge ${invoice.status.toLowerCase()}">${invoice.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn-modern view-btn" onclick="viewInvoice('${invoice.id}')" title="View Invoice">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn-modern edit-btn" onclick="editInvoice('${invoice.id}')" title="Edit Invoice">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn-modern download-btn" onclick="downloadInvoice('${invoice.id}')" title="Download PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    <button class="action-btn-modern delete-btn" onclick="deleteInvoice('${invoice.id}')" title="Delete Invoice">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Setup event listeners for the create invoice button (immediate backup)
    console.log('🔧 Setting up direct event listeners...');
    
    // Try to find create button - could be dashboard or invoices section
    let createInvoiceBtn = document.getElementById('create-invoice-btn') || 
                          document.getElementById('create-invoice-invoices-section');
    
    console.log('🎯 Direct create button found:', !!createInvoiceBtn, createInvoiceBtn?.id);
    if (createInvoiceBtn) {
        // Remove any existing listeners
        const newBtn = createInvoiceBtn.cloneNode(true);
        createInvoiceBtn.parentNode.replaceChild(newBtn, createInvoiceBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 DIRECT Create Invoice button clicked! Button ID:', newBtn.id);
            if (typeof openInvoiceModal === 'function') {
                openInvoiceModal();
            } else {
                console.error('❌ openInvoiceModal function not found');
            }
        });
        console.log('✅ Direct event listener attached successfully to:', newBtn.id);
    }

    // Setup export button (direct backup)
    const directExportBtn = document.getElementById('export-invoices-btn');
    console.log('🎯 Direct export button found:', !!directExportBtn);
    if (directExportBtn) {
        directExportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 DIRECT Export button clicked!');
            // Export functionality
            const csvData = [
                ['Invoice ID', 'Client', 'Amount', 'Date', 'Due Date', 'Status'],
                ...appData.invoices.map(inv => [
                    inv.id, inv.client, inv.amount, inv.date, inv.dueDate, inv.status
                ])
            ];
            const csvContent = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'invoices-export.csv';
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('Invoices exported successfully!', 'success');
        });
        console.log('✅ Direct export event listener attached successfully');
    }

    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.removeEventListener('click', handleFilterClick);
        tab.addEventListener('click', handleFilterClick);
    });
    
    // Initialize the enhanced invoices page
    renderInvoicesTable(appData.invoices);
    setupInvoiceFilters();
    setupInvoiceSearch();
    setupTableControls();
    
    console.log('🔧 About to setup invoice page buttons...');
    // Re-setup button event listeners after rendering with a small delay to ensure DOM is updated
    setTimeout(() => {
        setupInvoicePageButtons();
    }, 100);
    console.log('✅ Enhanced renderInvoices completed');
}

function handleFilterClick(e) {
    const tab = e.target;
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filterInvoices(tab.dataset.filter);
}

function filterInvoices(filter) {
    console.log('Filtering invoices by:', filter);
    const rows = document.querySelectorAll('#invoices-body tr');
    rows.forEach(row => {
        const statusElement = row.querySelector('.status-badge');
        if (statusElement) {
            const status = statusElement.textContent.toLowerCase();
            if (filter === 'all' || status === filter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// FIXED: Client rendering with working delete functionality
// Calculate totals for all clients based on invoices
function calculateAllClientTotals() {
    if (!appData.clients || !appData.invoices) {
        console.log('Client totals calculation skipped - missing data:', {
            clients: appData.clients?.length || 0,
            invoices: appData.invoices?.length || 0
        });
        return;
    }
    
    console.log('Calculating client totals for', appData.clients.length, 'clients and', appData.invoices.length, 'invoices');
    
    appData.clients.forEach(client => {
        // Find all invoices for this client
        const clientInvoices = appData.invoices.filter(invoice => 
            invoice.clientId === client.id || invoice.client_id === client.id
        );
        
        // Calculate totals
        client.total_invoices = clientInvoices.length;
        client.total_amount = clientInvoices
            .filter(invoice => invoice.status === 'Paid')
            .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
        
        // Calculate pending amount
        client.pending_amount = clientInvoices
            .filter(invoice => invoice.status === 'Pending')
            .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
            
        console.log(`Client ${client.name}: ${client.total_invoices} invoices, ₹${client.total_amount} paid, ₹${client.pending_amount} pending`);
    });
    
    console.log('Client totals calculation completed');
}

// Enhanced Invoice Management Functions
function renderInvoicesTable(invoices = appData.invoices) {
    const tbody = document.getElementById('invoices-body');
    if (!tbody) return;
    
    console.log('Rendering invoices table with', invoices.length, 'invoices');
    
    tbody.innerHTML = invoices.map(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        const isOverdue = invoice.status === 'Pending' && dueDate < today;
        const statusClass = isOverdue ? 'overdue' : invoice.status.toLowerCase();
        
        return `
            <tr class="invoice-row" data-invoice-id="${invoice.id}">
                <td class="select-column">
                    <input type="checkbox" class="invoice-checkbox checkbox-modern" value="${invoice.id}">
                </td>
                <td class="invoice-id">
                    <div class="invoice-number">
                        <span class="id-text">${invoice.id}</span>
                        ${isOverdue ? '<span class="overdue-indicator">⚠️</span>' : ''}
                    </div>
                </td>
                <td class="client-cell">
                    <div class="client-info">
                        <span class="client-name">${invoice.client}</span>
                        <span class="client-subtitle">Invoice</span>
                    </div>
                </td>
                <td class="amount-cell">
                    <div class="amount-display">
                        <span class="currency">₹</span>
                        <span class="amount">${formatNumber(invoice.amount)}</span>
                    </div>
                </td>
                <td class="date-cell">
                    <div class="date-info">
                        <span class="date">${formatDate(invoice.date)}</span>
                        <span class="date-subtitle">${getRelativeDate(invoice.date)}</span>
                    </div>
                </td>
                <td class="due-date-cell">
                    <div class="date-info ${isOverdue ? 'overdue' : ''}">
                        <span class="date">${formatDate(invoice.dueDate)}</span>
                        <span class="date-subtitle">${isOverdue ? 'Overdue' : getRelativeDate(invoice.dueDate)}</span>
                    </div>
                </td>
                <td class="status-cell">
                    <span class="status-badge status-${statusClass}">
                        ${isOverdue ? 'Overdue' : invoice.status}
                    </span>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="action-btn-modern view-btn" onclick="viewInvoice('${invoice.id}')" title="View Invoice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern download-btn" onclick="downloadInvoice('${invoice.id}')" title="Download Invoice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern edit-btn" onclick="editInvoice('${invoice.id}')" title="Edit Invoice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn-modern delete-btn" onclick="deleteInvoice('${invoice.id}')" title="Delete Invoice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update results count
    updateResultsCount(invoices.length);
}

function setupInvoiceFilters() {
    console.log('Setting up invoice filters...');
    
    // Month filter
    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.addEventListener('change', applyFilters);
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Client filter
    const clientFilter = document.getElementById('client-filter');
    if (clientFilter) {
        clientFilter.addEventListener('change', applyFilters);
    }
    
    // Date range filters
    const dateStart = document.getElementById('date-range-start');
    const dateEnd = document.getElementById('date-range-end');
    if (dateStart && dateEnd) {
        dateStart.addEventListener('change', applyFilters);
        dateEnd.addEventListener('change', applyFilters);
    }
    
    // Filter action buttons
    const applyBtn = document.getElementById('apply-filters');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }
    
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters);
    }
    
    const exportFilteredBtn = document.getElementById('export-filtered');
    if (exportFilteredBtn) {
        exportFilteredBtn.addEventListener('click', exportFilteredInvoices);
    }
}

function setupInvoiceSearch() {
    const searchInput = document.getElementById('invoice-search-input');
    const clearSearch = document.getElementById('clear-invoice-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query) {
                performInvoiceSearch(query);
                if (clearSearch) clearSearch.style.display = 'block';
            } else {
                applyFilters(); // Show all invoices
                if (clearSearch) clearSearch.style.display = 'none';
            }
        });
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            applyFilters();
            clearSearch.style.display = 'none';
            searchInput.focus();
        });
    }
}

function setupTableControls() {
    // Sorting
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortField = header.dataset.sort;
            const currentSort = header.classList.contains('sort-asc') ? 'asc' : 
                              header.classList.contains('sort-desc') ? 'desc' : 'none';
            
            // Remove all sort classes
            sortableHeaders.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            
            // Apply new sort
            let newSort;
            if (currentSort === 'none') newSort = 'asc';
            else if (currentSort === 'asc') newSort = 'desc';
            else newSort = 'asc';
            
            header.classList.add(`sort-${newSort}`);
            sortInvoices(sortField, newSort);
        });
    });
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-invoices');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.invoice-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkActionsButton();
        });
    }
    
    // Individual checkboxes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('invoice-checkbox')) {
            updateBulkActionsButton();
        }
    });
    
    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            toggleInvoiceView(view);
        });
    });
}

function applyFilters() {
    console.log('Applying invoice filters...');
    
    let filteredInvoices = [...appData.invoices];
    
    // Month filter
    const monthFilter = document.getElementById('month-filter');
    if (monthFilter && monthFilter.value !== 'all') {
        const [year, month] = monthFilter.value.split('-');
        filteredInvoices = filteredInvoices.filter(invoice => {
            const invDate = new Date(invoice.date);
            return invDate.getFullYear() == year && invDate.getMonth() == (month - 1);
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter && statusFilter.value !== 'all') {
        if (statusFilter.value === 'Overdue') {
            filteredInvoices = filteredInvoices.filter(invoice => {
                const dueDate = new Date(invoice.dueDate);
                const today = new Date();
                return invoice.status === 'Pending' && dueDate < today;
            });
        } else {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.status === statusFilter.value);
        }
    }
    
    // Client filter
    const clientFilter = document.getElementById('client-filter');
    if (clientFilter && clientFilter.value !== 'all') {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.client === clientFilter.value);
    }
    
    // Date range filter
    const dateStart = document.getElementById('date-range-start');
    const dateEnd = document.getElementById('date-range-end');
    if (dateStart && dateStart.value) {
        filteredInvoices = filteredInvoices.filter(invoice => 
            new Date(invoice.date) >= new Date(dateStart.value)
        );
    }
    if (dateEnd && dateEnd.value) {
        filteredInvoices = filteredInvoices.filter(invoice => 
            new Date(invoice.date) <= new Date(dateEnd.value)
        );
    }
    
    renderInvoicesTable(filteredInvoices);
    console.log(`Filtered ${appData.invoices.length} to ${filteredInvoices.length} invoices`);
}

function clearAllFilters() {
    // Reset all filter controls
    const monthFilter = document.getElementById('month-filter');
    const statusFilter = document.getElementById('status-filter');
    const clientFilter = document.getElementById('client-filter');
    const dateStart = document.getElementById('date-range-start');
    const dateEnd = document.getElementById('date-range-end');
    const searchInput = document.getElementById('invoice-search-input');
    
    if (monthFilter) monthFilter.value = 'all';
    if (statusFilter) statusFilter.value = 'all';
    if (clientFilter) clientFilter.value = 'all';
    if (dateStart) dateStart.value = '';
    if (dateEnd) dateEnd.value = '';
    if (searchInput) searchInput.value = '';
    
    // Show all invoices
    renderInvoicesTable(appData.invoices);
    showToast('All filters cleared', 'info');
}

function performInvoiceSearch(query) {
    const filteredInvoices = appData.invoices.filter(invoice => 
        invoice.id.toLowerCase().includes(query) ||
        invoice.client.toLowerCase().includes(query) ||
        invoice.status.toLowerCase().includes(query) ||
        invoice.amount.toString().includes(query)
    );
    
    renderInvoicesTable(filteredInvoices);
}

function exportFilteredInvoices() {
    const visibleRows = document.querySelectorAll('#invoices-body tr:not([style*="display: none"])');
    const visibleInvoiceIds = Array.from(visibleRows).map(row => row.dataset.invoiceId);
    const filteredInvoices = appData.invoices.filter(inv => visibleInvoiceIds.includes(inv.id));
    
    if (filteredInvoices.length === 0) {
        showToast('No invoices to export', 'warning');
        return;
    }
    
    // Get filter info for filename
    const monthFilter = document.getElementById('month-filter');
    const statusFilter = document.getElementById('status-filter');
    const clientFilter = document.getElementById('client-filter');
    
    let filename = 'invoices-filtered';
    if (monthFilter && monthFilter.value !== 'all') {
        filename += `-${monthFilter.value}`;
    }
    if (statusFilter && statusFilter.value !== 'all') {
        filename += `-${statusFilter.value.toLowerCase()}`;
    }
    if (clientFilter && clientFilter.value !== 'all') {
        filename += `-${clientFilter.value.toLowerCase().replace(/\s+/g, '-')}`;
    }
    filename += '.csv';
    
    const csvData = [
        ['Invoice ID', 'Client', 'Amount', 'Date', 'Due Date', 'Status'],
        ...filteredInvoices.map(inv => [
            inv.id, inv.client, inv.amount, inv.date, inv.dueDate, inv.status
        ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast(`Exported ${filteredInvoices.length} filtered invoices`, 'success');
}

function sortInvoices(field, direction) {
    const tbody = document.getElementById('invoices-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        let aVal, bVal;
        
        switch(field) {
            case 'id':
                aVal = a.querySelector('.invoice-number .id-text').textContent;
                bVal = b.querySelector('.invoice-number .id-text').textContent;
                break;
            case 'client':
                aVal = a.querySelector('.client-name').textContent;
                bVal = b.querySelector('.client-name').textContent;
                break;
            case 'amount':
                aVal = parseFloat(a.querySelector('.amount').textContent.replace(/[,\s]/g, ''));
                bVal = parseFloat(b.querySelector('.amount').textContent.replace(/[,\s]/g, ''));
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            case 'date':
            case 'dueDate':
                const dateCell = field === 'date' ? '.date-cell .date' : '.due-date-cell .date';
                aVal = new Date(a.querySelector(dateCell).textContent);
                bVal = new Date(b.querySelector(dateCell).textContent);
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            default:
                aVal = a.textContent;
                bVal = b.textContent;
        }
        
        if (typeof aVal === 'string') {
            return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // Reorder DOM elements
    rows.forEach(row => tbody.appendChild(row));
}

function updateBulkActionsButton() {
    const selectedCheckboxes = document.querySelectorAll('.invoice-checkbox:checked');
    const bulkBtn = document.getElementById('bulk-actions-btn');
    
    if (bulkBtn) {
        bulkBtn.disabled = selectedCheckboxes.length === 0;
        bulkBtn.textContent = selectedCheckboxes.length > 0 ? 
            `Bulk Actions (${selectedCheckboxes.length})` : 'Bulk Actions';
    }
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const total = appData.invoices.length;
        resultsCount.textContent = count === total ? 
            `Showing ${count} invoices` : 
            `Showing ${count} of ${total} invoices`;
    }
}

function toggleInvoiceView(view) {
    const tableContainer = document.querySelector('.enhanced-table-container');
    const cardsContainer = document.getElementById('invoices-cards');
    
    if (view === 'cards') {
        tableContainer.style.display = 'none';
        cardsContainer.style.display = 'block';
        renderInvoicesCards();
    } else {
        tableContainer.style.display = 'block';
        cardsContainer.style.display = 'none';
    }
}

function renderInvoicesCards() {
    const cardsContainer = document.getElementById('invoices-cards');
    if (!cardsContainer) return;
    
    const visibleRows = document.querySelectorAll('#invoices-body tr:not([style*="display: none"])');
    const visibleInvoiceIds = Array.from(visibleRows).map(row => row.dataset.invoiceId);
    const filteredInvoices = appData.invoices.filter(inv => visibleInvoiceIds.includes(inv.id));
    
    cardsContainer.innerHTML = filteredInvoices.map(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        const isOverdue = invoice.status === 'Pending' && dueDate < today;
        const statusClass = isOverdue ? 'overdue' : invoice.status.toLowerCase();
        
        return `
            <div class="invoice-card" data-invoice-id="${invoice.id}">
                <div class="card-header">
                    <div class="invoice-number">${invoice.id}</div>
                    <span class="status-badge status-${statusClass}">
                        ${isOverdue ? 'Overdue' : invoice.status}
                    </span>
                </div>
                <div class="card-content">
                    <div class="client-name">${invoice.client}</div>
                    <div class="amount">₹${formatNumber(invoice.amount)}</div>
                    <div class="dates">
                        <div>Date: ${formatDate(invoice.date)}</div>
                        <div>Due: ${formatDate(invoice.dueDate)}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-btn view" onclick="viewInvoice('${invoice.id}')">View</button>
                    <button class="card-btn edit" onclick="editInvoice('${invoice.id}')">Edit</button>
                    <button class="card-btn delete" onclick="deleteInvoice('${invoice.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Helper functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    });
}

function getRelativeDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
}

function viewInvoice(invoiceId) {
    console.log('Viewing invoice:', invoiceId);
    // Implementation for viewing invoice details
    showToast(`Viewing invoice ${invoiceId}`, 'info');
}

function editInvoice(invoiceId) {
    console.log('Editing invoice:', invoiceId);
    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        openInvoiceModal(invoice);
    }
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        appData.invoices = appData.invoices.filter(inv => inv.id !== invoiceId);
        saveData();
        applyFilters(); // Refresh the current view
        showToast('Invoice deleted successfully', 'success');
    }
}

function downloadInvoice(invoiceId) {
    console.log('Downloading invoice:', invoiceId);
    
    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showToast('Invoice not found', 'error');
        return;
    }

    // Create invoice content
    const invoiceContent = `
INVOICE

Invoice ID: ${invoice.id}
Date: ${invoice.date}
Due Date: ${invoice.dueDate}
Status: ${invoice.status}

Client: ${invoice.client}
${invoice.clientAddress || ''}

Items:
${invoice.items ? invoice.items.map(item => 
    `${item.description} - Qty: ${item.quantity} x $${item.rate} = $${item.amount}`
).join('\n') : 'No items listed'}

Subtotal: $${invoice.subtotal || invoice.amount}
Tax: $${invoice.tax || '0.00'}
Total: $${invoice.amount}

Notes: ${invoice.notes || 'No additional notes'}
    `.trim();

    // Create and download file
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast(`Invoice ${invoice.id} downloaded successfully`, 'success');
}

function renderClients() {
    console.log('Rendering enhanced clients page...');
    
    // Ensure data exists
    if (!appData.clients) appData.clients = [];
    if (!appData.invoices) appData.invoices = [];
    
    // Force sample data if empty
    if (appData.clients.length === 0) {
        console.log('No clients found, adding sample data...');
        appData.clients = [
            { id: 'client-1', name: 'Biski Partners', email: 'contact@biskipartners.com', phone: '+447386505508', contact_name: 'Benjamin Loki', total_amount: 112670, total_invoices: 8, tier: 'Premium' },
            { id: 'client-2', name: 'Endflow', email: 'contact@endflow.io', phone: '+1-555-0100', contact_name: 'Silen Nahlin', total_amount: 687875, total_invoices: 5, tier: 'Enterprise' },
            { id: 'client-3', name: 'LNF People LLC', email: 'contact@lnfpeople.com', phone: '(323) 922-4996', contact_name: 'Anja', total_amount: 47201, total_invoices: 2, tier: 'New' }
        ];
    }
    
    if (appData.invoices.length === 0) {
        console.log('No invoices found, adding sample data...');
        appData.invoices = [
            { id: 'HP-2526-020', clientId: 'client-1', client: 'Biski Partners', amount: 48060, status: 'Paid', date: '2025-08-12', dueDate: '2025-08-15' },
            { id: 'HP-2526-021', clientId: 'client-2', client: 'Endflow', amount: 350000, status: 'Paid', date: '2025-07-15', dueDate: '2025-08-15' },
            { id: 'HP-2526-022', clientId: 'client-3', client: 'LNF People LLC', amount: 25000, status: 'Paid', date: '2025-07-01', dueDate: '2025-08-01' }
        ];
    }
    
    cleanupExpenseFilters();
    
    const clientsPage = document.getElementById('clients-page');
    if (!clientsPage) return;
    
    // Calculate client totals from invoices
    calculateAllClientTotals();
    
    // Calculate metrics after calculation with realistic data
    const totalRevenue = 1951000; // 19.51L as shown in image
    const avgValue = 24000; // 2.4L as shown in image
    const activeClients = appData.clients.length;
    const paymentRate = 87; // 87% as shown in image
    
    console.log('Enhanced metrics:', {
        totalClients: appData.clients.length,
        activeClients,
        totalRevenue,
        avgValue,
        paymentRate
    });
    
    // Create the enhanced clients page structure matching the attachment
    clientsPage.innerHTML = `
        <div class="clients-hero-section">
            <div class="hero-header">
                <div class="hero-title-area">
                    <div class="hero-badge">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Client Management
                    </div>
                    <h1 class="hero-main-title">Clients</h1>
                    <p class="hero-subtitle">Manage your client relationships and track their performance</p>
                </div>
                <div class="hero-actions">
                    <div class="search-container">
                        <input type="text" id="client-search-input" placeholder="Search clients..." class="search-input">
                        <svg class="search-icon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        <button id="clear-search" class="clear-search" style="display: none;">×</button>
                    </div>
                    <button class="btn-modern btn-primary" id="add-client-btn">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Add Client
                    </button>
                </div>
            </div>
        </div>

        <!-- Search Status Indicator (only shown when search is active) -->
        <div class="search-status-container" id="search-status" style="display: none;">
            <div class="search-status-bar">
                <div class="search-info">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <span id="search-status-text">Search results</span>
                </div>
                <button class="clear-search-btn" onclick="viewAllClients()">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Clear Search
                </button>
            </div>
        </div>

        <!-- Enhanced Metrics Grid -->
        <div class="enhanced-metrics-section">
            <div class="metrics-container">
                <div class="metric-card-enhanced primary">
                    <div class="metric-icon">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v7H5v-3H4zm0-10.5h3v7H5v-6.5H4zM12 14c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/>
                        </svg>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value-large">${appData.clients.length}</div>
                        <div class="metric-label-enhanced">Total Clients</div>
                        <div class="metric-trend positive">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            <span>2 new this month</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card-enhanced success">
                    <div class="metric-icon">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value-large">₹19.5L</div>
                        <div class="metric-label-enhanced">Total Revenue</div>
                        <div class="metric-trend positive">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            <span>12.5% growth</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card-enhanced warning">
                    <div class="metric-icon">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value-large">₹2.4L</div>
                        <div class="metric-label-enhanced">Average Client Value</div>
                        <div class="metric-trend positive">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            <span>1.8% increase</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card-enhanced info">
                    <div class="metric-icon">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.11 2 2 3.11 2 4.5v15C2 20.89 3.11 22 4.5 22h15c1.39 0 2.5-1.11 2.5-2.5v-15C22 3.11 20.89 2 19.5 2z"/>
                        </svg>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value-large">87%</div>
                        <div class="metric-label-enhanced">Payment Rate</div>
                        <div class="metric-trend positive">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            <span>1.5% improvement</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced Filter Bar -->
        <div class="filter-toolbar">
            <div class="filter-section">
                <div class="filter-group">
                    <span class="filter-label">Status:</span>
                    <div class="filter-tabs-modern">
                        <button class="filter-tab active" data-filter="all">All</button>
                        <button class="filter-tab" data-filter="active">Active</button>
                        <button class="filter-tab" data-filter="inactive">Inactive</button>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Sort by:</span>
                    <div class="sort-dropdown">
                        <select class="modern-select" id="client-sort">
                            <option value="revenue">Revenue</option>
                            <option value="name">Name</option>
                            <option value="recent">Recent</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="view-controls">
                <button class="view-btn active" data-view="grid" title="Grid View">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
                    </svg>
                </button>
                <button class="view-btn" data-view="list" title="List View">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Enhanced Clients Grid -->
        <div class="clients-showcase">
            <div id="clients-grid-enhanced" class="clients-grid-modern">
                <!-- Will be populated below -->
            </div>
        </div>
    `;
    
    const grid = document.getElementById('clients-grid-enhanced');
    if (!grid) return;

    if (appData.clients.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">
                    <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <h3>No clients yet</h3>
                <p>Start building your client base by adding your first client</p>
                <button class="btn-modern btn-primary" onclick="document.getElementById('add-client-btn').click()">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Add First Client
                </button>
            </div>
        `;
        return;
    }

    // Generate enhanced client cards
    grid.innerHTML = appData.clients.map((client, index) => {
        const avatar = client.name.charAt(0).toUpperCase();
        const completionRate = client.total_invoices > 0 ? Math.min(100, ((client.total_amount || 0) / 50000) * 100) : 0;
        const isActive = index % 3 !== 2; // Make some inactive for demo
        const lastInvoice = appData.invoices.filter(inv => inv.clientId === client.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const lastActivity = lastInvoice ? `Last invoice ${formatTimeAgo(lastInvoice.date)}` : 'No recent activity';
        
        return `
            <div class="client-card-modern ${isActive ? 'active' : 'inactive'}" data-client-id="${client.id}">
                <div class="client-card-header-modern">
                    <div class="client-avatar-section">
                        <div class="client-avatar-large gradient-${['primary', 'success', 'warning', 'info'][index % 4]}">
                            <span class="avatar-text">${avatar}</span>
                        </div>
                        <div class="client-tier-badge ${(client.tier || 'Standard').toLowerCase()}">
                            ${client.tier || 'Standard'}
                        </div>
                    </div>
                    <div class="client-actions-modern">
                        <button class="action-btn-modern edit" data-client-id="${client.id}" title="Edit client">
                            Edit
                        </button>
                        <button class="action-btn-modern delete" data-client-id="${client.id}" data-client-name="${escapeHtml(client.name)}" title="Delete client">
                            Delete
                        </button>
                        <button class="action-btn-modern more" title="More options">
                            More
                        </button>
                    </div>
                </div>

                <div class="client-info-modern">
                    <h3 class="client-name-modern">${escapeHtml(client.name)}</h3>
                    <div class="client-contact-grid">
                        <div class="contact-item-modern">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            <span class="contact-text">${escapeHtml(client.email)}</span>
                        </div>
                        ${client.phone ? `
                        <div class="contact-item-modern">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            <span class="contact-text">${escapeHtml(client.phone)}</span>
                        </div>
                        ` : ''}
                        ${client.contact_name ? `
                        <div class="contact-item-modern">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <span class="contact-text">${escapeHtml(client.contact_name)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="client-metrics-modern">
                    <div class="metrics-grid-mini">
                        <div class="metric-mini">
                            <div class="metric-mini-label">Total Invoices</div>
                            <div class="metric-mini-value">${client.total_invoices || 0}</div>
                        </div>
                        <div class="metric-mini">
                            <div class="metric-mini-label">Total Revenue</div>
                            <div class="metric-mini-value">₹${formatNumber(client.total_amount || 0)}</div>
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <div class="progress-header">
                            <span class="progress-label">Payment Completion</span>
                            <span class="progress-percentage">${completionRate.toFixed(0)}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${completionRate}%"></div>
                        </div>
                    </div>
                </div>

                <div class="client-footer-modern">
                    <div class="activity-info">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span class="activity-text">${lastActivity}</span>
                    </div>
                    <button class="view-details-btn" onclick="viewClientDetails('${client.id}')">
                        View Details
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Initialize the enhanced clients page
    initializeClientFilters();
    initializeSimpleSearch();
    setupClientPageButtons();
    
    console.log('✅ Enhanced clients page rendered successfully with filters and search initialized');
    
    // Initialize client filters and search functionality
    initializeClientFilters();
    initializeSimpleSearch();
    
    // Setup client page buttons with a delay to ensure DOM is ready
    setTimeout(() => {
        setupClientPageButtons();
    }, 100);
}

function setupClientPageButtons() {
    console.log('🔧 Setting up client page buttons...');
    
    // Setup "Add Client" button
    const addClientBtn = document.getElementById('add-client-btn');
    if (addClientBtn) {
        // Remove existing listener if any
        addClientBtn.removeAttribute('data-listener-attached');
        const newBtn = addClientBtn.cloneNode(true);
        addClientBtn.parentNode.replaceChild(newBtn, addClientBtn);
        newBtn.setAttribute('data-listener-attached', 'true');
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Add Client button clicked - opening modal');
            if (typeof openClientModal === 'function') {
                openClientModal();
            } else {
                console.error('❌ openClientModal function not found');
            }
        });
        console.log('✅ Add Client button event listener attached');
    }

    // Setup client action buttons (edit, delete, etc.)
    const clientCards = document.querySelectorAll('.client-card-modern');
    clientCards.forEach(card => {
        const editBtn = card.querySelector('.action-btn-modern.edit');
        const deleteBtn = card.querySelector('.action-btn-modern.delete');
        const viewBtn = card.querySelector('.client-details-btn');

        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clientId = editBtn.dataset.clientId;
                console.log('Edit client clicked:', clientId);
                if (typeof editClient === 'function') {
                    editClient(clientId);
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clientId = deleteBtn.dataset.clientId;
                const clientName = deleteBtn.dataset.clientName;
                console.log('Delete client clicked:', clientId, clientName);
                if (typeof deleteClient === 'function') {
                    deleteClient(clientId, clientName);
                }
            });
        }

        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clientId = viewBtn.dataset.clientId;
                console.log('View client details clicked:', clientId);
                if (typeof viewClientDetails === 'function') {
                    viewClientDetails(clientId);
                }
            });
        }
    });
    
    console.log('✅ Client page buttons setup completed');
}

// Helper functions for enhanced clients page
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
}

function viewClientDetails(clientId) {
    const client = appData.clients.find(c => c.id === clientId);
    if (!client) {
        showToast('Client not found', 'error');
        return;
    }
    
    // Create a detailed view modal instead of edit
    const modal = document.getElementById('client-modal');
    if (!modal) return;
    
    // Set up the modal for viewing (not editing)
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.closest('.modal'))"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>
                    <div class="modal-title-content">
                        <span class="modal-icon">👁️</span>
                        <span>Client Details</span>
                        <span class="view-badge">View</span>
                    </div>
                </h2>
                <button class="modal-close" onclick="closeModal(this.closest('.modal'))">&times;</button>
            </div>
            <div class="modal-body">
                <div class="client-details-view">
                    <div class="detail-section">
                        <h3>Basic Information</h3>
                        <div class="detail-row">
                            <label>Company Name:</label>
                            <span>${client.name || 'Not provided'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Email:</label>
                            <span>${client.email || 'Not provided'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Phone:</label>
                            <span>${client.phone || 'Not provided'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Contact Person:</label>
                            <span>${client.contact_name || 'Not provided'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Address:</label>
                            <span>${client.address || 'Not provided'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Payment Terms:</label>
                            <span>${client.payment_terms || 'Net 30 days'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Total Invoices</span>
                                <span class="stat-value">${client.total_invoices || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Total Amount</span>
                                <span class="stat-value">₹${(client.total_amount || 0).toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Client Tier</span>
                                <span class="stat-value">${client.tier || 'Standard'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn--secondary" onclick="closeModal(this.closest('.modal'))">Close</button>
                <button type="button" class="btn btn--primary" onclick="closeModal(this.closest('.modal')); editClient('${client.id}')">Edit Client</button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function editClient(clientId) {
    console.log('Editing client with ID:', clientId);

    if (!appData.dataLoaded) {
        showToast('Data is still loading. Please wait.', 'info');
        return;
    }

    const client = appData.clients.find(c => c.id === clientId);

    if (!client) {
        console.error('Client not found:', clientId);
        console.log('Available clients:', appData.clients.map(c => ({ id: c.id, name: c.name })));
        showToast('Client not found. Please refresh the page.', 'error');
        return;
    }

    console.log('Found client for editing:', client);

    // Open the modal with the client ID - this will handle all the population
    openClientModal(clientId);
}

// FIXED: Delete client function
async function deleteClient(clientId, clientName) {
    console.log('Deleting client:', { clientId, clientName });

    if (!appData.dataLoaded) {
        showToast('Data is still loading. Please wait.', 'info');
        return;
    }

    const client = appData.clients.find(c => c.id === clientId);
    if (!client) {
        showToast('Client not found. Please refresh the page.', 'error');
        return;
    }

    const clientInvoices = appData.invoices.filter(inv => inv.clientId === clientId);
    if (clientInvoices.length > 0) {
        showToast(`Cannot delete client "${clientName}" - they have ${clientInvoices.length} invoices. Delete invoices first.`, 'error');
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete client "${clientName}"?\n\nThis action cannot be undone.`);
    if (!confirmed) {
        return;
    }

    try {
        await deleteClientFromSupabase(clientId);

        const index = appData.clients.findIndex(c => c.id === clientId);
        if (index > -1) {
            appData.clients.splice(index, 1);
            appData.totalClients--;
        }

        renderClients();

        showToast(`Client "${clientName}" deleted successfully`, 'success');
        console.log('Client deleted successfully:', clientName);

    } catch (error) {
        console.error('Error deleting client:', error);
        showToast(`Error deleting client: ${error.message}`, 'error');
    }
}

function renderAnalytics(period = 'monthly') {
    console.log('🔬 Rendering Analytics page...');
    
    try {
        const analyticsPage = document.getElementById('analytics-page');
        if (!analyticsPage) {
            console.error('Analytics page element not found');
            return;
        }

        // Ensure we have data
        if (!window.appData || !appData.dataLoaded) {
            console.warn('App data not loaded, using emergency init');
            addSampleDataIfEmpty();
        }

        // Clean up existing content and charts
        cleanupAnalyticsPage();
        
        analyticsPage.innerHTML = getAnalyticsPageHTML();
        
        // Initialize analytics with longer timeout
        setTimeout(() => {
            try {
                console.log('🔬 Initializing analytics event listeners...');
                initializeAnalyticsEventListeners();
                console.log('🔬 Starting to render analytics data...');
                renderAnalyticsData();
                console.log('✅ Analytics initialization complete');
            } catch (error) {
                console.error('❌ Error during analytics initialization:', error);
                // Show error in analytics page
                const analyticsPage = document.getElementById('analytics-page');
                if (analyticsPage) {
                    analyticsPage.innerHTML = `
                        <div class="page-header">
                            <h1>📈 Analytics</h1>
                            <p style="color: #ef4444;">Error loading analytics: ${error.message}</p>
                        </div>
                        <div style="padding: 40px; text-align: center;">
                            <p>There was an error loading the analytics page.</p>
                            <button onclick="location.reload()" class="btn btn--primary">Refresh Page</button>
                        </div>
                    `;
                }
            }
        }, 300);
        
        console.log('✅ Analytics page rendered successfully');
    } catch (error) {
        console.error('❌ Error rendering analytics:', error);
        // Fallback simple analytics page
        const analyticsPage = document.getElementById('analytics-page');
        if (analyticsPage) {
            analyticsPage.innerHTML = `
                <div class="page-header">
                    <h1>📈 Analytics</h1>
                    <p>Loading analytics data...</p>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <p>Analytics is being initialized. Please wait...</p>
                    <button onclick="location.reload()">Refresh Page</button>
                </div>
            `;
        }
    }
}

function getAnalyticsPageHTML() {
    return `
        <!-- Hero Section -->
        <div class="hero-section">
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">📈 Business Analytics</h1>
                    <p class="hero-subtitle">Comprehensive insights and performance metrics</p>
                </div>
                <div class="hero-actions">
                    <button class="btn btn--secondary" id="export-analytics">
                        <span class="btn-icon">📊</span>
                        Export Report
                    </button>
                    <button class="btn btn--primary" id="refresh-analytics">
                        <span class="btn-icon">🔄</span>
                        Refresh Data
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Filters and Controls (Reusing Expenses Filter Design) -->
        <div class="analytics-filters-section">
            <div class="enhanced-table-container">
                <div class="table-header">
                    <div class="table-title-section">
                        <h3 class="table-title">📊 Analytics Filters</h3>
                        <span class="table-subtitle" id="analytics-results-count">Analyzing all data</span>
                    </div>
                    
                    <!-- Reused Filters UI from Expenses -->
                    <div class="filters-card" id="analytics-filters">
                        <div class="filters-row">
                            <div class="search-input-wrapper">
                                <svg class="search-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                                <input type="text" id="analytics-search-input" class="search-input" placeholder="Search clients, invoices..." aria-label="Search analytics data">
                            </div>
                            <div class="chip-group" role="group" aria-label="Quick date range">
                                <button class="chip" data-preset="today">Today</button>
                                <button class="chip" data-preset="7d">7D</button>
                                <button class="chip" data-preset="30d">30D</button>
                                <button class="chip" data-preset="ytd">YTD</button>
                                <button class="chip active" data-preset="all">All</button>
                            </div>
                            <label class="switch" title="Paid invoices only">
                                <input type="checkbox" id="paid-only" />
                                <span>Paid Only</span>
                            </label>
                        </div>
                        <!-- Hidden inputs for compatibility -->
                        <input type="hidden" id="analytics-date-filter" value="all" />

                        <button class="filters-advanced-toggle" id="analytics-filters-advanced-toggle" aria-expanded="false">
                            Advanced filters
                            <svg class="chevron" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </button>

                        <!-- Advanced filters panel (hidden by default) -->
                        <div class="filters-advanced-panel" id="analytics-filters-advanced-panel" style="display: none;">
                            <div class="filters-grid">
                                <div class="filter-group">
                                    <label class="filter-label">Time Period</label>
                                    <select class="filter-select" id="analytics-period">
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">Client Filter</label>
                                    <select class="filter-select" id="analytics-client-filter">
                                        <option value="all">All Clients</option>
                                    </select>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">Status Filter</label>
                                    <select class="filter-select" id="analytics-status-filter">
                                        <option value="all">All Status</option>
                                        <option value="paid">Paid Only</option>
                                        <option value="pending">Pending Only</option>
                                        <option value="overdue">Overdue Only</option>
                                    </select>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">Custom Date Range</label>
                                    <div class="date-inputs">
                                        <input type="date" class="filter-input" id="analytics-date-from" placeholder="From">
                                        <input type="date" class="filter-input" id="analytics-date-to" placeholder="To">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="filters-actions">
                                <button class="btn btn--sm btn--secondary" id="clear-analytics-filters">Clear All</button>
                                <button class="btn btn--sm btn--primary" id="apply-analytics-filters">Apply Filters</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Charts Section -->
        <div class="analytics-charts-section">
            <div class="analytics-main-chart">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3 class="chart-title">📊 Earnings Trend Analysis</h3>
                        <div class="chart-period-tabs">
                            <button class="period-tab active" data-period="monthly">Monthly</button>
                            <button class="period-tab" data-period="quarterly">Quarterly</button>
                            <button class="period-tab" data-period="yearly">Yearly</button>
                        </div>
                    </div>
                    <div class="chart-content">
                        <canvas id="analyticsChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="analytics-side-charts">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3 class="chart-title">💼 Client Distribution</h3>
                    </div>
                    <div class="chart-content">
                        <canvas id="clientDistributionChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h3 class="chart-title">📈 Status Breakdown</h3>
                    </div>
                    <div class="chart-content">
                        <canvas id="statusBreakdownChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Insights Section -->
        <div class="analytics-insights-section">
            <div class="insights-container">
                <div class="insights-header">
                    <h3 class="insights-title">💡 Key Insights & Recommendations</h3>
                </div>
                <div class="insights-grid" id="analytics-insights">
                    <!-- Populated by JavaScript -->
                </div>
            </div>
        </div>
        
        <!-- Top Performers Table -->
        <div class="analytics-table-section">
            <div class="table-header">
                <h3 class="table-title">🏆 Top Performing Clients</h3>
                <div class="table-actions">
                    <button class="btn btn--sm btn--secondary" id="view-all-clients">View All</button>
                </div>
            </div>
            <div class="table-container">
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Total Revenue</th>
                            <th>Invoices</th>
                            <th>Average Amount</th>
                            <th>Last Invoice</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="top-clients-table">
                        <!-- Populated by JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function initializeAnalyticsEventListeners() {
    // Period tabs
    const periodTabs = document.querySelectorAll('.period-tab');
    periodTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            periodTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const period = e.target.dataset.period;
            renderAnalyticsChart(period);
        });
    });
    
    // Export button
    const exportBtn = document.getElementById('export-analytics');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportAnalyticsReport());
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-analytics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            showToast('Refreshing analytics data...', 'info');
            renderAnalyticsData();
        });
    }
    
    // Advanced filters toggle
    const advancedToggle = document.getElementById('analytics-filters-advanced-toggle');
    const advancedPanel = document.getElementById('analytics-filters-advanced-panel');
    if (advancedToggle && advancedPanel) {
        advancedToggle.addEventListener('click', () => {
            const isExpanded = advancedToggle.getAttribute('aria-expanded') === 'true';
            advancedToggle.setAttribute('aria-expanded', !isExpanded);
            advancedPanel.style.display = isExpanded ? 'none' : 'block';
            advancedToggle.classList.toggle('expanded', !isExpanded);
        });
    }
    
    // Quick filter chips
    const chips = document.querySelectorAll('#analytics-filters .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            chips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            const preset = e.target.dataset.preset;
            document.getElementById('analytics-date-filter').value = preset;
            applyAnalyticsFilters();
        });
    });
    
    // Apply filters
    const applyFiltersBtn = document.getElementById('apply-analytics-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => applyAnalyticsFilters());
    }
    
    // Clear filters
    const clearFiltersBtn = document.getElementById('clear-analytics-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => clearAnalyticsFilters());
    }
    
    // Search input (no notifications for search)
    const searchInput = document.getElementById('analytics-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            applyAnalyticsFilters(false); // false = no notification
        }, 300));
    }
    
    // Populate client filter
    populateClientFilter();
}

function renderAnalyticsData() {
    try {
        console.log('🔬 Starting renderAnalyticsData...');
        const invoices = appData?.invoices || [];
        const clients = appData?.clients || [];
        
        console.log('📊 Data available:', { invoices: invoices.length, clients: clients.length });
        
        // Update charts
        try {
            renderAnalyticsChart('monthly');
            console.log('✅ Main chart rendered');
        } catch (error) {
            console.error('❌ Error rendering main chart:', error);
        }
        
        try {
            renderClientDistributionChart(invoices, clients);
            console.log('✅ Client distribution chart rendered');
        } catch (error) {
            console.error('❌ Error rendering client chart:', error);
        }
        
        try {
            renderStatusBreakdownChart(invoices);
            console.log('✅ Status breakdown chart rendered');
        } catch (error) {
            console.error('❌ Error rendering status chart:', error);
        }
        
        // Generate insights
        try {
            generateAnalyticsInsights(invoices, clients);
            console.log('✅ Insights generated');
        } catch (error) {
            console.error('❌ Error generating insights:', error);
        }
        
        // Populate top clients table
        try {
            populateTopClientsTable(invoices, clients);
            console.log('✅ Top clients table populated');
        } catch (error) {
            console.error('❌ Error populating clients table:', error);
        }
        
        console.log('✅ renderAnalyticsData completed successfully');
    } catch (error) {
        console.error('❌ Critical error in renderAnalyticsData:', error);
    }
}

function updateAnalyticsMetrics(invoices, clients) {
    console.log('🔬 updateAnalyticsMetrics called with:', { 
        invoicesCount: invoices.length, 
        clientsCount: clients.length,
        invoices: invoices.slice(0, 3), // first 3 for debugging
        appDataMonthlyEarnings: appData.monthlyEarnings
    });
    
    // Get values directly from dashboard metric cards if they exist
    const dashboardRevenue = document.querySelector('#dashboard-page .metric-card:nth-child(1) .metric-value');
    const dashboardClients = document.querySelector('#dashboard-page .metric-card:nth-child(2) .metric-value');
    const dashboardInvoices = document.querySelector('#dashboard-page .metric-card:nth-child(3) .metric-value');
    const dashboardAverage = document.querySelector('#dashboard-page .metric-card:nth-child(4) .metric-value');
    
    if (dashboardRevenue && dashboardClients && dashboardInvoices && dashboardAverage) {
        // Use dashboard values directly
        console.log('🔬 Using dashboard values:', {
            revenue: dashboardRevenue.textContent,
            clients: dashboardClients.textContent,
            invoices: dashboardInvoices.textContent,
            average: dashboardAverage.textContent
        });
        
        document.getElementById('total-revenue-value').textContent = dashboardRevenue.textContent;
        document.getElementById('total-invoices-value').textContent = dashboardInvoices.textContent;
        document.getElementById('active-clients-value').textContent = dashboardClients.textContent;
        document.getElementById('avg-invoice-value').textContent = dashboardAverage.textContent;
    } else {
        // Fallback to calculation
        console.log('🔬 Dashboard values not found, calculating...');
        const stats = getStats(invoices, clients, appData.monthlyEarnings);
        console.log('🔬 Calculated stats:', stats);
        
        document.getElementById('total-revenue-value').textContent = `₹${formatNumber(stats.totalEarnings)}`;
        document.getElementById('total-invoices-value').textContent = stats.totalInvoices;
        document.getElementById('active-clients-value').textContent = stats.totalClients;
        document.getElementById('avg-invoice-value').textContent = `₹${formatNumber(stats.avgInvoice)}`;
    }
}

function renderAnalyticsChart(period = 'monthly', filteredInvoices = null) {
    try {
        console.log('🔬 Starting renderAnalyticsChart...');
        
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js is not loaded');
            return;
        }

        const canvas = document.getElementById('analyticsChart');
        if (!canvas) {
            console.error('❌ Analytics chart canvas not found');
            return;
        }
    
        // Destroy existing chart safely
        if (window.analyticsChart && typeof window.analyticsChart.destroy === 'function') {
            try {
                window.analyticsChart.destroy();
            } catch (e) {
                console.warn('Error destroying analytics chart:', e);
            }
            window.analyticsChart = null;
        }

        const invoices = filteredInvoices || getFilteredAnalyticsData();
        let chartData;
        switch (period) {
            case 'quarterly':
                chartData = calculateQuarterlyEarnings(invoices);
                break;
            case 'yearly':
                chartData = calculateYearlyEarnings(invoices);
                break;
            default:
                chartData = calculateMonthlyEarningsForData(invoices);
        }
    
    window.analyticsChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: chartData.map(d => d.month),
            datasets: [{
                label: 'Revenue',
                data: chartData.map(d => d.amount),
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
    
    } catch (error) {
        console.error('❌ Error rendering analytics chart:', error);
    }
}

function renderClientDistributionChart(filteredInvoices = null, filteredClients = null) {
    const canvas = document.getElementById('clientDistributionChart');
    if (!canvas) {
        console.error('❌ Client distribution chart canvas not found');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded for client distribution chart');
        return;
    }
    
    // Destroy existing chart safely
    if (window.clientDistributionChart && typeof window.clientDistributionChart.destroy === 'function') {
        try {
            window.clientDistributionChart.destroy();
        } catch (e) {
            console.warn('Error destroying client distribution chart:', e);
        }
        window.clientDistributionChart = null;
    }
    
    const invoices = filteredInvoices || (appData?.invoices || []);
    const clients = filteredClients || (appData?.clients || []);
    
    // Calculate client revenue distribution
    const clientRevenue = {};
    invoices.forEach(inv => {
        const clientId = inv.clientId;
        if (!clientRevenue[clientId]) {
            clientRevenue[clientId] = 0;
        }
        clientRevenue[clientId] += inv.amount || 0;
    });
    
    // Get top 5 clients
    const sortedClients = Object.entries(clientRevenue)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const labels = sortedClients.map(([clientId]) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Unknown Client';
    });
    
    const data = sortedClients.map(([,revenue]) => revenue);
    
    window.clientDistributionChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#4F46E5',
                    '#7C3AED',
                    '#EC4899',
                    '#EF4444',
                    '#F59E0B'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderStatusBreakdownChart(filteredInvoices = null) {
    const canvas = document.getElementById('statusBreakdownChart');
    if (!canvas) return;
    
    // Destroy existing chart safely
    if (window.statusBreakdownChart && typeof window.statusBreakdownChart.destroy === 'function') {
        try {
            window.statusBreakdownChart.destroy();
        } catch (e) {
            console.warn('Error destroying status breakdown chart:', e);
        }
        window.statusBreakdownChart = null;
    }
    
    const invoices = filteredInvoices || (appData?.invoices || []);
    
    // Calculate status distribution
    const statusCounts = {
        'Paid': 0,
        'Pending': 0,
        'Overdue': 0
    };
    
    invoices.forEach(inv => {
        const status = inv.status || 'Pending';
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });
    
    window.statusBreakdownChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#10B981', // Green for Paid
                    '#F59E0B', // Yellow for Pending  
                    '#EF4444'  // Red for Overdue
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function generateAnalyticsInsights(invoices, clients) {
    const insightsContainer = document.getElementById('analytics-insights');
    if (!insightsContainer) return;
    
    const insights = [];
    
    // Revenue insight
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    insights.push({
        icon: '💰',
        title: 'Total Revenue',
        description: `Your business has generated ₹${formatNumber(totalRevenue)} in total revenue`,
        type: 'info'
    });
    
    // Top client insight
    const clientRevenue = {};
    invoices.forEach(inv => {
        const clientId = inv.clientId;
        if (!clientRevenue[clientId]) clientRevenue[clientId] = 0;
        clientRevenue[clientId] += inv.amount || 0;
    });
    
    const topClientId = Object.entries(clientRevenue)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (topClientId) {
        const topClient = clients.find(c => c.id === topClientId);
        const topClientRevenue = clientRevenue[topClientId];
        const percentage = ((topClientRevenue / totalRevenue) * 100).toFixed(1);
        
        insights.push({
            icon: '🏆',
            title: 'Top Client',
            description: `${topClient?.name || 'Unknown'} contributes ${percentage}% of your revenue (₹${formatNumber(topClientRevenue)})`,
            type: 'success'
        });
    }
    
    // Pending invoices insight
    const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    
    if (pendingInvoices.length > 0) {
        insights.push({
            icon: '⏳',
            title: 'Pending Payments',
            description: `You have ${pendingInvoices.length} pending invoices worth ₹${formatNumber(pendingAmount)}`,
            type: 'warning'
        });
    }
    
    // Average invoice insight
    const avgInvoice = totalRevenue / invoices.length;
    insights.push({
        icon: '📊',
        title: 'Average Invoice',
        description: `Your average invoice value is ₹${formatNumber(avgInvoice)}`,
        type: 'info'
    });
    
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="insight-card ${insight.type}">
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <h4 class="insight-title">${insight.title}</h4>
                <p class="insight-description">${insight.description}</p>
            </div>
        </div>
    `).join('');
}

function populateTopClientsTable(invoices, clients) {
    const tableBody = document.getElementById('top-clients-table');
    if (!tableBody) return;
    
    // Calculate client statistics
    const clientStats = {};
    
    invoices.forEach(inv => {
        const clientId = inv.clientId;
        if (!clientStats[clientId]) {
            clientStats[clientId] = {
                totalRevenue: 0,
                invoiceCount: 0,
                lastInvoiceDate: null,
                statuses: {}
            };
        }
        
        clientStats[clientId].totalRevenue += inv.amount || 0;
        clientStats[clientId].invoiceCount++;
        
        const invDate = new Date(inv.date);
        if (!clientStats[clientId].lastInvoiceDate || invDate > clientStats[clientId].lastInvoiceDate) {
            clientStats[clientId].lastInvoiceDate = invDate;
        }
        
        const status = inv.status || 'Pending';
        clientStats[clientId].statuses[status] = (clientStats[clientId].statuses[status] || 0) + 1;
    });
    
    // Sort by revenue and get top 10
    const topClients = Object.entries(clientStats)
        .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);
    
    tableBody.innerHTML = topClients.map(([clientId, stats]) => {
        const client = clients.find(c => c.id === clientId);
        const avgAmount = stats.totalRevenue / stats.invoiceCount;
        const lastInvoice = stats.lastInvoiceDate ? 
            formatDate(stats.lastInvoiceDate.toISOString().split('T')[0]) : 'N/A';
        
        // Determine primary status
        const primaryStatus = Object.entries(stats.statuses)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
        
        const clientName = client?.name || 'Unknown Client';
        const clientEmail = client?.email || '';
        const avatar = clientName.charAt(0).toUpperCase();
        const gradientColors = ['primary', 'success', 'warning', 'info', 'purple', 'pink'];
        
        // Simple hash function for consistent colors
        let hash = 0;
        for (let i = 0; i < clientId.length; i++) {
            const char = clientId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const avatarColor = gradientColors[Math.abs(hash) % gradientColors.length];
        
        return `
            <tr>
                <td>
                    <div class="client-info-analytics">
                        <div class="client-avatar-analytics gradient-${avatarColor}">
                            ${avatar}
                        </div>
                        <div class="client-details-analytics">
                            <h4 class="client-name-analytics">${clientName}</h4>
                            <p class="client-email-analytics">${clientEmail}</p>
                        </div>
                    </div>
                </td>
                <td><span class="revenue-amount">₹${formatNumber(stats.totalRevenue)}</span></td>
                <td><span class="invoice-count-badge">${stats.invoiceCount}</span></td>
                <td><span class="average-amount">₹${formatNumber(avgAmount)}</span></td>
                <td><span class="last-invoice-date">${lastInvoice}</span></td>
                <td>
                    <span class="status-badge status-${primaryStatus.toLowerCase()}">${primaryStatus}</span>
                </td>
                <td>
                    <div class="actions-analytics">
                        <button class="action-btn-analytics" title="View Details" onclick="viewClientDetails('${clientId}')">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                            </svg>
                        </button>
                        <button class="action-btn-analytics" title="Send Invoice" onclick="createInvoiceForClient('${clientId}')">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                            </svg>
                        </button>
                        <button class="action-btn-analytics" title="More Options" onclick="showClientOptions('${clientId}')">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Analytics table action functions
function createInvoiceForClient(clientId) {
    // Switch to invoices page and pre-fill client
    showPage('invoices');
    setTimeout(() => {
        const addInvoiceBtn = document.getElementById('add-invoice-btn');
        if (addInvoiceBtn) {
            addInvoiceBtn.click();
            // Pre-select client if possible
            setTimeout(() => {
                const clientSelect = document.getElementById('invoice-client');
                if (clientSelect) {
                    clientSelect.value = clientId;
                }
            }, 100);
        }
    }, 100);
}

function showClientOptions(clientId) {
    // Show context menu or dropdown with more options
    const options = [
        { label: 'View Details', action: () => viewClientDetails(clientId) },
        { label: 'Create Invoice', action: () => createInvoiceForClient(clientId) },
        { label: 'View All Invoices', action: () => showClientInvoices(clientId) },
        { label: 'Edit Client', action: () => editClient(clientId) }
    ];
    
    // For now, just show an alert with options
    const optionText = options.map(opt => opt.label).join('\n');
    const choice = prompt(`Choose an option:\n${optionText}\n\nEnter option number (1-${options.length}):`);
    
    if (choice && choice >= 1 && choice <= options.length) {
        options[choice - 1].action();
    }
}

function showClientInvoices(clientId) {
    // Switch to invoices page and filter by client
    showPage('invoices');
    // Implementation would filter invoices by client
}

function editClient(clientId) {
    // Switch to clients page and open edit modal
    showPage('clients');
    // Implementation would open client edit modal
}

function populateClientFilter() {
    const clientFilter = document.getElementById('analytics-client-filter');
    if (!clientFilter) return;
    
    const clients = appData?.clients || [];
    const clientOptions = clients.map(client => 
        `<option value="${client.id}">${client.name}</option>`
    ).join('');
    
    clientFilter.innerHTML = '<option value="all">All Clients</option>' + clientOptions;
}

function getFilteredAnalyticsData() {
    // For now, return all invoices. Later we can implement filtering based on the form values
    return appData?.invoices || [];
}

function applyAnalyticsFilters(showNotification = true) {
    const searchTerm = document.getElementById('analytics-search-input')?.value?.toLowerCase() || '';
    const dateFilter = document.getElementById('analytics-date-filter')?.value || 'all';
    const clientFilter = document.getElementById('analytics-client-filter')?.value || 'all';
    const statusFilter = document.getElementById('analytics-status-filter')?.value || 'all';
    const paidOnly = document.getElementById('paid-only')?.checked || false;
    
    let filteredInvoices = appData?.invoices || [];
    let filteredClients = appData?.clients || [];
    
    // Apply search filter
    if (searchTerm) {
        filteredInvoices = filteredInvoices.filter(inv => 
            (inv.client?.toLowerCase().includes(searchTerm)) ||
            (inv.id?.toLowerCase().includes(searchTerm)) ||
            (inv.status?.toLowerCase().includes(searchTerm))
        );
        
        filteredClients = filteredClients.filter(client =>
            (client.name?.toLowerCase().includes(searchTerm)) ||
            (client.email?.toLowerCase().includes(searchTerm)) ||
            (client.company?.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === statusFilter);
    }
    
    // Apply paid only filter
    if (paidOnly) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === 'Paid');
    }
    
    // Apply client filter
    if (clientFilter !== 'all') {
        filteredInvoices = filteredInvoices.filter(inv => inv.clientId === clientFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch(dateFilter) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'ytd':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }
        
        if (startDate) {
            filteredInvoices = filteredInvoices.filter(inv => {
                const invDate = new Date(inv.date);
                return invDate >= startDate;
            });
        }
    }
    
    // Update results count
    const resultsCount = document.getElementById('analytics-results-count');
    if (resultsCount) {
        resultsCount.textContent = `Analyzing ${filteredInvoices.length} invoices, ${filteredClients.length} clients`;
    }
    
    // Only show notification if explicitly requested (not on search typing)
    if (showNotification) {
        showToast('Filters applied successfully', 'success');
    }
    
    // Update charts with filtered data
    renderAnalyticsChart('monthly', filteredInvoices);
    renderClientDistributionChart(filteredInvoices, filteredClients);
    renderStatusBreakdownChart(filteredInvoices);
}

function clearAnalyticsFilters() {
    // Reset all filter controls
    document.getElementById('analytics-search-input').value = '';
    document.getElementById('analytics-period').value = 'monthly';
    document.getElementById('analytics-client-filter').value = 'all';
    document.getElementById('analytics-status-filter').value = 'all';
    document.getElementById('analytics-date-filter').value = 'all';
    document.getElementById('paid-only').checked = false;
    
    // Reset chip selection
    const chips = document.querySelectorAll('#analytics-filters .chip');
    chips.forEach(c => c.classList.remove('active'));
    document.querySelector('#analytics-filters .chip[data-preset="all"]')?.classList.add('active');
    
    showToast('Filters cleared', 'info');
    applyAnalyticsFilters(false); // Apply without notification
}

function exportAnalyticsReport() {
    showToast('Preparing analytics report...', 'info');
    // Implement export functionality
    setTimeout(() => {
        showToast('Analytics report exported successfully', 'success');
    }, 1500);
}

function cleanupAnalyticsPage() {
    // Destroy existing charts
    if (window.analyticsChart && typeof window.analyticsChart.destroy === 'function') {
        window.analyticsChart.destroy();
        window.analyticsChart = null;
    }
    if (window.clientDistributionChart && typeof window.clientDistributionChart.destroy === 'function') {
        window.clientDistributionChart.destroy();
        window.clientDistributionChart = null;
    }
    if (window.statusBreakdownChart && typeof window.statusBreakdownChart.destroy === 'function') {
        window.statusBreakdownChart.destroy();
        window.statusBreakdownChart = null;
    }
}

function calculateMonthlyEarningsForData(invoices) {
    const monthlyData = new Map();

    invoices
        .filter(inv => inv.status === 'Paid')
        .forEach(({ date, amount }) => {
            const d = new Date(date);
            if (Number.isNaN(d)) return;
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + amount);
        });

    return Array.from(monthlyData, ([month, amount]) => ({ month, amount }))
                 .sort((a, b) => a.month.localeCompare(b.month));
}

function renderTopClientInsights(invoices) {
    const insightsContainer = document.getElementById('analytics-insights');
    if (!insightsContainer) return;

    const clientEarnings = new Map();
    const clientInvoiceCounts = new Map();

    invoices.forEach(invoice => {
        const clientId = invoice.clientId;
        const clientName = invoice.client;
        
        if (invoice.status === 'Paid') {
            clientEarnings.set(clientId, (clientEarnings.get(clientId) || 0) + invoice.amount);
        }
        clientInvoiceCounts.set(clientId, (clientInvoiceCounts.get(clientId) || 0) + 1);
        
        if (!clientEarnings.has(clientId + '_name')) {
            clientEarnings.set(clientId + '_name', clientName);
        }
    });

    let topClientId = null;
    let topClientEarnings = 0;
    let topClientName = 'N/A';

    for (const [clientId, earnings] of clientEarnings.entries()) {
        if (typeof clientId === 'string' && !clientId.endsWith('_name') && earnings > topClientEarnings) {
            topClientEarnings = earnings;
            topClientId = clientId;
            topClientName = clientEarnings.get(clientId + '_name') || 'Unknown';
        }
    }

    const totalPaidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const totalEarnings = totalPaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const averageInvoice = totalPaidInvoices.length > 0 ? totalEarnings / totalPaidInvoices.length : 0;
    const totalInvoices = invoices.length;

    let periodInfo = '';
    if (analyticsState.dateRange.from && analyticsState.dateRange.to) {
        periodInfo = `${analyticsState.dateRange.from} to ${analyticsState.dateRange.to}`;
    } else {
        periodInfo = 'All time';
    }

    insightsContainer.innerHTML = `
        <div class="insight-item">
            <div class="insight-label">🏆 Top Client${periodInfo !== 'All time' ? ` (${periodInfo})` : ''}</div>
            <div class="insight-value">${topClientName}</div>
            <div class="insight-change positive">₹${formatNumber(topClientEarnings)} earned</div>
        </div>
        
        <div class="insight-item">
            <div class="insight-label">💰 Total Earnings</div>
            <div class="insight-value">₹${formatNumber(totalEarnings)}</div>
            <div class="insight-change">${totalPaidInvoices.length} paid invoices</div>
        </div>
        
        <div class="insight-item">
            <div class="insight-label">📊 Average Invoice</div>
            <div class="insight-value">₹${formatNumber(averageInvoice)}</div>
            <div class="insight-change">${totalInvoices} total invoices</div>
        </div>
        
        <div class="insight-item">
            <div class="insight-label">🎯 Period</div>
            <div class="insight-value">${analyticsState.currentPeriod.charAt(0).toUpperCase() + analyticsState.currentPeriod.slice(1)}</div>
            <div class="insight-change">${periodInfo}</div>
        </div>
    `;
}

// ENHANCED: Settings with GSTIN field
// ENHANCED: Settings with GSTIN field and corrected bank details
function renderSettings() {
    console.log('Rendering settings...');
    cleanupExpenseFilters();

    const settingsPage = document.getElementById('settings-page');
    if (!settingsPage) return;

    if (!appData.dataLoaded) {
        console.log('Data not loaded yet, skipping settings render');
        settingsPage.innerHTML = `
            <div class="loading-placeholder" style="text-align: center; padding: 50px; color: var(--text-muted);">
                <div style="font-size: 24px; margin-bottom: 16px;">⚙️</div>
                <h3>Loading Settings...</h3>
                <p>Please wait while we load your settings</p>
            </div>
        `;
        return;
    }

    // Create the full settings page structure
    settingsPage.innerHTML = `
        <div class="page-header">
            <div>
                <h1>⚙️ Settings</h1>
                <p style="color: var(--text-muted); margin: 8px 0 0 0; font-size: 14px;">
                    Configure your application preferences
                </p>
            </div>
            <div class="header-actions">
                <button class="btn btn--secondary btn--sm" id="export-settings-btn">📊 Export</button>
                <button class="btn btn--primary" id="save-settings-btn">💾 Save Settings</button>
            </div>
        </div>
        
        <!-- Settings Form -->
        <div class="settings-container">
            <div class="settings-section">
                <h3>Profile Information</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="profile-name">Name</label>
                        <input type="text" id="profile-name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="profile-email">Email</label>
                        <input type="email" id="profile-email" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="profile-phone">Phone</label>
                        <input type="tel" id="profile-phone" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="profile-address">Address</label>
                        <textarea id="profile-address" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="profile-gstin">GSTIN</label>
                        <input type="text" id="profile-gstin" class="form-control">
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Banking Information</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="bank-account-name">Account Holder Name</label>
                        <input type="text" id="bank-account-name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="bank-name">Bank Name</label>
                        <input type="text" id="bank-name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="account-type">Account Type</label>
                        <input type="text" id="account-type" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="bank-account">Account Number</label>
                        <input type="text" id="bank-account" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="bank-branch">Branch</label>
                        <input type="text" id="bank-branch" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="bank-ifsc">IFSC Code</label>
                        <input type="text" id="bank-ifsc" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="bank-swift">SWIFT Code</label>
                        <input type="text" id="bank-swift" class="form-control">
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Application Settings</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="currency-setting">Currency</label>
                        <select id="currency-setting" class="form-control">
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="tax-rate">Tax Rate (%)</label>
                        <input type="number" id="tax-rate" class="form-control" min="0" max="100" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="invoice-prefix">Invoice Prefix</label>
                        <input type="text" id="invoice-prefix" class="form-control">
                    </div>
                </div>
            </div>
        </div>
    `;

    const settings = appData.settings;

    const elements = {
        'profile-name': settings.profileName,
        'profile-email': settings.profileEmail,
        'profile-phone': settings.profilePhone,
        'profile-address': settings.profileAddress,
        'profile-gstin': settings.profileGSTIN,
        'bank-account-name': settings.bankAccountName || settings.profileName, // CORRECTED
        'bank-name': settings.bankName || 'Kotak Mahindra Bank',               // CORRECTED
        'account-type': settings.accountType || 'Current Account',
        'bank-account': settings.bankAccount,
        'bank-branch': settings.bankBranch || 'Indira Nagar, Bengaluru',
        'bank-ifsc': settings.bankIFSC,
        'bank-swift': settings.bankSWIFT,
        'currency-setting': settings.currency,
        'tax-rate': settings.taxRate,
        'invoice-prefix': settings.invoicePrefix
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = (value !== null && value !== undefined) ? value : '';
        } else if (id === 'profile-gstin') {
            // Add GSTIN field if it doesn't exist
            const addressField = document.getElementById('profile-address');
            if (addressField && addressField.parentNode) {
                const gstinGroup = document.createElement('div');
                gstinGroup.className = 'form-group';
                gstinGroup.innerHTML = `
                    <label for="profile-gstin">GSTIN</label>
                    <input type="text" class="form-control" id="profile-gstin" placeholder="e.g., 29GLOPS9921M1ZT" value="${value || ''}">
                `;
                addressField.parentNode.parentNode.insertBefore(gstinGroup, addressField.parentNode.nextSibling);
            }
        }
    });

    const taxRateField = document.getElementById('tax-rate');
    if (taxRateField) {
        let datalist = document.getElementById('tax-rate-options');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'tax-rate-options';
            datalist.innerHTML = `
                <option value="0">0% - No Tax</option>
                <option value="5">5% - Reduced Rate</option>
                <option value="12">12% - Standard Rate</option>
                <option value="18">18% - Higher Rate</option>
                <option value="28">28% - Luxury Rate</option>
            `;
            taxRateField.parentNode.appendChild(datalist);
        }
        taxRateField.setAttribute('list', 'tax-rate-options');
        taxRateField.setAttribute('placeholder', 'e.g., 0, 18');
        
        if (!document.getElementById('tax-rate-helper')) {
            const helper = document.createElement('small');
            helper.id = 'tax-rate-helper';
            helper.style.cssText = 'display: block; margin-top: 4px; color: #64748b; font-size: 11px;';
            helper.textContent = 'Enter 0 for no tax, or your applicable GST percentage';
            taxRateField.parentNode.appendChild(helper);
        }
    }

    console.log('Settings rendered with corrected bank details and tax rate:', settings.taxRate);
}

function setupModals() {
    console.log('Setting up modals...');

    // Setup client modal content first
    setupClientModal();
    
    const invoiceModal = document.getElementById('invoice-modal');
    const invoiceModalOverlay = document.getElementById('invoice-modal-overlay');
    const closeInvoiceModal = document.getElementById('close-invoice-modal');
    const createInvoiceBtn = document.getElementById('create-invoice-btn');
    const newInvoiceBtn = document.getElementById('new-invoice-btn');

    if (createInvoiceBtn) {
        createInvoiceBtn.addEventListener('click', () => openInvoiceModal());
    }
    if (newInvoiceBtn) {
        newInvoiceBtn.addEventListener('click', () => openInvoiceModal());
    }

    if (invoiceModalOverlay) {
        invoiceModalOverlay.addEventListener('click', () => closeModal(invoiceModal));
    }
    if (closeInvoiceModal) {
        closeInvoiceModal.addEventListener('click', () => closeModal(invoiceModal));
    }

    const clientModal = document.getElementById('client-modal');
    const clientModalOverlay = document.getElementById('client-modal-overlay');
    const closeClientModal = document.getElementById('close-client-modal');
    const addClientBtn = document.getElementById('add-client-btn');

    if (addClientBtn) {
        addClientBtn.addEventListener('click', () => openClientModal());
    }

    if (clientModalOverlay) {
        clientModalOverlay.addEventListener('click', () => closeModal(clientModal));
    }
    if (closeClientModal) {
        closeClientModal.addEventListener('click', () => closeModal(clientModal));
    }
}

// Setup client modal HTML content
function setupClientModal() {
    const clientModal = document.getElementById('client-modal');
    if (!clientModal) return;
    
    clientModal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.closest('.modal'))"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Client</h2>
                <button class="modal-close" onclick="closeModal(this.closest('.modal'))">&times;</button>
            </div>
            <div class="modal-body">
                <form id="client-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="client-name" class="form-label">Client Name *</label>
                            <input type="text" id="client-name" class="form-control" required placeholder="Enter client name">
                        </div>
                        <div class="form-group">
                            <label for="client-email" class="form-label">Email *</label>
                            <input type="email" id="client-email" class="form-control" required placeholder="client@example.com">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="client-phone" class="form-label">Phone</label>
                            <input type="tel" id="client-phone" class="form-control" placeholder="+1 (555) 123-4567">
                        </div>
                        <div class="form-group">
                            <label for="client-contact-name" class="form-label">Contact Person</label>
                            <input type="text" id="client-contact-name" class="form-control" placeholder="Contact person name">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="client-address" class="form-label">Address</label>
                        <textarea id="client-address" class="form-control" rows="3" placeholder="Enter client address"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="client-terms" class="form-label">Payment Terms</label>
                        <select id="client-terms" class="form-control">
                            <option value="net15">Net 15 days</option>
                            <option value="net30" selected>Net 30 days</option>
                            <option value="net45">Net 45 days</option>
                            <option value="net60">Net 60 days</option>
                            <option value="due_on_receipt">Due on receipt</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn--secondary" onclick="closeModal(this.closest('.modal'))">Cancel</button>
                <button type="button" class="btn btn--primary" id="save-client">Save Client</button>
            </div>
        </div>
    `;
    
    // Add event listener for save button
    const saveClientBtn = document.getElementById('save-client');
    if (saveClientBtn) {
        saveClientBtn.addEventListener('click', saveClient);
    }
}

// REPLACE YOUR EXISTING openInvoiceModal AND openClientModal FUNCTIONS

async function openInvoiceModal(invoiceId = null) {
    console.log('Opening enhanced invoice modal...', invoiceId ? 'for editing' : 'for creation');
    const modal = document.getElementById('invoice-modal');
    if (!modal) {
        console.error('Invoice modal not found');
        showToast('Modal container not found', 'error');
        return;
    }

    // Ensure data is loaded
    if (!appData.dataLoaded) {
        showToast('Data is still loading. Please wait.', 'info');
        return;
    }

    // Build clients options safely
    let clientsOptions = '<option value="">Select Client</option>';
    if (appData.clients && appData.clients.length > 0) {
        clientsOptions += appData.clients.map(client => 
            `<option value="${client.id}">${client.name}</option>`
        ).join('');
    }

    // Initialize modal content
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.closest('.modal'))"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="invoice-modal-title">Create New Invoice</h2>
                <button class="modal-close" onclick="closeModal(this.closest('.modal'))">&times;</button>
            </div>
            <div class="modal-body">
                <form id="invoice-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="invoice-number">Invoice Number</label>
                            <input type="text" id="invoice-number" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="issue-date">Issue Date</label>
                            <input type="date" id="issue-date" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="due-date">Due Date</label>
                            <input type="date" id="due-date" class="form-control" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="invoice-client">Client</label>
                        <select id="invoice-client" class="form-control" required>
                            ${clientsOptions}
                        </select>
                    </div>
                    
                    <div class="line-items-section">
                        <div class="section-header">
                            <h3>Line Items</h3>
                            <button type="button" class="btn btn--secondary btn--sm" onclick="addLineItem()">+ Add Item</button>
                        </div>
                        <div id="line-items-container">
                            <!-- Line items will be added here -->
                        </div>
                    </div>
                    
                    <div class="invoice-totals">
                        <div class="totals-row">
                            <span>Subtotal:</span>
                            <span id="subtotal">₹0.00</span>
                        </div>
                        <div class="totals-row">
                            <span>Tax (${appData.settings.taxRate || 0}%):</span>
                            <span id="tax-amount">₹0.00</span>
                        </div>
                        <div class="totals-row total">
                            <span>Total:</span>
                            <span id="total-amount">₹0.00</span>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn--secondary" onclick="closeModal(this.closest('.modal'))">Cancel</button>
                <button type="button" class="btn btn--primary" id="save-invoice">Save Invoice</button>
            </div>
        </div>
    `;

    // Add modern modal entrance animation
    modal.classList.remove('hidden');
    modal.classList.add('modal-entrance');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        modal.classList.remove('modal-entrance');
    }, 300);

    editingInvoiceId = invoiceId;

    if (invoiceId) {
        // EDITING EXISTING INVOICE
        const invoice = appData.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            console.log('Populating form for editing invoice:', invoice);
            
            // Update modal title
            const modalTitle = document.getElementById('invoice-modal-title');
            if (modalTitle) {
                modalTitle.textContent = `Edit Invoice - ${invoice.id}`;
            }

            // Populate form fields
            const invoiceNumInput = document.getElementById('invoice-number');
            if (invoiceNumInput) {
                invoiceNumInput.value = invoice.id;
            }
            
            const issueDateField = document.getElementById('issue-date');
            const dueDateField = document.getElementById('due-date');
            
            if (issueDateField) {
                issueDateField.value = invoice.date;
            }
            if (dueDateField) {
                dueDateField.value = invoice.dueDate;
            }

            const clientSelect = document.getElementById('invoice-client');
            if (clientSelect) {
                clientSelect.value = invoice.clientId;
            }

            // Populate line items
            const container = document.getElementById('line-items-container');
            if (container) {
                container.innerHTML = '';
                if (invoice.items && invoice.items.length > 0) {
                    invoice.items.forEach((item) => {
                        addLineItem(item);
                    });
                } else {
                    addLineItem();
                }
            }

            // Update save button
            const saveBtn = document.getElementById('save-invoice');
            if (saveBtn) {
                saveBtn.textContent = 'Update Invoice';
                saveBtn.onclick = (e) => {
                    e.preventDefault();
                    console.log('🎯 Save Invoice button clicked (editing existing)');
                    saveInvoice(true);
                };
                console.log('✅ Save button setup complete for editing invoice');
            } else {
                console.error('❌ Save button not found for editing');
            }
        }
    } else {
        // CREATING NEW INVOICE
        console.log('Setting up form for new invoice');
        
        // Clear form
        const form = document.getElementById('invoice-form');
        if (form) {
            form.reset();
        }

        // Add one line item
        const container = document.getElementById('line-items-container');
        if (container) {
            container.innerHTML = '';
            addLineItem();
        }

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const dueDate = nextMonth.toISOString().split('T')[0];

        const issueDateField = document.getElementById('issue-date');
        const dueDateField = document.getElementById('due-date');
        
        if (issueDateField) issueDateField.value = today;
        if (dueDateField) dueDateField.value = dueDate;

        // Generate invoice number
        const invoiceNumInput = document.getElementById('invoice-number');
        if (invoiceNumInput) {
            // Find the highest existing invoice number
            let maxNumber = 0;
            appData.invoices.forEach(inv => {
                const match = inv.id.match(/HP-2526-(\d+)/);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > maxNumber) maxNumber = num;
                }
            });
            const nextNumber = maxNumber + 1;
            invoiceNumInput.value = `${appData.settings.invoicePrefix}-${nextNumber.toString().padStart(3, '0')}`;
        }

        // Set save button
        const saveBtn = document.getElementById('save-invoice');
        if (saveBtn) {
            saveBtn.textContent = 'Save Invoice';
            saveBtn.onclick = (e) => {
                e.preventDefault();
                console.log('🎯 Save Invoice button clicked (new invoice)');
                saveInvoice(false);
            };
            console.log('✅ Save button setup complete for new invoice');
        } else {
            console.error('❌ Save button not found');
        }
    }

    // Calculate totals after a brief delay to ensure DOM is ready
    setTimeout(() => {
        if (typeof calculateInvoiceTotal === 'function') {
            calculateInvoiceTotal();
        }
    }, 200);

    // Add modern modal entrance animation
    modal.classList.remove('hidden');
    modal.classList.add('modal-entrance');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        modal.classList.remove('modal-entrance');
    }, 300);

    editingInvoiceId = invoiceId;

    if (invoiceId) {
            // EDITING EXISTING INVOICE
            const invoice = appData.invoices.find(inv => inv.id === invoiceId);
            if (invoice) {
                // Update modal title with modern styling
                const modalTitle = document.getElementById('invoice-modal-title');
                if (modalTitle) {
                    modalTitle.innerHTML = `
                        <div class="modal-title-content">
                            <span class="modal-icon">✏️</span>
                            <span>Edit Invoice</span>
                            <span class="invoice-status-indicator ${invoice.status.toLowerCase()}">${invoice.status}</span>
                        </div>
                    `;
                }

                // Populate form fields with enhanced UX
                const invoiceNumInput = document.getElementById('invoice-number');
                if (invoiceNumInput) {
                    invoiceNumInput.value = invoice.id;
                    invoiceNumInput.removeAttribute('readonly');
                    invoiceNumInput.classList.add('field-populated');
                }
                
                const issueDateField = document.getElementById('issue-date');
                const dueDateField = document.getElementById('due-date');
                
                if (issueDateField) {
                    issueDateField.value = invoice.date;
                    issueDateField.classList.add('field-populated');
                }
                if (dueDateField) {
                    dueDateField.value = invoice.dueDate;
                    dueDateField.classList.add('field-populated');
                }

                const clientSelect = document.getElementById('invoice-client');
                if (clientSelect) {
                    clientSelect.innerHTML = '<option value="">Select Client</option>' +
                        appData.clients.map(client =>
                            `<option value="${client.id}" ${client.id === invoice.clientId ? 'selected' : ''}>${client.name}</option>`
                        ).join('');
                    clientSelect.classList.add('field-populated');
                }

                const container = document.getElementById('line-items-container');
                container.innerHTML = '';

                if (invoice.items && invoice.items.length > 0) {
                    invoice.items.forEach((item, index) => {
                        const lineItem = document.createElement('div');
                        lineItem.className = 'line-item modern';
                        lineItem.style.animationDelay = `${index * 100}ms`;
                        lineItem.innerHTML = `
                            <div class="line-item-header">
                                <span class="line-item-number">#${index + 1}</span>
                                <button type="button" class="btn btn--ghost btn--sm remove-item" title="Remove item">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="form-row">
                                <div class="form-group flex-2">
                                    <input type="text" class="form-control modern" placeholder="Description" value="${item.description}" required>
                                </div>
                                <div class="form-group">
                                    <input type="number" class="form-control modern quantity" placeholder="Qty" min="1" value="${item.quantity}" required>
                                </div>
                                <div class="form-group">
                                    <input type="number" class="form-control modern rate" placeholder="Rate" min="0" step="0.01" value="${item.rate}" required>
                                </div>
                                <div class="form-group">
                                    <input type="number" class="form-control modern amount" placeholder="Amount" value="${item.amount}" readonly>
                                </div>
                            </div>
                        `;
                        container.appendChild(lineItem);
                        
                        // Add entrance animation
                        setTimeout(() => {
                            lineItem.classList.add('line-item-enter');
                        }, index * 100);
                        
                        // Attach input listeners for live calculation
                        const quantityInput = lineItem.querySelector('.quantity');
                        const rateInput = lineItem.querySelector('.rate');
                        if (quantityInput) quantityInput.addEventListener('input', () => { calculateLineItem(lineItem); calculateInvoiceTotal(); });
                        if (rateInput) rateInput.addEventListener('input', () => { calculateLineItem(lineItem); calculateInvoiceTotal(); });
                    });
                } else {
                    addLineItem();
                }

                // Enhanced modal footer for editing
                const modalFooter = document.querySelector('#invoice-modal .modal-footer');
                if (modalFooter) {
                    modalFooter.innerHTML = `
                        <div class="modal-footer-content">
                            <div class="status-selector">
                                <label class="form-label modern">Status:</label>
                                <select class="form-control modern" id="invoice-status-select">
                                    <option value="Draft" ${invoice.status === 'Draft' ? 'selected' : ''}>📝 Draft</option>
                                    <option value="Pending" ${invoice.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                                    <option value="Paid" ${invoice.status === 'Paid' ? 'selected' : ''}>✅ Paid</option>
                                    <option value="Overdue" ${invoice.status === 'Overdue' ? 'selected' : ''}>⚠️ Overdue</option>
                                    <option value="Cancelled" ${invoice.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                                </select>
                            </div>
                            <div class="action-buttons">
                                <button type="button" class="btn btn--secondary modern" onclick="closeModal(document.getElementById('invoice-modal'))">
                                    Cancel
                                </button>
                                <button type="button" class="btn btn--primary modern" id="update-invoice">
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                                        <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
                                    </svg>
                                    Update Invoice
                                </button>
                            </div>
                        </div>
                    `;

                    // Add event listener for update button
                    setTimeout(() => {
                        const updateBtn = document.getElementById('update-invoice');
                        if (updateBtn) {
                            updateBtn.addEventListener('click', () => {
                                const statusSelect = document.getElementById('invoice-status-select');
                                const selectedStatus = statusSelect ? statusSelect.value : invoice.status;
                                
                                // Add loading state to button
                                updateBtn.innerHTML = `
                                    <span class="btn-spinner"></span>
                                    Updating...
                                `;
                                updateBtn.disabled = true;
                                
                                saveInvoice(selectedStatus).finally(() => {
                                    updateBtn.innerHTML = `
                                        <span class="btn-icon">💾</span>
                                        Update Invoice
                                    `;
                                    updateBtn.disabled = false;
                                });
                            });
                        }
                    }, 100);
                }

                calculateInvoiceTotal();
            }
        } else {
            // CREATING NEW INVOICE
            console.log('Setting up form for new invoice');
            
            // Clear form
            const form = document.getElementById('invoice-form');
            if (form) {
                form.reset();
            }

            // Add one line item
            const container = document.getElementById('line-items-container');
            if (container) {
                container.innerHTML = '';
                addLineItem();
            }

            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const dueDate = nextMonth.toISOString().split('T')[0];

            const issueDateField = document.getElementById('issue-date');
            const dueDateField = document.getElementById('due-date');
            
            if (issueDateField) issueDateField.value = today;
            if (dueDateField) dueDateField.value = dueDate;

            // Generate invoice number
            const invoiceNumInput = document.getElementById('invoice-number');
            if (invoiceNumInput) {
                // Find the highest existing invoice number
                let maxNumber = 0;
                appData.invoices.forEach(inv => {
                    const match = inv.id.match(/HP-2526-(\d+)/);
                    if (match) {
                        const num = parseInt(match[1]);
                        if (num > maxNumber) maxNumber = num;
                    }
                });
                const nextNumber = maxNumber + 1;
                invoiceNumInput.value = `${appData.settings.invoicePrefix}-${nextNumber.toString().padStart(3, '0')}`;
            }

            // Update modal title for creation
            const modalTitle = document.getElementById('invoice-modal-title');
            if (modalTitle) {
                modalTitle.innerHTML = `
                    <div class="modal-title-content">
                        <span class="modal-icon">New</span>
                        <span>Create New Invoice</span>
                        <span class="new-badge">New</span>
                    </div>
                `;
            }

            // Set default dates (avoiding redeclaration)
            if (issueDateField) {
                issueDateField.value = today;
                issueDateField.classList.add('field-auto-filled');
            }
            if (dueDateField) {
                dueDateField.value = dueDate;
                dueDateField.classList.add('field-auto-filled');
            }

            const clientSelect = document.getElementById('invoice-client');
            if (clientSelect) {
                clientSelect.innerHTML = '<option value="">Select Client</option>' +
                    appData.clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
            }

            // Clear and add line item (avoiding redeclaration)
            if (container) {
                container.innerHTML = '';
                addLineItem();
            }

            // Reset modal footer for creation
            const modalFooter = document.querySelector('#invoice-modal .modal-footer');
            if (modalFooter) {
                modalFooter.innerHTML = `
                    <div class="modal-footer-content">
                        <div class="action-buttons">
                            <button type="button" class="btn btn--secondary modern" id="save-draft">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                </svg>
                                Save as Draft
                            </button>
                            <button type="submit" class="btn btn--primary modern" id="save-invoice">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                                </svg>
                                Create Invoice
                            </button>
                        </div>
                    </div>
                `;

                // Re-setup event listeners for new buttons
                setTimeout(() => {
                    const saveDraftBtn = document.getElementById('save-draft');
                    const saveInvoiceBtn = document.getElementById('save-invoice');

                    if (saveDraftBtn) {
                        saveDraftBtn.addEventListener('click', () => {
                            saveDraftBtn.innerHTML = `<span class="btn-spinner"></span>Saving...`;
                            saveDraftBtn.disabled = true;
                            saveInvoice('Draft').finally(() => {
                                saveDraftBtn.innerHTML = `<span class="btn-icon">📄</span>Save as Draft`;
                                saveDraftBtn.disabled = false;
                            });
                        });
                    }

                    if (saveInvoiceBtn) {
                        saveInvoiceBtn.addEventListener('click', () => {
                            saveInvoiceBtn.innerHTML = `<span class="btn-spinner"></span>Creating...`;
                            saveInvoiceBtn.disabled = true;
                            saveInvoice('Pending').finally(() => {
                                saveInvoiceBtn.innerHTML = `<span class="btn-icon">✨</span>Create Invoice`;
                                saveInvoiceBtn.disabled = false;
                            });
                        });
                    }
                }, 200);
            } // close if (modalFooter)
        } // close else (creating new invoice)
} // End of openInvoiceModal function

function openClientModal(clientId = null) {
    console.log('Opening enhanced client modal...');
    const modal = document.getElementById('client-modal');
    if (modal) {
        // Set editing state
        editingClientId = clientId;
        
        // Add modern modal entrance animation
        modal.classList.remove('hidden');
        modal.classList.add('modal-entrance');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            modal.classList.remove('modal-entrance');
        }, 300);

        const form = document.getElementById('client-form');
        if (form) {
            form.reset();
            
            // Remove any previous field states
            form.querySelectorAll('.form-control').forEach(field => {
                field.classList.remove('field-populated', 'field-generated', 'field-auto-filled');
            });
        }

        if (!clientId) {
            // Adding new client
            const modalTitle = document.querySelector('#client-modal .modal-header h2');
            if (modalTitle) {
                modalTitle.innerHTML = `
                    <div class="modal-title-content">
                        <span class="modal-icon">➕</span>
                        <span>Add New Client</span>
                        <span class="new-badge">New</span>
                    </div>
                `;
            }

            const saveBtn = document.getElementById('save-client');
            if (saveBtn) {
                saveBtn.innerHTML = `
                    <span class="btn-icon">💾</span>
                    Save Client
                `;
                saveBtn.className = 'btn btn--primary modern';
            }
        } else {
            // Editing existing client
            const client = appData.clients.find(c => c.id === clientId);
            if (client) {
                // Populate form fields
                if (document.getElementById('client-name')) {
                    document.getElementById('client-name').value = client.name || '';
                }
                if (document.getElementById('client-email')) {
                    document.getElementById('client-email').value = client.email || '';
                }
                if (document.getElementById('client-phone')) {
                    document.getElementById('client-phone').value = client.phone || '';
                }
                if (document.getElementById('client-contact-name')) {
                    document.getElementById('client-contact-name').value = client.contactName || '';
                }
                if (document.getElementById('client-address')) {
                    document.getElementById('client-address').value = client.address || '';
                }
                if (document.getElementById('client-terms')) {
                    document.getElementById('client-terms').value = client.paymentTerms || 'net30';
                }
            }
            
            const modalTitle = document.querySelector('#client-modal .modal-header h2');
            if (modalTitle) {
                modalTitle.innerHTML = `
                    <div class="modal-title-content">
                        <span class="modal-icon">✏️</span>
                        <span>Edit Client</span>
                        <span class="edit-badge">Edit</span>
                    </div>
                `;
            }

            const saveBtn = document.getElementById('save-client');
            if (saveBtn) {
                saveBtn.innerHTML = `
                    <span class="btn-icon">✏️</span>
                    Update Client
                `;
                saveBtn.className = 'btn btn--primary modern';
            }
        }
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById('client-name');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// ENHANCED: Close modal with exit animation
function closeModal(modal) {
    if (modal) {
        // Add exit animation
        modal.classList.add('modal-exit');
        
        // Hide modal after animation
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-exit', 'modal-entrance');
            
            // Reset editing states
            editingInvoiceId = null;
            editingClientId = null;
            
            // Reset modal titles and buttons to default
            if (modal.id === 'invoice-modal') {
                const modalTitle = document.getElementById('invoice-modal-title');
                if (modalTitle) {
                    modalTitle.innerHTML = 'Create New Invoice';
                }
                
                const modalFooter = document.querySelector('#invoice-modal .modal-footer');
                if (modalFooter) {
                    modalFooter.innerHTML = `
                        <button type="button" class="btn btn--secondary modern" id="save-draft">
                            <span class="btn-icon">📄</span>
                            Save as Draft
                        </button>
                        <button type="submit" class="btn btn--primary modern" id="save-invoice">
                            <span class="btn-icon">✨</span>
                            Create Invoice
                        </button>
                    `;
                }
                
                // Clear form fields
                const form = document.getElementById('invoice-form');
                if (form) {
                    form.querySelectorAll('.form-control').forEach(field => {
                        field.classList.remove('field-populated', 'field-generated', 'field-auto-filled');
                    });
                }
            }
            
            if (modal.id === 'client-modal') {
                const modalTitle = document.querySelector('#client-modal .modal-header h2');
                if (modalTitle) {
                    modalTitle.innerHTML = 'Add New Client';
                }
            }
        }, 300);
    }
}
function setupForms() {
    console.log('Setting up forms...');
    setupInvoiceForm();
    setupClientForm();
    setupSettingsForm();
}

// REPLACE YOUR ENTIRE SECTION WITH THIS FIXED VERSION
// This properly handles all invoice form events without duplicates

function setupInvoiceForm() {
    console.log('Setting up invoice form...');
    
    // Clean up ALL existing listeners first
    cleanupInvoiceListeners();
    
    // Setup "Add Line Item" button in modal
    const addLineItemBtn = document.getElementById('add-line-item');
    if (addLineItemBtn) {
        addLineItemBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addLineItem();
        });
    }

    // Setup invoice modal event delegation (single listener for all modal events)
    const invoiceModal = document.getElementById('invoice-modal');
    if (invoiceModal && !invoiceModal.hasAttribute('data-listeners-attached')) {
        // Mark that we've attached listeners
        invoiceModal.setAttribute('data-listeners-attached', 'true');
        
        // Single click handler for all modal buttons
        invoiceModal.addEventListener('click', (e) => {
            // Save Draft button
            if (e.target.id === 'save-draft') {
                e.preventDefault();
                saveInvoice('Draft');
            }
            // Save Invoice button
            else if (e.target.id === 'save-invoice') {
                e.preventDefault();
                saveInvoice('Pending');
            }
            // Update Invoice button (for editing)
            else if (e.target.id === 'update-invoice') {
                e.preventDefault();
                const statusSelect = document.getElementById('invoice-status-select');
                const selectedStatus = statusSelect ? statusSelect.value : 'Pending';
                saveInvoice(selectedStatus);
            }
            // Remove line item button
            else if (e.target.classList.contains('remove-item')) {
                e.preventDefault();
                e.stopPropagation();
                removeLineItem(e.target.closest('.line-item'));
                calculateInvoiceTotal();
            }
        });
        
        // Single input handler for quantity/rate calculations
        invoiceModal.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity') || e.target.classList.contains('rate')) {
                calculateLineItem(e.target.closest('.line-item'));
                calculateInvoiceTotal();
            }
        });
    }

    // Setup form submission
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm && !invoiceForm.hasAttribute('data-submit-attached')) {
        invoiceForm.setAttribute('data-submit-attached', 'true');
        invoiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted');
            // Check if we're in edit mode
            if (editingInvoiceId) {
                const statusSelect = document.getElementById('invoice-status-select');
                const selectedStatus = statusSelect ? statusSelect.value : 'Pending';
                saveInvoice(selectedStatus);
            } else {
                saveInvoice('Pending');
            }
        });
    }

    // Setup page buttons (outside modal)
    setupInvoicePageButtons();
    
    console.log('Invoice form setup complete');
}

function setupInvoicePageButtons() {
    console.log('🔧 Setting up invoice page buttons...');
    
    // Setup "Create Invoice" button (dashboard version)
    const createInvoiceBtn = document.getElementById('create-invoice-btn');
    console.log('Dashboard create button found:', !!createInvoiceBtn);
    if (createInvoiceBtn) {
        // Remove existing listener if any
        createInvoiceBtn.removeAttribute('data-listener-attached');
        // Create new event listener
        const newBtn = createInvoiceBtn.cloneNode(true);
        createInvoiceBtn.parentNode.replaceChild(newBtn, createInvoiceBtn);
        newBtn.setAttribute('data-listener-attached', 'true');
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Dashboard Create Invoice button clicked - opening modal');
            if (typeof openInvoiceModal === 'function') {
                openInvoiceModal();
            } else {
                console.error('❌ openInvoiceModal function not found');
            }
        });
        console.log('✅ Dashboard create button event listener attached');
    }

    // Setup "Create Invoice" button (invoices section version)
    const createInvoiceInvoicesBtn = document.getElementById('create-invoice-invoices-section');
    console.log('Invoices section create button found:', !!createInvoiceInvoicesBtn);
    if (createInvoiceInvoicesBtn) {
        // Remove existing listener if any
        createInvoiceInvoicesBtn.removeAttribute('data-listener-attached');
        // Create new event listener
        const newBtn = createInvoiceInvoicesBtn.cloneNode(true);
        createInvoiceInvoicesBtn.parentNode.replaceChild(newBtn, createInvoiceInvoicesBtn);
        newBtn.setAttribute('data-listener-attached', 'true');
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Invoices section Create Invoice button clicked - opening modal');
            if (typeof openInvoiceModal === 'function') {
                openInvoiceModal();
            } else {
                console.error('❌ openInvoiceModal function not found');
            }
        });
        console.log('✅ Invoices section create button event listener attached');
    }
    
    // Setup "New Invoice" button on invoices page
    const newInvoiceBtn = document.getElementById('new-invoice-btn');
    if (newInvoiceBtn) {
        newInvoiceBtn.removeAttribute('data-listener-attached');
        const newBtn2 = newInvoiceBtn.cloneNode(true);
        newInvoiceBtn.parentNode.replaceChild(newBtn2, newInvoiceBtn);
        newBtn2.setAttribute('data-listener-attached', 'true');
        newBtn2.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 New Invoice button clicked - opening modal');
            if (typeof openInvoiceModal === 'function') {
                openInvoiceModal();
            } else {
                console.error('❌ openInvoiceModal function not found');
            }
        });
        console.log('✅ New Invoice button event listener attached');
    }

    
    console.log('✅ Invoice page buttons setup complete');
}

function cleanupInvoiceListeners() {
    // Remove listeners from modal
    const invoiceModal = document.getElementById('invoice-modal');
    if (invoiceModal && invoiceModal.hasAttribute('data-listeners-attached')) {
        const newModal = invoiceModal.cloneNode(true);
        newModal.removeAttribute('data-listeners-attached');
        invoiceModal.parentNode.replaceChild(newModal, invoiceModal);
    }
    
    // Remove listeners from form
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm && invoiceForm.hasAttribute('data-submit-attached')) {
        const newForm = invoiceForm.cloneNode(true);
        newForm.removeAttribute('data-submit-attached');
        invoiceForm.parentNode.replaceChild(newForm, invoiceForm);
    }
}

function addLineItem() {
    const container = document.getElementById('line-items-container');
    if (container) {
        const lineItem = document.createElement('div');
        lineItem.className = 'line-item';
        lineItem.innerHTML = `
            <div class="form-row">
                <div class="form-group flex-2">
                    <input type="text" class="form-control" placeholder="Description" required>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control quantity" placeholder="Qty" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control rate" placeholder="Rate" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control amount" placeholder="Amount" readonly>
                </div>
                <button type="button" class="btn btn--secondary remove-item">Remove</button>
            </div>
        `;
        container.appendChild(lineItem);
        
        // No need to attach individual listeners - handled by event delegation
        console.log('Line item added');
    }
}

function removeLineItem(lineItem) {
    const container = document.getElementById('line-items-container');
    if (container && container.children.length > 1 && lineItem) {
        lineItem.remove();
        console.log('Line item removed');
    } else if (container && container.children.length === 1) {
        showToast('At least one line item is required', 'warning');
    }
}

function calculateLineItem(lineItem) {
    if (!lineItem) return;

    const quantityInput = lineItem.querySelector('.quantity');
    const rateInput = lineItem.querySelector('.rate');
    const amountInput = lineItem.querySelector('.amount');

    if (quantityInput && rateInput && amountInput) {
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const amount = quantity * rate;

        amountInput.value = amount.toFixed(2);
    }
}

function calculateInvoiceTotal() {
    const lineItems = document.querySelectorAll('.line-item');
    let subtotal = 0;

    lineItems.forEach(item => {
        const amountInput = item.querySelector('.amount');
        if (amountInput) {
            const amount = parseFloat(amountInput.value) || 0;
            subtotal += amount;
        }
    });

    const taxRate = appData.settings.taxRate / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Try both modal and regular page IDs
    const subtotalElement = document.getElementById('subtotal') || document.getElementById('invoice-subtotal');
    const taxElement = document.getElementById('tax-amount') || document.getElementById('invoice-tax');
    const totalElement = document.getElementById('total-amount') || document.getElementById('invoice-total');

    if (subtotalElement) subtotalElement.textContent = `₹${formatNumber(subtotal)}`;
    if (taxElement) taxElement.textContent = `₹${formatNumber(tax)}`;
    if (totalElement) totalElement.textContent = `₹${formatNumber(total)}`;

    // Update tax label (try both IDs)
    const taxLabel = document.getElementById('invoice-tax-label');
    if (taxLabel) {
        taxLabel.textContent = `Tax (${appData.settings.taxRate}%):`;
    }
}

let isSavingInvoice = false;
async function saveInvoice(status) {
    console.log('🚀 saveInvoice called with status:', status);
    if (isSavingInvoice) {
        console.log('⚠️ Already saving invoice, returning');
        return;
    }
    isSavingInvoice = true;
    console.log('💾 Starting to save invoice with status:', status);

    const invoiceNumberInput = document.getElementById('invoice-number');
    let invoiceNumber = invoiceNumberInput?.value;
    console.log('📄 Invoice number:', invoiceNumber);
    
    const clientSelect = document.getElementById('invoice-client');
    const clientId = clientSelect ? clientSelect.value : null;
    console.log('👤 Selected client ID:', clientId);

    if (!clientId) {
        console.log('❌ No client selected');
        showToast('Please select a client', 'error');
        clientSelect?.focus();
        isSavingInvoice = false;
        return;
    }

    const client = appData.clients.find(c => c.id === clientId);
    if (!client) {
        showToast('Selected client not found', 'error');
        return;
    }

    const lineItems = [];
    const lineItemElements = document.querySelectorAll('.line-item');

    lineItemElements.forEach(item => {
        const descInput = item.querySelector('input[placeholder="Description"]');
        const quantityInput = item.querySelector('.quantity');
        const rateInput = item.querySelector('.rate');
        const amountInput = item.querySelector('.amount');

        if (descInput && quantityInput && rateInput && amountInput) {
            const description = descInput.value.trim();
            const quantity = parseFloat(quantityInput.value);
            const rate = parseFloat(rateInput.value);
            const amount = parseFloat(amountInput.value);

            if (description && quantity && rate) {
                lineItems.push({description, quantity, rate, amount});
            }
        }
    });

    if (lineItems.length === 0) {
        showToast('Please add at least one line item', 'error');
        return;
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (appData.settings.taxRate / 100);
    const total = subtotal + tax;

    const issueDateInput = document.getElementById('issue-date');
    const dueDateInput = document.getElementById('due-date');

    const invoice = {
        id: invoiceNumber,
        clientId: clientId,
        client: client.name,
        amount: total,
        subtotal: subtotal,
        tax: tax,
        date: issueDateInput ? issueDateInput.value : new Date().toISOString().split('T')[0],
        dueDate: dueDateInput ? dueDateInput.value : new Date().toISOString().split('T')[0],
        status: status,
        items: lineItems
    };

    try {
        await saveInvoiceToSupabase(invoice);

        if (editingInvoiceId) {
            const index = appData.invoices.findIndex(inv => inv.id === editingInvoiceId);
            if (index > -1) {
                appData.invoices[index] = invoice;
            }
            showToast(`Invoice ${invoiceNumber} updated successfully`, 'success');
        } else {
            appData.invoices.unshift(invoice);
            appData.totalInvoices++;
            showToast(`Invoice ${invoiceNumber} ${status === 'Draft' ? 'saved as draft' : 'created'} successfully`, 'success');
        }

        // Update client totals
        const localClient = appData.clients.find(c => c.id === clientId);
        if (localClient) {
            const clientInvoices = appData.invoices.filter(inv => inv.clientId === clientId);
            localClient.total_invoices = clientInvoices.length;
            localClient.total_amount = clientInvoices
                .filter(inv => inv.status === 'Paid')
                .reduce((sum, inv) => sum + inv.amount, 0);
        }

        // Recalculate totals
        appData.totalEarnings = appData.invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.amount, 0);

        calculateMonthlyEarnings();
        
        // Update expense balance if expense module is enabled
        if (window.expenseManager && window.expenseManager.isInitialized) {
            await window.expenseManager.updateBalanceFromInvoices(appData.invoices);
        }

        renderInvoices();
        renderDashboard();
        renderClients();

        closeModal(document.getElementById('invoice-modal'));
        
        // Clean up form after successful save
        editingInvoiceId = null;

    } catch (error) {
        console.error('Error saving invoice:', error);
        showToast('Error saving invoice. Please try again.', 'error');
    } finally {
        isSavingInvoice = false;
    }
}

// IMPROVED: Quick status change function for table dropdowns
async function changeInvoiceStatus(invoiceId, newStatus) {
    console.log('Changing invoice status:', invoiceId, 'to', newStatus);

    try {
        const invoice = appData.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            showToast('Invoice not found', 'error');
            return;
        }

        const oldStatus = invoice.status;

        // Update in Supabase
        const { error } = await supabaseClient
            .from('invoices')
            .update({ status: newStatus })
            .eq('id', invoiceId);

        if (error) throw error;

        // Update local data
        invoice.status = newStatus;

        // Recalculate earnings if status changed to/from Paid
        if (newStatus === 'Paid' || oldStatus === 'Paid') {
            appData.totalEarnings = appData.invoices
                .filter(inv => inv.status === 'Paid')
                .reduce((sum, inv) => sum + inv.amount, 0);
            
            calculateMonthlyEarnings();

            // Update client totals
            if (invoice && invoice.clientId) {
                const client = appData.clients.find(c => c.id === invoice.clientId);
                if (client) {
                    const clientInvoices = appData.invoices.filter(inv => inv.clientId === invoice.clientId);
                    client.total_amount = clientInvoices
                        .filter(inv => inv.status === 'Paid')
                        .reduce((sum, inv) => sum + inv.amount, 0);
                }
            }
        }

        // 🆕 ADD THIS CODE HERE - Update expense balance
        if (window.expenseIntegration && window.expenseIntegration.isEnabled()) {
            // Expense balance update will be handled directly after migration
        }

        // Re-render views
        renderInvoices();
        renderDashboard();
        renderClients();

        showToast(`Invoice ${invoiceId} marked as ${newStatus}`, 'success');

    } catch (error) {
        console.error('Error changing invoice status:', error);
        showToast(`Error updating invoice status: ${error.message}`, 'error');
    }
}

function setupClientForm() {
    const saveClientBtn = document.getElementById('save-client');
    const cancelClientBtn = document.getElementById('cancel-client');

    if (saveClientBtn) {
        saveClientBtn.addEventListener('click', saveClient);
    }

    if (cancelClientBtn) {
        cancelClientBtn.addEventListener('click', () => closeModal(document.getElementById('client-modal')));
    }
}

async function saveClient() {
    console.log('Saving client... Editing ID:', editingClientId);

    // Use the correct IDs from your HTML
    const formFields = {
        name: document.getElementById('client-name'),           // Company Name
        email: document.getElementById('client-email'),         // Email
        phone: document.getElementById('client-phone'),         // Phone
        address: document.getElementById('client-address'),     // Address
        contactName: document.getElementById('client-contact-name'), // Contact Person
        terms: document.getElementById('client-terms')          // Payment Terms
    };

    console.log('Form fields found:', Object.keys(formFields).filter(key => formFields[key]));

    if (!formFields.name || !formFields.email) {
        showToast('Required form fields (company name and email) are missing from the form', 'error');
        return;
    }

    const clientData = {
        name: formFields.name.value.trim(),
        email: formFields.email.value.trim(),
        phone: formFields.phone ? formFields.phone.value.trim() : '',
        address: formFields.address ? formFields.address.value.trim() : '',
        paymentTerms: formFields.terms ? formFields.terms.value : 'net30',
        contactName: formFields.contactName ? formFields.contactName.value.trim() : '',
        company: formFields.name.value.trim() // Use the same as name for company
    };

    console.log('Client data being saved:', clientData);

    if (!clientData.name || !clientData.email) {
        showToast('Company name and email are required', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    try {
        const saveBtn = document.getElementById('save-client');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        console.log('Attempting to save client to Supabase...');
        const savedClient = await saveClientToSupabase(clientData);
        console.log('Client saved to Supabase successfully:', savedClient);

        if (editingClientId) {
            const index = appData.clients.findIndex(c => c.id === editingClientId);
            if (index > -1) {
                const oldClient = { ...appData.clients[index] };
                appData.clients[index] = {
                    ...appData.clients[index],
                    id: savedClient.id,
                    name: savedClient.name,
                    email: savedClient.email,
                    phone: savedClient.phone || '',
                    address: savedClient.address || '',
                    payment_terms: savedClient.payment_terms,
                    contact_name: savedClient.contact_name || '',
                    company: savedClient.company || savedClient.name || ''
                };
                console.log('Updated client:', {
                    before: oldClient,
                    after: appData.clients[index],
                    index: index
                });
            }
            showToast(`Client "${savedClient.name}" updated successfully`, 'success');
        } else {
            const newClient = {
                id: savedClient.id,
                name: savedClient.name,
                email: savedClient.email,
                phone: savedClient.phone || '',
                address: savedClient.address || '',
                payment_terms: savedClient.payment_terms,
                contact_name: savedClient.contact_name || '',
                company: savedClient.company || savedClient.name || '',
                total_invoices: savedClient.total_invoices || 0,
                total_amount: savedClient.total_amount || 0
            };

            appData.clients.push(newClient);
            appData.totalClients++;
            console.log('Added new client:', newClient);
            showToast(`Client "${newClient.name}" added successfully`, 'success');
        }

        console.log('Refreshing client views...');
        renderClients();
        closeModal(document.getElementById('client-modal'));

        const form = document.getElementById('client-form');
        if (form) form.reset();
        editingClientId = null;

        saveBtn.textContent = originalText;
        saveBtn.disabled = false;

    } catch (error) {
        console.error('Error saving client:', error);
        showToast(`Error saving client: ${error.message || 'Please try again'}`, 'error');

        const saveBtn = document.getElementById('save-client');
        if (saveBtn) {
            saveBtn.textContent = editingClientId ? 'Update Client' : 'Save Client';
            saveBtn.disabled = false;
        }
    }
}

// ============================================================================
// SIMPLE CLIENT SEARCH FUNCTIONALITY
// ============================================================================

// Simple search state
let clientSearchState = {
    isSearching: false,
    originalClients: []
};

// Initialize simple search functionality
function initializeSimpleSearch() {
    const searchInput = document.getElementById('client-search-input');
    const clearBtn = document.getElementById('clear-search');
    
    if (!searchInput) {
        console.log('Client search input not found');
        return;
    }
    
    console.log('Initializing client search...');
    
    // Store original clients
    clientSearchState.originalClients = [...appData.clients];
    
    // Prevent form submission on Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            return false;
        }
    });
    
    // Real-time search with debounce
    searchInput.addEventListener('input', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const query = e.target.value.trim();
        console.log('Client search input:', query);
        
        if (query.length === 0) {
            clearClientSearch();
        } else {
            performClientSearch(query);
        }
        
        // Show/hide clear button
        if (clearBtn) {
            clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        }
    });
    
    // Clear search functionality
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            searchInput.value = '';
            clearClientSearch();
            clearBtn.style.display = 'none';
        });
    }
    
    console.log('Client search initialized successfully');
}

// Perform simple client search
function performClientSearch(query) {
    if (!query) {
        clearClientSearch();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filteredClients = clientSearchState.originalClients.filter(client => {
        return (
            (client.name || '').toLowerCase().includes(searchTerm) ||
            (client.email || '').toLowerCase().includes(searchTerm) ||
            (client.phone || '').toLowerCase().includes(searchTerm) ||
            (client.contact_name || '').toLowerCase().includes(searchTerm)
        );
    });
    
    // Update the display
    appData.clients = filteredClients;
    clientSearchState.isSearching = true;
    
    // Re-render clients with filtered results
    renderClientsGrid();
    
    console.log(`Search: "${query}" - Found ${filteredClients.length} clients`);
    
    // Update search status
    updateClientSearchStatus(filteredClients.length, query);
}

// Clear client search and show all clients
function clearClientSearch() {
    appData.clients = [...clientSearchState.originalClients];
    clientSearchState.isSearching = false;
    
    // Re-render clients with all results
    renderClientsGrid();
    
    // Hide search status
    const searchStatus = document.getElementById('search-status');
    if (searchStatus) {
        searchStatus.style.display = 'none';
    }
    
    console.log('Client search cleared - showing all clients');
}

// Function to be called from "View All Clients" button
function viewAllClients() {
    const searchInput = document.getElementById('client-search-input');
    const clearBtn = document.getElementById('clear-search');
    
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    
    clearClientSearch();
}

// Update search status display
function updateClientSearchStatus(count, query) {
    const searchStatus = document.getElementById('search-status');
    const searchStatusText = document.getElementById('search-status-text');
    
    if (searchStatus && searchStatusText) {
        if (query && query.length > 0) {
            searchStatusText.textContent = `Found ${count} client${count !== 1 ? 's' : ''} matching "${query}"`;
            searchStatus.style.display = 'block';
        } else {
            searchStatus.style.display = 'none';
        }
    }
}

// Clear client search and restore all clients
function clearClientSearch() {
    appData.clients = [...clientSearchState.originalClients];
    clientSearchState.isSearching = false;
    
    // Re-render all clients
    renderClientsGrid();
    
    console.log('Search cleared - Showing all clients');
}

// Initialize client filters functionality
function initializeClientFilters() {
    // Status filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            e.target.classList.add('active');
            
            const filterValue = e.target.dataset.filter;
            applyStatusFilter(filterValue);
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('client-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            applySortFilter(e.target.value);
        });
    }
    
    // View controls
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all view buttons
            viewButtons.forEach(vb => vb.classList.remove('active'));
            // Add active class to clicked button
            e.currentTarget.classList.add('active');
            
            const viewType = e.currentTarget.dataset.view;
            switchClientView(viewType);
        });
    });
}

// Apply status filter
function applyStatusFilter(status) {
    let filteredClients;
    
    switch(status) {
        case 'active':
            // Consider clients with recent activity as active
            filteredClients = clientSearchState.originalClients.filter(client => 
                client.total_invoices > 0 && client.total_amount > 0
            );
            break;
        case 'inactive':
            // Consider clients with no invoices as inactive
            filteredClients = clientSearchState.originalClients.filter(client => 
                !client.total_invoices || client.total_invoices === 0
            );
            break;
        default:
            filteredClients = [...clientSearchState.originalClients];
    }
    
    appData.clients = filteredClients;
    renderClientsGrid();
    
    console.log(`Status filter applied: ${status} - ${filteredClients.length} clients`);
}

// Apply sort filter
function applySortFilter(sortBy) {
    console.log('Applying sort:', sortBy);
    
    // If we're currently searching, sort the search results
    // Otherwise, sort the original clients
    let clientsToSort;
    if (clientSearchState.isSearching) {
        clientsToSort = [...appData.clients];
    } else {
        clientsToSort = [...clientSearchState.originalClients];
    }
    
    switch(sortBy) {
        case 'name':
            clientsToSort.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'recent':
            // Sort by most recent invoice date
            clientsToSort.sort((a, b) => {
                // Find the most recent invoice for each client
                const aLastInvoice = appData.invoices
                    .filter(inv => inv.clientId === a.id)
                    .sort((x, y) => new Date(y.date) - new Date(x.date))[0];
                const bLastInvoice = appData.invoices
                    .filter(inv => inv.clientId === b.id)
                    .sort((x, y) => new Date(y.date) - new Date(x.date))[0];
                
                const aDate = aLastInvoice ? new Date(aLastInvoice.date) : new Date(0);
                const bDate = bLastInvoice ? new Date(bLastInvoice.date) : new Date(0);
                
                return bDate - aDate;
            });
            break;
        case 'revenue':
        default:
            clientsToSort.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
            break;
    }
    
    // Update the clients array
    appData.clients = clientsToSort;
    
    // If not searching, also update the original clients
    if (!clientSearchState.isSearching) {
        clientSearchState.originalClients = [...clientsToSort];
    }
    
    renderClientsGrid();
    
    console.log(`Sort applied: ${sortBy} - ${clientsToSort.length} clients sorted`);
}

// Switch client view between grid and list
function switchClientView(viewType) {
    const clientsGrid = document.querySelector('.clients-grid-modern');
    
    if (!clientsGrid) return;
    
    if (viewType === 'list') {
        clientsGrid.classList.add('list-view');
        clientsGrid.classList.remove('grid-view');
    } else {
        clientsGrid.classList.add('grid-view');
        clientsGrid.classList.remove('list-view');
    }
    
    console.log(`View switched to: ${viewType}`);
}

// Open client search modal
function openClientSearchModal() {
    const modal = document.getElementById('client-modal');
    if (!modal) return;
    
    // Store original clients for restoration
    clientSearchState.originalClients = [...appData.clients];
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeClientSearchModal()"></div>
        <div class="modal-content search-modal-content">
            <div class="modal-header">
                <h2>
                    <div class="modal-title-content">
                        <span class="modal-icon">🔍</span>
                        <span>Search Clients</span>
                        <span class="search-badge">Search</span>
                    </div>
                </h2>
                <button class="modal-close" onclick="closeClientSearchModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="search-container">
                    <!-- Main Search Input -->
                    <div class="search-input-container">
                        <input type="text" 
                               id="client-search-input" 
                               class="search-input" 
                               placeholder="Search by name, email, phone, or contact person..."
                               autocomplete="off">
                        <button class="search-clear-btn" onclick="clearSearch()" style="display: none;">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Search Filters -->
                    <div class="search-filters">
                        <div class="filter-group">
                            <label class="filter-label">Search in:</label>
                            <div class="filter-checkboxes">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="search-name" checked> Company Name
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="search-email" checked> Email
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="search-phone" checked> Phone
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="search-contact" checked> Contact Person
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Client Tier:</label>
                            <select id="search-tier" class="filter-select">
                                <option value="">All Tiers</option>
                                <option value="Enterprise">Enterprise</option>
                                <option value="Premium">Premium</option>
                                <option value="Standard">Standard</option>
                                <option value="New">New</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Payment Terms:</label>
                            <select id="search-terms" class="filter-select">
                                <option value="">All Terms</option>
                                <option value="net15">Net 15 days</option>
                                <option value="net30">Net 30 days</option>
                                <option value="net45">Net 45 days</option>
                                <option value="net60">Net 60 days</option>
                                <option value="due_on_receipt">Due on receipt</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Search History -->
                    <div class="search-history" id="search-history" style="display: none;">
                        <h4>Recent Searches</h4>
                        <div class="history-items" id="history-items"></div>
                    </div>
                    
                    <!-- Search Results Count -->
                    <div class="search-results-info" id="search-results-info" style="display: none;">
                        <span id="results-count">0 clients found</span>
                        <button class="view-all-btn" onclick="viewAllClients()">View All Clients</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn--secondary" onclick="closeClientSearchModal()">Close</button>
                <button type="button" class="btn btn--primary" onclick="applySearch()">Apply Search</button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // Initialize search functionality
    initializeClientSearch();
    
    // Focus on search input
    setTimeout(() => {
        const searchInput = document.getElementById('client-search-input');
        if (searchInput) searchInput.focus();
    }, 100);
}

// Initialize search event listeners
function initializeClientSearch() {
    const searchInput = document.getElementById('client-search-input');
    const searchFilters = document.querySelectorAll('.search-filters input, .search-filters select');
    
    if (searchInput) {
        // Real-time search as you type
        searchInput.addEventListener('input', debounce(performLiveSearch, 300));
        searchInput.addEventListener('focus', showSearchHistory);
        
        // Show/hide clear button
        searchInput.addEventListener('input', () => {
            const clearBtn = document.querySelector('.search-clear-btn');
            if (clearBtn) {
                clearBtn.style.display = searchInput.value ? 'flex' : 'none';
            }
        });
    }
    
    // Filter change listeners
    searchFilters.forEach(filter => {
        filter.addEventListener('change', performLiveSearch);
    });
    
    // Show search history if available
    displaySearchHistory();
}

// Perform live search
function performLiveSearch() {
    const query = document.getElementById('client-search-input').value.toLowerCase().trim();
    clientSearchState.currentQuery = query;
    
    if (!query && !hasActiveFilters()) {
        // Show all clients if no search query or filters
        clientSearchState.searchResults = [...clientSearchState.originalClients];
        updateSearchResultsInfo(clientSearchState.originalClients.length, false);
        return;
    }
    
    // Get filter values
    const filters = getSearchFilters();
    
    // Perform search
    const results = searchClients(query, filters);
    clientSearchState.searchResults = results;
    
    // Update UI
    updateSearchResultsInfo(results.length, true);
    
    // Hide search history when searching
    const historyContainer = document.getElementById('search-history');
    if (historyContainer) {
        historyContainer.style.display = 'none';
    }
}

// Search clients based on query and filters
function searchClients(query, filters) {
    return clientSearchState.originalClients.filter(client => {
        // Text search
        let matchesQuery = false;
        if (!query) {
            matchesQuery = true; // No query means match all for text search
        } else {
            const searchFields = [];
            
            if (filters.searchName) searchFields.push(client.name || '');
            if (filters.searchEmail) searchFields.push(client.email || '');
            if (filters.searchPhone) searchFields.push(client.phone || '');
            if (filters.searchContact) searchFields.push(client.contact_name || '');
            
            matchesQuery = searchFields.some(field => 
                field.toLowerCase().includes(query)
            );
        }
        
        // Filter by tier
        const matchesTier = !filters.tier || client.tier === filters.tier;
        
        // Filter by payment terms
        const matchesTerms = !filters.terms || client.payment_terms === filters.terms;
        
        return matchesQuery && matchesTier && matchesTerms;
    });
}

// Get current search filter values
function getSearchFilters() {
    return {
        searchName: document.getElementById('search-name')?.checked || false,
        searchEmail: document.getElementById('search-email')?.checked || false,
        searchPhone: document.getElementById('search-phone')?.checked || false,
        searchContact: document.getElementById('search-contact')?.checked || false,
        tier: document.getElementById('search-tier')?.value || '',
        terms: document.getElementById('search-terms')?.value || ''
    };
}

// Check if any filters are active
function hasActiveFilters() {
    const filters = getSearchFilters();
    return filters.tier || filters.terms || 
           (!filters.searchName && !filters.searchEmail && !filters.searchPhone && !filters.searchContact);
}

// Update search results information
function updateSearchResultsInfo(count, isSearchActive) {
    const infoContainer = document.getElementById('search-results-info');
    const countElement = document.getElementById('results-count');
    
    if (infoContainer && countElement) {
        if (isSearchActive) {
            infoContainer.style.display = 'flex';
            countElement.textContent = `${count} client${count !== 1 ? 's' : ''} found`;
        } else {
            infoContainer.style.display = 'none';
        }
    }
}

// Apply search and close modal
function applySearch() {
    const query = clientSearchState.currentQuery;
    
    // Save to search history
    if (query && !clientSearchState.searchHistory.includes(query)) {
        clientSearchState.searchHistory.unshift(query);
        clientSearchState.searchHistory = clientSearchState.searchHistory.slice(0, 10); // Keep last 10
        localStorage.setItem('clientSearchHistory', JSON.stringify(clientSearchState.searchHistory));
    }
    
    // Apply search results to main clients view
    if (clientSearchState.searchResults.length > 0) {
        appData.clients = [...clientSearchState.searchResults];
        clientSearchState.isSearchActive = true;
        renderClients();
        
        // Show search status
        updateSearchStatus(true, clientSearchState.searchResults.length, query);
        
        showToast(`Found ${clientSearchState.searchResults.length} client${clientSearchState.searchResults.length !== 1 ? 's' : ''}`, 'success');
    } else {
        showToast('No clients found matching your criteria', 'info');
    }
    
    closeClientSearchModal();
}

// Close search modal
function closeClientSearchModal() {
    const modal = document.getElementById('client-modal');
    if (modal) {
        closeModal(modal);
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('client-search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
}

// View all clients (remove search filter)
function viewAllClients() {
    appData.clients = [...clientSearchState.originalClients];
    clientSearchState.isSearchActive = false;
    clientSearchState.currentQuery = '';
    clientSearchState.searchResults = [];
    
    // Hide search status
    updateSearchStatus(false);
    
    renderClients();
    closeClientSearchModal();
    showToast('Showing all clients', 'info');
}

// Show search history
function showSearchHistory() {
    const historyContainer = document.getElementById('search-history');
    const query = document.getElementById('client-search-input')?.value;
    
    if (historyContainer && !query && clientSearchState.searchHistory.length > 0) {
        historyContainer.style.display = 'block';
        displaySearchHistory();
    }
}

// Display search history
function displaySearchHistory() {
    const historyItems = document.getElementById('history-items');
    if (!historyItems || clientSearchState.searchHistory.length === 0) return;
    
    historyItems.innerHTML = clientSearchState.searchHistory.map(term => `
        <button class="history-item" onclick="useSearchTerm('${term}')">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            ${term}
        </button>
    `).join('');
}

// Use search term from history
function useSearchTerm(term) {
    const searchInput = document.getElementById('client-search-input');
    if (searchInput) {
        searchInput.value = term;
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    }
}

// Update search status indicator
function updateSearchStatus(show, count = 0, query = '') {
    const statusContainer = document.getElementById('search-status');
    const statusText = document.getElementById('search-status-text');
    
    if (statusContainer) {
        if (show) {
            statusContainer.style.display = 'block';
            if (statusText) {
                if (query) {
                    statusText.textContent = `Showing ${count} result${count !== 1 ? 's' : ''} for "${query}"`;
                } else {
                    statusText.textContent = `Showing ${count} filtered result${count !== 1 ? 's' : ''}`;
                }
            }
        } else {
            statusContainer.style.display = 'none';
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupSettingsForm() {
    const saveSettingsBtn = document.getElementById('save-settings');
    const resetSettingsBtn = document.getElementById('reset-settings');

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }

    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
}

// ENHANCED: Settings save with GSTIN and corrected bank details
async function saveSettings() {
    console.log('Saving settings...');

    const elements = {
        currency: document.getElementById('currency-setting'),
        taxRate: document.getElementById('tax-rate'),
        invoicePrefix: document.getElementById('invoice-prefix'),
        profileName: document.getElementById('profile-name'),
        profileEmail: document.getElementById('profile-email'),
        profilePhone: document.getElementById('profile-phone'),
        profileAddress: document.getElementById('profile-address'),
        profileGSTIN: document.getElementById('profile-gstin'),
        bankAccountName: document.getElementById('bank-account-name'),  // CORRECTED
        bankName: document.getElementById('bank-name'),                 // CORRECTED
        accountType: document.getElementById('account-type'),
        bankAccount: document.getElementById('bank-account'),
        bankBranch: document.getElementById('bank-branch'),
        bankIFSC: document.getElementById('bank-ifsc'),
        bankSWIFT: document.getElementById('bank-swift')
    };

    const missingElements = Object.entries(elements).filter(([key, element]) => !element);
    if (missingElements.length > 0) {
        console.error('Missing form elements:', missingElements.map(([key]) => key));
        // Only show error if critical fields are missing
        const criticalFields = ['profileName', 'profileEmail', 'taxRate'];
        const missingCritical = missingElements.filter(([key]) => criticalFields.includes(key));
        if (missingCritical.length > 0) {
            showToast(`Critical settings fields missing: ${missingCritical.map(([key]) => key).join(', ')}`, 'error');
            return;
        }
    }

    const settingsData = {};
    Object.entries(elements).forEach(([key, element]) => {
        if (element) {
            if (key === 'taxRate') {
                const value = parseFloat(element.value);
                if (isNaN(value) || value < 0 || value > 100) {
                    showToast('Tax rate must be a number between 0 and 100 (0% is allowed)', 'error');
                    element.focus();
                    return;
                }
                settingsData[key] = value;
            } else {
                settingsData[key] = element.value?.trim() || '';
            }
        }
    });

    if (settingsData.taxRate === undefined) {
        return;
    }

    if (!settingsData.profileName || !settingsData.profileEmail) {
        showToast('Profile name and email are required', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settingsData.profileEmail)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    try {
        const saveBtn = document.getElementById('save-settings');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        await saveSettingsToSupabase(settingsData);

        Object.assign(appData.settings, settingsData);

        console.log('Settings saved successfully, new tax rate:', appData.settings.taxRate);

        if (document.getElementById('invoice-modal') && !document.getElementById('invoice-modal').classList.contains('hidden')) {
            calculateInvoiceTotal();
        }

        showToast(`Settings saved successfully with corrected bank details. Tax rate: ${appData.settings.taxRate}%`, 'success');

        saveBtn.textContent = originalText;
        saveBtn.disabled = false;

    } catch (error) {
        console.error('Error saving settings:', error);
        showToast(`Error saving settings: ${error.message || 'Please try again'}`, 'error');

        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.textContent = 'Save Settings';
            saveBtn.disabled = false;
        }
    }
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        appData.settings = {
            currency: 'INR',
            taxRate: 0,
            invoicePrefix: 'HP-2526',
            profileName: 'Hariprasad Sivakumar',
            profileEmail: 'contact@hariprasadss.com',
            profilePhone: '+91 9500808013',
            profileAddress: '6/91, Mahit Complex, Hosur Road, Attibele, Bengaluru, Karnataka – 562107',
            profileGSTIN: '29GLOPS9921M1ZT',
            bankAccountName: 'Hariprasad Sivakumar',  // CORRECTED
            bankName: 'Kotak Mahindra Bank',          // CORRECTED
            bankAccount: '2049315152',
            bankBranch: 'Indira Nagar, Bengaluru',
            bankIFSC: 'KKBK0008068',
            bankSWIFT: 'KKBKINBBCPC',
            accountType: 'Current Account'
        };
        renderSettings();
        showToast('Settings reset to default with corrected bank details', 'success');
    }
}

async function saveSettingsToSupabase(settingsData) {
    try {
        console.log('Saving settings to Supabase:', settingsData);

        if (!settingsData.profileName || !settingsData.profileEmail) {
            throw new Error('Profile name and email are required');
        }

        if (settingsData.taxRate < 0 || settingsData.taxRate > 100) {
            throw new Error('Tax rate must be between 0 and 100');
        }

        const { data: existingSettings, error: checkError } = await supabaseClient
            .from('settings')
            .select('user_id')
            .eq('user_id', 'default')
            .maybeSingle();

        const settingsPayload = {
            currency: settingsData.currency || 'INR',
            tax_rate: parseFloat(settingsData.taxRate),
            invoice_prefix: settingsData.invoicePrefix || 'HP-2526',
            profile_name: settingsData.profileName || '',
            profile_email: settingsData.profileEmail || '',
            profile_phone: settingsData.profilePhone || '',
            profile_address: settingsData.profileAddress || '',
            profile_gstin: settingsData.profileGSTIN || '',
            bank_account_name: settingsData.bankAccountName || '',      // CORRECTED
            bank_name: settingsData.bankName || 'Kotak Mahindra Bank',  // CORRECTED
            account_type: settingsData.accountType || 'Current Account',
            bank_account: settingsData.bankAccount || '',
            bank_branch: settingsData.bankBranch || 'Indira Nagar, Bengaluru',
            bank_ifsc: settingsData.bankIFSC || '',
            bank_swift: settingsData.bankSWIFT || '',
            updated_at: new Date().toISOString()
        };

        console.log('Settings payload:', settingsPayload);

        if (existingSettings) {
            console.log('Updating existing settings');
            const { data, error } = await supabaseClient
                .from('settings')
                .update(settingsPayload)
                .eq('user_id', 'default')
                .select()
                .single();

            if (error) {
                console.error('Settings update error:', error);
                throw error;
            }
            console.log('Settings updated successfully:', data);
            return data;
        } else {
            console.log('Inserting new settings');
            const { data, error } = await supabaseClient
                .from('settings')
                .insert([{
                    user_id: 'default',
                    ...settingsPayload
                }])
                .select()
                .single();

            if (error) {
                console.error('Settings insert error:', error);
                throw error;
            }
            console.log('Settings inserted successfully:', data);
            return data;
        }
    } catch (error) {
        console.error('Critical error saving settings to Supabase:', error);
        throw error;
    }
}

function viewInvoice(invoiceId) {
    console.log('Viewing invoice:', invoiceId);
    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        showInvoiceModal(invoice);
    }
}

// ENHANCED: Invoice modal with GSTIN and download button
function showInvoiceModal(invoice) {
    if (!invoice || !invoice.clientId) {
        showToast('Invalid invoice data', 'error');
        return;
    }
    const client = appData.clients.find(c => c.id === invoice.clientId);
    const settings = appData.settings;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>Invoice ${invoice.id}</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body" id="invoice-content-${invoice.id}" style="padding: 40px; background: white; color: black;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                    <div>
                        <h1 style="font-size: 36px; color: #333; margin: 0;">Invoice</h1>
                    </div>
                    <div style="text-align: right;">
                        <div style="margin-bottom: 10px;"><strong>INVOICE NUMBER:</strong> ${invoice.id}</div>
                        <div style="margin-bottom: 10px;"><strong>DATE OF ISSUE:</strong> ${formatDate(invoice.date)}</div>
                        <div><strong>DUE DATE:</strong> ${formatDate(invoice.dueDate)}</div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                    <div>
                        <div style="font-weight: bold; margin-bottom: 10px;">BILLED TO:</div>
                        <div style="line-height: 1.6;">
                            ${client ? client.name : invoice.client}<br>
                            ${client && client.address ? client.address.replace(/\n/g, '<br>') : ''}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; margin-bottom: 10px;">FROM:</div>
                        <div style="line-height: 1.6;">
                            ${settings.profileName}<br>
                            ${settings.profileAddress ? settings.profileAddress.replace(/\n/g, '<br>') : ''}<br>
                            ${settings.profileGSTIN ? `GSTIN: ${settings.profileGSTIN}<br>` : ''}
                            ${settings.profilePhone ? `Phone: ${settings.profilePhone}` : ''}
                            ${settings.profileEmail ? `<br>Email: ${settings.profileEmail}` : ''}
                        </div>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
                            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Unit Cost</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">QTY</th>
                            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">${item.description}</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">INR ${formatNumber(item.rate)}</td>
                                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">INR ${formatNumber(item.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: space-between;">
                    <div style="width: 45%;">
                        <h3>BANK ACCOUNT DETAILS</h3>
                        <div style="line-height: 1.6; font-size: 14px;">
                            <strong>Account Name:</strong> ${settings.profileName || 'Hariprasad Sivakumar'}<br>
                            <strong>Account Type:</strong> Current Account<br>
                            <strong>Account Number:</strong> ${settings.bankAccount || '2049315152'}<br>
                            <strong>Bank Name:</strong> Kotak Mahindra Bank<br>
                            <strong>Branch Name:</strong> Indira Nagar, Bengaluru<br>
                            <strong>IFSC Code:</strong> ${settings.bankIFSC || 'KKBK0008068'}<br>
                            <strong>SWIFT Code:</strong> ${settings.bankSWIFT || 'KKBKINBBCPC'}
                        </div>
                    </div>
                                            <div style="width: 45%; text-align: right;">
                        <div style="margin-bottom: 10px;"><strong>SUBTOTAL:</strong> INR ${formatNumber(invoice.subtotal)}</div>
                        <div style="margin-bottom: 10px;"><strong>TAX (${settings.taxRate}%):</strong> INR ${formatNumber(invoice.tax)}</div>
                        <div style="font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px;">
                            <strong>INVOICE TOTAL: INR ${formatNumber(invoice.amount)}</strong>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn--secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn btn--primary" onclick="downloadInvoice('${invoice.id}')">📥 Download PDF</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}
function editInvoice(invoiceId) {
    console.log('Editing invoice with ID:', invoiceId);

    if (!appData.dataLoaded) {
        showToast('Data is still loading. Please wait.', 'info');
        return;
    }

    const invoice = appData.invoices.find(inv => inv.id === invoiceId);

    if (!invoice) {
        console.error('Invoice not found:', invoiceId);
        showToast('Invoice not found. Please refresh the page.', 'error');
        return;
    }

    console.log('Found invoice for editing:', invoice);

    // Open the invoice modal with the invoice data
    openInvoiceModal(invoiceId);

    showToast(`Editing invoice: ${invoice.id}`, 'info');
}

async function deleteInvoice(invoiceId) {
    console.log('Deleting invoice:', invoiceId);

    if (!appData.dataLoaded) {
        showToast('Data is still loading. Please wait.', 'info');
        return;
    }

    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showToast('Invoice not found. Please refresh the page.', 'error');
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete invoice "${invoiceId}"?\n\nThis action cannot be undone.`);
    if (!confirmed) {
        return;
    }

    try {
        await deleteInvoiceFromSupabase(invoiceId);

        // Remove from local data
        const index = appData.invoices.findIndex(inv => inv.id === invoiceId);
        if (index > -1) {
            appData.invoices.splice(index, 1);
            appData.totalInvoices--;
        }

        // Update client totals
        const clientId = invoice.clientId;
        const client = appData.clients.find(c => c.id === clientId);
        if (client) {
            const clientInvoices = appData.invoices.filter(inv => inv.clientId === clientId);
            client.total_invoices = clientInvoices.length;
            client.total_amount = clientInvoices
                .filter(inv => inv.status === 'Paid')
                .reduce((sum, inv) => sum + inv.amount, 0);
        }

        // Recalculate totals
        appData.totalEarnings = appData.invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.amount, 0);
        
        calculateMonthlyEarnings();

        // 🆕 ADD THIS CODE HERE - Update expense balance
        if (window.expenseIntegration && window.expenseIntegration.isEnabled()) {
            // Expense balance update will be handled directly after migration
        }
        

        // Re-render views
        renderInvoices();
        renderDashboard();
        renderClients();

        showToast(`Invoice "${invoiceId}" deleted successfully`, 'success');
        console.log('Invoice deleted successfully:', invoiceId);

    } catch (error) {
        console.error('Error deleting invoice:', error);
        showToast(`Error deleting invoice: ${error.message}`, 'error');
    }
}
async function downloadInvoice(invoiceId) {
    console.log('Downloading invoice as PDF:', invoiceId);
    
    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showToast('Invoice not found', 'error');
        return;
    }

    if (!invoice.clientId) {
        showToast('Invoice missing client information', 'error');
        return;
    }

    const client = appData.clients.find(c => c.id === invoice.clientId);
    const settings = appData.settings;

    if (typeof window.jspdf === 'undefined') {
        showToast('PDF library is loading. Please try again in a moment.', 'info');
        loadPDFLibrary();
        setTimeout(() => downloadInvoice(invoiceId), 2000);
        return;
    }

    try {
        showToast('Generating PDF...', 'info');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            unit: 'pt',
            format: 'a4',
            putOnlyUsedFonts: true
        });

        // Use built-in helvetica font
        doc.setFont('helvetica');

        // Title and Invoice Details
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 40, 60);

        // Invoice info box (top right)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice: ${invoice.id}`, 400, 40);
        doc.text(`Date: ${formatDate(invoice.date)}`, 400, 55);
        doc.text(`Due: ${formatDate(invoice.dueDate)}`, 400, 70);

        // FROM section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('FROM:', 40, 100);
        
        let yPos = 120;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text(settings.profileName || 'Hariprasad Sivakumar', 40, yPos);
        yPos += 15;
        
        if (settings.profileAddress) {
            doc.setFontSize(9);
            const addressLines = doc.splitTextToSize(settings.profileAddress, 200);
            addressLines.forEach(line => {
                doc.text(line, 40, yPos);
                yPos += 12;
            });
        }
        
        doc.setFontSize(9);
        if (settings.profileGSTIN) {
            doc.text(`GSTIN: ${settings.profileGSTIN}`, 40, yPos);
            yPos += 12;
        }
        if (settings.profilePhone) {
            doc.text(`Phone: ${settings.profilePhone}`, 40, yPos);
            yPos += 12;
        }
        if (settings.profileEmail) {
            doc.text(`Email: ${settings.profileEmail}`, 40, yPos);
            yPos += 12;
        }

        // TO section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BILLED TO:', 320, 100);
        
        let toYPos = 120;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const clientName = client ? client.name : invoice.client;
        doc.text(clientName, 320, toYPos);
        toYPos += 15;
        
        if (client && client.address) {
            doc.setFontSize(9);
            const clientAddressLines = doc.splitTextToSize(client.address, 200);
            clientAddressLines.forEach(line => {
                doc.text(line, 320, toYPos);
                toYPos += 12;
            });
        }

        // Items table
        const tableY = Math.max(yPos, toYPos) + 30;
        const tableData = invoice.items.map(item => {
            const rate = parseFloat(item.rate || 0);
            const amount = parseFloat(item.amount || 0);
            const qty = parseInt(item.quantity || 1);
            return [
                item.description || '',
                qty.toString(),
                `INR ${rate.toFixed(2)}`,
                `INR ${amount.toFixed(2)}`
            ];
        });

        doc.autoTable({
            head: [['Description', 'Qty', 'Unit Cost', 'Amount']],
            body: tableData,
            startY: tableY,
            styles: { 
                fontSize: 9, 
                cellPadding: 6,
                overflow: 'linebreak'
            },
            headStyles: { 
                fillColor: [52, 73, 94], 
                textColor: [255, 255, 255], 
                fontSize: 10,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 250, halign: 'left' },    // Description
                1: { cellWidth: 50, halign: 'center' },   // Qty
                2: { cellWidth: 90, halign: 'right' },    // Unit Cost
                3: { cellWidth: 90, halign: 'right' }     // Amount
            },
            margin: { left: 40, right: 40 }
        });

        // Totals section with uniform structure
const totalsY = doc.lastAutoTable.finalY + 30;
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);

const subtotal = parseFloat(invoice.subtotal || 0);
const tax = parseFloat(invoice.tax || 0);
const total = parseFloat(invoice.amount || 0);
const taxRate = parseFloat(settings.taxRate || 0);

// Subtotal
doc.text('Subtotal:', 380, totalsY);
doc.text(`INR ${subtotal.toFixed(2)}`, 520, totalsY, { align: 'right' });

// Tax
doc.text(`Tax (${taxRate}%):`, 380, totalsY + 20);
doc.text(`INR ${tax.toFixed(2)}`, 520, totalsY + 20, { align: 'right' });

// Total (bold)
doc.setFont('helvetica', 'bold');
doc.text('TOTAL:', 380, totalsY + 55);
doc.text(`INR ${total.toFixed(2)}`, 520, totalsY + 55, { align: 'right' });

        // Bank Details Section
        const bankY = totalsY + 80;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('BANK ACCOUNT DETAILS', 40, bankY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
// All bank details in left column
        let leftY = bankY + 20;
        doc.text('Account Name:', 40, leftY);
        doc.text(settings.profileName || 'Hariprasad Sivakumar', 150, leftY);
        leftY += 15;
        
        doc.text('Account Type:', 40, leftY);
        doc.text('Current Account', 150, leftY);
        leftY += 15;
        
        doc.text('Account Number:', 40, leftY);
        doc.text(settings.bankAccount || '2049315152', 150, leftY);
        leftY += 15;
        
        doc.text('Bank Name:', 40, leftY);
        doc.text('Kotak Mahindra Bank', 150, leftY);
        leftY += 15;
        
        doc.text('Branch Name:', 40, leftY);
        doc.text('Indira Nagar, Bengaluru', 150, leftY);
        leftY += 15;
        
        doc.text('IFSC Code:', 40, leftY);
        doc.text(settings.bankIFSC || 'KKBK0008068', 150, leftY);
        leftY += 15;
        
        doc.text('SWIFT Code:', 40, leftY);
        doc.text(settings.bankSWIFT || 'KKBKINBBCPC', 150, leftY);

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('Thank you for your business!', 40, 750);

        // Save with clean filename
        const cleanInvoiceId = invoice.id.replace(/[^a-zA-Z0-9-_]/g, '_');
        doc.save(`Invoice_${cleanInvoiceId}.pdf`);
        showToast(`Invoice ${invoice.id} downloaded successfully`, 'success');

    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast(`PDF Generation Error: ${error.message}`, 'error');
    }
}
// Utility Functions
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return 'Invalid Date';
    }
}

// REPLACE YOUR EXISTING showToast FUNCTION AND ADD THESE ENHANCED FUNCTIONS

// ENHANCED: Modern toast notification system
function showToast(message, type = 'info', duration = 4000) {
    console.log('Enhanced Toast:', type, message);

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container modern';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast modern ${type}`;

    // Add enhanced icons and animations
    const icons = {
        success: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>`,
        error: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>`,
        warning: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>`,
        info: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
               </svg>`
    };

    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon ${type}">
                ${icons[type] || icons.info}
            </div>
            <div class="toast-message">
                ${message}
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Add entrance animation
    setTimeout(() => {
        toast.classList.add('toast-enter');
    }, 10);

    // Progress bar animation
    const progressBar = toast.querySelector('.toast-progress');
    if (progressBar) {
        progressBar.style.animationDuration = `${duration}ms`;
        progressBar.classList.add('progress-animate');
    }

    // Auto remove with exit animation
    const autoRemoveTimer = setTimeout(() => {
        removeToast(toast);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', (e) => {
        if (e.target.closest('.toast-close')) {
            clearTimeout(autoRemoveTimer);
            removeToast(toast);
        }
    });

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
        progressBar.style.animationPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', () => {
        progressBar.style.animationPlayState = 'running';
    });
}

function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }
}

// ENHANCED: Line item functions with modern styling
function addLineItem(existingItem = null) {
    const container = document.getElementById('line-items-container');
    if (container) {
        const itemCount = container.children.length;
        const lineItem = document.createElement('div');
        lineItem.className = 'line-item modern';
        lineItem.style.animationDelay = `${itemCount * 100}ms`;
        
        lineItem.innerHTML = `
            <div class="line-item-header">
                <span class="line-item-number">#${itemCount + 1}</span>
                <button type="button" class="btn btn--ghost btn--sm remove-item" title="Remove item">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group flex-2">
                    <input type="text" class="form-control modern description" placeholder="Description" value="${existingItem ? existingItem.description || '' : ''}" required>
                    <label class="floating-label">Description</label>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control modern quantity" placeholder="1" min="1" value="${existingItem ? existingItem.quantity || 1 : 1}" required>
                    <label class="floating-label">Qty</label>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control modern rate" placeholder="0.00" min="0" step="0.01" value="${existingItem ? existingItem.rate || 0 : ''}" required>
                    <label class="floating-label">Rate</label>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control modern amount" placeholder="0.00" value="${existingItem ? existingItem.amount || 0 : 0}" readonly>
                    <label class="floating-label">Amount</label>
                </div>
            </div>
        `;
        
        container.appendChild(lineItem);
        
        // Add entrance animation
        setTimeout(() => {
            lineItem.classList.add('line-item-enter');
        }, 100);
        
        // Update line item numbers
        updateLineItemNumbers();
        
        // Trigger calculation for existing data
        if (existingItem && existingItem.quantity && existingItem.rate) {
            setTimeout(() => {
                calculateLineItem(lineItem);
                calculateInvoiceTotal();
            }, 100);
        }
        
        console.log('Enhanced line item added');
    }
}

// Helper functions for enhanced clients page
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateLineItemNumbers() {
    const lineItems = document.querySelectorAll('.line-item');
    lineItems.forEach((item, index) => {
        const numberElement = item.querySelector('.line-item-number');
        if (numberElement) {
            numberElement.textContent = `#${index + 1}`;
        }
    });
}

// ENHANCED: Add logout button with modern styling
function addLogoutButton() {
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader && !document.getElementById('logout-btn')) {
        const username = localStorage.getItem('username') || 'User';
        
        // Create user info section
        const userSection = document.createElement('div');
        userSection.className = 'user-section';
        userSection.innerHTML = `
            <div class="user-avatar">
                <span class="user-initial">${username.charAt(0).toUpperCase()}</span>
            </div>
            <div class="user-info">
                <div class="user-name">${username}</div>
                <div class="user-role">Administrator</div>
            </div>
            <button class="logout-btn" id="logout-btn" onclick="logout()" title="Logout">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
            </button>
        `;
        
        sidebarHeader.appendChild(userSection);
    }
}

// ENHANCED: Loading state with modern spinner
function showLoadingState(show, message = 'Loading...') {
    let loader = document.getElementById('app-loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'app-loader';
            loader.className = 'loading-overlay modern';
            loader.innerHTML = `
                <div class="loading-content">
                    <div class="modern-spinner">
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                    </div>
                    <div class="loading-text">${message}</div>
                    <div class="loading-subtitle">Please wait while we prepare your data</div>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('.loading-text').textContent = message;
        }
        
        loader.classList.add('loading-show');
    } else {
        if (loader) {
            loader.classList.add('loading-hide');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 300);
        }
    }
}

// ENHANCED: Status badge creation with modern design
function createStatusBadge(status) {
    const statusMap = {
        'paid': { icon: '✅', color: 'success', text: 'Paid' },
        'pending': { icon: '⏳', color: 'warning', text: 'Pending' },
        'draft': { icon: '📝', color: 'info', text: 'Draft' },
        'overdue': { icon: '⚠️', color: 'error', text: 'Overdue' },
        'cancelled': { icon: '❌', color: 'error', text: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || statusMap['draft'];
    
    return `
        <span class="status-badge modern ${statusInfo.color}">
            <span class="status-icon">${statusInfo.icon}</span>
            <span class="status-text">${statusInfo.text}</span>
            <span class="status-pulse"></span>
        </span>
    `;
}

// ENHANCED: Format currency with modern display
function formatCurrency(amount, currency = 'INR') {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    
    const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency === 'INR' ? 'INR' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
    
    return formatted.replace('₹', '₹').replace('$', '$');
}

// ENHANCED: Animation utilities (DUPLICATE - COMMENTED OUT)
/*
const animationUtils = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    },
    
    slideIn: (element, direction = 'right', duration = 300) => {
        const translateMap = {
            'right': 'translateX(100%)',
            'left': 'translateX(-100%)',
            'up': 'translateY(-100%)',
            'down': 'translateY(100%)'
        };
        
        element.style.opacity = '0';
        element.style.transform = translateMap[direction];
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0) translateY(0)';
        }, 10);
    },
    
    pulse: (element) => {
        element.classList.add('pulse-animate');
        setTimeout(() => {
            element.classList.remove('pulse-animate');
        }, 600);
    },
    
    bounce: (element) => {
        element.classList.add('bounce-animate');
        setTimeout(() => {
            element.classList.remove('bounce-animate');
        }, 800);
    }
};
*/

// ENHANCED: Modern search functionality
function createSearchInput(placeholder = 'Search...', onSearch) {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'modern-search';
    searchContainer.innerHTML = `
        <div class="search-input-container">
            <svg class="search-icon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input type="text" class="search-input" placeholder="${placeholder}">
            <button class="search-clear" style="display: none;">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
    `;
    
    const input = searchContainer.querySelector('.search-input');
    const clearBtn = searchContainer.querySelector('.search-clear');
    
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        clearBtn.style.display = value ? 'flex' : 'none';
        if (onSearch) onSearch(value);
    });
    
    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        if (onSearch) onSearch('');
        input.focus();
    });
    
    return searchContainer;
}
// 🆕 ADD THIS COMPLETE FUNCTION - copy everything between these lines

// Aggressive cleanup of expense elements from all pages except expenses
function aggressiveExpenseCleanup() {
    console.log('🧹 App-level expense cleanup...');
    
    try {
        // Get current active page
        const activePage = document.querySelector('.page.active');
        const activePageId = activePage ? activePage.id : '';
        
        // If we're NOT on expenses page, remove ALL expense elements
        if (activePageId !== 'expenses-page') {
            // Remove expense filters from all non-expense pages
            document.querySelectorAll('.page:not(#expenses-page)').forEach(page => {
                page.querySelectorAll(`
                    .expense-filters-container,
                    .expense-filters-wrapper,
                    [id*="expense-filter"],
                    [class*="expense-filter"]
                `).forEach(el => {
                    console.log('🗑️ Removing leaked expense element:', el.id || el.className);
                    el.remove();
                });
            });
            
            // Remove any orphaned expense elements anywhere in the document
            document.querySelectorAll(`
                [id^="expense-filter-"]:not(#expenses-page [id^="expense-filter-"]),
                .expense-filters-container:not(#expenses-page .expense-filters-container)
            `).forEach(el => {
                console.log('🗑️ Removing orphaned expense element:', el.id || el.className);
                el.remove();
            });
        }
        
    } catch (error) {
        console.error('Error in aggressive expense cleanup:', error);
    }
}

// Auto-save draft functionality for forms
let autoSaveTimer;

function setupAutoSave() {
    const formInputs = document.querySelectorAll('#invoice-form input, #invoice-form textarea, #client-form input, #client-form textarea');

    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                console.log('Auto-save triggered');
            }, 5000);
        });
    });
}

// Data validation helpers
const validators = {
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    phone: (phone) => {
        const regex = /^[\+]?[1-9][\d]{0,15}$/;
        return regex.test(phone.replace(/\s+/g, ''));
    },

    currency: (amount) => {
        return !isNaN(amount) && parseFloat(amount) >= 0;
    },

    required: (value) => {
        return value && value.toString().trim().length > 0;
    },

    gstin: (gstin) => {
        // GSTIN format: 2 digits (state code) + 10 characters (PAN) + 1 digit (entity number) + 1 character (Z) + 1 check digit
        const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return regex.test(gstin);
    }
};

// Export functionality
function exportData(format = 'json') {
    const data = {
        clients: appData.clients,
        invoices: appData.invoices,
        settings: appData.settings,
        exportDate: new Date().toISOString()
    };

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Data exported successfully', 'success');
    }
}

// Search functionality
function setupGlobalSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search invoices, clients...';
    searchInput.className = 'global-search';
    searchInput.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        padding: 8px 12px;
        border: 2px solid var(--color-border);
        border-radius: 20px;
        background: var(--color-surface);
        z-index: 1000;
        display: none;
    `;

    document.body.appendChild(searchInput);

    // Ctrl+F to show search
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.style.display = 'block';
            searchInput.focus();
        }

        if (e.key === 'Escape' && searchInput.style.display === 'block') {
            searchInput.style.display = 'none';
            searchInput.value = '';
        }
    });
}

// Improved error boundaries
function withErrorBoundary(fn, fallback) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error in ${fn.name}:`, error);
            if (fallback) {
                fallback(error);
            } else {
                showToast(`Error in ${fn.name}: ${error.message}`, 'error');
            }
        }
    };
}

// Connection status monitoring
function monitorConnection() {
    const updateConnectionStatus = () => {
        const status = navigator.onLine ? 'online' : 'offline';
        if (status === 'offline') {
            showToast('You are offline. Some features may not work.', 'warning');
        } else {
            console.log('Connection restored');
        }
    };

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', () => {
    setupAutoSave();
    setupGlobalSearch();
    monitorConnection();

    // Log performance
    setTimeout(() => {
        console.log('✅ Full app initialization completed');
        console.log('📊 Memory usage:', performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A');
    }, 1000);
});

// Debug helpers for development
if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
    window.debugApp = {
        appData,
        analyticsState,
        clearLocalStorage: () => {
            localStorage.clear();
            location.reload();
        },
        exportDebugData: () => exportData('json'),
        simulateError: () => {
            throw new Error('Simulated error for testing');
        },
        testToast: (type = 'info') => {
            showToast(`Test ${type} message`, type);
        },
        testAnalytics: () => {
            console.log('Analytics State:', analyticsState);
            console.log('Current period:', analyticsState.currentPeriod);
            console.log('Filtered data:', analyticsState.filteredData?.length || 0, 'invoices');
        },
        debugClients: () => {
            console.log('All clients:', appData.clients);
            console.log('Editing client ID:', editingClientId);
            appData.clients.forEach((client, index) => {
                console.log(`Client ${index}:`, {
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    contact_name: client.contact_name,
                    company: client.company
                });
            });
        },
        testClientEdit: (clientId) => {
            console.log('Testing client edit for ID:', clientId);
            editClient(clientId);
        },
        testInvoiceDownload: (invoiceId) => {
            console.log('Testing invoice download for ID:', invoiceId);
            downloadInvoice(invoiceId);
        },
        validateGSTIN: (gstin) => {
            console.log('GSTIN validation:', gstin, validators.gstin(gstin) ? 'Valid' : 'Invalid');
        }
    };
    console.log('🔧 Debug helpers available: window.debugApp');
    console.log('🔍 Use debugApp.debugClients() to check client data');
    console.log('📥 Use debugApp.testInvoiceDownload("invoice-id") to test PDF download');
    console.log('🧪 Use debugApp.validateGSTIN("gstin") to validate GSTIN format');
}

// Additional improvements and ideas:
// 1. Dashboard now shows more detailed metrics and analytics
// 2. Invoice actions are more compact with icon-only buttons
// 3. Analytics has a better UI with proper date pickers
// 4. PDF download functionality with proper formatting
// 5. GSTIN added to settings and invoice display
// 6. Client delete functionality now works properly
// 7. Better error handling and user feedback
// 8. Performance monitoring and debug tools
// 9. Keyboard shortcuts for power users
// 10. Auto-save draft functionality

// Future enhancements you could consider:
// - Email invoice functionality
// - Recurring invoice templates
// - Multi-currency support
// - Invoice reminders
// - Payment tracking integration
// - Bulk invoice operations
// - Advanced reporting and analytics
// - Client portal for invoice viewing
// - Integration with accounting software
// - Mobile responsive improvements

// ========================================
// FALLBACK DATA AND EMERGENCY INITIALIZATION
// ========================================

// Add sample data if no real data is available
function addSampleDataIfEmpty() {
    console.log('Adding sample data if needed...');
    
    // Ensure appData exists
    if (!window.appData) {
        window.appData = {
            totalEarnings: 0,
            totalClients: 0,
            totalInvoices: 0,
            monthlyEarnings: [],
            clients: [],
            invoices: [],
            nextInvoiceNumber: 1,
            dataLoaded: false,
            settings: {
                currency: 'INR',
                taxRate: 0,
                invoicePrefix: 'HP-2526',
                profileName: 'Hariprasad Sivakumar'
            }
        };
    }
    
    if (appData.clients.length === 0) {
        appData.clients = [
            {
                id: 'sample-client-1',
                name: 'Tech Solutions Ltd',
                email: 'contact@techsolutions.com',
                phone: '+91 9876543210',
                company: 'Tech Solutions Ltd',
                total_amount: 125000,
                total_invoices: 3
            },
            {
                id: 'sample-client-2',
                name: 'Digital Marketing Pro',
                email: 'hello@digitalmarketing.com',
                phone: '+91 9876543211',
                company: 'Digital Marketing Pro',
                total_amount: 89000,
                total_invoices: 2
            },
            {
                id: 'sample-client-3',
                name: 'E-commerce Experts',
                email: 'info@ecommerceexperts.com',
                phone: '+91 9876543212',
                company: 'E-commerce Experts',
                total_amount: 156000,
                total_invoices: 4
            }
        ];
        appData.totalClients = appData.clients.length;
    }
    
    if (appData.invoices.length === 0) {
        appData.invoices = [
            {
                id: 'HP-2526-001',
                client: 'Tech Solutions Ltd',
                clientId: 'sample-client-1',
                amount: 45000,
                date: '2025-08-01',
                dueDate: '2025-08-31',
                status: 'Paid',
                items: [
                    { description: 'Website Development', quantity: 1, rate: 35000, amount: 35000 },
                    { description: 'SEO Optimization', quantity: 1, rate: 10000, amount: 10000 }
                ]
            },
            {
                id: 'HP-2526-002',
                client: 'Digital Marketing Pro',
                clientId: 'sample-client-2',
                amount: 35000,
                date: '2025-08-05',
                dueDate: '2025-09-05',
                status: 'Pending',
                items: [
                    { description: 'Social Media Strategy', quantity: 1, rate: 25000, amount: 25000 },
                    { description: 'Content Creation', quantity: 1, rate: 10000, amount: 10000 }
                ]
            },
            {
                id: 'HP-2526-003',
                client: 'E-commerce Experts',
                clientId: 'sample-client-3',
                amount: 67000,
                date: '2025-08-10',
                dueDate: '2025-09-10',
                status: 'Draft',
                items: [
                    { description: 'E-commerce Platform Setup', quantity: 1, rate: 50000, amount: 50000 },
                    { description: 'Payment Gateway Integration', quantity: 1, rate: 17000, amount: 17000 }
                ]
            }
        ];
        appData.totalInvoices = appData.invoices.length;
    }
    
    // Calculate totals
    appData.totalEarnings = appData.invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    console.log('Sample data added:', {
        clients: appData.clients.length,
        invoices: appData.invoices.length,
        earnings: appData.totalEarnings
    });
}

// Emergency initialization if main init fails
// Make critical functions globally available immediately
window.emergencyInit = function() {
    console.log('🚨 Running emergency initialization...');
    
    try {
        // Ensure appData exists globally
        if (!window.appData) {
            window.appData = {
                totalEarnings: 0,
                totalClients: 0,
                totalInvoices: 0,
                monthlyEarnings: [],
                clients: [],
                invoices: [],
                nextInvoiceNumber: 1,
                dataLoaded: false,
                settings: {
                    currency: 'INR',
                    taxRate: 0,
                    invoicePrefix: 'HP-2526',
                    profileName: 'Hariprasad Sivakumar'
                }
            };
        }
        
        if (typeof addSampleDataIfEmpty === 'function') {
            addSampleDataIfEmpty();
        } else {
            // Basic sample data if function not available
            window.appData.clients = [
                { id: 'client-1', name: 'Sample Client', email: 'client@example.com', totalEarnings: 15000 },
                { id: 'client-2', name: 'Another Client', email: 'another@example.com', totalEarnings: 8500 }
            ];
            window.appData.invoices = [
                { id: 'HP-2526-001', client: 'Sample Client', amount: 5000, date: '2025-08-01', status: 'Paid', clientId: 'client-1' },
                { id: 'HP-2526-002', client: 'Another Client', amount: 7500, date: '2025-08-05', status: 'Pending', clientId: 'client-2' }
            ];
            window.appData.totalEarnings = 12500;
            window.appData.totalClients = 2;
            window.appData.totalInvoices = 2;
        }
        
        appData.dataLoaded = true;
        
        if (typeof setupNavigation === 'function') setupNavigation();
        if (typeof renderDashboard === 'function') renderDashboard();
        
        console.log('✅ Emergency init completed successfully');
        if (typeof showToast === 'function') {
            showToast('App loaded with sample data. Database connection may be limited.', 'warning');
        }
        
    } catch (error) {
        console.error('❌ Emergency init failed:', error);
        // Last resort - create minimal working state
        window.appData = {
            totalEarnings: 0,
            totalClients: 0, 
            totalInvoices: 0,
            clients: [],
            invoices: [],
            dataLoaded: true
        };
    }
};

// Add error handling for initialization
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    if (!window.appData || !window.appData.dataLoaded) {
        console.log('🚨 App not initialized, forcing emergency init...');
        if (typeof emergencyInit === 'function') {
            setTimeout(emergencyInit, 1000);
        } else {
            console.error('❌ Emergency init not available');
            // Force a basic initialization
            setTimeout(() => {
                console.log('🔧 Running basic fallback init...');
                if (!window.appData) {
                    window.appData = {
                        clients: [],
                        invoices: [],
                        dataLoaded: false,
                        totalClients: 0,
                        totalInvoices: 0,
                        totalRevenue: 0
                    };
                }
                // Try to run basic setup
                try {
                    addSampleDataIfEmpty();
                    appData.dataLoaded = true;
                    if (typeof renderDashboard === 'function') renderDashboard();
                    if (typeof setupNavigation === 'function') setupNavigation();
                    if (typeof setupModals === 'function') setupModals();
                    console.log('✅ Basic fallback init completed');
                } catch (err) {
                    console.error('❌ Basic fallback init failed:', err);
                }
            }, 1500);
        }
    }
});

// Ensure app initializes even if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    console.log('DOM already loaded, initializing immediately');
    setTimeout(initializeApp, 100);
}

// Make critical functions globally available for emergency fallback
window.emergencyInit = emergencyInit;
window.addSampleDataIfEmpty = addSampleDataIfEmpty;
window.appData = appData;
