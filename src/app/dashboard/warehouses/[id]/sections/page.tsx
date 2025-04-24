'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button, Modal, ConfirmDialog } from '@/components/ui'
import WarehouseSectionForm from '@/components/warehouses/WarehouseSectionForm'
import { Warehouse, WarehouseSection } from '@/lib/supabase'

export default function WarehouseSectionsPage() {
  const params = useParams()
  const warehouseId = params.id as string
  
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [sections, setSections] = useState<WarehouseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<WarehouseSection | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseAndSections()
    }
  }, [warehouseId])

  async function fetchWarehouseAndSections() {
    try {
      setLoading(true)

      // Fetch warehouse details
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', warehouseId)
        .single()

      if (warehouseError) {
        throw warehouseError
      }

      // Fetch warehouse sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('warehouse_sections')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('name')

      if (sectionsError) {
        throw sectionsError
      }

      setWarehouse(warehouseData)
      setSections(sectionsData || [])
    } catch (error: any) {
      console.error('Error fetching warehouse and sections:', error)
      setError(error.message || 'Failed to load warehouse and sections')
    } finally {
      setLoading(false)
    }
  }

  // Open add modal
  const handleAddClick = () => {
    setIsAddModalOpen(true)
  }

  // Open edit modal
  const handleEditClick = (section: WarehouseSection) => {
    setSelectedSection(section)
    setIsEditModalOpen(true)
  }

  // Open delete modal
  const handleDeleteClick = (section: WarehouseSection) => {
    setSelectedSection(section)
    setIsDeleteModalOpen(true)
  }

  // Add a new section
  const handleAddSection = async (data: Omit<WarehouseSection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true)

      const { data: newSection, error } = await supabase
        .from('warehouse_sections')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setSections(prev => [...prev, newSection])
      setIsAddModalOpen(false)
    } catch (error: any) {
      console.error('Error adding section:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update an existing section
  const handleUpdateSection = async (data: Omit<WarehouseSection, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedSection) return

    try {
      setIsSubmitting(true)

      const { data: updatedSection, error } = await supabase
        .from('warehouse_sections')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSection.id)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setSections(prev => prev.map(section => 
        section.id === selectedSection.id ? updatedSection : section
      ))
      setIsEditModalOpen(false)
      setSelectedSection(null)
    } catch (error: any) {
      console.error('Error updating section:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete a section
  const handleDeleteSection = async () => {
    if (!selectedSection) return

    try {
      setIsSubmitting(true)

      // First check if section has inventory
      const { count, error: countError } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('location', selectedSection.id)

      if (countError) {
        throw countError
      }

      // If section has inventory, prevent deletion
      if (count && count > 0) {
        throw new Error('Cannot delete section with existing inventory. Please move or remove all items first.')
      }

      // Delete section
      const { error } = await supabase
        .from('warehouse_sections')
        .delete()
        .eq('id', selectedSection.id)

      if (error) {
        throw error
      }

      setSections(prev => prev.filter(section => section.id !== selectedSection.id))
      setIsDeleteModalOpen(false)
      setSelectedSection(null)
    } catch (error: any) {
      console.error('Error deleting section:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Warehouse Not Found</h2>
          <p className="text-gray-600 mb-6">The warehouse you are looking for does not exist or has been deleted.</p>
          <Link href="/dashboard/warehouses" className="btn-primary">
            Return to Warehouses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex items-center">
            <Link href="/dashboard/warehouses" className="mr-4 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-0">
              {warehouse.name} - Sections
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-8">
        <div className="page-header">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Warehouse Sections</h2>
            <p className="text-gray-600">
              Manage sections for {warehouse.name} at {warehouse.location}
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={handleAddClick}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          >
            Add New Section
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No sections found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first warehouse section</p>
            <Button variant="primary" onClick={handleAddClick}>
              Create Your First Section
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex">
                    <div className="mr-4 p-2 bg-indigo-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{section.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="border-t border-b border-gray-100 py-4 my-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-medium">{section.capacity}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    href={`/dashboard/warehouses/${warehouseId}/sections/${section.id}/inventory`} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-center text-sm py-2 px-4 rounded-md transition-colors"
                  >
                    View Inventory
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(section)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Edit Section
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(section)}
                    className="text-red-600 hover:bg-red-50 col-span-2"
                  >
                    Delete Section
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New Section to ${warehouse.name}`}
        size="md"
      >
        <WarehouseSectionForm
          warehouseId={warehouseId}
          onSubmit={handleAddSection}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Section"
        size="md"
      >
        {selectedSection && (
          <WarehouseSectionForm
            section={selectedSection}
            warehouseId={warehouseId}
            onSubmit={handleUpdateSection}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSection}
        title="Delete Section"
        message={`Are you sure you want to delete ${selectedSection?.name}? This action cannot be undone.`}
        confirmText="Delete Section"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />
    </div>
  )
} 