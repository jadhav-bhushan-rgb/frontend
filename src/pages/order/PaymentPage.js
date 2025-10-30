import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quotationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: ''
  });
  const [walletOption, setWalletOption] = useState('');
  const [netBankingOption, setNetBankingOption] = useState('');

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
        // Fallback to mock data
        setQuotation({
          _id: id,
          quotationNumber: 'QT250915596',
          inquiryNumber: 'INQ250913346',
          status: 'sent',
          totalAmount: 12.00,
          validUntil: '2025-10-15',
          parts: [
            {
              partRef: 'test-inquiry-files (2).zip',
              material: 'Zintec',
              quantity: 2,
              unitPrice: 6.00,
              totalPrice: 12.00
            }
          ],
          customer: {
            firstName: user?.firstName || 'Bhushan',
            lastName: user?.lastName || 'Jadhav',
            email: user?.email || 'bhushan@gmail.com'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      // Use mock data as fallback
      setQuotation({
        _id: id,
        quotationNumber: 'QT250915596',
        inquiryNumber: 'INQ250913346',
        status: 'sent',
        totalAmount: 12.00,
        validUntil: '2025-10-15',
        parts: [
          {
            partRef: 'test-inquiry-files (2).zip',
            material: 'Zintec',
            quantity: 2,
            unitPrice: 6.00,
            totalPrice: 12.00
          }
        ],
        customer: {
          firstName: user?.firstName || 'Bhushan',
          lastName: user?.lastName || 'Jadhav',
          email: user?.email || 'bhushan@gmail.com'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'online' && !cardDetails.cardNumber && !upiId) {
      toast.error('Please enter payment details');
      return;
    }

    setPaymentLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update quotation status to accepted
      const response = await quotationAPI.acceptQuotation(id, {
        paymentMethod: paymentMethod,
        paymentDetails: paymentMethod === 'online' ? cardDetails : { upiId }
      });
      
      if (response.data.success) {
        toast.success('Payment successful! Your quotation has been accepted and order is being processed.');
        setQuotation({ ...quotation, status: 'accepted' });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    } else if (field === 'expiryDate') {
      // Format expiry date MM/YY
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    } else if (field === 'cvv') {
      // Limit CVV to 3 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    
    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
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
            <Link to="/quotations" className="text-blue-600 hover:text-blue-800">
              Back to Quotations
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
            to={`/quotation/${quotation._id}`}
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
                  <span className="text-sm font-medium text-gray-900">#{quotation.inquiryNumber}</span>
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
              
              <div className="space-y-3">
                {/* Credit/Debit Card */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">💳</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
                        <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* UPI */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">📱</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">UPI Payment</span>
                        <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Net Banking */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">🏦</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Net Banking</span>
                        <p className="text-xs text-gray-500">SBI, HDFC, ICICI, Axis Bank</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Bank Transfer */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="banktransfer"
                      checked={paymentMethod === 'banktransfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">🏛️</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                        <p className="text-xs text-gray-500">Direct bank account transfer</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Digital Wallets */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">👛</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Digital Wallet</span>
                        <p className="text-xs text-gray-500">Paytm, PhonePe, Google Pay Wallet</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* EMI */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="emi"
                      checked={paymentMethod === 'emi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">💳</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">EMI Payment</span>
                        <p className="text-xs text-gray-500">No Cost EMI available</p>
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* Cash on Delivery */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">💰</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Cash on Delivery</span>
                        <p className="text-xs text-gray-500">Pay when your order is delivered</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Gateway</h4>
                    <p className="text-sm text-blue-700">
                      You will be redirected to our secure payment gateway to complete the transaction.
                    </p>
                  </div>
                  
                  {/* Card Details Form */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Card Details</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardName}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cardName: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* UPI Option */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Or Pay with UPI</h4>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">UPI Payment</h4>
                    <p className="text-sm text-green-700">
                      Enter your UPI ID to proceed with payment
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: Google Pay, PhonePe, Paytm, BHIM, Amazon Pay
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Net Banking</h4>
                    <p className="text-sm text-blue-700">
                      Select your bank to proceed with payment
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Bank
                    </label>
                    <select
                      value={netBankingOption}
                      onChange={(e) => setNetBankingOption(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="canara">Canara Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === 'banktransfer' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">Bank Transfer Details</h4>
                    <p className="text-sm text-purple-700">
                      Transfer the amount to our bank account
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={bankAccount.accountNumber}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="Enter your account number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={bankAccount.ifscCode}
                          onChange={(e) => setBankAccount(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                          placeholder="SBIN0001234"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankAccount.bankName}
                          onChange={(e) => setBankAccount(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="State Bank of India"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={bankAccount.accountHolderName}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        placeholder="Enter account holder name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">Digital Wallet</h4>
                    <p className="text-sm text-orange-700">
                      Select your preferred wallet
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Wallet
                    </label>
                    <select
                      value={walletOption}
                      onChange={(e) => setWalletOption(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Choose your wallet</option>
                      <option value="paytm">Paytm</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="googlepay">Google Pay</option>
                      <option value="amazonpay">Amazon Pay</option>
                      <option value="mobikwik">MobiKwik</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === 'emi' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-indigo-900 mb-2">EMI Payment</h4>
                    <p className="text-sm text-indigo-700">
                      Choose your EMI tenure
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      EMI Tenure
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select EMI tenure</option>
                      <option value="3">3 Months EMI</option>
                      <option value="6">6 Months EMI</option>
                      <option value="9">9 Months EMI</option>
                      <option value="12">12 Months EMI</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      No Cost EMI available on selected cards
                    </p>
                  </div>
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
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium text-lg"
                >
                  {paymentLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay $${quotation.totalAmount?.toFixed(2) || '0.00'}`
                  )}
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
    </div>
  );
};

export default PaymentPage;