'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button, Modal, ConfirmDialog } from '@/components/ui'
import InventoryForm from '@/components/inventory/InventoryForm'
import InventoryList from '@/components/inventory/InventoryList'

interface Inventory {
  id: number
  name: string
  quantity: number
  category: string
  min_stock: number
  sku: string
  created_at: string
  updated_at: string
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name')

      if (error) {
        throw error
      }

      setInventory(data || [])
    } catch (error: any) {
      console.error('재고 불러오기 오류:', error)
      setError(error.message || '재고 불러오기에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // Open add modal
  const handleAddClick = () => {
    setIsAddModalOpen(true)
  }

  // Open edit modal
  const handleEditClick = (item: Inventory) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }

  // Open delete modal
  const handleDeleteClick = (item: Inventory) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  // Add a new inventory item
  const handleAddItem = async (data: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true)

      const { data: newItem, error } = await supabase
        .from('inventory')
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

      setInventory(prev => [...prev, newItem])
      setIsAddModalOpen(false)
    } catch (error: any) {
      console.error('재고 추가 오류:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update an existing inventory item
  const handleUpdateItem = async (data: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedItem) return

    try {
      setIsSubmitting(true)

      const { data: updatedItem, error } = await supabase
        .from('inventory')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setInventory(prev => prev.map(item => 
        item.id === selectedItem.id ? updatedItem : item
      ))
      setIsEditModalOpen(false)
      setSelectedItem(null)
    } catch (error: any) {
      console.error('재고 업데이트 오류:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete an inventory item
  const handleDeleteItem = async () => {
    if (!selectedItem) return

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', selectedItem.id)

      if (error) {
        throw error
      }

      setInventory(prev => prev.filter(item => item.id !== selectedItem.id))
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (error: any) {
      console.error('재고 삭제 오류:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-0">재고 관리</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">재고 관리</h2>
            <p className="text-gray-600">모든 재고 항목을 확인하고 관리하세요</p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href="/dashboard/inventory/movements"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>재고 이동</span>
            </Link>
            <Button 
              variant="primary" 
              onClick={handleAddClick}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              재고 추가
            </Button>
          </div>
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

        {inventory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">등록된 재고 항목이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 재고 항목을 추가해보세요</p>
            <Button variant="primary" onClick={handleAddClick}>
              첫 번째 항목 생성하기
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <InventoryList 
              items={inventory} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick} 
              dictionary={{
                common: {
                  edit: '수정',
                  delete: '삭제',
                  cancel: '취소'
                },
                inventory: {
                  deleteConfirm: '정말로 삭제하시겠습니까?',
                  columns: {
                    name: '이름',
                    quantity: '수량',
                    category: '카테고리',
                    minStock: '최소 재고',
                    actions: '작업'
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="재고 추가"
      >
        <InventoryForm
          onSubmit={handleAddItem}
          isSubmitting={isSubmitting}
          dictionary={{
            common: {
              save: '저장',
              cancel: '취소',
              required: '필수 항목입니다'
            },
            inventory: {
              name: '제품명',
              namePlaceholder: '제품 이름을 입력하세요',
              sku: 'SKU',
              skuPlaceholder: 'SKU 코드를 입력하세요',
              category: '카테고리',
              categoryPlaceholder: '카테고리를 입력하세요',
              quantity: '수량',
              quantityPlaceholder: '현재 수량을 입력하세요',
              minStock: '최소 재고',
              minStockPlaceholder: '최소 재고 수준을 입력하세요'
            }
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedItem(null)
        }}
        title={`${selectedItem?.name || ''} 수정`}
      >
        <InventoryForm
          initialData={selectedItem}
          onSubmit={handleUpdateItem}
          isSubmitting={isSubmitting}
          dictionary={{
            common: {
              save: '저장',
              cancel: '취소',
              required: '필수 항목입니다'
            },
            inventory: {
              name: '제품명',
              namePlaceholder: '제품 이름을 입력하세요',
              sku: 'SKU',
              skuPlaceholder: 'SKU 코드를 입력하세요',
              category: '카테고리',
              categoryPlaceholder: '카테고리를 입력하세요',
              quantity: '수량',
              quantityPlaceholder: '현재 수량을 입력하세요',
              minStock: '최소 재고',
              minStockPlaceholder: '최소 재고 수준을 입력하세요'
            }
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedItem(null)
        }}
        onConfirm={handleDeleteItem}
        title="삭제"
        message={`${selectedItem?.name}을(를) 정말로 삭제하시겠습니까?`}
        confirmText="삭제"
        cancelText="취소"
        isSubmitting={isSubmitting}
      />
    </div>
  )
}