import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Report.css';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const ReportDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch all reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports?org_id=${user.org_id}&user_id=${user.user_id}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      toast.error('Failed to load reports');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate new report
  const generateReport = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_type: 1,
          report_date: selectedDate,
          org_id: user.org_id,
          user_id: user.user_id
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');
      
      toast.success('Asset Tracking Daily Report generated successfully!');
      fetchReports(); // Refresh the reports list
      
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Download report as HTML
  const downloadReport = async (reportId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}?org_id=${user.org_id}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      
      const htmlContent = await response.text();
      
      // Create downloadable HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Asset_Tracking_Report_${reportId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
      console.error('Error downloading report:', error);
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}?org_id=${user.org_id}&user_id=${user.user_id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete report');
      
      toast.success('Report deleted successfully');
      fetchReports(); // Refresh the reports list
    } catch (error) {
      toast.error('Failed to delete report');
      console.error('Error deleting report:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="report-dashboard">
      <div className="header">
        <h1>Asset Tracking Daily Reports</h1>
        <p>Generate and manage daily asset tracking reports</p>
      </div>

      {/* Generate Report Section */}
      <div className="generate-section">
        <div className="generate-card">
          <h2>Generate Asset Tracking Daily Report</h2>
          <div className="generate-form">
            <div className="form-group">
              <label>Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
            <button
              onClick={generateReport}
              disabled={generating || !selectedDate}
              className="generate-btn"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-section">
        <div className="reports-header">
          <h2>Generated Reports</h2>
          {reports.length > 0 && (
            <span className="reports-count">{reports.length} reports</span>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={24} />
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No reports generated yet</h3>
            <p>Generate your first Asset Tracking Daily Report</p>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map(report => (
              <div key={report.report_id} className="report-card">
                <div className="report-header">
                  <div className="report-icon">
                    <FileText size={20} />
                  </div>
                  <div className="report-info">
                    <h3>Asset Tracking Daily Report</h3>
                    <p className="report-id">ID: {report.report_id}</p>
                  </div>
                </div>
                
                <div className="report-meta">
                  <span className="report-date">
                    <Calendar size={14} />
                    {formatDate(report.generated_at)}
                  </span>
                  <span className="report-status">
                    Completed
                  </span>
                </div>

                <div className="report-actions">
                  <button
                    onClick={() => downloadReport(report.report_id)}
                    className="action-btn download-btn"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => deleteReport(report.report_id)}
                    className="action-btn delete-btn"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
    </div>
  );
};

export default ReportDashboard;