import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PDFFileTable = ({ files, onUpdateFile, onDeleteFile, materialData = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  // Debug: Log material data received
  console.log('📦 PDFFileTable - Material data received:', materialData);
  console.log('📊 Material data length:', materialData.length);

  // Extract unique materials from materialData
  const availableMaterials = materialData.length > 0 
    ? [...new Set(materialData.map(m => m.material))]
    : ['Zintec', 'Mild Steel', 'Stainless Steel', 'Aluminum', 'Galvanized Steel'];
  
  console.log('🎯 Available materials for dropdown:', availableMaterials);
  
  // Get available thicknesses and grades for currently selected material
  const getOptionsForMaterial = (selectedMaterial) => {
    if (materialData.length === 0) {
      return {
        thicknesses: ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '4.0', '5.0'],
        grades: ['Grade A', 'Grade B', 'Grade C', 'Grade D']
      };
    }
    
    // Find all entries with this material
    const materialEntries = materialData.filter(m => m.material === selectedMaterial);
    
    if (materialEntries.length === 0) {
      // Fallback to all available options
      return {
        thicknesses: [...new Set(materialData.map(m => m.thickness))],
        grades: [...new Set(materialData.map(m => m.grade).filter(g => g))]
      };
    }
    
    return {
      thicknesses: [...new Set(materialEntries.map(m => m.thickness))],
      grades: [...new Set(materialEntries.map(m => m.grade).filter(g => g))]
    };
  };

  const handleEdit = (fileId, file) => {
    setEditingId(fileId);
    setEditingValues({
      partRef: file.partRef || file.name,
      material: file.material || 'Zintec',
      thickness: file.thickness || '1.5',
      grade: file.grade || '',
      remarks: file.remarks || 'As per drawing', // Default 15 char message
      quantity: file.quantity || 1
    });
  };

  const handleSave = (fileId) => {
    // Validate remarks and quantity before saving
    if (!editingValues.remarks || editingValues.remarks.trim() === '') {
      toast.error('Please enter remarks before saving');
      return;
    }
    
    if (!editingValues.quantity || editingValues.quantity < 1) {
      toast.error('Please enter a valid quantity (minimum 1)');
      return;
    }
    
    onUpdateFile(fileId, editingValues);
    setEditingId(null);
    setEditingValues({});
    toast.success('File details updated successfully');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValues({});
  };

  const handleDelete = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      onDeleteFile(fileId);
    }
  };

  const handleInputChange = (field, value) => {
    // Ensure proper character encoding for text fields
    const processedValue = typeof value === 'string' ? value.trim() : value;
    
    // If material is changed, auto-populate thickness and grade
    if (field === 'material' && materialData.length > 0) {
      const selectedMaterialEntry = materialData.find(m => m.material === value);
      
      if (selectedMaterialEntry) {
        setEditingValues(prev => ({
          ...prev,
          material: value,
          thickness: selectedMaterialEntry.thickness,
          grade: selectedMaterialEntry.grade || prev.grade
        }));
        return;
      }
    }
    
    setEditingValues(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow">
      <style jsx>{`
        .custom-select-scroll {
          max-height: 38px;
        }
        .custom-select-scroll option {
          padding: 8px;
        }
      `}</style>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
        <p className="text-sm text-gray-600">Manage your uploaded files and their specifications</p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
        <table 
          className="w-full divide-y divide-gray-200" 
          style={{ 
            tableLayout: 'fixed'
          }}
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '18%' }}>
                <div className="flex items-center">
                  Part Name
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '13%' }}>
                <div className="flex items-center">
                  Material
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '10%' }}>
                <div className="flex items-center">
                  Thickness
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '11%' }}>
                <div className="flex items-center">
                  Grade
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '18%' }}>
                <div className="flex items-center">
                  Remark
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '8%' }}>
                <div className="flex items-center">
                  Quantity
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '12%' }}>
                <div className="flex items-center">
                  Created
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '10%' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file, index) => {
              const fileId = file.id || index;
              const isEditing = editingId === fileId;
              
              return (
                <tr key={fileId} className="hover:bg-gray-50">
                  {/* Part Ref */}
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingValues.partRef || ''}
                        onChange={(e) => handleInputChange('partRef', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      />
                    ) : (
                      <div className="flex items-center">
                        <DocumentIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span 
                          className="text-sm font-medium text-gray-900 truncate" 
                          title={file.partRef || file.name}
                        >
                          {file.partRef || file.name || 'N/A'}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Material */}
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <select
                        value={editingValues.material || ''}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm custom-select-scroll"
                      >
                        {availableMaterials.map((material) => (
                          <option key={material} value={material}>{material}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">{file.material || availableMaterials[0]}</span>
                    )}
                  </td>

                  {/* Thickness */}
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <select
                        value={editingValues.thickness || ''}
                        onChange={(e) => handleInputChange('thickness', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm custom-select-scroll"
                      >
                        {getOptionsForMaterial(editingValues.material).thicknesses.map((thickness) => (
                          <option key={thickness} value={thickness}>{thickness}mm</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">{file.thickness || '1.5'}mm</span>
                    )}
                  </td>

                  {/* Grade */}
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <select
                        value={editingValues.grade || ''}
                        onChange={(e) => handleInputChange('grade', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm custom-select-scroll"
                      >
                        <option value="">Select Grade</option>
                        {getOptionsForMaterial(editingValues.material).grades.map((grade) => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">{file.grade || '-'}</span>
                    )}
                  </td>

                  {/* Remark */}
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={editingValues.remarks || ''}
                          onChange={(e) => handleInputChange('remarks', e.target.value)}
                          placeholder="Enter remarks here..."
                          required
                          className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            !editingValues.remarks || editingValues.remarks.trim() === '' 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {(!editingValues.remarks || editingValues.remarks.trim() === '') && (
                          <span className="text-xs text-red-600 mt-0.5 block">Required</span>
                        )}
                      </div>
                    ) : (
                      <span 
                        className={`text-sm truncate block ${
                          !file.remarks || file.remarks.trim() === '' 
                            ? 'text-red-600 italic' 
                            : 'text-gray-900'
                        }`}
                        title={file.remarks || 'Remarks required'}
                      >
                        {file.remarks && file.remarks.trim() !== '' ? file.remarks : 'No remarks added ⚠️'}
                      </span>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={editingValues.quantity || ''}
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || '')}
                          placeholder="Qty"
                          required
                          className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            !editingValues.quantity || editingValues.quantity < 1
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {(!editingValues.quantity || editingValues.quantity < 1) && (
                          <span className="text-xs text-red-600 mt-0.5 block">Required</span>
                        )}
                      </div>
                    ) : (
                      <span 
                        className={`text-sm ${
                          !file.quantity || file.quantity < 1 
                            ? 'text-red-600 font-semibold' 
                            : 'text-gray-900'
                        }`}
                      >
                        {file.quantity && file.quantity >= 1 ? file.quantity : '⚠️'}
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {formatDate(file.createdAt || file.created)}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(fileId)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            title="Save"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            title="Cancel"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(fileId, file)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(fileId)}
                        className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {files.length} file{files.length !== 1 ? 's' : ''} uploaded
        </p>
        <button
          type="button"
          className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          SAVE
        </button>
      </div>
    </div>
  );
};

export default PDFFileTable;