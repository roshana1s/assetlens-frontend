// Report.js - Frontend Component with PDF Export
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Calendar, BarChart3, Download, 
  Trash2, Search, Plus, Clock, 
  AlertCircle, CheckCircle, Loader2, RefreshCw 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import './Report.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/reports';
const REPORT_TYPES = {
  DAILY_SUMMARY: 'daily_summary',
  UTILIZATION: 'utilization',
  ASSET_SUMMARY: 'asset_summary',
  CUSTOM: 'custom'
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
    startDate: '',
    endDate: '',
    assetIds: '',
    notification: null
  });

  const getAuthHeaders = useCallback(() => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  }), []);

  const showNotification = useCallback((message, type = 'info') => {
    setState(prev => ({ ...prev, notification: { message, type } }));
    setTimeout(() => setState(prev => ({ ...prev, notification: null })), 5000);
  }, []);

  const handleUnauthorized = useCallback(() => {
    showNotification('Session expired. Please login again.', 'error');
    window.location.href = '/login';
  }, [showNotification]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }, []);

  const fetchReportHistory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${API_BASE}/history`, {
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
      showNotification(error.message, 'error');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [API_BASE, getAuthHeaders, handleUnauthorized, showNotification]);

  const generateReport = useCallback(async () => {
    if (!state.query.trim()) {
      showNotification('Please enter a report query', 'error');
      return;
    }

    setState(prev => ({ ...prev, generating: true }));
    try {
      const payload = {
        query: state.query,
        report_type: state.reportType || null,
        start_date: state.startDate || null,
        end_date: state.endDate || null,
        asset_ids: state.assetIds ? state.assetIds.split(',').map(id => id.trim()) : null
      };

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('Report generated successfully!', 'success');
        setState(prev => ({
          ...prev,
          query: '',
          reportType: '',
          startDate: '',
          endDate: '',
          assetIds: '',
          generating: false
        }));
        fetchReportHistory();
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate report');
      }
    } catch (error) {
      showNotification(error.message, 'error');
      setState(prev => ({ ...prev, generating: false }));
    }
  }, [state, API_BASE, getAuthHeaders, showNotification, handleUnauthorized, fetchReportHistory]);

  const viewReport = useCallback(async (reportId) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${API_BASE}/${reportId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, selectedReport: data }));
      } else if (response.status === 401) {
        handleUnauthorized();
      } else if (response.status === 404) {
        showNotification('Report not found', 'error');
      } else {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [API_BASE, getAuthHeaders, handleUnauthorized, showNotification]);

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
      } else if (response.status === 401) {
        handleUnauthorized();
      } else if (response.status === 404) {
        showNotification('Report not found', 'error');
      } else {
        throw new Error(`Failed to delete report: ${response.status}`);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }, [API_BASE, getAuthHeaders, showNotification, handleUnauthorized, fetchReportHistory]);

  const generateMarkdownContent = (report) => {
    return `# ${getReportTypeLabel(report.report_type)} Report\n\n` +
      `**Report ID:** ${report.report_id}\n` +
      `**Generated:** ${formatDate(report.generated_at)}\n` +
      `**Query:** ${report.query}\n\n` +
      `## Report Content\n\n` +
      `${report.content}\n\n` +
      `---\n` +
      `*Automatically generated report*`;
  };

  const convertMarkdownToPDF = (markdownContent, report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 20;
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(`${getReportTypeLabel(report.report_type)} Report`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    // Add metadata
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report ID: ${report.report_id}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Generated: ${formatDate(report.generated_at)}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Query: ${report.query}`, margin, yPosition);
    yPosition += 10;
    
    // Add content header
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Report Content', margin, yPosition);
    yPosition += 10;
    
    // Process content lines
    doc.setFontSize(11);
    const lines = report.content.split('\n');
    lines.forEach(line => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition, { maxWidth: pageWidth - margin * 2 });
      yPosition += 7;
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Automatically generated report', pageWidth / 2, 290, { align: 'center' });
    
    return doc;
  };

  const downloadReport = useCallback(async (reportId) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`${API_BASE}/${reportId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const report = await response.json();
        const markdownContent = generateMarkdownContent(report);
        const pdfDoc = convertMarkdownToPDF(markdownContent, report);
        pdfDoc.save(`report_${report.report_id}.pdf`);
        showNotification('Report downloaded as PDF', 'success');
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        throw new Error(`Failed to download report: ${response.status}`);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [API_BASE, getAuthHeaders, showNotification, handleUnauthorized, formatDate, getReportTypeLabel]);

  const handleInputChange = (field, value) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const setActiveTab = (tab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
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
      <div className="dashboard-main">
        <div className="tab-navigation">
          <nav className="tab-nav">
            <button onClick={() => setActiveTab('generate')} className={`tab-button ${state.activeTab === 'generate' ? 'tab-active' : ''}`}>
              <Plus className="tab-icon" /> Generate Report
            </button>
            <button onClick={() => setActiveTab('history')} className={`tab-button ${state.activeTab === 'history' ? 'tab-active' : ''}`}>
              <Clock className="tab-icon" /> Report History
            </button>
          </nav>
        </div>

        {state.activeTab === 'generate' && (
          <div className="content-card">
            <h2 className="card-title">Generate New Report</h2>
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">Report Query *</label>
                <textarea
                  value={state.query}
                  onChange={(e) => handleInputChange('query', e.target.value)}
                  placeholder="Describe what you want to report on..."
                  className="form-textarea"
                  rows="3"
                />
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
                    <option value={REPORT_TYPES.UTILIZATION}>Utilization</option>
                    <option value={REPORT_TYPES.ASSET_SUMMARY}>Asset Summary</option>
                    <option value={REPORT_TYPES.CUSTOM}>Custom</option>
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
                  <label className="form-label">Asset IDs</label>
                  <input
                    type="text"
                    value={state.assetIds}
                    onChange={(e) => handleInputChange('assetIds', e.target.value)}
                    placeholder="A001, A002, A003"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={generateReport}
                  disabled={state.generating}
                  className="btn-primary"
                >
                  {state.generating ? (
                    <>
                      <Loader2 className="btn-icon animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="btn-icon" />
                      Generate Report
                    </>
                  )}
                </button>
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
                      <p className="report-query">{report.query}</p>
                      <p className="report-id">ID: {report.report_id}</p>
                    </div>
                    <div className="report-actions">
                      <button
                        onClick={() => viewReport(report.report_id)}
                        className="action-btn view-btn"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadReport(report.report_id)}
                        className="action-btn download-btn"
                        title="Download Report"
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
                    <p className="empty-text">
                      No reports found. Generate your first report to get started!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {state.selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title-section">
                <h3 className="modal-title">Report Details</h3>
                <p className="modal-subtitle">
                  Generated: {formatDate(state.selectedReport.generated_at)}
                </p>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => downloadReport(state.selectedReport.report_id)}
                  className="btn-primary modal-btn"
                >
                  <Download className="btn-icon" />
                  Download
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, selectedReport: null }))}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="report-content-display">
                <pre className="report-text">
                  {state.selectedReport.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {state.notification && (
        <div className={`notification ${state.notification.type}`}>
          {state.notification.type === 'error' && <AlertCircle className="notification-icon" />}
          {state.notification.type === 'success' && <CheckCircle className="notification-icon" />}
          <span>{state.notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;