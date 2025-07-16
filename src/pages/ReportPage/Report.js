// Report.js - Frontend Component for Asset Tracking Reports
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Calendar, BarChart3, Download, 
  Trash2, Search, Plus, Clock, 
  AlertCircle, CheckCircle, Loader2, RefreshCw,
  Activity, MapPin, Settings, TrendingUp
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import './Report.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/reports';

// Report types matching your backend
const REPORT_TYPES = {
  DAILY_SUMMARY: 'daily_summary',
  UTILIZATION: 'utilization', 
  ASSET_SUMMARY: 'asset_summary',
  CUSTOM: 'custom'
};

// Predefined queries for quick generation
const QUICK_QUERIES = {
  DAILY_SUMMARY: {
    title: 'Daily Asset Tracking Summary',
    query: 'Generate a comprehensive daily asset tracking summary report including alerts, utilization, and configuration updates for today.',
    type: REPORT_TYPES.DAILY_SUMMARY,
    icon: Activity,
    description: 'Complete overview of daily asset activities'
  },
  UTILIZATION: {
    title: 'Asset Utilization Report',
    query: 'Analyze asset utilization by zones and provide insights on asset usage patterns and efficiency.',
    type: REPORT_TYPES.UTILIZATION,
    icon: TrendingUp,
    description: 'Zone-wise asset utilization analysis'
  },
  ALERTS: {
    title: 'Real-time Alerts Report',
    query: 'Generate a report of all real-time alerts for the specified date including severity levels and recommended actions.',
    type: REPORT_TYPES.CUSTOM,
    icon: AlertCircle,
    description: 'Critical alerts and security events'
  },
  CONFIG_UPDATES: {
    title: 'Configuration Updates Report',
    query: 'Show all configuration updates made to assets, users, floors, zones, and organizations for the specified date.',
    type: REPORT_TYPES.CUSTOM,
    icon: Settings,
    description: 'System configuration changes'
  }
};

