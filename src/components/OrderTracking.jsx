import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { CheckCircle2, Package, Truck, Home, Clock, AlertCircle, ChevronDown, ChevronUp, MapPin, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderReviews from './OrderReviews';

const OrderTracking = ({ orderId, productId }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const fetchTracking = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getTracking(orderId);
            setTrackingData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching tracking data:', err);
            // Handle 404 specifically for "Tracking not started yet"
            if (err.response?.status === 404) {
                setTrackingData(null);
                setError(null); // Not a technical error, just no data yet
            } else {
                setError('Failed to load tracking information.');
            }
        } finally {
            setLoading(false);
        }
    };

    const STAGES = [
        { key: 'PLACED', label: 'Order Received', icon: Clock, description: 'Your order has been placed successfully.' },
        { key: 'PACKED', label: 'Packed', icon: Package, description: 'Your order is being processed and packed.' },
        { key: 'SHIPPED', label: 'Shipped', icon: Truck, description: 'Your order is on its way to you.' },
        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin, description: 'Your order is out for delivery with our courier.' },
        { key: 'DELIVERED', label: 'Delivered', icon: Home, description: 'Your order has been delivered.' }
    ];

    useEffect(() => {
        if (orderId) {
            fetchTracking();
        }
    }, [orderId]);

    const handleConfirmDelivery = async () => {
        try {
            setIsConfirming(true);
            console.log(`[Tracking] Attempting to confirm delivery for Order: ${orderId}`);
            await orderAPI.confirmDelivery(orderId);
            toast.success('Delivery confirmed! Thank you for your purchase.');
            // Auto-refresh data to show "DELIVERED"
            await fetchTracking();
        } catch (err) {
            console.error('[Tracking] API Error Details:', {
                status: err.response?.status,
                data: err.response?.data,
                url: err.config?.url
            });
            // ✅ Fix: Use .error since GlobalExceptionHandler returns that
            const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to confirm delivery. Please refresh the page.';
            toast.error(msg);
        } finally {
            setIsConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-3">
                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-400">Fetching live tracking updates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm font-bold text-red-600">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!trackingData) {
        return (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-slate-400" size={24} />
                </div>
                <h4 className="text-slate-800 font-bold mb-1">Tracking not started yet</h4>
                <p className="text-sm font-medium text-slate-400 max-w-[200px] mx-auto">The seller is preparing your order for shipment.</p>
                <button 
                    disabled 
                    className="mt-6 px-6 py-2.5 bg-slate-200 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed"
                >
                    Confirm Delivery
                </button>
            </div>
        );
    }

    // Helper to determine stage status
    const getStageStatus = (stageKey) => {
        const stageData = trackingData.stages?.find(s => s.stage === stageKey);
        
        if (stageData?.completed) return 'completed';
        
        // If not completed, check if it's the current active one
        // The current status from backend matches this key
        if (trackingData.status === stageKey) return 'current';
        
        return 'pending';
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-50 pb-6">
                <div>
                    <h4 className="text-lg font-bold text-slate-800">Shipment Details</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">Order ID: <span className="text-slate-600 font-bold">#{orderId.slice(-8).toUpperCase()}</span></p>
                </div>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {trackingData.status?.replace(/_/g, ' ') || 'PROCESSING'}
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative space-y-0 pl-1">
                {STAGES.map((stage, index) => {
                    const status = getStageStatus(stage.key);
                    const stageBackendData = trackingData.stages?.find(s => s.stage === stage.key);
                    const Icon = stage.icon;
                    const isLast = index === STAGES.length - 1;
                    
                    const formatTimestamp = (ts) => {
                        if (!ts) return '';
                        try {
                            const date = new Date(ts);
                            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + 
                                   date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        } catch (e) { return ts; }
                    };

                    const timestamp = formatTimestamp(stageBackendData?.timestamp) || 
                                     (status === 'completed' ? 'Processed' : '');

                    return (
                        <div key={stage.key} className="relative flex min-h-[80px]">
                            {/* Vertical Line */}
                            {!isLast && (
                                <div className={`absolute left-[15px] top-[30px] bottom-[-10px] w-0.5 ${status === 'completed' ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                            )}

                            {/* Circular Icon / Marker */}
                            <div className="relative z-10 flex flex-col items-center mr-6">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                    status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 
                                    status === 'current' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 animate-pulse' : 
                                    'bg-slate-100 text-slate-300'
                                }`}>
                                    {status === 'completed' ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-8">
                                <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-1">
                                    <h5 className={`font-bold text-sm transition-colors duration-500 ${
                                        status === 'pending' ? 'text-slate-300' : 'text-slate-800'
                                    }`}>
                                        {stage.label}
                                    </h5>
                                    {timestamp && (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            {timestamp}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs leading-relaxed transition-colors duration-500 ${
                                    status === 'pending' ? 'text-slate-200' : 'text-slate-500'
                                }`}>
                                    {stage.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Courier Info Footer (Only visible once OUT_FOR_DELIVERY or DELIVERED) */}
            {(trackingData.status === 'OUT_FOR_DELIVERY' || trackingData.status === 'DELIVERED') && (
                <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        {trackingData.courierName && (
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Carrier Information</p>
                                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Truck size={14} className="text-slate-400" />
                                    {trackingData.courierName}
                                </p>
                            </div>
                        )}
                        {trackingData.trackingNumber && (
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Tracking ID</p>
                                <p className="text-sm font-bold text-blue-600 select-all font-mono">#{trackingData.trackingNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* ✅ Confirm Delivery Button */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={handleConfirmDelivery}
                            disabled={isConfirming || trackingData.status === 'DELIVERED'}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                                trackingData.status === 'DELIVERED' 
                                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                            } disabled:opacity-75 disabled:active:scale-100 disabled:cursor-not-allowed`}
                        >
                            {isConfirming ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={16} /> Verifying...
                                </span>
                            ) : trackingData.status === 'DELIVERED' || trackingData.status === 'CLOSED' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> Delivered
                                </span>
                            ) : (
                                'Confirm Delivery'
                            )}
                        </button>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight text-center">
                            {trackingData.status === 'DELIVERED' 
                                ? 'Order marked as completed on your end' 
                                : 'Click only when you have received the package'}
                        </p>
                    </div>
                </div>
            )}
            
            {/* Added for missing spinner icon */}
            {isConfirming && (
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                `}</style>
            )}

            {/* Reviews Section - Show during delivery and after delivery */}
            {(trackingData.status === 'OUT_FOR_DELIVERY' || trackingData.status === 'DELIVERED' || trackingData.status === 'CLOSED' || trackingData.status === 'COMPLETED') && productId && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <OrderReviews
                        orderId={orderId}
                        productId={productId}
                        orderStatus={trackingData.status}
                        canReview={true}
                    />
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
