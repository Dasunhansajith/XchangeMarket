import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI, orderAPI, sellerAPI, notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaBox, FaPlus, FaChartLine, FaEdit, FaTrash, FaUpload, FaStore, FaMoneyBillWave, FaSpinner, FaExclamationTriangle, FaCheck, FaTimes, FaClipboardList, FaBell, FaDownload, FaMapMarkerAlt } from 'react-icons/fa';
import { locationData } from '../data/locations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [applicationLoading, setApplicationLoading] = useState(true);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
    const [trackingFormData, setTrackingFormData] = useState({
        newStage: '',
        courierName: '',
        trackingNumber: ''
    });
    const [isSubmittingTracking, setIsSubmittingTracking] = useState(false);
    const [trackingStatuses, setTrackingStatuses] = useState({});

    // Sales Report State
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    const [salesReport, setSalesReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportHistory, setReportHistory] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        stockQuantity: '',
        description: '',
        district: '',
        city: '',
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);

    // Ref for PDF report content
    const reportContentRef = useRef(null);

    const generatePDFContent = async (isDownload = true) => {
        if (!salesReport) {
            toast.error('No report data');
            return null;
        }

        try {
            // Create a simplified clone for PDF with compatible styles
            const cloneContainer = document.createElement('div');
            cloneContainer.style.width = '1200px';
            cloneContainer.style.backgroundColor = '#ffffff';
            cloneContainer.style.padding = '40px';
            cloneContainer.style.fontFamily = '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            
            // Add Google Fonts style
            const styleTag = document.createElement('style');
            styleTag.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                * { font-family: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
            `;
            cloneContainer.appendChild(styleTag);
            
            // Header
            const header = document.createElement('div');
            header.style.borderBottom = '3px solid #333';
            header.style.paddingBottom = '20px';
            header.style.marginBottom = '20px';
            
            const headerContent = document.createElement('div');
            headerContent.style.display = 'grid';
            headerContent.style.gridTemplateColumns = '1fr 1fr';
            headerContent.style.gap = '20px';
            headerContent.innerHTML = `
                <div>
                    <h1 style="margin: 0; font-size: 32px; color: #dc2626; font-weight: bold;">XCHANGE</h1>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Sri Lanka's Premier Multi-Vendor Marketplace</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-size: 10px; color: #999; font-weight: bold;">SALES REPORT</p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: bold; color: #333;">${new Date().toLocaleDateString()}</p>
                </div>
            `;
            header.appendChild(headerContent);
            cloneContainer.appendChild(header);
            
            // Report Details
            const details = document.createElement('div');
            details.style.display = 'grid';
            details.style.gridTemplateColumns = 'repeat(4, 1fr)';
            details.style.gap = '20px';
            details.style.marginBottom = '30px';
            details.style.fontSize = '12px';
            
            const detailFields = [
                { label: 'SELLER EMAIL', value: user?.email || 'N/A' },
                { label: 'REPORT PERIOD', value: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` },
                { label: 'DAYS INCLUDED', value: `${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days` },
                { label: 'GENERATED', value: new Date().toLocaleTimeString() }
            ];
            
            detailFields.forEach(field => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p style="margin: 0; color: #999; font-weight: bold; font-size: 10px;">${field.label}</p>
                    <p style="margin: 5px 0 0 0; color: #333; word-break: break-all; font-family: monospace; font-size: 11px;">${field.value}</p>
                `;
                details.appendChild(div);
            });
            cloneContainer.appendChild(details);
            
            // Summary Section
            const summaryTitle = document.createElement('h3');
            summaryTitle.textContent = 'Performance Summary';
            summaryTitle.style.fontSize = '16px';
            summaryTitle.style.fontWeight = 'bold';
            summaryTitle.style.marginBottom = '15px';
            summaryTitle.style.color = '#333';
            cloneContainer.appendChild(summaryTitle);
            
            const summaryGrid = document.createElement('div');
            summaryGrid.style.display = 'grid';
            summaryGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            summaryGrid.style.gap = '15px';
            summaryGrid.style.marginBottom = '30px';
            
            const summaryCards = [
                { label: 'Total Orders', value: salesReport.totalOrders, bgColor: '#dbeafe', textColor: '#0369a1', labelColor: '#0284c7' },
                { label: 'Total Revenue', value: `Rs ${salesReport.totalRevenue?.toLocaleString()}`, bgColor: '#dcfce7', textColor: '#15803d', labelColor: '#16a34a' },
                { label: 'Avg Order Value', value: `Rs ${(salesReport.totalRevenue / (salesReport.totalOrders || 1)).toLocaleString('en-US', {maximumFractionDigits: 0})}`, bgColor: '#f3e8ff', textColor: '#6b21a8', labelColor: '#9333ea' }
            ];
            
            summaryCards.forEach(card => {
                const div = document.createElement('div');
                div.style.backgroundColor = card.bgColor;
                div.style.padding = '15px';
                div.style.borderRadius = '8px';
                div.innerHTML = `
                    <p style="margin: 0; font-size: 11px; color: ${card.labelColor}; font-weight: bold;">${card.label}</p>
                    <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: ${card.textColor};">${card.value}</p>
                `;
                summaryGrid.appendChild(div);
            });
            cloneContainer.appendChild(summaryGrid);
            
            // Order Details Section
            const orderTitle = document.createElement('h3');
            orderTitle.textContent = 'Order Details';
            orderTitle.style.fontSize = '16px';
            orderTitle.style.fontWeight = 'bold';
            orderTitle.style.marginBottom = '15px';
            orderTitle.style.color = '#333';
            cloneContainer.appendChild(orderTitle);
            
            // Table
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontSize = '11px';
            table.style.marginBottom = '30px';
            
            const thead = document.createElement('thead');
            thead.style.backgroundColor = '#f3f4f6';
            const headerRow = document.createElement('tr');
            ['Order ID', 'Product', 'Qty', 'Unit Price', 'Total', 'Buyer', 'Status', 'Date'].forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.padding = '10px';
                th.style.textAlign = 'left';
                th.style.borderBottom = '2px solid #d1d5db';
                th.style.fontWeight = 'bold';
                th.style.color = '#374151';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            const tbody = document.createElement('tbody');
            if (salesReport.orders && salesReport.orders.length > 0) {
                salesReport.orders.forEach((order, idx) => {
                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid #e5e7eb';
                    if (idx % 2 === 0) row.style.backgroundColor = '#fafafa';
                    
                    const cells = [
                        order.orderId.slice(-6),
                        order.productName,
                        order.quantity,
                        `Rs ${order.price?.toLocaleString()}`,
                        `Rs ${order.totalPrice?.toLocaleString()}`,
                        order.buyerName,
                        order.status === 'COMPLETED' ? '✓ COMPLETED' : 'ACCEPTED',
                        new Date(order.dateCreated).toLocaleDateString()
                    ];
                    
                    cells.forEach((cell, i) => {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        td.style.padding = '8px 10px';
                        td.style.color = '#374151';
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 8;
                td.textContent = 'No sales in this date range';
                td.style.padding = '20px';
                td.style.textAlign = 'center';
                td.style.color = '#999';
                row.appendChild(td);
                tbody.appendChild(row);
            }
            table.appendChild(tbody);
            cloneContainer.appendChild(table);
            
            // Footer
            const footer = document.createElement('div');
            footer.style.borderTop = '2px solid #d1d5db';
            footer.style.paddingTop = '20px';
            footer.style.marginTop = '20px';
            
            const footerGrid = document.createElement('div');
            footerGrid.style.display = 'grid';
            footerGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            footerGrid.style.gap = '20px';
            footerGrid.style.fontSize = '10px';
            footerGrid.style.marginBottom = '15px';
            footerGrid.innerHTML = `
                <div>
                    <p style="margin: 0; font-weight: bold; color: #333;">XCHANGE</p>
                    <p style="margin: 3px 0 0 0; color: #666;">Sri Lanka's Premier Multi-Vendor Marketplace</p>
                </div>
                <div style="text-align: center;">
                    <p style="margin: 0; font-weight: bold; color: #333;">Support</p>
                    <p style="margin: 3px 0 0 0; color: #666;">xchangesrilanka@gmail.com</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-weight: bold; color: #333;">Confidential</p>
                    <p style="margin: 3px 0 0 0; color: #666;">For authorized use only</p>
                </div>
            `;
            footer.appendChild(footerGrid);
            
            const copyright = document.createElement('p');
            copyright.textContent = '© 2026 XCHANGE Marketplace. All Rights Reserved.';
            copyright.style.margin = '10px 0 0 0';
            copyright.style.textAlign = 'center';
            copyright.style.fontSize = '9px';
            copyright.style.color = '#999';
            footer.appendChild(copyright);
            cloneContainer.appendChild(footer);
            
            // Append to body temporarily
            cloneContainer.style.position = 'fixed';
            cloneContainer.style.left = '-9999px';
            document.body.appendChild(cloneContainer);
            
            // Convert to canvas
            const canvas = await html2canvas(cloneContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            // Remove temporary element
            document.body.removeChild(cloneContainer);
            
            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight - 20;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight - 20;
            }

            const fileName = `Sales_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`;
            
            if (isDownload) {
                pdf.save(fileName);
                toast.dismiss();
                toast.success('PDF downloaded successfully!');
                
                // Add to history
                const reportEntry = {
                    id: Date.now(),
                    fileName,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    totalOrders: salesReport.totalOrders,
                    totalRevenue: salesReport.totalRevenue,
                    generatedAt: new Date()
                };
                setReportHistory([reportEntry, ...reportHistory]);
            } else {
                // Return PDF as blob URL for viewing
                const pdfBlob = pdf.output('blob');
                return URL.createObjectURL(pdfBlob);
            }
        } catch (err) {
            console.error('Error generating PDF:', err);
            if (isDownload) {
                toast.dismiss();
                toast.error('Failed to generate PDF');
            }
            return null;
        }
    };

    const downloadReportAsPDF = async () => {
        toast.loading('Generating PDF...');
        await generatePDFContent(true);
    };

    const viewReportAsPDF = async () => {
        toast.loading('Generating PDF...');
        const pdfUrl = await generatePDFContent(false);
        toast.dismiss();
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };

    const openHistoricalReport = async (reportEntry) => {
        // For now, we'll regenerate from history data
        // In a production app, you'd store the PDF blob
        toast.loading('Preparing report...');
        
        // Temporarily set dates and generate
        const prevStartDate = startDate;
        const prevEndDate = endDate;
        
        setStartDate(new Date(reportEntry.startDate));
        setEndDate(new Date(reportEntry.endDate));
        
        // This is a simple approach - in production you'd fetch the original report data
        toast.dismiss();
        toast.info('Historical reports cannot be regenerated. Use Download on active reports to save them.');
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limit total images to 5
        if (formData.images.length + files.length > 5) {
            toast.error("You can only upload up to 5 images");
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, base64String]
                }));
                setImagePreviews(prev => [...prev, base64String]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const fetchMyProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productAPI.getMyProducts();
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again.');
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            setOrdersLoading(true);
            const response = await orderAPI.getSellerOrders();
            const ordersList = Array.isArray(response.data) ? response.data : [];
            setOrders(ordersList);
            setError(null);

            // Fetch tracking status for all accepted/delivered orders
            const trackingMap = {};
            for (const order of ordersList) {
                if (order.status === 'ACCEPTED' || order.status === 'DELIVERED') {
                    try {
                        const trackingRes = await orderAPI.getTracking(order.id);
                        trackingMap[order.id] = trackingRes.data?.status || null;
                    } catch (err) {
                        // Tracking not found, skip
                        trackingMap[order.id] = null;
                    }
                }
            }
            setTrackingStatuses(trackingMap);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please refresh the page.');
            toast.error('Failed to load orders');
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    const fetchSalesReport = useCallback(async (start, end) => {
        try {
            setReportLoading(true);
            const response = await sellerAPI.getSalesReport(start.getTime(), end.getTime());
            setSalesReport(response.data);
        } catch (err) {
            console.error('Error fetching sales report:', err);
            toast.error('Failed to load sales report');
        } finally {
            setReportLoading(false);
        }
    }, []);

    // Fetch seller application status
    useEffect(() => {
        const fetchApplicationStatus = async () => {
            try {
                setApplicationLoading(true);
                const response = await sellerAPI.getUserApplication();
                setApplicationStatus(response.data);
            } catch (err) {
                console.log('No seller application found - user may not have applied yet');
                setApplicationStatus(null);
            } finally {
                setApplicationLoading(false);
            }
        };

        fetchApplicationStatus();
    }, []);

    // Show pending/rejected status if not approved
    if (!applicationLoading && applicationStatus && applicationStatus.status !== 'APPROVED') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="text-center mb-6">
                            {applicationStatus.status === 'PENDING' ? (
                                <>
                                    <FaSpinner className="text-5xl text-yellow-500 mx-auto mb-4 animate-spin" />
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Application Pending</h2>
                                    <p className="text-gray-600 text-lg">Your seller application is being reviewed by our admin team.</p>
                                </>
                            ) : (
                                <>
                                    <FaTimes className="text-5xl text-red-500 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Application Declined</h2>
                                    <p className="text-gray-600 text-lg">Unfortunately, your application was declined.</p>
                                    {applicationStatus.rejectionReason && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-700"><strong>Reason:</strong> {applicationStatus.rejectionReason}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold text-lg text-blue-900 mb-3">📋 Application Details</h3>
                            <div className="space-y-2 text-blue-800">
                                <p><strong>Shop Name:</strong> {applicationStatus.shopName}</p>
                                <p><strong>Location:</strong> {applicationStatus.city}, {applicationStatus.district}</p>
                                <p><strong>Categories:</strong> {applicationStatus.shopCategories?.join(', ')}</p>
                                <p><strong>Payment Methods:</strong> {applicationStatus.acceptedPaymentMethods}</p>
                                <p><strong>Applied On:</strong> {new Date(applicationStatus.appliedAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {applicationStatus.status === 'REJECTED' && (
                            <button
                                onClick={() => window.location.href = '/become-seller'}
                                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition"
                            >
                                Submit New Application
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    useEffect(() => {
        fetchMyProducts();
        fetchOrders();
    }, [fetchMyProducts, fetchOrders]);

    const handleAcceptOrder = async (orderId) => {
        try {
            await orderAPI.acceptOrder(orderId);
            toast.success('Order accepted successfully!');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to accept order');
        }
    };

    const handleDeclineOrder = async (orderId) => {
        try {
            await orderAPI.declineOrder(orderId);
            toast.success('Order declined');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to decline order');
        }
    };

    const handleOpenTrackingModal = async (order) => {
        try {
            setOrdersLoading(true);
            let response;
            
            try {
                // Try to get existing tracking
                response = await orderAPI.getTracking(order.id);
            } catch (err) {
                // If not found, create a new tracking record automatically
                if (err.response?.status === 404) {
                    try {
                        await orderAPI.createTracking(order.id);
                        response = await orderAPI.getTracking(order.id);
                    } catch (createErr) {
                        throw createErr;
                    }
                } else {
                    throw err;
                }
            }

            const trackingData = response.data;
            
            // In the backend, the current status is stored in the 'status' field
            const status = trackingData.status || 'PLACED';
            
            // Determine the next logical milestone (sequential order)
            const stagesList = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
            const currentIndex = stagesList.indexOf(status);
            const nextStage = (currentIndex !== -1 && currentIndex < stagesList.length - 1) 
                ? stagesList[currentIndex + 1] 
                : '';

            setSelectedOrderForTracking({
                ...order,
                currentTracking: trackingData,
                currentStage: status
            });
            
            setTrackingFormData({
                newStage: nextStage, // ✅ Auto-populated based on sequence
                courierName: trackingData.courierName || '',
                trackingNumber: trackingData.trackingNumber || ''
            });
            
            setTrackingModalOpen(true);
        } catch (err) {
            console.error('Error fetching tracking:', err);
            toast.error('Failed to update tracking: Please try again');
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleUpdateTracking = async (e) => {
        e.preventDefault();
        if (!trackingFormData.newStage) {
            toast.error('Please select a stage');
            return;
        }

        try {
            setIsSubmittingTracking(true);
            await orderAPI.updateTracking(selectedOrderForTracking.id, trackingFormData);
            toast.success(`Order marked as ${trackingFormData.newStage.replace(/_/g, ' ')}`);
            setTrackingModalOpen(false);
            fetchOrders(); // Refresh table
        } catch (err) {
            console.error('Error updating tracking:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update tracking';
            toast.error(errorMsg);
        } finally {
            setIsSubmittingTracking(false);
        }
    };

    const getValidNextStages = (currentStage) => {
        const stages = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const currentIndex = stages.indexOf(currentStage);
        
        if (currentIndex === -1 || currentIndex === stages.length - 1) return [];
        
        // Return ONLY the immediate next stage to prevent skipping
        return [stages[currentIndex + 1]];
    };

    const handleAddProductClick = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);

        // Map product location to centralized locationData if possible
        let matchedDistrict = product.district || '';
        if (matchedDistrict) {
            const foundKey = Object.keys(locationData).find(d => d.toLowerCase() === matchedDistrict.toLowerCase());
            if (foundKey) matchedDistrict = foundKey;
        }

        let matchedCity = product.city || '';
        if (matchedDistrict && locationData[matchedDistrict] && matchedCity) {
            const foundCity = locationData[matchedDistrict].find(c => c.toLowerCase() === matchedCity.toLowerCase());
            if (foundCity) matchedCity = foundCity;
        }

        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category,
            stockQuantity: product.stockQuantity.toString(),
            description: product.description,
            district: matchedDistrict,
            city: matchedCity,
            images: product.images || [],
        });
        setImagePreviews(product.images || []);
        setActiveTab('add');
    };

    const confirmSubmit = async () => {
        try {
            setLoading(true);
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity),
                status: 'Active'
            };

            if (editingProduct) {
                await productAPI.updateProduct(editingProduct.id, productData);
                toast.success('Product updated successfully!');
            } else {
                await productAPI.createProduct(productData);
                toast.success('Product published successfully!');
            }

            setFormData({ name: '', price: '', category: '', stockQuantity: '', description: '', district: '', city: '', images: [] });
            setImagePreviews([]);
            setEditingProduct(null);
            setShowConfirmModal(false);
            setActiveTab('manage');
            fetchMyProducts();
        } catch (err) {
            console.error('Error saving product:', err);
            toast.error(err.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            setLoading(true);
            await productAPI.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            toast.success('Product deleted successfully!');
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete product');
        } finally {
            setLoading(false);
        }
    };

    const renderDashboardOverview = () => {
        const totalRevenue = orders
            .filter(order => order.status !== 'DECLINED')
            .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Store Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <FaBox className="text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Products</p>
                            <h3 className="text-2xl font-bold text-gray-800">{products.length}</h3>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <FaMoneyBillWave className="text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800">Rs {totalRevenue.toLocaleString()}</h3>
                        </div>
                    </motion.div>
                </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Recent Activity (Orders)</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-red-600 text-sm font-semibold hover:underline">View All Orders</button>
                </div>
                
                {ordersLoading ? (
                    <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-red-600" /></div>
                ) : orders.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">You haven't had any recent sales. Add more products to increase visibility!</p>
                ) : (
                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 text-red-600">
                                        <FaClipboardList />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">Order #{order.id ? order.id.slice(-6) : 'N/A'}</h4>
                                        <p className="text-gray-500 text-xs">{order.items?.[0]?.name} (Qty: {order.items?.[0]?.quantity})</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {(() => {
                                                const displayStatus = order.status === 'ACCEPTED' && trackingStatuses[order.id]
                                                    ? trackingStatuses[order.id]
                                                    : order.status === 'ACCEPTED'
                                                    ? 'PLACED'
                                                    : order.status;
                                                
                                                let colorClass = 'bg-gray-100 text-gray-600';
                                                if (displayStatus === 'PENDING') colorClass = 'bg-yellow-100 text-yellow-600';
                                                else if (displayStatus === 'PLACED' || displayStatus === 'PACKED') colorClass = 'bg-blue-100 text-blue-600';
                                                else if (displayStatus === 'SHIPPED' || displayStatus === 'OUT_FOR_DELIVERY') colorClass = 'bg-orange-100 text-orange-600';
                                                else if (displayStatus === 'DELIVERED') colorClass = 'bg-green-100 text-green-600';
                                                else if (displayStatus === 'DECLINED') colorClass = 'bg-red-100 text-red-600';
                                                
                                                return (
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${colorClass}`}>
                                                        {displayStatus.replace(/_/g, ' ')}
                                                    </span>
                                                );
                                            })()}
                                            <span className="text-gray-400 text-[10px]">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-4 hidden md:block">
                                        <p className="text-xs text-gray-400">Total Amount</p>
                                        <p className="font-bold text-gray-800 text-sm">Rs {order.totalPrice?.toLocaleString()}</p>
                                    </div>
                                    
                                    {order.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => handleAcceptOrder(order.id)}
                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                                            >
                                                <FaCheck /> Accept
                                            </button>
                                            <button 
                                                onClick={() => handleDeclineOrder(order.id)}
                                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                                            >
                                                <FaTimes /> Decline
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

    const renderManageProducts = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
                <button onClick={() => setActiveTab('add')} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                    <FaPlus /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 font-semibold text-gray-700">Product Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Stock</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{product.name}</div>
                                    <div className="text-sm text-gray-500">Shop: {product.shopId || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">Rs {product.price?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-600">{product.stockQuantity}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {product.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && products.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <FaBox className="text-4xl mb-3 opacity-20" />
                                        <p>No products found. Start by adding a new product.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex items-center justify-center text-red-600">
                                        <FaSpinner className="animate-spin text-2xl mr-2" />
                                        <span>Loading products...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Manage Orders</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase">Order Details</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase">Customer</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase">Shipping Address</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase">Total</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800 text-sm">#{order.id ? order.id.slice(-8) : 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{order.items?.[0]?.name}...</div>
                                    <div className="text-[10px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-800">{order.buyerName || 'Guest'}</div>
                                    <div className="text-xs text-gray-500">{order.buyerPhone || order.buyerId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-600 max-w-[150px] line-clamp-2">{order.shippingAddress}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-800 font-bold text-sm">Rs {order.totalPrice?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    {(() => {
                                        const displayStatus = order.status === 'ACCEPTED' && trackingStatuses[order.id]
                                            ? trackingStatuses[order.id]
                                            : order.status === 'ACCEPTED'
                                            ? 'PLACED'
                                            : order.status;
                                        
                                        let colorClass = 'bg-gray-100 text-gray-600';
                                        if (displayStatus === 'PENDING') colorClass = 'bg-yellow-100 text-yellow-600';
                                        else if (displayStatus === 'PLACED' || displayStatus === 'PACKED') colorClass = 'bg-blue-100 text-blue-600';
                                        else if (displayStatus === 'SHIPPED' || displayStatus === 'OUT_FOR_DELIVERY') colorClass = 'bg-orange-100 text-orange-600';
                                        else if (displayStatus === 'DELIVERED') colorClass = 'bg-green-100 text-green-600';
                                        else if (displayStatus === 'DECLINED') colorClass = 'bg-red-100 text-red-600';
                                        
                                        return (
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${colorClass}`}>
                                                {displayStatus.replace(/_/g, ' ')}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {order.status === 'PENDING' ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAcceptOrder(order.id)}
                                                className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition" 
                                                title="Accept"
                                            >
                                                <FaCheck size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeclineOrder(order.id)}
                                                className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition" 
                                                title="Decline"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ) : order.status === 'ACCEPTED' ? (
                                        <div className="flex flex-col gap-2 items-center">
                                            <button 
                                                onClick={() => handleOpenTrackingModal(order)}
                                                className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
                                            >
                                                <FaBox size={10} /> Update Status
                                            </button>
                                            
                                            {/* Minimal tracking info if available */}
                                            {(order.courierName || order.trackingNumber) && (
                                                <div className="text-[9px] text-gray-400 font-medium text-center">
                                                    {order.courierName && <div>{order.courierName}</div>}
                                                    {order.trackingNumber && <div className="truncate max-w-[80px]">#{order.trackingNumber}</div>}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-black font-bold uppercase">{order.status}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Loading state */}
                {ordersLoading && orders.length === 0 && (
                    <div className="py-20 text-center text-red-600">
                        <FaSpinner className="animate-spin text-4xl mx-auto mb-4" />
                        <p>Loading your orders...</p>
                    </div>
                )}

                {/* Error state */}
                {error && orders.length === 0 && (
                    <div className="py-20 text-center text-red-500">
                        <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
                        <p>{error}</p>
                        <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                            Retry Fetching
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!ordersLoading && !error && orders.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        <FaClipboardList className="text-5xl mx-auto mb-4 opacity-10" />
                        <p>No orders yet.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAddProduct = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleAddProductClick} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. iPhone 15 Pro Max"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white"
                        >
                            <option value="">Select Category</option>
                            <option value="Mobiles">Mobiles</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Property">Property</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="e.g. 150000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                        <input
                            type="number"
                            required
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                            placeholder="e.g. 10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        rows="4"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your product features, condition, and warranty..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    ></textarea>
                </div>

                <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        Store Location
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                District <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value, city: '' })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white"
                            >
                                <option value="">Select District</option>
                                {Object.keys(locationData).sort().map((district) => (
                                    <option key={district} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                disabled={!formData.district}
                                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white ${!formData.district ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Select City</option>
                                {formData.district && locationData[formData.district].sort().map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 5)</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <AnimatePresence>
                            {imagePreviews.map((preview, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                                >
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {imagePreviews.length < 5 && (
                            <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer">
                                <FaPlus className="text-gray-400 text-xl mb-1" />
                                <span className="text-xs text-gray-500 font-medium">Add Image</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => { setActiveTab('manage'); setEditingProduct(null); }} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-lg shadow-red-500/30 flex items-center gap-2">
                        {loading && <FaSpinner className="animate-spin" />}
                        {editingProduct ? 'Update Product' : 'Publish Product'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderConfirmModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-100"
            >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">Confirm Product Details</h3>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Product Name:</span>
                            <span className="text-gray-800 font-semibold text-right">{formData.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Category:</span>
                            <span className="text-gray-800 font-semibold text-right">{formData.category}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Price:</span>
                            <span className="text-gray-800 font-semibold text-right">Rs {parseFloat(formData.price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Stock:</span>
                            <span className="text-gray-800 font-semibold text-right">{formData.stockQuantity}</span>
                        </div>
                        {formData.district && formData.city && (
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 font-medium">Location:</span>
                                <span className="text-gray-800 font-semibold text-right">{formData.city}, {formData.district}</span>
                            </div>
                        )}
                        <div className="pt-2">
                            <span className="text-gray-500 font-medium block mb-2">Images:</span>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {imagePreviews.map((preview, idx) => (
                                    <img key={idx} src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                ))}
                                {imagePreviews.length === 0 && <span className="text-gray-400 text-sm">No images uploaded</span>}
                            </div>
                        </div>
                        <div className="pt-2">
                            <span className="text-gray-500 font-medium block mb-2">Description:</span>
                            <p className="text-gray-800 text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm max-h-32 overflow-y-auto whitespace-pre-wrap">{formData.description || 'No description provided.'}</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-center font-medium">Are you sure you want to {editingProduct ? 'update' : 'publish'} this product?</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                        Review
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={confirmSubmit}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-lg shadow-red-500/30 font-medium flex items-center gap-2"
                    >
                        {loading && <FaSpinner className="animate-spin" />}
                        {editingProduct ? 'Update Now' : 'Confirm & Publish'}
                    </button>
                </div>
            </motion.div>
        </div>
    );

    const renderSalesReport = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Sales Report</h2>
                {salesReport && (
                    <div className="flex gap-3">
                        <button
                            onClick={viewReportAsPDF}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
                        >
                            <FaChartLine /> View PDF
                        </button>
                        <button
                            onClick={downloadReportAsPDF}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold"
                        >
                            <FaDownload /> Download PDF
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate.toISOString().split('T')[0]}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate.toISOString().split('T')[0]}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                    </div>
                    <button
                        onClick={() => fetchSalesReport(startDate, endDate)}
                        disabled={reportLoading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {reportLoading ? <FaSpinner className="animate-spin" /> : <FaChartLine />}
                        Generate Report
                    </button>
                </div>
            </div>

            {salesReport && (
                <div ref={reportContentRef} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
                    {/* Header/Branding Section */}
                    <div className="border-b-2 border-gray-200 pb-6 mb-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <h1 className="text-4xl font-black text-red-600">XCHANGE</h1>
                                <p className="text-gray-600 text-sm mt-1">Sri Lanka's Premier Multi-Vendor Marketplace</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-semibold">SALES REPORT</p>
                                <p className="text-lg font-bold text-gray-800 mt-2">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Report Details */}
                        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                                <p className="text-gray-500 font-semibold">SELLER EMAIL</p>
                                <p className="text-gray-800 font-mono text-xs break-all">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-semibold">REPORT PERIOD</p>
                                <p className="text-gray-800">{startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-semibold">DAYS INCLUDED</p>
                                <p className="text-gray-800">{Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-semibold">GENERATED</p>
                                <p className="text-gray-800">{new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-600 font-semibold">Total Orders</p>
                                <p className="text-3xl font-bold text-blue-800 mt-2">{salesReport.totalOrders}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-green-600 font-semibold">Total Revenue</p>
                                <p className="text-3xl font-bold text-green-800 mt-2">Rs {salesReport.totalRevenue?.toLocaleString()}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                <p className="text-sm text-purple-600 font-semibold">Avg Order Value</p>
                                <p className="text-3xl font-bold text-purple-800 mt-2">Rs {(salesReport.totalRevenue / (salesReport.totalOrders || 1)).toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Details Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Details</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-100">
                                        <th className="px-3 py-2 font-bold text-gray-700">Order ID</th>
                                        <th className="px-3 py-2 font-bold text-gray-700">Product</th>
                                        <th className="px-3 py-2 font-bold text-gray-700">Qty</th>
                                        <th className="px-3 py-2 font-bold text-gray-700">Unit Price</th>
                                        <th className="px-3 py-2 font-bold text-gray-700">Total</th>
                                        <th className="px-3 py-2 font-bold text-gray-700">Buyer</th>
                                        <th className="px-3 py-2 font-bold text-gray-700">Status</th>
                                        <th className="px-3 py-2 font-bold text-gray-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesReport.orders && salesReport.orders.length > 0 ? (
                                        salesReport.orders.map((order, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-gray-600 font-mono text-xs">{order.orderId.slice(-6)}</td>
                                                <td className="px-3 py-2 text-gray-800">{order.productName}</td>
                                                <td className="px-3 py-2 text-gray-600">{order.quantity}</td>
                                                <td className="px-3 py-2 text-gray-600">Rs {order.price?.toLocaleString()}</td>
                                                <td className="px-3 py-2 font-semibold text-gray-800">Rs {order.totalPrice?.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-gray-600 text-xs">{order.buyerName}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-600 text-xs">{new Date(order.dateCreated).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-3 py-6 text-center text-gray-500">No sales in this date range</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t-2 border-gray-200 pt-6 mt-6">
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                            <div>
                                <p className="font-bold text-gray-800">XCHANGE</p>
                                <p>Sri Lanka's Premier Multi-Vendor Marketplace</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800">Support</p>
                                <p>xchangesrilanka@gmail.com</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-800">Confidential</p>
                                <p>This report is for authorized use only</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-4">© 2026 XCHANGE Marketplace. All Rights Reserved.</p>
                    </div>
                </div>
            )}

            {/* Report History Section */}
            {reportHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Previously Generated Reports</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="px-4 py-3 font-semibold text-gray-700">Report Name</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Date Range</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Orders</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Revenue</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Generated</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportHistory.map((report, idx) => (
                                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-800 font-medium">{report.fileName.replace('.pdf', '')}</td>
                                        <td className="px-4 py-3 text-gray-600">{report.startDate} to {report.endDate}</td>
                                        <td className="px-4 py-3 text-gray-600">{report.totalOrders}</td>
                                        <td className="px-4 py-3 text-gray-800 font-semibold">Rs {report.totalRevenue?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">{report.generatedAt.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = '#'; // In production, would be the stored PDF URL
                                                    toast.info('Download from history is available in your downloads folder if previously downloaded');
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs px-2 py-1 rounded hover:bg-blue-50 transition"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderTrackingModal = () => {
        if (!selectedOrderForTracking) return null;
        
        const validNextStages = getValidNextStages(selectedOrderForTracking.currentStage);
        const isCompleted = selectedOrderForTracking.currentStage === 'DELIVERED';

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 border border-gray-100 flex flex-col gap-6"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800">Update Shipment</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Order #{selectedOrderForTracking.id.slice(-8)}</p>
                        </div>
                        <button 
                            onClick={() => setTrackingModalOpen(false)}
                            className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleUpdateTracking} className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Current Status</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                                    <div className="font-bold text-indigo-900 text-sm">{selectedOrderForTracking.currentStage.replace(/_/g, ' ')}</div>
                                </div>
                            </div>

                            {!isCompleted ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest px-1">Next Milestone</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={trackingFormData.newStage}
                                            onChange={(e) => setTrackingFormData({ ...trackingFormData, newStage: e.target.value })}
                                            className="w-full pl-5 pr-10 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none outline-none group-hover:bg-gray-100"
                                        >
                                            <option value="">Select Stage</option>
                                            {validNextStages.map(stage => (
                                                <option key={stage} value={stage}>{stage.replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-indigo-400 transition-colors">
                                            <FaPlus size={12} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic px-1">* You can only progress one step at a time</p>
                                    <p className="text-[10px] text-indigo-500 font-bold px-1 mt-1">
                                        Tracking details required only when order is out for delivery
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                    <FaCheck className="text-emerald-500" />
                                    <span className="text-emerald-900 text-sm font-bold">This order has been successfully delivered.</span>
                                </div>
                            )}

                            {/* ✅ NEW: Only show courier/tracking inputs for OUT_FOR_DELIVERY stage */}
                            {!isCompleted && trackingFormData.newStage === 'OUT_FOR_DELIVERY' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="grid grid-cols-1 gap-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest px-1">Courier Service</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Aramex, Sri Lanka Post"
                                            value={trackingFormData.courierName}
                                            onChange={(e) => setTrackingFormData({ ...trackingFormData, courierName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest px-1">Tracking ID</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. TRK459203"
                                            value={trackingFormData.trackingNumber}
                                            onChange={(e) => setTrackingFormData({ ...trackingFormData, trackingNumber: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {!isCompleted && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setTrackingModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingTracking || !trackingFormData.newStage}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isSubmittingTracking ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {showConfirmModal && renderConfirmModal()}
            {trackingModalOpen && renderTrackingModal()}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2 sticky top-24">
                            <div className="mb-6 px-4 py-2">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FaStore className="text-red-600" /> My Store
                                </h3>
                            </div>

                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaChartLine /> Dashboard
                            </button>

                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'manage' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaBox /> Manage Products
                            </button>

                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaClipboardList /> Manage Orders
                            </button>

                            <button
                                onClick={() => setActiveTab('add')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'add' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaPlus /> Add Product
                            </button>

                            <button
                                onClick={() => setActiveTab('report')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'report' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaChartLine /> Sales Report
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'dashboard' && renderDashboardOverview()}
                            {activeTab === 'manage' && renderManageProducts()}
                            {activeTab === 'orders' && renderOrders()}
                            {activeTab === 'add' && renderAddProduct()}
                            {activeTab === 'report' && renderSalesReport()}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