const ReportDashboard = () => {
  const [state, setState] = useState({
    reports: [],
    loading: false,
    generating: false,
    query: '',
    selectedReport: null,
    activeTab: 'generate',
    reportType: '',
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: new Date().toISOString().split('T')[0],   // Default to today
    assetIds: '',
    notification: null,
    showQuickOptions: true
  });

  const getAuthHeaders = useCallback(() => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token') || 'demo-token'}`,
    'Content-Type': 'application/json'
  }), []);

  const showNotification = useCallback((message, type = 'info') => {
    setState(prev => ({ ...prev, notification: { message, type } }));
    setTimeout(() => setState(prev => ({ ...prev, notification: null })), 5000);
  }, []);

  const handleUnauthorized = useCallback(() => {
    showNotification('Session expired. Please login again.', 'error');
    // Uncomment if you have a login route
    // window.location.href = '/login';
  }, [showNotification]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  }, []);

  const fetchReportHistory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${API_BASE}/history?limit=50`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, reports: data }));
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      showNotification(error.message, 'error');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [getAuthHeaders, handleUnauthorized, showNotification]);

  const generateReport = useCallback(async (customQuery = null, customType = null) => {
    const queryToUse = customQuery || state.query;
    
    if (!queryToUse.trim()) {
      showNotification('Please enter a report query or select a quick option', 'error');
      return;
    }

    setState(prev => ({ ...prev, generating: true }));
    try {
      const payload = {
        query: queryToUse,
        report_type: customType || state.reportType || null,
        start_date: state.startDate || null,
        end_date: state.endDate || null,
        asset_ids: state.assetIds ? state.assetIds.split(',').map(id => id.trim()).filter(id => id) : null
      };

      console.log('Generating report with payload:', payload);

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('Report generated successfully!', 'success');
        
        // Clear form if not using quick query
        if (!customQuery) {
          setState(prev => ({
            ...prev,
            query: '',
            reportType: '',
            assetIds: '',
            generating: false
          }));
        } else {
          setState(prev => ({ ...prev, generating: false }));
        }
        
        // Refresh history and switch to history tab
        await fetchReportHistory();
        setState(prev => ({ ...prev, activeTab: 'history' }));
        
        // Auto-view the new report
        if (data.report_id) {
          setTimeout(() => viewReport(data.report_id), 1000);
        }
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Report generation failed (${response.status})`);
      }
    } catch (error) {
      console.error('Generate report error:', error);
      showNotification(error.message, 'error');
      setState(prev => ({ ...prev, generating: false }));
    }
  }, [state, getAuthHeaders, showNotification, handleUnauthorized, fetchReportHistory]);

  const viewReport = useCallback(async (reportId) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${API_BASE}/${reportId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, selectedReport: data, loading: false }));
      } else if (response.status === 401) {
        handleUnauthorized();
      } else if (response.status === 404) {
        showNotification('Report not found', 'error');
      } else {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }
    } catch (error) {
      console.error('View report error:', error);
      showNotification(error.message, 'error');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [getAuthHeaders, handleUnauthorized, showNotification]);

  const deleteReport = useCallback(async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/${reportId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        showNotification('Report deleted successfully', 'success');
        fetchReportHistory();
        // Close modal if viewing deleted report
        setState(prev => ({
          ...prev,
          selectedReport: prev.selectedReport?.report_id === reportId ? null : prev.selectedReport
        }));
      } else if (response.status === 401) {
        handleUnauthorized();
      } else if (response.status === 404) {
        showNotification('Report not found', 'error');
      } else {
        throw new Error(`Failed to delete report: ${response.status}`);
      }
    } catch (error) {
      console.error('Delete report error:', error);
      showNotification(error.message, 'error');
    }
  }, [getAuthHeaders, showNotification, handleUnauthorized, fetchReportHistory]);

  const generatePDF = useCallback((report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = 20;
    
    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 10) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(`${getReportTypeLabel(report.report_type)} Report`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Metadata
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report ID: ${report.report_id}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Generated: ${formatDate(report.generated_at)}`, margin, yPosition);
    yPosition += 7;
    
    if (report.parameters?.query) {
      const queryLines = doc.splitTextToSize(`Query: ${report.parameters.query}`, pageWidth - margin * 2);
      doc.text(queryLines, margin, yPosition);
      yPosition += queryLines.length * 7;
    }
    
    yPosition += 10;
    
    // Content header
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Report Content', margin, yPosition);
    yPosition += 10;
    
    // Process content
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    const content = report.content || 'No content available';
    const contentLines = content.split('\n');
    
    contentLines.forEach(line => {
      if (line.trim()) {
        checkPageBreak(7);
        const splitLines = doc.splitTextToSize(line, pageWidth - margin * 2);
        doc.text(splitLines, margin, yPosition);
        yPosition += splitLines.length * 7;
      } else {
        yPosition += 3; // Empty line spacing
      }
    });
    
    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('Generated by AssetLens', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
    
    return doc;
  }, [formatDate]);

  const downloadReport = useCallback(async (reportId) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`${API_BASE}/${reportId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const report = await response.json();
        const pdfDoc = generatePDF(report);
        const filename = `${getReportTypeLabel(report.report_type).replace(/\s+/g, '_')}_${report.report_id}.pdf`;
        pdfDoc.save(filename);
        showNotification('Report downloaded as PDF', 'success');
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        throw new Error(`Failed to download report: ${response.status}`);
      }
    } catch (error) {
      console.error('Download report error:', error);
      showNotification(error.message, 'error');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [getAuthHeaders, showNotification, handleUnauthorized, generatePDF]);

  const handleInputChange = (field, value) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const setActiveTab = (tab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const useQuickQuery = (queryKey) => {
    const quickQuery = QUICK_QUERIES[queryKey];
    setState(prev => ({
      ...prev,
      query: quickQuery.query,
      reportType: quickQuery.type,
      showQuickOptions: false
    }));
  };

  useEffect(() => {
    fetchReportHistory();
  }, [fetchReportHistory]);

  const getReportTypeLabel = (type) => {
    switch (type) {
      case REPORT_TYPES.DAILY_SUMMARY: return 'Daily Summary';
      case REPORT_TYPES.UTILIZATION: return 'Utilization';
      case REPORT_TYPES.ASSET_SUMMARY: return 'Asset Summary';
      default: return 'Custom';
    }
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case REPORT_TYPES.DAILY_SUMMARY: return 'report-badge-blue';
      case REPORT_TYPES.UTILIZATION: return 'report-badge-green';
      case REPORT_TYPES.ASSET_SUMMARY: return 'report-badge-purple';
      default: return 'report-badge-gray';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Asset Tracking Reports</h1>
        <p className="dashboard-subtitle">Generate comprehensive reports using AI-powered analysis</p>
      </div>

      <div className="dashboard-main">
        <div className="tab-navigation">
          <nav className="tab-nav">
            <button 
              onClick={() => setActiveTab('generate')} 
              className={`tab-button ${state.activeTab === 'generate' ? 'tab-active' : ''}`}
            >
              <Plus className="tab-icon" /> Generate Report
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`tab-button ${state.activeTab === 'history' ? 'tab-active' : ''}`}
            >
              <Clock className="tab-icon" /> 
              Report History 
              {state.reports.length > 0 && (
                <span className="tab-badge">{state.reports.length}</span>
              )}
            </button>
          </nav>
        </div>

        {state.activeTab === 'generate' && (
          <div className="content-card">
            <h2 className="card-title">Generate New Report</h2>
            
            {/* Quick Report Options */}
            {state.showQuickOptions && (
              <div className="quick-options">
                <h3 className="quick-title">Quick Report Templates</h3>
                <div className="quick-grid">
                  {Object.entries(QUICK_QUERIES).map(([key, query]) => {
                    const IconComponent = query.icon;
                    return (
                      <div key={key} className="quick-card" onClick={() => useQuickQuery(key)}>
                        <div className="quick-icon">
                          <IconComponent size={24} />
                        </div>
                        <h4 className="quick-card-title">{query.title}</h4>
                        <p className="quick-card-description">{query.description}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="quick-divider">
                  <span>Or create a custom report</span>
                </div>
              </div>
            )}

            <div className="form-container">
              <div className="form-group">
                <label className="form-label">Report Query *</label>
                <textarea
                  value={state.query}
                  onChange={(e) => handleInputChange('query', e.target.value)}
                  placeholder="Describe what you want to report on... (e.g., 'Generate a daily summary for assets in Zone A with alerts from yesterday')"
                  className="form-textarea"
                  rows="4"
                />
                {state.query && (
                  <button 
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, query: '', showQuickOptions: true }))}
                    className="clear-query-btn"
                  >
                    Clear & Show Templates
                  </button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Report Type</label>
                  <select
                    value={state.reportType}
                    onChange={(e) => handleInputChange('reportType', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Auto-detect</option>
                    <option value={REPORT_TYPES.DAILY_SUMMARY}>Daily Summary</option>
                    <option value={REPORT_TYPES.UTILIZATION}>Utilization Analysis</option>
                    <option value={REPORT_TYPES.ASSET_SUMMARY}>Asset Summary</option>
                    <option value={REPORT_TYPES.CUSTOM}>Custom Report</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={state.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    value={state.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Asset IDs (Optional)</label>
                  <input
                    type="text"
                    value={state.assetIds}
                    onChange={(e) => handleInputChange('assetIds', e.target.value)}
                    placeholder="a0001, a0002, a0003"
                    className="form-input"
                  />
                  <small className="form-hint">Comma-separated list of asset IDs to focus on</small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => generateReport()}
                  disabled={state.generating || !state.query.trim()}
                  className="btn-primary"
                >
                  {state.generating ? (
                    <>
                      <Loader2 className="btn-icon animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="btn-icon" />
                      Generate Report
                    </>
                  )}
                </button>
                
                {state.query && (
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      query: '', 
                      reportType: '', 
                      assetIds: '',
                      showQuickOptions: true 
                    }))}
                    className="btn-secondary"
                  >
                    Reset Form
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {state.activeTab === 'history' && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">Report History</h2>
              <button
                onClick={fetchReportHistory}
                disabled={state.loading}
                className="btn-secondary"
              >
                {state.loading ? (
                  <RefreshCw className="btn-icon animate-spin" />
                ) : (
                  <Search className="btn-icon" />
                )}
                Refresh
              </button>
            </div>

            {state.loading ? (
              <div className="loading-container">
                <Loader2 className="loading-spinner" />
                <p>Loading reports...</p>
              </div>
            ) : (
              <div className="reports-list">
                {state.reports.map((report) => (
                  <div key={report.report_id} className="report-item">
                    <div className="report-content">
                      <div className="report-header">
                        <span className={`report-badge ${getReportTypeColor(report.report_type)}`}>
                          {getReportTypeLabel(report.report_type)}
                        </span>
                        <span className="report-date">
                          <Calendar className="date-icon" />
                          {formatDate(report.generated_at)}
                        </span>
                      </div>
                      <p className="report-query">
                        {report.parameters?.query || report.query || 'No query available'}
                      </p>
                      <div className="report-meta">
                        <span className="report-id">ID: {report.report_id}</span>
                        {report.parameters?.start_date && (
                          <span className="report-period">
                            {report.parameters.start_date} to {report.parameters.end_date || report.parameters.start_date}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="report-actions">
                      <button
                        onClick={() => viewReport(report.report_id)}
                        className="action-btn view-btn"
                        title="View Report"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadReport(report.report_id)}
                        className="action-btn download-btn"
                        title="Download as PDF"
                      >
                        <Download className="action-icon" />
                      </button>
                      <button
                        onClick={() => deleteReport(report.report_id)}
                        className="action-btn delete-btn"
                        title="Delete Report"
                      >
                        <Trash2 className="action-icon" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {state.reports.length === 0 && (
                  <div className="empty-state">
                    <FileText className="empty-icon" />
                    <h3 className="empty-title">No Reports Yet</h3>
                    <p className="empty-text">
                      Generate your first report to get started with asset tracking analytics!
                    </p>
                    <button 
                      onClick={() => setActiveTab('generate')}
                      className="btn-primary"
                    >
                      <Plus className="btn-icon" />
                      Generate First Report
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {state.selectedReport && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setState(prev => ({ ...prev, selectedReport: null }));
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title-section">
                <h3 className="modal-title">{getReportTypeLabel(state.selectedReport.report_type)} Report</h3>
                <p className="modal-subtitle">
                  Generated: {formatDate(state.selectedReport.generated_at)}
                </p>
                <p className="modal-id">ID: {state.selectedReport.report_id}</p>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => downloadReport(state.selectedReport.report_id)}
                  className="btn-primary modal-btn"
                  title="Download as PDF"
                >
                  <Download className="btn-icon" />
                  Download PDF
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, selectedReport: null }))}
                  className="modal-close"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="report-content-display">
                <pre className="report-text">
                  {state.selectedReport.content || 'No content available'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {state.notification && (
        <div className={`notification notification-${state.notification.type}`}>
          {state.notification.type === 'error' && <AlertCircle className="notification-icon" />}
          {state.notification.type === 'success' && <CheckCircle className="notification-icon" />}
          <span className="notification-text">{state.notification.message}</span>
          <button 
            onClick={() => setState(prev => ({ ...prev, notification: null }))}
            className="notification-close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;
