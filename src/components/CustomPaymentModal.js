import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CustomPaymentModal = ({ isOpen, onClose, quotation, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing with dummy data
      console.log('Processing dummy payment...');
      console.log('Selected method:', selectedMethod);
      console.log('UPI ID:', upiId);
      console.log('Phone Number:', phoneNumber);
      console.log('Amount:', quotation?.totalAmount);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Always simulate successful payment for demo
      toast.success(`Dummy payment successful! ${selectedMethod.toUpperCase()} payment processed.`);
      console.log('Dummy payment completed successfully');
      
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Dummy payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Payment Options</h3>
            <p className="text-sm text-orange-600 font-medium">DEMO MODE - No Real Money</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* UPI Payment */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center mb-3">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={selectedMethod === 'upi'}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mr-3"
              />
              <span className="font-medium">UPI Payment</span>
            </label>
            
            {selectedMethod === 'upi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter your UPI ID (e.g., 1234567890@paytm)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>UPI ID:</strong> cutbend@paytm</p>
                  <p><strong>Amount:</strong> ₹{quotation?.totalAmount || 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* PhonePe Payment */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center mb-3">
              <input
                type="radio"
                name="paymentMethod"
                value="phonepe"
                checked={selectedMethod === 'phonepe'}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mr-3"
              />
              <span className="font-medium">PhonePe</span>
            </label>
            
            {selectedMethod === 'phonepe' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your PhonePe registered number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>PhonePe Number:</strong> +91 9876543210</p>
                  <p><strong>Amount:</strong> ₹{quotation?.totalAmount || 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Google Pay */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center mb-3">
              <input
                type="radio"
                name="paymentMethod"
                value="gpay"
                checked={selectedMethod === 'gpay'}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mr-3"
              />
              <span className="font-medium">Google Pay</span>
            </label>
            
            {selectedMethod === 'gpay' && (
              <div className="text-sm text-gray-600">
                <p><strong>Google Pay Number:</strong> +91 9876543210</p>
                <p><strong>Amount:</strong> ₹{quotation?.totalAmount || 0}</p>
              </div>
            )}
          </div>

          {/* Paytm */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center mb-3">
              <input
                type="radio"
                name="paymentMethod"
                value="paytm"
                checked={selectedMethod === 'paytm'}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mr-3"
              />
              <span className="font-medium">Paytm</span>
            </label>
            
            {selectedMethod === 'paytm' && (
              <div className="text-sm text-gray-600">
                <p><strong>Paytm Number:</strong> +91 9876543210</p>
                <p><strong>Amount:</strong> ₹{quotation?.totalAmount || 0}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ₹${quotation?.totalAmount || 0} (Demo)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPaymentModal;
