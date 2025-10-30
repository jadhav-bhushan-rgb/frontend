import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { inquiryAPI, handleApiError, handleApiSuccess } from '../../services/api';
import toast from 'react-hot-toast';
import PDFFileTable from '../../components/PDFFileTable';
import UserInfoDisplay from '../../components/UserInfoDisplay';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NewInquiry = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    material: '',
    thickness: '',
    grade: '',
    remark: '',
    files: []
  });
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [materialData, setMaterialData] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch material data from admin on component mount
  useEffect(() => {
    fetchMaterialData();
  }, []);

  const fetchMaterialData = async () => {
    try {
      console.log('🔍 Fetching material data from admin...');
      console.log('API URL:', `${API_URL}/api/admin/materials`);
      
      const response = await axios.get(`${API_URL}/api/admin/materials`);
      console.log('✅ API Response:', response.data);
      
      if (response.data.success && response.data.materialData) {
        const activeMaterials = response.data.materialData.filter(m => m.status === 'Active');
        console.log('📊 Total materials from DB:', response.data.materialData.length);
        console.log('✓ Active materials:', activeMaterials.length);
        console.log('📦 Material data:', activeMaterials);
        
        if (activeMaterials.length > 0) {
          setMaterialData(activeMaterials);
          // Success - materials loaded (no toast needed)
          console.log('✅ Materials loaded:', activeMaterials.length);
          console.log('✅ Available materials:', activeMaterials.map(m => m.material).join(', '));
        } else {
          console.warn('⚠️ No active materials in database!');
          setMaterialData([]);
          toast.error('⚠️ No materials found! Please ask admin to add materials first.', {
            duration: 5000
          });
        }
      } else {
        console.warn('⚠️ No material data in response');
        setMaterialData([]);
        toast.error('⚠️ No materials in database! Please contact admin.', {
          duration: 5000
        });
      }
    } catch (error) {
      console.error('❌ Error fetching material data:', error);
      console.error('Error details:', error.response?.data);
      toast.error('❌ Failed to load materials. Please check backend server.', {
        duration: 5000
      });
      setMaterialData([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      console.log('Files dropped:', files);
      
      const validFiles = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return ['dwg', 'dxf', 'zip', 'pdf', 'xlsx', 'xls'].includes(extension);
      });
      
      if (validFiles.length !== files.length) {
        toast.error('Only DWG, DXF, ZIP, PDF, XLSX, and XLS files are allowed');
      }
      
      if (validFiles.length === 0) {
        toast.error('No valid files dropped');
        return;
      }
      
      // Process ALL files for the table - use admin's material data
      if (materialData.length === 0) {
        toast.error('⚠️ No materials available! Please ask admin to add materials first.');
        return;
      }
      
      const defaultMaterial = materialData[0];
      
      console.log('🔧 Using default material for dropped files:', defaultMaterial);
      console.log('📦 Total available materials:', materialData.length);
      
      const processedFiles = validFiles.map((file, index) => ({
        id: `file_${Date.now()}_${index}`,
        name: file.name,
        partRef: file.name,
        material: defaultMaterial.material,
        thickness: defaultMaterial.thickness,
        grade: defaultMaterial.grade || '',
        remarks: '', // Empty by default - user must fill
        quantity: 1,
        createdAt: new Date().toISOString(),
        file: file,
        fileType: file.name.split('.').pop().toLowerCase()
      }));
      
      setPdfFiles(prev => {
        const newFiles = [...prev, ...processedFiles];
        console.log('Files dropped:', processedFiles);
        console.log('Previous files:', prev);
        console.log('New total files:', newFiles.length);
        toast.success(`${validFiles.length} file(s) uploaded successfully`);
        return newFiles;
      });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return ['dwg', 'dxf', 'zip', 'pdf', 'xlsx', 'xls'].includes(extension);
    });
    
    if (validFiles.length !== files.length) {
      toast.error('Only DWG, DXF, ZIP, PDF, XLSX, and XLS files are allowed');
    }
    
    if (validFiles.length === 0) {
      toast.error('No valid files selected');
      return;
    }
    
    // Process ALL files for the table (not just PDFs) - use admin's material data
    if (materialData.length === 0) {
      toast.error('⚠️ No materials available! Please ask admin to add materials first.');
      return;
    }
    
    const defaultMaterial = materialData[0];
    
    console.log('🔧 Using default material for files:', defaultMaterial);
    console.log('📦 Total available materials:', materialData.length);
    
    const processedFiles = validFiles.map((file, index) => ({
      id: `file_${Date.now()}_${index}`,
      name: file.name,
      partRef: file.name,
      material: defaultMaterial.material,
      thickness: defaultMaterial.thickness,
      grade: defaultMaterial.grade || '',
      remarks: '', // Empty by default - user must fill
      quantity: 1,
      createdAt: new Date().toISOString(),
      file: file,
      fileType: file.name.split('.').pop().toLowerCase()
    }));
    
    setPdfFiles(prev => {
      const newFiles = [...prev, ...processedFiles];
      console.log('Files uploaded:', processedFiles);
      console.log('Previous files:', prev);
      console.log('New total files:', newFiles.length);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
      return newFiles;
    });
  };

  const removeFile = (index) => {
    setFormData({
      ...formData,
      files: formData.files.filter((_, i) => i !== index)
    });
  };

  const handleUpdatePdfFile = (fileId, updatedData) => {
    setPdfFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, ...updatedData, updatedAt: new Date().toISOString() }
          : file
      )
    );
    toast.success('File updated successfully');
  };

  const handleDeletePdfFile = (fileId) => {
    setPdfFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success('File deleted successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submit button clicked');
    console.log('PDF Files:', pdfFiles);
    console.log('Form Data:', formData);
    
    if (pdfFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }
    
    // Validate that all files have remarks and quantity
    const filesWithoutRemarks = pdfFiles.filter(file => !file.remarks || file.remarks.trim() === '');
    const filesWithoutQuantity = pdfFiles.filter(file => !file.quantity || file.quantity < 1);
    
    if (filesWithoutRemarks.length > 0) {
      toast.error(`Please add remarks for all files. ${filesWithoutRemarks.length} file(s) missing remarks.`);
      return;
    }
    
    if (filesWithoutQuantity.length > 0) {
      toast.error(`Please add valid quantity for all files. ${filesWithoutQuantity.length} file(s) have invalid quantity.`);
      return;
    }
    
    setLoading(true);

    try {
      // Use files from the table for submission
      const allFiles = pdfFiles.map(file => file.file);
      const submissionData = {
        ...formData,
        files: allFiles,
        fileMetadata: pdfFiles // Include file metadata separately
      };
      
      const result = await inquiryAPI.createInquiry(submissionData);
      const response = handleApiSuccess(result);
      
      toast.success(response.message || 'Inquiry submitted successfully!');
      navigate('/inquiries');
    } catch (error) {
      const errorResponse = handleApiError(error);
      toast.error(errorResponse.error || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="ml-2 text-lg font-bold text-gray-900 hover:text-green-600 transition-colors duration-200">CUTBEND</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 mr-20 gap-4">
                <Link 
                  to="/inquiry/new" 
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  New Inquiry
                </Link>
                <Link 
                  to="/inquiry/new" 
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Upload Drawing
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <select className="text-sm border-none bg-transparent focus:outline-none">
                  <option>English</option>
                </select>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      {user?.lastName?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email || 'User'
                      }
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.companyName || 'Company'}
                    </span>
                  </div>
                </div>
                <Link 
                  to="/orders" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  ORDER
                </Link>
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Location</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <div className="w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 sticky top-4">
            {/* New Inquiry Button */}
            <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl font-semibold mb-4 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              New Inquiry
            </button>
            
            {/* Shop Hardware Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-800">SHOP HARDWARE</span>
                <span className="text-gray-500 text-xs">▼</span>
              </div>
              
              {/* Navigation Links */}
              <div className="space-y-1">
                <Link 
                  to="/inquiries" 
                  className="flex items-center space-x-3 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-green-200"
                >
                  <span className="text-lg">⚠️</span>
                  <span className="font-medium">RFQs</span>
                </Link>
                <Link 
                  to="/orders" 
                  className="flex items-center space-x-3 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-green-200"
                >
                  <span className="text-lg">📦</span>
                  <span className="font-medium">My Orders</span>
                </Link>
                <Link 
                  to="/parts" 
                  className="flex items-center space-x-3 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent6hover:border-green-200"
                >
                  <span className="text-lg">🔧</span>
                  <span className="font-medium">My Parts</span>
                </Link>
                <Link 
                  to="/tools" 
                  className="flex items-center space-x-3 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-green-200"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium">Engineering Tools</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 pr-6 sm:pr-8 lg:pr-10 xl:pr-16 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              {/* File Upload Section - Full Width */}
              <div className="bg-white rounded-lg shadow p-2">
                <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-8 text-center min-h-[300px] flex flex-col justify-center">
                  <div
                    className={`flex flex-col items-center justify-center h-full ${dragActive ? 'bg-green-100' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="text-6xl mb-1 text-green-400"></div>
                    <p className="text-xl font-medium text-gray-700 mb-1">
                      Drag files to upload or
                    </p>
                    <label className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-lg cursor-pointer">
                      BROWSE
                      <input
                        type="file"
                        multiple
                        accept=".dwg,.dxf,.zip,.pdf,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-4">
                      Allowed extensions: dwg, dxf, zip, pdf, xlsx, xls
                    </p>
                  </div>
                </div>
                
              </div>
            </div>

            {/* PDF Files Table - Full Width - Always reserve space */}
            <div className="mt-4 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              {pdfFiles.length > 0 ? (
                <PDFFileTable 
                  files={pdfFiles}
                  onUpdateFile={handleUpdatePdfFile}
                  onDeleteFile={handleDeletePdfFile}
                  showCreatedColumn={false}
                  materialData={materialData}
                />
              ) : null}
            </div>

            {/* User Information Display - After PDF Files Table */}
            <div className="mt-4 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              <UserInfoDisplay />
            </div>

            {/* Material and Thickness Input */}
            <div className="mt-8 bg-white rounded-lg shadow p-3 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material, Thickness, Grade, Required Quantity, for each file. With Remark.
                  </label>
                  <textarea
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter material specifications, thickness, grade, quantity, and any remarks for each file..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || pdfFiles.length === 0}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            </div>

            {/* Information Panels - Moved to bottom after Submit Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              {/* Available Manufacturing Processes */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Available Manufacturing Processes
                </h3>
                <div className="space-y-2">
                  {[
                    'Laser Cutting',
                    'CNC Bending',
                    'CNC Turning',
                    'Laser Engraving',
                    'Chamfer',
                    'Threading',
                    'Surface Finishing'
                  ].map((process) => (
                    <div key={process} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-sm text-gray-700">{process}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Policy */}
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Content Policy Agreement
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  By uploading your file, you agree and acknowledge and ratify the technical drawings are respecting K.
                </p>
                <div className="space-y-2">
                  {[
                    'Illegal, false or offensive parts',
                    'Weapons or military parts',
                    'Export controlled parts',
                    'Intellectual property infringement'
                  ].map((item) => (
                    <div key={item} className="flex items-center text-sm text-red-600">
                      <span className="mr-2">✗</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInquiry;
