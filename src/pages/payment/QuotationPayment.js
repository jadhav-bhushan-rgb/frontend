import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quotationAPI, orderAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import CustomPaymentModal from '../../components/CustomPaymentModal';

const QuotationPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [showCustomPayment, setShowCustomPayment] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await quotationAPI.getQuotation(id);
      
      if (response.data.success) {
        setQuotation(response.data.quotation);
      } else {
        toast.error(response.data.message || 'Failed to fetch quotation details');
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('Failed to fetch quotation details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      if (paymentMethod === 'direct') {
        // Show custom payment modal for direct payment
        setShowCustomPayment(true);
        setPaymentLoading(false);
        return;
      }
      
      if (paymentMethod === 'online') {
        // DUMMY PAYMENT - Skip real Razorpay integration for now
        console.log('Processing dummy online payment...');
        console.log('Amount:', quotation.totalAmount);
        console.log('Quotation:', quotation.quotationNumber);
        
        // Simulate payment processing
        toast.success('Processing dummy payment...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Accept quotation and create order directly
        await acceptQuotation();
        
        const orderData = {
          paymentMethod: 'online',
          totalAmount: quotation.totalAmount,
          parts: quotation.items || quotation.parts,
          customer: quotation.inquiry?.customer,
          deliveryAddress: quotation.inquiry?.deliveryAddress
        };

        const response = await orderAPI.createOrder(quotation._id, orderData);
        
        if (response.data.success) {
          toast.success('Dummy payment successful! Order created.');
          navigate(`/order/${response.data.order.id}`);
        } else {
          toast.error(response.data.message || 'Failed to create order');
        }
      } else {
        // Cash on Delivery - accept quotation and create order
        await acceptQuotation();
        
        const orderData = {
          paymentMethod: 'cod',
          status: 'confirmed',
          totalAmount: quotation.totalAmount,
          parts: quotation.items || quotation.parts,
          customer: quotation.inquiry?.customer,
          deliveryAddress: quotation.inquiry?.deliveryAddress
        };

        const response = await orderAPI.createOrder(quotation._id, orderData);
        
        console.log('Order creation response:', response.data);
        
        if (response.data.success) {
          const orderId = response.data.order.id || response.data.order._id;
          console.log('Navigating to order:', orderId);
          toast.success('Order created successfully! Payment will be collected on delivery.');
          navigate(`/order/${orderId}`);
        } else {
          toast.error(response.data.message || 'Failed to create order');
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const acceptQuotation = async () => {
    try {
      const response = await quotationAPI.acceptQuotation(quotation._id);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to accept quotation');
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Quotation not found</h1>
            <Link to="/inquiries" className="text-blue-600 hover:text-blue-800">
              Back to Inquiries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            to={`/quotation/${quotation.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Quotation
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quotation ID:</span>
                  <span className="text-sm font-medium text-gray-900">#{quotation.quotationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inquiry ID:</span>
                  <span className="text-sm font-medium text-gray-900">#{quotation.inquiry?.inquiryNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valid Until:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="space-y-2">
                    {quotation.parts?.map((part, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{part.partRef} ({part.material})</span>
                        <span className="text-gray-900">${part.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span>${quotation.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Online Payment (Credit/Debit Card, UPI, Net Banking)</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="direct"
                      checked={paymentMethod === 'direct'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Direct Payment (UPI ID, PhonePe, Google Pay, Paytm)</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'online' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Dummy Payment Gateway</h4>
                  <p className="text-sm text-blue-700">
                    <strong>DEMO MODE:</strong> This will simulate a successful payment without real money transaction.
                  </p>
                </div>
              )}

              {paymentMethod === 'direct' && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Dummy Direct Payment</h4>
                  <p className="text-sm text-green-700">
                    <strong>DEMO MODE:</strong> Simulate UPI ID, PhonePe, Google Pay, or Paytm payment without real transaction.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">Cash on Delivery</h4>
                  <p className="text-sm text-yellow-700">
                    Payment will be collected when your order is delivered. Additional COD charges may apply.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                        {paymentLoading ? 'Processing...' : `Pay $${quotation.totalAmount?.toFixed(2) || '0.00'} (Demo)`}
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By proceeding, you agree to our Terms & Conditions and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Payment Modal */}
      <CustomPaymentModal
        isOpen={showCustomPayment}
        onClose={() => setShowCustomPayment(false)}
        quotation={quotation}
        onPaymentSuccess={async () => {
          try {
            // Accept quotation and create order for direct payment
            await acceptQuotation();
            
            const orderData = {
              paymentMethod: 'direct',
              totalAmount: quotation.totalAmount,
              parts: quotation.items || quotation.parts,
              customer: quotation.inquiry?.customer,
              deliveryAddress: quotation.inquiry?.deliveryAddress
            };

            const response = await orderAPI.createOrder(quotation._id, orderData);
            
            console.log('Direct payment order creation response:', response.data);
            
            if (response.data.success) {
              const orderId = response.data.order.id || response.data.order._id;
              console.log('Navigating to order:', orderId);
              toast.success('Order created successfully! Payment details sent to your registered number.');
              navigate(`/order/${orderId}`);
            } else {
              toast.error(response.data.message || 'Failed to create order');
            }
          } catch (error) {
            console.error('Direct payment error:', error);
            toast.error('Payment processing failed. Please try again.');
          }
        }}
      />
    </div>
  );
};

export default QuotationPayment;